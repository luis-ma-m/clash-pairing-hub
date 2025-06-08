// Support both browser and Node environments without relying on `import.meta`.
const browserBase = (globalThis as any).VITE_API_BASE_URL;
const nodeBase = typeof process !== 'undefined' ? process.env.VITE_API_BASE_URL : undefined;
export const apiBaseUrl = browserBase ?? nodeBase ?? '';

export function apiFetch(input: string, init?: RequestInit) {
  const url = input.startsWith('http') ? input : `${apiBaseUrl}${input}`;
  return fetch(url, init);
}
