import type { Hotspot } from '../models/story'
import { resolveHotspotPosition } from '../utils/hotspotLayout'

interface Props {
  hotspots: Hotspot[]
  collectedClueIds: string[]
  activeClueId: string | null
  onSelect: (hotspot: Hotspot) => void
}

export function IllustrationHotspotLayer({
  hotspots,
  collectedClueIds,
  activeClueId,
  onSelect,
}: Props) {
  if (hotspots.length === 0) return null

  return (
    <div className="illustration-hotspot-layer" aria-label="繪卷探索熱點">
      {hotspots.map((hotspot, index) => {
        const { x, y } = resolveHotspotPosition(hotspot, index)
        const collected = collectedClueIds.includes(hotspot.id)
        const active = activeClueId === hotspot.id

        return (
          <button
            key={hotspot.id}
            type="button"
            className={`illustration-hotspot ${collected ? 'illustration-hotspot-collected' : ''} ${
              active ? 'illustration-hotspot-active' : ''
            } ${hotspot.replayOnly ? 'illustration-hotspot-replay' : ''}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => onSelect(hotspot)}
            aria-label={hotspot.label}
            aria-pressed={active}
          >
            <span className="illustration-hotspot-pulse" aria-hidden="true" />
            <span className="illustration-hotspot-core" aria-hidden="true">
              {collected ? '✓' : '○'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
