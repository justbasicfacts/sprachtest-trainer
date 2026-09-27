# Berliner Sprachtest – B1 Trainer 🐻

Übungs-App für den **Berliner Sprachtest für die Einbürgerung** (Niveau B1).

## Features

- **Üben** – Teil 1–4 mit sofortigem Feedback und Erklärungen (originaler Modelltest + 3 zusätzliche Übungssätze)
- **KI-generierte Aufgaben** – im Übungsmodus und im gezielten Training kann die KI jederzeit eine neue Aufgabe/Übung im gleichen Format erstellen oder eine bestehende in eine spürbar schwierigere Variante "evolvieren"; beides landet lokal gespeichert neben den Original-Aufgaben. Standardmäßig Google Gemini (kostenloser Free-Tier); optional auch DeepSeek über einen eigenen Proxy - Umschalten oben in der Kopfzeile (siehe [KI-Anbieter](#ki-anbieter-gemini-oder-deepseek) unten)
- **Prüfungssimulation** – 4 komplette schriftliche Tests mit echtem Timing (30 Min. Lesen + 20 Min. Schreiben), Bewertung nach den offiziellen Regeln
- **Sprechen** – Teil 5 Kennenlernen (Karteikarten), Teil 6 Fotobeschreibung mit den Originalfotos, Teil 7 Situationen mit Pro & Contra, Redemittel
- **Gezieltes Training** – zwei Achsen: *nach Fähigkeit* (Bildbeschreibung, Pro & Contra, Präpositionen, Nebensätze, Konnektoren) und *nach Übungsform*:
  - ✍️ Schreiben: **Satzbau-Puzzle** (Wörter in die richtige Reihenfolge tippen), **Fehlersuche** (den einen Fehler im Satz finden), **Diktat** (Browser liest vor, du schreibst mit), **Brief-Baukasten** (Teil 4 in vier Bausteinen, am Ende nach Prüfungsregeln bewertet)
  - 🗣️ Sprechen: **Dialog-Rollenspiel** (die KI spielt Nachbarin, Ärztin, Verkäufer und antwortet auf dich), **Blitzrunde** (5 Fragen à 20 Sekunden ohne Vorbereitung), **Nachsprechen** (Satz anhören und nachsprechen, mit Aussprache-Feedback), **60-Sekunden-Monolog** (eine Minute frei sprechen, mit Wörter/Minute und Füllwort-Zählung)
  - **Satzbau-Puzzle, Fehlersuche, Diktat und Nachsprechen funktionieren komplett ohne API-Key** – die Auswertung läuft lokal im Browser
- **Vokabeltrainer** – ~150 prüfungsrelevante B1-Wörter (DE/EN/TR + Beispielsatz), eigene Wörter, Spaced Repetition
- **Datenbank** – alle Lernstände, Ergebnisse und KI-Aufgaben werden lokal in IndexedDB gespeichert (Dexie.js); nichts verlässt deinen Browser außer dem Prompt für eine neue KI-Aufgabe

## Tech

Vite + React 19 + TypeScript (reine Client-App, kein Server) · Dexie (IndexedDB) · Google Gemini API (kostenloser Free-Tier, direkt aus dem Browser) für Wörterbuch, Bewertung und Aufgabengenerierung · optional DeepSeek (über einen eigenen Proxy) als zweiter Anbieter für Aufgabenerstellung & -evolution

## Lokal starten

```bash
npm install
cp .env.example .env   # trage deinen kostenlosen Gemini-Key als VITE_GEMINI_API_KEY ein
npm run dev
```

Ohne `VITE_GEMINI_API_KEY` funktioniert die App normal, nur das Wörterbuch, "Neue Aufgabe generieren" und die KI-Bewertungen zeigen dann eine Fehlermeldung. Im gezielten Training laufen **Satzbau-Puzzle, Fehlersuche, Diktat und Nachsprechen** auch ohne Key vollständig – ihre Auswertung passiert lokal im Browser. Diktat und Nachsprechen brauchen dafür eine deutsche Systemstimme (Web Speech API); fehlt sie, weist die App darauf hin.

DeepSeek als zweiter Anbieter ist komplett optional - siehe nächster Abschnitt.

## KI-Anbieter: Gemini oder DeepSeek

Für die Aufgabenerstellung ("Neue Aufgabe generieren" / "Neue Übung generieren") und die neue Evolution ("Schwierigere Variante erzeugen", die eine bestehende Aufgabe/Übung in eine neue, anspruchsvollere Version verwandelt) lässt sich oben in der Kopfzeile zwischen zwei KI-Anbietern wählen:

- **Gemini** (Standard) – wie bisher, kostenloser Free-Tier, direkt aus dem Browser.
- **DeepSeek** – läuft über einen eigenen kleinen Proxy (Ordner [`deepseek-proxy/`](deepseek-proxy/README.md)), weil DeepSeek anders als Gemini keinen kostenlosen Free-Tier-Key hat, den man gefahrlos ins öffentliche JS-Bundle einbetten könnte. Der Proxy hält den echten DeepSeek-Key serverseitig (Cloudflare Worker) und reicht Anfragen nur von der eigenen App-Domain weiter.

Alle anderen KI-Funktionen (Bewertung von Texten/Sprechen, Wörterbuch, Rollenspiel, Lernplan, Zusammenfassungen) laufen unverändert über Gemini. Ohne eingerichteten Proxy funktioniert die App normal weiter - die DeepSeek-Option zeigt dann nur eine Fehlermeldung, sobald sie ausgewählt wird. Einrichtung: siehe [`deepseek-proxy/README.md`](deepseek-proxy/README.md).

## Deployment (GitHub Pages)

Die App ist eine rein statische Seite und wird per GitHub Actions automatisch deployt (`.github/workflows/deploy.yml`):

1. Repo auf GitHub pushen (Branch `main`).
2. In den Repo-Einstellungen **Settings > Pages > Source: "GitHub Actions"** wählen.
3. Unter **Settings > Secrets and variables > Actions** ein Secret `VITE_GEMINI_API_KEY` mit dem Gemini-Key anlegen.
4. Push auf `main` (oder Workflow manuell starten) - die Seite erscheint unter `https://<user>.github.io/<repo>/`.

**Hinweis:** Der Key wird zur Build-Zeit ins öffentliche JavaScript-Bundle eingebettet und ist damit für Besucher einsehbar. Nur einen kostenlosen Free-Tier-Key verwenden.

Für DeepSeek als zweiten Anbieter zusätzlich (optional) die Repository-Variable `VITE_DEEPSEEK_PROXY_URL` (**Settings > Secrets and variables > Actions > Variables**, keine geheime Information) und, falls im Proxy ein `PROXY_TOKEN` gesetzt wurde, das Repository-Secret `VITE_DEEPSEEK_PROXY_TOKEN` anlegen - siehe [`deepseek-proxy/README.md`](deepseek-proxy/README.md).

## Quelle

Aufgabenformat und Modelltest: AG Sprachtest der Berliner Volkshochschulen (Modelltest, Mai 2025). Zusätzliche Übungssätze wurden für diese App im gleichen Format erstellt.
