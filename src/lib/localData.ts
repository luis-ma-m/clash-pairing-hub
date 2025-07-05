export function readLocal<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const getTeams = <T = unknown[]>(): T => readLocal<T>('teams', [] as unknown as T);
export const setTeams = <T>(val: T) => writeLocal('teams', val);

export const getPairings = <T = unknown[]>(): T => readLocal<T>('pairings', [] as unknown as T);
export const setPairings = <T>(val: T) => writeLocal('pairings', val);

export const getScores = <T = unknown[]>(): T => readLocal<T>('scores', [] as unknown as T);
export const setScores = <T>(val: T) => writeLocal('scores', val);

export const getUsers = <T = unknown[]>(): T => readLocal<T>('users', [] as unknown as T);
export const setUsers = <T>(val: T) => writeLocal('users', val);
