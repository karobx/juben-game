import {
  CODEX_CARDS_PER_CHAPTER,
  getChapterCodexCardIds,
  getChapterMeta,
  getCodexCardDef,
  QIN_HAN_CHAPTERS,
} from '../data/qinHanCodex'
import type { StoryGraph } from '../models/story'

interface Props {
  collectedCardIds: string[]
  storyGraph: StoryGraph
  chapter: number
  open: boolean
  onClose: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  mainline: '正史',
  deviation: '偏離',
  replay: '重玩',
  milestone: '里程碑',
  secret: '秘藏',
}

function ChapterCardList({
  chapter,
  collectedSet,
  storyGraph,
}: {
  chapter: number
  collectedSet: Set<string>
  storyGraph: StoryGraph
}) {
  const meta = getChapterMeta(chapter)
  const cardIds = getChapterCodexCardIds(chapter, storyGraph)

  return (
    <>
      {meta && (
        <h3 className="codex-chapter-heading">
          第{chapter}章 · {meta.title}
        </h3>
      )}
      <ul className="codex-card-list">
        {cardIds.map((id) => {
          const def = getCodexCardDef(id, storyGraph)
          const collected = collectedSet.has(id)
          if (!def) return null
          return (
            <li
              key={id}
              className={`codex-card-item ${collected ? 'codex-card-collected' : 'codex-card-locked'}`}
            >
              <div className="codex-card-meta">
                <span className="codex-card-category">{CATEGORY_LABELS[def.category]}</span>
                {!collected && <span className="codex-card-lock">？</span>}
              </div>
              <h3 className="codex-card-title">{collected ? def.title : '未發現的史料'}</h3>
              {collected && (
                <>
                  {def.speaker && <p className="codex-card-speaker">{def.speaker}</p>}
                  <p className="codex-card-content">{def.content}</p>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

export function CodexDrawer({ collectedCardIds, storyGraph, chapter, open, onClose }: Props) {
  if (!open) return null

  const collectedSet = new Set(collectedCardIds)
  const chapterCount = getChapterCodexCardIds(chapter, storyGraph).filter((id) =>
    collectedSet.has(id),
  ).length

  return (
    <div className="codex-drawer-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="codex-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="codex-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="codex-drawer-header">
          <div>
            <h2 id="codex-drawer-title" className="codex-drawer-title">
              秦漢 · 史料圖鑑
            </h2>
            <p className="codex-drawer-subtitle">
              本章 {chapterCount}/{CODEX_CARDS_PER_CHAPTER} · 共 {QIN_HAN_CHAPTERS.length} 章可收集
            </p>
          </div>
          <button type="button" className="codex-drawer-close" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </header>
        <div className="codex-drawer-body">
          <ChapterCardList chapter={chapter} collectedSet={collectedSet} storyGraph={storyGraph} />
          {QIN_HAN_CHAPTERS.filter((c) => c.chapter !== chapter).length > 0 && (
            <details className="codex-other-chapters">
              <summary>查看其他章節圖鑑</summary>
              {QIN_HAN_CHAPTERS.filter((c) => c.chapter !== chapter).map((c) => (
                <ChapterCardList
                  key={c.chapter}
                  chapter={c.chapter}
                  collectedSet={collectedSet}
                  storyGraph={storyGraph}
                />
              ))}
            </details>
          )}
        </div>
      </aside>
    </div>
  )
}

/** 右下角浮動入口 */
export function CodexFab({
  collectedCardIds,
  storyGraph,
  chapter,
  onClick,
}: {
  collectedCardIds: string[]
  storyGraph: StoryGraph
  chapter: number
  onClick: () => void
}) {
  const count = getChapterCodexCardIds(chapter, storyGraph).filter((id) =>
    collectedCardIds.includes(id),
  ).length
  const meta = getChapterMeta(chapter)
  return (
    <button type="button" className="codex-fab" onClick={onClick} aria-label="打開史料圖鑑">
      <span className="codex-fab-icon" aria-hidden="true">
        圖
      </span>
      <span className="codex-fab-label">
        第{chapter}章 {count}/{CODEX_CARDS_PER_CHAPTER}
        {meta ? ` · ${meta.title}` : ''}
      </span>
    </button>
  )
}
