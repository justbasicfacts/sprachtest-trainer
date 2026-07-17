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

/** Fehler mit HTTP-Status, damit die Retry-Logik transiente Fälle erkennen kann. */
class GeminiHttpError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

/* 503 = Modell überlastet, 429 = Rate-Limit (beim Free-Tier beides häufig und
   transient), 500 = interner Fehler, Timeout/Netzwerkfehler = Verbindung hängt.
   Alles andere (400/403/404) ist ein echter Fehler, bei dem Wiederholen nichts bringt. */
function isTransient(error: unknown): boolean {
  if (error instanceof GeminiHttpError) return error.status === 503 || error.status === 429 || error.status === 500
  if (error instanceof DOMException) return error.name === 'TimeoutError' || error.name === 'AbortError'
  return error instanceof TypeError // Netzwerkfehler von fetch
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Kombiniert mehrere AbortSignals zu einem (ohne auf AbortSignal.any angewiesen zu
    sein, das nicht in jedem Zielbrowser verfügbar ist). */
function combineSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()
  for (const s of signals) {
    if (s.aborted) {
      controller.abort(s.reason)
      break
    }
    s.addEventListener('abort', () => controller.abort(s.reason), { once: true })
  }
  return controller.signal
}

/** Gemini-Schema im REST-Format (Teilmenge von OpenAPI, Typen in GROSSBUCHSTABEN). */
export type GeminiSchema = Record<string, unknown>

interface GeminiJsonOpts<T> {
  model: string
  /** Ausweichmodell, wenn das Hauptmodell überlastet bleibt (503/429). */
  fallbackModel?: string
  system: string
  user: string
  /** Optionale Audiodaten (z. B. eine Sprachaufnahme), die Gemini mit analysieren soll. */
  audio?: { mimeType: string; base64: string }
  responseSchema: GeminiSchema
  zodSchema: z.ZodType<T>
  /** Abbruch pro Versuch in ms (Standard 30 s) - sonst kann eine hängende
      Verbindung ewig im "pending"-Zustand bleiben und der Retry greift nie. */
  timeoutMs?: number
  /** Externes Abbrechen (z. B. ein "Abbrechen"-Button in der UI) - bricht den
      laufenden Versuch UND alle weiteren Retries/den Fallback sofort ab. */
  signal?: AbortSignal
  /** Wird vor jedem Versuch aufgerufen, z. B. um "Versuch 2/3 …" oder "Weiche auf
      leichteres Modell aus" in der UI anzuzeigen, statt dass die Oberfläche beim
      Warten auf Retries/Fallback wie eingefroren wirkt. */
  onAttempt?: (info: { attempt: number; model: string; isFallback: boolean }) => void
}

/** Ein strukturierter JSON-Aufruf: System-Prompt + User-Prompt → per zod validiertes Objekt.
    Bei Überlastung (503/429): bis zu 3 Versuche mit Backoff, danach 1 Versuch mit dem
    Ausweichmodell. */
export async function geminiJson<T>(opts: GeminiJsonOpts<T>): Promise<T> {
  const key = readGeminiApiKey()
  const delays = [0, 1500, 4000] // ms vor Versuch 1, 2, 3
  let lastError: unknown

  const abortedError = () => new Error('Abgebrochen. Du kannst es jederzeit erneut versuchen.')

  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (opts.signal?.aborted) throw abortedError()
    if (delays[attempt] > 0) await sleep(delays[attempt])
    if (opts.signal?.aborted) throw abortedError()
    opts.onAttempt?.({ attempt: attempt + 1, model: opts.model, isFallback: false })
    try {
      return await callOnce(opts.model, key, opts)
    } catch (error) {
      if (opts.signal?.aborted) throw abortedError()
      lastError = error
      if (!isTransient(error)) break // 400er usw.: sofort aufgeben
      console.warn(`[geminiClient] ${opts.model} Versuch ${attempt + 1} fehlgeschlagen:`, error)
    }
  }

  if (opts.fallbackModel && isTransient(lastError) && !opts.signal?.aborted) {
    console.warn(`[geminiClient] weiche auf ${opts.fallbackModel} aus`)
    opts.onAttempt?.({ attempt: 1, model: opts.fallbackModel, isFallback: true })
    try {
      return await callOnce(opts.fallbackModel, key, opts)
    } catch (fallbackError) {
      lastError = opts.signal?.aborted ? abortedError() : fallbackError
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError)
  throw new Error(
    isTransient(lastError)
      ? `Die KI ist gerade überlastet (${msg}). Bitte in ein paar Sekunden noch einmal versuchen.`
      : msg
  )
}

async function callOnce<T>(model: string, key: string, opts: GeminiJsonOpts<T>): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(opts.timeoutMs ?? 30_000)
  const signal = opts.signal ? combineSignals([timeoutSignal, opts.signal]) : timeoutSignal
  const res = await fetch(`${API_BASE}/${model}:generateContent`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: [
        {
          role: 'user',
          parts: [
            { text: opts.user },
            ...(opts.audio ? [{ inline_data: { mime_type: opts.audio.mimeType, data: opts.audio.base64 } }] : []),
          ],
        },
      ],
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
    throw new GeminiHttpError(`Gemini-Anfrage fehlgeschlagen: ${message}`, res.status)
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('')
  if (!text) throw new Error('Gemini hat keine Antwort geliefert.')

  return opts.zodSchema.parse(JSON.parse(text))
}
