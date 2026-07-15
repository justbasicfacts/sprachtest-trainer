import { useEffect, useRef, useState } from 'react'
import DATA from '../data/content'
import { db } from '../db'
import { Teil1, Teil2, Teil3, Teil4Prompt, WordCount, scoreLesen } from './Tasks'

function useCountdown(minutes, active, onExpire) {
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

function Timer({ sec }) {
  const m = Math.floor(sec / 60), s = sec % 60
  return (
    <div id="timerBox" className={sec <= 300 ? 'warn' : ''} style={{ display: 'block' }}>
      {m}:{String(s).padStart(2, '0')}
    </div>
  )
}

const ICONS = ['📘', '📗', '📙', '📕']

export default function Exam({ setExamActive }) {
  const [testIdx, setTestIdx] = useState(null)
  // phases: intro-lesen, lesen, intro-schreiben, schreiben, bewertung, done
  const [phase, setPhase] = useState('pick')
  const [a1, setA1] = useState(undefined)
  const [a2, setA2] = useState([undefined, undefined, undefined, undefined])
  const [a3, setA3] = useState(undefined)
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
        <h2 style={{ marginBottom: 4 }}>⏱️ Prüfungssimulation – schriftlicher Teil</h2>
        <p className="mut" style={{ marginBottom: 16 }}>
          Wie in der echten Prüfung: erst 30 Minuten Lesen (Teil 1–3), dann 20 Minuten Schreiben (Teil 4). Feedback gibt es erst am Ende.
        </p>
        <div className="grid">
          {DATA.teil1.map((_, i) => (
            <div className="tile" key={i} onClick={() => { setTestIdx(i); setPhase('intro-lesen') }}>
              <div className="big">{ICONS[i]}</div>
              <h3>Test {i + 1}</h3>
              <p className="mut">{i === 0 ? 'Der originale Modelltest' : 'Zusätzlicher Übungstest im Originalformat'}</p>
            </div>
          ))}
        </div>
      </>
    )
  }

  if (phase === 'intro-lesen') {
    return (
      <div className="card">
        <h2>Test {testIdx + 1} · Lesen</h2>
        <p>Du hast <b>30 Minuten</b> für Teil 1–3 (max. 9 Punkte). Der Timer startet, wenn du klickst.</p>
        <div className="foot-actions"><button className="btn gold" onClick={() => setPhase('lesen')}>Lesen starten ▶</button></div>
      </div>
    )
  }

  if (phase === 'lesen') {
    return (
      <>
        <Timer sec={lesenSec} />
        <div className="pill-info">Test {testIdx + 1} · Lesen · 30 Minuten · Teil 1–3</div>
        <Teil1 d={t.t1} ans={a1} onPick={setA1} mode="exam" />
        <Teil2 d={t.t2} ans={a2} onPick={(i, v) => setA2((a) => a.map((x, j) => (j === i ? v : x)))} mode="exam" />
        <Teil3 d={t.t3} ans={a3} onPick={setA3} mode="exam" />
        <div className="foot-actions"><button className="btn" onClick={finishLesen}>Lesen abgeben ✔</button></div>
      </>
    )
  }

  if (phase === 'intro-schreiben') {
    return (
      <div className="card">
        <h2>Test {testIdx + 1} · Schreiben</h2>
        <p>Leseteil abgegeben ✔ &nbsp;Jetzt hast du <b>20 Minuten</b> für die Nachricht (max. 6 Punkte).</p>
        <div className="foot-actions"><button className="btn gold" onClick={() => setPhase('schreiben')}>Schreiben starten ▶</button></div>
      </div>
    )
  }

  if (phase === 'schreiben') {
    return (
      <>
        <Timer sec={schreibSec} />
        <div className="pill-info">Test {testIdx + 1} · Schreiben · 20 Minuten · Teil 4</div>
        <Teil4Prompt d={t.t4}>
          <textarea value={text} onChange={(e) => setText(e.target.value)} autoFocus />
          <WordCount text={text} />
          <div className="foot-actions"><button className="btn" onClick={finishSchreiben}>Schreiben abgeben ✔</button></div>
        </Teil4Prompt>
      </>
    )
  }

  if (phase === 'bewertung') {
    const labels = [
      ...t.t4.points.map((p) => `Punkt „${p}“ behandelt`),
      'Anrede und Gruß vorhanden',
      'Gut verständlich, verbundene Sätze',
    ]
    return (
      <div className="card">
        <h2>Selbstbewertung: dein Text</h2>
        <div className="reading">{text.trim() ? text : '(kein Text geschrieben)'}</div>
        <details><summary>💡 Musterlösung zum Vergleich</summary><div className="model">{t.t4.model}</div></details>
        <h3 style={{ marginTop: 14 }}>Vergib deine Punkte (max. 6):</h3>
        {labels.map((l, i) => (
          <div className="checkrow" key={i}><input type="checkbox" className="ck" /><div>{l} <b>(1 P)</b></div></div>
        ))}
        <div className="foot-actions">
          <button className="btn gold" onClick={async () => {
            const n = document.querySelectorAll('.ck:checked').length
            setSchreibPts(n)
            await db.results.add({
              date: new Date().toLocaleDateString('de-DE'),
              test: 'Test ' + (testIdx + 1),
              lesen: lesenPts, schreiben: n,
              total: +(lesenPts + n).toFixed(1),
              ts: Date.now(),
            })
            setPhase('done')
            window.scrollTo(0, 0)
          }}>Ergebnis anzeigen 🏁</button>
        </div>
      </div>
    )
  }

  // done
  const total = +(lesenPts + schreibPts).toFixed(1)
  const pass = total >= 7.5
  return (
    <>
      <div className="card">
        <h2>🏁 Ergebnis – Test {testIdx + 1} (schriftlicher Teil)</h2>
        <div className="scorebar">
          <div className="scorebox"><div className="num">{lesenPts}</div><div className="mut">Lesen / 9 P</div></div>
          <div className="scorebox"><div className="num">{schreibPts}</div><div className="mut">Schreiben / 6 P*</div></div>
          <div className="scorebox"><div className="num">{total}</div><div className="mut">Gesamt / 15 P</div></div>
        </div>
        <div className={'pass ' + (pass ? 'yes' : 'no')}>
          {pass ? '✅ Bestanden-Niveau erreicht! Du hast die nötigen 7,5 Punkte im schriftlichen Teil.'
                : '❌ Noch unter 7,5 Punkten – weiter üben, das wird!'}
        </div>
        <p className="mut">* Schreiben = Selbstbewertung. In der echten Prüfung brauchst du außerdem mindestens 7,5 / 15 P im mündlichen Teil und insgesamt 18 / 30 P.</p>
        <div className="foot-actions">
          <button className="btn" onClick={() => setShowReview(true)}>Lösungen ansehen 🔍</button>
          <button className="btn sec" onClick={() => {
            setPhase('pick'); setTestIdx(null); setA1(undefined); setA2([undefined, undefined, undefined, undefined]); setA3(undefined); setText(''); setShowReview(false)
          }}>Neuer Test</button>
        </div>
      </div>
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
