/* Rahmen und Weiche für die Übungsformen: gemeinsame Kopfzeile (Titel, Anweisung,
   Hilfe) und danach die Komponente, die zur `kind`-Variante gehört.

   Die switch-Anweisung ist über die diskriminierte Union vollständig - kommt eine
   neue Übungsform dazu, meldet TypeScript hier den fehlenden Zweig. */
import type { MethodExercise, TrainingMethod } from '../../data/types'
import { TranslateZone } from '../useWordTranslate'
import { WordOrderDrill } from './WordOrderDrill'
import { ErrorHuntDrill } from './ErrorHuntDrill'
import { DictationDrill } from './DictationDrill'
import { LetterBuilder } from './LetterBuilder'
import { Roleplay } from './Roleplay'
import { BlitzRound } from './BlitzRound'
import { Shadowing } from './Shadowing'
import { Monologue } from './Monologue'
import { Box, Text, AppCard, Tag } from '../ui/kit'

export function MethodExerciseView({
  method, exercise,
}: {
  method: TrainingMethod
  exercise: MethodExercise
}) {
  return (
    <TranslateZone>
      <AppCard>
        <Tag>
          {method.icon} {method.title}
        </Tag>
        <Text fontWeight="$bold" mb="$3">
          {exercise.instruction}
        </Text>
        {exercise.hint && (
          <Box bg="$backgroundLight50" borderRadius="$md" p="$3" mb="$3">
            <Text size="sm">
              <Text fontWeight="$bold">Hilfe: </Text>
              {exercise.hint}
            </Text>
          </Box>
        )}
        <Drill exercise={exercise} />
      </AppCard>
    </TranslateZone>
  )
}

function Drill({ exercise }: { exercise: MethodExercise }) {
  switch (exercise.kind) {
    case 'wordorder':
      return <WordOrderDrill exercise={exercise} />
    case 'errorhunt':
      return <ErrorHuntDrill exercise={exercise} />
    case 'dictation':
      return <DictationDrill exercise={exercise} />
    case 'letterbuilder':
      return <LetterBuilder exercise={exercise} />
    case 'roleplay':
      return <Roleplay exercise={exercise} />
    case 'blitz':
      return <BlitzRound exercise={exercise} />
    case 'shadowing':
      return <Shadowing exercise={exercise} />
    case 'monologue':
      return <Monologue exercise={exercise} />
  }
}
