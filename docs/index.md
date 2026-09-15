---
layout: page
title: 素言 SuYan — 回归输入的本质
titleTemplate: ':title'
description: 拒绝臃肿与监控 · 内置生产力工具 · 越用越懂你的跨平台中英文输入法
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
            "inLanguage": "zh-CN"
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
            "operatingSystem": "Windows, macOS, Ubuntu",
            "description": "免费无广告的跨平台中英文输入法：基于 RIME 引擎，输入核心完全离线，内置 AI 划词翻译、离线语音输入、词库自由与生产力工具。",
            "publisher": {
              "@id": "https://suyan.zhangjh.cn/#publisher"
            },
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