/* Prüfungssimulation: schriftlicher Teil (30 Min. Lesen + 20 Min. Schreiben, 15 P)
   + optionaler mündlicher Teil (3 Sprechaufgaben, 15 P). Das Schreiben und das
   Sprechen werden von der KI bewertet wie von einem Prüfer; Lesen wird automatisch
   ausgewertet. Ergebnis: /15 (nur schriftlich) oder /30 (komplett). */
import { useEffect, useRef, useState } from 'react'
import { DATA } from '../data/content'
import { db } from '../db'
import { Teil1, Teil2, Teil3, Teil4Prompt, WordCount, scoreLesen, CheckRow } from './Tasks'
import { TranslateZone } from './useWordTranslate'
import { WritingScoreView } from './AiScore'
import { ExamSpeaking, SPEAKING_MAX_POINTS, type SpeakingPartResult } from './ExamSpeaking'
import { scoreWriting, type WritingScore } from '../ai/scoreWriting'
import { generateStudyPlan, type StudyPlan } from '../ai/generateStudyPlan'
import type { Teil4Task } from '../data/types'
import { openLayer, clearLayers } from '../appHistory'
import {
  Box, HStack, VStack, Text, Heading,
  AppCard, CardTitle, Muted, Tile, TileGrid, TileEmoji, TileTitle, Btn, FootActions, ScoreBox, Reveal, Spinner,
  ConfirmDialog,
} from './ui/kit'

type Phase = 'pick' | 'intro-lesen' | 'lesen' | 'intro-schreiben' | 'schreiben' | 'bewertung' | 'intro-sprechen' | 'sprechen' | 'done'

