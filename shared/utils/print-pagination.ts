export interface PaginatedItem<T> {
  item: T
  index: number
}

export function estimatedTextLines(value: string, charactersPerLine: number) {
  const explicitLines = String(value || '').split(/\r?\n/u)
  return Math.max(1, explicitLines.reduce((total, line) => {
    const normalized = line.replace(/\s+/g, ' ').trim()
    return total + Math.max(1, Math.ceil(normalized.length / charactersPerLine))
  }, 0))
}

export function exerciseItemHeight(consigne: string, questionSpacingMm = 8) {
  return 5 + questionSpacingMm + (estimatedTextLines(consigne, 86) - 1) * 5
}

export function correctionItemHeight(consigne: string, answer: string) {
  const lines = Math.max(
    estimatedTextLines(consigne, 54),
    estimatedTextLines(answer, 38)
  )
  return 8 + (lines - 1) * 5
}

export function paginateByHeight<T>(
  items: readonly T[],
  firstPageCapacity: number,
  nextPageCapacity: number,
  itemHeight: (item: T) => number
) {
  const pages: Array<Array<PaginatedItem<T>>> = []
  let page: Array<PaginatedItem<T>> = []
  let used = 0
  let capacity = firstPageCapacity

  items.forEach((item, index) => {
    const height = Math.max(1, itemHeight(item))
    if (page.length > 0 && used + height > capacity) {
      pages.push(page)
      page = []
      used = 0
      capacity = nextPageCapacity
    }
    page.push({ item, index })
    used += height
  })

  if (page.length > 0) pages.push(page)
  return pages
}
