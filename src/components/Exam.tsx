import { useEffect, useRef, useState } from 'react'
import { DATA } from '../data/content'
import { db } from '../db'
import { Teil1, Teil2, Teil3, Teil4Prompt, WordCount, scoreLesen, CheckRow } from './Tasks'
import { TranslateZone } from './useWordTranslate'
import { AiWritingScore } from './AiScore'
import type { Teil4Task } from '../data/types'
import {
  Box, HStack, VStack, Text, Heading,
  AppCard, CardTitle, Muted, Tile, TileGrid, TileEmoji, TileTitle, Btn, FootActions, ScoreBox, Reveal,
} from './ui/kit'

type Phase = 'pick' | 'intro-lesen' | 'lesen' | 'intro-schreiben' | 'schreiben' | 'bewertung' | 'done'

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

const ICONS = ['📘', '📗', '📙', '📕', '📔', '📒', '📓', '📚']

export default function Exam({ setExamActive }: { setExamActive: (active: boolean) => void }) {
  const [testIdx, setTestIdx] = useState<number | null>(null)
  // phases: intro-lesen, lesen, intro-schreiben, schreiben, bewertung, done
  const [phase, setPhase] = useState<Phase>('pick')
  const [a1, setA1] = useState<number | undefined>(undefined)
  const [a2, setA2] = useState<(number | undefined)[]>([undefined, undefined, undefined, undefined])
  const [a3, setA3] = useState<number | undefined>(undefined)
  const [text, setText] = useState('')
  const [lesenPts, setLesenPts] = useState(0)
  const [schreibPts, setSchreibPts] = useState(0)
  const [showReview, setShowReview] = useState(false)

  const running = phase === 'lesen' || phase === 'schreiben'
  useEffect(() => { setExamActive(running) }, [running, setExamActive])

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

  const lesenSec = useCountdown(30, phase === 'lesen', () => { alert('⏰ Die Zeit für den Leseteil ist um!'); finishLesenRef.current() })
  const schreibSec = useCountdown(20, phase === 'schreiben', () => { alert('⏰ Die Zeit für den Schreibteil ist um!'); finishSchreiben() })
  const finishLesenRef = useRef(finishLesen)
  finishLesenRef.current = finishLesen

  if (phase === 'pick') {
    return (
      <>
        <Heading size="xl" color="$primary600" mb="$1">⏱️ Prüfungssimulation – schriftlicher Teil</Heading>
        <Muted>Wie in der echten Prüfung: erst 30 Minuten Lesen (Teil 1–3), dann 20 Minuten Schreiben (Teil 4). Feedback gibt es erst am Ende.</Muted>
        <Box mt="$4">
          <TileGrid>
            {DATA.teil1.map((_, i) => (
              <Tile key={i} onPress={() => { setTestIdx(i); setPhase('intro-lesen') }}>
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
      </>
    )
  }

  if (phase === 'bewertung' && t) {
    const labels = [
      ...t.t4.points.map((p) => `Punkt „${p}“ behandelt`),
      'Anrede und Gruß vorhanden',
      'Gut verständlich, verbundene Sätze',
    ]
    return (
      <Bewertung
        text={text}
        task={t.t4}
        model={t.t4.model}
        labels={labels}
        onFinish={async (n) => {
          setSchreibPts(n)
          await db.results.add({
            date: new Date().toLocaleDateString('de-DE'),
            test: 'Test ' + ((testIdx ?? 0) + 1),
            lesen: lesenPts, schreiben: n,
            total: +(lesenPts + n).toFixed(1),
            ts: Date.now(),
          })
          setPhase('done')
          window.scrollTo(0, 0)
        }}
      />
    )
  }

  // done
  if (!t) return null
  const total = +(lesenPts + schreibPts).toFixed(1)
  const pass = total >= 7.5
  return (
    <>
      <AppCard>
        <CardTitle>🏁 Ergebnis – Test {(testIdx ?? 0) + 1} (schriftlicher Teil)</CardTitle>
        <HStack gap="$3" flexWrap="wrap" mb="$3.5">
          <ScoreBox n={lesenPts} label="Lesen / 9 P" />
          <ScoreBox n={schreibPts} label="Schreiben / 6 P*" />
          <ScoreBox n={total} label="Gesamt / 15 P" />
        </HStack>
        <Box bg={pass ? '$success50' : '$error50'} borderWidth="$1" borderColor={pass ? '$success300' : '$error300'} borderRadius="$lg" p="$3.5">
          <Text fontWeight="$bold" color={pass ? '$success800' : '$error800'} sx={{ textAlign: 'center' }}>
            {pass ? '✅ Bestanden-Niveau erreicht! Du hast die nötigen 7,5 Punkte im schriftlichen Teil.'
                  : '❌ Noch unter 7,5 Punkten – weiter üben, das wird!'}
          </Text>
        </Box>
        <Muted mt="$3">
          * Schreiben = Selbstbewertung. In der echten Prüfung brauchst du außerdem mindestens 7,5 / 15 P im mündlichen Teil und insgesamt 18 / 30 P.
        </Muted>
        <FootActions>
          <Btn variant="secondary" onPress={() => setShowReview(true)}>Lösungen ansehen 🔍</Btn>
          <Btn variant="secondary" onPress={() => {
            setPhase('pick'); setTestIdx(null); setA1(undefined); setA2([undefined, undefined, undefined, undefined]); setA3(undefined); setText(''); setShowReview(false)
          }}>Neuer Test</Btn>
        </FootActions>
      </AppCard>
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

function Bewertung({
  text, task, model, labels, onFinish,
}: {
  text: string
  task: Teil4Task
  model: string
  labels: string[]
  onFinish: (n: number) => void
}) {
  const [checked, setChecked] = useState<boolean[]>(() => labels.map(() => false))
  return (
    <TranslateZone>
      <AppCard>
        <CardTitle>Selbstbewertung: dein Text</CardTitle>
        <Box bg="$backgroundLight50" borderWidth="$1" borderColor="$borderLight200" borderLeftWidth="$4" borderLeftColor="$primary600" borderRadius="$md" p="$4" mb="$2">
          <Text sx={{ whiteSpace: 'pre-line' }}>{text.trim() ? text : '(kein Text geschrieben)'}</Text>
        </Box>
        <Reveal label="💡 Musterlösung zum Vergleich">
          <Box bg="$backgroundLight50" borderRadius="$md" p="$3.5" mt="$2">
            <Text sx={{ whiteSpace: 'pre-line' }}>{model}</Text>
          </Box>
        </Reveal>
        <AiWritingScore d={task} text={text} />
        <Heading size="sm" mt="$3.5" mb="$1">Vergib deine Punkte (max. 6):</Heading>
        <VStack>
          {labels.map((l, i) => (
            <CheckRow key={i} checked={checked[i]} label={l} onToggle={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))} />
          ))}
        </VStack>
        <FootActions>
          <Btn variant="gold" onPress={() => onFinish(checked.filter(Boolean).length)}>Ergebnis anzeigen 🏁</Btn>
        </FootActions>
      </AppCard>
    </TranslateZone>
  )
}
