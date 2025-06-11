export const DEMO_LOGIN_KEY = 'demoLoggedIn'

export function isDemoLoggedIn(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(DEMO_LOGIN_KEY) === 'true'
}

export function loginDemo() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(DEMO_LOGIN_KEY, 'true')
}

export function logoutDemo() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(DEMO_LOGIN_KEY)
}
