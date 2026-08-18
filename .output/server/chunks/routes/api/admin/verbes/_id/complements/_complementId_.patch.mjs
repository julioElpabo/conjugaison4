import { d as defineEventHandler, g as getRouterParam, r as readBody, c as createError, u as useDatabase } from '../../../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../../../_/session.mjs';
import { r as resolveAnteposedComplement } from '../../../../../../_/complement-placement.mjs';
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

const _complementId__patch = defineEventHandler(async (event) => {
  var _a, _b;
  requireAdministrator(event);
  const verbId = Number.parseInt((_a = getRouterParam(event, "id")) != null ? _a : "", 10);
  const complementId = Number.parseInt((_b = getRouterParam(event, "complementId")) != null ? _b : "", 10);
  const body = await readBody(event);
  const genre = typeof (body == null ? void 0 : body.genre) === "string" && ["masculin", "feminin"].includes(body.genre) ? body.genre : null;
  const nombre = typeof (body == null ? void 0 : body.nombre) === "string" && ["singulier", "pluriel"].includes(body.nombre) ? body.nombre : null;
  if (!Number.isInteger(verbId) || verbId < 1 || !Number.isInteger(complementId) || complementId < 1) {
    throw createError({ statusCode: 400, statusMessage: "Verbe ou compl\xE9ment invalide" });
  }
  if (!genre || !nombre) {
    throw createError({ statusCode: 400, statusMessage: "Le genre et le nombre sont obligatoires" });
  }
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(`
      SELECT c.id, c.texte
      FROM complements_verbaux c
      INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
      INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
      WHERE c.id=? AND vs.verbe_id=? AND cv.fonction_objet='cod' AND c.actif=1
      LIMIT 1
      FOR UPDATE
    `, [complementId, verbId]);
    const complement = rows[0];
    if (!complement) {
      throw createError({ statusCode: 404, statusMessage: "Compl\xE9ment COD introuvable" });
    }
    const placement = resolveAnteposedComplement(complement.texte, genre, nombre);
    if (!placement) {
      throw createError({ statusCode: 422, statusMessage: "Impossible de pr\xE9parer ce compl\xE9ment avec ces informations" });
    }
    await connection.execute(`
      UPDATE complements_verbaux
      SET texte_antepose=?, genre=?, nombre=?, statut_validation='valide'
      WHERE id=?
    `, [placement.text, placement.gender, placement.number, complementId]);
    await connection.commit();
    return {
      ok: true,
      complement: {
        id: Number(complement.id),
        texte: complement.texte,
        genre: placement.gender,
        nombre: placement.number
      }
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export { _complementId__patch as default };
//# sourceMappingURL=_complementId_.patch.mjs.map
