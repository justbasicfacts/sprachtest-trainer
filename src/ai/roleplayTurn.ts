/* Ein Gesprächszug im Dialog-Rollenspiel: Die KI antwortet in ihrer Rolle auf
   das, was der Lernende gerade gesagt hat.

   Der bisherige Verlauf geht als `history` an Gemini - deshalb bleibt das
   Gespräch zusammenhängend, ohne dass bei jedem Zug die ganze Situation neu
   erklärt werden müsste. Pro Zug entsteht genau ein Aufruf; die Übung begrenzt
   die Zahl der Züge. */
import { z } from 'zod'
import type { RoleplayExercise } from '../data/types'
import { geminiJson, type GeminiSchema, type GeminiTurn } from './geminiClient'

const TurnSchema = z.object({
  reply: z.string(),
  nudge: z.string().optional(),
  done: z.boolean(),
})

export type RoleplayTurnResult = z.infer<typeof TurnSchema>

const SYSTEM_PROMPT = `Du spielst eine Gesprächsrolle für einen Deutschlerner auf B1-Niveau, der sich auf den
Berliner Sprachtest für die Einbürgerung vorbereitet. Bleib konsequent in deiner Rolle und antworte so, wie die
Person es im echten Leben täte.

Regeln:
- Antworte auf einfachem, natürlichem Deutsch (B1). Kurze Sätze, Alltagssprache.
- Antworte NIE länger als zwei bis drei Sätze - es ist ein Gespräch, kein Vortrag.
- Stell möglichst oft eine Rückfrage oder bring einen kleinen Einwand, damit der Lernende weiterreden muss.
- Bleib freundlich, auch wenn deine Rolle erst einmal anderer Meinung ist. Gib nicht sofort nach: Ein bisschen
  Widerstand ist genau das, was geübt werden soll.
- Korrigiere den Lernenden NICHT in deiner Rollen-Antwort ("reply"). Wenn ein Fehler das Verständnis stört oder
  sich wiederholt, gehört ein sehr kurzer Hinweis in "nudge" (ein Satz, außerhalb der Rolle). Bei fehlerfreien
  oder nur leicht holprigen Beiträgen bleibt "nudge" leer.
- Setze "done" auf true, sobald das Gesprächsziel erreicht ist und ein natürlicher Abschluss gefunden wurde.

Antworte ausschließlich auf Deutsch und exakt im vorgegebenen JSON-Schema.`

const RESPONSE_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    reply: { type: 'STRING', description: 'Deine Antwort in der Rolle, zwei bis drei Sätze, B1-Deutsch' },
    nudge: {
      type: 'STRING',
      description:
        'Optionaler, sehr kurzer Sprachhinweis außerhalb der Rolle (ein Satz) - nur bei einem störenden oder ' +
        'wiederholten Fehler, sonst leer lassen',
    },
    done: { type: 'BOOLEAN', description: 'true, wenn das Gesprächsziel erreicht und das Gespräch rund beendet ist' },
  },
  required: ['reply', 'done'],
}

export async function roleplayTurn(input: {
  data: {
    exercise: RoleplayExercise
    /** Bisheriger Verlauf: 'user' = Lernender, 'model' = Rolle der KI */
    history: GeminiTurn[]
    /** Was der Lernende gerade gesagt hat */
    say: string
    /** Letzter eigener Zug? Dann soll die KI zum Abschluss kommen. */
    lastTurn: boolean
  }
  signal?: AbortSignal
}): Promise<RoleplayTurnResult> {
  const { exercise, history, say, lastTurn } = input.data

  const user =
    `Situation: ${exercise.situation}\n` +
    `Deine Rolle: ${exercise.partnerRole}\n` +
    `Ziel des Lernenden: ${exercise.goal}\n` +
    // Der Eröffnungssatz steht nicht im Verlauf, weil ein Gemini-Verlauf mit
    // einem 'user'-Zug beginnen muss - deshalb hier als Kontext.
    `Du hast das Gespräch eröffnet mit: "${exercise.opener}"\n` +
    (lastTurn ? 'Das ist der LETZTE Redebeitrag des Lernenden - bring das Gespräch jetzt zu einem freundlichen Abschluss.\n' : '') +
    `\nDer Lernende sagt gerade:\n"""\n${say}\n"""\n\n` +
    'Antworte in deiner Rolle.'

  return await geminiJson({
    model: 'gemini-3.5-flash',
    fallbackModel: 'gemini-3.1-flash-lite',
    timeoutMs: 45_000,
    system: SYSTEM_PROMPT,
    user,
    history,
    responseSchema: RESPONSE_SCHEMA,
    zodSchema: TurnSchema,
    signal: input.signal,
  })
}
