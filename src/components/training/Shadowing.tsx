/* Nachsprechen: Der Browser spricht einen Satz vor, der Lernende spricht ihn nach.

   Bewusst zwei getrennte Stufen:
   1. Sofort und kostenlos: Abgleich des Browser-Transkripts mit dem Zielsatz.
      Das Ergebnis heißt ausdrücklich "Erkennungsquote" und NICHT Aussprachenote -
      die Spracherkennung selbst ist fehleranfällig, und eine falsche Note wäre
      schlimmer als gar keine.
   2. Auf Wunsch: die Aufnahme geht an Gemini, das die Aussprache wirklich
      beurteilen kann. Das ist die belastbare Rückmeldung. */
import { useState } from 'react'
import type { ShadowingExercise } from '../../data/types'
import { diffWords } from '../../lib/wordDiff'
import { useSpeech } from '../../hooks/useSpeech'
import { VoicePicker } from './VoicePicker'
import { useVoiceCapture } from '../useVoiceCapture'
import { scoreSpeaking, type SpeakingScore } from '../../ai/scoreSpeaking'
import { blobToWavBase64 } from '../../ai/audioWav'
import { logDrill } from '../../db'
import { Box, HStack, VStack, Text, Muted, Btn, ProgressBar, ChipRow, WordChip, NoTranslate} from '../ui/kit'

const CRITERIA = [
  'Alle Wörter des Satzes wurden gesprochen',
  'Die Wörter sind deutlich und verständlich ausgesprochen',
  'Satzmelodie und Betonung passen zum Satz',
]

