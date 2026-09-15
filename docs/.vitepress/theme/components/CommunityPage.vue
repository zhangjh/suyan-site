<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

// 后端公开列表接口；审核通过的皮肤在这里实时可见，无需重新部署站点
const API_BASE = 'https://api-verse.zhangjh.cn'
const PAGE_SIZE = 24
const TIMEOUT_MS = 15000

const layoutLabels = { horizontal: '横排', vertical: '竖排' }

const skins = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const errorMsg = ref('')
const page = ref(1)
const total = ref(0)
const hasMore = ref(true)
const copiedCode = ref('')
const activeFilter = ref('all') // all | horizontal | vertical
const sentinelEl = ref(null)
let resetTimer = null
let observer = null

const filteredSkins = computed(() => {
  if (activeFilter.value === 'all') return skins.value
  return skins.value.filter((s) => s.layout === activeFilter.value)
})

async function fetchPage(p) {
  const url = `${API_BASE}/api/suyan/community/skins?page=${p}&limit=${PAGE_SIZE}`
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function loadFirst() {
  loading.value = true
  errorMsg.value = ''
  try {
    page.value = 1
    const data = await fetchPage(1)
    const list = Array.isArray(data?.skins) ? data.skins : []
    skins.value = list
    total.value = Number(data?.total ?? list.length)
    hasMore.value = skins.value.length < total.value
  } catch (err) {
    errorMsg.value = '皮肤列表加载失败，请稍后刷新重试'
    skins.value = []
    total.value = 0
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  // 首屏还在加载、或正在翻页、或没有更多时直接跳过，避免 IntersectionObserver 反复触发
  if (loading.value || loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    const next = page.value + 1
    const data = await fetchPage(next)
    const list = Array.isArray(data?.skins) ? data.skins : []
    skins.value.push(...list)
    page.value = next
    hasMore.value = skins.value.length < total.value
  } catch (err) {
    // 翻页失败不打断已展示内容，用户再次滚动会重试
  } finally {
    loadingMore.value = false
  }
}

function bindObserver() {
  if (observer) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore()
    },
    { rootMargin: '240px' },
  )
  if (sentinelEl.value) observer.observe(sentinelEl.value)
}

onMounted(() => {
  loadFirst().then(bindObserver)
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

async function writeClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      // 剪贴板权限被拒时走下面的降级路径
    }
  }
  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  try {
    ta.select()
    document.execCommand('copy')
    return true
  } catch (err) {
    return false
  } finally {
    document.body.removeChild(ta)
  }
}

async function copyShareCode(code) {
  const ok = await writeClipboard(code)
  if (ok) {
    copiedCode.value = code
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => (copiedCode.value = ''), 1600)
  }
}
</script>

