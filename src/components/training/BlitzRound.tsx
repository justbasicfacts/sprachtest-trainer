/* Blitzrunde: fünf Fragen hintereinander, je ~20 Sekunden, ohne Vorbereitung.

   Zwei bewusste Entscheidungen:
   - Das Mikrofon wird EINMAL zu Rundenbeginn geöffnet und über alle Fragen
     gehalten. Pro Frage neu zu starten würde in manchen Browsern jedes Mal eine
     Berechtigungsabfrage auslösen und die 20 Sekunden auffressen.
   - Bewertet wird die ganze Runde in EINEM KI-Aufruf. Fünf Einzelaufrufe wären im
     Free-Tier schnell am Limit - und das gemeinsame Bild ist ohnehin nützlicher. */
import { useRef, useState } from 'react'
import type { BlitzExercise } from '../../data/types'
import { useCountdown } from '../../hooks/useCountdown'
import { useVoiceCapture } from '../useVoiceCapture'
import { scoreSpeaking, type SpeakingScore } from '../../ai/scoreSpeaking'
import { logDrill, updateDrill } from '../../db'
import { Box, HStack, VStack, Text, Muted, Btn, ProgressBar, TimerDisplay } from '../ui/kit'

/** So viele Fragen umfasst eine Runde - aus dem Fragenpool zufällig gezogen. */
const ROUND_SIZE = 5

const CRITERIA = [
  'Ist auf jede Frage inhaltlich eingegangen',
  'Hat in ganzen Sätzen geantwortet, nicht nur in Stichworten',
  'Konnte ohne lange Denkpausen sofort loslegen',
  'Der Wortschatz reicht für die Themen aus',
]

function pickQuestions(all: string[]): string[] {
  const pool = [...all]
  const out: string[] = []
  while (out.length < Math.min(ROUND_SIZE, all.length)) {
    out.push(...pool.splice(Math.floor(Math.random() * pool.length), 1))
  }
  return out
}

