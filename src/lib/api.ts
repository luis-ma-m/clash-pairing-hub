// Determine the API base URL from environment variables
// When bundled for the browser, the build process should replace this value
// with the appropriate string literal. During tests or in Node, it falls back
// to `process.env`.
export const apiBaseUrl = process.env.VITE_API_BASE_URL ?? '';

// Helper to prefix relative paths with the base URL
export function apiFetch(input: string, init?: RequestInit) {
  const url = input.startsWith('http') ? input : `${apiBaseUrl}${input}`;
  return fetch(url, init);
}
