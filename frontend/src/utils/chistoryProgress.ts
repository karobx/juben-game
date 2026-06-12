const STORAGE_KEY = 'chistory:progress'

export interface ChistoryProgress {
  periodId: string
  lastSceneId?: string
  updatedAt: string
}

export function loadChistoryProgress(): ChistoryProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ChistoryProgress
  } catch {
    return null
  }
}

export function saveChistoryProgress(progress: Omit<ChistoryProgress, 'updatedAt'>): void {
  const payload: ChistoryProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export const DEFAULT_PERIOD_ID = 'qin_han'
