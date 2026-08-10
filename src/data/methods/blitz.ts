/* Blitzrunde: Frage auf Frage, je 20 Sekunden, ohne Vorbereitungszeit.
   Die Bewertung läuft am Ende in EINEM KI-Aufruf für die ganze Runde - fünf
   einzelne Aufrufe wären im Free-Tier schnell am Limit. */
import type { BlitzExercise } from '../types'

export const BLITZ_EXERCISES: BlitzExercise[] = [
  {
    id: 'blitz-kennenlernen',
    kind: 'blitz',
    instruction: 'Antworte sofort, in ganzen Sätzen. Pro Frage hast du 20 Sekunden.',
    seconds: 20,
    questions: [
      'Wie heißen Sie und woher kommen Sie?',
      'Wie lange leben Sie schon in Deutschland?',
      'Wo wohnen Sie und wie gefällt es Ihnen dort?',
      'Erzählen Sie etwas über Ihre Familie.',
      'Was machen Sie beruflich?',
      'Warum lernen Sie Deutsch?',
      'Was machen Sie in Ihrer Freizeit?',
      'Haben Sie Geschwister? Erzählen Sie kurz.',
    ],
  },
  {
    id: 'blitz-alltag',
    kind: 'blitz',
    instruction: 'Antworte sofort, in ganzen Sätzen. Pro Frage hast du 20 Sekunden.',
    seconds: 20,
    questions: [
      'Wie sieht ein normaler Werktag bei Ihnen aus?',
      'Was kochen Sie am liebsten?',
      'Wie kommen Sie zur Arbeit?',
      'Was machen Sie am Wochenende am liebsten?',
      'Wie ist Ihre Wohnung? Beschreiben Sie sie kurz.',
      'Was machen Sie, wenn Sie krank sind?',
      'Wo kaufen Sie normalerweise ein?',
      'Wie halten Sie sich fit?',
    ],
  },
  {
    id: 'blitz-arbeit',
    kind: 'blitz',
    instruction: 'Antworte sofort, in ganzen Sätzen. Pro Frage hast du 25 Sekunden.',
    seconds: 25,
    questions: [
      'Was gefällt Ihnen an Ihrer Arbeit am besten?',
      'Was war Ihr erster Job?',
      'Arbeiten Sie lieber allein oder im Team? Warum?',
      'Was würden Sie gern beruflich noch lernen?',
      'Wie sind Ihre Arbeitszeiten?',
      'Was ist an Ihrer Arbeit manchmal anstrengend?',
      'Wie haben Sie Ihre Stelle gefunden?',
      'Wo sehen Sie sich in fünf Jahren?',
    ],
  },
  {
    id: 'blitz-deutschland',
    kind: 'blitz',
    instruction: 'Antworte sofort, in ganzen Sätzen. Pro Frage hast du 25 Sekunden.',
    seconds: 25,
    questions: [
      'Was gefällt Ihnen in Deutschland besonders gut?',
      'Was war für Sie am Anfang ungewohnt?',
      'Welches deutsche Fest mögen Sie und warum?',
      'Was ist in Ihrem Heimatland anders als hier?',
      'Warum möchten Sie deutsche Staatsbürgerin oder deutscher Staatsbürger werden?',
      'Was würden Sie einem neuen Nachbarn über Ihre Stadt erzählen?',
      'Wie haben Sie Deutsch gelernt?',
      'Was möchten Sie hier noch erreichen?',
    ],
  },
]
