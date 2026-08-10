/* Satzbau-Puzzle: gemischte Wörter in die richtige Reihenfolge bringen.
   Die Chips entstehen im Bauteil lokal aus `solution` - hier steht nur der
   korrekte Satz, erlaubte Alternativen und die Regel dahinter.

   Abgedeckt: Verb am Ende im Nebensatz (weil/dass/damit/obwohl), Inversion nach
   deshalb/trotzdem/außerdem, Satzklammer bei Perfekt und Modalverben,
   trennbare Verben, W-Fragen und die Reihenfolge Temporal-Kausal-Modal-Lokal. */
import type { WordOrderExercise } from '../types'

export const WORDORDER_EXERCISES: WordOrderExercise[] = [
  {
    id: 'wo-1',
    kind: 'wordorder',
    instruction: 'Bring die Wörter in die richtige Reihenfolge.',
    solution: 'Ich lerne jeden Tag Deutsch, weil ich die Prüfung bestehen möchte.',
    why: 'Im Nebensatz mit „weil" steht das konjugierte Verb ganz am Ende: „… weil ich die Prüfung bestehen möchte."',
  },
  {
    id: 'wo-2',
    kind: 'wordorder',
    instruction: 'Bring die Wörter in die richtige Reihenfolge.',
    solution: 'Es regnet stark, deshalb bleiben wir heute zu Hause.',
    why: '„deshalb" ist kein Nebensatz-Konnektor: Danach kommt zuerst das Verb, dann das Subjekt („deshalb bleiben wir").',
  },
  {
    id: 'wo-3',
    kind: 'wordorder',
    instruction: 'Bring die Wörter in die richtige Reihenfolge.',
    solution: 'Ich glaube, dass er morgen nicht kommt.',
    why: 'Nach „dass" steht das Verb am Satzende - auch die Verneinung „nicht" kommt davor.',
  },
  {
    id: 'wo-4',
    kind: 'wordorder',
    instruction: 'Bring die Wörter in die richtige Reihenfolge.',
    solution: 'Gestern habe ich meinen Ausweis beim Bürgeramt abgeholt.',
    alternatives: ['Ich habe gestern meinen Ausweis beim Bürgeramt abgeholt.'],
    why: 'Perfekt bildet eine Klammer: „habe" auf Position 2, das Partizip „abgeholt" ganz am Ende.',
  },
  {
    id: 'wo-5',
    kind: 'wordorder',
    instruction: 'Bring die Wörter in die richtige Reihenfolge.',
    solution: 'Am Montag muss ich früh zur Arbeit fahren.',
    alternatives: ['Ich muss am Montag früh zur Arbeit fahren.'],
    why: 'Modalverb-Klammer: „muss" auf Position 2, der Infinitiv „fahren" am Ende.',
  },
  {
    id: 'wo-6',
    kind: 'wordorder',
    instruction: 'Bring die Wörter in die richtige Reihenfolge.',
    solution: 'Obwohl er krank war, ist er zur Arbeit gegangen.',
    why: 'Steht der Nebensatz vorne, ist er Position 1 - im Hauptsatz folgt sofort das Verb: „…, ist er gegangen."',
  },
  {
    id: 'wo-7',
    kind: 'wordorder',
    instruction: 'Bring die Wörter in die richtige Reihenfolge.',
    solution: 'Der Zug fährt um acht Uhr vom Hauptbahnhof ab.',
    why: 'Trennbares Verb „abfahren": Die Vorsilbe „ab" rutscht ans Satzende.',
  },
  {
    id: 'wo-8',
    kind: 'wordorder',
    instruction: 'Bring die Wörter in die richtige Reihenfolge.',
    solution: 'Wann haben Sie den Antrag gestellt?',
    why: 'W-Frage: Fragewort, dann das Verb, dann das Subjekt - das Partizip bleibt am Ende.',
  },
  {
    id: 'wo-9',
    kind: 'wordorder',
    instruction: 'Bring die Wörter in die richtige Reihenfolge.',
    solution: 'Ich fahre morgen mit dem Bus in die Stadt.',
    why: 'Reihenfolge der Angaben: zuerst die Zeit („morgen"), dann die Art und Weise („mit dem Bus"), zuletzt der Ort („in die Stadt").',
  },
  {
    id: 'wo-10',
    kind: 'wordorder',
    instruction: 'Bring die Wörter in die richtige Reihenfolge.',
    solution: 'Können Sie mir bitte sagen, wo das Bürgeramt ist?',
    why: 'Indirekte Frage: Nach „wo" steht das Verb am Ende („wo das Bürgeramt ist").',
  },
  {
    id: 'wo-11',
    kind: 'wordorder',
    instruction: 'Bring die Wörter in die richtige Reihenfolge.',
    solution: 'Die Wohnung ist günstig, außerdem liegt sie sehr zentral.',
    why: 'Wie „deshalb" steht auch „außerdem" auf Position 1 - danach folgt sofort das Verb („außerdem liegt sie").',
  },
  {
    id: 'wo-12',
    kind: 'wordorder',
    instruction: 'Bring die Wörter in die richtige Reihenfolge.',
    solution: 'Ich habe meiner Nachbarin gestern die Schlüssel gegeben.',
    alternatives: ['Ich habe gestern meiner Nachbarin die Schlüssel gegeben.'],
    why: 'Zwei Objekte: Dativ („meiner Nachbarin") vor Akkusativ („die Schlüssel"), das Partizip bleibt am Ende.',
  },
]
