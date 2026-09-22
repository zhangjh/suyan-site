<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/* ---------- 视频点击内嵌播放 ---------- */
const playingVideo = ref(null)
const videos = [
  { bvid: 'BV1zDFozyETF', cover: '/demo-cover.jpg', label: '普通输入模式', desc: '打字、候选、皮肤切换全流程', coverAlt: '普通输入模式演示视频封面', w: 1920, h: 1080 },
  { bvid: 'BV1vBcEzAE8z', cover: '/image-4.png', label: '语音输入模式', desc: '快捷键启动，即说即输', coverAlt: '语音输入模式演示视频封面', w: 534, h: 323 },
]
function playVideo(bvid) {
  playingVideo.value = bvid
}

/* ---------- 图片点击放大灯箱 ---------- */
const lightboxSrc = ref(null)
const lightboxAlt = ref('')
function openLightbox(src, alt) {
  lightboxSrc.value = src
  lightboxAlt.value = alt
}
function closeLightbox() {
  lightboxSrc.value = null
  lightboxAlt.value = ''
}
function handleKeydown(e) {
  if (e.key === 'Escape' && lightboxSrc.value) closeLightbox()
}
onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))

/* ---------- 滚动渐显：默认内容可见，JavaScript 仅增强动画 ---------- */
let io = null
onMounted(() => {
  const els = document.querySelectorAll('.sy-home .reveal')
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('is-reveal-pending')
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach((el) => {
      el.classList.add('is-reveal-pending')
      io.observe(el)
    })
  }
  runTyping()
})
onBeforeUnmount(() => {
  io?.disconnect()
  timers.forEach((timer) => clearTimeout(timer))
  timers = []
})

/* ---------- Hero 候选框打字动效 ---------- */
const steps = [
  { pinyin: 'suyan', word: '素言', cands: ['素言', '溯源', '宿焉', '肃然'] },
  { pinyin: '，', word: '，', cands: [] },
  { pinyin: 'huigui', word: '回归', cands: ['回归', '回购', '回味'] },
  { pinyin: 'shuru', word: '输入', cands: ['输入', '书入', '署儒'] },
  { pinyin: 'de', word: '的', cands: ['的', '得', '地'] },
  { pinyin: 'benzhi', word: '本质', cands: ['本质', '笨滞', '奔止'] },
]
let typedEl, placeholderEl, pinyinEl, candListEl
let timers = []

function later(fn, ms) {
  timers.push(setTimeout(fn, ms))
}

function renderCands(cands) {
  candListEl.innerHTML = ''
  if (!cands.length) return
  cands.slice(0, 4).forEach((c, i) => {
    const span = document.createElement('span')
    span.className = 'cand' + (i === 0 ? ' is-first' : '')
    span.innerHTML = '<span class="num">' + (i + 1) + '</span>' + c
    candListEl.appendChild(span)
  })
}

function runTyping() {
  typedEl = document.getElementById('typedText')
  placeholderEl = document.getElementById('editorPlaceholder')
  pinyinEl = document.getElementById('pinyinText')
  candListEl = document.getElementById('candList')
  if (!typedEl) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typedEl.textContent = '素言，回归输入的本质'
    placeholderEl.style.display = 'none'
    pinyinEl.textContent = 'suyan'
    renderCands(steps[0].cands)
    return
  }

  let stepIdx = 0
  let charIdx = 0
  let committed = ''
  placeholderEl.style.display = 'none'

  function tick() {
    if (stepIdx >= steps.length) {
      later(() => {
        committed = ''
        typedEl.textContent = ''
        stepIdx = 0
        charIdx = 0
        later(tick, 400)
      }, 3600)
      return
    }
    const s = steps[stepIdx]
    const py = s.pinyin
    if (charIdx <= py.length) {
      pinyinEl.textContent = py.slice(0, charIdx) + (s.cands.length ? "'" : '')
      renderCands(charIdx >= py.length ? s.cands : [])
      charIdx++
      later(tick, s.word === '，' ? 160 : 130)
    } else {
      committed += s.word
      typedEl.textContent = committed
      pinyinEl.textContent = ''
      renderCands([])
      stepIdx++
      charIdx = 0
      later(tick, s.word === '，' ? 120 : 260)
    }
  }
  tick()
}
</script>

