import { rename, writeFile } from 'node:fs/promises'
import { dutchChallengePublication } from '../shared/data/challenge-publication-nl.ts'
import { challengePresetDefinitions } from '../shared/data/challenge-presets.ts'

const outputPath = 'shared/data/challenge-publication-deployment.json'
const temporaryPath = `${outputPath}.tmp`
const locales = ['fr', 'de', 'en', 'it', 'es']

const wrappers = {
  nl: {
    title: topic => `Franse vervoegingsoefening: ${topic}`,
    meta: topic => `Franse vervoeging oefenen: ${topic}`,
    metaDescription: topic => `Franse vervoegingsoefeningen over ${topic}. Kies de werkwoorden en tijden die je wilt oefenen.`,
  },
  fr: {
    title: topic => `Exercice de conjugaison : ${topic}`,
    meta: topic => `Exercice de conjugaison sur ${topic}`,
    metaDescription: topic => `Exercices personnalisables de conjugaison française sur ${topic}. Choisis les verbes et les temps à travailler.`,
  },
  de: {
    title: topic => `Französische Konjugationsübung: ${topic}`,
    meta: topic => `Französische Konjugation: ${topic} üben`,
    metaDescription: topic => `Anpassbare Übungen zur französischen Konjugation: ${topic}. Wähle Verben und Zeitformen passend zu deinem Lernziel.`,
  },
  en: {
    title: topic => `French conjugation exercise: ${topic}`,
    meta: topic => `French conjugation practice: ${topic}`,
    metaDescription: topic => `Customisable French conjugation exercises on ${topic}. Choose the verbs and tenses that match your learning goal.`,
  },
  it: {
    title: topic => `Esercizio di coniugazione francese: ${topic}`,
    meta: topic => `Coniugazione francese: esercizi su ${topic}`,
    metaDescription: topic => `Esercizi personalizzabili di coniugazione francese su ${topic}. Scegli i verbi e i tempi adatti al tuo obiettivo.`,
  },
  es: {
    title: topic => `Ejercicio de conjugación francesa: ${topic}`,
    meta: topic => `Conjugación francesa: ejercicios de ${topic}`,
    metaDescription: topic => `Ejercicios personalizables de conjugación francesa sobre ${topic}. Elige los verbos y tiempos adecuados para tu objetivo.`,
  },
}

const fleWrappers = {
  nl: {
    title: topic => `Franse vervoegingsoefening voor anderstaligen: ${topic}`,
    meta: topic => `Frans als vreemde taal: ${topic}`,
    metaDescription: topic => `Interactieve Franse vervoegingsoefening (FLE): ${topic}. Kies de werkwoorden en tijden die je nodig hebt.`,
  },
  fr: {
    title: topic => `Exercice de conjugaison FLE : ${topic}`,
    meta: topic => `Conjugaison FLE : exercice sur ${topic}`,
    metaDescription: topic => `Exercice interactif de conjugaison FLE sur ${topic}. Choisis les verbes et les temps adaptés à ton apprentissage du français.`,
  },
  de: {
    title: topic => `FLE-Übung zur französischen Konjugation: ${topic}`,
    meta: topic => `FLE-Konjugation üben: ${topic}`,
    metaDescription: topic => `Interaktive FLE-Übung zur französischen Konjugation: ${topic}. Wähle passende Verben und Zeitformen.`,
  },
  en: {
    title: topic => `FLE French conjugation exercise: ${topic}`,
    meta: topic => `French as a foreign language: ${topic}`,
    metaDescription: topic => `Interactive French as a foreign language (FLE) conjugation exercise on ${topic}. Choose the verbs and tenses you need.`,
  },
  it: {
    title: topic => `Esercizio di coniugazione FLE: ${topic}`,
    meta: topic => `Coniugazione FLE: esercizio su ${topic}`,
    metaDescription: topic => `Esercizio interattivo di coniugazione FLE su ${topic}. Scegli i verbi e i tempi adatti al tuo apprendimento.`,
  },
  es: {
    title: topic => `Ejercicio de conjugación FLE: ${topic}`,
    meta: topic => `Conjugación FLE: ejercicio de ${topic}`,
    metaDescription: topic => `Ejercicio interactivo de conjugación FLE sobre ${topic}. Elige los verbos y tiempos adecuados para aprender francés.`,
  },
}

