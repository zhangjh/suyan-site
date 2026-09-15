<template>
  <footer class="sy-footer" data-component="Site Footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/" aria-label="素言 SuYan 首页">
            <span class="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M5 8c0-1.7 1.3-3 3-3h8c1.7 0 3 1.3 3 3s-1.3 3-3 3H8c-1.7 0-3 1.3-3 3s1.3 3 3 3h8c1.7 0 3-1.3 3-3"/></svg>
            </span>
            素言<small>SuYan</small>
          </a>
          <p>「素」代表干净、纯粹，「言」代表表达、交流。摒弃繁杂，回归输入的本质。</p>
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
            <li><a href="https://github.com/zhangjh" target="_blank" rel="noreferrer">GitHub @zhangjh</a></li>
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
  border-top: 1px solid var(--border);
  padding: 56px 0 44px;
  background: var(--surface);
  margin-top: clamp(56px, 8vw, 104px);
}
.footer-inner { max-width: var(--container); margin: 0 auto; padding: 0 24px; }
.footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 36px; }

.brand { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 17px; letter-spacing: 0.01em; color: var(--fg); text-decoration: none; }
.brand-mark { width: 28px; height: 28px; border-radius: 8px; flex: none; display: grid; place-items: center; background: linear-gradient(145deg, color-mix(in srgb, var(--primary) 88%, var(--fg)), color-mix(in srgb, var(--primary) 70%, var(--bg))); color: var(--on-primary); }
.brand-mark svg { width: 16px; height: 16px; }
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

@media (max-width: 1023px) {
  .footer-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 639px) {
  .footer-grid { grid-template-columns: 1fr; gap: 28px; }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
}
</style>