<template>
  <main class="sy-home">
    <!-- ============ Hero ============ -->
    <section class="hero container">
      <span class="hero-chip reveal"
        ><span class="dot"></span>v5.2.1 · 新增极点五笔输入方案上线</span
      >
      <h1>素言，回归输入的<span class="accent">本质</span></h1>
      <p class="hero-sub reveal">
        拒绝臃肿与监控 · 内置生产力工具 · 越用越懂你的跨平台中英文输入法
      </p>
      <div class="hero-ctas reveal">
        <a class="btn btn-primary btn-lg" href="/download">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
          立即下载
        </a>
        <a class="btn btn-ghost btn-lg" href="/guide/install">查看指南</a>
        <p class="note">Windows · macOS · Ubuntu 三端免费使用</p>
      </div>

      <div class="hero-visual reveal">
        <div class="editor-panel" role="img" aria-label="素言输入法候选框演示">
          <div class="editor-body">
            <p class="editor-text">
              <span id="typedText"></span><span class="editor-placeholder" id="editorPlaceholder">在这里开始输入……</span><span class="caret" aria-hidden="true"></span>
            </p>
          </div>
          <div class="candidate-bar" aria-hidden="true">
            <div class="cand-pinyin"><span class="kbd-mini">中</span><span id="pinyinText"></span></div>
            <div class="cand-list" id="candList"></div>
            <div class="cand-more">↓ 2/5</div>
          </div>
        </div>
        <div class="hero-hint" aria-hidden="true">
          <span><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd> 横竖排切换</span>
          <span><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> 语音输入</span>
          <span>最大候选视野 5 × 9</span>
        </div>
      </div>
    </section>

    <!-- ============ 信任条 ============ -->
    <section class="trust container" data-component="Trust Bar">
      <div class="trust-inner reveal">
        <span class="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M2 20h20"/></svg>
          Windows
        </span>
        <span class="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16.7 12.6a4.3 4.3 0 0 0 2.6-4 4.4 4.4 0 0 0-3.4-3.9 5.2 5.2 0 0 0-9.8 0A4.4 4.4 0 0 0 2.7 8.6a4.3 4.3 0 0 0 2.6 4 3.3 3.3 0 0 0 .5 5.6 4.4 4.4 0 0 0 5.5-1.2h1.4a4.4 4.4 0 0 0 5.5 1.2 3.3 3.3 0 0 0 .5-5.6Z" transform="translate(1.2 2.6) scale(.92)"/></svg>
          macOS
        </span>
        <span class="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17m-17 6h17M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18"/></svg>
          Ubuntu
        </span>
        <span class="trust-sep" aria-hidden="true"></span>
        <span class="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6l7-3Z"/></svg>
          基于 RIME 开源引擎
        </span>
        <span class="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
          输入核心完全离线
        </span>
        <span class="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          永久免费 · 无广告
        </span>
      </div>
    </section>

    <!-- ============ 核心功能矩阵 ============ -->
    <section class="section container" data-component="Feature Grid">
      <div class="section-head reveal">
        <p class="eyebrow">Features · 核心能力</p>
        <h2 class="section-title">一个输入法，装下你的日常输入</h2>
        <p class="section-desc">围绕「不打扰、不越界」设计——先是一个好用的输入法，然后才是更多。</p>
      </div>
      <div class="feature-grid">
        <article class="feature-card reveal" data-component="Feature Card">
          <span class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg></span>
          <h3>纯净隐私</h3>
          <p>输入核心基于 RIME 完全离线运行，按键流不联网。你的每一个字，只属于你。</p>
        </article>
        <article class="feature-card reveal" data-component="Feature Card">
          <span class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-10 4 2 6 4-4 6-10-2h6"/><circle cx="15" cy="15" r="3"/><circle cx="6" cy="6" r="2"/></svg></span>
          <h3>AI 划词翻译</h3>
          <p>内置 LLM 翻译引擎，系统级划词，覆盖所有桌面应用——不止浏览器，比插件更彻底。</p>
        </article>
        <article class="feature-card reveal" data-component="Feature Card">
          <span class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></span>
          <h3>离线语音输入</h3>
          <p>内置本地语音识别引擎，音频绝不上传。按下快捷键即说即输，中文识别流畅自然。</p>
        </article>
        <article class="feature-card reveal" data-component="Feature Card">
          <span class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17 18H7Z"/><path d="M8 21h8"/></svg></span>
          <h3>云同步多端一致</h3>
          <p>配置、词库与输入词频随账号流转，端到端加密，服务器仅作盲盒存储，多端手感始终如一。</p>
        </article>
        <article class="feature-card reveal" data-component="Feature Card">
          <span class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2Z"/><path d="M19 17H6a2 2 0 0 0-2 2m7-12h5m-5 4h5"/></svg></span>
          <h3>词库自由</h3>
          <p>支持导入 Rime 格式的自定义短语与行业词库，配合智能词频记忆，专业术语信手拈来。</p>
        </article>
        <article class="feature-card reveal" data-component="Feature Card">
          <span class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V3"/><path d="M14 21H9m2.5-6v6M9 3h2l1 2 1-2h2"/></svg></span>
          <h3>内置生产力工具</h3>
          <p>截图、剪贴板历史一键调用，无须额外软件依赖，自定义皮肤随心换。高效，不打断工作流。</p>
        </article>
      </div>
    </section>

    <!-- ============ 深度区块：AI 翻译 ============ -->
    <section class="section container" data-component="Deep Dive AI Translate">
      <div class="deep">
        <div class="deep-copy reveal">
          <p class="deep-tag">01 · AI Translate</p>
          <h2>系统级划词翻译，不止浏览器</h2>
          <p class="deep-lead">看英文文档、读外文资料、回复海外同事——选中即译，无需切换第三方软件。</p>
          <ul class="deep-points">
            <li><span class="pt-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span><strong>覆盖所有桌面应用</strong>：基于系统辅助能力（Windows UIA / macOS Accessibility），Word、PDF、IDE、聊天工具全支持</span></li>
            <li><span class="pt-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span><strong>流式响应</strong>：基于 OpenAI 兼容 SSE 接口逐字返回，长文本不卡顿</span></li>
            <li><span class="pt-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span><strong>企业版专属</strong>：可对接私有部署的 Qwen、Llama 等内网模型，数据不出企业边界</span></li>
          </ul>
        </div>
        <div class="deep-visual reveal">
          <div class="mock mock-translate" role="img" aria-label="划词翻译浮窗示意">
            <div class="mock-doc-line w90"></div>
            <div class="mock-doc-line w75"></div>
            <div class="mock-doc-line w82"></div>
            <p style="margin-bottom: 14px"><span class="mock-doc-sel">Privacy is not a feature, it is the foundation.</span></p>
            <div class="mock-doc-line w90" style="margin-top: 12px"></div>
            <div class="mock-doc-line w60"></div>
            <div class="mock-pop">
              <div class="mock-pop-head">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6M4 14l6-10 4 2 6 4-4 6-10-2h6"/></svg>
                AI 翻译 · 系统级划词
                <span class="lang-badge">EN → ZH</span>
              </div>
              <div class="mock-pop-body">
                <p class="from">Privacy is not a feature, it is the foundation.</p>
                <p class="to">隐私不是一个功能，而是根基<span class="streaming"></span></p>
              </div>
            </div>
          </div>
          <p class="mock-caption">任何应用中选中文本，翻译浮窗即刻浮现</p>
        </div>
      </div>
    </section>

    <!-- ============ 深度区块：语音 ============ -->
    <section class="section container" data-component="Deep Dive Voice Input">
      <div class="deep flip">
        <div class="deep-copy reveal">
          <p class="deep-tag">02 · Voice Input</p>
          <h2>语音识别，完全离线</h2>
          <p class="deep-lead">素言是目前极少数支持完全离线语音识别的桌面输入法——从麦克风到文字，全程在本机完成。</p>
          <ul class="deep-points">
            <li><span class="pt-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span><strong>零上传</strong>：音频数据不出本机，从根源杜绝语音隐私泄露</span></li>
            <li><span class="pt-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span><strong>低延迟</strong>：本地推理，说完即出字，无需等待网络响应</span></li>
            <li><span class="pt-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span><strong>无缝切换</strong>：快捷键一键启动，与打字模式自由切换，会议记录、日常对话均可胜任</span></li>
          </ul>
        </div>
        <div class="deep-visual reveal">
          <div class="mock mock-voice" role="img" aria-label="语音输入面板示意">
            <span class="voice-state"><span class="rec-dot"></span>正在聆听</span>
            <div class="wave" aria-hidden="true">
              <i style="animation-delay: 0s"></i><i style="animation-delay: .12s"></i><i style="animation-delay: .24s"></i><i style="animation-delay: .36s"></i><i style="animation-delay: .48s"></i><i style="animation-delay: .6s"></i><i style="animation-delay: .72s"></i><i style="animation-delay: .84s"></i><i style="animation-delay: .96s"></i><i style="animation-delay: 1.08s"></i><i style="animation-delay: .18s"></i><i style="animation-delay: .42s"></i>
            </div>
            <p class="voice-text">会议记录已实时转写完成<span class="tail">_</span></p>
            <p class="voice-kbd"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Y</kbd> 即说即输</p>
          </div>
          <p class="mock-caption">本地推理，说完即出字</p>
        </div>
      </div>
    </section>

    <!-- ============ 深度区块：云同步 ============ -->
    <section class="section container" data-component="Deep Dive Encrypted Sync">
      <div class="deep">
        <div class="deep-copy reveal">
          <p class="deep-tag">03 · Encrypted Sync</p>
          <h2>云同步，但服务器是个盲盒</h2>
          <p class="deep-lead">素言 v5.0 引入端到端加密的云同步：输入习惯随账号流转，而非困在单机。</p>
          <ul class="deep-points">
            <li><span class="pt-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span><strong>配置与偏好</strong>：方案、皮肤、快捷键，新装设备秒级复刻你的环境</span></li>
            <li><span class="pt-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span><strong>词库与词频</strong>：自定义短语一处添加处处可用，高频词排序多端一致</span></li>
            <li><span class="pt-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span><strong>盲盒存储</strong>：服务器仅作黑盒存储渠道，无法解密，也绝不上传按键流</span></li>
          </ul>
        </div>
        <div class="deep-visual reveal">
          <div class="mock mock-sync" role="img" aria-label="端到端加密同步示意">
            <div class="sync-device">
              <p class="dev-name"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M2 20h20"/></svg>公司 · Windows</p>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>方案配置</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>自定义词库</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>输入词频</li>
              </ul>
            </div>
            <div class="sync-mid">
              <span class="sync-lock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span>
            </div>
            <div class="sync-device">
              <p class="dev-name"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M10 18h4"/></svg>家里 · macOS</p>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>皮肤设定</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>行业术语</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>高频词排序</li>
              </ul>
            </div>
          </div>
          <p class="mock-caption">本地加密后上传，服务器仅作盲盒存储</p>
        </div>
      </div>
    </section>

    <!-- ============ 演示 ============ -->
    <section class="section container" data-component="Demo Gallery">
      <div class="section-head reveal">
        <p class="eyebrow">Demo · 眼见为实</p>
        <h2 class="section-title">看它如何工作</h2>
        <p class="section-desc">真实使用场景录制，不过版本有点旧了。</p>
      </div>
      <div class="demo-videos">
        <div class="video-card reveal" v-for="v in videos" :key="v.bvid" @click="playingVideo !== v.bvid && playVideo(v.bvid)">
          <div class="video-thumb">
            <template v-if="playingVideo === v.bvid">
              <iframe
                class="video-iframe"
                :src="'https://player.bilibili.com/player.html?bvid=' + v.bvid + '&page=1&high_quality=1&autoplay=1&as_wide=1'"
                scrolling="no"
                border="0"
                frameborder="no"
                framespacing="0"
                allowfullscreen="true"
                title="视频播放"
              ></iframe>
            </template>
            <template v-else>
              <img :src="v.cover" :alt="v.coverAlt" :width="v.w" :height="v.h" loading="lazy" decoding="async" />
              <span class="video-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg></span>
              <span class="video-label">{{ v.label }}</span>
            </template>
          </div>
          <div class="video-meta">
            <span>{{ v.desc }}</span>
            <span class="ext"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>点击播放</span>
          </div>
        </div>
      </div>
      <div class="shot-grid">
        <figure class="shot-card reveal">
          <figure @click="openLightbox('/image.png', '系统默认皮肤候选词框')" class="shot-img-wrap"><img src="/image.png" alt="系统默认皮肤候选词框" width="820" height="284" loading="lazy" decoding="async" /></figure>
          <figcaption>候选词框 · 默认皮肤 <em>horizontal</em></figcaption>
        </figure>
        <figure class="shot-card reveal">
          <figure @click="openLightbox('/image-1.png', '自定义皮肤候选词框')" class="shot-img-wrap"><img src="/image-1.png" alt="自定义皮肤候选词框" width="873" height="393" loading="lazy" decoding="async" /></figure>
          <figcaption>候选词框 · 自定义皮肤 <em>custom</em></figcaption>
        </figure>
        <figure class="shot-card reveal">
          <figure @click="openLightbox('/ai-translate.webp', 'AI 划词翻译浮窗')" class="shot-img-wrap"><img src="/ai-translate.webp" alt="AI 划词翻译浮窗" width="500" height="535" loading="lazy" decoding="async" /></figure>
          <figcaption>AI 划词翻译浮窗 <em>translate</em></figcaption>
        </figure>
        <figure class="shot-card reveal">
          <figure @click="openLightbox('/image-3.png', '语音识别候选')" class="shot-img-wrap"><img src="/image-3.png" alt="语音识别候选" width="534" height="398" loading="lazy" decoding="async" /></figure>
          <figcaption>语音识别候选 <em>voice</em></figcaption>
        </figure>
        <figure class="shot-card reveal">
          <figure @click="openLightbox('/image-2.png', '剪贴板历史记录')" class="shot-img-wrap"><img src="/image-2.png" alt="剪贴板历史记录" width="500" height="535" loading="lazy" decoding="async" /></figure>
          <figcaption>剪贴板历史记录 <em>clipboard</em></figcaption>
        </figure>
        <figure class="shot-card reveal">
          <figure @click="openLightbox('/image-5.png', '内置截图工具')" class="shot-img-wrap"><img src="/image-5.png" alt="内置截图工具" width="1097" height="675" loading="lazy" decoding="async" /></figure>
          <figcaption>内置截图工具 <em>capture</em></figcaption>
        </figure>
      </div>
    </section>

    <!-- ============ 对比 ============ -->
    <section class="section container" data-component="Comparison Table">
      <div class="section-head reveal">
        <p class="eyebrow">Compare · 拒绝平庸</p>
        <h2 class="section-title">不一样的选择</h2>
        <p class="section-desc">在「臃肿的商业输入法」和「功能单一的系统输入法」之外，还有第三种可能。</p>
      </div>
      <div class="compare-wrap reveal">
        <table class="compare">
          <thead>
            <tr>
              <th></th>
              <th>商业输入法</th>
              <th>系统输入法</th>
              <th class="col-suyan">素言 SuYan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>隐私</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></span>强制联网，上传隐私</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 12h12"/></svg></span>相对安全</td>
              <td class="col-suyan"><span class="mark mark-good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>输入核心离线，按键不联网</td>
            </tr>
            <tr>
              <td>同步</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></span>上传云端，厂商可读</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 12h12"/></svg></span>不支持</td>
              <td class="col-suyan"><span class="mark mark-good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>端到端加密盲盒，服务器无法解密</td>
            </tr>
            <tr>
              <td>翻译</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></span>不支持</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 12h12"/></svg></span>不支持</td>
              <td class="col-suyan"><span class="mark mark-good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>系统级划词，覆盖所有桌面应用</td>
            </tr>
            <tr>
              <td>语音</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></span>音频上传云端识别</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 12h12"/></svg></span>不支持</td>
              <td class="col-suyan"><span class="mark mark-good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>本地识别，音频不出机</td>
            </tr>
            <tr>
              <td>平台</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 12h12"/></svg></span>仅 Windows / macOS</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 12h12"/></svg></span>仅系统自带</td>
              <td class="col-suyan"><span class="mark mark-good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>Windows + macOS + Ubuntu</td>
            </tr>
            <tr>
              <td>体验</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></span>臃肿、广告多、弹窗</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 12h12"/></svg></span>功能单一，词库弱</td>
              <td class="col-suyan"><span class="mark mark-good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>极速启动，智能词频</td>
            </tr>
            <tr>
              <td>内置工具</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></span>捆绑大量无用功能</td>
              <td><span class="mark mark-bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 12h12"/></svg></span>仅基础输入</td>
              <td class="col-suyan"><span class="mark mark-good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>截图 / 剪贴板，克制集成办公必须，按需调用</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ============ 技术透明 ============ -->
    <section class="section container" data-component="Open Source Stack">
      <div class="section-head reveal">
        <p class="eyebrow">Open Source · 技术透明</p>
        <h2 class="section-title">站在巨人的肩膀上</h2>
        <p class="section-desc">核心输入逻辑由经过十余年验证的开源代码驱动，不存在隐藏的数据采集后门。</p>
      </div>
      <div class="tech-grid">
        <article class="tech-card reveal" data-component="Tech Card">
          <p class="tech-role">引擎 · Engine</p>
          <h3><a href="https://rime.im/" target="_blank" rel="noreferrer">RIME 中州韵<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-left: 4px"><path d="M7 17 17 7m0 0H9m8 0v8"/></svg></a></h3>
          <p>素言集成了 librime 核心库，处理底层的按键响应、拼音匹配与候选词排序。它不仅是一个输入法，更是一个经过社区十余年打磨的输入法算法框架。</p>
        </article>
        <article class="tech-card reveal" data-component="Tech Card">
          <p class="tech-role">词库 · Dictionary</p>
          <h3><a href="https://github.com/iDvel/rime-ice" target="_blank" rel="noreferrer">雾凇拼音 Rime-Ice<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-left: 4px"><path d="M7 17 17 7m0 0H9m8 0v8"/></svg></a></h3>
          <p>词库来自社区精心维护的雾凇拼音方案，词频与候选质量经过大量真实输入调优，是素言「好用」的灵魂配置。</p>
        </article>
        <article class="tech-card reveal" data-component="Tech Card">
          <p class="tech-role">五笔方案 · Wubi Scheme</p>
          <h3><a href="https://github.com/KyleBing/rime-wubi86-jidian" target="_blank" rel="noreferrer">极点五笔 86<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-left: 4px"><path d="M7 17 17 7m0 0H9m8 0v8"/></svg></a></h3>
          <p>素言的五笔输入方案基于经典的极点五笔 86 码表与词库调校。五笔字型 86 版编码、极点系词组规则与输入习惯完整保留，老五笔用户切换素言即无缝上手。</p>
        </article>
      </div>
    </section>

    <!-- ============ 企业定制 ============ -->
    <section class="enterprise" id="enterprise" data-component="Enterprise Band">
      <div class="section-head reveal">
        <p class="eyebrow">Enterprise · 企业定制</p>
        <h2 class="section-title">员工键入的每个字，都不该经过公有云</h2>
        <p class="section-desc">客户名称、合同金额、内部代号——素言私有化部署从根本上杜绝击键数据出域的风险。</p>
      </div>
      <div class="ent-grid">
        <ul class="ent-points reveal">
          <li>
            <span class="pt-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6H9zM9 2v2m6-2v2M9 20v2m6-2v2M2 9h2m-2 6h2m16-6h2m-2 6h2"/></svg></span>
            <div><strong>内网大模型对接</strong><span>对接企业私有部署的 Qwen、Llama 等模型，AI 辅助输入与划词翻译的所有数据仅在企业内网流转。</span></div>
          </li>
          <li>
            <span class="pt-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="9" cy="7" r="4"/><path d="m17 11 2 2 4-4"/></svg></span>
            <div><strong>企业级同步与账号体系</strong><span>词库、词频、配置统一同步，支持企业 SSO 对接，员工换机即恢复全部输入习惯。</span></div>
          </li>
          <li>
            <span class="pt-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8m0-5h18v5H3zM12 3v18"/></svg></span>
            <div><strong>批量分发部署</strong><span>独立企业版安装包（MSI / PKG / DEB），预置内网配置，兼容 MDM 统一推送，IT 一键部署。</span></div>
          </li>
          <li>
            <span class="pt-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2Z"/><path d="M19 17H6a2 2 0 0 0-2 2m7-12h5m-5 4h5"/></svg></span>
            <div><strong>行业专属词库</strong><span>针对医疗、法律、金融、制造等行业定制专业词库，大幅降低专业术语的输入成本。</span></div>
          </li>
          <li>
            <span class="pt-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg></span>
            <div><strong>安全合规</strong><span>输入数据全程本地处理，满足等保、数据出境等合规审计要求，适用于政企、金融等高安全场景。</span></div>
          </li>
        </ul>
        <div class="ent-delivery reveal" data-component="Enterprise Delivery Table">
          <table>
            <thead>
              <tr><th>交付方式</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr><td>部署形式</td><td>独立安装包 / MDM 推送 / 内网分发平台集成</td></tr>
              <tr><td>大模型对接</td><td>OpenAI 兼容接口，对接企业已有内网模型服务</td></tr>
              <tr><td>同步方案</td><td>端到端加密，支持企业内网自建同步服务</td></tr>
              <tr><td>词库定制</td><td>词库导入工具 + 专业领域词库制作服务</td></tr>
              <tr><td>技术支持</td><td>专属对接群 + 定期版本更新 + SLA 保障</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="ent-cta reveal">
        <a class="btn btn-primary btn-lg" href="/guide/contact">联系我们</a>
        <small>获取定制方案与报价</small>
      </div>
    </section>

    <!-- ============ 素系列 ============ -->
    <section class="section container" data-component="Product Family">
      <div class="section-head reveal">
        <p class="eyebrow">Family · 素系列产品</p>
        <h2 class="section-title">不止于输入</h2>
      </div>
      <div class="product-grid">
        <a class="product-card reveal" href="https://sustream.zhangjh.cn" target="_blank" rel="noreferrer">
          <img src="/sustream_logo.png" alt="素流 Logo" width="96" height="96" loading="lazy" decoding="async" />
          <div>
            <p class="p-name">素流 SuStream</p>
            <p class="p-desc">AI 原生文件资产管家</p>
          </div>
          <span class="p-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span>
        </a>
        <a class="product-card reveal" href="https://verse-site.zhangjh.cn" target="_blank" rel="noreferrer">
          <img src="/verse_logo.png" alt="素章 Logo" width="200" height="174" loading="lazy" decoding="async" />
          <div>
            <p class="p-name">素章 Verse</p>
            <p class="p-desc">随时记录，随手成文</p>
          </div>
          <span class="p-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span>
        </a>
      </div>
    </section>

    <!-- ============ 更多作品 ============ -->
    <section class="section container" data-component="More Works">
      <div class="section-head reveal">
        <p class="eyebrow">Other Works · 更多作品</p>
        <h2 class="section-title">更多作品</h2>
      </div>
      <div class="product-grid">
        <a class="product-card reveal" href="https://playwhat.cc" target="_blank" rel="noreferrer">
          <img src="/playwhat_logo.png" alt="玩什么 Logo" width="200" height="200" loading="lazy" decoding="async" />
          <div>
            <p class="p-name">PlayWhat · 玩什么</p>
            <p class="p-desc">一款 H5 小游戏网站</p>
          </div>
          <span class="p-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span>
        </a>
      </div>
    </section>

    <!-- ============ 公众号文章 ============ -->
    <div class="container articles-news reveal">
      <div class="articles">
        <a href="https://mp.weixin.qq.com/s/N8UdTwUFyCVq_CqfU5NWCA" target="_blank" rel="noreferrer">素言新版本5.2.1发布：五笔爱好者福音<span class="src">但丁自留地</span></a>
        <a href="https://mp.weixin.qq.com/s/63I3Llu4IT65SIkefTFYUA" target="_blank" rel="noreferrer">素言新增自定义皮肤共享&皮肤社区<span class="src">但丁自留地</span></a>
        <a href="https://mp.weixin.qq.com/s/nbBbmLFPT0f4nsgvCqSe0w" target="_blank" rel="noreferrer">素言5.0发布：云同步、AI翻译集成，还有Ubuntu<span class="src">但丁自留地</span></a>
        <a href="https://mp.weixin.qq.com/s/p_OWf4GYqzPzYiDehMPAeg" target="_blank" rel="noreferrer">素言 v3.6.0 发布：你提的建议，我都做到了<span class="src">但丁自留地</span></a>
        <a href="https://mp.weixin.qq.com/s/txePM7bdF5GCP9neVgvsFw" target="_blank" rel="noreferrer">素言输入法：一款纯净、离线、注重隐私的桌面输入法<span class="src">但丁自留地</span></a>
      </div>
    </div>

    <!-- ============ 图片灯箱 ============ -->
    <Teleport to="body">
      <div v-if="lightboxSrc" class="sy-lightbox" @click="closeLightbox">
        <img :src="lightboxSrc" :alt="lightboxAlt" class="sy-lightbox-img" @click.stop />
        <button class="sy-lightbox-close" @click="closeLightbox" aria-label="关闭">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
