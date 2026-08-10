/* Dialog-Rollenspiel: Die KI spielt die Gegenrolle, der Lernende antwortet per
   Mikrofon oder Tastatur. Die Antwort der KI wird zusätzlich vorgelesen - damit
   wird aus der Sprechübung nebenbei auch eine Hörübung, ohne Extrakosten.

   Kostenmodell (im Free-Tier relevant): Der Eröffnungssatz steht fest in den
   Übungsdaten und braucht keinen Aufruf. Danach kostet jeder eigene Redebeitrag
   genau einen Aufruf, die Auswertung am Ende einen weiteren. `maxTurns` deckelt
   das - der Zähler ist die ganze Zeit sichtbar. */
import { useEffect, useRef, useState } from 'react'
import type { RoleplayExercise } from '../../data/types'
import type { GeminiTurn } from '../../ai/geminiClient'
import { roleplayTurn } from '../../ai/roleplayTurn'
import { scoreSpeaking, type SpeakingScore } from '../../ai/scoreSpeaking'
import { useSpeech } from '../../hooks/useSpeech'
import { useVoiceCapture } from '../useVoiceCapture'
import { logDrill } from '../../db'
import { Box, HStack, VStack, Text, Muted, Btn, TextArea, SituationBox } from '../ui/kit'

interface Message {
  from: 'partner' | 'me'
  text: string
  nudge?: string
}

