import Dexie from 'dexie'
import { VOCAB_SEED } from './data/vocab'

export const db = new Dexie('sprachtest-trainer')

db.version(1).stores({
  vocab: '++id, de, due, tag, custom',
  results: '++id, date',
})

/** Seed the vocab table on first run (guarded against double-invocation, e.g. React StrictMode) */
let seeding = null
export function seedVocab() {
  if (!seeding) {
    seeding = db.transaction('rw', db.vocab, async () => {
      const count = await db.vocab.count()
      if (count > 0) return
      const now = Date.now()
      await db.vocab.bulkAdd(
        VOCAB_SEED.map((v) => ({
          ...v,
          custom: 0,
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
export function nextReview(word, grade) {
  // grade: 0 = Nochmal, 1 = Gut, 2 = Leicht
  const DAY = 24 * 60 * 60 * 1000
  let { interval = 0, reps = 0 } = word
  if (grade === 0) {
    return { interval: 0, reps: 0, due: Date.now() + 10 * 60 * 1000 } // again in 10 min
  }
  if (reps === 0) interval = grade === 2 ? 3 : 1
  else interval = Math.ceil(interval * (grade === 2 ? 3 : 2.2))
  interval = Math.min(interval, 180)
  return { interval, reps: reps + 1, due: Date.now() + interval * DAY }
}
