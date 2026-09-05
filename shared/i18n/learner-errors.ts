
import { withDutchVariants } from './dutch-variants'
import type { AppLocale } from './locales'
import type { LearnerErrorDetail } from '../types/conjugation'
import type { LearnerErrorTypeCode } from '../utils/learner-error-diagnostics'
import { withSwissObjectAliases } from '../utils/object-terminology'

type ErrorTranslations = Record<Exclude<AppLocale, 'fr'>, string>

const learnerErrorMessages: Record<string, ErrorTranslations> = {
  'task.wrong_mode': withDutchVariants({ de: 'Du hast einen anderen Modus als den verlangten verwendet.', en: 'You used a different mood from the one requested.', it: 'Hai usato un modo diverso da quello richiesto.', es: 'Has usado un modo diferente del solicitado.', nl: "Je gebruikte een andere wijs dan gevraagd.", }),
  'task.wrong_tense': withDutchVariants({ de: 'Du hast eine andere Zeitform als die verlangte verwendet.', en: 'You used a different tense from the one requested.', it: 'Hai usato un tempo diverso da quello richiesto.', es: 'Has usado un tiempo diferente del solicitado.', nl: "Je gebruikte een andere tijd dan gevraagd.", }),
  'task.future_simple_for_near_future': withDutchVariants({ de: 'Du hast das einfache Futur verwendet, obwohl das nahe Futur mit « aller » und dem Infinitiv gebildet werden sollte.', en: 'You used the simple future, but the near future had to be formed with « aller » followed by the infinitive.', it: 'Hai usato il futuro semplice, ma occorreva formare il futuro prossimo con « aller » seguito dall’infinito.', es: 'Has usado el futuro simple, pero había que formar el futuro próximo con « aller » seguido del infinitivo.', nl: "Je gebruikte de futur simple, maar je moest de futur proche vormen met « aller » gevolgd door de infinitief.", }),
  'person.other_form': withDutchVariants({ de: 'Du hast die grammatische Person verwechselt.', en: 'You used the form for a different grammatical person.', it: 'Hai confuso la persona grammaticale.', es: 'Has confundido la persona gramatical.', nl: "Je gebruikte de vorm van een andere grammaticale persoon.", }),
  'person.impossible_ending': withDutchVariants({ de: 'Die verwendete Endung ist bei dieser Person nicht möglich.', en: 'The ending you used is not possible with this person.', it: 'La desinenza usata non è possibile con questa persona.', es: 'La terminación utilizada no es posible con esta persona.', nl: "De uitgang die je gebruikte, is niet mogelijk bij deze persoon.", }),
  'compound.auxiliary': withDutchVariants({ de: 'Du hast nicht das richtige Hilfsverb für diese zusammengesetzte Zeitform verwendet.', en: 'You did not use the correct auxiliary for this compound tense.', it: 'Non hai usato l’ausiliare corretto per questo tempo composto.', es: 'No has usado el auxiliar correcto para este tiempo compuesto.', nl: "Je gebruikte niet het juiste hulpwerkwoord voor deze samengestelde tijd.", }),
  'compound.participle_form': withDutchVariants({ de: 'Nach dem Hilfsverb musstest du das Partizip Perfekt und keine andere konjugierte Form verwenden.', en: 'After the auxiliary, you had to use the past participle rather than another conjugated form.', it: 'Dopo l’ausiliare dovevi usare il participio passato e non un’altra forma coniugata.', es: 'Después del auxiliar debías usar el participio pasado y no otra forma conjugada.', nl: "Na het hulpwerkwoord moest je het voltooid deelwoord gebruiken, niet een andere vervoegde vorm.", }),
  'agreement.subject': withDutchVariants({ de: 'Das Partizip Perfekt wurde nicht richtig an das Subjekt angeglichen.', en: 'The past participle did not agree correctly with the subject.', it: 'Il participio passato non concordava correttamente con il soggetto.', es: 'El participio pasado no concordaba correctamente con el sujeto.', nl: "Het voltooid deelwoord kwam niet correct overeen met het onderwerp.", }),
  'agreement.cod_before': withDutchVariants({ de: 'Das Partizip Perfekt musste an das vorangestellte direkte Objekt angeglichen werden.', en: 'The past participle had to agree with the direct object placed before it.', it: 'Il participio passato doveva concordare con il complemento oggetto posto prima.', es: 'El participio pasado debía concordar con el complemento directo colocado antes.', nl: "Het voltooid deelwoord moest overeenkomen met het lijdend voorwerp dat ervoor staat.", }),
  'agreement.cod_after': withDutchVariants({ de: 'Du hast das Partizip Perfekt an ein nachgestelltes Objekt angeglichen, obwohl es unverändert bleiben musste.', en: 'You made the past participle agree with an object placed after it, although it had to remain unchanged.', it: 'Hai concordato il participio passato con un complemento posto dopo, mentre doveva restare invariato.', es: 'Has hecho concordar el participio pasado con un complemento colocado después, aunque debía permanecer invariable.', nl: "Je paste het voltooid deelwoord aan aan een voorwerp dat erna staat, terwijl het onveranderd moest blijven.", }),
  'agreement.coi': withDutchVariants({ de: 'Du hast das Partizip Perfekt an ein indirektes Objekt angeglichen; ein indirektes Objekt bewirkt diese Angleichung nie.', en: 'You made the past participle agree with an indirect object, which never determines this agreement.', it: 'Hai concordato il participio passato con un complemento indiretto, che non determina mai questa concordanza.', es: 'Has hecho concordar el participio pasado con un complemento indirecto, que nunca determina esta concordancia.', nl: "Je paste het voltooid deelwoord aan aan een meewerkend voorwerp, dat deze overeenkomst nooit bepaalt.", }),
  'agreement.avoir_unwarranted': withDutchVariants({ de: 'Du hast das mit « avoir » verwendete Partizip Perfekt angeglichen, obwohl kein vorangestelltes Objekt dies erforderte.', en: 'You made the past participle used with « avoir » agree, although no preceding object required it.', it: 'Hai concordato il participio passato usato con « avoir », anche se nessun complemento posto prima lo richiedeva.', es: 'Has hecho concordar el participio pasado usado con « avoir », aunque ningún complemento colocado antes lo exigía.', nl: "Je paste het voltooid deelwoord met « avoir » aan, terwijl er geen voorafgaand voorwerp was dat dit vereiste.", }),
  'morphology.ending': withDutchVariants({ de: 'Die Endung ist nicht richtig.', en: 'The ending is not correct.', it: 'La desinenza non è corretta.', es: 'La terminación no es correcta.', nl: "De uitgang is niet juist.", }),
  'orthography.copied_complement': withDutchVariants({ de: 'Beim Abschreiben des in der Aufgabe vorgegebenen Objekts ist ein Rechtschreibfehler entstanden.', en: 'You made a spelling error when copying the object given in the sentence.', it: 'Hai commesso un errore ortografico copiando il complemento dato nella frase.', es: 'Has cometido un error ortográfico al copiar el complemento dado en la frase.', nl: "Je maakte een spelfout bij het overnemen van het voorwerp uit de zin.", }),
  'orthography.accent': withDutchVariants({ de: 'Die Form war richtig aufgebaut, aber ein Akzent war falsch oder fehlte.', en: 'The form was built correctly, but an accent was incorrect or missing.', it: 'La forma era costruita correttamente, ma un accento era errato o mancante.', es: 'La forma estaba bien construida, pero un acento era incorrecto o faltaba.', nl: "De vorm was juist opgebouwd, maar een accent was fout of ontbrak.", }),
  'orthography.punctuation': withDutchVariants({ de: 'Die Form war richtig, aber ein Zeichen wie ein Apostroph oder Bindestrich war falsch oder fehlte.', en: 'The form was correct, but a mark such as an apostrophe or hyphen was incorrect or missing.', it: 'La forma era corretta, ma un segno come un apostrofo o un trattino era errato o mancante.', es: 'La forma era correcta, pero un signo como un apóstrofo o un guion era incorrecto o faltaba.', nl: "De vorm was juist, maar een teken zoals een apostrof of koppelteken was fout of ontbrak.", }),
  'input.close_form': withDutchVariants({ de: 'Deine Antwort war fast richtig, enthielt aber noch einen Rechtschreibunterschied.', en: 'Your answer was close to the correct form, but it still contained a spelling difference.', it: 'La tua risposta era vicina alla forma corretta, ma conteneva ancora una differenza ortografica.', es: 'Tu respuesta estaba cerca de la forma correcta, pero aún contenía una diferencia ortográfica.', nl: "Je antwoord lag dicht bij de juiste vorm, maar bevatte nog een spellingsverschil.", }),
  unknown: withDutchVariants({ de: 'Der Fehler konnte noch nicht genauer eingeordnet werden. Vergleiche deine Antwort mit der Korrektur.', en: 'The error could not yet be classified more precisely. Compare your answer with the correction.', it: 'L’errore non può ancora essere classificato con maggiore precisione. Confronta la risposta con la correzione.', es: 'El error todavía no puede clasificarse con mayor precisión. Compara tu respuesta con la corrección.', nl: "De fout kon nog niet preciezer worden ingedeeld. Vergelijk je antwoord met de verbetering.", }),
}

