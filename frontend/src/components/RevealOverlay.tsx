import type { ChoiceReveal, RevealVerdict } from '../models/story'

const VERDICT_LABELS: Record<RevealVerdict, string> = {
  historical: '符合史實',
  divergent: '偏離史實',
  return: '重返正史',
  persist: '歷史改寫',
}

const VERDICT_SEALS: Record<RevealVerdict, string> = {
  historical: '史',
  divergent: '偏',
  return: '返',
  persist: '終',
}

interface Props {
  reveal: ChoiceReveal
  onContinue: () => void
}

export function RevealOverlay({ reveal, onContinue }: Props) {
  const isPositive = reveal.verdict === 'historical' || reveal.verdict === 'return'

  return (
    <div className="reveal-overlay" role="dialog" aria-modal="true" aria-labelledby="reveal-title">
      <div className={`reveal-panel ${isPositive ? 'reveal-panel-positive' : 'reveal-panel-warning'}`}>
        <div className={`reveal-seal ${isPositive ? 'reveal-seal-positive' : 'reveal-seal-warning'}`} aria-hidden="true">
          {VERDICT_SEALS[reveal.verdict]}
        </div>
        <p className="reveal-verdict" id="reveal-title">
          {VERDICT_LABELS[reveal.verdict]}
        </p>
        <p className="reveal-history">{reveal.historyNote}</p>
        <p className="reveal-consequence">{reveal.consequence}</p>
        <button type="button" className="btn btn-primary btn-lg reveal-continue" onClick={onContinue}>
          繼續
        </button>
      </div>
    </div>
  )
}
