import { loadCommunityData } from '../../.vitepress/data/community'

export default {
  async paths() {
    const community = await loadCommunityData()
    const activeCodes = new Set(community.skins.map((skin) => skin.shareCode))
    return community.historicalSkins.map((skin) => ({
      params: { code: skin.shareCode, archived: !activeCodes.has(skin.shareCode), ...skin },
    }))
  },
}
