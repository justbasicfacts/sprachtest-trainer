/* KI-Bewertung für Teil-4-Texte: schickt Aufgabe + Text an Gemini und zeigt
   Punkte (max. 6) nach den offiziellen Kriterien, Einzelfeedback und die
   wichtigsten Sprachkorrekturen. Wird im Übungsmodus und in der
   Prüfungssimulation verwendet. */
import { useState } from 'react'
import type { Teil4Task } from '../data/types'
import { scoreWriting, type WritingScore } from '../ai/scoreWriting'
import { Box, HStack, VStack, Text, Btn, Muted } from './ui/kit'

export function AiWritingScore({
  d, text, onTextChange,
}: {
  d: Teil4Task
  text: string
  /** Wenn gesetzt, bekommen die Korrekturen einen "Übernehmen"-Button, der die
      fehlerhafte Stelle direkt im Eingabefeld durch die korrigierte Version ersetzt. */
  onTextChange?: (next: string) => void
}) {
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

      {result && (
        <WritingScoreView
          d={d}
          result={result}
          onApplyCorrection={
            onTextChange ? (wrong, better) => onTextChange(applyCorrection(text, wrong, better)) : undefined
          }
        />
      )}
    </Box>
  )
}

/** Ersetzt die erste Stelle im Text, die exakt `wrong` entspricht, durch `better`.
    Findet sich `wrong` nicht mehr (z. B. weil der Text inzwischen geändert wurde),
    bleibt der Text unverändert. */
function applyCorrection(text: string, wrong: string, better: string): string {
  const idx = text.indexOf(wrong)
  if (idx === -1) return text
  return text.slice(0, idx) + better + text.slice(idx + wrong.length)
}

/** Anzeige einer KI-Schreibbewertung (auch vom Prüfungsmodus wiederverwendet). */
export function WritingScoreView({
  d, result, onApplyCorrection,
}: {
  d: Teil4Task
  result: WritingScore
  /** Optional: macht die Korrekturen per Klick auf den aktuellen Text anwendbar. */
  onApplyCorrection?: (wrong: string, better: string) => void
}) {
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
        <Corrections corrections={result.corrections} onApply={onApplyCorrection} />
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

/** Liste der Sprachkorrekturen mit "Übernehmen"-Button pro Zeile (wenn onApply gesetzt
    ist) und einer Sammel-Aktion, um alle noch offenen Korrekturen auf einmal anzuwenden. */
function Corrections({
  corrections, onApply,
}: {
  corrections: { wrong: string; better: string }[]
  onApply?: (wrong: string, better: string) => void
}) {
  const [applied, setApplied] = useState<Set<number>>(new Set())

  const apply = (i: number, wrong: string, better: string) => {
    onApply?.(wrong, better)
    setApplied((prev) => new Set(prev).add(i))
  }

  const openCount = corrections.length - applied.size

  return (
    <Box mt="$3">
      <HStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$2">
        <Text fontWeight="$bold" size="sm">
          ✏️ Sprachliche Korrekturen
        </Text>
        {onApply && openCount > 1 && (
          <Btn
            small
            variant="secondary"
            onPress={() => corrections.forEach((c, i) => { if (!applied.has(i)) apply(i, c.wrong, c.better) })}
          >
            Alle übernehmen
          </Btn>
        )}
      </HStack>
      <VStack gap="$1.5" mt="$1.5">
        {corrections.map((c, i) => {
          const done = applied.has(i)
          return (
            <HStack key={i} alignItems="center" justifyContent="space-between" gap="$2" flexWrap="wrap">
              <Text size="sm" flex={1} sx={{ minWidth: 180 }}>
                <Text color="$error600" sx={{ textDecorationLine: 'line-through' }}>{c.wrong}</Text>
                {' → '}
                <Text color="$success700" fontWeight="$semibold">{c.better}</Text>
              </Text>
              {onApply && (
                done ? (
                  <Text size="sm" color="$success700" fontWeight="$semibold">✓ Übernommen</Text>
                ) : (
                  <Btn small variant="secondary" onPress={() => apply(i, c.wrong, c.better)}>
                    Übernehmen
                  </Btn>
                )
              )}
            </HStack>
          )
        })}
      </VStack>
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
