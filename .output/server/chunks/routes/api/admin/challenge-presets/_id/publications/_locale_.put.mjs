import { d as defineEventHandler, g as getRouterParam, c as createError, i as parsePublicationLocale, j as parseChallengePublicationPayload, r as readBody, C as ChallengePublicationInputError, u as useDatabase, k as saveChallengePublication, l as ChallengePublicationConflictError, m as ChallengePublicationNotFoundError } from '../../../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../../../_/session.mjs';
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

const _locale__put = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const presetId = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(presetId) || presetId < 1) {
    throw createError({ statusCode: 400, statusMessage: "D\xE9fi invalide" });
  }
  let locale;
  let payload;
  try {
    locale = parsePublicationLocale(getRouterParam(event, "locale"));
    payload = parseChallengePublicationPayload(await readBody(event));
  } catch (error) {
    if (error instanceof ChallengePublicationInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message });
    }
    throw error;
  }
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const publication = await saveChallengePublication(connection, presetId, locale, payload);
    await connection.commit();
    return { ok: true, publication };
  } catch (error) {
    await connection.rollback();
    if (error instanceof ChallengePublicationConflictError) {
      throw createError({ statusCode: 409, statusMessage: error.message });
    }
    if (error instanceof ChallengePublicationNotFoundError) {
      throw createError({ statusCode: 404, statusMessage: error.message });
    }
    throw error;
  } finally {
    connection.release();
  }
});

export { _locale__put as default };
//# sourceMappingURL=_locale_.put.mjs.map
