import { readFile, writeFile } from 'fs/promises';

export interface Database {
  teams: any[];
  pairings: any[];
  debates: any[];
  scores: any[];
  users: any[];
  currentRound: number;
}

const file = './server/db.json';
const defaultData: Database = {
  teams: [],
  pairings: [],
  debates: [],
  scores: [],
  users: [],
  currentRound: 1,
};

let data: Database = { ...defaultData };

export async function initDB() {
  try {
    const text = await readFile(file, 'utf8');
    data = { ...defaultData, ...JSON.parse(text) };
  } catch {
    await writeFile(file, JSON.stringify(defaultData, null, 2));
  }
}

export async function read() {
  try {
    const text = await readFile(file, 'utf8');
    data = { ...defaultData, ...JSON.parse(text) };
  } catch {
    // ignore
  }
}

export async function write() {
  await writeFile(file, JSON.stringify(data, null, 2));
}

export default {
  get data() {
    return data;
  },
  read,
  write,
};
