---
layout: page
---

<script setup>
import CommunityPage from '../../.vitepress/theme/components/CommunityPage.vue'
</script>

<CommunityPage
  :initial-skins="$params.skins"
  :initial-total="$params.total"
  :snapshot-generated-at="$params.generatedAt"
  :static-page="$params.page"
  :page-count="$params.pageCount"
  :detail-codes="$params.detailCodes"
/>
