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
    const cfg: Record<string, boolean> = { ...defaultConfig };
    for (const row of data) cfg[row.name] = row.enabled;
    return cfg as ConstraintSettings;
  } catch {
    return defaultConfig as ConstraintSettings;
  }
}
