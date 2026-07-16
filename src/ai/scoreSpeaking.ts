/* Bewertet per Gemini eine gesprochene Antwort für den mündlichen Teil (Teil 5-7).
   Zwei Modi:
   - nur Transkript (Web-Speech-Erkennung): Inhalt, Wortschatz, Grammatik
   - mit Audioaufnahme: zusätzlich Aussprache/Flüssigkeit direkt aus der Aufnahme,
     inkl. Gemini-eigener Transkription (falls der Browser keine Spracherkennung hat)
   Die Kriterien kommen vom Aufrufer, damit dieselbe Funktion für Kennenlernen,
   Fotobeschreibung und Situationen passt. */
import { z } from 'zod'
import { geminiJson, type GeminiSchema } from './geminiClient'

export interface SpeakingScore {
  checks: { ok: boolean; comment: string }[]
  corrections: { wrong: string; better: string }[]
  feedback: string
  /** Nur bei Audio-Analyse: Feedback zur Aussprache. */
  pronunciation?: { comment: string; tips: string[] }
  /** Nur bei Audio-Analyse ohne Browser-Transkript: was Gemini verstanden hat. */
  transcript?: string
}

const SYSTEM_PROMPT =
  'Du bist Prüfer für den mündlichen Teil des Berliner Sprachtests für die Einbürgerung (Deutsch-Niveau B1). ' +
  'Bewerte Inhalt, Wortschatz und Grammatik auf B1-Niveau. Gesprochene Sprache darf einfach und ' +
  'umgangssprachlich sein - kleine Fehler kosten nichts, solange die Antwort verständlich ist. ' +
  'Gib dein Feedback auf einfachem, freundlichem Deutsch (B1-gerecht).'

export async function scoreSpeaking(input: {
  data: {
    context: string
    criteria: string[]
    transcript?: string
    audio?: { mimeType: string; base64: string }
  }
}): Promise<SpeakingScore> {
  const { context, criteria, transcript, audio } = input.data
  const n = criteria.length
  const hasAudio = !!audio
  const wantTranscript = hasAudio && !transcript

  const properties: GeminiSchema = {
    checks: {
      type: 'ARRAY',
      minItems: n,
      maxItems: n,
      description: `Bewertung der ${n} Kriterien, in derselben Reihenfolge wie in der Aufgabe`,
      items: {
        type: 'OBJECT',
        properties: {
          ok: { type: 'BOOLEAN', description: 'true = Kriterium erfüllt' },
          comment: { type: 'STRING', description: 'Kurze Begründung auf einfachem Deutsch, 1 Satz' },
        },
        required: ['ok', 'comment'],
      },
    },
    corrections: {
      type: 'ARRAY',
      maxItems: 6,
      description:
        'Die wichtigsten sprachlichen Verbesserungen (max. 6). Keine reinen Satzzeichen-/Transkriptionsfehler. ' +
        'Leer lassen, wenn es keine nennenswerten gibt.',
      items: {
        type: 'OBJECT',
        properties: {
          wrong: { type: 'STRING', description: 'So hat es der Lernende gesagt' },
          better: { type: 'STRING', description: 'So klingt es besser/richtig' },
        },
        required: ['wrong', 'better'],
      },
    },
    feedback: {
      type: 'STRING',
      description: 'Freundliches Gesamtfeedback auf einfachem Deutsch, 2-3 Sätze: was war gut, was üben',
    },
  }
  const required = ['checks', 'corrections', 'feedback']

  if (hasAudio) {
    properties.pronunciation = {
      type: 'OBJECT',
      description: 'Feedback zur Aussprache und Sprechflüssigkeit, basierend auf der Audioaufnahme',
      properties: {
        comment: {
          type: 'STRING',
          description: 'Kurzes, ermutigendes Aussprache-Feedback (2-3 Sätze): Verständlichkeit, Tempo, Betonung',
        },
        tips: {
          type: 'ARRAY',
          maxItems: 3,
          description: 'Konkrete Aussprache-Tipps, z. B. einzelne Wörter/Laute, die schwer zu verstehen waren',
          items: { type: 'STRING' },
        },
      },
      required: ['comment', 'tips'],
    }
    required.push('pronunciation')
  }
  if (wantTranscript) {
    properties.transcript = {
      type: 'STRING',
      description: 'Wörtliche Transkription dessen, was in der Aufnahme gesagt wurde',
    }
    required.push('transcript')
  }

  const responseSchema: GeminiSchema = { type: 'OBJECT', properties, required }

  const zodSchema = z.object({
    checks: z.array(z.object({ ok: z.boolean(), comment: z.string() })).length(n),
    corrections: z.array(z.object({ wrong: z.string(), better: z.string() })).max(6),
    feedback: z.string(),
    pronunciation: hasAudio
      ? z.object({ comment: z.string(), tips: z.array(z.string()).max(3) })
      : z.object({ comment: z.string(), tips: z.array(z.string()).max(3) }).optional(),
    transcript: z.string().optional(),
  })

  let user =
    `Aufgabe: ${context}\n\n` +
    `Diese Kriterien sollen erfüllt sein:\n` +
    criteria.map((c, i) => `${i + 1}. ${c}`).join('\n') +
    '\n\n'

  if (hasAudio) {
    user +=
      'Die gesprochene Antwort ist als Audioaufnahme angehängt. Analysiere die Aufnahme direkt - ' +
      'auch Aussprache, Tempo und Flüssigkeit.\n'
    if (transcript) {
      user += `Zur Orientierung das (evtl. fehlerhafte) Transkript der Browser-Spracherkennung:\n"""\n${transcript}\n"""\n`
    } else {
      user += 'Transkribiere zuerst wörtlich, was gesagt wurde (Feld "transcript").\n'
    }
  } else {
    user +=
      'Der Text ist ein automatisches Transkript einer gesprochenen Antwort: Ignoriere fehlende Satzzeichen, ' +
      'Groß-/Kleinschreibung und offensichtliche Erkennungsfehler.\n' +
      `Transkript:\n"""\n${transcript}\n"""\n`
  }
  user += '\nBewerte die Antwort nach den Kriterien im Schema.'

  return geminiJson({
    model: 'gemini-3.5-flash',
    fallbackModel: 'gemini-3.1-flash-lite',
    timeoutMs: hasAudio ? 90_000 : 60_000, // Audio-Upload + Analyse braucht länger
    system: SYSTEM_PROMPT,
    user,
    audio,
    responseSchema,
    zodSchema,
  })
}

