import type { Hotspot, StoryGraph } from '../models/story'

export const CODEX_CARDS_PER_CHAPTER = 16

export type CodexCardCategory = 'mainline' | 'deviation' | 'replay' | 'milestone' | 'secret'

export interface CodexCardDef {
  id: string
  title: string
  content: string
  speaker?: string
  category: CodexCardCategory
  chapter: number
}

export interface ChapterMeta {
  chapter: number
  title: string
  sceneId: string
  deviationId: string
  nextSceneId: string
  nextAutoCardId: string
  secretCardIds: [string, string, string]
}

export const QIN_HAN_CHAPTERS: ChapterMeta[] = [
  {
    chapter: 1,
    title: '秦朝統一',
    sceneId: 'scene_1',
    deviationId: 'deviation_1',
    nextSceneId: 'scene_2',
    nextAutoCardId: 'ch1_aut_scene2',
    secretCardIds: ['ch1_secret_taishi_1', 'ch1_secret_taishi_2', 'ch1_secret_taishi_3'],
  },
  {
    chapter: 2,
    title: '秦朝滅亡與楚漢相爭',
    sceneId: 'scene_2',
    deviationId: 'deviation_2',
    nextSceneId: 'scene_3',
    nextAutoCardId: 'ch2_aut_scene3',
    secretCardIds: ['ch2_secret_1', 'ch2_secret_2', 'ch2_secret_3'],
  },
  {
    chapter: 3,
    title: '西漢的建立',
    sceneId: 'scene_3',
    deviationId: 'deviation_3',
    nextSceneId: 'scene_4',
    nextAutoCardId: 'ch3_aut_scene4',
    secretCardIds: ['ch3_secret_1', 'ch3_secret_2', 'ch3_secret_3'],
  },
  {
    chapter: 4,
    title: '漢武帝的文治與武功',
    sceneId: 'scene_4',
    deviationId: 'deviation_4',
    nextSceneId: 'scene_5',
    nextAutoCardId: 'ch4_aut_scene5',
    secretCardIds: ['ch4_secret_1', 'ch4_secret_2', 'ch4_secret_3'],
  },
  {
    chapter: 5,
    title: '昭宣以後與漢朝衰亡',
    sceneId: 'scene_5',
    deviationId: 'deviation_5',
    nextSceneId: 'scene_6',
    nextAutoCardId: 'ch5_aut_scene6',
    secretCardIds: ['ch5_secret_1', 'ch5_secret_2', 'ch5_secret_3'],
  },
  {
    chapter: 6,
    title: '兩漢通西域',
    sceneId: 'scene_6',
    deviationId: 'deviation_6',
    nextSceneId: 'scene_7',
    nextAutoCardId: 'ch6_aut_scene7',
    secretCardIds: ['ch6_secret_1', 'ch6_secret_2', 'ch6_secret_3'],
  },
  {
    chapter: 7,
    title: '道教的形成',
    sceneId: 'scene_7',
    deviationId: 'deviation_7',
    nextSceneId: 'scene_8',
    nextAutoCardId: 'ch7_aut_scene8',
    secretCardIds: ['ch7_secret_1', 'ch7_secret_2', 'ch7_secret_3'],
  },
  {
    chapter: 8,
    title: '科技發明',
    sceneId: 'scene_8',
    deviationId: 'deviation_8',
    nextSceneId: 'scene_8_end',
    nextAutoCardId: 'ch8_aut_complete',
    secretCardIds: ['ch8_secret_1', 'ch8_secret_2', 'ch8_secret_3'],
  },
]