const insteadOf: Record<AppLocale, string> = withDutchVariants({
  fr: 'à la place de',
  de: 'anstelle von',
  en: 'instead of',
  it: 'al posto di',
  es: 'en lugar de', nl: "in plaats van",
})

export function localizedLearnerErrorMessage(detail: LearnerErrorDetail, locale: AppLocale): string {
  return locale === 'fr'
    ? withSwissObjectAliases(detail.message)
    : learnerErrorMessages[detail.code]?.[locale] || detail.message
}

export function localizedLearnerErrorText(detail: LearnerErrorDetail, locale: AppLocale): string {
  const message = localizedLearnerErrorMessage(detail, locale)
  return detail.learnerValue && detail.expectedValue
    ? `${message} ${detail.learnerValue} ${insteadOf[locale]} ${detail.expectedValue}`
    : message
}

export function learnerErrorInsteadOf(locale: AppLocale): string {
  return insteadOf[locale]
}

export function localizedLearnerErrorMessageForCode(
  code: LearnerErrorTypeCode,
  fallback: string,
  locale: AppLocale,
): string {
  return locale === 'fr' ? withSwissObjectAliases(fallback) : learnerErrorMessages[code]?.[locale] || fallback
}

const learnerErrorLabels: Record<LearnerErrorTypeCode, ErrorTranslations> = {
  'task.wrong_mode': withDutchVariants({ de: 'Modi verwechseln (Indikativ, Konjunktiv, …)', en: 'Confusing moods (indicative, subjunctive, …)', it: 'Confondere i modi (indicativo, congiuntivo, …)', es: 'Confundir los modos (indicativo, subjuntivo, …)', nl: "Wijzen verwarren (indicatief, subjonctief, …)", }),
  'task.wrong_tense': withDutchVariants({ de: 'Zeitformen verwechseln (Imparfait, Futur, …)', en: 'Confusing tenses (imperfect, future, …)', it: 'Confondere i tempi (imperfetto, futuro, …)', es: 'Confundir los tiempos (imperfecto, futuro, …)', nl: "Tijden verwarren (imparfait, futur, …)", }),
  'task.future_simple_for_near_future': withDutchVariants({ de: 'Einfaches Futur statt nahes Futur', en: 'Simple future instead of near future', it: 'Futuro semplice al posto del futuro prossimo', es: 'Futuro simple en lugar de futuro próximo', nl: "Futur simple in plaats van futur proche", }),
  'person.other_form': withDutchVariants({ de: 'Pronomen verwechseln (je, tu, ils …)', en: 'Confusing pronouns (je, tu, ils …)', it: 'Confondere i pronomi (je, tu, ils …)', es: 'Confundir los pronombres (je, tu, ils …)', nl: "Voornaamwoorden verwarren (je, tu, ils …)", }),
  'person.impossible_ending': withDutchVariants({ de: 'Für diese Person unmögliche Endung', en: 'Ending impossible for this person', it: 'Desinenza impossibile per questa persona', es: 'Terminación imposible para esta persona', nl: "Uitgang niet mogelijk bij deze persoon", }),
  'compound.auxiliary': withDutchVariants({ de: 'Falsches Hilfsverb', en: 'Incorrect auxiliary', it: 'Ausiliare errato', es: 'Auxiliar incorrecto', nl: "Verkeerd hulpwerkwoord", }),
  'compound.participle_form': withDutchVariants({ de: 'Falsche Form nach dem Hilfsverb', en: 'Incorrect form after the auxiliary', it: 'Forma errata dopo l’ausiliare', es: 'Forma incorrecta después del auxiliar', nl: "Verkeerde vorm na het hulpwerkwoord", }),
  'agreement.subject': withDutchVariants({ de: 'Angleichung des Partizips an das Subjekt', en: 'Participle agreement with the subject', it: 'Concordanza del participio con il soggetto', es: 'Concordancia del participio con el sujeto', nl: "Overeenkomst van het deelwoord met het onderwerp", }),
  'agreement.cod_before': withDutchVariants({ de: 'Angleichung an ein vorangestelltes direktes Objekt', en: 'Agreement with a preceding direct object', it: 'Concordanza con un complemento oggetto precedente', es: 'Concordancia con un complemento directo anterior', nl: "Overeenkomst met een voorafgaand lijdend voorwerp", }),
  'agreement.cod_after': withDutchVariants({ de: 'Unnötige Angleichung an ein nachgestelltes Objekt', en: 'Incorrect agreement with a following direct object', it: 'Concordanza indebita con un complemento oggetto successivo', es: 'Concordancia indebida con un complemento directo posterior', nl: "Onterechte overeenkomst met een volgend lijdend voorwerp", }),
  'agreement.coi': withDutchVariants({ de: 'Unnötige Angleichung an ein indirektes Objekt', en: 'Incorrect agreement with an indirect object', it: 'Concordanza indebita con un complemento indiretto', es: 'Concordancia indebida con un complemento indirecto', nl: "Onterechte overeenkomst met een meewerkend voorwerp", }),
  'agreement.avoir_unwarranted': withDutchVariants({ de: 'Unnötige Angleichung mit avoir', en: 'Incorrect agreement with avoir', it: 'Concordanza indebita con avoir', es: 'Concordancia indebida con avoir', nl: "Onterechte overeenkomst met avoir", }),
  'morphology.ending': withDutchVariants({ de: 'Falsche Endung', en: 'Incorrect ending', it: 'Desinenza errata', es: 'Terminación incorrecta', nl: "Verkeerde uitgang", }),
  'orthography.copied_complement': withDutchVariants({ de: 'Abschreibfehler beim Objekt', en: 'Error copying the object', it: 'Errore nel copiare il complemento', es: 'Error al copiar el complemento', nl: "Fout bij het overnemen van het voorwerp", }),
  'orthography.accent': withDutchVariants({ de: 'Falscher oder fehlender Akzent', en: 'Incorrect or missing accent', it: 'Accento errato o mancante', es: 'Acento incorrecto o ausente', nl: "Verkeerd of ontbrekend accent", }),
  'orthography.punctuation': withDutchVariants({ de: 'Falsche Zeichensetzung', en: 'Incorrect punctuation or symbol', it: 'Punteggiatura o segno errato', es: 'Puntuación o signo incorrecto', nl: "Verkeerd leesteken of symbool", }),
  'input.close_form': withDutchVariants({ de: 'Antwort nahe an der richtigen Form', en: 'Answer close to the correct form', it: 'Forma vicina alla risposta corretta', es: 'Forma cercana a la respuesta correcta', nl: "Antwoord dicht bij de juiste vorm", }),
  unknown: withDutchVariants({ de: 'Noch nicht klassifizierter Fehler', en: 'Mistake not yet classified', it: 'Errore non ancora classificato', es: 'Error aún no clasificado', nl: "Fout nog niet ingedeeld", }),
}

