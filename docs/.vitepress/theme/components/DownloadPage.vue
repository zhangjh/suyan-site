<script setup>
import MarkdownIt from 'markdown-it'
import { onMounted, ref } from 'vue'

const markdown = new MarkdownIt({ html: false, linkify: true })
const latestVersion = ref('获取中...')
const releaseTitle = ref('')
const releaseNotesHtml = ref('')

function extractUpdateNotes(body) {
  const lines = body.split(/\r?\n/)
  const startIndex = lines.findIndex((line) => /^#{1,6}\s+更新内容\s*$/.test(line))
  if (startIndex === -1) return ''

  const headingLevel = lines[startIndex].match(/^#+/)[0].length
  const endIndex = lines.findIndex((line, index) => {
    if (index <= startIndex) return false
    const heading = line.match(/^(#{1,6})\s+/)
    return heading && heading[1].length <= headingLevel
  })

  const sectionLines = lines.slice(startIndex + 1, endIndex === -1 ? undefined : endIndex)
  while (sectionLines.length) {
    const lastLine = sectionLines[sectionLines.length - 1].trim()
    if (lastLine && !/^(?:-{3,}|\*{3,}|_{3,})$/.test(lastLine)) break
    sectionLines.pop()
  }

  return sectionLines.join('\n').trim()
}

onMounted(() => {
  fetch('https://api.github.com/repos/zhangjh/suyan-site/releases/latest')
    .then((res) => res.json())
    .then((data) => {
      if (data.tag_name) latestVersion.value = data.tag_name
      if (data.body) {
        const updateNotes = extractUpdateNotes(data.body)
        if (updateNotes) {
          releaseTitle.value = data.name || data.tag_name
          releaseNotesHtml.value = markdown.render(updateNotes)
        }
      }
    })
    .catch((err) => console.error('Failed to fetch latest release:', err))
})
</script>

<template>
  <div class="sy-download">
    <!-- ============ 页头 ============ -->
    <section class="page-head container">
      <h1>下载素言</h1>
      <p class="sub">
        支持 <strong>Windows、macOS（Intel &amp; ARM）、Ubuntu</strong> 三大平台，完全免费开放，无广告、无捆绑。
      </p>
      <div class="version-row">
        <span class="version-badge"><span class="dot"></span>最新版本 {{ latestVersion }}</span>
      </div>
    </section>

    <!-- ============ 网盘下载 ============ -->
    <section class="section container" id="download" data-component="Download Links">
      <div class="section-head reveal">
        <p class="eyebrow">Download · 网盘下载</p>
        <h2 class="section-title">选择你的下载渠道</h2>
        <p class="section-desc">进入网盘后选择最新版本目录，按系统架构保存下载。</p>
      </div>
      <div class="dl-grid">
        <article class="dl-card reveal" data-component="Download Card">
          <div class="dl-brand">
            <span class="dl-logo baidu" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v10m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg></span>
            <div>
              <h3>百度网盘</h3>
              <p>pan.baidu.com</p>
            </div>
          </div>
          <p class="dl-desc">进入后选择最新版本目录，包含 Windows / macOS（Intel &amp; ARM）/ Ubuntu 全平台安装包。</p>
          <a
            class="btn btn-primary btn-lg"
            href="https://pan.baidu.com/s/17edkwWljHl0OEbwT-sI7vA?pwd=7jw9"
            target="_blank"
            rel="noreferrer"
            onclick="if(window.LA) LA.track('download_baidu')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
            百度网盘下载
          </a>
          <div class="dl-meta"><span>提取码 7jw9</span><span>· 全平台安装包</span></div>
        </article>
        <article class="dl-card reveal" data-component="Download Card">
          <div class="dl-brand">
            <span class="dl-logo quark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z"/></svg></span>
            <div>
              <h3>夸克网盘</h3>
              <p>pan.quark.cn</p>
            </div>
          </div>
          <p class="dl-desc">不限速下载渠道，保存到自己的网盘后随时获取最新版本。</p>
          <a
            class="btn btn-primary btn-lg"
            href="https://pan.quark.cn/s/e3396f6a7ac7"
            target="_blank"
            rel="noreferrer"
            onclick="if(window.LA) LA.track('download_quark')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
            夸克网盘下载
          </a>
          <div class="dl-meta"><span>无需提取码</span><span>· 全平台安装包</span></div>
        </article>
      </div>
    </section>

    <!-- ============ 平台安装指引 ============ -->
    <section class="section container" data-component="Install Guide">
      <div class="section-head reveal">
        <p class="eyebrow">Install · 安装指引</p>
        <h2 class="section-title">三步完成安装</h2>
        <p class="section-desc">
          更详细的说明与故障排查请参阅 <a class="inline-link" href="/guide/install">安装指南</a>。
        </p>
      </div>
      <div class="platform-grid">
        <article class="os-card reveal" data-component="OS Install Card">
          <div class="os-head">
            <span class="os-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 5.6 10.2 4.6v6.8H3V5.6ZM3 18.4l7.2 1v-6.7H3v5.7Zm8.3 1.2L21 21V12h-9.7v7.6ZM11.3 3 21 1.7V11h-9.7V3Z"/></svg>
            </span>
            <div>
              <h3>Windows</h3>
              <small>.exe 安装包</small>
            </div>
          </div>
          <ol class="os-steps">
            <li>下载 <code>SuYan-x.x.x-windows.exe</code>，双击运行，按提示完成安装</li>
            <li>进入「设置 → 时间和语言 → 语言和区域 → 中文 → 语言选项」</li>
            <li>点击「添加键盘」，选择<strong>素言输入法</strong></li>
          </ol>
          <div class="callout warn" data-component="Warning Callout">
            <span class="co-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4m0 4v.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg></span>
            <p><strong>SmartScreen 拦截提示</strong>：素言未购买 Windows 签名证书，安装时可能弹出拦截，请点击「更多信息 → 仍要运行」。</p>
          </div>
        </article>

        <article class="os-card reveal" data-component="OS Install Card">
          <div class="os-head">
            <span class="os-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.7 12.6a4.3 4.3 0 0 0 2.6-4 4.4 4.4 0 0 0-3.4-3.9 5.2 5.2 0 0 0-9.8 0A4.4 4.4 0 0 0 2.7 8.6a4.3 4.3 0 0 0 2.6 4 3.3 3.3 0 0 0 .5 5.6 4.4 4.4 0 0 0 5.5-1.2h1.4a4.4 4.4 0 0 0 5.5 1.2 3.3 3.3 0 0 0 .5-5.6Z" transform="translate(1.2 2.6) scale(.92)"/></svg>
            </span>
            <div>
              <h3>macOS</h3>
              <small>.pkg · Intel / Apple Silicon</small>
            </div>
          </div>
          <ol class="os-steps">
            <li>根据芯片类型下载对应 <code>.pkg</code>，双击安装</li>
            <li>如提示「来自未被认可的开发者」，到「系统设置 → 隐私与安全性」点击<strong>仍要打开</strong></li>
            <li>在右上角输入法菜单中添加<strong>素言</strong>，注销或重启后生效</li>
          </ol>
          <div class="callout" data-component="Info Callout">
            <span class="co-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 11v5"/></svg></span>
            <p><strong>无法打字？</strong>请确认已在「键盘 → 输入法」中添加素言，并在「隐私与安全性 → 辅助功能」中授予相应权限。</p>
          </div>
        </article>

        <article class="os-card reveal" data-component="OS Install Card">
          <div class="os-head">
            <span class="os-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17m-17 6h17M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18"/></svg>
            </span>
            <div>
              <h3>Ubuntu</h3>
              <small>.deb · 22.04+ · Fcitx5</small>
            </div>
          </div>
          <ol class="os-steps">
            <li>安装 Fcitx5 框架（如已安装可跳过）：<code>sudo apt install fcitx5</code></li>
            <li>下载 <code>.deb</code> 安装包，执行 <code>sudo dpkg -i</code> 完成安装</li>
            <li>在 Fcitx5 配置中启用<strong>素言</strong></li>
          </ol>
          <a class="os-link" href="/guide/install"
            >查看完整安装指南<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a
          >
        </article>
      </div>
    </section>

    <!-- ============ 更新内容 ============ -->
    <section class="section container" data-component="Release Notes">
      <div class="section-head reveal">
        <p class="eyebrow">Changelog · 更新内容</p>
        <h2 class="section-title">最新版本带来了什么</h2>
      </div>
      <div v-if="releaseNotesHtml" class="release reveal" data-component="Release Card">
        <div class="release-head">
          <h3>更新内容</h3>
          <span class="tag">{{ releaseTitle }}</span>
          <span class="src">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9Zm0 0c2.5 2.4 4 5.7 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.7-4-9s1.5-6.6 4-9ZM3.5 9h17m-17 6h17"/></svg>
            数据来源 GitHub Releases
          </span>
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="release-body" v-html="releaseNotesHtml"></div>
      </div>
    </section>

    <!-- ============ 随缘赞助 ============ -->
    <section class="section container" data-component="Sponsor">
      <div class="sponsor reveal" data-component="Sponsor Card">
        <div>
          <p class="eyebrow">Sponsor · 随缘赞助</p>
          <h3>永久免费，无广告，纯本地运行</h3>
          <p>
            素言承诺永久免费、无广告、纯本地运行。如果它为您节省了宝贵的时间，或您认同这种「回归纯粹」的产品理念，欢迎请开发者喝杯咖啡——每一分善意都将用于维系官网服务器与下载带宽的成本。
          </p>
        </div>
        <div class="sponsor-qr">
          <div class="qr-frame"><img src="/sponsor-code.png" alt="微信赞助二维码" width="200" height="200" /></div>
          <small>「 感谢您的支持与信任 」</small>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sy-download {
  font-family: var(--sy-font-sans);
  color: var(--fg);
  padding-top: var(--vp-nav-height);
}
.sy-download :deep(*) { box-sizing: border-box; }
.container { max-width: var(--container); margin: 0 auto; padding: 0 24px; }
.sy-download a { color: inherit; text-decoration: none; }
.sy-download img { max-width: 100%; display: block; }

.reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.5s ease-out, transform 0.5s ease-out; }
.reveal.is-visible { opacity: 1; transform: none; }

.page-head { padding: clamp(52px, 6vw, 84px) 0 0; }
.page-head h1 { font-size: clamp(32px, 4.4vw, 46px); font-weight: 650; line-height: 1.2; letter-spacing: -0.015em; }
.page-head .sub { margin-top: 14px; font-size: 16.5px; color: var(--muted); max-width: 580px; }
.version-row { margin-top: 26px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.version-badge { display: inline-flex; align-items: center; gap: 7px; font-family: var(--sy-font-mono); font-size: 13px; font-weight: 600; color: var(--primary); background: var(--primary-soft); border: 1px solid var(--primary-border); padding: 4px 12px; border-radius: 999px; }
.version-badge .dot { width: 6px; height: 6px; border-radius: 999px; background: var(--primary); }
.version-date { font-size: 13px; color: var(--faint); }

.section { padding: clamp(56px, 7vw, 96px) 0 0; }
.eyebrow { font-family: var(--sy-font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--faint); margin-bottom: 18px; display: flex; align-items: center; gap: 10px; }
.eyebrow::before { content: ''; width: 20px; height: 1px; background: var(--border-strong); }
.section-head { margin-bottom: 44px; }
.section-title { font-size: clamp(24px, 3vw, 32px); font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; }
.section-desc { margin-top: 10px; font-size: 15.5px; color: var(--muted); }
.inline-link { font-weight: 600; border-bottom: 1px solid var(--border-strong); color: var(--fg); }
.inline-link:hover { color: var(--primary); border-color: var(--primary); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 14.5px; font-weight: 600; letter-spacing: 0.02em; padding: 9px 18px; border-radius: var(--radius-sm); border: 1px solid transparent; transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease; white-space: nowrap; }
.btn svg { width: 15px; height: 15px; flex: none; }
.btn:active { transform: translateY(1px); }
.btn-primary { background: var(--primary); color: var(--on-primary); box-shadow: 0 1px 2px color-mix(in srgb, var(--fg) 18%, transparent); }
.btn-primary:hover { background: var(--primary-hover); }
.btn-lg { font-size: 15.5px; padding: 12px 24px; }

.dl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.dl-card { border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); padding: 28px; display: flex; flex-direction: column; transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
.dl-card:hover { transform: translateY(-3px); border-color: var(--border-strong); box-shadow: var(--shadow-md); }
.dl-brand { display: flex; align-items: center; gap: 12px; }
.dl-brand .dl-logo { width: 42px; height: 42px; border-radius: 11px; display: grid; place-items: center; flex: none; }
.dl-logo.baidu { background: color-mix(in srgb, #06a7ff 12%, var(--surface)); color: #0584cc; }
.dl-logo.quark { background: color-mix(in srgb, #5d54e8 12%, var(--surface)); color: #4c43d4; }
.dl-brand .dl-logo svg { width: 22px; height: 22px; }
.dl-brand h3 { font-size: 17px; font-weight: 600; }
.dl-brand p { font-size: 12.5px; color: var(--faint); }
.dl-card .dl-desc { margin-top: 16px; font-size: 13.5px; color: var(--muted); line-height: 1.7; }
.dl-card .btn { margin-top: 22px; width: 100%; }
.dl-meta { margin-top: 14px; display: flex; justify-content: center; gap: 16px; font-size: 12px; color: var(--faint); }

.platform-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.os-card { border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); padding: 26px; display: flex; flex-direction: column; }
.os-head { display: flex; align-items: center; gap: 12px; padding-bottom: 18px; border-bottom: 1px solid var(--border); }
.os-head .os-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--surface-3); border: 1px solid var(--border); display: grid; place-items: center; color: var(--fg); }
.os-head .os-icon svg { width: 18px; height: 18px; }
.os-head h3 { font-size: 16px; font-weight: 600; }
.os-head small { display: block; font-size: 12px; color: var(--faint); font-weight: 450; }
.os-steps { list-style: none; margin-top: 18px; display: grid; gap: 0; counter-reset: step; flex: 1; padding: 0; }
.os-steps li { counter-increment: step; position: relative; padding: 0 0 14px 34px; font-size: 13.5px; color: var(--muted); line-height: 1.65; }
.os-steps li::before { content: counter(step); position: absolute; left: 0; top: 1px; width: 21px; height: 21px; border-radius: 999px; background: var(--surface-3); border: 1px solid var(--border); color: var(--muted); font-size: 11px; font-weight: 600; font-family: var(--sy-font-mono); display: grid; place-items: center; }
.os-steps li:not(:last-child)::after { content: ''; position: absolute; left: 10.5px; top: 24px; bottom: 0; width: 1px; background: var(--border); }
.os-steps li code { font-family: var(--sy-font-mono); font-size: 12px; background: var(--surface-3); border: 1px solid var(--border); border-radius: 5px; padding: 1px 6px; color: var(--fg); }
.os-steps li strong { color: var(--fg); }
.os-card .os-link { margin-top: auto; padding-top: 16px; font-size: 13px; font-weight: 600; color: var(--fg); display: inline-flex; align-items: center; gap: 6px; border-top: 1px solid var(--border); }
.os-card .os-link:hover { color: var(--primary); }
.os-card .os-link svg { width: 13px; height: 13px; }

.callout { display: flex; gap: 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface-2); padding: 14px 18px; margin-top: 18px; }
.callout .co-icon { flex: none; width: 18px; height: 18px; margin-top: 3px; color: var(--muted); }
.callout .co-icon svg { width: 18px; height: 18px; }
.callout p { font-size: 13px; color: var(--muted); line-height: 1.65; }
.callout p strong { color: var(--fg); }
.callout.warn { border-color: color-mix(in srgb, #c98a2a 36%, var(--bg)); background: color-mix(in srgb, #c98a2a 6%, var(--surface)); }
.callout.warn .co-icon { color: #b0761d; }

.release { border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); overflow: hidden; }
.release-head { display: flex; align-items: center; gap: 12px; padding: 20px 26px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.release-head h3 { font-size: 16px; font-weight: 600; }
.release-head .tag { font-family: var(--sy-font-mono); font-size: 12px; color: var(--primary); background: var(--primary-soft); border: 1px solid var(--primary-border); padding: 2px 10px; border-radius: 999px; }
.release-head .src { margin-left: auto; font-size: 12px; color: var(--faint); display: inline-flex; align-items: center; gap: 6px; }
.release-head .src svg { width: 13px; height: 13px; }
.release-body { padding: 22px 26px 26px; font-size: 14.5px; color: var(--muted); line-height: 1.8; }
.release-body :deep(h1), .release-body :deep(h2), .release-body :deep(h3), .release-body :deep(h4) { font-size: 15px; font-weight: 600; color: var(--fg); margin: 18px 0 8px; }
.release-body :deep(ul) { padding-left: 20px; }
.release-body :deep(li) { margin: 4px 0; }
.release-body :deep(a) { color: var(--primary); }

.sponsor { border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); padding: clamp(32px, 5vw, 56px); display: grid; grid-template-columns: 1fr auto; gap: clamp(28px, 4vw, 56px); align-items: center; }
.sponsor h3 { font-size: 21px; font-weight: 600; }
.sponsor > div > p:not(.eyebrow) { margin-top: 12px; font-size: 14.5px; color: var(--muted); line-height: 1.8; max-width: 460px; }
.sponsor-qr { display: grid; place-items: center; gap: 12px; }
.sponsor-qr .qr-frame { background: #fff; padding: 12px; border-radius: 16px; box-shadow: var(--shadow-md); border: 1px solid var(--border); }
.sponsor-qr small { font-size: 12.5px; color: var(--faint); font-style: italic; }

@media (max-width: 1023px) {
  .platform-grid { grid-template-columns: 1fr; }
  .sponsor { grid-template-columns: 1fr; }
  .sponsor-qr { justify-items: start; }
}
@media (max-width: 639px) {
  .dl-grid { grid-template-columns: 1fr; }
  .release-head { padding: 16px 18px; }
  .release-body { padding: 18px; }
  .release-head .src { margin-left: 0; }
}
</style>
