---
layout: page
title: 皮肤社区 — 候选框皮肤分享与下载
description: 素言输入法皮肤社区：浏览社区创作者分享的横排与竖排候选框皮肤，查看预览图、复制皮肤分享码即可一键换装，也可分享自己的皮肤作品。
---

<script setup>
import CommunityPage from './.vitepress/theme/components/CommunityPage.vue'
import { data as communityData } from './community.data'
</script>

<CommunityPage
  :initial-skins="communityData.skins.slice(0, 24)"
  :initial-total="communityData.total"
  :snapshot-generated-at="communityData.generatedAt"
  :detail-codes="communityData.historicalSkins.map((skin) => skin.shareCode)"
/>
