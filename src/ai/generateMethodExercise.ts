/* Erstellt (und evolviert) per KI eine neue Übung zu einer Übungsform (Satzbau-Puzzle,
   Fehlersuche, Diktat, Monolog, Blitzrunde, Nachsprechen).

   Leitgedanke: Das Modell liefert nur SÄTZE, niemals Strukturdaten. Also keine
   Chip-Listen und keine Fehlerindizes - die entstehen später lokal aus den
   Sätzen (siehe lib/wordDiff.ts). Ein vom Modell erfundener Index oder eine
   Wortliste, in der ein Wort fehlt, macht die Übung unlösbar; ein vollständiger
   Satz lässt sich dagegen immer verarbeiten.

   Brief-Baukasten und Rollenspiel sind bewusst nicht dabei: Beide brauchen von
   Hand abgestimmte Bausteine bzw. Rollen, und ihre Sammlungen sind lang genug.

   Welcher KI-Anbieter (Gemini oder DeepSeek) antwortet, entscheidet aiJson()
   (aiProvider.ts) anhand der Einstellung oben in der App. */
import { z } from 'zod'
import type {
  MethodExercise, MethodKind, WordOrderExercise, ErrorHuntExercise, DictationExercise,
  MonologueExercise, BlitzExercise, ShadowingExercise,
} from '../data/types'
import { splitWords, findErrorIndices } from '../lib/wordDiff'
import { type GeminiSchema } from './geminiClient'
import { aiJson } from './aiProvider'

/** Übungsformen, für die sich sinnvoll neue Aufgaben generieren lassen. */
export const GENERATABLE: MethodKind[] = ['wordorder', 'errorhunt', 'dictation', 'monologue', 'blitz', 'shadowing']

export function canGenerate(kind: MethodKind): boolean {
  return GENERATABLE.includes(kind)
}

const SYSTEM_PROMPT = `Du erstellst Übungen für Deutschlerner auf B1-Niveau, die sich auf den Berliner Sprachtest
für die Einbürgerung vorbereiten. Die Themen kommen aus dem Alltag in Deutschland: Wohnen, Arbeit, Familie, Amt
und Behörden, Gesundheit, Nachbarschaft, Einkaufen, Verkehr.

Regeln:
- Verwende ausschließlich Wortschatz und Strukturen, die auf B1 üblich sind.
- Erfinde jedes Mal ein neues, konkretes Beispiel. Wiederhole keine der schon vorhandenen Aufgaben.
- Schreibe vollständige, natürliche Sätze - keine Stichworte, keine Platzhalter wie "XY".

Antworte ausschließlich auf Deutsch und exakt im vorgegebenen JSON-Schema.`

/* ------------------------------- Satzbau-Puzzle ------------------------------- */

const WordOrderSchema = z.object({
  solution: z.string(),
  alternatives: z.array(z.string()).optional(),
  why: z.string(),
})

const WORDORDER_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    solution: {
      type: 'STRING',
      description:
        'Der vollständige, korrekte Satz (8-14 Wörter). Er muss eine klare Wortstellungsregel zeigen: Verb am ' +
        'Ende im Nebensatz, Verb direkt nach „deshalb"/„außerdem", Partizip oder Infinitiv am Satzende.',
    },
    alternatives: {
      type: 'ARRAY',
      maxItems: 2,
      description: 'Weitere Wortstellungen mit GENAU denselben Wörtern, die ebenfalls korrekt sind. Sonst leer lassen.',
      items: { type: 'STRING' },
    },
    why: { type: 'STRING', description: 'Die Regel dahinter, ein bis zwei Sätze, B1-gerecht erklärt' },
  },
  required: ['solution', 'why'],
}

/* --------------------------------- Fehlersuche --------------------------------- */

const ErrorHuntSchema = z.object({
  wrong: z.string(),
  correct: z.string(),
  why: z.string(),
})

