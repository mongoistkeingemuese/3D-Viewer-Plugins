/**
 * Axis Plugin Types
 *
 * Purpose: TypeScript interfaces and enums for axis data structures
 * Usage: Imported by index.ts and components
 * Rationale: Centralized type definitions for type safety
 *
 * @module axis/types
 */

import type { Unsubscribe } from '@3dviewer/plugin-sdk';

/**
 * MotionState enum values
 *
 * Purpose: Define motion states for axis visualization
 */
export enum MotionState {
  ErrorStop = 0,
  Standstill = 1,
  Homing = 2,
  Stopping = 3,
  Disabled = 4,
  DiscreteMotion = 5,
  ContinuousMotion = 6,
  SynchronizedMotion = 7,
}

/**
 * Human-readable names for MotionState
 */
export const MotionStateNames: Record<number, string> = {
  [0]: 'Error Stop',
  [1]: 'Standstill',
  [2]: 'Homing',
  [3]: 'Stopping',
  [4]: 'Disabled',
  [5]: 'Discrete Motion',
  [6]: 'Continuous Motion',
  [7]: 'Synchronized Motion',
};

/**
 * MotionActivityStatusBits (mtAcMk)
 *
 * Purpose: Parse and store activity status bits
 */
export interface MotionActivityStatusBits {
  motionIsActive: boolean;
  jogNegativeIsActive: boolean;
  jogPositiveIsActive: boolean;
  homingIsActive: boolean;
  resetControllerFaultIsActive: boolean;
  velocityPositiveIsActive: boolean;
  velocityNegativeIsActive: boolean;
  stoppingIsActive: boolean;
}

/**
 * MotionStatusMaskBits (motMsk)
 *
 * Purpose: Parse and store motion status mask bits
 */
export interface MotionStatusMaskBits {
  isReady: boolean;
  isEnabled: boolean;
  isSwitchedOn: boolean;
  isHomed: boolean;
  isCommutated: boolean;
  internalLimitIsActive: boolean;
  hasWarning: boolean;
  hasError: boolean;
  isInVelocity: boolean;
  overrideEnabled: boolean;
  hardwareLimitSwitchNegativeActivated: boolean;
  hardwareLimitSwitchPositiveActivated: boolean;
  hardwareHomeSwitchActivated: boolean;
  hardwareEnableActivated: boolean;
  emergencyDetectedDelayedEnabled: boolean;
  softwareLimitSwitchNegativeActivated: boolean;
  softwareLimitSwitchPositiveActivated: boolean;
  softwareLimitSwitchNegativeReached: boolean;
  softwareLimitSwitchPositiveReached: boolean;
}

/**
 * Axis data from Release 11 MQTT payload (direct hex values)
 */
export interface AxisDataRelease11 {
  typ: string;
  id: string;
  name: string;
  sS: string;       // MotionState as hex string (WORD)
  mtAcMk: string;   // MotionActivityStatusBits as hex string (WORD)
  motMsk: string;   // MotionStatusMask as hex string (DWORD)
  posS0: string;    // World position as hex float
  pos: string;      // Actual position as hex float
  vel: string;      // Velocity as hex float
}

/**
 * Release 11 MQTT payload structure
 */
export interface AxisPayloadRelease11 {
  t: string;
  data: AxisDataRelease11[];
}

/**
 * Axis data from Release 10 MQTT payload (nested objects with typ/val)
 */
export interface AxisDataRelease10 {
  id: string;
  name: string;
  sS: { typ: string; val: string };      // MotionState
  posS0: { typ: string; val: string };   // World position
  pos: { typ: string; val: string };     // Actual position
  vel: { typ: string; val: string };     // Velocity
}

/**
 * Release 10 MQTT payload structure
 */
export interface AxisPayloadRelease10 {
  pack: Array<{
    t: string;
    Axis: AxisDataRelease10;
  }>;
}

/**
 * MQTT format type
 */
export type MqttFormat = 'release11' | 'release10';

/**
 * Error message payload structure
 *
 * Note: msg can have different formats depending on the source:
 * - string: direct message text
 * - { txt: string, val: object }: structured message
 * - { text: string }: alternative format
 */
export interface ErrorPayload {
  utc: number;
  lvl: string;
  src: string;
  typ: string;
  msg: string | {
    txt?: string;
    text?: string;
    val?: Record<string, unknown>;
  };
}

/**
 * Internal error storage structure
 */
export interface ErrorEntry {
  timestamp: number;
  level: string;
  source: string;
  rawPayload: string;  // Complete raw MQTT payload as JSON string
  acknowledged: boolean;
}

/**
 * Node-specific state
 *
 * Purpose: Track state for each bound axis node
 */
export interface NodeState {
  nodeId: string;
  axisName: string;
  axisCommandNo: number;
  moveCommandNo: number;
  subscriptions: Unsubscribe[];
  currentState: MotionState;
  activityBits: MotionActivityStatusBits;
  statusMask: MotionStatusMaskBits;
  position: number;
  velocity: number;
  worldPosition: number;
  errors: ErrorEntry[];
  lastUpdate: Date | null;
  selectedStepSize: number;
}
