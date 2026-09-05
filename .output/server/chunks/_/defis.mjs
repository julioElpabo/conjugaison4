import { randomInt } from 'node:crypto';
import { Y as PublicInputError, u as useDatabase, Z as parseDefiDefinition, _ as encodePronominalSelectionId, $ as serializeDefi, a0 as decodePronominalSelectionId } from '../nitro/nitro.mjs';

const CODE_ALPHABET = "ABCDEFGHKLMNPQRSTUVWXYZ23456789";
const CODE_PATTERN = /^[A-HK-NP-Z2-9]{2}(?:-[A-HK-NP-Z2-9]{2}){3}$/;
class DefiNotFoundError extends Error {
}
class DefiStorageError extends Error {
}
function placeholders(values) {
  return values.map(() => "?").join(", ");
}
function createCode() {
  const groups = Array.from({ length: 4 }, () => Array.from({ length: 2 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join(""));
  return groups.join("-");
}
function normalizeDefiCode(value) {
  const code = (value || "").trim().toUpperCase();
  if (!CODE_PATTERN.test(code)) {
    throw new PublicInputError("Code de d\xE9fi invalide");
  }
  return code;
}
async function assertDefiSelectionExists(definition) {
  var _a, _b, _c;
  const database = useDatabase();
  const verbIds = definition.verbIds.filter((id) => id > 0);
  const pronominalUseIds = definition.verbIds.filter((id) => id < 0).map(decodePronominalSelectionId).filter((id) => id !== null);
  const [verbResult, pronominalResult, tenseResult] = await Promise.all([
    verbIds.length > 0 ? database.execute(
      `SELECT COUNT(*) AS count FROM verbes WHERE id IN (${placeholders(verbIds)}) AND est_archive = 0`,
      verbIds
    ) : Promise.resolve([[{ count: 0 }]]),
    pronominalUseIds.length > 0 ? database.execute(
      `SELECT COUNT(*) AS count FROM emplois_pronominaux
           WHERE id IN (${placeholders(pronominalUseIds)}) AND actif = 1 AND verbe_id IS NOT NULL`,
      pronominalUseIds
    ) : Promise.resolve([[{ count: 0 }]]),
    database.execute(
      `SELECT COUNT(*) AS count FROM temps WHERE id IN (${placeholders(definition.tenseIds)})`,
      definition.tenseIds
    )
  ]);
  if (Number((_a = verbResult[0][0]) == null ? void 0 : _a.count) !== verbIds.length || Number((_b = pronominalResult[0][0]) == null ? void 0 : _b.count) !== pronominalUseIds.length || verbIds.length + pronominalUseIds.length !== definition.verbIds.length) {
    throw new PublicInputError("Un ou plusieurs verbes sont inconnus");
  }
  if (Number((_c = tenseResult[0][0]) == null ? void 0 : _c.count) !== definition.tenseIds.length) {
    throw new PublicInputError("Un ou plusieurs temps sont inconnus");
  }
}
async function saveDefi(definition, learnerAccountId) {
  var _a;
  const database = useDatabase();
  await assertDefiSelectionExists(definition);
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    for (let attempt = 0; attempt < 12; attempt++) {
      const code = createCode();
      const [existing] = await connection.execute(
        "SELECT COUNT(*) AS count FROM defis WHERE name = ?",
        [code]
      );
      if (Number((_a = existing[0]) == null ? void 0 : _a.count) !== 0) continue;
      const [result] = await connection.execute(
        `INSERT INTO defis (name, defi, expires_at, last_used_at)
         VALUES (?, ?, NULL, CURRENT_TIMESTAMP)`,
        [code, serializeDefi(definition)]
      );
      if (learnerAccountId) {
        await connection.execute(`
          INSERT INTO learner_saved_challenges (account_id, defi_id)
          VALUES (?, ?)
        `, [learnerAccountId, result.insertId]);
      }
      await connection.commit();
      return code;
    }
    throw new DefiStorageError("Impossible de cr\xE9er un code unique");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
async function getDefi(code) {
  const database = useDatabase();
  const [rows] = await database.execute(
    `SELECT id, name, defi FROM defis
     WHERE name = ?
     ORDER BY id DESC LIMIT 1`,
    [code]
  );
  const row = rows[0];
  if (!row) throw new DefiNotFoundError("D\xE9fi introuvable");
  const [updated] = await database.execute(
    "UPDATE defis SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?",
    [row.id]
  );
  if (!updated.affectedRows) throw new DefiNotFoundError("D\xE9fi introuvable");
  try {
    const definition = parseDefiDefinition(JSON.parse(row.defi));
    const legacyIds = definition.verbIds.filter((id) => id > 0);
    if (legacyIds.length === 0) return definition;
    const [aliases] = await database.execute(`
      SELECT id, legacy_verbe_id
      FROM emplois_pronominaux
      WHERE legacy_verbe_id IN (${placeholders(legacyIds)})
        AND actif = 1 AND verbe_id IS NOT NULL
    `, legacyIds);
    if (aliases.length === 0) return definition;
    const byLegacyId = new Map(aliases.map((alias) => [
      Number(alias.legacy_verbe_id),
      encodePronominalSelectionId(Number(alias.id))
    ]));
    definition.verbIds = [...new Set(definition.verbIds.map((id) => {
      var _a;
      return (_a = byLegacyId.get(id)) != null ? _a : id;
    }))];
    return definition;
  } catch {
    throw new DefiStorageError("Le d\xE9fi enregistr\xE9 est illisible");
  }
}

export { DefiNotFoundError as D, DefiStorageError as a, getDefi as g, normalizeDefiCode as n, saveDefi as s };
//# sourceMappingURL=defis.mjs.map
