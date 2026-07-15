import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, nextReview } from '../db'
import { VOCAB_TAGS } from '../data/vocab'

export default function Vocab() {
  const [tab, setTab] = useState('lernen')
  return (
    <>
      <h2 style={{ marginBottom: 4 }}>📚 Vokabeltrainer</h2>
      <p className="mut" style={{ marginBottom: 14 }}>
        Prüfungsrelevante B1-Wörter mit Beispielsätzen – gespeichert in einer Datenbank in deinem Browser (IndexedDB), mit Wiederholung im richtigen Abstand (Spaced Repetition).
      </p>
      <div className="vtabs">
        <button className={tab === 'lernen' ? 'active' : ''} onClick={() => setTab('lernen')}>🃏 Lernen</button>
        <button className={tab === 'liste' ? 'active' : ''} onClick={() => setTab('liste')}>📖 Wörter</button>
        <button className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')}>📊 Statistik</button>
      </div>
      {tab === 'lernen' && <Learn />}
      {tab === 'liste' && <WordList />}
      {tab === 'stats' && <Stats />}
    </>
  )
}

/* ---------- Lernen (Flashcards + SRS) ---------- */
function Learn() {
  const due = useLiveQuery(
    () => db.vocab.where('due').belowOrEqual(Date.now()).limit(20).toArray(),
    [], null
  )
  const [flipped, setFlipped] = useState(false)

  if (due === null) return <p className="mut">Lade …</p>
  if (due.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h3>🎉 Alles gelernt!</h3>
        <p className="mut">Im Moment sind keine Wörter fällig. Schau später wieder vorbei – die Wiederholungen kommen automatisch zurück.</p>
      </div>
    )
  }

  const w = due[0]
  const grade = async (g) => {
    await db.vocab.update(w.id, nextReview(w, g))
    setFlipped(false)
  }

  return (
    <>
      <div className="duebanner">📌 Noch <b>{due.length}{due.length === 20 ? '+' : ''}</b> Wörter fällig</div>
      <div className="vcard">
        <span className="badge">{w.tag}</span>
        <div className="de" style={{ marginTop: 8 }}>{w.de}</div>
        <div className="ex">„{w.ex}“</div>
        {!flipped ? (
          <div className="gradebtns">
            <button className="btn" onClick={() => setFlipped(true)}>Umdrehen 🔄</button>
          </div>
        ) : (
          <>
            <div className="back-side">
              <div className="tr-row"><span className="lang">EN</span> {w.en}</div>
              <div className="tr-row"><span className="lang">TR</span> {w.tr}</div>
            </div>
            <div className="gradebtns">
              <button className="btn again" onClick={() => grade(0)}>Nochmal<small>in 10 Min.</small></button>
              <button className="btn good" onClick={() => grade(1)}>Gut<small>{w.reps === 0 ? 'in 1 Tag' : `in ${Math.ceil((w.interval || 1) * 2.2)} Tagen`}</small></button>
              <button className="btn easy" onClick={() => grade(2)}>Leicht<small>{w.reps === 0 ? 'in 3 Tagen' : `in ${Math.min((w.interval || 1) * 3, 180)} Tagen`}</small></button>
            </div>
          </>
        )}
      </div>
      <p className="mut">Tipp: Sag das Wort und den Beispielsatz laut, bevor du umdrehst.</p>
    </>
  )
}