<template>
  <div class="sy-community">
    <!-- ============ 页头 ============ -->
    <section class="page-head container">
      <h1>皮肤社区</h1>
      <p class="sub">
        用皮肤码定制你的候选框——配色、字体、圆角，甚至自定义背景图片。这里陈列着社区创作者的作品，审核通过后实时可见。
      </p>
      <span class="live-note"><span class="pulse"></span>列表实时同步自社区后端</span>
    </section>

    <!-- ============ 画廊 ============ -->
    <section class="container gallery" data-component="Skin Gallery">
      <div class="filter-row" role="group" aria-label="布局筛选" data-component="Filter Row">
        <button type="button" class="filter-chip" :class="{ 'is-active': activeFilter === 'all' }" @click="activeFilter = 'all'">全部</button>
        <button type="button" class="filter-chip" :class="{ 'is-active': activeFilter === 'horizontal' }" @click="activeFilter = 'horizontal'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg>
          横排
        </button>
        <button type="button" class="filter-chip" :class="{ 'is-active': activeFilter === 'vertical' }" @click="activeFilter = 'vertical'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 4v16M16 4v16"/></svg>
          竖排
        </button>
        <span v-if="!loading && !errorMsg" class="filter-count">
          共 {{ filteredSkins.length }} 款皮肤<template v-if="activeFilter === 'all' && total > filteredSkins.length"> · {{ total }} 款待加载</template>
        </span>
      </div>

      <!-- 首屏加载中：骨架屏 -->
      <div v-if="loading" class="skin-grid">
        <div v-for="n in 8" :key="n" class="skin-card is-skeleton">
          <div class="ph-img"></div>
          <div class="ph-line"></div>
          <div class="ph-line short"></div>
          <div class="ph-code"></div>
        </div>
      </div>

      <!-- 加载失败：提示 + 重试 -->
      <div v-else-if="errorMsg" class="skin-status">
        <p>{{ errorMsg }}</p>
        <button type="button" class="btn btn-ghost retry" @click="loadFirst">重试</button>
      </div>

      <!-- 有皮肤：卡片网格 -->
      <div v-else-if="filteredSkins.length" class="skin-grid">
        <div v-for="skin in filteredSkins" :key="skin.shareCode" class="skin-card" data-component="Skin Card">
          <div class="skin-img-wrap">
            <img :src="skin.previewUrl" :alt="skin.skinName + ' 皮肤预览'" loading="lazy" />
          </div>
          <div class="skin-meta">
            <div class="skin-title-row">
              <h3>{{ skin.skinName }}</h3>
              <span class="layout-tag">
                <svg v-if="skin.layout === 'vertical'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M8 4v16M16 4v16"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg>
                {{ layoutLabels[skin.layout] || skin.layout }}
              </span>
            </div>
            <p class="skin-author"><span class="avatar">{{ (skin.authorName || '友').slice(0, 1) }}</span>by {{ skin.authorName }}</p>
            <div class="skin-code-row">
              <code class="skin-code">{{ skin.shareCode }}</code>
              <button
                type="button"
                class="copy-btn"
                :class="{ 'is-copied': copiedCode === skin.shareCode }"
                :title="'复制分享码 ' + skin.shareCode"
                :aria-label="'复制 ' + skin.skinName + ' 的分享码 ' + skin.shareCode"
                @click="copyShareCode(skin.shareCode)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
                {{ copiedCode === skin.shareCode ? '已复制' : '复制' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选后为空 -->
      <div v-else-if="skins.length" class="skin-status">
        <p>当前筛选下暂无皮肤，换一个布局看看。</p>
      </div>

      <!-- 空：还没有上架皮肤 -->
      <div v-else class="skin-status">
        <strong>还没有已上架的共享皮肤</strong>
        <p>共享皮肤需要审核通过后才会出现在这里，稍后再来看看。</p>
        <p>也欢迎你在客户端的「皮肤设置 → 分享皮肤」分享自己的作品。</p>
      </div>

      <!-- 滚动加载哨兵：进入视口即拉取下一页 -->
      <div ref="sentinelEl" class="skin-sentinel"></div>
      <div v-if="loadingMore" class="loading-more">
        <span class="spinner"></span>
        <p>加载更多中…</p>
      </div>
      <div v-else-if="skins.length && !hasMore && activeFilter === 'all'" class="loading-more">
        <p>已经到底啦，共 {{ total }} 款皮肤</p>
      </div>
    </section>

    <!-- ============ 导入 & 分享 ============ -->
    <section class="container" style="padding-top: 36px" data-component="Share CTA">
      <div class="share-cta" data-component="Share Card">
        <div class="sc-copy">
          <p class="eyebrow">Import · 如何导入</p>
          <h2>复制皮肤码，即刻换装</h2>
          <ol>
            <li>复制想用的皮肤的<strong>分享码</strong></li>
            <li>打开素言，进入<strong>皮肤设置</strong></li>
            <li>点击<strong>导入分享码</strong>，粘贴并确认</li>
          </ol>
          <p class="sc-note">导入后的皮肤会出现在皮肤下拉列表里，选中即可应用。皮肤中的自定义字体会替换为系统默认字体。</p>
        </div>
        <div class="sc-copy">
          <p class="eyebrow">Contribute · 分享你的皮肤</p>
          <h2>把你的候选框，分享给所有人</h2>
          <p class="sc-note">在素言的「皮肤设置 → 分享皮肤」中提交你的作品，审核通过后实时上架，与所有用户见面。</p>
          <div class="actions">
            <a class="btn btn-ghost btn-lg" href="/download">先去下载素言</a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sy-community {
  font-family: var(--sy-font-sans);
  color: var(--fg);
  padding-top: var(--vp-nav-height);
  padding-bottom: clamp(56px, 8vw, 96px);
}
.sy-community :deep(*) { box-sizing: border-box; }
.container { max-width: var(--container); margin: 0 auto; padding: 0 24px; }
.sy-community a { color: inherit; text-decoration: none; }
.sy-community img { max-width: 100%; display: block; }

.page-head { padding: clamp(52px, 6vw, 84px) 0 0; }
.page-head h1 { font-size: clamp(32px, 4.4vw, 46px); font-weight: 650; line-height: 1.2; letter-spacing: -0.015em; }
.page-head .sub { margin-top: 14px; font-size: 16.5px; color: var(--muted); max-width: 620px; }
.live-note { margin-top: 20px; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); border: 1px solid var(--border); background: var(--surface); border-radius: 999px; padding: 6px 14px; }
.live-note .pulse { width: 7px; height: 7px; border-radius: 999px; background: var(--primary); animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: 0.35; } }