export function Roleplay({ exercise }: { exercise: RoleplayExercise }) {
  const speech = useSpeech()
  const cap = useVoiceCapture()
  const [messages, setMessages] = useState<Message[]>([{ from: 'partner', text: exercise.opener }])
  const [draft, setDraft] = useState('')
  const [turns, setTurns] = useState(0)
  const [thinking, setThinking] = useState(false)
  const [finished, setFinished] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [score, setScore] = useState<SpeakingScore | null>(null)
  const [scoring, setScoring] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Sobald ein Zug dazukommt, ans Ende scrollen - sonst muss man auf dem Handy
  // nach jedem Beitrag selbst nachscrollen.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages.length, thinking])

  // Das Diktat schreibt fortlaufend ins Eingabefeld, damit man das Erkannte vor
  // dem Absenden noch korrigieren kann.
  useEffect(() => {
    if (cap.transcript) setDraft(cap.transcript)
  }, [cap.transcript])

  const lastTurn = turns + 1 >= exercise.maxTurns

  // Der Eröffnungssatz wird bewusst ausgelassen: Ein Gemini-Verlauf muss mit
  // einem 'user'-Zug beginnen. Die KI bekommt ihn stattdessen im Prompt als
  // Kontext mitgeteilt (siehe ai/roleplayTurn.ts).
  const history: GeminiTurn[] = messages.slice(1).map((m) => ({
    role: m.from === 'me' ? ('user' as const) : ('model' as const),
    text: m.text,
  }))

  const send = async () => {
    const say = draft.trim()
    if (!say) return
    if (cap.recording) cap.stop()
    setMessages((m) => [...m, { from: 'me', text: say }])
    setDraft('')
    cap.reset()
    setThinking(true)
    setError(null)
    try {
      const result = await roleplayTurn({ data: { exercise, history, say, lastTurn } })
      setMessages((m) => [...m, { from: 'partner', text: result.reply, nudge: result.nudge || undefined }])
      setTurns((t) => t + 1)
      if (autoSpeak && speech.hasGermanVoice) void speech.speak(result.reply)
      if (result.done || lastTurn) setFinished(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Antwort ist fehlgeschlagen.')
      // Den eigenen Beitrag zurück ins Feld, damit nichts verloren geht.
      setDraft(say)
      setMessages((m) => m.slice(0, -1))
    } finally {
      setThinking(false)
    }
  }

  const evaluate = async () => {
    setScoring(true)
    setError(null)
    try {
      const transcript = messages
        .map((m) => `${m.from === 'me' ? 'Lernender' : 'Gesprächspartner'}: ${m.text}`)
        .join('\n')
      const result = await scoreSpeaking({
        data: {
          context:
            `Rollenspiel zu dieser Situation: ${exercise.situation} Ziel des Lernenden: ${exercise.goal} ` +
            'Bewerte nur die Beiträge des Lernenden, nicht die des Gesprächspartners. Es handelt sich um ' +
            'gesprochene Alltagssprache - kurze Sätze sind völlig in Ordnung.',
          criteria: exercise.criteria,
          transcript,
        },
      })
      setScore(result)
      void logDrill({
        methodId: 'roleplay',
        exerciseId: exercise.id,
        ok: result.checks.filter((c) => c.ok).length >= Math.ceil(exercise.criteria.length / 2),
        value: turns,
        detail: `${turns} Redebeiträge`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Auswertung ist fehlgeschlagen.')
    } finally {
      setScoring(false)
    }
  }

  const restart = () => {
    speech.stop()
    cap.reset()
    setMessages([{ from: 'partner', text: exercise.opener }])
    setDraft('')
    setTurns(0)
    setFinished(false)
    setScore(null)
    setError(null)
  }

  return (
    <Box>
      <SituationBox>{exercise.situation}</SituationBox>
      <Box bg="$backgroundLight50" borderRadius="$md" p="$3" mb="$3">
        <Text size="sm">
          <Text size="sm" fontWeight="$bold">
            Dein Ziel:{' '}
          </Text>
          {exercise.goal}
        </Text>
      </Box>

      <HStack justifyContent="space-between" alignItems="center" mb="$2" flexWrap="wrap" gap="$2">
        <Muted>
          Redebeitrag {Math.min(turns + (finished ? 0 : 1), exercise.maxTurns)} von {exercise.maxTurns}
        </Muted>
        {speech.hasGermanVoice && (
          <Text size="2xs" color="$primary600" onPress={() => setAutoSpeak((a) => !a)}>
            {autoSpeak ? '🔊 Antworten werden vorgelesen' : '🔇 Vorlesen aus'}
          </Text>
        )}
      </HStack>

      <VStack gap="$2.5" mb="$3">
        {messages.map((m, i) => (
          <Bubble key={i} message={m} onReplay={() => void speech.speak(m.text)} canReplay={speech.hasGermanVoice} />
        ))}
        {thinking && (
          <Box alignSelf="flex-start" bg="$backgroundLight50" borderRadius="$xl" px="$3.5" py="$2.5" maxWidth="85%">
            <Muted>… schreibt</Muted>
          </Box>
        )}
        <div ref={bottomRef} />
      </VStack>

      {error && (
        <Text color="$error600" size="sm" mb="$2">
          ⚠️ {error}
        </Text>
      )}

      {!finished && (
        <Box borderTopWidth="$1" borderTopColor="$borderLight200" pt="$3.5">
          <HStack gap="$2.5" flexWrap="wrap" alignItems="center" mb="$2">
            <Btn
              variant={cap.recording ? 'danger' : 'primary'}
              small
              onPress={cap.recording ? cap.stop : cap.start}
              disabled={thinking || !cap.supported}
            >
              {cap.recording ? '⏹ Stopp' : '🎤 Sprechen'}
            </Btn>
            {cap.recording && <Muted>… ich höre zu</Muted>}
            {!cap.supported && <Muted>Kein Mikrofon verfügbar - tipp deine Antwort einfach.</Muted>}
          </HStack>
          <TextArea
            value={draft}
            onChange={setDraft}
            placeholder="Deine Antwort - sprich sie ein oder tipp sie hier …"
            minHeight={72}
            disabled={thinking}
          />
          <HStack gap="$2.5" flexWrap="wrap" alignItems="center" mt="$2.5">
            <Btn variant="gold" onPress={send} disabled={thinking || draft.trim().length < 2}>
              {thinking ? 'Antwort kommt …' : lastTurn ? '➤ Letzter Beitrag' : '➤ Absenden'}
            </Btn>
            <Btn variant="secondary" small onPress={() => setFinished(true)} disabled={thinking || turns === 0}>
              Gespräch beenden
            </Btn>
          </HStack>
          {lastTurn && <Muted mt="$1">Das ist dein letzter Beitrag - danach wird das Gespräch abgeschlossen.</Muted>}
        </Box>
      )}

      {finished && (
        <Box borderTopWidth="$1" borderTopColor="$borderLight200" pt="$3.5">
          <HStack gap="$2.5" flexWrap="wrap" alignItems="center">
            <Btn variant="gold" onPress={evaluate} disabled={scoring || turns === 0}>
              {scoring ? 'KI wertet aus …' : '💬 Gespräch auswerten lassen'}
            </Btn>
            <Btn variant="secondary" small onPress={restart}>
              ↻ Von vorne
            </Btn>
          </HStack>

          {score && (
            <Box borderWidth="$1" borderColor="$borderLight200" borderRadius="$xl" p="$4" mt="$3">
              <VStack>
                {score.checks.map((c, i) => (
                  <HStack
                    key={i}
                    gap="$2.5"
                    alignItems="flex-start"
                    borderTopWidth={i === 0 ? '$0' : '$1'}
                    borderTopColor="$borderLight200"
                    py="$2"
                  >
                    <Text>{c.ok ? '✅' : '❌'}</Text>
                    <VStack flex={1}>
                      <Text size="sm" fontWeight="$semibold">
                        {exercise.criteria[i]}
                      </Text>
                      <Muted>{c.comment}</Muted>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
              {score.corrections.length > 0 && (
                <Box mt="$3">
                  <Text fontWeight="$bold" size="sm" mb="$1">
                    ✏️ So klingt es besser
                  </Text>
                  <VStack gap="$1">
                    {score.corrections.map((c, i) => (
                      <Text key={i} size="sm">
                        <Text color="$error600" sx={{ textDecorationLine: 'line-through' }}>
                          {c.wrong}
                        </Text>
                        {' → '}
                        <Text color="$success700" fontWeight="$semibold">
                          {c.better}
                        </Text>
                      </Text>
                    ))}
                  </VStack>
                </Box>
              )}
              <Box bg="$primary50" borderRadius="$md" p="$3" mt="$3">
                <Text size="sm">💬 {score.feedback}</Text>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

function Bubble({
  message, onReplay, canReplay,
}: {
  message: Message
  onReplay: () => void
  canReplay: boolean
}) {
  const mine = message.from === 'me'
  return (
    <Box alignSelf={mine ? 'flex-end' : 'flex-start'} maxWidth="85%">
      <Box bg={mine ? '$primary600' : '$backgroundLight50'} borderRadius="$xl" px="$3.5" py="$2.5">
        <Text color={mine ? '$white' : '$textLight600'}>{message.text}</Text>
      </Box>
      {!mine && canReplay && (
        <Text size="2xs" color="$primary600" mt="$0.5" onPress={onReplay}>
          🔊 nochmal anhören
        </Text>
      )}
      {message.nudge && (
        <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$md" px="$3" py="$2" mt="$1.5">
          <Text size="xs">💡 {message.nudge}</Text>
        </Box>
      )}
    </Box>
  )
}
