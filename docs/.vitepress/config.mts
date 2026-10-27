import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import type { HeadConfig } from 'vitepress'
import { COMMUNITY_PAGE_SIZE, loadCommunityData } from './data/community'
import { loadReleaseNotes } from './data/release'

// 素言官网公开站点地址（SEO 相关绝对 URL 统一使用该域名）
const BASE_URL = 'https://suyan.zhangjh.cn'
const SITE_NAME = '素言 SuYan'
const SITE_ENTITY = '素言输入法'
// 标题后缀统一由 titleTemplate 追加，页面自身标题不再重复品牌词，
// 避免出现「下载素言 SuYan | 素言 SuYan」这类冗余，并保证标题长度足以被 Bing 判为「有描述性」
const TITLE_TEMPLATE = ':title | 素言输入法'
const DEFAULT_DESCRIPTION =
  '素言（SuYan）：免费、无广告的跨平台中文输入法，支持 Windows、macOS 与 Ubuntu。基于 RIME 引擎，输入核心完全离线，内置截图、剪贴板、AI 划词翻译等办公生产力工具，支持传统文本输入和在线、离线语音输入，支持自定义词库与候选框皮肤社区。'
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

interface SchemaNode {
  '@type': string
  [key: string]: unknown
}

// 站点级节点：每页都自带一份，便于 AI 爬虫在只抓单页时也能解析出实体归属
function websiteNode(): SchemaNode {
  return {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: `${BASE_URL}/`,
    name: SITE_NAME,
    alternateName: SITE_ENTITY,
    inLanguage: 'zh-CN',
  }
}

function webPageNode(url: string, title: string, description: string): SchemaNode {
  const node: SchemaNode = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'zh-CN',
    isPartOf: { '@id': `${BASE_URL}/#website` },
  }
  const lastmod = lastModifiedOf(url)
  if (lastmod) node.dateModified = lastmod
  return node
}

function breadcrumbNode(page: string, items: { name: string; url: string }[]): SchemaNode {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalOf(page)}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

function breadcrumbItems(page: string, label: string) {
  const path = page.replace(/\.md$/, '')
  const items = [{ name: '首页', url: `${BASE_URL}/` }]

  if (path.startsWith('guide/') && path !== 'guide/install') {
    items.push({ name: '使用指南', url: `${BASE_URL}/guide/install` })
  } else if (path.startsWith('community/') && path !== 'community') {
    items.push({ name: '皮肤社区', url: `${BASE_URL}/community` })
  }
  items.push({ name: label, url: canonicalOf(page) })
  return items
}

// 面包屑展示名取标题中破折号之前的部分，避免把整句长标题塞进面包屑
function breadcrumbLabelOf(pageData: { title?: string; params?: Record<string, unknown> }, page: string): string {
  const skinName = pageData.params?.skinName
  if (typeof skinName === 'string' && skinName) return skinName
  const title = (pageData.title || '').split(/\s+—\s+/)[0].trim()
  return title || SITE_NAME
}

interface ListableSkin {
  shareCode: string
  skinName: string
}

