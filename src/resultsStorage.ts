/* Persistiert die Richtig/Falsch-Ergebnisse aus dem Übungsmodus in localStorage,
   damit die Häkchen/Kreuze in der Aufgaben-Übersicht (und die Punktzahl im
   "Teil komplett"-Banner) einen Seiten-Reload überleben. Schlüssel sind
   "<Teil>-<Index im Pool>", z. B. "1-0" für die erste Teil-1-Aufgabe. */

export interface TaskResult {
  points: number
  max: number
}

const STORAGE_KEY = 'sprachtest:practice-results'

/** Lädt gespeicherte Ergebnisse (leere Map, falls nichts vorhanden oder Speicher
    nicht verfügbar/kaputt - z. B. Safari privater Modus). */
export function loadPracticeResults(): Map<string, TaskResult> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Map()
    const entries = JSON.parse(raw) as [string, TaskResult][]
    return new Map(entries)
  } catch {
    return new Map()
  }
}

/** Speichert die Ergebnisse (No-op, falls localStorage nicht verfügbar ist). */
export function savePracticeResults(results: Map<string, TaskResult>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(results.entries())))
  } catch {
    /* Speicher voll/deaktiviert - dann eben nicht persistieren, App bleibt trotzdem nutzbar */
  }
}
