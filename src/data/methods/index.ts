/* Registry der Übungsformen ("Methoden") - die zweite Achse im Training-Tab
   neben den Fähigkeiten aus data/training.ts.

   `needsAi` steuert nur die Anzeige in der Kachel. Der Hinweis ist wichtig, weil
   der Gemini-Key im Free-Tier limitiert ist: Vier der acht Formen funktionieren
   vollständig ohne API-Key, und das soll man sehen, bevor man eine Übung öffnet. */
import type { TrainingMethod } from '../types'
import { WORDORDER_EXERCISES } from './wordorder'
import { ERRORHUNT_EXERCISES } from './errorhunt'
import { DICTATION_EXERCISES } from './dictation'
import { LETTERBUILDER_EXERCISES } from './letterbuilder'
import { ROLEPLAY_EXERCISES } from './roleplay'
import { BLITZ_EXERCISES } from './blitz'
import { SHADOWING_EXERCISES } from './shadowing'
import { MONOLOGUE_EXERCISES } from './monologue'

export const TRAINING_METHODS: TrainingMethod[] = [
  {
    id: 'wordorder',
    icon: '🧩',
    title: 'Satzbau-Puzzle',
    channel: 'write',
    short: 'Wörter in die richtige Reihenfolge bringen',
    focus:
      'Die deutsche Wortstellung ist der häufigste B1-Fehler: Verb am Ende im Nebensatz, Verb direkt nach ' +
      '„deshalb", Partizip am Satzende. Hier baust du den Satz Stück für Stück selbst zusammen.',
    needsAi: 'optional',
    exercises: WORDORDER_EXERCISES,
  },
  {
    id: 'errorhunt',
    icon: '🔍',
    title: 'Fehlersuche',
    channel: 'write',
    short: 'Den einen Fehler im Satz finden und beheben',
    focus:
      'Eigene Fehler zu erkennen ist schwerer, als richtige Sätze zu bilden - und genau das brauchst du beim ' +
      'Überarbeiten deines Prüfungsbriefs. In jedem Satz steckt genau ein typischer Fehler.',
    needsAi: 'optional',
    exercises: ERRORHUNT_EXERCISES,
  },
  {
    id: 'dictation',
    icon: '🎧',
    title: 'Diktat',
    channel: 'write',
    short: 'Hören und richtig aufschreiben',
    focus:
      'Trainiert Hören und Rechtschreibung zusammen: Großschreibung der Nomen, ß und ss, Umlaute und die ' +
      'Kommas vor Nebensätzen. Der Browser liest vor, du schreibst mit.',
    needsAi: 'nie',
    exercises: DICTATION_EXERCISES,
  },
  {
    id: 'letterbuilder',
    icon: '✉️',
    title: 'Brief-Baukasten',
    channel: 'write',
    short: 'Teil 4 Schritt für Schritt aufbauen',
    focus:
      'Teil 4 scheitert selten am Wortschatz, sondern daran, dass ein Inhaltspunkt fehlt oder die Anrede nicht ' +
      'zur Grußformel passt. Hier baust du den Brief Baustein für Baustein - und bekommst am Ende die ' +
      'Bewertung nach den echten Prüfungsregeln.',
    needsAi: 'immer',
    exercises: LETTERBUILDER_EXERCISES,
  },
  {
    id: 'roleplay',
    icon: '💬',
    title: 'Dialog-Rollenspiel',
    channel: 'speak',
    short: 'Echtes Gespräch mit der KI führen',
    focus:
      'Die KI spielt deine Gesprächspartnerin - Nachbarin, Ärztin, Verkäufer - und antwortet auf das, was du ' +
      'sagst. Das kommt der echten mündlichen Prüfung am nächsten, weil du reagieren musst statt vorzutragen.',
    needsAi: 'immer',
    exercises: ROLEPLAY_EXERCISES,
  },
  {
    id: 'blitz',
    icon: '⚡',
    title: 'Blitzrunde',
    channel: 'speak',
    short: 'Fünf Fragen, je 20 Sekunden, ohne Vorbereitung',
    focus:
      'In der Prüfung bricht meist nicht die Grammatik weg, sondern die Spontaneität. Hier kommt Frage auf ' +
      'Frage, ohne Zeit zum Nachdenken - genau wie beim Kennenlernen in Teil 5.',
    needsAi: 'immer',
    exercises: BLITZ_EXERCISES,
  },
  {
    id: 'shadowing',
    icon: '🔁',
    title: 'Nachsprechen',
    channel: 'speak',
    short: 'Satz anhören und genauso nachsprechen',
    focus:
      'Aussprache und Satzmelodie lernt man am besten durch Nachmachen. Der Browser spricht vor, du sprichst ' +
      'nach - der Abgleich läuft sofort und ohne KI, die Aussprachebewertung ist optional.',
    needsAi: 'optional',
    exercises: SHADOWING_EXERCISES,
  },
  {
    id: 'monologue',
    icon: '⏱️',
    title: '60-Sekunden-Monolog',
    channel: 'speak',
    short: 'Eine Minute am Stück frei sprechen',
    focus:
      'Frei und ohne lange Pausen zu sprechen ist eine eigene Fähigkeit. Du bekommst ein Thema, drei Aspekte, ' +
      'die vorkommen sollen - und 60 Sekunden. Danach siehst du deine Wörter pro Minute und Füllwörter.',
    needsAi: 'immer',
    exercises: MONOLOGUE_EXERCISES,
  },
]

export function findMethod(id: string): TrainingMethod | undefined {
  return TRAINING_METHODS.find((m) => m.id === id)
}
