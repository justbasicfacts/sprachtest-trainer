/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Gemini API-Key (aus .env bzw. GitHub-Actions-Secret; wird ins Client-Bundle eingebettet). */
  readonly VITE_GEMINI_API_KEY?: string
  /** URL des DeepSeek-Proxys (siehe deepseek-proxy/README.md) - hält den echten DeepSeek-Key
      serverseitig, statt ihn wie bei Gemini ins öffentliche Bundle einzubetten. Ohne diese
      Variable funktioniert die DeepSeek-Option in den Einstellungen einfach nicht; Gemini
      bleibt davon unberührt. */
  readonly VITE_DEEPSEEK_PROXY_URL?: string
  /** Optionales gemeinsames Geheimnis zwischen App und Proxy - kein Ersatz für echte Auth
      (landet ebenfalls im öffentlichen Bundle), aber verhindert, dass jemand, der die
      Proxy-URL findet, sie einfach mitbenutzt. */
  readonly VITE_DEEPSEEK_PROXY_TOKEN?: string
  /** SHA-256-Hash (hex) des App-Passworts für den PasswordGate (siehe dort) - nie
      das Passwort selbst. Nicht gesetzt = App ungeschützt. */
  readonly VITE_ACCESS_PASSWORD_HASH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
