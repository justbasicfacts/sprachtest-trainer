import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, seedVocab } from './db'
import Practice from './components/Practice'
import Exam from './components/Exam'
import Speak from './components/Speak'
import Vocab from './components/Vocab'

const TABS = [
  { id: 'home', label: 'Start' },
  { id: 'practice', label: 'Üben' },
  { id: 'exam', label: 'Prüfung' },
  { id: 'speak', label: 'Sprechen' },
  { id: 'vocab', label: 'Vokabeln' },
]

export default function App() {
  const [view, setView] = useState('home')
  const [examActive, setExamActive] = useState(false)

  useEffect(() => { seedVocab() }, [])

  const nav = (v) => {
    if (examActive && !confirm('Prüfung abbrechen? Der Fortschritt geht verloren.')) return
    setExamActive(false)
    setView(v)
    window.scrollTo(0, 0)
  }

  return (
    <>
      <header>
        <span className="bear">🐻</span>
        <h1>
          Berliner Sprachtest für die Einbürgerung
          <small>B1-Trainer · Lesen · Schreiben · Sprechen · Vokabeln</small>
        </h1>
      </header>
      <nav>
        {TABS.map((t) => (
          <button key={t.id} className={view === t.id ? 'active' : ''} onClick={() => nav(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      <main>
        {view === 'home' && <Home go={nav} />}
        {view === 'practice' && <Practice />}
        {view === 'exam' && <Exam setExamActive={setExamActive} />}
        {view === 'speak' && <Speak />}
        {view === 'vocab' && <Vocab />}
      </main>
    </>
  )
}

function Home({ go }) {
  const hist = useLiveQuery(() => db.results.orderBy('id').reverse().limit(6).toArray(), [], [])
  const dueCount = useLiveQuery(() => db.vocab.where('due').belowOrEqual(Date.now()).count(), [], 0)

  return (
    <>
      <div className="card">
        <h2>Willkommen! 🇩🇪</h2>
        <p>
          Diese App bereitet dich auf den <b>Berliner Sprachtest für die Einbürgerung</b> (Niveau B1) vor –
          mit dem originalen Modelltest der Berliner Volkshochschulen, zusätzlichen Übungssätzen im gleichen
          Format und einem Vokabeltrainer.
        </p>
      </div>
      <div className="card">
        <h2>ℹ️ So funktioniert die Prüfung</h2>
        <p>
          <b>Schriftlicher Teil (15 P):</b> Lesen 30 Min. (Teil 1–3, 9 P) + Schreiben 20 Min. (Teil 4, 6 P)<br />
          <b>Mündlicher Teil (15 P):</b> Sprechen 15 Min. (Teil 5–7)
        </p>
        <p style={{ marginTop: 8 }}>
          <b>Bestanden:</b> insgesamt mindestens <b>18 von 30 Punkten (60 %)</b> – und in <u>jedem</u> Teil
          (schriftlich und mündlich) mindestens <b>7,5 von 15 Punkten (50 %)</b>.
        </p>
      </div>
      <div className="grid">
        <div className="tile" onClick={() => go('practice')}><div className="big">🎯</div><h3>Üben</h3><p className="mut">Alle Aufgaben ohne Zeitdruck, mit sofortigem Feedback und Erklärungen.</p></div>
        <div className="tile" onClick={() => go('exam')}><div className="big">⏱️</div><h3>Prüfungssimulation</h3><p className="mut">Kompletter schriftlicher Test mit echter Zeit: 30 Min. Lesen + 20 Min. Schreiben.</p></div>
        <div className="tile" onClick={() => go('speak')}><div className="big">🗣️</div><h3>Sprechen</h3><p className="mut">Kennenlernen-Fragen, Fotobeschreibung mit Originalfotos und Situationen mit Pro & Contra.</p></div>
        <div className="tile" onClick={() => go('vocab')}><div className="big">📚</div><h3>Vokabeln</h3><p className="mut">{dueCount > 0 ? <><b>{dueCount} Wörter fällig</b> – jetzt wiederholen!</> : 'B1-Wortschatz mit Spaced Repetition.'}</p></div>
      </div>
      {hist.length > 0 && (
        <div className="card">
          <h2>📈 Deine letzten Prüfungen</h2>
          {hist.map((r) => (
            <div className="hist-row" key={r.id}>
              <span>{r.date} · {r.test}</span>
              <b style={{ color: r.total >= 7.5 ? 'var(--ok)' : 'var(--err)' }}>{r.total} / 15 P</b>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
