/* Generiert alternative Musterlösungen (Musterantworten) zu existierenden Aufgaben.
   Für Teil 4, 5, 6, 7 jeweils eine neue Lösung im gleichen Format wie die statischen Aufgaben.
   Läuft direkt im Browser. */
import { z } from 'zod'
import type { Teil4Task, Teil6Photo, Teil7Situation } from '../data/types'
import { geminiJson, type GeminiSchema } from './geminiClient'

const MODEL = 'gemini-3.5-flash'
const FALLBACK_MODEL = 'gemini-3.1-flash-lite'

const SYSTEM_PROMPT = `Du bist ein Deutsch-Prüfer für den Berliner Sprachtest (B1-Niveau).
Du generierst alternative Musterlösungen für Prüfungsaufgaben. Alle Antworten müssen
sprachlich auf B1-Niveau sein: klar, strukturiert, grammatikalisch korrekt, aber nicht übertrieben formal.
Antworte ausschließlich auf Deutsch.`

/* Schema für Teil 4: Alternative Nachricht/Email */
const TEIL4_MODEL_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    model: {
      type: 'STRING',
      description: 'Vollständige alternative Nachricht mit Anrede und Gruß, \\n zwischen Absätzen. Ca. 80-120 Wörter.',
    },
  },
  required: ['model'],
}

const TEIL4ModelSchema = z.object({
  model: z.string().min(50, 'Antwort zu kurz'),
})

/* Schema für Teil 5: Alternative Antwort zu einer Frage */
const TEIL5_ANSWER_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    answer: {
      type: 'STRING',
      description: 'Alternative Antwort (2-3 Sätze). Sollte die Frage wirklich beantworten und ein Beispiel oder einen Grund enthalten.',
    },
  },
  required: ['answer'],
}

const TEIL5AnswerSchema = z.object({
  answer: z.string().min(20, 'Antwort zu kurz'),
})

/* Schema für Teil 6: Alternative Fotobeschreibung */
const TEIL6_DESCRIPTION_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    description: {
      type: 'STRING',
      description: 'Alternative Fotobeschreibung. Sollte beschreiben: was sichtbar ist (Personen, Ort, Gegenstände), was gerade passiert, Vermutung, Bezug zur Erfahrung. Ca. 150-200 Wörter.',
    },
  },
  required: ['description'],
}

const TEIL6DescriptionSchema = z.object({
  description: z.string().min(100, 'Beschreibung zu kurz'),
})

/* Schema für Teil 7: Alternative Pro/Contra-Argumente */
const TEIL7_ARGUMENTS_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    pro: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      minItems: 2,
      maxItems: 2,
      description: 'Genau 2 alternative Vorteile',
    },
    contra: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      minItems: 2,
      maxItems: 2,
      description: 'Genau 2 alternative Nachteile',
    },
  },
  required: ['pro', 'contra'],
}

const TEIL7ArgumentsSchema = z.object({
  pro: z.array(z.string()).length(2),
  contra: z.array(z.string()).length(2),
})

/**
 * Generiert eine alternative Musterlösung (Email/Nachricht) für eine Teil-4-Aufgabe.
 */
export async function generateModelAnswerTeil4(task: Teil4Task): Promise<string> {
  const pointsList = task.points.map((p, i) => `${i + 1}. ${p}`).join('\n')

  const result = await geminiJson({
    model: MODEL,
    fallbackModel: FALLBACK_MODEL,
    timeoutMs: 45_000,
    system: SYSTEM_PROMPT,
    user: `Teil 4 (Schreiben). Schreib eine ALTERNATIVE Nachricht/Email für diese Situation:

Situation: ${task.situation}

Zu bearbeitende Punkte:
${pointsList}

Wichtig:
- Schreib zu jedem Punkt 1-2 Sätze (aber nicht alle 4 gleich lang)
- Vergiss die Anrede am Anfang und den Gruß am Ende nicht
- Schreib etwas anderes als die existierende Musterlösung
- Verwende B1-gerechte Sätze (klar, einfach, gut verbunden)
- Insgesamt ca. 80-120 Wörter`,
    responseSchema: TEIL4_MODEL_SCHEMA,
    zodSchema: TEIL4ModelSchema,
  })

  return result.model
}

