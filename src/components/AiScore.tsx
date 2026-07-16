/* KI-Bewertung für Teil-4-Texte: schickt Aufgabe + Text an Gemini und zeigt
   Punkte (max. 6) nach den offiziellen Kriterien, Einzelfeedback und die
   wichtigsten Sprachkorrekturen. Wird im Übungsmodus und in der
   Prüfungssimulation verwendet. */
import { useState } from 'react'
import type { Teil4Task } from '../data/types'
import { scoreWriting, type WritingScore } from '../ai/scoreWriting'
import { Box, HStack, VStack, Text, Btn, Muted } from './ui/kit'

export function AiWritingScore({ d, text }: { d: Teil4Task; text: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WritingScore | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const tooShort = wordCount < 10

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      setResult(await scoreWriting({ data: { task: d, text } }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Bewertung ist fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box mt="$3">
      <HStack gap="$2.5" alignItems="center" flexWrap="wrap">
        <Btn variant="secondary" onPress={run} disabled={loading || tooShort}>
          {loading ? 'KI bewertet …' : '🤖 Text von KI bewerten lassen'}
        </Btn>
        {tooShort && <Muted>Schreibe mindestens 10 Wörter, dann kann die KI bewerten.</Muted>}
      </HStack>

      {error && (
        <Text color="$error600" size="sm" mt="$2">
          ⚠️ {error}
        </Text>
      )}

      {result && <WritingScoreView d={d} result={result} />}
    </Box>
  )
}

/** Anzeige einer KI-Schreibbewertung (auch vom Prüfungsmodus wiederverwendet). */
export function WritingScoreView({ d, result }: { d: Teil4Task; result: WritingScore }) {
  return (
    <Box borderWidth="$1" borderColor="$borderLight200" borderRadius="$xl" p="$4" mt="$3">
      <HStack alignItems="center" gap="$2.5" mb="$2.5" flexWrap="wrap">
        <Text fontWeight="$bold">KI-Bewertung:</Text>
        <Box bg={result.score >= 3 ? '$success50' : '$error50'} borderRadius="$full" px="$3" py="$0.5">
          <Text fontWeight="$extrabold" color={result.score >= 3 ? '$success700' : '$error700'}>
            {result.score} / 6 Punkten
          </Text>
        </Box>
      </HStack>

      <VStack>
        {result.points.map((p, i) => (
          <CriterionRow key={i} ok={p.ok} label={`Punkt „${d.points[i] ?? p.point}“`} comment={p.comment} />
        ))}
        <CriterionRow ok={result.greeting.ok} label="Anrede und Gruß" comment={result.greeting.comment} />
        <CriterionRow ok={result.clarity.ok} label="Verständlich & verbundene Sätze" comment={result.clarity.comment} />
      </VStack>

      {result.corrections.length > 0 && (
        <Box mt="$3">
          <Text fontWeight="$bold" size="sm" mb="$1">
            ✏️ Sprachliche Korrekturen
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
      <Muted mt="$2">
        Die KI-Bewertung ist eine Orientierung - in der echten Prüfung bewerten menschliche Prüfer.
      </Muted>
    </Box>
  )
}

function CriterionRow({ ok, label, comment }: { ok: boolean; label: string; comment: string }) {
  return (
    <HStack gap="$2.5" alignItems="flex-start" borderTopWidth="$1" borderTopColor="$borderLight200" py="$2">
      <Text>{ok ? '✅' : '❌'}</Text>
      <VStack flex={1}>
        <Text size="sm" fontWeight="$semibold">
          {label} <Text fontWeight="$bold">({ok ? 1 : 0} P)</Text>
        </Text>
        <Muted>{comment}</Muted>
      </VStack>
    </HStack>
  )
}
