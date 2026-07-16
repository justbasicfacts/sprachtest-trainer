/* Echtes Sprech-Training: nimmt die Antwort auf und holt KI-Feedback nach
   aufgaben-spezifischen Kriterien (siehe ai/scoreSpeaking.ts).

   Zwei Kanäle laufen parallel:
   - Web Speech API (de-DE): Live-Transkript zum Mitlesen/Korrigieren
     (Chrome, Edge, Safari - nicht Firefox)
   - MediaRecorder: echte Audioaufnahme; wird als 16-kHz-WAV an Gemini
     geschickt, das damit auch Aussprache und Flüssigkeit bewertet
     (funktioniert in allen Browsern, auch Firefox)

   Ist nur einer der beiden Kanäle verfügbar, funktioniert das Training
   trotzdem - mit Audio transkribiert Gemini selbst. */
import { useEffect, useRef, useState } from 'react'
import { scoreSpeaking, type SpeakingScore } from '../ai/scoreSpeaking'
import { blobToWavBase64 } from '../ai/audioWav'
import { Box, HStack, VStack, Text, Btn, Muted } from './ui/kit'

/* Minimale Typen für die Web Speech API (nicht in den Standard-DOM-Typen). */
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

export function SpeakPractice({ context, criteria }: { context: string; criteria: string[] }) {
  const [srSupported] = useState(() => typeof window !== 'undefined' && createRecognition() !== null)
  const [recSupported] = useState(
    () => typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  )
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SpeakingScore | null>(null)
  const [error, setError] = useState<string | null>(null)

  const srRef = useRef<SpeechRecognitionLike | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const limitRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Android Chrome liefert Erkennungs-Ergebnisse kumulativ und teils mehrfach -
  // deshalb wird das Transkript pro Sitzung immer KOMPLETT aus e.results neu
  // aufgebaut (statt final erkannte Stücke anzuhängen). sessionBase = Text,
  // der vor dieser Aufnahme-Sitzung schon da war (z. B. aus früheren Aufnahmen
  // oder manuell korrigiert).
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
  // Aufnahme sauber beenden, wenn die Aufgabe gewechselt wird (key-Prop) / unmount
  useEffect(() => cleanup, [])

  const start = async () => {
    setError(null)
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
          setError(MIC_ERRORS['not-allowed'])
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
        // Immer ALLE Ergebnisse der Sitzung neu zusammensetzen - robust gegen
        // Android Chrome, das Ergebnisse kumulativ/mehrfach meldet.
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
        // Bei laufender Audioaufnahme sind SR-Fehler nicht kritisch
        if (code !== 'aborted' && !recSupported) {
          setError(MIC_ERRORS[code] ?? `Spracherkennung fehlgeschlagen (${code || 'unbekannt'}).`)
        }
      }
      rec.onend = () => setInterim('')
      rec.start()
    }

    setRecording(true)
  }

  const stop = () => {
    cleanup()
    setRecording(false)
  }

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0
  const canGetFeedback = !recording && (audioBlob !== null || wordCount >= 5)

  const getFeedback = async () => {
    setLoading(true)
    setError(null)
    try {
      let audio: { mimeType: string; base64: string } | undefined
      if (audioBlob) {
        try {
          audio = { mimeType: 'audio/wav', base64: await blobToWavBase64(audioBlob) }
        } catch {
          // WAV-Konvertierung fehlgeschlagen - mit Transkript weitermachen, falls vorhanden
          if (wordCount < 5) throw new Error('Die Aufnahme konnte nicht verarbeitet werden. Bitte neu aufnehmen.')
        }
      }
      const r = await scoreSpeaking({
        data: { context, criteria, transcript: transcript.trim() || undefined, audio },
      })
      setResult(r)
      if (!transcript.trim() && r.transcript) setTranscript(r.transcript)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Das Feedback ist fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  if (!srSupported && !recSupported) {
    return (
      <Box bg="$backgroundLight50" borderWidth="$1" borderColor="$borderLight200" borderRadius="$md" p="$3" mt="$3">
        <Muted>🎤 Sprech-Training wird von diesem Browser nicht unterstützt - verwende Chrome, Edge, Safari oder Firefox.</Muted>
      </Box>
    )
  }

  return (
    <Box mt="$3.5" borderTopWidth="$1" borderTopColor="$borderLight200" pt="$3.5">
      <HStack gap="$2.5" alignItems="center" flexWrap="wrap">
        <Btn variant={recording ? 'danger' : 'primary'} onPress={recording ? stop : start} disabled={loading}>
          {recording ? '⏹ Aufnahme stoppen' : '🎤 Antwort sprechen'}
        </Btn>
        {(transcript || audioBlob || result) && !recording && (
          <Btn
            variant="secondary"
            small
            onPress={() => {
              setTranscript('')
              setAudioBlob(null)
              setResult(null)
              setError(null)
            }}
          >
            Neu anfangen
          </Btn>
        )}
        {recording && <Muted>… ich höre zu, sprich einfach los (max. 3 Min.)</Muted>}
      </HStack>

      {(transcript || recording || audioBlob) && (
        <Box mt="$2.5">
          {srSupported ? (
            <>
              <Muted>Dein Transkript (du kannst Erkennungsfehler vor dem Feedback korrigieren):</Muted>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Hier erscheint, was du sagst …"
                style={{
                  width: '100%', minHeight: 90, border: '1.5px solid #DBDBDB', borderRadius: 10,
                  padding: 12, fontSize: 15, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                  marginTop: 6,
                }}
              />
              {interim && (
                <Text size="sm" color="$textLight500" sx={{ fontStyle: 'italic' }}>
                  {interim} …
                </Text>
              )}
            </>
          ) : (
            audioBlob && <Muted>✓ Aufnahme fertig ({Math.round(audioBlob.size / 1024)} kB) - Gemini transkribiert sie beim Feedback.</Muted>
          )}
          {audioUrl && (
            <Box mt="$2">
              <Muted>🔁 Deine Aufnahme anhören:</Muted>
              <audio controls src={audioUrl} style={{ width: '100%', marginTop: 6, height: 40 }} />
            </Box>
          )}
          <HStack gap="$2.5" alignItems="center" mt="$2" flexWrap="wrap">
            <Btn variant="gold" onPress={getFeedback} disabled={loading || !canGetFeedback}>
              {loading ? 'KI bewertet …' : audioBlob ? '💬 Feedback holen (mit Aussprache)' : '💬 Feedback holen'}
            </Btn>
            {!canGetFeedback && !recording && !audioBlob && <Muted>Sprich mindestens einen ganzen Satz.</Muted>}
          </HStack>
        </Box>
      )}

      {error && (
        <Text color="$error600" size="sm" mt="$2">
          ⚠️ {error}
        </Text>
      )}

      {result && (
        <Box borderWidth="$1" borderColor="$borderLight200" borderRadius="$xl" p="$4" mt="$3">
          <VStack>
            {result.checks.map((c, i) => (
              <HStack key={i} gap="$2.5" alignItems="flex-start" borderTopWidth={i === 0 ? '$0' : '$1'} borderTopColor="$borderLight200" py="$2">
                <Text>{c.ok ? '✅' : '❌'}</Text>
                <VStack flex={1}>
                  <Text size="sm" fontWeight="$semibold">
                    {criteria[i]}
                  </Text>
                  <Muted>{c.comment}</Muted>
                </VStack>
              </HStack>
            ))}
          </VStack>

          {result.pronunciation && (
            <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$md" p="$3" mt="$3">
              <Text fontWeight="$bold" size="sm" mb="$1">
                🗣️ Aussprache & Flüssigkeit
              </Text>
              <Text size="sm">{result.pronunciation.comment}</Text>
              {result.pronunciation.tips.length > 0 && (
                <VStack mt="$1.5" gap="$1">
                  {result.pronunciation.tips.map((tip, i) => (
                    <Text key={i} size="sm">
                      • {tip}
                    </Text>
                  ))}
                </VStack>
              )}
            </Box>
          )}

          {result.corrections.length > 0 && (
            <Box mt="$3">
              <Text fontWeight="$bold" size="sm" mb="$1">
                ✏️ So klingt es besser
              </Text>
              <VStack gap="$1">
                {result.corrections.map((c, i) => (
                  <Text key={i} size="sm">
                    <Text color="$error600" sx={{ textDecorationLine: 'line-through' }}>{c.wrong}</Text>
                    {' → '}
                    <Text color="$success700" fontWeight="$semibold">{c.better}</Text>
                  </Text>
                ))}
              </VStack>
            </Box>
          )}

          <Box bg="$primary50" borderRadius="$md" p="$3" mt="$3">
            <Text size="sm">💬 {result.feedback}</Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}
