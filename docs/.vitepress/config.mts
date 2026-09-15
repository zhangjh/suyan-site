import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import type { HeadConfig } from 'vitepress'
import { loadCommunityData } from './data/community'
import { loadReleaseNotes } from './data/release'

// 素言官网公开站点地址（SEO 相关绝对 URL 统一使用该域名）
const BASE_URL = 'https://suyan.zhangjh.cn'
const OG_IMAGE_URL = `${BASE_URL}/og-cover.png`
const DOCS_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const [BUILD_COMMUNITY_DATA, BUILD_RELEASE_DATA] = await Promise.all([
  loadCommunityData(),
  loadReleaseNotes(),
])

// 配合 cleanUrls 生成规范链接：无 .html、无尾斜杠（首页除外）
function canonicalOf(page: string): string {
  const path = page.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  return `${BASE_URL}/${path}`
}

function sourceFileOf(url: string): string {
  const pathname = new URL(url, BASE_URL).pathname.replace(/\/$/, '') || '/'
  if (pathname === '/') return 'index.md'
  if (/^\/community\/page\/\d+$/.test(pathname)) return 'community/page/[page].md'
  if (/^\/community\/skins\/[A-Z0-9]+$/.test(pathname)) return 'community/skins/[code].md'
  return `${pathname.slice(1)}.md`
}

