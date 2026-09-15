# 素言官网（suyan-site）

[素言输入法](https://suyan.zhangjh.cn) 的官方文档与产品站点，基于 [VitePress](https://vitepress.dev/) 构建，部署地址 [suyan.zhangjh.cn](https://suyan.zhangjh.cn)。

## 功能板块

- **首页** — 产品介绍、核心特性展示、功能演示视频
- **下载** — Windows / macOS / Ubuntu 多平台安装包下载
- **帮助文档** — 安装指南、常见问题、特殊输入模式、自定义词库、致谢与联系
- **皮肤社区** — 用户共享的自定义候选框皮肤，复制分享码即可导入使用
- **企业定制** — 私有化部署、内网大模型对接、行业专属词库

## 技术栈

- [VitePress](https://vitepress.dev/) — 静态站点生成
- [Vue 3](https://vuejs.org/) — 前端框架
- Node.js 18+

## 本地开发

```bash
npm install
npm run dev
```

浏览器访问 `http://localhost:5173` 预览站点。

## 构建与预览

```bash
npm run build
npm run preview
```

构建产物输出到 `docs/.vitepress/dist`。

## 项目结构

```
suyan-site/
├── docs/
│   ├── .vitepress/
│   │   └── config.mts          # VitePress 站点配置（导航、侧边栏、社交链接）
│   ├── index.md                # 首页（hero + features）
│   ├── download.md             # 下载页（多平台安装包 + 网盘 + 赞助）
│   ├── community.md            # 皮肤社区（动态渲染分享皮肤列表）
│   ├── community.data.mts      # 皮肤数据脚本（从后端 API 获取社区皮肤）
│   ├── guide/
│   │   ├── install.md          # 安装指南
│   │   ├── faq.md              # 常见问题
│   │   ├── special-modes.md    # 特殊输入模式
│   │   ├── dictionary.md       # 自定义词库
│   │   ├── credits.md          # 致谢与核心
│   │   └── contact.md          # 联系与反馈
│   └── public/                 # 静态资源（Logo、截图、二维码等）
├── package.json
└── README.md
```

## 相关链接

- [素言官网](https://suyan.zhangjh.cn)
- [RIME 中州韵引擎](https://rime.im/)
- [雾凇拼音词库](https://github.com/iDvel/rime-ice)