function normalizeSlug(value) {
  return value.normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/ß/gu, 'ss')
    .replace(/æ/gu, 'ae')
    .replace(/œ/gu, 'oe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
    .slice(0, 120)
    .replace(/-+$/gu, '')
}

function localized(topic, description) {
  return { topic, description }
}

function swissLevel(level) {
  return {
    fr: localized(`le programme suisse de ${level}`, `Travaille les verbes et les temps attendus en ${level} dans le programme scolaire suisse. Cet entraînement aide à consolider les notions de l’année et à conjuguer avec davantage d’assurance.`),
    de: localized(`Schweizer Lehrplan ${level}`, `Übe die französischen Verben und Zeitformen des Schweizer Lehrplans für die Stufe ${level}. So festigst du den Jahresstoff und konjugierst beim Schreiben und Sprechen sicherer.`),
    en: localized(`Swiss ${level} curriculum`, `Practise the French verbs and tenses expected at ${level} in the Swiss curriculum. This exercise reinforces the year’s key skills and builds confidence in spoken and written French.`),
    it: localized(`programma svizzero di ${level}`, `Esercitati con i verbi e i tempi previsti in ${level} dal programma scolastico svizzero. Consoliderai le nozioni dell’anno e coniugherai con maggiore sicurezza.`),
    es: localized(`programa suizo de ${level}`, `Practica los verbos y tiempos previstos en ${level} por el programa escolar suizo. Este ejercicio consolida los contenidos del curso y mejora la seguridad al conjugar.`),
  }
}

function franceLevel(level) {
  return {
    fr: localized(`le programme français de ${level}`, `Révise les verbes, les temps et les modes attendus en ${level} dans le programme scolaire français. Cet entraînement permet de consolider les acquis utiles en classe et dans les productions écrites.`),
    de: localized(`französischer Lehrplan ${level}`, `Übe die französischen Verben, Zeitformen und Modi, die im französischen Lehrplan der Stufe ${level} vorgesehen sind. So festigst du gezielt die im Unterricht und beim Schreiben benötigten Kenntnisse.`),
    en: localized(`French ${level} curriculum`, `Review the verbs, tenses and moods required at ${level} in the French school curriculum. This practice strengthens the conjugation skills needed in class and in written work.`),
    it: localized(`programma scolastico francese di ${level}`, `Ripassa i verbi, i tempi e i modi previsti in ${level} dal programma scolastico francese. L’esercizio consolida le competenze utili in classe e nella produzione scritta.`),
    es: localized(`programa escolar francés de ${level}`, `Repasa los verbos, tiempos y modos previstos en ${level} por el programa escolar francés. Este ejercicio consolida los conocimientos necesarios en clase y en la expresión escrita.`),
  }
}

