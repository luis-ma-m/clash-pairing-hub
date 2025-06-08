export const apiBaseUrl = process.env.VITE_API_BASE_URL || '';

export function apiFetch(input: string, init?: RequestInit) {
  const url = input.startsWith('http') ? input : `${apiBaseUrl}${input}`;
  return fetch(url, init);
}
