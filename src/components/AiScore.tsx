/* KI-Bewertung für Teil-4-Texte: schickt Aufgabe + Text an Gemini und zeigt
   Punkte (max. 6) nach den offiziellen Kriterien, Einzelfeedback und die
   wichtigsten Sprachkorrekturen - direkt im Text markiert (durchgestrichen →
   Korrektur), statt in einer separaten Liste. Wird im Übungsmodus und in der
   Prüfungssimulation verwendet. */
import { useEffect, useState } from 'react'
import type { Teil4Task } from '../data/types'
import { scoreWriting, type WritingScore } from '../ai/scoreWriting'
import { WordCount } from './Tasks'
import { Box, HStack, VStack, Text, Btn, Muted } from './ui/kit'

type Correction = { wrong: string; better: string }

export function AiWritingScore({
  d, text, onTextChange,
}: {
  d: Teil4Task
  text: string
  /** Wenn gesetzt, wird das Eingabefeld hier mitgerendert (statt eines separaten
      <textarea> beim Aufrufer) - so können Korrekturen direkt im Text angezeigt
      und per Klick übernommen werden. */
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
      {onTextChange && (
        <WritingInputBox value={text} onChange={onTextChange} corrections={result?.corrections ?? []} resultKey={result} />
      )}
      <WordCount text={text} />

      <HStack gap="$2.5" alignItems="center" flexWrap="wrap" mt="$3">
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

      {/* Korrekturen sind (wenn onTextChange gesetzt ist) schon oben im Text markiert -
          hier also nicht nochmal als Liste anzeigen. */}
      {result && <WritingScoreView d={d} result={result} hideCorrections={!!onTextChange} />}
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

type Segment = { type: 'text'; value: string } | { type: 'correction'; wrong: string; better: string }

/** Zerlegt den Text in Abschnitte, wobei jede (noch im Text vorhandene) Korrektur ein
    eigenes Segment wird - so kann sie an ihrer echten Stelle im Fließtext markiert
    werden, statt in einer separaten Liste. Überlappende Treffer werden ignoriert. */
function buildAnnotatedSegments(text: string, corrections: Correction[]): Segment[] {
  const matches = corrections
    .filter((c) => c.wrong.length > 0)
    .map((c) => ({ ...c, idx: text.indexOf(c.wrong) }))
    .filter((c) => c.idx !== -1)
    .sort((a, b) => a.idx - b.idx)

  const segments: Segment[] = []
  let cursor = 0
  for (const m of matches) {
    if (m.idx < cursor) continue // überlappt mit einer schon platzierten Korrektur
    if (m.idx > cursor) segments.push({ type: 'text', value: text.slice(cursor, m.idx) })
    segments.push({ type: 'correction', wrong: m.wrong, better: m.better })
    cursor = m.idx + m.wrong.length
  }
  if (cursor < text.length) segments.push({ type: 'text', value: text.slice(cursor) })
  return segments
}

const TEXTAREA_STYLE = {
  width: '100%', minHeight: 240, border: '1.5px solid #DBDBDB', borderRadius: 10,
  padding: 14, fontSize: 15, fontFamily: 'inherit', resize: 'vertical' as const, boxSizing: 'border-box' as const,
}

/** Die Schreib-Eingabe für Teil 4: normalerweise ein simples <textarea>. Sobald eine
    KI-Bewertung mit Korrekturen da ist, wechselt sie automatisch in eine Lese-Ansicht,
    die genau gleich aussieht (gleicher Rahmen/Abstand), aber die fehlerhaften Stellen
    direkt im Text durchgestrichen zeigt - mit der Korrektur direkt daneben, anklickbar. */
function WritingInputBox({
  value, onChange, corrections, resultKey,
}: {
  value: string
  onChange: (next: string) => void
  corrections: Correction[]
  /** Ändert sich (neue Objekt-Referenz) bei jeder neuen KI-Bewertung - löst den
      automatischen Wechsel in die Korrektur-Ansicht aus. */
  resultKey: unknown
}) {
  const [editing, setEditing] = useState(true)
  const openCorrections = corrections.filter((c) => value.includes(c.wrong))

  // Nach einer neuen KI-Bewertung mit offenen Korrekturen automatisch die Ansicht
  // zeigen, in der die Fehler direkt im Text markiert sind.
  useEffect(() => {
    if (resultKey && corrections.length > 0) setEditing(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultKey])

  // Sobald keine offenen Korrekturen mehr da sind (alle übernommen oder Text
  // inzwischen selbst angepasst), automatisch zurück zum normalen Schreibfeld.
  useEffect(() => {
    if (!editing && openCorrections.length === 0) setEditing(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCorrections.length])

  if (editing) {
    return (
      <Box>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Schreiben Sie hier Ihre Nachricht …"
          style={TEXTAREA_STYLE}
        />
        {openCorrections.length > 0 && (
          <Text
            size="sm" color="$primary600" fontWeight="$semibold" mt="$1.5"
            onPress={() => setEditing(false)}
          >
            ✏️ {openCorrections.length} {openCorrections.length === 1 ? 'Korrektur' : 'Korrekturen'} im Text ansehen
          </Text>
        )}
      </Box>
    )
  }

  const segments = buildAnnotatedSegments(value, corrections)
  return (
    <Box>
      <Box
        borderWidth="$1.5" borderColor="$borderLight200" borderRadius="$lg" p="$3.5"
        sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, minHeight: 240, fontSize: 15, boxSizing: 'border-box' }}
      >
        {segments.map((s, i) =>
          s.type === 'text' ? (
            <span key={i}>{s.value}</span>
          ) : (
            <span key={i}>
              <Text color="$error600" sx={{ textDecorationLine: 'line-through' }}>{s.wrong}</Text>
              {' '}
              <Text
                color="$success700" fontWeight="$bold"
                onPress={() => onChange(applyCorrection(value, s.wrong, s.better))}
              >
                {s.better} ✓
              </Text>
              {' '}
            </span>
          )
        )}
      </Box>
      <Text size="sm" color="$primary600" fontWeight="$semibold" mt="$1.5" onPress={() => setEditing(true)}>
        ✏️ Weiter bearbeiten
      </Text>
    </Box>
  )
}

/** Anzeige einer KI-Schreibbewertung (auch vom Prüfungsmodus wiederverwendet). */
export function WritingScoreView({
  d, result, hideCorrections,
}: {
  d: Teil4Task
  result: WritingScore
  /** true, wenn die Korrekturen schon anderswo (direkt im Text) gezeigt werden. */
  hideCorrections?: boolean
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

      {!hideCorrections && result.corrections.length > 0 && (
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
