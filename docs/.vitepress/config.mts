import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "素言 SuYan",
  description: "基于 RIME 的跨平台中英文输入法，内置剪贴板与截图工具。",
  lang: 'zh-CN',
  
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }]
  ],

  themeConfig: {
    // 既然要极简，Logo直接用文字或你后续上传图片
    logo: '/logo.png',
    siteTitle: '素言 SuYan',

    nav: [
      { text: '首页', link: '/' },
      { text: '帮助文档', link: '/guide/install' },
      { text: '发布日志', link: 'https://github.com/zhangjh/suyan-site/releases' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '安装指南', link: '/guide/install' },
            { text: '常见问题', link: '/guide/faq' }
          ]
        },
        {
          text: '关于',
          items: [
            { text: '致谢与核心', link: '/guide/credits' },
            { text: '联系与反馈', link: '/guide/contact' }
          ]
        }
      ]
    },

    socialLinks: [
      // 这里依然可以指向你的私有库主页（如果你愿意），或者指向发布页
      // 或者干脆不放，保持高冷
      { icon: 'github', link: 'https://github.com/zhangjh/suyan-site' }
    ],

    footer: {
      message: '极简于形，全能于心。',
      copyright: 'Copyright © 2026-present zhangjh'
    },
    
    // 隐藏编辑链接，因为是私有库
    docFooter: {
      prev: '上一页',
      next: '下一页'
    }
  }
})
