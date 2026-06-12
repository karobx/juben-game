import type {
  Choice,
  ExplorationTask,
  GameStatus,
  RouteType,
  ScenePhase,
  StoryGraph,
} from '../models/story'

export interface StoryEngineState {
  currentSceneId: string
  route: RouteType
  status: GameStatus
  phase: ScenePhase
  pendingChoiceId: string | null
  collectedClueIds: string[]
  explorationTaskAssignments: Record<string, string>
  taskFeedback: string | null
}

export class StoryEngine {
  private graph: StoryGraph
  private state: StoryEngineState

  constructor(graph: StoryGraph, initialSceneId?: string) {
    this.graph = graph
    const sceneId =
      initialSceneId && graph.scenes[initialSceneId] ? initialSceneId : graph.startSceneId
    this.state = this.freshState(sceneId)
  }

  private freshState(sceneId: string): StoryEngineState {
    return {
      currentSceneId: sceneId,
      route: this.graph.scenes[sceneId]?.route ?? 'mainline',
      status: 'playing',
      phase: 'explore',
      pendingChoiceId: null,
      collectedClueIds: [],
      explorationTaskAssignments: {},
      taskFeedback: null,
    }
  }

  getState(): StoryEngineState {
    return { ...this.state, explorationTaskAssignments: { ...this.state.explorationTaskAssignments } }
  }

  getGraph(): StoryGraph {
    return this.graph
  }

  getCurrentScene() {
    return this.graph.scenes[this.state.currentSceneId]
  }

  getPendingChoice(): Choice | undefined {
    if (!this.state.pendingChoiceId) return undefined
    return this.getCurrentScene()?.choices.find((c) => c.id === this.state.pendingChoiceId)
  }

  getExplorationTask(): ExplorationTask | undefined {
    return this.getCurrentScene()?.explorationTask
  }

  collectClue(clueId: string): StoryEngineState {
    if (this.state.status !== 'playing' || this.state.phase !== 'explore') {
      return this.getState()
    }
    if (!this.state.collectedClueIds.includes(clueId)) {
      this.state.collectedClueIds = [...this.state.collectedClueIds, clueId]
    }
    return this.getState()
  }

  assignClueToCategory(clueId: string, categoryId: string): StoryEngineState {
    const task = this.getExplorationTask()
    if (
      !task ||
      task.type !== 'categorize' ||
      this.state.status !== 'playing' ||
      this.state.phase !== 'explore'
    ) {
      return this.getState()
    }
    if (!this.state.collectedClueIds.includes(clueId)) {
      return this.getState()
    }

    const category = task.categories.find((c) => c.id === categoryId)
    if (!category) {
      return this.getState()
    }

    if (!category.acceptedClueIds.includes(clueId)) {
      const hotspot = this.getCurrentScene()?.hotspots?.find((h) => h.id === clueId)
      const clueTitle = hotspot?.clue.title ?? '此線索'
      this.state.taskFeedback = `「${clueTitle}」不屬於「${category.label}」，再想想。`
      return this.getState()
    }

    this.state.taskFeedback = null
    this.state.explorationTaskAssignments = {
      ...this.state.explorationTaskAssignments,
      [clueId]: categoryId,
    }
    return this.getState()
  }

  getRequiredClueCount(): number {
    const scene = this.getCurrentScene()
    if (!scene) return 0
    return scene.requiredClueCount ?? 0
  }

  isExplorationTaskComplete(): boolean {
    const task = this.getExplorationTask()
    if (!task || task.type !== 'categorize') return true

    const minPer = task.minPerCategory ?? 1
    return task.categories.every((category) => {
      const validCount = Object.entries(this.state.explorationTaskAssignments).filter(
        ([clueId, catId]) =>
          catId === category.id && category.acceptedClueIds.includes(clueId),
      ).length
      return validCount >= minPer
    })
  }

  canAdvanceToDecide(): boolean {
    const required = this.getRequiredClueCount()
    if (required > 0 && this.state.collectedClueIds.length < required) {
      return false
    }
    return this.isExplorationTaskComplete()
  }

  advanceToDecide(): StoryEngineState {
    if (this.state.status !== 'playing' || this.state.phase !== 'explore') {
      return this.getState()
    }
    const scene = this.getCurrentScene()
    if (!scene || scene.choices.length === 0) {
      return this.getState()
    }
    if (!this.canAdvanceToDecide()) {
      return this.getState()
    }
    this.state.phase = 'decide'
    return this.getState()
  }

  choose(choiceId: string): StoryEngineState {
    if (this.state.status !== 'playing') {
      return this.getState()
    }

    if (this.state.phase === 'explore') {
      this.advanceToDecide()
    }

    if (this.state.phase !== 'decide') {
      return this.getState()
    }

    const scene = this.getCurrentScene()
    if (!scene) {
      this.state.status = 'failed'
      return this.getState()
    }

    const choice = scene.choices.find((c) => c.id === choiceId)
    if (!choice) {
      return this.getState()
    }

    if (choice.reveal) {
      this.state.pendingChoiceId = choiceId
      this.state.phase = 'reveal'
      return this.getState()
    }

    this.applyChoice(choice)
    return this.getState()
  }

  confirmReveal(): StoryEngineState {
    if (this.state.status !== 'playing' || this.state.phase !== 'reveal') {
      return this.getState()
    }

    const choice = this.getPendingChoice()
    if (!choice) {
      return this.getState()
    }

    this.state.pendingChoiceId = null
    this.applyChoice(choice)
    return this.getState()
  }

  reset(): StoryEngineState {
    this.state = this.freshState(this.graph.startSceneId)
    return this.getState()
  }

  private applyChoice(choice: Choice) {
    switch (choice.type) {
      case 'historical':
        this.goToScene(choice.nextSceneId, 'mainline')
        break
      case 'divergent':
        this.goToScene(choice.nextSceneId, 'deviation')
        break
      case 'return_to_history': {
        const deviationScene = this.getCurrentScene()
        const target =
          choice.nextSceneId ||
          deviationScene?.resumeMainlineSceneId ||
          choice.nextSceneId
        this.goToScene(target, 'mainline')
        break
      }
      case 'continue_divergence':
        this.state.status = 'failed'
        this.state.phase = 'explore'
        this.state.pendingChoiceId = null
        break
      default:
        break
    }
  }

  private goToScene(sceneId: string, route: RouteType) {
    const next = this.graph.scenes[sceneId]
    if (!next) {
      this.state.status = 'failed'
      this.state.phase = 'explore'
      this.state.pendingChoiceId = null
      return
    }

    this.state.currentSceneId = sceneId
    this.state.route = route
    this.state.pendingChoiceId = null
    this.state.collectedClueIds = []
    this.state.explorationTaskAssignments = {}
    this.state.taskFeedback = null

    if (next.choices.length === 0) {
      this.state.status = 'completed'
      this.state.phase = 'explore'
      return
    }

    this.state.phase = 'explore'
  }
}
