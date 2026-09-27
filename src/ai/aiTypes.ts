/* Anbieterunabhängiger Aufruf-Typ für aiJson() (siehe aiProvider.ts) - der
   gemeinsame Nenner dessen, was sowohl geminiJson (geminiClient.ts) als auch
   deepseekJson (deepseekClient.ts) brauchen.

   Bewusst OHNE 'model'/'fallbackModel': Das sind Gemini-spezifische Modellnamen.
   Jeder Client wählt sein eigenes Modell selbst, gesteuert über 'thinkingLevel' -
   für Gemini "gemini-3.5-flash" mit Fallback auf "gemini-3.1-flash-lite", für
   DeepSeek "deepseek-chat" bzw. bei HIGH "deepseek-reasoner" (siehe dort). */
import type { z } from 'zod'
import type { GeminiSchema, GeminiTurn } from './geminiClient'

export interface AiJsonOpts<T> {
  system: string
  user: string
  /** Bisheriger Gesprächsverlauf, der VOR dem aktuellen user-Text steht (siehe GeminiTurn). */
  history?: GeminiTurn[]
  /** Gemini-REST-Schema (Typen in GROSSBUCHSTABEN) - für DeepSeek wird es automatisch
      in ein normales JSON-Schema umgewandelt (siehe jsonUtils.geminiSchemaToJsonSchema). */
  responseSchema: GeminiSchema
  zodSchema: z.ZodType<T>
  /** Wie viel "Denkbudget" die KI vor der finalen Antwort bekommt - LOW/MEDIUM reichen
      für die meisten Aufgaben, HIGH für echtes kreatives Abwägen (z. B. plausible,
      nicht-triviale Distraktoren erfinden). */
  thinkingLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
  /** Abbruch pro Versuch in ms (Standard 30 s). */
  timeoutMs?: number
  /** Externes Abbrechen (z. B. ein "Abbrechen"-Button in der UI). */
  signal?: AbortSignal
  /** Wird vor jedem Versuch aufgerufen, z. B. um "Versuch 2/3 …" in der UI anzuzeigen. */
  onAttempt?: (info: { attempt: number; model: string; isFallback: boolean }) => void
}
