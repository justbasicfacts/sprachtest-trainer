/* DeepSeek-Client für Fragenerstellung & -evolution.

   Läuft ANDERS als der Gemini-Client NICHT direkt gegen api.deepseek.com im
   Browser: DeepSeek hat keinen kostenlosen Free-Tier wie Gemini, ein im
   öffentlichen JS-Bundle eingebetteter Key wäre also ein echtes Kostenrisiko,
   und (anders als bei Gemini) ist nicht dokumentiert, ob DeepSeeks API überhaupt
   CORS für Browser-Anfragen erlaubt. Deshalb ruft dieser Client stattdessen einen
   kleinen eigenen Proxy auf (siehe deepseek-proxy/ im Repo-Root), der den echten
   API-Key serverseitig hält (als Secret, nie im Browser sichtbar) und die
   Anfrage an DeepSeek weiterreicht. Ohne VITE_DEEPSEEK_PROXY_URL funktioniert
   diese Option einfach nicht - Gemini bleibt davon unberührt.

   DeepSeeks Chat-API ist OpenAI-kompatibel, kennt aber keinen erzwungenen
   responseSchema wie Gemini. Stattdessen: JSON-Modus (response_format:
   json_object) plus das Schema als Textbeschreibung im System-Prompt - die
   Antwort wird genau wie bei Gemini anschließend per zod validiert. */
import type { AiJsonOpts } from './aiTypes'
import { fixDoubleEscapedNewlines, combineSignals, geminiSchemaToJsonSchema } from './jsonUtils'

function readProxyUrl(): string {
  const url = import.meta.env.VITE_DEEPSEEK_PROXY_URL
  if (!url) {
    throw new Error(
      'VITE_DEEPSEEK_PROXY_URL ist nicht gesetzt. Ohne einen deployten Proxy (siehe deepseek-proxy/README.md) ' +
        'lässt sich DeepSeek nicht verwenden - entweder den Proxy einrichten oder in den Einstellungen oben ' +
        'wieder auf Gemini wechseln.'
    )
  }
  return url
}

/** Fehler mit HTTP-Status, damit die Retry-Logik transiente Fälle erkennen kann. */
class DeepseekHttpError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

/* 429 = Rate-Limit, 500/503 = Server überlastet/Fehler, Timeout/Netzwerkfehler =
   Verbindung hängt - alles transient, ein Wiederholen kann helfen. Alles andere
   (400/401/403/404, z. B. ein falsch konfigurierter Proxy) ist ein echter Fehler. */
function isTransient(error: unknown): boolean {
  if (error instanceof DeepseekHttpError) return error.status === 429 || error.status === 500 || error.status === 503
  if (error instanceof DOMException) return error.name === 'TimeoutError' || error.name === 'AbortError'
  return error instanceof TypeError // Netzwerkfehler von fetch
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** deepseek-chat (V3) reicht für die meisten Aufgaben und ist schnell; deepseek-reasoner
    (R1) nur für Aufgaben, die bei Gemini thinkingLevel 'HIGH' bekommen - plausible,
    nicht-triviale Distraktoren erfinden braucht echtes Abwägen, dafür ist der
    Reasoner besser geeignet (kostet aber mehr Zeit). */
function pickModel(thinkingLevel: AiJsonOpts<unknown>['thinkingLevel']): string {
  return thinkingLevel === 'HIGH' ? 'deepseek-reasoner' : 'deepseek-chat'
}

/** Ein strukturierter JSON-Aufruf über den DeepSeek-Proxy: System-Prompt + User-Prompt
    → per zod validiertes Objekt. Bei Überlastung: bis zu 3 Versuche mit Backoff. */
export async function deepseekJson<T>(opts: AiJsonOpts<T>): Promise<T> {
  const url = readProxyUrl()
  const model = pickModel(opts.thinkingLevel)
  const delays = [0, 1500, 4000] // ms vor Versuch 1, 2, 3
  let lastError: unknown

  const abortedError = () => new Error('Abgebrochen. Du kannst es jederzeit erneut versuchen.')

  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (opts.signal?.aborted) throw abortedError()
    if (delays[attempt] > 0) await sleep(delays[attempt])
    if (opts.signal?.aborted) throw abortedError()
    opts.onAttempt?.({ attempt: attempt + 1, model, isFallback: false })
    try {
      return await callOnce(model, url, opts)
    } catch (error) {
      if (opts.signal?.aborted) throw abortedError()
      lastError = error
      if (!isTransient(error)) break // 400er usw.: sofort aufgeben
      console.warn(`[deepseekClient] ${model} Versuch ${attempt + 1} fehlgeschlagen:`, error)
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError)
  throw new Error(
    isTransient(lastError)
      ? `DeepSeek ist gerade überlastet (${msg}). Bitte in ein paar Sekunden noch einmal versuchen.`
      : msg
  )
}

async function callOnce<T>(model: string, proxyUrl: string, opts: AiJsonOpts<T>): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(opts.timeoutMs ?? 30_000)
  const signal = opts.signal ? combineSignals([timeoutSignal, opts.signal]) : timeoutSignal

  // Kein natives responseSchema wie bei Gemini - das Schema geht als Textbeschreibung
  // mit in den System-Prompt, die tatsächliche Validierung übernimmt danach zod.
  const jsonSchema = geminiSchemaToJsonSchema(opts.responseSchema)
  const systemWithSchema =
    `${opts.system}\n\n` +
    'Antworte AUSSCHLIESSLICH mit einem einzigen JSON-Objekt (kein Markdown, keine Code-Fences, kein Text ' +
    `davor oder danach), das exakt diesem JSON-Schema entspricht:\n${JSON.stringify(jsonSchema)}`

  const messages = [
    { role: 'system', content: systemWithSchema },
    ...(opts.history ?? []).map((turn) => ({
      role: turn.role === 'model' ? 'assistant' : 'user',
      content: turn.text,
    })),
    { role: 'user', content: opts.user },
  ]

  // Optionales gemeinsames Geheimnis zwischen App und Proxy (siehe deepseek-proxy/README.md) -
  // kein Ersatz für echte Auth, aber verhindert, dass jemand, der die Proxy-URL im
  // öffentlichen Bundle findet, sie einfach für eigene Zwecke mitbenutzt.
  const proxyToken = import.meta.env.VITE_DEEPSEEK_PROXY_TOKEN

  const res = await fetch(proxyUrl, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(proxyToken ? { 'X-Proxy-Token': proxyToken } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: 'json_object' },
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
    throw new DeepseekHttpError(`DeepSeek-Anfrage fehlgeschlagen: ${message}`, res.status)
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('DeepSeek hat keine Antwort geliefert.')

  return opts.zodSchema.parse(fixDoubleEscapedNewlines(JSON.parse(text)))
}
