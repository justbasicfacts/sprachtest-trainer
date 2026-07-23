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
konkretes Alltagsthema - vermeide die immer gleichen Klischees (Vitamin C, Homeoffice, Fahrrad).

WICHTIG für den Ton (muss exakt wie in der echten Prüfung sein): Situationen sprechen die Testperson immer direkt
mit "Sie" an und versetzen sie in die Lage, z. B. "Sie suchen …", "Sie möchten …", "Ihr Nachbar …", "Ihre Kollegin …".
Schreibe Situationen NIEMALS aus der Perspektive einer benannten dritten Person (also NICHT "Frau Müller möchte …"
oder "Herr Schmidt sucht …" - die Testperson selbst bekommt keinen Namen). Erfundene Namen sind nur für andere
Personen in der Situation erlaubt, an die sich die Testperson wendet (z. B. eine Nachbarin, ein Kollege, ein
Vermieter, eine Ärztin) - niemals für die Testperson selbst. Beispiele im richtigen Ton: "Sie sind krank und können
morgen nicht zur Arbeit kommen. Schreiben Sie eine Nachricht an Ihre Kollegin Frau Schneider." oder "Ihre Waschmaschine
ist kaputt und kann nicht mehr repariert werden. Sie möchten schnell eine neue kaufen."

WICHTIG für den Schwierigkeitsgrad: Falsche Antwortoptionen (Distraktoren) dürfen nicht auf den ersten Blick
erkennbar falsch sein. Sie müssen zum gleichen Thema passen wie die richtige Lösung, sich aber in einem konkreten,
prüfbaren Detail unterscheiden (z. B. falscher Ort, falsche Uhrzeit, falscher Preis, falsche Zielgruppe, ein Detail
im Text, das nicht erfüllt ist). Eine Aufgabe, bei der zwei von drei Optionen offensichtlich themenfremd sind, ist
zu leicht und nicht erlaubt.

