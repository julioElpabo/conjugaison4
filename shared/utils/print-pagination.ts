export interface PaginatedItem<T> {
  item: T
  index: number
}

export function estimatedTextLines(value: string, charactersPerLine: number) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim()
  if (!normalized) return 1
  return Math.max(1, Math.ceil(normalized.length / charactersPerLine))
}

export function exerciseItemHeight(consigne: string) {
  return 9.5 + (estimatedTextLines(consigne, 86) - 1) * 5
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
