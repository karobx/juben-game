import { apiUrl, formatFetchError } from './apiBase'

export async function uploadFile(file: File) {
  const form = new FormData()
  form.append('file', file)

  try {
    const res = await fetch(apiUrl('/api/upload'), {
      method: 'POST',
      body: form,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail ?? '上傳失敗，請稍後再試')
    }

    return res.json()
  } catch (err) {
    throw new Error(formatFetchError(err, '上傳失敗，請稍後再試'))
  }
}
