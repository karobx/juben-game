import { useEffect, useRef, useState } from 'react'
import { CoverFooterLandscape } from '../components/CoverFooterLandscape'
import { ForkPathIcon, ReturnPathIcon, ScrollPlayIcon } from '../components/FeatureIcons'
import { ScrollIllustration } from '../components/ScrollIllustration'
import { fetchChistoryPeriodsWithFallback, type ChistoryPeriod } from '../services/chistoryService'
import { uploadFile } from '../services/uploadService'
import type { UploadResult } from '../models/story'
import {
  DEFAULT_PERIOD_ID,
  loadChistoryProgress,
} from '../utils/chistoryProgress'

interface Props {
  onUploaded: (result: UploadResult) => void
  onDemo: () => void
  onPlayPeriod: (periodId: string, options?: { resume?: boolean }) => void
}

type UploadPhase = 'idle' | 'uploading' | 'success' | 'error'

const FEATURES = [
  { icon: ForkPathIcon, title: '雙路線抉擇' },
  { icon: ReturnPathIcon, title: '偏離可回頭' },
  { icon: ScrollPlayIcon, title: '上傳即開玩' },
] as const

const PERIOD_SEAL: Record<string, string> = {
  pre_qin: '夏',
  qin_han: '秦',
  three_kingdoms: '魏',
  sui_tang: '唐',
}

const PERIOD_TAGLINE: Record<string, string> = {
  pre_qin: '文明肇始，禮樂初興',
  qin_han: '一統天下，漢承秦制',
  three_kingdoms: '群雄並起，風雲流轉',
  sui_tang: '盛世開元，萬邦來朝',
}

