import type { Hotspot } from '../models/story'

/** 依當前場景收集狀態與重玩次數，決定哪些探索熱點可見 */
export function getVisibleHotspots(
  hotspots: Hotspot[],
  collectedClueIds: string[],
  playthroughCount: number,
): Hotspot[] {
  return hotspots.filter((hotspot) => {
    if (hotspot.replayOnly && playthroughCount < 2) {
      return false
    }
    const required = hotspot.requiresClueIds ?? []
    if (required.length > 0) {
      return required.every((id) => collectedClueIds.includes(id))
    }
    if (hotspot.hidden) {
      return false
    }
    return true
  })
}
