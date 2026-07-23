/* Bewertet per Gemini die Antwort zu einer gezielten Trainingsübung (Grammatik/
   Ausdruck, z. B. Präpositionen, Nebensätze, Konnektoren). Läuft direkt im Browser,
   gleiche Aufruf-Signatur wie die anderen ai/*-Funktionen. */
import { z } from 'zod'
import { geminiJson, type GeminiSchema } from './geminiClient'

const CheckSchema = z.object({
  ok: z.boolean(),
  feedback: z.string(),
  corrected: z.string(),
})

export type TrainingCheckResult = z.infer<typeof CheckSchema>

const SYSTEM_PROMPT =
  'Du bist Deutschlehrer für den Berliner Sprachtest zur Einbürgerung (Deutsch-Niveau B1) und prüfst die ' +
  'Antwort eines Lernenden zu einer gezielten Übung (z. B. Präpositionen, Nebensätze, Konnektoren). Sei fair, ' +
  'aber gründlich: Prüfe genau die geübte Struktur. Gib kurzes, konkretes Feedback (1-2 Sätze, B1-gerecht) und ' +
  'eine korrigierte bzw. verbesserte Version des Satzes. Ist die Antwort schon richtig, bestätige das kurz und ' +
  'gib trotzdem die (identische oder leicht verfeinerte) Version als "corrected" zurück.'

const RESPONSE_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    ok: { type: 'BOOLEAN', description: 'true, wenn die geübte Struktur korrekt verwendet wurde' },
    feedback: { type: 'STRING', description: 'Kurzes, konkretes Feedback auf Deutsch (1-2 Sätze, B1-gerecht)' },
    corrected: { type: 'STRING', description: 'Korrigierte bzw. verbesserte Version des Satzes' },
  },
  required: ['ok', 'feedback', 'corrected'],
}

export async function checkTrainingAnswer(input: {
  data: {
    instruction: string
    prompt: string
    hint?: string
    answer: string
  }
}): Promise<TrainingCheckResult> {
  const { instruction, prompt, hint, answer } = input.data

  const user =
    `Übung: ${instruction}\n` +
    `Aufgabe: ${prompt}\n` +
    (hint ? `Hilfe/gesuchte Struktur: ${hint}\n` : '') +
    `\nAntwort des Lernenden:\n"""\n${answer}\n"""\n\n` +
    'Prüfe die Antwort und antworte im vorgegebenen Schema.'

  return await geminiJson({
    model: 'gemini-3.5-flash',
    fallbackModel: 'gemini-3.1-flash-lite',
    timeoutMs: 45_000,
    system: SYSTEM_PROMPT,
    user,
    responseSchema: RESPONSE_SCHEMA,
    zodSchema: CheckSchema,
  })
}
