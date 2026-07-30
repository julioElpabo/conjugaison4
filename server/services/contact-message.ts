import nodemailer from 'nodemailer'
import { createError } from 'h3'
import type { ContactSettings } from './contact-settings'

export interface ContactMessageInput {
  email?: unknown
  subject?: unknown
  message?: unknown
}

export interface ContactMessage {
  email: string
  subject: string
  message: string
}

function cleanLine(value: unknown) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]+/gu, ' ').replace(/\s+/gu, ' ').trim()
    : ''
}

function cleanMessage(value: unknown) {
  return typeof value === 'string'
    ? value.replace(/\r\n?/gu, '\n').replace(/\u0000/gu, '').trim()
    : ''
}

export function validateContactMessage(
  input: ContactMessageInput,
  settings: Pick<ContactSettings, 'subjectMinLength' | 'subjectMaxLength' | 'messageMinLength' | 'messageMaxLength' | 'maxLinks'>,
): ContactMessage {
  const email = cleanLine(input.email).toLocaleLowerCase()
  const subject = cleanLine(input.subject)
  const message = cleanMessage(input.message)
  const linkCount = (message.match(/(?:https?:\/\/|www\.)/giu) || []).length
  const excessiveRepetition = /(.)\1{14,}/u.test(message)

  if (
    email.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email)
    || subject.length < settings.subjectMinLength
    || subject.length > settings.subjectMaxLength
    || message.length < settings.messageMinLength
    || message.length > settings.messageMaxLength
    || linkCount > settings.maxLinks
    || excessiveRepetition
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message invalide',
      message: 'Le message ne respecte pas les critères du formulaire.',
    })
  }

  return { email, subject, message }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/gu, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]!)
}

export async function sendContactMessage(contact: ContactMessage, recipient: string) {
  const config = useRuntimeConfig()
  if (!recipient) throw new Error('Adresse de contact non configurée')

  const smtpHost = String(config.smtpHost || '').trim()
  const smtpUser = String(config.smtpUser || '').trim()
  const transporter = smtpHost
    ? nodemailer.createTransport({
        host: smtpHost,
        port: Number(config.smtpPort || 587),
        secure: Boolean(config.smtpSecure),
        auth: smtpUser
          ? { user: smtpUser, pass: String(config.smtpPassword || '') }
          : undefined,
      })
    : nodemailer.createTransport({ sendmail: true, newline: 'unix', path: '/usr/sbin/sendmail' })

  const from = String(config.contactFromEmail || smtpUser || 'no-reply@tatitotu.ch').trim()
  const safeSubject = contact.subject.replace(/[\r\n]+/gu, ' ')
  const safeMessage = escapeHtml(contact.message).replace(/\n/gu, '<br>')

  await transporter.sendMail({
    from: `"TATITOTU" <${from}>`,
    to: recipient,
    replyTo: contact.email,
    subject: `[TATITOTU] ${safeSubject}`,
    text: `Message envoyé depuis TATITOTU\n\nDe : ${contact.email}\nObjet : ${safeSubject}\n\n${contact.message}`,
    html: `<p><strong>Message envoyé depuis TATITOTU</strong></p><p><strong>De :</strong> ${escapeHtml(contact.email)}<br><strong>Objet :</strong> ${escapeHtml(safeSubject)}</p><p>${safeMessage}</p>`,
  })
}