// 皮肤列表页的作品集合：让搜索引擎与 AI 摘要能识别「一组作品」而非零散链接
function collectionNode(url: string, title: string, skins: ListableSkin[]): SchemaNode {
  return {
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    url,
    name: title,
    inLanguage: 'zh-CN',
    isPartOf: { '@id': `${BASE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: skins.length,
      itemListElement: skins.map((skin, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: skin.skinName,
        url: `${BASE_URL}/community/skins/${skin.shareCode}`,
      })),
    },
  }
}

function jsonLdScript(nodes: SchemaNode[]): HeadConfig {
  const payload = { '@context': 'https://schema.org', '@graph': nodes }
  return [
    'script',
    { type: 'application/ld+json' },
    JSON.stringify(payload).replace(/</g, '\\u003c'),
  ]
}

export default defineConfig({
  title: SITE_NAME,
  titleTemplate: TITLE_TEMPLATE,
  description: DEFAULT_DESCRIPTION,
  lang: 'zh-CN',
  // 关闭 VitePress 路由级链接预取，避免与 Cloudflare Speed Brain 的
  // Speculation Rules 预取冲突，导致静态资源 net::ERR_ABORTED 503
  router: {
    prefetchLinks: false,
  },

  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo.png' }],
    // 百度站长平台 HTML 标签验证（站长为 suyan.zhangjh.cn）
    ['meta', { name: 'baidu-site-verification', content: 'codeva-FUmMC9FhKu' }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
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
      const skinTitle = `${params.skinName} · ${SITE_ENTITY}皮肤 — 预览与分享码`
      pageData.title = skinTitle
      // 标题已含品牌实体，关闭全局后缀，避免「素言输入法皮肤 | 素言输入法」重复
      pageData.titleTemplate = ':title'
      pageData.description = archived
        ? `${params.skinName}：由 ${params.authorName} 分享的素言输入法皮肤历史页面；该作品已从社区列表下架。`
        : `${params.skinName}：由 ${params.authorName} 分享的素言输入法${params.layout === 'vertical' ? '竖排' : '横排'}候选框皮肤，可查看预览图并复制分享码 ${params.shareCode} 一键换装。`
      pageData.frontmatter.layout = 'page'
      const skinHead: HeadConfig[] = [
        [
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            '@id': `${BASE_URL}/community/skins/${params.shareCode}#creativework`,
            name: skinTitle,
            description: pageData.description,
            creator: { '@type': 'Person', name: params.authorName },
            image: params.previewUrl,
            thumbnailUrl: params.previewUrl,
            url: `${BASE_URL}/community/skins/${params.shareCode}`,
            keywords: ['素言输入法', '输入法皮肤', '候选框皮肤', params.layout === 'vertical' ? '竖排皮肤' : '横排皮肤'],
            isPartOf: { '@id': `${BASE_URL}/community#collection` },
            dateCreated: new Date(params.createdAt).toISOString(),
            dateModified: new Date(params.createdAt).toISOString(),
            inLanguage: 'zh-CN',
          }).replace(/</g, '\\u003c'),
        ],
      ]
      if (archived) skinHead.push(['meta', { name: 'robots', content: 'noindex, follow' }])
      pageData.frontmatter.head = skinHead
      return
    }

    if (typeof params.page === 'string') {
      pageData.title = `皮肤社区第 ${params.page} 页 — 候选框皮肤作品列表`
      pageData.description = `浏览素言输入法皮肤社区第 ${params.page} 页的候选框皮肤作品（共 ${params.total} 款 / ${params.pageCount} 页），查看横排与竖排皮肤预览并复制皮肤分享码。`
      pageData.frontmatter.layout = 'page'
    }
  },

  // 逐页注入 canonical、页面级社交卡片、WebPage 与面包屑结构化数据。
  transformHead({ page, pageData, description }) {
    if (pageData.isNotFound || page === '404.md') {
      return [['meta', { name: 'robots', content: 'noindex, follow' }]]
    }

    const canonical = canonicalOf(page)
    const pageTitle = pageData.title || SITE_NAME
    const pageDescription = description || DEFAULT_DESCRIPTION
    const head: HeadConfig[] = [
      ['link', { rel: 'canonical', href: canonical }],
      ['meta', { property: 'og:url', content: canonical }],
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { name: 'twitter:title', content: pageTitle }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
    ]

    // 首页的 WebSite / WebPage / Organization / SoftwareApplication / FAQPage 实体图
    // 由 index.md 的 frontmatter 直接维护，此处不再重复生成，避免 @id 冲突
    const nodes: SchemaNode[] = []
    if (page !== 'index.md') {
      nodes.push(websiteNode(), webPageNode(canonical, pageTitle, pageDescription))
      nodes.push(breadcrumbNode(page, breadcrumbItems(page, breadcrumbLabelOf(pageData, page))))
    }

    // 社区列表页与分页页补充 CollectionPage + ItemList
    const listedSkins = page === 'community.md'
      ? BUILD_COMMUNITY_DATA.skins.slice(0, COMMUNITY_PAGE_SIZE)
      : Array.isArray(pageData.params?.skins)
        ? (pageData.params.skins as ListableSkin[])
        : null
    if (listedSkins && listedSkins.length) {
      nodes.push(collectionNode(canonical, pageTitle, listedSkins))
    }

    if (nodes.length) head.push(jsonLdScript(nodes))
    return head
  },

  themeConfig: {
    logo: '/logo.png',
    siteTitle: SITE_NAME,

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
            { text: '自定义输入方案', link: '/guide/custom-schemes' },
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
