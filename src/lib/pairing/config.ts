import { supabase } from '../supabase';
import defaultConfig from './constraints-config.json';

export interface ConstraintSettings {
  NoRepeatMatch: boolean;
  JudgeAvailability: boolean;
  RoomCapacity: boolean;
}

export async function loadConstraintSettings(): Promise<ConstraintSettings> {
  try {
    const { data, error } = await supabase
      .from('constraint_settings')
      .select('name, enabled');
    if (error || !data) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cfg: any = { ...defaultConfig };
    for (const row of data) cfg[row.name] = row.enabled;
    return cfg as ConstraintSettings;
  } catch {
    return defaultConfig as ConstraintSettings;
  }
}
