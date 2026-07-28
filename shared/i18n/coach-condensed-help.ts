import type { AppLocale } from './locales'
import type { CoachCondensedTenseRule } from '../data/coach-condensed-tense-rules'

type ForeignLocale = Exclude<AppLocale, 'fr'>

const modeNames: Record<ForeignLocale, Record<string, string>> = {
  de: { indicatif: 'Indikativ', imperatif: 'Imperativ', subjonctif: 'Subjunktiv', conditionnel: 'Konditional', participe: 'Partizip', gerondif: 'Gerundium' },
  en: { indicatif: 'Indicative', imperatif: 'Imperative', subjonctif: 'Subjunctive', conditionnel: 'Conditional', participe: 'Participle', gerondif: 'Gerund' },
  it: { indicatif: 'Indicativo', imperatif: 'Imperativo', subjonctif: 'Congiuntivo', conditionnel: 'Condizionale', participe: 'Participio', gerondif: 'Gerundio' },
  es: { indicatif: 'Indicativo', imperatif: 'Imperativo', subjonctif: 'Subjuntivo', conditionnel: 'Condicional', participe: 'Participio', gerondif: 'Gerundio' },
}

const tenseNames: Record<ForeignLocale, Record<string, string>> = {
  de: { present: 'Präsens', 'futur proche': 'nahes Futur', imparfait: 'Imparfait', futur: 'Futur', 'passe simple': 'Passé simple', 'passe compose': 'Passé composé', 'futur anterieur': 'Futur antérieur', 'plus-que-parfait': 'Plusquamperfekt', 'passe anterieur': 'Passé antérieur', passe: 'Vergangenheit', 'passe 1': 'Vergangenheit, erste Form', 'passe 2': 'Vergangenheit, zweite Form' },
  en: { present: 'present', 'futur proche': 'near future', imparfait: 'imperfect', futur: 'future', 'passe simple': 'simple past', 'passe compose': 'compound past', 'futur anterieur': 'future perfect', 'plus-que-parfait': 'pluperfect', 'passe anterieur': 'past anterior', passe: 'past', 'passe 1': 'past, first form', 'passe 2': 'past, second form' },
  it: { present: 'presente', 'futur proche': 'futuro prossimo', imparfait: 'imperfetto', futur: 'futuro', 'passe simple': 'passato remoto', 'passe compose': 'passato prossimo', 'futur anterieur': 'futuro anteriore', 'plus-que-parfait': 'trapassato prossimo', 'passe anterieur': 'passato anteriore', passe: 'passato', 'passe 1': 'passato, prima forma', 'passe 2': 'passato, seconda forma' },
  es: { present: 'presente', 'futur proche': 'futuro próximo', imparfait: 'imperfecto', futur: 'futuro', 'passe simple': 'pasado simple', 'passe compose': 'pasado compuesto', 'futur anterieur': 'futuro anterior', 'plus-que-parfait': 'pluscuamperfecto', 'passe anterieur': 'pasado anterior', passe: 'pasado', 'passe 1': 'pasado, primera forma', 'passe 2': 'pasado, segunda forma' },
}

