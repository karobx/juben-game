import { useEffect, useState, type ReactNode } from 'react'
import type { ImagePrompt } from '../models/story'
import { fetchSceneIllustration } from '../services/illustrationService'
import { classifySceneVisual } from './sceneVisualClassifier'
import { SceneMoodArt } from './SceneMoodArt'

interface Props {
  imagePrompt?: ImagePrompt
  narrative?: string
  sceneId?: string
  illustrationUrl?: string
  variant?: 'mainline' | 'deviation'
  /** immersive：橫向 16:9 場景繪卷＋底部漸層疊字（遊戲探索用） */
  layout?: 'card' | 'immersive'
  hotspotOverlay?: ReactNode
  clueBar?: ReactNode
}

/** 優先顯示 AI 歷史插畫；生成中或失敗時以語意化 SVG 備援 */
export function SceneIllustrationCard({
  imagePrompt,
  narrative,
  sceneId,
  illustrationUrl,
  variant = 'mainline',
  layout = 'card',
  hotspotOverlay,
  clueBar,
}: Props) {
  const immersive = layout === 'immersive'
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(illustrationUrl ?? null)
  const [loading, setLoading] = useState(!illustrationUrl)
  const [failed, setFailed] = useState(false)

  const atmosphere = narrative
    ? narrative.replace(/^【[^】]+】\s*/, '').slice(0, 72) + (narrative.length > 72 ? '…' : '')
    : imagePrompt?.prompt.slice(0, 72) + ((imagePrompt?.prompt.length ?? 0) > 72 ? '…' : '')

  const visualSpec = classifySceneVisual(narrative, imagePrompt?.prompt, imagePrompt?.moodKeywords)

  useEffect(() => {
    if (illustrationUrl) {
      setAiImageUrl(illustrationUrl)
      setLoading(false)
      setFailed(false)
      return
    }

    if (!narrative && !imagePrompt) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setFailed(false)

    fetchSceneIllustration(narrative ?? '', imagePrompt, sceneId)
      .then((url) => {
        if (cancelled) return
        if (url) {
          setAiImageUrl(url)
        } else {
          setFailed(true)
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [narrative, imagePrompt, sceneId, illustrationUrl])

  if (!imagePrompt && !narrative) {
    return null
  }

  return (
    <figure
      className={`scene-illustration scene-illustration-${variant} ${immersive ? 'scene-illustration-immersive' : ''}`}
    >
      <div className={`scene-illustration-visual ${loading ? 'scene-illustration-loading' : ''}`}>
        {aiImageUrl && !failed ? (
          <img
            key={aiImageUrl}
            src={aiImageUrl}
            alt={`${visualSpec.label}場景插畫`}
            className="scene-illustration-image"
            loading="lazy"
          />
        ) : (
          <SceneMoodArt
            narrative={narrative}
            prompt={imagePrompt?.prompt}
            moodKeywords={imagePrompt?.moodKeywords}
            variant={variant}
          />
        )}
        {loading && <div className="scene-illustration-shimmer" aria-hidden="true" />}
        <div
          className={`scene-illustration-overlay ${immersive ? 'scene-illustration-overlay-immersive' : ''}`}
          aria-hidden="true"
        />
        {immersive && narrative && (
          <div className="scene-narrative-panel">
            <p className="scene-narrative-text">{narrative}</p>
          </div>
        )}
        {hotspotOverlay}
        {clueBar}
        <span className="scene-illustration-badge">{visualSpec.label}</span>
      </div>
      {!immersive && (
        <figcaption className="scene-illustration-caption-block">
          <span className="scene-illustration-label">
            {aiImageUrl && !failed ? '歷史繪卷' : '場景繪卷'}
          </span>
          <p className="scene-illustration-caption">{atmosphere}</p>
        </figcaption>
      )}
    </figure>
  )
}
