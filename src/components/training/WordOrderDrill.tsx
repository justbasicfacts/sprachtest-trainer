/* Satzbau-Puzzle: Die Wörter des Lösungssatzes erscheinen gemischt als Chips.
   Antippen schiebt ein Wort in die Satzzeile, erneutes Antippen zurück in die Bank.

   Wichtig: Die Chips werden hier LOKAL aus `solution` erzeugt und nicht von der
   KI geliefert - so kann kein Wort fehlen oder doppelt auftauchen, und die
   Aufgabe ist immer lösbar. Die Prüfung läuft ebenfalls lokal (kein API-Call);
   erst der optionale Button "trotzdem prüfen lassen" fragt die KI, falls der
   Lernende eine andere, womöglich auch richtige Wortstellung gebaut hat. */
import { useMemo, useState } from 'react'
import type { WordOrderExercise } from '../../data/types'
import { splitWords, normalizeSentence } from '../../lib/wordDiff'
import { checkTrainingAnswer, type TrainingCheckResult } from '../../ai/checkTrainingAnswer'
import { logDrill } from '../../db'
import {
  Box, HStack, Text, Muted, Btn, ChipRow, WordChip, Reveal,
} from '../ui/kit'

interface Token {
  /** Stabile ID, damit gleiche Wörter ("die", "die") unterscheidbar bleiben */
  key: string
  word: string
}

/** Mischt die Wörter so, dass die Startreihenfolge garantiert nicht die Lösung ist
    (bei kurzen Sätzen kommt das sonst überraschend oft vor). */
function shuffleTokens(words: string[]): Token[] {
  const tokens = words.map((word, i) => ({ key: `${i}-${word}`, word }))
  if (tokens.length < 2) return tokens
  for (let attempt = 0; attempt < 10; attempt++) {
    for (let i = tokens.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[tokens[i], tokens[j]] = [tokens[j], tokens[i]]
    }
    if (tokens.some((t, i) => t.word !== words[i])) break
  }
  return tokens
}

