import { useMemo, useState } from 'react'
import { CategorizeTaskPanel } from '../components/CategorizeTaskPanel'
import { CluePocket } from '../components/CluePocket'
import { IllustrationClueBar } from '../components/IllustrationClueBar'
import { CodexDrawer, CodexFab } from '../components/CodexDrawer'
import { IllustrationHotspotLayer } from '../components/IllustrationHotspotLayer'
import { RevealOverlay } from '../components/RevealOverlay'
import { SecretCodexOverlay } from '../components/SecretCodexOverlay'
import { SceneIllustrationCard } from '../components/SceneIllustrationCard'
import { StoryEngine } from '../engine/storyEngine'
import {
  CODEX_CARDS_PER_CHAPTER,
  getAutoGrantCardId,
  getChapterCodexCount,
  getChapterFromSceneId,
  getChapterMeta,
  getSecretCardIds,
  isChapterCodexComplete,
  isExplorationScene,
  isKnownCodexCardId,
} from '../data/qinHanCodex'
import type { Choice, Hotspot, StoryGraph } from '../models/story'
import {
  addCodexCard,
  addCodexCards,
  incrementPlaythroughCount,
  isChapterSecretViewed,
  loadCodexProgress,
  markChapterSecretViewed,
  type CodexProgress,
} from '../utils/chistoryCodex'
import { getVisibleHotspots } from '../utils/hotspotVisibility'
import { buildIllustrationSceneId } from '../utils/illustrationSceneId'
import { applyPlayerName } from '../utils/playerNarrative'
import {
  resolveDecisionPrompt,
  resolvePlayerBadge,
  resolveSceneNarrative,
} from '../utils/playerPerspective'

interface Props {
  storyGraph: StoryGraph
  playerCharacter?: string
  initialSceneId?: string
  onSceneChange?: (sceneId: string) => void
  onExit: () => void
}

function filterChoices(choices: Choice[], chapterCodexCount: number): Choice[] {
  return choices.filter(
    (c) => !c.requiresMinCodexCards || chapterCodexCount >= c.requiresMinCodexCards,
  )
}

