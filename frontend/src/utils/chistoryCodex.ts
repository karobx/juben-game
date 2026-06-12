import {
  CODEX_CARDS_PER_CHAPTER,
  isKnownCodexCardId,
  isChapterCodexComplete,
  getChapterCodexCount,
  getTotalCodexCount,
  getTotalCodexSlots,
} from '../data/qinHanCodex'
import type { StoryGraph } from '../models/story'

const STORAGE_KEY = 'chistory:codex'

export interface CodexProgress {
  periodId: string
  collectedCardIds: string[]
  playthroughCount: number
  /** @deprecated 改用 chapterSecretsViewed */
  chapter1ReachedScene2?: boolean
  /** @deprecated 改用 chapterSecretsViewed */
  secretViewed?: boolean
  chapterSecretsViewed: number[]
}

function defaultProgress(): CodexProgress {
  return {
    periodId: 'qin_han',
    collectedCardIds: [],
    playthroughCount: 1,
    chapterSecretsViewed: [],
  }
}

function migrateProgress(parsed: Partial<CodexProgress>): CodexProgress {
  const base = { ...defaultProgress(), ...parsed, collectedCardIds: parsed.collectedCardIds ?? [] }
  const viewed = new Set(base.chapterSecretsViewed ?? [])
  if (parsed.secretViewed && !viewed.has(1)) {
    viewed.add(1)
  }
  return { ...base, chapterSecretsViewed: [...viewed] }
}

export function loadCodexProgress(): CodexProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    return migrateProgress(JSON.parse(raw) as Partial<CodexProgress>)
  } catch {
    return defaultProgress()
  }
}

export function saveCodexProgress(progress: CodexProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function addCodexCard(cardId: string): CodexProgress {
  const progress = loadCodexProgress()
  if (!isKnownCodexCardId(cardId)) {
    return progress
  }
  if (progress.collectedCardIds.includes(cardId)) {
    return progress
  }
  const next: CodexProgress = {
    ...progress,
    collectedCardIds: [...progress.collectedCardIds, cardId],
  }
  saveCodexProgress(next)
  return next
}

export function addCodexCards(cardIds: string[]): CodexProgress {
  let progress = loadCodexProgress()
  for (const id of cardIds) {
    progress = addCodexCard(id)
  }
  return progress
}

export function incrementPlaythroughCount(): CodexProgress {
  const progress = loadCodexProgress()
  const next: CodexProgress = {
    ...progress,
    playthroughCount: progress.playthroughCount + 1,
  }
  saveCodexProgress(next)
  return next
}

export function markChapterSecretViewed(chapter: number): CodexProgress {
  const progress = loadCodexProgress()
  if (progress.chapterSecretsViewed.includes(chapter)) {
    return progress
  }
  const next: CodexProgress = {
    ...progress,
    chapterSecretsViewed: [...progress.chapterSecretsViewed, chapter],
  }
  saveCodexProgress(next)
  return next
}

export function isChapterSecretViewed(chapter: number, progress: CodexProgress): boolean {
  return progress.chapterSecretsViewed.includes(chapter)
}

export function getCodexDisplayCount(
  collectedIds: string[],
  storyGraph: StoryGraph,
  chapter?: number,
): string {
  if (chapter != null) {
    const count = getChapterCodexCount(chapter, collectedIds, storyGraph)
    return `${count}/${CODEX_CARDS_PER_CHAPTER}`
  }
  const total = getTotalCodexCount(collectedIds, storyGraph)
  const slots = getTotalCodexSlots()
  return `${total}/${slots}`
}

export {
  CODEX_CARDS_PER_CHAPTER,
  isChapterCodexComplete,
  getChapterCodexCount,
  getTotalCodexCount,
  getTotalCodexSlots,
}
