/* Zod-Schemas für die KI-generierten Aufgaben (Teil 1–4).
   Diese bilden die Inhaltsfelder aus data/types.ts ab (ohne id/set,
   die serverseitig nach der Generierung ergänzt werden). Sie dienen als
   `outputSchema` für @tanstack/ai, damit Claude strukturierte, typisierte
   Aufgaben im Format des Modelltests liefert. */
import { z } from 'zod'

export const AdSchema = z.object({
  head: z.string().meta({ description: 'Überschrift der Anzeige, oft in Großbuchstaben' }),
  body: z.string().meta({ description: 'Haupttext der Anzeige (1-3 Sätze)' }),
  foot: z.string().meta({ description: 'Kontaktinfo/Fußzeile, z. B. Telefonnummer oder Webseite' }),
})

export const GeneratedTeil1Schema = z.object({
  situation: z.string().meta({ description: 'Kurze Alltagssituation auf Deutsch (B1-Niveau), 1-2 Sätze, direkt mit "Sie" formuliert' }),
  ads: z.array(AdSchema).length(3).meta({ description: 'Genau 3 Kleinanzeigen zum gleichen Thema; nur eine erfüllt alle Details, die anderen scheitern an einem konkreten Detail' }),
  correct: z.number().int().min(0).max(2).meta({ description: 'Index (0-2) der richtigen Anzeige' }),
  expl: z.string().meta({ description: 'Kurze Erklärung auf Deutsch, warum die Lösung richtig ist und die anderen nicht' }),
})

export const Teil2ItemSchema = z.object({
  s: z.string().meta({ description: 'Eine Aussage zum Text (richtig oder falsch)' }),
  a: z.boolean().meta({ description: 'true = Aussage ist laut Text richtig, false = falsch' }),
  e: z.string().meta({ description: 'Kurze Begründung/Zitat aus dem Text' }),
})

export const GeneratedTeil2Schema = z.object({
  title: z.string().meta({ description: 'Überschrift des Zeitungsartikels' }),
  text: z.string().meta({ description: 'Zeitungsartikel auf B1-Niveau, 3-4 Absätze, getrennt durch \\n' }),
  items: z.array(Teil2ItemSchema).length(4).meta({ description: 'Genau 4 Aussagen zum Text' }),
})

export const GeneratedTeil3Schema = z.object({
  text: z.string().meta({ description: 'Zeitungsartikel auf B1-Niveau, 2-3 Absätze, getrennt durch \\n' }),
  options: z.array(z.string()).length(3).meta({ description: 'Genau 3 mögliche Überschriften zum gleichen Thema; nur eine fasst den Text korrekt zusammen, die anderen haben falschen Fokus/Detail' }),
  correct: z.number().int().min(0).max(2).meta({ description: 'Index (0-2) der passenden Überschrift' }),
  expl: z.string().meta({ description: 'Kurze Erklärung, warum diese Überschrift passt' }),
})

export const GeneratedTeil4Schema = z.object({
  situation: z.string().meta({ description: 'Alltagssituation, in der eine kurze Nachricht geschrieben werden muss, direkt mit "Sie" formuliert (kein erfundener Name für die Testperson)' }),
  points: z.array(z.string()).length(4).meta({ description: 'Genau 4 Punkte, die in der Nachricht behandelt werden sollen' }),
  model: z.string().meta({ description: 'Musterlösung: vollständige Nachricht mit Anrede und Gruß, \\n zwischen Absätzen' }),
})

export type GeneratedTeil1 = z.infer<typeof GeneratedTeil1Schema>
export type GeneratedTeil2 = z.infer<typeof GeneratedTeil2Schema>
export type GeneratedTeil3 = z.infer<typeof GeneratedTeil3Schema>
export type GeneratedTeil4 = z.infer<typeof GeneratedTeil4Schema>

/** KI-Zusammenfassung, wenn im Übungsmodus alle Aufgaben eines Teils erledigt sind. */
export const PracticeSummarySchema = z.object({
  summary: z.string().meta({ description: 'Kurze, motivierende Zusammenfassung (2-4 Sätze) der Leistung in diesem Übungsteil, auf Deutsch' }),
  tips: z.array(z.string()).min(2).max(4).meta({ description: '2-4 konkrete, kurze Tipps zur Verbesserung, auf Deutsch' }),
})

export type PracticeSummary = z.infer<typeof PracticeSummarySchema>
