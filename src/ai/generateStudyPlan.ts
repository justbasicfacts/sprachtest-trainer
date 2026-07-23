/* Erstellt per Google Gemini einen kurzen, persönlichen Lernplan nach einer
   Prüfungssimulation: 2-4 Schwerpunkte (die schwächsten Bereiche zuerst), jeweils
   mit einer kurzen Diagnose und konkreten Übungen. Läuft direkt im Browser,
   gleiche Aufruf-Signatur wie die anderen ai/*-Funktionen. */
import { z } from 'zod'
import { geminiJson, type GeminiSchema } from './geminiClient'

/** Ein einzelnes bewertetes Sprechteil aus der Prüfungssimulation (gleiche Form wie
    SpeakingPartResult aus ExamSpeaking.tsx - hier lokal definiert, damit ai/ nicht
    von components/ abhängt). */
export interface SpeakingResultInput {
  title: string
  points: number
  feedback: string
}

const SpeakingResultSchema = z.object({
  title: z.string(),
  points: z.number(),
  feedback: z.string(),
})

const GenerateStudyPlanInput = z.object({
  lesenPts: z.number(),
  lesenMax: z.number(),
  schreibPts: z.number(),
  schreibMax: z.number(),
  sprechenDetails: z.array(SpeakingResultSchema),
})

const FocusAreaSchema = z.object({
  area: z.string(),
  diagnosis: z.string(),
  exercises: z.array(z.string()).min(2).max(4),
})

const StudyPlanSchema = z.object({
  summary: z.string(),
  focusAreas: z.array(FocusAreaSchema).min(1).max(4),
})

export type StudyPlan = z.infer<typeof StudyPlanSchema>

const SYSTEM_PROMPT = `Du bist ein erfahrener, freundlicher Deutschlehrer für den Berliner Sprachtest zur
Einbürgerung (Deutsch-Niveau B1). Ein Lernender hat gerade eine Prüfungssimulation gemacht. Erstelle daraus
einen kurzen, persönlichen Lernplan: Was sollte er als Nächstes gezielt üben? Beziehe dich konkret auf die
gegebenen Ergebnisse und Feedback-Texte (z. B. welche Aufgabe schwach war, welche Formulierung falsch war) -
keine allgemeinen Floskeln. Sortiere die Schwerpunkte nach Priorität: die schwächsten Bereiche zuerst. Gib zu
jedem Schwerpunkt 2-4 sehr konkrete Übungen an, die er sofort ausprobieren kann (z. B. einen Beispielsatz zum
Nachsprechen/Nachschreiben, eine bestimmte Satzstruktur zum Üben, ein Wort, das er ersetzen soll). Antworte
ausschließlich auf Deutsch, B1-gerecht, motivierend aber ehrlich.`

const MODEL = 'gemini-3.5-flash'
// Wenn das Hauptmodell überlastet ist (503), auf das leichtere Modell ausweichen.
const FALLBACK_MODEL = 'gemini-3.1-flash-lite'

const RESPONSE_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    summary: {
      type: 'STRING',
      description: 'Kurze, motivierende Zusammenfassung der Prüfungsleistung (2-3 Sätze), bezogen auf die konkreten Ergebnisse',
    },
    focusAreas: {
      type: 'ARRAY',
      minItems: 1,
      maxItems: 4,
      description: '2-4 Lern-Schwerpunkte, schwächster Bereich zuerst',
      items: {
        type: 'OBJECT',
        properties: {
          area: { type: 'STRING', description: 'Kurzer Titel des Schwerpunkts, z. B. "Sprechen: Über ein Foto sprechen"' },
          diagnosis: { type: 'STRING', description: 'Was genau lief hier nicht optimal? 1-2 Sätze, konkret bezogen auf das Feedback' },
          exercises: {
            type: 'ARRAY',
            minItems: 2,
            maxItems: 4,
            items: { type: 'STRING' },
            description: '2-4 sehr konkrete Übungen/Beispielsätze/Formulierungen zum sofortigen Ausprobieren',
          },
        },
        required: ['area', 'diagnosis', 'exercises'],
      },
    },
  },
  required: ['summary', 'focusAreas'],
}

export async function generateStudyPlan(input: {
  data: {
    lesenPts: number
    lesenMax: number
    schreibPts: number
    schreibMax: number
    sprechenDetails: SpeakingResultInput[]
  }
}): Promise<StudyPlan> {
  const data = GenerateStudyPlanInput.parse(input.data)

  const lines = [
    `Lesen: ${data.lesenPts}/${data.lesenMax} Punkte`,
    `Schreiben: ${data.schreibPts}/${data.schreibMax} Punkte`,
  ]
  if (data.sprechenDetails.length > 0) {
    lines.push('Mündlicher Teil im Detail:')
    data.sprechenDetails.forEach((d) => {
      lines.push(`- ${d.title}: ${d.points}/5 Punkte. Feedback des Prüfers: "${d.feedback}"`)
    })
  }

  const user =
    lines.join('\n') +
    '\n\nErstelle daraus einen kurzen, persönlichen Lernplan mit 2-4 Schwerpunkten (schwächster Bereich ' +
    'zuerst) und je 2-4 konkreten Übungen pro Schwerpunkt.'

  return await geminiJson({
    model: MODEL,
    fallbackModel: FALLBACK_MODEL,
    timeoutMs: 60_000,
    system: SYSTEM_PROMPT,
    user,
    responseSchema: RESPONSE_SCHEMA,
    zodSchema: StudyPlanSchema,
  })
}
