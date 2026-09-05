
import { withDutchVariants } from '../i18n/dutch-variants'
import { localeLanguageTag, type AppLocale } from '../i18n/locales'

const DAY_MS = 86_400_000
const dateParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit',
})
const labels = withDutchVariants({
  fr: { today: 'Aujourd’hui', yesterday: 'Hier', week: 'La semaine dernière', school: 'Année scolaire', unknown: 'Date inconnue' },
  de: { today: 'Heute', yesterday: 'Gestern', week: 'Letzte Woche', school: 'Schuljahr', unknown: 'Datum unbekannt' },
  en: { today: 'Today', yesterday: 'Yesterday', week: 'Last week', school: 'School year', unknown: 'Unknown date' },
  it: { today: 'Oggi', yesterday: 'Ieri', week: 'La settimana scorsa', school: 'Anno scolastico', unknown: 'Data sconosciuta' },
  es: { today: 'Hoy', yesterday: 'Ayer', week: 'La semana pasada', school: 'Curso escolar', unknown: 'Fecha desconocida' }, nl: { today: "Vandaag", yesterday: "Gisteren", week: "Vorige week", school: "Schooljaar", unknown: "Onbekende datum" },
})

function calendarDate(date: Date) {
  const parts = Object.fromEntries(dateParts.formatToParts(date).map(part => [part.type, part.value]))
  const year = Number(parts.year)
  const month = Number(parts.month)
  const day = Number(parts.day)
  return { year, month, day, ordinal: Date.UTC(year, month - 1, day) / DAY_MS, iso: `${parts.year}-${parts.month}-${parts.day}` }
}

function shortDate(date: Date, locale: AppLocale) {
  if (locale !== 'fr') {
    return new Intl.DateTimeFormat(localeLanguageTag(locale), {
      timeZone: 'Europe/Zurich', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    }).format(date)
  }
  const { year, month, day, ordinal } = calendarDate(date)
  const weekday = ['di', 'lu', 'ma', 'me', 'je', 've', 'sa'][new Date(ordinal * DAY_MS).getUTCDay()]
  const monthLabel = ['jan', 'fev', 'mar', 'avr', 'mai', 'juin', 'juil', 'aout', 'sep', 'oct', 'nov', 'dec'][month - 1]
  return `${weekday} ${day} ${monthLabel} ${year}`
}

export function groupSavedChallenges<T extends { savedAt: string }>(challenges: readonly T[], now: Date, locale: AppLocale) {
  const today = calendarDate(now)
  const currentSchoolYear = today.year - (today.month < 8 ? 1 : 0)
  const copy = labels[locale]
  const groups = new Map<string, { key: string, title: string, entries: Array<{ challenge: T, dateLabel: string, dateTime?: string }> }>()
  const sorted = challenges.map(challenge => ({ challenge, date: new Date(challenge.savedAt) }))
    .sort((a, b) => (Number.isNaN(b.date.getTime()) ? -Infinity : b.date.getTime())
      - (Number.isNaN(a.date.getTime()) ? -Infinity : a.date.getTime()))

  for (const { challenge, date } of sorted) {
    let key = 'unknown'
    let title: string = copy.unknown
    let dateLabel: string = copy.unknown
    let dateTime: string | undefined
    if (!Number.isNaN(date.getTime())) {
      const saved = calendarDate(date)
      const age = today.ordinal - saved.ordinal
      const schoolYear = saved.year - (saved.month < 8 ? 1 : 0)
      // Les périodes récentes sont glissantes, exclusives et prioritaires
      // sur les années scolaires, même au passage de juillet à août.
      key = age <= 0 ? 'today' : age === 1 ? 'yesterday' : age <= 7 ? 'week'
        : age <= 30 ? `month-${saved.iso.slice(0, 7)}` : schoolYear === currentSchoolYear ? 'school' : `${schoolYear}-${schoolYear + 1}`
      title = key in copy ? copy[key as keyof typeof copy] : key
      if (key.startsWith('month-')) {
        const monthName = new Intl.DateTimeFormat(localeLanguageTag(locale), { timeZone: 'Europe/Zurich', month: 'long' }).format(date)
        title = `${monthName.charAt(0).toLocaleUpperCase(locale)}${monthName.slice(1)} ${String(saved.year).slice(-2)}`
      } else if (key === 'school') {
        title = `${copy.school} ${currentSchoolYear}-${currentSchoolYear + 1}`
      }
      dateLabel = shortDate(date, locale)
      dateTime = saved.iso
    }
    if (!groups.has(key)) groups.set(key, { key, title, entries: [] })
    groups.get(key)!.entries.push({ challenge, dateLabel, dateTime })
  }
  return [...groups.values()]
}
