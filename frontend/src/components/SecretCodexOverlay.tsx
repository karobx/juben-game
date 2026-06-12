import {
  getChapterMeta,
  getCodexCardDef,
  getSecretCardIds,
} from '../data/qinHanCodex'
import type { StoryGraph } from '../models/story'

interface Props {
  chapter: number
  storyGraph: StoryGraph
  onContinue: () => void
}

/** 集齊某章圖鑑後的史官彩蛋 */
export function SecretCodexOverlay({ chapter, storyGraph, onContinue }: Props) {
  const meta = getChapterMeta(chapter)
  const secretIds = getSecretCardIds(chapter)

  return (
    <div className="reveal-overlay codex-secret-overlay" role="dialog" aria-modal="true">
      <div className="reveal-panel reveal-panel-positive codex-secret-panel">
        <div className="reveal-seal reveal-seal-positive" aria-hidden="true">
          藏
        </div>
        <p className="reveal-verdict">第{chapter}章秘藏史料解鎖</p>
        <p className="reveal-history">
          你集齊了「{meta?.title ?? `第${chapter}章`}」的所有線索。太史令從簡牘深處取出三卷補遺——
        </p>
        <ul className="codex-secret-list">
          {secretIds.map((id) => {
            const card = getCodexCardDef(id, storyGraph)
            if (!card) return null
            return (
              <li key={id} className="codex-secret-item">
                <strong>{card.title}</strong>
                <span>{card.content}</span>
              </li>
            )
          })}
        </ul>
        <button type="button" className="btn btn-primary btn-lg reveal-continue" onClick={onContinue}>
          繼續旅程
        </button>
      </div>
    </div>
  )
}
