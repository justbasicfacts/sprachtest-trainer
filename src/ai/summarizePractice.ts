/* Erstellt per Google Gemini eine kurze Zusammenfassung + Tipps, wenn im
   Übungsmodus alle Aufgaben eines Teils erledigt sind. Läuft direkt im Browser,
   gleiche Aufruf-Signatur wie die anderen ai/*-Funktionen. */
import { z } from 'zod'
import { PracticeSummarySchema, type PracticeSummary } from '../data/schemas'
import { geminiJson, type GeminiSchema } from './geminiClient'

const ResultItem = z.object({
  points: z.number(),
  max: z.number(),
})

const SummarizePracticeInput = z.object({
  partLabel: z.string(),
  items: z.array(ResultItem).min(1),
})

const SYSTEM_PROMPT = `Du bist ein freundlicher Deutschlehrer und wertest die Übungsergebnisse eines Lernenden
aus, der sich auf den Berliner Sprachtest für die Einbürgerung (Deutsch-Niveau B1) vorbereitet. Antworte
ausschließlich auf Deutsch, in einfachen, klaren Sätzen (B1-Niveau) - motivierend, aber ehrlich. Beziehe dich
konkret auf die gegebenen Ergebnisse (z. B. welche Aufgaben schlecht liefen), nicht auf allgemeine Floskeln.`

const MODEL = 'gemini-3.5-flash'
// Wenn das Hauptmodell überlastet ist (503), auf das leichtere Modell ausweichen.
const FALLBACK_MODEL = 'gemini-3.1-flash-lite'

const SUMMARY_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING', description: 'Kurze, motivierende Zusammenfassung (2-4 Sätze) der Leistung' },
    tips: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      minItems: 2,
      maxItems: 4,
      description: '2-4 konkrete, kurze Tipps zur Verbesserung',
    },
  },
  required: ['summary', 'tips'],
}

export async function summarizePractice(input: {
  data: { partLabel: string; items: { points: number; max: number }[] }
}): Promise<PracticeSummary> {
  const data = SummarizePracticeInput.parse(input.data)
  const totalPoints = +data.items.reduce((s, it) => s + it.points, 0).toFixed(1)
  const totalMax = +data.items.reduce((s, it) => s + it.max, 0).toFixed(1)
  const lines = data.items.map((it, i) => `Aufgabe ${i + 1}: ${it.points}/${it.max} Punkte`).join('; ')
  const user =
    `${data.partLabel}. Der Lernende hat ${data.items.length} Aufgabe(n) in diesem Übungsteil bearbeitet. ` +
    `Einzelergebnisse: ${lines}. Gesamt: ${totalPoints}/${totalMax} Punkte. ` +
    'Fasse in 2-4 Sätzen zusammen, wie gut das war, und gib 2-4 konkrete Tipps zur Verbesserung.'

  return await geminiJson({
    model: MODEL,
    fallbackModel: FALLBACK_MODEL,
    system: SYSTEM_PROMPT,
    user,
    responseSchema: SUMMARY_SCHEMA,
    zodSchema: PracticeSummarySchema,
  })
}
