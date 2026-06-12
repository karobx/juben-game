/** 從場景敘事辨識視覺主題，令插畫與文字內容對應 */

export type SceneVisualType =
  | 'great_wall'
  | 'grand_palace'
  | 'book_burning'
  | 'uprising'
  | 'court'
  | 'unification'
  | 'silk_road'
  | 'labor'
  | 'imperial_road'
  | 'landscape'

export interface SceneVisualSpec {
  type: SceneVisualType
  label: string
}

interface MotifRule {
  type: SceneVisualType
  label: string
  pattern: RegExp
  /** 數字愈細愈優先（具體場景優先於抽象主題） */
  priority: number
}

const MOTIF_RULES: MotifRule[] = [
  { type: 'landscape', label: '史前聚落', pattern: /仰韶|新石器|彩陶|黃河流域|多元一體/, priority: 1 },
  { type: 'landscape', label: '傳疑時代', pattern: /傳疑時代|三皇五帝|神話傳說|口耳相傳/, priority: 1 },
  {
    type: 'court',
    label: '夏商周三代',
    pattern: /夏朝|商朝|周朝|三代|青銅|甲骨文|世襲王朝|商湯|周武王/,
    priority: 1,
  },
  {
    type: 'unification',
    label: '西周封建',
    pattern: /封建|分封|宗法|諸侯|采邑|冊命/,
    priority: 1,
  },
  {
    type: 'uprising',
    label: '春秋戰國',
    pattern: /春秋戰國|兼併戰爭|爭霸|七雄|商鞅|變法|戰國/,
    priority: 1,
  },
  {
    type: 'uprising',
    label: '三國鼎立',
    pattern: /三國鼎立|曹操|劉備|孫權|赤壁|諸葛亮|蜀漢|東吳|曹魏|黃巾起義/,
    priority: 1,
  },
  {
    type: 'court',
    label: '南北朝',
    pattern: /兩晉|南北朝|孝文帝|漢化|鮮卑|北魏|江南開發|石窟|雲岡|龍門/,
    priority: 1,
  },
  { type: 'unification', label: '隋朝統一', pattern: /隋朝|隋文帝|開皇|楊堅|統一南北/, priority: 1 },
  { type: 'imperial_road', label: '隋唐運河', pattern: /大運河|漕運|洛陽|涿郡|餘杭/, priority: 1 },
  { type: 'court', label: '貞觀之治', pattern: /貞觀|唐太宗|李世民|凌煙閣|諫臣/, priority: 1 },
  { type: 'court', label: '武后施政', pattern: /武則天|武后|女皇|周代唐/, priority: 1 },
  { type: 'uprising', label: '安史之亂', pattern: /安史之亂|安祿山|史思明|潼關|馬嵬坡/, priority: 1 },
  { type: 'silk_road', label: '西行取經', pattern: /玄奘|西行|天竺|取經|中印文化/, priority: 1 },
  { type: 'book_burning', label: '焚書坑儒', pattern: /焚書|坑儒/, priority: 1 },
  { type: 'uprising', label: '揭竿起義', pattern: /揭竿|起義|陳勝|吳廣|逐鹿|項羽|劉邦|起兵|反秦/, priority: 1 },
  { type: 'great_wall', label: '長城修筑', pattern: /長城/, priority: 1 },
  { type: 'grand_palace', label: '宮殿工程', pattern: /阿房宮|未央|章台|阿房/, priority: 1 },
  {
    type: 'court',
    label: '朝堂決斷',
    pattern: /咸陽宮|殿上|宮中|正殿|廷議|朝堂|奉天殿|朝廷|秦王政|始皇帝/,
    priority: 1,
  },
  { type: 'silk_road', label: '絲路出使', pattern: /張騫|絲路|通西域|西域諸國|大漠出使/, priority: 1 },
  { type: 'court', label: '朝堂決斷', pattern: /丞相|奏請|屬官|李斯|大臣/, priority: 2 },
  { type: 'labor', label: '徭役民夫', pattern: /民夫|徭役|動員|勞役|萬人/, priority: 2 },
  { type: 'imperial_road', label: '馳道通途', pattern: /馳道|驛道|官道/, priority: 2 },
  {
    type: 'unification',
    label: '天下一統',
    pattern: /六國歸一|書同文|車同軌|度量衡|稱帝|始皇帝|統一標準|天下一統/,
    priority: 3,
  },
  { type: 'landscape', label: '山河遠望', pattern: /山河|江山|遠山|江水|關中|中原/, priority: 4 },
]

function stripEraPrefix(text: string): string {
  return text.replace(/^【[^】]+】\s*/, '')
}

function classifyFromText(raw: string): SceneVisualSpec | null {
  const text = stripEraPrefix(raw)
  if (!text.trim()) return null

  let best: { type: SceneVisualType; label: string; priority: number; index: number } | null =
    null

  for (const rule of MOTIF_RULES) {
    const match = rule.pattern.exec(text)
    if (!match || match.index === undefined) continue

    const candidate = {
      type: rule.type,
      label: rule.label,
      priority: rule.priority,
      index: match.index,
    }

    if (
      !best ||
      candidate.priority < best.priority ||
      (candidate.priority === best.priority && candidate.index < best.index)
    ) {
      best = candidate
    }
  }

  return best ? { type: best.type, label: best.label } : null
}

export function classifySceneVisual(
  narrative?: string,
  prompt?: string,
  moodKeywords: string[] = [],
): SceneVisualSpec {
  // 玩家可見敘事優先，避免 period 級「西域」污染章節角標
  const fromNarrative = narrative ? classifyFromText(narrative) : null
  if (fromNarrative) return fromNarrative

  const promptText = [prompt ?? '', moodKeywords.join(' ')].filter(Boolean).join(' ')
  const fromPrompt = classifyFromText(promptText)
  if (fromPrompt) return fromPrompt

  return { type: 'landscape', label: '山河遠望' }
}
