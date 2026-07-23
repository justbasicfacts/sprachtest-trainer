/* Wiederverwendbare Aufgaben-Komponenten für Teil 1–4.
   mode: 'practice' => sofortiges Feedback, 'exam' => keine Auflösung, 'review' => alles aufgelöst */
import { useState, type ReactNode } from 'react'
import type { Teil1Task, Teil2Task, Teil3Task, Teil4Task } from '../data/types'
import { TranslateZone } from './useWordTranslate'
import {
  Box, HStack, VStack, Text, Pressable,
  Tag, Btn, FootActions, SituationBox, ReadingBox, Feedback, ChoiceCard, Muted, Chip, Reveal,
} from './ui/kit'

export type Mode = 'practice' | 'exam' | 'review'

export interface Teil1Props {
  d: Teil1Task
  ans: number | undefined
  onPick: (i: number) => void
  mode: Mode
  /** Im Übungsmodus wird erst nach explizitem "Antwort abgeben" ausgewertet,
      damit ein versehentlicher Klick nicht sofort die Lösung verrät. */
  submitted?: boolean
}

export function Teil1({ d, ans, onPick, mode, submitted = false }: Teil1Props) {
  const revealed = mode === 'review' || (mode === 'practice' && submitted)
  return (
    <TranslateZone>
      <Box mb="$6">
        <Tag>Teil 1 · Die passende Anzeige ankreuzen · 2,5 Punkte</Tag>
        <Muted>
          Welche Anzeige passt zu dieser Situation? Es gibt nur <Text fontWeight="$bold">eine</Text> Lösung.
        </Muted>
        <SituationBox>{d.situation}</SituationBox>
        {d.ads.map((ad, i) => {
          const state = revealed ? (i === d.correct ? 'correct' : i === ans ? 'wrong' : 'none') : 'none'
          return (
            <ChoiceCard key={i} letter={'abc'[i]} selected={i === ans} state={state} disabled={revealed} onPress={() => onPick(i)}>
              <Text fontWeight="$bold" sx={{ whiteSpace: 'pre-line' }}>
                {ad.head}
              </Text>
              <Text mt="$1">{ad.body}</Text>
              <Muted mt="$1.5">{ad.foot}</Muted>
            </ChoiceCard>
          )
        })}
        {revealed && <Feedback ok={ans === d.correct} unanswered={ans === undefined} text={d.expl} />}
      </Box>
    </TranslateZone>
  )
}

export interface Teil2Props {
  d: Teil2Task
  ans: (number | undefined)[]
  onPick: (i: number, v: number) => void
  mode: Mode
  /** Im Übungsmodus wird erst nach explizitem "Antworten abgeben" ausgewertet. */
  submitted?: boolean
}

export function Teil2({ d, ans, onPick, mode, submitted = false }: Teil2Props) {
  return (
    <TranslateZone>
      <Box mb="$6">
        <Tag>Teil 2 · Richtig oder falsch ankreuzen · 4 Punkte</Tag>
        <Muted>Lesen Sie den Zeitungsartikel. Kreuzen Sie an: richtig oder falsch.</Muted>
        <ReadingBox title={d.title}>{d.text}</ReadingBox>
        {d.items.map((it, i) => {
          const given = ans[i]
          const corr = it.a ? 1 : 0
          const revealed = mode === 'review' || (mode === 'practice' && submitted)
          return (
            <Box key={i} borderTopWidth={i === 0 ? '$0' : '$1'} borderTopColor="$borderLight200" py="$3">
              <HStack alignItems="center" gap="$2.5" flexWrap="wrap">
                <Text flex={1} sx={{ minWidth: 200 }}>
                  <Text fontWeight="$bold">{'abcd'[i]}</Text> &nbsp;{it.s}
                </Text>
                {/* Als Paar gruppiert, damit die beiden Buttons beim Umbruch (Handy)
                    zusammen in die nächste Zeile wandern statt auseinanderzureißen */}
                <HStack gap="$2.5">
                  <RfButton label="richtig" active={given === 1} state={revealed ? (corr === 1 ? 'correct' : given === 1 ? 'wrong' : 'none') : 'none'} disabled={revealed} onPress={() => onPick(i, 1)} />
                  <RfButton label="falsch" active={given === 0} state={revealed ? (corr === 0 ? 'correct' : given === 0 ? 'wrong' : 'none') : 'none'} disabled={revealed} onPress={() => onPick(i, 0)} />
                </HStack>
              </HStack>
              {revealed && <Feedback ok={given === corr} unanswered={given === undefined} text={it.e} />}
            </Box>
          )
        })}
      </Box>
    </TranslateZone>
  )
}

