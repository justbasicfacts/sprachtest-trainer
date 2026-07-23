import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { DATA } from '../data/content'
import type { Teil1Task, Teil2Task, Teil3Task, Teil4Task } from '../data/types'
import { Teil1, Teil2, Teil3, Teil4Prompt, WordCount, SelfAssess } from './Tasks'
import { db, saveGeneratedTask, type GeneratedTaskRecord } from '../db'
import { generateTask } from '../ai/generateTask'
import { summarizePractice } from '../ai/summarizePractice'
import { generateModelAnswerTeil4 } from '../ai/generateModelAnswers'
import type { PracticeSummary } from '../data/schemas'
import { AiWritingScore } from './AiScore'
import { openLayer, backLayer } from '../appHistory'
import { loadPracticeResults, savePracticeResults } from '../resultsStorage'
import {
  Box, VStack, Text, Heading, Muted, Tile, TileGrid, TileEmoji, TileTitle, BackLink, Btn, FootActions, Reveal,
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

  // Ergebnisse abgeschlossener Aufgaben (part-idx → Punkte/Maximum), für Häkchen/Kreuz
  // in der Übersicht und für die KI-Zusammenfassung am Ende eines Teils. In localStorage
  // gespeichert, damit sie einen Seiten-Reload überleben statt zu verschwinden.
  const [results, setResults] = useState<Map<string, { points: number; max: number }>>(() => loadPracticeResults())
  const markResult = (key: string, points: number, max: number) =>
    setResults((prev) => (prev.get(key)?.points === points ? prev : new Map(prev).set(key, { points, max })))

  useEffect(() => {
    savePracticeResults(results)
  }, [results])

  const [summary, setSummary] = useState<PracticeSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const resetSummary = () => { setSummary(null); setSummaryError(null) }

  // Zurück-Taste/-Geste: Ebenen (Teil → Aufgabe) einzeln schließen statt Seite verlassen
  const openPart = (n: PartNum) => {
    setPart(n)
    resetSummary()
    openLayer(() => {
      setPart(null)
      setIdx(null)
    })
  }
  const openTask = (i: number) => {
    setIdx(i)
    openLayer(() => setIdx(null))
  }
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
              <Tile key={p.n} onPress={() => openPart(p.n)}>
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
    resetSummary() // neue Aufgabe im Pool → alte Gesamt-Zusammenfassung ist nicht mehr aktuell
    try {
      const task = await generateTask({ data: { part } })
      await saveGeneratedTask(part, task)
      openTask(pool.length) // die neue Aufgabe steht am Ende des kombinierten Pools
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Die Aufgabe konnte nicht erstellt werden.')
    } finally {
      setGenerating(false)
    }
  }

  const partLabel = PARTS.find((p) => p.n === part)?.title ?? `Teil ${part}`
  const poolResults = pool.map((_, i) => results.get(`${part}-${i}`))
  const allDone = pool.length > 0 && poolResults.every((r) => r !== undefined)
  const totalPoints = +poolResults.reduce((s, r) => s + (r?.points ?? 0), 0).toFixed(1)
  const totalMax = +poolResults.reduce((s, r) => s + (r?.max ?? 0), 0).toFixed(1)

  const runSummary = async () => {
    setSummaryLoading(true)
    setSummaryError(null)
    try {
      const items = poolResults.filter((r): r is { points: number; max: number } => r !== undefined)
      setSummary(await summarizePractice({ data: { partLabel, items } }))
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Die Zusammenfassung konnte nicht erstellt werden.')
    } finally {
      setSummaryLoading(false)
    }
  }

  if (idx === null) {
    return (
      <>
        <BackLink onPress={backLayer} />
        <Heading size="lg" color="$primary600" mb="$3">Teil {part} – Aufgabe wählen</Heading>
        {allDone && (
          <PoolCompleteBanner
            partLabel={partLabel}
            totalPoints={totalPoints}
            totalMax={totalMax}
            generating={generating}
            onGenerate={generate}
            summary={summary}
            summaryLoading={summaryLoading}
            summaryError={summaryError}
            onSummarize={runSummary}
          />
        )}
        <TileGrid>
          <Tile onPress={generating ? undefined : generate} disabled={generating}>
            <TileEmoji>🤖</TileEmoji>
            <TileTitle>{generating ? 'Wird erstellt …' : 'Neue Aufgabe generieren'}</TileTitle>
            <Muted>Gemini erstellt eine neue Teil-{part}-Aufgabe im gleichen Format.</Muted>
          </Tile>
          {pool.map((d, i) => {
            const r = results.get(`${part}-${i}`)
            const mark = r ? (r.points >= r.max / 2 ? ' ✅' : ' ❌') : ''
            return (
              <Tile key={d.id ?? i} onPress={() => openTask(i)}>
                <TileTitle>
                  {d.set}{d.set === 'KI-generiert' && ' 🤖'}{mark}
                </TileTitle>
                <Muted>
                  {part === 2 ? (d as Teil2Task).title : (((d as Teil1Task | Teil4Task).situation ?? (d as Teil3Task).text) as string).slice(0, 80) + '…'}
                </Muted>
              </Tile>
            )
          })}
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
      <BackLink onPress={backLayer}>← andere Aufgabe wählen</BackLink>
      <PracticeTask
        key={`${part}-${idx}`}
        part={part}
        d={pool[idx]}
        idx={idx}
        poolLength={pool.length}
        onFinish={(points, max) => markResult(`${part}-${idx}`, points, max)}
        onNext={() => setIdx((i) => (i === null ? null : i + 1))}
        onBackToList={backLayer}
      />
    </>
  )
}

