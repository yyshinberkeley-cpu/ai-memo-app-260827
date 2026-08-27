export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export type MemoInlineToken =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'italic'; text: string }
  | { type: 'code'; text: string }
  | { type: 'strike'; text: string }

export type MemoContentBlock =
  | { type: 'heading'; level: HeadingLevel; tokens: MemoInlineToken[] }
  | { type: 'paragraph'; tokens: MemoInlineToken[] }
  | { type: 'list'; ordered: boolean; items: MemoInlineToken[][] }
  | { type: 'quote'; tokens: MemoInlineToken[] }
  | { type: 'divider' }
  | { type: 'empty' }

// 한글 IME에서 입력될 수 있는 전각 샵(U+FF03)도 제목 기호로 취급한다.
const HEADING_PATTERN = /^[ \t]*(#{1,6})[ \t]*(.+)$/
const DIVIDER_PATTERN = /^[ \t]*([-*_])(?:[ \t]*\1){2,}[ \t]*$/
const QUOTE_PATTERN = /^[ \t]*>[ \t]?(.*)$/
const UNORDERED_ITEM_PATTERN = /^[ \t]*[-*+][ \t]+(.+)$/
const ORDERED_ITEM_PATTERN = /^[ \t]*\d+[.)][ \t]+(.+)$/
const INLINE_PATTERN =
  /\*\*(.+?)\*\*|__(.+?)__|`([^`]+)`|~~(.+?)~~|\*(.+?)\*|_(.+?)_/g

export function parseInline(text: string): MemoInlineToken[] {
  const tokens: MemoInlineToken[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  INLINE_PATTERN.lastIndex = 0
  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', text: text.slice(lastIndex, match.index) })
    }

    const bold = match[1] ?? match[2]
    const code = match[3]
    const strike = match[4]
    const italic = match[5] ?? match[6]

    if (bold !== undefined) {
      tokens.push({ type: 'bold', text: bold })
    } else if (code !== undefined) {
      tokens.push({ type: 'code', text: code })
    } else if (strike !== undefined) {
      tokens.push({ type: 'strike', text: strike })
    } else if (italic !== undefined) {
      tokens.push({ type: 'italic', text: italic })
    }

    lastIndex = INLINE_PATTERN.lastIndex
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', text: text.slice(lastIndex) })
  }

  return tokens
}

export function parseMemoContent(content: string): MemoContentBlock[] {
  const blocks: MemoContentBlock[] = []
  let listItems: string[] = []
  let listOrdered = false

  const flushList = () => {
    if (listItems.length === 0) return
    blocks.push({
      type: 'list',
      ordered: listOrdered,
      items: listItems.map(parseInline),
    })
    listItems = []
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.replace(/＃/g, '#')

    if (line.trim() === '') {
      flushList()
      blocks.push({ type: 'empty' })
      continue
    }

    if (DIVIDER_PATTERN.test(line)) {
      flushList()
      blocks.push({ type: 'divider' })
      continue
    }

    const heading = line.match(HEADING_PATTERN)
    if (heading) {
      flushList()
      blocks.push({
        type: 'heading',
        level: heading[1].length as HeadingLevel,
        tokens: parseInline(heading[2].trim()),
      })
      continue
    }

    const unordered = line.match(UNORDERED_ITEM_PATTERN)
    if (unordered) {
      if (listItems.length > 0 && listOrdered) flushList()
      listOrdered = false
      listItems.push(unordered[1].trim())
      continue
    }

    const ordered = line.match(ORDERED_ITEM_PATTERN)
    if (ordered) {
      if (listItems.length > 0 && !listOrdered) flushList()
      listOrdered = true
      listItems.push(ordered[1].trim())
      continue
    }

    const quote = line.match(QUOTE_PATTERN)
    if (quote) {
      flushList()
      blocks.push({ type: 'quote', tokens: parseInline(quote[1].trim()) })
      continue
    }

    flushList()
    blocks.push({ type: 'paragraph', tokens: parseInline(line) })
  }

  flushList()
  return blocks
}
