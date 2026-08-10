/* 60-Sekunden-Monolog: ein Thema, drei Pflicht-Aspekte, eine Minute am Stück.

   Die lokalen Kennzahlen (Wörter, Wörter/Minute, Füllwörter) werden VOR dem
   KI-Aufruf berechnet und mitgeschickt. Damit ist das Feedback an echten
   Messwerten verankert, statt dass das Modell Tempo und Pausen schätzt. */
import { useRef, useState } from 'react'
import type { MonologueExercise } from '../../data/types'
import { countFillers, splitWords } from '../../lib/wordDiff'
import { useCountdown } from '../../hooks/useCountdown'
import { useVoiceCapture } from '../useVoiceCapture'
import { scoreSpeaking, type SpeakingScore } from '../../ai/scoreSpeaking'
import { blobToWavBase64 } from '../../ai/audioWav'
import { logDrill, updateDrill } from '../../db'
import {
  Box, HStack, VStack, Text, Muted, Btn, ProgressBar, ScoreBox, TimerDisplay, TextArea,
} from '../ui/kit'

export function Monologue({ exercise }: { exercise: MonologueExercise }) {
  const cap = useVoiceCapture()
  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready')
  const [spokenSeconds, setSpokenSeconds] = useState(0)
  const [score, setScore] = useState<SpeakingScore | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')

  // Id des Versuchs, der beim Beenden protokolliert wird - die spätere
  // KI-Auswertung ergänzt denselben Datensatz, statt einen zweiten anzulegen.
  const drillIdRef = useRef<number | undefined>(undefined)

  const finishRun = (seconds: number) => {
    cap.stop()
    setSpokenSeconds(seconds)
    setPhase('done')
    void logDrill({ methodId: 'monologue', exerciseId: exercise.id, ok: false, detail: `${seconds}s gesprochen` }).then(
      (id) => {
        drillIdRef.current = id
      }
    )
  }

  const timer = useCountdown(exercise.seconds, () => finishRun(exercise.seconds))

  const start = async () => {
    cap.reset()
    setScore(null)
    setError(null)
    setPhase('running')
    await cap.start()
    timer.start()
  }

  const stopEarly = () => {
    timer.stop()
    finishRun(timer.elapsed)
  }

  const words = splitWords(cap.transcript).length
  const seconds = Math.max(1, spokenSeconds || timer.elapsed)
  const wpm = Math.round((words / seconds) * 60)
  const fillers = countFillers(cap.transcript)

  const evaluate = async () => {
    setLoading(true)
    setError(null)
    setStatus('')
    try {
      let audio: { mimeType: string; base64: string } | undefined
      if (cap.audioBlob) {
        try {
          audio = { mimeType: 'audio/wav', base64: await blobToWavBase64(cap.audioBlob) }
        } catch {
          if (!cap.transcript.trim()) throw new Error('Die Aufnahme konnte nicht verarbeitet werden.')
        }
      }
      const result = await scoreSpeaking({
        data: {
          context:
            `60-Sekunden-Monolog zum Thema "${exercise.topic}". Der Lernende sollte ${exercise.seconds} Sekunden ` +
            'am Stück frei sprechen und dabei alle vorgegebenen Aspekte ansprechen. ' +
            `Gemessene Werte dieser Aufnahme: ${seconds} Sekunden gesprochen, ${words} Wörter, ` +
            `${wpm} Wörter pro Minute, ${fillers} Füllwörter. Beziehe dich in deinem Feedback auf diese Werte ` +
            '(zum Vergleich: 100-130 Wörter pro Minute sind auf B1-Niveau ein gutes, ruhiges Tempo).',
          criteria: [...exercise.mustMention, 'Spricht flüssig und ohne lange Pausen bis zum Ende'],
          transcript: cap.transcript.trim() || undefined,
          audio,
        },
        onAttempt: ({ attempt, isFallback }) =>
          setStatus(isFallback ? 'Weiche auf ein schnelleres Modell aus …' : attempt > 1 ? `Versuch ${attempt} …` : ''),
      })
      setScore(result)
      void updateDrill(drillIdRef.current, {
        ok: result.checks.filter((c) => c.ok).length >= exercise.mustMention.length,
        value: wpm,
        detail: `${words} Wörter in ${seconds}s, ${fillers} Füllwörter`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Bewertung ist fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    cap.reset()
    timer.reset()
    setScore(null)
    setError(null)
    setSpokenSeconds(0)
    setPhase('ready')
  }

  return (
    <Box>
      <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$lg" p="$3.5" mb="$3">
        <Text fontSize={18} fontWeight="$bold" mb="$1.5">
          {exercise.topic}
        </Text>
        <Muted>Diese drei Punkte sollen vorkommen:</Muted>
        <VStack mt="$1" gap="$0.5">
          {exercise.mustMention.map((m, i) => (
            <Text key={i} size="sm">
              {i + 1}. {m}
            </Text>
          ))}
        </VStack>
      </Box>

      {phase === 'ready' && (
        <HStack gap="$2.5" flexWrap="wrap" alignItems="center">
          <Btn onPress={start} disabled={!cap.supported}>
            🎤 {exercise.seconds} Sekunden starten
          </Btn>
          {!cap.supported && <Muted>Dieser Browser unterstützt keine Sprachaufnahme.</Muted>}
        </HStack>
      )}

      {phase === 'running' && (
        <Box alignItems="center" py="$3">
          <TimerDisplay seconds={timer.remaining} warn={timer.remaining <= 10} />
          <Box w="$full" my="$3">
            <ProgressBar value={timer.progress * 100} />
          </Box>
          <Muted>{words > 0 ? `${words} Wörter` : 'Sprich einfach los - Stichpunkte reichen nicht, sprich in Sätzen.'}</Muted>
          <Box mt="$3">
            <Btn variant="danger" small onPress={stopEarly}>
              ⏹ Vorzeitig beenden
            </Btn>
          </Box>
          {cap.interim && (
            <Text size="sm" color="$textLight500" mt="$2" sx={{ fontStyle: 'italic' }}>
              {cap.interim} …
            </Text>
          )}
        </Box>
      )}

      {phase === 'done' && (
        <Box>
          <HStack gap="$3" flexWrap="wrap" mb="$3">
            <ScoreBox n={`${seconds}s`} label="gesprochen" />
            <ScoreBox n={words} label="Wörter" />
            <ScoreBox n={wpm} label="Wörter/Minute" />
            <ScoreBox n={fillers} label="Füllwörter" />
          </HStack>

          {wpm > 0 && (
            <Box bg="$backgroundLight50" borderRadius="$md" p="$3" mb="$3">
              <Text size="sm">
                {wpm < 70
                  ? '🐢 Noch recht langsam - das ist am Anfang völlig normal. Versuch beim nächsten Mal, nicht nach jedem Satz zu überlegen, sondern einfach weiterzureden.'
                  : wpm > 160
                    ? '🐇 Ziemlich schnell. In der Prüfung darfst du ruhig langsamer sprechen - das wirkt sicherer und du machst weniger Fehler.'
                    : '👍 Gutes Tempo - das liegt im Bereich, in dem B1-Prüfungen entspannt wirken.'}
              </Text>
            </Box>
          )}

          {cap.audioUrl && (
            <Box mb="$3">
              <Muted>🔁 Deine Aufnahme:</Muted>
              <audio controls src={cap.audioUrl} style={{ width: '100%', marginTop: 6, height: 40 }} />
            </Box>
          )}

          <Muted>Transkript (Erkennungsfehler kannst du vor der Bewertung korrigieren):</Muted>
          <Box mt="$1.5">
            <TextArea value={cap.transcript} onChange={cap.setTranscript} placeholder="Hier erscheint, was du gesagt hast …" />
          </Box>

          <HStack gap="$2.5" flexWrap="wrap" alignItems="center" mt="$3">
            <Btn variant="gold" onPress={evaluate} disabled={loading || (!cap.audioBlob && words < 10)}>
              {loading ? 'KI bewertet …' : '💬 Auswertung holen'}
            </Btn>
            <Btn variant="secondary" small onPress={reset}>
              ↻ Nochmal
            </Btn>
          </HStack>
          {loading && status && <Muted mt="$1">{status}</Muted>}

          {error && (
            <Text color="$error600" size="sm" mt="$2">
              ⚠️ {error}
            </Text>
          )}

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
                        {[...exercise.mustMention, 'Flüssig und ohne lange Pausen'][i]}
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
