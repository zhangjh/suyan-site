import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// 全部用基于本配置文件的位置推导，不依赖执行时的 cwd（CF Pages 从仓库根跑构建）。
const adminRoot = fileURLToPath(new URL('.', import.meta.url))
const outDir = fileURLToPath(new URL('../docs/.vitepress/dist/admin/', import.meta.url))

export default defineConfig({
  root: adminRoot,
  plugins: [react()],
  // 产物直接落进 VitePress 的输出目录，随 suyan-site 一起被 CF Pages 部署到
  // https://suyan.zhangjh.cn/admin/；/admin/ 前缀与站点子路径对齐。
  base: '/admin/',
  build: {
    outDir,
    // outDir 在 root 之外，必须显式允许清空；只清 admin/ 子目录，不动主站产物。
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    // 本地联调代理到本机 suyan-server；生产构建自动指向 api-suyan（见 API_BASE）。
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: false },
    },
  },
})
