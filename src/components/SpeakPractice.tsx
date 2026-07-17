/* Echtes Sprech-Training: nimmt die Antwort auf (Live-Transkript + Audioaufnahme,
   siehe useVoiceCapture) und holt KI-Feedback nach aufgaben-spezifischen Kriterien
   (siehe ai/scoreSpeaking.ts). Mit Audio bewertet Gemini auch die Aussprache. */
import { useEffect, useRef, useState } from 'react'
import { scoreSpeaking, type SpeakingScore } from '../ai/scoreSpeaking'
import { blobToWavBase64 } from '../ai/audioWav'
import { useVoiceCapture } from './useVoiceCapture'
import { Box, HStack, VStack, Text, Btn, Muted } from './ui/kit'

export function SpeakPractice({ context, criteria }: { context: string; criteria: string[] }) {
  const cap = useVoiceCapture()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SpeakingScore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const canGetFeedback = !cap.recording && (cap.audioBlob !== null || cap.wordCount >= 5)

  // Damit der Feedback-Button während einer laufenden Anfrage nie "eingefroren" wirkt:
  // Sekundenzähler, solange geladen wird (Audio-Analyse + Retries können eine Weile dauern).
  useEffect(() => {
    if (!loading) return
    const started = Date.now()
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(t)
  }, [loading])

  const getFeedback = async () => {
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(null)
    setStatus('')
    setElapsed(0)
    try {
      let audio: { mimeType: string; base64: string } | undefined
      if (cap.audioBlob) {
        try {
          audio = { mimeType: 'audio/wav', base64: await blobToWavBase64(cap.audioBlob) }
        } catch {
          if (cap.wordCount < 5) throw new Error('Die Aufnahme konnte nicht verarbeitet werden. Bitte neu aufnehmen.')
        }
      }
      const r = await scoreSpeaking({
        data: { context, criteria, transcript: cap.transcript.trim() || undefined, audio },
        signal: controller.signal,
        onAttempt: ({ attempt, isFallback }) =>
          setStatus(isFallback ? 'Weiche auf ein schnelleres Modell aus …' : attempt > 1 ? `Versuch ${attempt} …` : ''),
      })
      setResult(r)
      if (!cap.transcript.trim() && r.transcript) cap.setTranscript(r.transcript)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Das Feedback ist fehlgeschlagen.')
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const cancelFeedback = () => abortRef.current?.abort()

  if (!cap.supported) {
    return (
      <Box bg="$backgroundLight50" borderWidth="$1" borderColor="$borderLight200" borderRadius="$md" p="$3" mt="$3">
        <Muted>🎤 Sprech-Training wird von diesem Browser nicht unterstützt - verwende Chrome, Edge, Safari oder Firefox.</Muted>
      </Box>
    )
  }

  return (
    <Box mt="$3.5" borderTopWidth="$1" borderTopColor="$borderLight200" pt="$3.5">
      <HStack gap="$2.5" alignItems="center" flexWrap="wrap">
        <Btn variant={cap.recording ? 'danger' : 'primary'} onPress={cap.recording ? cap.stop : cap.start} disabled={loading}>
          {cap.recording ? '⏹ Aufnahme stoppen' : '🎤 Antwort sprechen'}
        </Btn>
        {(cap.transcript || cap.audioBlob || result) && !cap.recording && (
          <Btn
            variant="secondary"
            small
            onPress={() => {
              cap.reset()
              setResult(null)
              setError(null)
            }}
          >
            Neu anfangen
          </Btn>
        )}
        {cap.recording && <Muted>… ich höre zu, sprich einfach los (max. 3 Min.)</Muted>}
      </HStack>

      {(cap.transcript || cap.recording || cap.audioBlob) && (
        <Box mt="$2.5">
          {cap.srSupported ? (
            <>
              <Muted>Dein Transkript (du kannst Erkennungsfehler vor dem Feedback korrigieren):</Muted>
              <textarea
                value={cap.transcript}
                onChange={(e) => cap.setTranscript(e.target.value)}
                placeholder="Hier erscheint, was du sagst …"
                style={{
                  width: '100%', minHeight: 90, border: '1.5px solid #DBDBDB', borderRadius: 10,
                  padding: 12, fontSize: 15, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                  marginTop: 6,
                }}
              />
              {cap.interim && (
                <Text size="sm" color="$textLight500" sx={{ fontStyle: 'italic' }}>
                  {cap.interim} …
                </Text>
              )}
            </>
          ) : (
            cap.audioBlob && <Muted>✓ Aufnahme fertig ({Math.round(cap.audioBlob.size / 1024)} kB) - Gemini transkribiert sie beim Feedback.</Muted>
          )}
          {cap.audioUrl && (
            <Box mt="$2">
              <Muted>🔁 Deine Aufnahme anhören:</Muted>
              <audio controls src={cap.audioUrl} style={{ width: '100%', marginTop: 6, height: 40 }} />
            </Box>
          )}
          <HStack gap="$2.5" alignItems="center" mt="$2" flexWrap="wrap">
            <Btn variant="gold" onPress={getFeedback} disabled={loading || !canGetFeedback}>
              {loading ? `KI bewertet … (${elapsed}s)` : cap.audioBlob ? '💬 Feedback holen (mit Aussprache)' : '💬 Feedback holen'}
            </Btn>
            {loading && (
              <Btn variant="secondary" small onPress={cancelFeedback}>
                Abbrechen
              </Btn>
            )}
            {!canGetFeedback && !cap.recording && !cap.audioBlob && <Muted>Sprich mindestens einen ganzen Satz.</Muted>}
          </HStack>
          {loading && (
            <Muted mt="$1">
              {status || (cap.audioBlob ? 'Die KI analysiert deine Aufnahme …' : 'Die KI liest deine Antwort …')}
              {elapsed >= 15 && ' Das kann bei Audioaufnahmen bis zu ein bis zwei Minuten dauern.'}
            </Muted>
          )}
        </Box>
      )}

      {(error || cap.micError) && (
        <Text color="$error600" size="sm" mt="$2">
          ⚠️ {error ?? cap.micError}
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
