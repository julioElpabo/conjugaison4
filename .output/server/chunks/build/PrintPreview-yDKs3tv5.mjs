import { defineComponent, ref, useTemplateRef, computed, watch, unref, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
import { T as TENSE_IDENTIFICATION_INSTRUCTION } from '../_/exercise-instructions.mjs';
import { as as conjugationRequiresSubjectPronoun } from '../nitro/nitro.mjs';
import { g as useLanguagePreferences } from './server.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-Dqt6jAGm.mjs';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

function estimatedTextLines(value, charactersPerLine) {
  const explicitLines = String(value || "").split(/\r?\n/u);
  return Math.max(1, explicitLines.reduce((total, line) => {
    const normalized = line.replace(/\s+/g, " ").trim();
    return total + Math.max(1, Math.ceil(normalized.length / charactersPerLine));
  }, 0));
}
function exerciseItemHeight(consigne, questionSpacingMm = 8) {
  return 5 + questionSpacingMm + (estimatedTextLines(consigne, 86) - 1) * 5;
}
function correctionItemHeight(consigne, answer) {
  const lines = Math.max(
    estimatedTextLines(consigne, 54),
    estimatedTextLines(answer, 38)
  );
  return 8 + (lines - 1) * 5;
}
function paginateByHeight(items, firstPageCapacity, nextPageCapacity, itemHeight) {
  const pages = [];
  let page = [];
  let used = 0;
  let capacity = firstPageCapacity;
  items.forEach((item, index) => {
    const height = Math.max(1, itemHeight(item));
    if (page.length > 0 && used + height > capacity) {
      pages.push(page);
      page = [];
      used = 0;
      capacity = nextPageCapacity;
    }
    page.push({ item, index });
    used += height;
  });
  if (page.length > 0) pages.push(page);
  return pages;
}

const ANSWER_LINE = "_________________________________";
const GERUND_ANSWER_LINE = "______________________________________";
const LONG_COMPLETION_SUFFIX_LENGTH = 32;
function withSubjunctiveCue(sentence, question) {
  var _a;
  if (((_a = question.mode) == null ? void 0 : _a.trim().toLocaleLowerCase("fr-CH")) !== "subjonctif" || question.complementPosition === "before" || /^(?:que|qu['’])\s*/iu.test(sentence)) return sentence;
  return `que ${sentence}`.replace(/^que (i(?:l|ls|el|els)|elle?s?|on)\b/iu, "qu'$1");
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
function prefixWithoutWrittenSubject(prefix, question) {
  var _a, _b;
  const pronoun = ((_a = question.pronom) == null ? void 0 : _a.trim()) || "";
  const candidates = [
    (_b = question.saisiePrefixe) == null ? void 0 : _b.trim(),
    pronoun.toLocaleLowerCase("fr-CH") === "je" ? "j'" : "",
    pronoun
  ].filter((value) => Boolean(value)).sort((left, right) => right.length - left.length);
  for (const candidate of candidates) {
    const pattern = new RegExp(`${escapeRegExp(candidate).replace(/[’']/gu, "[\u2019']")}\\s*$`, "iu");
    if (!pattern.test(prefix)) continue;
    return prefix.replace(pattern, "").trim();
  }
  return prefix.trim();
}
function completionParts(sentence, question) {
  var _a;
  const promptedSentence = withSubjunctiveCue(sentence.trim(), question);
  const [prefix = "", ...suffixParts] = promptedSentence.split("\u2026");
  const rawSuffix = suffixParts.join("\u2026").trim();
  const isImperative = ((_a = question.mode) == null ? void 0 : _a.trim().toLocaleLowerCase("fr-CH")) === "imp\xE9ratif";
  const suffix = isImperative && !rawSuffix.endsWith("!") ? `${rawSuffix}${rawSuffix ? " " : ""}!` : rawSuffix;
  const requiresWrittenSubject = conjugationRequiresSubjectPronoun(question);
  const completionPrefix = requiresWrittenSubject ? prefixWithoutWrittenSubject(prefix.trim(), question) : question.complementPosition !== "before" && question.saisiePrefixe !== void 0 ? question.saisiePrefixe.trim() : prefix.trim();
  const answerLine = ANSWER_LINE;
  const suffixOnNextLine = suffix.length > LONG_COMPLETION_SUFFIX_LENGTH;
  const blankWidthPercent = suffixOnNextLine ? Math.max(32, Math.min(58, 72 - Math.round(suffix.length * 0.65))) : 100;
  return {
    completionPrefix,
    completionSuffix: suffix,
    fillBlank: promptedSentence.includes("\u2026") || suffixParts.length === 0,
    suffixOnNextLine,
    blankWidthPercent,
    completion: [completionPrefix, answerLine, suffix].filter(Boolean).join(" ")
  };
}
function printableQuestionParts(question, exerciseKind) {
  var _a, _b;
  if (exerciseKind === "tense-identification") {
    const sentence2 = question.literaryCitation ? `${question.literaryCitation.before}\u3010${question.literaryCitation.target}\u3011${question.literaryCitation.after} \u2014 ${question.literaryCitation.author}, ${question.literaryCitation.work}` : question.consigne;
    return {
      label: "",
      completion: sentence2,
      completionPrefix: sentence2,
      completionSuffix: "",
      fillBlank: false,
      suffixOnNextLine: false,
      blankWidthPercent: 100
    };
  }
  if (((_a = question.mode) == null ? void 0 : _a.trim().toLocaleLowerCase("fr-CH")) === "g\xE9rondif") {
    const infinitive2 = question.infinitif || question.titre;
    const tenseAndMode2 = [question.temps, `(${question.mode})`].filter(Boolean).join(" ");
    return {
      label: `${infinitive2} | ${tenseAndMode2} :`,
      completion: `en ${GERUND_ANSWER_LINE}`,
      completionPrefix: "en",
      completionSuffix: "",
      fillBlank: true,
      suffixOnNextLine: false,
      blankWidthPercent: 100
    };
  }
  if (((_b = question.mode) == null ? void 0 : _b.trim().toLocaleLowerCase("fr-CH")) === "participe") {
    const infinitive2 = question.infinitif || question.titre;
    const tenseAndMode2 = [question.temps, `(${question.mode})`].filter(Boolean).join(" ");
    return {
      label: `${infinitive2} | ${tenseAndMode2} :`,
      completion: ANSWER_LINE,
      completionPrefix: "",
      completionSuffix: "",
      fillBlank: true,
      suffixOnNextLine: false,
      blankWidthPercent: 100
    };
  }
  const parts = question.consigne.split("|").map((part) => part.trim());
  if (parts.length < 3) {
    return {
      label: "",
      completion: question.consigne,
      completionPrefix: question.consigne,
      completionSuffix: "",
      fillBlank: false,
      suffixOnNextLine: false,
      blankWidthPercent: 100
    };
  }
  const sentence = parts.slice(0, -2).join(" | ");
  const infinitive = parts.at(-2) || question.infinitif || "";
  const tenseAndMode = parts.at(-1) || [question.temps, question.mode ? `(${question.mode})` : ""].filter(Boolean).join(" ");
  const completion = completionParts(sentence, question);
  return {
    label: `${question.pronom ? `${question.pronom} | ` : ""}${infinitive} | ${tenseAndMode} :`,
    ...completion
  };
}
function printableQuestion(question, exerciseKind) {
  const parts = printableQuestionParts(question, exerciseKind);
  return [parts.label, parts.completion].filter(Boolean).join(" ");
}
function printableCorrectionAnswers(question) {
  const answers = [...new Set(question.reponsesPourCorrige.map((answer) => answer.trim()).filter(Boolean))];
  if (question.isCompound && answers.length > 1) return answers.slice(0, 1);
  return answers;
}
function printableCorrectionLabel(question, exerciseKind) {
  var _a;
  if (["g\xE9rondif", "participe"].includes(((_a = question.mode) == null ? void 0 : _a.trim().toLocaleLowerCase("fr-CH")) || "")) return question.consigne;
  const parts = printableQuestionParts(question, exerciseKind);
  return parts.label || parts.completion;
}
function printableCorrectionText(question) {
  return printableCorrectionAnswers(question).join("\n");
}

const GRADE_BOX_SIZE_MM = 17;
const INCLUSIVE_GRADE_TOP_MM = 26;
const INCLUSIVE_QUESTION_LINE_HEIGHT_MM = 7.5;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PrintPreview",
  __ssrInlineRender: true,
  props: {
    questions: {},
    verbs: {},
    tenses: {},
    exerciseKind: {},
    options: {},
    requestedQuestionCount: {},
    regenerating: { type: Boolean },
    analyticsMetadata: {}
  },
  emits: ["close", "updateOptions", "regenerate"],
  setup(__props, { emit: __emit }) {
    const { ui, uiLabel } = useLanguagePreferences();
    const props = __props;
    useSiteAnalytics();
    function randomSheetNumber(excluding) {
      let number = Math.floor(Math.random() * 9e3) + 1e3;
      while (number === excluding) number = Math.floor(Math.random() * 9e3) + 1e3;
      return number;
    }
    const sheetNumber = ref(randomSheetNumber());
    useTemplateRef("print-dialog");
    const isPdfBusy = ref(false);
    const isWordBusy = ref(false);
    const isPdfPreviewBusy = ref(true);
    const isPdfPreviewFrameReady = ref(false);
    const pdfPreviewUrl = ref("");
    const pdfPreviewError = ref("");
    const allowRepetitions = ref(false);
    let pdfPreviewGeneration = 0;
    let pdfPreviewTimer;
    function boundedOption(value, fallback, minimum, maximum) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
    }
    const questionSpacingMm = computed(() => boundedOption(props.options.questionSpacingMm, 8, 2, 15));
    const titleSpacingMm = computed(() => boundedOption(props.options.titleSpacingMm, 30, 8, 30));
    const inclusivePrint = computed(() => props.options.inclusiveDisplay);
    const effectiveQuestionSpacingMm = computed(() => inclusivePrint.value ? Math.max(10, questionSpacingMm.value) : questionSpacingMm.value);
    const pdfBodySize = computed(() => inclusivePrint.value ? 12 : 10.5);
    const pdfCorrectionSize = computed(() => inclusivePrint.value ? 12 : 9.5);
    const pdfLineHeightMm = computed(() => inclusivePrint.value ? 6.5 : 5);
    const isTenseIdentification = computed(() => props.exerciseKind === "tense-identification");
    const identificationAnswerHeightMm = computed(() => 8 + Math.max(0, 5 - questionSpacingMm.value));
    const missingQuestionCount = computed(() => Math.max(0, props.requestedQuestionCount - props.questions.length));
    const printableQuestions = computed(() => {
      if (!allowRepetitions.value || !missingQuestionCount.value || !props.questions.length) return props.questions;
      const result = [...props.questions];
      while (result.length < props.requestedQuestionCount) {
        const cycle = [...props.questions];
        for (let index = cycle.length - 1; index > 0; index -= 1) {
          const randomIndex = Math.floor(Math.random() * (index + 1));
          [cycle[index], cycle[randomIndex]] = [cycle[randomIndex], cycle[index]];
        }
        result.push(...cycle.slice(0, props.requestedQuestionCount - result.length));
      }
      return result;
    });
    const exerciseFirstPageCapacity = computed(() => {
      let capacity = 226;
      if (props.options.showFirstName || props.options.showLastName || props.options.showDate) {
        capacity -= Math.max(0, titleSpacingMm.value - 1);
      }
      if (inclusivePrint.value && props.options.showGrade) {
        const identityBottom = props.options.showFirstName || props.options.showLastName || props.options.showDate ? 18 + titleSpacingMm.value : 18;
        capacity -= Math.max(0, INCLUSIVE_GRADE_TOP_MM + GRADE_BOX_SIZE_MM - identityBottom);
      }
      if (props.options.showVerbs) capacity -= 8;
      if (props.options.showTenses) capacity -= 8;
      if (isTenseIdentification.value) capacity -= 19;
      else capacity -= 6;
      return capacity;
    });
    const exercisePages = computed(() => paginateByHeight(
      printableQuestions.value,
      exerciseFirstPageCapacity.value,
      220,
      (question) => {
        const printable = printableQuestionParts(question, props.exerciseKind);
        const inclusiveLineCount = Math.max(
          estimatedTextLines(printable.label, 34),
          estimatedTextLines(printable.completion, 48)
        );
        return exerciseItemHeight(printableQuestion(question, props.exerciseKind), effectiveQuestionSpacingMm.value) * (inclusivePrint.value ? 1.18 : 1) + (inclusivePrint.value ? Math.max(0, inclusiveLineCount - 1) * (INCLUSIVE_QUESTION_LINE_HEIGHT_MM - pdfLineHeightMm.value) : 0) + (printable.suffixOnNextLine ? 6 : 0) + (isTenseIdentification.value ? identificationAnswerHeightMm.value : 0) + (question.literaryCitation ? 4 : 0);
      }
    ));
    const correctionPages = computed(() => paginateByHeight(
      printableQuestions.value,
      205,
      220,
      (question) => isTenseIdentification.value ? correctionItemHeight("", printableCorrectionText(question)) * (inclusivePrint.value ? 1.35 : 1) : correctionItemHeight(printableCorrectionLabel(question, props.exerciseKind), printableCorrectionText(question)) * (inclusivePrint.value ? 1.35 : 1)
    ));
    function pdfSafe(value) {
      return String(value ?? "").replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/…/g, "...").replace(/–|—/g, "-").replace(/【/g, "[").replace(/】/g, "]");
    }
    function capitalizePrintLine(value) {
      return String(value ?? "").replace(
        new RegExp("^(\\s*)(\\p{L})", "u"),
        (_match, spacing, letter) => `${spacing}${letter.toLocaleUpperCase("fr-CH")}`
      );
    }
    function capitalizePrintText(value) {
      return String(value ?? "").split("\n").map(capitalizePrintLine).join("\n");
    }
    async function buildPdf() {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageWidth = 210;
      const pageHeight = 297;
      const left = 17;
      const right = 193;
      const title = pdfSafe(props.options.title || ui("Défi de conjugaison"));
      const identifier = props.options.showRandomNumber ? ` n° ${sheetNumber.value}` : "";
      const bodySize = pdfBodySize.value;
      const correctionSize = pdfCorrectionSize.value;
      const lineHeight = pdfLineHeightMm.value;
      const questionLineHeight = inclusivePrint.value ? INCLUSIVE_QUESTION_LINE_HEIGHT_MM : lineHeight;
      const questionLineHeightFactor = questionLineHeight / (bodySize * 25.4 / 72);
      let pageCount = 0;
      function addPage() {
        if (pageCount > 0) pdf.addPage("a4", "portrait");
        pageCount += 1;
      }
      function drawFooter() {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(105, 105, 105);
        pdf.text("conjugaison.tatitotu.ch", pageWidth / 2, pageHeight - 8, { align: "center" });
        pdf.setTextColor(20, 20, 20);
      }
      function drawExerciseHeader(continuation) {
        if (continuation) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(inclusivePrint.value ? 12 : 8.5);
          pdf.setTextColor(90, 90, 90);
          pdf.text(`${title}${identifier}`, pageWidth / 2, 12, { align: "center" });
          pdf.setTextColor(20, 20, 20);
          return 32;
        }
        let y = 18;
        const gradeTop = inclusivePrint.value ? INCLUSIVE_GRADE_TOP_MM : 15;
        const identity = [
          props.options.showFirstName ? `${ui("Prénom")} : ____________________` : "",
          props.options.showLastName ? `${ui("Nom")} : ____________________` : "",
          props.options.showDate ? `${ui("Date")} : ______________` : ""
        ].filter(Boolean);
        if (identity.length) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(inclusivePrint.value ? 12 : 8.5);
          pdf.text(pdfSafe(identity.join("     ")), left, y);
          y += titleSpacingMm.value;
        }
        if (props.options.showGrade) {
          pdf.setDrawColor(40, 40, 40);
          pdf.rect(right - GRADE_BOX_SIZE_MM, gradeTop, GRADE_BOX_SIZE_MM, GRADE_BOX_SIZE_MM);
          if (inclusivePrint.value) y = Math.max(y, gradeTop + GRADE_BOX_SIZE_MM);
        }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(17);
        const heading = `${title}${identifier}`;
        const titleLines = pdf.splitTextToSize(inclusivePrint.value ? heading : heading.toUpperCase(), 150);
        pdf.text(titleLines, left, y + 8);
        y += titleLines.length * 7 + 10;
        pdf.setFontSize(inclusivePrint.value ? 12 : 9);
        if (props.options.showVerbs) {
          const lines = pdf.splitTextToSize(`Verbes : ${pdfSafe(props.verbs.map((verb) => verb.infinitif).join(", "))}`, 176);
          pdf.text(lines, left, y);
          y += lines.length * (inclusivePrint.value ? 6.5 : 4.5) + 2;
        }
        if (props.options.showTenses) {
          const lines = pdf.splitTextToSize(`${ui("Temps :")} ${pdfSafe(props.tenses.map((tense) => uiLabel(tense.name)).join(", "))}`, 176);
          pdf.text(lines, left, y);
          y += lines.length * (inclusivePrint.value ? 6.5 : 4.5) + 2;
        }
        if (isTenseIdentification.value) {
          pdf.setDrawColor(120, 120, 120);
          pdf.rect(left, y, 176, 10);
          pdf.text(TENSE_IDENTIFICATION_INSTRUCTION, left + 3, y + 6);
          y += 21;
        }
        return y + (isTenseIdentification.value ? 2 : 8);
      }
      function drawCorrectionHeader(continuation) {
        if (continuation) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(inclusivePrint.value ? 12 : 8.5);
          pdf.setTextColor(90, 90, 90);
          pdf.text(`${title} - corrigé${identifier}`, pageWidth / 2, 12, { align: "center" });
          pdf.setTextColor(20, 20, 20);
          return 32;
        }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(17);
        pdf.setTextColor(20, 20, 20);
        const correctionTitle = inclusivePrint.value ? capitalizePrintLine(ui("CORRIGÉ").toLocaleLowerCase("fr-CH")) : ui("CORRIGÉ");
        pdf.text(`${correctionTitle}${identifier}`, left, 26);
        return 38;
      }
      function pdfLiteraryCitation(question, width) {
        const citation = question.literaryCitation;
        if (!citation) return null;
        const before = pdfSafe(citation.before).replace(/\s+/gu, " ");
        const target = pdfSafe(citation.target).replace(/\s+/gu, " ");
        const after = pdfSafe(citation.after).replace(/\s+/gu, " ");
        const text = capitalizePrintLine(`${before}${target}${after}`);
        const source = pdfSafe(`- ${citation.author}, ${citation.work}`);
        const targetStart = before.length;
        const targetEnd = targetStart + target.length;
        let cursor = 0;
        const lines = pdf.splitTextToSize(text, width).map((line) => {
          const located = text.indexOf(line, cursor);
          const start = located >= 0 ? located : cursor;
          cursor = start + line.length;
          return { text: line, start };
        });
        const previousSize = pdf.getFontSize();
        const previousStyle = pdf.getFont().fontStyle;
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(inclusivePrint.value ? 12 : 8.3);
        const sourceLines = pdf.splitTextToSize(source, width);
        pdf.setFont("helvetica", previousStyle);
        pdf.setFontSize(previousSize);
        return {
          lines,
          sourceLines,
          targetStart,
          targetEnd,
          height: lines.length * questionLineHeight + sourceLines.length * (inclusivePrint.value ? 6.5 : 4)
        };
      }
      function drawPdfLiteraryCitation(citation, x, y) {
        citation.lines.forEach((line, lineIndex) => {
          const baseline = y + lineIndex * questionLineHeight;
          pdf.text(line.text, x, baseline);
          const overlapStart = Math.max(line.start, citation.targetStart);
          const overlapEnd = Math.min(line.start + line.text.length, citation.targetEnd);
          if (overlapEnd <= overlapStart) return;
          const prefix = line.text.slice(0, overlapStart - line.start);
          const underlined = line.text.slice(overlapStart - line.start, overlapEnd - line.start);
          const underlineStart = x + pdf.getTextWidth(prefix);
          pdf.setDrawColor(25, 25, 25);
          pdf.setLineWidth(0.25);
          pdf.line(underlineStart, baseline + 0.8, underlineStart + pdf.getTextWidth(underlined), baseline + 0.8);
        });
        const previousSize = pdf.getFontSize();
        const previousStyle = pdf.getFont().fontStyle;
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(inclusivePrint.value ? 12 : 8.3);
        pdf.setTextColor(90, 90, 90);
        citation.sourceLines.forEach((line, lineIndex) => {
          pdf.text(line, x, y + citation.lines.length * questionLineHeight + lineIndex * (inclusivePrint.value ? 6.5 : 4));
        });
        pdf.setTextColor(20, 20, 20);
        pdf.setFont("helvetica", previousStyle);
        pdf.setFontSize(previousSize);
      }
      function drawExercisePage(page, continuation) {
        addPage();
        let y = drawExerciseHeader(continuation);
        pdf.setFontSize(bodySize);
        page.forEach(({ item: question, index }) => {
          const prefix = `${index + 1}. `;
          const printable = printableQuestionParts(question, props.exerciseKind);
          pdf.setFont("helvetica", "normal");
          const labelLines = pdf.splitTextToSize(pdfSafe(capitalizePrintLine(printable.label)), 68);
          const completionWidth = printable.label ? 96 : 169;
          const literaryCitation = pdfLiteraryCitation(question, completionWidth);
          const completionLines = literaryCitation ? [...literaryCitation.lines.map((line) => line.text), ...literaryCitation.sourceLines] : printable.fillBlank ? [pdfSafe(capitalizePrintLine(printable.completion))] : pdf.splitTextToSize(pdfSafe(capitalizePrintLine(printable.completion)), completionWidth);
          const completionX = printable.label ? 96 : left + 7;
          const before = pdfSafe(capitalizePrintLine(printable.completionPrefix));
          const after = pdfSafe(printable.completionSuffix);
          const lineStart = completionX + (before ? pdf.getTextWidth(before) + 2 : 0);
          const availableLineEnd = right - (!printable.suffixOnNextLine && after ? pdf.getTextWidth(after) + 2 : 0);
          const lineEnd = printable.suffixOnNextLine ? completionX + completionWidth * (printable.blankWidthPercent / 100) : availableLineEnd;
          let firstSuffixLine = "";
          let remainingSuffixLines = [];
          if (printable.suffixOnNextLine && after) {
            const suffixStart = lineEnd + 2;
            const firstLineWidth = Math.max(0, right - suffixStart);
            const words = after.split(/\s+/u).filter(Boolean);
            const firstLineWords = [];
            while (words.length) {
              const candidate = [...firstLineWords, words[0]].join(" ");
              if (firstLineWords.length && pdf.getTextWidth(candidate) > firstLineWidth) break;
              if (!firstLineWords.length && pdf.getTextWidth(candidate) > firstLineWidth) break;
              firstLineWords.push(words.shift());
            }
            firstSuffixLine = firstLineWords.join(" ");
            remainingSuffixLines = words.length ? pdf.splitTextToSize(words.join(" "), completionWidth) : [];
          }
          const completionLineCount = printable.suffixOnNextLine ? 1 + remainingSuffixLines.length : completionLines.length;
          const lineCount = Math.max(labelLines.length, completionLineCount);
          pdf.text(prefix, left, y);
          if (printable.label) pdf.text(labelLines, left + 7, y, { lineHeightFactor: questionLineHeightFactor });
          if (printable.fillBlank) {
            if (before) pdf.text(before, completionX, y);
            if (after && !printable.suffixOnNextLine) pdf.text(after, right, y, { align: "right" });
            if (lineEnd > lineStart) {
              pdf.setDrawColor(55, 55, 55);
              pdf.line(lineStart, y + 0.8, lineEnd, y + 0.8);
            }
            if (printable.suffixOnNextLine) {
              if (firstSuffixLine) pdf.text(firstSuffixLine, lineEnd + 2, y);
              remainingSuffixLines.forEach((line, lineIndex) => {
                pdf.text(line, completionX, y + questionLineHeight + lineIndex * questionLineHeight);
              });
            }
          } else if (literaryCitation) {
            drawPdfLiteraryCitation(literaryCitation, completionX, y);
          } else {
            pdf.text(completionLines, completionX, y, { lineHeightFactor: questionLineHeightFactor });
          }
          if (isTenseIdentification.value) {
            const questionHeight = literaryCitation ? literaryCitation.height : lineCount * questionLineHeight;
            const answerY = y + questionHeight + 2;
            const modeLabel = pdfSafe(ui("Mode :"));
            const tenseLabel = pdfSafe(ui("Temps :"));
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(inclusivePrint.value ? 12 : 9.5);
            pdf.setTextColor(70, 70, 70);
            pdf.text(modeLabel, left + 7, answerY);
            pdf.text(tenseLabel, 108, answerY);
            pdf.setDrawColor(105, 105, 105);
            pdf.line(left + 7 + pdf.getTextWidth(modeLabel) + 2, answerY + 0.7, 101, answerY + 0.7);
            pdf.line(108 + pdf.getTextWidth(tenseLabel) + 2, answerY + 0.7, right, answerY + 0.7);
            pdf.setTextColor(20, 20, 20);
            pdf.setFontSize(bodySize);
            y += questionHeight + 8 + Math.max(5, effectiveQuestionSpacingMm.value);
          } else {
            y += Math.max(questionLineHeight + effectiveQuestionSpacingMm.value, lineCount * questionLineHeight + effectiveQuestionSpacingMm.value);
          }
        });
        drawFooter();
      }
      function drawCorrectionPage(page, continuation) {
        addPage();
        let y = drawCorrectionHeader(continuation);
        pdf.setFontSize(correctionSize);
        page.forEach(({ item: question, index }) => {
          const answer = printableCorrectionAnswers(question).flatMap((value) => pdf.splitTextToSize(
            pdfSafe(capitalizePrintText(value)),
            isTenseIdentification.value ? 169 : 82
          ));
          const answerHeight = answer.length * lineHeight;
          if (isTenseIdentification.value) {
            const rowHeight2 = Math.max(inclusivePrint.value ? 13 : 9, answerHeight + 4);
            const textY = y + Math.max(0, (rowHeight2 - answerHeight) / 2);
            pdf.setFont("helvetica", "normal");
            pdf.text(`${index + 1}.`, left, textY, { baseline: "top" });
            pdf.setFont("helvetica", "bold");
            pdf.text(answer, left + 10, textY, { baseline: "top" });
            pdf.setDrawColor(225, 225, 225);
            pdf.line(left, y + rowHeight2, right, y + rowHeight2);
            y += rowHeight2;
            return;
          }
          const prompt = pdf.splitTextToSize(
            pdfSafe(capitalizePrintLine(printableCorrectionLabel(question, props.exerciseKind))),
            79
          );
          const promptHeight = prompt.length * lineHeight;
          const rowHeight = Math.max(inclusivePrint.value ? 13 : 8, Math.max(promptHeight, answerHeight) + 3);
          const numberY = y + Math.max(0, (rowHeight - lineHeight) / 2);
          const promptY = y + Math.max(0, (rowHeight - promptHeight) / 2);
          const answerY = y + Math.max(0, (rowHeight - answerHeight) / 2);
          pdf.setFont("helvetica", "normal");
          pdf.text(`${index + 1}.`, left, numberY, { baseline: "top" });
          pdf.text(prompt, left + 7, promptY, { baseline: "top" });
          pdf.setFont("helvetica", "bold");
          pdf.text(answer, 106, answerY, { baseline: "top" });
          pdf.setDrawColor(220, 220, 220);
          pdf.line(left, y + rowHeight, right, y + rowHeight);
          y += rowHeight;
        });
        drawFooter();
      }
      exercisePages.value.forEach((page, index) => drawExercisePage(page, index > 0));
      correctionPages.value.forEach((page, index) => drawCorrectionPage(page, index > 0));
      return pdf;
    }
    function revokePdfPreviewUrl() {
      if (!pdfPreviewUrl.value) return;
      URL.revokeObjectURL(pdfPreviewUrl.value);
      pdfPreviewUrl.value = "";
    }
    async function refreshPdfPreview() {
      const generation = ++pdfPreviewGeneration;
      isPdfPreviewBusy.value = true;
      isPdfPreviewFrameReady.value = false;
      pdfPreviewError.value = "";
      try {
        const pdf = await buildPdf();
        const blob = pdf.output("blob");
        if (generation !== pdfPreviewGeneration) return;
        revokePdfPreviewUrl();
        pdfPreviewUrl.value = URL.createObjectURL(blob);
      } catch (error) {
        if (generation !== pdfPreviewGeneration) return;
        console.error(ui("Impossible de générer l’aperçu PDF."), error);
        pdfPreviewError.value = ui("L’aperçu PDF n’a pas pu être créé.");
      } finally {
        if (generation === pdfPreviewGeneration) isPdfPreviewBusy.value = false;
      }
    }
    function schedulePdfPreview() {
      if (pdfPreviewTimer) clearTimeout(pdfPreviewTimer);
      pdfPreviewTimer = setTimeout(() => {
        pdfPreviewTimer = void 0;
        void refreshPdfPreview();
      }, 250);
    }
    watch(
      () => ({
        questions: printableQuestions.value,
        verbs: props.verbs,
        tenses: props.tenses,
        exerciseKind: props.exerciseKind,
        options: props.options
      }),
      schedulePdfPreview,
      { deep: true }
    );
    watch(
      () => props.questions,
      () => {
        sheetNumber.value = randomSheetNumber(sheetNumber.value);
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="print-overlay" data-tour="print-preview" role="dialog" aria-modal="true" aria-labelledby="print-preview-title" tabindex="-1"><div class="print-toolbar no-print"><div><strong id="print-preview-title">${ssrInterpolate(unref(ui)("Aperçu avant impression"))}</strong></div><div><button class="secondary-button" type="button">${ssrInterpolate(unref(ui)("Fermer"))}</button><button class="secondary-button" type="button"${ssrIncludeBooleanAttr(unref(isWordBusy)) ? " disabled" : ""}>${ssrInterpolate(unref(isWordBusy) ? "Création du fichier Word…" : "Télécharger au format Word")}</button><button class="primary-button" type="button"${ssrIncludeBooleanAttr(unref(isPdfBusy)) ? " disabled" : ""}>${ssrInterpolate(unref(isPdfBusy) ? "Création du PDF…" : "Télécharger le PDF")}</button></div></div><div class="print-preview-layout"><aside class="print-settings no-print" data-tour="print-settings" aria-labelledby="print-settings-title"><div class="print-settings__heading"><p>${ssrInterpolate(unref(ui)("Personnalisation"))}</p><h2 id="print-settings-title">${ssrInterpolate(unref(ui)("Options de la fiche"))}</h2><span>${ssrInterpolate(unref(ui)("Les changements apparaissent immédiatement dans l’aperçu."))}</span></div><section class="print-sheet-generation"${ssrRenderAttr("aria-label", unref(ui)("Questions de la fiche"))}><button class="secondary-button print-sheet-generation__random" type="button"${ssrIncludeBooleanAttr(__props.regenerating) ? " disabled" : ""}>${ssrInterpolate(__props.regenerating ? unref(ui)("Création d’une nouvelle fiche…") : unref(ui)("Nouvelle fiche au hasard"))}</button>`);
        if (unref(missingQuestionCount)) {
          _push2(`<div class="print-question-shortage"><strong role="status">${ssrInterpolate(unref(ui)("Seulement {available} questions différentes sont disponibles sur les {requested} demandées", {
            available: __props.questions.length,
            requested: __props.requestedQuestionCount
          }))}</strong><div class="print-question-shortage__action"><span aria-hidden="true">↳</span><button type="button" class="${ssrRenderClass({ "is-active": unref(allowRepetitions) })}"${ssrRenderAttr("aria-pressed", unref(allowRepetitions))}>${ssrInterpolate(unref(allowRepetitions) ? unref(ui)("Répétitions autorisées") : unref(ui)("Autoriser les répétitions"))}</button></div></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</section><label class="print-settings__field" for="preview-print-title"><span>${ssrInterpolate(unref(ui)("Titre de la fiche"))}</span><input id="preview-print-title" type="text"${ssrRenderAttr("value", __props.options.title)}></label><fieldset class="print-settings__group"><legend>${ssrInterpolate(unref(ui)("Mise en page"))}</legend><label class="print-settings__inclusive"><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.inclusiveDisplay) ? " checked" : ""}><span><strong>${ssrInterpolate(unref(ui)("Affichage inclusif"))}</strong><small>${ssrInterpolate(unref(ui)("Texte agrandi, police Arial, interligne renforcé et mise en page plus aérée."))}</small></span></label><label class="print-settings__number-field" for="preview-title-spacing"><span>${ssrInterpolate(unref(ui)("Espace avant le titre"))}</span><span><input id="preview-title-spacing" type="number" min="8" max="30" step="1"${ssrRenderAttr("value", unref(titleSpacingMm))}> mm </span></label><label class="print-settings__number-field" for="preview-question-spacing"><span>${ssrInterpolate(unref(ui)("Espacement entre les questions"))}</span><span><input id="preview-question-spacing" type="number" min="2" max="15" step="0.5"${ssrRenderAttr("value", unref(questionSpacingMm))}> mm </span></label></fieldset><fieldset class="print-settings__group"><legend>${ssrInterpolate(unref(ui)("Informations de l’élève"))}</legend><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showFirstName) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Prénom"))}</span></label><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showLastName) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Nom"))}</span></label><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showDate) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Date"))}</span></label><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showGrade) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Espace pour la note"))}</span></label></fieldset><fieldset class="print-settings__group"><legend>${ssrInterpolate(unref(ui)("Contenu affiché"))}</legend><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showVerbs) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Liste des verbes"))}</span></label><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showTenses) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Liste des temps"))}</span></label><label><input type="checkbox"${ssrIncludeBooleanAttr(__props.options.showRandomNumber) ? " checked" : ""}><span>${ssrInterpolate(unref(ui)("Numéro questionnaire/corrigé"))}</span></label></fieldset></aside><main class="print-document print-document--pdf">`);
        if (unref(pdfPreviewUrl)) {
          _push2(`<iframe class="pdf-preview-frame"${ssrRenderAttr("src", `${unref(pdfPreviewUrl)}#view=FitH&toolbar=1&navpanes=0`)}${ssrRenderAttr("title", unref(ui)("Aperçu exact de la fiche PDF et de son corrigé"))}></iframe>`);
        } else {
          _push2(`<!---->`);
        }
        if (!unref(pdfPreviewError) && (unref(isPdfPreviewBusy) || !unref(isPdfPreviewFrameReady))) {
          _push2(`<div class="pdf-preview-state" role="status" aria-live="polite"><span class="pdf-preview-spinner" aria-hidden="true"></span><strong>${ssrInterpolate(unref(ui)("Création de l’aperçu PDF…"))}</strong><span>${ssrInterpolate(unref(ui)("La fiche et le corrigé sont mis en page."))}</span></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(pdfPreviewError)) {
          _push2(`<div class="pdf-preview-state pdf-preview-state--error" role="alert"><strong>${ssrInterpolate(unref(pdfPreviewError))}</strong><button class="secondary-button" type="button">${ssrInterpolate(unref(ui)("Réessayer"))}</button></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</main></div></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/challenge/PrintPreview.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const PrintPreview = Object.assign(_sfc_main, { __name: "ChallengePrintPreview" });

export { PrintPreview as default };
//# sourceMappingURL=PrintPreview-yDKs3tv5.mjs.map
