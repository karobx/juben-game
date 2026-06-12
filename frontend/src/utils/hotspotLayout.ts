import type { Hotspot } from '../models/story'

/** 座標缺失時依索引輪換語意區，避免光點重疊 */
const ZONE_PRESETS: Array<{ x: number; y: number }> = [
  { x: 52, y: 42 },
  { x: 28, y: 48 },
  { x: 68, y: 55 },
  { x: 38, y: 72 },
  { x: 78, y: 38 },
  { x: 12, y: 62 },
  { x: 85, y: 68 },
  { x: 50, y: 28 },
  { x: 22, y: 58 },
]

export function resolveHotspotPosition(
  hotspot: Hotspot,
  index: number,
): { x: number; y: number } {
  if (hotspot.x > 0 && hotspot.y > 0) {
    return { x: hotspot.x, y: hotspot.y }
  }
  const preset = ZONE_PRESETS[index % ZONE_PRESETS.length]
  return { x: preset.x, y: preset.y }
}
