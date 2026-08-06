import { d as defineEventHandler, a as getQuery, c as createError, u as useDatabase, a3 as challengePresetDefinitions } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:url';
import 'node:fs/promises';

function analyticsUsageDiagnostic(row) {
  var _a, _b, _c;
  if (row.exposures < 100) {
    return {
      diagnostic: "insufficient",
      diagnosticReason: `Seulement ${row.exposures} exposition${row.exposures > 1 ? "s" : ""} mesur\xE9e${row.exposures > 1 ? "s" : ""}. Attendre davantage de donn\xE9es.`
    };
  }
  const adoption = (_a = row.adoptionRate) != null ? _a : 0;
  const completion = (_b = row.completionRate) != null ? _b : 0;
  const repeat = (_c = row.repeatRate) != null ? _c : 0;
  if (row.exposures >= 300 && adoption < 1 && row.completions < 5 && repeat < 5) {
    return {
      diagnostic: "remove-candidate",
      diagnosticReason: `Propos\xE9e ${row.exposures} fois, choisie dans ${adoption} % des cas et presque jamais r\xE9utilis\xE9e.`
    };
  }
  if (adoption < 5 && (completion >= 70 || repeat >= 20)) {
    return {
      diagnostic: "promote",
      diagnosticReason: `Peu choisie (${adoption} %), mais convaincante apr\xE8s s\xE9lection (${completion} % termin\xE9s).`
    };
  }
  if (adoption >= 5 && row.starts >= 10 && completion < 40) {
    return {
      diagnostic: "improve",
      diagnosticReason: `La fonction attire, mais seulement ${completion} % des usages commenc\xE9s sont termin\xE9s.`
    };
  }
  if (adoption < 5 && (row.completions >= 5 || repeat >= 15)) {
    return {
      diagnostic: "niche",
      diagnosticReason: `Faible volume global, mais ${row.completions} utilisations termin\xE9es et ${repeat} % de r\xE9utilisation.`
    };
  }
  return {
    diagnostic: "keep",
    diagnosticReason: `${adoption} % d\u2019adoption et ${completion} % de compl\xE9tion sur la p\xE9riode.`
  };
}

