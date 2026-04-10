# 📥 下载素言 (SuYan)

请根据您的系统架构选择下载。目前素言完全免费开放，推荐使用**直链极速下载**。

## ⬇️ 极速下载 (推荐🚀)

基于 GitHub 加速镜像，点击即下，无需登录。

<div style="display: flex; flex-wrap: wrap; gap: 16px; margin: 24px 0;">
  <a id="btn-dl-win" href="https://github.com/zhangjh/suyan-site/releases/latest" 
     onclick="if(window.LA) LA.track('download_click', {os: 'windows'})" 
     style="display: inline-flex; align-items: center; justify-content: center; min-width: 240px; background-color: var(--vp-c-brand); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    💻 Windows 版下载 (获取中...)
  </a>
  
  <a id="btn-dl-mac" href="https://github.com/zhangjh/suyan-site/releases/latest" 
     onclick="if(window.LA) LA.track('download_click', {os: 'macos'})" 
     style="display: inline-flex; align-items: center; justify-content: center; min-width: 240px; background-color: var(--vp-c-brand); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    🍎 macOS 版下载 (获取中...)
  </a>
</div>

<script>
if (typeof window !== 'undefined') {
  fetch('https://api.github.com/repos/zhangjh/suyan-site/releases/latest')
    .then(res => res.json())
    .then(data => {
      if (data.assets && data.assets.length > 0) {
        const mirror = 'https://gh-proxy.org/';
        const winBtn = document.getElementById('btn-dl-win');
        const macBtn = document.getElementById('btn-dl-mac');
        
        let winUrl = '', macUrl = '';
        
        data.assets.forEach(asset => {
          const name = asset.name.toLowerCase();
          if (name.includes('windows') && name.endsWith('.exe')) winUrl = mirror + asset.browser_download_url;
          if (name.includes('macos') && name.endsWith('.pkg')) macUrl = mirror + asset.browser_download_url;
        });
        
        if (winBtn && winUrl) {
          winBtn.href = winUrl;
          winBtn.innerText = '💻 Windows 版下载 (' + data.tag_name + ')';
        }
        if (macBtn && macUrl) {
          macBtn.href = macUrl;
          macBtn.innerText = '🍎 macOS 版下载 (' + data.tag_name + ')';
        }
      }
    })
    .catch(err => console.error('Failed to fetch latest release:', err));
}
</script>

---

## ☕ 随缘赞助

素言承诺**永久免费、无广告、纯本地运行**。

如果您觉得这款软件为您节省了宝贵的时间，或者认同这种“回归纯粹”的产品理念，欢迎请开发者喝杯咖啡。您的每一分善意，都将用于维系官网服务器与下载带宽的成本。

<div style="display: flex; flex-direction: column; align-items: center; margin: 40px 0; padding: 30px; background: var(--vp-c-bg-soft); border-radius: 16px; border: 1px solid var(--vp-c-border);">
  <div style="font-weight: 600; margin-bottom: 20px; color: var(--vp-c-text-1);">微信扫码赞助</div>
  <img src="/sponsor-code.png" alt="赞助二维码" width="280" style="border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); border: 4px solid white;" />
  <div style="margin-top: 16px; font-size: 0.9em; color: var(--vp-c-text-2);">感谢您的支持与信任</div>
</div>

---

## 🛠️ 安装说明

- **Windows**: 下载 `.exe` 文件后双击运行，按提示安装即可。如遇 SmartScreen 拦截，请点击“更多信息” -> “仍要运行”。
- **macOS**: 下载 `.pkg` 文件后双击安装。安装后请在“系统设置 -> 键盘 -> 输入法”中添加素言。

如有安装问题，请参考 [安装指南](/guide/install)。