const ERRORHUNT_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    correct: { type: 'STRING', description: 'Der vollständige, korrekte Satz (8-14 Wörter)' },
    wrong: {
      type: 'STRING',
      description:
        'Derselbe Satz mit GENAU EINEM eingebauten Fehler - ein einziges Wort ist ersetzt oder steht an der ' +
        'falschen Stelle. Alle anderen Wörter bleiben unverändert. Typische Fehler: falscher Fall nach einer ' +
        'Präposition, Verb nicht am Ende des Nebensatzes, falscher Artikel, sein/haben im Perfekt vertauscht.',
    },
    why: { type: 'STRING', description: 'Erklärung der Regel, ein bis zwei Sätze, B1-gerecht' },
  },
  required: ['wrong', 'correct', 'why'],
}

/* ----------------------------------- Diktat ----------------------------------- */

const DictationSchema = z.object({
  sentence: z.string(),
  watchOut: z.string().optional(),
})

const DICTATION_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    sentence: {
      type: 'STRING',
      description:
        'Ein Satz zum Diktieren (8-14 Wörter) mit mindestens einer Rechtschreibfalle: großgeschriebene Nomen, ' +
        'ß oder ss, Umlaute, oder ein Komma vor einem Nebensatz.',
    },
    watchOut: { type: 'STRING', description: 'Worauf beim Schreiben zu achten ist, ein kurzer Satz' },
  },
  required: ['sentence'],
}

/* ---------------------------------- Monolog ---------------------------------- */

const MonologueSchema = z.object({
  topic: z.string(),
  mustMention: z.array(z.string()).min(3).max(3),
})

const MONOLOGUE_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    topic: { type: 'STRING', description: 'Ein Alltagsthema, über das man eine Minute frei sprechen kann (2-4 Wörter)' },
    mustMention: {
      type: 'ARRAY',
      minItems: 3,
      maxItems: 3,
      description: 'Genau drei Aspekte als kurze Fragen, die im Monolog vorkommen sollen',
      items: { type: 'STRING' },
    },
  },
  required: ['topic', 'mustMention'],
}

/* --------------------------------- Blitzrunde --------------------------------- */

const BlitzSchema = z.object({
  questions: z.array(z.string()).min(6).max(8),
})

const BLITZ_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    questions: {
      type: 'ARRAY',
      minItems: 6,
      maxItems: 8,
      description:
        'Fragen, die sich in 20 Sekunden spontan beantworten lassen - persönlich, konkret, ohne Fachwissen. ' +
        'Keine Ja/Nein-Fragen.',
      items: { type: 'STRING' },
    },
  },
  required: ['questions'],
}

/* -------------------------------- Nachsprechen -------------------------------- */

const ShadowingSchema = z.object({
  focus: z.string(),
  sentences: z.array(z.string()).min(5).max(6),
})

const SHADOWING_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    focus: { type: 'STRING', description: 'Kurzer Titel des Sets, z. B. „Beim Arzt" oder „Laute: sch, sp, st"' },
    sentences: {
      type: 'ARRAY',
      minItems: 5,
      maxItems: 6,
      description: 'Sätze zum Nachsprechen, von kurz nach lang sortiert (erster ca. 5, letzter ca. 12 Wörter)',
      items: { type: 'STRING' },
    },
  },
  required: ['focus', 'sentences'],
}

/* ------------------------------------------------------------------------------ */

function newId(): string {
  return `ai-${crypto.randomUUID()}`
}

function call<T>(responseSchema: GeminiSchema, zodSchema: z.ZodType<T>, user: string) {
  return aiJson({
    timeoutMs: 60_000,
    thinkingLevel: 'MEDIUM',
    system: SYSTEM_PROMPT,
    user,
    responseSchema,
    zodSchema,
  })
}

/** Erzeugt eine neue Übung zur angegebenen Übungsform.
    `existing` sind die Aufgaben, die schon da sind - sie gehen als "nicht
    wiederholen" in den Prompt. */
