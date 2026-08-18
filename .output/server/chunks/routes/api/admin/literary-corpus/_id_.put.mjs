import { d as defineEventHandler, g as getRouterParam, c as createError, r as readBody, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'web-push';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

function closestOccurrence(sentence, form, reference) {
  const positions = [];
  let position = sentence.indexOf(form);
  while (position >= 0) {
    positions.push(position);
    position = sentence.indexOf(form, position + 1);
  }
  if (!positions.length) {
    const foldedSentence = sentence.toLocaleLowerCase("fr");
    const foldedForm = form.toLocaleLowerCase("fr");
    position = foldedSentence.indexOf(foldedForm);
    while (position >= 0) {
      positions.push(position);
      position = foldedSentence.indexOf(foldedForm, position + 1);
    }
  }
  if (!positions.length) return -1;
  return positions.reduce((closest, candidate) => Math.abs(candidate - reference) < Math.abs(closest - reference) ? candidate : closest);
}
const _id__put = defineEventHandler(async (event) => {
  var _a;
  const administrator = requireAdministrator(event);
  const id = Number.parseInt(String(getRouterParam(event, "id") || "0"), 10);
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "Citation invalide" });
  const body = await readBody(event);
  const requestedStatus = typeof (body == null ? void 0 : body.status) === "string" ? body.status : "";
  if (!["candidate", "validated", "reserve", "rejected"].includes(requestedStatus)) {
    throw createError({ statusCode: 400, statusMessage: "Statut de validation inconnu" });
  }
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) || null : null;
  const requestedTargetText = typeof body.targetText === "string" ? body.targetText.trim() : null;
  if (requestedTargetText !== null && (!requestedTargetText || requestedTargetText.length > 255)) {
    throw createError({ statusCode: 400, statusMessage: "La forme cibl\xE9e doit contenir entre 1 et 255 caract\xE8res" });
  }
  const requestedSentenceText = typeof body.sentenceText === "string" ? body.sentenceText.replace(/\s+/gu, " ").trim() : null;
  if (requestedSentenceText !== null && (!requestedSentenceText || requestedSentenceText.length > 1e3)) {
    throw createError({ statusCode: 400, statusMessage: "La phrase doit contenir entre 1 et 1 000 caract\xE8res" });
  }
  const database = useDatabase();
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [[target]] = await connection.execute(`
      SELECT target.id,target.sentence_id AS sentenceId,target.verb_id AS verbId,target.tense_id AS tenseId,target.person_id AS personId,
             sentence.sentence_text AS sentenceText,target.target_text AS targetText,target.target_start AS targetStart
      FROM literary_targets target
      INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
      WHERE target.id=? FOR UPDATE
    `, [id]);
    if (!target) throw createError({ statusCode: 404, statusMessage: "Citation introuvable" });
    let effectiveStatus = requestedStatus;
    let message = "";
    if (effectiveStatus === "validated") {
      const [[selection]] = await connection.execute(`
        SELECT COUNT(*) AS count FROM literary_targets
        WHERE id<>? AND verb_id=? AND tense_id=? AND person_id=? AND review_status='validated'
      `, [id, target.verbId, target.tenseId, target.personId]);
      if (Number((selection == null ? void 0 : selection.count) || 0) >= 10) {
        effectiveStatus = "reserve";
        message = "La limite de 10 citations valid\xE9es pour ce verbe, ce temps et cette personne est atteinte : phrase mise en r\xE9serve.";
      }
    }
    const workingSentence = requestedSentenceText != null ? requestedSentenceText : target.sentenceText;
    const workingTargetText = requestedTargetText != null ? requestedTargetText : target.targetText;
    let targetStart = Number(target.targetStart);
    let targetEnd = null;
    if (requestedTargetText !== null || requestedSentenceText !== null) {
      targetStart = closestOccurrence(workingSentence, workingTargetText, Number(target.targetStart));
      if (targetStart < 0) {
        throw createError({ statusCode: 400, statusMessage: "Cette forme ne figure pas dans la phrase" });
      }
      targetEnd = targetStart + workingTargetText.length;
    }
    if (requestedSentenceText !== null) {
      const [sentenceTargets] = await connection.execute(`
        SELECT id,target_text AS targetText,target_start AS targetStart
        FROM literary_targets WHERE sentence_id=? FOR UPDATE
      `, [target.sentenceId]);
      const adjustedTargets = sentenceTargets.map((sentenceTarget) => {
        const form = Number(sentenceTarget.id) === id ? workingTargetText : sentenceTarget.targetText;
        const start = closestOccurrence(requestedSentenceText, form, Number(sentenceTarget.targetStart));
        if (start < 0) {
          throw createError({ statusCode: 400, statusMessage: `La forme \xAB ${form} \xBB doit rester pr\xE9sente dans la phrase` });
        }
        return { id: Number(sentenceTarget.id), start, end: start + form.length };
      });
      const words = ((_a = requestedSentenceText.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)) == null ? void 0 : _a.length) || 0;
      await connection.execute(`
        UPDATE literary_sentences SET sentence_text=?,word_count=?,character_count=? WHERE id=?
      `, [requestedSentenceText, words, requestedSentenceText.length, target.sentenceId]);
      for (const adjusted of adjustedTargets) {
        await connection.execute("UPDATE literary_targets SET target_start=?,target_end=? WHERE id=?", [
          adjusted.start,
          adjusted.end,
          adjusted.id
        ]);
      }
    }
    await connection.execute(`
      UPDATE literary_targets
      SET review_status=?,review_note=?,reviewed_by=?,reviewed_at=CURRENT_TIMESTAMP,
          target_text=COALESCE(?,target_text),target_start=?,target_end=COALESCE(?,target_end)
      WHERE id=?
    `, [effectiveStatus, note, administrator.id, requestedTargetText, targetStart, targetEnd, id]);
    await connection.commit();
    return { ok: true, status: effectiveStatus, message };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