const groupDetails = {
  groupe1: {
    topics: ['les verbes du premier groupe', 'Verben der ersten Gruppe', 'first-group verbs', 'verbi del primo gruppo', 'verbos del primer grupo'],
    benefits: [
      'Les verbes réguliers en -er constituent la base de nombreuses phrases en français. Maîtriser leurs terminaisons permet de conjuguer rapidement des centaines de verbes courants.',
      'Regelmäßige Verben auf -er bilden die Grundlage vieler französischer Sätze. Wer ihre Endungen beherrscht, kann Hunderte häufige Verben sicher konjugieren.',
      'Regular -er verbs are the foundation of countless French sentences. Mastering their endings helps you conjugate hundreds of common verbs with confidence.',
      'I verbi regolari in -er sono alla base di moltissime frasi francesi. Padroneggiarne le desinenze permette di coniugare con sicurezza centinaia di verbi comuni.',
      'Los verbos regulares en -er son la base de muchísimas frases en francés. Dominar sus terminaciones permite conjugar con seguridad cientos de verbos frecuentes.',
    ],
  },
  groupe2: {
    topics: ['les verbes du deuxième groupe', 'Verben der zweiten Gruppe', 'second-group verbs', 'verbi del secondo gruppo', 'verbos del segundo grupo'],
    benefits: [
      'Les verbes réguliers en -ir comme finir ou choisir suivent un modèle stable. Reconnaître ce modèle permet d’utiliser sans hésiter des formes comme nous finissons ou ils choisissaient.',
      'Regelmäßige Verben auf -ir wie finir oder choisir folgen einem festen Muster. Wenn du es erkennst, bildest du Formen wie nous finissons oder ils choisissaient sicher.',
      'Regular -ir verbs such as finir and choisir follow a reliable pattern. Recognising it helps you form verbs such as nous finissons and ils choisissaient accurately.',
      'I verbi regolari in -ir come finir e choisir seguono un modello stabile. Riconoscerlo aiuta a formare correttamente forme come nous finissons e ils choisissaient.',
      'Los verbos regulares en -ir como finir y choisir siguen un modelo estable. Reconocerlo ayuda a formar correctamente formas como nous finissons e ils choisissaient.',
    ],
  },
  groupe3: {
    topics: ['les verbes du troisième groupe', 'Verben der dritten Gruppe', 'third-group verbs', 'verbi del terzo gruppo', 'verbos del tercer grupo'],
    benefits: [
      'Les verbes du troisième groupe sont très fréquents mais souvent irréguliers. Les travailler ensemble aide à mémoriser leurs radicaux et leurs terminaisons sans les confondre.',
      'Verben der dritten Gruppe sind sehr häufig, aber oft unregelmäßig. Gemeinsames Üben hilft dir, ihre Stämme und Endungen zu behalten und nicht zu verwechseln.',
      'Third-group verbs are extremely common but often irregular. Practising them together helps you remember their stems and endings without mixing them up.',
      'I verbi del terzo gruppo sono molto frequenti ma spesso irregolari. Allenarli insieme aiuta a ricordarne radici e desinenze senza confonderli.',
      'Los verbos del tercer grupo son muy frecuentes, pero a menudo irregulares. Practicarlos juntos ayuda a recordar sus raíces y terminaciones sin confundirlos.',
    ],
  },
  groupe3ir: {
    topics: ['les verbes du troisième groupe en -ir', 'unregelmäßige Verben auf -ir', 'irregular -ir verbs', 'verbi irregolari in -ir', 'verbos irregulares en -ir'],
    benefits: [
      'Partir, venir, dormir ou sortir se terminent en -ir sans suivre le modèle de finir. Les comparer permet de reconnaître leurs changements de radical et d’éviter les fausses régularités.',
      'Partir, venir, dormir und sortir enden auf -ir, folgen aber nicht dem Muster von finir. Durch den Vergleich erkennst du Stammwechsel und vermeidest falsche Regelbildungen.',
      'Partir, venir, dormir and sortir end in -ir without following the finir pattern. Comparing them helps you recognise stem changes and avoid false regular forms.',
      'Partir, venir, dormir e sortir terminano in -ir ma non seguono il modello di finir. Confrontarli aiuta a riconoscere i cambiamenti di radice ed evitare false regolarità.',
      'Partir, venir, dormir y sortir terminan en -ir, pero no siguen el modelo de finir. Compararlos ayuda a reconocer los cambios de raíz y evitar falsas regularidades.',
    ],
  },
  groupe3oir: {
    topics: ['les verbes du troisième groupe en -oir', 'Verben der dritten Gruppe auf -oir', 'third-group -oir verbs', 'verbi del terzo gruppo in -oir', 'verbos del tercer grupo en -oir'],
    benefits: [
      'Pouvoir, vouloir, devoir ou recevoir sont indispensables dans la vie quotidienne. Travailler leurs formes irrégulières permet d’exprimer une possibilité, une volonté ou une obligation avec précision.',
      'Pouvoir, vouloir, devoir und recevoir brauchst du im Alltag ständig. Wer ihre unregelmäßigen Formen beherrscht, drückt Möglichkeit, Wunsch und Pflicht genau aus.',
      'Pouvoir, vouloir, devoir and recevoir are essential in everyday French. Mastering their irregular forms lets you express possibility, intention and obligation precisely.',
      'Pouvoir, vouloir, devoir e recevoir sono indispensabili nella vita quotidiana. Conoscerne le forme irregolari permette di esprimere possibilità, volontà e obbligo con precisione.',
      'Pouvoir, vouloir, devoir y recevoir son esenciales en la vida cotidiana. Dominar sus formas irregulares permite expresar posibilidad, voluntad y obligación con precisión.',
    ],
  },
  groupe3autres: {
    topics: ['les autres verbes du troisième groupe', 'weitere Verben der dritten Gruppe', 'other third-group verbs', 'altri verbi del terzo gruppo', 'otros verbos del tercer grupo'],
    benefits: [
      'Prendre, mettre, lire, écrire ou conduire ont des modèles particuliers très utilisés. Les entraîner aide à repérer leurs familles et à mieux mémoriser leurs formes irrégulières.',
      'Prendre, mettre, lire, écrire und conduire haben eigene, sehr häufige Muster. Durch Übung erkennst du ihre Verbgruppen und merkst dir unregelmäßige Formen leichter.',
      'Prendre, mettre, lire, écrire and conduire use distinctive, common patterns. Practising them helps you recognise verb families and remember irregular forms more easily.',
      'Prendre, mettre, lire, écrire e conduire seguono modelli particolari e molto usati. Allenarli aiuta a riconoscerne le famiglie e a memorizzare le forme irregolari.',
      'Prendre, mettre, lire, écrire y conduire siguen modelos particulares muy frecuentes. Practicarlos ayuda a reconocer sus familias y memorizar mejor las formas irregulares.',
    ],
  },
}