const rules: Record<string, Record<ForeignLocale, string>> = {
  'indicatif:present': { de: 'Präsensstamm, manchmal veränderlich, + Personalendung.', en: 'Present-tense stem, which may vary, + the personal ending.', it: 'Radice del presente, talvolta variabile, + desinenza della persona.', es: 'Raíz del presente, a veces variable, + terminación de la persona.' },
  'indicatif:futur proche': { de: '« aller » im Präsens + Infinitiv des Verbs.', en: '« aller » in the present tense + verb infinitive.', it: '« aller » al presente + infinito del verbo.', es: '« aller » en presente + infinitivo del verbo.' },
  'indicatif:imparfait': { de: 'Form mit « nous » im Präsens ohne « -ons » + Imparfait-Endung.', en: 'Present-tense « nous » form without « -ons » + imperfect ending.', it: 'Forma con « nous » al presente senza « -ons » + desinenza dell’imperfetto.', es: 'Forma de « nous » en presente sin « -ons » + terminación del imperfecto.' },
  'indicatif:futur': { de: 'Futurstamm, meist der Infinitiv ohne das letzte « e » bei Verben auf « -re », + Futurendung.', en: 'Future stem, usually the infinitive without the final « e » of « -re » verbs, + future ending.', it: 'Radice del futuro, spesso l’infinito senza la « e » finale dei verbi in « -re », + desinenza del futuro.', es: 'Raíz del futuro, normalmente el infinitivo sin la « e » final de los verbos en « -re », + terminación del futuro.' },
  'indicatif:passe simple': { de: 'Stamm des Passé simple + Endung der entsprechenden Reihe.', en: 'Simple-past stem + the ending from its pattern.', it: 'Radice del passato remoto + desinenza della serie corrispondente.', es: 'Raíz del pasado simple + terminación de su serie.' },
  'indicatif:passe compose': { de: 'Hilfsverb im Präsens + Partizip Perfekt.', en: 'Auxiliary in the present tense + past participle.', it: 'Ausiliare al presente + participio passato.', es: 'Auxiliar en presente + participio pasado.' },
  'indicatif:futur anterieur': { de: 'Hilfsverb im Futur + Partizip Perfekt.', en: 'Auxiliary in the future tense + past participle.', it: 'Ausiliare al futuro + participio passato.', es: 'Auxiliar en futuro + participio pasado.' },
  'indicatif:plus-que-parfait': { de: 'Hilfsverb im Imparfait + Partizip Perfekt.', en: 'Auxiliary in the imperfect + past participle.', it: 'Ausiliare all’imperfetto + participio passato.', es: 'Auxiliar en imperfecto + participio pasado.' },
  'indicatif:passe anterieur': { de: 'Hilfsverb im Passé simple + Partizip Perfekt.', en: 'Auxiliary in the simple past + past participle.', it: 'Ausiliare al passato remoto + participio passato.', es: 'Auxiliar en pasado simple + participio pasado.' },
  'imperatif:present': { de: 'Präsensform mit « tu », « nous » oder « vous », ohne Subjekt.', en: 'Present-tense form with « tu », « nous » or « vous », without the subject.', it: 'Forma del presente con « tu », « nous » o « vous », senza il soggetto.', es: 'Forma del presente con « tu », « nous » o « vous », sin el sujeto.' },
  'imperatif:passe': { de: 'Hilfsverb im Imperativ Präsens + Partizip Perfekt.', en: 'Auxiliary in the present imperative + past participle.', it: 'Ausiliare all’imperativo presente + participio passato.', es: 'Auxiliar en imperativo presente + participio pasado.' },
  'subjonctif:present': { de: 'Präsensformen mit « ils » und « nous » ohne « -ent » bzw. « -ons » + Subjunktivendung.', en: 'Present-tense « ils » and « nous » forms without « -ent » or « -ons » + subjunctive ending.', it: 'Forme del presente con « ils » e « nous » senza « -ent » o « -ons » + desinenza del congiuntivo.', es: 'Formas de presente con « ils » y « nous » sin « -ent » o « -ons » + terminación del subjuntivo.' },
  'subjonctif:passe': { de: 'Hilfsverb im Subjunktiv Präsens + Partizip Perfekt.', en: 'Auxiliary in the present subjunctive + past participle.', it: 'Ausiliare al congiuntivo presente + participio passato.', es: 'Auxiliar en subjuntivo presente + participio pasado.' },
  'subjonctif:imparfait': { de: 'Nimm die Form mit « il » im Passé simple.', en: 'Use the « il » form in the simple past.', it: 'Prendi la forma con « il » al passato remoto.', es: 'Toma la forma con « il » en pasado simple.' },
  'subjonctif:plus-que-parfait': { de: 'Hilfsverb im Subjunktiv Imparfait + Partizip Perfekt.', en: 'Auxiliary in the imperfect subjunctive + past participle.', it: 'Ausiliare al congiuntivo imperfetto + participio passato.', es: 'Auxiliar en subjuntivo imperfecto + participio pasado.' },
  'conditionnel:present': { de: 'Futurstamm + Imparfait-Endung.', en: 'Future stem + imperfect ending.', it: 'Radice del futuro + desinenza dell’imperfetto.', es: 'Raíz del futuro + terminación del imperfecto.' },
  'conditionnel:passe 1': { de: 'Hilfsverb im Konditional Präsens + Partizip Perfekt.', en: 'Auxiliary in the present conditional + past participle.', it: 'Ausiliare al condizionale presente + participio passato.', es: 'Auxiliar en condicional presente + participio pasado.' },
  'conditionnel:passe 2': { de: 'Hilfsverb im Subjunktiv Imparfait + Partizip Perfekt.', en: 'Auxiliary in the imperfect subjunctive + past participle.', it: 'Ausiliare al congiuntivo imperfetto + participio passato.', es: 'Auxiliar en subjuntivo imperfecto + participio pasado.' },
  'participe:present': { de: 'Präsensform mit « nous » ohne « -ons » + « -ant ».', en: 'Present-tense « nous » form without « -ons » + « -ant ».', it: 'Forma del presente con « nous » senza « -ons » + « -ant ».', es: 'Forma de presente con « nous » sin « -ons » + « -ant ».' },
  'participe:passe': { de: 'Das Partizip Perfekt ist eine Form, die gelernt werden muss.', en: 'The past participle is a form that must be learnt.', it: 'Il participio passato è una forma da imparare.', es: 'El participio pasado es una forma que hay que aprender.' },
  'gerondif:present': { de: '« en » + Partizip Präsens.', en: '« en » + present participle.', it: '« en » + participio presente.', es: '« en » + participio presente.' },
  'gerondif:passe': { de: '« en » + Partizip Präsens des Hilfsverbs + Partizip Perfekt.', en: '« en » + present participle of the auxiliary + past participle.', it: '« en » + participio presente dell’ausiliare + participio passato.', es: '« en » + participio presente del auxiliar + participio pasado.' },
}

