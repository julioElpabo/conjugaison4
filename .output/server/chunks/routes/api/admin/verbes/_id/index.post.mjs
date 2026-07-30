import { d as defineEventHandler, g as getRouterParam, r as readBody, c as createError, u as useDatabase } from '../../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../../_/session.mjs';
import { i as inferAnteposedComplement, r as resolveAnteposedComplement } from '../../../../../_/complement-placement.mjs';
import { n as normalizeComplementPreposition, w as withComplementPreposition } from '../../../../../_/complement-preposition.mjs';
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

function normalizeComplement(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}
const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  requireAdministrator(event);
  const verbId = Number.parseInt((_a = getRouterParam(event, "id")) != null ? _a : "", 10);
  const body = await readBody(event);
  const requestedConstructionId = Number(body == null ? void 0 : body.constructionId);
  const rawText = normalizeComplement(body == null ? void 0 : body.texte);
  const requestedNature = typeof (body == null ? void 0 : body.nature) === "string" ? body.nature : "nominal";
  const nature = ["nominal", "infinitif", "expression"].includes(requestedNature) ? requestedNature : null;
  const requestedGender = typeof (body == null ? void 0 : body.gender) === "string" ? body.gender : "";
  const requestedNumber = typeof (body == null ? void 0 : body.number) === "string" ? body.number : "";
  const requestedFunction = typeof (body == null ? void 0 : body.fonctionObjet) === "string" ? body.fonctionObjet.trim().toLocaleLowerCase("fr-CH") : "cod";
  const requestedPreposition = normalizeComplementPreposition(body == null ? void 0 : body.preposition);
  const gender = ["masculin", "feminin"].includes(requestedGender) ? requestedGender : null;
  const number = ["singulier", "pluriel"].includes(requestedNumber) ? requestedNumber : null;
  if (requestedGender && !gender || requestedNumber && !number || Boolean(gender) !== Boolean(number)) {
    throw createError({ statusCode: 400, statusMessage: "Le genre et le nombre doivent \xEAtre renseign\xE9s ensemble" });
  }
  if (!nature) {
    throw createError({ statusCode: 400, statusMessage: "Nature de compl\xE9ment invalide" });
  }
  if (!["cod", "coi"].includes(requestedFunction)) {
    throw createError({ statusCode: 400, statusMessage: "Fonction du compl\xE9ment invalide" });
  }
  if (requestedFunction === "coi" && !requestedPreposition) {
    throw createError({ statusCode: 400, statusMessage: "Choisis la pr\xE9position \xE0 ou de pour ce COI" });
  }
  if (!Number.isInteger(verbId) || verbId < 1) {
    throw createError({ statusCode: 400, statusMessage: "Verbe invalide" });
  }
  if ((body == null ? void 0 : body.constructionId) !== void 0 && (!Number.isInteger(requestedConstructionId) || requestedConstructionId < 1)) {
    throw createError({ statusCode: 400, statusMessage: "Construction invalide" });
  }
  if (rawText.length < 2 || rawText.length > 180) {
    throw createError({ statusCode: 400, statusMessage: "Le compl\xE9ment doit contenir entre 2 et 180 caract\xE8res" });
  }
  if (/[.!?,;:]$/.test(rawText)) {
    throw createError({ statusCode: 400, statusMessage: "Le compl\xE9ment ne doit pas se terminer par un signe de ponctuation" });
  }
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [[verb]] = await connection.execute(
      "SELECT id, auxiliaire FROM verbes WHERE id=? AND est_archive=0 LIMIT 1",
      [verbId]
    );
    if (!verb) throw createError({ statusCode: 404, statusMessage: "Verbe introuvable" });
    let construction;
    if (Number.isInteger(requestedConstructionId) && requestedConstructionId > 0) {
      const [rows] = await connection.execute(`
        SELECT cv.id, cv.code, cv.fonction_objet, cv.preposition, cv.patron
        FROM constructions_verbales cv
        INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
        WHERE cv.id=? AND vs.verbe_id=? AND cv.actif=1
        LIMIT 1
      `, [requestedConstructionId, verbId]);
      construction = rows[0];
      if (!construction) throw createError({ statusCode: 404, statusMessage: "Construction verbale introuvable" });
    } else {
      const targetPreposition = requestedFunction === "coi" ? requestedPreposition : null;
      const [existingConstructions] = await connection.execute(`
        SELECT cv.id, cv.code, cv.fonction_objet, cv.preposition, cv.patron
        FROM constructions_verbales cv
        INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
        WHERE vs.verbe_id=? AND cv.fonction_objet=? AND cv.preposition <=> ? AND cv.actif=1
        ORDER BY vs.est_principal DESC, vs.sort_order, cv.id
        LIMIT 1
      `, [verbId, requestedFunction, targetPreposition]);
      construction = existingConstructions[0];
      const transitivite = requestedFunction === "coi" ? "transitif_indirect" : "transitif_direct";
      const patron = requestedFunction === "coi" ? `N0 V ${targetPreposition} N1` : "N0 V N1";
      const intitule = requestedFunction === "coi" ? `Emploi indirect avec \xAB ${targetPreposition} \xBB` : "Emploi transitif direct";
      const code = requestedFunction === "coi" ? `coi-${targetPreposition === "\xE0" ? "a" : "de"}-postpose` : "cod-postpose";
      if (!construction) {
        const [senses] = await connection.execute(`
          SELECT id FROM verbe_sens
          WHERE verbe_id=? AND transitivite=? AND preposition <=> ?
          ORDER BY est_principal DESC, sort_order, id
          LIMIT 1
        `, [verbId, transitivite, targetPreposition]);
        let senseId = Number((_b = senses[0]) == null ? void 0 : _b.id);
        if (!senseId) {
          const [senseResult] = await connection.execute(`
            INSERT INTO verbe_sens
              (verbe_id, numero_sens, intitule, definition, construction, transitivite,
               preposition, auxiliaire, registre, est_pronominal, est_principal, source, sort_order)
            SELECT ?, COALESCE(MAX(numero_sens), 0) + 1, ?, ?, ?, ?, ?, ?, 'courant', 0, 0, 'manuel',
              COALESCE(MAX(sort_order), 0) + 1
            FROM verbe_sens WHERE verbe_id=?
          `, [
            verbId,
            intitule,
            `${intitule} ajout\xE9 depuis l\u2019administration`,
            patron,
            transitivite,
            targetPreposition,
            verb.auxiliaire || "avoir",
            verbId
          ]);
          senseId = Number(senseResult.insertId);
        }
        await connection.execute(`
          INSERT INTO constructions_verbales
            (sens_id, code, fonction_objet, preposition, patron, complement_obligatoire,
             source, statut_validation, actif)
          VALUES (?, ?, ?, ?, ?, 0, 'Saisie administrateur', 'valide', 1)
          ON DUPLICATE KEY UPDATE fonction_objet=VALUES(fonction_objet),
            preposition=VALUES(preposition), patron=VALUES(patron), actif=1,
            statut_validation='valide'
        `, [senseId, code, requestedFunction, targetPreposition, patron]);
        const [rows] = await connection.execute(`
          SELECT id, code, fonction_objet, preposition, patron
          FROM constructions_verbales
          WHERE sens_id=? AND code=?
          LIMIT 1
        `, [senseId, code]);
        construction = rows[0];
        if (!construction) throw createError({ statusCode: 500, statusMessage: "Impossible de cr\xE9er la construction verbale" });
      }
    }
    const constructionId = Number(construction.id);
    const constructionPreposition = normalizeComplementPreposition(construction.preposition);
    const texte = construction.fonction_objet === "coi" && constructionPreposition ? withComplementPreposition(rawText, constructionPreposition) : rawText;
    if (texte.length > 180) {
      throw createError({
        statusCode: 400,
        statusMessage: "Le compl\xE9ment avec sa pr\xE9position ne doit pas d\xE9passer 180 caract\xE8res"
      });
    }
    const inferred = inferAnteposedComplement(texte);
    if (construction.fonction_objet === "coi" && !constructionPreposition) {
      throw createError({ statusCode: 422, statusMessage: "Choisis d\u2019abord la pr\xE9position de cette construction COI" });
    }
    if (construction.fonction_objet === "coi" && nature === "nominal" && (!gender || !number)) {
      throw createError({
        statusCode: 422,
        statusMessage: "Pr\xE9cise le genre et le nombre de ce compl\xE9ment nominal",
        data: { code: "COMPLEMENT_GRAMMAR_REQUIRED" }
      });
    }
    if (construction.fonction_objet === "cod" && !inferred && (!gender || !number)) {
      throw createError({
        statusCode: 422,
        statusMessage: "Pr\xE9cise le genre et le nombre de ce COD",
        data: { code: "COMPLEMENT_GRAMMAR_REQUIRED" }
      });
    }
    const placement = construction.fonction_objet === "cod" ? resolveAnteposedComplement(texte, gender, number) : nature === "nominal" ? { text: null, gender, number } : null;
    const [[existing]] = await connection.execute(`
      SELECT id, actif FROM complements_verbaux
      WHERE construction_id=? AND texte=?
      LIMIT 1
    `, [constructionId, texte]);
    if (existing && Boolean(existing.actif)) {
      throw createError({ statusCode: 409, statusMessage: "Ce compl\xE9ment existe d\xE9j\xE0" });
    }
    const [[count]] = await connection.execute(`
      SELECT COUNT(*) AS total FROM complements_verbaux
      WHERE construction_id=? AND actif=1
    `, [constructionId]);
    if (Number((count == null ? void 0 : count.total) || 0) >= 30) {
      throw createError({ statusCode: 400, statusMessage: "Cette construction poss\xE8de d\xE9j\xE0 le maximum de 30 compl\xE9ments" });
    }
    let complementId;
    if (existing) {
      await connection.execute(`
        UPDATE complements_verbaux
        SET actif=1, statut_validation='valide', source='Saisie administrateur',
          texte_antepose=?, genre=?, nombre=?
        WHERE id=?
      `, [(_c = placement == null ? void 0 : placement.text) != null ? _c : null, (_d = placement == null ? void 0 : placement.gender) != null ? _d : null, (_e = placement == null ? void 0 : placement.number) != null ? _e : null, existing.id]);
      complementId = Number(existing.id);
    } else {
      const [result] = await connection.execute(`
        INSERT INTO complements_verbaux
          (construction_id, texte, texte_antepose, genre, nombre, poids, source, statut_validation, actif)
        VALUES (?, ?, ?, ?, ?, 1, 'Saisie administrateur', 'valide', 1)
      `, [constructionId, texte, (_f = placement == null ? void 0 : placement.text) != null ? _f : null, (_g = placement == null ? void 0 : placement.gender) != null ? _g : null, (_h = placement == null ? void 0 : placement.number) != null ? _h : null]);
      complementId = Number(result.insertId);
    }
    await connection.commit();
    return {
      ok: true,
      construction: {
        id: constructionId,
        code: construction.code,
        fonctionObjet: construction.fonction_objet,
        preposition: construction.preposition,
        patron: construction.patron
      },
      complement: {
        id: complementId,
        texte,
        genre: (_i = placement == null ? void 0 : placement.gender) != null ? _i : null,
        nombre: (_j = placement == null ? void 0 : placement.number) != null ? _j : null
      }
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
