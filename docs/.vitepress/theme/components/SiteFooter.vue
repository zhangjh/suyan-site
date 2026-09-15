<template>
  <footer class="sy-footer" data-component="Site Footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/" aria-label="素言 SuYan 首页">
            <span class="brand-mark" aria-hidden="true">
              <img src="/logo.png" alt="" />
            </span>
            素言<small>SuYan</small>
          </a>
          <p>「素」代表干净、纯粹，「言」代表表达、交流。</p>
          <p>摒弃繁杂，回归输入的本质。</p>
        </div>
        <nav class="footer-col" aria-label="产品">
          <h4>Product</h4>
          <ul>
            <li><a href="/download">下载素言</a></li>
            <li><a href="/community">皮肤社区</a></li>
            <li><a href="/#enterprise">企业定制</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="指南">
          <h4>Guide</h4>
          <ul>
            <li><a href="/guide/install">安装指南</a></li>
            <li><a href="/guide/faq">常见问题</a></li>
            <li><a href="/guide/dictionary">词库管理</a></li>
            <li><a href="/guide/special-modes">特殊输入模式</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="社区">
          <h4>Community</h4>
          <ul>
            <li><a href="https://github.com/zhangjh/suyan-site/issues" target="_blank" rel="noreferrer">GitHub Issues</a></li>
            <li><a href="https://rime.im/" target="_blank" rel="noreferrer">RIME 中州韵</a></li>
            <li><a href="https://github.com/iDvel/rime-ice" target="_blank" rel="noreferrer">雾凇拼音</a></li>
            <li><a href="https://zhangjh.cn" target="_blank" rel="noreferrer">更多作品 · 个人主页</a></li>
          </ul>
        </nav>
      </div>
      <div class="footer-bottom">
        <span>© 2026 素言 SuYan · 简而不凡</span>
        <span>素言基于 RIME 开源引擎构建，永久免费 · 无广告 · 无捆绑</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.sy-footer {
  font-family: var(--sy-font-sans);
  border-top: 1px solid var(--border-strong);
  padding: 56px 0 44px;
  background: color-mix(in srgb, var(--seed-fg) 8%, var(--seed-surface));
  margin-top: clamp(56px, 8vw, 104px);
}
.footer-inner { max-width: var(--container); margin: 0 auto; padding: 0 24px; }
.footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 36px; }

.brand { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 17px; letter-spacing: 0.01em; color: var(--fg); text-decoration: none; }
.brand-mark { width: 30px; height: 30px; border-radius: 8px; flex: none; display: grid; place-items: center; overflow: hidden; background: var(--surface); }
.brand-mark img { width: 100%; height: 100%; object-fit: cover; display: block; }
.brand small { font-weight: 450; color: var(--faint); font-size: 13px; margin-left: 2px; }

.footer-brand p { margin-top: 14px; font-size: 13.5px; color: var(--muted); max-width: 300px; line-height: 1.7; }
.footer-col h4 { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--faint); font-family: var(--sy-font-mono); margin-bottom: 16px; }
.footer-col ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.footer-col a { font-size: 14px; color: var(--muted); text-decoration: none; transition: color 0.18s ease; }
.footer-col a:hover { color: var(--fg); }

.footer-bottom {
  margin-top: 48px;
  padding-top: 22px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: var(--faint);
}

/* 指南等带侧边栏的文档页：侧边栏是 fixed(white) 且到底部(z-index 60)，
   这里给 footer 更高层级覆盖侧边栏底部的白色条，内容仍右移到侧边栏之外 */
@media (min-width: 960px) {
  .VPContent.has-sidebar ~ .sy-footer {
    position: relative;
    z-index: 65;
  }
  .VPContent.has-sidebar ~ .sy-footer .footer-inner {
    margin-left: var(--vp-sidebar-width);
  }
}
@media (min-width: 1440px) {
  .VPContent.has-sidebar ~ .sy-footer .footer-inner {
    margin-left: calc((100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width));
  }
}

@media (max-width: 1023px) {
  .footer-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 639px) {
  .footer-grid { grid-template-columns: repeat(2, 1fr); gap: 30px 20px; }
  /* 品牌区通栏，与品牌文案一起占据整行 */
  .footer-grid .footer-brand { grid-column: 1 / -1; }
  .footer-brand p { max-width: 100%; margin-top: 12px; }
  /* 社区列通栏，链接改双列排布，避免单列显得空旷 */
  .footer-grid .footer-col:last-child { grid-column: 1 / -1; }
  .footer-grid .footer-col:last-child ul {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 20px;
  }
  .footer-col ul { gap: 12px; }
  .footer-col h4 { margin-bottom: 12px; }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
  .sy-footer { padding: 40px 0 36px; }
  .footer-inner { padding: 0 20px; }
}
</style>
