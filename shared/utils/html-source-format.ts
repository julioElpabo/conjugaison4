const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
])

interface HtmlSourceToken {
  source: string
  kind: 'tag' | 'text'
}

function tokenizeHtmlSource(source: string): HtmlSourceToken[] {
  const tokens: HtmlSourceToken[] = []
  let cursor = 0
  while (cursor < source.length) {
    if (source[cursor] !== '<') {
      const nextTag = source.indexOf('<', cursor)
      const end = nextTag < 0 ? source.length : nextTag
      tokens.push({ source: source.slice(cursor, end), kind: 'text' })
      cursor = end
      continue
    }
    if (source.startsWith('<!--', cursor)) {
      const commentEnd = source.indexOf('-->', cursor + 4)
      const end = commentEnd < 0 ? source.length : commentEnd + 3
      tokens.push({ source: source.slice(cursor, end), kind: 'tag' })
      cursor = end
      continue
    }
    let end = cursor + 1
    let quote = ''
    while (end < source.length) {
      const character = source[end] || ''
      if (quote) {
        if (character === quote) quote = ''
      } else if (character === '"' || character === "'") quote = character
      else if (character === '>') {
        end += 1
        break
      }
      end += 1
    }
    const candidate = source.slice(cursor, end)
    if (/^<\s*(?:\/?[a-z][\w:-]*\b|!|\?)/iu.test(candidate)) tokens.push({ source: candidate, kind: 'tag' })
    else tokens.push({ source: candidate, kind: 'text' })
    cursor = end
  }
  return tokens
}

function openingTagName(token: HtmlSourceToken): string {
  if (token.kind !== 'tag' || /^<\s*\//u.test(token.source)) return ''
  return token.source.match(/^<\s*([a-z][\w:-]*)\b/iu)?.[1]?.toLowerCase() || ''
}

function closingTagName(token: HtmlSourceToken): string {
  if (token.kind !== 'tag') return ''
  return token.source.match(/^<\s*\/\s*([a-z][\w:-]*)\b/iu)?.[1]?.toLowerCase() || ''
}

function isStandaloneTag(token: HtmlSourceToken, tagName: string): boolean {
  return !tagName || VOID_TAGS.has(tagName) || /\/\s*>$/u.test(token.source) || /^<\s*[!?]/u.test(token.source)
}

/** Indente toute structure HTML sans interpréter le texte ni les variables des aides. */
export function formatCoachHtmlSource(value: string): string {
  const source = value.trim()
  if (!source || !/<\s*\/?[a-z][\w:-]*\b/iu.test(source)) return value

  const tokens = tokenizeHtmlSource(source)
  const lines: string[] = []
  let depth = 0
  const addLine = (content: string) => lines.push(`${'  '.repeat(Math.max(0, depth))}${content}`)

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (!token) continue
    if (token.kind === 'text') {
      const text = token.source.trim()
      if (text) addLine(text)
      continue
    }

    const closingName = closingTagName(token)
    if (closingName) {
      depth = Math.max(0, depth - 1)
      addLine(token.source.trim())
      continue
    }

    const openingName = openingTagName(token)
    if (isStandaloneTag(token, openingName)) {
      addLine(token.source.trim())
      continue
    }

    const content = tokens[index + 1]
    const closing = tokens[index + 2]
    if (content?.kind === 'text' && closing && closingTagName(closing) === openingName) {
      addLine(`${token.source.trim()}${content.source}${closing.source.trim()}`)
      index += 2
      continue
    }
    if (closing && closingTagName(closing) === openingName) {
      addLine(`${token.source.trim()}${closing.source.trim()}`)
      index += 1
      continue
    }

    addLine(token.source.trim())
    depth += 1
  }

  return lines.join('\n')
}
