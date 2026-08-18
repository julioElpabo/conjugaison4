import { d as defineEventHandler, g as getRouterParam, r as readBody, c as createError, u as useDatabase } from '../../../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../../../_/session.mjs';
import { n as normalizeComplementPreposition, w as withComplementPreposition, a as withoutComplementPreposition } from '../../../../../../_/complement-preposition.mjs';
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

const _constructionId__patch = defineEventHandler(async (event) => {
  var _a, _b;
  requireAdministrator(event);
  const verbId = Number.parseInt((_a = getRouterParam(event, "id")) != null ? _a : "", 10);
  const constructionId = Number.parseInt((_b = getRouterParam(event, "constructionId")) != null ? _b : "", 10);
  const body = await readBody(event);
  const preposition = normalizeComplementPreposition(body == null ? void 0 : body.preposition);
  if (!Number.isInteger(verbId) || verbId < 1 || !Number.isInteger(constructionId) || constructionId < 1) {
    throw createError({ statusCode: 400, statusMessage: "Construction invalide" });
  }
  if (!preposition) {
    throw createError({ statusCode: 400, statusMessage: "La pr\xE9position doit \xEAtre \xAB \xE0 \xBB ou \xAB de \xBB" });
  }
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(`
      SELECT cv.id, cv.sens_id, cv.fonction_objet, cv.preposition
      FROM constructions_verbales cv
      INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
      WHERE cv.id=? AND vs.verbe_id=? AND cv.actif=1
      LIMIT 1
    `, [constructionId, verbId]);
    const construction = rows[0];
    if (!construction || construction.fonction_objet !== "coi") {
      throw createError({ statusCode: 404, statusMessage: "Construction COI introuvable" });
    }
    const previous = normalizeComplementPreposition(construction.preposition);
    if (previous === preposition) {
      await connection.rollback();
      return { ok: true, preposition, patron: `N0 V ${preposition} N1`, complements: [] };
    }
    const [complements] = await connection.execute(`
      SELECT id, texte FROM complements_verbaux WHERE construction_id=? ORDER BY id
    `, [constructionId]);
    const rewritten = complements.map((complement) => ({
      id: Number(complement.id),
      texte: withComplementPreposition(
        previous ? withoutComplementPreposition(complement.texte, previous) : complement.texte,
        preposition
      )
    }));
    if (new Set(rewritten.map((item) => item.texte.toLocaleLowerCase("fr"))).size !== rewritten.length) {
      throw createError({ statusCode: 409, statusMessage: "Ce changement cr\xE9erait des compl\xE9ments en double" });
    }
    for (const complement of rewritten) {
      await connection.execute("UPDATE complements_verbaux SET texte=? WHERE id=?", [complement.texte, complement.id]);
    }
    const patron = `N0 V ${preposition} N1`;
    await connection.execute(
      "UPDATE constructions_verbales SET preposition=?, patron=?, statut_validation='valide' WHERE id=?",
      [preposition, patron, constructionId]
    );
    await connection.execute(
      "UPDATE verbe_sens SET preposition=?, construction=? WHERE id=?",
      [preposition, patron, construction.sens_id]
    );
    await connection.commit();
    return { ok: true, preposition, patron, complements: rewritten };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export { _constructionId__patch as default };
//# sourceMappingURL=_constructionId_.patch.mjs.map
