/* Sprachauswahl über Google Website Translator.

   Warum nicht jeder Text von Hand übersetzt: Die App besteht aus mehreren
   tausend Zeilen mit deutschen Oberflächentexten. Google übersetzt die Seite in
   jede angebotene Sprache, ohne dass jede Zeichenkette doppelt gepflegt werden
   muss - und Lernende kommen aus sehr unterschiedlichen Sprachen.

   ENTSCHEIDEND dabei: Eine Seitenübersetzung würde auch den LERNSTOFF
   übersetzen - die Lesetexte, die Sätze zum Korrigieren, die Diktatsätze, die
   Vokabeln. Genau die müssen aber deutsch bleiben, sonst ist die Übung sinnlos.
   Deshalb ist aller Lernstoff mit <NoTranslate> ausgezeichnet (translate="no"),
   was Google - und ebenso die eingebaute Übersetzung von Chrome und Safari -
   respektiert. Übersetzt wird also nur die Bedienoberfläche: Menüs, Knöpfe,
   Anweisungen, Erklärungen.

   Hinweis: Das Skript kommt von Google und braucht eine Internetverbindung.
   Fehlt sie oder blockiert ein Browser das Skript, bleibt die App einfach
   komplett auf Deutsch - nichts geht kaputt. */
import { useEffect, useRef, useState } from 'react'
import { Box, Text } from './kit'

const SCRIPT_ID = 'google-translate-script'
const CONTAINER_ID = 'google_translate_element'

/** Sprachen, die für die Zielgruppe des Berliner Sprachtests naheliegen. */
const LANGUAGES = 'en,tr,ar,ru,uk,pl,ro,bg,fa,es,fr,it,vi'

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: {
          new (opts: Record<string, unknown>, containerId: string): unknown
          InlineLayout: { SIMPLE: unknown }
        }
      }
    }
    googleTranslateElementInit?: () => void
  }
}

export function LanguageSelector() {
  const [failed, setFailed] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    // React StrictMode ruft Effekte doppelt auf - der Translator darf aber nur
    // einmal initialisiert werden, sonst erscheinen zwei Auswahlfelder.
    if (initialized.current) return
    initialized.current = true

    window.googleTranslateElementInit = () => {
      const ctor = window.google?.translate?.TranslateElement
      if (!ctor) {
        setFailed(true)
        return
      }
      const container = document.getElementById(CONTAINER_ID)
      if (container) container.innerHTML = ''
      new ctor(
        {
          pageLanguage: 'de',
          includedLanguages: LANGUAGES,
          layout: ctor.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        CONTAINER_ID
      )
    }

    if (document.getElementById(SCRIPT_ID)) {
      window.googleTranslateElementInit()
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    script.onerror = () => setFailed(true)
    document.head.appendChild(script)
  }, [])

  if (failed) return null

  return (
    <Box className="lang-select" sx={{ minWidth: 0 }}>
      <div id={CONTAINER_ID} />
      <noscript>
        <Text size="2xs" color="$white">
          Übersetzung braucht JavaScript.
        </Text>
      </noscript>
    </Box>
  )
}
