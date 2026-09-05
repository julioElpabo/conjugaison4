/** Une base commune et quelques choix éditoriaux pour les Pays-Bas. */
const netherlandsWording: Record<string, string> = {
  'Je bent meer waard dan je punten': 'Je bent meer waard dan je cijfers',
  'Voor leerkrachten': 'Voor leraren',
  'Inschakelen op dit toestel': 'Inschakelen op dit apparaat',
  'Ingeschakeld op dit toestel': 'Ingeschakeld op dit apparaat',
  'Berichten om op dit toestel te ontvangen': 'Berichten om op dit apparaat te ontvangen',
  'Vertrek opnieuw van de volledige verbetering:': 'Ga opnieuw uit van de volledige correctie:',
}

export function netherlandsText(text: string): string {
  return netherlandsWording[text] ?? text
}

function adaptDutch<T>(value: T): T {
  if (typeof value === 'string') return netherlandsText(value) as T
  if (typeof value === 'function') {
    return ((...args: unknown[]) => adaptDutch(value(...args))) as T
  }
  if (Array.isArray(value)) return value.map(adaptDutch) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, adaptDutch(entry)])) as T
  }
  return value
}

export function withDutchVariants<T extends { nl: unknown }>(translations: T): T & { 'nl-NL': T['nl'] } {
  return { ...translations, 'nl-NL': adaptDutch(translations.nl) }
}