/** 非熱點來源的圖鑑卡（里程碑 + 秘藏） */
export const META_CODEX_CARDS: Record<string, Omit<CodexCardDef, 'id'>> = {
  ch1_aut_historical: {
    title: '正史詔書節錄',
    content: '史書載：秦始皇確實推行書同文、車同軌、統一度量衡，奠定大一統基礎。',
    category: 'milestone',
    chapter: 1,
  },
  ch1_aut_divergent: {
    title: '偏離記注',
    content: '若暫緩改革，各郡舊制將使中央政令難以貫徹——此路史書無載。',
    category: 'milestone',
    chapter: 1,
  },
  ch1_aut_return: {
    title: '返正史札記',
    content: '偏離後仍可依課本修正理解，重返統一措施的主線。',
    category: 'milestone',
    chapter: 1,
  },
  ch1_aut_scene2: {
    title: '入第二章門檻',
    content: '你完成第一章抉擇，即將進入「秦朝滅亡與楚漢相爭」。',
    category: 'milestone',
    chapter: 1,
  },
  ch1_secret_taishi_1: {
    title: '太史令職掌',
    content: '太史令掌記載詔令與制度變遷，使「一統」不止於地圖，也留於簡牘。',
    speaker: '太史令',
    category: 'secret',
    chapter: 1,
  },
  ch1_secret_taishi_2: {
    title: '留檔之議',
    content: '你曾請求將殿上議論留檔。史官注：此為後世理解秦制的重要線索。',
    category: 'secret',
    chapter: 1,
  },
  ch1_secret_taishi_3: {
    title: '第一章完卷',
    content: '第一章史料已集齊。重玩時仍可尋找 replay 線索，並在後續章節解鎖新卡。',
    category: 'secret',
    chapter: 1,
  },
  ch2_aut_historical: {
    title: '秦亡評論',
    content: '史學共識：始皇有統一之大功，亦有苛法濫役、焚書坑儒之過。',
    category: 'milestone',
    chapter: 2,
  },
  ch2_aut_divergent: {
    title: '偏離評論',
    content: '只讚功或只歸咎二世，都無法解釋陳勝吳廣起事前的民怨積累。',
    category: 'milestone',
    chapter: 2,
  },
  ch2_aut_return: {
    title: '返正史札記',
    content: '你修正了對秦亡原因的理解，重返楚漢相爭的主線。',
    category: 'milestone',
    chapter: 2,
  },
  ch2_aut_scene3: {
    title: '入第三章門檻',
    content: '你完成第二章，即將進入「西漢的建立」。',
    category: 'milestone',
    chapter: 2,
  },
  ch2_secret_1: { title: '史官評秦', content: '功過並論，方能解釋統一與速亡並存的歷史謎題。', category: 'secret', chapter: 2 },
  ch2_secret_2: { title: '民怨時序', content: '苛法與濫役在始皇時已積累，二世只是加速崩潰。', category: 'secret', chapter: 2 },
  ch2_secret_3: { title: '第二章完卷', content: '第二章史料集齊。楚漢風雲已在眼前。', category: 'secret', chapter: 2 },
  ch3_aut_historical: {
    title: '約法三章',
    content: '史載：劉邦入關後約法三章，廢除秦苛法，贏得民心。',
    category: 'milestone',
    chapter: 3,
  },
  ch3_aut_divergent: { title: '偏離開國', content: '沿用秦法或恢復戰國分封，皆非漢初實際路線。', category: 'milestone', chapter: 3 },
  ch3_aut_return: { title: '返正史札記', content: '你理解「與民休息」才是西漢開國之道。', category: 'milestone', chapter: 3 },
  ch3_aut_scene4: { title: '入第四章門檻', content: '你完成第三章，即將進入「漢武帝的文治與武功」。', category: 'milestone', chapter: 3 },
  ch3_secret_1: { title: '關中民心', content: '約法三章之所以有效，正在於回應了戰亂後百姓最迫切的需求。', category: 'secret', chapter: 3 },
  ch3_secret_2: { title: '漢初格局', content: '分封與郡縣並存，但中央集權方向已隱然成形。', category: 'secret', chapter: 3 },
  ch3_secret_3: { title: '第三章完卷', content: '第三章史料集齊。漢室基業已立。', category: 'secret', chapter: 3 },
  ch4_aut_historical: {
    title: '武帝方略',
    content: '漢武帝推行推恩令、獨尊儒術，並對匈奴多次用兵。',
    category: 'milestone',
    chapter: 4,
  },
  ch4_aut_divergent: { title: '偏離武帝', content: '完全守成或削弱中央，都與武帝時代史實背離。', category: 'milestone', chapter: 4 },
  ch4_aut_return: { title: '返正史札記', content: '你把握了漢武帝文治武功的方向。', category: 'milestone', chapter: 4 },
  ch4_aut_scene5: { title: '入第五章門檻', content: '你完成第四章，即將進入「昭宣以後與漢朝衰亡」。', category: 'milestone', chapter: 4 },
  ch4_secret_1: { title: '推恩深意', content: '推恩令表面恩賜，實則以分封削弱藩王實力。', category: 'secret', chapter: 4 },
  ch4_secret_2: { title: '儒術國策', content: '獨尊儒術為統治提供意識形態基礎，影響後世深遠。', category: 'secret', chapter: 4 },
  ch4_secret_3: { title: '第四章完卷', content: '第四章史料集齊。漢室由盛轉衰的伏筆已現。', category: 'secret', chapter: 4 },
  ch5_aut_historical: {
    title: '漢室中衰',
    content: '武帝晚年耗竭國力，後來外戚與宦官政治加劇衰亡。',
    category: 'milestone',
    chapter: 5,
  },
  ch5_aut_divergent: { title: '偏離衰亡論', content: '否認衰亡或歸咎一人，都過於簡化史實。', category: 'milestone', chapter: 5 },
  ch5_aut_return: { title: '返正史札記', content: '你理解漢朝由盛轉衰的多重因素。', category: 'milestone', chapter: 5 },
  ch5_aut_scene6: { title: '入第六章門檻', content: '你完成第五章，即將進入「兩漢通西域」。', category: 'milestone', chapter: 5 },
  ch5_secret_1: { title: '戚宦交替', content: '外戚與宦官輪流專權，是東漢後期政局的重要特徵。', category: 'secret', chapter: 5 },
  ch5_secret_2: { title: '國力消耗', content: '對外用兵與大建宮室，在武帝時已埋下隱患。', category: 'secret', chapter: 5 },
  ch5_secret_3: { title: '第五章完卷', content: '第五章史料集齊。絲路風聲漸近。', category: 'secret', chapter: 5 },
  ch6_aut_historical: {
    title: '鑿空西域',
    content: '史載：漢武帝派張騫出使西域，開闢絲綢之路。',
    category: 'milestone',
    chapter: 6,
  },
  ch6_aut_divergent: { title: '偏離閉關', content: '閉關自守或否認絲路，都與兩漢對外交流史實不符。', category: 'milestone', chapter: 6 },
  ch6_aut_return: { title: '返正史札記', content: '你理解通西域對中外文化交流的意義。', category: 'milestone', chapter: 6 },
  ch6_aut_scene7: { title: '入第七章門檻', content: '你完成第六章，即將進入「道教的形成」。', category: 'milestone', chapter: 6 },
  ch6_secret_1: { title: '絲路起點', content: '張騫出使雖為軍事目的，卻意外打通長期交流通道。', category: 'secret', chapter: 6 },
  ch6_secret_2: { title: '大月氏', content: '大月氏西遷是理解漢匈西域三角關係的關鍵。', category: 'secret', chapter: 6 },
  ch6_secret_3: { title: '第六章完卷', content: '第六章史料集齊。駝鈴聲中，新的思潮將至。', category: 'secret', chapter: 6 },
  ch7_aut_historical: {
    title: '道教源流',
    content: '東漢末五斗米道、太平道等是道教形成的重要源流。',
    category: 'milestone',
    chapter: 7,
  },
  ch7_aut_divergent: { title: '偏離宗教史', content: '忽略黃老思想或混淆源流，都無法理解道教形成。', category: 'milestone', chapter: 7 },
  ch7_aut_return: { title: '返正史札記', content: '你理解道教與黃老思想的淵源。', category: 'milestone', chapter: 7 },
  ch7_aut_scene8: { title: '入第八章門檻', content: '你完成第七章，即將進入「科技發明」。', category: 'milestone', chapter: 7 },
  ch7_secret_1: { title: '符水傳教', content: '以治病入門，是早期道門吸引民眾的重要方式。', category: 'secret', chapter: 7 },
  ch7_secret_2: { title: '黃老再詮', content: '黃老思想在亂世中被重新詮釋，與方術結合。', category: 'secret', chapter: 7 },
  ch7_secret_3: { title: '第七章完卷', content: '第七章史料集齊。紙與星象等待你探索。', category: 'secret', chapter: 7 },
  ch8_aut_historical: {
    title: '兩漢科技',
    content: '蔡倫改進造紙術；渾天儀等天文儀器在兩漢有重要發展。',
    category: 'milestone',
    chapter: 8,
  },
  ch8_aut_divergent: { title: '偏離科技史', content: '否認兩漢發明或歸功一人，都與科技史研究不符。', category: 'milestone', chapter: 8 },
  ch8_aut_return: { title: '返正史札記', content: '你理解造紙與天文對文明的貢獻。', category: 'milestone', chapter: 8 },
  ch8_aut_complete: {
    title: '秦漢旅程完結',
    content: '你沿正史主線走完了八個章節。全部圖鑑見證了你的史探之路。',
    category: 'milestone',
    chapter: 8,
  },
  ch8_secret_1: { title: '紙與知識', content: '造紙術降低成本，使知識傳播速度大幅提升。', category: 'secret', chapter: 8 },
  ch8_secret_2: { title: '觀天儀器', content: '渾天儀反映兩漢對宇宙結構的系統性觀察。', category: 'secret', chapter: 8 },
  ch8_secret_3: { title: '全卷完結', content: '八章史料盡收。你已走完秦漢沉浸式旅程。', category: 'secret', chapter: 8 },
}

