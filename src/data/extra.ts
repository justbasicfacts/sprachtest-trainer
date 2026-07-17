/* Zusätzliche Übungssätze 5–8 (gleiche Formate wie der Modelltest) */
import type { ExtraData } from './types'

export const EXTRA: ExtraData = {

teil1: [
{
  id:"t1s5", set:"Übungssatz 5",
  situation:"Sie möchten am Wochenende mit Ihren Kindern (5 und 8 Jahre) etwas unternehmen. Es soll draußen sein und wenig kosten.",
  ads:[
    {head:"KINDERTHEATER SONNENSCHEIN", body:"Das Märchen „Der gestiefelte Kater“ – jeden Samstag und Sonntag um 15 Uhr im Theatersaal. Karten: 18 € pro Person.", foot:"Reservierung unter Tel. 030 99 88 77"},
    {head:"GROSSES FAMILIENFEST IM STADTPARK", body:"Am Samstag ab 11 Uhr: Spiele, Hüpfburg, Kinderschminken und Musik unter freiem Himmel. Der Eintritt ist frei!", foot:"Organisiert vom Bezirksamt – bei jedem Wetter"},
    {head:"INDOOR-SPIELPLATZ TOBEWELT", body:"Klettern, Rutschen und Trampolin auf 2.000 m² – perfekt bei Regen! Tageskarte Kind: 12,50 €, Erwachsene: 8 €.", foot:"täglich 10–19 Uhr, Gewerbepark Süd"},
  ],
  correct:1,
  expl:"Gesucht: draußen und günstig. Das Kindertheater (a) und der Indoor-Spielplatz (c) sind drinnen und kosten Eintritt. Das Familienfest (b) ist draußen und kostenlos."
},
{
  id:"t1s6", set:"Übungssatz 6",
  situation:"Sie haben ein altes Sofa, das noch gut erhalten ist. Sie brauchen es nicht mehr und möchten, dass jemand es möglichst schnell abholt.",
  ads:[
    {head:"MÖBELHAUS WOHNTRAUM – SOMMERAKTION!", body:"Neue Sofas, Sessel und Betten jetzt bis zu 30 % günstiger. Lieferung innerhalb einer Woche.", foot:"Möbelhaus Wohntraum, Industriestraße 15"},
    {head:"VERSCHENKE-BÖRSE BERLIN", body:"Gut erhaltene Möbel sind zu schade für den Müll! Wir holen Ihre Spende kostenlos bei Ihnen ab – meistens schon innerhalb von zwei Tagen – und geben sie an Familien weiter, die sie brauchen.", foot:"www.verschenke-boerse-berlin.de, Tel. 030 12 34 56"},
    {head:"SPERRMÜLL-ABHOLUNG", body:"Die Stadtreinigung holt Ihren Sperrmüll ab. Terminvergabe zurzeit nur online, Wartezeit ca. vier bis sechs Wochen. Preis: ab 50 €.", foot:"www.stadtreinigung.berlin"},
  ],
  correct:1,
  expl:"Das Möbelhaus (a) verkauft neue Möbel. Der Sperrmüll (c) kostet Geld und man wartet Wochen. Die Verschenke-Börse (b) holt das gut erhaltene Sofa kostenlos und schnell ab."
},
{
  id:"t1s7", set:"Übungssatz 7",
  situation:"Ihre Tochter ist 9 Jahre alt und soll richtig schwimmen lernen. Sie suchen einen Kurs am Nachmittag, nach der Schule.",
  ads:[
    {head:"SCHWIMMKURS FÜR ERWACHSENE", body:"Es ist nie zu spät! Anfängerkurs für Erwachsene, dienstags und donnerstags 20–21 Uhr im Hallenbad Mitte.", foot:"Anmeldung: www.schwimmschule-mitte.de"},
    {head:"FAMILIEN-SONNTAG IM FREIBAD", body:"Jeden Sonntag: Familientarif – 2 Erwachsene und bis zu 3 Kinder für nur 10 €. Riesenrutsche und Kinderbecken!", foot:"Freibad am See, Mai bis September"},
    {head:"SEEPFERDCHEN-KURS FÜR KINDER", body:"Schwimmen lernen mit Spaß! Kurse für Kinder von 6 bis 12 Jahren, montags und mittwochs 16–17 Uhr. Kleine Gruppen, erfahrene Trainerinnen.", foot:"Schwimmverein Delfin, Anmeldung Tel. 030 66 55 44"},
  ],
  correct:2,
  expl:"Kurs a ist für Erwachsene und abends. Das Freibad (b) ist kein Kurs, dort lernt man nicht schwimmen. Der Seepferdchen-Kurs (c) passt: für Kinder, am Nachmittag."
},
{
  id:"t1s8", set:"Übungssatz 8",
  situation:"Sie fangen nächste Woche eine neue Arbeit in Berlin an und suchen schnell ein Zimmer für zwei bis drei Monate, bis Sie eine eigene Wohnung gefunden haben.",
  ads:[
    {head:"3-ZIMMER-WOHNUNG IN PANKOW", body:"Schöne Altbauwohnung, 78 m², unbefristeter Mietvertrag, frei ab 1. Dezember. Kaltmiete 1.250 €. Besichtigungstermine nach Vereinbarung.", foot:"Hausverwaltung Krüger & Sohn"},
    {head:"FERIENWOHNUNG CITY-APARTMENT", body:"Modernes Apartment für Ihren Berlin-Urlaub, zentrale Lage, ab 95 € pro Nacht, Mindestaufenthalt 2 Nächte.", foot:"www.city-apartment-berlin.de"},
    {head:"MÖBLIERTES ZIMMER AUF ZEIT", body:"Helles Zimmer in ruhiger 2er-WG, voll möbliert, WLAN und Küchenbenutzung inklusive. Zwischenmiete für 1 bis 4 Monate, ab sofort frei. 480 € warm.", foot:"Kontakt: wg-zimmer-berlin@mail.de"},
  ],
  correct:2,
  expl:"Die Wohnung (a) ist unbefristet und erst ab Dezember frei. Die Ferienwohnung (b) ist für Urlaub und pro Nacht sehr teuer. Das möblierte Zimmer auf Zeit (c) passt genau: sofort frei, für 1–4 Monate."
},
{
  id:"t1s9", set:"Übungssatz 9 (aus Prüfungsberichten)",
  situation:"Sie möchten eine Ausbildung als Koch bzw. Köchin machen und suchen einen Ausbildungsplatz in einem Restaurant oder Hotel in Berlin.",
  ads:[
    {head:"KOCHKURS FÜR HOBBYKÖCHE", body:"Lernen Sie an drei Abenden, wie man italienische Klassiker kocht – für alle, die gern privat besser kochen möchten. Keine Vorkenntnisse nötig.", foot:"Kochschule Genussvoll, Anmeldung online"},
    {head:"HOTEL LINDENHOF SUCHT AUSBILDUNGSPLATZ KOCH/KÖCHIN", body:"Wir bilden ab September aus! Sie lernen bei uns alle Stationen der Küche kennen, begleitet von erfahrenen Köchinnen und Köchen. Schulabschluss erforderlich.", foot:"Bewerbung an bewerbung@hotel-lindenhof.de"},
    {head:"ERFAHRENE KÖCHIN/ERFAHRENER KOCH GESUCHT", body:"Restaurant Zur Linde sucht sofort eine ausgebildete Fachkraft mit mindestens drei Jahren Berufserfahrung für die Vollzeitstelle in der Küche.", foot:"Tel. 030 456 78 90"},
  ],
  correct:1,
  expl:"Gesucht wird ein Ausbildungsplatz. Der Kochkurs (a) ist nur ein Hobbykurs, keine Ausbildung. Restaurant Zur Linde (c) sucht bereits ausgebildetes Personal mit Erfahrung, keine Auszubildenden. Das Hotel Lindenhof (b) bietet genau den gesuchten Ausbildungsplatz an."
},
],

teil2: [
{
  id:"t2s5", set:"Übungssatz 5",
  title:"Bibliotheken sind mehr als Bücher",
  text:"Viele denken bei einer Bibliothek nur an Bücherregale. Doch die Stadtbibliotheken haben sich verändert: Heute kann man dort auch E-Books, Filme, Musik, Spiele und sogar Werkzeug oder Musikinstrumente ausleihen.\nAußerdem gibt es viele kostenlose Angebote: Hausaufgabenhilfe für Schüler, Computerkurse für Seniorinnen und Senioren und Sprachcafés, in denen man Deutsch üben kann.\n„Ich komme fast jeden Samstag hierher. Meine Kinder lieben die Vorlesestunde, und ich lese in Ruhe Zeitung“, erzählt die Berlinerin Amina Said.\nEin Bibliotheksausweis kostet in Berlin nur 10 Euro im Jahr, für Kinder, Studierende und Menschen mit geringem Einkommen ist er kostenlos. Die meisten Angebote kann man ohne Anmeldung nutzen.",
  items:[
    {s:"In der Bibliothek kann man nur Bücher ausleihen.", a:false, e:"Man kann auch E-Books, Filme, Spiele, Werkzeug und Instrumente ausleihen."},
    {s:"In den Sprachcafés kann man Deutsch üben.", a:true, e:"„… Sprachcafés, in denen man Deutsch üben kann.“"},
    {s:"Frau Said besucht die Bibliothek fast jede Woche.", a:true, e:"Sie kommt fast jeden Samstag."},
    {s:"Der Bibliotheksausweis kostet für alle 10 Euro im Jahr.", a:false, e:"Für Kinder, Studierende und Menschen mit geringem Einkommen ist er kostenlos."},
  ]
},
{
  id:"t2s6", set:"Übungssatz 6",
  title:"Zu viele Lebensmittel landen im Müll",
  text:"In Deutschland werden jedes Jahr Millionen Tonnen Lebensmittel weggeworfen – ein großer Teil davon in privaten Haushalten. Oft landet Essen im Müll, das noch gut ist.\nDagegen kann man etwas tun: Wer mit einem Einkaufszettel einkauft, kauft weniger Unnötiges. Und das Mindesthaltbarkeitsdatum bedeutet nicht, dass ein Lebensmittel danach schlecht ist – oft kann man es noch Tage oder Wochen später essen, wenn es gut aussieht und normal riecht.\nAuch neue Ideen helfen: Über Apps wie „Foodsharing“ verschenken Menschen Essen, das sie nicht mehr brauchen. Viele Supermärkte spenden Lebensmittel an die Tafeln, die sie an Menschen mit wenig Geld weitergeben.\n„Seit ich einen Wochenplan fürs Kochen mache, werfe ich fast nichts mehr weg“, sagt der Student Tim Berger.",
  items:[
    {s:"Die meisten Lebensmittel im Müll sind schon schlecht.", a:false, e:"Oft landet Essen im Müll, das noch gut ist."},
    {s:"Nach dem Mindesthaltbarkeitsdatum kann man Lebensmittel oft noch essen.", a:true, e:"Oft kann man sie noch Tage oder Wochen später essen."},
    {s:"Über Apps kann man Essen verschenken.", a:true, e:"„Über Apps wie ‚Foodsharing‘ verschenken Menschen Essen …“"},
    {s:"Tim Berger wirft seit dem Wochenplan mehr Lebensmittel weg.", a:false, e:"Er wirft fast nichts mehr weg."},
  ]
},
{
  id:"t2s7", set:"Übungssatz 7",
  title:"Sportvereine suchen Nachwuchs und Helfer",
  text:"Fast jeder vierte Mensch in Deutschland ist Mitglied in einem Sportverein. Besonders beliebt sind Fußball, Turnen und Tennis. Die Mitgliedschaft ist meistens günstig: Kinder zahlen oft weniger als 10 Euro im Monat.\nDie Vereine leben vom Ehrenamt: Trainerinnen, Schiedsrichter und Vorstände arbeiten in ihrer Freizeit und bekommen dafür kein oder nur wenig Geld. Viele Vereine suchen dringend solche freiwilligen Helfer.\nEs gibt aber auch Probleme: In den Städten fehlen Sporthallen, deshalb gibt es bei manchen Vereinen Wartelisten – vor allem beim Kinderschwimmen und beim Fußball.\n„Mein Sohn stand ein Jahr auf der Warteliste, aber jetzt trainiert er zweimal pro Woche und hat viele Freunde gefunden“, erzählt Vater Mehmet Aydin.",
  items:[
    {s:"Die Mitgliedschaft im Sportverein ist meistens teuer.", a:false, e:"Sie ist meistens günstig, Kinder zahlen oft unter 10 Euro im Monat."},
    {s:"Viele Trainerinnen und Trainer arbeiten ehrenamtlich.", a:true, e:"Sie arbeiten in ihrer Freizeit und bekommen kein oder nur wenig Geld."},
    {s:"In den Städten gibt es genug Sporthallen.", a:false, e:"In den Städten fehlen Sporthallen, deshalb gibt es Wartelisten."},
    {s:"Der Sohn von Herrn Aydin trainiert jetzt zweimal pro Woche.", a:true, e:"Das sagt sein Vater am Ende des Textes."},
  ]
},
{
  id:"t2s8", set:"Übungssatz 8",
  title:"Erste Hilfe: Viele trauen sich nicht",
  text:"Wenn ein Mensch plötzlich zusammenbricht, zählt jede Minute. Trotzdem helfen viele Menschen in Deutschland bei einem Notfall nicht – nicht weil sie nicht wollen, sondern weil sie Angst haben, etwas falsch zu machen.\nExperten sagen: Der größte Fehler ist, gar nichts zu tun. Wer den Notruf 112 wählt und mit der Herzdruckmassage beginnt, kann Leben retten. Die Mitarbeiter in der Notrufzentrale erklären am Telefon genau, was man tun muss.\nDie meisten Menschen haben ihren letzten Erste-Hilfe-Kurs vor vielen Jahren beim Führerschein gemacht. Organisationen wie das Rote Kreuz empfehlen, das Wissen alle zwei bis drei Jahre in einem Kurs aufzufrischen. Ein Kurs dauert nur einen Tag und kostet etwa 50 Euro – manche Arbeitgeber bezahlen ihn sogar.",
  items:[
    {s:"Viele Menschen helfen nicht, weil sie Angst vor Fehlern haben.", a:true, e:"„… weil sie Angst haben, etwas falsch zu machen.“"},
    {s:"Experten sagen: Der größte Fehler ist, gar nichts zu tun.", a:true, e:"Das steht wörtlich im Text."},
    {s:"Am Notruf-Telefon bekommt man keine Hilfe.", a:false, e:"Die Notrufzentrale erklärt am Telefon genau, was man tun muss."},
    {s:"Ein Erste-Hilfe-Kurs dauert eine Woche.", a:false, e:"Ein Kurs dauert nur einen Tag."},
  ]
},
{
  id:"t2s9", set:"Übungssatz 9 (aus Prüfungsberichten)",
  title:"Vom Berufsleben in Berlin auf den Bauernhof",
  text:"Immer wieder ziehen Familien aus der Großstadt aufs Land. Auch drei Familien aus Berlin haben in den letzten Jahren ihr Leben verändert: Sie sind gemeinsam auf einen alten Bauernhof in Brandenburg gezogen und bewirtschaften ihn seitdem zusammen.\n„In Berlin haben wir in einer kleinen Wohnung gelebt und kaum einen Garten gesehen. Hier haben die Kinder viel Platz zum Spielen, und wir bauen unser eigenes Gemüse an“, erzählt Familie Brenner, die vor zwei Jahren umgezogen ist.\nDas Leben auf dem Land ist aber nicht nur einfach: Die nächste Schule ist 20 Minuten mit dem Auto entfernt, und ohne eigenes Fahrzeug kommt man kaum voran. Auch die Arbeit auf dem Hof ist anstrengend und lässt sich nicht einfach nach Feierabend beenden.\nTrotzdem bereuen die drei Familien ihre Entscheidung nicht. „Wir haben jetzt weniger Geld, aber mehr Zeit für das, was uns wichtig ist“, sagt Herr Brenner. Die Kinder gehen inzwischen gern in die kleine Dorfschule und haben schnell neue Freunde gefunden.",
  items:[
    {s:"Die drei Familien sind zusammen auf einen Bauernhof gezogen.", a:true, e:"„… sind gemeinsam auf einen alten Bauernhof in Brandenburg gezogen …“"},
    {s:"In Berlin hatte Familie Brenner einen großen Garten.", a:false, e:"Sie hatten eine kleine Wohnung und kaum einen Garten."},
    {s:"Die Schule ist zu Fuß in wenigen Minuten zu erreichen.", a:false, e:"Die nächste Schule ist 20 Autominuten entfernt."},
    {s:"Herr Brenner sagt, dass sie jetzt mehr Zeit für Wichtiges haben.", a:true, e:"„Wir haben jetzt weniger Geld, aber mehr Zeit für das, was uns wichtig ist.“"},
  ]
},
],

teil3: [
{
  id:"t3s5", set:"Übungssatz 5",
  text:"Viele Menschen sitzen den ganzen Tag: am Schreibtisch, im Auto und abends auf dem Sofa. Ärzte warnen, dass zu wenig Bewegung auf Dauer krank macht – Rückenschmerzen und Übergewicht sind häufige Folgen.\nDie gute Nachricht: Man muss kein Sportler werden, um etwas für die Gesundheit zu tun. Schon kleine Änderungen im Alltag helfen. Wer die Treppe statt den Aufzug nimmt, eine Station früher aus dem Bus steigt oder in der Mittagspause einen kurzen Spaziergang macht, bewegt sich jeden Tag ein bisschen mehr.\nExperten empfehlen ungefähr 8.000 Schritte am Tag. Eine Schrittzähler-App auf dem Handy kann dabei helfen und motivieren. Wichtig ist vor allem, regelmäßig aktiv zu sein – nicht nur einmal im Monat beim Sport.",
  options:["Mehr Bewegung im Alltag – so klappt es","Die besten Fitnessstudios der Stadt","Warum Autofahren immer teurer wird"],
  correct:0,
  expl:"Der Text gibt Tipps für mehr Bewegung im Alltag. Um Fitnessstudios (b) oder Autokosten (c) geht es nicht."
},
{
  id:"t3s6", set:"Übungssatz 6",
  text:"Im Winter steigen die Heizkosten – doch mit einfachen Tricks kann man Energie und Geld sparen. Schon ein Grad weniger senkt die Kosten um ungefähr sechs Prozent. Experten empfehlen für das Wohnzimmer etwa 20 Grad, im Schlafzimmer reichen 17 bis 18 Grad.\nWichtig ist das richtige Lüften: Statt das Fenster den ganzen Tag zu kippen, sollte man mehrmals täglich für fünf bis zehn Minuten alle Fenster ganz öffnen. So kommt frische Luft herein, aber die Wände bleiben warm.\nAuch kleine Dinge helfen: Möbel sollten nicht direkt vor der Heizung stehen, und nachts halten geschlossene Rollläden die Wärme in der Wohnung. Wer diese Tipps beachtet, kann im Jahr mehrere Hundert Euro sparen.",
  options:["Richtig heizen und lüften – so sparen Sie Geld","Neue Fenster jetzt zum Winterpreis","Warum der Winter immer kälter wird"],
  correct:0,
  expl:"Der Text gibt Spartipps zum Heizen und Lüften. Es ist keine Werbung für Fenster (b), und um das Wetter (c) geht es nicht."
},
{
  id:"t3s7", set:"Übungssatz 7",
  text:"Schon Grundschulkinder wünschen sich ein eigenes Smartphone. Viele Eltern fragen sich: Ab wann ist das richtig? Fachleute sagen: Wichtiger als das Alter ist, dass Kinder lernen, verantwortungsvoll mit dem Gerät umzugehen.\nSie empfehlen klare Regeln: feste Bildschirmzeiten, keine Handys beim Essen und nachts bleibt das Gerät außerhalb des Kinderzimmers. Eltern sollten außerdem mit ihren Kindern darüber sprechen, welche Apps sie benutzen und mit wem sie schreiben.\nVerbote allein helfen wenig – Kinder lernen am meisten durch das Vorbild der Eltern. Wer selbst beim Abendessen ständig auf das Handy schaut, kann vom Kind kaum etwas anderes verlangen.",
  options:["Die besten Handyspiele für Kinder","Kinder und Smartphones: Auf die Regeln kommt es an","Immer mehr Erwachsene ohne Handy"],
  correct:1,
  expl:"Im Text geht es um Regeln für Kinder und Smartphones. Spiele (a) werden nicht empfohlen, und um Erwachsene ohne Handy (c) geht es nicht."
},
{
  id:"t3s8", set:"Übungssatz 8",
  text:"Viele Menschen in Deutschland kaufen Wasser in Flaschen und tragen schwere Kisten nach Hause. Dabei kommt gutes Trinkwasser bei uns direkt aus dem Hahn: Leitungswasser wird streng kontrolliert und gehört zu den am besten geprüften Lebensmitteln in Deutschland.\nLeitungswasser ist außerdem sehr günstig: Ein Liter kostet weniger als einen Cent – Mineralwasser aus dem Supermarkt ist oft hundertmal teurer. Und wer Leitungswasser trinkt, schützt die Umwelt, denn es gibt keine Plastikflaschen und keine langen Transporte.\nWer sein Wasser lieber mit Kohlensäure trinkt, kann ein Sprudelgerät benutzen. Nur in sehr alten Häusern mit alten Rohren sollte man das Wasser vorher prüfen lassen.",
  options:["Mineralwasser – die große Vielfalt im Supermarkt","Leitungswasser: günstig, gut und umweltfreundlich","Warum man im Sommer mehr trinken sollte"],
  correct:1,
  expl:"Der Text lobt das Leitungswasser (kontrolliert, günstig, gut für die Umwelt). Es ist keine Werbung für Mineralwasser (a), und ums Trinken bei Hitze (c) geht es nicht."
},
{
  id:"t3s9", set:"Übungssatz 9 (aus Prüfungsberichten)",
  text:"Für viele Menschen in Deutschland ist das Internet zu einem täglichen Begleiter geworden. Ob beim Einkaufen, beim Kontakt mit Freunden oder in der Freizeit: Kaum eine andere Erfindung hat den Alltag in den letzten Jahren so stark verändert.\nBesonders in der Freizeit spielt das Internet eine große Rolle. Viele schauen abends Serien im Streaming-Dienst, hören Musik oder Podcasts, spielen online mit Freunden oder informieren sich über Hobbys und Reiseziele. Auch der Kontakt zur Familie im Ausland ist über Video-Anrufe viel einfacher geworden als früher.\nNatürlich gibt es auch kritische Stimmen: Manche Fachleute warnen davor, zu viel Zeit vor dem Bildschirm zu verbringen, statt sich draußen zu bewegen oder sich persönlich zu treffen. Trotzdem sagen viele Menschen, dass sie im Alltag kaum noch auf das Internet verzichten könnten.",
  options:["Warum das Internet in Deutschland zu langsam ist","Das Internet als ständiger Begleiter in der Freizeit","Immer mehr Menschen kündigen ihren Internetanschluss"],
  correct:1,
  expl:"Der Text beschreibt, wie sehr das Internet die Freizeit begleitet (Streaming, Kontakt, Hobbys). Von der Geschwindigkeit (a) ist nicht die Rede, und Kündigungen (c) werden nicht erwähnt."
},
],

teil4: [
{
  id:"t4s5", set:"Übungssatz 5",
  situation:"Sie feiern am Samstag Ihren Geburtstag in Ihrer Wohnung. Es kann bis ca. 23 Uhr etwas lauter werden. Schreiben Sie eine Nachricht an Ihre Nachbarn im Haus.",
  points:["Warum schreiben Sie?","Wann feiern Sie?","Bitte um Verständnis","laden Sie die Nachbarn ein oder geben Sie Ihre Telefonnummer an"],
  model:"Liebe Nachbarinnen und Nachbarn,\n\nich möchte Ihnen kurz Bescheid geben: Am Samstag feiere ich meinen Geburtstag in meiner Wohnung.\n\nWir feiern ab 18 Uhr, und es kann bis ungefähr 23 Uhr etwas lauter werden, weil wir Musik hören und auf dem Balkon sitzen.\n\nIch bitte schon jetzt um Ihr Verständnis – wir versuchen natürlich, nicht zu laut zu sein.\n\nWer Lust hat, ist herzlich eingeladen, auf ein Glas vorbeizukommen! Wenn es doch zu laut ist, rufen Sie mich einfach an: 0176 123 456 78.\n\nViele Grüße aus dem 3. Stock\nVorname Nachname"
},
{
  id:"t4s6", set:"Übungssatz 6",
  situation:"Sie möchten wieder Sport machen und interessieren sich für Volleyball. Ein Sportverein in Ihrer Nähe bietet ein kostenloses Probetraining an. Schreiben Sie an den Verein.",
  points:["Warum schreiben Sie?","Ihre Erfahrung mit diesem Sport","Fragen zu Zeiten und Kosten","Bitte um Antwort"],
  model:"Sehr geehrte Damen und Herren,\n\nich habe auf Ihrer Webseite gelesen, dass Sie ein kostenloses Probetraining im Volleyball anbieten. Dafür interessiere ich mich sehr.\n\nIn meiner Jugend habe ich einige Jahre Volleyball gespielt, aber in den letzten Jahren hatte ich leider wenig Zeit für Sport.\n\nKönnen Sie mir bitte sagen, wann die Erwachsenen trainieren und wie hoch der Mitgliedsbeitrag ist? Brauche ich für das Probetraining eine Anmeldung?\n\nÜber eine Antwort würde ich mich sehr freuen.\n\nMit freundlichen Grüßen\nVorname Nachname"
},
{
  id:"t4s7", set:"Übungssatz 7",
  situation:"Sie sind krank und können morgen nicht zur Arbeit kommen. Morgen um 14 Uhr haben Sie aber einen wichtigen Termin mit einer Kundin. Schreiben Sie eine Nachricht an Ihre Kollegin Frau Schneider.",
  points:["Warum schreiben Sie?","Was ist passiert?","Bitten Sie Ihre Kollegin, den Termin zu übernehmen","Bedanken Sie sich"],
  model:"Liebe Frau Schneider,\n\nich muss Ihnen leider eine unangenehme Nachricht schreiben.\n\nIch bin seit heute Morgen krank und liege mit Fieber im Bett. Der Arzt hat mich für drei Tage krankgeschrieben, deshalb kann ich morgen nicht ins Büro kommen.\n\nUm 14 Uhr habe ich aber einen wichtigen Termin mit Frau Weber von der Firma Nordlicht. Könnten Sie den Termin bitte für mich übernehmen? Alle Unterlagen liegen auf meinem Schreibtisch, und ich bin telefonisch erreichbar.\n\nVielen herzlichen Dank für Ihre Hilfe – ich revanchiere mich gern!\n\nViele Grüße\nVorname Nachname"
},
{
  id:"t4s8", set:"Übungssatz 8",
  situation:"In Ihrer Wohnung funktioniert seit drei Tagen die Heizung nicht. Es ist Winter und die Wohnung ist sehr kalt. Schreiben Sie an Ihre Hausverwaltung.",
  points:["Warum schreiben Sie?","Beschreiben Sie das Problem","Bitten Sie um eine schnelle Reparatur","Wann sind Sie zu Hause erreichbar?"],
  model:"Sehr geehrte Damen und Herren,\n\nich wohne in der Gartenstraße 12, 2. Stock links, und schreibe Ihnen wegen eines dringenden Problems.\n\nSeit drei Tagen funktioniert die Heizung in meiner Wohnung nicht mehr. Alle Heizkörper bleiben kalt, obwohl ich sie ganz aufgedreht habe. Da es draußen friert, ist die Wohnung inzwischen sehr kalt – das ist besonders für meine kleinen Kinder ein Problem.\n\nIch bitte Sie deshalb, so schnell wie möglich einen Handwerker zu schicken.\n\nSie erreichen mich am besten werktags ab 16 Uhr zu Hause oder jederzeit unter 0176 987 654 32.\n\nVielen Dank im Voraus.\n\nMit freundlichen Grüßen\nVorname Nachname"
},
{
  id:"t4s9", set:"Übungssatz 9 (aus Prüfungsberichten)",
  situation:"Sie arbeiten in einem Büro in Berlin. Ihr Arbeitskollege telefoniert immer sehr laut, und Sie hatten deshalb einen Streit mit ihm. Sie möchten, dass Ihre Chefin, Frau Kaiser, das Problem löst. Schreiben Sie eine E-Mail an Ihre Chefin.",
  points:["Grund / Problem mit dem Kollegen","Was Sie bereits unternommen haben","eine Aktion von Ihrer Chefin fordern","Bitte um schnelle Rückmeldung"],
  model:"Sehr geehrte Frau Kaiser,\n\nich schreibe Ihnen wegen eines Problems mit meinem Kollegen Herrn Weiß.\n\nHerr Weiß telefoniert fast jeden Tag sehr laut an seinem Schreibtisch, sodass ich mich kaum noch konzentrieren kann. Ich habe ihn schon mehrmals freundlich darauf angesprochen, aber leider hat sich nichts geändert. Deshalb hatten wir gestern auch einen Streit.\n\nKönnten Sie bitte mit Herrn Weiß sprechen oder eine andere Lösung finden, zum Beispiel einen ruhigen Telefonraum?\n\nIch würde mich über eine schnelle Rückmeldung von Ihnen freuen.\n\nMit freundlichen Grüßen\nVorname Nachname"
},
{
  id:"t4s10", set:"Übungssatz 10 (Bewerbung)",
  situation:"Sie haben eine Stellenanzeige für eine Ausbildung als Verkäuferin/Verkäufer in einem Supermarkt in Ihrer Nähe gesehen. Sie möchten sich bewerben. Schreiben Sie eine E-Mail an den Markt.",
  points:["Warum schreiben Sie?","Warum interessieren Sie sich für diese Ausbildung?","Ihre Erfahrungen/Stärken","Bitte um ein Vorstellungsgespräch"],
  model:"Sehr geehrte Damen und Herren,\n\nich habe Ihre Anzeige für einen Ausbildungsplatz als Verkäuferin gesehen und möchte mich hiermit bewerben.\n\nDer Beruf interessiert mich, weil ich gern mit Menschen zu tun habe und schon immer im Verkauf arbeiten wollte.\n\nIch bin freundlich, zuverlässig und habe bereits ein Praktikum in einem Geschäft gemacht. Außerdem lerne ich schnell und arbeite gern im Team.\n\nGern würde ich mich in einem persönlichen Gespräch vorstellen. Über eine Einladung würde ich mich sehr freuen.\n\nMit freundlichen Grüßen\nVorname Nachname"
},
{
  id:"t4s11", set:"Übungssatz 11 (Wohnungssuche)",
  situation:"Sie haben online eine Wohnungsanzeige gesehen, die Ihnen gefällt. Sie möchten die Wohnung gern besichtigen. Schreiben Sie eine Nachricht an den Vermieter.",
  points:["Warum schreiben Sie?","Warum passt die Wohnung zu Ihnen?","Fragen zur Wohnung (z. B. Nebenkosten, Einzugsdatum)","Bitte um einen Besichtigungstermin"],
  model:"Sehr geehrter Herr Fischer,\n\nich habe Ihre Anzeige für die Zweizimmerwohnung in der Rosenstraße gesehen und interessiere mich sehr dafür.\n\nDie Wohnung passt gut zu mir, weil ich in der Nähe arbeite und eine ruhige Wohnung in dieser Größe suche.\n\nKönnten Sie mir bitte sagen, wie hoch die Nebenkosten sind und ab wann die Wohnung frei ist?\n\nGern würde ich die Wohnung besichtigen. Hätten Sie in den nächsten Tagen Zeit für einen Termin?\n\nMit freundlichen Grüßen\nVorname Nachname"
},
{
  id:"t4s12", set:"Übungssatz 12 (Kündigung)",
  situation:"Sie sind seit einem Jahr Mitglied in einem Fitnessstudio. Weil Sie umziehen, möchten Sie Ihre Mitgliedschaft zum Ende des Vertragsjahres kündigen. Schreiben Sie eine Nachricht an das Fitnessstudio.",
  points:["Warum schreiben Sie?","Grund für die Kündigung","Zu welchem Datum möchten Sie kündigen?","Bitte um eine Kündigungsbestätigung"],
  model:"Sehr geehrte Damen und Herren,\n\nhiermit kündige ich meine Mitgliedschaft in Ihrem Fitnessstudio.\n\nIch ziehe Ende des Monats aus beruflichen Gründen in eine andere Stadt und kann Ihr Studio deshalb nicht mehr nutzen.\n\nBitte kündigen Sie meinen Vertrag zum nächstmöglichen Termin, spätestens zum Ende der Vertragslaufzeit.\n\nSchicken Sie mir bitte eine schriftliche Bestätigung der Kündigung.\n\nMit freundlichen Grüßen\nVorname Nachname"
},
{
  id:"t4s13", set:"Übungssatz 13 (Einladung)",
  situation:"Sie machen am Samstag ein kleines Grillfest im Garten/auf dem Balkon. Sie möchten einen guten Freund/eine gute Freundin einladen. Schreiben Sie eine Nachricht.",
  points:["Warum schreiben Sie?","Wann und wo findet das Fest statt?","Was soll die Person mitbringen?","Bitte um Rückmeldung, ob sie kommt"],
  model:"Liebe Sarah,\n\nam Samstag mache ich ein kleines Grillfest und möchte dich herzlich dazu einladen!\n\nWir treffen uns ab 17 Uhr bei mir im Garten, in der Ahornstraße 4.\n\nFür Getränke und Fleisch ist gesorgt – wenn du magst, bring einfach einen Salat oder einen Nachtisch mit.\n\nSag mir bitte kurz Bescheid, ob du kommen kannst. Ich würde mich sehr freuen!\n\nLiebe Grüße\nVorname"
},
],

teil5: [
{q:"Was haben Sie am letzten Wochenende gemacht?", a:"Am Samstag habe ich eingekauft und die Wohnung geputzt. Am Sonntag waren wir mit den Kindern im Park, und abends haben Freunde bei uns gegessen."},
{q:"Was essen Sie gern? Kochen Sie selbst?", a:"Ich koche sehr gern, am liebsten Gerichte aus meiner Heimat. Aber ich habe auch deutsche Rezepte gelernt – meine Familie mag zum Beispiel Kartoffelsuppe sehr gern."},
{q:"Treiben Sie Sport?", a:"Ja, ich fahre viel Fahrrad und gehe manchmal joggen. Ich möchte auch in einen Verein eintreten, weil man dort neue Leute kennenlernt."},
{q:"Wie sind Ihre Nachbarn? Haben Sie Kontakt?", a:"Wir haben ein gutes Verhältnis. Mit der älteren Dame von nebenan spreche ich oft im Treppenhaus, und manchmal gieße ich ihre Blumen, wenn sie verreist ist."},
{q:"Was war am Anfang in Deutschland schwierig für Sie?", a:"Am schwierigsten war die Sprache, besonders am Telefon und bei Behörden. Auch die vielen Briefe und Formulare waren neu für mich. Mit der Zeit ist es viel leichter geworden."},
{q:"Welche Unterschiede gibt es zwischen Berlin und Ihrer Heimatstadt?", a:"Berlin ist viel größer und die öffentlichen Verkehrsmittel fahren die ganze Nacht. In meiner Heimatstadt ist das Leben langsamer, und die Familie wohnt näher zusammen. Beides hat Vorteile."},
{q:"Welche deutschen Feste oder Traditionen kennen Sie?", a:"Ich kenne Weihnachten mit den Weihnachtsmärkten, Ostern und Silvester mit dem Feuerwerk. Mit meinen Kindern bastle ich außerdem jedes Jahr eine Schultüte und eine Laterne für den Sankt-Martins-Umzug."},
{q:"Wie sieht ein normaler Tag bei Ihnen aus?", a:"Ich stehe um halb sieben auf und bringe zuerst die Kinder zur Schule. Danach arbeite ich bis 17 Uhr. Abends kochen wir zusammen, und danach lerne ich oft noch etwas Deutsch."},
],

/* Diese 3 Themen wurden in echten Prüfungsberichten genannt (Kinder beim Fußball,
   volle U-Bahn, Ärger in einer Besprechung). Da uns keine echten Fotos dafür
   vorliegen, sind es einfache Illustrationen statt echter Fotos - zum Beschreiben
   trotzdem gut geeignet. */
teil6: [
{
  img:"foto4.svg",
  title:"Foto 4: Kinder beim Fußballspielen",
  hints:["Mehrere Kinder spielen Fußball auf einer Wiese im Park","Zwei Tore stehen an den Enden des Spielfelds","Ein Kind rennt gerade zum Ball","Im Hintergrund: Bäume, eine Bank, schönes Wetter"],
  model:"Auf dem Bild sehe ich mehrere Kinder, die zusammen im Park Fußball spielen. Sie tragen verschiedenfarbige Trikots – rot, blau, gelb und grün – und rennen alle in Richtung des Balls. An beiden Seiten des Rasens stehen kleine Tore. Es ist offensichtlich ein schöner, sonniger Tag, denn im Hintergrund sieht man Bäume und blauen Himmel. Auf einer Bank könnte gleich jemand zuschauen.\n\nIch finde es schön, dass Kinder draußen aktiv sind, statt nur vor dem Bildschirm zu sitzen. Als ich selbst ein Kind war, habe ich auch fast jeden Nachmittag mit Freunden im Park Fußball gespielt. Sport im Team lehrt außerdem, miteinander zu spielen und zusammenzuhalten."
},
{
  img:"foto5.svg",
  title:"Foto 5: Eine volle U-Bahn",
  hints:["Viele Fahrgäste stehen dicht gedrängt in der Bahn","Alle halten sich an gelben Haltestangen fest","Zwei Personen sitzen auf den roten Sitzbänken","Draußen ist es dunkel – die Bahn fährt durch einen Tunnel"],
  model:"Auf dem Bild sehe ich das Innere einer U-Bahn, die sehr voll ist. Viele Fahrgäste stehen eng zusammen und halten sich an den gelben Haltestangen fest, weil es keine freien Sitzplätze mehr gibt. Nur zwei Personen sitzen auf den roten Bänken. Durch die Fenster sieht man, dass die Bahn gerade durch einen dunklen Tunnel fährt, es ist also wahrscheinlich mitten in der Stadt.\n\nDas erinnert mich an meine tägliche Fahrt zur Arbeit – auch bei uns ist die Bahn morgens und nachmittags oft so voll. Ich finde öffentliche Verkehrsmittel trotzdem praktisch, weil man schnell und ohne Stau ans Ziel kommt, auch wenn es zu den Stoßzeiten manchmal unangenehm eng ist."
},
{
  img:"foto6.svg",
  title:"Foto 6: Ärger in einer Besprechung",
  hints:["Ein Mann steht auf und regt sich sichtlich auf","Zwei Kollegen sitzen am Tisch und schauen überrascht","Auf dem Tisch liegen ein Laptop und Papiere","Es sieht nach einer angespannten Situation im Büro aus"],
  model:"Auf dem Bild sehe ich eine Besprechung in einem Büro. Ein Mann ist aufgestanden und regt sich offensichtlich über etwas auf – er hebt die Arme und wirkt sehr aufgebracht. Zwei Kolleginnen und Kollegen sitzen noch am Tisch und schauen überrascht. Auf dem Tisch liegen ein Laptop und ein paar Papiere, vielleicht ging es um ein Projekt oder eine schwierige Entscheidung.\n\nSolche angespannten Situationen kenne ich auch aus meinem Berufsleben – manchmal ist man einfach im Stress oder unter Druck. Ich finde es wichtig, in solchen Momenten ruhig zu bleiben und das Gespräch später sachlich fortzusetzen, statt die Situation noch schlimmer zu machen."
},
],

teil7: [
{
  set:"Übungssatz 5",
  situation:"Ihr Kind ist 10 Jahre alt und wünscht sich ein eigenes Smartphone. Alle Freunde in der Klasse haben schon eins. Sie überlegen mit Ihrer Familie, ob Sie ein Handy kaufen sollen.",
  pro:["Das Kind ist unterwegs erreichbar – das ist sicherer.","Es kann für die Schule im Internet recherchieren.","Das Kind bleibt mit den Freunden in Kontakt.","Es lernt früh, mit Technik umzugehen."],
  contra:["Das Kind verbringt vielleicht zu viel Zeit am Bildschirm.","Im Internet gibt es auch gefährliche Inhalte.","Ein Smartphone ist teuer und geht schnell kaputt.","Streit über Handyzeiten ist vorprogrammiert."]
},
{
  set:"Übungssatz 6",
  situation:"Ihre Firma bietet Ihnen eine Weiterbildung an: zwei Abende pro Woche, ein Jahr lang. Danach haben Sie bessere Chancen auf eine höhere Position. Sie überlegen, ob Sie teilnehmen sollen.",
  pro:["bessere Karrierechancen und vielleicht mehr Gehalt","Man lernt Neues und bleibt beruflich fit.","Das Zertifikat hilft auch bei anderen Arbeitgebern.","Die Firma bezahlt die Weiterbildung."],
  contra:["weniger Zeit für Familie und Freunde","Nach der Arbeit ist man oft müde.","Ein Jahr ist eine lange Verpflichtung.","Der Erfolg ist nicht garantiert."]
},
{
  set:"Übungssatz 7",
  situation:"Sie kaufen Ihre Lebensmittel bisher im Supermarkt. Eine Freundin empfiehlt Ihnen den Wochenmarkt in Ihrem Kiez. Sie überlegen, wo Sie in Zukunft einkaufen.",
  pro:["Auf dem Markt sind Obst und Gemüse frischer.","Man unterstützt Bauern aus der Region.","Man kann die Händler etwas fragen und probieren.","weniger Plastikverpackung – gut für die Umwelt"],
  contra:["Der Markt ist oft teurer als der Supermarkt.","Der Markt ist nur an bestimmten Tagen geöffnet.","Im Supermarkt bekommt man alles an einem Ort.","Bei schlechtem Wetter ist der Einkauf unangenehm."]
},
{
  set:"Übungssatz 8",
  situation:"Ihnen wird ein Nebenjob am Wochenende angeboten. Sie könnten damit gut Geld dazuverdienen, hätten aber weniger Freizeit. Sie überlegen, ob Sie den Job annehmen sollen.",
  pro:["Man verdient zusätzliches Geld, z. B. für den Urlaub.","Man sammelt neue Berufserfahrung.","Man lernt neue Menschen kennen.","Das zusätzliche Einkommen gibt Sicherheit."],
  contra:["weniger Zeit für Familie, Freunde und Hobbys","Ohne Pausen wird man schneller krank.","Die Hauptarbeit kann unter der Müdigkeit leiden.","Vielleicht muss man Steuern nachzahlen."]
},
{
  set:"Übungssatz 9 (aus Prüfungsberichten)",
  situation:"Sie müssen aus beruflichen Gründen in eine andere Stadt ziehen. Sie haben noch keine eigene Wohnung gefunden und könnten vorübergehend bei Ihrer 75-jährigen Tante wohnen.",
  pro:["Es ist günstiger als eine eigene Wohnung.","Man ist in der neuen Stadt nicht ganz allein.","Die Tante freut sich sicher über Gesellschaft.","Man kann sich in Ruhe eine eigene Wohnung suchen."],
  contra:["Man hat wenig Privatsphäre.","Man hat andere Lebensgewohnheiten als die Tante.","Es kann die Beziehung zur Tante belasten.","Man kann nicht einfach Freunde spontan einladen."]
},
{
  set:"Übungssatz 10 (Urlaub)",
  situation:"Sie planen Ihren nächsten Urlaub. Sie überlegen, ob Sie eine weite Reise ins Ausland machen oder lieber zu Hause bleiben und Ausflüge in die nähere Umgebung machen (‚Balkonien‘).",
  pro:["Eine Fernreise zeigt neue Länder und Kulturen.","Man erholt sich gut, wenn man wirklich weit weg ist.","Zu Hause bleiben spart viel Geld.","In der Nähe zu bleiben ist entspannter, ohne langes Reisen."],
  contra:["Fernreisen sind teuer und anstrengend (langer Flug).","Fliegen ist nicht gut für die Umwelt.","Zu Hause hat man vielleicht weniger richtige Erholung.","Man sieht immer nur die gleiche Umgebung."]
},
{
  set:"Übungssatz 11 (Arztbesuch)",
  situation:"Ihre Arztpraxis bietet jetzt an, Termine online zu buchen, statt anzurufen. Sie überlegen, ob Sie das nutzen möchten oder lieber weiter anrufen.",
  pro:["Online kann man auch nachts oder am Wochenende einen Termin buchen.","Man muss nicht in der Warteschleife am Telefon warten.","Man sieht sofort, welche Termine frei sind.","Man kann den Termin bequem verschieben."],
  contra:["Nicht jeder kennt sich gut mit Online-Formularen aus.","Bei dringenden Problemen ist ein Anruf oft schneller.","Man kann der Arzthelferin nicht direkt Fragen stellen.","Man braucht Internet und ein Gerät dafür."]
},
],
}
