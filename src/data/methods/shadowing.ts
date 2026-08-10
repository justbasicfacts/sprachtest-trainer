/* Nachsprechen: Der Browser spricht einen Satz vor, der Lernende spricht ihn nach.
   Die Sätze werden pro Set länger, damit man sich steigert statt gleich an einem
   Schachtelsatz zu scheitern. */
import type { ShadowingExercise } from '../types'

export const SHADOWING_EXERCISES: ShadowingExercise[] = [
  {
    id: 'sh-alltag',
    kind: 'shadowing',
    instruction: 'Hör dir jeden Satz an und sprich ihn genauso nach.',
    focus: 'Alltag - kurze, häufige Sätze',
    sentences: [
      'Guten Tag, wie geht es Ihnen?',
      'Ich hätte gern einen Termin am Freitag.',
      'Entschuldigung, können Sie das bitte wiederholen?',
      'Ich wohne seit vier Jahren in Berlin.',
      'Am Wochenende gehe ich meistens mit meiner Familie spazieren.',
      'Wenn ich abends Zeit habe, lerne ich noch eine halbe Stunde Deutsch.',
    ],
  },
  {
    id: 'sh-amt',
    kind: 'shadowing',
    instruction: 'Hör dir jeden Satz an und sprich ihn genauso nach.',
    focus: 'Amt und Behörde - die Sätze, die in der Prüfung wirklich vorkommen',
    sentences: [
      'Ich möchte einen Antrag stellen.',
      'Welche Unterlagen muss ich mitbringen?',
      'Mein Termin wurde leider auf nächste Woche verschoben.',
      'Können Sie mir sagen, wo ich das Formular bekomme?',
      'Ich habe die Anmeldung schon vor drei Wochen abgeschickt.',
      'Ich wollte fragen, ob ich den Termin telefonisch verschieben kann.',
    ],
  },
  {
    id: 'sh-laute',
    kind: 'shadowing',
    instruction: 'Hör genau hin und sprich nach. Achte besonders auf die markierten Laute.',
    focus: 'Laute: ö, ü, ch, r, z, pf',
    hint: 'Sprich langsam und übertreibe die schwierigen Laute ruhig etwas - das hilft beim Einprägen.',
    sentences: [
      'Ich möchte zwölf Brötchen kaufen.',
      'Die Tür zur Küche ist zu.',
      'Natürlich können wir das Gespräch später führen.',
      'Der Pfleger hat die Pflanzen gegossen.',
      'Zwischen zwei und vier Uhr ist die Praxis geschlossen.',
      'Übermorgen früh fährt mein Zug nach München.',
    ],
  },
]
