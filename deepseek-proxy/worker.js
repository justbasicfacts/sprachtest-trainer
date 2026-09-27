/* Kleiner Proxy für DeepSeeks Chat-API - läuft als Cloudflare Worker.

   Warum es diesen Proxy überhaupt braucht (anders als bei Gemini, das der
   Haupt-App direkt aus dem Browser aufruft): DeepSeek hat keinen kostenlosen
   Free-Tier-Key, den man gefahrlos ins öffentliche JS-Bundle einer statischen
   Seite einbetten könnte, und es ist nicht dokumentiert, ob DeepSeeks API
   überhaupt CORS für Browser-Anfragen erlaubt. Dieser Worker hält den echten
   DeepSeek-Key als Secret (nur hier auf Cloudflares Servern, nie im Browser
   sichtbar), setzt saubere CORS-Header für genau den erlaubten Origin und
   reicht die Anfrage 1:1 an DeepSeek weiter.

   Der Worker kennt nichts von "Prüfungsaufgaben" oder "Übungen" - er ist ein
   reiner, dummer Durchreicher für einen fertig zusammengebauten Chat-Completion-
   Request (siehe src/ai/deepseekClient.ts in der Haupt-App). Das hält ihn klein
   und macht ihn für jedes andere Projekt wiederverwendbar, das DeepSeek aus dem
   Browser heraus ansprechen will. */

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'

function corsHeaders(origin, allowedOrigins) {
  const allowOrigin = allowedOrigins.includes('*')
    ? '*'
    : allowedOrigins.includes(origin)
      ? origin
      : null

  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Proxy-Token',
    Vary: 'Origin',
  }
  if (allowOrigin) headers['Access-Control-Allow-Origin'] = allowOrigin
  return headers
}

function parseAllowedOrigins(env) {
  return (env.ALLOWED_ORIGIN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? ''
    const allowedOrigins = parseAllowedOrigins(env)
    const cors = corsHeaders(origin, allowedOrigins)

    // Preflight - Browser fragt vorab, ob die eigentliche POST-Anfrage erlaubt ist.
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    if (request.method !== 'POST') {
      return json({ error: { message: 'Nur POST erlaubt.' } }, 405, cors)
    }

    // Kein bekannter/erlaubter Origin konfiguriert oder Anfrage kommt von woanders:
    // ohne Access-Control-Allow-Origin-Header verwirft der Browser die Antwort
    // ohnehin, aber wir lehnen hier zusätzlich explizit ab (z. B. für Tools, die
    // CORS nicht respektieren).
    if (allowedOrigins.length === 0) {
      return json({ error: { message: 'Proxy ist nicht konfiguriert (ALLOWED_ORIGIN fehlt).' } }, 500, cors)
    }
    if (!allowedOrigins.includes('*') && !allowedOrigins.includes(origin)) {
      return json({ error: { message: 'Origin nicht erlaubt.' } }, 403, cors)
    }

    // Optionales gemeinsames Geheimnis zwischen App und Proxy (siehe README) - kein
    // Ersatz für echte Auth (der Token liegt im öffentlichen Bundle der App), aber
    // verhindert, dass jemand die Proxy-URL findet und einfach mitbenutzt.
    if (env.PROXY_TOKEN) {
      const given = request.headers.get('X-Proxy-Token')
      if (given !== env.PROXY_TOKEN) {
        return json({ error: { message: 'Ungültiger oder fehlender Proxy-Token.' } }, 401, cors)
      }
    }

    if (!env.DEEPSEEK_API_KEY) {
      return json({ error: { message: 'Proxy ist nicht konfiguriert (DEEPSEEK_API_KEY fehlt).' } }, 500, cors)
    }

    let body
    try {
      body = await request.text()
    } catch {
      return json({ error: { message: 'Anfrage-Body konnte nicht gelesen werden.' } }, 400, cors)
    }

    let upstream
    try {
      upstream = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body,
      })
    } catch (err) {
      return json({ error: { message: `DeepSeek nicht erreichbar: ${err instanceof Error ? err.message : String(err)}` } }, 502, cors)
    }

    // Antwort 1:1 durchreichen (Status + Body), nur die CORS-Header ergänzen -
    // deepseekClient.ts in der App kümmert sich um Fehlerformat/Retry-Logik.
    const responseBody = await upstream.text()
    return new Response(responseBody, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  },
}

function json(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
}