export function WordOrderDrill({ exercise }: { exercise: WordOrderExercise }) {
  const solutionWords = useMemo(() => splitWords(exercise.solution), [exercise.solution])
  const [bank, setBank] = useState<Token[]>(() => shuffleTokens(solutionWords))
  const [line, setLine] = useState<Token[]>([])
  const [checked, setChecked] = useState<null | 'ok' | 'no'>(null)
  const [aiResult, setAiResult] = useState<TrainingCheckResult | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const restart = () => {
    setBank(shuffleTokens(solutionWords))
    setLine([])
    setChecked(null)
    setAiResult(null)
    setAiError(null)
  }

  const built = line.map((t) => t.word).join(' ')
  const complete = bank.length === 0

  const take = (token: Token) => {
    if (checked === 'ok') return
    setBank((b) => b.filter((t) => t.key !== token.key))
    setLine((l) => [...l, token])
    setChecked(null)
  }

  const putBack = (token: Token) => {
    if (checked === 'ok') return
    setLine((l) => l.filter((t) => t.key !== token.key))
    setBank((b) => [...b, token])
    setChecked(null)
  }

  const check = () => {
    const target = normalizeSentence(exercise.solution)
    const alts = (exercise.alternatives ?? []).map(normalizeSentence)
    const mine = normalizeSentence(built)
    const ok = mine === target || alts.includes(mine)
    setChecked(ok ? 'ok' : 'no')
    void logDrill({ methodId: 'wordorder', exerciseId: exercise.id, ok, detail: built })
  }

  /** Nur auf ausdrücklichen Wunsch: Vielleicht ist die gebaute Reihenfolge eine
      weitere gültige Variante, die nicht in `alternatives` steht. */
  const askAi = async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      setAiResult(
        await checkTrainingAnswer({
          data: {
            instruction: 'Prüfe, ob die Wortstellung dieses deutschen Satzes korrekt ist.',
            prompt: `Alle Wörter mussten in die richtige Reihenfolge gebracht werden. Erwartete Lösung: "${exercise.solution}"`,
            hint: exercise.why,
            answer: built,
          },
        })
      )
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Die Prüfung ist fehlgeschlagen.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <Box>
      <Muted>Dein Satz:</Muted>
      <Box
        borderWidth="$1"
        borderColor={checked === 'ok' ? '$success400' : checked === 'no' ? '$error400' : '$borderLight200'}
        bg={checked === 'ok' ? '$success50' : checked === 'no' ? '$error50' : '$backgroundLight0'}
        borderRadius="$lg"
        p="$3"
        mt="$1.5"
        mb="$3"
      >
        {line.length === 0 ? (
          <Muted>Tippe unten auf die Wörter, um den Satz zu bauen.</Muted>
        ) : (
          <ChipRow minHeight={40}>
            {line.map((t) => (
              <WordChip key={t.key} tone={checked === 'ok' ? 'correct' : 'selected'} onPress={() => putBack(t)}>
                {t.word}
              </WordChip>
            ))}
          </ChipRow>
        )}
      </Box>

      {bank.length > 0 && (
        <>
          <Muted>Wörter:</Muted>
          <Box mt="$1.5">
            <ChipRow minHeight={40}>
              {bank.map((t) => (
                <WordChip key={t.key} onPress={() => take(t)}>
                  {t.word}
                </WordChip>
              ))}
            </ChipRow>
          </Box>
        </>
      )}

      <HStack gap="$2.5" flexWrap="wrap" alignItems="center" mt="$4">
        <Btn variant="gold" onPress={check} disabled={!complete || checked === 'ok'}>
          ✓ Prüfen
        </Btn>
        <Btn variant="secondary" small onPress={restart}>
          🔀 Neu mischen
        </Btn>
        {!complete && <Muted>Setze zuerst alle Wörter ein.</Muted>}
      </HStack>

      {checked === 'ok' && (
        <Box bg="$success50" borderWidth="$1" borderColor="$success300" borderRadius="$lg" p="$3.5" mt="$3">
          <Text fontWeight="$bold" color="$success800" mb="$1">
            ✅ Richtig!
          </Text>
          <Text size="sm">{exercise.why}</Text>
        </Box>
      )}

      {checked === 'no' && (
        <Box bg="$error50" borderWidth="$1" borderColor="$error300" borderRadius="$lg" p="$3.5" mt="$3">
          <Text fontWeight="$bold" color="$error800" mb="$1">
            ❌ Noch nicht ganz
          </Text>
          <Text size="sm" mb="$2">
            Tippe auf ein Wort in deinem Satz, um es zurückzulegen, und versuche eine andere Reihenfolge.
          </Text>
          <HStack gap="$2.5" flexWrap="wrap" alignItems="center">
            <Btn variant="secondary" small onPress={aiLoading ? undefined : askAi} disabled={aiLoading}>
              {aiLoading ? 'KI prüft …' : '🤖 Ist meine Version vielleicht auch richtig?'}
            </Btn>
          </HStack>
          {aiError && (
            <Text color="$error600" size="sm" mt="$2">
              ⚠️ {aiError}
            </Text>
          )}
          {aiResult && (
            <Box bg="$backgroundLight0" borderRadius="$md" p="$3" mt="$2.5">
              <Text size="sm" fontWeight="$bold" mb="$0.5">
                {aiResult.ok ? '✅ Auch richtig' : '❌ Leider nicht'}
              </Text>
              <Text size="sm">{aiResult.feedback}</Text>
            </Box>
          )}
          <Box mt="$3">
            <Reveal label="💡 Lösung anzeigen">
              <Box bg="$backgroundLight50" borderRadius="$md" p="$3.5" mt="$2">
                <Text fontWeight="$semibold">{exercise.solution}</Text>
                <Text size="sm" mt="$1.5">
                  {exercise.why}
                </Text>
              </Box>
            </Reveal>
          </Box>
        </Box>
      )}
    </Box>
  )
}
