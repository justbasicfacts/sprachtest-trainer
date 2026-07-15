/* Wiederverwendbare Aufgaben-Komponenten für Teil 1–4.
   mode: 'practice' => sofortiges Feedback, 'exam' => keine Auflösung, 'review' => alles aufgelöst */

function Feedback({ ok, unanswered, text }) {
  return (
    <div className={'feedback ' + (ok ? 'ok' : 'err')}>
      {unanswered ? <>⚪ <b>Nicht beantwortet.</b> </> : ok ? <>✅ <b>Richtig!</b> </> : <>❌ <b>Leider falsch.</b> </>}
      {text}
    </div>
  )
}

export function Teil1({ d, ans, onPick, mode }) {
  const revealed = mode === 'review' || (mode === 'practice' && ans !== undefined)
  return (
    <div className="qcard">
      <span className="tag">Teil 1 · Die passende Anzeige ankreuzen · 2,5 Punkte</span>
      <p className="mut">Welche Anzeige passt zu dieser Situation? Es gibt nur <u>eine</u> Lösung.</p>
      <div className="situation">{d.situation}</div>
      {d.ads.map((ad, i) => {
        let cls = 'ad'
        if (revealed) {
          if (i === d.correct) cls += ' correct'
          else if (i === ans) cls += ' wrong'
        } else if (i === ans) cls += ' sel'
        return (
          <div key={i} className={cls} style={revealed ? { pointerEvents: 'none' } : null}
            onClick={() => !revealed && onPick(i)}>
            <div className="letter">{'abc'[i]}</div>
            <div>
              <div className="h">{ad.head}</div>
              <div>{ad.body}</div>
              <div className="f">{ad.foot}</div>
            </div>
          </div>
        )
      })}
      {revealed && <Feedback ok={ans === d.correct} unanswered={ans === undefined} text={d.expl} />}
    </div>
  )
}

export function Teil2({ d, ans, onPick, mode }) {
  // ans: array of 0/1/undefined per statement
  return (
    <div className="qcard">
      <span className="tag">Teil 2 · Richtig oder falsch ankreuzen · 4 Punkte</span>
      <p className="mut">Lesen Sie den Zeitungsartikel. Kreuzen Sie an: richtig oder falsch.</p>
      <div className="reading"><b>{d.title}</b>{d.text}</div>
      {d.items.map((it, i) => {
        const given = ans[i]
        const corr = it.a ? 1 : 0
        const revealed = mode === 'review' || (mode === 'practice' && given !== undefined)
        const btnCls = (v) => {
          let c = 'rfbtn'
          if (revealed) {
            if (v === corr) c += ' correct'
            else if (v === given) c += ' wrong'
          } else if (v === given) c += ' sel'
          return c
        }
        return (
          <div key={i}>
            <div className="rfrow">
              <div className="st"><b>{'abcd'[i]}</b>&nbsp; {it.s}</div>
              <button className={btnCls(1)} disabled={revealed} onClick={() => onPick(i, 1)}>richtig</button>
              <button className={btnCls(0)} disabled={revealed} onClick={() => onPick(i, 0)}>falsch</button>
            </div>
            {revealed && <Feedback ok={given === corr} unanswered={given === undefined} text={it.e} />}
          </div>
        )
      })}
    </div>
  )
}

export function Teil3({ d, ans, onPick, mode }) {
  const revealed = mode === 'review' || (mode === 'practice' && ans !== undefined)
  return (
    <div className="qcard">
      <span className="tag">Teil 3 · Die passende Überschrift ankreuzen · 2,5 Punkte</span>
      <p className="mut">Lesen Sie den Zeitungsartikel. Kreuzen Sie die passende Überschrift an. Es gibt nur <u>eine</u> Lösung.</p>
      <div className="reading">{d.text}</div>
      {d.options.map((o, i) => {
        let cls = 'opt'
        if (revealed) {
          if (i === d.correct) cls += ' correct'
          else if (i === ans) cls += ' wrong'
        } else if (i === ans) cls += ' sel'
        return (
          <div key={i} className={cls} style={revealed ? { pointerEvents: 'none' } : null}
            onClick={() => !revealed && onPick(i)}>
            <div className="letter">{'abc'[i]}</div>
            <div>{o}</div>
          </div>
        )
      })}
      {revealed && <Feedback ok={ans === d.correct} unanswered={ans === undefined} text={d.expl} />}
    </div>
  )
}

export function Teil4Prompt({ d, children }) {
  return (
    <div className="qcard">
      <span className="tag">Teil 4 · Eine Nachricht schreiben · max. 6 Punkte · 20 Minuten</span>
      <p className="mut">Sie sind in dieser Situation:</p>
      <div className="situation">{d.situation}</div>
      <p>Schreiben Sie zu folgenden Punkten jeweils 1–2 Sätze:</p>
      <ul className="clean">{d.points.map((p) => <li key={p}>{p}</li>)}</ul>
      <p className="mut" style={{ margin: '8px 0 12px' }}>
        Denken Sie an eine passende <b>Anrede</b> am Anfang und einen <b>Gruß</b> am Ende.
      </p>
      {children}
    </div>
  )
}

export function WordCount({ text }) {
  const n = text.trim() ? text.trim().split(/\s+/).length : 0
  return <div className="wcount">{n} Wörter</div>
}

export function SelfAssess({ d, onDone }) {
  return (
    <div className="card" style={{ marginTop: 14 }}>
      <h3>Checkliste – vergib deine Punkte selbst (max. 6)</h3>
      <p className="mut">In der echten Prüfung bewerten Prüfer Inhalt und Sprache. Kreuze ehrlich an:</p>
      {[...d.points.map((p) => `Punkt „${p}“ mit 1–2 Sätzen behandelt`),
        'Passende Anrede und Gruß vorhanden',
        'Text gut verständlich, Sätze verbunden (weil, deshalb, und …)'].map((label, i) => (
        <div className="checkrow" key={i}>
          <input type="checkbox" className="ck" />
          <div>{label} <b>(1 P)</b></div>
        </div>
      ))}
      <div className="foot-actions">
        <button className="btn gold" onClick={() => {
          const n = document.querySelectorAll('.ck:checked').length
          onDone(n)
        }}>Punkte zählen</button>
      </div>
    </div>
  )
}

/* Punkte für den Leseteil berechnen */
export function scoreLesen(t1, t2, t3, a1, a2, a3) {
  let pts = 0
  if (a1 === t1.correct) pts += 2.5
  t2.items.forEach((it, i) => { if (a2[i] === (it.a ? 1 : 0)) pts += 1 })
  if (a3 === t3.correct) pts += 2.5
  return pts
}
