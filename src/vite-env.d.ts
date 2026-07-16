/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Gemini API-Key (aus .env bzw. GitHub-Actions-Secret; wird ins Client-Bundle eingebettet). */
  readonly VITE_GEMINI_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