export function UploadView({ onUploaded, onDemo, onPlayPeriod }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<UploadPhase>('idle')
  const [message, setMessage] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [periods, setPeriods] = useState<ChistoryPeriod[]>([])
  const [periodsError, setPeriodsError] = useState('')
  const [selectedPeriodId, setSelectedPeriodId] = useState(DEFAULT_PERIOD_ID)
  const [savedProgress] = useState(() => loadChistoryProgress())

  const selectedPeriod =
    periods.find((p) => p.id === selectedPeriodId) ??
    periods.find((p) => p.id === DEFAULT_PERIOD_ID)

  const hasResume =
    Boolean(savedProgress?.lastSceneId) && savedProgress?.periodId === selectedPeriodId

  useEffect(() => {
    fetchChistoryPeriodsWithFallback().then(({ periods, warning }) => {
      setPeriods(periods)
      setPeriodsError(warning ?? '')
    })
  }, [])

  async function handleFile(file: File) {
    const ext = file.name.toLowerCase()
    if (!ext.endsWith('.pdf') && !ext.endsWith('.txt')) {
      setPhase('error')
      setMessage('請上傳 PDF 或 TXT 檔案')
      return
    }

    setPhase('uploading')
    setMessage('正在展卷析文，請稍候…')
    try {
      const result = await uploadFile(file)
      setPhase('success')
      setMessage(`「${result.filename}」已入卷！`)
      onUploaded(result)
    } catch (err) {
      setPhase('error')
      setMessage(err instanceof Error ? err.message : '上傳失敗')
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  function handlePeriodSelect(period: ChistoryPeriod) {
    if (period.immersive === false) return
    setSelectedPeriodId(period.id)
  }

  function handlePlaySelected() {
    if (!selectedPeriod) return
    if (selectedPeriod.immersive === false) {
      window.alert('此時期的沉浸式版本即將推出，請先體驗其他完整版。')
      return
    }
    onPlayPeriod(selectedPeriod.id, { resume: hasResume })
  }

  const playLabel = selectedPeriod
    ? hasResume
      ? `續行${selectedPeriod.title}`
      : `開卷${selectedPeriod.title}`
    : '開卷試玩'

  return (
    <section className="upload-view scroll-entry">
      <article className="upload-scroll-card scroll-cover">
        <span className="corner corner-tl" aria-hidden />
        <span className="corner corner-tr" aria-hidden />
        <span className="corner corner-bl" aria-hidden />
        <span className="corner corner-br" aria-hidden />

        <div className="scroll-cover-body">
          <div className="scroll-cover-grid">
            <header className="scroll-hero scroll-hero-cover">
              <p className="scroll-epigraph">互動歷史說書</p>
              <h1 className="scroll-title">
                把<span className="title-em">故事</span>變成
                <span className="title-em-alt">遊戲</span>
              </h1>
              <p className="scroll-lead">探索線索、做出抉擇、揭曉史實</p>
              <ul className="scroll-virtues" aria-label="玩法特色">
                {FEATURES.map(({ icon: Icon, title }) => (
                  <li key={title} className="scroll-virtue">
                    <Icon className="scroll-virtue-icon" />
                    <span>{title}</span>
                  </li>
                ))}
              </ul>
            </header>

            <section className="scroll-submit scroll-submit-inline" aria-labelledby="submit-title">
              <h2 className="section-heading section-heading-cinnabar" id="submit-title">
                呈上手稿
              </h2>
              <div
                className={`manuscript-drop manuscript-drop-cover manuscript-drop-horizontal ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="拖放或選擇 PDF、TXT 書稿"
                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
              >
                <ScrollIllustration width={80} height={36} />
                <p className="manuscript-drop-title">點擊或拖曳檔案至此上傳</p>
                <p className="manuscript-drop-hint">PDF · TXT</p>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.txt"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleFile(file)
                }}
              />

              {phase !== 'idle' && (
                <div className={`status status-compact status-${phase}`} aria-live="polite">
                  {phase === 'uploading' && <div className="progress-bar" />}
                  <p>{message}</p>
                </div>
              )}
            </section>

            <section className="trial-games" aria-labelledby="trial-games-title">
            <div className="trial-games-header">
              <h2 className="section-heading" id="trial-games-title">
                試玩遊戲
              </h2>
              <a
                className="trial-games-link"
                href="https://chistory.kanhan.com/tc/f1-reading-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                查看全部
              </a>
            </div>

            {periodsError && <p className="chistory-error">{periodsError}</p>}

            <div className="dynasty-cards" role="list" aria-label="歷史時期試玩">
              {periods.map((period) => {
                const isLive = period.immersive !== false
                const isSelected = period.id === selectedPeriodId
                const isFeatured = period.id === DEFAULT_PERIOD_ID
                return (
                  <button
                    key={period.id}
                    type="button"
                    role="listitem"
                    data-period={period.id}
                    className={`dynasty-card ${isSelected ? 'dynasty-card-selected' : ''} ${
                      isFeatured ? 'dynasty-card-featured' : ''
                    } ${isLive ? '' : 'dynasty-card-soon'}`}
                    onClick={() => handlePeriodSelect(period)}
                    disabled={!isLive}
                    aria-pressed={isSelected}
                  >
                    {isFeatured && <span className="dynasty-card-badge">推</span>}
                    <span className="dynasty-card-name">{period.title}</span>
                    <span className="dynasty-card-seal" aria-hidden="true">
                      {PERIOD_SEAL[period.id] ?? '史'}
                    </span>
                    <span className="dynasty-card-tagline">
                      {PERIOD_TAGLINE[period.id] ?? period.subtitle}
                    </span>
                    <span className="dynasty-card-meta">
                      <span className="dynasty-chapters">{period.chapterCount} 章</span>
                      {isLive ? (
                        <span className="dynasty-badge dynasty-badge-live">可開卷</span>
                      ) : (
                        <span className="dynasty-badge dynasty-badge-soon">即將推出</span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="trial-games-actions">
              <button type="button" className="btn btn-scroll-open btn-scroll-open-wide" onClick={handlePlaySelected}>
                <ScrollIllustration width={30} height={17} className="btn-scroll-icon" />
                {playLabel}
              </button>
              <button type="button" className="btn btn-text btn-demo-link" onClick={onDemo}>
                試玩示範（6 幕）
              </button>
            </div>
            </section>
          </div>
        </div>

        <CoverFooterLandscape />
      </article>
    </section>
  )
}