function useCountdown(minutes: number, active: boolean, onExpire: () => void): number {
  const [sec, setSec] = useState(minutes * 60)
  const cb = useRef(onExpire)
  cb.current = onExpire
  useEffect(() => {
    if (!active) return
    setSec(minutes * 60)
    const t = setInterval(() => setSec((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [minutes, active])
  useEffect(() => {
    if (active && sec === 0) cb.current()
  }, [sec, active])
  return sec
}

function Timer({ sec }: { sec: number }) {
  const m = Math.floor(sec / 60), s = sec % 60
  const warn = sec <= 300
  return (
    <Box
      bg={warn ? '$error600' : '$primary700'}
      borderRadius="$lg"
      px="$3.5"
      py="$1.5"
      alignSelf="flex-start"
      mb="$3"
      sx={{ position: 'sticky', top: 8, zIndex: 30 }}
    >
      <Text color="$white" fontWeight="$bold" size="lg">
        {m}:{String(s).padStart(2, '0')}
      </Text>
    </Box>
  )
}

const ICONS = ['📘', '📗', '📙', '📕', '📔', '📒', '📓', '📚', '📖']

export default function Exam({ setExamActive }: { setExamActive: (active: boolean) => void }) {
  const [testIdx, setTestIdx] = useState<number | null>(null)
  const [phase, setPhase] = useState<Phase>('pick')
  const [a1, setA1] = useState<number | undefined>(undefined)
  const [a2, setA2] = useState<(number | undefined)[]>([undefined, undefined, undefined, undefined])
  const [a3, setA3] = useState<number | undefined>(undefined)
  const [text, setText] = useState('')
  const [lesenPts, setLesenPts] = useState(0)
  const [schreibPts, setSchreibPts] = useState(0)
  const [sprechenPts, setSprechenPts] = useState<number | null>(null)
  const [sprechenDetails, setSprechenDetails] = useState<SpeakingPartResult[]>([])
  const [showReview, setShowReview] = useState(false)
  const [showAbort, setShowAbort] = useState(false)

  const running = phase === 'lesen' || phase === 'schreiben' || phase === 'sprechen'
  useEffect(() => { setExamActive(running) }, [running, setExamActive])

  const resetToPick = () => {
    setPhase('pick'); setTestIdx(null); setA1(undefined); setA2([undefined, undefined, undefined, undefined]); setA3(undefined)
    setText(''); setShowReview(false); setSprechenPts(null); setSprechenDetails([]); setShowAbort(false)
  }

  /* Zurück-Taste/-Geste während eines Tests: läuft gerade ein Prüfungsteil, erst
     nachfragen (History-Eintrag wieder auffüllen, damit die Seite nicht verlassen
     wird); sonst zur Testauswahl zurück. */
  const phaseRef = useRef(phase); phaseRef.current = phase
  const runningRef = useRef(running); runningRef.current = running
  const handleBack = () => {
    if (runningRef.current) {
      openLayer(handleBack)
      setShowAbort(true)
    } else if (phaseRef.current !== 'pick') {
      resetToPick()
    }
  }
  const startTest = (i: number) => {
    setTestIdx(i)
    setPhase('intro-lesen')
    openLayer(handleBack)
  }

  const abortDialog = (
    <ConfirmDialog
      open={showAbort}
      onOpenChange={(open) => { if (!open) setShowAbort(false) }}
      title="Prüfung abbrechen?"
      description="Der Fortschritt dieser Prüfungssimulation geht verloren."
      cancelLabel="Zurück zur Prüfung"
      confirmLabel="Prüfung abbrechen"
      onConfirm={() => { clearLayers(); resetToPick() }}
    />
  )

  const t = testIdx === null ? null : {
    t1: DATA.teil1[testIdx], t2: DATA.teil2[testIdx], t3: DATA.teil3[testIdx], t4: DATA.teil4[testIdx],
  }

  const finishLesen = () => {
    if (!t) return
    const pts = scoreLesen(t.t1, t.t2, t.t3, a1, a2, a3)
    setLesenPts(pts)
    setPhase('intro-schreiben')
    window.scrollTo(0, 0)
  }
  const finishSchreiben = () => {
    setPhase('bewertung')
    window.scrollTo(0, 0)
  }

  /** Ergebnis speichern und abschließen (mit oder ohne mündlichen Teil). */
  const finalize = async (schreiben: number, sprechen: number | null, details: SpeakingPartResult[]) => {
    const schriftlich = +(lesenPts + schreiben).toFixed(1)
    const total = sprechen === null ? schriftlich : +(schriftlich + sprechen).toFixed(1)
    setSchreibPts(schreiben)
    setSprechenPts(sprechen)
    setSprechenDetails(details)
    await db.results.add({
      date: new Date().toLocaleDateString('de-DE'),
      test: 'Test ' + ((testIdx ?? 0) + 1),
      lesen: lesenPts,
      schreiben,
      ...(sprechen === null ? {} : { sprechen }),
      total,
      max: sprechen === null ? 15 : 30,
      ts: Date.now(),
    })
    setPhase('done')
    window.scrollTo(0, 0)
  }

  const lesenSec = useCountdown(30, phase === 'lesen', () => { alert('⏰ Die Zeit für den Leseteil ist um!'); finishLesenRef.current() })
  const schreibSec = useCountdown(20, phase === 'schreiben', () => { alert('⏰ Die Zeit für den Schreibteil ist um!'); finishSchreiben() })
  const finishLesenRef = useRef(finishLesen)
  finishLesenRef.current = finishLesen

  if (phase === 'pick') {
    return (
      <>
        <Heading size="xl" color="$primary600" mb="$1">⏱️ Prüfungssimulation</Heading>
        <Muted>
          Wie in der echten Prüfung: 30 Minuten Lesen (Teil 1–3), 20 Minuten Schreiben (Teil 4) und danach optional der
          mündliche Teil (Teil 5–7, gesprochen). Schreiben und Sprechen bewertet die KI wie ein Prüfer.
        </Muted>
        <Box mt="$4">
          <TileGrid>
            {DATA.teil1.map((_, i) => (
              <Tile key={i} onPress={() => startTest(i)}>
                <TileEmoji>{ICONS[i]}</TileEmoji>
                <TileTitle>Test {i + 1}</TileTitle>
                <Muted>{i === 0 ? 'Der originale Modelltest' : 'Zusätzlicher Übungstest im Originalformat'}</Muted>
              </Tile>
            ))}
          </TileGrid>
        </Box>
      </>
    )
  }

  if (phase === 'intro-lesen') {
    return (
      <AppCard>
        <CardTitle>Test {(testIdx ?? 0) + 1} · Lesen</CardTitle>
        <Text>
          Du hast <Text fontWeight="$bold">30 Minuten</Text> für Teil 1–3 (max. 9 Punkte). Der Timer startet, wenn du klickst.
        </Text>
        <FootActions>
          <Btn variant="gold" onPress={() => setPhase('lesen')}>Lesen starten ▶</Btn>
        </FootActions>
      </AppCard>
    )
  }

  if (phase === 'lesen' && t) {
    return (
      <>
        <Timer sec={lesenSec} />
        <Muted>Test {(testIdx ?? 0) + 1} · Lesen · 30 Minuten · Teil 1–3</Muted>
        <Teil1 d={t.t1} ans={a1} onPick={setA1} mode="exam" />
        <Teil2 d={t.t2} ans={a2} onPick={(i, v) => setA2((a) => a.map((x, j) => (j === i ? v : x)))} mode="exam" />
        <Teil3 d={t.t3} ans={a3} onPick={setA3} mode="exam" />
        <FootActions>
          <Btn onPress={finishLesen}>Lesen abgeben ✔</Btn>
        </FootActions>
        {abortDialog}
      </>
    )
  }

  if (phase === 'intro-schreiben') {
    return (
      <AppCard>
        <CardTitle>Test {(testIdx ?? 0) + 1} · Schreiben</CardTitle>
        <Text>
          Leseteil abgegeben ✔ &nbsp;Jetzt hast du <Text fontWeight="$bold">20 Minuten</Text> für die Nachricht (max. 6 Punkte).
        </Text>
        <FootActions>
          <Btn variant="gold" onPress={() => setPhase('schreiben')}>Schreiben starten ▶</Btn>
        </FootActions>
      </AppCard>
    )
  }

  if (phase === 'schreiben' && t) {
    return (
      <>
        <Timer sec={schreibSec} />
        <Muted>Test {(testIdx ?? 0) + 1} · Schreiben · 20 Minuten · Teil 4</Muted>
        <Teil4Prompt d={t.t4}>
          <WriteArea value={text} onChange={setText} />
          <WordCount text={text} />
          <FootActions>
            <Btn onPress={finishSchreiben}>Schreiben abgeben ✔</Btn>
          </FootActions>
        </Teil4Prompt>
        {abortDialog}
      </>
    )
  }

  if (phase === 'bewertung' && t) {
    return (
      <BewertungAI
        text={text}
        task={t.t4}
        onNext={(pts) => {
          setSchreibPts(pts)
          setPhase('intro-sprechen')
          window.scrollTo(0, 0)
        }}
      />
    )
  }

  if (phase === 'intro-sprechen') {
    const schriftlich = +(lesenPts + schreibPts).toFixed(1)
    return (
      <AppCard>
        <CardTitle>Test {(testIdx ?? 0) + 1} · Mündlicher Teil</CardTitle>
        <Text>
          Schriftlicher Teil fertig ✔ ({schriftlich} / 15 P) &nbsp;Jetzt folgen <Text fontWeight="$bold">3 Sprechaufgaben</Text> wie
          in der echten Prüfung: Kennenlernen, Fotobeschreibung und eine Situation (max. {SPEAKING_MAX_POINTS} Punkte).
          Du sprichst deine Antworten ins Mikrofon, die KI bewertet sie wie ein Prüfer.
        </Text>
        <Muted mt="$2">In der echten Prüfung dauert dieser Teil ca. 15 Minuten. Du brauchst ein Mikrofon.</Muted>
        <FootActions>
          <Btn variant="gold" onPress={() => setPhase('sprechen')}>Sprechen starten 🎤</Btn>
          <Btn variant="secondary" onPress={() => void finalize(schreibPts, null, [])}>
            Überspringen & Ergebnis (nur schriftlich)
          </Btn>
        </FootActions>
      </AppCard>
    )
  }

  if (phase === 'sprechen') {
    return (
      <>
        <ExamSpeaking
          testIdx={testIdx ?? 0}
          onDone={(pts, details) => void finalize(schreibPts, pts, details)}
        />
        {abortDialog}
      </>
    )
  }

  // done
  if (!t) return null
  const withSpeaking = sprechenPts !== null
  const schriftlich = +(lesenPts + schreibPts).toFixed(1)
  const total = withSpeaking ? +(schriftlich + (sprechenPts ?? 0)).toFixed(1) : schriftlich
  const max = withSpeaking ? 30 : 15
  const pass = withSpeaking
    ? total >= 18 && schriftlich >= 7.5 && (sprechenPts ?? 0) >= 7.5
    : schriftlich >= 7.5
  return (
    <>
      <AppCard>
        <CardTitle>🏁 Ergebnis – Test {(testIdx ?? 0) + 1}{withSpeaking ? '' : ' (schriftlicher Teil)'}</CardTitle>
        <HStack gap="$3" flexWrap="wrap" mb="$3.5">
          <ScoreBox n={lesenPts} label="Lesen / 9 P" />
          <ScoreBox n={schreibPts} label="Schreiben / 6 P*" />
          {withSpeaking && <ScoreBox n={sprechenPts ?? 0} label="Sprechen / 15 P*" />}
          <ScoreBox n={total} label={`Gesamt / ${max} P`} />
        </HStack>
        <Box bg={pass ? '$success50' : '$error50'} borderWidth="$1" borderColor={pass ? '$success300' : '$error300'} borderRadius="$lg" p="$3.5">
          <Text fontWeight="$bold" color={pass ? '$success800' : '$error800'} sx={{ textAlign: 'center' }}>
            {withSpeaking
              ? pass
                ? '✅ Bestanden-Niveau erreicht! Mindestens 18/30 gesamt und 7,5 in jedem Teil.'
                : '❌ Noch nicht bestanden: Du brauchst 18/30 gesamt und mindestens 7,5 Punkte in jedem Teil.'
              : pass
                ? '✅ Bestanden-Niveau erreicht! Du hast die nötigen 7,5 Punkte im schriftlichen Teil.'
                : '❌ Noch unter 7,5 Punkten – weiter üben, das wird!'}
          </Text>
        </Box>
        {withSpeaking && sprechenDetails.length > 0 && (
          <Box mt="$3.5">
            <Heading size="sm" mb="$1.5">🎤 Mündlicher Teil im Detail</Heading>
            <VStack>
              {sprechenDetails.map((d, i) => (
                <HStack key={i} gap="$2.5" alignItems="flex-start" borderTopWidth="$1" borderTopColor="$borderLight200" py="$2">
                  <Box bg="$primary50" borderRadius="$full" px="$2.5" py="$0.5">
                    <Text size="sm" fontWeight="$bold" color="$primary700">{d.points}/5</Text>
                  </Box>
                  <VStack flex={1}>
                    <Text size="sm" fontWeight="$semibold">{d.title}</Text>
                    <Muted>{d.feedback}</Muted>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}
        <Muted mt="$3">
          * Schreiben und Sprechen: KI-Bewertung als Orientierung - in der echten Prüfung bewerten menschliche Prüfer.
        </Muted>
        <FootActions>
          <Btn variant="secondary" onPress={() => setShowReview(true)}>Lösungen ansehen 🔍</Btn>
          <Btn variant="secondary" onPress={() => { clearLayers(); resetToPick() }}>Neuer Test</Btn>
        </FootActions>
      </AppCard>
      <StudyPlanCard lesenPts={lesenPts} schreibPts={schreibPts} sprechenDetails={sprechenDetails} />
      {showReview && (
        <>
          <Teil1 d={t.t1} ans={a1} onPick={() => {}} mode="review" />
          <Teil2 d={t.t2} ans={a2} onPick={() => {}} mode="review" />
          <Teil3 d={t.t3} ans={a3} onPick={() => {}} mode="review" />
        </>
      )}
    </>
  )
}

function WriteArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
      style={{
        width: '100%', minHeight: 240, border: '1.5px solid #DBDBDB', borderRadius: 10,
        padding: 14, fontSize: 15, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
      }}
    />
  )
}

/** Button auf dem Ergebnis-Bildschirm: erstellt aus den Prüfungsergebnissen (und, falls
    vorhanden, dem Feedback zum mündlichen Teil) einen kurzen persönlichen Lernplan mit
    2-4 Schwerpunkten und konkreten Übungen. */
function StudyPlanCard({
  lesenPts, schreibPts, sprechenDetails,
}: {
  lesenPts: number
  schreibPts: number
  sprechenDetails: SpeakingPartResult[]
}) {
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      setPlan(
        await generateStudyPlan({
          data: { lesenPts, lesenMax: 9, schreibPts, schreibMax: 6, sprechenDetails },
        })
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der Lernplan konnte nicht erstellt werden.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppCard>
      {!plan && (
        <>
          <CardTitle>📚 Was übe ich als Nächstes?</CardTitle>
          <Text>
            Die KI schaut sich dein Ergebnis an und erstellt einen kurzen Lernplan: die wichtigsten Schwerpunkte
            und konkrete Übungen dafür.
          </Text>
          <FootActions>
            <Btn variant="gold" onPress={run} disabled={loading}>
              {loading ? 'Lernplan wird erstellt …' : 'Lernplan erstellen 📚'}
            </Btn>
          </FootActions>
          {error && (
            <Text color="$error600" size="sm" mt="$2">⚠️ {error}</Text>
          )}
        </>
      )}

      {plan && (
        <>
          <CardTitle>📚 Dein Lernplan</CardTitle>
          <Text mb="$2">{plan.summary}</Text>
          <VStack>
            {plan.focusAreas.map((f, i) => (
              <Box key={i} borderTopWidth={i === 0 ? '$0' : '$1'} borderTopColor="$borderLight200" py="$3">
                <Text fontWeight="$bold" color="$primary700">{f.area}</Text>
                <Muted mt="$0.5">{f.diagnosis}</Muted>
                <VStack mt="$1.5">
                  {f.exercises.map((e, j) => (
                    <Text key={j} size="sm" pl="$5" mb="$0.5">
                      ✓ {e}
                    </Text>
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>
          <FootActions>
            <Btn variant="gold" onPress={() => { window.location.hash = '#/training' }}>
              🛠️ Jetzt gezielt üben
            </Btn>
          </FootActions>
          <Muted mt="$1.5">
            Im Trainingsbereich findest du passende Übungen zu Bildbeschreibung, Vor-/Nachteile abwägen,
            Präpositionen, Nebensätzen und Konnektoren.
          </Muted>
        </>
      )}
    </AppCard>
  )
}

/** Schreib-Bewertung im Prüfungsmodus: die KI vergibt die Punkte automatisch.
    Fällt die KI aus (kein Key, offline), gibt es die Selbstbewertung als Fallback. */
function BewertungAI({ text, task, onNext }: { text: string; task: Teil4Task; onNext: (pts: number) => void }) {
  const [result, setResult] = useState<WritingScore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const startedRef = useRef(false) // Schutz gegen doppelten Aufruf (React StrictMode)

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      setResult(await scoreWriting({ data: { task, text } }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die KI-Bewertung ist fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    if (text.trim().split(/\s+/).length >= 10) {
      void run()
    } else {
      setError('Zu wenig Text für eine KI-Bewertung (mindestens 10 Wörter).')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <TranslateZone>
      <AppCard>
        <CardTitle>Bewertung: dein Text</CardTitle>
        <Box bg="$backgroundLight50" borderWidth="$1" borderColor="$borderLight200" borderLeftWidth="$4" borderLeftColor="$primary600" borderRadius="$md" p="$4" mb="$2">
          <Text sx={{ whiteSpace: 'pre-line' }}>{text.trim() ? text : '(kein Text geschrieben)'}</Text>
        </Box>
        <Reveal label="💡 Musterlösung zum Vergleich">
          <Box bg="$backgroundLight50" borderRadius="$md" p="$3.5" mt="$2">
            <Text sx={{ whiteSpace: 'pre-line' }}>{task.model}</Text>
          </Box>
        </Reveal>

        {loading && (
          <HStack gap="$2.5" alignItems="center" mt="$3.5">
            <Spinner />
            <Text>🤖 Die KI bewertet deinen Text wie ein Prüfer …</Text>
          </HStack>
        )}

        {result && (
          <>
            <WritingScoreView d={task} result={result} />
            <FootActions>
              <Btn variant="gold" onPress={() => onNext(result.score)}>
                Weiter mit {result.score} / 6 Punkten ▶
              </Btn>
            </FootActions>
          </>
        )}

        {error && !loading && (
          <ManualFallback error={error} task={task} onRetry={run} onNext={onNext} />
        )}
      </AppCard>
    </TranslateZone>
  )
}

/** Fallback: Selbstbewertung per Checkliste, wenn die KI nicht verfügbar ist. */
function ManualFallback({ error, task, onRetry, onNext }: { error: string; task: Teil4Task; onRetry: () => void; onNext: (pts: number) => void }) {
  const labels = [
    ...task.points.map((p) => `Punkt „${p}“ behandelt`),
    'Anrede und Gruß vorhanden',
    'Gut verständlich, verbundene Sätze',
  ]
  const [checked, setChecked] = useState<boolean[]>(() => labels.map(() => false))
  return (
    <Box mt="$3">
      <Text color="$error600" size="sm">⚠️ {error}</Text>
      <FootActions>
        <Btn small onPress={onRetry}>KI-Bewertung nochmal versuchen</Btn>
      </FootActions>
      <Heading size="sm" mt="$3.5" mb="$1">Oder bewerte selbst (max. 6):</Heading>
      <VStack>
        {labels.map((l, i) => (
          <CheckRow key={i} checked={checked[i]} label={l} onToggle={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))} />
        ))}
      </VStack>
      <FootActions>
        <Btn variant="gold" onPress={() => onNext(checked.filter(Boolean).length)}>
          Weiter mit {checked.filter(Boolean).length} / 6 Punkten ▶
        </Btn>
      </FootActions>
    </Box>
  )
}