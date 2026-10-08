// Cloudflare Pages Function: /api/latest-release
// 服务端代理 GitHub Releases API，token 存于 CF Pages 环境变量 GITHUB_TOKEN
// （Pages 设置 → Settings → Variables and Secrets），不会进入前端构建产物。
//
// 缓存策略：边缘缓存 60 秒（Cache API，只缓存成功的响应）。
// GitHub 认证接口限流 5000 次/小时，60 秒缓存下每小时最多 60 次上游请求——
// 既保证分钟级新鲜度，又不可能触发限流。

const GITHUB_RELEASE_URL = 'https://api.github.com/repos/zhangjh/suyan-site/releases/latest'
const CACHE_TTL_SECONDS = 60

export async function onRequest(context) {
  const { env, request } = context

  const cache = caches.default
  const cacheKey = new Request(new URL(request.url).toString(), { method: 'GET' })
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'suyan-site-pages-function',
  }
  if (env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`
  }

  const upstream = await fetch(GITHUB_RELEASE_URL, { headers })

  const body = await upstream.text()
  const response = new Response(body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // 成功响应允许缓存 60 秒；失败响应不缓存，直接透传
      'Cache-Control': upstream.ok
        ? `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`
        : 'no-store',
    },
  })

  if (upstream.ok) {
    context.waitUntil(cache.put(cacheKey, response.clone()))
  }
  return response
}
