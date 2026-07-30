import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise'
import { createError } from 'h3'

export interface ContactSettings {
  enabled: boolean
  contactEmail: string
  subjectMinLength: number
  subjectMaxLength: number
  messageMinLength: number
  messageMaxLength: number
  maxLinks: number
  shortRateLimit: number
  shortRateWindowMinutes: number
  dailyRateLimit: number
}

interface ContactSettingsRow extends RowDataPacket {
  enabled: number | boolean
  contactEmail: string
  subjectMinLength: number
  subjectMaxLength: number
  messageMinLength: number
  messageMaxLength: number
  maxLinks: number
  shortRateLimit: number
  shortRateWindowMinutes: number
  dailyRateLimit: number
}

type Database = Pool | PoolConnection

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  enabled: true,
  contactEmail: 'christophe.roulet@edu-vd.ch',
  subjectMinLength: 5,
  subjectMaxLength: 120,
  messageMinLength: 20,
  messageMaxLength: 3000,
  maxLinks: 2,
  shortRateLimit: 3,
  shortRateWindowMinutes: 120,
  dailyRateLimit: 8,
}

function integer(value: unknown, minimum: number, maximum: number, label: string) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Réglages invalides',
      message: `${label} doit être compris entre ${minimum} et ${maximum}.`,
    })
  }
  return parsed
}

export function validateContactSettings(input: Partial<Record<keyof ContactSettings, unknown>>): ContactSettings {
  const contactEmail = typeof input.contactEmail === 'string'
    ? input.contactEmail.trim().toLocaleLowerCase()
    : ''
  if (
    contactEmail.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(contactEmail)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Adresse destinataire invalide' })
  }

  const settings: ContactSettings = {
    enabled: input.enabled === true,
    contactEmail,
    subjectMinLength: integer(input.subjectMinLength, 1, 100, 'La longueur minimale de l’objet'),
    subjectMaxLength: integer(input.subjectMaxLength, 5, 200, 'La longueur maximale de l’objet'),
    messageMinLength: integer(input.messageMinLength, 1, 500, 'La longueur minimale du message'),
    messageMaxLength: integer(input.messageMaxLength, 100, 10_000, 'La longueur maximale du message'),
    maxLinks: integer(input.maxLinks, 0, 10, 'Le nombre de liens'),
    shortRateLimit: integer(input.shortRateLimit, 1, 100, 'La limite courte'),
    shortRateWindowMinutes: integer(input.shortRateWindowMinutes, 5, 1440, 'La durée de la limite courte'),
    dailyRateLimit: integer(input.dailyRateLimit, 1, 500, 'La limite journalière'),
  }

  if (settings.subjectMinLength > settings.subjectMaxLength) {
    throw createError({ statusCode: 400, statusMessage: 'La longueur minimale de l’objet dépasse sa longueur maximale' })
  }
  if (settings.messageMinLength > settings.messageMaxLength) {
    throw createError({ statusCode: 400, statusMessage: 'La longueur minimale du message dépasse sa longueur maximale' })
  }
  if (settings.shortRateLimit > settings.dailyRateLimit) {
    throw createError({ statusCode: 400, statusMessage: 'La limite courte dépasse la limite journalière' })
  }

  return settings
}

export async function getContactSettings(database: Database = useDatabase()): Promise<ContactSettings> {
  const [[row]] = await database.execute<ContactSettingsRow[]>(`
    SELECT
      is_enabled AS enabled,
      contact_email AS contactEmail,
      subject_min_length AS subjectMinLength,
      subject_max_length AS subjectMaxLength,
      message_min_length AS messageMinLength,
      message_max_length AS messageMaxLength,
      max_links AS maxLinks,
      short_rate_limit AS shortRateLimit,
      short_rate_window_minutes AS shortRateWindowMinutes,
      daily_rate_limit AS dailyRateLimit
    FROM contact_settings
    WHERE id = 1
  `)
  if (!row) return { ...DEFAULT_CONTACT_SETTINGS }
  return {
    enabled: Boolean(row.enabled),
    contactEmail: row.contactEmail,
    subjectMinLength: Number(row.subjectMinLength),
    subjectMaxLength: Number(row.subjectMaxLength),
    messageMinLength: Number(row.messageMinLength),
    messageMaxLength: Number(row.messageMaxLength),
    maxLinks: Number(row.maxLinks),
    shortRateLimit: Number(row.shortRateLimit),
    shortRateWindowMinutes: Number(row.shortRateWindowMinutes),
    dailyRateLimit: Number(row.dailyRateLimit),
  }
}

export async function saveContactSettings(database: Database, settings: ContactSettings) {
  await database.execute(`
    INSERT INTO contact_settings (
      id, is_enabled, contact_email,
      subject_min_length, subject_max_length,
      message_min_length, message_max_length, max_links,
      short_rate_limit, short_rate_window_minutes, daily_rate_limit
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      is_enabled = VALUES(is_enabled),
      contact_email = VALUES(contact_email),
      subject_min_length = VALUES(subject_min_length),
      subject_max_length = VALUES(subject_max_length),
      message_min_length = VALUES(message_min_length),
      message_max_length = VALUES(message_max_length),
      max_links = VALUES(max_links),
      short_rate_limit = VALUES(short_rate_limit),
      short_rate_window_minutes = VALUES(short_rate_window_minutes),
      daily_rate_limit = VALUES(daily_rate_limit)
  `, [
    settings.enabled ? 1 : 0,
    settings.contactEmail,
    settings.subjectMinLength,
    settings.subjectMaxLength,
    settings.messageMinLength,
    settings.messageMaxLength,
    settings.maxLinks,
    settings.shortRateLimit,
    settings.shortRateWindowMinutes,
    settings.dailyRateLimit,
  ])
}
