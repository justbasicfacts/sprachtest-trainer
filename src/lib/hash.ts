/* Kleine Helper-Funktion zum SHA-256-Hashen eines Strings (Web Crypto API, im Browser
   verfügbar, kein Zusatzpaket nötig). Genutzt vom PasswordGate - siehe dort für den
   Kontext und wofür (und wofür NICHT) das gut ist. */
export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
