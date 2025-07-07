// src/lib/settings/loadConstraintSettings.ts
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
 * Loads constraint settings from the local JSON configuration.
 */
export async function loadConstraintSettings(): Promise<ConstraintSettings> {
  return defaultConfig as ConstraintSettings
}
