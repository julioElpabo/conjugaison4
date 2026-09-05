
import { withDutchVariants } from './dutch-variants'
import type { AppLocale } from './locales'

const copy = withDutchVariants({
  fr: {
    scopeHint: 'Ces modifications concernent uniquement « Mes défis ».',
    edit: 'Modifier', title: 'Titre du défi', description: 'Description', optional: 'Facultative', save: 'Enregistrer', saving: 'Enregistrement…', cancel: 'Annuler', saved: 'Modifications enregistrées.',
    copy: 'Copier le code', copied: 'Code copié !', copyError: 'Copie impossible. Sélectionne le code pour le copier.', code: 'Code du défi',
    expand: 'Agrandir le QR code', scan: 'Scannez pour ouvrir le défi', close: 'Fermer', launch: 'Lancer le défi',
    questions: 'Questions', verbs: 'Verbes', tenses: 'Temps', error: 'Impossible d’enregistrer. Réessaie dans un instant.',
  },
  de: {
    scopeHint: 'Diese Änderungen gelten nur für „Meine Herausforderungen“.',
    edit: 'Bearbeiten', title: 'Titel der Übung', description: 'Beschreibung', optional: 'Optional', save: 'Speichern', saving: 'Wird gespeichert…', cancel: 'Abbrechen', saved: 'Änderungen gespeichert.',
    copy: 'Code kopieren', copied: 'Code kopiert!', copyError: 'Kopieren fehlgeschlagen. Markiere den Code zum Kopieren.', code: 'Übungscode',
    expand: 'QR-Code vergrößern', scan: 'Scannen und die Übung öffnen', close: 'Schließen', launch: 'Übung starten',
    questions: 'Fragen', verbs: 'Verben', tenses: 'Zeitformen', error: 'Speichern fehlgeschlagen. Versuche es erneut.',
  },
  en: {
    scopeHint: 'These changes apply only to “My challenges”.',
    edit: 'Edit', title: 'Challenge title', description: 'Description', optional: 'Optional', save: 'Save', saving: 'Saving…', cancel: 'Cancel', saved: 'Changes saved.',
    copy: 'Copy code', copied: 'Code copied!', copyError: 'Copy failed. Select the code to copy it.', code: 'Challenge code',
    expand: 'Enlarge QR code', scan: 'Scan to open the challenge', close: 'Close', launch: 'Start challenge',
    questions: 'Questions', verbs: 'Verbs', tenses: 'Tenses', error: 'Could not save. Please try again.',
  },
  it: {
    scopeHint: 'Queste modifiche riguardano solo « I miei esercizi ».',
    edit: 'Modifica', title: 'Titolo dell’esercizio', description: 'Descrizione', optional: 'Facoltativa', save: 'Salva', saving: 'Salvataggio…', cancel: 'Annulla', saved: 'Modifiche salvate.',
    copy: 'Copia il codice', copied: 'Codice copiato!', copyError: 'Copia non riuscita. Seleziona il codice per copiarlo.', code: 'Codice dell’esercizio',
    expand: 'Ingrandisci il codice QR', scan: 'Scansiona per aprire l’esercizio', close: 'Chiudi', launch: 'Avvia l’esercizio',
    questions: 'Domande', verbs: 'Verbi', tenses: 'Tempi', error: 'Salvataggio non riuscito. Riprova tra un momento.',
  },
  es: {
    scopeHint: 'Estos cambios solo se aplican a « Mis ejercicios ».',
    edit: 'Editar', title: 'Título del ejercicio', description: 'Descripción', optional: 'Opcional', save: 'Guardar', saving: 'Guardando…', cancel: 'Cancelar', saved: 'Cambios guardados.',
    copy: 'Copiar el código', copied: '¡Código copiado!', copyError: 'No se pudo copiar. Selecciona el código para copiarlo.', code: 'Código del ejercicio',
    expand: 'Ampliar el código QR', scan: 'Escanea para abrir el ejercicio', close: 'Cerrar', launch: 'Iniciar el ejercicio',
    questions: 'Preguntas', verbs: 'Verbos', tenses: 'Tiempos', error: 'No se pudo guardar. Inténtalo de nuevo.',
  }, nl: {
    scopeHint: "Deze wijzigingen gelden alleen voor ‘Mijn uitdagingen’.",
    edit: "Wijzigen", title: "Titel van de uitdaging", description: "Beschrijving", optional: "Optioneel", save: "Opslaan", saving: "Wordt opgeslagen…", cancel: "Annuleren", saved: "Wijzigingen opgeslagen.",
    copy: "Code kopiëren", copied: "Code gekopieerd!", copyError: "Kopiëren mislukt. Selecteer de code om die te kopiëren.", code: "Code van de uitdaging",
    expand: "QR-code vergroten", scan: "Scan om de uitdaging te openen", close: "Sluiten", launch: "Uitdaging starten",
    questions: "Vragen", verbs: "Werkwoorden", tenses: "Tijden", error: "Opslaan mislukt. Probeer het opnieuw.",
  },
})

export const savedChallengeCardCopy = (locale: AppLocale) => copy[locale]
