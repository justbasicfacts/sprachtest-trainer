# Berliner Sprachtest – B1 Trainer 🐻

Übungs-App für den **Berliner Sprachtest für die Einbürgerung** (Niveau B1).

## Features

- **Üben** – Teil 1–4 mit sofortigem Feedback und Erklärungen (originaler Modelltest + 3 zusätzliche Übungssätze)
- **KI-generierte Aufgaben** – im Übungsmodus kann Google Gemini (kostenloser Free-Tier, via TanStack AI) jederzeit eine neue Teil-1–4-Aufgabe im gleichen Format erstellen; sie wird lokal gespeichert und bleibt neben den Original-Aufgaben erhalten
- **Prüfungssimulation** – 4 komplette schriftliche Tests mit echtem Timing (30 Min. Lesen + 20 Min. Schreiben), Bewertung nach den offiziellen Regeln
- **Sprechen** – Teil 5 Kennenlernen (Karteikarten), Teil 6 Fotobeschreibung mit den Originalfotos, Teil 7 Situationen mit Pro & Contra, Redemittel
- **Gezieltes Training** – zwei Achsen: *nach Fähigkeit* (Bildbeschreibung, Pro & Contra, Präpositionen, Nebensätze, Konnektoren) und *nach Übungsform*:
  - ✍️ Schreiben: **Satzbau-Puzzle** (Wörter in die richtige Reihenfolge tippen), **Fehlersuche** (den einen Fehler im Satz finden), **Diktat** (Browser liest vor, du schreibst mit), **Brief-Baukasten** (Teil 4 in vier Bausteinen, am Ende nach Prüfungsregeln bewertet)
  - 🗣️ Sprechen: **Dialog-Rollenspiel** (die KI spielt Nachbarin, Ärztin, Verkäufer und antwortet auf dich), **Blitzrunde** (5 Fragen à 20 Sekunden ohne Vorbereitung), **Nachsprechen** (Satz anhören und nachsprechen, mit Aussprache-Feedback), **60-Sekunden-Monolog** (eine Minute frei sprechen, mit Wörter/Minute und Füllwort-Zählung)
  - **Satzbau-Puzzle, Fehlersuche, Diktat und Nachsprechen funktionieren komplett ohne API-Key** – die Auswertung läuft lokal im Browser
- **Vokabeltrainer** – ~150 prüfungsrelevante B1-Wörter (DE/EN/TR + Beispielsatz), eigene Wörter, Spaced Repetition
- **Datenbank** – alle Lernstände, Ergebnisse und KI-Aufgaben werden lokal in IndexedDB gespeichert (Dexie.js); nichts verlässt deinen Browser außer dem Prompt für eine neue KI-Aufgabe

## Tech

Vite + React 19 + TypeScript (reine Client-App, kein Server) · Dexie (IndexedDB) · Google Gemini API (kostenloser Free-Tier, direkt aus dem Browser) für Wörterbuch und Aufgabengenerierung

## Lokal starten

```bash
npm install
cp .env.example .env   # trage deinen kostenlosen Gemini-Key als VITE_GEMINI_API_KEY ein
npm run dev
```

Ohne `VITE_GEMINI_API_KEY` funktioniert die App normal, nur das Wörterbuch, "Neue Aufgabe generieren" und die KI-Bewertungen zeigen dann eine Fehlermeldung. Im gezielten Training laufen **Satzbau-Puzzle, Fehlersuche, Diktat und Nachsprechen** auch ohne Key vollständig – ihre Auswertung passiert lokal im Browser. Diktat und Nachsprechen brauchen dafür eine deutsche Systemstimme (Web Speech API); fehlt sie, weist die App darauf hin.

## Deployment (GitHub Pages)

Die App ist eine rein statische Seite und wird per GitHub Actions automatisch deployt (`.github/workflows/deploy.yml`):

1. Repo auf GitHub pushen (Branch `main`).
2. In den Repo-Einstellungen **Settings > Pages > Source: "GitHub Actions"** wählen.
3. Unter **Settings > Secrets and variables > Actions** ein Secret `VITE_GEMINI_API_KEY` mit dem Gemini-Key anlegen.
4. Push auf `main` (oder Workflow manuell starten) - die Seite erscheint unter `https://<user>.github.io/<repo>/`.

**Hinweis:** Der Key wird zur Build-Zeit ins öffentliche JavaScript-Bundle eingebettet und ist damit für Besucher einsehbar. Nur einen kostenlosen Free-Tier-Key verwenden.

## Quelle

Aufgabenformat und Modelltest: AG Sprachtest der Berliner Volkshochschulen (Modelltest, Mai 2025). Zusätzliche Übungssätze wurden für diese App im gleichen Format erstellt.