.sy-home {
  font-family: var(--sy-font-sans);
  color: var(--fg);
  padding-top: var(--vp-nav-height);
}
.sy-home :deep(*) { box-sizing: border-box; }
.container { max-width: var(--container); margin: 0 auto; padding: 0 24px; }
.sy-home a { color: inherit; text-decoration: none; }
.sy-home img { max-width: 100%; display: block; }

.reveal { opacity: 1; transform: none; }
.reveal.is-reveal-pending { opacity: 0; transform: translateY(16px); transition: opacity 0.5s ease-out, transform 0.5s ease-out; }
.reveal.is-visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }

/* ===== Section scaffolding ===== */
.section { padding: var(--section-gap) 0 0; }
.eyebrow { font-family: var(--sy-font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--faint); margin-bottom: 18px; display: flex; align-items: center; gap: 10px; }
.eyebrow::before { content: ''; width: 20px; height: 1px; background: var(--border-strong); }
.section-head { max-width: 620px; margin-bottom: 56px; }
.section-title { font-size: clamp(28px, 3.4vw, 38px); font-weight: 600; line-height: 1.25; letter-spacing: -0.01em; }
.section-desc { margin-top: 14px; font-size: 16.5px; color: var(--muted); }

/* ===== Buttons ===== */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 14.5px; font-weight: 600; letter-spacing: 0.02em; padding: 9px 18px; border-radius: var(--radius-sm); border: 1px solid transparent; transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease; white-space: nowrap; }
.btn svg { width: 15px; height: 15px; flex: none; }
.btn:active { transform: translateY(1px); }
.btn-primary { background: var(--primary); color: var(--on-primary); box-shadow: 0 1px 2px color-mix(in srgb, var(--fg) 18%, transparent); }
.btn-primary:hover { background: var(--primary-hover); }
.hero-ctas .btn-primary { color: #fff; }
.btn-ghost { background: var(--surface); color: var(--fg); border-color: var(--border-strong); }
.btn-ghost:hover { border-color: color-mix(in srgb, var(--fg) 34%, var(--bg)); transform: translateY(-1px); }
.btn-lg { font-size: 15.5px; padding: 12px 24px; }

/* ===== Hero ===== */
.hero { padding: clamp(20px, 3vw, 36px) 0 0; text-align: center; overflow: hidden; }
.hero-chip { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 550; color: var(--primary); background: var(--primary-soft); border: 1px solid var(--primary-border); border-radius: 999px; padding: 5px 14px; }
.hero-chip .dot { width: 6px; height: 6px; border-radius: 999px; background: var(--primary); }
.hero h1 { margin: 20px auto 0; max-width: 720px; font-size: clamp(40px, 6.4vw, 64px); font-weight: 650; line-height: 1.14; letter-spacing: -0.015em; }
.hero h1 .accent { color: var(--primary); }
.hero-sub { margin: 16px auto 0; max-width: 560px; font-size: 17px; color: var(--muted); }
.hero-ctas { margin-top: 28px; display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.hero-ctas .note { width: 100%; margin-top: 14px; font-size: 13px; color: var(--faint); }
.hero-visual { margin: clamp(18px, 2.5vw, 32px) auto 0; max-width: 860px; position: relative; }
.hero-visual::before { content: ''; position: absolute; inset: -40px -80px -60px; z-index: -1; background: radial-gradient(closest-side, color-mix(in srgb, var(--primary) 7%, transparent), transparent 72%); }
.editor-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); overflow: hidden; text-align: left; }
.editor-body { padding: 32px 44px 26px; min-height: 128px; }
.editor-text { font-size: 21px; line-height: 2; color: var(--fg); font-weight: 500; letter-spacing: 0.01em; min-height: 42px; }
.editor-text .caret { display: inline-block; width: 2px; height: 1.15em; vertical-align: -0.2em; background: var(--primary); margin-left: 2px; animation: caret-blink 1.1s steps(1) infinite; }
@keyframes caret-blink { 50% { opacity: 0; } }
.editor-placeholder { color: var(--faint); font-weight: 400; }
.candidate-bar { display: flex; align-items: stretch; border-top: 1px solid var(--border); background: var(--surface-2); height: 42px; overflow: hidden; }
.cand-pinyin { display: flex; align-items: center; gap: 8px; padding: 10px 18px; min-width: 148px; font-family: var(--sy-font-mono); font-size: 14px; color: var(--muted); border-right: 1px solid var(--border); white-space: nowrap; flex-shrink: 0; }
.cand-pinyin .kbd-mini { font-family: var(--sy-font-sans); font-size: 10.5px; font-weight: 600; color: var(--faint); border: 1px solid var(--border-strong); border-radius: 4px; padding: 0 5px; line-height: 1.5; }
.cand-list { display: flex; align-items: center; flex: 1; padding: 6px 10px; gap: 2px; overflow: hidden; }
.cand { display: flex; align-items: baseline; gap: 5px; padding: 4px 12px; border-radius: 6px; font-size: 15px; color: var(--muted); white-space: nowrap; }
.cand .num { font-size: 10.5px; color: var(--faint); font-family: var(--sy-font-mono); }
.cand.is-first { background: var(--primary-soft); color: var(--primary); font-weight: 600; }
.cand.is-first .num { color: var(--primary); }
.cand-more { margin-left: auto; padding: 0 14px; font-size: 12px; color: var(--faint); font-family: var(--sy-font-mono); }
.hero-hint { margin-top: 14px; display: flex; justify-content: center; gap: 22px; flex-wrap: wrap; font-size: 12.5px; color: var(--faint); }
.hero-hint span { display: inline-flex; align-items: center; gap: 7px; }
.hero-hint kbd { font-family: var(--sy-font-mono); font-size: 11px; border: 1px solid var(--border-strong); border-bottom-width: 2px; border-radius: 5px; padding: 1px 6px; color: var(--muted); }

