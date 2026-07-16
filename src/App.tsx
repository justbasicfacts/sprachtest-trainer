import { useEffect, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'motion/react'
import { db, seedVocab, type ExamResult } from './db'
import Practice from './components/Practice'
import Exam from './components/Exam'
import Speak from './components/Speak'
import Vocab from './components/Vocab'
import {
  Box, HStack, VStack, Text, Heading, Pressable, useBreakpointValue,
  Page, AppCard, CardTitle, Muted, Tile, TileGrid, TileEmoji, TileTitle, ConfirmDialog,
} from './components/ui/kit'

type TabId = 'home' | 'practice' | 'exam' | 'speak' | 'vocab'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: 'Start', icon: '🏠' },
  { id: 'practice', label: 'Üben', icon: '🎯' },
  { id: 'exam', label: 'Prüfung', icon: '⏱️' },
  { id: 'speak', label: 'Sprechen', icon: '🗣️' },
  { id: 'vocab', label: 'Vokabeln', icon: '📚' },
]

export default function App() {
  const [view, setView] = useState<TabId>('home')
  const [examActive, setExamActive] = useState(false)
  // Ziel-Tab, der noch bestätigt werden muss, weil gerade eine Prüfung läuft
  const [pendingView, setPendingView] = useState<TabId | null>(null)
  // Auf dem Handy wandert die Navigation nach unten (Daumen-Reichweite, App-Gefühl);
  // ab Tablet-Breite bleibt sie als klassische Tableiste oben.
  const bottomNav = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    seedVocab()
  }, [])

  const go = (v: TabId) => {
    setExamActive(false)
    setView(v)
    window.scrollTo(0, 0)
  }

  const nav = (v: TabId) => {
    if (examActive) {
      setPendingView(v)
      return
    }
    go(v)
  }

  return (
    <Box flex={1} minHeight="$full" bg="$backgroundLight50">
      <Box bg="$primary600" px="$5" py="$3.5" sx={{ position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
        <HStack alignItems="center" gap="$3.5">
          <Text fontSize={26}>🐻</Text>
          <VStack flex={1}>
            <Heading size="sm" color="$white">
              Berliner Sprachtest für die Einbürgerung
            </Heading>
            <Text size="2xs" color="$white" sx={{ opacity: 0.75 }}>
              B1-Trainer · Lesen · Schreiben · Sprechen · Vokabeln
            </Text>
          </VStack>
        </HStack>
      </Box>

      {!bottomNav && <TopNav view={view} onNav={nav} />}

      <Box pb={bottomNav ? '$20' : '$0'}>
        <Page>
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {view === 'home' && <Home go={nav} />}
            {view === 'practice' && <Practice />}
            {view === 'exam' && <Exam setExamActive={setExamActive} />}
            {view === 'speak' && <Speak />}
            {view === 'vocab' && <Vocab />}
          </motion.div>
        </Page>
      </Box>

      {bottomNav && <BottomNav view={view} onNav={nav} />}

      <ConfirmDialog
        open={pendingView !== null}
        onOpenChange={(open) => {
          if (!open) setPendingView(null)
        }}
        title="Prüfung abbrechen?"
        description="Der Fortschritt dieser Prüfungssimulation geht verloren."
        cancelLabel="Zurück zur Prüfung"
        confirmLabel="Prüfung abbrechen"
        onConfirm={() => {
          if (pendingView) go(pendingView)
          setPendingView(null)
        }}
      />
    </Box>
  )
}

function TopNav({ view, onNav }: { view: TabId; onNav: (v: TabId) => void }) {
  return (
    <Box bg="$backgroundLight0" borderBottomWidth="$1" borderBottomColor="$borderLight200" sx={{ position: 'sticky', top: 58, zIndex: 40 }}>
      <HStack sx={{ overflowX: 'auto' }}>
        {TABS.map((t) => {
          const active = view === t.id
          return (
            <Pressable key={t.id} onPress={() => onNav(t.id)} flex={1} sx={{ minWidth: 90, position: 'relative' }}>
              <VStack alignItems="center" py="$3" px="$2">
                <Text size="sm" fontWeight="$semibold" color={active ? '$primary600' : '$textLight500'}>
                  {t.label}
                </Text>
              </VStack>
              {active && (
                <motion.div
                  layoutId="topnav-underline"
                  className="kit-nav-underline"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
            </Pressable>
          )
        })}
      </HStack>
    </Box>
  )
}

function BottomNav({ view, onNav }: { view: TabId; onNav: (v: TabId) => void }) {
  return (
    <HStack
      bg="$backgroundLight0"
      borderTopWidth="$1"
      borderTopColor="$borderLight200"
      py="$1.5"
      sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        boxShadow: '0 -2px 10px rgba(0,0,0,.08)', paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map((t) => {
        const active = view === t.id
        return (
          <Pressable key={t.id} onPress={() => onNav(t.id)} flex={1}>
            <VStack alignItems="center" py="$1.5">
              <motion.div
                animate={{ scale: active ? 1.18 : 1, y: active ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Text fontSize={20}>{t.icon}</Text>
              </motion.div>
              <Text size="2xs" fontWeight="$semibold" color={active ? '$primary600' : '$textLight500'} mt="$0.5">
                {t.label}
              </Text>
            </VStack>
          </Pressable>
        )
      })}
    </HStack>
  )
}

function Home({ go }: { go: (v: TabId) => void }) {
  const hist = useLiveQuery<ExamResult[], ExamResult[]>(
    () => db.results.orderBy('id').reverse().limit(6).toArray(),
    [],
    []
  )
  const dueCount = useLiveQuery<number, number>(
    () => db.vocab.where('due').belowOrEqual(Date.now()).count(),
    [],
    0
  )

  const TILES: { id: TabId; icon: string; title: string; sub: ReactNode }[] = [
    { id: 'practice', icon: '🎯', title: 'Üben', sub: 'Alle Aufgaben ohne Zeitdruck, mit sofortigem Feedback und Erklärungen.' },
    { id: 'exam', icon: '⏱️', title: 'Prüfungssimulation', sub: 'Kompletter schriftlicher Test mit echter Zeit: 30 Min. Lesen + 20 Min. Schreiben.' },
    { id: 'speak', icon: '🗣️', title: 'Sprechen', sub: 'Kennenlernen-Fragen, Fotobeschreibung mit Originalfotos und Situationen mit Pro & Contra.' },
    {
      id: 'vocab', icon: '📚', title: 'Vokabeln',
      sub: dueCount != null && dueCount > 0 ? <Text fontWeight="$bold">{dueCount} Wörter fällig – jetzt wiederholen!</Text> : 'B1-Wortschatz mit Spaced Repetition.',
    },
  ]

  return (
    <>
      <AppCard>
        <CardTitle>Willkommen! 🇩🇪</CardTitle>
        <Text>
          Diese App bereitet dich auf den <Text fontWeight="$bold">Berliner Sprachtest für die Einbürgerung</Text> (Niveau
          B1) vor – mit dem originalen Modelltest der Berliner Volkshochschulen, zusätzlichen Übungssätzen im gleichen
          Format und einem Vokabeltrainer.
        </Text>
      </AppCard>
      <AppCard>
        <CardTitle>ℹ️ So funktioniert die Prüfung</CardTitle>
        <Text>
          <Text fontWeight="$bold">Schriftlicher Teil (15 P):</Text> Lesen 30 Min. (Teil 1–3, 9 P) + Schreiben 20 Min.
          (Teil 4, 6 P){'\n'}
          <Text fontWeight="$bold">Mündlicher Teil (15 P):</Text> Sprechen 15 Min. (Teil 5–7)
        </Text>
        <Text mt="$2">
          <Text fontWeight="$bold">Bestanden:</Text> insgesamt mindestens <Text fontWeight="$bold">18 von 30 Punkten (60 %)</Text> – und in
          jedem Teil (schriftlich und mündlich) mindestens <Text fontWeight="$bold">7,5 von 15 Punkten (50 %)</Text>.
        </Text>
      </AppCard>
      <TileGrid>
        {TILES.map((t) => (
          <Tile key={t.id} onPress={() => go(t.id)}>
            <TileEmoji>{t.icon}</TileEmoji>
            <TileTitle>{t.title}</TileTitle>
            <Muted>{t.sub}</Muted>
          </Tile>
        ))}
      </TileGrid>
      {hist && hist.length > 0 && (
        <AppCard>
          <CardTitle>📈 Deine letzten Prüfungen</CardTitle>
          <VStack gap="$0">
            {hist.map((r) => (
              <HStack key={r.id} justifyContent="space-between" borderTopWidth="$1" borderTopColor="$borderLight200" py="$2">
                <Text size="sm">
                  {r.date} · {r.test}
                </Text>
                <Text fontWeight="$bold" color={r.total >= 7.5 ? '$success600' : '$error600'}>
                  {r.total} / 15 P
                </Text>
              </HStack>
            ))}
          </VStack>
        </AppCard>
      )}
    </>
  )
}
