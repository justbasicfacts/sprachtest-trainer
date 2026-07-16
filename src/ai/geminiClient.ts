/* Gemeinsamer Gemini-Client - läuft komplett im Browser (statisches Hosting,
   z. B. GitHub Pages, ohne eigenen Server).

   Der API-Key kommt aus der Umgebungsdatei (.env lokal, GitHub-Actions-Secret im
   CI-Build) und wird von Vite zur Build-Zeit als VITE_GEMINI_API_KEY ins Bundle
   eingebettet. ACHTUNG: Bei einer öffentlichen Seite ist der Key damit für
   Besucher einsehbar - nur einen kostenlosen Free-Tier-Key verwenden. */
import { z } from 'zod'

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export function readGeminiApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) {
    throw new Error(
      'VITE_GEMINI_API_KEY ist nicht gesetzt. Lege einen kostenlosen Gemini API-Key in einer .env-Datei ab ' +
        '(siehe .env.example) - kostenlos erstellen unter https://aistudio.google.com/apikey'
    )
  }
  return key
}

/* Kleiner Retry-Wrapper: Gemini liefert gelegentlich (Netzwerk-Hänger, Rate-Limit,
   oder das Modell "verdenkt" sein Antwortbudget) kein brauchbares Ergebnis. Ein
   einmaliger Retry behebt die meisten transienten Fälle. */
async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (error) {
    console.warn('[geminiClient] erster Versuch fehlgeschlagen, wiederhole einmal:', error)
    try {
      return await run()
    } catch (retryError) {
      const first = error instanceof Error ? error.message : String(error)
      const second = retryError instanceof Error ? retryError.message : String(retryError)
      throw new Error(
        `KI-Antwort fehlgeschlagen (auch nach Wiederholung). Erster Versuch: "${first}". Zweiter Versuch: "${second}".`
      )
    }
  }
}

/** Gemini-Schema im REST-Format (Teilmenge von OpenAPI, Typen in GROSSBUCHSTABEN). */
export type GeminiSchema = Record<string, unknown>

/** Ein strukturierter JSON-Aufruf: System-Prompt + User-Prompt → per zod validiertes Objekt. */
export async function geminiJson<T>(opts: {
  model: string
  system: string
  user: string
  responseSchema: GeminiSchema
  zodSchema: z.ZodType<T>
}): Promise<T> {
  const key = readGeminiApiKey()

  return withRetry(async () => {
    const res = await fetch(`${API_BASE}/${opts.model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.system }] },
        contents: [{ role: 'user', parts: [{ text: opts.user }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: opts.responseSchema,
          // Ohne das spendet Gemini 3.x manchmal das gesamte Antwortbudget fürs
          // "Denken" und liefert nie den finalen JSON-Teil. Minimales Thinking
          // reicht für diese Aufgaben völlig aus.
          thinkingConfig: { thinkingLevel: 'LOW' },
        },
      }),
    })

    if (!res.ok) {
      let message = `HTTP ${res.status}`
      try {
        const err = (await res.json()) as { error?: { message?: string } }
        if (err.error?.message) message = err.error.message
      } catch {
        /* Fehlertext nicht parsebar - Statuscode reicht */
      }
      throw new Error(`Gemini-Anfrage fehlgeschlagen: ${message}`)
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('')
    if (!text) throw new Error('Gemini hat keine Antwort geliefert.')

    return opts.zodSchema.parse(JSON.parse(text))
  })
}
