/* Diktat: Der Browser liest den Satz vor (Web Speech API, kostenlos), der
   Lernende tippt mit, die Auswertung läuft als Wort-Diff komplett lokal.

   Die Großschreibung bekommt bewusst eine eigene Fehlerkategorie: Bei deutschen
   Nomen ist das der häufigste Diktatfehler, und ihn als "falsches Wort" zu werten
   wäre unnötig entmutigend und würde die eigentliche Regel verstecken. */
import { useState } from 'react'
import type { DictationExercise } from '../../data/types'
import { diffWords, type WordDiffEntry } from '../../lib/wordDiff'
import { useSpeech } from '../../hooks/useSpeech'
import { VoicePicker } from './VoicePicker'
import { logDrill } from '../../db'
import { Box, HStack, VStack, Text, Muted, Btn, ChipRow, WordChip, TextArea, Reveal, NoTranslate} from '../ui/kit'

export function DictationDrill({ exercise }: { exercise: DictationExercise }) {
  const speech = useSpeech()
  const [text, setText] = useState('')
  const [result, setResult] = useState<ReturnType<typeof diffWords> | null>(null)
  const [plays, setPlays] = useState(0)

  const play = (rate: 'slow' | 'normal') => {
    setPlays((p) => p + 1)
    void speech.speak(exercise.sentence, rate)
  }

  const check = () => {
    const diff = diffWords(text, exercise.sentence)
    setResult(diff)
    void logDrill({
      methodId: 'dictation',
      exerciseId: exercise.id,
      ok: diff.perfect,
      value: Math.round(diff.ratio * 100),
      detail: `${diff.correct}/${diff.total} Wörter, ${plays}× gehört`,
    })
  }

  const reset = () => {
    setText('')
    setResult(null)
    setPlays(0)
  }

  if (!speech.supported || !speech.hasGermanVoice) {
    return (
      <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$lg" p="$3.5">
        <Text fontWeight="$bold" mb="$1">
          🔇 Diktat hier leider nicht möglich
        </Text>
        <Text size="sm">
          {speech.supported
            ? 'Dein Browser hat keine deutsche Stimme installiert. Unter Windows und macOS lässt sie sich in den Systemeinstellungen nachinstallieren; in Chrome, Edge und Safari ist meist eine dabei.'
            : 'Dieser Browser kann keine Texte vorlesen. Probier es mit Chrome, Edge oder Safari.'}
        </Text>
        <Box mt="$3">
          <Reveal label="💡 Satz stattdessen lesen">
            <Box bg="$backgroundLight0" borderRadius="$md" p="$3.5" mt="$2">
              <Text>
                <NoTranslate>{exercise.sentence}</NoTranslate>
              </Text>
            </Box>
          </Reveal>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <HStack gap="$2.5" flexWrap="wrap" alignItems="center">
        <Btn onPress={() => play('normal')} disabled={result !== null}>
          {speech.speaking ? '🔊 liest vor …' : '▶ Vorlesen'}
        </Btn>
        <Btn variant="secondary" small onPress={() => play('slow')} disabled={result !== null}>
          🐢 Langsam
        </Btn>
        {speech.speaking && (
          <Btn variant="secondary" small onPress={speech.stop}>
            ⏹ Stopp
          </Btn>
        )}
        {plays > 0 && <Muted>{plays}× gehört</Muted>}
      </HStack>

      <VoicePicker speech={speech} />

      <Box mt="$3">
        <Muted>Schreib auf, was du hörst:</Muted>
        <Box mt="$1.5">
          <TextArea
            value={text}
            onChange={setText}
            placeholder="Der Satz, den du gehört hast …"
            minHeight={80}
            disabled={result !== null}
          />
        </Box>
      </Box>

      <HStack gap="$2.5" flexWrap="wrap" alignItems="center" mt="$3.5">
        <Btn variant="gold" onPress={check} disabled={text.trim().length < 3 || result !== null}>
          ✓ Prüfen
        </Btn>
        {result && (
          <Btn variant="secondary" small onPress={reset}>
            ↻ Nochmal
          </Btn>
        )}
        {plays === 0 && <Muted>Hör dir den Satz zuerst an.</Muted>}
      </HStack>

      {result && <DictationResult diff={result} sentence={exercise.sentence} watchOut={exercise.watchOut} />}
    </Box>
  )
}

function DictationResult({
  diff, sentence, watchOut,
}: {
  diff: ReturnType<typeof diffWords>
  sentence: string
  watchOut?: string
}) {
  const caseErrors = diff.entries.filter((e) => e.status === 'case').length
  const missing = diff.entries.filter((e) => e.status === 'missing').length
  const wrong = diff.entries.filter((e) => e.status === 'wrong').length
  const extra = diff.entries.filter((e) => e.status === 'extra').length

  return (
    <Box
      bg={diff.perfect ? '$success50' : '$backgroundLight0'}
      borderWidth="$1"
      borderColor={diff.perfect ? '$success300' : '$borderLight200'}
      borderRadius="$xl"
      p="$4"
      mt="$3"
    >
      <Text fontWeight="$bold" mb="$2">
        {diff.perfect ? '✅ Fehlerfrei!' : `${diff.correct} von ${diff.total} Wörtern richtig`}
      </Text>

      <Muted>Dein Text im Vergleich:</Muted>
      <Box mt="$1.5" mb="$3">
        <ChipRow>
          {diff.entries.map((e, i) => (
            <DiffChip key={i} entry={e} />
          ))}
        </ChipRow>
      </Box>

      {!diff.perfect && (
        <VStack gap="$1" mb="$3">
          {caseErrors > 0 && (
            <Text size="sm">
              🔠 {caseErrors}× Groß-/Kleinschreibung - im Deutschen werden alle Nomen großgeschrieben.
            </Text>
          )}
          {wrong > 0 && <Text size="sm">✏️ {wrong}× anderes Wort geschrieben</Text>}
          {missing > 0 && <Text size="sm">➖ {missing}× Wort fehlt</Text>}
          {extra > 0 && <Text size="sm">➕ {extra}× Wort zu viel</Text>}
        </VStack>
      )}

      <Box bg="$backgroundLight50" borderRadius="$md" p="$3">
        <Text size="sm" fontWeight="$bold" mb="$0.5">
          Richtig ist:
        </Text>
        <Text>
          <NoTranslate>{sentence}</NoTranslate>
        </Text>
      </Box>

      {watchOut && (
        <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$md" p="$3" mt="$2.5">
          <Text size="sm">
            <Text size="sm" fontWeight="$bold">
              Achte auf:{' '}
            </Text>
            {watchOut}
          </Text>
        </Box>
      )}
    </Box>
  )
}

function DiffChip({ entry }: { entry: WordDiffEntry }) {
  switch (entry.status) {
    case 'ok':
      return <WordChip tone="correct">{entry.got}</WordChip>
    case 'case':
      return (
        <WordChip tone="warn" title={`Großschreibung: ${entry.want}`}>
          {entry.got} → {entry.want}
        </WordChip>
      )
    case 'wrong':
      return (
        <WordChip tone="wrong" title={`Richtig: ${entry.want}`}>
          {entry.got} → {entry.want}
        </WordChip>
      )
    case 'missing':
      return (
        <WordChip tone="wrong" title="Dieses Wort fehlt">
          ␣ {entry.want}
        </WordChip>
      )
    case 'extra':
      return (
        <WordChip tone="muted" strike title="Dieses Wort ist zu viel">
          {entry.got}
        </WordChip>
      )
  }
}
