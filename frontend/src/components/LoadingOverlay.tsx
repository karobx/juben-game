import { ScrollIllustration } from './ScrollIllustration'

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = '展卷中…' }: LoadingOverlayProps) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="loading-scroll-wrap">
          <ScrollIllustration className="loading-scroll" width={120} height={54} />
        </div>
        <p className="loading-message">{message}</p>
        <div className="loading-bar" aria-hidden="true">
          <div className="loading-bar-fill" />
        </div>
      </div>
    </div>
  )
}
