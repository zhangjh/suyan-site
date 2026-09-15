---
layout: page
title: 皮肤社区
description: 素言输入法皮肤社区：浏览与分享社区创作的候选框皮肤，复制皮肤码即刻换装。
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