/* ------------------- Prüfungsmodus: Punkte statt Übungs-Feedback ------------------- */

export interface SpeakingPartScore {
  points: number
  feedback: string
  transcript?: string
}

const EXAM_SYSTEM_PROMPT =
  'Du bist Prüfer für den mündlichen Teil des Berliner Sprachtests für die Einbürgerung (Deutsch-Niveau B1) ' +
  'und vergibst Punkte wie in der echten Prüfung. Bewerte Aufgabenerfüllung, Verständlichkeit, Wortschatz und ' +
  'Grammatik auf B1-Niveau. Gesprochene Sprache darf einfach sein - kleine Fehler kosten wenig, solange die ' +
  'Antwort verständlich ist und die Aufgabe erfüllt wird. Keine oder eine unverständliche Antwort = 0 Punkte. ' +
  'Gib dein Feedback auf einfachem, freundlichem Deutsch.'

/** Bewertet EINE mündliche Prüfungsaufgabe mit Punkten (0 bis maxPoints). */
export async function scoreSpeakingExamPart(input: {
  data: {
    context: string
    criteria: string[]
    maxPoints: number
    transcript?: string
    audio?: { mimeType: string; base64: string }
  }
}): Promise<SpeakingPartScore> {
  const { context, criteria, maxPoints, transcript, audio } = input.data
  const hasAudio = !!audio
  const wantTranscript = hasAudio && !transcript

  const properties: GeminiSchema = {
    points: {
      type: 'INTEGER',
      description: `Punkte von 0 bis ${maxPoints} für diese Aufgabe, wie ein echter Prüfer sie vergeben würde`,
    },
    feedback: {
      type: 'STRING',
      description: 'Kurze Begründung der Punktzahl + 1 konkreter Verbesserungstipp, auf einfachem Deutsch (2-3 Sätze)',
    },
  }
  const required = ['points', 'feedback']
  if (wantTranscript) {
    properties.transcript = { type: 'STRING', description: 'Wörtliche Transkription dessen, was gesagt wurde' }
    required.push('transcript')
  }

  const zodSchema = z.object({
    points: z.number(),
    feedback: z.string(),
    transcript: z.string().optional(),
  })

  let user =
    `Prüfungsaufgabe: ${context}\n\n` +
    `Bewertungskriterien:\n${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n` +
    `Maximal ${maxPoints} Punkte.\n\n`

  if (hasAudio) {
    user += 'Die gesprochene Antwort ist als Audioaufnahme angehängt. Analysiere die Aufnahme direkt.\n'
    if (transcript) {
      user += `Zur Orientierung das (evtl. fehlerhafte) Transkript der Browser-Spracherkennung:\n"""\n${transcript}\n"""\n`
    } else {
      user += 'Transkribiere zuerst wörtlich, was gesagt wurde (Feld "transcript").\n'
    }
  } else {
    user +=
      'Die Antwort liegt als automatisches Transkript vor (Satzzeichen/Großschreibung fehlen erkennungsbedingt - nicht werten):\n' +
      `"""\n${transcript}\n"""\n`
  }
  user += `\nVergib die Punkte (0-${maxPoints}) und begründe kurz.`

  const raw = await geminiJson({
    model: 'gemini-3.5-flash',
    fallbackModel: 'gemini-3.1-flash-lite',
    timeoutMs: hasAudio ? 90_000 : 60_000,
    system: EXAM_SYSTEM_PROMPT,
    user,
    audio,
    responseSchema: { type: 'OBJECT', properties, required },
    zodSchema,
  })

  return { ...raw, points: Math.max(0, Math.min(maxPoints, Math.round(raw.points))) }
}
