import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, nextReview, type VocabWord, type ExamResult } from '../db'
import { VOCAB_TAGS, type VocabSeedEntry } from '../data/vocab'
import {
  Box, HStack, VStack, Text, Heading, Pressable, useBreakpointValue,
  AppCard, Muted, Btn, ScoreBox,
} from './ui/kit'

type VocabTab = 'lernen' | 'liste' | 'stats'

const inputStyle: React.CSSProperties = {
  border: '1.5px solid #DBDBDB', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box',
}

export default function Vocab() {
  const [tab, setTab] = useState<VocabTab>('lernen')
  return (
    <>
      <Heading size="xl" color="$primary600" mb="$1">📚 Vokabeltrainer</Heading>
      <Muted>
        Prüfungsrelevante B1-Wörter mit Beispielsätzen – gespeichert in einer Datenbank in deinem Browser (IndexedDB), mit
        Wiederholung im richtigen Abstand (Spaced Repetition).
      </Muted>
      <HStack flexWrap="wrap" gap="$2" mt="$3.5" mb="$4">
        <VTab label="🃏 Lernen" active={tab === 'lernen'} onPress={() => setTab('lernen')} />
        <VTab label="📖 Wörter" active={tab === 'liste'} onPress={() => setTab('liste')} />
        <VTab label="📊 Statistik" active={tab === 'stats'} onPress={() => setTab('stats')} />
      </HStack>
      {tab === 'lernen' && <Learn />}
      {tab === 'liste' && <WordList />}
      {tab === 'stats' && <Stats />}
    </>
  )
}

function VTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Box
        borderWidth="$2"
        borderColor={active ? '$primary600' : '$borderLight200'}
        bg={active ? '$primary50' : '$backgroundLight0'}
        borderRadius="$full"
        px="$4"
        py="$1.5"
      >
        <Text fontWeight="$semibold" size="sm" color={active ? '$primary600' : '$textLight500'}>
          {label}
        </Text>
      </Box>
    </Pressable>
  )
}

/* ---------- Lernen (Flashcards + SRS) ---------- */
function Learn() {
  const due = useLiveQuery<VocabWord[], VocabWord[] | null>(
    () => db.vocab.where('due').belowOrEqual(Date.now()).limit(20).toArray(),
    [], null
  )
  const [flipped, setFlipped] = useState(false)

  if (due === null) return <Muted>Lade …</Muted>
  if (due.length === 0) {
    return (
      <AppCard>
        <Heading size="lg" mb="$1.5" sx={{ textAlign: 'center' }}>🎉 Alles gelernt!</Heading>
        <Muted>Im Moment sind keine Wörter fällig. Schau später wieder vorbei – die Wiederholungen kommen automatisch zurück.</Muted>
      </AppCard>
    )
  }

  const w = due[0]
  const grade = async (g: 0 | 1 | 2) => {
    if (w.id === undefined) return
    await db.vocab.update(w.id, nextReview(w, g))
    setFlipped(false)
  }

  return (
    <>
      <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$lg" p="$3" mb="$3.5">
        <Text size="sm">
          📌 Noch <Text fontWeight="$bold">{due.length}{due.length === 20 ? '+' : ''}</Text> Wörter fällig
        </Text>
      </Box>
      <AppCard>
        <Box sx={{ alignItems: 'center' }}>
          <Box alignSelf="center" bg="$primary50" borderRadius="$full" px="$3" py="$0.5" mb="$2">
            <Text size="xs" fontWeight="$bold" color="$primary700">{w.tag}</Text>
          </Box>
          <Text size="2xl" fontWeight="$extrabold" color="$primary600" sx={{ textAlign: 'center' }}>
            {w.de}
          </Text>
          <Text color="$textLight500" mt="$3" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
            „{w.ex}“
          </Text>
          {!flipped ? (
            <Box mt="$4.5">
              <Btn onPress={() => setFlipped(true)}>Umdrehen 🔄</Btn>
            </Box>
          ) : (
            <>
              <VStack borderTopWidth="$1" borderTopColor="$borderLight200" sx={{ borderStyle: 'dashed' }} mt="$4" pt="$4" gap="$1">
                <Text size="lg">
                  <Text size="xs" fontWeight="$bold" color="$textLight500">EN </Text>{w.en}
                </Text>
                <Text size="lg">
                  <Text size="xs" fontWeight="$bold" color="$textLight500">TR </Text>{w.tr}
                </Text>
              </VStack>
              <HStack gap="$2.5" flexWrap="wrap" justifyContent="center" mt="$4.5">
                <GradeBtn label="Nochmal" sub="in 10 Min." color="$error600" onPress={() => grade(0)} />
                <GradeBtn label="Gut" sub={w.reps === 0 ? 'in 1 Tag' : `in ${Math.ceil((w.interval || 1) * 2.2)} Tagen`} color="$primary600" onPress={() => grade(1)} />
                <GradeBtn label="Leicht" sub={w.reps === 0 ? 'in 3 Tagen' : `in ${Math.min((w.interval || 1) * 3, 180)} Tagen`} color="$success600" onPress={() => grade(2)} />
              </HStack>
            </>
          )}
        </Box>
      </AppCard>
      <Muted>Tipp: Sag das Wort und den Beispielsatz laut, bevor du umdrehst.</Muted>
    </>
  )
}

