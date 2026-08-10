/* Gezieltes Training - zwei Achsen:

   1. "Nach Fähigkeit" (TRAINING_SKILLS): WAS geübt wird - Bildbeschreibung,
      Vor-/Nachteile, Präpositionen, Nebensätze, Konnektoren. Gedacht für
      Schwächen, die der Lernplan nach einer Prüfungssimulation genannt hat.
   2. "Nach Übungsform" (TRAINING_METHODS): WIE geübt wird - Satzbau-Puzzle,
      Fehlersuche, Diktat, Brief-Baukasten, Dialog, Blitzrunde, Nachsprechen,
      Monolog. Jede Form bringt ihre eigene Bedienung und Auswertung mit.

   Diese Datei ist nur noch der Router zwischen beiden; die eigentlichen
   Übungsformen liegen in components/training/. */
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { TRAINING_SKILLS } from '../data/training'
import { TRAINING_METHODS } from '../data/methods'
import type { TrainingExercise, TrainingSkill, TrainingMethod, MethodExercise, MethodKind } from '../data/types'
import {
  db, saveGeneratedTrainingExercise, saveGeneratedMethodExercise,
  type GeneratedTrainingRecord, type GeneratedMethodRecord, type DrillRecord,
} from '../db'
import { generateTrainingExercise } from '../ai/generateTrainingExercise'
import { generateMethodExercise, canGenerate } from '../ai/generateMethodExercise'
import { SpeakPractice } from './SpeakPractice'
import { TranslateZone } from './useWordTranslate'
import { WritingDrill } from './training/WritingDrill'
import { MethodExerciseView } from './training/MethodExerciseView'
import { openLayer, backLayer } from '../appHistory'
import {
  Box, Text, Heading, Muted, Tile, TileGrid, TileEmoji, TileTitle,
  BackLink, Reveal, AppCard, Tag, SituationBox,
} from './ui/kit'

type Selection =
  | { axis: 'skill'; id: string }
  | { axis: 'method'; id: string }

export default function Training() {
  const [sel, setSel] = useState<Selection | null>(null)
  const [exIdx, setExIdx] = useState<number | null>(null)

  const open = (next: Selection) => {
    setSel(next)
    openLayer(() => {
      setSel(null)
      setExIdx(null)
    })
  }
  const openExercise = (i: number) => {
    setExIdx(i)
    openLayer(() => setExIdx(null))
  }

  if (sel === null) return <Overview onOpen={open} />

  if (sel.axis === 'skill') {
    const skill = TRAINING_SKILLS.find((s) => s.id === sel.id)
    if (!skill) return null
    return <SkillView skill={skill} exIdx={exIdx} openExercise={openExercise} />
  }

  const method = TRAINING_METHODS.find((m) => m.id === sel.id)
  if (!method) return null
  return <MethodView method={method} exIdx={exIdx} openExercise={openExercise} />
}

/* --------------------------------- Übersicht --------------------------------- */

function Overview({ onOpen }: { onOpen: (sel: Selection) => void }) {
  const writeMethods = TRAINING_METHODS.filter((m) => m.channel === 'write')
  const speakMethods = TRAINING_METHODS.filter((m) => m.channel === 'speak')

  return (
    <>
      <Heading size="xl" color="$primary600" mb="$1">
        🛠️ Gezieltes Training
      </Heading>
      <Muted>
        Zwei Wege: Übe eine Fähigkeit, die dir schwerfällt - oder wähle eine Übungsform, die zu deiner heutigen
        Lust und Zeit passt.
      </Muted>

      <Box mt="$5">
        <Heading size="md" color="$primary600" mb="$1">
          Nach Fähigkeit
        </Heading>
        <Muted>Was du verbessern willst - z. B. weil dein Lernplan nach einer Prüfungssimulation das genannt hat.</Muted>
        <Box mt="$3">
          <TileGrid>
            {TRAINING_SKILLS.map((s) => (
              <Tile key={s.id} onPress={() => onOpen({ axis: 'skill', id: s.id })}>
                <TileEmoji>{s.icon}</TileEmoji>
                <TileTitle>{s.title}</TileTitle>
                <Muted>
                  {s.mode === 'speak' ? '🎤 Sprechen' : '✍️ Schreiben'} · {s.exercises.length}+ Übungen
                </Muted>
              </Tile>
            ))}
          </TileGrid>
        </Box>
      </Box>

      <Box mt="$3">
        <Heading size="md" color="$primary600" mb="$1">
          Nach Übungsform
        </Heading>
        <Muted>Wie du übst. Vier Formen funktionieren ganz ohne KI und damit auch ohne API-Key.</Muted>

        <Box mt="$3">
          <Text size="sm" fontWeight="$bold" mb="$2">
            ✍️ Schreiben
          </Text>
          <TileGrid>
            {writeMethods.map((m) => (
              <MethodTile key={m.id} method={m} onPress={() => onOpen({ axis: 'method', id: m.id })} />
            ))}
          </TileGrid>
        </Box>

        <Box>
          <Text size="sm" fontWeight="$bold" mb="$2">
            🗣️ Sprechen
          </Text>
          <TileGrid>
            {speakMethods.map((m) => (
              <MethodTile key={m.id} method={m} onPress={() => onOpen({ axis: 'method', id: m.id })} />
            ))}
          </TileGrid>
        </Box>
      </Box>
    </>
  )
}

