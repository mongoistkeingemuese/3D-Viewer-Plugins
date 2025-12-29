/**
 * Axis Plugin Utilities
 *
 * Purpose: Utility functions for hex parsing and timestamp handling
 * Usage: Imported by index.ts for MQTT data processing
 * Rationale: Centralized conversion functions for consistent data handling
 *
 * @module axis/utils
 */

import type { MotionActivityStatusBits, MotionStatusMaskBits } from './types';

/**
 * Parse hex-encoded integer value
 *
 * Purpose: Convert hex string to integer
 * Usage: For parsing sS, mtAcMk, motMsk values from MQTT
 *
 * @param hexString - Hex string to parse (e.g., "0A")
 * @returns Parsed integer value
 */
export function hexToInt(hexString: string): number {
  if (!hexString) return 0;
  try {
    return parseInt(hexString, 16);
  } catch {
    return 0;
  }
}

/**
 * Convert IEEE 754 hex string to float
 *
 * Purpose: Convert hex-encoded float values
 * Usage: For parsing pos, posS0, vel values from MQTT
 *
 * @param hexString - 8-character hex string representing IEEE 754 float
 * @returns Parsed float value
 */
export function hexToFloat(hexString: string): number {
  if (!hexString || hexString.length !== 8) {
    return 0;
  }

  try {
    const int32 = parseInt(hexString, 16);
    const buffer = new ArrayBuffer(4);
    const intView = new Uint32Array(buffer);
    const floatView = new Float32Array(buffer);
    intView[0] = int32;
    return floatView[0];
  } catch {
    return 0;
  }
}

/**
 * Parse MotionActivityStatusBits from hex WORD
 *
 * Purpose: Extract activity status bit flags
 * Usage: For Release 11 mtAcMk field
 *
 * @param hexWord - Hex WORD string
 * @returns Parsed activity bits
 */
export function parseActivityBits(hexWord: string): MotionActivityStatusBits {
  const value = hexToInt(hexWord);
  return {
    motionIsActive: !!(value & (1 << 0)),
    jogNegativeIsActive: !!(value & (1 << 1)),
    jogPositiveIsActive: !!(value & (1 << 2)),
    homingIsActive: !!(value & (1 << 3)),
    resetControllerFaultIsActive: !!(value & (1 << 4)),
    velocityPositiveIsActive: !!(value & (1 << 5)),
    velocityNegativeIsActive: !!(value & (1 << 6)),
    stoppingIsActive: !!(value & (1 << 7)),
  };
}

/**
 * Parse MotionStatusMask from hex DWORD
 *
 * Purpose: Extract motion status bit flags
 * Usage: For Release 11 motMsk field
 *
 * @param hexDword - Hex DWORD string
 * @returns Parsed status mask bits
 */
export function parseStatusMask(hexDword: string): MotionStatusMaskBits {
  const value = hexToInt(hexDword);
  return {
    isReady: !!(value & (1 << 0)),
    isEnabled: !!(value & (1 << 1)),
    isSwitchedOn: !!(value & (1 << 2)),
    isHomed: !!(value & (1 << 3)),
    isCommutated: !!(value & (1 << 4)),
    internalLimitIsActive: !!(value & (1 << 5)),
    hasWarning: !!(value & (1 << 6)),
    hasError: !!(value & (1 << 7)),
    isInVelocity: !!(value & (1 << 8)),
    overrideEnabled: !!(value & (1 << 16)),
    hardwareLimitSwitchNegativeActivated: !!(value & (1 << 19)),
    hardwareLimitSwitchPositiveActivated: !!(value & (1 << 20)),
    hardwareHomeSwitchActivated: !!(value & (1 << 21)),
    hardwareEnableActivated: !!(value & (1 << 22)),
    emergencyDetectedDelayedEnabled: !!(value & (1 << 23)),
    softwareLimitSwitchNegativeActivated: !!(value & (1 << 24)),
    softwareLimitSwitchPositiveActivated: !!(value & (1 << 25)),
    softwareLimitSwitchNegativeReached: !!(value & (1 << 26)),
    softwareLimitSwitchPositiveReached: !!(value & (1 << 27)),
  };
}

/**
 * Create empty activity bits object
 *
 * Purpose: Initialize activity bits with all false
 * Usage: For Release 10 format which doesn't have mtAcMk
 */
export function createEmptyActivityBits(): MotionActivityStatusBits {
  return {
    motionIsActive: false,
    jogNegativeIsActive: false,
    jogPositiveIsActive: false,
    homingIsActive: false,
    resetControllerFaultIsActive: false,
    velocityPositiveIsActive: false,
    velocityNegativeIsActive: false,
    stoppingIsActive: false,
  };
}

/**
 * Create empty status mask object
 *
 * Purpose: Initialize status mask with all false
 * Usage: For Release 10 format which doesn't have motMsk
 */
export function createEmptyStatusMask(): MotionStatusMaskBits {
  return {
    isReady: false,
    isEnabled: false,
    isSwitchedOn: false,
    isHomed: false,
    isCommutated: false,
    internalLimitIsActive: false,
    hasWarning: false,
    hasError: false,
    isInVelocity: false,
    overrideEnabled: false,
    hardwareLimitSwitchNegativeActivated: false,
    hardwareLimitSwitchPositiveActivated: false,
    hardwareHomeSwitchActivated: false,
    hardwareEnableActivated: false,
    emergencyDetectedDelayedEnabled: false,
    softwareLimitSwitchNegativeActivated: false,
    softwareLimitSwitchPositiveActivated: false,
    softwareLimitSwitchNegativeReached: false,
    softwareLimitSwitchPositiveReached: false,
  };
}

/**
 * Normalize axis name by trimming whitespace
 *
 * Purpose: Handle padded axis names from MQTT
 * Usage: For matching axis names in MQTT payloads
 *
 * @param name - Axis name potentially padded with spaces
 * @returns Trimmed axis name
 */
export function normalizeAxisName(name: string): string {
  return name.trim();
}

/**
 * Format duration in milliseconds to readable string
 *
 * Purpose: Display runtime measurements
 * Usage: In UI components for duration display
 *
 * @param durationMs - Duration in milliseconds
 * @returns Formatted string (e.g., "1.234 s")
 */
export function formatDuration(durationMs: number | null): string {
  if (durationMs === null) {
    return '—';
  }
  return `${(durationMs / 1000).toFixed(3)} s`;
}

/**
 * Format timestamp to time string
 *
 * Purpose: Display last update time
 * Usage: In UI components
 *
 * @param date - Date object or null
 * @returns Formatted time string (e.g., "14:32:15")
 */
export function formatTime(date: Date | null): string {
  if (!date) {
    return '—';
  }
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format timestamp to full datetime string
 *
 * Purpose: Display error timestamps
 * Usage: In error log display
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted datetime string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}
