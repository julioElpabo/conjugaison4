import type { AppLocale } from './locales'

export interface GuidedTourCopy {
  discover: string
  navLabel: string
  welcomeTitle: string
  welcomeBody: string
  quickTitle: string
  quickMeta: string
  fullTitle: string
  fullMeta: string
  later: string
  next: string
  previous: string
  finish: string
  close: string
  progress: string
  homeTitle: string
  homeDescription: string
  buildTitle: string
  buildDescription: string
  stepsTitle: string
  stepsDescription: string
  presetsTitle: string
  presetsDescription: string
  verbsTitle: string
  verbsDescription: string
  tensesTitle: string
  tensesDescription: string
  optionsTitle: string
  optionsDescription: string
  complementsTitle: string
  complementsDescription: string
  previewTitle: string
  previewDescription: string
  createTitle: string
  createDescription: string
  classicTitle: string
  classicDescription: string
  correctionTitle: string
  correctionDescription: string
  coachTitle: string
  coachDescription: string
  chatTitle: string
  chatDescription: string
  helpTitle: string
  helpDescription: string
  printTitle: string
  printDescription: string
  shareTitle: string
  shareDescription: string
  resumeTitle: string
  resumeDescription: string
  completedTitle: string
  completedDescription: string
}

const copies: Record<AppLocale, GuidedTourCopy> = {
  fr: {
    discover: 'Visite guidée',
    navLabel: 'Visite guidée',
    welcomeTitle: 'Bienvenue sur le nouveau TATITOTU',
    welcomeBody: "Le site a été amélioré. Il reste 100% gratuit et sans publicité. Aucun compte n'est nécessaire.",
    quickTitle: 'Visite rapide',
    quickMeta: 'Environ 1 minute',
    fullTitle: 'Visite complète',
    fullMeta: 'Environ 3 minutes',
    later: 'Plus tard',
    next: 'Suivant',
    previous: 'Précédent',
    finish: 'Terminer',
    close: 'Quitter la visite',
    progress: '{{current}} sur {{total}}',
    homeTitle: 'Trois façons de commencer',
    homeDescription: 'Reprends un défi reçu, choisis un défi tout fait ou construis le tien.',
    buildTitle: 'Construire un nouveau défi',
    buildDescription: 'Ce bouton permet de créer son propre défi de conjugaison.',
    stepsTitle: 'Une création en 4 étapes',
    stepsDescription: 'Construction du défi par étapes pour plus de lisibilité.',
    presetsTitle: 'Les défis tout faits',
    presetsDescription: 'Ils préparent immédiatement une sélection adaptée à un niveau ou à un objectif.',
    verbsTitle: '1 · Choisir les verbes',
    verbsDescription: 'Sélectionne ici les verbes à entrainer',
    tensesTitle: '2 · Choisir les modes et les temps',
    tensesDescription: 'Sélectionne ici les temps à entrainer',
    optionsTitle: '3 · Régler les options',
    optionsDescription: "Régle ici les différentes possibilités de s'exercer",
    complementsTitle: 'Nouveau : les compléments d’objets',
    complementsDescription: 'Production de phrases complètes, par exemple : « Il mange <mark>une pomme</mark>. »',
    previewTitle: 'Un aperçu en direct',
    previewDescription: 'Pendant les réglages, un exemple de question et sa réponse attendue se mettent à jour automatiquement.',
    createTitle: '4 · Utiliser le défi',
    createDescription: 'Le même défi peut être réalisé de quatre manières :<ol><li>En mode classique</li><li>Avec un coach virtuel</li><li>Sur papier</li><li>En le partageant avec d’autres personnes</li></ol>',
    classicTitle: '1 · En mode classique',
    classicDescription: "La façon la plus immédiate de s'entrainer. L'élève répond à une question et reçoit la correction. 2 réponses possibles, bilan à la fin.",
    correctionTitle: 'Une correction immédiate',
    correctionDescription: 'La bonne réponse apparaît, avec une explication grammaticale lorsque c’est utile.',
    coachTitle: '2 · En mode coaching',
    coachDescription: 'Les coaches proposent une manière différente d’encourager et d’expliquer.',
    chatTitle: 'Le chat',
    chatDescription: 'L’exercice prend la forme d’une discussion.',
    helpTitle: 'Une aide liée à la question',
    helpDescription: 'Le panneau explique le verbe, la règle et la construction de la réponse.',
    printTitle: '3 · En mode fiche imprimable',
    printDescription: 'Personnalisation de la fiche et de son corrigé, disponibles aux formats PDF ou Word.',
    shareTitle: 'Partager le défi',
    shareDescription: "Créer un code de 8 caractères permet de retrouver plus tard le défi ou de le partager avec d’autres personnes. Idéal pour le partager avec les élèves d'une classe.",
    resumeTitle: 'Reprendre le défi',
    resumeDescription: "Plus tard, l’élève colle le code reçu dans la page d'accueil et retrouve immédiatement le défi. Les anciens codes restent valables.",
    completedTitle: 'Bon travail !',
    completedDescription: 'Tu connais maintenant le parcours. Tu peux relancer cette visite à tout moment avec « Visite guidée ».',
  },
  de: {
    discover: 'Geführte Tour',
    navLabel: 'Geführte Tour',
    welcomeTitle: 'Willkommen beim neuen TATITOTU',
    welcomeBody: 'Die Website wurde verbessert. Sie bleibt zu 100 % kostenlos und werbefrei. Es ist kein Konto erforderlich.',
    quickTitle: 'Kurze Führung',
    quickMeta: 'Etwa 1 Minute',
    fullTitle: 'Vollständige Führung',
    fullMeta: 'Etwa 3 Minuten',
    later: 'Später',
    next: 'Weiter',
    previous: 'Zurück',
    finish: 'Beenden',
    close: 'Führung schließen',
    progress: '{{current}} von {{total}}',
    homeTitle: 'Drei Möglichkeiten zum Start',
    homeDescription: 'Öffne eine erhaltene Aufgabe, wähle eine fertige Aufgabe oder erstelle deine eigene.',
    buildTitle: 'Eine neue Aufgabe erstellen',
    buildDescription: 'Mit dieser Schaltfläche kannst du deine eigene Konjugationsaufgabe erstellen.',
    stepsTitle: 'Erstellung in 4 Schritten',
    stepsDescription: 'Die Aufgabe wird zur besseren Übersicht Schritt für Schritt erstellt.',
    presetsTitle: 'Fertige Aufgaben',
    presetsDescription: 'Sie stellen sofort eine Auswahl zusammen, die zu einem Niveau oder Lernziel passt.',
    verbsTitle: '1 · Verben wählen',
    verbsDescription: 'Wähle hier die Verben aus, die du üben möchtest.',
    tensesTitle: '2 · Modi und Zeiten wählen',
    tensesDescription: 'Wähle hier die Zeiten aus, die du üben möchtest.',
    optionsTitle: '3 · Optionen einstellen',
    optionsDescription: 'Stelle hier die verschiedenen Übungsmöglichkeiten ein.',
    complementsTitle: 'Neu: Objektergänzungen',
    complementsDescription: 'Bilde vollständige Sätze, zum Beispiel: „Il mange <mark>une pomme</mark>.“',
    previewTitle: 'Live-Vorschau',
    previewDescription: 'Während der Einstellungen werden eine Beispielfrage und die erwartete Antwort automatisch aktualisiert.',
    createTitle: '4 · Aufgabe verwenden',
    createDescription: 'Dieselbe Aufgabe kann auf vier Arten bearbeitet werden:<ol><li>Im klassischen Modus</li><li>Mit einem virtuellen Coach</li><li>Auf Papier</li><li>Indem du sie mit anderen Personen teilst</li></ol>',
    classicTitle: '1 · Im klassischen Modus',
    classicDescription: 'Die direkteste Art zu üben. Die lernende Person beantwortet eine Frage und erhält die Korrektur. Zwei Versuche sind möglich, am Ende folgt eine Auswertung.',
    correctionTitle: 'Sofortige Korrektur',
    correctionDescription: 'Die richtige Antwort erscheint bei Bedarf mit einer grammatischen Erklärung.',
    coachTitle: '2 · Im Coaching-Modus',
    coachDescription: 'Die Coaches ermutigen und erklären auf unterschiedliche Weise.',
    chatTitle: 'Der Chat',
    chatDescription: 'Die Übung findet in Form eines Gesprächs statt.',
    helpTitle: 'Hilfe passend zur Frage',
    helpDescription: 'Das Fenster erklärt das Verb, die Regel und den Aufbau der Antwort.',
    printTitle: '3 · Als ausdruckbares Arbeitsblatt',
    printDescription: 'Arbeitsblatt und Lösung lassen sich anpassen und als PDF oder Word-Datei ausgeben.',
    shareTitle: 'Aufgabe teilen',
    shareDescription: 'Mit einem Code aus 8 Zeichen kannst du die Aufgabe später wiederfinden oder mit anderen teilen. Ideal, um sie mit den Schülerinnen und Schülern einer Klasse zu teilen.',
    resumeTitle: 'Aufgabe wiederaufnehmen',
    resumeDescription: 'Später fügt die lernende Person den erhaltenen Code auf der Startseite ein und findet die Aufgabe sofort wieder. Alte Codes bleiben gültig.',
    completedTitle: 'Gute Arbeit!',
    completedDescription: 'Du kennst jetzt den Ablauf. Über „Geführte Tour“ kannst du ihn jederzeit erneut ansehen.',
  },
  en: {
    discover: 'Guided tour',
    navLabel: 'Guided tour',
    welcomeTitle: 'Welcome to the new TATITOTU',
    welcomeBody: 'The site has been improved. It remains 100% free and ad-free. No account is required.',
    quickTitle: 'Quick tour',
    quickMeta: 'About 1 minute',
    fullTitle: 'Full tour',
    fullMeta: 'About 3 minutes',
    later: 'Later',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    close: 'Leave the tour',
    progress: '{{current}} of {{total}}',
    homeTitle: 'Three ways to begin',
    homeDescription: 'Resume a received challenge, choose a ready-made one, or build your own.',
    buildTitle: 'Build a new challenge',
    buildDescription: 'This button lets you create your own conjugation challenge.',
    stepsTitle: 'Create it in 4 steps',
    stepsDescription: 'The challenge is built step by step for greater clarity.',
    presetsTitle: 'Ready-made challenges',
    presetsDescription: 'They instantly prepare a selection suited to a level or goal.',
    verbsTitle: '1 · Choose verbs',
    verbsDescription: 'Select the verbs you want to practise here.',
    tensesTitle: '2 · Choose moods and tenses',
    tensesDescription: 'Select the tenses you want to practise here.',
    optionsTitle: '3 · Set the options',
    optionsDescription: 'Set the different ways to practise here.',
    complementsTitle: 'New: object complements',
    complementsDescription: 'Create complete sentences, for example: “Il mange <mark>une pomme</mark>.”',
    previewTitle: 'Live preview',
    previewDescription: 'As you adjust the settings, a sample question and its expected answer update automatically.',
    createTitle: '4 · Use the challenge',
    createDescription: 'The same challenge can be completed in four ways:<ol><li>In classic mode</li><li>With a virtual coach</li><li>On paper</li><li>By sharing it with other people</li></ol>',
    classicTitle: '1 · In classic mode',
    classicDescription: 'The most direct way to practise. The learner answers a question and receives the correction. Two attempts are allowed, with a summary at the end.',
    correctionTitle: 'Immediate feedback',
    correctionDescription: 'The correct answer appears with a grammar explanation when useful.',
    coachTitle: '2 · In coaching mode',
    coachDescription: 'The coaches offer different ways to encourage and explain.',
    chatTitle: 'The chat',
    chatDescription: 'The exercise takes the form of a conversation.',
    helpTitle: 'Help linked to the question',
    helpDescription: 'The panel explains the verb, the rule and how to build the answer.',
    printTitle: '3 · As a printable worksheet',
    printDescription: 'Customise the worksheet and its answer key, available as PDF or Word files.',
    shareTitle: 'Share the challenge',
    shareDescription: 'An 8-character code lets you retrieve the challenge later or share it with other people. Ideal for sharing it with the students in a class.',
    resumeTitle: 'Resume the challenge',
    resumeDescription: 'Later, the learner pastes the received code on the home page and immediately retrieves the challenge. Older codes remain valid.',
    completedTitle: 'Good work!',
    completedDescription: 'You now know the workflow. You can restart this tour at any time with “Guided tour”.',
  },
  it: {
    discover: 'Visita guidata',
    navLabel: 'Visita guidata',
    welcomeTitle: 'Benvenuto nel nuovo TATITOTU',
    welcomeBody: 'Il sito è stato migliorato. Rimane gratuito al 100% e senza pubblicità. Non è necessario alcun account.',
    quickTitle: 'Visita rapida',
    quickMeta: 'Circa 1 minuto',
    fullTitle: 'Visita completa',
    fullMeta: 'Circa 3 minuti',
    later: 'Più tardi',
    next: 'Avanti',
    previous: 'Indietro',
    finish: 'Termina',
    close: 'Esci dalla visita',
    progress: '{{current}} di {{total}}',
    homeTitle: 'Tre modi per iniziare',
    homeDescription: 'Riprendi una sfida ricevuta, scegline una pronta o costruisci la tua.',
    buildTitle: 'Crea una nuova sfida',
    buildDescription: 'Questo pulsante permette di creare la propria sfida di coniugazione.',
    stepsTitle: 'Creazione in 4 tappe',
    stepsDescription: 'La sfida viene costruita per tappe, per una maggiore chiarezza.',
    presetsTitle: 'Le sfide già pronte',
    presetsDescription: 'Preparano subito una selezione adatta a un livello o a un obiettivo.',
    verbsTitle: '1 · Scegliere i verbi',
    verbsDescription: 'Seleziona qui i verbi da allenare.',
    tensesTitle: '2 · Scegliere modi e tempi',
    tensesDescription: 'Seleziona qui i tempi da allenare.',
    optionsTitle: '3 · Impostare le opzioni',
    optionsDescription: 'Imposta qui le diverse possibilità di esercitazione.',
    complementsTitle: 'Novità: complementi oggetto',
    complementsDescription: 'Produci frasi complete, per esempio: « Il mange <mark>une pomme</mark>. »',
    previewTitle: 'Anteprima in tempo reale',
    previewDescription: 'Durante le impostazioni, una domanda di esempio e la risposta attesa si aggiornano automaticamente.',
    createTitle: '4 · Usare la sfida',
    createDescription: 'La stessa sfida può essere svolta in quattro modi:<ol><li>In modalità classica</li><li>Con un coach virtuale</li><li>Su carta</li><li>Condividendola con altre persone</li></ol>',
    classicTitle: '1 · In modalità classica',
    classicDescription: 'Il modo più immediato per allenarsi. L’allievo risponde a una domanda e riceve la correzione. Sono disponibili due tentativi, con un bilancio finale.',
    correctionTitle: 'Correzione immediata',
    correctionDescription: 'Appare la risposta corretta, con una spiegazione grammaticale se utile.',
    coachTitle: '2 · In modalità coaching',
    coachDescription: 'I coach propongono modi diversi di incoraggiare e spiegare.',
    chatTitle: 'La chat',
    chatDescription: 'L’esercizio assume la forma di una conversazione.',
    helpTitle: 'Un aiuto legato alla domanda',
    helpDescription: 'Il pannello spiega il verbo, la regola e la costruzione della risposta.',
    printTitle: '3 · Come scheda stampabile',
    printDescription: 'Personalizza la scheda e le soluzioni, disponibili nei formati PDF o Word.',
    shareTitle: 'Condividere la sfida',
    shareDescription: 'Un codice di 8 caratteri permette di ritrovare la sfida in seguito o di condividerla con altre persone. È ideale per condividerla con gli alunni di una classe.',
    resumeTitle: 'Riprendere la sfida',
    resumeDescription: 'In seguito, l’allievo incolla il codice ricevuto nella pagina iniziale e ritrova subito la sfida. I vecchi codici restano validi.',
    completedTitle: 'Buon lavoro!',
    completedDescription: 'Ora conosci il percorso. Puoi riavviare questa visita in qualsiasi momento con « Visita guidata ».',
  },
  es: {
    discover: 'Visita guiada',
    navLabel: 'Visita guiada',
    welcomeTitle: 'Bienvenido al nuevo TATITOTU',
    welcomeBody: 'El sitio ha sido mejorado. Sigue siendo 100 % gratuito y sin publicidad. No se necesita ninguna cuenta.',
    quickTitle: 'Visita rápida',
    quickMeta: 'Aproximadamente 1 minuto',
    fullTitle: 'Visita completa',
    fullMeta: 'Aproximadamente 3 minutos',
    later: 'Más tarde',
    next: 'Siguiente',
    previous: 'Anterior',
    finish: 'Terminar',
    close: 'Salir de la visita',
    progress: '{{current}} de {{total}}',
    homeTitle: 'Tres formas de empezar',
    homeDescription: 'Retoma un desafío recibido, elige uno preparado o crea el tuyo.',
    buildTitle: 'Crear un nuevo desafío',
    buildDescription: 'Este botón permite crear tu propio desafío de conjugación.',
    stepsTitle: 'Creación en 4 etapas',
    stepsDescription: 'El desafío se construye por etapas para que resulte más claro.',
    presetsTitle: 'Desafíos preparados',
    presetsDescription: 'Preparan al instante una selección adaptada a un nivel o a un objetivo.',
    verbsTitle: '1 · Elegir los verbos',
    verbsDescription: 'Selecciona aquí los verbos que quieres practicar.',
    tensesTitle: '2 · Elegir modos y tiempos',
    tensesDescription: 'Selecciona aquí los tiempos que quieres practicar.',
    optionsTitle: '3 · Configurar las opciones',
    optionsDescription: 'Configura aquí las distintas posibilidades para practicar.',
    complementsTitle: 'Nuevo: complementos de objeto',
    complementsDescription: 'Produce frases completas, por ejemplo: « Il mange <mark>une pomme</mark>. »',
    previewTitle: 'Vista previa en directo',
    previewDescription: 'Durante la configuración, una pregunta de ejemplo y su respuesta esperada se actualizan automáticamente.',
    createTitle: '4 · Utilizar el desafío',
    createDescription: 'El mismo desafío puede realizarse de cuatro maneras:<ol><li>En modo clásico</li><li>Con un coach virtual</li><li>En papel</li><li>Compartiendo con otras personas</li></ol>',
    classicTitle: '1 · En modo clásico',
    classicDescription: 'La forma más directa de practicar. El alumno responde a una pregunta y recibe la corrección. Hay dos intentos posibles y un balance final.',
    correctionTitle: 'Corrección inmediata',
    correctionDescription: 'Aparece la respuesta correcta con una explicación gramatical cuando es útil.',
    coachTitle: '2 · En modo coaching',
    coachDescription: 'Los coaches proponen distintas maneras de animar y explicar.',
    chatTitle: 'El chat',
    chatDescription: 'El ejercicio adopta la forma de una conversación.',
    helpTitle: 'Una ayuda vinculada a la pregunta',
    helpDescription: 'El panel explica el verbo, la regla y la construcción de la respuesta.',
    printTitle: '3 · Como ficha imprimible',
    printDescription: 'Personaliza la ficha y sus soluciones, disponibles en formato PDF o Word.',
    shareTitle: 'Compartir el desafío',
    shareDescription: 'Un código de 8 caracteres permite recuperar el desafío más tarde o compartirlo con otras personas. Es ideal para compartirlo con el alumnado de una clase.',
    resumeTitle: 'Retomar el desafío',
    resumeDescription: 'Más tarde, el alumno pega el código recibido en la página de inicio y recupera inmediatamente el desafío. Los códigos antiguos siguen siendo válidos.',
    completedTitle: '¡Buen trabajo!',
    completedDescription: 'Ya conoces el recorrido. Puedes reiniciar esta visita en cualquier momento con « Visita guiada ».',
  },
}

export function guidedTourCopy(locale: AppLocale): GuidedTourCopy {
  return copies[locale] ?? copies.fr
}
