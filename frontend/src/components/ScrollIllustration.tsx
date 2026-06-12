import { useId } from 'react'

/** 橫卷線描 — 宣紙、木軸、朱印，呼應入卷主題 */
interface ScrollIllustrationProps {
  className?: string
  width?: number
  height?: number
}

export function ScrollIllustration({
  className = 'scroll-illustration',
  width = 120,
  height = 54,
}: ScrollIllustrationProps) {
  const uid = useId().replace(/:/g, '')

  return (
    <svg
      className={className}
      viewBox="0 0 160 72"
      width={width}
      height={height}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`scroll-rod-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5c4033" />
          <stop offset="35%" stopColor="#6b4f3a" />
          <stop offset="65%" stopColor="#4a3428" />
          <stop offset="100%" stopColor="#3d2a20" />
        </linearGradient>
        <linearGradient id={`scroll-paper-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#faf6ec" />
          <stop offset="50%" stopColor="#f5f0e3" />
          <stop offset="100%" stopColor="#ebe3d2" />
        </linearGradient>
      </defs>

      {/* 左軸 — 圓頭木桿 */}
      <g>
        <rect x="8" y="8" width="12" height="56" rx="6" fill={`url(#scroll-rod-${uid})`} />
        <ellipse cx="14" cy="8" rx="6" ry="3.5" fill="#7a5c48" />
        <ellipse cx="14" cy="64" rx="6" ry="3.5" fill="#3d2a20" />
        <rect x="10.5" y="14" width="1.2" height="44" rx="0.6" fill="#8a6a52" opacity="0.35" />
      </g>

      {/* 右軸 */}
      <g>
        <rect x="140" y="8" width="12" height="56" rx="6" fill={`url(#scroll-rod-${uid})`} />
        <ellipse cx="146" cy="8" rx="6" ry="3.5" fill="#7a5c48" />
        <ellipse cx="146" cy="64" rx="6" ry="3.5" fill="#3d2a20" />
        <rect x="148.3" y="14" width="1.2" height="44" rx="0.6" fill="#8a6a52" opacity="0.35" />
      </g>

      {/* 紙面 — 微弧橫卷 */}
      <path
        d="M24 18 C56 15, 104 15, 136 18 L136 54 C104 57, 56 57, 24 54 Z"
        fill={`url(#scroll-paper-${uid})`}
        stroke="#c8b99a"
        strokeWidth="0.8"
      />

      {/* 紙面上下淡影 */}
      <path
        d="M24 18 C56 15, 104 15, 136 18"
        fill="none"
        stroke="#2c1810"
        strokeWidth="0.5"
        strokeOpacity="0.06"
      />
      <path
        d="M24 54 C56 57, 104 57, 136 54"
        fill="none"
        stroke="#2c1810"
        strokeWidth="0.5"
        strokeOpacity="0.08"
      />

      {/* 墨線 — 四行淡灰橫線 */}
      <g stroke="#8a8278" strokeLinecap="round" fill="none">
        <line x1="34" y1="27" x2="126" y2="27" strokeWidth="1" opacity="0.45" />
        <line x1="34" y1="34" x2="126" y2="34" strokeWidth="1" opacity="0.38" />
        <line x1="34" y1="41" x2="126" y2="41" strokeWidth="1" opacity="0.32" />
        <line x1="34" y1="48" x2="126" y2="48" strokeWidth="1" opacity="0.26" />
      </g>

      {/* 朱印 */}
      <g transform="translate(110 44)">
        <rect x="0" y="0" width="15" height="15" rx="0.8" fill="#b33c3c" />
        <text
          x="7.5"
          y="11.5"
          textAnchor="middle"
          fill="#faf6ee"
          fontSize="9.5"
          fontFamily="'Ma Shan Zheng', 'Noto Serif TC', serif"
        >
          史
        </text>
      </g>
    </svg>
  )
}
