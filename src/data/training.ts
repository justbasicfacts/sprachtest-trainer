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
]
