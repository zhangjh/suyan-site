const API_URL = 'https://api-verse.zhangjh.cn/api/suyan/community/skins?limit=200'
const TIMEOUT_MS = 15000

export interface CommunitySkin {
  shareCode: string
  skinName: string
  authorName: string
  layout: 'horizontal' | 'vertical'
  hasBackgroundImage: boolean
  previewUrl: string
  createdAt: number
}

export interface CommunityData {
  skins: CommunitySkin[]
}

declare const data: CommunityData
export { data }

export default {
  async load(): Promise<CommunityData> {
    // 后端临时不可达不能卡住整站发布，任何异常都退化为空列表
    try {
      const res = await fetch(API_URL, { signal: AbortSignal.timeout(TIMEOUT_MS) })
      if (!res.ok) {
        console.warn(`[community.data] 抓取社区皮肤失败：HTTP ${res.status}`)
        return { skins: [] }
      }
      const json = await res.json()
      if (!json || !Array.isArray(json.skins)) {
        console.warn('[community.data] 社区皮肤响应格式异常')
        return { skins: [] }
      }
      return { skins: json.skins as CommunitySkin[] }
    } catch (err) {
      console.warn('[community.data] 抓取社区皮肤异常：', (err as Error).message)
      return { skins: [] }
    }
  }
}
