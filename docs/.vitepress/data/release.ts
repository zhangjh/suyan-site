import MarkdownIt from 'markdown-it'
import cachedRelease from './release-notes.json'

const RELEASE_API_URL = 'https://api.github.com/repos/zhangjh/suyan-site/releases/latest'
const REQUEST_TIMEOUT_MS = 12_000
const markdown = new MarkdownIt({ html: false, linkify: true })

export interface ReleaseNotesData {
  title: string
  publishedAt: string
  notesHtml: string
  source: 'remote' | 'cache'
}

function extractUpdateNotes(body: string): string {
  const lines = body.split(/\r?\n/)
  const startIndex = lines.findIndex((line) => /^#{1,6}\s+更新内容\s*$/.test(line))
  if (startIndex === -1) return ''

  const headingLevel = lines[startIndex].match(/^#+/)?.[0].length ?? 6
  const endIndex = lines.findIndex((line, index) => {
    if (index <= startIndex) return false
    const heading = line.match(/^(#{1,6})\s+/)
    return Boolean(heading && heading[1].length <= headingLevel)
  })
  const sectionLines = lines.slice(startIndex + 1, endIndex === -1 ? undefined : endIndex)
  while (sectionLines.length) {
    const lastLine = sectionLines.at(-1)?.trim() ?? ''
    if (lastLine && !/^(?:-{3,}|\*{3,}|_{3,})$/.test(lastLine)) break
    sectionLines.pop()
  }
  return sectionLines.join('\n').trim()
}

async function fetchReleaseNotes(): Promise<ReleaseNotesData> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(RELEASE_API_URL, {
      headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const release = await response.json()
    const notes = extractUpdateNotes(String(release.body ?? ''))
    if (!notes) throw new Error('Latest release has no 更新内容 section')
    return {
      title: String(release.name || release.tag_name || '最新版本'),
      publishedAt: String(release.published_at || release.updated_at || ''),
      notesHtml: markdown.render(notes),
      source: 'remote',
    }
  } finally {
    clearTimeout(timer)
  }
}

let releasePromise: Promise<ReleaseNotesData> | undefined

export function loadReleaseNotes(): Promise<ReleaseNotesData> {
  releasePromise ??= fetchReleaseNotes().catch((error) => {
    console.warn(`[SEO] GitHub Releases unavailable, using cached release notes: ${String(error)}`)
    return {
      title: cachedRelease.title,
      publishedAt: cachedRelease.publishedAt,
      notesHtml: markdown.render(cachedRelease.notesMarkdown),
      source: 'cache' as const,
    }
  })
  return releasePromise
}
