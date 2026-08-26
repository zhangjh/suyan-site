<script setup>
import MarkdownIt from 'markdown-it'
import { onMounted, ref } from 'vue'

const markdown = new MarkdownIt({ html: false, linkify: true })
const latestVersion = ref('获取中...')
const releaseTitle = ref('')
const releaseNotesHtml = ref('')

function extractUpdateNotes(body) {
  const lines = body.split(/\r?\n/)
  const startIndex = lines.findIndex(line => /^#{1,6}\s+更新内容\s*$/.test(line))
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
    .then(res => res.json())
    .then(data => {
      if (data.tag_name) latestVersion.value = data.tag_name
      if (data.body) {
        const updateNotes = extractUpdateNotes(data.body)
        if (updateNotes) {
          releaseTitle.value = data.name || data.tag_name
          releaseNotesHtml.value = markdown.render(updateNotes)
        }
      }
    })
    .catch(err => console.error('Failed to fetch latest release:', err))
})
</script>

# 📥 下载素言 (SuYan)

请根据您的系统架构选择下载。目前素言支持 **Windows、macOS（Intel & ARM）、Ubuntu** 三大平台，完全免费开放。

## 💾 网盘下载

目前支持百度、夸克网盘，进入后选择最新版本目录，保存后随时下载：

<div style="display: flex; flex-direction: column; gap: 12px; margin: 24px 0; max-width: 480px;">
  <a href="https://pan.baidu.com/s/17edkwWljHl0OEbwT-sI7vA?pwd=7jw9" target="_blank" rel="noreferrer" onclick="if(window.LA) LA.track('download_baidu')" style="display: flex; align-items: center; justify-content: center; background-color: #06a7ff; color: white; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; min-height: 48px; box-sizing: border-box; width: 100%;">百度网盘下载 ({{ latestVersion }})</a>
  <a href="https://pan.quark.cn/s/e3396f6a7ac7" target="_blank" rel="noreferrer" onclick="if(window.LA) LA.track('download_quark')" style="display: flex; align-items: center; justify-content: center; background-color: #5d54e8; color: white; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; min-height: 48px; box-sizing: border-box; width: 100%;">夸克网盘下载 ({{ latestVersion }})</a>
</div>

<div v-if="releaseNotesHtml" style="margin: 32px 0; padding: 20px 24px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-border); border-radius: 12px;">
  <h3 style="margin: 0 0 16px;">更新内容 ({{ releaseTitle }})</h3>
  <div v-html="releaseNotesHtml"></div>
</div>

## ☕ 随缘赞助

素言承诺**永久免费、无广告、纯本地运行**。

如果您觉得这款软件为您节省了宝贵的时间，或者认同这种“回归纯粹”的产品理念，欢迎请开发者喝杯咖啡。您的每一分善意，都将用于维系官网服务器与下载带宽的成本。

<div style="display: flex; flex-direction: column; align-items: center; margin: 40px auto; padding: 40px 20px; background: var(--vp-c-bg-soft); border-radius: 20px; border: 1px solid var(--vp-c-border); max-width: 600px; text-align: center;">
  <div style="font-weight: 600; margin-bottom: 24px; color: var(--vp-c-text-1); font-size: 1.1em; letter-spacing: 1px;">微信扫码赞助</div>
  <div style="background: white; padding: 12px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
    <img src="/sponsor-code.png" alt="赞助二维码" width="240" style="border-radius: 8px; display: block;" />
  </div>
  <div style="margin-top: 24px; font-size: 0.95em; color: var(--vp-c-text-2); font-style: italic;">“ 感谢您的支持与信任 ”</div>
</div>

---

## 🛠️ 安装说明

- **Windows**: 下载 `.exe` 文件后双击运行，按提示安装即可。如遇 SmartScreen 拦截，请点击“更多信息” -> “仍要运行”。
- **MacOS**: 根据芯片类型选择对应版本（Apple Silicon 或 Intel），下载 `.pkg` 文件后双击安装。安装后请在“系统设置 -> 键盘 -> 输入法”中添加素言。
- **Ubuntu**: 下载 `.deb` 文件后，使用 `sudo dpkg -i SuYan-x.x.x-ubuntu.deb` 安装。安装后需在 Fcitx5 配置中启用素言。详见 [安装指南](/guide/install)。

如有安装问题，请参考 [安装指南](/guide/install)。
