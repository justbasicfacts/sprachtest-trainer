/* Bewertet per Gemini eine gesprochene Antwort (als Transkript der Spracherkennung)
   für den mündlichen Teil (Teil 5-7). Die Kriterien kommen vom Aufrufer, damit
   dieselbe Funktion für Kennenlernen, Fotobeschreibung und Situationen passt. */
import { z } from 'zod'
import { geminiJson, type GeminiSchema } from './geminiClient'

export interface SpeakingScore {
  checks: { ok: boolean; comment: string }[]
  corrections: { wrong: string; better: string }[]
  feedback: string
}

const SYSTEM_PROMPT =
  'Du bist Prüfer für den mündlichen Teil des Berliner Sprachtests für die Einbürgerung (Deutsch-Niveau B1). ' +
  'Der Text des Lernenden ist ein automatisches Transkript einer gesprochenen Antwort: Ignoriere fehlende ' +
  'Satzzeichen, Groß-/Kleinschreibung und offensichtliche Erkennungsfehler der Spracherkennung. Bewerte, was ' +
  'gesprochen wurde: Inhalt, Wortschatz und Grammatik auf B1-Niveau. Gesprochene Sprache darf einfach und ' +
  'umgangssprachlich sein - kleine Fehler kosten nichts, solange die Antwort verständlich ist. ' +
  'Gib dein Feedback auf einfachem, freundlichem Deutsch (B1-gerecht).'

export async function scoreSpeaking(input: {
  data: { context: string; criteria: string[]; transcript: string }
}): Promise<SpeakingScore> {
  const { context, criteria, transcript } = input.data
  const n = criteria.length

  const responseSchema: GeminiSchema = {
    type: 'OBJECT',
    properties: {
      checks: {
        type: 'ARRAY',
        minItems: n,
        maxItems: n,
        description: `Bewertung der ${n} Kriterien, in derselben Reihenfolge wie in der Aufgabe`,
        items: {
          type: 'OBJECT',
          properties: {
            ok: { type: 'BOOLEAN', description: 'true = Kriterium erfüllt' },
            comment: { type: 'STRING', description: 'Kurze Begründung auf einfachem Deutsch, 1 Satz' },
          },
          required: ['ok', 'comment'],
        },
      },
      corrections: {
        type: 'ARRAY',
        maxItems: 6,
        description:
          'Die wichtigsten sprachlichen Verbesserungen (max. 6). Keine reinen Transkriptions-/Satzzeichenfehler. ' +
          'Leer lassen, wenn es keine nennenswerten gibt.',
        items: {
          type: 'OBJECT',
          properties: {
            wrong: { type: 'STRING', description: 'So hat es der Lernende gesagt (wörtlich aus dem Transkript)' },
            better: { type: 'STRING', description: 'So klingt es besser/richtig' },
          },
          required: ['wrong', 'better'],
        },
      },
      feedback: {
        type: 'STRING',
        description: 'Freundliches Gesamtfeedback auf einfachem Deutsch, 2-3 Sätze: was war gut, was üben',
      },
    },
    required: ['checks', 'corrections', 'feedback'],
  }

  const zodSchema = z.object({
    checks: z.array(z.object({ ok: z.boolean(), comment: z.string() })).length(n),
    corrections: z.array(z.object({ wrong: z.string(), better: z.string() })).max(6),
    feedback: z.string(),
  })

  return geminiJson({
    model: 'gemini-3.5-flash',
    fallbackModel: 'gemini-3.1-flash-lite',
    timeoutMs: 60_000,
    system: SYSTEM_PROMPT,
    user:
      `Aufgabe: ${context}\n\n` +
      `Diese Kriterien sollen erfüllt sein:\n` +
      criteria.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      `\n\nTranskript der gesprochenen Antwort:\n"""\n${transcript}\n"""\n\n` +
      'Bewerte die Antwort nach den Kriterien im Schema.',
    responseSchema,
    zodSchema,
  })
}
