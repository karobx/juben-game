import { describe, expect, it } from 'vitest'
import { classifySceneVisual } from './sceneVisualClassifier'

describe('classifySceneVisual', () => {
  it('matches great wall for qin tyranny scene narrative', () => {
    const narrative =
      '【秦 · 統一後】長城、馳道、阿房宮動員數十萬民夫；焚書坑儒令天下噤聲。至陳勝、吳廣揭竿，劉邦、項羽逐鹿——秦僅傳二世便亡。你如何評價秦始皇？'

    expect(classifySceneVisual(narrative, undefined, ['古風', '歷史繪卷'])).toEqual({
      type: 'great_wall',
      label: '長城修筑',
    })
  })

  it('matches court for unification debate scene', () => {
    const narrative =
      '【秦 · 公元前221年】六國歸一，嬴政稱「始皇帝」。丞相李斯奏請：須行書同文、車同軌、統一度量衡，方能使政令從咸陽直達天下。你身為新朝屬官，須在「統一標準」與「舊俗分治」之間表態。'

    expect(classifySceneVisual(narrative)).toEqual({
      type: 'court',
      label: '朝堂決斷',
    })
  })

  it('falls back to landscape when no motif is found', () => {
    expect(classifySceneVisual('一段沒有關鍵意象的過場描述。')).toEqual({
      type: 'landscape',
      label: '山河遠望',
    })
  })

  it('matches pre-qin yangshao for reader narrative', () => {
    const narrative =
      '你翻開課本，來到【中國多元一體文化的起源】。公元前5000 年至公元前3000 年，出現於黃河流域，遺蹟於1921 年在河南仰韶村發現，因此命名仰韶文化。'

    expect(classifySceneVisual(narrative)).toEqual({
      type: 'landscape',
      label: '史前聚落',
    })
  })

  it('matches western zhou enfeoffment for feudal chapter', () => {
    const narrative =
      '你翻開課本，來到【西周封建制度】。周武王分封諸侯，以宗法與采邑維繫天下秩序。'

    expect(classifySceneVisual(narrative)).toEqual({
      type: 'unification',
      label: '西周封建',
    })
  })

  it('prefers xianyang palace narrative over silk-road period prompt', () => {
    const narrative =
      '以秦始皇的視角，公元前237年，你站在咸陽宮中。秦王政剛採納李斯建議，準備併滅六國。殿上議論紛紛——'
    const prompt = '場景：西域、咸陽，=== 秦朝的統一及其統治措施與影響 ==='

    expect(classifySceneVisual(narrative, prompt)).toEqual({
      type: 'court',
      label: '朝堂決斷',
    })
  })
})
