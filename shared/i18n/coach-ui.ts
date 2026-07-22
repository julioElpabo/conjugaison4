import type { AppLocale } from './locales'
import type { CoachProfile } from '../types/coach'

type CoachTranslations = Record<Exclude<AppLocale, 'fr'>, string>

const coachUiTexts: Record<string, CoachTranslations> = {
  'Complète avec réponses': { de: 'Ausführlich mit Antworten', en: 'Detailed with answers', it: 'Completo con risposte', es: 'Completa con respuestas' },
  'Explication détaillée avec réponses et surlignages.': { de: 'Ausführliche Erklärung mit Antworten und Hervorhebungen.', en: 'Detailed explanation with answers and highlights.', it: 'Spiegazione dettagliata con risposte ed evidenziazioni.', es: 'Explicación detallada con respuestas y elementos destacados.' },
  'Complète sans réponses': { de: 'Ausführlich ohne Antworten', en: 'Detailed without answers', it: 'Completo senza risposte', es: 'Completa sin respuestas' },
  'Explication détaillée et conseils, sans révéler la réponse.': { de: 'Ausführliche Erklärung und Tipps, ohne die Antwort zu verraten.', en: 'Detailed explanation and tips without revealing the answer.', it: 'Spiegazione dettagliata e consigli, senza rivelare la risposta.', es: 'Explicación detallada y consejos, sin revelar la respuesta.' },
  'Très condensée': { de: 'Sehr kompakt', en: 'Very concise', it: 'Molto sintetico', es: 'Muy concisa' },
  'Un rappel du groupe et une règle courte adaptée au mode et au temps.': { de: 'Eine Erinnerung an die Gruppe und eine kurze Regel passend zu Modus und Zeitform.', en: 'A reminder of the group and a short rule suited to the mood and tense.', it: 'Un promemoria del gruppo e una breve regola adatta al modo e al tempo.', es: 'Un recordatorio del grupo y una regla breve adaptada al modo y al tiempo.' },
  'Allophone': { de: 'Für Anderssprachige', en: 'For non-native speakers', it: 'Per allofoni', es: 'Para hablantes de otras lenguas' },
  'Pour l’instant identique à l’aide complète avec réponses.': { de: 'Derzeit identisch mit der ausführlichen Hilfe mit Antworten.', en: 'Currently identical to detailed help with answers.', it: 'Per ora identico all’aiuto completo con risposte.', es: 'Por ahora idéntica a la ayuda completa con respuestas.' },
  'Aide condensée': { de: 'Kompakte Hilfe', en: 'Concise help', it: 'Aiuto sintetico', es: 'Ayuda concisa' },
  'Explique sans donner les réponses, avec un minimum de mots': { de: 'Erklärt mit möglichst wenigen Worten, ohne die Antworten zu verraten', en: 'Explains in as few words as possible without giving the answers', it: 'Spiega con pochissime parole senza dare le risposte', es: 'Explica con el mínimo de palabras sin dar las respuestas' },
  'Aide complète': { de: 'Ausführliche Hilfe', en: 'Detailed help', it: 'Aiuto completo', es: 'Ayuda completa' },
  'Explique dans le détail, sans jamais donner de réponses': { de: 'Erklärt ausführlich, ohne jemals die Antworten zu verraten', en: 'Explains in detail without ever giving the answers', it: 'Spiega nei dettagli senza mai dare le risposte', es: 'Explica en detalle sin dar nunca las respuestas' },
  'Aide complète avec réponses': { de: 'Ausführliche Hilfe mit Antworten', en: 'Detailed help with answers', it: 'Aiuto completo con risposte', es: 'Ayuda completa con respuestas' },
  'Explique dans le détail et donne les réponses de manière complète': { de: 'Erklärt ausführlich und gibt vollständige Antworten', en: 'Explains in detail and gives complete answers', it: 'Spiega nei dettagli e fornisce risposte complete', es: 'Explica en detalle y da las respuestas completas' },
  "Apprendre, c'est se tromper": { de: 'Lernen heißt, Fehler zu machen', en: 'Learning means making mistakes', it: 'Imparare significa sbagliare', es: 'Aprender es equivocarse' },
  'Le rap et le karaté': { de: 'Rap und Karate', en: 'Rap and karate', it: 'Il rap e il karate', es: 'El rap y el kárate' },
  "Tu progresses chaque fois que tu refuses d'abandonner": { de: 'Du machst jedes Mal Fortschritte, wenn du dich weigerst aufzugeben', en: 'You make progress every time you refuse to give up', it: 'Progredisci ogni volta che ti rifiuti di arrenderti', es: 'Progresas cada vez que te niegas a rendirte' },
  'Les promenades en montagne': { de: 'Spaziergänge in den Bergen', en: 'Walks in the mountains', it: 'Le passeggiate in montagna', es: 'Los paseos por la montaña' },
  'Une petite victoire par jour, ça finit par faire une grosse différence.': { de: 'Ein kleiner Sieg pro Tag macht am Ende einen großen Unterschied.', en: 'One small win a day eventually makes a big difference.', it: 'Una piccola vittoria al giorno finisce per fare una grande differenza.', es: 'Una pequeña victoria al día acaba marcando una gran diferencia.' },
  'La musique et voir mes amis': { de: 'Musik und meine Freunde treffen', en: 'Music and seeing my friends', it: 'La musica e vedere i miei amici', es: 'La música y ver a mis amigos' },
  'Les gens qui réussissent ont surtout beaucoup essayé': { de: 'Erfolgreiche Menschen haben es vor allem oft versucht', en: 'Successful people have mostly tried many times', it: 'Le persone che riescono hanno soprattutto provato tante volte', es: 'Quienes triunfan, ante todo, lo han intentado muchas veces' },
  'Le parkour, le basket': { de: 'Parkour und Basketball', en: 'Parkour and basketball', it: 'Il parkour e il basket', es: 'El parkour y el baloncesto' },
  'Chaque petit progrès compte.': { de: 'Jeder kleine Fortschritt zählt.', en: 'Every little bit of progress counts.', it: 'Ogni piccolo progresso conta.', es: 'Cada pequeño progreso cuenta.' },
  'Les mangas de science-fiction': { de: 'Science-Fiction-Mangas', en: 'Science-fiction manga', it: 'I manga di fantascienza', es: 'Los mangas de ciencia ficción' },
  'Tu es plus capable que tu ne le crois': { de: 'Du kannst mehr, als du glaubst', en: 'You are more capable than you think', it: 'Sei più capace di quanto credi', es: 'Eres más capaz de lo que crees' },
  'Le foot, le foot, le foot': { de: 'Fußball, Fußball, Fußball', en: 'Football, football, football', it: 'Il calcio, il calcio, il calcio', es: 'El fútbol, el fútbol, el fútbol' },
  "Ce n'est pas ton niveau qui compte, c'est ta progression": { de: 'Nicht dein Niveau zählt, sondern dein Fortschritt', en: "It isn't your level that matters, it's your progress", it: 'Non conta il tuo livello, ma i tuoi progressi', es: 'No importa tu nivel, sino tu progreso' },
  'La danse contemporaine': { de: 'Zeitgenössischer Tanz', en: 'Contemporary dance', it: 'La danza contemporanea', es: 'La danza contemporánea' },
  "Tu n'es pas en compétition avec les autres, mais avec toi-même": { de: 'Du stehst nicht im Wettbewerb mit anderen, sondern mit dir selbst', en: "You're not competing with others, but with yourself", it: 'Non sei in competizione con gli altri, ma con te stesso', es: 'No compites con los demás, sino contigo mismo' },
  'Me promener en ville avec mes amis': { de: 'Mit meinen Freunden durch die Stadt gehen', en: 'Walking around town with my friends', it: 'Passeggiare in città con i miei amici', es: 'Pasear por la ciudad con mis amigos' },
  "Si c'est galère, c'est que tu progresses": { de: 'Wenn es schwierig ist, machst du Fortschritte', en: "If it's hard, it means you're making progress", it: 'Se è difficile, significa che stai progredendo', es: 'Si cuesta, es porque estás progresando' },
  'Jouer au basket': { de: 'Basketball spielen', en: 'Playing basketball', it: 'Giocare a basket', es: 'Jugar al baloncesto' },
  "Le cerveau adore qu'on le challenge": { de: 'Das Gehirn liebt Herausforderungen', en: 'The brain loves a challenge', it: 'Il cervello ama le sfide', es: 'Al cerebro le encantan los retos' },
  'Battre mes potes aux échecs': { de: 'Meine Freunde im Schach schlagen', en: 'Beating my friends at chess', it: 'Battere i miei amici a scacchi', es: 'Ganar a mis amigos al ajedrez' },
  'Tu vaux plus que tes notes': { de: 'Du bist mehr wert als deine Noten', en: 'You are worth more than your grades', it: 'Vali più dei tuoi voti', es: 'Vales más que tus notas' },
  "Les films d'action": { de: 'Actionfilme', en: 'Action films', it: "I film d'azione", es: 'Las películas de acción' },
  "Ce n'est pas parce que c'est difficile que ce n'est pas pour toi.": { de: 'Nur weil es schwierig ist, heißt das nicht, dass es nichts für dich ist.', en: "Just because it's difficult doesn't mean it isn't for you.", it: 'Solo perché è difficile non significa che non faccia per te.', es: 'Que sea difícil no significa que no sea para ti.' },
  'Voyager, ou que ce soit, mais voyager': { de: 'Reisen, egal wohin, Hauptsache reisen', en: 'Travelling, wherever it may be, but travelling', it: 'Viaggiare, ovunque sia, ma viaggiare', es: 'Viajar, donde sea, pero viajar' },
  'Salut ! On commence !': { de: 'Hallo! Los geht’s!', en: 'Hi! Let’s get started!', it: 'Ciao! Cominciamo!', es: '¡Hola! ¡Empezamos!' },
  'Une autre !': { de: 'Noch eine!', en: 'Another one!', it: 'Un’altra!', es: '¡Otra!' },
  'Nouveau départ, c’est parti !': { de: 'Neuer Start, los geht’s!', en: 'A fresh start—let’s go!', it: 'Nuovo inizio, si parte!', es: 'Nuevo comienzo, ¡vamos!' },
  'Super série !': { de: 'Tolle Serie!', en: 'Great streak!', it: 'Ottima serie!', es: '¡Gran racha!' },
  'Nouvelle question !': { de: 'Neue Frage!', en: 'New question!', it: 'Nuova domanda!', es: '¡Nueva pregunta!' },
  'Bravo !': { de: 'Sehr gut!', en: 'Well done!', it: 'Bravissimo!', es: '¡Muy bien!' },
  'Courage !': { de: 'Nicht aufgeben!', en: 'Keep going!', it: 'Coraggio!', es: '¡Ánimo!' },
  'Tu es en plein forme !': { de: 'Du bist richtig gut in Form!', en: 'You’re on top form!', it: 'Sei in gran forma!', es: '¡Estás en plena forma!' },
  'Je vois que c’est un peu difficile.': { de: 'Ich sehe, dass es etwas schwierig ist.', en: 'I can see this is a little difficult.', it: 'Vedo che è un po’ difficile.', es: 'Veo que esto es un poco difícil.' },
  "C'est juste !": { de: 'Das ist richtig!', en: 'That’s correct!', it: 'È giusto!', es: '¡Es correcto!' },
  "C'est juste ! Il y a aussi une autre possibilité.": { de: 'Das ist richtig! Es gibt noch eine andere Möglichkeit.', en: 'That’s correct! There is another possible answer too.', it: 'È giusto! C’è anche un’altra possibilità.', es: '¡Es correcto! También hay otra posibilidad.' },
  'Terminé ! {score} % avec {correctCount} bonnes réponses.': { de: 'Fertig! {score} % mit {correctCount} richtigen Antworten.', en: 'Finished! {score}% with {correctCount} correct answers.', it: 'Finito! {score}% con {correctCount} risposte corrette.', es: '¡Terminado! {score}% con {correctCount} respuestas correctas.' },
  "C'est faux. La bonne réponse est  <b>« {expectedAnswer} »</b>.": { de: 'Das ist falsch. Die richtige Antwort ist <b>„{expectedAnswer}“</b>.', en: 'That’s incorrect. The correct answer is <b>“{expectedAnswer}”</b>.', it: 'Non è corretto. La risposta giusta è <b>«{expectedAnswer}»</b>.', es: 'No es correcto. La respuesta correcta es <b>«{expectedAnswer}»</b>.' },
  '« {complement} » arrive après « {verb} » : pas d’accord, « {participle} » !': { de: '„{complement}“ steht nach „{verb}“: keine Angleichung, „{participle}“!', en: '“{complement}” comes after “{verb}”: no agreement, “{participle}”!', it: '«{complement}» viene dopo «{verb}»: nessuna concordanza, «{participle}»!', es: '«{complement}» aparece después de «{verb}»: no hay concordancia, «{participle}».' },
  'Le COD « {complement} » est devant « {verb} » : accord obligatoire avec  {complement} . Le participe est :  « {participle} » !': { de: 'Das direkte Objekt „{complement}“ steht vor „{verb}“: Die Angleichung an {complement} ist erforderlich. Das Partizip lautet „{participle}“!', en: 'The direct object “{complement}” comes before “{verb}”: agreement with {complement} is required. The participle is “{participle}”!', it: 'Il complemento oggetto «{complement}» precede «{verb}»: la concordanza con {complement} è obbligatoria. Il participio è «{participle}»!', es: 'El complemento directo «{complement}» va antes de «{verb}»: la concordancia con {complement} es obligatoria. El participio es «{participle}».' },
  'Attention au piège : « {complement} » est un COI, donc aucun accord !': { de: 'Vorsicht: „{complement}“ ist ein indirektes Objekt, daher gibt es keine Angleichung!', en: 'Watch out: “{complement}” is an indirect object, so there is no agreement!', it: 'Attenzione: «{complement}» è un complemento indiretto, quindi nessuna concordanza!', es: 'Atención: «{complement}» es un complemento indirecto, así que no hay concordancia.' },
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
