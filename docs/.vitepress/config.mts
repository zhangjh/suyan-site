import { defineConfig } from 'vitepress'
import type { HeadConfig } from 'vitepress'

// 素言官网公开站点地址（SEO 相关绝对 URL 统一使用该域名）
const BASE_URL = 'https://suyan.zhangjh.cn'

// 配合 cleanUrls 生成规范链接：无 .html、无尾斜杠（首页除外）
function canonicalOf(page: string): string {
  const path = page.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  return `${BASE_URL}/${path}`
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
    ['meta', { property: 'og:image', content: `${BASE_URL}/og-cover.png` }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: '素言 SuYan — 回归输入的本质' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `${BASE_URL}/og-cover.png` }],
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

  // 由 VitePress 原生 sitemap 配置生成 sitemap.xml（含全部页面，URL 无 .html）
  sitemap: {
    hostname: BASE_URL,
  },

  // 逐页注入 canonical 与页面级 OG/Twitter 卡片
  transformHead({ page, pageData, description }) {
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