/* ===== Trust ===== */
.trust { padding: clamp(40px, 5vw, 64px) 0 clamp(40px, 5vw, 64px); }
.trust-inner { display: flex; justify-content: center; align-items: center; gap: 14px 40px; flex-wrap: wrap; }
.trust-item { display: inline-flex; align-items: center; gap: 9px; font-size: 13.5px; font-weight: 500; color: var(--muted); }
.trust-item svg { width: 17px; height: 17px; color: var(--faint); flex: none; }
.trust-sep { width: 1px; height: 16px; background: var(--border); }

/* ===== Feature grid ===== */
.feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 26px 26px 24px; transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
.feature-card:hover { transform: translateY(-3px); border-color: var(--border-strong); box-shadow: var(--shadow-md); }
.feature-icon { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; margin-bottom: 18px; background: var(--surface-3); color: var(--fg); border: 1px solid var(--border); }
.feature-icon svg { width: 18px; height: 18px; }
.feature-card h3 { font-size: 16.5px; font-weight: 600; margin-bottom: 8px; letter-spacing: 0.01em; }
.feature-card p { font-size: 14px; color: var(--muted); line-height: 1.7; }

/* ===== Deep dive ===== */
.deep { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(36px, 5vw, 72px); align-items: center; }
.deep + .deep { margin-top: var(--section-gap); }
.deep.flip .deep-visual { order: 2; }
.deep-tag { display: inline-flex; align-items: center; gap: 8px; font-family: var(--sy-font-mono); font-size: 11.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--faint); margin-bottom: 16px; }
.deep h2 { font-size: clamp(24px, 2.8vw, 30px); font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; }
.deep-lead { margin-top: 12px; font-size: 16px; color: var(--muted); }
.deep-points { margin-top: 22px; display: grid; gap: 13px; list-style: none; }
.deep-points li { display: flex; gap: 12px; font-size: 14.5px; color: var(--muted); line-height: 1.65; }
.deep-points li strong { color: var(--fg); font-weight: 600; }
.deep-points .pt-check { flex: none; width: 19px; height: 19px; margin-top: 3px; border-radius: 999px; display: grid; place-items: center; background: var(--primary-soft); color: var(--primary); }
.deep-points .pt-check svg { width: 11px; height: 11px; }
.deep-more { margin-top: 26px; display: inline-flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 600; color: var(--fg); border-bottom: 1px solid var(--border-strong); padding-bottom: 3px; }
.deep-more:hover { color: var(--primary); border-color: var(--primary); }
.deep-more svg { width: 14px; height: 14px; }
.deep-visual .mock { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); overflow: hidden; }
.mock-caption { margin-top: 14px; text-align: center; font-size: 12.5px; color: var(--faint); }

