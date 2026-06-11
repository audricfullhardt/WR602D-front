const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'token'

export interface ApiError extends Error {
  status?: number
}

function extractMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    const message =
      record['hydra:description'] ??
      record.detail ??
      record.message ??
      record.error
    if (typeof message === 'string') return message
  }
  return `Erreur ${status}`
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/ld+json')
  }

  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const error = new Error(extractMessage(data, response.status)) as ApiError
    error.status = response.status
    throw error
  }

  return data as T
}
