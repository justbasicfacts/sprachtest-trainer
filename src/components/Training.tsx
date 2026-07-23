/* Gezieltes Training: Übungen zu einzelnen Fähigkeiten (z. B. Bildbeschreibung,
   Vor-/Nachteile abwägen, Präpositionen, Nebensätze, Konnektoren) - unabhängig vom
   Prüfungsformat. Gedacht für Schwächen, die z. B. der Lernplan nach einer
   Prüfungssimulation genannt hat. Jede Fähigkeit hat statische Übungen; per Klick
   erstellt die KI bei Bedarf weitere im gleichen Format (bleiben lokal gespeichert). */
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { TRAINING_SKILLS } from '../data/training'
import type { TrainingExercise, TrainingSkill } from '../data/types'
import { db, saveGeneratedTrainingExercise, type GeneratedTrainingRecord } from '../db'
import { generateTrainingExercise } from '../ai/generateTrainingExercise'
import { checkTrainingAnswer, type TrainingCheckResult } from '../ai/checkTrainingAnswer'
import { SpeakPractice } from './SpeakPractice'
import { TranslateZone } from './useWordTranslate'
import { openLayer, backLayer } from '../appHistory'
import {
  Box, HStack, VStack, Text, Heading, Muted, Tile, TileGrid, TileEmoji, TileTitle,
  BackLink, Btn, FootActions, Reveal, AppCard, Tag, SituationBox,
} from './ui/kit'

export default function Training() {
  const [skillId, setSkillId] = useState<string | null>(null)
  const [exIdx, setExIdx] = useState<number | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const openSkill = (id: string) => {
    setSkillId(id)
    openLayer(() => {
      setSkillId(null)
      setExIdx(null)
    })
  }
  const openExercise = (i: number) => {
    setExIdx(i)
    openLayer(() => setExIdx(null))
  }

  const generatedForSkill = useLiveQuery<GeneratedTrainingRecord[], GeneratedTrainingRecord[]>(
    () => (skillId === null ? Promise.resolve([]) : db.trainingGenerated.where('skillId').equals(skillId).sortBy('createdAt')),
    [skillId],
    []
  )

  if (skillId === null) {
    return (
      <>
        <Heading size="xl" color="$primary600" mb="$1">🛠️ Gezieltes Training</Heading>
        <Muted>
          Übe einzelne Fähigkeiten, die dir noch schwerfallen - z. B. weil dein Lernplan nach einer
          Prüfungssimulation genau das genannt hat.
        </Muted>
        <Box mt="$4">
          <TileGrid>
            {TRAINING_SKILLS.map((s) => (
              <Tile key={s.id} onPress={() => openSkill(s.id)}>
                <TileEmoji>{s.icon}</TileEmoji>
                <TileTitle>{s.title}</TileTitle>
                <Muted>{s.mode === 'speak' ? '🎤 Sprechen' : '✍️ Schreiben'} · {s.exercises.length}+ Übungen</Muted>
              </Tile>
            ))}
          </TileGrid>
        </Box>
      </>
    )
  }

  const skill = TRAINING_SKILLS.find((s) => s.id === skillId)
  if (!skill) return null

  const pool: TrainingExercise[] = [...skill.exercises, ...generatedForSkill.map((g) => g.exercise)]

  const generate = async () => {
    setGenerating(true)
    setGenError(null)
    try {
      const exercise = await generateTrainingExercise(skill)
      await saveGeneratedTrainingExercise(skill.id, exercise)
      openExercise(pool.length)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Die Übung konnte nicht erstellt werden.')
    } finally {
      setGenerating(false)
    }
  }

  if (exIdx === null) {
    return (
      <>
        <BackLink onPress={backLayer} />
        <Heading size="lg" color="$primary600" mb="$1">{skill.icon} {skill.title}</Heading>
        <Box mb="$3">
          <Muted>{skill.focus}</Muted>
        </Box>
        <TileGrid>
          <Tile onPress={generating ? undefined : generate} disabled={generating}>
            <TileEmoji>🤖</TileEmoji>
            <TileTitle>{generating ? 'Wird erstellt …' : 'Neue Übung generieren'}</TileTitle>
            <Muted>Die KI erstellt eine weitere Übung zu genau dieser Fähigkeit.</Muted>
          </Tile>
          {pool.map((ex, i) => (
            <Tile key={ex.id} onPress={() => openExercise(i)}>
              <TileTitle>
                Übung {i + 1}{ex.id.startsWith('ai-') && ' 🤖'}
              </TileTitle>
              <Muted>{ex.prompt.length > 80 ? ex.prompt.slice(0, 80) + '…' : ex.prompt}</Muted>
            </Tile>
          ))}
        </TileGrid>
        {genError && (
          <Text color="$error600" size="sm" mt="$2">⚠️ {genError}</Text>
        )}
      </>
    )
  }

  return (
    <>
      <BackLink onPress={backLayer}>← andere Übung wählen</BackLink>
      <ExerciseView skill={skill} exercise={pool[exIdx]} />
    </>
  )
}

