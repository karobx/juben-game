/** 角色選擇用肖像：有名稱對應圖時顯示頭像，否則以簡化插畫代替 */
interface Props {
  name: string
  selected?: boolean
  className?: string
}

/** 角色頭像（繁簡名稱皆對應） */
const PORTRAIT_IMAGES: Record<string, string> = {
  // 史前至夏商周
  三皇五帝: '/avatars/sanhuang-wudi.png',
  周武王: '/avatars/zhou-wuwang.png',
  周厉王: '/avatars/zhou-liwang.png',
  周厲王: '/avatars/zhou-liwang.png',
  楚庄王: '/avatars/chu-zhuangwang.png',
  楚莊王: '/avatars/chu-zhuangwang.png',
  春秋: '/avatars/chunqiu-scholar.png',
  秦国: '/avatars/qin-state.png',
  秦國: '/avatars/qin-state.png',
  // 三國兩晉南北朝
  曹操: '/avatars/cao-cao.png',
  刘备: '/avatars/liu-bei.png',
  劉備: '/avatars/liu-bei.png',
  孝文帝: '/avatars/xiaowen-di.png',
  孙权: '/avatars/sun-quan.png',
  孫權: '/avatars/sun-quan.png',
  晋武帝: '/avatars/jin-wudi.png',
  晉武帝: '/avatars/jin-wudi.png',
  北伐: '/avatars/beifa.png',
  // 隋唐
  唐代: '/avatars/tang-dai.png',
  唐朝: '/avatars/tang-dai.png',
  安禄山: '/avatars/an-lushan.png',
  安祿山: '/avatars/an-lushan.png',
  隋文帝: '/avatars/sui-wendi.png',
  隋炀帝: '/avatars/sui-yangdi.png',
  隋煬帝: '/avatars/sui-yangdi.png',
  唐军: '/avatars/tang-jun.png',
  唐軍: '/avatars/tang-jun.png',
  唐太宗: '/avatars/tang-taizong.png',
  // 秦漢
  秦始皇: '/avatars/qin-shi-huang.png',
  秦始皇帝: '/avatars/qin-shi-huang.png',
  漢武帝: '/avatars/han-wudi.png',
  汉武帝: '/avatars/han-wudi.png',
  張騫: '/avatars/zhang-qian.png',
  张骞: '/avatars/zhang-qian.png',
  劉邦: '/avatars/liu-bang.png',
  刘邦: '/avatars/liu-bang.png',
  項羽: '/avatars/xiang-yu.png',
  项羽: '/avatars/xiang-yu.png',
  李斯: '/avatars/li-si.png',
  赵高: '/avatars/zhao-gao.png',
  趙高: '/avatars/zhao-gao.png',
}

function getInitial(name: string): string {
  return name.charAt(0) || '？'
}

export function CharacterPortrait({ name, selected = false, className = '' }: Props) {
  const imageSrc = PORTRAIT_IMAGES[name]
  const portraitClass = `character-portrait ${selected ? 'character-portrait-selected' : ''} ${className}`.trim()

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={`${name} 肖像`}
        className={`${portraitClass} character-portrait-img`.trim()}
      />
    )
  }

  const initial = getInitial(name)
  const ring = selected ? '#1f5c45' : 'rgba(44, 24, 16, 0.2)'

  return (
    <svg
      className={portraitClass}
      viewBox="0 0 80 96"
      aria-hidden
      focusable="false"
    >
      <ellipse cx="40" cy="88" rx="28" ry="6" fill="#2c1810" opacity="0.08" />
      <circle cx="40" cy="40" r="32" fill="#faf6ee" stroke={ring} strokeWidth={selected ? 3 : 2} />
      <path
        d="M16 78 Q40 58 64 78"
        fill="none"
        stroke="#1f5c45"
        strokeWidth="2"
        opacity="0.35"
      />
      <text
        x="40"
        y="48"
        textAnchor="middle"
        fontFamily="'Ma Shan Zheng', 'Noto Serif TC', serif"
        fontSize="28"
        fill="#1f5c45"
      >
        {initial}
      </text>
      <rect x="28" y="62" width="24" height="18" rx="4" fill="#e8f2ec" stroke="#1f5c45" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}
