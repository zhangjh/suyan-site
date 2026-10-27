---
layout: page
title: 素言 SuYan — 回归输入的本质，免费开源、离线纯净的跨平台中文输入法
titleTemplate: ':title'
description: 素言输入法（SuYan）：免费、无广告的跨平台中文输入法，支持 Windows、macOS 与 Ubuntu。基于 RIME 引擎，输入核心完全离线，内置 AI 划词翻译与离线语音输入。
head:
  - - script
    - type: application/ld+json
    - |
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": "https://suyan.zhangjh.cn/#website",
            "url": "https://suyan.zhangjh.cn/",
            "name": "素言 SuYan",
            "alternateName": "素言输入法",
            "description": "素言输入法：拒绝臃肿与监控，内置生产力工具，越用越懂你的跨平台中英文输入法。",
            "inLanguage": "zh-CN",
            "publisher": { "@id": "https://suyan.zhangjh.cn/#publisher" }
          },
          {
            "@type": "WebPage",
            "@id": "https://suyan.zhangjh.cn/#webpage",
            "url": "https://suyan.zhangjh.cn/",
            "name": "素言 SuYan — 回归输入的本质，免费开源、离线纯净的跨平台中文输入法",
            "description": "素言输入法（SuYan）是一款免费、无广告的跨平台中文输入法，支持 Windows、macOS 与 Ubuntu。基于 RIME 引擎，输入核心完全离线，内置截图、剪贴板、AI 划词翻译等办公生产力工具，支持传统文本输入和在线、离线语音输入，支持自定义词库与候选框皮肤社区。",
            "inLanguage": "zh-CN",
            "isPartOf": { "@id": "https://suyan.zhangjh.cn/#website" },
            "about": { "@id": "https://suyan.zhangjh.cn/#software" }
          },
          {
            "@type": "Organization",
            "@id": "https://suyan.zhangjh.cn/#publisher",
            "name": "素言 SuYan",
            "url": "https://suyan.zhangjh.cn/",
            "logo": {
              "@type": "ImageObject",
              "url": "https://suyan.zhangjh.cn/logo.png",
              "width": 512,
              "height": 512
            },
            "sameAs": [
              "https://github.com/zhangjh/suyan-site"
            ]
          },
          {
            "@type": "SoftwareApplication",
            "@id": "https://suyan.zhangjh.cn/#software",
            "name": "素言输入法",
            "alternateName": "素言 SuYan",
            "applicationCategory": "UtilitiesApplication",
            "applicationSubCategory": "输入法",
            "operatingSystem": "Windows, macOS, Ubuntu",
            "description": "免费无广告的跨平台中英文输入法：基于 RIME 引擎，输入核心完全离线，支持自定义输入方案，内置 AI 划词翻译、离线语音输入、词库自由与生产力工具。",
            "publisher": {
              "@id": "https://suyan.zhangjh.cn/#publisher"
            },
            "downloadUrl": "https://suyan.zhangjh.cn/download",
            "softwareHelp": "https://suyan.zhangjh.cn/guide/install",
            "screenshot": "https://suyan.zhangjh.cn/image.png",
            "featureList": [
              "输入核心完全离线，按键流不联网",
              "AI 系统级划词翻译，覆盖所有桌面应用",
              "离线语音输入，音频不出本机",
              "端到端加密云同步，服务器仅作盲盒存储",
              "自定义词库与 RIME 输入方案（雾凇拼音、双拼、五笔 86、注音）",
              "候选框皮肤社区，复制皮肤码即可换装",
              "内置截图标注与剪贴板历史工具"
            ],
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "CNY",
              "url": "https://suyan.zhangjh.cn/download"
            },
            "inLanguage": "zh-CN"
          }
        ]
      }
---

<script setup>
import HomePage from './.vitepress/theme/components/HomePage.vue'
</script>

<HomePage />
