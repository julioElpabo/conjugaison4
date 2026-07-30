import { i as getQuery, c as createError, u as useDatabase } from '../nitro/nitro.mjs';
import { r as requireAdministrator } from './session.mjs';
import { g as getLearnerSession } from './learner-session.mjs';

async function requireLearnerDataSubject(event) {
  const rawAdminLearnerId = getQuery(event).adminLearnerId;
  if (rawAdminLearnerId !== void 0) {
    requireAdministrator(event);
    const id = Number.parseInt(String(rawAdminLearnerId), 10);
    if (!Number.isSafeInteger(id) || id < 1) {
      throw createError({ statusCode: 400, statusMessage: "Utilisateur invalide" });
    }
    const [[account]] = await useDatabase().execute(`
      SELECT id, username, status
      FROM learner_accounts
      WHERE id=? AND deleted_at IS NULL
      LIMIT 1
    `, [id]);
    if (!account) throw createError({ statusCode: 404, statusMessage: "Utilisateur introuvable" });
    return { id: Number(account.id), username: account.username, status: account.status };
  }
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  return learner;
}

export { requireLearnerDataSubject as r };
//# sourceMappingURL=learner-data-subject.mjs.map
