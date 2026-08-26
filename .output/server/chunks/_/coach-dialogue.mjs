const PLACEHOLDER = /\{([a-zA-Z]+)\}/gu;
const COACH_PLACEHOLDERS = [
  "instruction",
  "verb",
  "complement",
  "participle",
  "gender",
  "number",
  "mode",
  "tense",
  "expectedAnswer",
  "score",
  "correctCount",
  "questionCount",
  "questionNumber"
];
function renderCoachTemplate(template, context) {
  return template.replace(PLACEHOLDER, (match, key) => {
    const value = context[key];
    return value === void 0 || value === null || value === "" ? match : String(value);
  });
}
function unknownCoachPlaceholders(template) {
  const allowed = new Set(COACH_PLACEHOLDERS);
  return [...template.matchAll(PLACEHOLDER)].map((match) => match[1] || "").filter((key, index, values) => !allowed.has(key) && values.indexOf(key) === index);
}
function missingCoachPlaceholders(template, context) {
  const allowed = new Set(COACH_PLACEHOLDERS);
  return [...template.matchAll(PLACEHOLDER)].map((match) => match[1] || "").filter((key, index, values) => {
    if (values.indexOf(key) !== index) return false;
    if (!allowed.has(key)) return true;
    const value = context[key];
    return value === void 0 || value === null || value === "";
  });
}
function canRenderCoachTemplate(template, context) {
  return missingCoachPlaceholders(template, context).length === 0;
}
function weightedChoice(items, random) {
  const total = items.reduce((sum, item) => sum + Math.max(1, item.weight), 0);
  if (!total) return void 0;
  let cursor = random() * total;
  for (const item of items) {
    cursor -= Math.max(1, item.weight);
    if (cursor < 0) return item;
  }
  return items.at(-1);
}
function uniformChoice(items, random) {
  if (!items.length) return void 0;
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}
function createCoachReaction(coach, eventType, context = {}, options = {}) {
  var _a, _b, _c;
  const random = (_a = options.random) != null ? _a : Math.random;
  const allowedReplyIds = options.allowedReplyIds ? new Set(options.allowedReplyIds) : null;
  const replies = coach.replies.filter((reply2) => reply2.isActive && reply2.eventType === eventType && (!allowedReplyIds || allowedReplyIds.has(reply2.id)) && canRenderCoachTemplate(reply2.content, context));
  const reply = weightedChoice(replies, random);
  const result = {
    text: reply ? renderCoachTemplate(reply.content, context) : "",
    ...reply ? { replyId: reply.id } : {}
  };
  if (!reply) return result;
  const rule = coach.rules.find((item) => item.eventType === eventType);
  if (!options.mediaAllowed || !rule) return result;
  const mediaEvent = eventType === "correct-alternative" || eventType === "streak" ? "correct" : eventType;
  const exactAssignments = coach.assignments.filter((item) => item.isActive && item.eventType === eventType);
  const assignments = exactAssignments.length ? exactAssignments : coach.assignments.filter((item) => item.isActive && item.eventType === mediaEvent);
  const candidates = assignments.flatMap((assignment) => {
    const media = coach.media.find((item) => item.id === assignment.mediaId);
    if (!media || !media.isActive || media.safetyStatus !== "approved" || media.rightsStatus !== "verified") return [];
    if (options.animatedOnly && media.mediaType !== "animation" && media.mediaType !== "video") return [];
    if (options.allowMotion === false && (media.mediaType === "animation" || media.mediaType === "video")) return [];
    return [{ media, weight: assignment.weight }];
  });
  const excluded = new Set(options.excludeMediaIds || []);
  const freshCandidates = candidates.filter((item) => !excluded.has(item.media.id));
  const selectable = freshCandidates.length ? freshCandidates : candidates;
  const mediaGroups = [
    {
      type: "animation",
      probability: (_b = rule.animationProbability) != null ? _b : rule.mediaProbability,
      candidates: selectable.filter((item) => item.media.mediaType === "animation" || item.media.mediaType === "video")
    },
    {
      type: "emoji",
      probability: (_c = rule.emojiProbability) != null ? _c : rule.mediaProbability,
      candidates: selectable.filter((item) => item.media.mediaType === "emoji")
    },
    {
      type: "other",
      probability: rule.mediaProbability,
      candidates: selectable.filter((item) => item.media.mediaType !== "animation" && item.media.mediaType !== "video" && item.media.mediaType !== "emoji")
    }
  ].filter((group) => group.candidates.length && Math.max(0, group.probability) > 0 && random() <= Math.min(1, group.probability));
  const selectedGroup = weightedChoice(mediaGroups.map((group) => ({ ...group, weight: Math.max(1, Math.round(group.probability * 100)) })), random);
  const selected = (selectedGroup == null ? void 0 : selectedGroup.type) === "animation" ? uniformChoice(selectedGroup.candidates, random) : selectedGroup ? weightedChoice(selectedGroup.candidates, random) : void 0;
  if (selected) result.media = selected.media;
  return result;
}
function createCoachDialogueState() {
  return { usageByEvent: /* @__PURE__ */ new Map(), lastReplyByEvent: /* @__PURE__ */ new Map() };
}
function createVariedCoachReaction(coach, eventType, context = {}, state, options = {}) {
  const eventReplies = coach.replies.filter((reply) => reply.isActive && reply.eventType === eventType && canRenderCoachTemplate(reply.content, context));
  const usage = state.usageByEvent.get(eventType) || /* @__PURE__ */ new Map();
  state.usageByEvent.set(eventType, usage);
  const minimumUsage = eventReplies.length ? Math.min(...eventReplies.map((reply) => usage.get(reply.id) || 0)) : 0;
  let preferred = eventReplies.filter((reply) => (usage.get(reply.id) || 0) === minimumUsage);
  const lastReplyId = state.lastReplyByEvent.get(eventType);
  if (preferred.length > 1 && lastReplyId) preferred = preferred.filter((reply) => reply.id !== lastReplyId);
  const reaction = createCoachReaction(coach, eventType, context, {
    ...options,
    allowedReplyIds: preferred.map((reply) => reply.id),
    excludeMediaIds: state.lastMediaId ? [state.lastMediaId] : []
  });
  if (reaction.replyId) {
    usage.set(reaction.replyId, (usage.get(reaction.replyId) || 0) + 1);
    state.lastReplyByEvent.set(eventType, reaction.replyId);
  }
  if (reaction.media) state.lastMediaId = reaction.media.id;
  return reaction;
}

export { COACH_PLACEHOLDERS as C, createVariedCoachReaction as a, createCoachDialogueState as b, createCoachReaction as c, unknownCoachPlaceholders as u };
//# sourceMappingURL=coach-dialogue.mjs.map
