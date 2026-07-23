/* Gemeinsame Typen für die Prüfungsinhalte (Teil 1–7) */

export interface Ad {
  head: string
  body: string
  foot: string
}

export interface Teil1Task {
  id: string
  set: string
  situation: string
  ads: Ad[]
  correct: number
  expl: string
}

export interface Teil2Item {
  s: string
  a: boolean
  e: string
}

export interface Teil2Task {
  id: string
  set: string
  title: string
  text: string
  items: Teil2Item[]
}

export interface Teil3Task {
  id: string
  set: string
  text: string
  options: string[]
  correct: number
  expl: string
}

export interface Teil4Task {
  id: string
  set: string
  situation: string
  points: string[]
  model: string
}

export interface Teil5Card {
  q: string
  a: string
}

export interface Teil6Photo {
  img: string
  title: string
  hints: string[]
  model: string
}

export interface Teil7Situation {
  set: string
  situation: string
  pro: string[]
  contra: string[]
}

export interface Redemittel {
  foto: string[]
  meinung: string[]
  brief: string[]
}

export interface ExamData {
  teil1: Teil1Task[]
  teil2: Teil2Task[]
  teil3: Teil3Task[]
  teil4: Teil4Task[]
  teil5: Teil5Card[]
  teil6: Teil6Photo[]
  teil7: Teil7Situation[]
  redemittel: Redemittel
}

export type ExtraData = Pick<ExamData, 'teil1' | 'teil2' | 'teil3' | 'teil4' | 'teil5' | 'teil6' | 'teil7'>

/* ---------- Gezieltes Training (Lernpfad): Übungen zu einzelnen Fähigkeiten,
   unabhängig vom Prüfungsformat - z. B. weil eine KI-Auswertung genau das als
   Schwäche genannt hat (Bildbeschreibung, Vor-/Nachteile, Präpositionen, ...). ---------- */

/** 'speak' → per Mikrofon über SpeakPractice, 'write' → Text + KI-Korrektur. */
export type TrainingMode = 'speak' | 'write'

export interface TrainingExercise {
  id: string
  /** Was zu tun ist, z. B. "Beschreibe das Foto in ganzen Sätzen." */
  instruction: string
  /** Die konkrete Aufgabe/Situation/der Lückensatz */
  prompt: string
  /** Formulierungshilfe, z. B. ein Satzanfang oder die gesuchte Struktur */
  hint?: string
  /** Musterlösung zum Vergleich */
  sampleAnswer: string
}

export interface TrainingSkill {
  id: string
  icon: string
  title: string
  /** Kurze Beschreibung, welches Problem dieses Training behebt */
  focus: string
  mode: TrainingMode
  /** Worauf bei dieser Fähigkeit geachtet werden soll (Sprechen: Bewertungskriterien
      für die KI; Schreiben: Hinweise, die als Checkliste angezeigt werden) */
  criteria: string[]
  exercises: TrainingExercise[]
}
