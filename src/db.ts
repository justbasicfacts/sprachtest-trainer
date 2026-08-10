import Dexie, { type Table } from 'dexie'
import { VOCAB_SEED } from './data/vocab'
import type { Teil1Task, Teil2Task, Teil3Task, Teil4Task, TrainingExercise, MethodExercise, MethodKind } from './data/types'

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

/** Von der KI generierte Übung zu einer Übungsform (Satzbau, Diktat, Dialog, ...),
    lokal gespeichert. Bewusst ein eigener Store neben `trainingGenerated`: Die
    Methoden-Übungen haben je nach Form ganz andere Felder, und so bleiben die
    bestehenden Datensätze der Fähigkeiten-Übungen unberührt. */
export interface GeneratedMethodRecord {
  id: string
  methodId: MethodKind
  exercise: MethodExercise
  createdAt: number
}

/** Ein Übungsversuch - Grundlage für die Fortschrittsanzeige ("Trefferquote",
    "Wörter pro Minute im Verlauf"). Absichtlich getrennt von `results`, damit die
    Prüfungsergebnisse auf der Startseite nicht mit Übungsversuchen vermischt werden. */
export interface DrillRecord {
  id?: number
  /** Wozu der Versuch gehört: eine Übungsform (MethodKind wie 'wordorder') ODER
      die Id einer Fähigkeit aus data/training.ts (z. B. 'praepositionen').
      Beide Achsen teilen sich diesen Store, damit die Erledigt-Häkchen überall
      gleich funktionieren; die Id-Räume überschneiden sich nicht. */
  methodId: string
  exerciseId: string
  /** Richtig gelöst? Bei Sprechübungen: Auswertung erfolgreich abgeschlossen. */
  ok: boolean
  /** Freies Zusatzfeld, z. B. die gebaute Wortstellung oder Wörter/Minute */
  detail?: string
  /** Optionale Kennzahl für Verläufe (z. B. Wörter pro Minute, Trefferquote in %) */
  value?: number
  ts: number
}

class AppDatabase extends Dexie {
  vocab!: Table<VocabWord, number>
  results!: Table<ExamResult, number>
  generated!: Table<GeneratedTaskRecord, string>
  trainingGenerated!: Table<GeneratedTrainingRecord, string>
  methodGenerated!: Table<GeneratedMethodRecord, string>
  drills!: Table<DrillRecord, number>

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
    // v4: Übungsformen ("Methoden") - eigener Store für KI-Übungen und ein
    // Versuchsprotokoll. Rein additiv, bestehende Daten bleiben unverändert.
    this.version(4).stores({
      vocab: '++id, de, due, tag, custom',
      results: '++id, date',
      generated: 'id, part, createdAt',
      trainingGenerated: 'id, skillId, createdAt',
      methodGenerated: 'id, methodId, createdAt',
      drills: '++id, methodId, ts',
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

/** Speichert eine von der KI generierte Übung zu einer Übungsform lokal */
export async function saveGeneratedMethodExercise(methodId: MethodKind, exercise: MethodExercise): Promise<void> {
  await db.methodGenerated.add({ id: exercise.id, methodId, exercise, createdAt: Date.now() })
}

/** Protokolliert einen Übungsversuch. Bewusst "fire and forget": Ein Fehler beim
    Schreiben (z. B. privater Modus ohne IndexedDB) darf die Übung nie unterbrechen. */
export async function logDrill(entry: Omit<DrillRecord, 'id' | 'ts'>): Promise<number | undefined> {
  try {
    return await db.drills.add({ ...entry, ts: Date.now() })
  } catch (err) {
    console.warn('[db] Übungsversuch konnte nicht gespeichert werden:', err)
    return undefined
  }
}

/** Ergänzt einen schon protokollierten Versuch, statt einen zweiten anzulegen.

    Gebraucht bei den Übungsformen, die aus zwei Schritten bestehen: erst wird die
    Übung beendet (Runde durch, Brief fertig, Gespräch beendet), danach optional
    die KI-Auswertung geholt. Ohne dieses Nachtragen würde ein Durchgang als zwei
    Versuche gezählt. */
export async function updateDrill(id: number | undefined, patch: Partial<DrillRecord>): Promise<void> {
  if (id === undefined) return
  try {
    await db.drills.update(id, patch)
  } catch (err) {
    console.warn('[db] Übungsversuch konnte nicht aktualisiert werden:', err)
  }
}

/** Löscht den Übungsfortschritt einer Fähigkeit oder Übungsform (die Häkchen). */
export async function resetDrills(scopeId: string): Promise<void> {
  await db.drills.where('methodId').equals(scopeId).delete()
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
