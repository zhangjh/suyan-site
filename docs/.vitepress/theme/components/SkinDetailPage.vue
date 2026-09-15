<script setup>
import { onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  skin: { type: Object, required: true },
})

const copied = ref(false)
let resetTimer

async function copyShareCode() {
  const code = String(props.skin.shareCode ?? '')
  try {
    await navigator.clipboard.writeText(code)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = code
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
  copied.value = true
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => (copied.value = false), 1600)
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>

<template>
  <main class="skin-detail">
    <nav class="breadcrumbs" aria-label="面包屑">
      <a href="/">首页</a><span aria-hidden="true">/</span><a href="/community">皮肤社区</a><span aria-hidden="true">/</span><span>{{ skin.skinName }}</span>
    </nav>
    <div class="detail-grid">
      <div class="preview">
        <img :src="skin.previewUrl" :alt="skin.skinName + ' 素言输入法皮肤预览'" decoding="async" />
      </div>
      <div class="detail-copy">
        <p class="eyebrow">Community Skin · 社区皮肤</p>
        <h1>{{ skin.skinName }}</h1>
        <p class="author">由 <strong>{{ skin.authorName }}</strong> 分享 · {{ skin.layout === 'vertical' ? '竖排布局' : '横排布局' }}</p>
        <p v-if="skin.archived" class="archived" role="status">这款皮肤已从社区列表下架，此页面作为历史分享地址保留。</p>
        <p class="description">复制下方分享码，在素言的「皮肤设置 → 导入分享码」中粘贴，即可应用这款候选框皮肤。</p>
        <div class="code-row">
          <code>{{ skin.shareCode }}</code>
          <button type="button" :aria-label="'复制皮肤分享码 ' + skin.shareCode" @click="copyShareCode">
            {{ copied ? '已复制' : '复制分享码' }}
          </button>
        </div>
        <a class="back-link" href="/community">← 浏览更多社区皮肤</a>
      </div>
    </div>
  </main>
</template>

<style scoped>
.skin-detail { max-width: 1120px; margin: 0 auto; padding: calc(var(--vp-nav-height) + 42px) 24px 32px; color: var(--fg); }
.breadcrumbs { display: flex; align-items: center; gap: 9px; margin-bottom: 28px; font-size: 13px; color: var(--faint); }
.breadcrumbs a { color: var(--muted); text-decoration: none; }
.breadcrumbs a:hover { color: var(--primary); }
.detail-grid { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(300px, .7fr); gap: clamp(32px, 6vw, 72px); align-items: center; }
.preview { aspect-ratio: 16 / 10; display: grid; place-items: center; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface-2); box-shadow: var(--shadow-md); }
.preview img { display: block; max-width: 92%; max-height: 92%; object-fit: contain; }
.eyebrow { margin: 0 0 14px; color: var(--faint); font-family: var(--sy-font-mono); font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
h1 { margin: 0; font-size: clamp(32px, 5vw, 48px); line-height: 1.18; letter-spacing: -.015em; }
.author { margin-top: 12px; color: var(--muted); font-size: 14px; }
.author strong { color: var(--fg); }
.archived { margin-top: 20px; padding: 10px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--surface-2); color: var(--muted); font-size: 13px; line-height: 1.6; }
.description { margin-top: 28px; color: var(--muted); font-size: 15px; line-height: 1.8; }
.code-row { display: flex; gap: 10px; margin-top: 22px; }
.code-row code { flex: 1; padding: 11px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface-2); color: var(--fg); font-family: var(--sy-font-mono); text-align: center; }
.code-row button { padding: 0 18px; border: 1px solid var(--primary); border-radius: var(--radius-sm); background: var(--primary); color: #fff; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
.back-link { display: inline-block; margin-top: 28px; color: var(--muted); font-size: 14px; font-weight: 600; text-decoration: none; }
.back-link:hover { color: var(--primary); }
@media (max-width: 760px) {
  .detail-grid { grid-template-columns: 1fr; }
  .skin-detail { padding-top: calc(var(--vp-nav-height) + 28px); }
}
</style>
