export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

export function apiFetch(input: string, init?: RequestInit) {
  const url = input.startsWith('http') ? input : `${apiBaseUrl}${input}`;
  return fetch(url, init);
}
