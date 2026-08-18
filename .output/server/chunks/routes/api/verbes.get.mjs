import { d as defineEventHandler, u as useDatabase, c as createError } from '../../nitro/nitro.mjs';
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

const verbes_get = defineEventHandler(async () => {
  try {
    const [verbes] = await useDatabase().execute(`
      SELECT infinitif
      FROM verbes
      ORDER BY infinitif
      LIMIT 500
    `);
    return verbes.map(({ infinitif }) => ({ infinitif }));
  } catch (error) {
    console.error("Impossible de r\xE9cup\xE9rer les verbes :", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Impossible de r\xE9cup\xE9rer les verbes"
    });
  }
});

export { verbes_get as default };
//# sourceMappingURL=verbes.get.mjs.map
