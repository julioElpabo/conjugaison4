import { aa as agreePastParticiple, ab as splitPastParticipleAgreement, d as defineEventHandler, g as getRouterParam, c as createError, u as useDatabase, L as decodePronominalSelectionId } from '../../../nitro/nitro.mjs';
import { g as generatePronominalRow } from '../../../_/pronominal-formatter.mjs';
import { b as buildNearFutureParadigm } from '../../../_/near-future.mjs';
import { i as inferAnteposedComplement } from '../../../_/complement-placement.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:url';
import 'node:fs/promises';

function cleanPhrase(value) {
  return value.replace(/\s+/gu, " ").replace(/[.!?]+$/gu, "").trim();
}
function sentenceCase(value) {
  return value.charAt(0).toLocaleUpperCase("fr") + value.slice(1);
}
function normalizedGender(value) {
  if (!value) return null;
  const normalized = value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("fr");
  if (normalized === "feminin") return "feminin";
  if (normalized === "masculin") return "masculin";
  return null;
}
function normalizedNumber(value) {
  if (!value) return null;
  const normalized = value.toLocaleLowerCase("fr");
  if (normalized === "singulier" || normalized === "pluriel") return normalized;
  return null;
}
function splitAnteposedComplement(value) {
  const complement = cleanPhrase(value);
  const match = complement.match(
    /^(.+?)\s+((?:à\s+(?:l['’]|la\b|le\b|un\b|une\b|des\b)|au\b|aux\b|dans\b|sur\b|sous(?!-)\b|chez\b|vers\b|en\b|pour\b|par\b|avec\b|sans\b).*)$/iu
  );
  return match ? { cod: match[1].trim(), following: match[2].trim() } : { cod: complement, following: "" };
}
function buildPastParticipleAgreementExample(participle, complements) {
  var _a, _b, _c, _d;
  for (const complement of complements) {
    const inferred = inferAnteposedComplement(complement.texte);
    const gender = (_b = (_a = normalizedGender(complement.genre)) != null ? _a : inferred == null ? void 0 : inferred.gender) != null ? _b : null;
    const number = (_d = (_c = normalizedNumber(complement.nombre)) != null ? _c : inferred == null ? void 0 : inferred.number) != null ? _d : null;
    if (!gender || !number || gender === "masculin" && number === "singulier") continue;
    const agreedParticiple = agreePastParticiple(participle, gender, number);
    const splitParticiple = splitPastParticipleAgreement(participle, agreedParticiple);
    if (!splitParticiple.agreement) continue;
    const afterComplement = cleanPhrase(complement.texte);
    const beforeComplement = splitAnteposedComplement(complement.texte_antepose || (inferred == null ? void 0 : inferred.text) || "");
    if (!afterComplement || !beforeComplement.cod) continue;
    return {
      afterSentence: `Il a ${participle} ${afterComplement}.`,
      beforeSentenceStart: `${sentenceCase(beforeComplement.cod)} qu\u2019il a `,
      agreedParticipleStart: splitParticiple.unchanged,
      agreementLetters: splitParticiple.agreement,
      beforeSentenceEnd: `${beforeComplement.following ? ` ${beforeComplement.following}` : ""}.`,
      cod: beforeComplement.cod,
      gender,
      number
    };
  }
  return void 0;
}

function parseAllowedPeople(value) {
  if (Array.isArray(value)) return value.map(Number);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(Number) : null;
  } catch {
    return null;
  }
}
function pronominalParticiple(value, hType) {
  return value.split("-").map((form) => form.trim()).filter(Boolean).map((form) => {
    const first = form.normalize("NFD").replace(/\p{Diacritic}/gu, "").charAt(0).toLocaleLowerCase("fr");
    const elided = "aeiouy".includes(first) || first === "h" && hType !== "aspire";
    return `${elided ? "s'" : "se "}${form}`;
  }).join("-");
}
function publicConjugations(rows) {
  return rows.map((row) => ({
    id: Number(row.id),
    personId: Number(row.personne_id),
    tenseId: Number(row.temp_id),
    pronoun: row.pronom,
    forms: [...new Set([row.conjugaison1, row.conjugaison2, row.conjugaison3].map((form) => form == null ? void 0 : form.trim()).filter((form) => Boolean(form)))]
  })).filter((row) => row.forms.length > 0);
}
function nearFutureAuxiliaryForms(rows) {
  return rows.map((row) => ({
    personId: Number(row.personne_id),
    pronoun: row.pronom,
    forms: [...new Set([row.conjugaison1, row.conjugaison2, row.conjugaison3].map((form) => form == null ? void 0 : form.trim()).filter((form) => Boolean(form)))]
  }));
}
const nearFutureTenseQuery = `
  SELECT t.id
  FROM temps t
  INNER JOIN modes m ON m.id = t.mode_id
  WHERE m.name = 'indicatif' AND (t.code = 'near-future' OR t.name = 'futur proche')
  ORDER BY t.id
  LIMIT 1
`;
const nearFutureAllerQuery = `
  SELECT vc.personne_id, p.pronom,
         vc.conjugaison1, vc.conjugaison2, vc.conjugaison3
  FROM verbesconjugues vc
  INNER JOIN verbes v ON v.id = vc.verbe_id
  INNER JOIN personnes p ON p.id = vc.personne_id
  INNER JOIN temps t ON t.id = vc.temp_id
  INNER JOIN modes m ON m.id = t.mode_id
  WHERE v.infinitif = 'aller' AND m.name = 'indicatif'
    AND t.name = 'pr\xE9sent' AND vc.conjugaison1 <> ''
  ORDER BY p.id
`;
const _id__get = defineEventHandler(async (event) => {
  var _a, _b;
  const rawId = (_a = getRouterParam(event, "id")) != null ? _a : "";
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id === 0) {
    throw createError({ statusCode: 400, statusMessage: "Identifiant de verbe invalide" });
  }
  const database = useDatabase();
  if (id > 0) {
    const [[verbs], [conjugations], [nearFutureTenses2], [allerRows2], [agreementComplements]] = await Promise.all([
      database.execute(`
        SELECT id, infinitif, \`participe_pr\xE9sent\` AS participe_present,
          \`participe_pass\xE9\` AS participe_passe, auxiliaire, groupe_conjugaison,
          est_impersonnel, est_defectif, type_pronominal, type_h_initial, personnes_disponibles
        FROM verbes
        WHERE id = ? AND est_archive = 0
        LIMIT 1
      `, [id]),
      database.execute(`
        SELECT vc.id, vc.verbe_id, vc.personne_id, vc.temp_id,
          vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
          v.infinitif, v.auxiliaire, v.\`participe_pass\xE9\` AS participe_passe,
          p.pronom, t.name AS temps_name, t.isTempsCompose AS is_compound, m.name AS mode_name
        FROM verbesconjugues vc
        INNER JOIN verbes v ON v.id = vc.verbe_id
        INNER JOIN personnes p ON p.id = vc.personne_id
        INNER JOIN temps t ON t.id = vc.temp_id
        INNER JOIN modes m ON m.id = t.mode_id
        WHERE vc.verbe_id = ? AND vc.conjugaison1 <> ''
        ORDER BY t.id, p.id
      `, [id]),
      database.execute(nearFutureTenseQuery),
      database.execute(nearFutureAllerQuery),
      database.execute(`
        SELECT c.texte, c.texte_antepose, c.genre, c.nombre
        FROM verbe_sens vs
        INNER JOIN constructions_verbales cv ON cv.sens_id=vs.id
        INNER JOIN complements_verbaux c ON c.construction_id=cv.id
        WHERE vs.verbe_id=?
          AND cv.actif=1 AND cv.statut_validation='valide' AND cv.fonction_objet='cod'
          AND c.actif=1 AND c.statut_validation='valide'
        ORDER BY (c.genre='feminin' AND c.nombre='pluriel') DESC,
          (c.genre='feminin' OR c.nombre='pluriel') DESC, c.poids DESC, c.id
      `, [id])
    ]);
    const verb = verbs[0];
    if (!verb) throw createError({ statusCode: 404, statusMessage: "Verbe introuvable" });
    const nearFutureTense2 = nearFutureTenses2[0];
    const nearFuture2 = nearFutureTense2 ? buildNearFutureParadigm(
      Number(nearFutureTense2.id),
      id,
      verb.infinitif,
      nearFutureAuxiliaryForms(allerRows2),
      {
        typeHInitial: verb.type_h_initial,
        allowedPersonIds: parseAllowedPeople(verb.personnes_disponibles)
      }
    ) : [];
    return {
      verb: {
        id: Number(verb.id),
        infinitif: verb.infinitif,
        participePresent: verb.participe_present,
        participePasse: verb.participe_passe,
        auxiliaire: verb.auxiliaire,
        groupeConjugaison: verb.groupe_conjugaison ? Number(verb.groupe_conjugaison) : null,
        estImpersonnel: Boolean(verb.est_impersonnel),
        estDefectif: Boolean(verb.est_defectif),
        typePronominal: verb.type_pronominal || "aucun"
      },
      conjugations: [...publicConjugations(conjugations), ...nearFuture2],
      trapExampleComplement: (_b = agreementComplements.find((complement) => complement.texte.trim())) == null ? void 0 : _b.texte.trim(),
      pastParticipleAgreement: verb.auxiliaire.toLocaleLowerCase("fr") === "avoir" ? buildPastParticipleAgreementExample(verb.participe_passe, agreementComplements) : void 0
    };
  }
  const useId = decodePronominalSelectionId(id);
  const [[uses], [sourceRows], [auxiliaryRows], [nearFutureTenses], [allerRows]] = await Promise.all([
    database.execute(`
      SELECT ep.id AS use_id, ep.infinitif_pronominal, ep.type_emploi, ep.regle_accord,
        ep.personnes_autorisees,
        v.id, v.infinitif, v.\`participe_pr\xE9sent\` AS participe_present,
        v.\`participe_pass\xE9\` AS participe_passe, v.auxiliaire, v.groupe_conjugaison,
        v.est_impersonnel, v.est_defectif, v.type_pronominal, v.type_h_initial
      FROM emplois_pronominaux ep
      INNER JOIN verbes v ON v.id = ep.verbe_id AND v.est_archive = 0
      WHERE ep.id = ? AND ep.actif = 1
      LIMIT 1
    `, [useId]),
    database.execute(`
      SELECT vc.id, -ep.id AS verbe_id, vc.personne_id, vc.temp_id,
        vc.conjugaison1 AS base_conjugaison1, vc.conjugaison2 AS base_conjugaison2,
        vc.conjugaison3 AS base_conjugaison3, vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
        ep.id AS pronominal_use_id, ep.infinitif_pronominal, ep.regle_accord,
        ep.personnes_autorisees, base.type_h_initial, base.infinitif, base.auxiliaire,
        base.\`participe_pass\xE9\` AS participe_passe, p.pronom,
        t.name AS temps_name, t.isTempsCompose AS is_compound, m.name AS mode_name
      FROM emplois_pronominaux ep
      INNER JOIN verbes base ON base.id = ep.verbe_id AND base.est_archive = 0
      INNER JOIN verbesconjugues vc ON vc.verbe_id = base.id
      INNER JOIN personnes p ON p.id = vc.personne_id
      INNER JOIN temps t ON t.id = vc.temp_id
      INNER JOIN modes m ON m.id = t.mode_id
      WHERE ep.id = ? AND ep.actif = 1 AND vc.conjugaison1 <> ''
      ORDER BY t.id, p.id
    `, [useId]),
    database.execute(`
      SELECT vc.personne_id, m.name AS mode_name, t.name AS temps_name, vc.conjugaison1
      FROM verbesconjugues vc
      INNER JOIN verbes v ON v.id = vc.verbe_id
      INNER JOIN temps t ON t.id = vc.temp_id
      INNER JOIN modes m ON m.id = t.mode_id
      WHERE v.infinitif = '\xEAtre' AND t.isTempsCompose = 0 AND vc.conjugaison1 <> ''
    `),
    database.execute(nearFutureTenseQuery),
    database.execute(nearFutureAllerQuery)
  ]);
  const use = uses[0];
  if (!use) throw createError({ statusCode: 404, statusMessage: "Verbe introuvable" });
  const generated = sourceRows.filter((row) => {
    var _a2;
    const allowed = parseAllowedPeople((_a2 = row.personnes_autorisees) != null ? _a2 : null);
    return allowed === null || allowed.includes(Number(row.personne_id));
  }).map((row) => ({ ...generatePronominalRow(row, auxiliaryRows), pronom: row.pronom }));
  const nearFutureTense = nearFutureTenses[0];
  const nearFuture = nearFutureTense ? buildNearFutureParadigm(
    Number(nearFutureTense.id),
    id,
    use.infinitif_pronominal,
    nearFutureAuxiliaryForms(allerRows),
    {
      typeHInitial: use.type_h_initial,
      allowedPersonIds: parseAllowedPeople(use.personnes_autorisees)
    }
  ) : [];
  return {
    verb: {
      id,
      infinitif: use.infinitif_pronominal,
      participePresent: pronominalParticiple(use.participe_present, use.type_h_initial),
      participePasse: use.participe_passe,
      auxiliaire: "\xEAtre",
      groupeConjugaison: use.groupe_conjugaison ? Number(use.groupe_conjugaison) : null,
      estImpersonnel: Boolean(use.est_impersonnel),
      estDefectif: Boolean(use.est_defectif),
      typePronominal: use.type_emploi === "essentiel" ? "essentiel" : "occasionnel"
    },
    conjugations: [...publicConjugations(generated), ...nearFuture]
  };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
