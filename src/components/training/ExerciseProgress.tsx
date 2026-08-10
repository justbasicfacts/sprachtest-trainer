/* Gemeinsame Fortschrittsanzeige über einer Übungsliste ("4 von 12 gelöst") und
   das kleine Statusabzeichen auf der einzelnen Übungskachel.

   Wird von beiden Achsen benutzt - Fähigkeiten wie Übungsformen -, damit ein
   Häkchen überall dasselbe bedeutet. */
import { useState } from 'react'
import { resetDrills } from '../../db'
import type { ExerciseStatus } from '../../hooks/useDrillStatus'
import { Box, HStack, Text, Muted, ProgressBar, ConfirmDialog } from '../ui/kit'

export function ExerciseProgress({
  scopeId, done, total, attempted,
}: {
  scopeId: string
  done: number
  total: number
  attempted: number
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  if (total === 0) return null

  const allDone = done === total

  return (
    <Box mb="$3.5">
      <HStack justifyContent="space-between" alignItems="center" mb="$1" flexWrap="wrap" gap="$2">
        <Text size="sm" fontWeight="$semibold">
          {allDone ? '🎉 Alle Übungen gelöst!' : `${done} von ${total} gelöst`}
          {attempted > done && !allDone && (
            <Text size="sm" color="$textLight500">
              {'  ·  '}
              {attempted - done} angefangen
            </Text>
          )}
        </Text>
        {attempted > 0 && (
          <Text size="2xs" color="$primary600" onPress={() => setConfirmOpen(true)}>
            Fortschritt zurücksetzen
          </Text>
        )}
      </HStack>
      <ProgressBar value={(done / total) * 100} />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Fortschritt zurücksetzen?"
        description="Die Häkchen in dieser Liste verschwinden. Die Übungen selbst bleiben natürlich erhalten."
        cancelLabel="Abbrechen"
        confirmLabel="Zurücksetzen"
        onConfirm={() => void resetDrills(scopeId)}
      />
    </Box>
  )
}

/** Kleines Statuszeichen für eine einzelne Übungskachel. */
export function ExerciseBadge({ status }: { status?: ExerciseStatus }) {
  if (!status) return null
  if (status.done) {
    return (
      <Text size="2xs" color="$success700" fontWeight="$bold">
        ✅ gelöst
        {status.attempts > 1 && ` · ${status.attempts} Versuche`}
      </Text>
    )
  }
  return (
    <Muted>
      🔸 angefangen{status.attempts > 1 ? ` · ${status.attempts} Versuche` : ''}
    </Muted>
  )
}
