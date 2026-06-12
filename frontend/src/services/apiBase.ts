/** API origin; empty string uses same-origin `/api` (Vite dev proxy). */
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const BACKEND_HINT =
  '請確認後端已啟動（cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000）'

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}

export function formatFetchError(err: unknown, fallback: string): string {
  if (err instanceof TypeError && /fetch/i.test(err.message)) {
    return `無法連接伺服器。${BACKEND_HINT}`
  }
  if (err instanceof Error) return err.message
  return fallback
}
