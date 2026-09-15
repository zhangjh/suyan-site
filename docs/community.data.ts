import { defineLoader } from 'vitepress'
import { loadCommunityData, type CommunityData } from './.vitepress/data/community'

declare const data: CommunityData
export { data }

export default defineLoader({
  async load(): Promise<CommunityData> {
    return loadCommunityData()
  },
})
