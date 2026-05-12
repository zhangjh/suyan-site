# 📥 下载素言 (SuYan)

请根据您的系统架构选择下载。目前素言完全免费开放，推荐使用**直链极速下载**。

## ⬇️ 极速下载 (推荐🚀)

基于 GitHub 加速镜像，点击即下，无需登录。

<div style="display: flex; flex-direction: column; gap: 16px; margin: 32px 0; max-width: 480px;">
  <a id="btn-dl-win" href="https://github.com/zhangjh/suyan-site/releases/latest" onclick="if(window.LA) LA.track('download_win')" style="display: flex; align-items: center; justify-content: center; background-color: var(--vp-c-brand); color: white; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; min-height: 56px; box-sizing: border-box; width: 100%;">Windows 版下载 (获取中...)</a>
  <a id="btn-dl-mac-arm" href="https://github.com/zhangjh/suyan-site/releases/latest" onclick="if(window.LA) LA.track('download_mac_arm')" style="display: flex; align-items: center; justify-content: center; background-color: var(--vp-c-brand); color: white; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; min-height: 56px; box-sizing: border-box; width: 100%;">MacOS 版下载 - Apple Silicon (获取中...)</a>
  <a id="btn-dl-mac-intel" href="https://github.com/zhangjh/suyan-site/releases/latest" onclick="if(window.LA) LA.track('download_mac_intel')" style="display: flex; align-items: center; justify-content: center; background-color: var(--vp-c-brand); color: white; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; min-height: 56px; box-sizing: border-box; width: 100%;">MacOS 版下载 - Intel (获取中...)</a>
</div>

<script>
if (typeof window !== 'undefined') {
  fetch('https://api.github.com/repos/zhangjh/suyan-site/releases/latest')
    .then(res => res.json())
    .then(data => {
      if (data.assets && data.assets.length > 0) {
        const mirror = 'https://gh-proxy.org/';
        const winBtn = document.getElementById('btn-dl-win');
        const macArmBtn = document.getElementById('btn-dl-mac-arm');
        const macIntelBtn = document.getElementById('btn-dl-mac-intel');
        
        let winUrl = '', macArmUrl = '', macIntelUrl = '';
        
        data.assets.forEach(asset => {
          const name = asset.name.toLowerCase();
          if (name.includes('windows') && name.endsWith('.exe')) winUrl = mirror + asset.browser_download_url;
          if (name.includes('macos') && name.includes('arm64') && name.endsWith('.pkg')) macArmUrl = mirror + asset.browser_download_url;
          if (name.includes('macos') && name.includes('x86_64') && name.endsWith('.pkg')) macIntelUrl = mirror + asset.browser_download_url;
        });
        
        if (winBtn && winUrl) {
          winBtn.href = winUrl;
          winBtn.innerText = 'Windows 版下载 (' + data.tag_name + ')';
        }
        if (macArmBtn && macArmUrl) {
          macArmBtn.href = macArmUrl;
          macArmBtn.innerText = 'MacOS 版下载 - Apple Silicon (' + data.tag_name + ')';
        }
        if (macIntelBtn && macIntelUrl) {
          macIntelBtn.href = macIntelUrl;
          macIntelBtn.innerText = 'MacOS 版下载 - Intel (' + data.tag_name + ')';
        }
      }
    })
    .catch(err => console.error('Failed to fetch latest release:', err));
}
</script>

---

## 💾 网盘下载

下载太慢？试试网盘，保存后随时下载：

<div style="display: flex; flex-direction: column; gap: 12px; margin: 24px 0; max-width: 480px;">
  <a href="https://pan.baidu.com/s/17edkwWljHl0OEbwT-sI7vA?pwd=7jw9" target="_blank" rel="noreferrer" onclick="if(window.LA) LA.track('download_baidu')" style="display: flex; align-items: center; justify-content: center; background-color: #06a7ff; color: white; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; min-height: 48px; box-sizing: border-box; width: 100%;">百度网盘下载</a>
  <a href="https://pan.quark.cn/s/e3396f6a7ac7" target="_blank" rel="noreferrer" onclick="if(window.LA) LA.track('download_quark')" style="display: flex; align-items: center; justify-content: center; background-color: #5d54e8; color: white; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; min-height: 48px; box-sizing: border-box; width: 100%;">夸克网盘下载</a>
</div>

---

## 🌐 官方下载 (GitHub)

如需下载历史版本，请访问 GitHub 官方仓库：

- <a href="https://github.com/zhangjh/suyan-site/releases/latest" target="_blank" rel="noreferrer" onclick="if(window.LA) LA.track('download_github')">前往 GitHub Releases 页面</a>

> **提示**：GitHub Release 页面可能受网络环境影响，若无法访问，请使用科学上网或多次刷新。下载时请认准带有版本号的 `.exe` (Win) 或 `.pkg` (Mac) 文件。

---

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

如有安装问题，请参考 [安装指南](/guide/install)。
