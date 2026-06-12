/** 入卷封面底欄 — 橫卷山水片段（暖墨、留白、筆觸質感） */
export function CoverFooterLandscape() {
  return (
    <div className="scroll-cover-landscape" aria-hidden="true">
      <svg
        className="scroll-cover-landscape-svg"
        viewBox="0 0 920 200"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="coverSkyFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4ecdc" stopOpacity="0" />
            <stop offset="38%" stopColor="#f4ecdc" stopOpacity="0" />
            <stop offset="72%" stopColor="#efe6d4" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#e8dfd0" stopOpacity="0.85" />
          </linearGradient>

          <filter id="coverBrushGrain" x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="2" seed="8" result="grain" />
            <feColorMatrix
              in="grain"
              type="matrix"
              values="0 0 0 0 0.16
                      0 0 0 0 0.12
                      0 0 0 0 0.09
                      0 0 0 0.14 0"
              result="inkGrain"
            />
            <feBlend in="SourceGraphic" in2="inkGrain" mode="multiply" />
          </filter>

          <filter id="coverMistSoft" x="-5%" y="-20%" width="110%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>

          <filter id="coverDryEdge" x="-4%" y="-4%" width="108%" height="108%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="3" result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        <rect width="920" height="200" fill="url(#coverSkyFade)" />

        {/* 遠山 — 淡墨、不對稱峰形 */}
        <g filter="url(#coverMistSoft)" opacity="0.55">
          <path
            d="M-30 118 L72 96 148 108 226 88 318 102 402 78 498 94 586 72 678 90 768 68 860 86 950 74 950 200 -30 200 Z"
            fill="#5c5248"
            opacity="0.11"
          />
          <path
            d="M-30 132 L108 114 196 124 284 106 376 118 468 100 556 116 648 98 736 112 828 96 950 108 950 200 -30 200 Z"
            fill="#4a423a"
            opacity="0.09"
          />
        </g>

        {/* 中景山巒 */}
        <g filter="url(#coverDryEdge)" opacity="0.88">
          <path
            d="M-40 142 C48 128, 118 138, 188 122 C258 136, 332 118, 408 130 C484 116, 558 132, 634 118 C710 128, 786 114, 862 126 L950 120 L950 200 L-40 200 Z"
            fill="#3d3630"
            opacity="0.16"
          />
          <path
            d="M-40 156 C62 146, 142 154, 222 142 C302 152, 388 140, 468 150 C548 138, 628 148, 712 136 C792 146, 872 134, 950 144 L950 200 L-40 200 Z"
            fill="#2f2a26"
            opacity="0.2"
          />
        </g>

        {/* 近岸與水線 */}
        <path
          d="M-40 172 C120 164, 240 170, 360 162 C480 168, 600 160, 720 166 C820 162, 900 168, 950 164"
          fill="none"
          stroke="#2c2420"
          strokeWidth="1.2"
          strokeOpacity="0.22"
          strokeLinecap="round"
        />
        <path
          d="M-40 184 C140 176, 280 182, 420 174 C560 180, 700 172, 840 178 L950 174 L950 200 L-40 200 Z"
          fill="#2c2420"
          opacity="0.12"
          filter="url(#coverBrushGrain)"
        />

        {/* 松 — 簡筆枯筆，非卡通填色 */}
        <g stroke="#2c2420" strokeLinecap="round" fill="none" opacity="0.38">
          <path d="M118 184 C116 168, 120 152, 126 138" strokeWidth="1.4" />
          <path d="M126 150 C112 146, 104 138, 98 128" strokeWidth="1" opacity="0.7" />
          <path d="M124 162 C136 158, 144 150, 150 142" strokeWidth="0.9" opacity="0.65" />
          <path d="M122 172 C108 170, 100 166, 94 160" strokeWidth="0.8" opacity="0.55" />
        </g>
        <g stroke="#2c2420" strokeLinecap="round" fill="none" opacity="0.32">
          <path d="M798 178 C796 164, 800 150, 806 136" strokeWidth="1.3" />
          <path d="M806 148 C818 144, 826 136, 832 126" strokeWidth="0.9" opacity="0.7" />
          <path d="M804 160 C792 158, 784 152, 778 146" strokeWidth="0.85" opacity="0.6" />
        </g>

        {/* 江面薄霧 */}
        <rect x="0" y="118" width="920" height="42" fill="#f4ecdc" opacity="0.35" filter="url(#coverMistSoft)" />

        {/* 極淡水紋 */}
        <g stroke="#2c2420" strokeOpacity="0.06" strokeWidth="0.8" fill="none">
          <path d="M40 168 C180 164, 320 170, 460 166 C600 170, 740 164, 880 168" />
          <path d="M80 176 C220 172, 360 178, 500 174 C640 178, 780 172, 900 176" />
        </g>
      </svg>
    </div>
  )
}
