import { useState } from 'react'
import DATA from '../data/content'
import { Teil1, Teil2, Teil3, Teil4Prompt, WordCount, SelfAssess } from './Tasks'

const PARTS = [
  { n: 1, icon: '📋', title: 'Teil 1 · Anzeigen', sub: 'Die passende Anzeige finden' },
  { n: 2, icon: '📰', title: 'Teil 2 · Richtig / Falsch', sub: 'Zeitungsartikel mit 4 Aussagen' },
  { n: 3, icon: '🏷️', title: 'Teil 3 · Überschriften', sub: 'Die passende Überschrift wählen' },
  { n: 4, icon: '✍️', title: 'Teil 4 · Schreiben', sub: 'Nachricht schreiben, mit Musterlösung' },
]

export default function Practice() {
  const [part, setPart] = useState(null)
  const [idx, setIdx] = useState(null)

  if (part === null) {
    return (
      <>
        <h2 style={{ marginBottom: 4 }}>🎯 Übungsmodus</h2>
        <p className="mut" style={{ marginBottom: 16 }}>Wähle einen Aufgabentyp. Du bekommst sofort Feedback mit Erklärung.</p>
        <div className="grid">
          {PARTS.map((p) => (
            <div className="tile" key={p.n} onClick={() => setPart(p.n)}>
              <div className="big">{p.icon}</div>
              <h3>{p.title}</h3>
              <p className="mut">{DATA['teil' + p.n].length} Aufgaben · {p.sub}</p>
            </div>
          ))}
        </div>
      </>
    )
  }

  const pool = DATA['teil' + part]

  if (idx === null) {
    return (
      <>
        <button className="back" onClick={() => setPart(null)}>← zurück</button>
        <h2 style={{ marginBottom: 12 }}>Teil {part} – Aufgabe wählen</h2>
        <div className="grid">
          {pool.map((d, i) => (
            <div className="tile" key={i} onClick={() => setIdx(i)}>
              <h3>{d.set}</h3>
              <p className="mut">
                {part === 2 ? d.title : (d.situation || d.text).slice(0, 80) + '…'}
              </p>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <button className="back" onClick={() => setIdx(null)}>← andere Aufgabe wählen</button>
      <PracticeTask key={`${part}-${idx}`} part={part} d={pool[idx]} />
    </>
  )
}

function PracticeTask({ part, d }) {
  const [a1, setA1] = useState(undefined)
  const [a2, setA2] = useState([undefined, undefined, undefined, undefined])
  const [text, setText] = useState('')
  const [showCheck, setShowCheck] = useState(false)
  const [selfScore, setSelfScore] = useState(null)

  if (part === 1) return <Teil1 d={d} ans={a1} onPick={setA1} mode="practice" />
  if (part === 2) return <Teil2 d={d} ans={a2} onPick={(i, v) => setA2((a) => a.map((x, j) => (j === i ? v : x)))} mode="practice" />
  if (part === 3) return <Teil3 d={d} ans={a1} onPick={setA1} mode="practice" />

  return (
    <Teil4Prompt d={d}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Schreiben Sie hier Ihre Nachricht …" />
      <WordCount text={text} />
      <div className="foot-actions">
        <button className="btn" onClick={() => setShowCheck(true)}>Selbst prüfen</button>
      </div>
      {showCheck && <SelfAssess d={d} onDone={setSelfScore} />}
      {selfScore !== null && (
        <p style={{ fontWeight: 700, marginTop: 10 }}>
          Deine Selbstbewertung: <span style={{ color: 'var(--blue)', fontSize: 20 }}>{selfScore} / 6 Punkten</span> {selfScore >= 3 ? '👍' : '– weiter üben!'}
        </p>
      )}
      <details>
        <summary>💡 Musterlösung anzeigen</summary>
        <div className="model">{d.model}</div>
      </details>
    </Teil4Prompt>
  )
}
