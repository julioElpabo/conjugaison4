import { d as defineEventHandler, g as getRouterParam, c as createError, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  requireAdministrator(event);
  const id = Number.parseInt((_a = getRouterParam(event, "id")) != null ? _a : "", 10);
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: "Identifiant de verbe invalide" });
  }
  const database = useDatabase();
  const [[verb], [conjugations], [categories], [complements], [families], [availableCategories], [meanings]] = await Promise.all([
    database.execute(`
      SELECT v.id, v.infinitif,
        v.\`participe_pr\xE9sent\` AS participe_present,
        v.\`participe_pass\xE9\` AS participe_passe,
        v.auxiliaire, v.groupe_conjugaison, f.slug AS famille_conjugaison, v.terminaison_infinitif,
        v.type_pronominal, v.est_impersonnel, v.est_defectif, v.niveau_difficulte, v.niveau_cecrl,
        v.registre_principal, v.forme_canonique, v.statut_validation, v.particularites,
        v.niveaux_scolaires, v.parcours_cif
      FROM verbes v
      LEFT JOIN familles_conjugaison f ON f.id = v.famille_conjugaison_id
      WHERE v.id = ?
      LIMIT 1
    `, [id]),
    database.execute(`
      SELECT vc.id, vc.personne_id AS personId, vc.temp_id AS tenseId,
        vc.conjugaison1, vc.conjugaison2, vc.conjugaison3, p.pronom
      FROM verbesconjugues vc
      LEFT JOIN personnes p ON p.id=vc.personne_id
      WHERE vc.verbe_id = ?
      ORDER BY vc.temp_id, vc.personne_id
    `, [id]),
    database.execute(`
      SELECT DISTINCT cs.slug, cs.label, cs.sort_order FROM verbe_sens vs
      INNER JOIN verbe_sens_categories vsc ON vsc.sens_id=vs.id
      INNER JOIN categories_semantiques cs ON cs.id=vsc.categorie_id
      WHERE vs.verbe_id=? AND vs.est_principal=1 ORDER BY cs.sort_order, cs.label
    `, [id]),
    database.execute(`
      SELECT cv.id AS construction_id, c.id AS complement_id, cv.code, cv.fonction_objet, cv.preposition,
             cv.patron, c.texte, c.genre, c.nombre
      FROM verbe_sens vs
      INNER JOIN constructions_verbales cv ON cv.sens_id=vs.id AND cv.actif=1
      LEFT JOIN complements_verbaux c ON c.construction_id=cv.id AND c.actif=1
      WHERE vs.verbe_id=?
      ORDER BY cv.id, c.id
    `, [id]),
    database.execute(`
      SELECT slug, label FROM familles_conjugaison ORDER BY label, slug
    `),
    database.execute(`
      SELECT slug, label, sort_order FROM categories_semantiques ORDER BY sort_order, label
    `),
    database.execute(`
      SELECT definition, intitule FROM verbe_sens
      WHERE verbe_id=? ORDER BY est_principal DESC, numero_sens, sort_order, id LIMIT 1
    `, [id])
  ]);
  if (!verb[0]) {
    throw createError({ statusCode: 404, statusMessage: "Verbe introuvable" });
  }
  const array = (value) => {
    if (Array.isArray(value)) return value;
    try {
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  };
  const constructions = [...new Map(complements.map((row) => [Number(row.construction_id), {
    id: Number(row.construction_id),
    code: row.code,
    fonctionObjet: row.fonction_objet,
    preposition: row.preposition,
    patron: row.patron,
    complements: complements.filter((item) => Number(item.construction_id) === Number(row.construction_id)).filter((item) => item.complement_id !== null && item.texte !== null).map((item) => ({
      id: Number(item.complement_id),
      texte: String(item.texte),
      genre: item.genre ? item.genre.toLocaleLowerCase("fr").startsWith("f") ? "feminin" : "masculin" : null,
      nombre: item.nombre ? item.nombre.toLocaleLowerCase("fr").startsWith("p") ? "pluriel" : "singulier" : null
    }))
  }])).values()];
  const primaryMeaning = meanings[0];
  const meaningTitle = (_c = (_b = primaryMeaning == null ? void 0 : primaryMeaning.intitule) == null ? void 0 : _b.trim()) != null ? _c : "";
  const isGenericMeaningTitle = /^sens principal de\s+[«"']?/iu.test(meaningTitle);
  const meaning = ((_d = primaryMeaning == null ? void 0 : primaryMeaning.definition) == null ? void 0 : _d.trim()) || (isGenericMeaningTitle ? "" : meaningTitle);
  return {
    verb: {
      id: verb[0].id,
      infinitif: verb[0].infinitif,
      participePresent: verb[0].participe_present,
      participePasse: verb[0].participe_passe,
      auxiliaire: verb[0].auxiliaire,
      groupeConjugaison: verb[0].groupe_conjugaison,
      familleConjugaison: verb[0].famille_conjugaison,
      terminaison: verb[0].terminaison_infinitif,
      typePronominal: verb[0].type_pronominal,
      estImpersonnel: Boolean(verb[0].est_impersonnel),
      estDefectif: Boolean(verb[0].est_defectif),
      niveauDifficulte: verb[0].niveau_difficulte,
      niveauCecrl: verb[0].niveau_cecrl,
      registrePrincipal: verb[0].registre_principal,
      formeCanonique: verb[0].forme_canonique || verb[0].infinitif,
      statutValidation: verb[0].statut_validation,
      meaning,
      particularites: array(verb[0].particularites),
      niveauxScolaires: array(verb[0].niveaux_scolaires),
      parcoursCif: array(verb[0].parcours_cif),
      categoriesSemantiques: categories
    },
    conjugations,
    constructions,
    classificationOptions: {
      families,
      semanticCategories: availableCategories
    }
  };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