export function BlitzRound({ exercise }: { exercise: BlitzExercise }) {
  const cap = useVoiceCapture()
  const [questions, setQuestions] = useState<string[]>(() => pickQuestions(exercise.questions))
  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [score, setScore] = useState<SpeakingScore | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Wie viel Transkript zu Beginn der aktuellen Frage schon da war - die Differenz
  // ist die Antwort auf genau diese Frage.
  const markRef = useRef(0)
  const idxRef = useRef(0)
  const answersRef = useRef<string[]>([])
  // Der Versuch wird am Ende der Runde protokolliert; eine spätere KI-Auswertung
  // ergänzt denselben Datensatz, damit ein Durchgang nicht doppelt zählt.
  const drillIdRef = useRef<number | undefined>(undefined)

  const endRound = (finalAnswers: string[]) => {
    cap.stop()
    setPhase('done')
    const answered = finalAnswers.filter((a) => a.trim().length > 0).length
    void logDrill({
      methodId: 'blitz',
      exerciseId: exercise.id,
      ok: false,
      detail: `${answered}/${questions.length} beantwortet`,
    }).then((id) => {
      drillIdRef.current = id
    })
  }

  const timer = useCountdown(exercise.seconds, () => nextQuestion())

  /** Schneidet die Antwort auf die gerade abgelaufene Frage aus dem laufenden
      Transkript und geht zur nächsten Frage - oder beendet die Runde. */
  const nextQuestion = () => {
    const full = cap.transcriptRef.current
    const answer = full.slice(markRef.current).trim()
    markRef.current = full.length
    // Parallel in einer Ref mitführen: Der State-Updater läuft erst beim nächsten
    // Rendern, endRound() braucht die vollständige Liste aber sofort.
    answersRef.current = [...answersRef.current, answer]
    setAnswers(answersRef.current)

    const next = idxRef.current + 1
    if (next >= questions.length) {
      endRound(answersRef.current)
      return
    }
    idxRef.current = next
    setIdx(next)
    timer.start()
  }

  const startRound = async () => {
    cap.reset()
    answersRef.current = []
    setAnswers([])
    setScore(null)
    setError(null)
    markRef.current = 0
    idxRef.current = 0
    drillIdRef.current = undefined
    setIdx(0)
    setPhase('running')
    await cap.start()
    timer.start()
  }

  const abort = () => {
    timer.stop()
    endRound(answersRef.current)
  }

  const evaluate = async () => {
    setLoading(true)
    setError(null)
    try {
      const transcript = questions
        .map((q, i) => `Frage ${i + 1}: ${q}\nAntwort ${i + 1}: ${answers[i]?.trim() || '(keine Antwort)'}`)
        .join('\n\n')
      const result = await scoreSpeaking({
        data: {
          context:
            'Blitzrunde: Der Lernende musste ohne Vorbereitungszeit auf mehrere Fragen hintereinander antworten, ' +
            `mit nur ${exercise.seconds} Sekunden pro Antwort. Bewerte die Runde als Ganzes und sei bei der Kürze ` +
            'der Antworten nachsichtig - es ging um Spontaneität, nicht um Vollständigkeit.',
          criteria: CRITERIA,
          transcript,
        },
      })
      setScore(result)
      void updateDrill(drillIdRef.current, {
        ok: result.checks.filter((c) => c.ok).length >= 3,
        value: answers.filter((a) => a.trim().length > 0).length,
        detail: `${answers.filter((a) => a.trim()).length}/${questions.length} beantwortet`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Bewertung ist fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  const restart = () => {
    setQuestions(pickQuestions(exercise.questions))
    cap.reset()
    timer.reset()
    answersRef.current = []
    drillIdRef.current = undefined
    setAnswers([])
    setScore(null)
    setError(null)
    setPhase('ready')
  }

  if (phase === 'ready') {
    return (
      <Box>
        <Box bg="$backgroundLight50" borderRadius="$lg" p="$3.5" mb="$3">
          <Text size="sm">
            {questions.length} Fragen, je {exercise.seconds} Sekunden. Es läuft durch - du kannst nicht zurück und
            nicht pausieren. Genau darum geht es: sofort loslegen statt lange überlegen.
          </Text>
        </Box>
        <HStack gap="$2.5" flexWrap="wrap" alignItems="center">
          <Btn onPress={startRound} disabled={!cap.supported}>
            ⚡ Runde starten
          </Btn>
          <Btn variant="secondary" small onPress={restart}>
            🔀 andere Fragen
          </Btn>
        </HStack>
        {!cap.supported && (
          <Text color="$error600" size="sm" mt="$2">
            ⚠️ Dieser Browser unterstützt keine Sprachaufnahme.
          </Text>
        )}
      </Box>
    )
  }

  if (phase === 'running') {
    return (
      <Box>
        <HStack justifyContent="space-between" alignItems="center" mb="$1.5">
          <Muted>
            Frage {idx + 1} von {questions.length}
          </Muted>
          <Muted>🎤 Aufnahme läuft</Muted>
        </HStack>
        <ProgressBar value={timer.progress * 100} />

        <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$lg" p="$4" my="$3">
          <Text fontSize={19} fontWeight="$bold">
            {questions[idx]}
          </Text>
        </Box>

        <Box alignItems="center">
          <TimerDisplay seconds={timer.remaining} warn={timer.remaining <= 5} />
          {cap.interim && (
            <Text size="sm" color="$textLight500" mt="$2" sx={{ fontStyle: 'italic' }}>
              {cap.interim} …
            </Text>
          )}
          <HStack gap="$2.5" mt="$3" flexWrap="wrap" justifyContent="center">
            <Btn small onPress={nextQuestion}>
              ⏭ Fertig, nächste Frage
            </Btn>
            <Btn variant="secondary" small onPress={abort}>
              Runde abbrechen
            </Btn>
          </HStack>
        </Box>
      </Box>
    )
  }

  const answered = answers.filter((a) => a.trim().length > 0).length

  return (
    <Box>
      <Text fontWeight="$bold" mb="$2">
        Runde beendet - {answered} von {questions.length} Fragen beantwortet
      </Text>

      {cap.audioUrl && (
        <Box mb="$3">
          <Muted>🔁 Die ganze Runde anhören:</Muted>
          <audio controls src={cap.audioUrl} style={{ width: '100%', marginTop: 6, height: 40 }} />
        </Box>
      )}

      <VStack gap="$2.5" mb="$3">
        {questions.map((q, i) => (
          <Box key={i} borderWidth="$1" borderColor="$borderLight200" borderRadius="$lg" p="$3">
            <Text size="sm" fontWeight="$bold" mb="$0.5">
              {i + 1}. {q}
            </Text>
            {answers[i]?.trim() ? (
              <Text size="sm">{answers[i]}</Text>
            ) : (
              <Muted>Keine Antwort erkannt.</Muted>
            )}
          </Box>
        ))}
      </VStack>

      <HStack gap="$2.5" flexWrap="wrap" alignItems="center">
        <Btn variant="gold" onPress={evaluate} disabled={loading || answered === 0}>
          {loading ? 'KI bewertet …' : '💬 Runde auswerten lassen'}
        </Btn>
        <Btn variant="secondary" small onPress={restart}>
          ↻ neue Runde
        </Btn>
      </HStack>

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
                    {CRITERIA[i]}
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
  )
}
