
// src/lib/api.ts

// Determine the API base URL from environment variables
// Use Vite's import.meta.env for environment variables in the browser
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper to prefix relative paths with the base URL
export function apiFetch(input: string, init?: RequestInit) {
  const url = input.startsWith('http') ? input : `${apiBaseUrl}${input}`;
  return fetch(url, init);
}

// Helper to parse JSON responses with a clear error when the body isn't JSON
export async function expectJson<T = unknown>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  const text = await res.text();

  if (!contentType.includes('application/json')) {
    const snippet = text.slice(0, 100);
    throw new Error(`Expected JSON response but got '${contentType}': ${snippet}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    const snippet = text.slice(0, 100);
    throw new Error(`Failed to parse JSON response: ${snippet}`);
  }
}
