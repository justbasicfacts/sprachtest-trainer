/* Wort-Vergleich für die Übungsformen, die ohne KI auskommen (Fehlersuche,
   Diktat, Nachsprechen). Bewusst ohne Bibliothek: die Sätze sind kurz, und ein
   eigener Diff lässt sich exakt auf deutsche Eigenheiten zuschneiden - vor allem
   auf die Großschreibung, die bei Nomen ein eigener Fehlertyp ist und nicht als
   "falsches Wort" durchgehen soll. */

/** Zerlegt einen Satz in Wörter. Satzzeichen bleiben am Wort kleben, damit ein
    Wort-Chip im Puzzle/in der Fehlersuche genau so aussieht wie im Satz. */
export function splitWords(sentence: string): string[] {
  return sentence.trim().split(/\s+/).filter(Boolean)
}

/** Entfernt alles, was für den Vergleich egal ist: Satzzeichen am Wortrand,
    typografische Anführungszeichen. Groß-/Kleinschreibung bleibt erhalten. */
export function stripPunctuation(word: string): string {
  return word.replace(/^[„"“”‚'([]+/, '').replace(/[.,;:!?…"“”‘’')\]]+$/, '')
}

/** Vergleichsform: ohne Satzzeichen und ohne Groß-/Kleinschreibung. */
function normalizeWord(word: string): string {
  return stripPunctuation(word).toLowerCase()
}

/** Normalisiert einen ganzen Satz für den schnellen Gleichheitstest:
    Mehrfach-Leerzeichen, Anführungszeichen und Schlusszeichen fallen weg. */
export function normalizeSentence(sentence: string): string {
  return sentence
    .trim()
    .toLowerCase()
    .replace(/[„"“”‘’]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/, '')
}

export type WordStatus =
  /** Wort stimmt exakt */
  | 'ok'
  /** Wort stimmt, aber die Groß-/Kleinschreibung nicht (typischer Diktatfehler) */
  | 'case'
  /** Wort steht an dieser Stelle, ist aber anders geschrieben */
  | 'wrong'
  /** Wort fehlt in der Antwort */
  | 'missing'
  /** Wort steht zu viel in der Antwort */
  | 'extra'

export interface WordDiffEntry {
  status: WordStatus
  /** Was der Lernende geschrieben/gesagt hat (bei 'missing' leer) */
  got: string
  /** Was dort stehen müsste (bei 'extra' leer) */
  want: string
}

export interface WordDiffResult {
  entries: WordDiffEntry[]
  /** Wörter, die exakt oder bis auf die Großschreibung stimmen */
  correct: number
  total: number
  /** Anteil 0-1, gemessen an der Ziel-Wortzahl */
  ratio: number
  perfect: boolean
}

/* Klassischer LCS-Diff (Longest Common Subsequence) über die normalisierten
   Wörter. Für Sätze mit ein paar Dutzend Wörtern ist die quadratische Tabelle
   völlig unproblematisch und liefert deutlich bessere Ergebnisse als ein
   stellenweiser Vergleich, weil ein einziges vergessenes Wort sonst alles
   danach als falsch markieren würde. */
function lcsTable(a: string[], b: string[]): number[][] {
  const table: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
    }
  }
  return table
}

/** Vergleicht die Antwort des Lernenden mit dem Zielsatz, Wort für Wort. */
export function diffWords(got: string, want: string): WordDiffResult {
  const gotWords = splitWords(got)
  const wantWords = splitWords(want)
  const gotNorm = gotWords.map(normalizeWord)
  const wantNorm = wantWords.map(normalizeWord)

  const table = lcsTable(gotNorm, wantNorm)
  const entries: WordDiffEntry[] = []
  let i = 0
  let j = 0

  while (i < gotWords.length && j < wantWords.length) {
    if (gotNorm[i] === wantNorm[j]) {
      // Gleiches Wort - nur noch prüfen, ob die Großschreibung stimmt.
      const sameCase = stripPunctuation(gotWords[i]) === stripPunctuation(wantWords[j])
      entries.push({ status: sameCase ? 'ok' : 'case', got: gotWords[i], want: wantWords[j] })
      i++
      j++
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      entries.push({ status: 'extra', got: gotWords[i], want: '' })
      i++
    } else {
      entries.push({ status: 'missing', got: '', want: wantWords[j] })
      j++
    }
  }
  while (i < gotWords.length) {
    entries.push({ status: 'extra', got: gotWords[i], want: '' })
    i++
  }
  while (j < wantWords.length) {
    entries.push({ status: 'missing', got: '', want: wantWords[j] })
    j++
  }

  // Ein 'extra' direkt neben einem 'missing' ist in Wahrheit ein falsch
  // geschriebenes Wort - das zusammenzufassen liest sich für den Lernenden
  // deutlich verständlicher als zwei getrennte Meldungen.
  const merged: WordDiffEntry[] = []
  for (let k = 0; k < entries.length; k++) {
    const cur = entries[k]
    const next = entries[k + 1]
    if (next && cur.status === 'missing' && next.status === 'extra') {
      merged.push({ status: 'wrong', got: next.got, want: cur.want })
      k++
    } else if (next && cur.status === 'extra' && next.status === 'missing') {
      merged.push({ status: 'wrong', got: cur.got, want: next.want })
      k++
    } else {
      merged.push(cur)
    }
  }

  const correct = merged.filter((e) => e.status === 'ok' || e.status === 'case').length
  const total = wantWords.length
  return {
    entries: merged,
    correct,
    total,
    ratio: total === 0 ? 1 : correct / total,
    perfect: merged.every((e) => e.status === 'ok'),
  }
}

/** Findet alle Positionen im falschen Satz, die sich vom richtigen unterscheiden.
    Genutzt von der Fehlersuche: statt der KI einen Index zu glauben, wird die
    Fehlerstelle deterministisch aus falschem und richtigem Satz berechnet.

    Bewusst eine LISTE und kein einzelner Index: Bei einem Wortstellungsfehler
    („weil ich bin krank") sind zwei Positionen vertauscht, und beide anzutippen
    ist eine richtige Antwort. Ein einzelner Index würde eine davon zu Unrecht
    als falsch werten. */
export function findErrorIndices(wrong: string, correct: string): number[] {
  const w = splitWords(wrong)
  const c = splitWords(correct)

  // Gleiche Wortzahl: alle Stellen, an denen sich die Wörter unterscheiden.
  if (w.length === c.length) {
    const hits: number[] = []
    for (let i = 0; i < w.length; i++) {
      if (stripPunctuation(w[i]) !== stripPunctuation(c[i])) hits.push(i)
    }
    return hits
  }

  // Unterschiedliche Wortzahl (überflüssiges oder fehlendes Wort): von vorne die
  // gemeinsamen Wörter überspringen - die erste Abweichung ist die Fehlerstelle.
  let start = 0
  while (start < w.length && start < c.length && normalizeWord(w[start]) === normalizeWord(c[start])) start++
  return start < w.length ? [start] : []
}

/** Zählt Füllwörter in einem Transkript (für die Monolog-Statistik). */
const FILLERS = ['ähm', 'ähh', 'äh', 'öh', 'hm', 'also', 'halt', 'irgendwie', 'sozusagen']
export function countFillers(transcript: string): number {
  return splitWords(transcript).filter((word) => FILLERS.includes(normalizeWord(word))).length
}
