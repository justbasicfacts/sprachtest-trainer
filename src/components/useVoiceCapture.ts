/* Wiederverwendbare Sprach-Aufnahme: Web-Speech-Live-Transkript (falls verfügbar)
   + echte Audioaufnahme über MediaRecorder (falls verfügbar) laufen parallel.
   Wird vom Sprech-Training (SpeakPractice) und vom mündlichen Prüfungsteil
   (ExamSpeaking) benutzt. */
import { useEffect, useRef, useState } from 'react'

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: { error?: string }) => void) | null
  onend: (() => void) | null
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
}

function createRecognition(): SpeechRecognitionLike | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  if (!Ctor) return null
  const rec = new Ctor()
  rec.lang = 'de-DE'
  rec.continuous = true
  rec.interimResults = true
  return rec
}

const MIC_ERRORS: Record<string, string> = {
  'not-allowed': 'Mikrofon-Zugriff wurde verweigert. Erlaube das Mikrofon in den Browser-Einstellungen.',
  'audio-capture': 'Kein Mikrofon gefunden.',
  network: 'Die Spracherkennung braucht eine Internetverbindung.',
  'no-speech': 'Nichts gehört - sprich etwas lauter oder näher am Mikrofon.',
}

const MAX_RECORDING_MS = 3 * 60_000 // Aufnahme-Limit: hält den Upload klein (~6 MB)

export function useVoiceCapture() {
  const [srSupported] = useState(() => typeof window !== 'undefined' && createRecognition() !== null)
  const [recSupported] = useState(
    () => typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  )
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [micError, setMicError] = useState<string | null>(null)

  const srRef = useRef<SpeechRecognitionLike | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const limitRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Android Chrome liefert Erkennungs-Ergebnisse kumulativ und teils mehrfach -
  // deshalb wird das Transkript pro Sitzung immer KOMPLETT aus e.results neu
  // aufgebaut. sessionBase = Text, der vor dieser Aufnahme-Sitzung schon da war.
  const transcriptRef = useRef('')
  const sessionBaseRef = useRef('')

  useEffect(() => {
    transcriptRef.current = transcript
  }, [transcript])

  // Abspiel-URL für die eigene Aufnahme verwalten
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!audioBlob) {
      setAudioUrl(null)
      return
    }
    const url = URL.createObjectURL(audioBlob)
    setAudioUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [audioBlob])

  const cleanup = () => {
    srRef.current?.stop()
    if (mediaRef.current && mediaRef.current.state !== 'inactive') mediaRef.current.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    if (limitRef.current) clearTimeout(limitRef.current)
  }
  // Aufnahme sauber beenden bei Aufgabenwechsel (key-Prop) / unmount
  useEffect(() => cleanup, [])

  const stop = () => {
    cleanup()
    setRecording(false)
  }

  const start = async () => {
    setMicError(null)
    setAudioBlob(null)

    // 1) Audioaufnahme (falls verfügbar)
    if (recSupported) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        const recorder = new MediaRecorder(stream)
        mediaRef.current = recorder
        chunksRef.current = []
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }
        recorder.onstop = () => {
          if (chunksRef.current.length > 0) {
            setAudioBlob(new Blob(chunksRef.current, { type: chunksRef.current[0].type || recorder.mimeType }))
          }
          streamRef.current?.getTracks().forEach((t) => t.stop())
        }
        recorder.start()
        limitRef.current = setTimeout(() => stop(), MAX_RECORDING_MS)
      } catch {
        // Mikrofon verweigert/nicht verfügbar - Spracherkennung reicht evtl. trotzdem
        if (!srSupported) {
          setMicError(MIC_ERRORS['not-allowed'])
          return
        }
      }
    }

    // 2) Live-Transkript (falls verfügbar)
    if (srSupported) {
      const rec = createRecognition()!
      srRef.current = rec
      sessionBaseRef.current = transcriptRef.current
      rec.onresult = (e) => {
        let finalText = ''
        let interimText = ''
        let lastFinal = ''
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i]
          if (r.isFinal) {
            const t = r[0].transcript.trim()
            if (t && t !== lastFinal) {
              finalText += t + ' '
              lastFinal = t
            }
          } else {
            interimText += r[0].transcript
          }
        }
        const base = sessionBaseRef.current
        setTranscript((base ? base + ' ' : '') + finalText.trim())
        setInterim(interimText)
      }
      rec.onerror = (e) => {
        const code = e.error ?? ''
        if (code !== 'aborted' && !recSupported) {
          setMicError(MIC_ERRORS[code] ?? `Spracherkennung fehlgeschlagen (${code || 'unbekannt'}).`)
        }
      }
      rec.onend = () => setInterim('')
      rec.start()
    }

    setRecording(true)
  }

  const reset = () => {
    setTranscript('')
    setAudioBlob(null)
    setMicError(null)
  }

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0

  return {
    srSupported, recSupported,
    supported: srSupported || recSupported,
    recording, transcript, setTranscript, interim,
    audioBlob, audioUrl, micError, wordCount,
    start, stop, reset,
  }
}