const AI_LABEL: Record<TrainingMethod['needsAi'], string> = {
  nie: '🔌 ohne KI',
  optional: '🔌 KI optional',
  immer: '🤖 braucht KI',
}

function MethodTile({ method, onPress }: { method: TrainingMethod; onPress: () => void }) {
  return (
    <Tile onPress={onPress}>
      <TileEmoji>{method.icon}</TileEmoji>
      <TileTitle>{method.title}</TileTitle>
      <Muted>{method.short}</Muted>
      <Box mt="$1.5">
        <Text size="2xs" color="$textLight500">
          {AI_LABEL[method.needsAi]}
        </Text>
      </Box>
    </Tile>
  )
}

/* ------------------------------ Nach Fähigkeit ------------------------------ */

function SkillView({
  skill, exIdx, openExercise,
}: {
  skill: TrainingSkill
  exIdx: number | null
  openExercise: (i: number) => void
}) {
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const generatedForSkill = useLiveQuery<GeneratedTrainingRecord[], GeneratedTrainingRecord[]>(
    () => db.trainingGenerated.where('skillId').equals(skill.id).sortBy('createdAt'),
    [skill.id],
    []
  )

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

  if (exIdx !== null && pool[exIdx]) {
    return (
      <>
        <BackLink onPress={backLayer}>← andere Übung wählen</BackLink>
        <SkillExerciseView skill={skill} exercise={pool[exIdx]} />
      </>
    )
  }

  return (
    <>
      <BackLink onPress={backLayer} />
      <Heading size="lg" color="$primary600" mb="$1">
        {skill.icon} {skill.title}
      </Heading>
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
              Übung {i + 1}
              {ex.id.startsWith('ai-') && ' 🤖'}
            </TileTitle>
            <Muted>{ex.prompt.length > 80 ? ex.prompt.slice(0, 80) + '…' : ex.prompt}</Muted>
          </Tile>
        ))}
      </TileGrid>
      {genError && (
        <Text color="$error600" size="sm" mt="$2">
          ⚠️ {genError}
        </Text>
      )}
    </>
  )
}

