// Determine the API base URL from environment variables
// When bundled for the browser, the build process should replace this value
// with the appropriate string literal. During tests or in Node, it falls back
// to `process.env`.
// Use Vite-injected env at build time or Node env in tests. Default to localhost.
export const apiBaseUrl =
  (typeof process !== 'undefined' && process.env.VITE_API_BASE_URL) ||
  'http://localhost:3001';

// Helper to prefix relative paths with the base URL
export function apiFetch(input: string, init?: RequestInit) {
  const url = input.startsWith('http') ? input : `${apiBaseUrl}${input}`;
  return fetch(url, init);
}

// Helper to parse JSON responses with a clear error when the body isn't JSON
export async function expectJson(res: Response) {
  const contentType = res.headers.get('content-type') ?? '';
  const text = await res.text();
  if (!contentType.includes('application/json')) {
    const snippet = text.slice(0, 100);
    throw new Error(`Expected JSON response but got '${contentType}': ${snippet}`);
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    const snippet = text.slice(0, 100);
    throw new Error(`Failed to parse JSON response: ${snippet}`);
  }
}
