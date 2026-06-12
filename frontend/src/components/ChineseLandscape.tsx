/** 全站固定背景：宣紙底上的淡墨遠山（無動畫、無假雲） */
export function ChineseLandscape() {
  return (
    <div className="landscape-bg" aria-hidden="true">
      <svg
        className="landscape-svg"
        viewBox="0 0 1440 520"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="landInkFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2e9d8" stopOpacity="0" />
            <stop offset="45%" stopColor="#f2e9d8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#e8dfd0" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="landInkFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8a9490" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#8a9490" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="landInkMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5c6862" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#5c6862" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="landInkNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#424d48" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#424d48" stopOpacity="0.14" />
          </linearGradient>
          <filter id="landMist" x="-8%" y="-8%" width="116%" height="116%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <rect width="1440" height="520" fill="url(#landInkFade)" />
        <g filter="url(#landMist)" opacity="0.85">
          <path
            d="M0 280 C200 220, 380 250, 520 200 S820 240, 980 190 S1180 230, 1440 210 L1440 520 L0 520 Z"
            fill="url(#landInkFar)"
          />
          <path
            d="M0 340 C180 300, 360 320, 500 290 C660 330, 820 300, 980 320 S1240 300, 1440 330 L1440 520 L0 520 Z"
            fill="url(#landInkMid)"
          />
        </g>
        <path
          d="M0 400 C220 370, 420 390, 600 365 C780 395, 960 375, 1140 388 L1440 380 L1440 520 L0 520 Z"
          fill="url(#landInkNear)"
        />
      </svg>
    </div>
  )
}