.gallery { padding-top: 44px; }
.filter-row { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
.filter-chip { font-size: 13.5px; font-weight: 550; color: var(--muted); border: 1px solid var(--border); background: var(--surface); padding: 7px 16px; border-radius: 999px; display: inline-flex; align-items: center; gap: 7px; transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease; cursor: pointer; font-family: inherit; }
.filter-chip svg { width: 12px; height: 12px; }
.filter-chip:hover { color: var(--fg); border-color: var(--border-strong); }
.filter-chip.is-active { color: var(--primary); border-color: var(--primary-border); background: var(--primary-soft); font-weight: 600; }
.filter-count { margin-left: auto; font-size: 13px; color: var(--faint); }

.skin-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.skin-card { border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); overflow: hidden; transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
.skin-card:not(.is-skeleton):hover { transform: translateY(-3px); border-color: var(--border-strong); box-shadow: var(--shadow-md); }
.skin-img-wrap { aspect-ratio: 16 / 10; display: grid; place-items: center; overflow: hidden; background: var(--surface-2); border-bottom: 1px solid var(--border); }
.skin-img-wrap img { max-width: 92%; max-height: 92%; object-fit: contain; }

.skin-meta { padding: 16px 18px 18px; }
.skin-title-row { display: flex; align-items: center; gap: 10px; }
.skin-title-row h3 { font-size: 15.5px; font-weight: 600; }
.layout-tag { font-size: 11px; font-weight: 600; color: var(--muted); border: 1px solid var(--border-strong); border-radius: 5px; padding: 1px 7px; display: inline-flex; align-items: center; gap: 4px; flex: none; }
.layout-tag svg { width: 10px; height: 10px; }
.skin-author { margin-top: 5px; font-size: 12.5px; color: var(--faint); display: flex; align-items: center; gap: 6px; }
.skin-author .avatar { width: 16px; height: 16px; border-radius: 999px; background: var(--surface-3); border: 1px solid var(--border); display: grid; place-items: center; font-size: 8.5px; font-weight: 600; color: var(--muted); }
.skin-code-row { margin-top: 14px; display: flex; gap: 8px; }
.skin-code { flex: 1; min-width: 0; font-family: var(--sy-font-mono); font-size: 12px; color: var(--muted); background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }
.copy-btn { flex: none; display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; color: var(--fg); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); padding: 0 13px; background: var(--surface); transition: border-color 0.15s ease, color 0.15s ease, transform 0.15s ease; cursor: pointer; font-family: inherit; }
.copy-btn svg { width: 13px; height: 13px; }
.copy-btn:hover { border-color: color-mix(in srgb, var(--fg) 34%, var(--bg)); transform: translateY(-1px); }
.copy-btn.is-copied { color: var(--primary); border-color: var(--primary-border); background: var(--primary-soft); }

