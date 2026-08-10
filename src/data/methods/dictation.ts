/* Diktat: Der Browser liest einen Satz vor, der Lernende tippt ihn mit.
   Die Auswertung läuft komplett lokal über den Wort-Diff - kein API-Key nötig.

   Die Sätze sind bewusst auf typische Diktatfallen gebaut: Großschreibung der
   Nomen, ß/ss, Umlaute, Dehnungs-h und das Komma vor Nebensätzen. */
import type { DictationExercise } from '../types'

export const DICTATION_EXERCISES: DictationExercise[] = [
  {
    id: 'dik-1',
    kind: 'dictation',
    instruction: 'Höre den Satz an und schreibe ihn genau auf.',
    sentence: 'Ich muss nächste Woche einen neuen Ausweis beantragen.',
    watchOut: 'Nomen groß schreiben: Woche, Ausweis.',
  },
  {
    id: 'dik-2',
    kind: 'dictation',
    instruction: 'Höre den Satz an und schreibe ihn genau auf.',
    sentence: 'Die Straße vor unserem Haus wird gerade repariert.',
    watchOut: 'Straße mit ß - nach langem Vokal steht ß, nicht ss.',
  },
  {
    id: 'dik-3',
    kind: 'dictation',
    instruction: 'Höre den Satz an und schreibe ihn genau auf.',
    sentence: 'Mein Sohn geht seit drei Jahren auf eine deutsche Schule.',
    watchOut: 'Nach „seit" der Dativ Plural: drei Jahren.',
  },
  {
    id: 'dik-4',
    kind: 'dictation',
    instruction: 'Höre den Satz an und schreibe ihn genau auf.',
    sentence: 'Ich möchte gern wissen, wann die Sprechstunde geöffnet ist.',
    watchOut: 'Umlaute ö und Komma vor dem Nebensatz.',
  },
  {
    id: 'dik-5',
    kind: 'dictation',
    instruction: 'Höre den Satz an und schreibe ihn genau auf.',
    sentence: 'Am Wochenende besuchen wir meine Schwiegereltern in Hamburg.',
    watchOut: 'Zusammengesetztes Nomen: Schwiegereltern, in einem Wort.',
  },
  {
    id: 'dik-6',
    kind: 'dictation',
    instruction: 'Höre den Satz an und schreibe ihn genau auf.',
    sentence: 'Bitte bringen Sie Ihren Pass und die Anmeldung mit.',
    watchOut: 'Höfliches „Ihren" wird großgeschrieben.',
  },
  {
    id: 'dik-7',
    kind: 'dictation',
    instruction: 'Höre den Satz an und schreibe ihn genau auf.',
    sentence: 'Der Termin wurde leider auf den nächsten Monat verschoben.',
    watchOut: 'Passiv mit „wurde" - das Partizip steht am Ende.',
  },
  {
    id: 'dik-8',
    kind: 'dictation',
    instruction: 'Höre den Satz an und schreibe ihn genau auf.',
    sentence: 'Ich arbeite als Verkäuferin und lerne abends Deutsch.',
    watchOut: 'Verkäuferin mit ä; „abends" ist ein Adverb und bleibt klein.',
  },
  {
    id: 'dik-9',
    kind: 'dictation',
    instruction: 'Höre den Satz an und schreibe ihn genau auf.',
    sentence: 'Wir haben uns entschieden, in eine größere Wohnung zu ziehen.',
    watchOut: 'Komma vor dem Infinitiv mit „zu"; größere mit ß.',
  },
  {
    id: 'dik-10',
    kind: 'dictation',
    instruction: 'Höre den Satz an und schreibe ihn genau auf.',
    sentence: 'Der Kurs beginnt um halb neun und dauert vier Stunden.',
    watchOut: 'Zahlen als Wort: halb neun, vier Stunden.',
  },
  {
    id: 'dik-11',
    kind: 'dictation',
    instruction: 'Höre den Satz an und schreibe ihn genau auf.',
    sentence: 'Können Sie mir bitte erklären, welche Unterlagen ich brauche?',
    watchOut: 'Indirekte Frage - das Verb „brauche" steht am Ende.',
  },
  {
    id: 'dik-12',
    kind: 'dictation',
    instruction: 'Höre den Satz an und schreibe ihn genau auf.',
    sentence: 'Ich freue mich sehr, dass ich die Prüfung bestanden habe.',
    watchOut: 'Nach „dass" steht das Verb am Ende: bestanden habe.',
  },
]