/* translate mock */
.mock-translate { padding: 26px 28px 30px; }
.mock-doc-line { height: 10px; border-radius: 5px; background: var(--surface-3); margin-bottom: 12px; }
.mock-doc-line.w90 { width: 90%; } .mock-doc-line.w75 { width: 75%; } .mock-doc-line.w82 { width: 82%; } .mock-doc-line.w60 { width: 60%; }
.mock-doc-sel { position: relative; display: inline-block; font-family: var(--sy-font-mono); font-size: 13.5px; line-height: 1.6; color: var(--fg); padding: 1px 3px; border-radius: 4px; background: color-mix(in srgb, var(--primary) 16%, transparent); box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 40%, transparent); }
.mock-pop { margin-top: 20px; border: 1px solid var(--border-strong); border-radius: var(--radius); background: var(--surface); box-shadow: var(--shadow-md); }
.mock-pop-head { display: flex; align-items: center; gap: 8px; padding: 9px 14px; border-bottom: 1px solid var(--border); font-size: 11px; font-family: var(--sy-font-mono); letter-spacing: 0.06em; color: var(--faint); text-transform: uppercase; }
.mock-pop-head .lang-badge { margin-left: auto; display: inline-flex; align-items: center; gap: 5px; font-family: var(--sy-font-sans); font-size: 11px; font-weight: 600; letter-spacing: 0.02em; color: var(--primary); background: var(--primary-soft); padding: 2px 9px; border-radius: 999px; text-transform: none; }
.mock-pop-body { padding: 14px 16px; }
.mock-pop-body .from { font-family: var(--sy-font-mono); font-size: 12.5px; color: var(--faint); text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--fg) 30%, transparent); }
.mock-pop-body .to { margin-top: 7px; font-size: 15px; font-weight: 550; color: var(--fg); }
.mock-pop-body .streaming { display: inline-block; width: 7px; height: 15px; vertical-align: -2px; background: var(--primary); animation: caret-blink 1s steps(1) infinite; margin-left: 2px; border-radius: 1px; }