const actorFilters = ["all", "anonymous", "learner"];
const featureLabels = {
  "builder.custom": "Construire un d\xE9fi personnalis\xE9",
  "preset.library": "Parcourir les d\xE9fis tout faits",
  "challenge.load": "Charger un d\xE9fi avec un code",
  "challenge.share": "Enregistrer et partager un d\xE9fi",
  "exercise.classic": "Exercice classique",
  "exercise.chat": "Exercice avec un coach",
  "print.preview": "Pr\xE9parer une fiche imprimable",
  "download.pdf": "T\xE9l\xE9charger un PDF",
  "download.word": "T\xE9l\xE9charger un document Word",
  "consult.verb": "Consulter un verbe",
  "learn.content": "Consulter les contenus Apprendre",
  "learner.history": "Consulter ses derni\xE8res s\xE9ances",
  "learner.summary": "Consulter le bilan d\u2019une s\xE9ance",
  "learner.finish": "Terminer une s\xE9ance inachev\xE9e",
  "learner.relaunch.same": "Relancer le m\xEAme d\xE9fi dans le m\xEAme ordre",
  "learner.relaunch.random": "Relancer le m\xEAme d\xE9fi au hasard",
  "learner.errors.session": "Reprendre les erreurs de la s\xE9ance",
  "learner.errors.challenge": "Reprendre les erreurs de tout le d\xE9fi",
  "learner.errors.targeted": "Lancer un d\xE9fi cibl\xE9 par type d\u2019erreur",
  "learner.progress": "Comprendre ses erreurs",
  "learner.progress.examples": "Afficher davantage d\u2019exemples d\u2019erreurs",
  "learner.training": "Consulter la progression par d\xE9fi",
  "learner.training.analysis": "Analyser la progression d\u2019un d\xE9fi",
  "learner.training.session": "Consulter une s\xE9ance dans le graphique",
  "learner.preferences": "Consulter ses pr\xE9f\xE9rences",
  "learner.account": "Consulter les r\xE9glages du compte",
  "learner.password": "Modifier son mot de passe",
  "learner.results.delete": "Supprimer ses r\xE9sultats",
  "learner.account.delete": "Supprimer son compte",
  "language.change": "Changer la langue",
  "theme.change": "Changer l\u2019apparence",
  "auth.register": "Cr\xE9er un compte",
  "auth.login": "Se connecter"
};
function isoDate(value, fallback) {
  const text = String(value || "");
  return /^\d{4}-\d{2}-\d{2}$/u.test(text) && !Number.isNaN(Date.parse(`${text}T12:00:00Z`)) ? text : fallback.toISOString().slice(0, 10);
}
function percentage(numerator, denominator) {
  return denominator ? Math.round(numerator / denominator * 1e3) / 10 : null;
}
function blankRow(key, label, category) {
  return {
    row: {
      key,
      label,
      category,
      exposures: 0,
      selections: 0,
      starts: 0,
      completions: 0,
      failures: 0,
      uniqueSessions: 0,
      repeatSessions: 0,
      adoptionRate: null,
      completionRate: null,
      repeatRate: null,
      lastUsedAt: null
    },
    selectedBySession: /* @__PURE__ */ new Map(),
    sessions: /* @__PURE__ */ new Set()
  };
}
const analyticsUsage_get = defineEventHandler(async (event) => {
  var _a, _b, _c;
  requireAdministrator(event);
  const query = getQuery(event);
  const actor = actorFilters.includes(String(query.actor)) ? String(query.actor) : "all";
  const today = /* @__PURE__ */ new Date();
  const defaultStart = new Date(today);
  defaultStart.setDate(defaultStart.getDate() - 29);
  const startDate = isoDate(query.start, defaultStart);
  const endDate = isoDate(query.end, today);
  if (startDate > endDate) {
    throw createError({ statusCode: 400, statusMessage: "La date de d\xE9but doit pr\xE9c\xE9der la date de fin." });
  }
  const actorExpression = "COALESCE(actor_type, 'anonymous')";
  const actorClause = actor === "all" ? "" : ` AND ${actorExpression}=?`;
  const parameters = [startDate, endDate];
  if (actor !== "all") parameters.push(actor);
  const database = useDatabase();
  const [events] = await database.execute(`
    SELECT event_name AS eventName, ${actorExpression} AS actorType, session_id AS sessionId,
           JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.feature')) AS feature,
           JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.item')) AS item,
           JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.preset')) AS preset,
           JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.presentation')) AS presentation,
           JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.source')) AS source,
           COUNT(*) AS value, MAX(created_at) AS lastUsedAt
    FROM analytics_events
    WHERE created_at>=? AND created_at<DATE_ADD(?, INTERVAL 1 DAY)${actorClause}
      AND event_name IN (
        'feature_exposed','feature_selected','feature_completed','feature_failed',
        'challenge_preset_selected','challenge_load','challenge_save',
        'exercise_started','exercise_completed','exercise_abandoned',
        'help_opened','coach_selected','print_opened','pdf_downloaded','word_downloaded',
        'account_registered','account_login'
      )
    GROUP BY event_name,actorType,session_id,feature,item,preset,presentation,source
  `, parameters);
  const accumulators = /* @__PURE__ */ new Map();
  const ensure = (key, label, category) => {
    var _a2;
    const mapKey = `${category}:${key}`;
    const current = (_a2 = accumulators.get(mapKey)) != null ? _a2 : blankRow(key, label, category);
    accumulators.set(mapKey, current);
    return current;
  };
  for (const preset of challengePresetDefinitions) ensure(preset.id, preset.label, "preset");
  for (const [key, label] of Object.entries(featureLabels)) ensure(key, label, "feature");
  const apply = (accumulator, row, field) => {
    const value = Number(row.value) || 0;
    accumulator.row[field] += value;
    accumulator.sessions.add(row.sessionId);
    if (field === "selections") {
      accumulator.selectedBySession.set(
        row.sessionId,
        (accumulator.selectedBySession.get(row.sessionId) || 0) + value
      );
    }
    const lastUsedAt = row.lastUsedAt ? new Date(row.lastUsedAt).toISOString() : null;
    if (lastUsedAt && (!accumulator.row.lastUsedAt || lastUsedAt > accumulator.row.lastUsedAt)) {
      accumulator.row.lastUsedAt = lastUsedAt;
    }
  };
  for (const row of events) {
    const genericFeature = String(row.feature || "");
    const genericItem = String(row.item || "");
    if (row.eventName.startsWith("feature_") && genericFeature) {
      const category = genericFeature === "preset" ? "preset" : "feature";
      const key = category === "preset" ? genericItem : genericFeature;
      if (!key) continue;
      const label = category === "preset" ? ((_a = challengePresetDefinitions.find((preset) => preset.id === key)) == null ? void 0 : _a.label) || key : featureLabels[key] || key;
      const accumulator2 = ensure(key, label, category);
      const fields = {
        feature_exposed: "exposures",
        feature_selected: "selections",
        feature_completed: "completions",
        feature_failed: "failures"
      };
      const field = fields[row.eventName];
      if (field) apply(accumulator2, row, field);
      continue;
    }
    const presetId = String(row.preset || "");
    if (row.eventName === "challenge_preset_selected" && presetId) {
      apply(ensure(presetId, ((_b = challengePresetDefinitions.find((item) => item.id === presetId)) == null ? void 0 : _b.label) || presetId, "preset"), row, "selections");
      apply(ensure("preset.library", featureLabels["preset.library"], "feature"), row, "selections");
    }
    if ((row.eventName === "exercise_started" || row.eventName === "exercise_completed") && presetId) {
      apply(
        ensure(presetId, ((_c = challengePresetDefinitions.find((item) => item.id === presetId)) == null ? void 0 : _c.label) || presetId, "preset"),
        row,
        row.eventName === "exercise_started" ? "starts" : "completions"
      );
      apply(
        ensure("preset.library", featureLabels["preset.library"], "feature"),
        row,
        row.eventName === "exercise_started" ? "starts" : "completions"
      );
    }
    if ((row.eventName === "exercise_started" || row.eventName === "exercise_completed") && row.source === "custom") {
      apply(
        ensure("builder.custom", featureLabels["builder.custom"], "feature"),
        row,
        row.eventName === "exercise_started" ? "starts" : "completions"
      );
    }
    if ((row.eventName === "exercise_started" || row.eventName === "exercise_completed" || row.eventName === "exercise_abandoned") && genericFeature && genericFeature !== "exercise.classic" && genericFeature !== "exercise.chat") {
      const targetedAccumulator = ensure(
        genericFeature,
        featureLabels[genericFeature] || genericFeature,
        "feature"
      );
      apply(
        targetedAccumulator,
        row,
        row.eventName === "exercise_started" ? "starts" : row.eventName === "exercise_completed" ? "completions" : "failures"
      );
    }
    const featureKey = (() => {
      if (row.eventName === "exercise_started" || row.eventName === "exercise_completed" || row.eventName === "exercise_abandoned") {
        return row.presentation === "chat" ? "exercise.chat" : "exercise.classic";
      }
      if (row.eventName === "challenge_load") return "challenge.load";
      if (row.eventName === "challenge_save") return "challenge.share";
      if (row.eventName === "print_opened") return "print.preview";
      if (row.eventName === "pdf_downloaded") return "download.pdf";
      if (row.eventName === "word_downloaded") return "download.word";
      if (row.eventName === "help_opened") return "exercise.chat";
      if (row.eventName === "coach_selected") return "exercise.chat";
      if (row.eventName === "account_registered") return "auth.register";
      if (row.eventName === "account_login") return "auth.login";
      return "";
    })();
    if (!featureKey) continue;
    const accumulator = ensure(featureKey, featureLabels[featureKey] || featureKey, "feature");
    if (row.eventName === "exercise_started") apply(accumulator, row, "starts");
    else if (row.eventName === "exercise_completed") apply(accumulator, row, "completions");
    else if (row.eventName === "exercise_abandoned") apply(accumulator, row, "failures");
    else if (row.eventName === "challenge_load" || row.eventName === "challenge_save" || row.eventName === "print_opened" || row.eventName === "pdf_downloaded" || row.eventName === "word_downloaded" || row.eventName === "account_registered" || row.eventName === "account_login") {
      apply(accumulator, row, "completions");
    }
  }
  const finalized = [...accumulators.values()].map((accumulator) => {
    accumulator.row.uniqueSessions = accumulator.sessions.size;
    accumulator.row.repeatSessions = [...accumulator.selectedBySession.values()].filter((count) => count > 1).length;
    accumulator.row.adoptionRate = percentage(accumulator.row.selections, accumulator.row.exposures);
    accumulator.row.completionRate = percentage(
      accumulator.row.completions,
      accumulator.row.starts || accumulator.row.selections
    );
    accumulator.row.repeatRate = percentage(accumulator.row.repeatSessions, accumulator.selectedBySession.size);
    return { ...accumulator.row, ...analyticsUsageDiagnostic(accumulator.row) };
  });
  const order = (left, right) => right.exposures - left.exposures || right.selections - left.selections || left.label.localeCompare(right.label, "fr");
  const presets = finalized.filter((row) => row.category === "preset").sort(order);
  const features = finalized.filter((row) => row.category === "feature").sort(order);
  const exposedSessions = new Set(events.filter((row) => row.eventName === "feature_exposed").map((row) => row.sessionId)).size;
  const activeFeatureSessions = new Set(events.filter((row) => row.eventName === "feature_selected" || row.eventName === "exercise_started" || row.eventName === "challenge_preset_selected").map((row) => row.sessionId)).size;
  return {
    startDate,
    endDate,
    actor,
    summary: {
      exposedSessions,
      activeFeatureSessions,
      trackedFeatures: finalized.length,
      removeCandidates: finalized.filter((row) => row.diagnostic === "remove-candidate").length,
      insufficient: finalized.filter((row) => row.diagnostic === "insufficient").length
    },
    presets,
    features,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    notice: "La distinction anonyme/connect\xE9 et les expositions d\xE9taill\xE9es commencent \xE0 partir de cette version. Les s\xE9lections historiques restent visibles, mais ne suffisent pas seules \xE0 recommander une suppression."
  };
});

export { analyticsUsage_get as default };
//# sourceMappingURL=analytics-usage.get.mjs.map
