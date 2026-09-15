import { COMMUNITY_PAGE_SIZE, loadCommunityData } from '../../.vitepress/data/community'

export default {
  async paths() {
    const community = await loadCommunityData()
    const pageCount = Math.ceil(community.total / COMMUNITY_PAGE_SIZE)
    return Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => {
      const page = index + 2
      const start = (page - 1) * COMMUNITY_PAGE_SIZE
      return {
        params: {
          page: String(page),
          skins: community.skins.slice(start, start + COMMUNITY_PAGE_SIZE),
          total: community.total,
          pageCount,
          generatedAt: community.generatedAt,
          detailCodes: community.historicalSkins.map((skin) => skin.shareCode),
        },
      }
    })
  },
}
