/* Brief-Baukasten: Teil 4 in vier Bausteinen statt am Stück.
   Die vier Blöcke bilden bewusst die Struktur ab, nach der in der Prüfung
   bewertet wird - Anrede, Anlass, Anliegen, Schluss - und `sample` liefert für
   jeden Baustein eine Musterformulierung, aus der am Ende der Musterbrief
   zusammengesetzt wird. */
import type { LetterBuilderExercise } from '../types'

export const LETTERBUILDER_EXERCISES: LetterBuilderExercise[] = [
  {
    id: 'lb-kurs',
    kind: 'letterbuilder',
    instruction: 'Schreibe den Brief Baustein für Baustein. Jeder Teil wird einzeln geprüft.',
    situation:
      'Du bist für einen Deutschkurs an der Volkshochschule angemeldet, kannst aber nicht teilnehmen, weil du ' +
      'die Arbeitszeiten gewechselt hast. Schreib an die Kursleitung.',
    blocks: [
      {
        id: 'anrede',
        label: 'Anrede',
        ask: 'Schreib die passende Anrede für eine Person, deren Namen du nicht kennst.',
        hint: 'Formell, mit Komma am Ende - danach geht es klein weiter.',
        sample: 'Sehr geehrte Damen und Herren,',
      },
      {
        id: 'anlass',
        label: 'Anlass',
        ask: 'Nenne in ein bis zwei Sätzen, worum es geht: Für welchen Kurs bist du angemeldet?',
        hint: 'Sätze wie „ich habe mich für … angemeldet" oder „ich schreibe Ihnen, weil …".',
        sample:
          'ich habe mich für den Deutschkurs B1 angemeldet, der am 1. September beginnt. Meine Kursnummer ist 24-B1-03.',
      },
      {
        id: 'anliegen',
        label: 'Anliegen und Begründung',
        ask: 'Erkläre, warum du nicht teilnehmen kannst, und schreib, was du möchtest.',
        hint: 'Begründung mit „weil" oder „da"; die Bitte höflich mit „könnten Sie" oder „ich möchte Sie bitten".',
        sample:
          'Leider kann ich an dem Kurs nicht teilnehmen, weil sich meine Arbeitszeiten geändert haben und ich jetzt abends arbeite. Deshalb möchte ich Sie bitten, mich vom Kurs abzumelden. Könnten Sie mir außerdem mitteilen, ob es einen Vormittagskurs gibt?',
      },
      {
        id: 'schluss',
        label: 'Schluss und Gruß',
        ask: 'Schreib einen freundlichen Schlusssatz und die passende Grußformel.',
        hint: 'Zur formellen Anrede gehört die formelle Grußformel - ohne Komma danach.',
        sample: 'Vielen Dank für Ihre Hilfe. Über eine kurze Antwort würde ich mich freuen.\n\nMit freundlichen Grüßen\nMaria Novak',
      },
    ],
  },
  {
    id: 'lb-reklamation',
    kind: 'letterbuilder',
    instruction: 'Schreibe den Brief Baustein für Baustein. Jeder Teil wird einzeln geprüft.',
    situation:
      'Du hast vor zwei Wochen online eine Waschmaschine gekauft. Sie wurde geliefert, funktioniert aber nicht ' +
      'richtig. Schreib an den Kundenservice.',
    blocks: [
      {
        id: 'anrede',
        label: 'Anrede',
        ask: 'Schreib die passende Anrede an einen Kundenservice.',
        hint: 'Du kennst keinen Namen - also die allgemeine formelle Anrede.',
        sample: 'Sehr geehrte Damen und Herren,',
      },
      {
        id: 'anlass',
        label: 'Anlass',
        ask: 'Nenne, was du wann gekauft hast - mit Bestell- oder Rechnungsnummer.',
        hint: 'Konkrete Angaben machen die Reklamation glaubwürdig: Datum, Gerät, Nummer.',
        sample:
          'am 3. Mai habe ich in Ihrem Onlineshop eine Waschmaschine der Marke Bosch bestellt (Bestellnummer 88421). Das Gerät wurde am 10. Mai geliefert.',
      },
      {
        id: 'anliegen',
        label: 'Problem und Forderung',
        ask: 'Beschreibe das Problem und schreib, was du erwartest.',
        hint: 'Erst das Problem, dann die Forderung - „Ich bitte Sie deshalb, …".',
        sample:
          'Leider funktioniert die Maschine nicht richtig: Sie schleudert nicht und macht dabei laute Geräusche. Ich habe die Bedienungsanleitung genau befolgt. Ich bitte Sie deshalb, das Gerät auszutauschen oder mir den Kaufpreis zurückzuerstatten.',
      },
      {
        id: 'schluss',
        label: 'Schluss und Gruß',
        ask: 'Setze eine Frist und schreib die Grußformel.',
        hint: 'Höflich, aber verbindlich: „bis zum …" oder „innerhalb von zwei Wochen".',
        sample:
          'Bitte teilen Sie mir bis zum 30. Mai mit, wie Sie vorgehen möchten.\n\nMit freundlichen Grüßen\nMaria Novak',
      },
    ],
  },
  {
    id: 'lb-arzt',
    kind: 'letterbuilder',
    instruction: 'Schreibe den Brief Baustein für Baustein. Jeder Teil wird einzeln geprüft.',
    situation:
      'Du hast am Donnerstag einen Termin bei deiner Hausärztin, musst an dem Tag aber beruflich verreisen. ' +
      'Schreib eine E-Mail an die Praxis.',
    blocks: [
      {
        id: 'anrede',
        label: 'Anrede',
        ask: 'Schreib die Anrede an das Praxisteam - den Namen der Ärztin kennst du.',
        hint: 'Persönliche formelle Anrede: „Sehr geehrte Frau …,".',
        sample: 'Sehr geehrte Frau Dr. Weber,',
      },
      {
        id: 'anlass',
        label: 'Anlass',
        ask: 'Nenne deinen Termin mit Datum und Uhrzeit.',
        hint: 'Wochentag, Datum und Uhrzeit nennen, damit die Praxis den Termin sofort findet.',
        sample: 'ich habe am Donnerstag, dem 15. Mai, um 9:30 Uhr einen Termin in Ihrer Praxis.',
      },
      {
        id: 'anliegen',
        label: 'Bitte und Begründung',
        ask: 'Erkläre, warum du nicht kommen kannst, und bitte um einen neuen Termin.',
        hint: 'Begründung mit „weil"; beim Wunschtermin konkret werden („am liebsten vormittags").',
        sample:
          'Leider kann ich diesen Termin nicht wahrnehmen, weil ich an diesem Tag beruflich verreisen muss. Ich möchte Sie deshalb bitten, mir einen neuen Termin zu geben. Am besten passt es mir in der Woche darauf vormittags.',
      },
      {
        id: 'schluss',
        label: 'Schluss und Gruß',
        ask: 'Entschuldige dich kurz für die Umstände und schreib die Grußformel.',
        hint: '„Vielen Dank im Voraus" oder „Entschuldigen Sie bitte die Umstände".',
        sample:
          'Entschuldigen Sie bitte die Umstände. Vielen Dank im Voraus für Ihre Mühe.\n\nMit freundlichen Grüßen\nMaria Novak',
      },
    ],
  },
  {
    id: 'lb-hausverwaltung',
    kind: 'letterbuilder',
    instruction: 'Schreibe den Brief Baustein für Baustein. Jeder Teil wird einzeln geprüft.',
    situation:
      'In deinem Haus ist seit drei Wochen das Licht im Treppenhaus kaputt. Mehrere Nachbarn haben sich schon ' +
      'beschwert. Schreib an die Hausverwaltung.',
    blocks: [
      {
        id: 'anrede',
        label: 'Anrede',
        ask: 'Schreib die Anrede an die Hausverwaltung.',
        hint: 'Formell, ohne Namen.',
        sample: 'Sehr geehrte Damen und Herren,',
      },
      {
        id: 'anlass',
        label: 'Anlass',
        ask: 'Stell dich kurz vor und nenne, worum es geht.',
        hint: 'Wohnung und Adresse nennen - die Verwaltung betreut viele Häuser.',
        sample:
          'ich wohne in der Lindenstraße 14, in der Wohnung im zweiten Obergeschoss links. Ich schreibe Ihnen wegen der Beleuchtung im Treppenhaus.',
      },
      {
        id: 'anliegen',
        label: 'Problem und Bitte',
        ask: 'Beschreibe das Problem, seine Folgen und deine Bitte.',
        hint: 'Die Folge macht das Anliegen dringend: „besonders für ältere Nachbarn ist das gefährlich".',
        sample:
          'Seit etwa drei Wochen funktioniert das Licht im Treppenhaus nicht mehr. Abends ist es dort völlig dunkel, was besonders für die älteren Nachbarn gefährlich ist. Ich bitte Sie deshalb, die Beleuchtung so schnell wie möglich reparieren zu lassen.',
      },
      {
        id: 'schluss',
        label: 'Schluss und Gruß',
        ask: 'Bitte um eine kurze Rückmeldung und schreib die Grußformel.',
        hint: 'Kurz und höflich - eine Frage nach dem Zeitpunkt wirkt verbindlich.',
        sample:
          'Können Sie mir bitte mitteilen, wann mit der Reparatur zu rechnen ist?\n\nMit freundlichen Grüßen\nMaria Novak',
      },
    ],
  },
]