function RfButton({
  label, active, state, disabled, onPress,
}: {
  label: string
  active: boolean
  state: 'none' | 'correct' | 'wrong'
  disabled: boolean
  onPress: () => void
}) {
  const border = state === 'correct' ? '$success400' : state === 'wrong' ? '$error400' : active ? '$primary600' : '$borderLight200'
  const bg = state === 'correct' ? '$success50' : state === 'wrong' ? '$error50' : active ? '$primary50' : '$backgroundLight0'
  const color = state === 'correct' ? '$success700' : state === 'wrong' ? '$error700' : active ? '$primary600' : '$textLight500'
  return (
    <Pressable onPress={disabled ? undefined : onPress} opacity={disabled && !active ? 0.6 : 1}>
      <Box borderWidth="$2" borderColor={border} bg={bg} borderRadius="$md" px="$4" py="$1.5">
        <Text fontWeight="$semibold" size="sm" color={color}>
          {label}
        </Text>
      </Box>
    </Pressable>
  )
}

export interface Teil3Props {
  d: Teil3Task
  ans: number | undefined
  onPick: (i: number) => void
  mode: Mode
  /** Im Übungsmodus wird erst nach explizitem "Antwort abgeben" ausgewertet. */
  submitted?: boolean
}

export function Teil3({ d, ans, onPick, mode, submitted = false }: Teil3Props) {
  const revealed = mode === 'review' || (mode === 'practice' && submitted)
  return (
    <TranslateZone>
      <Box mb="$6">
        <Tag>Teil 3 · Die passende Überschrift ankreuzen · 2,5 Punkte</Tag>
        <Muted>
          Lesen Sie den Zeitungsartikel. Kreuzen Sie die passende Überschrift an. Es gibt nur{' '}
          <Text fontWeight="$bold">eine</Text> Lösung.
        </Muted>
        <ReadingBox>{d.text}</ReadingBox>
        {d.options.map((o, i) => {
          const state = revealed ? (i === d.correct ? 'correct' : i === ans ? 'wrong' : 'none') : 'none'
          return (
            <ChoiceCard key={i} letter={'abc'[i]} selected={i === ans} state={state} disabled={revealed} onPress={() => onPick(i)}>
              <Text>{o}</Text>
            </ChoiceCard>
          )
        })}
        {revealed && <Feedback ok={ans === d.correct} unanswered={ans === undefined} text={d.expl} />}
      </Box>
    </TranslateZone>
  )
}

export interface Teil4PromptProps {
  d: Teil4Task
  children: ReactNode
}

export function Teil4Prompt({ d, children }: Teil4PromptProps) {
  return (
    <TranslateZone>
      <Box mb="$6">
        <Tag>Teil 4 · Eine Nachricht schreiben · max. 6 Punkte · 20 Minuten</Tag>
        <Muted>Sie sind in dieser Situation:</Muted>
        <SituationBox>{d.situation}</SituationBox>
        <Text>Schreiben Sie zu folgenden Punkten jeweils 1–2 Sätze:</Text>
        <VStack mt="$1.5" mb="$1">
          {d.points.map((p) => (
            <Text key={p} pl="$5">
              ✓ {p}
            </Text>
          ))}
        </VStack>
        <Muted mt="$1">
          Denken Sie an eine passende <Text fontWeight="$bold">Anrede</Text> am Anfang und einen{' '}
          <Text fontWeight="$bold">Gruß</Text> am Ende.
        </Muted>
        <WritingHints />
        {children}
      </Box>
    </TranslateZone>
  )
}

/** Bausteine für jede Nachricht, von der Anrede bis zum Gruß - passend zu den
    Formulierungshilfen. */
const BRIEF_STRUCTURE = [
  { step: '1️⃣ Anrede', hint: '„Sehr geehrte Damen und Herren,“ oder „Liebe Frau …,“' },
  { step: '2️⃣ Grund nennen', hint: 'Warum schreiben Sie? „ich schreibe Ihnen, weil …“' },
  { step: '3️⃣ Alle Punkte behandeln', hint: 'Zu jedem Punkt 1-2 Sätze, der Reihe nach' },
  { step: '4️⃣ Schluss + Gruß', hint: '„Vielen Dank im Voraus!“ und „Mit freundlichen Grüßen“' },
]

