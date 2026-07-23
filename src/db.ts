import Dexie, { type Table } from 'dexie'
import { VOCAB_SEED } from './data/vocab'
import type { Teil1Task, Teil2Task, Teil3Task, Teil4Task, TrainingExercise } from './data/types'

export interface VocabWord {
  id?: number
  de: string
  en: string
  tr: string
  ex: string
  tag: string
  custom: 0 | 1
  due: number
  interval: number
  reps: number
}

export interface ExamResult {
  id?: number
  date: string
  test: string
  lesen: number
  schreiben: number
  /** Mündlicher Teil (0-15), nur wenn der Sprechteil absolviert wurde */
  sprechen?: number
  total: number
  /** Maximalpunktzahl des Ergebnisses: 15 (nur schriftlich) oder 30 (mit Sprechen).
      Ältere Einträge haben kein max-Feld → 15. */
  max?: number
  ts: number
}

/** Von der KI generierte Aufgabe, lokal gespeichert (überlebt Reload, bleibt im Browser) */
export interface GeneratedTaskRecord {
  id: string
  part: 1 | 2 | 3 | 4
  task: Teil1Task | Teil2Task | Teil3Task | Teil4Task
  createdAt: number
}

/** Von der KI generierte Trainings-Übung zu einer Fähigkeit (gezieltes Training),
    lokal gespeichert, damit sie den Reload übersteht. */
export interface GeneratedTrainingRecord {
  id: string
  skillId: string
  exercise: TrainingExercise
  createdAt: number
}

class AppDatabase extends Dexie {
  vocab!: Table<VocabWord, number>
  results!: Table<ExamResult, number>
  generated!: Table<GeneratedTaskRecord, string>
  trainingGenerated!: Table<GeneratedTrainingRecord, string>

  constructor() {
    super('sprachtest-trainer')
    this.version(1).stores({
      vocab: '++id, de, due, tag, custom',
      results: '++id, date',
    })
    this.version(2).stores({
      vocab: '++id, de, due, tag, custom',
      results: '++id, date',
      generated: 'id, part, createdAt',
    })
    this.version(3).stores({
      vocab: '++id, de, due, tag, custom',
      results: '++id, date',
      generated: 'id, part, createdAt',
      trainingGenerated: 'id, skillId, createdAt',
    })
  }
}

export const db = new AppDatabase()

/** Speichert eine von der KI generierte Aufgabe lokal, damit sie den Reload übersteht */
export async function saveGeneratedTask(
  part: 1 | 2 | 3 | 4,
  task: Teil1Task | Teil2Task | Teil3Task | Teil4Task
): Promise<void> {
  await db.generated.add({ id: task.id, part, task, createdAt: Date.now() })
}

/** Speichert eine von der KI generierte Trainings-Übung lokal, damit sie den Reload übersteht */
export async function saveGeneratedTrainingExercise(skillId: string, exercise: TrainingExercise): Promise<void> {
  await db.trainingGenerated.add({ id: exercise.id, skillId, exercise, createdAt: Date.now() })
}

/** Seed the vocab table on first run (guarded against double-invocation, e.g. React StrictMode) */
let seeding: Promise<void> | null = null
export function seedVocab(): Promise<void> {
  if (!seeding) {
    seeding = db.transaction('rw', db.vocab, async () => {
      const count = await db.vocab.count()
      if (count > 0) return
      const now = Date.now()
      await db.vocab.bulkAdd(
        VOCAB_SEED.map((v) => ({
          ...v,
          custom: 0 as const,
          due: now, // everything due immediately at start
          interval: 0, // days
          reps: 0,
        }))
      )
    })
  }
  return seeding
}

/** Simple SM-2-lite spaced repetition */
export function nextReview(
  word: Pick<VocabWord, 'interval' | 'reps'>,
  grade: 0 | 1 | 2
): Pick<VocabWord, 'interval' | 'reps' | 'due'> {
  // grade: 0 = Nochmal, 1 = Gut, 2 = Leicht
  const DAY = 24 * 60 * 60 * 1000
  let { interval = 0 } = word
  const { reps = 0 } = word
  if (grade === 0) {
    return { interval: 0, reps: 0, due: Date.now() + 10 * 60 * 1000 } // again in 10 min
  }
  if (reps === 0) interval = grade === 2 ? 3 : 1
  else interval = Math.ceil(interval * (grade === 2 ? 3 : 2.2))
  interval = Math.min(interval, 180)
  return { interval, reps: reps + 1, due: Date.now() + interval * DAY }
}
