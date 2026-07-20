import { useState } from 'react'
import { motion } from 'motion/react'
import { openLayer, backLayer } from '../appHistory'
import { DATA } from '../data/content'
import { TranslateZone } from './useWordTranslate'
import { SpeakPractice } from './SpeakPractice'
import { generateModelAnswerTeil5, generateModelAnswerTeil6, generateModelAnswerTeil7 } from '../ai/generateModelAnswers'
import type { Teil6Photo, Teil7Situation } from '../data/types'
import {
  Box, HStack, VStack, Text, Heading, Pressable,
  AppCard, CardTitle, Muted, Tile, TileGrid, TileEmoji, TileTitle, Btn, FootActions, Chip,
  Reveal, ProgressBar,
} from './ui/kit'

const FOTO_BASE = import.meta.env.BASE_URL + 'fotos/'

type Sub = 't5' | 't6' | 't7' | 'rm' | null

export default function Speak() {
  const [sub, setSub] = useState<Sub>(null)

  // Zurück-Taste/-Geste schließt den Unterbereich statt die Seite zu verlassen
  const openSub = (s: Exclude<Sub, null>) => {
    setSub(s)
    openLayer(() => setSub(null))
  }

  if (sub === null) {
    return (
      <>
        <Heading size="xl" color="$primary600" mb="$1">🗣️ Mündlicher Teil (15 Minuten · 15 Punkte)</Heading>
        <Muted>Übe laut! Sprich deine Antworten aus, bevor du die Musterlösungen liest.</Muted>
        <Box mt="$4">
          <TileGrid>
            <Tile onPress={() => openSub('t5')}>
              <TileEmoji>👋</TileEmoji>
              <TileTitle>Teil 5 · Kennenlernen</TileTitle>
              <Muted>{DATA.teil5.length} typische Fragen als Karten – mit Musterantworten (ca. 3 Min.)</Muted>
            </Tile>
            <Tile onPress={() => openSub('t6')}>
              <TileEmoji>📷</TileEmoji>
              <TileTitle>Teil 6 · Über ein Foto sprechen</TileTitle>
              <Muted>Die 3 Originalfotos aus dem Modelltest (ca. 6 Min.)</Muted>
            </Tile>
            <Tile onPress={() => openSub('t7')}>
              <TileEmoji>⚖️</TileEmoji>
              <TileTitle>Teil 7 · Eine Situation besprechen</TileTitle>
              <Muted>{DATA.teil7.length} Situationen mit Vorteilen & Nachteilen (ca. 6 Min.)</Muted>
            </Tile>
            <Tile onPress={() => openSub('rm')}>
              <TileEmoji>💬</TileEmoji>
              <TileTitle>Redemittel</TileTitle>
              <Muted>Nützliche Sätze für Foto, Meinung und Nachricht</Muted>
            </Tile>
          </TileGrid>
        </Box>
      </>
    )
  }

  const back = (
    <Pressable onPress={backLayer} mb="$3.5">
      <Text color="$primary600" fontWeight="$semibold" size="sm">← zurück</Text>
    </Pressable>
  )

  if (sub === 't5') return <>{back}<Flashcards /></>

  if (sub === 't6') {
    return (
      <>
        {back}
        <Muted>Teil 6 · Über ein Foto sprechen · In der Prüfung wählst du 1 von 3 Fotos</Muted>
        {DATA.teil6.map((f) => (
          <TranslateZone key={f.title}>
            <Part6Photo photo={f} />
          </TranslateZone>
        ))}
        <AppCard>
          <CardTitle>So beschreibst du jedes Foto (4 Schritte)</CardTitle>
          <Text>
            1️⃣ <Text fontWeight="$bold">Was sehe ich?</Text> Personen, Ort, Gegenstände{'\n'}
            2️⃣ <Text fontWeight="$bold">Was passiert?</Text> Was machen die Personen gerade?{'\n'}
            3️⃣ <Text fontWeight="$bold">Was vermute ich?</Text> "Ich denke, dass...", "Wahrscheinlich..."{'\n'}
            4️⃣ <Text fontWeight="$bold">Mein Bezug:</Text> eigene Erfahrung oder Meinung dazu
          </Text>
        </AppCard>
      </>
    )
  }

  if (sub === 't7') {
    return (
      <>
        {back}
        <Muted>Teil 7 · Eine Situation besprechen · Sprich mit dem Prüfer über Vorteile und Nachteile</Muted>
        {DATA.teil7.map((s) => (
          <TranslateZone key={s.set}>
            <Part7Situation situation={s} />
          </TranslateZone>
        ))}
        <AppCard>
          <CardTitle>Tipp für Teil 7</CardTitle>
          <Text>
            Nimm am Ende <Text fontWeight="$bold">selbst Stellung</Text>: "Für mich überwiegen die Vorteile, weil..." - die
            Prüfer möchten sehen, dass du deine Meinung begründen kannst.
          </Text>
        </AppCard>
      </>
    )
  }

  // Redemittel
  const r = DATA.redemittel
  return (
    <>
      {back}
      <RedemittelBlock title="📷 Über ein Foto sprechen (Teil 6)" items={r.foto} />
      <RedemittelBlock title="⚖️ Meinung sagen & diskutieren (Teil 7)" items={r.meinung} />
      <RedemittelBlock title="✍️ Eine Nachricht schreiben (Teil 4)" items={r.brief} />
    </>
  )
}

function RedemittelBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <TranslateZone>
      <AppCard>
        <CardTitle>{title}</CardTitle>
        <HStack flexWrap="wrap">
          {items.map((x) => <Chip key={x}>{x}</Chip>)}
        </HStack>
      </AppCard>
    </TranslateZone>
  )
}

function ModelAnswer({ label, text }: { label: string; text: string }) {
  return (
    <Box mt="$3">
      <Reveal label={label}>
        <Box bg="$backgroundLight50" borderRadius="$md" p="$3.5" mt="$2">
          <Text sx={{ whiteSpace: 'pre-line' }}>{text}</Text>
        </Box>
      </Reveal>
    </Box>
  )
}

function ProContra({ pro, contra }: { pro: string[]; contra: string[] }) {
  return (
    <Box mt="$2.5" sx={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      <VStack flex={1} sx={{ minWidth: 220 }} mr="$3" mb="$2">
        <Heading size="sm" color="$success600" mb="$1">Vorteile</Heading>
        <VStack>
          {pro.map((p) => (
            <Text key={p} pl="$5" mb="$1">✓ {p}</Text>
          ))}
        </VStack>
      </VStack>
      <VStack flex={1} sx={{ minWidth: 220 }} mb="$2">
        <Heading size="sm" color="$error600" mb="$1">Nachteile</Heading>
        <VStack>
          {contra.map((c) => (
            <Text key={c} pl="$5" mb="$1">✗ {c}</Text>
          ))}
        </VStack>
      </VStack>
    </Box>
  )
}

function Flashcards() {
  const [idx, setIdx] = useState(0)
  const [show, setShow] = useState(false)
  const f = DATA.teil5[idx]
  return (
    <>
      <Muted>Teil 5 · Kennenlernen · Frage {idx + 1} / {DATA.teil5.length}</Muted>
      <Box mt="$2" mb="$4.5">
        <ProgressBar value={((idx + 1) / DATA.teil5.length) * 100} />
      </Box>
      <motion.div
        key={idx}
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
      <TranslateZone>
        <AppCard>
          <Text size="lg" fontWeight="$semibold" mb="$4" sx={{ textAlign: 'center' }}>
            "{f.q}"
          </Text>
          <Muted>Antworte zuerst laut in 2-3 Saetzen...</Muted>
          <SpeakPractice
            key={f.q}
            context={`Teil 5 (Kennenlernen). Frage des Prufers: ${f.q}. Der Lernende soll in 2-3 Saetzen antworten.`}
            criteria={[
              'Die Frage wirklich beantwortet (2-3 Saetze, nicht nur ja/nein)',
              'Einen Grund oder ein Beispiel genannt (z. B. mit weil)',
            ]}
          />
          {show && (
            <Box bg="$backgroundLight50" borderWidth="$1" borderColor="$borderLight200" borderRadius="$md" p="$3.5" mt="$3.5">
              <Text sx={{ whiteSpace: 'pre-line' }}>{f.a}</Text>
            </Box>
          )}
          <FootActions>
            <Btn variant="secondary" onPress={() => setShow(true)}>Musterantwort</Btn>
            <Btn onPress={() => { setIdx((idx + 1) % DATA.teil5.length); setShow(false) }}>Naechste Frage</Btn>
          </FootActions>
          <AlternativeAnswer question={f.q} />
        </AppCard>
      </TranslateZone>
      </motion.div>
      <Muted>Tipp: Antworte nie nur mit ja oder nein - gib immer ein Beispiel oder einen Grund (weil...). Du darfst auch selbst Fragen stellen!</Muted>
    </>
  )
}

function AlternativeAnswer({ question }: { question: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await generateModelAnswerTeil5(question)
      setAnswer(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Generieren')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box mt="$3">
      <Btn disabled={loading} onPress={handleGenerate} variant="secondary">
        {loading ? 'Generiere...' : 'Alternative Antwort generieren'}
      </Btn>
      {error && <Text color="$error600" mt="$2" size="sm">{error}</Text>}
      {answer && (
        <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$md" p="$3.5" mt="$2">
          <Text fontWeight="$bold" mb="$1.5" size="sm">Alternative Antwort:</Text>
          <Text sx={{ whiteSpace: 'pre-line' }}>{answer}</Text>
        </Box>
      )}
    </Box>
  )
}

function Part6Photo({ photo }: { photo: Teil6Photo }) {
  const [altLoading, setAltLoading] = useState(false)
  const [altError, setAltError] = useState<string | null>(null)
  const [altDescription, setAltDescription] = useState<string | null>(null)

  const handleGenerateAlt = async () => {
    setAltLoading(true)
    setAltError(null)
    try {
      const result = await generateModelAnswerTeil6(photo)
      setAltDescription(result)
    } catch (err) {
      setAltError(err instanceof Error ? err.message : 'Fehler beim Generieren')
    } finally {
      setAltLoading(false)
    }
  }

  return (
    <AppCard>
      <CardTitle>{photo.title}</CardTitle>
      <img
        src={FOTO_BASE + photo.img}
        alt={photo.title}
        style={{ width: '100%', borderRadius: 12, margin: '10px 0', display: 'block' }}
      />
      <Muted>Sprich 2-3 Minuten. Diese Stichworte helfen:</Muted>
      <HStack flexWrap="wrap" mt="$1.5">
        {photo.hints.map((h) => <Chip key={h}>{h}</Chip>)}
      </HStack>
      <SpeakPractice
        key={photo.title}
        context={`Teil 6. Foto: ${photo.title}. Der Lernende beschreibt das Foto 2-3 Minuten.`}
        criteria={[
          'Beschrieben, was auf dem Foto zu sehen ist',
          'Beschrieben, was gerade passiert',
          'Eine Vermutung geaeuert',
          'Eigene Erfahrung oder Meinung dazu gesagt',
        ]}
      />
      <ModelAnswer label="Musterbeschreibung anzeigen" text={photo.model} />
      <Box mt="$3">
        <Btn disabled={altLoading} onPress={handleGenerateAlt} variant="secondary">
          {altLoading ? 'Generiere...' : 'Alternative Beschreibung generieren'}
        </Btn>
        {altError && <Text color="$error600" mt="$2" size="sm">{altError}</Text>}
        {altDescription && (
          <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$md" p="$3.5" mt="$2">
            <Text fontWeight="$bold" mb="$1.5" size="sm">Alternative Beschreibung:</Text>
            <Text sx={{ whiteSpace: 'pre-line' }}>{altDescription}</Text>
          </Box>
        )}
      </Box>
    </AppCard>
  )
}

function Part7Situation({ situation }: { situation: Teil7Situation }) {
  const [altLoading, setAltLoading] = useState(false)
  const [altError, setAltError] = useState<string | null>(null)
  const [altArguments, setAltArguments] = useState<{ pro: string[]; contra: string[] } | null>(null)

  const handleGenerateAlt = async () => {
    setAltLoading(true)
    setAltError(null)
    try {
      const result = await generateModelAnswerTeil7(situation)
      setAltArguments(result)
    } catch (err) {
      setAltError(err instanceof Error ? err.message : 'Fehler beim Generieren')
    } finally {
      setAltLoading(false)
    }
  }

  return (
    <AppCard>
      <Box alignSelf="flex-start" bg="$primary50" borderRadius="$full" px="$3" py="$0.5" mb="$2">
        <Text size="xs" fontWeight="$bold" color="$primary700">{situation.set}</Text>
      </Box>
      <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$lg" p="$3.5" mb="$2">
        <Text fontWeight="$medium">{situation.situation}</Text>
      </Box>
      <Muted>Ueberleg zuerst selbst 2 Vorteile und 2 Nachteile - dann vergleiche:</Muted>
      <SpeakPractice
        key={situation.set}
        context={`Teil 7. Situation: ${situation.situation}. Der Lernende diskutiert Vor- und Nachteile.`}
        criteria={[
          'Mindestens einen Vorteil genannt',
          'Mindestens einen Nachteil genannt',
          'Eigene Meinung mit Begruendung gesagt',
        ]}
      />
      <ProContra pro={situation.pro} contra={situation.contra} />
      <Box mt="$3">
        <Btn disabled={altLoading} onPress={handleGenerateAlt} variant="secondary">
          {altLoading ? 'Generiere...' : 'Alternative Argumente generieren'}
        </Btn>
        {altError && <Text color="$error600" mt="$2" size="sm">{altError}</Text>}
        {altArguments && (
          <Box mt="$2">
            <ProContra pro={altArguments.pro} contra={altArguments.contra} />
            <Text size="sm" color="$textLight600" mt="$2">(Alternative Argumente)</Text>
          </Box>
        )}
      </Box>
    </AppCard>
  )
}
