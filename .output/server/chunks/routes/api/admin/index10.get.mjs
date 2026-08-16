import { d as defineEventHandler, u as useDatabase, a as getQuery } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
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

const allowedStatuses = /* @__PURE__ */ new Set(["candidate", "validated", "reserve", "rejected", "all"]);
const index_get = defineEventHandler(async (event) => {
  var _a;
  requireAdministrator(event);
  const database = useDatabase();
  const query = getQuery(event);
  const status = allowedStatuses.has(String(query.status)) ? String(query.status) : "candidate";
  const confidence = ["high", "ambiguous"].includes(String(query.confidence)) ? String(query.confidence) : "";
  const search = String(query.search || "").trim().slice(0, 100);
  const verbId = Number.parseInt(String(query.verbId || "0"), 10) || 0;
  const modeId = Number.parseInt(String(query.modeId || "0"), 10) || 0;
  const tenseId = Number.parseInt(String(query.tenseId || "0"), 10) || 0;
  const personId = Number.parseInt(String(query.personId || "0"), 10) || 0;
  const sourceId = Number.parseInt(String(query.sourceId || "0"), 10) || 0;
  const limit = Math.min(200, Math.max(1, Number.parseInt(String(query.limit || "100"), 10) || 100));
  const offset = Math.max(0, Number.parseInt(String(query.offset || "0"), 10) || 0);
  const clauses = [];
  const values = [];
  if (status !== "all") {
    clauses.push("target.review_status=?");
    values.push(status);
  }
  if (confidence) {
    clauses.push("target.confidence=?");
    values.push(confidence);
  }
  if (search) {
    clauses.push("(sentence.sentence_text LIKE ? OR verb.infinitif LIKE ? OR source.title LIKE ? OR source.author LIKE ?)");
    values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (verbId > 0) {
    clauses.push("target.verb_id=?");
    values.push(verbId);
  }
  if (modeId > 0) {
    clauses.push("mode.id=?");
    values.push(modeId);
  }
  if (tenseId > 0) {
    clauses.push("target.tense_id=?");
    values.push(tenseId);
  }
  if (personId > 0) {
    clauses.push("target.person_id=?");
    values.push(personId);
  }
  if (sourceId > 0) {
    clauses.push("sentence.source_id=?");
    values.push(sourceId);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [[rows], [totalRows]] = await Promise.all([
    database.execute(`
    SELECT target.id,target.sentence_id AS sentenceId,sentence.sentence_text AS text,
           sentence.chapter,sentence.locator,sentence.word_count AS wordCount,
           target.target_text AS targetText,target.target_start AS targetStart,target.target_end AS targetEnd,
           target.confidence,target.ambiguity_reason AS ambiguityReason,
           target.review_status AS reviewStatus,target.review_note AS reviewNote,target.reviewed_at AS reviewedAt,
           target.verb_id AS verbId,verb.infinitif,target.tense_id AS tenseId,
           tense.name AS tense,mode.id AS modeId,mode.name AS mode,target.person_id AS personId,person.pronom AS pronoun,
           (SELECT COUNT(*) FROM literary_targets counted
            WHERE counted.verb_id=target.verb_id AND counted.tense_id=target.tense_id
              AND counted.person_id=target.person_id AND counted.review_status='validated') AS validatedForSelection,
           source.id AS sourceId,source.author,source.title AS work,COALESCE(sentence.source_url,source.source_url) AS sourceUrl
    FROM literary_targets target
    INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
    INNER JOIN literary_sources source ON source.id=sentence.source_id
    INNER JOIN verbes verb ON verb.id=target.verb_id
    INNER JOIN temps tense ON tense.id=target.tense_id
    INNER JOIN modes mode ON mode.id=tense.mode_id
    INNER JOIN personnes person ON person.id=target.person_id
    ${where}
    ORDER BY CASE target.confidence WHEN 'high' THEN 0 ELSE 1 END,
             sentence.word_count,target.id
    LIMIT ${limit} OFFSET ${offset}
    `, values),
    database.execute(`
      SELECT COUNT(*) AS total
      FROM literary_targets target
      INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
      INNER JOIN literary_sources source ON source.id=sentence.source_id
      INNER JOIN verbes verb ON verb.id=target.verb_id
      INNER JOIN temps tense ON tense.id=target.tense_id
      INNER JOIN modes mode ON mode.id=tense.mode_id
      INNER JOIN personnes person ON person.id=target.person_id
      ${where}
    `, values)
  ]);
  const [counts] = await database.query(`
    SELECT review_status AS status,COUNT(*) AS count
    FROM literary_targets GROUP BY review_status
  `);
  const facetClauses = [];
  const facetValues = [];
  if (status !== "all") {
    facetClauses.push("target.review_status=?");
    facetValues.push(status);
  }
  if (confidence) {
    facetClauses.push("target.confidence=?");
    facetValues.push(confidence);
  }
  if (search) {
    facetClauses.push("(sentence.sentence_text LIKE ? OR verb.infinitif LIKE ? OR source.title LIKE ? OR source.author LIKE ?)");
    facetValues.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (sourceId > 0) {
    facetClauses.push("sentence.source_id=?");
    facetValues.push(sourceId);
  }
  const facetWhere = facetClauses.length ? `WHERE ${facetClauses.join(" AND ")}` : "";
  const [[modes], [tenses], [persons], [verbs], [sources], [facetRows]] = await Promise.all([
    database.query("SELECT id,name AS label FROM modes ORDER BY `order`,id"),
    database.query("SELECT id,mode_id AS modeId,name AS label FROM temps ORDER BY mode_id,id"),
    database.query("SELECT id,pronom AS label FROM personnes ORDER BY `order`,ordre,id"),
    database.query("SELECT id,infinitif AS label FROM verbes WHERE est_archive=0 ORDER BY infinitif,id"),
    database.query(`
      SELECT DISTINCT source.id,source.title AS label,source.author
      FROM literary_sources source
      INNER JOIN literary_sentences sentence ON sentence.source_id=source.id
      INNER JOIN literary_targets target ON target.sentence_id=sentence.id
      ORDER BY source.title,source.author,source.id
    `),
    database.execute(`
      SELECT target.verb_id AS verbId,tense.mode_id AS modeId,target.tense_id AS tenseId,
             target.person_id AS personId,COUNT(*) AS count
      FROM literary_targets target
      INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
      INNER JOIN literary_sources source ON source.id=sentence.source_id
      INNER JOIN verbes verb ON verb.id=target.verb_id
      INNER JOIN temps tense ON tense.id=target.tense_id
      ${facetWhere}
      GROUP BY target.verb_id,tense.mode_id,target.tense_id,target.person_id
    `, facetValues)
  ]);
  const numericFacets = facetRows.map((row) => ({
    verbId: Number(row.verbId),
    modeId: Number(row.modeId),
    tenseId: Number(row.tenseId),
    personId: Number(row.personId),
    count: Number(row.count)
  }));
  const sumFacets = (predicate) => numericFacets.filter(predicate).reduce((sum, row) => sum + row.count, 0);
  const verbOptions = verbs.map((row) => ({
    id: Number(row.id),
    label: row.label,
    count: sumFacets((facet) => facet.verbId === Number(row.id) && (!modeId || facet.modeId === modeId) && (!tenseId || facet.tenseId === tenseId) && (!personId || facet.personId === personId))
  })).sort((left, right) => Number(right.count > 0) - Number(left.count > 0) || left.label.localeCompare(right.label, "fr"));
  const modeOptions = modes.map((row) => ({
    id: Number(row.id),
    label: row.label,
    count: sumFacets((facet) => facet.modeId === Number(row.id) && (!verbId || facet.verbId === verbId))
  }));
  const tenseOptions = tenses.map((row) => ({
    id: Number(row.id),
    modeId: Number(row.modeId),
    label: row.label,
    count: sumFacets((facet) => facet.tenseId === Number(row.id) && (!verbId || facet.verbId === verbId))
  }));
  const personOptions = persons.map((row) => ({
    id: Number(row.id),
    label: row.label,
    count: sumFacets((facet) => facet.personId === Number(row.id) && (!verbId || facet.verbId === verbId) && (!modeId || facet.modeId === modeId) && (!tenseId || facet.tenseId === tenseId))
  }));
  return {
    targets: rows.map((row) => ({
      ...row,
      id: Number(row.id),
      sentenceId: Number(row.sentenceId),
      wordCount: Number(row.wordCount),
      targetStart: Number(row.targetStart),
      targetEnd: Number(row.targetEnd),
      verbId: Number(row.verbId),
      modeId: Number(row.modeId),
      tenseId: Number(row.tenseId),
      personId: Number(row.personId),
      sourceId: Number(row.sourceId),
      validatedForSelection: Number(row.validatedForSelection)
    })),
    counts: Object.fromEntries(["candidate", "validated", "reserve", "rejected"].map((key) => {
      var _a2;
      return [
        key,
        Number(((_a2 = counts.find((row) => row.status === key)) == null ? void 0 : _a2.count) || 0)
      ];
    })),
    limit,
    offset,
    total: Number(((_a = totalRows[0]) == null ? void 0 : _a.total) || 0),
    navigation: {
      sources: sources.map((row) => ({ id: Number(row.id), label: row.label, author: row.author })),
      verbs: verbOptions,
      modes: modeOptions,
      tenses: tenseOptions,
      persons: personOptions
    }
  };
});

export { index_get as default };
//# sourceMappingURL=index10.get.mjs.map
