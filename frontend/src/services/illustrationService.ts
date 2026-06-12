import type { ImagePrompt } from '../models/story'
import { apiUrl } from './apiBase'

export interface IllustrationResult {
  illustrationId: string
  url: string
  cached: boolean
  version?: number
}

const memoryCache = new Map<string, string>()

function buildCacheKey(
  narrative: string,
  imagePrompt?: ImagePrompt,
  sceneId?: string,
  version?: number,
): string {
  if (sceneId) return `scene:${sceneId}:v${version ?? 0}`
  return imagePrompt?.expandedPrompt || imagePrompt?.prompt || narrative
}

function resolveUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return apiUrl(url)
}

async function lookupStoredSceneIllustration(
  sceneId: string,
): Promise<{ url: string; version?: number } | null> {
  const res = await fetch(
    apiUrl(`/api/illustrations/scene/${encodeURIComponent(sceneId)}/lookup`),
  )
  if (!res.ok) return null

  const data = (await res.json()) as IllustrationResult
  return { url: resolveUrl(data.url), version: data.version }
}

export async function fetchSceneIllustration(
  narrative: string,
  imagePrompt?: ImagePrompt,
  sceneId?: string,
): Promise<string | null> {
  if (sceneId) {
    const stored = await lookupStoredSceneIllustration(sceneId)
    if (stored) {
      const cacheKey = buildCacheKey(narrative, imagePrompt, sceneId, stored.version)
      memoryCache.set(cacheKey, stored.url)
      return stored.url
    }
  }

  const cacheKey = buildCacheKey(narrative, imagePrompt, sceneId)
  if (!cacheKey && !sceneId) return null

  const cached = memoryCache.get(cacheKey)
  if (cached) return cached

  if (!narrative && !imagePrompt) return null

  const res = await fetch(apiUrl('/api/illustrations/generate'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ narrative, imagePrompt, sceneId }),
  })

  if (!res.ok) {
    return null
  }

  const data = (await res.json()) as IllustrationResult
  const fullUrl = resolveUrl(data.url)
  const versionedKey = sceneId
    ? buildCacheKey(narrative, imagePrompt, sceneId, data.version)
    : cacheKey
  memoryCache.set(versionedKey, fullUrl)
  return fullUrl
}
