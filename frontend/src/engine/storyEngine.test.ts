import graph from '../fixtures/qin_han_unification.json'
import { describe, expect, it } from 'vitest'
import { StoryEngine } from './storyEngine'
import type { StoryGraph } from '../models/story'

const qinHan = graph as StoryGraph

const MAINLINE_CHOICES = [
  'c1_standardize',
  'c2_both_sides',
  'c3_inherit_reform',
  'c4_reforms',
  'c5_open_road',
  'c6_balance',
] as const

function playChoice(engine: StoryEngine, choiceId: string) {
  engine.advanceToDecide()
  engine.choose(choiceId)
  if (engine.getState().phase === 'reveal') {
    engine.confirmReveal()
  }
}

describe('StoryEngine — 秦漢大一統', () => {
  it('路徑 A：全程正史 → 通關結局', () => {
    const engine = new StoryEngine(qinHan)
    for (const choiceId of MAINLINE_CHOICES.slice(0, -1)) {
      playChoice(engine, choiceId)
      expect(engine.getState().status).toBe('playing')
      expect(engine.getState().phase).toBe('explore')
    }
    playChoice(engine, MAINLINE_CHOICES[MAINLINE_CHOICES.length - 1])
    const state = engine.getState()
    expect(state.currentSceneId).toBe('scene_ending')
    expect(state.route).toBe('mainline')
    expect(state.status).toBe('completed')
  })

  it('路徑 B：第一幕偏離 → 重返正史 → 通關', () => {
    const engine = new StoryEngine(qinHan)
    playChoice(engine, 'c1_local_customs')
    expect(engine.getState().route).toBe('deviation')
    playChoice(engine, 'c1_return')
    expect(engine.getState().route).toBe('mainline')

    for (const choiceId of MAINLINE_CHOICES.slice(1)) {
      playChoice(engine, choiceId)
    }
    expect(engine.getState().status).toBe('completed')
  })

  it('路徑 C：偏離後堅持 → 失敗', () => {
    const engine = new StoryEngine(qinHan)
    playChoice(engine, 'c1_local_customs')
    playChoice(engine, 'c1_persist')
    expect(engine.getState().status).toBe('failed')
  })

  it('choose 在有 reveal 時進入 reveal 階段，confirmReveal 後才推進', () => {
    const engine = new StoryEngine(qinHan)
    engine.advanceToDecide()
    engine.choose('c1_standardize')
    expect(engine.getState().phase).toBe('reveal')
    expect(engine.getState().currentSceneId).toBe('scene_1_qin_unify')
    engine.confirmReveal()
    expect(engine.getState().currentSceneId).toBe('scene_2_qin_tyranny')
    expect(engine.getState().phase).toBe('explore')
  })

  it('線索未集滿時無法進入抉擇階段', () => {
    const graphWithClues: StoryGraph = {
      ...qinHan,
      scenes: {
        ...qinHan.scenes,
        scene_1_qin_unify: {
          ...qinHan.scenes.scene_1_qin_unify,
          requiredClueCount: 1,
          hotspots: [
            {
              id: 'hs_test',
              label: '測試線索',
              x: 0,
              y: 0,
              clue: { title: '測試', content: '測試內容' },
            },
          ],
        },
      },
    }
    const engine = new StoryEngine(graphWithClues)
    expect(engine.canAdvanceToDecide()).toBe(false)
    engine.advanceToDecide()
    expect(engine.getState().phase).toBe('explore')
    engine.collectClue('hs_test')
    expect(engine.canAdvanceToDecide()).toBe(true)
    engine.advanceToDecide()
    expect(engine.getState().phase).toBe('decide')
  })

  it('可從指定場景開始', () => {
    const engine = new StoryEngine(qinHan, 'scene_2_qin_tyranny')
    expect(engine.getState().currentSceneId).toBe('scene_2_qin_tyranny')
  })

  it('對照任務未完成時無法進入抉擇階段', () => {
    const graphWithTask: StoryGraph = {
      title: '測試',
      startSceneId: 's1',
      scenes: {
        s1: {
          id: 's1',
          route: 'mainline',
          narrative: 'n',
          requiredClueCount: 2,
          explorationTask: {
            type: 'categorize',
            title: '對照',
            categories: [
              { id: 'a', label: '甲', acceptedClueIds: ['c1'] },
              { id: 'b', label: '乙', acceptedClueIds: ['c2'] },
            ],
          },
          hotspots: [
            { id: 'c1', label: '1', x: 10, y: 10, clue: { title: '一', content: '1' } },
            { id: 'c2', label: '2', x: 20, y: 20, clue: { title: '二', content: '2' } },
          ],
          choices: [{ id: 'ch1', label: '選', type: 'historical', nextSceneId: 's2' }],
        },
        s2: {
          id: 's2',
          route: 'mainline',
          narrative: 'end',
          choices: [],
        },
      },
    }
    const engine = new StoryEngine(graphWithTask)
    engine.collectClue('c1')
    engine.collectClue('c2')
    expect(engine.canAdvanceToDecide()).toBe(false)
    engine.assignClueToCategory('c1', 'a')
    expect(engine.canAdvanceToDecide()).toBe(false)
    engine.assignClueToCategory('c2', 'b')
    expect(engine.canAdvanceToDecide()).toBe(true)
    engine.advanceToDecide()
    expect(engine.getState().phase).toBe('decide')
  })
})
