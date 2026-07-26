export function shuffledQuestionOrder<T>(
  values: readonly T[],
  random: () => number = Math.random,
): T[] {
  const shuffled = [...values]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.min(index, Math.max(0, Math.floor(random() * (index + 1))))
    const current = shuffled[index]!
    shuffled[index] = shuffled[target]!
    shuffled[target] = current
  }
  if (shuffled.length > 1 && shuffled.every((value, index) => value === values[index])) {
    shuffled.push(shuffled.shift()!)
  }
  return shuffled
}
