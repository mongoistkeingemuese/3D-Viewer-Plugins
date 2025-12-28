/**
 * Valve Plugin Utilities
 *
 * Purpose: Utility functions for hex parsing and timestamp handling
 * Usage: Imported by index.ts for MQTT data processing
 * Rationale: Centralized conversion functions for consistent data handling
 *
 * @module valve/utils
 */

/**
 * Parse hex-encoded integer value
 *
 * Purpose: Convert hex string to integer
 * Usage: For parsing gS and sS values from MQTT
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
 * Parse MQTT timestamp to milliseconds
 *
 * Purpose: Convert MQTT timestamp format to JS timestamp
 * Usage: For runtime measurement calculations
 *
 * The timestamp format is: 16-char hex representing 100-nanosecond intervals
 * since January 1, 1601 (Windows FILETIME format)
 *
 * @param timestamp - Hex timestamp string from MQTT (e.g., "0000019B6690B8DC")
 * @returns Timestamp in milliseconds (Unix epoch)
 */
export function parseMqttTimestamp(timestamp: string): number {
  if (!timestamp || timestamp.length !== 16) {
    return Date.now();
  }

  try {
    // Parse as Windows FILETIME (100-nanosecond intervals since 1601-01-01)
    const fileTime = BigInt(`0x${timestamp}`);
    // Convert to Unix timestamp in milliseconds
    // 116444736000000000 = 100-nanosecond intervals between 1601-01-01 and 1970-01-01
    const unixNs = fileTime - BigInt('116444736000000000');
    // Convert 100-ns intervals to milliseconds
    const unixMs = Number(unixNs / BigInt(10000));
    return unixMs;
  } catch {
    return Date.now();
  }
}

/**
 * Normalize valve name by trimming whitespace
 *
 * Purpose: Handle padded valve names from MQTT
 * Usage: For matching valve names in MQTT payloads
 *
 * @param name - Valve name potentially padded with spaces
 * @returns Trimmed valve name
 */
export function normalizeValveName(name: string): string {
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