export function GamePlayView({
  storyGraph,
  playerCharacter,
  initialSceneId,
  onSceneChange,
  onExit,
}: Props) {
  const engine = useMemo(
    () => new StoryEngine(storyGraph, initialSceneId),
    [storyGraph, initialSceneId],
  )

  const [state, setState] = useState(() => engine.getState())
  const [visitedCount, setVisitedCount] = useState(1)
  const [activeClueId, setActiveClueId] = useState<string | null>(null)
  const [selectedTaskClueId, setSelectedTaskClueId] = useState<string | null>(null)
  const [exploreListOpen, setExploreListOpen] = useState(false)
  const [pocketReceivingId, setPocketReceivingId] = useState<string | null>(null)
  const [codex, setCodex] = useState<CodexProgress>(() => loadCodexProgress())
  const [codexOpen, setCodexOpen] = useState(false)
  const [pendingSecretChapter, setPendingSecretChapter] = useState<number | null>(null)

  const scene = engine.getCurrentScene()
  const pendingChoice = engine.getPendingChoice()
  const isMainline = state.route === 'mainline' && state.status === 'playing'
  const isDeviation = state.route === 'deviation' && state.status === 'playing'
  const totalScenes = Object.keys(storyGraph.scenes).length
  const progressPct = Math.min(100, Math.round((visitedCount / totalScenes) * 100))
  const requiredClues = engine.getRequiredClueCount()
  const collectedCount = state.collectedClueIds.length
  const canAdvance = engine.canAdvanceToDecide()
  const explorationTask = engine.getExplorationTask()
  const taskComplete = engine.isExplorationTaskComplete()
  const allHotspots = scene?.hotspots ?? []
  const visibleHotspots = getVisibleHotspots(
    allHotspots,
    state.collectedClueIds,
    codex.playthroughCount,
  )
  const currentChapter = getChapterFromSceneId(scene?.id)
  const showCodexUi = isExplorationScene(scene?.id) && currentChapter != null
  const codexCount =
    currentChapter != null
      ? getChapterCodexCount(currentChapter, codex.collectedCardIds, storyGraph)
      : 0

  const sceneNarrative = resolveSceneNarrative(scene, playerCharacter)
  const decisionPrompt =
    resolveDecisionPrompt(scene, playerCharacter) ?? '此刻，你會如何抉擇？'
  const playerBadge = resolvePlayerBadge(playerCharacter, scene)
  const illustrationSceneId = buildIllustrationSceneId(scene?.id, storyGraph.periodId)

  function syncCodex(next: CodexProgress) {
    setCodex(next)
  }

  function registerHotspotCard(hotspot: Hotspot) {
    if (!isKnownCodexCardId(hotspot.id, storyGraph)) return
    syncCodex(addCodexCard(hotspot.id))
  }

  function notifySceneChange(nextState: ReturnType<typeof engine.getState>) {
    onSceneChange?.(nextState.currentSceneId)
  }

  function handleAdvanceToDecide() {
    const next = engine.advanceToDecide()
    setState(next)
    setActiveClueId(null)
    setSelectedTaskClueId(null)
  }

  function handleHotspotSelect(hotspot: Hotspot) {
    setActiveClueId((current) => (current === hotspot.id ? null : hotspot.id))
  }

  function handleCollectClue(hotspot: Hotspot) {
    setState(engine.collectClue(hotspot.id))
    registerHotspotCard(hotspot)
    setPocketReceivingId(hotspot.id)
    window.setTimeout(() => setPocketReceivingId(null), 700)
    window.setTimeout(() => setActiveClueId(null), 420)
  }

  function handleAssignCategory(categoryId: string) {
    if (!selectedTaskClueId) return
    setState(engine.assignClueToCategory(selectedTaskClueId, categoryId))
    setSelectedTaskClueId(null)
  }

  function handleChoice(choiceId: string) {
    setState(engine.choose(choiceId))
    setActiveClueId(null)
  }

  function applyPostRevealGrants(revealedSceneId: string, choice: Choice): CodexProgress {
    let progress = loadCodexProgress()
    const autoId = getAutoGrantCardId(revealedSceneId, choice.id, choice.type)
    if (autoId) {
      progress = addCodexCard(autoId)
    }
    syncCodex(progress)
    return progress
  }

  function handleChapterComplete(completedChapter: number) {
    const meta = getChapterMeta(completedChapter)
    if (!meta) return

    let next = addCodexCard(meta.nextAutoCardId)

    if (
      isChapterCodexComplete(completedChapter, next.collectedCardIds, storyGraph) &&
      !isChapterSecretViewed(completedChapter, next)
    ) {
      next = addCodexCards(getSecretCardIds(completedChapter))
      setPendingSecretChapter(completedChapter)
      next = markChapterSecretViewed(completedChapter)
    }
    syncCodex(next)
  }

  function handleConfirmReveal() {
    const revealedSceneId = state.currentSceneId
    const choice = pendingChoice
    const next = engine.confirmReveal()
    const nextSceneId = next.currentSceneId
    const completedChapter = getChapterFromSceneId(revealedSceneId)

    if (choice) {
      applyPostRevealGrants(revealedSceneId, choice)
    }

    if (completedChapter) {
      const meta = getChapterMeta(completedChapter)
      if (meta && nextSceneId === meta.nextSceneId) {
        handleChapterComplete(completedChapter)
      }
    }

    setState(next)
    setVisitedCount((n) => n + 1)
    setActiveClueId(null)
    setSelectedTaskClueId(null)
    notifySceneChange(next)
  }

  function handleSecretOverlayContinue() {
    setPendingSecretChapter(null)
  }

  function handleRetry() {
    syncCodex(incrementPlaythroughCount())
    setState(engine.reset())
    setVisitedCount(1)
    setActiveClueId(null)
    setSelectedTaskClueId(null)
    setPendingSecretChapter(null)
    notifySceneChange(engine.getState())
  }

  const activeHotspot =
    allHotspots.find((h) => h.id === activeClueId) ??
    visibleHotspots.find((h) => h.id === activeClueId)
  const activeHotspotCollected =
    activeHotspot != null && state.collectedClueIds.includes(activeHotspot.id)
  const collectedHotspots = allHotspots.filter((h) => state.collectedClueIds.includes(h.id))

  if (state.status === 'failed') {
    return (
      <section className="game-view game-failed">
        <div className="game-over-panel game-over-fail">
          <div className="game-over-seal" aria-hidden="true">
            終
          </div>
          <h1>歷史走了另一條路</h1>
          <p className="game-over-desc">偏離太遠，已無法返回原故事。要再試一次嗎？</p>
          {currentChapter != null && (
            <p className="game-over-codex-hint">
              第{currentChapter}章圖鑑：{codexCount}/{CODEX_CARDS_PER_CHAPTER} — 重玩可收集 replay 線索
            </p>
          )}
          <div className="actions">
            <button type="button" className="btn btn-secondary" onClick={onExit}>
              離開
            </button>
            <button type="button" className="btn btn-danger btn-lg" onClick={handleRetry}>
              重新開始
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (state.status === 'completed') {
    return (
      <section className="game-view game-mainline">
        <div className="game-panel game-panel-victory">
          <div className="game-over-seal game-over-seal-win" aria-hidden="true">
            成
          </div>
          <span className="route-badge mainline">歷史主線</span>
          <h1>{storyGraph.title}</h1>
          <p className="narrative">{sceneNarrative}</p>
          <p className="complete-msg">你守住了歷史的主線！</p>
          <div className="actions">
            <button type="button" className="btn btn-secondary" onClick={onExit}>
              離開
            </button>
            <button type="button" className="btn btn-primary btn-lg" onClick={handleRetry}>
              再玩一次
            </button>
          </div>
        </div>
      </section>
    )
  }

  const showRouteBadge = state.phase === 'reveal' || state.phase === 'explore'
  const availableChoices = filterChoices(scene?.choices ?? [], codexCount)

  return (
    <section
      className={`game-view ${isMainline ? 'game-mainline' : ''} ${isDeviation ? 'game-deviation' : ''} game-view-active`}
    >
      <div className="game-top-bar">
        <div
          className="game-progress-bar"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="game-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="game-progress-label">旅程 {progressPct}%</span>
      </div>

      {isDeviation && state.phase === 'explore' && (
        <div className="deviation-banner deviation-banner-compact" role="status">
          <span className="deviation-banner-icon" aria-hidden="true">
            !
          </span>
          偏離正史
        </div>
      )}

      {state.phase === 'explore' && allHotspots.length > 0 && requiredClues > 0 && (
        <CluePocket
          variant="floating"
          collectedHotspots={collectedHotspots}
          requiredCount={requiredClues}
          receivingId={pocketReceivingId}
          activeClueId={activeClueId}
          onSelectClue={setActiveClueId}
        />
      )}

      {showCodexUi && currentChapter != null && (
        <>
          <CodexFab
            collectedCardIds={codex.collectedCardIds}
            storyGraph={storyGraph}
            chapter={currentChapter}
            onClick={() => setCodexOpen(true)}
          />
          <CodexDrawer
            collectedCardIds={codex.collectedCardIds}
            storyGraph={storyGraph}
            chapter={currentChapter}
            open={codexOpen}
            onClose={() => setCodexOpen(false)}
          />
        </>
      )}

      <div className={`game-panel ${state.phase === 'explore' ? 'game-panel-explore' : ''}`}>
        {showRouteBadge && state.phase !== 'explore' && (
          <div className="game-panel-header">
            <span className={`route-badge ${isMainline ? 'mainline' : 'deviation'}`}>
              {isMainline ? '歷史主線' : '偏離分支'}
            </span>
            {playerBadge && (
              <span
                className={`player-identity-badge ${playerBadge.mode === 'reader' ? 'player-identity-badge-reader' : ''}`}
              >
                {playerBadge.label}
              </span>
            )}
          </div>
        )}

        {state.phase === 'explore' && (
          <>
            <div className="game-scene-stage">
              {(showRouteBadge || playerBadge) && (
                <div className="game-scene-badges">
                  <span className={`route-badge route-badge-floating ${isMainline ? 'mainline' : 'deviation'}`}>
                    {isMainline ? '歷史主線' : '偏離分支'}
                  </span>
                  {playerBadge && (
                    <span
                      className={`player-identity-badge player-identity-badge-floating ${playerBadge.mode === 'reader' ? 'player-identity-badge-reader' : ''}`}
                    >
                      {playerBadge.label}
                    </span>
                  )}
                </div>
              )}
              <SceneIllustrationCard
                layout="immersive"
                sceneId={illustrationSceneId}
                imagePrompt={scene?.imagePrompt}
                narrative={sceneNarrative}
                illustrationUrl={scene?.illustrationUrl}
                variant={isMainline ? 'mainline' : 'deviation'}
                hotspotOverlay={
                  visibleHotspots.length > 0 ? (
                    <IllustrationHotspotLayer
                      hotspots={visibleHotspots}
                      collectedClueIds={state.collectedClueIds}
                      activeClueId={activeClueId}
                      onSelect={handleHotspotSelect}
                    />
                  ) : undefined
                }
                clueBar={
                  activeHotspot ? (
                    <IllustrationClueBar
                      hotspot={activeHotspot}
                      collected={activeHotspotCollected}
                      onCollect={() => handleCollectClue(activeHotspot)}
                      onDismiss={() => setActiveClueId(null)}
                    />
                  ) : undefined
                }
              />
            </div>

            <div className="game-scene-actions">
            {explorationTask?.type === 'categorize' && collectedCount >= requiredClues && (
              <CategorizeTaskPanel
                task={explorationTask}
                hotspots={allHotspots}
                collectedClueIds={state.collectedClueIds}
                assignments={state.explorationTaskAssignments}
                selectedClueId={selectedTaskClueId}
                feedback={state.taskFeedback}
                complete={taskComplete}
                onSelectClue={setSelectedTaskClueId}
                onAssignCategory={handleAssignCategory}
              />
            )}

            {allHotspots.length > 0 && requiredClues > 0 && (
              <details
                className="explore-clues explore-clues-collapsible"
                open={exploreListOpen}
                onToggle={(e) => setExploreListOpen((e.target as HTMLDetailsElement).open)}
              >
                <summary className="explore-clues-summary">
                  <span className="explore-clues-title">探索清單（備援）</span>
                  <span className="explore-clues-count">
                    線索 {collectedCount}/{requiredClues}
                    {visibleHotspots.length < allHotspots.length && (
                      <span className="explore-clues-hidden-hint"> · 似乎還有隱藏線索</span>
                    )}
                  </span>
                </summary>
                <div className="clue-chip-row">
                  {visibleHotspots.map((hotspot) => {
                    const collected = state.collectedClueIds.includes(hotspot.id)
                    return (
                      <button
                        key={hotspot.id}
                        type="button"
                        className={`clue-chip ${collected ? 'clue-chip-collected' : ''} ${
                          activeClueId === hotspot.id ? 'clue-chip-active' : ''
                        } ${hotspot.replayOnly ? 'clue-chip-replay' : ''}`}
                        onClick={() => handleHotspotSelect(hotspot)}
                        aria-pressed={activeClueId === hotspot.id}
                      >
                        {collected ? '✓ ' : '○ '}
                        {hotspot.label}
                      </button>
                    )
                  })}
                </div>
                <p className="explore-hint explore-hint-hotspot">
                  點繪卷上的光點搜證；此清單供無法點選時使用。
                </p>
              </details>
            )}

            {!canAdvance && (
              <p className="explore-hint">
                {collectedCount < requiredClues
                  ? `先收集至少 ${requiredClues} 條線索，再做出抉擇。`
                  : explorationTask && !taskComplete
                    ? '完成下方對照任務後，方可抉擇。'
                    : null}
              </p>
            )}
            {codex.playthroughCount >= 2 && showCodexUi && (
              <p className="explore-hint explore-hint-replay">
                重玩模式：留意標有「重訪」的線索，可補完圖鑑。
              </p>
            )}

            <button
              type="button"
              className="btn btn-primary btn-lg btn-advance-decide"
              onClick={handleAdvanceToDecide}
              disabled={!canAdvance}
            >
              {canAdvance
                ? '我已了解情勢，做出抉擇'
                : collectedCount < requiredClues
                  ? `還需 ${requiredClues - collectedCount} 條線索`
                  : '還需完成對照任務'}
            </button>
            </div>
          </>
        )}

        {state.phase === 'decide' && (
          <>
            <p className="choices-prompt">
              {decisionPrompt}
            </p>
            {showCodexUi && codexCount >= 12 && codexCount < 14 && (
              <p className="choices-codex-hint">
                本章圖鑑 {codexCount}/{CODEX_CARDS_PER_CHAPTER} — 再收集一些史料，或許會有秘藏進諫之路。
              </p>
            )}
            <div className="choices choices-neutral">
              {availableChoices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className={`choice-card choice-card-neutral ${
                    choice.requiresMinCodexCards ? 'choice-card-secret' : ''
                  }`}
                  onClick={() => handleChoice(choice.id)}
                >
                  <span className="choice-label">
                    {applyPlayerName(choice.label, playerCharacter)}
                  </span>
                  {choice.requiresMinCodexCards && (
                    <span className="choice-badge-secret">秘藏</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {state.phase === 'reveal' && pendingChoice?.reveal && (
          <RevealOverlay reveal={pendingChoice.reveal} onContinue={handleConfirmReveal} />
        )}

        {pendingSecretChapter != null && (
          <SecretCodexOverlay
            chapter={pendingSecretChapter}
            storyGraph={storyGraph}
            onContinue={handleSecretOverlayContinue}
          />
        )}

        <button type="button" className="btn btn-text" onClick={onExit}>
          離開遊戲
        </button>
      </div>
    </section>
  )
}