export async function generateMethodExercise(kind: MethodKind, existing: MethodExercise[]): Promise<MethodExercise> {
  const avoid = existing.slice(-12).map(describeExisting).filter(Boolean)
  const avoidBlock = avoid.length > 0 ? `\nSchon vorhanden (nicht wiederholen):\n${avoid.map((a) => `- ${a}`).join('\n')}\n` : ''

  switch (kind) {
    case 'wordorder': {
      const r = await call(
        WORDORDER_SCHEMA,
        WordOrderSchema,
        'Erstelle einen deutschen Satz für ein Satzbau-Puzzle: Der Lernende bekommt die Wörter gemischt und ' +
          'muss sie in die richtige Reihenfolge bringen.' + avoidBlock
      )
      return buildWordOrder(r)
    }

    case 'errorhunt': {
      const r = await call(
        ERRORHUNT_SCHEMA,
        ErrorHuntSchema,
        'Erstelle einen deutschen Satz mit genau einem typischen B1-Fehler für eine Fehlersuche.' + avoidBlock
      )
      return buildErrorHunt(r)
    }

    case 'dictation': {
      const r = await call(DICTATION_SCHEMA, DictationSchema, 'Erstelle einen deutschen Satz für ein Diktat.' + avoidBlock)
      const exercise: DictationExercise = {
        id: newId(),
        kind: 'dictation',
        instruction: 'Höre den Satz an und schreibe ihn genau auf.',
        sentence: r.sentence,
        watchOut: r.watchOut,
      }
      return exercise
    }

    case 'monologue': {
      const r = await call(
        MONOLOGUE_SCHEMA,
        MonologueSchema,
        'Erstelle ein Thema für einen 60-Sekunden-Monolog mit genau drei Aspekten, die vorkommen sollen.' + avoidBlock
      )
      const exercise: MonologueExercise = {
        id: newId(),
        kind: 'monologue',
        instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
        topic: r.topic,
        seconds: 60,
        mustMention: r.mustMention,
      }
      return exercise
    }

    case 'blitz': {
      const r = await call(BLITZ_SCHEMA, BlitzSchema, 'Erstelle einen Fragensatz für eine Blitzrunde.' + avoidBlock)
      const exercise: BlitzExercise = {
        id: newId(),
        kind: 'blitz',
        instruction: 'Antworte sofort, in ganzen Sätzen. Pro Frage hast du 20 Sekunden.',
        seconds: 20,
        questions: r.questions,
      }
      return exercise
    }

    case 'shadowing': {
      const r = await call(SHADOWING_SCHEMA, ShadowingSchema, 'Erstelle ein Set von Sätzen zum Nachsprechen.' + avoidBlock)
      const exercise: ShadowingExercise = {
        id: newId(),
        kind: 'shadowing',
        instruction: 'Hör dir jeden Satz an und sprich ihn genauso nach.',
        focus: r.focus,
        sentences: r.sentences,
      }
      return exercise
    }

    default:
      throw new Error('Für diese Übungsform lassen sich keine neuen Aufgaben generieren.')
  }
}

/** Evolviert eine bestehende Übung derselben Übungsform in eine neue, spürbar
    schwierigere Variante. `pool` dient wie bei generateMethodExercise() nur als
    "nicht wiederholen"-Liste. */
