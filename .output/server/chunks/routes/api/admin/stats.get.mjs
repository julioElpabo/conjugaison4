import { d as defineEventHandler, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
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

const stats_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const [rows] = await useDatabase().execute(`
    SELECT DATE(created) AS date,
      SUM(homepage) AS homepage,
      SUM(creationpdf) AS creationpdf,
      SUM(sauvedefi) AS sauvedefi,
      SUM(chargedefi) AS chargedefi,
      SUM(exercer) AS exercer,
      SUM(exercersimple) AS exercersimple,
      SUM(resultat) AS resultat,
      SUM(resultatsimple) AS resultatsimple
    FROM logs
    WHERE created >= CURRENT_DATE - INTERVAL 30 DAY
    GROUP BY DATE(created)
    ORDER BY DATE(created)
  `);
  return { days: rows };
});

export { stats_get as default };
//# sourceMappingURL=stats.get.mjs.map
