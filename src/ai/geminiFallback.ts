/* Bewertung & Übersetzung: primär Gemini, mit automatischem Ausweich auf DeepSeek,
   falls Gemini (samt seines eigenen Modell-Fallbacks) fehlschlägt - z. B. bei
   Überlastung, Rate-Limit oder einem Netzwerkfehler.

   Anders als die Anbieterwahl in aiProvider.ts (nur für Fragenerstellung &
   -evolution, dort bewusst eine Nutzerentscheidung) ist das hier KEIN Umschalten:
   Gemini bleibt immer der Standard, DeepSeek springt nur automatisch ein, wenn
   Gemini gerade nicht antwortet - unabhängig davon, was in den Einstellungen oben
   ausgewählt ist.

   Braucht natürlich einen eingerichteten DeepSeek-Proxy (VITE_DEEPSEEK_PROXY_URL).
   Ist der nicht gesetzt, schlägt der Fallback selbst fehl, oder enthält die Anfrage
   Audiodaten (DeepSeeks Chat-API kann keine Audiodaten verarbeiten) - dann wird
   einfach der ursprüngliche Gemini-Fehler weitergereicht, ganz so, als gäbe es
   diese Funktion nicht. */
import { geminiJson, type GeminiJsonOpts } from './geminiClient'
import { deepseekJson } from './deepseekClient'

export async function geminiJsonWithDeepseekFallback<T>(opts: GeminiJsonOpts<T>): Promise<T> {
  try {
    return await geminiJson(opts)
  } catch (geminiError) {
    if (opts.audio) throw geminiError
    if (!import.meta.env.VITE_DEEPSEEK_PROXY_URL) throw geminiError
    if (opts.signal?.aborted) throw geminiError // Nutzer hat abgebrochen - kein Sinn, noch DeepSeek zu versuchen

    console.warn('[geminiFallback] Gemini fehlgeschlagen, weiche auf DeepSeek aus:', geminiError)
    try {
      return await deepseekJson({
        system: opts.system,
        user: opts.user,
        history: opts.history,
        responseSchema: opts.responseSchema,
        zodSchema: opts.zodSchema,
        thinkingLevel: opts.thinkingLevel,
        timeoutMs: opts.timeoutMs,
        signal: opts.signal,
        onAttempt: opts.onAttempt,
      })
    } catch (deepseekError) {
      const geminiMsg = geminiError instanceof Error ? geminiError.message : String(geminiError)
      const deepseekMsg = deepseekError instanceof Error ? deepseekError.message : String(deepseekError)
      throw new Error(`Gemini fehlgeschlagen: ${geminiMsg}\nDeepSeek-Ausweich ebenfalls fehlgeschlagen: ${deepseekMsg}`)
    }
  }
}
