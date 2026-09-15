import cachedCommunity from './community-skins.json'

export const COMMUNITY_API_BASE = 'https://api-verse.zhangjh.cn'
export const COMMUNITY_PAGE_SIZE = 24
const REQUEST_TIMEOUT_MS = 12_000

export interface CommunitySkin {
  shareCode: string
  skinName: string
  authorName: string
  layout: 'horizontal' | 'vertical'
  hasBackgroundImage: boolean
  previewUrl: string
  createdAt: number
}

export interface CommunityData {
  skins: CommunitySkin[]
  historicalSkins: CommunitySkin[]
  total: number
  generatedAt: string
  source: 'remote' | 'cache'
}

function isSkin(value: unknown): value is CommunitySkin {
  if (!value || typeof value !== 'object') return false
  const skin = value as Record<string, unknown>
  const shareCode = String(skin.shareCode ?? '')
  if (!/^[A-Z0-9]{8}$/.test(shareCode)) return false
  if (!String(skin.skinName ?? '').trim() || !String(skin.authorName ?? '').trim()) return false
  if (skin.layout !== 'horizontal' && skin.layout !== 'vertical') return false
  if (typeof skin.createdAt !== 'number' || !Number.isFinite(skin.createdAt) || skin.createdAt <= 0) return false
  if (Number.isNaN(new Date(skin.createdAt).getTime()) || typeof skin.previewUrl !== 'string') return false
  try {
    const preview = new URL(skin.previewUrl)
    return (
      preview.protocol === 'https:' &&
      preview.hostname === 'api-verse.zhangjh.cn' &&
      preview.pathname === `/api/suyan/community/skins/${shareCode}/preview.png`
    )
  } catch {
    return false
  }
}

async function fetchJson(url: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

async function fetchCommunity(): Promise<CommunityData> {
  const skins: CommunitySkin[] = []
  const seen = new Set<string>()
  let expectedTotal = 0
  let page = 1

  while (page === 1 || skins.length < expectedTotal) {
    const url = `${COMMUNITY_API_BASE}/api/suyan/community/skins?page=${page}&limit=${COMMUNITY_PAGE_SIZE}`
    const payload = await fetchJson(url)
    const list = Array.isArray(payload?.skins) ? payload.skins.filter(isSkin) : []
    expectedTotal = Number(payload?.total ?? list.length)
    if (!Number.isFinite(expectedTotal) || expectedTotal < 0) throw new Error('Invalid community total')

    for (const skin of list) {
      if (!seen.has(skin.shareCode)) {
        seen.add(skin.shareCode)
        skins.push(skin)
      }
    }

    if (list.length === 0 || page > Math.ceil(expectedTotal / COMMUNITY_PAGE_SIZE) + 1) break
    page += 1
  }

  if (skins.length !== expectedTotal) {
    throw new Error(`Inconsistent community snapshot: expected ${expectedTotal}, received ${skins.length}`)
  }

  const activeCodes = new Set(skins.map((skin) => skin.shareCode))
  const historicalSkins = [
    ...skins,
    ...cachedCommunity.skins.filter(isSkin).filter((skin) => !activeCodes.has(skin.shareCode)),
  ]
  return {
    skins,
    historicalSkins,
    total: expectedTotal,
    generatedAt: skins.length
      ? new Date(Math.max(...skins.map((skin) => skin.createdAt))).toISOString()
      : new Date(0).toISOString(),
    source: 'remote',
  }
}

let communityPromise: Promise<CommunityData> | undefined

export function loadCommunityData(): Promise<CommunityData> {
  communityPromise ??= fetchCommunity().catch((error) => {
    console.warn(`[SEO] Community API unavailable, using cached snapshot: ${String(error)}`)
    const cachedSkins = cachedCommunity.skins.filter(isSkin)
    return {
      skins: cachedSkins,
      historicalSkins: cachedSkins,
      total: cachedCommunity.total,
      generatedAt: cachedCommunity.generatedAt,
      source: 'cache' as const,
    }
  })
  return communityPromise
}
