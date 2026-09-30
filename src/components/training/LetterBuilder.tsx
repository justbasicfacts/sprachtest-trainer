/* Brief-Baukasten: Teil 4 in vier Bausteinen statt am Stück - Anrede, Anlass,
   Anliegen, Schluss. Jeder Baustein wird einzeln geprüft, am Ende wird der ganze
   Brief nach den echten Prüfungsregeln bewertet.

   Kosten: Mit Zwischenprüfung sind das vier kleine Aufrufe plus die
   Schlussbewertung. Weil der Free-Tier-Key knapp ist, lässt sich die
   Zwischenprüfung abschalten - dann bleibt genau ein Aufruf am Ende.

   Für die Schlussbewertung wird die Übung lokal in die Form eines Teil4Task
   gebracht (situation / points / model), sodass scoreWriting() unverändert
   weiterverwendet werden kann. */
import { useEffect, useRef, useState } from 'react'
import type { LetterBuilderExercise, Teil4Task } from '../../data/types'
import { checkTrainingAnswer, type TrainingCheckResult } from '../../ai/checkTrainingAnswer'
import { scoreWriting, type WritingScore } from '../../ai/scoreWriting'
import { logDrill, updateDrill, saveWritingAttempt } from '../../db'
import {
  Box, HStack, VStack, Text, Muted, Btn, TextArea, ProgressBar, SituationBox, Reveal, ScoreBox, NoTranslate,
} from '../ui/kit'

/** Baut aus den Bausteinen eine Teil-4-Aufgabe, wie sie scoreWriting() erwartet. */
function asTeil4Task(exercise: LetterBuilderExercise): Teil4Task {
  return {
    id: exercise.id,
    set: 'Brief-Baukasten',
    situation: exercise.situation,
    points: exercise.blocks.map((b) => b.label + ': ' + b.ask),
    model: exercise.blocks.map((b) => b.sample).join('\n'),
  }
}

function assemble(exercise: LetterBuilderExercise, texts: Record<string, string>): string {
  return exercise.blocks
    .map((b) => texts[b.id]?.trim() ?? '')
    .filter(Boolean)
    .join('\n\n')
}

