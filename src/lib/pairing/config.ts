// src/lib/settings/loadConstraintSettings.ts
import { supabase } from '../supabase'
import defaultConfig from './constraints-config.json'

export interface ConstraintSettings {
  NoRepeatMatch: boolean
  JudgeAvailability: boolean
  RoomCapacity: boolean
}

export type ConstraintName = keyof ConstraintSettings

export interface ConstraintRow {
  name: ConstraintName
  enabled: boolean
}

/**
 * Loads constraint settings from Supabase, falling back to defaults on error.
 */
export async function loadConstraintSettings(): Promise<ConstraintSettings> {
  try {
    // Fetch typed rows from the database
    const { data, error } = await supabase
      .from('constraint_settings')
      .select('name, enabled')

    if (error) {
      throw error
    }
    if (!data) {
      throw new Error('No data returned')
    }

    // Start with the default JSON configuration
    const cfg: ConstraintSettings = { ...(defaultConfig as ConstraintSettings) }

    const rows = data as ConstraintRow[]

    // Merge any overrides from the database
    for (const row of rows) {
      if (row.name in cfg) {
        cfg[row.name] = row.enabled
      }
    }

    return cfg
  } catch {
    // On any failure, return the defaults
    return defaultConfig as ConstraintSettings
  }
}
