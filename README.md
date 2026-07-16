# Berliner Sprachtest – B1 Trainer 🐻

Übungs-App für den **Berliner Sprachtest für die Einbürgerung** (Niveau B1).

## Features

- **Üben** – Teil 1–4 mit sofortigem Feedback und Erklärungen (originaler Modelltest + 3 zusätzliche Übungssätze)
- **KI-generierte Aufgaben** – im Übungsmodus kann Google Gemini (kostenloser Free-Tier, via TanStack AI) jederzeit eine neue Teil-1–4-Aufgabe im gleichen Format erstellen; sie wird lokal gespeichert und bleibt neben den Original-Aufgaben erhalten
- **Prüfungssimulation** – 4 komplette schriftliche Tests mit echtem Timing (30 Min. Lesen + 20 Min. Schreiben), Bewertung nach den offiziellen Regeln
- **Sprechen** – Teil 5 Kennenlernen (Karteikarten), Teil 6 Fotobeschreibung mit den Originalfotos, Teil 7 Situationen mit Pro & Contra, Redemittel
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

Ohne `VITE_GEMINI_API_KEY` funktioniert die App normal, nur das Wörterbuch und "Neue Aufgabe generieren" zeigen dann eine Fehlermeldung.

## Deployment (GitHub Pages)

Die App ist eine rein statische Seite und wird per GitHub Actions automatisch deployt (`.github/workflows/deploy.yml`):

1. Repo auf GitHub pushen (Branch `main`).
2. In den Repo-Einstellungen **Settings > Pages > Source: "GitHub Actions"** wählen.
3. Unter **Settings > Secrets and variables > Actions** ein Secret `VITE_GEMINI_API_KEY` mit dem Gemini-Key anlegen.
4. Push auf `main` (oder Workflow manuell starten) - die Seite erscheint unter `https://<user>.github.io/<repo>/`.

**Hinweis:** Der Key wird zur Build-Zeit ins öffentliche JavaScript-Bundle eingebettet und ist damit für Besucher einsehbar. Nur einen kostenlosen Free-Tier-Key verwenden.

## Quelle

Aufgabenformat und Modelltest: AG Sprachtest der Berliner Volkshochschulen (Modelltest, Mai 2025). Zusätzliche Übungssätze wurden für diese App im gleichen Format erstellt.