/** Banner auf der Aufgabenübersicht, wenn alle Aufgaben eines Teils erledigt sind:
    Gesamtpunktzahl, Möglichkeit eine weitere KI-Aufgabe zu erstellen, und auf
    Wunsch eine KI-Zusammenfassung der Leistung mit Tipps. */
function PoolCompleteBanner({
  partLabel, totalPoints, totalMax, generating, onGenerate, summary, summaryLoading, summaryError, onSummarize,
}: {
  partLabel: string
  totalPoints: number
  totalMax: number
  generating: boolean
  onGenerate: () => void
  summary: PracticeSummary | null
  summaryLoading: boolean
  summaryError: string | null
  onSummarize: () => void
}) {
  return (
    <Box bg="$success50" borderWidth="$1" borderColor="$success300" borderRadius="$xl" p="$4" mb="$4">
      <Heading size="sm" color="$success800" mb="$1">🎉 Alle Aufgaben in {partLabel} erledigt!</Heading>
      <Text color="$success800">Insgesamt {totalPoints} / {totalMax} Punkten.</Text>
      <FootActions>
        <Btn variant="gold" onPress={generating ? undefined : onGenerate} disabled={generating}>
          {generating ? 'Wird erstellt …' : '🤖 Neue Aufgabe mit KI erstellen'}
        </Btn>
        {!summary && (
          <Btn variant="secondary" onPress={summaryLoading ? undefined : onSummarize} disabled={summaryLoading}>
            {summaryLoading ? 'Wird erstellt …' : '📝 KI-Zusammenfassung erstellen'}
          </Btn>
        )}
      </FootActions>
      {summaryError && (
        <Text color="$error600" size="sm" mt="$2">
          ⚠️ {summaryError}
        </Text>
      )}
      {summary && (
        <Box bg="$backgroundLight0" borderWidth="$1" borderColor="$borderLight200" borderRadius="$md" p="$3.5" mt="$3">
          <Text>{summary.summary}</Text>
          <VStack mt="$2" gap="$1">
            {summary.tips.map((t, i) => (
              <Text key={i}>💡 {t}</Text>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  )
}

interface PracticeTaskProps {
  part: PartNum
  d: PracticeTaskData
  idx: number
  poolLength: number
  /** Wird einmal aufgerufen, sobald die Aufgabe fertig bearbeitet ist (Punkte + Maximum, für
      Häkchen/Kreuz in der Übersicht und die KI-Zusammenfassung) */
  onFinish: (points: number, max: number) => void
  /** Springt zur nächsten Aufgabe im Pool */
  onNext: () => void
  /** Zurück zur Aufgabenübersicht des Teils */
  onBackToList: () => void
}

function PracticeTask({ part, d, idx, poolLength, onFinish, onNext, onBackToList }: PracticeTaskProps) {
  const [a1, setA1] = useState<number | undefined>(undefined)
  const [a2, setA2] = useState<(number | undefined)[]>([undefined, undefined, undefined, undefined])
  // Erst nach explizitem Klick auf "Antwort abgeben" wird ausgewertet - ein versehentlicher
  // Klick auf eine Anzeige/Überschrift/richtig-falsch-Option darf nicht sofort die Lösung zeigen.
  const [submitted, setSubmitted] = useState(false)
  const [text, setText] = useState('')
  const [showCheck, setShowCheck] = useState(false)
  const [selfScore, setSelfScore] = useState<number | null>(null)
  const [altLoading, setAltLoading] = useState(false)
  const [altError, setAltError] = useState<string | null>(null)
  const [altModel, setAltModel] = useState<string | null>(null)

  // Fertig-Status + Punkte je Teil ermitteln, damit Summary/Next-Button einheitlich funktionieren
  let finished = false
  let points = 0
  let max = 0
  let canSubmit = false

  if (part === 1) {
    const t1 = d as Teil1Task
    canSubmit = a1 !== undefined
    finished = submitted
    max = 2.5
    points = a1 === t1.correct ? 2.5 : 0
  } else if (part === 2) {
    const t2 = d as Teil2Task
    canSubmit = a2.every((v) => v !== undefined)
    finished = submitted
    max = t2.items.length
    points = t2.items.reduce((sum, it, i) => sum + (a2[i] === (it.a ? 1 : 0) ? 1 : 0), 0)
  } else if (part === 3) {
    const t3 = d as Teil3Task
    canSubmit = a1 !== undefined
    finished = submitted
    max = 2.5
    points = a1 === t3.correct ? 2.5 : 0
  } else {
    finished = selfScore !== null
    max = 6
    points = selfScore ?? 0
  }

  useEffect(() => {
    if (finished) onFinish(points, max)
    // onFinish ist stabil genug für unsere Zwecke; wir wollen nur bei finished-Wechsel reagieren
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const summary = finished && (
    <TaskDoneSummary idx={idx} poolLength={poolLength} points={points} max={max} onNext={onNext} onBack={onBackToList} />
  )

  const submitButton = !submitted && (
    <FootActions>
      <Btn disabled={!canSubmit} onPress={() => setSubmitted(true)}>Antwort abgeben ✔</Btn>
    </FootActions>
  )

  if (part === 1) {
    return (
      <>
        <Teil1 d={d as Teil1Task} ans={a1} onPick={setA1} mode="practice" submitted={submitted} />
        {submitButton}
        {summary}
      </>
    )
  }
  if (part === 2) {
    return (
      <>
        <Teil2
          d={d as Teil2Task}
          ans={a2}
          onPick={(i, v) => setA2((a) => a.map((x, j) => (j === i ? v : x)))}
          mode="practice"
          submitted={submitted}
        />
        {submitButton}
        {summary}
      </>
    )
  }
  if (part === 3) {
    return (
      <>
        <Teil3 d={d as Teil3Task} ans={a1} onPick={setA1} mode="practice" submitted={submitted} />
        {submitButton}
        {summary}
      </>
    )
  }

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
        <Reveal label="💡 Musterlösung anzeigen">
          <Box bg="$backgroundLight50" borderRadius="$md" p="$3.5" mt="$2">
            <Text sx={{ whiteSpace: 'pre-line' }}>{t4.model}</Text>
          </Box>
        </Reveal>
      </Box>
      <Box mt="$2">
        <Btn
          disabled={altLoading}
          onPress={async () => {
            setAltLoading(true)
            setAltError(null)
            try {
              const result = await generateModelAnswerTeil4(t4)
              setAltModel(result)
            } catch (err) {
              setAltError(err instanceof Error ? err.message : 'Fehler beim Generieren')
            } finally {
              setAltLoading(false)
            }
          }}
          variant="secondary"
        >
          {altLoading ? '💭 Generiere…' : '💡 Alternative Lösung generieren'}
        </Btn>
        {altError && <Text color="$error600" mt="$2" size="sm">{altError}</Text>}
        {altModel && (
          <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$md" p="$3.5" mt="$2">
            <Text fontWeight="$bold" mb="$1.5" size="sm">Alternative Lösung:</Text>
            <Text sx={{ whiteSpace: 'pre-line' }}>{altModel}</Text>
          </Box>
        )}
      </Box>
      {summary}
    </Teil4Prompt>
  )
}

/** Abschluss-Kasten nach einer Übung: Punktestand + Weiter-Button (oder zurück zur Übersicht,
    wenn es die letzte Aufgabe im Pool war). */
function TaskDoneSummary({
  idx, poolLength, points, max, onNext, onBack,
}: {
  idx: number
  poolLength: number
  points: number
  max: number
  onNext: () => void
  onBack: () => void
}) {
  const isLast = idx >= poolLength - 1
  const good = points >= max / 2
  return (
    <Box
      bg={good ? '$success50' : '$error50'}
      borderWidth="$1"
      borderColor={good ? '$success300' : '$error300'}
      borderRadius="$lg"
      p="$3.5"
      mt="$4"
    >
      <Text fontWeight="$bold" color={good ? '$success800' : '$error700'}>
        {good ? '✅ Bestanden' : '❌ Nicht bestanden'} – {points} / {max} Punkten
      </Text>
      <FootActions>
        {!isLast && <Btn variant="gold" onPress={onNext}>Nächste Aufgabe ▶</Btn>}
        <Btn variant="secondary" onPress={onBack}>
          {isLast ? 'Fertig – zur Übersicht' : 'Zur Übersicht'}
        </Btn>
      </FootActions>
    </Box>
  )
}
