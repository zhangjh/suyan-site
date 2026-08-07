---
title: 皮肤社区
---

<script setup>
import { ref } from 'vue'
import { data } from './community.data.mts'

const layoutLabels = { horizontal: '横排', vertical: '竖排' }

const copiedCode = ref('')
let resetTimer = null

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
  ta.style.top = '-1000px'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch (err) {
    ok = false
  }
  document.body.removeChild(ta)
  return ok
}

async function copyShareCode(code) {
  if (await writeClipboard(code)) {
    copiedCode.value = code
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => { copiedCode.value = '' }, 1800)
    return
  }
  window.prompt('自动复制失败，请手动复制分享码：', code)
}
</script>

# 🎨 皮肤社区

这里是素言用户共享的自定义皮肤。看中哪个，复制它的分享码，在客户端粘贴即可用起来。

<div class="community-page">

<style>
.community-page .skin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin: 24px 0;
}
.community-page .skin-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  display: flex;
  flex-direction: column;
}
.community-page .skin-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}
.community-page .skin-card .skin-img-wrap {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  background: var(--vp-c-bg);
}
.community-page .skin-card img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}
.community-page .skin-card .skin-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 12px 0 0;
  line-height: 1.4;
  word-break: break-word;
}
.community-page .skin-card .skin-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  color: var(--vp-c-text-3);
  font-size: 0.85em;
  min-width: 0;
}
.community-page .skin-card .skin-author {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.community-page .skin-card .skin-layout {
  flex-shrink: 0;
  padding: 1px 8px;
  border: 1px solid var(--vp-c-border);
  border-radius: 999px;
  color: var(--vp-c-text-2);
}
.community-page .skin-card .skin-code-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}
.community-page .skin-card .skin-code {
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  font-family: var(--vp-font-family-mono);
  font-size: 0.95em;
  letter-spacing: 1px;
  text-align: center;
  color: var(--vp-c-text-1);
}
.community-page .skin-card .skin-copy {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-brand);
  background: transparent;
  color: var(--vp-c-brand);
  font-size: 0.85em;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.community-page .skin-card .skin-copy:hover {
  background: var(--vp-c-brand);
  color: #fff;
}
.community-page .skin-card .skin-copy.copied {
  background: var(--vp-c-brand);
  color: #fff;
}
.community-page .skin-empty {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 40px 24px;
  margin: 24px 0;
  text-align: center;
  color: var(--vp-c-text-2);
}
.community-page .skin-empty p {
  margin: 6px 0 0;
  font-size: 0.9em;
  color: var(--vp-c-text-3);
}
</style>

<div v-if="data.skins.length" class="skin-grid">
  <div v-for="skin in data.skins" :key="skin.shareCode" class="skin-card">
    <div class="skin-img-wrap">
      <img :src="skin.previewUrl" :alt="skin.skinName + ' 皮肤预览'" loading="lazy">
    </div>
    <div class="skin-name">{{ skin.skinName }}</div>
    <div class="skin-meta">
      <span class="skin-author">by {{ skin.authorName }}</span>
      <span class="skin-layout">{{ layoutLabels[skin.layout] }}</span>
    </div>
    <div class="skin-code-row">
      <code class="skin-code">{{ skin.shareCode }}</code>
      <button
        type="button"
        class="skin-copy"
        :class="{ copied: copiedCode === skin.shareCode }"
        :title="'复制分享码 ' + skin.shareCode"
        :aria-label="'复制 ' + skin.skinName + ' 的分享码 ' + skin.shareCode"
        @click="copyShareCode(skin.shareCode)"
      >{{ copiedCode === skin.shareCode ? '已复制' : '复制' }}</button>
    </div>
  </div>
</div>
<div v-else class="skin-empty">
  <strong>还没有已上架的共享皮肤</strong>
  <p>共享皮肤需要审核通过后才会出现在这里，稍后再来看看。</p>
  <p>也欢迎你在客户端的「皮肤设置 → 分享皮肤」分享自己的作品。</p>
</div>

</div>

## 📥 如何导入

1. 复制想用的皮肤的**分享码**
2. 打开**素言**
3. 进入**皮肤设置**
4. 点击**导入分享码**
5. **粘贴**分享码并确认

导入后的皮肤会出现在皮肤下拉列表里，选中即可应用。皮肤中的自定义字体会替换为系统默认字体。
