import type { SceneVisualType } from './sceneVisualClassifier'
import { classifySceneVisual } from './sceneVisualClassifier'

interface Props {
  narrative?: string
  prompt?: string
  moodKeywords?: string[]
  variant?: 'mainline' | 'deviation'
  className?: string
}

function SceneMotif({
  type,
  accent,
  danger,
}: {
  type: SceneVisualType
  accent: string
  danger: string
}) {
  switch (type) {
    case 'great_wall':
      return (
        <g>
          <path
            d="M20 118 L55 95 L90 108 L125 82 L160 98 L195 72 L230 88 L265 68 L300 80"
            fill="none"
            stroke={accent}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M20 122 L55 99 L90 112 L125 86 L160 102 L195 76 L230 92 L265 72 L300 84"
            fill="none"
            stroke="#2c1810"
            strokeWidth="1.5"
            opacity="0.35"
          />
          <rect x="88" y="96" width="18" height="22" fill="#faf6ee" stroke={accent} strokeWidth="1.5" />
          <rect x="92" y="100" width="4" height="6" fill={accent} opacity="0.5" />
          <rect x="100" y="100" width="4" height="6" fill={accent} opacity="0.5" />
          <rect x="186" y="70" width="16" height="20" fill="#faf6ee" stroke={accent} strokeWidth="1.5" />
          <line x1="40" y1="128" x2="280" y2="128" stroke="#2c1810" strokeWidth="1" opacity="0.2" />
        </g>
      )

    case 'grand_palace':
      return (
        <g>
          <rect x="108" y="88" width="104" height="44" fill="#faf6ee" stroke={accent} strokeWidth="2" />
          <polygon points="160,52 96,88 224,88" fill={accent} opacity="0.9" />
          <rect x="132" y="68" width="56" height="20" fill={accent} opacity="0.35" />
          <polygon points="160,38 120,68 200,68" fill={danger} opacity="0.55" />
          <rect x="148" y="104" width="24" height="28" fill={accent} opacity="0.45" />
          <line x1="118" y1="98" x2="202" y2="98" stroke="#2c1810" strokeWidth="1" opacity="0.25" />
          <line x1="118" y1="108" x2="202" y2="108" stroke="#2c1810" strokeWidth="1" opacity="0.2" />
          <rect x="72" y="108" width="28" height="24" fill="#faf6ee" stroke={accent} strokeWidth="1" opacity="0.7" />
          <rect x="220" y="108" width="28" height="24" fill="#faf6ee" stroke={accent} strokeWidth="1" opacity="0.7" />
        </g>
      )

    case 'book_burning':
      return (
        <g>
          <ellipse cx="160" cy="128" rx="52" ry="14" fill="#2c1810" opacity="0.15" />
          <path d="M130 128 Q160 88 190 128 Z" fill={danger} opacity="0.75" />
          <path d="M138 124 Q160 96 182 124" fill="#f5a623" opacity="0.85" />
          <rect x="118" y="118" width="16" height="10" fill="#faf6ee" stroke="#2c1810" strokeWidth="0.8" transform="rotate(-18 126 123)" />
          <rect x="148" y="112" width="18" height="11" fill="#faf6ee" stroke="#2c1810" strokeWidth="0.8" transform="rotate(8 157 117)" />
          <rect x="178" y="118" width="16" height="10" fill="#faf6ee" stroke="#2c1810" strokeWidth="0.8" transform="rotate(22 186 123)" />
        </g>
      )

    case 'uprising':
      return (
        <g>
          <line x1="88" y1="132" x2="88" y2="78" stroke="#5c4a3a" strokeWidth="2.5" />
          <polygon points="88,72 76,88 100,88" fill={danger} />
          <line x1="160" y1="132" x2="160" y2="70" stroke="#5c4a3a" strokeWidth="2.5" />
          <rect x="148" y="58" width="24" height="16" fill={danger} opacity="0.85" />
          <line x1="232" y1="132" x2="232" y2="82" stroke="#5c4a3a" strokeWidth="2.5" />
          <polygon points="232,76 220,92 244,92" fill={danger} />
          <circle cx="88" cy="132" r="8" fill="#2c1810" opacity="0.35" />
          <circle cx="160" cy="132" r="8" fill="#2c1810" opacity="0.35" />
          <circle cx="232" cy="132" r="8" fill="#2c1810" opacity="0.35" />
        </g>
      )

    case 'court':
      return (
        <g>
          <rect x="96" y="108" width="128" height="24" fill="#faf6ee" stroke={accent} strokeWidth="1.5" />
          <rect x="140" y="72" width="40" height="36" fill={accent} opacity="0.25" stroke={accent} strokeWidth="1.5" />
          <circle cx="160" cy="86" r="10" fill={danger} opacity="0.7" />
          <rect x="108" y="116" width="12" height="16" fill={accent} opacity="0.5" />
          <rect x="200" y="116" width="12" height="16" fill={accent} opacity="0.5" />
          <line x1="120" y1="100" x2="200" y2="100" stroke="#2c1810" strokeWidth="1" opacity="0.2" />
        </g>
      )

    case 'unification':
      return (
        <g>
          <rect x="118" y="78" width="84" height="52" fill="#faf6ee" stroke={accent} strokeWidth="2" rx="2" />
          <line x1="132" y1="94" x2="188" y2="94" stroke="#2c1810" strokeWidth="2" opacity="0.35" />
          <text x="160" y="112" textAnchor="middle" fontFamily="'Ma Shan Zheng', serif" fontSize="22" fill={accent}>
            一
          </text>
          <circle cx="72" cy="108" r="14" fill={accent} opacity="0.2" stroke={accent} strokeWidth="1" />
          <circle cx="248" cy="108" r="14" fill={accent} opacity="0.2" stroke={accent} strokeWidth="1" />
        </g>
      )

    case 'silk_road':
      return (
        <g>
          <path d="M40 132 Q120 88 200 108 T300 92" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="5 4" opacity="0.55" />
          <ellipse cx="100" cy="118" rx="22" ry="12" fill="#d4a574" opacity="0.55" />
          <ellipse cx="100" cy="108" rx="14" ry="10" fill="#d4a574" opacity="0.7" />
          <ellipse cx="220" cy="112" rx="22" ry="12" fill="#d4a574" opacity="0.55" />
          <ellipse cx="220" cy="102" rx="14" ry="10" fill="#d4a574" opacity="0.7" />
          <path d="M250 70 L270 95 L250 95 Z" fill={accent} opacity="0.35" />
        </g>
      )

    case 'labor':
      return (
        <g>
          <rect x="108" y="96" width="48" height="8" fill="#8b6914" opacity="0.6" />
          <line x1="108" y1="100" x2="88" y2="132" stroke="#5c4a3a" strokeWidth="2" />
          <line x1="156" y1="100" x2="176" y2="132" stroke="#5c4a3a" strokeWidth="2" />
          <circle cx="88" cy="132" r="7" fill="#2c1810" opacity="0.35" />
          <circle cx="176" cy="132" r="7" fill="#2c1810" opacity="0.35" />
          <rect x="188" y="108" width="36" height="6" fill="#8b6914" opacity="0.5" transform="rotate(-12 206 111)" />
          <circle cx="220" cy="126" r="6" fill="#2c1810" opacity="0.3" />
        </g>
      )

    case 'imperial_road':
      return (
        <g>
          <path d="M30 132 L290 132" stroke="#8b6914" strokeWidth="10" opacity="0.35" strokeLinecap="round" />
          <path d="M30 132 L290 132" stroke="#faf6ee" strokeWidth="2" opacity="0.5" strokeDasharray="8 6" />
          <rect x="148" y="108" width="24" height="14" fill={accent} opacity="0.35" rx="2" />
          <line x1="160" y1="92" x2="160" y2="108" stroke="#5c4a3a" strokeWidth="2" />
        </g>
      )

    default:
      return (
        <g>
          <path d="M60 132 L120 78 L180 132 Z" fill={accent} opacity="0.4" />
          <path d="M150 132 L210 88 L270 132 Z" fill={accent} opacity="0.3" />
          <path d="M0 132 Q80 108 160 120 T320 112" fill="none" stroke="#6b8f71" strokeWidth="2" opacity="0.35" />
        </g>
      )
  }
}

