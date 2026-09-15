// 素言官网自定义主题：扩展 VitePress 默认主题
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import HomePage from './components/HomePage.vue'
import DownloadPage from './components/DownloadPage.vue'
import CommunityPage from './components/CommunityPage.vue'
import SiteFooter from './components/SiteFooter.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // 全站统一页脚（按设计稿四列布局，替代默认 VPFooter）
      'layout-bottom': () => h(SiteFooter),
    })
  },
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('DownloadPage', DownloadPage)
    app.component('CommunityPage', CommunityPage)
  },
} satisfies Theme
