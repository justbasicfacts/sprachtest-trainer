import { useState, type FormEvent, type ReactNode } from 'react'
import { sha256Hex } from '../lib/hash'
import { Page, Box, Text, AppCard, CardTitle, Muted, Btn } from './ui/kit'

const STORAGE_KEY = 'sprachtest:unlock-hash'

const inputStyle: React.CSSProperties = {
  border: '1.5px solid #DBDBDB',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 14,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
}

/* Einfacher Passwortschutz für die ganze App - rein clientseitig, weil die App als
   statische Seite (GitHub Pages) läuft und keinen eigenen Server hat.

   WICHTIG: Das ist KEIN echter Zugriffsschutz, nur eine Hürde gegen zufällige
   Besucher (z. B. über einen geteilten Link oder eine Suchmaschine). Der Hash landet
   öffentlich im JS-Bundle, und wer gezielt rein will, kann die Prüfung im Browser
   umgehen (z. B. über die DevTools) oder das Passwort offline gegen den Hash raten.
   Für echten Zugriffsschutz bräuchte es serverseitige Auth (z. B. Cloudflare Access).

   Funktionsweise: VITE_ACCESS_PASSWORD_HASH enthält den SHA-256-Hash des Passworts
   (nie das Passwort selbst - siehe .env.example, wie man ihn erzeugt). Die Eingabe
   wird beim Absenden ebenfalls gehasht und verglichen; bei Erfolg landet der Hash in
   localStorage, damit man nicht bei jedem Besuch neu eintippen muss. Ist die Variable
   nicht gesetzt (z. B. lokale Entwicklung), ist die App ungeschützt. */
export function PasswordGate({ children }: { children: ReactNode }) {
  const requiredHash = import.meta.env.VITE_ACCESS_PASSWORD_HASH
  const [unlocked, setUnlocked] = useState(
    () => !requiredHash || localStorage.getItem(STORAGE_KEY) === requiredHash,
  )
  const [value, setValue] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  const tryUnlock = async () => {
    if (!value || checking) return
    setChecking(true)
    setError(false)
    const hash = await sha256Hex(value)
    setChecking(false)
    if (hash === requiredHash) {
      localStorage.setItem(STORAGE_KEY, hash)
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void tryUnlock()
  }

  return (
    <Page>
      <Box sx={{ minHeight: '100dvh', alignItems: 'center', justifyContent: 'center' }} p="$4">
        <Box sx={{ width: '100%', maxWidth: 360 }}>
          <AppCard>
            <CardTitle>🔒 Geschützt</CardTitle>
            <Muted>Bitte Passwort eingeben, um fortzufahren.</Muted>
            <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
              <input
                type="password"
                autoFocus
                placeholder="Passwort"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  setError(false)
                }}
                style={inputStyle}
              />
              {error && (
                <Text size="sm" color="$error600" style={{ marginTop: 8, display: 'block' }}>
                  Falsches Passwort.
                </Text>
              )}
              <Box style={{ marginTop: 12 }}>
                <Btn disabled={checking || !value} onPress={() => void tryUnlock()}>
                  {checking ? '…' : 'Weiter'}
                </Btn>
              </Box>
            </form>
          </AppCard>
        </Box>
      </Box>
    </Page>
  )
}
