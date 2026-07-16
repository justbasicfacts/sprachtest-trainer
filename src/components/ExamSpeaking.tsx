/* Mündlicher Teil der Prüfungssimulation: 3 gesprochene Aufgaben
   (Teil 5 Kennenlernen, Teil 6 Fotobeschreibung, Teil 7 Situation),
   je 5 Punkte, von der KI bewertet wie von einem Prüfer (insg. 15 P).
   Die Aufgaben werden deterministisch pro Test-Nummer ausgewählt, damit
   jeder Test seine eigene, aber stabile Aufgabenkombination hat. */
import { useState } from 'react'
import { motion } from 'motion/react'
import { DATA } from '../data/content'
import { scoreSpeakingExamPart } from '../ai/scoreSpeaking'
import { blobToWavBase64 } from '../ai/audioWav'
import { useVoiceCapture } from './useVoiceCapture'
import { Box, HStack, Text, Btn, Muted, AppCard, CardTitle, FootActions, ProgressBar, Spinner } from './ui/kit'

const FOTO_BASE = import.meta.env.BASE_URL + 'fotos/'
export const SPEAKING_MAX_POINTS = 15
const PART_POINTS = 5

export interface SpeakingPartResult {
  title: string
  points: number
  feedback: string
}

interface SpeakingTask {
  title: string
  instruction: string
  prompt: string
  img?: string
  context: string
  criteria: string[]
}

export function buildSpeakingTasks(testIdx: number): SpeakingTask[] {
  const q1 = DATA.teil5[(testIdx * 2) % DATA.teil5.length]
  const q2 = DATA.teil5[(testIdx * 2 + 1) % DATA.teil5.length]
  const foto = DATA.teil6[testIdx % DATA.teil6.length]
  const situation = DATA.teil7[testIdx % DATA.teil7.length]

  return [
    {
      title: 'Teil 5 · Kennenlernen',
      instruction: 'Beantworte beide Fragen des Prüfers in jeweils 2-3 Sätzen:',
      prompt: `1. ${q1.q}\n2. ${q2.q}`,
      context:
        `Teil 5 (Kennenlernen). Der Prüfer stellt zwei Fragen: 1. „${q1.q}“ 2. „${q2.q}“. ` +
        'Der Prüfling soll beide Fragen in jeweils 2-3 Sätzen beantworten.',
      criteria: [
        'Beide Fragen wirklich beantwortet (nicht nur „ja“/„nein“)',
        'Jeweils 2-3 zusammenhängende Sätze mit Grund oder Beispiel',
        'Verständliches Deutsch auf B1-Niveau',
      ],
    },
    {
      title: 'Teil 6 · Über ein Foto sprechen',
      instruction: 'Beschreibe das Foto 2-3 Minuten lang: Was siehst du? Was passiert? Was vermutest du? Dein eigener Bezug?',
      prompt: foto.title,
      img: foto.img,
      context:
        `Teil 6 (Fotobeschreibung). Foto: „${foto.title}“. Stichworte zum Bildinhalt: ${foto.hints.join(', ')}. ` +
        'Der Prüfling soll das Foto beschreiben: was zu sehen ist, was passiert, eine Vermutung und ein eigener Bezug.',
      criteria: [
        'Beschrieben, was auf dem Foto zu sehen ist und was passiert',
        'Eine Vermutung geäußert („Ich denke, dass …“)',
        'Eigene Erfahrung oder Meinung dazu gesagt',
        'Verständliches Deutsch auf B1-Niveau',
      ],
    },
    {
      title: 'Teil 7 · Eine Situation besprechen',
      instruction: 'Nenne Vorteile UND Nachteile und sag am Ende deine eigene Meinung mit Begründung:',
      prompt: situation.situation,
      context:
        `Teil 7 (Situation besprechen). Situation: „${situation.situation}“. ` +
        'Der Prüfling soll Vorteile und Nachteile nennen und mit Begründung Stellung nehmen.',
      criteria: [
        'Mindestens einen Vorteil und einen Nachteil genannt',
        'Eigene Meinung mit Begründung (z. B. „weil“, „deshalb“)',
        'Verständliches Deutsch auf B1-Niveau',
      ],
    },
  ]
}

interface Answer {
  transcript: string
  audio?: Blob
}

