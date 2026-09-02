function sentenceTerminalMark(mode) {
  return (mode == null ? void 0 : mode.trim().toLocaleLowerCase("fr-CH")) === "imp\xE9ratif" ? " !" : ".";
}
function withSentenceTerminalMark(sentence, mode) {
  const trimmed = sentence.trimEnd();
  if (!trimmed || /[.!?…]$/u.test(trimmed)) return trimmed;
  return `${trimmed}${sentenceTerminalMark(mode)}`;
}

export { sentenceTerminalMark as s, withSentenceTerminalMark as w };
//# sourceMappingURL=sentence-punctuation.mjs.map
