/* Deutsche Sprachausgabe über die Web Speech API des Browsers - kostenlos, ohne
   Server und ohne API-Key. Genutzt von Diktat, Nachsprechen und dem Dialog.

   Zwei Fallstricke, die hier abgefangen werden:
   1. Chrome liefert getVoices() beim ersten Aufruf oft ein leeres Array und füllt
      die Liste erst später nach - deshalb der 'voiceschanged'-Listener.
   2. Ist gar keine deutsche Stimme installiert (kommt z. B. unter Linux vor),
      wird `germanVoice` null. Die aufrufende Übung blendet dann einen Hinweis ein,
      statt den deutschen Satz mit englischer Aussprache vorzulesen. */
import { useCallback, useEffect, useRef, useState } from 'react'

const SUPPORTED = typeof window !== 'undefined' && 'speechSynthesis' in window

function pickGermanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const german = voices.filter((v) => v.lang.toLowerCase().startsWith('de'))
  if (german.length === 0) return null
  // Lokal installierte Stimmen klingen meist besser und funktionieren offline.
  return german.find((v) => v.localService) ?? german[0]
}

export type SpeechRate = 'slow' | 'normal'
const RATES: Record<SpeechRate, number> = { slow: 0.7, normal: 0.95 }

export function useSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speaking, setSpeaking] = useState(false)
  const currentRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (!SUPPORTED) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      window.speechSynthesis.cancel()
    }
  }, [])

  const germanVoice = pickGermanVoice(voices)

  const stop = useCallback(() => {
    if (!SUPPORTED) return
    window.speechSynthesis.cancel()
    currentRef.current = null
    setSpeaking(false)
  }, [])

  /** Liest den Text vor. Das Promise löst sich auf, wenn der Satz zu Ende ist -
      so kann z. B. das Nachsprechen die Aufnahme direkt danach starten. */
  const speak = useCallback(
    (text: string, rate: SpeechRate = 'normal'): Promise<void> => {
      if (!SUPPORTED || !text.trim()) return Promise.resolve()
      window.speechSynthesis.cancel()
      return new Promise<void>((resolve) => {
        const utter = new SpeechSynthesisUtterance(text)
        utter.lang = 'de-DE'
        utter.rate = RATES[rate]
        const voice = pickGermanVoice(window.speechSynthesis.getVoices())
        if (voice) utter.voice = voice
        const finish = () => {
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
        window.speechSynthesis.speak(utter)
      })
    },
    []
  )

  return {
    /** Browser kann überhaupt vorlesen */
    supported: SUPPORTED,
    /** Es gibt eine deutsche Stimme - erst dann ist Vorlesen sinnvoll */
    hasGermanVoice: germanVoice !== null,
    voiceName: germanVoice?.name ?? null,
    speaking,
    speak,
    stop,
  }
}
