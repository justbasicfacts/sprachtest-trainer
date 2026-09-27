/* Wahl des KI-Anbieters für Fragenerstellung & -evolution: Gemini oder DeepSeek.

   Bewusst nur für die drei Generierungs-Module gedacht, die Fragen/Übungen neu
   erstellen bzw. evolvieren (generateTask, generateTrainingExercise,
   generateMethodExercise) - alle anderen KI-Aufrufe (Bewertung, Übersetzung,
   Rollenspiel, Lernplan, ...) laufen unverändert direkt über geminiJson.

   Persistiert in localStorage, genau wie resultsStorage.ts: kein eigener Server,
   also kein Account - die Wahl gilt nur für diesen Browser. */
import { geminiJson } from './geminiClient'
import { deepseekJson } from './deepseekClient'
import type { AiJsonOpts } from './aiTypes'

export type AiProvider = 'gemini' | 'deepseek'

export const AI_PROVIDERS: { id: AiProvider; label: string; hint: string }[] = [
  { id: 'gemini', label: 'Gemini', hint: 'Google Gemini - kostenloser Free-Tier, direkt aus dem Browser' },
  { id: 'deepseek', label: 'DeepSeek', hint: 'DeepSeek - über einen eigenen Proxy (siehe deepseek-proxy/README.md)' },
]

const STORAGE_KEY = 'sprachtest:ai-provider'
const DEFAULT_PROVIDER: AiProvider = 'gemini'

function isAiProvider(v: unknown): v is AiProvider {
  return v === 'gemini' || v === 'deepseek'
}

/** Liest den gewählten Anbieter (Standard: Gemini, auch falls localStorage nicht
    verfügbar ist - z. B. Safari privater Modus). */
export function getAiProvider(): AiProvider {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return isAiProvider(v) ? v : DEFAULT_PROVIDER
  } catch {
    return DEFAULT_PROVIDER
  }
}

/** Speichert die Wahl (No-op, falls localStorage nicht verfügbar ist). */
export function setAiProvider(provider: AiProvider): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, provider)
  } catch {
    /* Speicher voll/deaktiviert - dann eben nicht persistieren, Auswahl gilt nur für diese Sitzung */
  }
}

// Für Gemini gelten weiterhin die bewährten Modellnamen aus generateTask.ts &
// Co. - hier zentral statt in jedem Aufrufer einzeln.
const GEMINI_MODEL = 'gemini-3.5-flash'
const GEMINI_FALLBACK_MODEL = 'gemini-3.1-flash-lite'

/** Ruft den aktuell gewählten Anbieter mit denselben Optionen auf. Aufrufer
    (generateTask.ts, generateTrainingExercise.ts, generateMethodExercise.ts)
    müssen sich nicht um Modellnamen kümmern - die wählt jeder Client selbst. */
export async function aiJson<T>(opts: AiJsonOpts<T>): Promise<T> {
  if (getAiProvider() === 'deepseek') {
    return deepseekJson(opts)
  }
  return geminiJson({
    model: GEMINI_MODEL,
    fallbackModel: GEMINI_FALLBACK_MODEL,
    ...opts,
  })
}