function SkillExerciseView({ skill, exercise }: { skill: TrainingSkill; exercise: TrainingExercise }) {
  return (
    <TranslateZone>
      <AppCard>
        <Tag>
          {skill.icon} {skill.title}
        </Tag>
        <Text fontWeight="$bold" mb="$1.5">
          {exercise.instruction}
        </Text>
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

/* ----------------------------- Nach Übungsform ----------------------------- */

/** Kurzer Text, der eine Übung in der Auswahlliste erkennbar macht. Jede
    Übungsform trägt ihren Inhalt in einem anderen Feld, deshalb hier gebündelt. */
function exerciseLabel(ex: MethodExercise): string {
  switch (ex.kind) {
    case 'wordorder':
      return ex.solution
    case 'errorhunt':
      return ex.wrong
    case 'dictation':
      return ex.watchOut ?? 'Diktat-Satz'
    case 'letterbuilder':
      return ex.situation
    case 'roleplay':
      return ex.situation
    case 'blitz':
      return `${ex.questions.length} Fragen · ${ex.seconds} Sekunden pro Antwort`
    case 'shadowing':
      return `${ex.sentences.length} Sätze${ex.focus ? ` · ${ex.focus}` : ''}`
    case 'monologue':
      return `${ex.topic} · ${ex.seconds} Sekunden`
  }
}

/** Überschrift einer Übung in der Liste. Bei den Formen mit eigenem Titel (Dialog,
    Blitzrunde, Nachsprechen, Monolog) ist eine Nummer wenig hilfreich. */
function exerciseTitle(ex: MethodExercise, index: number): string {
  switch (ex.kind) {
    case 'roleplay':
      return ex.partnerRole.split(',')[0]
    case 'monologue':
      return ex.topic
    case 'shadowing':
      return ex.focus ?? `Set ${index + 1}`
    case 'blitz':
      return ex.instruction.startsWith('Antworte') ? `Runde ${index + 1}` : ex.instruction
    default:
      return `Übung ${index + 1}`
  }
}

function MethodView({
  method, exIdx, openExercise,
}: {
  method: TrainingMethod
  exIdx: number | null
  openExercise: (i: number) => void
}) {
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const generated = useLiveQuery<GeneratedMethodRecord[], GeneratedMethodRecord[]>(
    () => db.methodGenerated.where('methodId').equals(method.id).sortBy('createdAt'),
    [method.id],
    []
  )

  const pool: MethodExercise[] = [...method.exercises, ...generated.map((g) => g.exercise)]

  const generate = async () => {
    setGenerating(true)
    setGenError(null)
    try {
      const exercise = await generateMethodExercise(method.id, pool)
      await saveGeneratedMethodExercise(method.id, exercise)
      openExercise(pool.length)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Die Übung konnte nicht erstellt werden.')
    } finally {
      setGenerating(false)
    }
  }

  if (exIdx !== null && pool[exIdx]) {
    return (
      <>
        <BackLink onPress={backLayer}>← andere Übung wählen</BackLink>
        <MethodExerciseView method={method} exercise={pool[exIdx]} />
      </>
    )
  }

  return (
    <>
      <BackLink onPress={backLayer} />
      <Heading size="lg" color="$primary600" mb="$1">
        {method.icon} {method.title}
      </Heading>
      <Box mb="$3">
        <Muted>{method.focus}</Muted>
      </Box>
      {method.needsAi !== 'immer' && (
        <Box bg="$success50" borderWidth="$1" borderColor="$success300" borderRadius="$md" p="$3" mb="$3">
          <Text size="sm">
            {method.needsAi === 'nie'
              ? '🔌 Diese Übungsform läuft komplett in deinem Browser - ohne KI und ohne API-Key.'
              : '🔌 Die Prüfung läuft lokal. Die KI wird nur gefragt, wenn du es ausdrücklich möchtest.'}
          </Text>
        </Box>
      )}
      <MethodProgress methodId={method.id} />
      <TileGrid>
        {canGenerate(method.id) && (
          <Tile onPress={generating ? undefined : generate} disabled={generating}>
            <TileEmoji>🤖</TileEmoji>
            <TileTitle>{generating ? 'Wird erstellt …' : 'Neue Übung generieren'}</TileTitle>
            <Muted>Die KI erstellt eine weitere Übung in genau diesem Format.</Muted>
          </Tile>
        )}
        {pool.map((ex, i) => (
          <Tile key={ex.id} onPress={() => openExercise(i)}>
            <TileTitle>
              {exerciseTitle(ex, i)}
              {ex.id.startsWith('ai-') && ' 🤖'}
            </TileTitle>
            <Muted>{truncate(exerciseLabel(ex), 90)}</Muted>
          </Tile>
        ))}
      </TileGrid>
      {genError && (
        <Text color="$error600" size="sm" mt="$2">
          ⚠️ {genError}
        </Text>
      )}
    </>
  )
}

/** Kurze Rückmeldung über die letzten Versuche in dieser Übungsform. Wird erst
    ab drei Versuchen eingeblendet - vorher ist eine Quote nicht aussagekräftig
    und würde nach einem Fehlstart nur entmutigen. */
function MethodProgress({ methodId }: { methodId: MethodKind }) {
  const recent = useLiveQuery<DrillRecord[], DrillRecord[]>(
    () => db.drills.where('methodId').equals(methodId).reverse().limit(20).toArray(),
    [methodId],
    []
  )

  if (recent.length < 3) return null

  const ok = recent.filter((d) => d.ok).length
  const values = recent.filter((d) => typeof d.value === 'number').map((d) => d.value as number)
  const avg = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null

  return (
    <Box bg="$backgroundLight50" borderRadius="$md" p="$3" mb="$3">
      <Text size="sm">
        📈 Deine letzten {recent.length} Versuche: <Text size="sm" fontWeight="$bold">{ok} gut gelöst</Text>
        {avg !== null && methodId === 'monologue' && ` · im Schnitt ${avg} Wörter/Minute`}
        {avg !== null && (methodId === 'dictation' || methodId === 'shadowing') && ` · im Schnitt ${avg} % Treffer`}
      </Text>
    </Box>
  )
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '…' : s
}