export async function evolveMethodExercise(
  kind: MethodKind,
  existing: MethodExercise,
  pool: MethodExercise[]
): Promise<MethodExercise> {
  const avoid = pool.slice(-12).map(describeExisting).filter(Boolean)
  const avoidBlock = avoid.length > 0 ? `\nSchon vorhanden (nicht wiederholen):\n${avoid.map((a) => `- ${a}`).join('\n')}\n` : ''
  const base = `Hier ist eine existierende Übung (${describeExisting(existing)}). Erstelle daraus eine EVOLVIERTE, ` +
    'neue Version: gleiche Übungsform, aber spürbar schwieriger und mit neuem, konkretem Inhalt - keine triviale ' +
    'Umformulierung des Originals.' + avoidBlock

  switch (kind) {
    case 'wordorder': {
      const r = await call(WORDORDER_SCHEMA, WordOrderSchema, base + ' Verwende eine anspruchsvollere Wortstellungsregel oder einen längeren Satz (aber weiterhin B1).')
      return buildWordOrder(r)
    }
    case 'errorhunt': {
      const r = await call(ERRORHUNT_SCHEMA, ErrorHuntSchema, base + ' Verwende einen subtileren, leichter zu übersehenden Fehlertyp als im Original.')
      return buildErrorHunt(r)
    }
    case 'dictation': {
      const r = await call(DICTATION_SCHEMA, DictationSchema, base + ' Baue eine zusätzliche oder andere Rechtschreibfalle ein.')
      const exercise: DictationExercise = {
        id: newId(),
        kind: 'dictation',
        instruction: 'Höre den Satz an und schreibe ihn genau auf.',
        sentence: r.sentence,
        watchOut: r.watchOut,
      }
      return exercise
    }
    case 'monologue': {
      const r = await call(MONOLOGUE_SCHEMA, MonologueSchema, base + ' Wähle ein abstrakteres oder meinungsbasierteres Thema als im Original.')
      const exercise: MonologueExercise = {
        id: newId(),
        kind: 'monologue',
        instruction: 'Sprich 60 Sekunden am Stück über das Thema. Alle drei Punkte sollen vorkommen.',
        topic: r.topic,
        seconds: 60,
        mustMention: r.mustMention,
      }
      return exercise
    }
    case 'blitz': {
      const r = await call(BLITZ_SCHEMA, BlitzSchema, base + ' Stelle Fragen, die etwas mehr Nachdenken oder Begründen erfordern als im Original.')
      const exercise: BlitzExercise = {
        id: newId(),
        kind: 'blitz',
        instruction: 'Antworte sofort, in ganzen Sätzen. Pro Frage hast du 20 Sekunden.',
        seconds: 20,
        questions: r.questions,
      }
      return exercise
    }
    case 'shadowing': {
      const r = await call(SHADOWING_SCHEMA, ShadowingSchema, base + ' Verwende längere oder lautlich anspruchsvollere Sätze als im Original.')
      const exercise: ShadowingExercise = {
        id: newId(),
        kind: 'shadowing',
        instruction: 'Hör dir jeden Satz an und sprich ihn genauso nach.',
        focus: r.focus,
        sentences: r.sentences,
      }
      return exercise
    }
    default:
      throw new Error('Für diese Übungsform lässt sich keine evolvierte Aufgabe erstellen.')
  }
}

function buildWordOrder(r: z.infer<typeof WordOrderSchema>): WordOrderExercise {
  // Alternativen verwerfen, die nicht exakt dieselben Wörter benutzen - sonst
  // gälte eine Lösung als richtig, die mit den vorhandenen Chips gar nicht
  // baubar ist.
  const alternatives = (r.alternatives ?? []).filter((alt) => sameWords(alt, r.solution))
  return {
    id: newId(),
    kind: 'wordorder',
    instruction: 'Bring die Wörter in die richtige Reihenfolge.',
    solution: r.solution,
    alternatives: alternatives.length > 0 ? alternatives : undefined,
    why: r.why,
  }
}

function buildErrorHunt(r: z.infer<typeof ErrorHuntSchema>): ErrorHuntExercise {
  // Gegenprobe: Unterscheiden sich die beiden Sätze wirklich nur an einer
  // Stelle? Manchmal formuliert das Modell den ganzen Satz um - eine solche
  // Aufgabe wäre nicht lösbar, weil es keine eindeutige Fehlerstelle gibt.
  const spots = findErrorIndices(r.wrong, r.correct)
  if (spots.length === 0 || spots.length > 2) {
    throw new Error('Die KI hat keine saubere Übung geliefert (mehr als eine Abweichung). Bitte noch einmal versuchen.')
  }
  return {
    id: newId(),
    kind: 'errorhunt',
    instruction: 'In diesem Satz steckt ein Fehler. Tippe das falsche Wort an und korrigiere es.',
    wrong: r.wrong,
    correct: r.correct,
    why: r.why,
  }
}

/** Zwei Sätze bestehen aus denselben Wörtern (nur in anderer Reihenfolge)? */
function sameWords(a: string, b: string): boolean {
  const norm = (s: string) =>
    splitWords(s)
      .map((w) => w.toLowerCase().replace(/[.,;:!?]+$/, ''))
      .sort()
      .join('|')
  return norm(a) === norm(b)
}

function describeExisting(ex: MethodExercise): string {
  switch (ex.kind) {
    case 'wordorder':
      return ex.solution
    case 'errorhunt':
      return ex.correct
    case 'dictation':
      return ex.sentence
    case 'monologue':
      return ex.topic
    case 'blitz':
      return ex.questions.slice(0, 3).join(' / ')
    case 'shadowing':
      return ex.focus ?? ex.sentences[0]
    default:
      return ''
  }
}
