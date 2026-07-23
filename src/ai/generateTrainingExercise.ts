/* Erstellt per Gemini eine neue Übung zu einer Trainings-Fähigkeit (gezieltes
   Training), im gleichen Format wie die statischen Übungen in data/training.ts.
   Läuft direkt im Browser, gleiche Aufruf-Signatur wie die anderen ai/*-Funktionen. */
import { z } from 'zod'
import type { TrainingExercise, TrainingSkill } from '../data/types'
import { geminiJson, type GeminiSchema } from './geminiClient'

const ExerciseSchema = z.object({
  instruction: z.string(),
  prompt: z.string(),
  hint: z.string().optional(),
  sampleAnswer: z.string(),
})

const SYSTEM_PROMPT = `Du erstellst Übungen für Deutschlerner auf B1-Niveau, die sich auf den Berliner
Sprachtest für die Einbürgerung vorbereiten. Jede Übung trainiert gezielt EINE bestimmte Fähigkeit (z. B.
eine Grammatikstruktur oder eine Sprech-Technik) - nicht das ganze Prüfungsformat. Erfinde jedes Mal ein neues,
konkretes Beispiel; wiederhole nicht die exakten Sätze aus schon vorhandenen Übungen. Antworte ausschließlich
auf Deutsch und exakt im vorgegebenen JSON-Schema.`

const RESPONSE_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    instruction: { type: 'STRING', description: 'Kurze Anweisung, was zu tun ist (1 Satz)' },
    prompt: { type: 'STRING', description: 'Die konkrete Aufgabe: Situation, Lückensatz oder zwei zu verbindende Sätze' },
    hint: { type: 'STRING', description: 'Formulierungshilfe: Satzanfang oder die gesuchte Struktur als Beispiel' },
    sampleAnswer: { type: 'STRING', description: 'Eine vollständige, korrekte Musterlösung' },
  },
  required: ['instruction', 'prompt', 'sampleAnswer'],
}

export async function generateTrainingExercise(skill: TrainingSkill): Promise<TrainingExercise> {
  const existingPrompts = skill.exercises.map((e) => `- ${e.prompt}`).join('\n')

  const user =
    `Fähigkeit: "${skill.title}"\n` +
    `Worum es geht: ${skill.focus}\n` +
    `Übungsform: ${skill.mode === 'speak' ? 'Der Lernende spricht die Antwort (Mikrofon)' : 'Der Lernende schreibt die Antwort'}\n` +
    (existingPrompts ? `\nSchon vorhandene Aufgaben (nicht wiederholen, aber gleiche Art):\n${existingPrompts}\n` : '') +
    '\nErstelle EINE neue Übung zu genau dieser Fähigkeit, im gleichen Format wie die vorhandenen: eine kurze ' +
    'Anweisung, eine konkrete Aufgabe, optional eine Formulierungshilfe und eine vollständige Musterlösung.'

  const result = await geminiJson({
    model: 'gemini-3.5-flash',
    fallbackModel: 'gemini-3.1-flash-lite',
    timeoutMs: 60_000,
    thinkingLevel: 'MEDIUM',
    system: SYSTEM_PROMPT,
    user,
    responseSchema: RESPONSE_SCHEMA,
    zodSchema: ExerciseSchema,
  })

  return { id: `ai-${crypto.randomUUID()}`, ...result }
}