function GradeBtn({ label, sub, color, onPress }: { label: string; sub: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Box bg={color} borderRadius="$lg" px="$4" py="$2.5" sx={{ alignItems: 'center' }}>
        <Text color="$white" fontWeight="$semibold">{label}</Text>
        <Text color="$white" size="2xs" sx={{ opacity: 0.85 }}>{sub}</Text>
      </Box>
    </Pressable>
  )
}

/* ---------- Wörterliste + eigene Wörter ---------- */
function WordList() {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [showForm, setShowForm] = useState(false)
  const stacked = useBreakpointValue({ base: true, sm: false })

  const words = useLiveQuery<VocabWord[], VocabWord[] | null>(async () => {
    const coll = tag ? db.vocab.where('tag').equals(tag) : db.vocab
    let arr = await coll.toArray()
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      arr = arr.filter((w) => (w.de + ' ' + w.en + ' ' + w.tr).toLowerCase().includes(s))
    }
    return arr.sort((a, b) => a.de.localeCompare(b.de, 'de'))
  }, [q, tag], null)

  return (
    <>
      <Box sx={{ flexDirection: stacked ? 'column' : 'row', flexWrap: 'wrap' }} style={{ gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Suchen (deutsch, englisch, türkisch) …"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 160 }}
        />
        <select value={tag} onChange={(e) => setTag(e.target.value)} style={inputStyle}>
          <option value="">Alle Themen</option>
          {VOCAB_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <Btn variant="gold" small onPress={() => setShowForm((v) => !v)}>+ Eigenes Wort</Btn>
      </Box>

      {showForm && <AddWord onDone={() => setShowForm(false)} />}

      {words === null ? <Muted>Lade …</Muted> : (
        <AppCard>
          <Muted>{words.length} Wörter</Muted>
          <VStack mt="$1">
            {words.map((w) => (
              <HStack key={w.id} alignItems="center" gap="$2.5" borderTopWidth="$1" borderTopColor="$borderLight200" py="$2.5">
                <VStack flex={1}>
                  <HStack flexWrap="wrap" alignItems="center" gap="$1.5">
                    <Text fontWeight="$bold" color="$primary600">{w.de}</Text>
                    <Box bg="$primary50" borderRadius="$full" px="$2" py="$0.5">
                      <Text size="2xs" fontWeight="$bold" color="$primary700">{w.tag}</Text>
                    </Box>
                    {w.custom ? (
                      <Box bg="$primary50" borderRadius="$full" px="$2" py="$0.5">
                        <Text size="2xs" fontWeight="$bold" color="$primary700">eigenes</Text>
                      </Box>
                    ) : null}
                  </HStack>
                  <Muted mt="$0.5">EN: {w.en} · TR: {w.tr}</Muted>
                  <Text size="sm" color="$textLight500" sx={{ fontStyle: 'italic' }} mt="$0.5">„{w.ex}“</Text>
                </VStack>
                {w.custom ? (
                  <Pressable onPress={() => w.id !== undefined && db.vocab.delete(w.id)}>
                    <Text color="$error600">🗑</Text>
                  </Pressable>
                ) : null}
              </HStack>
            ))}
          </VStack>
        </AppCard>
      )}
    </>
  )
}

function AddWord({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState<VocabSeedEntry>({ de: '', en: '', tr: '', ex: '', tag: 'Eigene' })
  const set = (k: keyof VocabSeedEntry) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })
  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!f.de.trim()) return
    await db.vocab.add({ ...f, custom: 1, due: Date.now(), interval: 0, reps: 0 })
    onDone()
  }
  return (
    <AppCard>
      <Heading size="lg" mb="$2">Eigenes Wort hinzufügen</Heading>
      <form onSubmit={save} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <input style={{ ...inputStyle, gridColumn: '1 / -1' }} placeholder="Deutsch, z. B. die Erfahrung, -en *" value={f.de} onChange={set('de')} required />
        <input style={inputStyle} placeholder="Englisch" value={f.en} onChange={set('en')} />
        <input style={inputStyle} placeholder="Türkisch" value={f.tr} onChange={set('tr')} />
        <input style={{ ...inputStyle, gridColumn: '1 / -1' }} placeholder="Beispielsatz" value={f.ex} onChange={set('ex')} />
        <select style={inputStyle} value={f.tag} onChange={set('tag')}>
          {VOCAB_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Btn>Speichern</Btn>
        </Box>
      </form>
    </AppCard>
  )
}

