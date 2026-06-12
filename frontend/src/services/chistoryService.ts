import { CHISTORY_PERIODS_FALLBACK } from '../data/chistoryPeriodsFallback'
import type { AnalyzeResponse } from '../models/story'
import { apiUrl, formatFetchError } from './apiBase'

export interface ChistoryPeriod {
  id: string
  title: string
  subtitle: string
  chapterCount: number
  sourceUrl: string
  immersive?: boolean
}

export async function fetchChistoryPeriods(): Promise<ChistoryPeriod[]> {
  try {
    const res = await fetch(apiUrl('/api/chistory/periods'))
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail ?? '無法載入中一中國歷史課程列表')
    }
    const data = await res.json()
    return data.periods as ChistoryPeriod[]
  } catch (err) {
    throw new Error(formatFetchError(err, '無法載入中一中國歷史課程列表'))
  }
}

export async function fetchChistoryPeriodsWithFallback(): Promise<{
  periods: ChistoryPeriod[]
  offline: boolean
  warning?: string
}> {
  try {
    const periods = await fetchChistoryPeriods()
    return { periods, offline: false }
  } catch (err) {
    return {
      periods: CHISTORY_PERIODS_FALLBACK,
      offline: true,
      warning: err instanceof Error ? err.message : '無法載入中一中國歷史課程列表',
    }
  }
}

export async function fetchChistoryPeriod(periodId: string): Promise<AnalyzeResponse> {
  try {
    const res = await fetch(apiUrl(`/api/chistory/periods/${periodId}`))
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail ?? '無法載入此時期劇本')
    }
    return res.json() as Promise<AnalyzeResponse>
  } catch (err) {
    throw new Error(formatFetchError(err, '無法載入此時期劇本'))
  }
}