const special = {
  ger: {
    topics: ['les verbes en -ger', 'französische Verben auf -ger', 'French verbs ending in -ger', 'verbi francesi in -ger', 'verbos franceses en -ger'],
    benefits: [
      'Une lettre suffit parfois à transformer une bonne réponse en faute. Maîtriser les verbes en -ger permet d’écrire correctement nous mangeons ou je voyageais et de comprendre leurs changements orthographiques.',
      'Ein einziger Buchstabe kann eine richtige Form in einen Fehler verwandeln. Wer Verben auf -ger beherrscht, schreibt nous mangeons und je voyageais korrekt und versteht ihre Rechtschreibänderungen.',
      'A single letter can turn a correct form into a spelling mistake. Mastering -ger verbs helps you write nous mangeons and je voyageais correctly and understand their spelling changes.',
      'Una sola lettera può trasformare una forma corretta in un errore. Padroneggiare i verbi in -ger aiuta a scrivere nous mangeons e je voyageais e a capirne i cambiamenti ortografici.',
      'Una sola letra puede convertir una forma correcta en un error. Dominar los verbos en -ger ayuda a escribir nous mangeons y je voyageais correctamente y a entender sus cambios ortográficos.',
    ],
  },
  cer: {
    topics: ['les verbes en -cer', 'französische Verben auf -cer', 'French verbs ending in -cer', 'verbi francesi in -cer', 'verbos franceses en -cer'],
    benefits: [
      'Commencer, avancer ou remplacer demandent parfois une cédille pour conserver le son doux du c. Savoir quand écrire nous commençons ou je plaçais évite une erreur fréquente.',
      'Bei commencer, avancer oder remplacer ist manchmal eine Cedille nötig, damit das c weich klingt. Wer weiß, wann nous commençons oder je plaçais geschrieben wird, vermeidet häufige Fehler.',
      'Commencer, avancer and remplacer sometimes need a cedilla to keep the soft c sound. Knowing when to write nous commençons or je plaçais prevents a frequent spelling error.',
      'Commencer, avancer e remplacer richiedono a volte la cediglia per conservare il suono dolce della c. Sapere quando scrivere nous commençons o je plaçais evita un errore frequente.',
      'Commencer, avancer y remplacer necesitan a veces cedilla para mantener el sonido suave de la c. Saber cuándo escribir nous commençons o je plaçais evita un error frecuente.',
    ],
  },
  'ger-cer': {
    topics: ['les verbes en -ger et en -cer', 'französische Verben auf -ger und -cer', 'French -ger and -cer verbs', 'verbi francesi in -ger e -cer', 'verbos franceses en -ger y -cer'],
    benefits: [
      'Les verbes en -ger et en -cer modifient leur orthographe pour conserver leur prononciation. Les comparer aide à choisir rapidement entre le e protecteur et la cédille.',
      'Verben auf -ger und -cer ändern ihre Schreibweise, damit die Aussprache erhalten bleibt. Der direkte Vergleich hilft dir, schnell zwischen zusätzlichem e und Cedille zu wählen.',
      'French -ger and -cer verbs change their spelling to preserve pronunciation. Comparing both patterns helps you choose quickly between the protective e and the cedilla.',
      'I verbi in -ger e -cer cambiano ortografia per conservare la pronuncia. Confrontare i due modelli aiuta a scegliere rapidamente tra la e protettiva e la cediglia.',
      'Los verbos en -ger y -cer cambian su ortografía para conservar la pronunciación. Comparar ambos modelos ayuda a elegir entre la e protectora y la cedilla.',
    ],
  },
  'sens-mouvement': {
    topics: ['les verbes de mouvement en français', 'französische Bewegungsverben', 'French movement verbs', 'verbi francesi di movimento', 'verbos franceses de movimiento'],
    benefits: [
      'Aller, venir, partir, arriver, entrer ou sortir sont essentiels pour raconter un déplacement, expliquer son trajet ou parler de ses projets. Bien les conjuguer permet de s’exprimer plus précisément à l’oral comme à l’écrit.',
      'Aller, venir, partir, arriver, entrer und sortir brauchst du, um Wege, Reisen und Pläne zu beschreiben. Sicher konjugiert machen diese Verben dein gesprochenes und geschriebenes Französisch genauer.',
      'Aller, venir, partir, arriver, entrer and sortir are essential for describing journeys, routes and plans. Conjugating them confidently makes your spoken and written French more precise.',
      'Aller, venir, partir, arriver, entrer e sortir sono essenziali per raccontare spostamenti, percorsi e progetti. Coniugarli bene rende il francese orale e scritto più preciso.',
      'Aller, venir, partir, arriver, entrer y sortir son esenciales para hablar de desplazamientos, trayectos y proyectos. Conjugarlos bien mejora la precisión oral y escrita.',
    ],
  },
  'sens-communication': {
    topics: ['les verbes de communication', 'französische Kommunikationsverben', 'French communication verbs', 'verbi francesi della comunicazione', 'verbos franceses de comunicación'],
    benefits: [
      'Dire, parler, répondre, expliquer ou raconter permettent de transmettre une idée et de participer à une conversation. Bien les conjuguer rend les échanges plus clairs et plus naturels.',
      'Dire, parler, répondre, expliquer und raconter helfen dir, Gedanken auszudrücken und Gespräche zu führen. Sicher konjugiert machen sie deine Kommunikation klarer und natürlicher.',
      'Dire, parler, répondre, expliquer and raconter let you share ideas and take part in conversations. Conjugating them accurately makes communication clearer and more natural.',
      'Dire, parler, répondre, expliquer e raconter permettono di comunicare idee e partecipare a una conversazione. Coniugarli bene rende gli scambi più chiari e naturali.',
      'Dire, parler, répondre, expliquer y raconter permiten compartir ideas y participar en conversaciones. Conjugarlos bien hace que la comunicación sea más clara y natural.',
    ],
  },
  'sens-cognition': {
    topics: ['les verbes de pensée et de connaissance', 'französische Verben des Denkens und Wissens', 'French thinking and knowledge verbs', 'verbi francesi del pensiero e della conoscenza', 'verbos franceses de pensamiento y conocimiento'],
    benefits: [
      'Penser, savoir, comprendre, apprendre ou décider servent à exprimer une opinion, une connaissance ou un choix. Les maîtriser aide à formuler une pensée précise et nuancée.',
      'Penser, savoir, comprendre, apprendre und décider drücken Meinung, Wissen und Entscheidungen aus. Wer sie beherrscht, kann Gedanken genauer und differenzierter formulieren.',
      'Penser, savoir, comprendre, apprendre and décider express opinions, knowledge and choices. Mastering them helps you communicate ideas precisely and with nuance.',
      'Penser, savoir, comprendre, apprendre e décider esprimono opinioni, conoscenze e scelte. Padroneggiarli aiuta a formulare un pensiero preciso e sfumato.',
      'Penser, savoir, comprendre, apprendre y décider expresan opiniones, conocimientos y decisiones. Dominarlos ayuda a formular ideas precisas y matizadas.',
    ],
  },
  'sens-emotion': {
    topics: ['les verbes des émotions', 'französische Verben der Gefühle', 'French emotion verbs', 'verbi francesi delle emozioni', 'verbos franceses de emoción'],
    benefits: [
      'Aimer, préférer, craindre, rire ou ressentir permettent de parler de ses goûts et de ses émotions. Bien les conjuguer aide à exprimer ce que l’on éprouve avec justesse.',
      'Aimer, préférer, craindre, rire und ressentir helfen dir, über Vorlieben und Gefühle zu sprechen. Sicher konjugiert kannst du genauer ausdrücken, was du empfindest.',
      'Aimer, préférer, craindre, rire and ressentir help you talk about preferences and emotions. Accurate conjugation lets you express how you feel more precisely.',
      'Aimer, préférer, craindre, rire e ressentir permettono di parlare di gusti ed emozioni. Coniugarli bene aiuta a esprimere con precisione ciò che si prova.',
      'Aimer, préférer, craindre, rire y ressentir permiten hablar de gustos y emociones. Conjugarlos bien ayuda a expresar con precisión lo que se siente.',
    ],
  },
  'sens-corps': {
    topics: ['les verbes du corps et des besoins', 'französische Verben für Körper und Bedürfnisse', 'French body and needs verbs', 'verbi francesi del corpo e dei bisogni', 'verbos franceses del cuerpo y las necesidades'],
    benefits: [
      'Manger, boire, dormir, respirer ou se soigner sont indispensables pour parler de la santé et de la vie quotidienne. Les conjuguer correctement permet de décrire clairement ses besoins et ses habitudes.',
      'Manger, boire, dormir, respirer und se soigner brauchst du für Gesundheit und Alltag. Richtig konjugiert helfen sie dir, Bedürfnisse und Gewohnheiten klar zu beschreiben.',
      'Manger, boire, dormir, respirer and se soigner are essential for discussing health and daily life. Conjugating them correctly helps you describe needs and habits clearly.',
      'Manger, boire, dormir, respirer e se soigner sono essenziali per parlare di salute e vita quotidiana. Coniugarli correttamente aiuta a descrivere bisogni e abitudini.',
      'Manger, boire, dormir, respirer y se soigner son esenciales para hablar de salud y vida cotidiana. Conjugarlos correctamente ayuda a describir necesidades y hábitos.',
    ],
  },
  rares: {
    topics: ['les verbes rares ou littéraires', 'seltene und literarische französische Verben', 'rare and literary French verbs', 'verbi francesi rari e letterari', 'verbos franceses raros y literarios'],
    benefits: [
      'Les verbes rares ou littéraires enrichissent la compréhension des textes et le vocabulaire. Les conjuguer permet de mieux lire la littérature et d’explorer les nuances du français.',
      'Seltene und literarische Verben erweitern Wortschatz und Textverständnis. Ihre Konjugation hilft dir, Literatur besser zu lesen und sprachliche Nuancen zu entdecken.',
      'Rare and literary verbs broaden vocabulary and improve reading comprehension. Conjugating them helps you understand literature and explore the nuances of French.',
      'I verbi rari e letterari arricchiscono il vocabolario e la comprensione dei testi. Coniugarli aiuta a leggere meglio la letteratura e a scoprire le sfumature del francese.',
      'Los verbos raros y literarios amplían el vocabulario y la comprensión lectora. Conjugarlos ayuda a entender mejor la literatura y descubrir los matices del francés.',
    ],
  },
  difficiles: {
    topics: ['les verbes français difficiles', 'schwierige französische Verben', 'difficult French verbs', 'verbi francesi difficili', 'verbos franceses difíciles'],
    benefits: [
      'Les verbes les plus difficiles cumulent souvent changements de radical et terminaisons irrégulières. Un entraînement ciblé aide à repérer leurs modèles et à réduire les erreurs persistantes.',
      'Schwierige französische Verben verbinden oft Stammwechsel mit unregelmäßigen Endungen. Gezieltes Üben hilft, ihre Muster zu erkennen und hartnäckige Fehler abzubauen.',
      'The hardest French verbs often combine stem changes with irregular endings. Focused practice helps you identify their patterns and eliminate recurring mistakes.',
      'I verbi francesi più difficili combinano spesso cambiamenti di radice e desinenze irregolari. Un allenamento mirato aiuta a riconoscerne i modelli e ridurre gli errori ricorrenti.',
      'Los verbos franceses más difíciles suelen combinar cambios de raíz y terminaciones irregulares. Una práctica específica ayuda a reconocer sus modelos y reducir errores persistentes.',
    ],
  },
  pronominaux: {
    topics: ['les verbes pronominaux français', 'französische reflexive Verben', 'French reflexive verbs', 'verbi pronominali francesi', 'verbos pronominales franceses'],
    benefits: [
      'Se lever, s’habiller, se souvenir ou se rencontrer sont indispensables dans la vie quotidienne. Les maîtriser aide à placer le pronom réfléchi, choisir l’auxiliaire et construire les temps composés.',
      'Se lever, s’habiller, se souvenir und se rencontrer brauchst du im Alltag. Wer sie beherrscht, setzt das Reflexivpronomen richtig, wählt das Hilfsverb und bildet zusammengesetzte Zeiten.',
      'Se lever, s’habiller, se souvenir and se rencontrer are essential in daily life. Mastering them helps you place the reflexive pronoun, choose the auxiliary and form compound tenses.',
      'Se lever, s’habiller, se souvenir e se rencontrer sono indispensabili ogni giorno. Padroneggiarli aiuta a collocare il pronome riflessivo, scegliere l’ausiliare e formare i tempi composti.',
      'Se lever, s’habiller, se souvenir y se rencontrer son esenciales a diario. Dominarlos ayuda a colocar el pronombre reflexivo, elegir el auxiliar y formar los tiempos compuestos.',
    ],
  },
}

