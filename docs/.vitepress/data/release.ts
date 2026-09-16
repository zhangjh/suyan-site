import MarkdownIt from 'markdown-it'
import cachedRelease from './release-notes.json'

// 线上浏览器端：走同源 Pages Function 代理（functions/api/latest-release.js），
// 由服务端携带 GITHUB_TOKEN 请求 GitHub，实时获取、不做缓存。
// 构建期（Node 环境，config.mts SEO 元数据与 download.data.ts loader）：
// 代理接口不存在，仍直接请求 GitHub API，失败回退缓存 release-notes.json。
const GITHUB_API_URL = 'https://api.github.com/repos/zhangjh/suyan-site/releases/latest'
const PROXY_API_URL = '/api/latest-release'
const isBrowser = typeof window !== 'undefined'
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
    const response = await fetch(isBrowser ? PROXY_API_URL : GITHUB_API_URL, {
      headers: { Accept: 'application/json' },
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
