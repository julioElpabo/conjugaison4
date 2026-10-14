import { withDutchVariants } from './dutch-variants'
import type { AppLocale } from './locales'

const copy = withDutchVariants({
  fr: {
    removeOne: 'Retirer de mes défis', select: 'Sélectionner', cancel: 'Annuler',
    selectAll: 'Tout sélectionner', deselectAll: 'Tout désélectionner',
    selectChallenge: (title: string) => `Sélectionner « ${title} »`,
    removeSelected: (count: number) => `Retirer les défis sélectionnés (${count})`,
    confirmTitle: (count: number) => count === 1 ? 'Retirer ce défi de ta liste ?' : `Retirer ces ${count} défis de ta liste ?`,
    scope: 'Les liens et les codes resteront utilisables. Ton historique et tes résultats seront conservés.',
    confirm: 'Retirer', pending: 'Retrait…', error: 'Impossible de retirer les défis. Réessaie dans un instant.',
    removed: (count: number) => count === 1 ? '1 défi retiré de tes défis.' : `${count} défis retirés de tes défis.`,
  },
  de: {
    removeOne: 'Aus meinen Herausforderungen entfernen', select: 'Auswählen', cancel: 'Abbrechen',
    selectAll: 'Alle auswählen', deselectAll: 'Auswahl aufheben',
    selectChallenge: (title: string) => `„${title}“ auswählen`,
    removeSelected: (count: number) => `Ausgewählte Herausforderungen entfernen (${count})`,
    confirmTitle: (count: number) => count === 1 ? 'Diese Herausforderung aus deiner Liste entfernen?' : `Diese ${count} Herausforderungen aus deiner Liste entfernen?`,
    scope: 'Die Links und Codes bleiben nutzbar. Dein Verlauf und deine Ergebnisse bleiben erhalten.',
    confirm: 'Entfernen', pending: 'Wird entfernt…', error: 'Die Herausforderungen konnten nicht entfernt werden. Versuche es erneut.',
    removed: (count: number) => count === 1 ? '1 Herausforderung aus deiner Liste entfernt.' : `${count} Herausforderungen aus deiner Liste entfernt.`,
  },
  en: {
    removeOne: 'Remove from my challenges', select: 'Select', cancel: 'Cancel',
    selectAll: 'Select all', deselectAll: 'Deselect all',
    selectChallenge: (title: string) => `Select “${title}”`,
    removeSelected: (count: number) => `Remove selected challenges (${count})`,
    confirmTitle: (count: number) => count === 1 ? 'Remove this challenge from your list?' : `Remove these ${count} challenges from your list?`,
    scope: 'The links and codes will still work. Your history and results will be kept.',
    confirm: 'Remove', pending: 'Removing…', error: 'Could not remove the challenges. Please try again.',
    removed: (count: number) => count === 1 ? '1 challenge removed from your challenges.' : `${count} challenges removed from your challenges.`,
  },
  it: {
    removeOne: 'Rimuovi dai miei esercizi', select: 'Seleziona', cancel: 'Annulla',
    selectAll: 'Seleziona tutto', deselectAll: 'Deseleziona tutto',
    selectChallenge: (title: string) => `Seleziona «${title}»`,
    removeSelected: (count: number) => `Rimuovi gli esercizi selezionati (${count})`,
    confirmTitle: (count: number) => count === 1 ? 'Rimuovere questo esercizio dalla tua lista?' : `Rimuovere questi ${count} esercizi dalla tua lista?`,
    scope: 'I link e i codici resteranno utilizzabili. La tua cronologia e i tuoi risultati saranno conservati.',
    confirm: 'Rimuovi', pending: 'Rimozione…', error: 'Impossibile rimuovere gli esercizi. Riprova tra un momento.',
    removed: (count: number) => count === 1 ? '1 esercizio rimosso dai tuoi esercizi.' : `${count} esercizi rimossi dai tuoi esercizi.`,
  },
  es: {
    removeOne: 'Quitar de mis ejercicios', select: 'Seleccionar', cancel: 'Cancelar',
    selectAll: 'Seleccionar todo', deselectAll: 'Deseleccionar todo',
    selectChallenge: (title: string) => `Seleccionar «${title}»`,
    removeSelected: (count: number) => `Quitar los ejercicios seleccionados (${count})`,
    confirmTitle: (count: number) => count === 1 ? '¿Quitar este ejercicio de tu lista?' : `¿Quitar estos ${count} ejercicios de tu lista?`,
    scope: 'Los enlaces y los códigos seguirán funcionando. Tu historial y tus resultados se conservarán.',
    confirm: 'Quitar', pending: 'Quitando…', error: 'No se pudieron quitar los ejercicios. Inténtalo de nuevo.',
    removed: (count: number) => count === 1 ? '1 ejercicio quitado de tus ejercicios.' : `${count} ejercicios quitados de tus ejercicios.`,
  },
  nl: {
    removeOne: 'Uit mijn uitdagingen verwijderen', select: 'Selecteren', cancel: 'Annuleren',
    selectAll: 'Alles selecteren', deselectAll: 'Alles deselecteren',
    selectChallenge: (title: string) => `‘${title}’ selecteren`,
    removeSelected: (count: number) => `Geselecteerde uitdagingen verwijderen (${count})`,
    confirmTitle: (count: number) => count === 1 ? 'Deze uitdaging uit je lijst verwijderen?' : `Deze ${count} uitdagingen uit je lijst verwijderen?`,
    scope: 'De links en codes blijven werken. Je geschiedenis en resultaten blijven bewaard.',
    confirm: 'Verwijderen', pending: 'Wordt verwijderd…', error: 'De uitdagingen konden niet worden verwijderd. Probeer het opnieuw.',
    removed: (count: number) => count === 1 ? '1 uitdaging uit je uitdagingen verwijderd.' : `${count} uitdagingen uit je uitdagingen verwijderd.`,
  },
})

export const savedChallengeRemovalCopy = (locale: AppLocale) => copy[locale]
