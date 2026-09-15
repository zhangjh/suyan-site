import { defineLoader } from 'vitepress'
import { loadReleaseNotes, type ReleaseNotesData } from './.vitepress/data/release'

declare const data: ReleaseNotesData
export { data }

export default defineLoader({
  async load(): Promise<ReleaseNotesData> {
    return loadReleaseNotes()
  },
})
