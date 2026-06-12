export type AppScreen = 'upload' | 'analysis' | 'game'

const STEPS: { id: AppScreen; num: string; label: string }[] = [
  { id: 'upload', num: '壹', label: '入卷' },
  { id: 'analysis', num: '貳', label: '析文' },
  { id: 'game', num: '叁', label: '演繹' },
]

interface AppHeaderProps {
  screen: AppScreen
  storyTitle?: string
  /** 遊戲中：精簡頂欄，不顯示三步進度 */
  compact?: boolean
}

function DoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden focusable="false">
      <path
        d="M2.5 7.2 5.8 10.5 11.5 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AppHeader({ screen, storyTitle, compact = false }: AppHeaderProps) {
  const activeIndex = STEPS.findIndex((s) => s.id === screen)

  return (
    <header
      className={`app-header ${compact ? 'app-header-compact' : ''} ${
        screen === 'upload' && !compact ? 'app-header-upload' : ''
      }`}
    >
      <div className="app-brand">
        {!compact && (
          <span className="brand-seal" aria-hidden="true">
            史
          </span>
        )}
        <div className="brand-text">
          <span className="brand-name">{compact ? (storyTitle ?? '演繹中') : '互動故事遊戲'}</span>
          {storyTitle && screen !== 'upload' && !compact && (
            <span className="brand-story">{storyTitle}</span>
          )}
        </div>
      </div>
      {!compact && (
        <nav className="app-progress" aria-label="遊戲進度">
          <ol className="scroll-progress">
            {STEPS.map((step, i) => {
              const state =
                i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending'
              return (
                <li key={step.id} className={`scroll-progress-step scroll-progress-${state}`}>
                  <span className="scroll-progress-seal" aria-current={state === 'active' ? 'step' : undefined}>
                    {state === 'done' ? <DoneIcon /> : step.num}
                  </span>
                  <span className="scroll-progress-label">{step.label}</span>
                  {i < STEPS.length - 1 && (
                    <span className="scroll-progress-brush" aria-hidden="true" />
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}
    </header>
  )
}
