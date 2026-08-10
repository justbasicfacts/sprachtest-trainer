/* Deutsche Sprachausgabe über die Web Speech API des Browsers - kostenlos, ohne
   Server und ohne API-Key. Genutzt von Diktat, Nachsprechen und dem Dialog.

   Die Browser-Sprachausgabe ist erstaunlich fehleranfällig. Was hier abgefangen wird:

   1. getVoices() ist leer beim ersten Aufruf. Chrome füllt die Liste erst später
      nach - deshalb der 'voiceschanged'-Listener UND ein kurzes Nachfassen per
      Timer, weil das Event in Chrome gelegentlich gar nicht feuert.
   2. cancel() direkt gefolgt von speak() verschluckt in Chrome die Stimme: Die
      Ausgabe läuft dann mit der Standardstimme des Systems - also einer
      englischen, die den deutschen Satz englisch ausspricht. Deshalb wird nach
      einem cancel() kurz gewartet, bevor die neue Ausgabe startet.
   3. Ohne explizit gesetzte Stimme wählt Chrome die System-Standardstimme, auch
      wenn utter.lang auf 'de-DE' steht. Ohne deutsche Stimme wird deshalb
      GAR NICHT vorgelesen - lieber kein Ton als ein englisch vorgelesener
      deutscher Satz.
   4. Chrome hält die Sprachausgabe nach etwa 15 Sekunden an. Ein regelmäßiges
      resume() hält sie am Laufen. */
import { useCallback, useEffect, useRef, useState } from 'react'

const SUPPORTED = typeof window !== 'undefined' && 'speechSynthesis' in window

/** Merkt sich die Stimmenwahl für die Dauer der Sitzung (bewusst nur im Speicher:
    die Stimmenliste kann sich zwischen Geräten und Browsern unterscheiden). */
let preferredVoiceURI: string | null = null

export function isGerman(voice: SpeechSynthesisVoice): boolean {
  // Chrome liefert 'de-DE', Safari teils 'de_DE', manche Systeme nur 'de'.
  return voice.lang.toLowerCase().replace('_', '-').startsWith('de')
}

/** Reihenfolge: gemerkte Wahl → lokale de-DE-Stimme → irgendeine lokale deutsche
    → irgendeine deutsche. Lokale Stimmen werden bevorzugt, weil die Online-
    Stimmen von Google ohne Netz stumm bleiben oder auf die Standardstimme
    zurückfallen - und die ist englisch. */
export function pickGermanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const german = voices.filter(isGerman)
  if (german.length === 0) return null
  if (preferredVoiceURI) {
    const remembered = german.find((v) => v.voiceURI === preferredVoiceURI)
    if (remembered) return remembered
  }
  const local = german.filter((v) => v.localService)
  return (
    local.find((v) => v.lang.toLowerCase().replace('_', '-') === 'de-de') ??
    local[0] ??
    german.find((v) => v.lang.toLowerCase().replace('_', '-') === 'de-de') ??
    german[0]
  )
}

export type SpeechRate = 'slow' | 'normal'
const RATES: Record<SpeechRate, number> = { slow: 0.7, normal: 0.95 }

export function useSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speaking, setSpeaking] = useState(false)
  const [, forceUpdate] = useState(0)
  const currentRef = useRef<SpeechSynthesisUtterance | null>(null)
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!SUPPORTED) return
    const load = () => {
      const list = window.speechSynthesis.getVoices()
      if (list.length > 0) setVoices(list)
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    // Nachfassen: In Chrome feuert 'voiceschanged' gelegentlich nicht, wenn die
    // Liste beim Laden der Seite bereits im Aufbau war.
    const retries = [200, 600, 1500].map((ms) => setTimeout(load, ms))
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      retries.forEach(clearTimeout)
      if (keepAliveRef.current) clearInterval(keepAliveRef.current)
      window.speechSynthesis.cancel()
    }
  }, [])

  const germanVoices = voices.filter(isGerman)
  const voice = pickGermanVoice(voices)

  const stop = useCallback(() => {
    if (!SUPPORTED) return
    if (keepAliveRef.current) clearInterval(keepAliveRef.current)
    window.speechSynthesis.cancel()
    currentRef.current = null
    setSpeaking(false)
  }, [])

  /** Stimme fest auswählen (Auswahlfeld in der Übung). */
  const selectVoice = useCallback((voiceURI: string) => {
    preferredVoiceURI = voiceURI
    forceUpdate((n) => n + 1)
  }, [])

  /** Liest den Text vor. Das Promise löst sich auf, wenn der Satz zu Ende ist -
      so kann z. B. das Nachsprechen die Aufnahme direkt danach starten.
      Ohne deutsche Stimme wird bewusst nichts vorgelesen. */
  const speak = useCallback(
    (text: string, rate: SpeechRate = 'normal'): Promise<void> => {
      if (!SUPPORTED || !text.trim()) return Promise.resolve()

      const synth = window.speechSynthesis
      const chosen = pickGermanVoice(synth.getVoices())
      if (!chosen) return Promise.resolve() // lieber still als englisch vorgelesen

      const wasBusy = synth.speaking || synth.pending
      if (wasBusy) synth.cancel()

      return new Promise<void>((resolve) => {
        const start = () => {
          const utter = new SpeechSynthesisUtterance(text)
          utter.voice = chosen
          // lang aus der Stimme übernehmen: Weichen Stimme und lang voneinander ab,
          // ignoriert Chrome die Stimme und nimmt wieder die Standardstimme.
          utter.lang = chosen.lang
          utter.rate = RATES[rate]

          const finish = () => {
            if (keepAliveRef.current) clearInterval(keepAliveRef.current)
            if (currentRef.current === utter) {
              currentRef.current = null
              setSpeaking(false)
            }
            resolve()
          }
          utter.onend = finish
          utter.onerror = finish

          currentRef.current = utter
          setSpeaking(true)
          synth.speak(utter)

          // Chrome pausiert die Ausgabe nach ca. 15 s von selbst.
          if (keepAliveRef.current) clearInterval(keepAliveRef.current)
          keepAliveRef.current = setInterval(() => {
            if (synth.speaking && !synth.paused) synth.resume()
          }, 8000)
        }

        // Nach einem cancel() braucht Chrome einen Moment, sonst startet die neue
        // Ausgabe mit der Standardstimme statt mit der gewählten deutschen.
        if (wasBusy) setTimeout(start, 120)
        else start()
      })
    },
    []
  )

  return {
    /** Browser kann überhaupt vorlesen */
    supported: SUPPORTED,
    /** Es gibt mindestens eine deutsche Stimme - erst dann ist Vorlesen sinnvoll */
    hasGermanVoice: voice !== null,
    /** Die aktuell benutzte Stimme */
    voice,
    voiceName: voice?.name ?? null,
    /** Alle deutschen Stimmen - für das Auswahlfeld in der Übung */
    germanVoices,
    selectVoice,
    speaking,
    speak,
    stop,
  }
}
