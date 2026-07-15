# Berliner Sprachtest – B1 Trainer 🐻

Übungs-App für den **Berliner Sprachtest für die Einbürgerung** (Niveau B1).

## Features

- **Üben** – Teil 1–4 mit sofortigem Feedback und Erklärungen (originaler Modelltest + 3 zusätzliche Übungssätze)
- **Prüfungssimulation** – 4 komplette schriftliche Tests mit echtem Timing (30 Min. Lesen + 20 Min. Schreiben), Bewertung nach den offiziellen Regeln
- **Sprechen** – Teil 5 Kennenlernen (Karteikarten), Teil 6 Fotobeschreibung mit den Originalfotos, Teil 7 Situationen mit Pro & Contra, Redemittel
- **Vokabeltrainer** – ~150 prüfungsrelevante B1-Wörter (DE/EN/TR + Beispielsatz), eigene Wörter, Spaced Repetition
- **Datenbank** – alle Lernstände und Ergebnisse werden lokal in IndexedDB gespeichert (Dexie.js); nichts verlässt deinen Browser

## Tech

Vite + React 19 · Dexie (IndexedDB) · kein Backend nötig

## Lokal starten

```bash
npm install
npm run dev
```

## Auf GitHub Pages veröffentlichen

1. Neues Repository auf github.com anlegen (z. B. `sprachtest-trainer`)
2. Code hochladen:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<DEIN-USERNAME>/sprachtest-trainer.git
   git push -u origin main
   ```

3. Im Repository: **Settings → Pages → Source: "GitHub Actions"** auswählen
4. Fertig – der Workflow (`.github/workflows/deploy.yml`) baut und veröffentlicht die App bei jedem Push automatisch unter `https://<DEIN-USERNAME>.github.io/sprachtest-trainer/`

## Quelle

Aufgabenformat und Modelltest: AG Sprachtest der Berliner Volkshochschulen (Modelltest, Mai 2025). Zusätzliche Übungssätze wurden für diese App im gleichen Format erstellt.
