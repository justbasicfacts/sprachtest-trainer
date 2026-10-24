/* Gezieltes Training: Übungen zu einzelnen Fähigkeiten, die häufig als Schwäche in
   der KI-Auswertung (Prüfungssimulation, Lernplan) auftauchen. Unabhängig vom
   Prüfungsformat - jede "Fähigkeit" hat ihre eigenen, wiederholbaren Übungen. */
import type { TrainingSkill } from './types'

export const TRAINING_SKILLS: TrainingSkill[] = [
  {
    id: 'foto-detail',
    icon: '📷',
    title: 'Fotos detailliert beschreiben',
    focus:
      'Du nennst oft nur wenige Details und bildest zu kurze Sätze. Übe, Personen, Ort, eine Vermutung und ' +
      'einen eigenen Bezug in ganzen Sätzen zu beschreiben.',
    mode: 'speak',
    criteria: [
      'Nutzt einen Satzanfang wie „Auf dem Foto sehe ich …“',
      'Beschreibt auch Details im Hintergrund („im Hintergrund erkenne ich …“)',
      'Äußert eine Vermutung mit „vielleicht“ oder „wahrscheinlich“',
      'Stellt einen eigenen Bezug her („das erinnert mich an …“)',
    ],
    exercises: [
      {
        id: 'foto-1',
        instruction: 'Beschreibe das Foto in ganzen Sätzen. Nutze die Satzanfänge als Hilfe.',
        prompt: 'Stell dir vor, du siehst folgendes Foto: Eine Familie picknickt auf einer Wiese im Park, Kinder spielen mit einem Ball.',
        hint: '„Auf dem Foto sehe ich …“, „im Hintergrund erkenne ich …“, „außerdem ist mir aufgefallen, dass …“',
        sampleAnswer:
          'Auf dem Foto sehe ich eine Familie, die auf einer Wiese im Park picknickt. Im Hintergrund erkenne ' +
          'ich große Bäume und andere Leute, die spazieren gehen. Außerdem ist mir aufgefallen, dass die ' +
          'Kinder mit einem Ball spielen. Vielleicht ist es Sommer, weil alle kurze Kleidung tragen. Das ' +
          'erinnert mich an Picknicks mit meiner eigenen Familie am Wochenende.',
      },
      {
        id: 'foto-2',
        instruction: 'Beschreibe das Foto in ganzen Sätzen. Nutze die Satzanfänge als Hilfe.',
        prompt: 'Stell dir vor, du siehst folgendes Foto: Eine volle U-Bahn, Fahrgäste stehen dicht gedrängt und halten sich an gelben Griffen fest.',
        hint: '„Auf dem Foto sehe ich …“, „die Personen …“, „vielleicht ist das Foto zu … Uhrzeit entstanden, weil …“',
        sampleAnswer:
          'Auf dem Foto sehe ich eine volle U-Bahn. Die Personen stehen dicht gedrängt und halten sich an den ' +
          'gelben Griffen fest. Manche schauen auf ihr Handy, andere wirken müde. Vielleicht ist das Foto am ' +
          'frühen Morgen entstanden, weil viele Leute auf dem Weg zur Arbeit sind. Das kenne ich gut, weil ich ' +
          'selbst oft mit der U-Bahn zur Arbeit fahre.',
      },
      {
        id: 'foto-3',
        instruction: 'Beschreibe das Foto in ganzen Sätzen. Nutze die Satzanfänge als Hilfe.',
        prompt: 'Stell dir vor, du siehst folgendes Foto: Kinder spielen Fußball auf einem Rasenplatz, ein Kind läuft dem Ball nach.',
        hint: '„Auf dem Foto sehe ich …“, „ein Kind …“, „ich denke, dass …“, „das erinnert mich an …“',
        sampleAnswer:
          'Auf dem Foto sehe ich mehrere Kinder, die auf einem Rasenplatz Fußball spielen. Ein Kind läuft dem ' +
          'Ball nach, die anderen stehen etwas weiter im Hintergrund. Ich denke, dass die Kinder in einer ' +
          'Fußball-AG oder im Verein trainieren. Das erinnert mich an meine eigene Kindheit, als ich auch oft ' +
          'draußen mit Freunden gespielt habe.',
      },
    ],
  },
  {
    id: 'pro-contra',
    icon: '⚖️',
    title: 'Vor- und Nachteile strukturiert abwägen',
    focus:
      'Du beleuchtest oft nur eine Seite und verbindest die Sätze zu wenig. Übe, beide Seiten zu nennen und mit ' +
      'Konnektoren wie „zwar … aber“ oder „einerseits … andererseits“ zu verbinden.',
    mode: 'speak',
    criteria: [
      'Nennt mindestens einen Vorteil UND einen Nachteil',
      'Verbindet die Gegenüberstellung mit „zwar … aber“ oder „einerseits … andererseits“',
      'Nimmt am Ende selbst Stellung mit einer Begründung',
    ],
    exercises: [
      {
        id: 'pc-1',
        instruction: 'Wäge Vor- und Nachteile ab und nimm am Ende deine eigene Position ein.',
        prompt: 'Thema: Homeoffice statt Arbeit im Büro.',
        hint: '„Zwar ist Homeoffice praktisch, weil …, aber …“ / „Einerseits …, andererseits …“',
        sampleAnswer:
          'Zwar ist Homeoffice praktisch, weil der Weg zur Arbeit entfällt, aber die Kommunikation mit den ' +
          'Kollegen ist schwieriger. Einerseits kann man sich die Zeit freier einteilen, andererseits fehlt oft ' +
          'der direkte Austausch im Team. Für mich überwiegen trotzdem die Vorteile, weil ich konzentrierter ' +
          'arbeiten kann.',
      },
      {
        id: 'pc-2',
        instruction: 'Wäge Vor- und Nachteile ab und nimm am Ende deine eigene Position ein.',
        prompt: 'Thema: Mit dem Auto fahren statt öffentliche Verkehrsmittel nutzen.',
        hint: '„Zwar …, aber …“ / „Ein Vorteil ist …, ein Nachteil ist jedoch …“',
        sampleAnswer:
          'Zwar ist man mit dem Auto flexibler, aber man steht oft im Stau und braucht einen Parkplatz. Ein ' +
          'Vorteil der öffentlichen Verkehrsmittel ist, dass sie günstiger und umweltfreundlicher sind, ein ' +
          'Nachteil ist jedoch, dass sie manchmal unpünktlich sind. Für mich überwiegen die Vorteile der Bahn, ' +
          'weil ich dabei entspannen oder lesen kann.',
      },
      {
        id: 'pc-3',
        instruction: 'Wäge Vor- und Nachteile ab und nimm am Ende deine eigene Position ein.',
        prompt: 'Thema: In der Stadt leben statt auf dem Land.',
        hint: '„Einerseits …, andererseits …“ / „Deshalb würde ich sagen, dass …“',
        sampleAnswer:
          'Einerseits gibt es in der Stadt mehr Arbeitsplätze und ein größeres Freizeitangebot, andererseits ' +
          'sind Wohnungen teurer und es ist lauter. Auf dem Land ist es dagegen ruhiger, aber die Wege zur ' +
          'Arbeit sind oft länger. Deshalb würde ich sagen, dass die Stadt für mich besser passt, weil mir die ' +
          'kurzen Wege wichtig sind.',
      },
    ],
  },
  {
    id: 'praepositionen',
    icon: '📐',
    title: 'Präpositionen richtig verwenden',
    focus:
      'Es gibt noch Fehler bei Präpositionen (z. B. mit, nach, zu + Dativ). Übe gezielt, die richtige Präposition ' +
      'und den richtigen Fall zu wählen.',
    mode: 'write',
    criteria: [
      'Die richtige Präposition ist eingesetzt',
      'Der Fall nach der Präposition stimmt (z. B. Dativ nach „mit“)',
      'Der Satz ist insgesamt grammatisch korrekt',
    ],
    exercises: [
      {
        id: 'prep-1',
        instruction: 'Ergänze die Lücken mit der passenden Präposition und schreibe den ganzen Satz.',
        prompt: 'Ich fahre ___ dem Bus ___ Arbeit.',
        hint: 'mit + Dativ, zu + Dativ',
        sampleAnswer: 'Ich fahre mit dem Bus zur Arbeit.',
      },
      {
        id: 'prep-2',
        instruction: 'Ergänze die Lücken mit der passenden Präposition und schreibe den ganzen Satz.',
        prompt: 'Er wohnt schon ___ drei Jahren ___ Berlin.',
        hint: 'seit + Dativ, in + Dativ',
        sampleAnswer: 'Er wohnt schon seit drei Jahren in Berlin.',
      },
      {
        id: 'prep-3',
        instruction: 'Ergänze die Lücke mit der passenden Präposition und schreibe den ganzen Satz.',
        prompt: 'Sie geht jeden Abend ___ dem Essen spazieren.',
        hint: 'nach + Dativ',
        sampleAnswer: 'Sie geht jeden Abend nach dem Essen spazieren.',
      },
      {
        id: 'prep-4',
        instruction: 'Ergänze die Lücke. Achte auf den Fall: Wohin? oder Wo?',
        prompt: 'Ich hänge das Bild ___ die Wand.',
        hint: 'an + Akkusativ (Wohin?)',
        sampleAnswer: 'Ich hänge das Bild an die Wand.',
      },
      {
        id: 'prep-5',
        instruction: 'Ergänze die Lücke. Achte auf den Fall: Wohin? oder Wo?',
        prompt: 'Das Bild hängt jetzt ___ der Wand.',
        hint: 'an + Dativ (Wo?)',
        sampleAnswer: 'Das Bild hängt jetzt an der Wand.',
      },
      {
        id: 'prep-6',
        instruction: 'Ergänze die Lücke und schreibe den ganzen Satz.',
        prompt: 'Ich freue mich schon ___ das Wochenende.',
        hint: 'sich freuen auf + Akkusativ',
        sampleAnswer: 'Ich freue mich schon auf das Wochenende.',
      },
      {
        id: 'prep-7',
        instruction: 'Ergänze die Lücke und schreibe den ganzen Satz.',
        prompt: 'Sie interessiert sich ___ Politik und Geschichte.',
        hint: 'sich interessieren für + Akkusativ',
        sampleAnswer: 'Sie interessiert sich für Politik und Geschichte.',
      },
      {
        id: 'prep-8',
        instruction: 'Ergänze die Lücke und schreibe den ganzen Satz.',
        prompt: '___ dem Frühstück räume ich die Küche auf.',
        hint: 'nach + Dativ, zeitlich gemeint',
        sampleAnswer: 'Nach dem Frühstück räume ich die Küche auf.',
      },
      {
        id: 'prep-9',
        instruction: 'Ergänze die Lücke und schreibe den ganzen Satz.',
        prompt: 'Ich warte seit zwanzig Minuten ___ den Bus.',
        hint: 'warten auf + Akkusativ',
        sampleAnswer: 'Ich warte seit zwanzig Minuten auf den Bus.',
      },
      {
        id: 'prep-10',
        instruction: 'Ergänze die Lücke und schreibe den ganzen Satz.',
        prompt: 'Wegen ___ Regens bleiben wir heute zu Hause.',
        hint: 'wegen + Genitiv: des Regens',
        sampleAnswer: 'Wegen des Regens bleiben wir heute zu Hause.',
      },
      {
        id: 'prep-11',
        instruction: 'Ergänze die Lücke. Verschmolzene Formen wie zum oder zur sind erlaubt.',
        prompt: 'Ich gehe morgen ___ Arzt, weil ich Fieber habe.',
        hint: 'zu + Dativ: zu dem = zum',
        sampleAnswer: 'Ich gehe morgen zum Arzt, weil ich Fieber habe.',
      },
      {
        id: 'prep-12',
        instruction: 'Ergänze die Lücke und schreibe den ganzen Satz.',
        prompt: 'Am Wochenende fahren wir ___ meinen Eltern.',
        hint: 'zu + Dativ Plural: zu meinen Eltern',
        sampleAnswer: 'Am Wochenende fahren wir zu meinen Eltern.',
      },
      {
        id: 'prep-13',
        instruction: 'Ergänze die Lücke und schreibe den ganzen Satz.',
        prompt: 'Ich habe den Termin ___ Montag um neun Uhr.',
        hint: 'an + Dativ bei Tagen: an dem = am',
        sampleAnswer: 'Ich habe den Termin am Montag um neun Uhr.',
      },
    ],
  },
  {
    id: 'nebensaetze',
    icon: '🧩',
    title: 'Nebensätze bilden (weil, dass, damit)',
    focus:
      'Die Wortstellung in Nebensätzen ist noch unsicher - das Verb muss am Ende stehen. Übe, zwei Sätze zu ' +
      'einem Nebensatz zu verbinden.',
    mode: 'write',
    criteria: [
      'Die zwei Sätze sind mit dem passenden Konnektor verbunden',
      'Das Verb steht am Ende des Nebensatzes',
      'Der Satz ist insgesamt grammatisch korrekt',
    ],
    exercises: [
      {
        id: 'neben-1',
        instruction: 'Verbinde die zwei Sätze mit „weil“. Achte auf die Wortstellung (Verb am Ende).',
        prompt: 'Ich fahre mit dem Zug. Der Weg zur Arbeit ist lang.',
        hint: 'Struktur: „Weil …, …“ - im weil-Satz steht das Verb ganz am Ende.',
        sampleAnswer: 'Weil der Weg zur Arbeit lang ist, fahre ich mit dem Zug.',
      },
      {
        id: 'neben-2',
        instruction: 'Verbinde die zwei Sätze mit „dass“.',
        prompt: 'Ich glaube etwas. Er kommt morgen nicht.',
        hint: 'Struktur: „Ich glaube, dass …“ - im dass-Satz steht das Verb ganz am Ende.',
        sampleAnswer: 'Ich glaube, dass er morgen nicht kommt.',
      },
      {
        id: 'neben-3',
        instruction: 'Verbinde die zwei Sätze mit „damit“.',
        prompt: 'Ich lerne jeden Tag Deutsch. Ich bestehe die Prüfung.',
        hint: 'Struktur: „…, damit …“ - im damit-Satz steht das Verb ganz am Ende.',
        sampleAnswer: 'Ich lerne jeden Tag Deutsch, damit ich die Prüfung bestehe.',
      },
    ],
  },
  {
    id: 'konnektoren',
    icon: '🔗',
    title: 'Sätze mit Konnektoren verbinden',
    focus:
      'Deine Sätze wirken noch unverbunden. Übe Konnektoren wie „deshalb“, „trotzdem“, „außerdem“ und „obwohl“, ' +
      'um Gedanken flüssiger auszudrücken.',
    mode: 'write',
    criteria: [
      'Die zwei Sätze sind mit dem passenden Konnektor verbunden',
      'Die Wortstellung nach dem Konnektor stimmt',
      'Der Satz ist insgesamt grammatisch korrekt',
    ],
    exercises: [
      {
        id: 'konn-1',
        instruction: 'Verbinde die zwei Sätze mit „deshalb“.',
        prompt: 'Es regnet stark. Wir bleiben heute zu Hause.',
        hint: 'Struktur: „…, deshalb + Verb + Subjekt …“ - nach „deshalb“ kommt zuerst das Verb.',
        sampleAnswer: 'Es regnet stark, deshalb bleiben wir heute zu Hause.',
      },
      {
        id: 'konn-2',
        instruction: 'Verbinde die zwei Sätze mit „obwohl“.',
        prompt: 'Er ist krank. Er geht trotzdem zur Arbeit.',
        hint: 'Struktur: „Obwohl …, …“ - im obwohl-Satz steht das Verb ganz am Ende.',
        sampleAnswer: 'Obwohl er krank ist, geht er zur Arbeit.',
      },
      {
        id: 'konn-3',
        instruction: 'Verbinde die zwei Sätze mit „außerdem“.',
        prompt: 'Die Wohnung ist günstig. Sie liegt zentral.',
        hint: 'Struktur: „…, außerdem + Verb + Subjekt …“ - nach „außerdem“ kommt zuerst das Verb.',
        sampleAnswer: 'Die Wohnung ist günstig, außerdem liegt sie zentral.',
      },
    ],
  },
  {
    id: 'zeitformen',
    icon: '⏳',
    title: 'Zeitformen: Perfekt, Präteritum, Futur',
    focus:
      'In Briefen und Gesprächen brauchst du fast immer das Perfekt. Übe, ob „haben“ oder „sein“ gehört, wie ' +
      'das Partizip II aussieht, und wo es im Satz steht - dazu Präteritum und Futur als Kontrast.',
    mode: 'write',
    criteria: [
      'Das richtige Hilfsverb steht da (haben oder sein)',
      'Das Partizip II ist korrekt: ge- bei trennbaren Verben zwischen Vorsilbe und Verb, kein ge- bei untrennbaren',
      'Verbklammer: Hilfsverb auf Position 2, Partizip oder Infinitiv am Satzende',
      'Präteritum und Futur I sind ebenfalls richtig gebildet',
    ],
    exercises: [
      {
        id: 'zeit-1',
        instruction: 'Setze den Satz ins Perfekt.',
        prompt: 'Ich gehe heute früh ins Bett.',
        hint: 'Verb der Bewegung, also Perfekt mit „sein“: ich bin … gegangen.',
        sampleAnswer: 'Ich bin heute früh ins Bett gegangen.',
      },
      {
        id: 'zeit-2',
        instruction: 'Setze den Satz ins Perfekt.',
        prompt: 'Er kauft im Supermarkt ein.',
        hint: '„einkaufen“ ist trennbar: Das ge- steht zwischen Vorsilbe und Verb, also „eingekauft“.',
        sampleAnswer: 'Er hat im Supermarkt eingekauft.',
      },
      {
        id: 'zeit-3',
        instruction: 'Setze den Satz ins Perfekt.',
        prompt: 'Wir besuchen am Wochenende meine Eltern.',
        hint: '„besuchen“ ist untrennbar, also kein ge-: besucht.',
        sampleAnswer: 'Wir haben am Wochenende meine Eltern besucht.',
      },
      {
        id: 'zeit-4',
        instruction: 'Setze den Satz ins Perfekt.',
        prompt: 'Sie versteht die Grammatik jetzt.',
        hint: '„verstehen“ ist untrennbar, also kein ge-: verstanden.',
        sampleAnswer: 'Sie hat die Grammatik jetzt verstanden.',
      },
      {
        id: 'zeit-5',
        instruction: 'Setze den Satz ins Perfekt.',
        prompt: 'Die Kinder laufen in den Garten.',
        hint: '„laufen“ beschreibt eine Bewegung von A nach B, also Perfekt mit „sein“.',
        sampleAnswer: 'Die Kinder sind in den Garten gelaufen.',
      },
      {
        id: 'zeit-6',
        instruction: 'Setze den Satz ins Präteritum.',
        prompt: 'Ich muss heute länger arbeiten.',
        hint: 'Modalverben stehen in der Vergangenheit im Präteritum: müssen → musste, kein Perfekt.',
        sampleAnswer: 'Ich musste heute länger arbeiten.',
      },
      {
        id: 'zeit-7',
        instruction: 'Setze den Satz ins Präteritum.',
        prompt: 'Ich habe leider keine Zeit.',
        hint: '„haben“ im Präteritum: ich hatte, du hattest, er hatte.',
        sampleAnswer: 'Ich hatte leider keine Zeit.',
      },
      {
        id: 'zeit-8',
        instruction: 'Setze den Satz ins Futur I.',
        prompt: 'Ich rufe dich morgen an.',
        hint: 'Futur I: werden + Infinitiv ganz am Ende. „anrufen“ bleibt zusammen.',
        sampleAnswer: 'Ich werde dich morgen anrufen.',
      },
      {
        id: 'zeit-9',
        instruction: 'Setze den Satz ins Perfekt.',
        prompt: 'Frau Müller fährt mit dem Fahrrad zur Arbeit.',
        hint: '„fahren“ mit einem Fahrzeug: Perfekt mit „sein“, Partizip „gefahren“.',
        sampleAnswer: 'Frau Müller ist mit dem Fahrrad zur Arbeit gefahren.',
      },
    ],
  },
  {
    id: 'adjektivendungen',
    icon: '🎨',
    title: 'Adjektivendungen (der/die/das + Adjektiv)',
    focus:
      'Die Endung des Adjektivs hängt von Artikel, Genus und Kasus ab - und genau dort passieren die meisten ' +
      'Fehler. Übe die häufigsten Muster mit bestimmtem und unbestimmtem Artikel.',
    mode: 'write',
    criteria: [
      'Die Endung passt zum Artikel (der/die/das, ein/eine, dem/den)',
      'Kasus und Genus sind richtig erkannt',
      'Numerus stimmt (Singular oder Plural)',
      'Der Satz ist insgesamt grammatisch korrekt',
    ],
    exercises: [
      {
        id: 'adj-1',
        instruction: 'Setze die richtige Adjektivendung ein und schreibe den ganzen Satz.',
        prompt: 'Ich wohne in ein___ klein___ Wohnung am Stadtrand.',
        hint: '„in“ + Dativ (Wo?), feminin nach „ein“: einer kleinen Wohnung.',
        sampleAnswer: 'Ich wohne in einer kleinen Wohnung am Stadtrand.',
      },
      {
        id: 'adj-2',
        instruction: 'Setze die richtige Adjektivendung ein und schreibe den ganzen Satz.',
        prompt: 'Das ist ein___ interessant___ Buch über die deutsche Geschichte.',
        hint: 'Nominativ Neutrum nach „ein“: ein interessantes Buch.',
        sampleAnswer: 'Das ist ein interessantes Buch über die deutsche Geschichte.',
      },
      {
        id: 'adj-3',
        instruction: 'Setze die richtige Adjektivendung ein und schreibe den ganzen Satz.',
        prompt: 'Die neu___ Kollegin kommt aus Polen.',
        hint: 'Nominativ Feminin nach „die“: die neue Kollegin.',
        sampleAnswer: 'Die neue Kollegin kommt aus Polen.',
      },
      {
        id: 'adj-4',
        instruction: 'Setze die richtige Adjektivendung ein und schreibe den ganzen Satz.',
        prompt: 'Ich habe gestern den alt___ Nachbarn getroffen.',
        hint: 'Akkusativ Maskulin nach „den“: den alten Nachbarn.',
        sampleAnswer: 'Ich habe gestern den alten Nachbarn getroffen.',
      },
      {
        id: 'adj-5',
        instruction: 'Setze die richtige Adjektivendung ein und schreibe den ganzen Satz.',
        prompt: 'Mit dem neu___ Fahrrad fahre ich jeden Morgen zur Arbeit.',
        hint: 'Dativ Neutrum nach „dem“: dem neuen Fahrrad.',
        sampleAnswer: 'Mit dem neuen Fahrrad fahre ich jeden Morgen zur Arbeit.',
      },
      {
        id: 'adj-6',
        instruction: 'Setze die richtige Adjektivendung ein und schreibe den ganzen Satz.',
        prompt: 'Wir suchen eine günstig___ Wohnung mit drei Zimmern.',
        hint: 'Akkusativ Feminin nach „eine“: eine günstige Wohnung.',
        sampleAnswer: 'Wir suchen eine günstige Wohnung mit drei Zimmern.',
      },
      {
        id: 'adj-7',
        instruction: 'Setze die richtige Adjektivendung ein und schreibe den ganzen Satz.',
        prompt: 'Die klein___ Kinder spielen im Hof.',
        hint: 'Nominativ Plural nach „die“: die kleinen Kinder.',
        sampleAnswer: 'Die kleinen Kinder spielen im Hof.',
      },
    ],
  },
  {
    id: 'modalverben',
    icon: '🔧',
    title: 'Modalverben: müssen, dürfen, sollen, können',
    focus:
      'Modalverben ändern die Bedeutung eines Satzes stark: Pflicht, Erlaubnis, Verbot, Rat oder Fähigkeit. ' +
      'Übe, das passende Verb zu wählen, es richtig zu beugen und den Infinitiv ans Satzende zu stellen.',
    mode: 'write',
    criteria: [
      'Das Modalverb passt zur Bedeutung (Pflicht, Erlaubnis, Verbot, Rat, Fähigkeit)',
      'Das Modalverb ist richtig konjugiert',
      'Der Infinitiv steht am Satzende',
      '„nicht müssen“ und „nicht dürfen“ sind nicht verwechselt',
    ],
    exercises: [
      {
        id: 'mod-1',
        instruction: 'Setze das passende Modalverb in der richtigen Form ein und schreibe den ganzen Satz.',
        prompt: 'Hier ___ man nicht rauchen, das ist verboten.',
        hint: 'Verbot = nicht dürfen: Hier darf man nicht rauchen.',
        sampleAnswer: 'Hier darf man nicht rauchen, das ist verboten.',
      },
      {
        id: 'mod-2',
        instruction: 'Setze das passende Modalverb in der richtigen Form ein und schreibe den ganzen Satz.',
        prompt: 'Ich ___ heute länger arbeiten, weil eine Kollegin krank ist.',
        hint: 'Pflicht = müssen: Ich muss heute länger arbeiten.',
        sampleAnswer: 'Ich muss heute länger arbeiten, weil eine Kollegin krank ist.',
      },
      {
        id: 'mod-3',
        instruction: 'Setze das passende Modalverb in der richtigen Form ein und schreibe den ganzen Satz.',
        prompt: 'Du siehst müde aus. Du ___ früher ins Bett gehen.',
        hint: 'Rat = sollen (Konjunktiv II: solltest): Du solltest früher ins Bett gehen.',
        sampleAnswer: 'Du siehst müde aus. Du solltest früher ins Bett gehen.',
      },
      {
        id: 'mod-4',
        instruction: 'Setze das passende Modalverb im Präteritum ein und schreibe den ganzen Satz.',
        prompt: 'Als Kind ___ ich nicht allein auf die Straße gehen.',
        hint: 'Erlaubnis in der Vergangenheit = durfte: Als Kind durfte ich nicht …',
        sampleAnswer: 'Als Kind durfte ich nicht allein auf die Straße gehen.',
      },
      {
        id: 'mod-5',
        instruction: 'Setze das passende Modalverb in der richtigen Form ein und schreibe den ganzen Satz.',
        prompt: 'Ich ___ sehr gut schwimmen, ich habe es als Kind gelernt.',
        hint: 'Fähigkeit = können: Ich kann sehr gut schwimmen.',
        sampleAnswer: 'Ich kann sehr gut schwimmen, ich habe es als Kind gelernt.',
      },
      {
        id: 'mod-6',
        instruction: 'Setze das passende Modalverb in der richtigen Form ein und schreibe den ganzen Satz.',
        prompt: 'Du ___ die Formulare nicht heute abgeben, morgen reicht auch.',
        hint: 'Keine Pflicht = nicht müssen: Du musst die Formulare nicht heute abgeben.',
        sampleAnswer: 'Du musst die Formulare nicht heute abgeben, morgen reicht auch.',
      },
      {
        id: 'mod-7',
        instruction: 'Setze das passende Modalverb in der richtigen Form ein und schreibe den ganzen Satz.',
        prompt: '___ du mir bitte bei dem Antrag helfen?',
        hint: 'Höfliche Bitte = können: Kannst du mir bitte helfen?',
        sampleAnswer: 'Kannst du mir bitte bei dem Antrag helfen?',
      },
    ],
  },
  {
    id: 'relativsaetze',
    icon: '🧷',
    title: 'Relativsätze (der, die, das, dem, denen)',
    focus:
      'Relativsätze machen deine Sätze in Teil 4 deutlich besser, weil du damit Personen und Dinge genauer ' +
      'beschreiben kannst. Übe das richtige Relativpronomen und die Stellung des Verbs.',
    mode: 'write',
    criteria: [
      'Das Relativpronomen hat das richtige Genus',
      'Der Kasus passt zu seiner Rolle im Relativsatz',
      'Präpositionen stehen vor dem Relativpronomen (mit dem, in der)',
      'Das konjugierte Verb steht am Ende des Relativsatzes',
    ],
    exercises: [
      {
        id: 'rel-1',
        instruction: 'Setze das richtige Relativpronomen ein und schreibe den ganzen Satz.',
        prompt: 'Das ist der Mann, ___ neben mir wohnt.',
        hint: 'Der Mann ist Subjekt im Relativsatz, also Nominativ Maskulin: der.',
        sampleAnswer: 'Das ist der Mann, der neben mir wohnt.',
      },
      {
        id: 'rel-2',
        instruction: 'Setze das richtige Relativpronomen ein und schreibe den ganzen Satz.',
        prompt: 'Die Frau, ___ ich gestern im Amt getroffen habe, ist meine Chefin.',
        hint: 'Akkusativ Feminin: die Frau, die ich getroffen habe.',
        sampleAnswer: 'Die Frau, die ich gestern im Amt getroffen habe, ist meine Chefin.',
      },
      {
        id: 'rel-3',
        instruction: 'Setze das richtige Relativpronomen ein und schreibe den ganzen Satz.',
        prompt: 'Das Buch, ___ du mir empfohlen hast, war wirklich spannend.',
        hint: 'Akkusativ Neutrum: das Buch, das du empfohlen hast.',
        sampleAnswer: 'Das Buch, das du mir empfohlen hast, war wirklich spannend.',
      },
      {
        id: 'rel-4',
        instruction: 'Setze das richtige Relativpronomen ein und schreibe den ganzen Satz.',
        prompt: 'Die Wohnung, in ___ wir wohnen, ist leider sehr laut.',
        hint: '„in“ + Dativ Feminin: in der wir wohnen.',
        sampleAnswer: 'Die Wohnung, in der wir wohnen, ist leider sehr laut.',
      },
      {
        id: 'rel-5',
        instruction: 'Setze das richtige Relativpronomen ein und schreibe den ganzen Satz.',
        prompt: 'Der Kollege, mit ___ ich im Projekt arbeite, kommt aus Spanien.',
        hint: '„mit“ + Dativ Maskulin: mit dem ich arbeite.',
        sampleAnswer: 'Der Kollege, mit dem ich im Projekt arbeite, kommt aus Spanien.',
      },
      {
        id: 'rel-6',
        instruction: 'Setze das richtige Relativpronomen ein und schreibe den ganzen Satz.',
        prompt: 'Die Stadt, in ___ ich geboren bin, liegt am Meer.',
        hint: '„in“ + Dativ Feminin: in der ich geboren bin.',
        sampleAnswer: 'Die Stadt, in der ich geboren bin, liegt am Meer.',
      },
      {
        id: 'rel-7',
        instruction: 'Setze das richtige Relativpronomen ein und schreibe den ganzen Satz.',
        prompt: 'Die Nachbarn, ___ ich gestern geholfen habe, sind sehr nett.',
        hint: '„helfen“ verlangt den Dativ, Plural: denen.',
        sampleAnswer: 'Die Nachbarn, denen ich gestern geholfen habe, sind sehr nett.',
      },
    ],
  },
  {
    id: 'vergleiche',
    icon: '📏',
    title: 'Vergleiche: Komparativ, Superlativ, als und wie',
    focus:
      'Vergleiche klingen in Prüfungsantworten sofort besser, wenn „als“ und „wie“ sitzen. Übe Komparativ, ' +
      'Superlativ und die unregelmäßigen Formen (gut, viel, gern).',
    mode: 'write',
    criteria: [
      'Komparativ oder Superlativ ist richtig gebildet',
      '„als“ steht beim Unterschied, „wie“ bei Gleichheit',
      'Umlaute und unregelmäßige Formen stimmen (größer, besser, am meisten)',
      'Der Satz ist insgesamt grammatisch korrekt',
    ],
    exercises: [
      {
        id: 'vgl-1',
        instruction: 'Setze das Adjektiv in die richtige Vergleichsform und schreibe den ganzen Satz.',
        prompt: 'Berlin ist ___ (groß) als Hamburg.',
        hint: 'Komparativ von „groß“ mit Umlaut: größer.',
        sampleAnswer: 'Berlin ist größer als Hamburg.',
      },
      {
        id: 'vgl-2',
        instruction: 'Setze das fehlende Wort ein und schreibe den ganzen Satz.',
        prompt: 'Mein Bruder ist genauso alt ___ ich.',
        hint: 'Bei Gleichheit steht „wie“, nicht „als“.',
        sampleAnswer: 'Mein Bruder ist genauso alt wie ich.',
      },
      {
        id: 'vgl-3',
        instruction: 'Setze das Adjektiv in die richtige Vergleichsform und schreibe den ganzen Satz.',
        prompt: 'Das ist das ___ (gut) Restaurant in unserem Viertel.',
        hint: 'Superlativ von „gut“ ist unregelmäßig: am besten, das beste Restaurant.',
        sampleAnswer: 'Das ist das beste Restaurant in unserem Viertel.',
      },
      {
        id: 'vgl-4',
        instruction: 'Setze das Adjektiv in die richtige Vergleichsform und schreibe den ganzen Satz.',
        prompt: 'Im Sommer ist es in Berlin ___ (warm) als in Hamburg.',
        hint: 'Komparativ von „warm“ mit Umlaut: wärmer.',
        sampleAnswer: 'Im Sommer ist es in Berlin wärmer als in Hamburg.',
      },
      {
        id: 'vgl-5',
        instruction: 'Setze das Adjektiv in die richtige Vergleichsform und schreibe den ganzen Satz.',
        prompt: 'Sie spricht viel ___ (gut) Deutsch als ich.',
        hint: 'Komparativ von „gut“ ist unregelmäßig: besser.',
        sampleAnswer: 'Sie spricht viel besser Deutsch als ich.',
      },
      {
        id: 'vgl-6',
        instruction: 'Setze das Adjektiv in die richtige Vergleichsform und schreibe den ganzen Satz.',
        prompt: 'Der Zug ist ___ (schnell) als der Bus.',
        hint: 'Komparativ von „schnell“: schneller.',
        sampleAnswer: 'Der Zug ist schneller als der Bus.',
      },
      {
        id: 'vgl-7',
        instruction: 'Setze das Adjektiv in die richtige Vergleichsform und schreibe den ganzen Satz.',
        prompt: 'Der neue Job ist ___ (anstrengend) als der alte.',
        hint: 'Komparativ mit „-er“: anstrengender.',
        sampleAnswer: 'Der neue Job ist anstrengender als der alte.',
      },
    ],
  },
]
