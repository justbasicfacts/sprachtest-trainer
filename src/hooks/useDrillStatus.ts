/* Fasst die protokollierten Übungsversuche (db.drills) je Übung zusammen - die
   Grundlage für die Erledigt-Häkchen in den Übungslisten.

   "Erledigt" heißt: mindestens einmal richtig gelöst. Ein Fehlversuch löscht das
   Häkchen also nicht wieder - wer eine Übung wiederholt, soll nicht bestraft
   werden, wenn es beim zweiten Mal schiefgeht. */
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type DrillRecord } from '../db'

export interface ExerciseStatus {
  /** Mindestens einmal richtig gelöst */
  done: boolean
  /** Wie oft insgesamt versucht */
  attempts: number
  /** Zeitpunkt des letzten Versuchs */
  lastTs: number
}

export interface DrillStatus {
  byExercise: Map<string, ExerciseStatus>
  /** Alle Versuche in diesem Bereich, neueste zuerst */
  rows: DrillRecord[]
  /** Wie viele verschiedene Übungen gelöst wurden */
  doneCount: number
  /** Wie viele verschiedene Übungen angefangen wurden */
  attemptedCount: number
}

/** `scopeId` ist eine Übungsform ('wordorder', 'diktat', ...) oder eine
    Fähigkeit ('praepositionen', ...) - beide liegen im selben Store. */
export function useDrillStatus(scopeId: string): DrillStatus {
  const rows = useLiveQuery<DrillRecord[], DrillRecord[]>(
    () => db.drills.where('methodId').equals(scopeId).reverse().sortBy('ts'),
    [scopeId],
    []
  )

  const byExercise = new Map<string, ExerciseStatus>()
  for (const r of rows) {
    const prev = byExercise.get(r.exerciseId)
    byExercise.set(r.exerciseId, {
      done: (prev?.done ?? false) || r.ok,
      attempts: (prev?.attempts ?? 0) + 1,
      lastTs: Math.max(prev?.lastTs ?? 0, r.ts),
    })
  }

  let doneCount = 0
  for (const s of byExercise.values()) if (s.done) doneCount++

  return { byExercise, rows, doneCount, attemptedCount: byExercise.size }
}
