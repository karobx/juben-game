import type { ExplorationTask, Hotspot } from '../models/story'

interface Props {
  task: ExplorationTask
  hotspots: Hotspot[]
  collectedClueIds: string[]
  assignments: Record<string, string>
  selectedClueId: string | null
  feedback: string | null
  complete: boolean
  onSelectClue: (clueId: string) => void
  onAssignCategory: (categoryId: string) => void
}

const DEFAULT_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  wenzi: '全國文字劃一，政令文書先可以互通',
  chegui: '車輪軌距一致，馳道運輸先會順暢',
  duliang: '重量長度標準一致，賦稅交易先會公平',
}

export function CategorizeTaskPanel({
  task,
  hotspots,
  collectedClueIds,
  assignments,
  selectedClueId,
  feedback,
  complete,
  onSelectClue,
  onAssignCategory,
}: Props) {
  const collectedHotspots = hotspots.filter((h) => collectedClueIds.includes(h.id))
  const minPer = task.minPerCategory ?? 1
  const completedCategories = task.categories.filter((category) => {
    const validCount = Object.entries(assignments).filter(
      ([clueId, catId]) =>
        catId === category.id && category.acceptedClueIds.includes(clueId),
    ).length
    return validCount >= minPer
  }).length

  const selectedHotspot = selectedClueId
    ? hotspots.find((h) => h.id === selectedClueId)
    : undefined

  return (
    <section className="categorize-task" aria-label={task.title}>
      <header className="categorize-task-header">
        <div className="categorize-task-heading">
          <h3 className="categorize-task-title">{task.title}</h3>
          <p className="categorize-task-intro">
            秦朝統一後推行三項制度。請把上方線索，放入下方對應嘅政策欄位。
          </p>
        </div>
        <span className={`categorize-task-progress ${complete ? 'categorize-task-progress-done' : ''}`}>
          {complete ? '對照完成' : `進度 ${completedCategories}/${task.categories.length}`}
        </span>
      </header>

      <ol className="categorize-task-steps">
        <li className={selectedClueId ? 'categorize-step-done' : 'categorize-step-current'}>
          <span className="categorize-step-num">1</span>
          <span className="categorize-step-text">點選一條已收線索</span>
        </li>
        <li className={selectedClueId ? 'categorize-step-current' : ''}>
          <span className="categorize-step-num">2</span>
          <span className="categorize-step-text">點選下方對應政策欄</span>
        </li>
      </ol>

      <div className="categorize-task-clues">
        <span className="categorize-task-section-label">已收線索（第 1 步）</span>
        <div className="categorize-task-clue-row">
          {collectedHotspots.map((hotspot) => {
            const assigned = assignments[hotspot.id]
            return (
              <button
                key={hotspot.id}
                type="button"
                className={`categorize-clue-chip ${
                  selectedClueId === hotspot.id ? 'categorize-clue-chip-selected' : ''
                } ${assigned ? 'categorize-clue-chip-assigned' : ''}`}
                onClick={() => onSelectClue(hotspot.id)}
                aria-pressed={selectedClueId === hotspot.id}
              >
                {hotspot.label}
                {assigned && (
                  <span className="categorize-clue-chip-tag">
                    → {task.categories.find((c) => c.id === assigned)?.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {selectedHotspot && (
          <p className="categorize-task-selection-hint" role="status">
            已選「{selectedHotspot.clue.title}」— 請在第 2 步點選下方欄位
          </p>
        )}
      </div>

      <p className="categorize-columns-heading">秦朝三項統一政策（第 2 步 · 每欄至少 1 條線索）</p>
      <div className="categorize-task-columns">
        {task.categories.map((category) => {
          const assignedIds = Object.entries(assignments)
            .filter(([, catId]) => catId === category.id)
            .map(([clueId]) => clueId)
          const validCount = assignedIds.filter((id) =>
            category.acceptedClueIds.includes(id),
          ).length
          const isComplete = validCount >= minPer
          const description =
            category.description ?? DEFAULT_CATEGORY_DESCRIPTIONS[category.id] ?? ''

          let actionHint = '請先完成第 1 步'
          if (selectedClueId) {
            actionHint = '點此放入已選線索'
          }
          if (isComplete) {
            actionHint = '已配對完成'
          }

          return (
            <button
              key={category.id}
              type="button"
              className={`categorize-column ${isComplete ? 'categorize-column-complete' : ''} ${
                selectedClueId && !isComplete ? 'categorize-column-ready' : ''
              }`}
              onClick={() => onAssignCategory(category.id)}
              disabled={!selectedClueId || isComplete}
              aria-label={`${category.label}：${description}`}
            >
              <span className="categorize-column-label">{category.label}</span>
              <span className="categorize-column-desc">{description}</span>
              <span className="categorize-column-action">{actionHint}</span>
              <span className="categorize-column-count">
                需要 {minPer} 條 · 已放 {validCount} 條
              </span>
              {assignedIds.length > 0 && (
                <span className="categorize-column-items">
                  {assignedIds
                    .map((id) => hotspots.find((h) => h.id === id)?.clue.title ?? id)
                    .join('、')}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {feedback && (
        <p className="categorize-task-feedback" role="status">
          {feedback}
        </p>
      )}
    </section>
  )
}
