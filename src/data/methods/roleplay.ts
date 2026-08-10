/* Dialog-Rollenspiel: Die KI übernimmt die Gegenrolle und antwortet auf das, was
   der Lernende sagt. `opener` ist der erste Satz der Partnerin/des Partners -
   damit startet das Gespräch, ohne dass dafür schon ein KI-Aufruf nötig wäre.

   `maxTurns` begrenzt bewusst auch die Kosten: pro eigenem Redebeitrag entsteht
   genau ein Aufruf, dazu einer für die Auswertung am Ende. */
import type { RoleplayExercise } from '../types'

export const ROLEPLAY_EXERCISES: RoleplayExercise[] = [
  {
    id: 'rp-nachbarn',
    kind: 'roleplay',
    instruction: 'Führe das Gespräch. Sprich oder tippe deine Antworten - die KI antwortet als deine Nachbarin.',
    situation:
      'Deine Nachbarin hört abends sehr laut Musik. Du möchtest das freundlich, aber deutlich ansprechen und ' +
      'eine Lösung finden.',
    partnerRole: 'die Nachbarin Frau Schmidt, freundlich, aber zuerst etwas uneinsichtig',
    goal: 'Du sprichst das Problem höflich an, begründest es und schlägst eine konkrete Lösung vor.',
    opener: 'Oh, hallo! Sie wollten mich sprechen? Ist irgendetwas?',
    maxTurns: 8,
    criteria: [
      'Bringt das Anliegen höflich, aber klar vor',
      'Begründet, warum die Lautstärke ein Problem ist',
      'Schlägt eine konkrete Lösung vor (z. B. eine Uhrzeit)',
      'Reagiert auf das, was die Nachbarin sagt',
    ],
  },
  {
    id: 'rp-arzt',
    kind: 'roleplay',
    instruction: 'Führe das Gespräch. Sprich oder tippe deine Antworten - die KI antwortet als Praxismitarbeiterin.',
    situation:
      'Du rufst in einer Arztpraxis an, um deinen Termin am Donnerstag zu verschieben. Du brauchst einen neuen ' +
      'Termin, am besten vormittags.',
    partnerRole: 'die Mitarbeiterin an der Anmeldung einer Hausarztpraxis, freundlich und etwas in Eile',
    goal: 'Du verschiebst deinen Termin und bekommst einen neuen, der zu deinen Zeiten passt.',
    opener: 'Praxis Dr. Weber, guten Tag. Was kann ich für Sie tun?',
    maxTurns: 8,
    criteria: [
      'Nennt den bestehenden Termin mit Tag und Uhrzeit',
      'Begründet die Verschiebung',
      'Äußert einen konkreten Wunschtermin',
      'Verabschiedet sich höflich',
    ],
  },
  {
    id: 'rp-reklamation',
    kind: 'roleplay',
    instruction: 'Führe das Gespräch. Sprich oder tippe deine Antworten - die KI antwortet als Verkäufer.',
    situation:
      'Du hast vor einer Woche eine Jacke gekauft. Nach dem ersten Waschen ist die Naht aufgegangen. Du gehst ' +
      'damit zurück ins Geschäft.',
    partnerRole: 'ein Verkäufer im Bekleidungsgeschäft, zunächst zurückhaltend („waschen Sie sie richtig?")',
    goal: 'Du reklamierst die Jacke und erreichst Umtausch oder Geld zurück.',
    opener: 'Guten Tag! Kann ich Ihnen helfen?',
    maxTurns: 8,
    criteria: [
      'Beschreibt das Problem sachlich und genau',
      'Nennt, wann und wo gekauft wurde',
      'Sagt klar, was er oder sie möchte (Umtausch, Geld zurück)',
      'Bleibt auch bei Widerspruch höflich und bestimmt',
    ],
  },
  {
    id: 'rp-kollegin',
    kind: 'roleplay',
    instruction: 'Führe das Gespräch. Sprich oder tippe deine Antworten - die KI antwortet als deine Kollegin.',
    situation:
      'Du brauchst am Freitag frei, weil deine Tochter eingeschult wird. Du fragst eine Kollegin, ob sie mit ' +
      'dir die Schicht tauscht.',
    partnerRole: 'die Kollegin Sabine, hilfsbereit, hat aber selbst schon Pläne für Freitag',
    goal: 'Du erklärst deine Situation und findest gemeinsam eine Lösung für den Schichttausch.',
    opener: 'Hey! Du wolltest was fragen?',
    maxTurns: 8,
    criteria: [
      'Formuliert die Bitte klar und höflich',
      'Begründet, warum der Tag wichtig ist',
      'Bietet selbst einen Gegenvorschlag an',
      'Bedankt sich am Ende',
    ],
  },
  {
    id: 'rp-kita',
    kind: 'roleplay',
    instruction: 'Führe das Gespräch. Sprich oder tippe deine Antworten - die KI antwortet als Erzieherin.',
    situation:
      'Du hast einen Termin in der Kita deines Sohnes. Die Erzieherin möchte mit dir über sein Verhalten in der ' +
      'Gruppe sprechen.',
    partnerRole: 'die Erzieherin Frau Kaya, freundlich und sachlich',
    goal: 'Du verstehst, worum es geht, stellst Rückfragen und vereinbarst, wie es weitergeht.',
    opener: 'Schön, dass Sie da sind. Ich wollte mit Ihnen über Elias sprechen - haben Sie kurz Zeit?',
    maxTurns: 8,
    criteria: [
      'Stellt Rückfragen, um das Problem zu verstehen',
      'Erzählt, wie das Kind sich zu Hause verhält',
      'Schlägt etwas vor oder fragt nach Vorschlägen',
      'Vereinbart am Ende einen konkreten nächsten Schritt',
    ],
  },
]