/**
 * Generiert eine alternative Musterantwort zu einer Teil-5-Frage (Kennenlernen).
 */
export async function generateModelAnswerTeil5(question: string): Promise<string> {
  const result = await geminiJson({
    model: MODEL,
    fallbackModel: FALLBACK_MODEL,
    timeoutMs: 45_000,
    system: SYSTEM_PROMPT,
    user: `Teil 5 (Kennenlernen). Der Prüfer stellt diese Frage:

"${question}"

Schreib eine ALTERNATIVE Musterantwort (2-3 Sätze). Wichtig:
- Beantworte die Frage wirklich (nicht nur ja/nein)
- Gib ein Beispiel oder einen Grund (mit "weil", "wegen", "deshalb", etc.)
- Verwende B1-gerechte Sätze
- Schreib etwas anderes als die existierende Musterlösung
- Insgesamt 2-3 Sätze`,
    responseSchema: TEIL5_ANSWER_SCHEMA,
    zodSchema: TEIL5AnswerSchema,
  })

  return result.answer
}

/**
 * Generiert eine alternative Fotobeschreibung für eine Teil-6-Aufgabe.
 */
export async function generateModelAnswerTeil6(photo: Teil6Photo): Promise<string> {
  const hintsList = photo.hints.join(', ')

  const result = await geminiJson({
    model: MODEL,
    fallbackModel: FALLBACK_MODEL,
    timeoutMs: 45_000,
    system: SYSTEM_PROMPT,
    user: `Teil 6 (Über ein Foto sprechen). Schreib eine ALTERNATIVE Fotobeschreibung für:

Fototitel: ${photo.title}
Stichworte: ${hintsList}

Die Beschreibung sollte folgende 4 Schritte abdecken:
1. Was sehe ich? (Personen, Ort, Gegenstände)
2. Was passiert? (Was machen die Personen gerade?)
3. Was vermute ich? (Ich denke, dass …, Wahrscheinlich …)
4. Mein Bezug (Eigene Erfahrung oder Meinung dazu)

Wichtig:
- Schreib etwas anderes als die existierende Musterlösung
- Verwende B1-gerechte Sätze
- Insgesamt ca. 150-200 Wörter
- Strukturiert und klar`,
    responseSchema: TEIL6_DESCRIPTION_SCHEMA,
    zodSchema: TEIL6DescriptionSchema,
  })

  return result.description
}

/**
 * Generiert alternative Pro- und Contra-Argumente für eine Teil-7-Aufgabe.
 */
export async function generateModelAnswerTeil7(situation: Teil7Situation): Promise<{
  pro: string[]
  contra: string[]
}> {
  const result = await geminiJson({
    model: MODEL,
    fallbackModel: FALLBACK_MODEL,
    timeoutMs: 45_000,
    system: SYSTEM_PROMPT,
    user: `Teil 7 (Eine Situation besprechen). Schreib ALTERNATIVE Vor- und Nachteile für:

Situation: ${situation.situation}

Gib genau 2 Vorteile und 2 Nachteile an (NICHT die existierenden Argumente).

Wichtig:
- Kurz und prägnant (jeweils 5-10 Wörter)
- B1-gerechte Sprache
- Realistische, konkrete Argumente (nicht zu abstrakt)
- Verschieden von den existierenden Argumenten`,
    responseSchema: TEIL7_ARGUMENTS_SCHEMA,
    zodSchema: TEIL7ArgumentsSchema,
  })

  return {
    pro: result.pro,
    contra: result.contra,
  }
}
