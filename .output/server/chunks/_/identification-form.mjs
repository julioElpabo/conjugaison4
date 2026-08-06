import { W as grammarTenseCode } from '../nitro/nitro.mjs';

function identificationFormParts(question) {
  if (question.literaryCitation) {
    return {
      before: question.literaryCitation.before,
      target: question.literaryCitation.target,
      after: question.literaryCitation.after
    };
  }
  const text = question.consigne || "";
  const conjugatedForms = [question.conjugaison1, question.conjugaison2, question.conjugaison3].filter((form) => Boolean(form == null ? void 0 : form.trim())).sort((left, right) => right.length - left.length);
  for (const form of conjugatedForms) {
    const index = text.indexOf(form);
    if (index >= 0) {
      return {
        before: text.slice(0, index),
        target: text.slice(index, index + form.length),
        after: text.slice(index + form.length)
      };
    }
  }
  return inferredFormAfterSubject(question, text);
}
function inferredFormAfterSubject(question, text) {
  var _a, _b, _c, _d;
  const pronoun = (_a = question.pronom) == null ? void 0 : _a.trim();
  if (!pronoun || !text) return null;
  const escapedPronoun = pronoun.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const subjectPattern = pronoun.toLocaleLowerCase("fr") === "je" ? /(^|[^\p{L}\p{N}])(je\s+|j[’'])/giu : new RegExp(`(^|[^\\p{L}\\p{N}])(${escapedPronoun})(?=$|[^\\p{L}\\p{N}])`, "giu");
  const subjectMatch = subjectPattern.exec(text);
  if (!subjectMatch) return null;
  const subjectEnd = subjectMatch.index + subjectMatch[0].length;
  const following = text.slice(subjectEnd);
  const leadingWhitespace = ((_b = following.match(/^\s*/u)) == null ? void 0 : _b[0].length) || 0;
  const targetStart = subjectEnd + leadingWhitespace;
  const compoundTenseCodes = /* @__PURE__ */ new Set([
    "compound-past",
    "pluperfect",
    "past-anterior",
    "future-perfect",
    "past",
    "past-first-form",
    "past-second-form"
  ]);
  const tenseCode = grammarTenseCode(question.temps);
  const wordsToTake = question.isCompound || tenseCode && compoundTenseCodes.has(tenseCode) ? 2 : 1;
  let targetEnd = targetStart;
  let remaining = text.slice(targetStart);
  for (let index = 0; index < wordsToTake; index += 1) {
    const word = (_c = remaining.match(/^[\p{L}]+(?:[’'-][\p{L}]+)*/u)) == null ? void 0 : _c[0];
    if (!word) return null;
    targetEnd += word.length;
    if (index === wordsToTake - 1) break;
    remaining = text.slice(targetEnd);
    const separator = (_d = remaining.match(/^\s+/u)) == null ? void 0 : _d[0];
    if (!separator) return null;
    targetEnd += separator.length;
    remaining = text.slice(targetEnd);
  }
  return {
    before: text.slice(0, targetStart),
    target: text.slice(targetStart, targetEnd),
    after: text.slice(targetEnd)
  };
}

export { identificationFormParts as i };
//# sourceMappingURL=identification-form.mjs.map
