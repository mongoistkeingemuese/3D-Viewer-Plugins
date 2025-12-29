/**
 * Valve Plugin Types
 *
 * Purpose: TypeScript interfaces and enums for valve data structures
 * Usage: Imported by index.ts and components
 * Rationale: Centralized type definitions for type safety
 *
 * @module valve/types
 */

import type { Unsubscribe } from '@3dviewer/plugin-sdk';

/**
 * Generic State (gS) - BehaviorModelStateEnum
 *
 * Purpose: Define generic behavior model states
 */
export enum GenericState {
  Unknown = -1,
  Idle = 0,
  Executing = 1,
  Done = 2,
  Error = 3,
  Pausing = 4,
  Paused = 5,
  Aborting = 6,
  Aborted = 7,
  Resetting = 8,
  Preparing = 9,
  Initialising = 10,
}

/**
 * Specific State (sS) - ValvePositionEnum
 *
 * Purpose: Define valve position states
 */
export enum ValvePosition {
  IsPressureFree = 0,
  MovingToBasePosition = 1,
  MovingToWorkPosition = 2,
  IsInBasePosition = 3,
  IsInWorkPosition = 4,
  IsInUndefinedPosition = 5,
}

/**
 * Function Command Numbers for valve operations
 *
 * Purpose: HTTP function command identifiers
 */
export enum FunctionCommand {
  MoveToBasePosition = 0,
  MoveToWorkPosition = 1,
  TogglePosition = 2,
  SwitchToPressureFree = 3,
  SwitchToOptionMonostable = 50,
  SwitchToOptionBistablePulsed = 51,
  SwitchToOptionBistablePermanent = 52,
  SwitchToOptionBistableMiddlePositionOpen = 53,
}

/**
 * MQTT format type
 */
export type MqttFormat = 'release8' | 'release9' | 'release10' | 'release11';

/**
 * Valve data from MQTT payload (Release 8-11 format)
 */
export interface ValveData {
  id: string;
  name: string;
  gS: { typ: string; val: string };   // GenericState
  sS: { typ: string; val: string };   // ValvePosition
  recipe?: { typ: string; val: string };
}

/**
 * MQTT payload structure for valve data
 */
export interface ValvePayload {
  pack: Array<{
    t: string;   // Timestamp
    Valve: ValveData;
  }>;
}

/**
 * Error message payload structure
 *
 * Note: msg can have different formats depending on the source:
 * - string: direct message text
 * - { txt: string, val: object }: structured message
 * - { text: string }: alternative format
 * - { val: { txt: string } }: nested format
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
  message: string;
  acknowledged: boolean;
}

/**
 * Node-specific state
 *
 * Purpose: Track state for each bound valve node
 */
export interface NodeState {
  nodeId: string;
  valveName: string;
  functionNo: number;
  subscriptions: Unsubscribe[];

  // Status
  genericState: GenericState;
  specificState: ValvePosition;
  previousSpecificState: ValvePosition;
  recipe: number;

  // Runtime measurement
  moveStartTimestamp: number | null;
  lastDurationGstToAst: number | null;  // ms
  lastDurationAstToGst: number | null;  // ms

  // Errors
  errors: ErrorEntry[];
  lastUpdate: Date | null;
}

/**
 * AST Position configuration
 */
export interface AstPosition {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
}

/**
 * Human-readable names for GenericState
 */
export const GenericStateNames: Record<number, string> = {
  [-1]: 'Unknown',
  [0]: 'Idle',
  [1]: 'Executing',
  [2]: 'Done',
  [3]: 'Error',
  [4]: 'Pausing',
  [5]: 'Paused',
  [6]: 'Aborting',
  [7]: 'Aborted',
  [8]: 'Resetting',
  [9]: 'Preparing',
  [10]: 'Initialising',
};

/**
 * Human-readable names for ValvePosition
 */
export const ValvePositionNames: Record<number, string> = {
  [0]: 'Drucklos',
  [1]: 'Fährt zu GST',
  [2]: 'Fährt zu AST',
  [3]: 'In GST',
  [4]: 'In AST',
  [5]: 'Undefiniert',
};

/**
 * Human-readable names for FunctionCommand
 */
export const FunctionCommandNames: Record<number, string> = {
  [0]: 'GST fahren',
  [1]: 'AST fahren',
  [2]: 'Position wechseln',
  [3]: 'Drucklos',
  [50]: 'Monostabil',
  [51]: 'Bistabil Pulsed',
  [52]: 'Bistabil Permanent',
  [53]: 'Bistabil Mittelstellung',
};
