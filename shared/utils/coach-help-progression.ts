import type { AppLocale } from '../i18n/locales'

export function coachHelpProgressionNotice(locale: AppLocale, revealed: boolean) {
  const notices = {
    fr: ['Essaie d’abord : la réponse sera disponible dans cette aide après une erreur.', 'La réponse est maintenant disponible dans cette aide.'],
    en: ['Try first: the answer will be available in this help after an incorrect attempt.', 'The answer is now available in this help.'],
    de: ['Versuche es zuerst: Nach einer falschen Antwort wird die Lösung in dieser Hilfe angezeigt.', 'Die Lösung ist jetzt in dieser Hilfe verfügbar.'],
    it: ['Prova prima: la risposta sarà disponibile in questo aiuto dopo un errore.', 'La risposta è ora disponibile in questo aiuto.'],
    es: ['Inténtalo primero: la respuesta estará disponible en esta ayuda después de un error.', 'La respuesta ya está disponible en esta ayuda.'],
    nl: ['Probeer het eerst: na een fout antwoord verschijnt de oplossing in deze hulp.', 'De oplossing is nu beschikbaar in deze hulp.'],
  }
  return notices[locale === 'nl-NL' ? 'nl' : locale][revealed ? 1 : 0]!
}