/* ---------- Statistik ---------- */
interface VocabStats {
  total: number
  due: number
  started: number
  mature: number
  custom: number
}

function Stats() {
  const stats = useLiveQuery<VocabStats, VocabStats | null>(async () => {
    const all = await db.vocab.toArray()
    const now = Date.now()
    return {
      total: all.length,
      due: all.filter((w) => w.due <= now).length,
      started: all.filter((w) => w.reps > 0).length,
      mature: all.filter((w) => (w.interval || 0) >= 21).length,
      custom: all.filter((w) => w.custom).length,
    }
  }, [], null)
  const results = useLiveQuery<ExamResult[], ExamResult[]>(() => db.results.orderBy('id').reverse().limit(8).toArray(), [], [])

  if (stats === null) return <Muted>Lade …</Muted>
  return (
    <>
      <AppCard>
        <Heading size="lg" color="$primary600" mb="$2.5">Vokabeln</Heading>
        <HStack gap="$3" flexWrap="wrap">
          <ScoreBox n={stats.total} label="Wörter gesamt" />
          <ScoreBox n={stats.due} label="jetzt fällig" />
          <ScoreBox n={stats.started} label="in Wiederholung" />
          <ScoreBox n={stats.mature} label="langfristig gelernt" />
          <ScoreBox n={stats.custom} label="eigene Wörter" />
        </HStack>
      </AppCard>
      <AppCard>
        <Heading size="lg" color="$primary600" mb="$2.5">Prüfungsergebnisse</Heading>
        {results.length === 0 ? <Muted>Noch keine Prüfungssimulation abgeschlossen.</Muted> :
          <VStack>
            {results.map((r) => (
              <HStack key={r.id} justifyContent="space-between" borderTopWidth="$1" borderTopColor="$borderLight200" py="$2">
                <Text size="sm">{r.date} · {r.test}</Text>
                <Text fontWeight="$bold" color={r.total >= 7.5 ? '$success600' : '$error600'}>{r.total} / 15 P</Text>
              </HStack>
            ))}
          </VStack>
        }
      </AppCard>
    </>
  )
}