const noteTranslations: Record<string, Record<ForeignLocale, string>> = {
  "Ce n'est pas un temps comme les autres. Il est utilisé pour une action proche.": { de: 'Diese Zeitform bezeichnet eine Handlung in naher Zukunft.', en: 'This tense describes an action in the near future.', it: 'Questo tempo indica un’azione nel futuro prossimo.', es: 'Este tiempo indica una acción en un futuro próximo.' },
  'Exception : être → ét-.': { de: 'Ausnahme: être → ét-.', en: 'Exception: être → ét-.', it: 'Eccezione: être → ét-.', es: 'Excepción: être → ét-.' },
  'Avec « tu » des verbes en « -er », enlève généralement le « s ».': { de: 'Bei « tu » fällt bei Verben auf « -er » das « s » normalerweise weg.', en: 'With « tu », usually remove the « s » from « -er » verbs.', it: 'Con « tu », nei verbi in « -er » elimina generalmente la « s ».', es: 'Con « tu », en los verbos en « -er » se suele quitar la « s ».' },
  'Enlève le « t » final s’il y en a.': { de: 'Entferne ein eventuell vorhandenes « t » am Ende.', en: 'Remove the final « t » if there is one.', it: 'Togli la « t » finale, se presente.', es: 'Quita la « t » final, si la hay.' },
  'Puis ajoute la terminaison du subjonctif imparfait.': { de: 'Füge dann die Endung des Subjunktiv Imparfait hinzu.', en: 'Then add the imperfect-subjunctive ending.', it: 'Poi aggiungi la desinenza del congiuntivo imperfetto.', es: 'Después añade la terminación del subjuntivo imperfecto.' },
  'Il est utilisé dans les temps composés.': { de: 'Es wird in den zusammengesetzten Zeitformen verwendet.', en: 'It is used in compound tenses.', it: 'Si usa nei tempi composti.', es: 'Se utiliza en los tiempos compuestos.' },
  'Ne construis pas sa réponse à partir de la forme habituelle du présent.': { de: 'Bilde die Antwort nicht aus der üblichen Präsensform.', en: 'Do not build the answer from the usual present-tense form.', it: 'Non costruire la risposta partendo dalla forma abituale del presente.', es: 'No construyas la respuesta a partir de la forma habitual del presente.' },
  'La règle « nous au présent sans -ons » ne fonctionne pas pour ce verbe.': { de: 'Die Regel « nous im Präsens ohne -ons » funktioniert bei diesem Verb nicht.', en: 'The “present-tense nous form without -ons” rule does not work for this verb.', it: 'La regola « nous al presente senza -ons » non funziona per questo verbo.', es: 'La regla « nous en presente sin -ons » no funciona con este verbo.' },
  'Exception : le participe présent de ce verbe est irrégulier et doit être appris par cœur.': { de: 'Ausnahme: Das Partizip Präsens dieses Verbs ist unregelmäßig und muss auswendig gelernt werden.', en: 'Exception: this verb has an irregular present participle that must be learnt by heart.', it: 'Eccezione: il participio presente di questo verbo è irregolare e va imparato a memoria.', es: 'Excepción: el participio presente de este verbo es irregular y debe aprenderse de memoria.' },
  'Avec un verbe pronominal, place « me, te, se, nous, vous, se » devant l’infinitif.': { de: 'Bei einem reflexiven Verb stehen « me, te, se, nous, vous, se » vor dem Infinitiv.', en: 'With a pronominal verb, place « me, te, se, nous, vous, se » before the infinitive.', it: 'Con un verbo pronominale, metti « me, te, se, nous, vous, se » davanti all’infinito.', es: 'Con un verbo pronominal, coloca « me, te, se, nous, vous, se » delante del infinitivo.' },
  'Avec un verbe pronominal, vérifie l’accord du participe passé : il dépend de la fonction du pronom et d’un éventuel COD.': { de: 'Prüfe bei einem reflexiven Verb die Angleichung des Partizips Perfekt: Sie hängt von der Funktion des Pronomens und einem möglichen direkten Objekt ab.', en: 'With a pronominal verb, check past-participle agreement: it depends on the pronoun’s function and any direct object.', it: 'Con un verbo pronominale, verifica la concordanza del participio passato: dipende dalla funzione del pronome e da un eventuale complemento oggetto.', es: 'Con un verbo pronominal, comprueba la concordancia del participio pasado: depende de la función del pronombre y de un posible complemento directo.' },
  'Avec « être », le participe passé s’accorde avec le sujet.': { de: 'Mit « être » wird das Partizip Perfekt an das Subjekt angeglichen.', en: 'With « être », the past participle agrees with the subject.', it: 'Con « être », il participio passato concorda con il soggetto.', es: 'Con « être », el participio pasado concuerda con el sujeto.' },
}

