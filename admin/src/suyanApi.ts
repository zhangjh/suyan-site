import { getAdminToken, dispatchAdminUnauthorized } from './adminApi'

/**
 * 素言管理后台 API 客户端（独立模块，不修改 adminApi.ts）。
 * 复用 adminApi 的 token 工具，但 token 存独立的 suyan-admin-token，
 * 且只与 suyan-server 通信（可选独立 ADMIN_JWT_SECRET，见迁移文档 D4）。
 * 所有端点挂载于 /api/admin/suyan。
 */

// 与 adminApi.ts 保持一致：dev 走本地 proxy，prod 默认 api-suyan，可被 VITE_API_URL 覆盖。
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://api-suyan.zhangjh.cn')

async function suyanRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getAdminToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    dispatchAdminUnauthorized()
    throw new Error('Unauthorized')
  }

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data as T
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface SuyanDashboardTotals {
  totalUsers: number
  todayNewUsers: number
  activeSyncSubscribers: number
  expiring7Days: number
  expiring30Days: number
  /** 翻译加油包（兼容旧字段名） */
  rechargeCount: number
  rechargeTokens: number
  rechargeRevenueYuan: number
  translateRechargeCount: number
  translateRechargeTokens: number
  translateRechargeRevenueYuan: number
  /** 语音加油包 */
  voiceRechargeCount: number
  voiceRechargeTokens: number
  voiceRechargeRevenueYuan: number
  syncSubOrderCount: number
  syncSubRevenueYuan: number
  syncConfigUsers: number
  totalFrequencyEntries: number
  totalDictFiles: number
  /** 免费语音额度（S-8）：领取率 = 已发放/总用户，激活率 = 用过/已发放 */
  voiceGrant?: SuyanVoiceGrantStats
}

export interface SuyanVoiceGrantStats {
  /** 已发放赠额的账号数（服务端自动发放，非用户主动领取） */
  grantedUsers: number
  /** 已发放 token 总量（20 分钟 = 166,800/人） */
  grantedTokens: number
  /** 领取率 %，分母为总用户数 */
  claimRate: number
  /** 领过赠额且产生过 voice_consume 的账号数 */
  activatedUsers: number
  /** 激活率 %，分母为已发放账号数 */
  activationRate: number
  /** 赠额账号的语音总消耗 token（台账未做 FIFO 拆分，含充值后的消耗） */
  consumedTokens: number
  /** 领过赠额、后来又买了语音包的账号数 */
  convertUsers: number
  /** 转化率 %，分母为已发放账号数 */
  convertRate: number
  /** 赠额用完（余额 0 且从未充值）的账号数 */
  exhaustedUsers: number
  /** 未消耗存量 token，即尚未发生的成本敞口 */
  remainingTokens: number
  /** 到期清零（voice_expire）的账号数与 token 数 */
  expiredUsers: number
  expiredTokens: number
}

export interface SuyanDashboard {
  totals: SuyanDashboardTotals
  timeseries: {
    days: string[]
    newUsers: number[]
    rechargeCount: number[]
    rechargeYuan: number[]
    rechargeTokens: number[]
    voiceRechargeCount: number[]
    voiceRechargeYuan: number[]
    voiceRechargeTokens: number[]
    /** 每日发放赠额的账号数 */
    voiceGrantCount: number[]
    /** 每日语音消耗 token（全量，含赠额与充值） */
    voiceConsumeTokens: number[]
    syncSubCount: number[]
  }
}

export function fetchSuyanDashboard(): Promise<SuyanDashboard> {
  return suyanRequest('GET', '/api/admin/suyan/dashboard')
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface SuyanUser {
  id: string
  provider: string
  providerUid: string
  displayName: string | null
  createdAt: string
  updatedAt: string
  subscription: {
    status: string
    effectiveStatus: string
    expiresAt: string | null
    alipayTradeNo: string | null
  } | null
  balance: number | null
  reserved: number | null
  /** 语音独立额度池（与翻译余额互不相通） */
  voiceBalance: number | null
  voiceReserved: number | null
  rechargeCount: number
  rechargeTokens: number
  lastRechargeAt: string | null
  voiceRechargeCount: number
  voiceRechargeTokens: number
  lastVoiceRechargeAt: string | null
  consumeCount: number
  consumeTokens: number
  lastConsumeAt: string | null
  voiceConsumeCount: number
  voiceConsumeTokens: number
  lastVoiceConsumeAt: string | null
  syncConfigVersion: number | null
  syncConfigUpdatedAt: string | null
  frequencyEntries: number
  dictFiles: number
}

export function fetchSuyanUsers(page = 1, limit = 20, search = ''): Promise<{ users: SuyanUser[]; total: number; page: number; limit: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('search', search)
  return suyanRequest('GET', `/api/admin/suyan/users?${params}`)
}

export interface SuyanUserDetail {
  user: {
    id: string
    provider: string
    providerUid: string
    displayName: string | null
    createdAt: string
    updatedAt: string
  }
  subscription: {
    status: string
    effectiveStatus: string
    expiresAt: string | null
    alipayTradeNo: string | null
    orderTime: string | null
    updatedAt: string
  } | null
  balance: {
    balance: number
    reserved: number
    /** 语音独立额度池（与翻译余额互不相通） */
    voiceBalance: number
    voiceReserved: number
    updatedAt: string
  } | null
  ledgerSummary: {
    rechargeCount: number
    rechargeTokens: number
    rechargeYuan: number
    lastRechargeAt: string | null
    consumeCount: number
    consumeTokens: number
    lastConsumeAt: string | null
    voiceRechargeCount: number
    voiceRechargeTokens: number
    voiceRechargeYuan: number
    lastVoiceRechargeAt: string | null
    voiceConsumeCount: number
    voiceConsumeTokens: number
    lastVoiceConsumeAt: string | null
  }
  sync: {
    configVersion: number | null
    configUpdatedAt: string | null
    frequencyEntries: number
    dictFiles: { fileName: string; contentHash: string; version: number; updatedAt: string }[]
  }
}

export function fetchSuyanUserDetail(id: string): Promise<SuyanUserDetail> {
  return suyanRequest('GET', `/api/admin/suyan/users/${id}`)
}

// ─── Recharges (加油包购买记录) ──────────────────────────────────────────────

export interface SuyanRecharge {
  id: string
  userId: string
  entryType: string
  packType: 'translate' | 'voice'
  tokens: number
  yuan: number
  balanceAfter: number
  currentBalance: number | null
  consumeTokens: number
  consumeCount: number
  refId: string | null
  orderTime: string | null
  createdAt: string
  user: { displayName: string; provider: string } | null
}

export function fetchSuyanRecharges(page = 1, limit = 20, search = '', packType = ''): Promise<{ recharges: SuyanRecharge[]; total: number; page: number; limit: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('search', search)
  if (packType) params.set('packType', packType)
  return suyanRequest('GET', `/api/admin/suyan/recharges?${params}`)
}

// ─── Subscriptions (云同步订阅) ──────────────────────────────────────────────

export interface SuyanSubscription {
  id: string
  userId: string
  plan: string
  status: string
  effectiveStatus: string
  expiresAt: string | null
  alipayTradeNo: string | null
  orderTime: string | null
  updatedAt: string
  yuan: number
  user: { displayName: string; provider: string; createdAt: string } | null
}

export function fetchSuyanSubscriptions(page = 1, limit = 20, status?: string): Promise<{ subscriptions: SuyanSubscription[]; total: number; page: number; limit: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status) params.set('status', status)
  return suyanRequest('GET', `/api/admin/suyan/subscriptions?${params}`)
}

