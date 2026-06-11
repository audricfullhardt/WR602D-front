import { apiFetch } from './client'

export interface Score {
  id: number
  strokes: number
  holeNumber: number
  username?: string
  completedAt?: string
}

export interface ShareToken {
  token: string
  url?: string
}

interface HydraCollection<T> {
  'hydra:member': T[]
}

function unwrap<T>(data: T[] | HydraCollection<T>): T[] {
  if (Array.isArray(data)) return data
  return data['hydra:member'] ?? []
}

export async function postScore(
  strokes: number,
  holeNumber: number
): Promise<Score> {
  return apiFetch<Score>('/api/scores', {
    method: 'POST',
    body: JSON.stringify({ strokes, holeNumber }),
  })
}

export async function getScores(params?: {
  holeNumber?: number
  orderByCompletedAt?: 'asc' | 'desc'
}): Promise<Score[]> {
  const query = new URLSearchParams()
  if (params?.holeNumber !== undefined) {
    query.set('holeNumber', String(params.holeNumber))
  }
  if (params?.orderByCompletedAt) {
    query.set('order[completedAt]', params.orderByCompletedAt)
  }
  const suffix = query.toString() ? `?${query.toString()}` : ''
  const data = await apiFetch<Score[] | HydraCollection<Score>>(
    `/api/scores${suffix}`
  )
  return unwrap(data)
}

export async function shareScore(scoreId: number): Promise<ShareToken> {
  return apiFetch<ShareToken>(`/scores/${scoreId}/share`, {
    method: 'POST',
  })
}
