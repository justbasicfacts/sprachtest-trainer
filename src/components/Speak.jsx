import { useState } from 'react'
import DATA from '../data/content'

const FOTO_BASE = import.meta.env.BASE_URL + 'fotos/'

export default function Speak() {
  const [sub, setSub] = useState(null)

  if (sub === null) {
    return (
      <>
        <h2 style={{ marginBottom: 4 }}>🗣️ Mündlicher Teil (15 Minuten · 15 Punkte)</h2>
        <p className="mut" style={{ marginBottom: 16 }}>Übe laut! Sprich deine Antworten aus, bevor du die Musterlösungen liest.</p>
        <div className="grid">
          <div className="tile" onClick={() => setSub('t5')}><div className="big">👋</div><h3>Teil 5 · Kennenlernen</h3><p className="mut">{DATA.teil5.length} typische Fragen als Karten – mit Musterantworten (ca. 3 Min.)</p></div>
          <div className="tile" onClick={() => setSub('t6')}><div className="big">📷</div><h3>Teil 6 · Über ein Foto sprechen</h3><p className="mut">Die 3 Originalfotos aus dem Modelltest (ca. 6 Min.)</p></div>
          <div className="tile" onClick={() => setSub('t7')}><div className="big">⚖️</div><h3>Teil 7 · Eine Situation besprechen</h3><p className="mut">{DATA.teil7.length} Situationen mit Vorteilen & Nachteilen (ca. 6 Min.)</p></div>
          <div className="tile" onClick={() => setSub('rm')}><div className="big">💬</div><h3>Redemittel</h3><p className="mut">Nützliche Sätze für Foto, Meinung und Nachricht</p></div>
        </div>
      </>
    )
  }

  const back = <button className="back" onClick={() => setSub(null)}>← zurück</button>

  if (sub === 't5') return <>{back}<Flashcards /></>

  if (sub === 't6') {
    return (
      <>
        {back}
        <div className="pill-info">Teil 6 · Über ein Foto sprechen · In der Prüfung wählst du 1 von 3 Fotos</div>
        {DATA.teil6.map((f) => (
          <div className="card" key={f.title}>
            <h3>{f.title}</h3>
            <img className="photo" src={FOTO_BASE + f.img} alt={f.title} />
            <p className="mut" style={{ marginBottom: 6 }}>Sprich 2–3 Minuten. Diese Stichworte helfen:</p>
            {f.hints.map((h) => <span className="chip" key={h}>{h}</span>)}
            <details style={{ marginTop: 12 }}>
              <summary>💡 Musterbeschreibung anzeigen</summary>
              <div className="model">{f.model}</div>
            </details>
          </div>
        ))}
        <div className="card">
          <h3>So beschreibst du jedes Foto (4 Schritte)</h3>
          <p>1️⃣ <b>Was sehe ich?</b> Personen, Ort, Gegenstände<br />
            2️⃣ <b>Was passiert?</b> Was machen die Personen gerade?<br />
            3️⃣ <b>Was vermute ich?</b> „Ich denke, dass …“, „Wahrscheinlich …“<br />
            4️⃣ <b>Mein Bezug:</b> eigene Erfahrung oder Meinung dazu</p>
        </div>
      </>
    )
  }

  if (sub === 't7') {
    return (
      <>
        {back}
        <div className="pill-info">Teil 7 · Eine Situation besprechen · Sprich mit dem Prüfer über Vorteile und Nachteile</div>
        {DATA.teil7.map((s) => (
          <div className="card" key={s.set}>
            <span className="tag">{s.set}</span>
            <div className="situation">{s.situation}</div>
            <p className="mut">Überlege zuerst selbst 2 Vorteile und 2 Nachteile – dann vergleiche:</p>
            <details>
              <summary>Vorteile & Nachteile anzeigen</summary>
              <div className="twocol" style={{ marginTop: 10 }}>
                <div><h3 style={{ color: 'var(--ok)' }}>Vorteile</h3><ul className="clean">{s.pro.map((p) => <li key={p}>{p}</li>)}</ul></div>
                <div><h3 style={{ color: 'var(--err)' }}>Nachteile</h3><ul className="clean contra">{s.contra.map((c) => <li key={c}>{c}</li>)}</ul></div>
              </div>
            </details>
          </div>
        ))}
        <div className="card"><h3>Tipp für Teil 7</h3><p>Nimm am Ende <b>selbst Stellung</b>: „Für mich überwiegen die Vorteile, weil …“ – die Prüfer möchten sehen, dass du deine Meinung begründen kannst.</p></div>
      </>
    )
  }

  // Redemittel
  const r = DATA.redemittel
  const Block = ({ title, arr }) => (
    <div className="card"><h3>{title}</h3>{arr.map((x) => <span className="chip" key={x}>{x}</span>)}</div>
  )
  return (
    <>
      {back}
      <Block title="📷 Über ein Foto sprechen (Teil 6)" arr={r.foto} />
      <Block title="⚖️ Meinung sagen & diskutieren (Teil 7)" arr={r.meinung} />
      <Block title="✍️ Eine Nachricht schreiben (Teil 4)" arr={r.brief} />
    </>
  )
}

function Flashcards() {
  const [idx, setIdx] = useState(0)
  const [show, setShow] = useState(false)
  const f = DATA.teil5[idx]
  return (
    <>
      <div className="pill-info">Teil 5 · Kennenlernen · Frage {idx + 1} / {DATA.teil5.length}</div>
      <div className="progress"><div style={{ width: `${((idx + 1) / DATA.teil5.length) * 100}%` }} /></div>
      <div className="flash">
        <div className="q">„{f.q}“</div>
        <p className="mut">Antworte zuerst laut in 2–3 Sätzen …</p>
        {show && <div className="a" style={{ display: 'block' }}>{f.a}</div>}
        <div className="foot-actions" style={{ justifyContent: 'center' }}>
          <button className="btn sec" onClick={() => setShow(true)}>Musterantwort 💡</button>
          <button className="btn" onClick={() => { setIdx((idx + 1) % DATA.teil5.length); setShow(false) }}>Nächste Frage →</button>
        </div>
      </div>
      <p className="mut">Tipp: Antworte nie nur mit „Ja“ oder „Nein“ – gib immer ein Beispiel oder einen Grund (…, weil …). Du darfst auch selbst Fragen stellen!</p>
    </>
  )
}