export function Shadowing({ exercise }: { exercise: ShadowingExercise }) {
  const speech = useSpeech()
  const [idx, setIdx] = useState(0)
  const sentence = exercise.sentences[idx]

  if (!speech.supported || !speech.hasGermanVoice) {
    return (
      <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$lg" p="$3.5">
        <Text fontWeight="$bold" mb="$1">
          🔇 Nachsprechen hier leider nicht möglich
        </Text>
        <Text size="sm">
          {speech.supported
            ? 'Dein Browser hat keine deutsche Stimme installiert, deshalb kann dir der Satz nicht vorgesprochen werden. In Chrome, Edge und Safari ist meist eine dabei.'
            : 'Dieser Browser kann keine Texte vorlesen. Probier es mit Chrome, Edge oder Safari.'}
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <HStack justifyContent="space-between" alignItems="center" mb="$1.5">
        <Muted>
          Satz {idx + 1} von {exercise.sentences.length}
        </Muted>
        {exercise.focus && <Muted>{exercise.focus}</Muted>}
      </HStack>
      <ProgressBar value={((idx + 1) / exercise.sentences.length) * 100} />

      <VoicePicker speech={speech} />

      {/* key: bei jedem Satzwechsel wird die Aufnahme sauber zurückgesetzt */}
      <ShadowingSentence
        key={`${exercise.id}-${idx}`}
        exerciseId={exercise.id}
        sentence={sentence}
        speak={speech.speak}
        speaking={speech.speaking}
      />

      <HStack gap="$2.5" flexWrap="wrap" alignItems="center" mt="$4" justifyContent="space-between">
        <Btn variant="secondary" small onPress={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
          ← vorheriger Satz
        </Btn>
        <Btn
          small
          onPress={() => setIdx((i) => Math.min(exercise.sentences.length - 1, i + 1))}
          disabled={idx === exercise.sentences.length - 1}
        >
          nächster Satz →
        </Btn>
      </HStack>
    </Box>
  )
}

function ShadowingSentence({
  exerciseId, sentence, speak, speaking,
}: {
  exerciseId: string
  sentence: string
  speak: (text: string, rate?: 'slow' | 'normal') => Promise<void>
  speaking: boolean
}) {
  const cap = useVoiceCapture()
  const [revealed, setRevealed] = useState(false)
  const [aiScore, setAiScore] = useState<SpeakingScore | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const diff = cap.transcript.trim() ? diffWords(cap.transcript, sentence) : null

  /** Erst vorlesen, dann automatisch die Aufnahme starten - so muss man nicht
      zwischen zwei Knöpfen hin und her wechseln. */
  const listenThenRecord = async () => {
    cap.reset()
    setAiScore(null)
    await speak(sentence)
    await cap.start()
  }

  const finish = () => {
    cap.stop()
    if (diff) {
      void logDrill({
        methodId: 'shadowing',
        exerciseId,
        ok: diff.ratio >= 0.8,
        value: Math.round(diff.ratio * 100),
        detail: sentence,
      })
    }
  }

  const scorePronunciation = async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      let audio: { mimeType: string; base64: string } | undefined
      if (cap.audioBlob) {
        try {
          audio = { mimeType: 'audio/wav', base64: await blobToWavBase64(cap.audioBlob) }
        } catch {
          throw new Error('Die Aufnahme konnte nicht verarbeitet werden. Bitte noch einmal aufnehmen.')
        }
      }
      setAiScore(
        await scoreSpeaking({
          data: {
            context:
              `Nachsprech-Übung: Der Lernende sollte diesen Satz möglichst genau nachsprechen: "${sentence}". ` +
              'Bewerte, wie nah die Aufnahme am Zielsatz ist - Vollständigkeit, Deutlichkeit und Satzmelodie.',
            criteria: CRITERIA,
            transcript: cap.transcript.trim() || undefined,
            audio,
          },
        })
      )
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Die Bewertung ist fehlgeschlagen.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <Box mt="$3">
      <Box bg="$primary50" borderRadius="$lg" p="$3.5" mb="$3">
        {revealed ? (
          <Text fontSize={17} fontWeight="$medium">
            <NoTranslate>{sentence}</NoTranslate>
          </Text>
        ) : (
          <Muted>Der Satz wird vorgelesen - hör erst einmal nur zu. (Text lässt sich unten einblenden.)</Muted>
        )}
      </Box>

      <HStack gap="$2.5" flexWrap="wrap" alignItems="center">
        <Btn onPress={listenThenRecord} disabled={speaking || cap.recording}>
          {speaking ? '🔊 hört zu …' : '▶ Vorsprechen & aufnehmen'}
        </Btn>
        <Btn variant="secondary" small onPress={() => void speak(sentence, 'slow')} disabled={speaking || cap.recording}>
          🐢 nur langsam vorlesen
        </Btn>
        <Btn variant="secondary" small onPress={() => setRevealed((r) => !r)}>
          {revealed ? '🙈 Text verbergen' : '👁 Text anzeigen'}
        </Btn>
      </HStack>

      {cap.recording && (
        <HStack gap="$2.5" alignItems="center" mt="$3" flexWrap="wrap">
          <Btn variant="danger" onPress={finish}>
            ⏹ Fertig
          </Btn>
          <Muted>… sprich den Satz jetzt nach</Muted>
        </HStack>
      )}

      {cap.interim && !cap.transcript && (
        <Text size="sm" color="$textLight500" mt="$2" sx={{ fontStyle: 'italic' }}>
          {cap.interim} …
        </Text>
      )}

      {cap.audioUrl && !cap.recording && (
        <Box mt="$3">
          <Muted>🔁 Deine Aufnahme:</Muted>
          <audio controls src={cap.audioUrl} style={{ width: '100%', marginTop: 6, height: 40 }} />
        </Box>
      )}

      {diff && !cap.recording && (
        <Box borderWidth="$1" borderColor="$borderLight200" borderRadius="$xl" p="$4" mt="$3">
          <Text fontWeight="$bold" mb="$0.5">
            Erkennungsquote: {diff.correct} von {diff.total} Wörtern
          </Text>
          <Muted>
            Das ist die Spracherkennung deines Browsers, keine Aussprachenote - sie verhört sich auch mal. Für eine
            echte Bewertung der Aussprache frag die KI.
          </Muted>
          <Box mt="$2.5">
            <ChipRow>
              {diff.entries.map((e, i) => (
                <WordChip
                  key={i}
                  tone={e.status === 'ok' || e.status === 'case' ? 'correct' : e.status === 'extra' ? 'muted' : 'wrong'}
                  strike={e.status === 'extra'}
                >
                  {e.status === 'missing' ? `␣ ${e.want}` : e.got}
                </WordChip>
              ))}
            </ChipRow>
          </Box>

          <HStack gap="$2.5" flexWrap="wrap" alignItems="center" mt="$3.5">
            <Btn variant="gold" onPress={scorePronunciation} disabled={aiLoading || !cap.audioBlob}>
              {aiLoading ? 'KI hört zu …' : '🗣️ Aussprache von der KI bewerten lassen'}
            </Btn>
            {!cap.audioBlob && <Muted>Dafür wird eine Audioaufnahme gebraucht.</Muted>}
          </HStack>

          {aiError && (
            <Text color="$error600" size="sm" mt="$2">
              ⚠️ {aiError}
            </Text>
          )}

          {aiScore && (
            <Box mt="$3">
              <VStack>
                {aiScore.checks.map((c, i) => (
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
                        {CRITERIA[i]}
                      </Text>
                      <Muted>{c.comment}</Muted>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
              {aiScore.pronunciation && (
                <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$md" p="$3" mt="$3">
                  <Text fontWeight="$bold" size="sm" mb="$1">
                    🗣️ Aussprache & Flüssigkeit
                  </Text>
                  <Text size="sm">{aiScore.pronunciation.comment}</Text>
                  <VStack mt="$1.5" gap="$1">
                    {aiScore.pronunciation.tips.map((tip, i) => (
                      <Text key={i} size="sm">
                        • {tip}
                      </Text>
                    ))}
                  </VStack>
                </Box>
              )}
              <Box bg="$primary50" borderRadius="$md" p="$3" mt="$3">
                <Text size="sm">💬 {aiScore.feedback}</Text>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {(cap.micError || (!cap.supported && !cap.recording)) && (
        <Text color="$error600" size="sm" mt="$2">
          ⚠️ {cap.micError ?? 'Dieser Browser unterstützt keine Sprachaufnahme.'}
        </Text>
      )}
    </Box>
  )
}
