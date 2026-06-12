import type { Hotspot } from '../models/story'

interface Props {
  hotspot: Hotspot
  collected: boolean
  onCollect: () => void
  onDismiss: () => void
}

/** 繪卷內嵌線索條：內容高度自適應，唔遮全屏、唔需手動關閉面板 */
export function IllustrationClueBar({ hotspot, collected, onCollect, onDismiss }: Props) {
  const title = hotspot.clue.speaker
    ? `${hotspot.clue.speaker} · ${hotspot.clue.title}`
    : hotspot.clue.title

  return (
    <div className="illustration-clue-bar" role="region" aria-label="線索詳情">
      <div className="illustration-clue-bar-inner">
        <p className="illustration-clue-bar-title">{title}</p>
        <p className="illustration-clue-bar-content">{hotspot.clue.content}</p>
        <div className="illustration-clue-bar-actions">
          {!collected ? (
            <button type="button" className="btn btn-primary btn-sm illustration-clue-bar-collect" onClick={onCollect}>
              收入線索袋
            </button>
          ) : (
            <span className="illustration-clue-bar-done">已收入線索袋</span>
          )}
          <button type="button" className="btn btn-text btn-sm illustration-clue-bar-skip" onClick={onDismiss}>
            {collected ? '知道了' : '略過'}
          </button>
        </div>
      </div>
    </div>
  )
}