export function ExamSpeaking({
  testIdx, onDone,
}: {
  testIdx: number
  onDone: (points: number, results: SpeakingPartResult[]) => void
}) {
  const tasks = buildSpeakingTasks(testIdx)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [scoring, setScoring] = useState(false)
  const [scoringStep, setScoringStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const scoreAll = async (all: Answer[]) => {
    setScoring(true)
    setError(null)
    try {
      const results: SpeakingPartResult[] = []
      for (let i = 0; i < tasks.length; i++) {
        setScoringStep(i)
        const a = all[i]
        if (!a || (!a.transcript.trim() && !a.audio)) {
          results.push({ title: tasks[i].title, points: 0, feedback: 'Keine Antwort gegeben.' })
          continue
        }
        let audio: { mimeType: string; base64: string } | undefined
        if (a.audio) {
          try {
            audio = { mimeType: 'audio/wav', base64: await blobToWavBase64(a.audio) }
          } catch {
            /* Audio nicht konvertierbar - Transkript reicht */
          }
        }
        const r = await scoreSpeakingExamPart({
          data: {
            context: tasks[i].context,
            criteria: tasks[i].criteria,
            maxPoints: PART_POINTS,
            transcript: a.transcript.trim() || undefined,
            audio,
          },
        })
        results.push({ title: tasks[i].title, points: r.points, feedback: r.feedback })
      }
      onDone(results.reduce((s, r) => s + r.points, 0), results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Bewertung ist fehlgeschlagen.')
      setScoring(false)
    }
  }

  if (scoring) {
    return (
      <AppCard>
        <CardTitle>🤖 Die KI bewertet deine Antworten …</CardTitle>
        <HStack gap="$2.5" alignItems="center" mb="$3">
          <Spinner />
          <Text>
            {tasks[scoringStep]?.title} ({scoringStep + 1} / {tasks.length})
          </Text>
        </HStack>
        <ProgressBar value={((scoringStep + 0.5) / tasks.length) * 100} />
        <Muted mt="$3">Das dauert je Aufgabe ein paar Sekunden - besonders mit Audioanalyse.</Muted>
      </AppCard>
    )
  }

  const task = tasks[step]
  return (
    <>
      <Muted>Mündlicher Teil · Aufgabe {step + 1} / {tasks.length} · je {PART_POINTS} Punkte</Muted>
      <Box mt="$2" mb="$3.5">
        <ProgressBar value={(step / tasks.length) * 100} />
      </Box>
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <AppCard>
          <CardTitle>{task.title}</CardTitle>
          <Text mb="$2">{task.instruction}</Text>
          {task.img && (
            <img
              src={FOTO_BASE + task.img}
              alt={task.prompt}
              style={{ width: '100%', borderRadius: 12, margin: '4px 0 10px', display: 'block' }}
            />
          )}
          <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$lg" p="$3.5" mb="$2">
            <Text fontWeight="$medium" sx={{ whiteSpace: 'pre-line' }}>{task.prompt}</Text>
          </Box>
          <ExamRecorder
            key={step}
            onSubmit={(answer) => {
              const all = [...answers]
              all[step] = answer
              setAnswers(all)
              if (step + 1 < tasks.length) {
                setStep(step + 1)
                window.scrollTo(0, 0)
              } else {
                void scoreAll(all)
              }
            }}
            isLast={step + 1 === tasks.length}
          />
          {error && (
            <Box mt="$3">
              <Text color="$error600" size="sm">⚠️ {error}</Text>
              <FootActions>
                <Btn onPress={() => void scoreAll(answers)}>Bewertung nochmal versuchen</Btn>
              </FootActions>
            </Box>
          )}
        </AppCard>
      </motion.div>
    </>
  )
}

function ExamRecorder({ onSubmit, isLast }: { onSubmit: (a: Answer) => void; isLast: boolean }) {
  const cap = useVoiceCapture()

  if (!cap.supported) {
    return (
      <Box bg="$backgroundLight50" borderWidth="$1" borderColor="$borderLight200" borderRadius="$md" p="$3" mt="$2">
        <Muted>
          🎤 Dieser Browser unterstützt keine Sprachaufnahme (Chrome, Edge, Safari oder Firefox verwenden).
          Du kannst die Aufgabe ohne Antwort abgeben (0 Punkte).
        </Muted>
        <FootActions>
          <Btn variant="secondary" onPress={() => onSubmit({ transcript: '' })}>Ohne Antwort weiter →</Btn>
        </FootActions>
      </Box>
    )
  }

  const hasAnswer = cap.audioBlob !== null || cap.wordCount >= 3

  return (
    <Box mt="$1">
      <HStack gap="$2.5" alignItems="center" flexWrap="wrap">
        <Btn variant={cap.recording ? 'danger' : 'primary'} onPress={cap.recording ? cap.stop : cap.start}>
          {cap.recording ? '⏹ Aufnahme stoppen' : '🎤 Antwort sprechen'}
        </Btn>
        {(cap.transcript || cap.audioBlob) && !cap.recording && (
          <Btn variant="secondary" small onPress={cap.reset}>Neu aufnehmen</Btn>
        )}
        {cap.recording && <Muted>… ich höre zu (max. 3 Min.)</Muted>}
      </HStack>

      {(cap.transcript || cap.recording || cap.audioBlob) && (
        <Box mt="$2.5">
          {cap.srSupported ? (
            <>
              <Muted>Dein Transkript (Erkennungsfehler kannst du korrigieren):</Muted>
              <textarea
                value={cap.transcript}
                onChange={(e) => cap.setTranscript(e.target.value)}
                placeholder="Hier erscheint, was du sagst …"
                style={{
                  width: '100%', minHeight: 80, border: '1.5px solid #DBDBDB', borderRadius: 10,
                  padding: 12, fontSize: 15, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                  marginTop: 6,
                }}
              />
              {cap.interim && (
                <Text size="sm" color="$textLight500" sx={{ fontStyle: 'italic' }}>{cap.interim} …</Text>
              )}
            </>
          ) : (
            cap.audioBlob && <Muted>✓ Aufnahme fertig - die KI transkribiert sie bei der Bewertung.</Muted>
          )}
          {cap.audioUrl && (
            <Box mt="$2">
              <audio controls src={cap.audioUrl} style={{ width: '100%', height: 40 }} />
            </Box>
          )}
        </Box>
      )}

      {cap.micError && (
        <Text color="$error600" size="sm" mt="$2">⚠️ {cap.micError}</Text>
      )}

      <FootActions>
        <Btn onPress={() => onSubmit({ transcript: cap.transcript.trim(), audio: cap.audioBlob ?? undefined })} disabled={cap.recording || !hasAnswer}>
          {isLast ? 'Abgeben & bewerten lassen 🏁' : 'Antwort abgeben, weiter →'}
        </Btn>
      </FootActions>
    </Box>
  )
}
