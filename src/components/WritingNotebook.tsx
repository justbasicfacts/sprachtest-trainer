/* Schreib-Notizbuch: alle Teil-4-Texte, die je von der KI bewertet wurden - aus
   der freien Übung, dem Brief-Baukasten und der Prüfungssimulation - an einem Ort
   zum Nachlesen. Text, Punktzahl und komplettes Feedback bleiben erhalten, auch
   wenn die Übung selbst längst vorbei ist (gespeichert in db.writingAttempts). */
import { useLiveQuery } from 'dexie-react-hooks'
import { db, deleteWritingAttempt, type WritingAttempt } from '../db'
import type { Teil4Task } from '../data/types'
import { WritingScoreView } from './AiScore'
import { Box, HStack, VStack, Text, Muted, AppCard, CardTitle, Reveal, NoTranslate } from './ui/kit'

const SOURCE_LABEL: Record<WritingAttempt['source'], string> = {
  practice: '🎯 Übung',
  letterbuilder: '🛠️ Brief-Baukasten',
  exam: '⏱️ Prüfungssimulation',
}

/** Baut aus einem gespeicherten Versuch eine Teil4Task-Hülle, damit die bestehende
    WritingScoreView (die eine echte Aufgabe mit id/set/model erwartet) unverändert
    wiederverwendet werden kann - model wird hier nirgends angezeigt. */
function asTeil4Task(entry: WritingAttempt): Teil4Task {
  return { id: `notebook-${entry.id ?? 0}`, set: '', situation: entry.situation, points: entry.points, model: '' }
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  return `${d.toLocaleDateString('de-DE')} · ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
}

export default function WritingNotebook() {
  const attempts = useLiveQuery(() => db.writingAttempts.orderBy('ts').reverse().toArray(), [], [])

  return (
    <>
      <AppCard>
        <CardTitle>📓 Schreib-Notizbuch</CardTitle>
        <Text>
          Jeder Teil-4-Text, den du von der KI hast bewerten lassen - egal ob in Üben, im
          Brief-Baukasten oder in der Prüfungssimulation - bleibt hier gespeichert, mit
          Punktzahl und komplettem Feedback zum Nachlesen.
        </Text>
      </AppCard>

      {attempts && attempts.length === 0 && (
        <AppCard>
          <Muted>
            Noch keine bewerteten Texte. Lass in Üben, im Training oder in der Prüfung einen
            Text von der KI bewerten - er landet danach automatisch hier.
          </Muted>
        </AppCard>
      )}

      {attempts?.map((entry) => (
        <AppCard key={entry.id}>
          <HStack justifyContent="space-between" alignItems="flex-start" gap="$2.5" flexWrap="wrap" mb="$1.5">
            <VStack flex={1} sx={{ minWidth: 180 }}>
              <Muted>
                {formatTimestamp(entry.ts)} · {SOURCE_LABEL[entry.source]}
              </Muted>
              <Text size="sm" fontWeight="$semibold" mt="$0.5">
                {entry.situation}
              </Text>
            </VStack>
            <Box bg={entry.result.score >= 3 ? '$success50' : '$error50'} borderRadius="$full" px="$3" py="$0.5">
              <Text fontWeight="$extrabold" color={entry.result.score >= 3 ? '$success700' : '$error700'}>
                {entry.result.score} / 6
              </Text>
            </Box>
          </HStack>

          <Reveal label="Text & Bewertung ansehen">
            <Box bg="$backgroundLight50" borderRadius="$md" p="$3.5" mt="$2" mb="$1">
              <Text sx={{ whiteSpace: 'pre-line' }}>
                <NoTranslate>{entry.text}</NoTranslate>
              </Text>
            </Box>
            <WritingScoreView d={asTeil4Task(entry)} result={entry.result} />
            <Text
              size="sm"
              color="$error600"
              fontWeight="$semibold"
              mt="$2.5"
              onPress={() => {
                if (entry.id !== undefined) void deleteWritingAttempt(entry.id)
              }}
            >
              🗑️ Eintrag löschen
            </Text>
          </Reveal>
        </AppCard>
      ))}
    </>
  )
}
