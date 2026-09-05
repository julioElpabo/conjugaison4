
import { withDutchVariants } from './dutch-variants'
import type { AppLocale } from './locales'
import type { CoachHelpEngineKey, CoachProfile } from '../types/coach'

type CoachTranslations = Record<Exclude<AppLocale, 'fr'>, string>

const coachUiTexts: Record<string, CoachTranslations> = {
  'Complète avec réponses': withDutchVariants({ de: 'Ausführlich mit Antworten', en: 'Detailed with answers', it: 'Completo con risposte', es: 'Completa con respuestas', nl: "Uitgebreid met antwoorden", }),
  'Explication détaillée avec réponses et surlignages.': withDutchVariants({ de: 'Ausführliche Erklärung mit Antworten und Hervorhebungen.', en: 'Detailed explanation with answers and highlights.', it: 'Spiegazione dettagliata con risposte ed evidenziazioni.', es: 'Explicación detallada con respuestas y elementos destacados.', nl: "Uitgebreide uitleg met antwoorden en markeringen.", }),
  'Complète sans réponses': withDutchVariants({ de: 'Ausführlich ohne Antworten', en: 'Detailed without answers', it: 'Completo senza risposte', es: 'Completa sin respuestas', nl: "Uitgebreid zonder antwoorden", }),
  'Explication détaillée et conseils, sans révéler la réponse.': withDutchVariants({ de: 'Ausführliche Erklärung und Tipps, ohne die Antwort zu verraten.', en: 'Detailed explanation and tips without revealing the answer.', it: 'Spiegazione dettagliata e consigli, senza rivelare la risposta.', es: 'Explicación detallada y consejos, sin revelar la respuesta.', nl: "Uitgebreide uitleg en tips zonder het antwoord te verklappen.", }),
  'Très condensée': withDutchVariants({ de: 'Sehr kompakt', en: 'Very concise', it: 'Molto sintetico', es: 'Muy concisa', nl: "Zeer beknopt", }),
  'Un rappel du groupe et une règle courte adaptée au mode et au temps.': withDutchVariants({ de: 'Eine Erinnerung an die Gruppe und eine kurze Regel passend zu Modus und Zeitform.', en: 'A reminder of the group and a short rule suited to the mood and tense.', it: 'Un promemoria del gruppo e una breve regola adatta al modo e al tempo.', es: 'Un recordatorio del grupo y una regla breve adaptada al modo y al tiempo.', nl: "Een herinnering aan de groep en een korte regel die past bij de wijs en de tijd.", }),
  'Allophone': withDutchVariants({ de: 'Für Anderssprachige', en: 'For non-native speakers', it: 'Per allofoni', es: 'Para hablantes de otras lenguas', nl: "Voor anderstaligen", }),
  'Une aide pas à pas, avec les réponses, pensée pour les personnes qui apprennent le français et le parlent depuis peu.': withDutchVariants({ de: 'Eine schrittweise Hilfe mit Antworten für Menschen, die Französisch lernen und es erst seit Kurzem sprechen.', en: 'Step-by-step help with answers for people who are learning French and have only recently begun speaking it.', it: 'Un aiuto passo dopo passo, con le risposte, pensato per chi sta imparando il francese e lo parla da poco.', es: 'Una ayuda paso a paso, con respuestas, pensada para quienes están aprendiendo francés y lo hablan desde hace poco.', nl: "Stapsgewijze hulp met antwoorden voor wie Frans leert en de taal nog maar kort spreekt.", }),
  'Aide condensée': withDutchVariants({ de: 'Kompakte Hilfe', en: 'Concise help', it: 'Aiuto sintetico', es: 'Ayuda concisa', nl: "Beknopte hulp", }),
  'Explique sans donner les réponses, avec un minimum de mots': withDutchVariants({ de: 'Erklärt mit möglichst wenigen Worten, ohne die Antworten zu verraten', en: 'Explains in as few words as possible without giving the answers', it: 'Spiega con pochissime parole senza dare le risposte', es: 'Explica con el mínimo de palabras sin dar las respuestas', nl: "Legt het zo kort mogelijk uit zonder de antwoorden te geven", }),
  'Aide complète': withDutchVariants({ de: 'Ausführliche Hilfe', en: 'Detailed help', it: 'Aiuto completo', es: 'Ayuda completa', nl: "Uitgebreide hulp", }),
  'Explique dans le détail, sans jamais donner de réponses': withDutchVariants({ de: 'Erklärt ausführlich, ohne jemals die Antworten zu verraten', en: 'Explains in detail without ever giving the answers', it: 'Spiega nei dettagli senza mai dare le risposte', es: 'Explica en detalle sin dar nunca las respuestas', nl: "Legt alles uitgebreid uit zonder ooit de antwoorden te geven", }),
  'Aide complète avec réponses': withDutchVariants({ de: 'Ausführliche Hilfe mit Antworten', en: 'Detailed help with answers', it: 'Aiuto completo con risposte', es: 'Ayuda completa con respuestas', nl: "Uitgebreide hulp met antwoorden", }),
  'Explique dans le détail et donne les réponses de manière complète': withDutchVariants({ de: 'Erklärt ausführlich und gibt vollständige Antworten', en: 'Explains in detail and gives complete answers', it: 'Spiega nei dettagli e fornisce risposte complete', es: 'Explica en detalle y da las respuestas completas', nl: "Legt alles uitgebreid uit en geeft volledige antwoorden", }),
  "Apprendre, c'est se tromper": withDutchVariants({ de: 'Lernen heißt, Fehler zu machen', en: 'Learning means making mistakes', it: 'Imparare significa sbagliare', es: 'Aprender es equivocarse', nl: "Leren is fouten maken", }),
  'Le rap et le karaté': withDutchVariants({ de: 'Rap und Karate', en: 'Rap and karate', it: 'Il rap e il karate', es: 'El rap y el kárate', nl: "Rap en karate", }),
  "Tu progresses chaque fois que tu refuses d'abandonner": withDutchVariants({ de: 'Du machst jedes Mal Fortschritte, wenn du dich weigerst aufzugeben', en: 'You make progress every time you refuse to give up', it: 'Progredisci ogni volta che ti rifiuti di arrenderti', es: 'Progresas cada vez que te niegas a rendirte', nl: "Je gaat vooruit telkens als je niet opgeeft", }),
  'Les promenades en montagne': withDutchVariants({ de: 'Spaziergänge in den Bergen', en: 'Walks in the mountains', it: 'Le passeggiate in montagna', es: 'Los paseos por la montaña', nl: "Wandelen in de bergen", }),
  'Une petite victoire par jour, ça finit par faire une grosse différence.': withDutchVariants({ de: 'Ein kleiner Sieg pro Tag macht am Ende einen großen Unterschied.', en: 'One small win a day eventually makes a big difference.', it: 'Una piccola vittoria al giorno finisce per fare una grande differenza.', es: 'Una pequeña victoria al día acaba marcando una gran diferencia.', nl: "Elke dag een kleine overwinning maakt uiteindelijk een groot verschil.", }),
  'La musique et voir mes amis': withDutchVariants({ de: 'Musik und meine Freunde treffen', en: 'Music and seeing my friends', it: 'La musica e vedere i miei amici', es: 'La música y ver a mis amigos', nl: "Muziek en afspreken met mijn vrienden", }),
  'Les gens qui réussissent ont surtout beaucoup essayé': withDutchVariants({ de: 'Erfolgreiche Menschen haben es vor allem oft versucht', en: 'Successful people have mostly tried many times', it: 'Le persone che riescono hanno soprattutto provato tante volte', es: 'Quienes triunfan, ante todo, lo han intentado muchas veces', nl: "Wie slaagt, heeft vooral vaak geprobeerd", }),
  'Le parkour, le basket': withDutchVariants({ de: 'Parkour und Basketball', en: 'Parkour and basketball', it: 'Il parkour e il basket', es: 'El parkour y el baloncesto', nl: "Parkour en basketbal", }),
  'Chaque petit progrès compte.': withDutchVariants({ de: 'Jeder kleine Fortschritt zählt.', en: 'Every little bit of progress counts.', it: 'Ogni piccolo progresso conta.', es: 'Cada pequeño progreso cuenta.', nl: "Elk beetje vooruitgang telt.", }),
  'Les mangas de science-fiction': withDutchVariants({ de: 'Science-Fiction-Mangas', en: 'Science-fiction manga', it: 'I manga di fantascienza', es: 'Los mangas de ciencia ficción', nl: "Sciencefictionmanga", }),
  'Tu es plus capable que tu ne le crois': withDutchVariants({ de: 'Du kannst mehr, als du glaubst', en: 'You are more capable than you think', it: 'Sei più capace di quanto credi', es: 'Eres más capaz de lo que crees', nl: "Je kunt meer dan je denkt", }),
  'Le foot, le foot, le foot': withDutchVariants({ de: 'Fußball, Fußball, Fußball', en: 'Football, football, football', it: 'Il calcio, il calcio, il calcio', es: 'El fútbol, el fútbol, el fútbol', nl: "Voetbal, voetbal, voetbal", }),
  "Ce n'est pas ton niveau qui compte, c'est ta progression": withDutchVariants({ de: 'Nicht dein Niveau zählt, sondern dein Fortschritt', en: "It isn't your level that matters, it's your progress", it: 'Non conta il tuo livello, ma i tuoi progressi', es: 'No importa tu nivel, sino tu progreso', nl: "Je vooruitgang telt, niet je niveau", }),
  'La danse contemporaine': withDutchVariants({ de: 'Zeitgenössischer Tanz', en: 'Contemporary dance', it: 'La danza contemporanea', es: 'La danza contemporánea', nl: "Hedendaagse dans", }),
  "Tu n'es pas en compétition avec les autres, mais avec toi-même": withDutchVariants({ de: 'Du stehst nicht im Wettbewerb mit anderen, sondern mit dir selbst', en: "You're not competing with others, but with yourself", it: 'Non sei in competizione con gli altri, ma con te stesso', es: 'No compites con los demás, sino contigo mismo', nl: "Je neemt het op tegen jezelf, niet tegen anderen", }),
  'Me promener en ville avec mes amis': withDutchVariants({ de: 'Mit meinen Freunden durch die Stadt gehen', en: 'Walking around town with my friends', it: 'Passeggiare in città con i miei amici', es: 'Pasear por la ciudad con mis amigos', nl: "Met mijn vrienden door de stad wandelen", }),
  "Si c'est galère, c'est que tu progresses": withDutchVariants({ de: 'Wenn es schwierig ist, machst du Fortschritte', en: "If it's hard, it means you're making progress", it: 'Se è difficile, significa che stai progredendo', es: 'Si cuesta, es porque estás progresando', nl: "Als het moeilijk is, ga je vooruit", }),
  'Jouer au basket': withDutchVariants({ de: 'Basketball spielen', en: 'Playing basketball', it: 'Giocare a basket', es: 'Jugar al baloncesto', nl: "Basketballen", }),
  "Le cerveau adore qu'on le challenge": withDutchVariants({ de: 'Das Gehirn liebt Herausforderungen', en: 'The brain loves a challenge', it: 'Il cervello ama le sfide', es: 'Al cerebro le encantan los retos', nl: "Je brein houdt van een uitdaging", }),
  'Battre mes potes aux échecs': withDutchVariants({ de: 'Meine Freunde im Schach schlagen', en: 'Beating my friends at chess', it: 'Battere i miei amici a scacchi', es: 'Ganar a mis amigos al ajedrez', nl: "Mijn vrienden verslaan met schaken", }),
  'Tu vaux plus que tes notes': withDutchVariants({ de: 'Du bist mehr wert als deine Noten', en: 'You are worth more than your grades', it: 'Vali più dei tuoi voti', es: 'Vales más que tus notas', nl: "Je bent meer waard dan je punten", }),
  "Les films d'action": withDutchVariants({ de: 'Actionfilme', en: 'Action films', it: "I film d'azione", es: 'Las películas de acción', nl: "Actiefilms", }),
  "Ce n'est pas parce que c'est difficile que ce n'est pas pour toi.": withDutchVariants({ de: 'Nur weil es schwierig ist, heißt das nicht, dass es nichts für dich ist.', en: "Just because it's difficult doesn't mean it isn't for you.", it: 'Solo perché è difficile non significa che non faccia per te.', es: 'Que sea difícil no significa que no sea para ti.', nl: "Dat iets moeilijk is, betekent niet dat het niets voor jou is.", }),
  'Voyager, ou que ce soit, mais voyager': withDutchVariants({ de: 'Reisen, egal wohin, Hauptsache reisen', en: 'Travelling, wherever it may be, but travelling', it: 'Viaggiare, ovunque sia, ma viaggiare', es: 'Viajar, donde sea, pero viajar', nl: "Reizen, waarheen dan ook, maar reizen", }),
  'Salut ! On commence !': withDutchVariants({ de: 'Hallo! Los geht’s!', en: 'Hi! Let’s get started!', it: 'Ciao! Cominciamo!', es: '¡Hola! ¡Empezamos!', nl: "Hoi! We gaan eraan beginnen!", }),
  'Une autre !': withDutchVariants({ de: 'Noch eine!', en: 'Another one!', it: 'Un’altra!', es: '¡Otra!', nl: "Nog eentje!", }),
  'Nouveau départ, c’est parti !': withDutchVariants({ de: 'Neuer Start, los geht’s!', en: 'A fresh start—let’s go!', it: 'Nuovo inizio, si parte!', es: 'Nuevo comienzo, ¡vamos!', nl: "Een nieuwe start, daar gaan we!", }),
  'Super série !': withDutchVariants({ de: 'Tolle Serie!', en: 'Great streak!', it: 'Ottima serie!', es: '¡Gran racha!', nl: "Goed bezig!", }),
  'Nouvelle question !': withDutchVariants({ de: 'Neue Frage!', en: 'New question!', it: 'Nuova domanda!', es: '¡Nueva pregunta!', nl: "Nieuwe vraag!", }),
  'Bravo !': withDutchVariants({ de: 'Sehr gut!', en: 'Well done!', it: 'Bravissimo!', es: '¡Muy bien!', nl: "Goed gedaan!", }),
  'Courage !': withDutchVariants({ de: 'Nicht aufgeben!', en: 'Keep going!', it: 'Coraggio!', es: '¡Ánimo!', nl: "Doe zo voort!", }),
  'Tu es en plein forme !': withDutchVariants({ de: 'Du bist richtig gut in Form!', en: 'You’re on top form!', it: 'Sei in gran forma!', es: '¡Estás en plena forma!', nl: "Je bent in topvorm!", }),
  'Je vois que c’est un peu difficile.': withDutchVariants({ de: 'Ich sehe, dass es etwas schwierig ist.', en: 'I can see this is a little difficult.', it: 'Vedo che è un po’ difficile.', es: 'Veo que esto es un poco difícil.', nl: "Ik zie dat dit wat moeilijk is.", }),
  "C'est juste !": withDutchVariants({ de: 'Das ist richtig!', en: 'That’s correct!', it: 'È giusto!', es: '¡Es correcto!', nl: "Dat is juist!", }),
  "C'est juste ! Il y a aussi une autre possibilité.": withDutchVariants({ de: 'Das ist richtig! Es gibt noch eine andere Möglichkeit.', en: 'That’s correct! There is another possible answer too.', it: 'È giusto! C’è anche un’altra possibilità.', es: '¡Es correcto! También hay otra posibilidad.', nl: "Dat is juist! Er is ook nog een ander mogelijk antwoord.", }),
  'Terminé ! {score} % avec {correctCount} bonnes réponses.': withDutchVariants({ de: 'Fertig! {score} % mit {correctCount} richtigen Antworten.', en: 'Finished! {score}% with {correctCount} correct answers.', it: 'Finito! {score}% con {correctCount} risposte corrette.', es: '¡Terminado! {score}% con {correctCount} respuestas correctas.', nl: "Klaar! {score}% met {correctCount} juiste antwoorden.", }),
  "C'est faux. La bonne réponse est  <b>« {expectedAnswer} »</b>.": withDutchVariants({ de: 'Das ist falsch. Die richtige Antwort ist <b>„{expectedAnswer}“</b>.', en: 'That’s incorrect. The correct answer is <b>“{expectedAnswer}”</b>.', it: 'Non è corretto. La risposta giusta è <b>«{expectedAnswer}»</b>.', es: 'No es correcto. La respuesta correcta es <b>«{expectedAnswer}»</b>.', nl: "Dat is niet juist. Het juiste antwoord is <b>“{expectedAnswer}”</b>.", }),
  '« {complement} » arrive après « {verb} » : pas d’accord, « {participle} » !': withDutchVariants({ de: '„{complement}“ steht nach „{verb}“: keine Angleichung, „{participle}“!', en: '“{complement}” comes after “{verb}”: no agreement, “{participle}”!', it: '«{complement}» viene dopo «{verb}»: nessuna concordanza, «{participle}»!', es: '«{complement}» aparece después de «{verb}»: no hay concordancia, «{participle}».', nl: "“{complement}” staat na “{verb}”: geen overeenkomst, “{participle}”!", }),
  'Le COD « {complement} » est devant « {verb} » : accord obligatoire avec  {complement} . Le participe est :  « {participle} » !': withDutchVariants({ de: 'Das direkte Objekt „{complement}“ steht vor „{verb}“: Die Angleichung an {complement} ist erforderlich. Das Partizip lautet „{participle}“!', en: 'The direct object “{complement}” comes before “{verb}”: agreement with {complement} is required. The participle is “{participle}”!', it: 'Il complemento oggetto «{complement}» precede «{verb}»: la concordanza con {complement} è obbligatoria. Il participio è «{participle}»!', es: 'El complemento directo «{complement}» va antes de «{verb}»: la concordancia con {complement} es obligatoria. El participio es «{participle}».', nl: "Het lijdend voorwerp “{complement}” staat vóór “{verb}”: overeenkomst met {complement} is nodig. Het deelwoord is “{participle}”!", }),
  'Attention au piège : « {complement} » est un COI, donc aucun accord !': withDutchVariants({ de: 'Vorsicht: „{complement}“ ist ein indirektes Objekt, daher gibt es keine Angleichung!', en: 'Watch out: “{complement}” is an indirect object, so there is no agreement!', it: 'Attenzione: «{complement}» è un complemento indiretto, quindi nessuna concordanza!', es: 'Atención: «{complement}» es un complemento indirecto, así que no hay concordancia.', nl: "Let op: “{complement}” is een meewerkend voorwerp, dus er is geen overeenkomst!", }),
}

