/* Übersetzt ein einzelnes deutsches Wort (im Satzkontext) per Gemini ins Englische
   und Türkische - für das Doppelklick-Wörterbuch in Lesetexten. Läuft direkt im
   Browser (statisches Hosting ohne Server); gleiche Aufruf-Signatur wie die
   frühere Serverfunktion: translateWord({ data: { word, context } }). */
import { z } from 'zod'
import { geminiJson } from './geminiClient'

const TranslateWordInput = z.object({
  word: z.string().min(1).max(60),
  context: z.string().max(2000).optional(),
})

const TranslationSchema = z.object({
  base: z.string(),
  en: z.string(),
  tr: z.string(),
})

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    base: {
      type: 'STRING',
      description:
        'Grundform (Lemma) des Wortes auf Deutsch - bei Nomen mit Artikel (z. B. "die Wohnung"), ' +
        'bei Verben der Infinitiv (z. B. "gehen")',
    },
    en: { type: 'STRING', description: 'Englische Übersetzung, passend zum Satzkontext' },
    tr: { type: 'STRING', description: 'Türkische Übersetzung, passend zum Satzkontext' },
  },
  required: ['base', 'en', 'tr'],
}

export async function translateWord(input: { data: { word: string; context?: string } }) {
  const data = TranslateWordInput.parse(input.data)

  return geminiJson({
    model: 'gemini-3.1-flash-lite', // günstigstes Modell, für Übersetzung/einfache Aufgaben optimiert
    system:
      'Du bist ein präzises Deutsch-Englisch-Türkisch-Wörterbuch für Deutschlerner (Niveau B1). ' +
      'Antworte extrem knapp, ohne zusätzliche Erklärungen oder ganze Sätze.',
    user: data.context
      ? `Wort: "${data.word}"\nSatzkontext: "${data.context}"\nÜbersetze das Wort so, wie es in diesem Kontext gemeint ist.`
      : `Wort: "${data.word}"`,
    responseSchema: RESPONSE_SCHEMA,
    zodSchema: TranslationSchema,
  })
}
