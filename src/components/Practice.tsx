import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { DATA } from '../data/content'
import type { Teil1Task, Teil2Task, Teil3Task, Teil4Task } from '../data/types'
import { Teil1, Teil2, Teil3, Teil4Prompt, WordCount, SelfAssess } from './Tasks'
import { db, saveGeneratedTask, type GeneratedTaskRecord } from '../db'
import { generateTask } from '../ai/generateTask'
import { AiWritingScore } from './AiScore'
import {
  Box, Text, Heading, Muted, Tile, TileGrid, TileEmoji, TileTitle, BackLink, Btn, FootActions,
} from './ui/kit'

type PartNum = 1 | 2 | 3 | 4
type TeilKey = 'teil1' | 'teil2' | 'teil3' | 'teil4'
type PracticeTaskData = Teil1Task | Teil2Task | Teil3Task | Teil4Task

const PARTS: { n: PartNum; icon: string; title: string; sub: string }[] = [
  { n: 1, icon: '📋', title: 'Teil 1 · Anzeigen', sub: 'Die passende Anzeige finden' },
  { n: 2, icon: '📰', title: 'Teil 2 · Richtig / Falsch', sub: 'Zeitungsartikel mit 4 Aussagen' },
  { n: 3, icon: '🏷️', title: 'Teil 3 · Überschriften', sub: 'Die passende Überschrift wählen' },
  { n: 4, icon: '✍️', title: 'Teil 4 · Schreiben', sub: 'Nachricht schreiben, mit Musterlösung' },
]

export default function Practice() {
  const [part, setPart] = useState<PartNum | null>(null)
  const [idx, setIdx] = useState<number | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const generatedForPart = useLiveQuery<GeneratedTaskRecord[], GeneratedTaskRecord[]>(
    () => (part === null ? Promise.resolve([]) : db.generated.where('part').equals(part).sortBy('createdAt')),
    [part],
    []
  )

  if (part === null) {
    return (
      <>
        <Heading size="xl" color="$primary600" mb="$1">🎯 Übungsmodus</Heading>
        <Muted>Wähle einen Aufgabentyp. Du bekommst sofort Feedback mit Erklärung.</Muted>
        <Box mt="$4">
          <TileGrid>
            {PARTS.map((p) => (
              <Tile key={p.n} onPress={() => setPart(p.n)}>
                <TileEmoji>{p.icon}</TileEmoji>
                <TileTitle>{p.title}</TileTitle>
                <Muted>{DATA[('teil' + p.n) as TeilKey].length} Aufgaben · {p.sub}</Muted>
              </Tile>
            ))}
          </TileGrid>
        </Box>
      </>
    )
  }

  const pool: PracticeTaskData[] = [
    ...DATA[('teil' + part) as TeilKey],
    ...generatedForPart.map((g) => g.task),
  ]

  const generate = async () => {
    setGenerating(true)
    setGenError(null)
    try {
      const task = await generateTask({ data: { part } })
      await saveGeneratedTask(part, task)
      setIdx(pool.length) // die neue Aufgabe steht am Ende des kombinierten Pools
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Die Aufgabe konnte nicht erstellt werden.')
    } finally {
      setGenerating(false)
    }
  }

  if (idx === null) {
    return (
      <>
        <BackLink onPress={() => setPart(null)} />
        <Heading size="lg" color="$primary600" mb="$3">Teil {part} – Aufgabe wählen</Heading>
        <TileGrid>
          <Tile onPress={generating ? undefined : generate} disabled={generating}>
            <TileEmoji>🤖</TileEmoji>
            <TileTitle>{generating ? 'Wird erstellt …' : 'Neue Aufgabe generieren'}</TileTitle>
            <Muted>Gemini erstellt eine neue Teil-{part}-Aufgabe im gleichen Format.</Muted>
          </Tile>
          {pool.map((d, i) => (
            <Tile key={d.id ?? i} onPress={() => setIdx(i)}>
              <TileTitle>{d.set}{d.set === 'KI-generiert' && ' 🤖'}</TileTitle>
              <Muted>
                {part === 2 ? (d as Teil2Task).title : (((d as Teil1Task | Teil4Task).situation ?? (d as Teil3Task).text) as string).slice(0, 80) + '…'}
              </Muted>
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

  return (
    <>
      <BackLink onPress={() => setIdx(null)}>← andere Aufgabe wählen</BackLink>
      <PracticeTask key={`${part}-${idx}`} part={part} d={pool[idx]} />
    </>
  )
}

function PracticeTask({ part, d }: { part: PartNum; d: PracticeTaskData }) {
  const [a1, setA1] = useState<number | undefined>(undefined)
  const [a2, setA2] = useState<(number | undefined)[]>([undefined, undefined, undefined, undefined])
  const [text, setText] = useState('')
  const [showCheck, setShowCheck] = useState(false)
  const [selfScore, setSelfScore] = useState<number | null>(null)
  const [showModel, setShowModel] = useState(false)

  if (part === 1) return <Teil1 d={d as Teil1Task} ans={a1} onPick={setA1} mode="practice" />
  if (part === 2) return <Teil2 d={d as Teil2Task} ans={a2} onPick={(i, v) => setA2((a) => a.map((x, j) => (j === i ? v : x)))} mode="practice" />
  if (part === 3) return <Teil3 d={d as Teil3Task} ans={a1} onPick={setA1} mode="practice" />

  const t4 = d as Teil4Task
  return (
    <Teil4Prompt d={t4}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Schreiben Sie hier Ihre Nachricht …"
        style={{
          width: '100%', minHeight: 240, border: '1.5px solid #DBDBDB', borderRadius: 10,
          padding: 14, fontSize: 15, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
        }}
      />
      <WordCount text={text} />
      <FootActions>
        <Btn onPress={() => setShowCheck(true)}>Selbst prüfen</Btn>
      </FootActions>
      <AiWritingScore d={t4} text={text} />
      {showCheck && <SelfAssess d={t4} onDone={setSelfScore} />}
      {selfScore !== null && (
        <Text fontWeight="$bold" mt="$2.5">
          Deine Selbstbewertung: <Text color="$primary600" size="xl">{selfScore} / 6 Punkten</Text> {selfScore >= 3 ? '👍' : '– weiter üben!'}
        </Text>
      )}
      <Box mt="$3">
        <Text color="$primary600" fontWeight="$semibold" size="sm" onPress={() => setShowModel((v) => !v)}>
          {showModel ? '▾ ' : '▸ '}💡 Musterlösung anzeigen
        </Text>
        {showModel && (
          <Box bg="$backgroundLight50" borderRadius="$md" p="$3.5" mt="$2">
            <Text sx={{ whiteSpace: 'pre-line' }}>{t4.model}</Text>
          </Box>
        )}
      </Box>
    </Teil4Prompt>
  )
}
