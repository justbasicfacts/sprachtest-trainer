/* Leichte Browser-History-Integration für die SPA: Jede innere Navigations-Ebene
   (Teil öffnen, Aufgabe öffnen, Sprechen-Unterbereich, laufende Prüfung) legt einen
   History-Eintrag an. Die Zurück-Taste/-Geste des Handys schließt dann die oberste
   Ebene, statt die Seite zu verlassen.

   Muster:
   - openLayer(close): beim Öffnen einer Ebene aufrufen; `close` macht sie wieder zu.
   - backLayer(): für "← zurück"-Buttons - konsumiert den History-Eintrag, popstate
     ruft dann `close` auf (ein Code-Pfad für Button UND Zurück-Geste).
   - clearLayers(): verwirft alle offenen Ebenen (z. B. beim Tab-Wechsel) und räumt
     die zugehörigen History-Einträge auf. */

let stack: (() => void)[] = []
let suppress = 0

export function openLayer(close: () => void): void {
  stack.push(close)
  history.pushState({ layer: stack.length }, '')
}

export function backLayer(): void {
  history.back()
}

export function clearLayers(): void {
  if (stack.length === 0) return
  suppress += stack.length
  history.go(-stack.length)
  stack = []
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (suppress > 0) {
      suppress--
      return
    }
    const close = stack.pop()
    if (close) close()
  })
}