const ruleOverrides: Record<string, Record<ForeignLocale, string>> = {
  'Exception : ce verbe a des formes particulières à l’impératif, à apprendre par cœur.': { de: 'Ausnahme: Dieses Verb hat besondere Imperativformen, die auswendig gelernt werden müssen.', en: 'Exception: this verb has special imperative forms that must be learnt by heart.', it: 'Eccezione: questo verbo ha forme particolari all’imperativo, da imparare a memoria.', es: 'Excepción: este verbo tiene formas especiales de imperativo que deben aprenderse de memoria.' },
  'Exception : ce verbe a un participe présent irrégulier, à apprendre par cœur.': { de: 'Ausnahme: Dieses Verb hat ein unregelmäßiges Partizip Präsens, das auswendig gelernt werden muss.', en: 'Exception: this verb has an irregular present participle that must be learnt by heart.', it: 'Eccezione: questo verbo ha un participio presente irregolare, da imparare a memoria.', es: 'Excepción: este verbo tiene un participio presente irregular que debe aprenderse de memoria.' },
}

export function localizedCondensedTenseRule(
  locale: AppLocale,
  key: string,
  source: CoachCondensedTenseRule,
): CoachCondensedTenseRule {
  if (locale === 'fr') return source
  const [mode = '', tense = ''] = key.split(':')
  const modeLabel = modeNames[locale][mode] || mode
  const tenseLabel = tenseNames[locale][tense] || tense
  return {
    ...source,
    label: `${modeLabel} ${tenseLabel}`.trim(),
    rule: ruleOverrides[source.rule]?.[locale] || rules[key]?.[locale] || source.rule,
    notes: source.notes?.map(note => noteTranslations[note]?.[locale] || note),
  }
}

export const condensedExampleLabel: Record<AppLocale, string> = {
  fr: 'Exemple :',
  de: 'Beispiel:',
  en: 'Example:',
  it: 'Esempio:',
  es: 'Ejemplo:',
}
