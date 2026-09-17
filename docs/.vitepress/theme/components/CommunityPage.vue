<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  initialSkins: { type: Array, default: () => [] },
  initialTotal: { type: Number, default: 0 },
  snapshotGeneratedAt: { type: String, default: '' },
  staticPage: { type: [String, Number], default: 1 },
  pageCount: { type: Number, default: 0 },
  detailCodes: { type: Array, default: () => [] },
})

const API_BASE = 'https://api-verse.zhangjh.cn'
const PAGE_SIZE = 24
const TIMEOUT_MS = 15_000
const layoutLabels = { horizontal: '横排', vertical: '竖排' }

const staticPageNumber = Math.max(1, Number(props.staticPage) || 1)
const isArchivePage = staticPageNumber > 1
const skins = ref([...props.initialSkins])
const loading = ref(!skins.value.length)
const loadingMore = ref(false)
const errorMsg = ref('')
const refreshWarning = ref('')
const page = ref(staticPageNumber)
const total = ref(Number(props.initialTotal) || skins.value.length)
const hasMore = ref(!isArchivePage && skins.value.length < total.value)
const copiedCode = ref('')
const activeFilter = ref('all')
const sentinelEl = ref(null)
let resetTimer = null
let observer = null

const detailCodeSet = new Set(props.detailCodes.map(String))
const snapshotPageCount = Math.max(1, props.pageCount || Math.ceil(props.initialTotal / PAGE_SIZE))
const filteredSkins = computed(() => {
  if (activeFilter.value === 'all') return skins.value
  return skins.value.filter((skin) => skin.layout === activeFilter.value)
})
const previousPageUrl = computed(() => {
  if (staticPageNumber <= 1) return ''
  return staticPageNumber === 2 ? '/community' : `/community/page/${staticPageNumber - 1}`
})
const nextPageUrl = computed(() =>
  staticPageNumber < snapshotPageCount ? `/community/page/${staticPageNumber + 1}` : '',
)

function detailUrl(skin) {
  return detailCodeSet.has(String(skin.shareCode)) ? `/community/skins/${skin.shareCode}` : ''
}

async function fetchPage(pageNumber) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const url = `${API_BASE}/api/suyan/community/skins?page=${pageNumber}&limit=${PAGE_SIZE}`
    const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

async function loadFirst() {
  const hasSnapshot = skins.value.length > 0
  if (!hasSnapshot) loading.value = true
  errorMsg.value = ''
  refreshWarning.value = ''
  try {
    const data = await fetchPage(1)
    const list = Array.isArray(data?.skins) ? data.skins : []
    skins.value = list
    page.value = 1
    total.value = Number(data?.total ?? list.length)
    hasMore.value = skins.value.length < total.value
  } catch {
    if (hasSnapshot) {
      refreshWarning.value = '实时数据暂时不可用，当前展示最近一次构建快照'
      hasMore.value = skins.value.length < total.value
    } else {
      errorMsg.value = '皮肤列表加载失败，请稍后刷新重试'
      total.value = 0
      hasMore.value = false
    }
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (isArchivePage || loading.value || loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    const nextPage = page.value + 1
    const data = await fetchPage(nextPage)
    const list = Array.isArray(data?.skins) ? data.skins : []
    const existingCodes = new Set(skins.value.map((skin) => skin.shareCode))
    skins.value.push(...list.filter((skin) => !existingCodes.has(skin.shareCode)))
    page.value = nextPage
    total.value = Number(data?.total ?? total.value)
    hasMore.value = list.length > 0 && skins.value.length < total.value
  } catch {
    refreshWarning.value = '加载下一页失败，滚动到页面底部可再次尝试'
  } finally {
    loadingMore.value = false
  }
}

function bindObserver() {
  if (isArchivePage || observer || !('IntersectionObserver' in window)) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore()
    },
    { rootMargin: '240px' },
  )
  if (sentinelEl.value) observer.observe(sentinelEl.value)
}

onMounted(() => {
  if (!isArchivePage) loadFirst().then(bindObserver)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(resetTimer)
})

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // 剪贴板权限被拒时使用兼容路径。
    }
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  try {
    textarea.select()
    document.execCommand('copy')
    return true
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}

async function copyShareCode(code) {
  if (await writeClipboard(code)) {
    copiedCode.value = code
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => (copiedCode.value = ''), 1600)
  }
}
</script>

<template>
  <main class="sy-community">
    <!-- ============ 页头 ============ -->
    <section class="page-head container">
      <h1>皮肤社区<template v-if="isArchivePage"> · 第 {{ staticPageNumber }} 页</template></h1>
      <p class="sub">
        用皮肤码定制你的候选框——配色、字体、圆角，甚至自定义背景图片。这里陈列着社区创作者的作品，审核通过后实时可见。
      </p>
    </section>

    <!-- ============ 画廊 ============ -->
    <section class="container gallery" data-component="Skin Gallery">
      <h2 class="gallery-title">社区皮肤作品</h2>
      <p v-if="refreshWarning" class="refresh-warning" role="status">{{ refreshWarning }}</p>
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
        <article v-for="skin in filteredSkins" :key="skin.shareCode" class="skin-card" data-component="Skin Card">
          <component
            :is="detailUrl(skin) ? 'a' : 'div'"
            class="skin-img-wrap"
            :href="detailUrl(skin) || undefined"
            :aria-label="detailUrl(skin) ? '查看 ' + skin.skinName + ' 皮肤详情' : undefined"
          >
            <img :src="skin.previewUrl" :alt="skin.skinName + ' 皮肤预览'" loading="lazy" decoding="async" />
          </component>
          <div class="skin-meta">
            <div class="skin-title-row">
              <h3><a v-if="detailUrl(skin)" :href="detailUrl(skin)">{{ skin.skinName }}</a><template v-else>{{ skin.skinName }}</template></h3>
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
        </article>
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

      <!-- 实时页面继续支持无限滚动；普通链接为搜索引擎和无脚本访问提供分页。 -->
      <div v-if="!isArchivePage" ref="sentinelEl" class="skin-sentinel"></div>
      <div v-if="!isArchivePage && loadingMore" class="loading-more">
        <span class="spinner"></span>
        <p>加载更多中…</p>
      </div>
      <div v-else-if="!isArchivePage && skins.length && !hasMore && activeFilter === 'all'" class="loading-more">
        <p>已经到底啦，共 {{ total }} 款皮肤</p>
      </div>

      <nav v-if="snapshotPageCount > 1" class="pagination" aria-label="皮肤社区分页">
        <a v-if="previousPageUrl" class="pagination-prev" :href="previousPageUrl" rel="prev">← 上一页</a>
        <span>第 {{ staticPageNumber }} / {{ snapshotPageCount }} 页</span>
        <a v-if="nextPageUrl" class="pagination-next" :href="nextPageUrl" rel="next">下一页 →</a>
      </nav>
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
  </main>
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
.gallery-title { margin: 0 0 22px; font-size: clamp(24px, 3vw, 32px); font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; }
.refresh-warning { margin: -8px 0 18px; padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface-2); color: var(--muted); font-size: 13px; }
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
.pagination { margin-top: 32px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px; font-size: 13.5px; color: var(--faint); }
.pagination a { width: fit-content; padding: 8px 13px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--surface); color: var(--fg); font-weight: 600; }
.pagination-prev { grid-column: 1; justify-self: start; }
.pagination-next { grid-column: 3; justify-self: end; }
.pagination span { grid-column: 2; grid-row: 1; text-align: center; }
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