export function SceneMoodArt({
  narrative,
  prompt,
  moodKeywords = [],
  variant = 'mainline',
  className = '',
}: Props) {
  const spec = classifySceneVisual(narrative, prompt, moodKeywords)
  const accent = variant === 'mainline' ? '#1f5c45' : '#c8960c'
  const sky = variant === 'mainline' ? '#e8f2ec' : '#faf3dc'
  const danger = '#b33c3c'
  const uid = `${spec.type}-${variant}`

  return (
    <svg
      className={`scene-mood-art ${className}`.trim()}
      viewBox="0 0 320 180"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky} />
          <stop offset="100%" stopColor="#f7f0e3" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#sky-${uid})`} />
      <path
        d="M0 138 Q80 108 160 122 T320 108 L320 180 L0 180 Z"
        fill={accent}
        opacity="0.18"
      />
      <path
        d="M0 152 Q100 128 200 140 T320 132 L320 180 L0 180 Z"
        fill="#2c1810"
        opacity="0.08"
      />

      <SceneMotif type={spec.type} accent={accent} danger={danger} />

      <circle cx="48" cy="42" r="20" fill="#f5d78e" opacity="0.5" />
      <g opacity="0.28">
        <ellipse cx="58" cy="38" rx="26" ry="9" fill="#fff" />
        <ellipse cx="86" cy="36" rx="20" ry="7" fill="#fff" />
      </g>
    </svg>
  )
}