const cif = {
  CIF1: ['4 verbes essentiels – niveau CIF 1', '4 wichtige Verben – Niveau CIF 1', '4 essential verbs – CIF level 1', '4 verbi essenziali – livello CIF 1', '4 verbos esenciales – nivel CIF 1'],
  CIF2: ['12 verbes utiles – niveau CIF 2', '12 wichtige Verben – Niveau CIF 2', '12 useful verbs – CIF level 2', '12 verbi utili – livello CIF 2', '12 verbos útiles – nivel CIF 2'],
  CIF3: ['12 verbes en -er – niveau CIF 3', '12 Verben auf -er – Niveau CIF 3', '12 -er verbs – CIF level 3', '12 verbi in -er – livello CIF 3', '12 verbos en -er – nivel CIF 3'],
  CIF4: ['20 verbes utiles – niveau CIF 4', '20 wichtige Verben – Niveau CIF 4', '20 useful verbs – CIF level 4', '20 verbi utili – livello CIF 4', '20 verbos útiles – nivel CIF 4'],
  '100-verbes-utiles-allophones': ['100 verbes français utiles au quotidien', '100 wichtige französische Alltagsverben', '100 useful everyday French verbs', '100 verbi francesi utili ogni giorno', '100 verbos franceses útiles para cada día'],
}

