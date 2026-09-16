// Cloudflare Pages Function: /api/latest-release
// 服务端代理 GitHub Releases API，token 存于 CF Pages 环境变量 GITHUB_TOKEN
// （Pages 设置 → Settings → Variables and Secrets），不会进入前端构建产物。
// 按需求不做缓存：每次请求实时透传 GitHub 响应。

const GITHUB_RELEASE_URL = 'https://api.github.com/repos/zhangjh/suyan-site/releases/latest'

export async function onRequest(context) {
  const { env } = context

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
  return new Response(body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // 明确禁止浏览器与 Cloudflare 边缘缓存，保证每次实时获取
      'Cache-Control': 'no-store',
    },
  })
}
