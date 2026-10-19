import type { Element, ElementContent, Root, RootContent, Text } from 'hast'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

export const ACCENT_CLASS = 'stat-accent'

// Numbers with optional percent / multiplier / plus suffix: 40%, 2.4x, 3x, 120+, 1,200
const NUMBER_PATTERN = /\d+(?:[.,]\d+)*(?:\s?%|x(?![a-z])|\+)?/gi

const SKIP_TAGS = new Set(['code', 'pre', 'a', 'script', 'style'])

function splitText(node: Text): ElementContent[] {
  const value = node.value
  const parts: ElementContent[] = []
  let last = 0
  NUMBER_PATTERN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = NUMBER_PATTERN.exec(value)) !== null) {
    if (match.index > last) parts.push({ type: 'text', value: value.slice(last, match.index) })
    parts.push({
      type: 'element',
      tagName: 'span',
      properties: { className: [ACCENT_CLASS] },
      children: [{ type: 'text', value: match[0] }],
    })
    last = match.index + match[0].length
  }
  if (parts.length === 0) return [node]
  if (last < value.length) parts.push({ type: 'text', value: value.slice(last) })
  return parts
}

function accentChildren(children: Array<RootContent | ElementContent>): Array<RootContent | ElementContent> {
  const out: Array<RootContent | ElementContent> = []
  for (const child of children) {
    if (child.type === 'text') {
      out.push(...splitText(child))
    } else if (child.type === 'element') {
      const element = child as Element
      if (!SKIP_TAGS.has(element.tagName)) {
        element.children = accentChildren(element.children) as ElementContent[]
      }
      out.push(element)
    } else {
      out.push(child)
    }
  }
  return out
}

// Runs AFTER sanitize so the trusted accent span is not stripped.
function rehypeAccentNumbers() {
  return (tree: Root) => {
    tree.children = accentChildren(tree.children) as RootContent[]
  }
}

export type MarkdownOptions = { accentNumbers?: boolean }

export async function renderMarkdown(markdown: string, options: MarkdownOptions = {}): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, defaultSchema)

  if (options.accentNumbers) processor.use(rehypeAccentNumbers)

  const file = await processor.use(rehypeStringify).process(markdown || '')
  return String(file)
}