/* voice mock */
.mock-voice { padding: 28px 28px 26px; text-align: center; }
.voice-state { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); border: 1px solid var(--border); background: var(--surface-2); padding: 4px 12px; border-radius: 999px; }
.voice-state .rec-dot { width: 7px; height: 7px; border-radius: 999px; background: #d4483b; animation: rec-pulse 1.4s ease-in-out infinite; }
@keyframes rec-pulse { 50% { opacity: 0.35; } }
.wave { display: flex; align-items: center; justify-content: center; gap: 5px; height: 64px; margin: 22px 0 18px; }
.wave i { width: 4px; border-radius: 999px; background: var(--primary); opacity: 0.85; height: 12%; animation: wave-ease 1.2s ease-in-out infinite; }
@keyframes wave-ease { 50% { height: 100%; } }
.voice-text { font-size: 15.5px; font-weight: 500; color: var(--fg); min-height: 28px; letter-spacing: 0.01em; }
.voice-text .tail { color: var(--faint); font-weight: 400; }
.voice-kbd { margin-top: 16px; font-size: 12px; color: var(--faint); }
.voice-kbd kbd { font-family: var(--sy-font-mono); font-size: 11px; border: 1px solid var(--border-strong); border-bottom-width: 2px; border-radius: 5px; padding: 1px 6px; color: var(--muted); margin: 0 2px; }

/* sync mock */
.mock-sync { padding: 30px 28px; display: grid; grid-template-columns: 1fr auto 1fr; gap: 14px; align-items: center; }
.sync-device { border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; background: var(--surface-2); }
.sync-device .dev-name { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; color: var(--fg); }
.sync-device .dev-name svg { width: 14px; height: 14px; color: var(--muted); }
.sync-device ul { list-style: none; margin-top: 10px; display: grid; gap: 5px; }
.sync-device li { display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: var(--muted); }
.sync-device li svg { width: 11px; height: 11px; color: var(--primary); flex: none; }
.sync-mid { display: grid; place-items: center; gap: 8px; }
.sync-lock { width: 46px; height: 46px; border-radius: 14px; display: grid; place-items: center; background: var(--primary-soft); border: 1px solid var(--primary-border); color: var(--primary); }
.sync-lock svg { width: 20px; height: 20px; }
.sync-mid small { font-family: var(--sy-font-mono); font-size: 10.5px; letter-spacing: 0.08em; color: var(--faint); text-transform: uppercase; }

/* ===== Demo ===== */
.demo-videos { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.video-card { position: relative; display: block; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); background: var(--surface); transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; cursor: pointer; }
.video-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--border-strong); }
.video-thumb { position: relative; aspect-ratio: 16 / 9; overflow: hidden; }
.video-thumb img { width: 100%; height: 100%; object-fit: cover; }
.video-thumb::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 55%, rgba(10, 14, 12, 0.55)); pointer-events: none; }
.video-iframe { width: 100%; height: 100%; border: 0; display: block; }
.video-play { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 54px; height: 54px; border-radius: 999px; z-index: 2; background: rgba(255, 255, 255, 0.92); color: #1b2b63; display: grid; place-items: center; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.28); transition: transform 0.2s ease; }
.video-card:hover .video-play { transform: translate(-50%, -50%) scale(1.08); }
.video-play svg { width: 20px; height: 20px; margin-left: 2px; }
.video-label { position: absolute; left: 16px; bottom: 12px; z-index: 2; color: #fff; font-size: 14px; font-weight: 600; letter-spacing: 0.02em; }
.video-meta { display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; font-size: 12.5px; color: var(--faint); }
.video-meta .ext { display: inline-flex; align-items: center; gap: 6px; }
.video-meta .ext svg { width: 13px; height: 13px; }
.shot-grid { margin-top: 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.shot-card { border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
.shot-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--border-strong); }
.shot-card > figure { background: var(--surface-2); aspect-ratio: 16 / 10; display: grid; place-items: center; overflow: hidden; margin: 0; }
.shot-img-wrap { cursor: zoom-in; position: relative; }
.shot-img-wrap::after { content: ''; position: absolute; inset: 0; background: color-mix(in srgb, var(--primary) 0%, transparent); transition: background 0.2s ease; pointer-events: none; }
.shot-img-wrap:hover::after { background: color-mix(in srgb, var(--primary) 8%, transparent); }
.shot-card img { max-height: 100%; max-width: 92%; object-fit: contain; }
.shot-card figcaption { padding: 11px 15px; font-size: 12.5px; color: var(--muted); display: flex; align-items: center; justify-content: space-between; }
.shot-card figcaption em { font-style: normal; font-size: 11px; color: var(--faint); font-family: var(--sy-font-mono); }

/* ===== Compare ===== */
.compare-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); }
.compare { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 640px; font-size: 14px; }
.compare th, .compare td { padding: 14px 20px; text-align: left; border-bottom: 1px solid var(--border); vertical-align: top; }
.compare thead th { font-size: 12px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--faint); font-family: var(--sy-font-mono); padding-top: 18px; }
.compare tbody tr:last-child td { border-bottom: none; }
.compare td:first-child { color: var(--muted); font-weight: 550; white-space: nowrap; }
.compare .col-suyan { background: color-mix(in srgb, var(--primary) 4%, var(--surface)); border-left: 1px solid var(--primary-border); border-right: 1px solid var(--primary-border); }
.compare thead .col-suyan { color: var(--primary); font-family: var(--sy-font-sans); font-size: 13.5px; letter-spacing: 0.02em; text-transform: none; }
.compare tbody .col-suyan { color: var(--fg); font-weight: 500; }
.compare .mark { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 999px; vertical-align: -5px; margin-right: 8px; }
.compare .mark svg { width: 12px; height: 12px; }
.mark-good { background: var(--primary-soft); color: var(--primary); }
.mark-bad { background: var(--surface-3); color: var(--faint); }
.compare tbody td { color: var(--muted); }

