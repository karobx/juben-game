import { describe, expect, it } from 'vitest'
import type { Scene } from '../models/story'
import {
  canUseFirstPersonPerspective,
  isReaderPerspectiveMode,
  resolveSceneNarrative,
} from './playerPerspective'

const hanScene: Scene = {
  id: 'scene_3',
  route: 'mainline',
  narrative: '【西漢的建立】劉邦戰勝項羽。',
  perspectiveEra: 'han_west',
  narrativeFirstPerson:
    '以{playerName}的視角，垓下之戰塵埃落定。劉邦戰勝項羽，在長安稱帝。',
  narrativeAsReader:
    '你翻開課本，來到【西漢的建立】。始皇已崩多年；史書載，垓下之戰後劉邦稱帝。你要理解：新朝該用什麼治國之道？',
  choices: [],
}

describe('playerPerspective', () => {
  it('秦始皇在西漢章節使用研讀旁白，避免與劉邦同場', () => {
    expect(canUseFirstPersonPerspective('秦始皇', 'han_west')).toBe(false)
    expect(isReaderPerspectiveMode(hanScene, '秦始皇')).toBe(true)
    const text = resolveSceneNarrative(hanScene, '秦始皇')
    expect(text).toContain('翻開課本')
    expect(text).not.toContain('以秦始皇的視角')
    expect(text).not.toMatch(/劉邦戰勝.*你/)
  })

  it('劉邦在西漢章節可使用第一人稱', () => {
    expect(canUseFirstPersonPerspective('劉邦', 'han_west')).toBe(true)
    const text = resolveSceneNarrative(hanScene, '劉邦')
    expect(text).toContain('以劉邦的視角')
  })

  it('秦始皇在秦代章節可使用第一人稱', () => {
    const qinScene: Scene = {
      ...hanScene,
      id: 'scene_1',
      perspectiveEra: 'qin',
      narrativeFirstPerson: '以{playerName}的視角，你站在咸陽宮中。',
      narrativeAsReader: '你翻開課本，來到秦代統一。',
    }
    expect(resolveSceneNarrative(qinScene, '秦始皇')).toContain('以秦始皇的視角')
  })
})
