import { d as defineEventHandler, u as useDatabase, o as getCatalogue, q as listChallengePresetCategories, t as listStoredChallengePresets } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
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

const index_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const database = useDatabase();
  const catalogue = await getCatalogue("fr");
  const [categories, presets] = await Promise.all([
    listChallengePresetCategories(database),
    listStoredChallengePresets(database, catalogue.verbes)
  ]);
  return {
    categories,
    presets,
    verbs: catalogue.verbes,
    modes: catalogue.modes,
    tenses: catalogue.temps
  };
});

export { index_get as default };
//# sourceMappingURL=index2.get.mjs.map
