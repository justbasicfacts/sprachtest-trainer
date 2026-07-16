/* Erstellt per Google Gemini (kostenloser Free-Tier) eine neue Übungsaufgabe für
   Teil 1-4, im gleichen Format wie die statischen Aufgaben in data/content.ts.
   Läuft direkt im Browser (statisches Hosting ohne Server); gleiche Aufruf-Signatur
   wie die frühere Serverfunktion: generateTask({ data: { part } }). */
import { z } from 'zod'
import {
  GeneratedTeil1Schema,
  GeneratedTeil2Schema,
  GeneratedTeil3Schema,
  GeneratedTeil4Schema,
} from '../data/schemas'
import type { Teil1Task, Teil2Task, Teil3Task, Teil4Task } from '../data/types'
import { geminiJson, type GeminiSchema } from './geminiClient'

const GenerateTaskInput = z.object({
  part: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
})

const SYSTEM_PROMPT = `Du erstellst Übungsaufgaben für den Berliner Sprachtest für die Einbürgerung (Deutsch-Niveau B1).
Die Aufgaben müssen sprachlich auf B1-Niveau sein (einfache bis mittlere Satzstrukturen, Alltagswortschatz zu Themen
wie Behörden, Arbeit, Wohnen, Gesundheit, Bildung, Verkehr, Gesellschaft, Alltag). Erfinde jedes Mal ein neues,
konkretes Alltagsthema - vermeide die immer gleichen Klischees (Vitamin C, Homeoffice, Fahrrad) und erfinde
realistische Details (Namen, Orte, Zahlen). Antworte ausschließlich auf Deutsch und exakt im vorgegebenen
JSON-Schema.`

const MODEL = 'gemini-3.5-flash'

/* Gemini-REST-Schemas, spiegelbildlich zu den zod-Schemas in data/schemas.ts
   (die zod-Schemas validieren die Antwort anschließend). */

const AD_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    head: { type: 'STRING', description: 'Überschrift der Anzeige, oft in Großbuchstaben' },
    body: { type: 'STRING', description: 'Haupttext der Anzeige (1-3 Sätze)' },
    foot: { type: 'STRING', description: 'Kontaktinfo/Fußzeile, z. B. Telefonnummer oder Webseite' },
  },
  required: ['head', 'body', 'foot'],
}

const TEIL1_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    situation: { type: 'STRING', description: 'Kurze Alltagssituation auf Deutsch (B1-Niveau), 1-2 Sätze' },
    ads: { type: 'ARRAY', items: AD_SCHEMA, minItems: 3, maxItems: 3, description: 'Genau 3 Kleinanzeigen, nur eine passt zur Situation' },
    correct: { type: 'INTEGER', description: 'Index (0-2) der richtigen Anzeige' },
    expl: { type: 'STRING', description: 'Kurze Erklärung auf Deutsch, warum die Lösung richtig ist und die anderen nicht' },
  },
  required: ['situation', 'ads', 'correct', 'expl'],
}

const TEIL2_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING', description: 'Überschrift des Zeitungsartikels' },
    text: { type: 'STRING', description: 'Zeitungsartikel auf B1-Niveau, 3-4 Absätze, getrennt durch \\n' },
    items: {
      type: 'ARRAY',
      minItems: 4,
      maxItems: 4,
      description: 'Genau 4 Aussagen zum Text',
      items: {
        type: 'OBJECT',
        properties: {
          s: { type: 'STRING', description: 'Eine Aussage zum Text (richtig oder falsch)' },
          a: { type: 'BOOLEAN', description: 'true = Aussage ist laut Text richtig, false = falsch' },
          e: { type: 'STRING', description: 'Kurze Begründung/Zitat aus dem Text' },
        },
        required: ['s', 'a', 'e'],
      },
    },
  },
  required: ['title', 'text', 'items'],
}

const TEIL3_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    text: { type: 'STRING', description: 'Zeitungsartikel auf B1-Niveau, 2-3 Absätze, getrennt durch \\n' },
    options: { type: 'ARRAY', items: { type: 'STRING' }, minItems: 3, maxItems: 3, description: 'Genau 3 mögliche Überschriften, nur eine passt' },
    correct: { type: 'INTEGER', description: 'Index (0-2) der passenden Überschrift' },
    expl: { type: 'STRING', description: 'Kurze Erklärung, warum diese Überschrift passt' },
  },
  required: ['text', 'options', 'correct', 'expl'],
}

const TEIL4_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    situation: { type: 'STRING', description: 'Alltagssituation, in der eine kurze Nachricht geschrieben werden muss' },
    points: { type: 'ARRAY', items: { type: 'STRING' }, minItems: 4, maxItems: 4, description: 'Genau 4 Punkte, die in der Nachricht behandelt werden sollen' },
    model: { type: 'STRING', description: 'Musterlösung: vollständige Nachricht mit Anrede und Gruß, \\n zwischen Absätzen' },
  },
  required: ['situation', 'points', 'model'],
}

export async function generateTask(input: {
  data: { part: 1 | 2 | 3 | 4 }
}): Promise<Teil1Task | Teil2Task | Teil3Task | Teil4Task> {
  const data = GenerateTaskInput.parse(input.data)
  const id = `ai-${crypto.randomUUID()}`
  const set = 'KI-generiert'

  if (data.part === 1) {
    const result = await geminiJson({
      model: MODEL,
      system: SYSTEM_PROMPT,
      user:
        'Erstelle eine Teil-1-Aufgabe: eine kurze Situation, in der jemand etwas sucht, und genau 3 ' +
        'Kleinanzeigen (a, b, c), von denen nur eine wirklich passt. Erkläre am Ende kurz, warum.',
      responseSchema: TEIL1_SCHEMA,
      zodSchema: GeneratedTeil1Schema,
    })
    return { id, set, ...result }
  }

  if (data.part === 2) {
    const result = await geminiJson({
      model: MODEL,
      system: SYSTEM_PROMPT,
      user:
        'Erstelle eine Teil-2-Aufgabe: einen kurzen Zeitungsartikel (3-4 Absätze) mit Titel, und genau 4 ' +
        'Aussagen dazu, von denen jede eindeutig richtig oder falsch ist (nicht alle gleich verteilt).',
      responseSchema: TEIL2_SCHEMA,
      zodSchema: GeneratedTeil2Schema,
    })
    return { id, set, ...result }
  }

  if (data.part === 3) {
    const result = await geminiJson({
      model: MODEL,
      system: SYSTEM_PROMPT,
      user:
        'Erstelle eine Teil-3-Aufgabe: einen kurzen Sachtext (2-3 Absätze) und genau 3 mögliche ' +
        'Überschriften, von denen nur eine wirklich zum Text passt.',
      responseSchema: TEIL3_SCHEMA,
      zodSchema: GeneratedTeil3Schema,
    })
    return { id, set, ...result }
  }

  const result = await geminiJson({
    model: MODEL,
    system: SYSTEM_PROMPT,
    user:
      'Erstelle eine Teil-4-Aufgabe: eine Alltagssituation, in der eine kurze Nachricht geschrieben werden ' +
      'muss, genau 4 Punkte, die die Nachricht behandeln soll, und eine Musterlösung mit Anrede und Gruß.',
    responseSchema: TEIL4_SCHEMA,
    zodSchema: GeneratedTeil4Schema,
  })
  return { id, set, ...result }
}
