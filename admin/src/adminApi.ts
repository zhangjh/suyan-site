/**
 * 素言管理控制台鉴权（迁移文档 §10.4）。
 * token 存独立的 suyan-admin-token，不与旧 verse-admin-token 冲突；
 * 只调用 suyan-server 的 /api/admin/login（可选独立 ADMIN_JWT_SECRET，D4）。
 */
// 本地 dev 走 vite proxy（localhost），生产构建默认指向 api-suyan；
// 均可用 VITE_API_URL 覆盖。避免 CF Pages 漏配环境变量时把 localhost 打进线上产物。
export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://api-suyan.zhangjh.cn')

const ADMIN_TOKEN_KEY = 'suyan-admin-token'

/** 任意 admin API 返回 401 时广播，App.tsx 收到后切回登录页 */
export const ADMIN_UNAUTHORIZED_EVENT = 'suyan-admin-unauthorized'

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

/** 本地读取 JWT 的 exp：过期或损坏的 token 直接视为未登录，避免先闪一下失效数据 */
export function isAdminTokenValid(): boolean {
  const token = getAdminToken()
  if (!token) return false
  try {
    const payload = token.split('.')[1]
    if (!payload) return false
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const base64 = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const decoded = JSON.parse(atob(base64)) as { exp?: number }
    // 无 exp 的 token 交给服务端判定，本地不主动登出
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 > Date.now() : true
  } catch {
    return false
  }
}

/** 统一入口：清掉本地 token 并通知根组件跳转到登录页 */
export function dispatchAdminUnauthorized(): void {
  clearAdminToken()
  window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT))
}

async function adminRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
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

export async function adminLogin(username: string, password: string): Promise<{ token: string }> {
  return adminRequest('POST', '/api/admin/login', { username, password })
}
