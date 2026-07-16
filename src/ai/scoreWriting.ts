/* Bewertet per Gemini einen Teil-4-Text (Nachricht schreiben) nach den offiziellen
   Kriterien des Berliner Sprachtests: jeder der 4 Inhaltspunkte mit 1-2 Sätzen
   behandelt (je 1 P), passende Anrede und Gruß (1 P), Text gut verständlich mit
   verbundenen Sätzen (1 P) - maximal 6 Punkte. Die Punktzahl wird client-seitig
   aus den Einzelkriterien gezählt, damit sie immer konsistent ist. */
import { z } from 'zod'
import type { Teil4Task } from '../data/types'
import { geminiJson, type GeminiSchema } from './geminiClient'

const CriterionSchema = z.object({
  ok: z.boolean(),
  comment: z.string(),
})

const RawScoreSchema = z.object({
  points: z
    .array(z.object({ point: z.string(), ok: z.boolean(), comment: z.string() }))
    .length(4),
  greeting: CriterionSchema,
  clarity: CriterionSchema,
  corrections: z.array(z.object({ wrong: z.string(), better: z.string() })).max(8),
  feedback: z.string(),
})

export type WritingScore = z.infer<typeof RawScoreSchema> & { score: number }

const CRITERION_PROPS = {
  ok: { type: 'BOOLEAN' },
  comment: { type: 'STRING', description: 'Kurze Begründung auf einfachem Deutsch (B1-gerecht), 1 Satz' },
}

const RESPONSE_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    points: {
      type: 'ARRAY',
      minItems: 4,
      maxItems: 4,
      description: 'Bewertung der 4 Inhaltspunkte, in derselben Reihenfolge wie in der Aufgabe',
      items: {
        type: 'OBJECT',
        properties: {
          point: { type: 'STRING', description: 'Der Inhaltspunkt (wörtlich aus der Aufgabe)' },
          ok: { type: 'BOOLEAN', description: 'true = mit 1-2 verständlichen Sätzen behandelt' },
          comment: { type: 'STRING', description: 'Kurze Begründung, 1 Satz' },
        },
        required: ['point', 'ok', 'comment'],
      },
    },
    greeting: {
      type: 'OBJECT',
      description: 'Passende Anrede am Anfang UND passender Gruß am Ende vorhanden?',
      properties: CRITERION_PROPS,
      required: ['ok', 'comment'],
    },
    clarity: {
      type: 'OBJECT',
      description: 'Text insgesamt gut verständlich, Sätze verbunden (weil, deshalb, und, ...)?',
      properties: CRITERION_PROPS,
      required: ['ok', 'comment'],
    },
    corrections: {
      type: 'ARRAY',
      maxItems: 8,
      description: 'Die wichtigsten Sprachfehler (max. 8). Leer lassen, wenn es keine nennenswerten gibt.',
      items: {
        type: 'OBJECT',
        properties: {
          wrong: { type: 'STRING', description: 'Fehlerhafte Stelle (wörtlich aus dem Text)' },
          better: { type: 'STRING', description: 'Korrigierte Version' },
        },
        required: ['wrong', 'better'],
      },
    },
    feedback: {
      type: 'STRING',
      description: 'Freundliches Gesamtfeedback auf einfachem Deutsch, 2-4 Sätze: was war gut, was üben',
    },
  },
  required: ['points', 'greeting', 'clarity', 'corrections', 'feedback'],
}

const SYSTEM_PROMPT =
  'Du bist Prüfer für den Berliner Sprachtest für die Einbürgerung (Deutsch-Niveau B1) und bewertest Teil 4 ' +
  '(eine kurze Nachricht schreiben). Bewerte fair, aber wie in der echten Prüfung: Ein Inhaltspunkt zählt nur, ' +
  'wenn er mit 1-2 verständlichen Sätzen wirklich behandelt wurde - nicht bei bloßer Erwähnung. Kleine Grammatik- ' +
  'und Rechtschreibfehler sind auf B1-Niveau normal und kosten keine Punkte, solange der Text verständlich bleibt. ' +
  'Gib dein Feedback auf einfachem, freundlichem Deutsch (B1-gerecht).'

export async function scoreWriting(input: { data: { task: Teil4Task; text: string } }): Promise<WritingScore> {
  const { task, text } = input.data

  const raw = await geminiJson({
    model: 'gemini-3.5-flash',
    fallbackModel: 'gemini-3.1-flash-lite',
    timeoutMs: 60_000,
    system: SYSTEM_PROMPT,
    user:
      `Aufgabe (Situation): ${task.situation}\n\n` +
      `Diese 4 Punkte sollten jeweils mit 1-2 Sätzen behandelt werden:\n` +
      task.points.map((p, i) => `${i + 1}. ${p}`).join('\n') +
      `\n\nText des Lernenden:\n"""\n${text}\n"""\n\n` +
      'Bewerte den Text nach den Kriterien im Schema.',
    responseSchema: RESPONSE_SCHEMA,
    zodSchema: RawScoreSchema,
  })

  const score =
    raw.points.filter((p) => p.ok).length + (raw.greeting.ok ? 1 : 0) + (raw.clarity.ok ? 1 : 0)

  return { ...raw, score }
}