export function LetterBuilder({ exercise }: { exercise: LetterBuilderExercise }) {
  const [step, setStep] = useState(0)
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [checks, setChecks] = useState<Record<string, TrainingCheckResult>>({})
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [withStepChecks, setWithStepChecks] = useState(true)
  const [finalScore, setFinalScore] = useState<WritingScore | null>(null)
  const [scoring, setScoring] = useState(false)
  const [copied, setCopied] = useState(false)
  // Sobald alle Bausteine geschrieben sind, gilt die Übung als gemacht; die
  // Punktbewertung ergänzt später denselben Datensatz.
  const drillIdRef = useRef<number | undefined>(undefined)

  const done = step >= exercise.blocks.length
  const block = done ? null : exercise.blocks[step]
  const letter = assemble(exercise, texts)

  // Brief vollständig -> einmalig als Versuch protokollieren.
  useEffect(() => {
    if (!done || drillIdRef.current !== undefined) return
    void logDrill({
      methodId: 'letterbuilder',
      exerciseId: exercise.id,
      ok: false,
      detail: 'Brief fertiggestellt',
    }).then((id) => {
      drillIdRef.current = id
    })
  }, [done, exercise.id])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  const setText = (id: string, value: string) => setTexts((t) => ({ ...t, [id]: value }))

  const checkBlock = async () => {
    if (!block) return
    setChecking(true)
    setError(null)
    try {
      const result = await checkTrainingAnswer({
        data: {
          instruction: `Baustein "${block.label}" eines formellen Briefs (Prüfung Teil 4, Niveau B1). ${block.ask}`,
          prompt: `Gesamtsituation des Briefs: ${exercise.situation}`,
          hint: block.hint,
          answer: texts[block.id] ?? '',
        },
      })
      setChecks((c) => ({ ...c, [block.id]: result }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Prüfung ist fehlgeschlagen.')
    } finally {
      setChecking(false)
    }
  }

  const next = () => {
    setError(null)
    setStep((s) => s + 1)
  }

  const back = () => {
    setError(null)
    setStep((s) => Math.max(0, s - 1))
  }

  const scoreLetter = async () => {
    setScoring(true)
    setError(null)
    try {
      const result = await scoreWriting({ data: { task: asTeil4Task(exercise), text: letter } })
      setFinalScore(result)
      void updateDrill(drillIdRef.current, {
        ok: result.score >= 4,
        value: result.score,
        detail: `${result.score}/6 Punkte`,
      })
      void saveWritingAttempt({
        source: 'letterbuilder',
        situation: exercise.situation,
        points: asTeil4Task(exercise).points,
        text: letter,
        result,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Bewertung ist fehlgeschlagen.')
    } finally {
      setScoring(false)
    }
  }

  const restart = () => {
    setStep(0)
    setTexts({})
    setChecks({})
    setFinalScore(null)
    setError(null)
    drillIdRef.current = undefined
  }

  return (
    <Box>
      <SituationBox>{exercise.situation}</SituationBox>

      <HStack justifyContent="space-between" alignItems="center" mb="$1.5" flexWrap="wrap" gap="$2">
        <Muted>
          {done ? 'Alle Bausteine fertig' : `Baustein ${step + 1} von ${exercise.blocks.length}: ${block?.label}`}
        </Muted>
        {!done && (
          <Text size="2xs" color="$primary600" onPress={() => setWithStepChecks((v) => !v)}>
            {withStepChecks ? '🤖 Zwischenprüfung an' : '🔌 Zwischenprüfung aus'}
          </Text>
        )}
      </HStack>
      <ProgressBar value={((done ? exercise.blocks.length : step) / exercise.blocks.length) * 100} />

      {block && (
        <Box mt="$3.5">
          <Text fontWeight="$bold" mb="$1">
            {block.label}
          </Text>
          <Text size="sm" mb="$2">
            {block.ask}
          </Text>
          {block.hint && (
            <Box bg="$backgroundLight50" borderRadius="$md" p="$3" mb="$2.5">
              <Text size="sm">
                <Text size="sm" fontWeight="$bold">
                  Tipp:{' '}
                </Text>
                {block.hint}
              </Text>
            </Box>
          )}
          <TextArea
            value={texts[block.id] ?? ''}
            onChange={(v) => setText(block.id, v)}
            placeholder={`${block.label} schreiben …`}
            minHeight={block.id === 'anrede' ? 52 : 100}
          />

          <HStack gap="$2.5" flexWrap="wrap" alignItems="center" mt="$3">
            {withStepChecks && (
              <Btn
                variant="secondary"
                small
                onPress={checkBlock}
                disabled={checking || (texts[block.id] ?? '').trim().length < 3}
              >
                {checking ? 'KI prüft …' : '🤖 Baustein prüfen'}
              </Btn>
            )}
            <Btn variant="gold" onPress={next} disabled={(texts[block.id] ?? '').trim().length < 3}>
              {step === exercise.blocks.length - 1 ? 'Brief zusammensetzen →' : 'Weiter →'}
            </Btn>
            {step > 0 && (
              <Btn variant="secondary" small onPress={back}>
                ← zurück
              </Btn>
            )}
          </HStack>

          {checks[block.id] && (
            <Box borderWidth="$1" borderColor="$borderLight200" borderRadius="$lg" p="$3.5" mt="$3">
              <Text size="sm" fontWeight="$semibold" mb="$1">
                {checks[block.id].ok ? '✅ Passt' : '❌ Da geht noch was'}
              </Text>
              <Muted>{checks[block.id].feedback}</Muted>
              <Box bg="$backgroundLight50" borderRadius="$md" p="$3" mt="$2.5">
                <Text size="sm" fontWeight="$bold" mb="$0.5">
                  Verbesserte Version:
                </Text>
                <Text size="sm" sx={{ whiteSpace: 'pre-line' }}>
                  {checks[block.id].corrected}
                </Text>
              </Box>
            </Box>
          )}

          <Box mt="$3">
            <Reveal label="💡 Musterformulierung für diesen Baustein">
              <Box bg="$backgroundLight50" borderRadius="$md" p="$3.5" mt="$2">
                <Text sx={{ whiteSpace: 'pre-line' }}>
                  <NoTranslate>{block.sample}</NoTranslate>
                </Text>
              </Box>
            </Reveal>
          </Box>
        </Box>
      )}

      {done && (
        <Box mt="$3.5">
          <Text fontWeight="$bold" mb="$1.5">
            Dein Brief
          </Text>
          <Box bg="$backgroundLight50" borderWidth="$1" borderColor="$borderLight200" borderRadius="$lg" p="$4">
            <Text sx={{ whiteSpace: 'pre-line' }}>
              <NoTranslate>{letter}</NoTranslate>
            </Text>
          </Box>

          <HStack gap="$2.5" flexWrap="wrap" alignItems="center" mt="$3">
            <Btn variant="gold" onPress={scoreLetter} disabled={scoring}>
              {scoring ? 'KI bewertet …' : '📝 Nach Prüfungsregeln bewerten'}
            </Btn>
            <Btn
              variant="secondary"
              small
              onPress={() => {
                void navigator.clipboard?.writeText(letter).then(() => setCopied(true))
              }}
            >
              {copied ? '✓ kopiert' : '📋 Brief kopieren'}
            </Btn>
            <Btn variant="secondary" small onPress={back}>
              ← letzten Baustein ändern
            </Btn>
            <Btn variant="secondary" small onPress={restart}>
              ↻ Von vorne
            </Btn>
          </HStack>

          {finalScore && <FinalScore score={finalScore} />}

          <Box mt="$4">
            <Reveal label="💡 Kompletten Musterbrief anzeigen">
              <Box bg="$backgroundLight50" borderRadius="$md" p="$3.5" mt="$2">
                <Text sx={{ whiteSpace: 'pre-line' }}>{exercise.blocks.map((b) => b.sample).join('\n\n')}</Text>
              </Box>
            </Reveal>
          </Box>
        </Box>
      )}

      {error && (
        <Text color="$error600" size="sm" mt="$2">
          ⚠️ {error}
        </Text>
      )}
    </Box>
  )
}

function FinalScore({ score }: { score: WritingScore }) {
  const rows = [
    ...score.points.map((p) => ({ label: p.point, ok: p.ok, comment: p.comment })),
    { label: 'Passende Anrede und Grußformel', ok: score.greeting.ok, comment: score.greeting.comment },
    { label: 'Verständlich, Sätze gut verbunden', ok: score.clarity.ok, comment: score.clarity.comment },
  ]

  return (
    <Box borderWidth="$1" borderColor="$borderLight200" borderRadius="$xl" p="$4" mt="$3">
      <HStack gap="$3" flexWrap="wrap" mb="$3">
        <ScoreBox n={`${score.score} / 6`} label="Punkte in Teil 4" />
      </HStack>

      <VStack>
        {rows.map((r, i) => (
          <HStack
            key={i}
            gap="$2.5"
            alignItems="flex-start"
            borderTopWidth={i === 0 ? '$0' : '$1'}
            borderTopColor="$borderLight200"
            py="$2"
          >
            <Text>{r.ok ? '✅' : '❌'}</Text>
            <VStack flex={1}>
              <Text size="sm" fontWeight="$semibold">
                {r.label}
              </Text>
              <Muted>{r.comment}</Muted>
            </VStack>
          </HStack>
        ))}
      </VStack>

      {score.corrections.length > 0 && (
        <Box mt="$3">
          <Text fontWeight="$bold" size="sm" mb="$1">
            ✏️ So klingt es besser
          </Text>
          <VStack gap="$1">
            {score.corrections.map((c, i) => (
              <Text key={i} size="sm">
                <Text color="$error600" sx={{ textDecorationLine: 'line-through' }}>
                  {c.wrong}
                </Text>
                {' → '}
                <Text color="$success700" fontWeight="$semibold">
                  {c.better}
                </Text>
              </Text>
            ))}
          </VStack>
        </Box>
      )}

      <Box bg="$primary50" borderRadius="$md" p="$3" mt="$3">
        <Text size="sm">💬 {score.feedback}</Text>
      </Box>
    </Box>
  )
}
