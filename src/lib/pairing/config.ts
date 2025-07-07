// src/lib/settings/loadConstraintSettings.ts
import defaultConfig from './constraints-config.json'
import {
  getConstraintSettings,
  setConstraintSettings,
} from '../localData'

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
 * Load constraint settings from localStorage with defaults.
 */
export function loadConstraintSettings(): ConstraintSettings {
  try {
    const stored = getConstraintSettings<Partial<ConstraintSettings>>()
    return { ...(defaultConfig as ConstraintSettings), ...(stored ?? {}) }
  } catch {
    return defaultConfig as ConstraintSettings
  }
}

/**
 * Persist constraint settings to localStorage.
 */
export function saveConstraintSettings(settings: ConstraintSettings): void {
  setConstraintSettings(settings)
}