/* 骨架屏 */
.is-skeleton { pointer-events: none; }
.is-skeleton .ph-img, .is-skeleton .ph-line, .is-skeleton .ph-code { background: var(--surface-2); opacity: 0.6; animation: skin-pulse 1.4s ease-in-out infinite; }
.is-skeleton .ph-img { height: 148px; margin: 0; border-bottom: 1px solid var(--border); border-radius: 0; }
.is-skeleton .ph-line { height: 14px; margin: 14px 18px 0; border-radius: 6px; }
.is-skeleton .ph-line.short { width: 50%; }
.is-skeleton .ph-code { height: 36px; margin: 16px 18px 18px; border-radius: var(--radius-sm); }
@keyframes skin-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.7; } }

.skin-status { border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); padding: 48px 24px; margin: 8px 0 24px; text-align: center; color: var(--muted); display: grid; justify-items: center; gap: 6px; }
.skin-status strong { color: var(--fg); font-size: 16px; }
.skin-status p { font-size: 14px; margin: 0; }
.skin-status .retry { margin-top: 10px; }

.skin-sentinel { height: 1px; }
.loading-more { display: grid; place-items: center; gap: 12px; padding: 48px 0 8px; }
.loading-more p { font-size: 13px; color: var(--faint); margin: 0; }
.spinner { width: 22px; height: 22px; border-radius: 999px; border: 2px solid var(--border); border-top-color: var(--border-strong); animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 导入 & 分享 */
.share-cta { margin-top: 20px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); padding: clamp(30px, 4vw, 48px); display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 4vw, 48px); }
.eyebrow { font-family: var(--sy-font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--faint); margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
.eyebrow::before { content: ''; width: 20px; height: 1px; background: var(--border-strong); }
.share-cta h2 { font-size: clamp(20px, 2.4vw, 25px); font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; }
.share-cta ol { margin: 16px 0 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.share-cta ol li { display: flex; gap: 10px; font-size: 13.5px; color: var(--muted); counter-increment: sc-step; position: relative; padding-left: 26px; }
.share-cta ol li::before { content: counter(sc-step); position: absolute; left: 0; top: 1px; width: 18px; height: 18px; border-radius: 999px; background: var(--surface-3); border: 1px solid var(--border); color: var(--muted); font-size: 10.5px; font-weight: 600; font-family: var(--sy-font-mono); display: grid; place-items: center; }
.share-cta ol li strong { color: var(--fg); }
.sc-note { margin-top: 14px; font-size: 13px; color: var(--faint); line-height: 1.7; }
.actions { margin-top: 18px; display: grid; gap: 10px; justify-items: start; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 14.5px; font-weight: 600; letter-spacing: 0.02em; padding: 9px 18px; border-radius: var(--radius-sm); border: 1px solid transparent; transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease; white-space: nowrap; }
.btn-lg { font-size: 15.5px; padding: 12px 24px; }
.btn-ghost { background: var(--surface); color: var(--fg); border-color: var(--border-strong); }
.btn-ghost:hover { border-color: color-mix(in srgb, var(--fg) 34%, var(--bg)); transform: translateY(-1px); }

@media (max-width: 1023px) {
  .skin-grid { grid-template-columns: 1fr 1fr; }
  .share-cta { grid-template-columns: 1fr; }
}
@media (max-width: 639px) {
  .skin-grid { grid-template-columns: 1fr; }
  .filter-count { margin-left: 0; width: 100%; }
  .actions { width: 100%; }
  .page-head h1 { font-size: clamp(28px, 8vw, 36px); }
  .page-head .sub { font-size: 15px; }
  .gallery { padding-top: 32px; }
  .share-cta { padding: 26px 20px; }
  .skin-card { margin: 0; }
}
</style>
