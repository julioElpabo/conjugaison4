import { c as createError, m as useRuntimeConfig, d as defineEventHandler, q as setResponseHeader, t as getContactSettings } from '../../nitro/nitro.mjs';
import nodemailer from 'nodemailer';
import { a as assertPublicApiRateLimit } from '../../_/public-api-rate-limit.mjs';
import { a as assertTurnstile } from '../../_/turnstile.mjs';
import { r as readLimitedJsonBody } from '../../_/limited-json-body.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

function cleanLine(value) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]+/gu, " ").replace(/\s+/gu, " ").trim() : "";
}
function cleanMessage(value) {
  return typeof value === "string" ? value.replace(/\r\n?/gu, "\n").replace(/\u0000/gu, "").trim() : "";
}
function validateContactMessage(input, settings) {
  const email = cleanLine(input.email).toLocaleLowerCase();
  const subject = cleanLine(input.subject);
  const message = cleanMessage(input.message);
  const linkCount = (message.match(/(?:https?:\/\/|www\.)/giu) || []).length;
  const excessiveRepetition = /(.)\1{14,}/u.test(message);
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email) || subject.length < settings.subjectMinLength || subject.length > settings.subjectMaxLength || message.length < settings.messageMinLength || message.length > settings.messageMaxLength || linkCount > settings.maxLinks || excessiveRepetition) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message invalide",
      message: "Le message ne respecte pas les crit\xE8res du formulaire."
    });
  }
  return { email, subject, message };
}
function escapeHtml(value) {
  return value.replace(/[&<>"']/gu, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}
async function sendContactMessage(contact, recipient) {
  const config = useRuntimeConfig();
  if (!recipient) throw new Error("Adresse de contact non configur\xE9e");
  const smtpHost = String(config.smtpHost || "").trim();
  const smtpUser = String(config.smtpUser || "").trim();
  const transporter = smtpHost ? nodemailer.createTransport({
    host: smtpHost,
    port: Number(config.smtpPort || 587),
    secure: Boolean(config.smtpSecure),
    auth: smtpUser ? { user: smtpUser, pass: String(config.smtpPassword || "") } : void 0
  }) : nodemailer.createTransport({ sendmail: true, newline: "unix", path: "/usr/sbin/sendmail" });
  const from = String(config.contactFromEmail || smtpUser || "no-reply@tatitotu.ch").trim();
  const safeSubject = contact.subject.replace(/[\r\n]+/gu, " ");
  const safeMessage = escapeHtml(contact.message).replace(/\n/gu, "<br>");
  await transporter.sendMail({
    from: `"TATITOTU" <${from}>`,
    to: recipient,
    replyTo: contact.email,
    subject: `[TATITOTU] ${safeSubject}`,
    text: `Message envoy\xE9 depuis TATITOTU

De : ${contact.email}
Objet : ${safeSubject}

${contact.message}`,
    html: `<p><strong>Message envoy\xE9 depuis TATITOTU</strong></p><p><strong>De :</strong> ${escapeHtml(contact.email)}<br><strong>Objet :</strong> ${escapeHtml(safeSubject)}</p><p>${safeMessage}</p>`
  });
}

const contact_post = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const body = await readLimitedJsonBody(event, 8 * 1024);
  const honeypot = typeof body.website === "string" ? body.website.trim() : "";
  if (honeypot) return { ok: true };
  const settings = await getContactSettings();
  if (!settings.enabled) {
    throw createError({ statusCode: 503, statusMessage: "Le formulaire de contact est temporairement ferm\xE9" });
  }
  await assertPublicApiRateLimit(event, {
    bucket: "contact-short",
    maximum: settings.shortRateLimit,
    windowSeconds: settings.shortRateWindowMinutes * 60
  });
  await assertPublicApiRateLimit(event, {
    bucket: "contact-daily",
    maximum: settings.dailyRateLimit,
    windowSeconds: 24 * 60 * 60
  });
  const contact = validateContactMessage(body, settings);
  await assertTurnstile(event, body.turnstileToken, "contact", {
    optionalWhenUnconfigured: true
  });
  try {
    await sendContactMessage(contact, settings.contactEmail);
  } catch (error) {
    console.error("[contact] \xC9chec de l\u2019envoi du message.", error);
    throw createError({
      statusCode: 503,
      statusMessage: "Le message ne peut pas \xEAtre envoy\xE9 actuellement"
    });
  }
  return { ok: true };
});

export { contact_post as default };
//# sourceMappingURL=contact.post.mjs.map
