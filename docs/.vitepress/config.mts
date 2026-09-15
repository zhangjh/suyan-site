import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '素言 SuYan',
  description: '拒绝臃肿与监控 · 内置生产力工具 · 越用越懂你的跨平台中英文输入法',
  lang: 'zh-CN',

  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['script', { charset: 'UTF-8', id: 'LA_COLLECT', src: 'https://sdk.51.la/js-sdk-pro.min.js' }],
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

    footer: {
      message: '素言基于 RIME 开源引擎构建，永久免费 · 无广告 · 无捆绑',
      copyright: 'Copyright © 2026-present<br>Built by ZhangJH · <a href="https://zhangjh.cn" target="_blank" rel="noreferrer">访问个人主页 →</a>',
    },
  },
})
