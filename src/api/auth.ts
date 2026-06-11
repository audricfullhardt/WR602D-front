import { apiFetch } from './client'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export interface AuthUser {
  id: number
  email: string
  username: string
}

interface LoginResponse {
  token: string
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as AuthUser) : null
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export async function fetchMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/me')
}

export async function login(
  email: string,
  password: string
): Promise<AuthUser> {
  const res = await apiFetch<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  localStorage.setItem(TOKEN_KEY, res.token)

  try {
    const user = await fetchMe()
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return user
  } catch (err) {
    localStorage.removeItem(TOKEN_KEY)
    throw err
  }
}

export async function register(
  email: string,
  username: string,
  password: string
): Promise<AuthUser> {
  await apiFetch<AuthUser>('/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  })
  return login(email, password)
}
