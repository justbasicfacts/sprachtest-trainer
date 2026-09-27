# DeepSeek-Proxy

Ein winziger [Cloudflare Worker](https://workers.cloudflare.com/), der zwischen der
Haupt-App und DeepSeeks API steht - nötig, weil die App selbst rein statisch ist
(GitHub Pages, kein eigener Server) und DeepSeek anders als Gemini keinen
kostenlosen Free-Tier-Key hat, den man gefahrlos ins öffentliche JS-Bundle
einbetten könnte. Der Worker hält den echten DeepSeek-Key als Secret bei
Cloudflare (nie im Browser sichtbar) und reicht Anfragen der App 1:1 an
DeepSeek weiter.

Ohne diesen Proxy funktioniert die App normal weiter - nur die DeepSeek-Option
in der Anbieter-Auswahl oben in der App zeigt dann eine Fehlermeldung. Gemini
ist davon nicht betroffen.

## Voraussetzungen

- Ein (kostenloses) [Cloudflare-Konto](https://dash.cloudflare.com/sign-up)
- Ein DeepSeek-API-Key: https://platform.deepseek.com/api_keys
- Node.js (für `npx wrangler`)

## Einrichten

Alle Befehle in diesem Ordner (`deepseek-proxy/`) ausführen:

```bash
npx wrangler login
```

1. In `wrangler.toml` den Wert von `ALLOWED_ORIGIN` auf die echte URL der
   deployten App setzen, z. B. `https://dein-name.github.io` (ohne Pfad, ohne
   abschließenden Slash). Für lokale Entwicklung zusätzlich
   `http://localhost:5173` mit Komma getrennt eintragen - sonst blockt der
   Proxy Anfragen vom lokalen Dev-Server.

2. Den echten DeepSeek-Key als Secret hinterlegen (wird verschlüsselt bei
   Cloudflare gespeichert, landet nie im Repo):

   ```bash
   npx wrangler secret put DEEPSEEK_API_KEY
   ```

3. **Optional, aber empfohlen:** ein gemeinsames Geheimnis zwischen App und
   Proxy setzen - kein Ersatz für echte Auth (der Wert landet im öffentlichen
   Bundle der App), aber verhindert, dass jemand, der die Proxy-URL findet,
   sie einfach für eigene DeepSeek-Anfragen auf deine Kosten mitbenutzt:

   ```bash
   npx wrangler secret put PROXY_TOKEN
   ```

   Denselben Wert danach als `VITE_DEEPSEEK_PROXY_TOKEN` in der `.env` der
   Haupt-App (bzw. als GitHub-Actions-Secret für den Pages-Deploy) eintragen.

4. Deployen:

   ```bash
   npx wrangler deploy
   ```

   Die Ausgabe enthält die URL des Workers, z. B.
   `https://sprachtest-deepseek-proxy.<dein-cloudflare-name>.workers.dev`.

5. Diese URL in der Haupt-App als `VITE_DEEPSEEK_PROXY_URL` eintragen - lokal
   in `.env` (siehe `.env.example` im Repo-Root), für den GitHub-Pages-Deploy
   als Repository-Variable (**Settings > Secrets and variables > Actions >
   Variables**, nicht Secrets - es ist keine geheime Information).

6. In der App oben in der Kopfzeile den Anbieter auf **DeepSeek** umstellen.

## Lokal testen

```bash
npx wrangler dev
```

Startet den Worker lokal (Standard: `http://localhost:8787`). Diese URL
temporär als `VITE_DEEPSEEK_PROXY_URL` in der `.env` der Haupt-App eintragen,
um gegen den lokalen Proxy statt der Cloudflare-Deployment zu testen.

## Kosten & Grenzen

- Cloudflare Workers: für diese Nutzungsgröße im kostenlosen Tier (100.000
  Anfragen/Tag) mehr als ausreichend.
- DeepSeek selbst berechnet nach Tokens - siehe
  https://platform.deepseek.com/api-docs/pricing. Anders als bei Gemini gibt
  es hier kein kostenloses Kontingent.
- Der `PROXY_TOKEN` ist ein einfacher gemeinsamer Schlüssel, kein vollwertiger
  Auth-Mechanismus - für eine persönliche/kleine App ein vernünftiger
  Kompromiss. Für mehr Schutz zusätzlich Rate Limiting im
  Cloudflare-Dashboard einrichten (Security > WAF > Rate limiting rules).
