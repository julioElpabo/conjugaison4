const ALLOWED_TAGS = new Set([
  'b',
  'blockquote',
  'br',
  'code',
  'details',
  'del',
  'em',
  'figcaption',
  'figure',
  'i',
  'kbd',
  'li',
  'mark',
  'ol',
  'p',
  's',
  'small',
  'span',
  'strong',
  'summary',
  'sub',
  'sup',
  'samp',
  'table',
  'tbody',
  'td',
  'th',
  'tr',
  'u',
  'ul',
  'var',
])

const VOID_TAGS = new Set(['br'])
const BLOCKED_ELEMENTS = /<\s*(script|style|iframe|object|embed|svg|math|template|noscript)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/giu
const HTML_COMMENT = /<!--[\s\S]*?-->/gu
const HTML_TAG = /<\s*(\/?)\s*([a-z][a-z0-9-]*)(?:\s[^>]*)?>/giu

export function sanitizeCoachHtml(value: string): string {
  const withoutBlockedContent = value
    .replace(BLOCKED_ELEMENTS, '')
    .replace(HTML_COMMENT, '')

  return withoutBlockedContent.replace(HTML_TAG, (_tag, closing: string, rawName: string) => {
    const name = rawName.toLowerCase()
    if (!ALLOWED_TAGS.has(name)) return ''
    if (VOID_TAGS.has(name)) return `<${name}>`
    return closing ? `</${name}>` : `<${name}>`
  })
}
