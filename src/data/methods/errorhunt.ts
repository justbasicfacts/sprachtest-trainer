/* Fehlersuche: In jedem Satz steckt genau EIN Fehler. Die Fehlerstelle wird im
   Bauteil per Wort-Diff aus `wrong` und `correct` berechnet - deshalb dürfen sich
   beide Sätze nur an einer Stelle unterscheiden.

   Abgedeckt: Kasus nach Präposition, Verbstellung im Nebensatz, Artikel,
   sein/haben im Perfekt, Adjektivendung, Position nach Konnektoren,
   trennbare Verben, Reflexivpronomen. */
import type { ErrorHuntExercise } from '../types'

export const ERRORHUNT_EXERCISES: ErrorHuntExercise[] = [
  {
    id: 'eh-1',
    kind: 'errorhunt',
    instruction: 'In diesem Satz steckt ein Fehler. Tippe das falsche Wort an und korrigiere es.',
    wrong: 'Ich fahre mit den Bus zur Arbeit.',
    correct: 'Ich fahre mit dem Bus zur Arbeit.',
    why: 'Nach „mit" steht immer der Dativ: der Bus → mit dem Bus.',
  },
  {
    id: 'eh-2',
    kind: 'errorhunt',
    instruction: 'In diesem Satz steckt ein Fehler. Tippe das falsche Wort an und korrigiere es.',
    wrong: 'Ich komme nicht, weil ich bin krank.',
    correct: 'Ich komme nicht, weil ich krank bin.',
    why: 'Im „weil"-Satz steht das konjugierte Verb ganz am Ende: „… weil ich krank bin."',
  },
  {
    id: 'eh-3',
    kind: 'errorhunt',
    instruction: 'In diesem Satz steckt ein Fehler. Tippe das falsche Wort an und korrigiere es.',
    wrong: 'Ich habe gestern nach Berlin gefahren.',
    correct: 'Ich bin gestern nach Berlin gefahren.',
    why: 'Verben der Bewegung bilden das Perfekt mit „sein": ich bin gefahren, gegangen, gekommen.',
  },
  {
    id: 'eh-4',
    kind: 'errorhunt',
    instruction: 'In diesem Satz steckt ein Fehler. Tippe das falsche Wort an und korrigiere es.',
    wrong: 'Das Wohnung ist sehr hell und ruhig.',
    correct: 'Die Wohnung ist sehr hell und ruhig.',
    why: '„Wohnung" ist feminin - Wörter auf -ung sind fast immer die: die Wohnung, die Zeitung, die Rechnung.',
  },
  {
    id: 'eh-5',
    kind: 'errorhunt',
    instruction: 'In diesem Satz steckt ein Fehler. Tippe das falsche Wort an und korrigiere es.',
    wrong: 'Es ist spät, deshalb wir gehen jetzt nach Hause.',
    correct: 'Es ist spät, deshalb gehen wir jetzt nach Hause.',
    why: 'Nach „deshalb" kommt zuerst das Verb, dann das Subjekt: „deshalb gehen wir".',
  },
  {
    id: 'eh-6',
    kind: 'errorhunt',
    instruction: 'In diesem Satz steckt ein Fehler. Tippe das falsche Wort an und korrigiere es.',
    wrong: 'Ich wohne seit drei Jahre in Deutschland.',
    correct: 'Ich wohne seit drei Jahren in Deutschland.',
    why: 'Nach „seit" steht der Dativ - im Plural bekommt das Nomen ein -n: seit drei Jahren.',
  },
  {
    id: 'eh-7',
    kind: 'errorhunt',
    instruction: 'In diesem Satz steckt ein Fehler. Tippe das falsche Wort an und korrigiere es.',
    wrong: 'Wann ich Zeit habe, gehe ich gern schwimmen.',
    correct: 'Wenn ich Zeit habe, gehe ich gern schwimmen.',
    why: '„wann" fragt nach einem Zeitpunkt, „wenn" leitet eine Bedingung ein: Wenn ich Zeit habe, …',
  },
  {
    id: 'eh-8',
    kind: 'errorhunt',
    instruction: 'In diesem Satz steckt ein Fehler. Tippe das falsche Wort an und korrigiere es.',
    wrong: 'Ich interessiere mich für gute Bücher und alte Filmen.',
    correct: 'Ich interessiere mich für gute Bücher und alte Filme.',
    why: 'Der Plural von „der Film" ist „die Filme" - das -n gehört nur in den Dativ Plural.',
  },
  {
    id: 'eh-9',
    kind: 'errorhunt',
    instruction: 'In diesem Satz steckt ein Fehler. Tippe das falsche Wort an und korrigiere es.',
    wrong: 'Meine Schwester ist zwei Jahre älter wie ich.',
    correct: 'Meine Schwester ist zwei Jahre älter als ich.',
    why: 'Beim Vergleich von Ungleichem steht „als": älter als, größer als. „wie" nur bei Gleichheit: so alt wie.',
  },
  {
    id: 'eh-10',
    kind: 'errorhunt',
    instruction: 'In diesem Satz steckt ein Fehler. Tippe das falsche Wort an und korrigiere es.',
    wrong: 'Ich freue mich auf dem Termin nächste Woche.',
    correct: 'Ich freue mich auf den Termin nächste Woche.',
    why: '„sich freuen auf" verlangt den Akkusativ: auf den Termin (Richtung, nicht Ort).',
  },
  {
    id: 'eh-11',
    kind: 'errorhunt',
    instruction: 'In diesem Satz steckt ein Fehler. Tippe das falsche Wort an und korrigiere es.',
    wrong: 'Meine Tochter geht in eine deutsche Schule und lernt schnell.',
    correct: 'Meine Tochter geht auf eine deutsche Schule und lernt schnell.',
    why: 'Feste Wendung: Man geht „auf eine Schule" (oder „in die Schule"), nicht „in eine Schule".',
  },
  {
    id: 'eh-12',
    kind: 'errorhunt',
    instruction: 'In diesem Satz steckt ein Fehler. Tippe das falsche Wort an und korrigiere es.',
    wrong: 'Ich helfe meinen Bruder bei den Hausaufgaben.',
    correct: 'Ich helfe meinem Bruder bei den Hausaufgaben.',
    why: '„helfen" verlangt den Dativ: Ich helfe meinem Bruder, meiner Schwester, den Kindern.',
  },
]
