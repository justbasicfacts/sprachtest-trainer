/* 60-Sekunden-Monolog: ein Thema, drei Pflicht-Aspekte, eine Minute am Stück.
   `mustMention` dient doppelt - als Orientierung während des Sprechens und als
   Bewertungskriterien für die KI-Auswertung danach. */
import type { MonologueExercise } from '../types'

const SECONDS = 60

export const MONOLOGUE_EXERCISES: MonologueExercise[] = [
  {
    id: 'mono-familie',
    kind: 'monologue',
    instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
    topic: 'Meine Familie',
    seconds: SECONDS,
    mustMention: ['Wer gehört zu deiner Familie?', 'Was macht ihr gemeinsam?', 'Was ist dir an deiner Familie wichtig?'],
  },
  {
    id: 'mono-arbeit',
    kind: 'monologue',
    instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
    topic: 'Meine Arbeit',
    seconds: SECONDS,
    mustMention: ['Was machst du beruflich?', 'Wie sieht ein typischer Arbeitstag aus?', 'Was gefällt dir daran, was nicht?'],
  },
  {
    id: 'mono-wohnort',
    kind: 'monologue',
    instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
    topic: 'Mein Wohnort',
    seconds: SECONDS,
    mustMention: ['Wo wohnst du?', 'Wie ist die Gegend?', 'Was würdest du dort gern verändern?'],
  },
  {
    id: 'mono-freizeit',
    kind: 'monologue',
    instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
    topic: 'Meine Freizeit',
    seconds: SECONDS,
    mustMention: ['Was machst du in deiner Freizeit?', 'Wie oft und mit wem?', 'Was würdest du gern einmal ausprobieren?'],
  },
  {
    id: 'mono-deutsch',
    kind: 'monologue',
    instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
    topic: 'Warum ich Deutsch lerne',
    seconds: SECONDS,
    mustMention: ['Warum lernst du Deutsch?', 'Was fällt dir leicht, was schwer?', 'Wie lernst du am besten?'],
  },
  {
    id: 'mono-feste',
    kind: 'monologue',
    instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
    topic: 'Feste und Feiertage',
    seconds: SECONDS,
    mustMention: ['Welches Fest feierst du gern?', 'Wie läuft es ab?', 'Welchen deutschen Feiertag findest du interessant?'],
  },
  {
    id: 'mono-gesundheit',
    kind: 'monologue',
    instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
    topic: 'Gesund leben',
    seconds: SECONDS,
    mustMention: ['Was tust du für deine Gesundheit?', 'Was könntest du besser machen?', 'Wie sind deine Erfahrungen mit Ärzten hier?'],
  },
  {
    id: 'mono-verkehr',
    kind: 'monologue',
    instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
    topic: 'Unterwegs in der Stadt',
    seconds: SECONDS,
    mustMention: ['Wie kommst du im Alltag von A nach B?', 'Was ist gut, was nervt?', 'Auto oder Bus und Bahn - was findest du besser?'],
  },
  {
    id: 'mono-einkaufen',
    kind: 'monologue',
    instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
    topic: 'Einkaufen',
    seconds: SECONDS,
    mustMention: ['Wo und wie oft kaufst du ein?', 'Worauf achtest du beim Einkaufen?', 'Online oder im Geschäft - was ist dir lieber?'],
  },
  {
    id: 'mono-nachbarn',
    kind: 'monologue',
    instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
    topic: 'Meine Nachbarn',
    seconds: SECONDS,
    mustMention: ['Wie ist der Kontakt zu deinen Nachbarn?', 'Gab es schon mal Ärger?', 'Was macht gute Nachbarschaft aus?'],
  },
  {
    id: 'mono-lernen',
    kind: 'monologue',
    instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
    topic: 'Aus- und Weiterbildung',
    seconds: SECONDS,
    mustMention: ['Was hast du gelernt oder studiert?', 'Wird das hier anerkannt?', 'Was möchtest du noch lernen?'],
  },
  {
    id: 'mono-zukunft',
    kind: 'monologue',
    instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
    topic: 'Meine Pläne',
    seconds: SECONDS,
    mustMention: ['Was möchtest du im nächsten Jahr erreichen?', 'Was brauchst du dafür?', 'Wo siehst du dich in fünf Jahren?'],
  },
]
