export type RouteType = 'mainline' | 'deviation'

export type ChoiceType =
  | 'historical'
  | 'divergent'
  | 'return_to_history'
  | 'continue_divergence'

export type GameStatus = 'playing' | 'failed' | 'completed'

export type ScenePhase = 'explore' | 'decide' | 'reveal'

export type RevealVerdict = 'historical' | 'divergent' | 'return' | 'persist'

export interface ChoiceReveal {
  verdict: RevealVerdict
  historyNote: string
  consequence: string
}

export interface Choice {
  id: string
  label: string
  type: ChoiceType
  nextSceneId: string
  reveal?: ChoiceReveal
  /** 圖鑑收集達此數量才顯示（第一章 demo） */
  requiresMinCodexCards?: number
}

export interface Clue {
  title: string
  content: string
  speaker?: string
}

export interface Hotspot {
  id: string
  label: string
  x: number
  y: number
  clue: Clue
  requiresClueIds?: string[]
  replayOnly?: boolean
  hidden?: boolean
  zone?: string
  icon?: string
}

export interface CategorizeCategory {
  id: string
  label: string
  /** 一句話說明此欄代表咩政策，方便玩家理解 */
  description?: string
  acceptedClueIds: string[]
}

export interface ExplorationTask {
  type: 'categorize'
  title: string
  prompt?: string
  categories: CategorizeCategory[]
  minPerCategory?: number
}

export interface ImagePrompt {
  prompt: string
  expandedPrompt: string
  moodKeywords: string[]
}

export type PerspectiveEra = 'qin' | 'chu_han' | 'han_west' | 'han_east'

export interface Scene {
  id: string
  route: RouteType
  narrative: string
  narrativeFirstPerson?: string
  /** 課本研讀旁白：玩家角色與本章時代不符時使用 */
  narrativeAsReader?: string
  /** 章節所屬時代，用於第一人稱代入判斷 */
  perspectiveEra?: PerspectiveEra
  resumeMainlineSceneId?: string
  imagePrompt?: ImagePrompt
  illustrationUrl?: string
  hotspots?: Hotspot[]
  requiredClueCount?: number
  explorationTask?: ExplorationTask
  decisionPrompt?: string
  /** 研讀視角下的抉擇提示 */
  decisionPromptAsReader?: string
  choices: Choice[]
}

export interface StoryGraph {
  title: string
  startSceneId: string
  scenes: Record<string, Scene>
  periodId?: string
}

export interface Character {
  name: string
  mentions: number
}

export interface PlotBeat {
  order: number
  summary: string
}

export interface AnalysisResult {
  title: string
  characters: Character[]
  plotBeats: PlotBeat[]
  settings: string[]
  rawTextLength: number
  engine?: string
  structure?: {
    dialogueCount: number
    narrationLength: number
    paragraphCount: number
  }
  svoPatterns?: Array<{ subject: string; verb: string; object: string }>
  imagePrompts?: ImagePrompt[]
}

export interface UploadResult {
  fileId: string
  filename: string
  storagePath: string
  url: string
  mode: string
}

export interface AnalyzeResponse {
  analysis: AnalysisResult
  storyGraph: StoryGraph
}

export type TaskStatus = 'processing' | 'completed' | 'failed'

export interface AnalyzeTaskStartResponse {
  status: 'processing'
  taskId: string
}

export interface AnalyzeTaskStatusResponse {
  status: TaskStatus
  taskId: string
  analysis?: AnalysisResult
  storyGraph?: StoryGraph
  error?: string
}
