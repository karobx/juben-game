import type { ChistoryPeriod } from '../services/chistoryService'

/** Shown when `/api/chistory/periods` is unreachable (e.g. backend not running). */
export const CHISTORY_PERIODS_FALLBACK: ChistoryPeriod[] = [
  {
    id: 'pre_qin',
    title: '史前至夏商周',
    subtitle: '中華民族起源、西周封建與春秋戰國變局',
    chapterCount: 8,
    sourceUrl: 'https://chistory.kanhan.com/tc/f1-reading-card',
    immersive: true,
  },
  {
    id: 'qin_han',
    title: '秦漢',
    subtitle: '大一統帝國的建立、發展與中外文化交流',
    chapterCount: 8,
    sourceUrl: 'https://chistory.kanhan.com/tc/f1-reading-card',
    immersive: true,
  },
  {
    id: 'three_kingdoms',
    title: '三國兩晉南北朝',
    subtitle: '分裂政局、江南開發與社會文化發展',
    chapterCount: 7,
    sourceUrl: 'https://chistory.kanhan.com/tc/f1-reading-card',
    immersive: true,
  },
  {
    id: 'sui_tang',
    title: '隋唐',
    subtitle: '盛世開創、安史之亂與開放的唐朝社會',
    chapterCount: 12,
    sourceUrl: 'https://chistory.kanhan.com/tc/f1-reading-card',
    immersive: true,
  },
]
