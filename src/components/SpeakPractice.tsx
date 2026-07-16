/* Echtes Sprech-Training: nimmt die Antwort per Spracherkennung des Browsers auf
   (Web Speech API, de-DE), zeigt das Transkript (korrigierbar) und holt dann
   KI-Feedback nach aufgaben-spezifischen Kriterien (siehe ai/scoreSpeaking.ts).

   Browser-Unterstützung: Chrome, Edge, Safari (auch iOS/Android). Firefox hat
   keine Spracherkennung - dort wird ein Hinweis angezeigt. */
import { useEffect, useRef, useState } from 'react'
import { scoreSpeaking, type SpeakingScore } from '../ai/scoreSpeaking'
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

export function SpeakPractice({ context, criteria }: { context: string; criteria: string[] }) {
  const [supported] = useState(() => typeof window !== 'undefined' && createRecognition() !== null)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SpeakingScore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<SpeechRecognitionLike | null>(null)

  // Aufnahme sauber beenden, wenn die Aufgabe gewechselt wird (key-Prop) / unmount
  useEffect(() => () => recRef.current?.stop(), [])

  const start = () => {
    const rec = createRecognition()
    if (!rec) return
    recRef.current = rec
    setError(null)
    rec.onresult = (e) => {
      let interimText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) {
          const t = r[0].transcript.trim()
          if (t) setTranscript((prev) => (prev ? prev + ' ' : '') + t)
        } else {
          interimText += r[0].transcript
        }
      }
      setInterim(interimText)
    }
    rec.onerror = (e) => {
      const code = e.error ?? ''
      if (code !== 'aborted') setError(MIC_ERRORS[code] ?? `Spracherkennung fehlgeschlagen (${code || 'unbekannt'}).`)
    }
    rec.onend = () => {
      setRecording(false)
      setInterim('')
    }
    rec.start()
    setRecording(true)
  }

  const stop = () => {
    recRef.current?.stop()
    setRecording(false)
  }

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0

  const getFeedback = async () => {
    setLoading(true)
    setError(null)
    try {
      setResult(await scoreSpeaking({ data: { context, criteria, transcript } }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Das Feedback ist fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  if (!supported) {
    return (
      <Box bg="$backgroundLight50" borderWidth="$1" borderColor="$borderLight200" borderRadius="$md" p="$3" mt="$3">
        <Muted>
          🎤 Sprech-Training mit Spracherkennung wird von diesem Browser nicht unterstützt - verwende Chrome, Edge
          oder Safari.
        </Muted>
      </Box>
    )
  }

  return (
    <Box mt="$3.5" borderTopWidth="$1" borderTopColor="$borderLight200" pt="$3.5">
      <HStack gap="$2.5" alignItems="center" flexWrap="wrap">
        <Btn variant={recording ? 'danger' : 'primary'} onPress={recording ? stop : start} disabled={loading}>
          {recording ? '⏹ Aufnahme stoppen' : '🎤 Antwort sprechen'}
        </Btn>
        {(transcript || result) && !recording && (
          <Btn
            variant="secondary"
            small
            onPress={() => {
              setTranscript('')
              setResult(null)
              setError(null)
            }}
          >
            Neu anfangen
          </Btn>
        )}
        {recording && <Muted>… ich höre zu, sprich einfach los</Muted>}
      </HStack>

      {(transcript || recording) && (
        <Box mt="$2.5">
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
          <HStack gap="$2.5" alignItems="center" mt="$2" flexWrap="wrap">
            <Btn variant="gold" onPress={getFeedback} disabled={loading || recording || wordCount < 5}>
              {loading ? 'KI bewertet …' : '💬 Feedback holen'}
            </Btn>
            {wordCount < 5 && !recording && <Muted>Sprich mindestens einen ganzen Satz.</Muted>}
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