export function getChapterFromSceneId(sceneId?: string): number | null {
  if (!sceneId) return null
  const m = sceneId.match(/^(?:scene|deviation)_(\d+)/)
  return m ? Number(m[1]) : null
}

export function getChapterMeta(chapter: number): ChapterMeta | undefined {
  return QIN_HAN_CHAPTERS.find((c) => c.chapter === chapter)
}

export function isExplorationScene(sceneId?: string): boolean {
  return getChapterFromSceneId(sceneId) !== null
}

function inferHotspotCategory(id: string): CodexCardCategory {
  if (id.includes('_replay_')) return 'replay'
  if (id.startsWith('deviation_')) return 'deviation'
  return 'mainline'
}

export function hotspotToCodexCard(hotspot: Hotspot, chapter: number): CodexCardDef {
  return {
    id: hotspot.id,
    title: hotspot.clue.title,
    content: hotspot.clue.content,
    speaker: hotspot.clue.speaker,
    category: inferHotspotCategory(hotspot.id),
    chapter,
  }
}

export function getChapterCodexCardIds(chapter: number, storyGraph: StoryGraph): string[] {
  const meta = getChapterMeta(chapter)
  if (!meta) return []
  const ids: string[] = []
  const scene = storyGraph.scenes[meta.sceneId]
  const deviation = storyGraph.scenes[meta.deviationId]
  scene?.hotspots?.forEach((h) => ids.push(h.id))
  deviation?.hotspots?.forEach((h) => ids.push(h.id))
  ids.push(
    `ch${chapter}_aut_historical`,
    `ch${chapter}_aut_divergent`,
    `ch${chapter}_aut_return`,
    meta.nextAutoCardId,
    ...meta.secretCardIds,
  )
  return ids
}