/* ===== Tech ===== */
.tech-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.tech-card { border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); padding: 28px; transition: border-color 0.2s ease, transform 0.2s ease; }
.tech-card:hover { border-color: var(--border-strong); transform: translateY(-2px); }
.tech-card .tech-role { font-family: var(--sy-font-mono); font-size: 11px; letter-spacing: 0.09em; text-transform: uppercase; color: var(--faint); }
.tech-card h3 { margin-top: 10px; font-size: 19px; font-weight: 600; }
.tech-card h3 a { border-bottom: 1px solid transparent; }
.tech-card h3 a:hover { border-color: var(--primary); }
.tech-card p { margin-top: 10px; font-size: 14px; color: var(--muted); line-height: 1.7; }

/* ===== Enterprise ===== */
.enterprise { background: radial-gradient(900px 420px at 85% -10%, color-mix(in srgb, var(--ent-accent) 9%, transparent), transparent 65%), var(--ent-bg); color: var(--ent-fg); border-radius: clamp(18px, 3vw, 28px); margin: var(--section-gap) max(20px, calc((100vw - var(--container)) / 2 - 8px)) 0; padding: clamp(52px, 7vw, 88px) clamp(26px, 5vw, 72px); position: relative; overflow: hidden; }
.enterprise .eyebrow { color: var(--ent-faint); }
.enterprise .eyebrow::before { background: var(--ent-divider); }
.enterprise .section-title { color: var(--ent-fg-strong); }
.enterprise .section-desc { color: var(--ent-muted); }
.enterprise .section-head { max-width: 720px; }
.ent-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: clamp(32px, 5vw, 64px); margin-top: 48px; align-items: start; }
.ent-points { display: grid; gap: 20px; list-style: none; }
.ent-points li { display: flex; gap: 14px; }
.ent-points .pt-icon { flex: none; width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.09); color: var(--ent-accent-soft); }
.ent-points .pt-icon svg { width: 17px; height: 17px; }
.ent-points strong { display: block; font-size: 15px; font-weight: 600; color: var(--ent-fg-strong); }
.ent-points span { display: block; margin-top: 4px; font-size: 13.5px; color: var(--ent-muted); line-height: 1.65; }
.ent-delivery { border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.025); border-radius: var(--radius); overflow: hidden; }
.ent-delivery table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.ent-delivery th, .ent-delivery td { padding: 12px 18px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.08); vertical-align: top; }
.ent-delivery tr:last-child td { border-bottom: none; }
.ent-delivery th { font-family: var(--sy-font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ent-faint); font-weight: 600; }
.ent-delivery td:first-child { color: var(--ent-body-1); font-weight: 550; white-space: nowrap; }
.ent-delivery td:last-child { color: var(--ent-muted); }
.ent-cta { margin-top: 44px; display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.ent-cta .btn-primary { background: var(--ent-accent); color: var(--ent-on-accent); }
.ent-cta .btn-primary:hover { background: var(--ent-accent-hover); }
.ent-cta small { font-size: 12.5px; color: var(--ent-faint); }

/* ===== Products ===== */
.product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.product-card { display: flex; align-items: center; gap: 18px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); padding: 22px 24px; transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
.product-card:hover { transform: translateY(-3px); border-color: var(--border-strong); box-shadow: var(--shadow-md); }
.product-card img { width: 46px; height: 46px; border-radius: 11px; flex: none; }
.product-card .p-name { font-size: 15.5px; font-weight: 600; }
.product-card .p-desc { margin-top: 3px; font-size: 13px; color: var(--muted); }
.product-card .p-arrow { margin-left: auto; color: var(--faint); transition: transform 0.2s ease, color 0.2s ease; }
.product-card:hover .p-arrow { transform: translateX(4px); color: var(--fg); }
.product-card .p-arrow svg { width: 17px; height: 17px; }
.articles { margin-top: 26px; display: grid; gap: 4px; }
.articles a { display: flex; align-items: baseline; gap: 10px; padding: 11px 4px; font-size: 14px; color: var(--muted); border-bottom: 1px solid var(--border); }
.articles a:hover { color: var(--fg); }
.articles a .src { margin-left: auto; flex: none; font-size: 12px; color: var(--faint); }

/* ===== Responsive ===== */
@media (max-width: 1023px) {
  .feature-grid { grid-template-columns: 1fr 1fr; }
  .tech-grid { grid-template-columns: 1fr; }
  .deep { grid-template-columns: 1fr; }
  .deep.flip .deep-visual { order: 0; }
  .ent-grid { grid-template-columns: 1fr; }
}
@media (max-width: 639px) {
  .feature-grid, .demo-videos, .shot-grid, .product-grid { grid-template-columns: 1fr; }
  .container { padding: 0 20px; }
  .editor-body { padding: 26px 22px 20px; }
  .cand-pinyin { min-width: 0; padding: 10px 14px; }
  .hero-ctas .btn { width: 100%; }
  .compare th, .compare td { padding: 12px 14px; }
  .enterprise { margin: var(--section-gap) 16px 0; }
  .trust-sep { display: none; }
  .hero h1 { font-size: clamp(28px, 8vw, 40px); }
  .hero-sub { font-size: 15px; }
  .hero-ctas { gap: 10px; }
  .hero-visual::before { display: none; }
  .section { padding: clamp(48px, 8vw, 72px) 0 0; }
  .section-head { margin-bottom: 36px; }
  .trust { padding: clamp(28px, 5vw, 40px) 0; }
  .trust-inner { gap: 12px 24px; }
  .trust-item { font-size: 12.5px; }
  .sync-device { padding: 12px; }
  .sync-device ul { gap: 3px; }
  .sync-device li { font-size: 11px; }
  .mock-sync { grid-template-columns: 1fr; gap: 12px; }
  .sync-mid { order: -1; }
  .deep-points li { font-size: 13.5px; }
  .ent-points li { gap: 10px; }
  .enterprise .section-title { font-size: clamp(21px, 6vw, 26px); }
  .enterprise .section-desc { font-size: 14px; line-height: 1.7; }
  .ent-points .pt-icon { width: 32px; height: 32px; }
  .ent-points .pt-icon svg { width: 15px; height: 15px; }
  .ent-points strong { font-size: 14px; }
  .ent-points span { font-size: 12.5px; }
  .ent-delivery th, .ent-delivery td { padding: 10px 14px; font-size: 12.5px; }
  .product-card { padding: 16px; gap: 14px; }
  .product-card img { width: 40px; height: 40px; }
}
</style>

<style>
/* ===== 图片灯箱（Teleport 到 body，需非 scoped） ===== */
.sy-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: sy-lightbox-in 0.2s ease-out;
  cursor: zoom-out;
}
@keyframes sy-lightbox-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.sy-lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  cursor: default;
  object-fit: contain;
}
.sy-lightbox-close {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.2s ease;
}
.sy-lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
}
.sy-lightbox-close svg {
  width: 20px;
  height: 20px;
}
</style>