const learnerErrorDomains: Record<string, Record<Exclude<AppLocale, 'fr'>, string>> = {
  Consigne: withDutchVariants({ de: 'Aufgabe', en: 'Instructions', it: 'Consegna', es: 'Consigna', nl: "Instructies", }),
  Personne: withDutchVariants({ de: 'Person', en: 'Person', it: 'Persona', es: 'Persona', nl: "Persoon", }),
  'Temps composé': withDutchVariants({ de: 'Zusammengesetzte Zeit', en: 'Compound tense', it: 'Tempo composto', es: 'Tiempo compuesto', nl: "Samengestelde tijd", }),
  Accord: withDutchVariants({ de: 'Angleichung', en: 'Agreement', it: 'Concordanza', es: 'Concordancia', nl: "Overeenkomst", }),
  Construction: withDutchVariants({ de: 'Bildung', en: 'Formation', it: 'Formazione', es: 'Formación', nl: "Vorming", }),
  Orthographe: withDutchVariants({ de: 'Rechtschreibung', en: 'Spelling', it: 'Ortografia', es: 'Ortografía', nl: "Spelling", }),
  Saisie: withDutchVariants({ de: 'Eingabe', en: 'Input', it: 'Inserimento', es: 'Entrada', nl: "Invoer", }),
  Autre: withDutchVariants({ de: 'Sonstiges', en: 'Other', it: 'Altro', es: 'Otro', nl: "Andere", }),
}

export function localizedLearnerErrorLabel(code: LearnerErrorTypeCode, fallback: string, locale: AppLocale) {
  return locale === 'fr' ? withSwissObjectAliases(fallback) : learnerErrorLabels[code]?.[locale] || fallback
}

export function localizedLearnerErrorDomain(domain: string, locale: AppLocale) {
  return locale === 'fr' ? domain : learnerErrorDomains[domain]?.[locale] || domain
}
