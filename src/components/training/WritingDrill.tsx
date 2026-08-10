/* Schreib-Übung mit KI-Korrektur für die 'write'-Fähigkeiten (Präpositionen,
   Nebensätze, Konnektoren, ...). Vorher aus Training.tsx hierher verschoben,
   damit alle Übungsformen an einem Ort liegen - inhaltlich unverändert.

   Gleicht die Antwort zuerst lokal mit der Musterlösung ab (spart einen KI-Aufruf
   bei einem klaren Treffer) und fragt nur bei allem anderen die KI. */
import { useState } from 'react'
import type { TrainingExercise } from '../../data/types'
import { normalizeSentence } from '../../lib/wordDiff'
import { checkTrainingAnswer, type TrainingCheckResult } from '../../ai/checkTrainingAnswer'
import { logDrill } from '../../db'
import { Box, HStack, VStack, Text, Muted, Btn, FootActions, TextArea } from '../ui/kit'

export function WritingDrill({
  exercise, criteria, skillId,
}: {
  exercise: TrainingExercise
  criteria: string[]
  /** Fähigkeit, zu der die Übung gehört - für das Erledigt-Häkchen in der Liste */
  skillId?: string
}) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TrainingCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const finish = (r: TrainingCheckResult) => {
    setResult(r)
    if (skillId) void logDrill({ methodId: skillId, exerciseId: exercise.id, ok: r.ok, detail: text })
  }

  const run = async () => {
    setError(null)

    // Schneller lokaler Abgleich: entspricht die Antwort (bis auf Kleinigkeiten wie
    // Anführungszeichen/Satzzeichen) der Musterlösung, brauchen wir die KI gar nicht.
    if (normalizeSentence(text) === normalizeSentence(exercise.sampleAnswer)) {
      finish({ ok: true, feedback: 'Genau richtig - das entspricht der Musterlösung!', corrected: text })
      return
    }

    setLoading(true)
    try {
      finish(
        await checkTrainingAnswer({
          data: { instruction: exercise.instruction, prompt: exercise.prompt, hint: exercise.hint, answer: text },
        })
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Bewertung ist fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box mt="$3.5" borderTopWidth="$1" borderTopColor="$borderLight200" pt="$3.5">
      <TextArea value={text} onChange={setText} placeholder="Schreib deine Antwort hier …" />
      <FootActions>
        <Btn variant="gold" onPress={run} disabled={loading || text.trim().length < 3}>
          {loading ? 'KI prüft …' : '🤖 Antwort prüfen lassen'}
        </Btn>
      </FootActions>

      {error && (
        <Text color="$error600" size="sm" mt="$2">
          ⚠️ {error}
        </Text>
      )}

      {result && (
        <Box borderWidth="$1" borderColor="$borderLight200" borderRadius="$xl" p="$4" mt="$3">
          <HStack alignItems="center" gap="$2.5" mb="$1.5">
            <Text>{result.ok ? '✅' : '❌'}</Text>
            <Text fontWeight="$semibold">{result.ok ? 'Passt!' : 'Da geht noch was'}</Text>
          </HStack>
          <Muted>{result.feedback}</Muted>
          <Box bg="$backgroundLight50" borderRadius="$md" p="$3" mt="$2.5">
            <Text size="sm" fontWeight="$bold" mb="$0.5">
              Verbesserte Version:
            </Text>
            <Text sx={{ whiteSpace: 'pre-line' }}>{result.corrected}</Text>
          </Box>
        </Box>
      )}

      {criteria.length > 0 && (
        <Box mt="$3">
          <Muted>Worauf du achten solltest:</Muted>
          <VStack mt="$1">
            {criteria.map((c, i) => (
              <Text key={i} size="sm" pl="$4">
                • {c}
              </Text>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  )
}