const cifDescriptions = [
  topic => `${topic.charAt(0).toUpperCase()}${topic.slice(1)} forment un exercice de conjugaison FLE progressif. Tu consolides les formes nécessaires pour comprendre, parler et écrire en français dans les situations courantes.`,
  topic => `${topic} bilden eine progressive FLE-Konjugationsübung. Du festigst die Formen, die du zum Verstehen, Sprechen und Schreiben in typischen Alltagssituationen brauchst.`,
  topic => `${topic} form a progressive FLE French conjugation exercise. Learners build the forms needed to understand, speak and write French in common real-life situations.`,
  topic => `${topic.charAt(0).toUpperCase()}${topic.slice(1)} propongono un esercizio progressivo di coniugazione FLE. Consolidi le forme necessarie per capire, parlare e scrivere in francese nella vita quotidiana.`,
  topic => `${topic.charAt(0).toUpperCase()}${topic.slice(1)} forman un ejercicio progresivo de conjugación FLE. Consolidas las formas necesarias para comprender, hablar y escribir francés en situaciones cotidianas.`,
]

function fromDetails(details) {
  return Object.fromEntries(locales.map((locale, index) => [locale, localized(details.topics[index], details.benefits[index])]))
}

function specification(definition) {
  if (/^(5P|6P|7H|8H|9H|10H|11H)$/u.test(definition.id)) return swissLevel(definition.id)
  if (definition.id.startsWith('france-')) return franceLevel(definition.label)
  if (groupDetails[definition.id]) return fromDetails(groupDetails[definition.id])
  if (special[definition.id]) return fromDetails(special[definition.id])
  if (cif[definition.id]) {
    return Object.fromEntries(locales.map((locale, index) => [locale, localized(cif[definition.id][index], cifDescriptions[index](cif[definition.id][index]))]))
  }
  throw new Error(`Aucun contenu SEO défini pour le défi ${definition.id}.`)
}

