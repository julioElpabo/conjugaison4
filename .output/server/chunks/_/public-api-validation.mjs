import { M as legacyComplementOptions, N as legacyComplementConfig, O as normalizeComplementOptions } from '../nitro/nitro.mjs';
import { D as DEFAULT_SHARED_CHALLENGE_OPTIONS } from './challenge-defaults.mjs';

class PublicInputError extends Error {
}
const MAX_VERB_IDS = 1e3;
const QUESTIONNAIRE_KEYS = /* @__PURE__ */ new Set([
  "description",
  "verbIds",
  "tenseIds",
  "questionCount",
  "exerciseKind",
  "identificationSource",
  "literaryRegister",
  "pastSimplePronouns",
  "inclusivePronouns",
  "includeOnPronoun",
  "voiceMode",
  "includeComplements",
  "complementPlacement",
  "complementOptions"
]);
const DEFI_KEYS = /* @__PURE__ */ new Set([
  "version",
  "title",
  "description",
  "verbIds",
  "tenseIds",
  "questionCount",
  "exerciseKind",
  "identificationSource",
  "literaryRegister",
  "pastSimplePronouns",
  "inclusivePronouns",
  "includeOnPronoun",
  "voiceMode",
  "includeComplements",
  "complementPlacement",
  "complementOptions",
  "printOptions"
]);
function parseChallengeTitle(value) {
  if (value === void 0) return void 0;
  if (typeof value !== "string") {
    throw new PublicInputError("Le titre du d\xE9fi doit \xEAtre du texte");
  }
  const title = value.trim();
  if (title.length < 1 || title.length > 80) {
    throw new PublicInputError("Le titre du d\xE9fi doit contenir entre 1 et 80 caract\xE8res");
  }
  return title;
}
function parseChallengeDescription(value) {
  if (value === void 0 || value === "") return void 0;
  if (typeof value !== "string") {
    throw new PublicInputError("La description du d\xE9fi doit \xEAtre du texte");
  }
  const description = value.trim();
  if (!description) return void 0;
  if (description.length > 1e3) {
    throw new PublicInputError("La description du d\xE9fi ne peut pas d\xE9passer 1000 caract\xE8res");
  }
  return description;
}
const PRINT_OPTION_KEYS = /* @__PURE__ */ new Set([
  "title",
  "questionSpacingMm",
  "titleSpacingMm",
  "inclusiveDisplay",
  "showGrade",
  "showVerbs",
  "showTenses",
  "showFirstName",
  "showLastName",
  "showDate",
  "showRandomNumber"
]);
const BOOLEAN_PRINT_OPTION_KEYS = [
  "inclusiveDisplay",
  "showGrade",
  "showVerbs",
  "showTenses",
  "showFirstName",
  "showLastName",
  "showDate",
  "showRandomNumber"
];
const DEFAULT_PRINT_OPTIONS = {
  title: "D\xE9fi de conjugaison",
  questionSpacingMm: 8,
  titleSpacingMm: 30,
  inclusiveDisplay: false,
  showGrade: true,
  showVerbs: false,
  showTenses: false,
  showFirstName: true,
  showLastName: true,
  showDate: true,
  showRandomNumber: true
};
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function assertOnlyKeys(value, allowed) {
  const unexpected = Object.keys(value).filter((key) => !allowed.has(key));
  if (unexpected.length > 0) {
    throw new PublicInputError(`Champs non reconnus : ${unexpected.join(", ")}`);
  }
}
function parseIds(value, label, maximum, allowVirtual = false) {
  if (!Array.isArray(value) || value.length === 0 || value.length > maximum) {
    throw new PublicInputError(`${label} doit contenir entre 1 et ${maximum} identifiants`);
  }
  const ids = value.map((id) => {
    if (!Number.isSafeInteger(id) || Number(id) === 0 || !allowVirtual && Number(id) < 0) {
      throw new PublicInputError(`${label} contient un identifiant invalide`);
    }
    return Number(id);
  });
  if (new Set(ids).size !== ids.length) {
    throw new PublicInputError(`${label} ne doit pas contenir de doublons`);
  }
  return ids;
}
function parseQuestionCount(value) {
  if (!Number.isSafeInteger(value) || Number(value) < 1 || Number(value) > 100) {
    throw new PublicInputError("questionCount doit \xEAtre un entier entre 1 et 100");
  }
  return Number(value);
}
function parseExerciseKind(value) {
  if (value === "conjugation" || value === "normal") {
    return "conjugation";
  }
  if (value === "tense-identification" || value === "temps-mode") {
    return "tense-identification";
  }
  if (value === "mode-identification") return "mode-identification";
  throw new PublicInputError("exerciseKind doit valoir conjugation, tense-identification ou mode-identification");
}
function parseIdentificationSource(value) {
  if (value === "selected-verbs" || value === "literary-corpus") return value;
  throw new PublicInputError("identificationSource doit valoir selected-verbs ou literary-corpus");
}
function parseLiteraryRegister(value) {
  if (value === "all" || value === "courant" || value === "soutenu") return value;
  throw new PublicInputError("literaryRegister doit valoir all, courant ou soutenu");
}
function parsePastSimplePronouns(value) {
  if (value === "all" || value === "tous") {
    return "all";
  }
  if (value === "third-person-only" || value === "ililsonly") {
    return "third-person-only";
  }
  throw new PublicInputError("pastSimplePronouns doit valoir all ou third-person-only");
}
function parseVoiceMode(value) {
  if (value === "active" || value === "passive" || value === "mixed") return value;
  throw new PublicInputError("voiceMode doit valoir active, passive ou mixed");
}
function parseComplementPlacement(value) {
  if (value === "after" || value === "mixed" || value === "before") return value;
  throw new PublicInputError("complementPlacement doit valoir after, mixed ou before");
}
function parseComplementOptions(value) {
  const parsed = normalizeComplementOptions(value);
  if (!Array.isArray(value) || parsed.length !== value.length) {
    throw new PublicInputError("complementOptions contient une option invalide");
  }
  return parsed;
}
function parsePrintOptions(value) {
  if (value === void 0) {
    return { ...DEFAULT_PRINT_OPTIONS };
  }
  if (!isRecord(value)) {
    throw new PublicInputError("printOptions doit \xEAtre un objet");
  }
  assertOnlyKeys(value, PRINT_OPTION_KEYS);
  const title = value.title === void 0 ? DEFAULT_PRINT_OPTIONS.title : value.title;
  if (typeof title !== "string" || title.trim().length === 0 || title.length > 120) {
    throw new PublicInputError("Le titre d\u2019impression doit contenir entre 1 et 120 caract\xE8res");
  }
  const parsed = { ...DEFAULT_PRINT_OPTIONS, title: title.trim() };
  const numericOptions = {
    questionSpacingMm: { minimum: 2, maximum: 15 },
    titleSpacingMm: { minimum: 8, maximum: 30 }
  };
  for (const [key, limits] of Object.entries(numericOptions)) {
    if (value[key] === void 0) continue;
    const number = Number(value[key]);
    if (!Number.isFinite(number) || number < limits.minimum || number > limits.maximum) {
      throw new PublicInputError(`printOptions.${key} doit \xEAtre compris entre ${limits.minimum} et ${limits.maximum}`);
    }
    parsed[key] = number;
  }
  for (const key of BOOLEAN_PRINT_OPTION_KEYS) {
    if (value[key] === void 0) continue;
    if (typeof value[key] !== "boolean") {
      throw new PublicInputError(`printOptions.${key} doit \xEAtre un bool\xE9en`);
    }
    parsed[key] = value[key];
  }
  return parsed;
}
function parseQuestionnaireRequest(value) {
  var _a, _b;
  if (!isRecord(value)) {
    throw new PublicInputError("Le corps de la requ\xEAte doit \xEAtre un objet JSON");
  }
  assertOnlyKeys(value, QUESTIONNAIRE_KEYS);
  parseChallengeDescription(value.description);
  if (typeof value.inclusivePronouns !== "boolean") {
    throw new PublicInputError("inclusivePronouns doit \xEAtre un bool\xE9en");
  }
  const includeOnPronoun = (_a = value.includeOnPronoun) != null ? _a : DEFAULT_SHARED_CHALLENGE_OPTIONS.includeOnPronoun;
  if (typeof includeOnPronoun !== "boolean") {
    throw new PublicInputError("includeOnPronoun doit \xEAtre un bool\xE9en");
  }
  const voiceMode = value.voiceMode === void 0 ? DEFAULT_SHARED_CHALLENGE_OPTIONS.voiceMode : parseVoiceMode(value.voiceMode);
  const includeComplements = (_b = value.includeComplements) != null ? _b : false;
  if (typeof includeComplements !== "boolean") {
    throw new PublicInputError("includeComplements doit \xEAtre un bool\xE9en");
  }
  const complementPlacement = value.complementPlacement === void 0 ? "after" : parseComplementPlacement(value.complementPlacement);
  const complementOptions = value.complementOptions === void 0 ? legacyComplementOptions(includeComplements, complementPlacement) : parseComplementOptions(value.complementOptions);
  const resolvedLegacy = legacyComplementConfig(complementOptions);
  return {
    verbIds: parseIds(value.verbIds, "verbIds", MAX_VERB_IDS, true),
    tenseIds: parseIds(value.tenseIds, "tenseIds", 30),
    questionCount: parseQuestionCount(value.questionCount),
    exerciseKind: parseExerciseKind(value.exerciseKind),
    identificationSource: value.identificationSource === void 0 ? DEFAULT_SHARED_CHALLENGE_OPTIONS.identificationSource : parseIdentificationSource(value.identificationSource),
    literaryRegister: value.literaryRegister === void 0 ? DEFAULT_SHARED_CHALLENGE_OPTIONS.literaryRegister : parseLiteraryRegister(value.literaryRegister),
    pastSimplePronouns: parsePastSimplePronouns(value.pastSimplePronouns),
    inclusivePronouns: value.inclusivePronouns,
    includeOnPronoun,
    voiceMode,
    includeComplements: resolvedLegacy.includeComplements,
    complementPlacement: resolvedLegacy.complementPlacement,
    complementOptions
  };
}
function parseDefiDefinition(value) {
  var _a, _b;
  let modernValue;
  let legacyPastSimple;
  let legacyInclusive;
  if (Array.isArray(value)) {
    if (value.length < 3 || value.length > 5) {
      throw new PublicInputError("Le d\xE9fi historique doit contenir entre 3 et 5 \xE9l\xE9ments");
    }
    modernValue = {
      verbIds: value[0],
      tenseIds: value[1],
      questionCount: value[2]
    };
    legacyPastSimple = Array.isArray(value[3]) ? value[3][0] : value[3];
    legacyInclusive = value[4];
  } else if (isRecord(value)) {
    assertOnlyKeys(value, DEFI_KEYS);
    modernValue = value;
  } else {
    throw new PublicInputError("Le corps du d\xE9fi doit \xEAtre un objet JSON");
  }
  if (modernValue.version !== void 0 && modernValue.version !== 1) {
    throw new PublicInputError("Version de d\xE9fi non prise en charge");
  }
  const exerciseKind = modernValue.exerciseKind === void 0 ? DEFAULT_SHARED_CHALLENGE_OPTIONS.exerciseKind : parseExerciseKind(modernValue.exerciseKind);
  const identificationSource = modernValue.identificationSource === void 0 ? DEFAULT_SHARED_CHALLENGE_OPTIONS.identificationSource : parseIdentificationSource(modernValue.identificationSource);
  const literaryRegister = modernValue.literaryRegister === void 0 ? DEFAULT_SHARED_CHALLENGE_OPTIONS.literaryRegister : parseLiteraryRegister(modernValue.literaryRegister);
  const pastSimplePronouns = modernValue.pastSimplePronouns === void 0 ? legacyPastSimple === void 0 ? DEFAULT_SHARED_CHALLENGE_OPTIONS.pastSimplePronouns : parsePastSimplePronouns(legacyPastSimple) : parsePastSimplePronouns(modernValue.pastSimplePronouns);
  const inclusivePronouns = modernValue.inclusivePronouns === void 0 ? legacyInclusive === void 0 ? DEFAULT_SHARED_CHALLENGE_OPTIONS.inclusivePronouns : legacyInclusive === "afficherIel" : modernValue.inclusivePronouns;
  const includeOnPronoun = (_a = modernValue.includeOnPronoun) != null ? _a : DEFAULT_SHARED_CHALLENGE_OPTIONS.includeOnPronoun;
  const voiceMode = modernValue.voiceMode === void 0 ? DEFAULT_SHARED_CHALLENGE_OPTIONS.voiceMode : parseVoiceMode(modernValue.voiceMode);
  if (typeof inclusivePronouns !== "boolean") {
    throw new PublicInputError("inclusivePronouns doit \xEAtre un bool\xE9en");
  }
  if (typeof includeOnPronoun !== "boolean") {
    throw new PublicInputError("includeOnPronoun doit \xEAtre un bool\xE9en");
  }
  const includeComplements = (_b = modernValue.includeComplements) != null ? _b : DEFAULT_SHARED_CHALLENGE_OPTIONS.includeComplements;
  if (typeof includeComplements !== "boolean") {
    throw new PublicInputError("includeComplements doit \xEAtre un bool\xE9en");
  }
  const complementPlacement = modernValue.complementPlacement === void 0 ? DEFAULT_SHARED_CHALLENGE_OPTIONS.complementPlacement : parseComplementPlacement(modernValue.complementPlacement);
  const complementOptions = modernValue.complementOptions === void 0 ? legacyComplementOptions(includeComplements, complementPlacement) : parseComplementOptions(modernValue.complementOptions);
  const resolvedLegacy = legacyComplementConfig(complementOptions);
  const title = parseChallengeTitle(modernValue.title);
  const description = parseChallengeDescription(modernValue.description);
  return {
    version: 1,
    ...title === void 0 ? {} : { title },
    ...description === void 0 ? {} : { description },
    verbIds: parseIds(modernValue.verbIds, "verbIds", MAX_VERB_IDS, true),
    tenseIds: parseIds(modernValue.tenseIds, "tenseIds", 30),
    questionCount: parseQuestionCount(modernValue.questionCount),
    exerciseKind,
    identificationSource,
    literaryRegister,
    pastSimplePronouns,
    inclusivePronouns,
    includeOnPronoun,
    voiceMode,
    includeComplements: resolvedLegacy.includeComplements,
    complementPlacement: resolvedLegacy.complementPlacement,
    complementOptions,
    printOptions: parsePrintOptions(modernValue.printOptions)
  };
}
function serializeDefi(definition) {
  return JSON.stringify(definition);
}

export { PublicInputError as P, parseQuestionnaireRequest as a, parseDefiDefinition as p, serializeDefi as s };
//# sourceMappingURL=public-api-validation.mjs.map