/** Formulierungshilfen für Teil 4, nach Textabschnitt gruppiert (Anrede → Gruß). */
const BRIEF_HINTS: { label: string; phrases: string[] }[] = [
  {
    label: 'Anrede',
    phrases: ['Sehr geehrte Damen und Herren,', 'Sehr geehrte Frau …,', 'Sehr geehrter Herr …,', 'Liebe Frau …,', 'Lieber Herr …,', 'Hallo …,'],
  },
  {
    label: 'Einleitung',
    phrases: ['ich schreibe Ihnen, weil …', 'ich habe Ihre Anzeige gelesen und …', 'ich möchte Ihnen mitteilen, dass …', 'leider muss ich Ihnen sagen, dass …'],
  },
  {
    label: 'Bitten & Fragen',
    phrases: ['Ich möchte gern wissen, ob / wann / wie viel …', 'Könnten Sie mir bitte sagen, …?', 'Wäre es möglich, dass …?', 'Ich wäre Ihnen sehr dankbar, wenn …'],
  },
  {
    label: 'Verbinden & Begründen',
    phrases: ['…, weil …', '…, deshalb …', 'Außerdem …', 'Trotzdem …'],
  },
  {
    label: 'Schluss',
    phrases: ['Über eine schnelle Antwort würde ich mich freuen.', 'Vielen Dank im Voraus!', 'Bei Fragen können Sie mich gern anrufen.'],
  },
  {
    label: 'Gruß',
    phrases: ['Mit freundlichen Grüßen', 'Viele Grüße', 'Liebe Grüße'],
  },
]

function WritingHints() {
  return (
    <Box mt="$3">
      <Reveal label="💡 Formulierungshilfen & Aufbau">
        <Box bg="$backgroundLight50" borderRadius="$md" p="$3.5" mt="$2">
          <VStack mb="$3" gap="$1">
            {BRIEF_STRUCTURE.map((s) => (
              <Text key={s.step} size="sm">
                <Text fontWeight="$bold">{s.step}:</Text> {s.hint}
              </Text>
            ))}
          </VStack>
          {BRIEF_HINTS.map((group) => (
            <Box key={group.label} mb="$2.5">
              <Text size="sm" fontWeight="$bold" mb="$1" color="$primary700">
                {group.label}
              </Text>
              <HStack flexWrap="wrap">
                {group.phrases.map((p) => (
                  <Chip key={p}>{p}</Chip>
                ))}
              </HStack>
            </Box>
          ))}
        </Box>
      </Reveal>
    </Box>
  )
}

export function WordCount({ text }: { text: string }) {
  const n = text.trim() ? text.trim().split(/\s+/).length : 0
  return (
    <Text size="xs" color="$textLight500" mt="$1" sx={{ textAlign: 'right' }}>
      {n} Wörter
    </Text>
  )
}

export interface SelfAssessProps {
  d: Teil4Task
  onDone: (n: number) => void
}

export function SelfAssess({ d, onDone }: SelfAssessProps) {
  const labels = [
    ...d.points.map((p) => `Punkt „${p}“ mit 1–2 Sätzen behandelt`),
    'Passende Anrede und Gruß vorhanden',
    'Text gut verständlich, Sätze verbunden (weil, deshalb, und …)',
  ]
  const [checked, setChecked] = useState<boolean[]>(() => labels.map(() => false))

  return (
    <Box borderWidth="$1" borderColor="$borderLight200" borderRadius="$xl" p="$4" mt="$3.5">
      <Text fontWeight="$bold" mb="$1.5">
        Checkliste – vergib deine Punkte selbst (max. 6)
      </Text>
      <Muted>In der echten Prüfung bewerten Prüfer Inhalt und Sprache. Kreuze ehrlich an:</Muted>
      <VStack mt="$2">
        {labels.map((label, i) => (
          <CheckRow
            key={i}
            checked={checked[i]}
            label={label}
            onToggle={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
          />
        ))}
      </VStack>
      <FootActions>
        <Btn variant="gold" onPress={() => onDone(checked.filter(Boolean).length)}>
          Punkte zählen
        </Btn>
      </FootActions>
    </Box>
  )
}

export function CheckRow({ checked, label, onToggle, points = 1 }: { checked: boolean; label: ReactNode; onToggle: () => void; points?: number }) {
  return (
    <Pressable onPress={onToggle}>
      <HStack gap="$2.5" alignItems="flex-start" borderTopWidth="$1" borderTopColor="$borderLight200" py="$2">
        <Box
          mt="$0.5"
          w={20}
          h={20}
          borderRadius="$sm"
          borderWidth="$2"
          borderColor={checked ? '$primary600' : '$borderLight200'}
          bg={checked ? '$primary600' : '$backgroundLight0'}
          alignItems="center"
          justifyContent="center"
        >
          {checked && (
            <Text color="$white" size="2xs" fontWeight="$bold">
              ✓
            </Text>
          )}
        </Box>
        <Text flex={1}>
          {label} <Text fontWeight="$bold">({points} P)</Text>
        </Text>
      </HStack>
    </Pressable>
  )
}

/* Punkte für den Leseteil berechnen */
export function scoreLesen(
  t1: Teil1Task,
  t2: Teil2Task,
  t3: Teil3Task,
  a1: number | undefined,
  a2: (number | undefined)[],
  a3: number | undefined
): number {
  let pts = 0
  if (a1 === t1.correct) pts += 2.5
  t2.items.forEach((it, i) => { if (a2[i] === (it.a ? 1 : 0)) pts += 1 })
  if (a3 === t3.correct) pts += 2.5
  return pts
}