const publications = []
// Le défi ultime ne possède pas de page éditoriale publiée.
for (const definition of challengePresetDefinitions.filter(item => item.group !== 'ultimate')) {
  const translations = specification(definition)
  for (const locale of [...locales, 'nl', 'nl-NL']) {
    const isFle = definition.group === 'cif'
    const copyLocale = locale === 'nl-NL' ? 'nl' : locale
    const copy = isFle ? fleWrappers[copyLocale] : wrappers[copyLocale]
    const { topic, description } = locale.startsWith('nl') ? dutchChallengePublication(definition) : translations[locale]
    const entry = {
      presetKey: definition.id,
      locale,
      slug: normalizeSlug(copy.title(topic)),
      title: copy.title(topic),
      metaTitle: copy.meta(topic),
      description,
      metaDescription: copy.metaDescription(topic),
      isPublished: true,
      isIndexable: true,
      overwriteExisting: false,
    }
    if (entry.slug.length > 120 || entry.title.length > 180 || entry.metaTitle.length > 180 || entry.metaDescription.length > 160) {
      throw new Error(`Contenu trop long pour ${definition.id}:${locale}.`)
    }
    publications.push(entry)
  }
}

const slugs = new Set()
for (const publication of publications) {
  const identity = `${publication.locale}:${publication.slug}`
  if (slugs.has(identity)) throw new Error(`Slug dupliqué : ${identity}.`)
  slugs.add(identity)
}

const batch = {
  schemaVersion: 1,
  batchId: 'challenge-publications-dutch-variants-20260905-001',
  publications,
}

await writeFile(temporaryPath, `${JSON.stringify(batch, null, 2)}\n`, 'utf8')
await rename(temporaryPath, outputPath)
console.log(JSON.stringify({ output: outputPath, presets: challengePresetDefinitions.length, publications: publications.length }, null, 2))