Antworte ausschließlich auf Deutsch und exakt im vorgegebenen JSON-Schema.`

const MODEL = 'gemini-3.5-flash'
// Wenn das Hauptmodell überlastet ist (503), auf das leichtere Modell ausweichen -
// etwas einfachere Aufgaben sind besser als gar keine.
const FALLBACK_MODEL = 'gemini-3.1-flash-lite'

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
    situation: {
      type: 'STRING',
      description: 'Kurze Alltagssituation auf Deutsch (B1-Niveau), 1-2 Sätze, direkt mit "Sie" formuliert ' +
        '(z. B. "Sie suchen …", "Ihre Waschmaschine ist kaputt …") - NIE mit erfundenem Namen für die Testperson',
    },
    ads: {
      type: 'ARRAY',
      items: AD_SCHEMA,
      minItems: 3,
      maxItems: 3,
      description: 'Genau 3 Kleinanzeigen zum gleichen Thema. Nur eine erfüllt alle Details der Situation; die ' +
        'anderen beiden scheitern jeweils an genau einem konkreten Detail (Ort, Zeit, Preis, Zielgruppe o. Ä.), ' +
        'nicht an einem völlig anderen Thema',
    },
    correct: { type: 'INTEGER', description: 'Index (0-2) der richtigen Anzeige' },
    expl: { type: 'STRING', description: 'Kurze Erklärung auf Deutsch, warum die Lösung richtig ist und an welchem Detail die anderen beiden scheitern' },
  },
  required: ['situation', 'ads', 'correct', 'expl'],
}

const TEIL2_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING', description: 'Überschrift des Zeitungsartikels' },
    text: { type: 'STRING', description: 'Zeitungsartikel auf B1-Niveau, 3-4 Absätze, jeweils durch einen echten Zeilenumbruch getrennt' },
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
    text: { type: 'STRING', description: 'Zeitungsartikel auf B1-Niveau, 2-3 Absätze, jeweils durch einen echten Zeilenumbruch getrennt' },
    options: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      minItems: 3,
      maxItems: 3,
      description: 'Genau 3 mögliche Überschriften zum gleichen Thema wie der Text. Nur eine fasst den Text ' +
        'korrekt zusammen; die anderen beiden klingen plausibel, haben aber einen falschen Fokus oder ein ' +
        'falsches Detail - nicht offensichtlich themenfremd',
    },
    correct: { type: 'INTEGER', description: 'Index (0-2) der passenden Überschrift' },
    expl: { type: 'STRING', description: 'Kurze Erklärung, warum diese Überschrift passt und die anderen nicht' },
  },
  required: ['text', 'options', 'correct', 'expl'],
}

const TEIL4_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    situation: {
      type: 'STRING',
      description: 'Alltagssituation, in der eine kurze Nachricht geschrieben werden muss, direkt mit "Sie" ' +
        'formuliert (z. B. "Sie sind krank und können morgen nicht zur Arbeit kommen. Schreiben Sie eine ' +
        'Nachricht an Ihre Kollegin.") - NIE mit erfundenem Namen für die Testperson selbst',
    },
    points: { type: 'ARRAY', items: { type: 'STRING' }, minItems: 4, maxItems: 4, description: 'Genau 4 Punkte, die in der Nachricht behandelt werden sollen' },
    model: { type: 'STRING', description: 'Musterlösung: vollständige Nachricht mit Anrede und Gruß, mit einem echten Zeilenumbruch zwischen den Absätzen' },
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
      fallbackModel: FALLBACK_MODEL,
      timeoutMs: 60_000, // Aufgaben-Generierung darf länger dauern
      system: SYSTEM_PROMPT,
      user:
        'Erstelle eine Teil-1-Aufgabe: eine kurze Situation ("Sie …"), in der die Testperson etwas sucht, und ' +
        'genau 3 Kleinanzeigen (a, b, c). Nur eine Anzeige erfüllt wirklich ALLE Details der Situation. Die ' +
        'anderen beiden Anzeigen müssen zum gleichen Thema passen, aber jeweils in genau einem konkreten Detail ' +
        'nicht zur Situation passen (z. B. falscher Ort, falsche Uhrzeit, falscher Preis, falsche Zielgruppe, ' +
        'fehlende Voraussetzung) - nicht ein komplett anderes Thema. Erkläre am Ende kurz, warum die Lösung ' +
        'richtig ist und an welchem Detail die anderen beiden jeweils scheitern.',
      responseSchema: TEIL1_SCHEMA,
      zodSchema: GeneratedTeil1Schema,
    })
    return { id, set, ...result }
  }

  if (data.part === 2) {
    const result = await geminiJson({
      model: MODEL,
      fallbackModel: FALLBACK_MODEL,
      timeoutMs: 60_000, // Aufgaben-Generierung darf länger dauern
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
      fallbackModel: FALLBACK_MODEL,
      timeoutMs: 60_000, // Aufgaben-Generierung darf länger dauern
      system: SYSTEM_PROMPT,
      user:
        'Erstelle eine Teil-3-Aufgabe: einen kurzen Sachtext (2-3 Absätze) und genau 3 mögliche Überschriften. ' +
        'Nur eine Überschrift fasst den Text wirklich korrekt zusammen. Die anderen beiden müssen plausibel zum ' +
        'Thema des Textes klingen, aber einen falschen Fokus, ein falsches Detail oder eine im Text nicht ' +
        'gezogene Schlussfolgerung enthalten - nicht offensichtlich themenfremd sein.',
      responseSchema: TEIL3_SCHEMA,
      zodSchema: GeneratedTeil3Schema,
    })
    return { id, set, ...result }
  }

  const result = await geminiJson({
    model: MODEL,
    fallbackModel: FALLBACK_MODEL,
    timeoutMs: 60_000, // Aufgaben-Generierung darf länger dauern
    system: SYSTEM_PROMPT,
    user:
      'Erstelle eine Teil-4-Aufgabe: eine Alltagssituation, in der die Testperson (direkt mit "Sie" angesprochen) ' +
      'eine kurze Nachricht schreiben muss - im gleichen Ton wie: "Sie sind krank und können morgen nicht zur ' +
      'Arbeit kommen. Schreiben Sie eine Nachricht an Ihre Kollegin." Kein erfundener Name für die Testperson ' +
      'selbst, nur ggf. für die Person, an die geschrieben wird. Dazu genau 4 Punkte, die die Nachricht behandeln ' +
      'soll, und eine Musterlösung mit passender Anrede und Gruß.',
    responseSchema: TEIL4_SCHEMA,
    zodSchema: GeneratedTeil4Schema,
  })
  return { id, set, ...result }
}
