/* Einfaches Hash-Routing für die Haupt-Tabs der App (#/practice, #/exam, …).
   Ziel: Ein Reload (F5) oder ein Lesezeichen landet wieder auf demselben Tab,
   statt immer bei "Start" zu starten.

   Bewusst getrennt von appHistory.ts: Die dortige "Layer"-Logik (Teil öffnen,
   Aufgabe öffnen, laufende Prüfung …) nutzt pushState OHNE eigene URL, ändert also
   den Hash nicht. Der Tab-Wechsel hier nutzt replaceState, erzeugt also keinen
   eigenen History-Eintrag und kollidiert nicht mit der Layer-Ebenen-Navigation. */

export type TabId = 'home' | 'practice' | 'exam' | 'speak' | 'vocab'

const VALID_TABS: readonly TabId[] = ['home', 'practice', 'exam', 'speak', 'vocab']

function isTabId(v: string): v is TabId {
  return (VALID_TABS as readonly string[]).includes(v)
}

/** Liest den aktuell gewünschten Tab aus dem URL-Hash (z. B. "#/practice" → "practice"). */
export function getTabFromHash(): TabId {
  const raw = window.location.hash.replace(/^#\/?/, '')
  return isTabId(raw) ? raw : 'home'
}

/** Schreibt den Tab in den URL-Hash (ohne neuen History-Eintrag). */
export function setTabHash(tab: TabId): void {
  const hash = tab === 'home' ? '#/' : `#/${tab}`
  if (window.location.hash !== hash) {
    history.replaceState(history.state, '', hash)
  }
}

/** Reagiert auf Hash-Änderungen, die nicht von setTabHash selbst ausgelöst wurden
    (z. B. manuell eingegebene URL, Lesezeichen, oder der Nutzer editiert die Adresszeile).
    Gibt eine Cleanup-Funktion zurück. */
export function onHashChange(cb: (tab: TabId) => void): () => void {
  const handler = () => cb(getTabFromHash())
  window.addEventListener('hashchange', handler)
  return () => window.removeEventListener('hashchange', handler)
}
