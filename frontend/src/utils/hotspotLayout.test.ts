import { describe, expect, it } from 'vitest'
import type { Hotspot } from '../models/story'
import { resolveHotspotPosition } from './hotspotLayout'

function hotspot(partial: Partial<Hotspot> & Pick<Hotspot, 'id'>): Hotspot {
  return {
    label: partial.label ?? partial.id,
    x: partial.x ?? 0,
    y: partial.y ?? 0,
    clue: partial.clue ?? { title: 't', content: 'c' },
    ...partial,
  }
}

describe('resolveHotspotPosition', () => {
  it('使用已設定的 x/y', () => {
    expect(resolveHotspotPosition(hotspot({ id: 'a', x: 52, y: 42 }), 0)).toEqual({
      x: 52,
      y: 42,
    })
  })

  it('x/y 為 0 時依索引 fallback', () => {
    const first = resolveHotspotPosition(hotspot({ id: 'a' }), 0)
    const second = resolveHotspotPosition(hotspot({ id: 'b' }), 1)
    expect(first).not.toEqual(second)
    expect(first.x).toBeGreaterThan(0)
  })
})
