/* Fehlersuche: Ein Satz mit genau einem Fehler steht als Wort-Chips da. Der
   Lernende tippt zuerst das falsche Wort an (Stelle finden) und korrigiert dann
   den ganzen Satz im Eingabefeld (Fehler beheben).

   Warum der ganze Satz und nicht nur das eine Wort? Weil ein Teil der Fehler
   Wortstellungsfehler sind ("weil ich bin krank") - da lässt sich nicht ein Wort
   gegen ein anderes tauschen. Mit dem vorbefüllten Satz ist beides möglich, und
   das Antippen bleibt die eigentliche Suchleistung.

   Beide Prüfschritte laufen lokal, ganz ohne API-Call. Die Fehlerstelle kommt aus
   dem Wort-Diff zwischen `wrong` und `correct`, nicht aus einem KI-Index. */
import { useMemo, useState } from 'react'
import type { ErrorHuntExercise } from '../../data/types'
import { splitWords, findErrorIndices, normalizeSentence } from '../../lib/wordDiff'
import { checkTrainingAnswer, type TrainingCheckResult } from '../../ai/checkTrainingAnswer'
import { logDrill } from '../../db'
import { Box, HStack, Text, Muted, Btn, ChipRow, WordChip, TextArea, Reveal, NoTranslate} from '../ui/kit'

export function ErrorHuntDrill({ exercise }: { exercise: ErrorHuntExercise }) {
  const words = useMemo(() => splitWords(exercise.wrong), [exercise.wrong])
  const errorIndices = useMemo(
    () => findErrorIndices(exercise.wrong, exercise.correct),
    [exercise.wrong, exercise.correct]
  )

  const [picked, setPicked] = useState<number | null>(null)
  const [text, setText] = useState(exercise.wrong)
  const [result, setResult] = useState<null | { spotOk: boolean; fixOk: boolean }>(null)
  const [aiResult, setAiResult] = useState<TrainingCheckResult | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const reset = () => {
    setPicked(null)
    setText(exercise.wrong)
    setResult(null)
    setAiResult(null)
    setAiError(null)
  }

  const check = () => {
    const spotOk = picked !== null && errorIndices.includes(picked)
    const fixOk = normalizeSentence(text) === normalizeSentence(exercise.correct)
    setResult({ spotOk, fixOk })
    void logDrill({ methodId: 'errorhunt', exerciseId: exercise.id, ok: spotOk && fixOk, detail: text })
  }

  const askAi = async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      setAiResult(
        await checkTrainingAnswer({
          data: {
            instruction: 'Prüfe, ob dieser deutsche Satz jetzt grammatisch korrekt ist.',
            prompt: `Ursprünglicher Satz mit einem Fehler: "${exercise.wrong}". Erwartete Korrektur: "${exercise.correct}"`,
            hint: exercise.why,
            answer: text,
          },
        })
      )
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Die Prüfung ist fehlgeschlagen.')
    } finally {
      setAiLoading(false)
    }
  }

  const chipTone = (i: number) => {
    if (result) {
      if (errorIndices.includes(i)) return 'correct' as const
      if (picked === i) return 'wrong' as const
      return 'muted' as const
    }
    return picked === i ? ('selected' as const) : ('neutral' as const)
  }

  return (
    <Box>
      <Muted>Tippe auf das Wort, das nicht stimmt:</Muted>
      <Box mt="$1.5" mb="$3">
        <ChipRow>
          {words.map((w, i) => (
            <WordChip key={`${i}-${w}`} tone={chipTone(i)} onPress={result ? undefined : () => setPicked(i)}>
              {w}
            </WordChip>
          ))}
        </ChipRow>
      </Box>

      {picked !== null && (
        <Box>
          <Muted>Und jetzt der ganze Satz richtig:</Muted>
          <Box mt="$1.5">
            <TextArea value={text} onChange={setText} minHeight={64} disabled={result !== null} />
          </Box>
        </Box>
      )}

      <HStack gap="$2.5" flexWrap="wrap" alignItems="center" mt="$4">
        <Btn variant="gold" onPress={check} disabled={picked === null || result !== null}>
          ✓ Prüfen
        </Btn>
        {result && (
          <Btn variant="secondary" small onPress={reset}>
            ↻ Nochmal
          </Btn>
        )}
        {picked === null && <Muted>Wähle zuerst ein Wort aus.</Muted>}
      </HStack>

      {result && (
        <Box
          bg={result.spotOk && result.fixOk ? '$success50' : '$error50'}
          borderWidth="$1"
          borderColor={result.spotOk && result.fixOk ? '$success300' : '$error300'}
          borderRadius="$lg"
          p="$3.5"
          mt="$3"
        >
          <Text size="sm" mb="$0.5">
            {result.spotOk ? '✅' : '❌'} Fehlerstelle {result.spotOk ? 'gefunden' : 'nicht gefunden'}
          </Text>
          <Text size="sm" mb="$2">
            {result.fixOk ? '✅' : '❌'} Korrektur {result.fixOk ? 'richtig' : 'noch nicht richtig'}
          </Text>

          <Box bg="$backgroundLight0" borderRadius="$md" p="$3" mb="$2.5">
            <Text size="sm" fontWeight="$bold" mb="$0.5">
              Richtig ist:
            </Text>
            <Text>
              <NoTranslate>{exercise.correct}</NoTranslate>
            </Text>
          </Box>
          <Text size="sm">{exercise.why}</Text>

          {!result.fixOk && (
            <Box mt="$3">
              <Btn variant="secondary" small onPress={aiLoading ? undefined : askAi} disabled={aiLoading}>
                {aiLoading ? 'KI prüft …' : '🤖 Ist meine Korrektur vielleicht auch richtig?'}
              </Btn>
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
            </Box>
          )}
        </Box>
      )}

      {!result && (
        <Box mt="$3">
          <Reveal label="💡 Tipp anzeigen">
            <Box bg="$backgroundLight50" borderRadius="$md" p="$3.5" mt="$2">
              <Text size="sm">{exercise.why}</Text>
            </Box>
          </Reveal>
        </Box>
      )}
    </Box>
  )
}