function ExerciseView({ skill, exercise }: { skill: TrainingSkill; exercise: TrainingExercise }) {
  return (
    <TranslateZone>
      <AppCard>
        <Tag>{skill.icon} {skill.title}</Tag>
        <Text fontWeight="$bold" mb="$1.5">{exercise.instruction}</Text>
        <SituationBox>{exercise.prompt}</SituationBox>
        {exercise.hint && (
          <Box bg="$backgroundLight50" borderRadius="$md" p="$3" mt="$1">
            <Text size="sm">
              <Text fontWeight="$bold">Hilfe: </Text>
              {exercise.hint}
            </Text>
          </Box>
        )}

        {skill.mode === 'speak' ? (
          <SpeakPractice context={buildSpeakContext(skill, exercise)} criteria={skill.criteria} />
        ) : (
          <WritingDrill exercise={exercise} criteria={skill.criteria} />
        )}

        <Box mt="$3">
          <Reveal label="💡 Musterlösung anzeigen">
            <Box bg="$backgroundLight50" borderRadius="$md" p="$3.5" mt="$2">
              <Text sx={{ whiteSpace: 'pre-line' }}>{exercise.sampleAnswer}</Text>
            </Box>
          </Reveal>
        </Box>
      </AppCard>
    </TranslateZone>
  )
}

function buildSpeakContext(skill: TrainingSkill, exercise: TrainingExercise): string {
  return (
    `Gezieltes Training: ${skill.title}. Übung: ${exercise.instruction} Aufgabe: ${exercise.prompt}` +
    (exercise.hint ? ` Hilfestellung: ${exercise.hint}` : '')
  )
}

/** Schreib-Übung mit KI-Korrektur (für die 'write'-Fähigkeiten: Präpositionen,
    Nebensätze, Konnektoren, ...). Zeigt Feedback + eine verbesserte Version. */
function WritingDrill({ exercise, criteria }: { exercise: TrainingExercise; criteria: string[] }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TrainingCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      setResult(
        await checkTrainingAnswer({
          data: { instruction: exercise.instruction, prompt: exercise.prompt, hint: exercise.hint, answer: text },
        })
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Bewertung ist fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box mt="$3.5" borderTopWidth="$1" borderTopColor="$borderLight200" pt="$3.5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Schreib deine Antwort hier …"
        style={{
          width: '100%', minHeight: 90, border: '1.5px solid #DBDBDB', borderRadius: 10,
          padding: 12, fontSize: 15, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
        }}
      />
      <FootActions>
        <Btn variant="gold" onPress={run} disabled={loading || text.trim().length < 3}>
          {loading ? 'KI prüft …' : '🤖 Antwort prüfen lassen'}
        </Btn>
      </FootActions>

      {error && (
        <Text color="$error600" size="sm" mt="$2">⚠️ {error}</Text>
      )}

      {result && (
        <Box borderWidth="$1" borderColor="$borderLight200" borderRadius="$xl" p="$4" mt="$3">
          <HStack alignItems="center" gap="$2.5" mb="$1.5">
            <Text>{result.ok ? '✅' : '❌'}</Text>
            <Text fontWeight="$semibold">{result.ok ? 'Passt!' : 'Da geht noch was'}</Text>
          </HStack>
          <Muted>{result.feedback}</Muted>
          <Box bg="$backgroundLight50" borderRadius="$md" p="$3" mt="$2.5">
            <Text size="sm" fontWeight="$bold" mb="$0.5">Verbesserte Version:</Text>
            <Text sx={{ whiteSpace: 'pre-line' }}>{result.corrected}</Text>
          </Box>
        </Box>
      )}

      {criteria.length > 0 && (
        <Box mt="$3">
          <Muted>Worauf du achten solltest:</Muted>
          <VStack mt="$1">
            {criteria.map((c, i) => (
              <Text key={i} size="sm" pl="$4">• {c}</Text>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  )
}
