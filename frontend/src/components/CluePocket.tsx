import type { CSSProperties } from 'react'
import type { Hotspot } from '../models/story'

interface Props {
  collectedHotspots: Hotspot[]
  requiredCount: number
  variant?: 'dock' | 'inline' | 'floating'
  receivingId?: string | null
  onSelectClue?: (hotspotId: string) => void
  activeClueId?: string | null
}

export function CluePocket({
  collectedHotspots,
  requiredCount,
  variant = 'dock',
  receivingId,
  onSelectClue,
  activeClueId,
}: Props) {
  const count = collectedHotspots.length
  const full = requiredCount > 0 && count >= requiredCount

  return (
    <div
      className={`clue-pocket clue-pocket-${variant} ${full ? 'clue-pocket-full' : ''} ${
        receivingId ? 'clue-pocket-receiving' : ''
      }`}
      aria-label={`線索袋，已收 ${count} 條${requiredCount > 0 ? `，目標 ${requiredCount} 條` : ''}`}
    >
      <div className="clue-pocket-visual" aria-hidden="true">
        <div className="clue-pocket-body">
          <div className="clue-pocket-rim" />
          <div className="clue-pocket-opening" />
          <div className="clue-pocket-scrolls">
            {collectedHotspots.slice(0, 4).map((hotspot, index) => (
              <span
                key={hotspot.id}
                className={`clue-pocket-scroll ${
                  receivingId === hotspot.id ? 'clue-pocket-scroll-new' : ''
                }`}
                style={{ '--scroll-i': index } as CSSProperties}
              />
            ))}
          </div>
        </div>
        <span className="clue-pocket-tie" />
      </div>

      <div className="clue-pocket-meta">
        <span className="clue-pocket-label">線索袋</span>
        <span className="clue-pocket-count">
          {count}
          {requiredCount > 0 ? ` / ${requiredCount}` : ''}
        </span>
      </div>

      {(variant === 'dock' || variant === 'floating') && collectedHotspots.length > 0 && (
        <ul className="clue-pocket-list">
          {collectedHotspots.map((hotspot) => (
            <li key={hotspot.id}>
              <button
                type="button"
                className={`clue-pocket-item ${
                  activeClueId === hotspot.id ? 'clue-pocket-item-active' : ''
                }`}
                onClick={() => onSelectClue?.(hotspot.id)}
              >
                {hotspot.clue.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
