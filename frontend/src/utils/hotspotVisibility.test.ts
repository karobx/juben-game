import { describe, expect, it } from 'vitest'
import type { Hotspot } from '../models/story'
import { getVisibleHotspots } from './hotspotVisibility'

const baseHotspots: Hotspot[] = [
  {
    id: 'visible_a',
    label: 'A',
    x: 0,
    y: 0,
    clue: { title: 'A', content: 'a' },
  },
  {
    id: 'hidden_b',
    label: 'B',
    x: 0,
    y: 0,
    hidden: true,
    clue: { title: 'B', content: 'b' },
  },
  {
    id: 'gated_c',
    label: 'C',
    x: 0,
    y: 0,
    requiresClueIds: ['visible_a'],
    clue: { title: 'C', content: 'c' },
  },
  {
    id: 'replay_d',
    label: '重訪 D',
    x: 0,
    y: 0,
    replayOnly: true,
    clue: { title: 'D', content: 'd' },
  },
]

describe('getVisibleHotspots', () => {
  it('shows only non-hidden hotspots without prerequisites on first play', () => {
    const ids = getVisibleHotspots(baseHotspots, [], 1).map((h) => h.id)
    expect(ids).toEqual(['visible_a'])
  })

  it('reveals gated hotspot after required clues collected', () => {
    const ids = getVisibleHotspots(baseHotspots, ['visible_a'], 1).map((h) => h.id)
    expect(ids).toEqual(['visible_a', 'gated_c'])
  })

  it('shows replay-only hotspots from second playthrough onward', () => {
    const ids = getVisibleHotspots(baseHotspots, [], 2).map((h) => h.id)
    expect(ids).toContain('replay_d')
  })

  it('never shows plain hidden hotspots without requiresClueIds', () => {
    const ids = getVisibleHotspots(baseHotspots, ['visible_a', 'gated_c'], 2).map((h) => h.id)
    expect(ids).not.toContain('hidden_b')
  })
})