export function getChapterCodexCount(
  chapter: number,
  collectedIds: string[],
  storyGraph: StoryGraph,
): number {
  const chapterIds = getChapterCodexCardIds(chapter, storyGraph)
  return chapterIds.filter((id) => collectedIds.includes(id)).length
}

export function isChapterCodexComplete(
  chapter: number,
  collectedIds: string[],
  storyGraph: StoryGraph,
): boolean {
  return getChapterCodexCount(chapter, collectedIds, storyGraph) >= CODEX_CARDS_PER_CHAPTER
}

export function getTotalCodexCount(collectedIds: string[], storyGraph: StoryGraph): number {
  return QIN_HAN_CHAPTERS.reduce(
    (sum, ch) => sum + getChapterCodexCount(ch.chapter, collectedIds, storyGraph),
    0,
  )
}

export function getTotalCodexSlots(): number {
  return QIN_HAN_CHAPTERS.length * CODEX_CARDS_PER_CHAPTER
}

export function isKnownCodexCardId(id: string, storyGraph?: StoryGraph): boolean {
  if (id in META_CODEX_CARDS) return true
  if (!storyGraph) return /^((scene|deviation)_\d+_(clue|replay)_)/.test(id)
  for (const ch of QIN_HAN_CHAPTERS) {
    if (getChapterCodexCardIds(ch.chapter, storyGraph).includes(id)) return true
  }
  return false
}

export function getCodexCardDef(
  id: string,
  storyGraph: StoryGraph,
): CodexCardDef | null {
  const meta = META_CODEX_CARDS[id]
  if (meta) return { id, ...meta }
  for (const ch of QIN_HAN_CHAPTERS) {
    for (const sceneId of [ch.sceneId, ch.deviationId]) {
      const scene = storyGraph.scenes[sceneId]
      const hotspot = scene?.hotspots?.find((h) => h.id === id)
      if (hotspot) return hotspotToCodexCard(hotspot, ch.chapter)
    }
  }
  return null
}

export function getAutoGrantCardId(
  sceneId: string,
  _choiceId: string,
  choiceType: string,
): string | null {
  const chapter = getChapterFromSceneId(sceneId)
  if (!chapter) return null
  if (sceneId === `scene_${chapter}`) {
    if (choiceType === 'historical') return `ch${chapter}_aut_historical`
    if (choiceType === 'divergent') return `ch${chapter}_aut_divergent`
  }
  if (sceneId === `deviation_${chapter}` && choiceType === 'return_to_history') {
    return `ch${chapter}_aut_return`
  }
  return null
}

export function getNextChapterAutoCardId(completedChapter: number): string | null {
  return getChapterMeta(completedChapter)?.nextAutoCardId ?? null
}

export function getSecretCardIds(chapter: number): string[] {
  return [...(getChapterMeta(chapter)?.secretCardIds ?? [])]
}
