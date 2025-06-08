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
    const cfg: ConstraintSettings = { ...defaultConfig } as ConstraintSettings;
    for (const row of data) {
      if (row.name in cfg) {
        cfg[row.name as keyof ConstraintSettings] = row.enabled;
      }
    }
    return cfg;
  } catch {
    return defaultConfig as ConstraintSettings;
  }
}