// ─── Subscription Orders (订阅支付流水：一笔支付一行，含续费历史) ──────────────

export interface SuyanSubscriptionOrder {
  id: string
  userId: string
  packId: string
  yuan: number
  durationDays: number
  outTradeNo: string
  alipayTradeNo: string | null
  paidAt: string
  expiresAtAfter: string | null
  user: { displayName: string; provider: string } | null
  subscription: {
    id: string
    status: string
    effectiveStatus: string
    expiresAt: string | null
  } | null
}

export function fetchSuyanSubscriptionOrders(
  page = 1,
  limit = 20,
  status?: string,
  search?: string,
): Promise<{ orders: SuyanSubscriptionOrder[]; total: number; page: number; limit: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status) params.set('status', status)
  if (search) params.set('search', search)
  return suyanRequest('GET', `/api/admin/suyan/subscription-orders?${params}`)
}

// ─── 删除用户 ─────────────────────────────────────────────────────────────────

export function deleteSuyanUser(id: string): Promise<{ ok: boolean; userId: string; displayName: string | null }> {
  return suyanRequest('DELETE', `/api/admin/suyan/users/${id}`)
}

// ─── 撤销充值（收回测试加油包 token）──────────────────────────────────────────

export interface RevokeResult {
  results: { id: string; userId: string; tokens: number; revoked: number; skipped: string }[]
  total: number
  revokedCount: number
}

export function revokeSuyanRecharges(rechargeIds: string[]): Promise<RevokeResult> {
  return suyanRequest('POST', '/api/admin/suyan/recharges/revoke', { rechargeIds })
}

// ─── 收回云同步订阅权限 ──────────────────────────────────────────────────────

export interface SubRevokeResult {
  results: { id: string; userId: string; displayName: string | null; before: string; after: string }[]
  total: number
  revokedCount: number
}

export function revokeSuyanSubscriptions(subscriptionIds: string[]): Promise<SubRevokeResult> {
  return suyanRequest('POST', '/api/admin/suyan/subscriptions/revoke', { subscriptionIds })
}
// ─── 社区皮肤审核 ─────────────────────────────────────────────────────────────

export type CommunitySkinStatus = 'pending' | 'approved' | 'rejected' | 'delisted'

export interface CommunitySkin {
  id: string
  shareCode: string
  skinName: string
  authorName: string
  layout: string
  status: string
  rejectReason: string
  hasBackgroundImage: boolean
  createdAt: number
  publishedAt: number | null
}

export function fetchCommunitySkins(page = 1, limit = 50, status?: string): Promise<{ skins: CommunitySkin[]; total: number; page: number; limit: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status) params.set('status', status)
  return suyanRequest('GET', `/api/admin/suyan/community/skins?${params}`)
}

export function approveCommunitySkin(id: string): Promise<{ ok: boolean }> {
  return suyanRequest('POST', `/api/admin/suyan/community/skins/${id}/approve`)
}

export function rejectCommunitySkin(id: string, reason: string): Promise<{ ok: boolean }> {
  return suyanRequest('POST', `/api/admin/suyan/community/skins/${id}/reject`, { reason })
}

export function delistCommunitySkin(id: string): Promise<{ ok: boolean }> {
  return suyanRequest('POST', `/api/admin/suyan/community/skins/${id}/delist`)
}

/**
 * 预览图单独走 fetch —— suyanRequest 只处理 JSON 响应。
 * 令牌只放请求头：index.ts 的请求日志中间件会记录 req.query。
 */
export async function fetchCommunitySkinPreviewBlob(id: string): Promise<Blob> {
  const token = getAdminToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}/api/admin/suyan/community/skins/${id}/preview.png`, { headers })

  if (res.status === 401) {
    dispatchAdminUnauthorized()
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`)
  }
  return res.blob()
}