/* ---------- Wörterliste + eigene Wörter ---------- */
function WordList() {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [showForm, setShowForm] = useState(false)

  const words = useLiveQuery(async () => {
    let coll = tag ? db.vocab.where('tag').equals(tag) : db.vocab
    let arr = await (coll.toArray ? coll.toArray() : coll)
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      arr = arr.filter((w) => (w.de + ' ' + w.en + ' ' + w.tr).toLowerCase().includes(s))
    }
    return arr.sort((a, b) => a.de.localeCompare(b.de, 'de'))
  }, [q, tag], null)

  return (
    <>
      <div className="searchbar">
        <input placeholder="Suchen (deutsch, englisch, türkisch) …" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">Alle Themen</option>
          {VOCAB_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="btn small gold" onClick={() => setShowForm((v) => !v)}>+ Eigenes Wort</button>
      </div>

      {showForm && <AddWord onDone={() => setShowForm(false)} />}

      {words === null ? <p className="mut">Lade …</p> : (
        <div className="card">
          <p className="mut" style={{ marginBottom: 6 }}>{words.length} Wörter</p>
          {words.map((w) => (
            <div className="wordrow" key={w.id}>
              <div className="w">
                <b>{w.de}</b> <span className="badge">{w.tag}</span>{w.custom ? <span className="badge" style={{ marginLeft: 4 }}>eigenes</span> : null}
                <div className="tl">EN: {w.en} · TR: {w.tr}</div>
                <div className="tl" style={{ fontStyle: 'italic' }}>„{w.ex}“</div>
              </div>
              {w.custom ? (
                <button className="del" title="Löschen" onClick={() => db.vocab.delete(w.id)}>🗑</button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function AddWord({ onDone }) {
  const [f, setF] = useState({ de: '', en: '', tr: '', ex: '', tag: 'Eigene' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const save = async (e) => {
    e.preventDefault()
    if (!f.de.trim()) return
    await db.vocab.add({ ...f, custom: 1, due: Date.now(), interval: 0, reps: 0 })
    onDone()
  }
  return (
    <div className="card">
      <h3>Eigenes Wort hinzufügen</h3>
      <form className="addword" onSubmit={save}>
        <input className="full" placeholder="Deutsch, z. B. die Erfahrung, -en *" value={f.de} onChange={set('de')} required />
        <input placeholder="Englisch" value={f.en} onChange={set('en')} />
        <input placeholder="Türkisch" value={f.tr} onChange={set('tr')} />
        <input className="full" placeholder="Beispielsatz" value={f.ex} onChange={set('ex')} />
        <select value={f.tag} onChange={set('tag')}>
          {VOCAB_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="btn" type="submit">Speichern</button>
      </form>
    </div>
  )
}

/* ---------- Statistik ---------- */
function Stats() {
  const stats = useLiveQuery(async () => {
    const all = await db.vocab.toArray()
    const now = Date.now()
    return {
      total: all.length,
      due: all.filter((w) => w.due <= now).length,
      started: all.filter((w) => w.reps > 0).length,
      mature: all.filter((w) => (w.interval || 0) >= 21).length,
      custom: all.filter((w) => w.custom).length,
    }
  }, [], null)
  const results = useLiveQuery(() => db.results.orderBy('id').reverse().limit(8).toArray(), [], [])

  if (stats === null) return <p className="mut">Lade …</p>
  const Box = ({ n, label }) => (
    <div className="scorebox"><div className="num">{n}</div><div className="mut">{label}</div></div>
  )
  return (
    <>
      <div className="card">
        <h3>Vokabeln</h3>
        <div className="scorebar">
          <Box n={stats.total} label="Wörter gesamt" />
          <Box n={stats.due} label="jetzt fällig" />
          <Box n={stats.started} label="in Wiederholung" />
          <Box n={stats.mature} label="langfristig gelernt" />
          <Box n={stats.custom} label="eigene Wörter" />
        </div>
      </div>
      <div className="card">
        <h3>Prüfungsergebnisse</h3>
        {results.length === 0 ? <p className="mut">Noch keine Prüfungssimulation abgeschlossen.</p> :
          results.map((r) => (
            <div className="hist-row" key={r.id}>
              <span>{r.date} · {r.test}</span>
              <b style={{ color: r.total >= 7.5 ? 'var(--ok)' : 'var(--err)' }}>{r.total} / 15 P</b>
            </div>
          ))}
      </div>
    </>
  )
}
