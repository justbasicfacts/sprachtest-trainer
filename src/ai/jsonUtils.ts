/* Kleine Hilfsfunktionen, die sowohl der Gemini- als auch der DeepSeek-Client
   brauchen - anbieterunabhängig, deshalb hier statt in geminiClient.ts. */

/** Manche Modelle "escapen" Zeilenumbrüche in JSON-String-Werten doppelt, wenn ihr
    Prompt/Schema wörtlich "\n" erwähnt: statt eines echten Zeilenumbruchs liefern sie
    dann das literale Zeichenpaar Backslash+n, das nach dem JSON.parse als sichtbares
    "\n" im Text auftaucht statt als Zeilenumbruch. Das räumt das rekursiv in allen
    Strings des geparsten Objekts auf, bevor zod validiert. */
export function fixDoubleEscapedNewlines<T>(value: T): T {
  if (typeof value === 'string') {
    return value.replace(/\\n/g, '\n') as unknown as T
  }
  if (Array.isArray(value)) {
    return value.map((v) => fixDoubleEscapedNewlines(v)) as unknown as T
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, fixDoubleEscapedNewlines(v)])
    ) as T
  }
  return value
}

/** Kombiniert mehrere AbortSignals zu einem (ohne auf AbortSignal.any angewiesen zu
    sein, das nicht in jedem Zielbrowser verfügbar ist). */
export function combineSignals(signals: AbortSignal[]): AbortSignal {
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

/** Gemini-REST-Schema (Typen in GROSSBUCHSTABEN: OBJECT, STRING, ARRAY, INTEGER, ...)
    in ein normales JSON-Schema (Typen klein geschrieben) umwandeln. Gebraucht, um
    dieselbe Schema-Definition (einmal pro Aufgabe/Übung geschrieben) auch für
    DeepSeeks OpenAI-kompatible API zu verwenden, statt sie pro Anbieter doppelt zu
    pflegen - DeepSeeks JSON-Modus bekommt das umgewandelte Schema als Textbeschreibung
    im Prompt (siehe deepseekClient.ts), Gemini bekommt das Original direkt als
    responseSchema. */
const TYPE_MAP: Record<string, string> = {
  OBJECT: 'object',
  STRING: 'string',
  ARRAY: 'array',
  INTEGER: 'integer',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
}

export function geminiSchemaToJsonSchema(schema: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const type = schema.type
  if (typeof type === 'string') out.type = TYPE_MAP[type] ?? type.toLowerCase()
  if (typeof schema.description === 'string') out.description = schema.description
  if (schema.properties && typeof schema.properties === 'object') {
    out.properties = Object.fromEntries(
      Object.entries(schema.properties as Record<string, Record<string, unknown>>).map(([k, v]) => [
        k,
        geminiSchemaToJsonSchema(v),
      ])
    )
  }
  if (Array.isArray(schema.required)) out.required = schema.required
  if (schema.items && typeof schema.items === 'object') {
    out.items = geminiSchemaToJsonSchema(schema.items as Record<string, unknown>)
  }
  if (typeof schema.minItems === 'number') out.minItems = schema.minItems
  if (typeof schema.maxItems === 'number') out.maxItems = schema.maxItems
  return out
}