function lastModifiedOf(url: string): string | undefined {
  const pathname = new URL(url, BASE_URL).pathname.replace(/\/$/, '') || '/'
  if (pathname === '/community' || /^\/community\/page\/\d+$/.test(pathname)) {
    return BUILD_COMMUNITY_DATA.generatedAt
  }
  if (pathname === '/download') return BUILD_RELEASE_DATA.publishedAt || undefined
  const skinCode = pathname.match(/^\/community\/skins\/([A-Z0-9]{8})$/)?.[1]
  if (skinCode) {
    const skin = BUILD_COMMUNITY_DATA.historicalSkins.find((item) => item.shareCode === skinCode)
    return skin ? new Date(skin.createdAt).toISOString() : undefined
  }

  const sourceFile = sourceFileOf(url)
  try {
    const committedAt = execFileSync('git', ['log', '-1', '--format=%cI', '--', `docs/${sourceFile}`], {
      cwd: resolve(DOCS_ROOT, '..'),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    if (committedAt) return new Date(committedAt).toISOString()
  } catch {
    // 部署环境可能不含 Git 历史，回退到文件时间。
  }

  try {
    return statSync(resolve(DOCS_ROOT, sourceFile)).mtime.toISOString()
  } catch {
    return undefined
  }
}

function breadcrumbSchema(page: string, title: string) {
  const path = page.replace(/\.md$/, '')
  const items = [{ name: '首页', url: `${BASE_URL}/` }]

  if (path.startsWith('guide/') && path !== 'guide/install') {
    items.push({ name: '指南', url: `${BASE_URL}/guide/install` })
  } else if (path.startsWith('community/') && path !== 'community') {
    items.push({ name: '皮肤社区', url: `${BASE_URL}/community` })
  }
  items.push({ name: title, url: canonicalOf(page) })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export default defineConfig({
  title: '素言 SuYan',
  description: '拒绝臃肿与监控 · 内置生产力工具 · 越用越懂你的跨平台中英文输入法',
  lang: 'zh-CN',

  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['meta', { property: 'og:site_name', content: '素言 SuYan' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: OG_IMAGE_URL }],
    ['meta', { property: 'og:image:secure_url', content: OG_IMAGE_URL }],
    ['meta', { property: 'og:image:type', content: 'image/png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: '素言 SuYan — 回归输入的本质' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE_URL }],
    ['meta', { name: 'twitter:image:alt', content: '素言 SuYan — 回归输入的本质' }],
    // 51.la 统计脚本异步加载，消除渲染阻塞（下方轮询式 init 保证加载完成后初始化）
    ['script', { charset: 'UTF-8', id: 'LA_COLLECT', src: 'https://sdk.51.la/js-sdk-pro.min.js', async: true }],
    ['script', {}, `
      (function() {
        var checkLA = setInterval(function() {
          if (window.LA) {
            LA.init({id:"L65dxF4BaxJ5ImOA",ck:"L65dxF4BaxJ5ImOA",hashMode:true,autoTrack:true});
            clearInterval(checkLA);
          }
        }, 100);
      })();
    `],
  ],

  cleanUrls: true,

  // 由 VitePress 原生 sitemap 配置生成 sitemap.xml，并使用内容的真实更新时间。
  sitemap: {
    hostname: BASE_URL,
    transformItems(items) {
      const activeSkinCodes = new Set(BUILD_COMMUNITY_DATA.skins.map((skin) => skin.shareCode))
      return items
        .filter((item) => {
          const code = new URL(item.url, BASE_URL).pathname.match(/^\/community\/skins\/([A-Z0-9]{8})$/)?.[1]
          return !code || activeSkinCodes.has(code)
        })
        .map((item) => {
          const lastmod = lastModifiedOf(item.url)
          return lastmod ? { ...item, lastmod } : item
        })
    },
  },

  transformPageData(pageData) {
    const params = pageData.params
    if (!params) return

    if (typeof params.shareCode === 'string') {
      const archived = params.archived === true
      const skinTitle = `${params.skinName} · 素言皮肤`
      pageData.title = skinTitle
      pageData.description = archived
        ? `${params.skinName}：由 ${params.authorName} 分享的素言输入法皮肤历史页面；该作品已从社区列表下架。`
        : `${params.skinName}：由 ${params.authorName} 分享的素言输入法${params.layout === 'vertical' ? '竖排' : '横排'}候选框皮肤，查看预览并复制分享码 ${params.shareCode}。`
      pageData.frontmatter.layout = 'page'
      const skinHead: HeadConfig[] = [
        [
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: skinTitle,
            creator: { '@type': 'Person', name: params.authorName },
            image: params.previewUrl,
            url: `${BASE_URL}/community/skins/${params.shareCode}`,
            isPartOf: { '@id': `${BASE_URL}/community` },
            dateCreated: new Date(params.createdAt).toISOString(),
            inLanguage: 'zh-CN',
          }),
        ],
      ]
      if (archived) skinHead.push(['meta', { name: 'robots', content: 'noindex, follow' }])
      pageData.frontmatter.head = skinHead
      return
    }

    if (typeof params.page === 'string') {
      pageData.title = `皮肤社区第 ${params.page} 页`
      pageData.description = `浏览素言输入法皮肤社区第 ${params.page} 页的候选框皮肤作品，查看预览并复制皮肤分享码。`
      pageData.frontmatter.layout = 'page'
    }
  },

  // 逐页注入 canonical、页面级社交卡片和面包屑结构化数据。
  transformHead({ page, pageData, description }) {
    if (pageData.isNotFound || page === '404.md') {
      return [['meta', { name: 'robots', content: 'noindex, follow' }]]
    }

    const canonical = canonicalOf(page)
    const pageTitle = pageData.title || '素言 SuYan'
    const pageDescription =
      description || '素言输入法：拒绝臃肿与监控 · 内置生产力工具 · 越用越懂你的跨平台中英文输入法'
    const head: HeadConfig[] = [
      ['link', { rel: 'canonical', href: canonical }],
      ['meta', { property: 'og:url', content: canonical }],
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { name: 'twitter:title', content: pageTitle }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
    ]
    if (page !== 'index.md') {
      head.push(['script', { type: 'application/ld+json' }, JSON.stringify(breadcrumbSchema(page, pageTitle))])
    }
    return head
  },

  themeConfig: {
    logo: '/logo.png',
    siteTitle: '素言 SuYan',

    nav: [
      { text: '首页', link: '/' },
      { text: '下载', link: '/download' },
      { text: '皮肤社区', link: '/community' },
      { text: '指南', link: '/guide/install', activeMatch: '/guide/' },
      { text: '企业定制', link: '/#enterprise' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '安装指南', link: '/guide/install' },
            { text: '常见问题', link: '/guide/faq' },
          ],
        },
        {
          text: '进阶',
          items: [
            { text: '词库管理', link: '/guide/dictionary' },
            { text: '特殊输入模式', link: '/guide/special-modes' },
          ],
        },
        {
          text: '关于',
          items: [
            { text: '联系我们', link: '/guide/contact' },
            { text: '开源致谢', link: '/guide/credits' },
          ],
        },
      ],
    },

    outline: {
      level: [2, 3],
      label: '本页目录',
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/zhangjh/suyan-site' },
    ],

    // 页脚由主题 SiteFooter 组件统一渲染（layout-bottom 插槽），不使用默认 footer 配置
  },
})