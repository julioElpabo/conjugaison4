import { d as defineEventHandler, g as getRouterParam, r as readBody, c as createError, u as useDatabase, N as refreshVerbMetadata } from '../../../../nitro/nitro.mjs';
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

function text(value, maximum = 255) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}
function textArray(value, maximumItems = 40) {
  if (!Array.isArray(value) || value.length > maximumItems) {
    throw createError({ statusCode: 400, statusMessage: "\xC9tiquettes invalides" });
  }
  return [...new Set(value.map((item) => text(item, 64)).filter(Boolean))];
}
function selectedNumber(value, allowed, label) {
  if (value === null || value === "") return null;
  const number = Number(value);
  if (!allowed.includes(number)) {
    throw createError({ statusCode: 400, statusMessage: `${label} invalide` });
  }
  return number;
}
function validConjugations(value) {
  if (!Array.isArray(value) || value.length > 500) {
    throw createError({ statusCode: 400, statusMessage: "Conjugaisons invalides" });
  }
  const unique = /* @__PURE__ */ new Set();
  return value.map((item) => {
    const personId = Number(item.personId);
    const tenseId = Number(item.tenseId);
    const key = `${personId}:${tenseId}`;
    if (!Number.isInteger(personId) || !Number.isInteger(tenseId) || unique.has(key)) {
      throw createError({ statusCode: 400, statusMessage: "Conjugaisons invalides" });
    }
    unique.add(key);
    return {
      personId,
      tenseId,
      conjugaison1: text(item.conjugaison1),
      conjugaison2: text(item.conjugaison2),
      conjugaison3: text(item.conjugaison3)
    };
  }).filter((item) => item.conjugaison1 || item.conjugaison2 || item.conjugaison3);
}
async function replaceConjugations(connection, verbId, infinitif, conjugations) {
  await connection.execute("DELETE FROM verbesconjugues WHERE verbe_id = ?", [verbId]);
  for (const item of conjugations) {
    await connection.execute(`
      INSERT INTO verbesconjugues
        (verbe_id, verbe_infinitif, personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      verbId,
      infinitif,
      item.personId,
      item.tenseId,
      item.conjugaison1,
      item.conjugaison2,
      item.conjugaison3
    ]);
  }
}
const _id__put = defineEventHandler(async (event) => {
  var _a, _b, _c;
  requireAdministrator(event);
  const id = Number.parseInt((_a = getRouterParam(event, "id")) != null ? _a : "", 10);
  const body = await readBody(event);
  const infinitif = text(body == null ? void 0 : body.infinitif);
  const participePresent = text(body == null ? void 0 : body.participePresent);
  const participePasse = text(body == null ? void 0 : body.participePasse);
  const auxiliaire = text(body == null ? void 0 : body.auxiliaire);
  const conjugations = validConjugations(body == null ? void 0 : body.conjugations);
  const classificationProvided = body && Object.prototype.hasOwnProperty.call(body, "meaning");
  const classification = classificationProvided ? {
    meaning: text(body.meaning, 4e3),
    group: selectedNumber(body.groupeConjugaison, [1, 2, 3], "Groupe"),
    family: text(body.familleConjugaison, 64),
    ending: text(body.terminaison, 12).replace(/^-+/u, ""),
    pronominal: text(body.typePronominal, 16),
    impersonal: Boolean(body.estImpersonnel),
    defective: Boolean(body.estDefectif),
    difficulty: selectedNumber(body.niveauDifficulte, [1, 2, 3], "Niveau de difficult\xE9"),
    cefr: text(body.niveauCecrl, 2).toUpperCase(),
    register: text(body.registrePrincipal, 24),
    canonical: text(body.formeCanonique),
    status: text(body.statutValidation, 16),
    features: textArray(body.particularites),
    schoolLevels: textArray(body.niveauxScolaires),
    cifLevels: textArray(body.parcoursCif),
    categories: textArray(body.categoriesSemantiques)
  } : null;
  if (classification && (!classification.group || !classification.family || !classification.ending || !["aucun", "occasionnel", "essentiel"].includes(classification.pronominal) || classification.cefr && !["A1", "A2", "B1", "B2", "C1", "C2"].includes(classification.cefr) || !classification.register || !classification.canonical || !["genere", "a_verifier", "valide"].includes(classification.status))) {
    throw createError({ statusCode: 400, statusMessage: "Classement grammatical ou d\xE9finition invalide" });
  }
  if (!Number.isInteger(id) || id < 1 || !infinitif || !auxiliaire) {
    throw createError({ statusCode: 400, statusMessage: "Donn\xE9es du verbe invalides" });
  }
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(`
      UPDATE verbes
      SET infinitif = ?, \`participe_pr\xE9sent\` = ?, \`participe_pass\xE9\` = ?, auxiliaire = ?
      WHERE id = ?
    `, [infinitif, participePresent, participePasse, auxiliaire, id]);
    if ("affectedRows" in result && result.affectedRows === 0) {
      throw createError({ statusCode: 404, statusMessage: "Verbe introuvable" });
    }
    await replaceConjugations(connection, id, infinitif, conjugations);
    await refreshVerbMetadata(connection, id);
    if (classification) {
      const [familyRows] = await connection.execute(
        "SELECT id FROM familles_conjugaison WHERE slug=? LIMIT 1",
        [classification.family]
      );
      const familyId = Number((_b = familyRows[0]) == null ? void 0 : _b.id);
      if (!familyId) {
        throw createError({ statusCode: 400, statusMessage: "Famille de conjugaison inconnue" });
      }
      await connection.execute(`UPDATE verbes SET groupe_conjugaison=?, famille_conjugaison_id=?,
        terminaison_infinitif=?, type_pronominal=?, est_impersonnel=?, est_defectif=?,
        niveau_difficulte=?, niveau_cecrl=?, registre_principal=?, forme_canonique=?,
        statut_validation=?, particularites=?, niveaux_scolaires=?, parcours_cif=? WHERE id=?`, [
        classification.group,
        familyId,
        classification.ending,
        classification.pronominal,
        classification.impersonal ? 1 : 0,
        classification.defective ? 1 : 0,
        classification.difficulty,
        classification.cefr || null,
        classification.register,
        classification.canonical,
        classification.status,
        JSON.stringify(classification.features),
        JSON.stringify(classification.schoolLevels),
        JSON.stringify(classification.cifLevels),
        id
      ]);
      const [senseRows] = await connection.execute(
        "SELECT id FROM verbe_sens WHERE verbe_id=? ORDER BY est_principal DESC, numero_sens, id LIMIT 1",
        [id]
      );
      const senseId = Number((_c = senseRows[0]) == null ? void 0 : _c.id);
      if (!senseId) {
        throw createError({ statusCode: 500, statusMessage: "Sens principal introuvable" });
      }
      await connection.execute("UPDATE verbe_sens SET definition=? WHERE id=?", [classification.meaning || null, senseId]);
      await connection.execute("DELETE FROM verbe_sens_categories WHERE sens_id=?", [senseId]);
      for (const slug of classification.categories) {
        const [categoryResult] = await connection.execute(`INSERT INTO verbe_sens_categories (sens_id, categorie_id)
          SELECT ?, id FROM categories_semantiques WHERE slug=?`, [senseId, slug]);
        if ("affectedRows" in categoryResult && categoryResult.affectedRows !== 1) {
          throw createError({ statusCode: 400, statusMessage: "Cat\xE9gorie s\xE9mantique inconnue" });
        }
      }
    }
    await connection.execute("DELETE FROM coach_help_verb_reviews WHERE verb_id=?", [id]);
    await connection.execute("DELETE FROM coach_help_automatic_reviews WHERE verb_id=?", [id]);
    await connection.commit();
    return { ok: true, id };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
