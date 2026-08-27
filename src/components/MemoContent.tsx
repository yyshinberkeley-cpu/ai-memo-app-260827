'use client'

import {
  HeadingLevel,
  MemoInlineToken,
  parseMemoContent,
} from '@/utils/memoContent'

interface MemoContentProps {
  content: string
  variant?: 'preview' | 'detail'
}

const DETAIL_HEADING_STYLES: Record<HeadingLevel, string> = {
  1: 'text-2xl font-bold text-gray-900 leading-snug mt-5 mb-2 first:mt-0',
  2: 'text-xl font-bold text-gray-900 leading-snug mt-4 mb-2 first:mt-0',
  3: 'text-lg font-semibold text-gray-900 leading-snug mt-4 mb-1 first:mt-0',
  4: 'text-base font-semibold text-gray-900 leading-snug mt-3 mb-1 first:mt-0',
  5: 'text-sm font-semibold text-gray-800 leading-snug mt-3 mb-1 first:mt-0',
  6: 'text-sm font-semibold text-gray-500 leading-snug mt-3 mb-1 first:mt-0',
}

const PREVIEW_HEADING_STYLES: Record<HeadingLevel, string> = {
  1: 'text-base font-bold text-gray-900 leading-snug',
  2: 'text-sm font-bold text-gray-900 leading-snug',
  3: 'text-sm font-semibold text-gray-900 leading-snug',
  4: 'text-sm font-semibold text-gray-800 leading-snug',
  5: 'text-sm font-semibold text-gray-700 leading-snug',
  6: 'text-sm font-semibold text-gray-500 leading-snug',
}

function InlineTokens({ tokens }: { tokens: MemoInlineToken[] }) {
  return (
    <>
      {tokens.map((token, index) => {
        if (token.type === 'bold') {
          return (
            <strong key={index} className="font-semibold">
              {token.text}
            </strong>
          )
        }
        if (token.type === 'italic') {
          return <em key={index}>{token.text}</em>
        }
        if (token.type === 'strike') {
          return (
            <del key={index} className="text-gray-400">
              {token.text}
            </del>
          )
        }
        if (token.type === 'code') {
          return (
            <code
              key={index}
              className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded text-xs font-mono"
            >
              {token.text}
            </code>
          )
        }
        return <span key={index}>{token.text}</span>
      })}
    </>
  )
}

function Heading({
  level,
  className,
  tokens,
}: {
  level: HeadingLevel
  className: string
  tokens: MemoInlineToken[]
}) {
  const children = <InlineTokens tokens={tokens} />

  switch (level) {
    case 1:
      return <h3 className={className}>{children}</h3>
    case 2:
      return <h4 className={className}>{children}</h4>
    case 3:
      return <h5 className={className}>{children}</h5>
    default:
      return <h6 className={className}>{children}</h6>
  }
}

export default function MemoContent({
  content,
  variant = 'detail',
}: MemoContentProps) {
  const blocks = parseMemoContent(content)
  const isPreview = variant === 'preview'

  return (
    <div
      className={isPreview ? 'line-clamp-3' : undefined}
      data-testid={isPreview ? 'memo-card-content' : 'memo-detail-content'}
    >
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <Heading
                key={index}
                level={block.level}
                tokens={block.tokens}
                className={
                  isPreview
                    ? PREVIEW_HEADING_STYLES[block.level]
                    : DETAIL_HEADING_STYLES[block.level]
                }
              />
            )

          case 'list': {
            const listClassName = `text-gray-700 text-sm leading-relaxed ${
              block.ordered ? 'list-decimal' : 'list-disc'
            } pl-5 ${isPreview ? 'space-y-0' : 'space-y-1 my-2'}`

            const items = block.items.map((tokens, itemIndex) => (
              <li key={itemIndex}>
                <InlineTokens tokens={tokens} />
              </li>
            ))

            return block.ordered ? (
              <ol key={index} className={listClassName}>
                {items}
              </ol>
            ) : (
              <ul key={index} className={listClassName}>
                {items}
              </ul>
            )
          }

          case 'quote':
            return (
              <blockquote
                key={index}
                className="border-l-4 border-gray-200 pl-3 text-gray-600 text-sm leading-relaxed italic my-2"
              >
                <InlineTokens tokens={block.tokens} />
              </blockquote>
            )

          case 'divider':
            return <hr key={index} className="my-4 border-gray-200" />

          case 'empty':
            return <div key={index} className={isPreview ? 'h-2' : 'h-3'} />

          default:
            return (
              <p
                key={index}
                className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap"
              >
                <InlineTokens tokens={block.tokens} />
              </p>
            )
        }
      })}
    </div>
  )
}