const coachHelpApproachTitles: Record<CoachHelpEngineKey, Record<AppLocale, string>> = {
  'complete-avec-reponses': withDutchVariants({
    fr: 'Aide complète avec réponses',
    de: 'Ausführliche Hilfe mit Antworten',
    en: 'Detailed help with answers',
    it: 'Aiuto completo con risposte',
    es: 'Ayuda completa con respuestas', nl: "Uitgebreide hulp met antwoorden",
  }),
  complete: withDutchVariants({
    fr: 'Aide complète sans réponses',
    de: 'Ausführliche Hilfe ohne Antworten',
    en: 'Detailed help without answers',
    it: 'Aiuto completo senza risposte',
    es: 'Ayuda completa sin respuestas', nl: "Uitgebreide hulp zonder antwoorden",
  }),
  'tres-condensee': withDutchVariants({
    fr: 'Aide très condensée',
    de: 'Sehr kompakte Hilfe',
    en: 'Very concise help',
    it: 'Aiuto molto sintetico',
    es: 'Ayuda muy concisa', nl: "Zeer beknopte hulp",
  }),
  allophone: withDutchVariants({
    fr: 'Aide allophone',
    de: 'Hilfe für Anderssprachige',
    en: 'Help for non-native speakers',
    it: 'Aiuto per allofoni',
    es: 'Ayuda para hablantes de otras lenguas', nl: "Hulp voor anderstaligen",
  }),
}

export function coachHelpApproachTitle(locale: AppLocale, approach: CoachHelpEngineKey): string {
  return coachHelpApproachTitles[approach][locale]
}

export function translateCoachUiText(locale: AppLocale, value?: string | null): string {
  if (!value || locale === 'fr') return value || ''
  return coachUiTexts[value]?.[locale] || value
}

export function localizeCoachProfile(locale: AppLocale, coach: CoachProfile): CoachProfile {
  if (locale === 'fr') return coach
  return {
    ...coach,
    caractereName: translateCoachUiText(locale, coach.caractereName),
    personality: translateCoachUiText(locale, coach.personality),
    pedagogicalStyle: translateCoachUiText(locale, coach.pedagogicalStyle),
    helpApproachName: translateCoachUiText(locale, coach.helpApproachName),
    description: translateCoachUiText(locale, coach.description),
    likes: translateCoachUiText(locale, coach.likes),
    replies: coach.replies.map(reply => ({ ...reply, content: translateCoachUiText(locale, reply.content) })),
  }
}
