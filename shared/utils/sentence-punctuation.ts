export function sentenceTerminalMark(mode?: string) {
  return mode?.trim().toLocaleLowerCase('fr-CH') === 'impératif' ? ' !' : '.'
}

export function withSentenceTerminalMark(sentence: string, mode?: string) {
  const trimmed = sentence.trimEnd()
  if (!trimmed || /[.!?…]$/u.test(trimmed)) return trimmed
  return `${trimmed}${sentenceTerminalMark(mode)}`
}
