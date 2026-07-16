import { useState } from 'react'
import { motion } from 'motion/react'
import { openLayer, backLayer } from '../appHistory'
import { DATA } from '../data/content'
import { TranslateZone } from './useWordTranslate'
import { SpeakPractice } from './SpeakPractice'
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
            <AppCard>
              <CardTitle>{f.title}</CardTitle>
              <img
                src={FOTO_BASE + f.img}
                alt={f.title}
                style={{ width: '100%', borderRadius: 12, margin: '10px 0', display: 'block' }}
              />
              <Muted>Sprich 2–3 Minuten. Diese Stichworte helfen:</Muted>
              <HStack flexWrap="wrap" mt="$1.5">
                {f.hints.map((h) => <Chip key={h}>{h}</Chip>)}
              </HStack>
              <SpeakPractice
                key={f.title}
                context={`Teil 6 (Über ein Foto sprechen). Foto: „${f.title}“. Stichworte zum Foto: ${f.hints.join(', ')}. Der Lernende soll das Foto 2-3 Minuten beschreiben.`}
                criteria={[
                  'Beschrieben, was auf dem Foto zu sehen ist (Personen, Ort, Gegenstände)',
                  'Beschrieben, was gerade passiert',
                  'Eine Vermutung geäußert („Ich denke, dass …“, „Wahrscheinlich …“)',
                  'Eigene Erfahrung oder Meinung dazu gesagt',
                ]}
              />
              <ModelAnswer label="💡 Musterbeschreibung anzeigen" text={f.model} />
            </AppCard>
          </TranslateZone>
        ))}
        <AppCard>
          <CardTitle>So beschreibst du jedes Foto (4 Schritte)</CardTitle>
          <Text>
            1️⃣ <Text fontWeight="$bold">Was sehe ich?</Text> Personen, Ort, Gegenstände{'\n'}
            2️⃣ <Text fontWeight="$bold">Was passiert?</Text> Was machen die Personen gerade?{'\n'}
            3️⃣ <Text fontWeight="$bold">Was vermute ich?</Text> „Ich denke, dass …“, „Wahrscheinlich …“{'\n'}
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
            <AppCard>
              <Box alignSelf="flex-start" bg="$primary50" borderRadius="$full" px="$3" py="$0.5" mb="$2">
                <Text size="xs" fontWeight="$bold" color="$primary700">{s.set}</Text>
              </Box>
              <Box bg="$yellow50" borderWidth="$1" borderColor="$yellow200" borderRadius="$lg" p="$3.5" mb="$2">
                <Text fontWeight="$medium">{s.situation}</Text>
              </Box>
              <Muted>Überlege zuerst selbst 2 Vorteile und 2 Nachteile – dann vergleiche:</Muted>
              <SpeakPractice
                key={s.set}
                context={`Teil 7 (Eine Situation besprechen). Situation: „${s.situation}“. Der Lernende soll Vorteile und Nachteile besprechen und Stellung nehmen.`}
                criteria={[
                  'Mindestens einen Vorteil genannt',
                  'Mindestens einen Nachteil genannt',
                  'Eigene Meinung mit Begründung gesagt (z. B. mit „weil“ oder „deshalb“)',
                ]}
              />
              <ProContra pro={s.pro} contra={s.contra} />
            </AppCard>
          </TranslateZone>
        ))}
        <AppCard>
          <CardTitle>Tipp für Teil 7</CardTitle>
          <Text>
            Nimm am Ende <Text fontWeight="$bold">selbst Stellung</Text>: „Für mich überwiegen die Vorteile, weil …“ – die
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
            „{f.q}“
          </Text>
          <Muted>Antworte zuerst laut in 2–3 Sätzen …</Muted>
          <SpeakPractice
            key={f.q}
            context={`Teil 5 (Kennenlernen). Frage des Prüfers: „${f.q}“. Der Lernende soll in 2-3 Sätzen antworten.`}
            criteria={[
              'Die Frage wirklich beantwortet (2-3 Sätze, nicht nur „ja“/„nein“)',
              'Einen Grund oder ein Beispiel genannt (z. B. mit „weil“)',
            ]}
          />
          {show && (
            <Box bg="$backgroundLight50" borderWidth="$1" borderColor="$borderLight200" borderRadius="$md" p="$3.5" mt="$3.5">
              <Text sx={{ whiteSpace: 'pre-line' }}>{f.a}</Text>
            </Box>
          )}
          <FootActions>
            <Btn variant="secondary" onPress={() => setShow(true)}>Musterantwort 💡</Btn>
            <Btn onPress={() => { setIdx((idx + 1) % DATA.teil5.length); setShow(false) }}>Nächste Frage →</Btn>
          </FootActions>
        </AppCard>
      </TranslateZone>
      </motion.div>
      <Muted>Tipp: Antworte nie nur mit „Ja“ oder „Nein“ – gib immer ein Beispiel oder einen Grund (…, weil …). Du darfst auch selbst Fragen stellen!</Muted>
    </>
  )
}
