import type { AnalyzeResponse, AnalyzeTaskStatusResponse } from '../models/story'
import { apiUrl, formatFetchError } from './apiBase'
const POLL_INTERVAL_MS = 1500
const MAX_POLL_ATTEMPTS = 120

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function pollAnalyzeTask(
  taskId: string,
  onProgress?: (message: string) => void,
): Promise<AnalyzeResponse> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    if (attempt > 0) {
      await sleep(POLL_INTERVAL_MS)
    }

    onProgress?.('正在析文，編排劇本…')

    const res = await fetch(apiUrl(`/api/analyze/tasks/${taskId}`))
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail ?? '無法查詢分析進度')
    }

    const data = (await res.json()) as AnalyzeTaskStatusResponse

    if (data.status === 'completed') {
      if (!data.analysis || !data.storyGraph) {
        throw new Error('分析完成但缺少結果資料')
      }
      return { analysis: data.analysis, storyGraph: data.storyGraph }
    }

    if (data.status === 'failed') {
      throw new Error(data.error ?? '分析失敗，請稍後再試')
    }
  }

  throw new Error('分析時間過長，請稍後再試')
}

export async function analyzeUpload(
  fileId: string,
  storagePath: string,
  onProgress?: (message: string) => void,
): Promise<AnalyzeResponse> {
  onProgress?.('已收到書稿，開始分析…')

  let res: Response
  try {
    res = await fetch(apiUrl('/api/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, storagePath }),
    })
  } catch (err) {
    throw new Error(formatFetchError(err, '分析失敗，請稍後再試'))
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? '分析失敗，請稍後再試')
  }

  const data = await res.json()
  if (data.status === 'processing' && data.taskId) {
    return pollAnalyzeTask(data.taskId, onProgress)
  }

  if (data.analysis && data.storyGraph) {
    return { analysis: data.analysis, storyGraph: data.storyGraph }
  }

  throw new Error('分析回應格式不正確')
}

export async function analyzeDemo(): Promise<AnalyzeResponse> {
  try {
    const res = await fetch(apiUrl('/api/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ useFixture: true }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail ?? '無法載入示範故事')
    }

    const data = await res.json()
    return { analysis: data.analysis, storyGraph: data.storyGraph }
  } catch (err) {
    throw new Error(formatFetchError(err, '無法載入示範故事'))
  }
}

export async function fetchDemoStory() {
  try {
    const res = await fetch(apiUrl('/api/story/demo'))
    if (!res.ok) throw new Error('無法載入示範劇本')
    return res.json()
  } catch (err) {
    throw new Error(formatFetchError(err, '無法載入示範劇本'))
  }
}
