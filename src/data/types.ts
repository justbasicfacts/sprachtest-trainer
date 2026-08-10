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

/* ---------- Übungsformen ("Methoden"): zweite Achse neben den Fähigkeiten oben.
   Die Fähigkeiten beantworten WAS geübt wird (Präpositionen, Nebensätze, ...),
   die Methoden hier WIE geübt wird (Puzzle, Diktat, Dialog, ...). Beide Achsen
   sind bewusst unabhängig: TrainingSkill/TrainingExercise bleiben unverändert,
   die Methoden bringen ihre eigenen, je Form unterschiedlichen Daten mit. ---------- */

export type MethodKind =
  | 'wordorder'
  | 'errorhunt'
  | 'dictation'
  | 'letterbuilder'
  | 'roleplay'
  | 'blitz'
  | 'shadowing'
  | 'monologue'

interface MethodExerciseBase {
  id: string
  /** Kurze Anweisung über der Übung */
  instruction: string
  /** Optionale Formulierungs-/Denkhilfe */
  hint?: string
}

/** Satzbau-Puzzle: die Wort-Chips werden LOKAL aus `solution` abgeleitet, nie von
    der KI übernommen - sonst fehlen oder doppeln sich gelegentlich Wörter und die
    Aufgabe wird unlösbar. */
export interface WordOrderExercise extends MethodExerciseBase {
  kind: 'wordorder'
  solution: string
  /** Weitere gültige Wortstellungen (z. B. Umstellung von Zeit- und Ortsangabe) */
  alternatives?: string[]
  /** Regel-Erklärung, die nach dem Lösen eingeblendet wird */
  why: string
}

/** Fehlersuche: die Fehlerstelle wird LOKAL per Wort-Diff aus `wrong`/`correct`
    bestimmt - ein vom Modell gelieferter Index ist erfahrungsgemäß unzuverlässig. */
export interface ErrorHuntExercise extends MethodExerciseBase {
  kind: 'errorhunt'
  wrong: string
  correct: string
  why: string
}

export interface DictationExercise extends MethodExerciseBase {
  kind: 'dictation'
  sentence: string
  /** z. B. "Achte auf die Großschreibung der Nomen" */
  watchOut?: string
}

export interface LetterBlock {
  id: string
  /** Überschrift des Bausteins, z. B. "Anrede" */
  label: string
  /** Was in diesem Baustein stehen soll */
  ask: string
  hint?: string
  /** Musterformulierung für genau diesen Baustein */
  sample: string
}

export interface LetterBuilderExercise extends MethodExerciseBase {
  kind: 'letterbuilder'
  situation: string
  blocks: LetterBlock[]
}

export interface RoleplayExercise extends MethodExerciseBase {
  kind: 'roleplay'
  situation: string
  /** Wen die KI spielt, z. B. "die Nachbarin Frau Schmidt" */
  partnerRole: string
  /** Was der Lernende im Gespräch erreichen soll */
  goal: string
  /** Wie viele eigene Redebeiträge maximal - begrenzt auch die KI-Kosten */
  maxTurns: number
  /** Bewertungskriterien für die Auswertung am Ende */
  criteria: string[]
  /** Womit die Gesprächspartnerin/der Gesprächspartner das Gespräch eröffnet */
  opener: string
}

export interface BlitzExercise extends MethodExerciseBase {
  kind: 'blitz'
  questions: string[]
  /** Antwortzeit je Frage in Sekunden */
  seconds: number
}

export interface ShadowingExercise extends MethodExerciseBase {
  kind: 'shadowing'
  sentences: string[]
  /** z. B. "Laute: ö, ü, ch" */
  focus?: string
}

export interface MonologueExercise extends MethodExerciseBase {
  kind: 'monologue'
  topic: string
  seconds: number
  /** Aspekte, die vorkommen sollen - dienen zugleich als Bewertungskriterien */
  mustMention: string[]
}

export type MethodExercise =
  | WordOrderExercise
  | ErrorHuntExercise
  | DictationExercise
  | LetterBuilderExercise
  | RoleplayExercise
  | BlitzExercise
  | ShadowingExercise
  | MonologueExercise

/** Wie stark eine Übungsform auf die KI angewiesen ist - wird in der Kachel
    angezeigt, damit ohne API-Key klar ist, was trotzdem funktioniert. */
export type AiNeed = 'nie' | 'optional' | 'immer'

export interface TrainingMethod<K extends MethodKind = MethodKind> {
  id: K
  icon: string
  title: string
  /** Schreib- oder Sprechübung - gruppiert die Kacheln */
  channel: 'write' | 'speak'
  /** Einzeiler für die Kachel */
  short: string
  /** Was diese Übungsform trainiert (Kopfzeile in der Übersicht) */
  focus: string
  needsAi: AiNeed
  exercises: Extract<MethodExercise, { kind: K }>[]
}
