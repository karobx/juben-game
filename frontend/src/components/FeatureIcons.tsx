interface IconProps {
  className?: string
}

export function ForkPathIcon({ className }: IconProps) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M8 32V8M8 20h12M20 20l12-12M20 20l12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ReturnPathIcon({ className }: IconProps) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M28 12H12a6 6 0 0 0-6 6v10M8 22l-4 4 4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="12" r="4" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function ScrollPlayIcon({ className }: IconProps) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <rect x="6" y="10" width="22" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M28 14v16l8-8-8-8z" fill="currentColor" />
    </svg>
  )
}
