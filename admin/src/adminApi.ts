/**
 * 素言管理控制台鉴权（迁移文档 §10.4）。
 * token 存独立的 suyan-admin-token，不与旧 verse-admin-token 冲突；
 * 只调用 suyan-server 的 /api/admin/login（可选独立 ADMIN_JWT_SECRET，D4）。
 */
// 本地 dev 走 vite proxy（localhost），生产构建默认指向 api-suyan；
// 均可用 VITE_API_URL 覆盖。避免 CF Pages 漏配环境变量时把 localhost 打进线上产物。
export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://api-suyan.zhangjh.cn')

const ADMIN_TOKEN_KEY = 'suyan-admin-token'

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
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
    clearAdminToken()
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
