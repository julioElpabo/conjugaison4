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

function actionFromBody(value) {
  return typeof value === "string" && ["validate", "unvalidate", "remove", "restore"].includes(value) ? value : null;
}
function noteFromBody(value) {
  return typeof value === "string" ? value.trim().slice(0, 500) || null : null;
}
const _id__put = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const id = Number.parseInt(String(getRouterParam(event, "id") || "0"), 10);
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: "Feedback invalide" });
  }
  const body = await readBody(event);
  const action = actionFromBody(body == null ? void 0 : body.action);
  const note = noteFromBody(body == null ? void 0 : body.note);
  if (!action) {
    throw createError({ statusCode: 400, statusMessage: "Action inconnue" });
  }
  const database = useDatabase();
  if (action === "validate") {
    await database.execute(
      `UPDATE coach_help_feedback
       SET validation_status='validated', validated_at=CURRENT_TIMESTAMP
       WHERE id=?`,
      [id]
    );
  } else if (action === "unvalidate") {
    await database.execute(
      `UPDATE coach_help_feedback
       SET validation_status='unvalidated', validated_at=NULL
       WHERE id=?`,
      [id]
    );
  } else if (action === "remove") {
    await database.execute(
      `UPDATE coach_help_feedback
       SET moderation_status='removed', moderation_note=?, moderated_at=CURRENT_TIMESTAMP, deleted_at=CURRENT_TIMESTAMP
       WHERE id=?`,
      [note || "Retir\xE9 depuis l\u2019administration", id]
    );
  } else {
    await database.execute(
      `UPDATE coach_help_feedback
       SET moderation_status='active', moderation_note=?, moderated_at=CURRENT_TIMESTAMP, deleted_at=NULL
       WHERE id=?`,
      [note || "Restaur\xE9 depuis l\u2019administration", id]
    );
  }
  return { ok: true };
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
