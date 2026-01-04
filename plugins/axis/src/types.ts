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
 * i18n keys for MotionState names
 * These are translation keys - actual translations happen in UI components via i18n.t()
 */
export const MotionStateKeys: Record<number, string> = {
  [0]: 'state.errorStop',
  [1]: 'state.standstill',
  [2]: 'state.homing',
  [3]: 'state.stopping',
  [4]: 'state.disabled',
  [5]: 'state.discreteMotion',
  [6]: 'state.continuousMotion',
  [7]: 'state.synchronizedMotion',
};

/**
 * Default translations - used as fallback and for notifications
 */
export const DefaultTranslations: Record<string, Record<string, string>> = {
  de: {
    // MotionState
    'state.errorStop': 'Fehlerstopp',
    'state.standstill': 'Stillstand',
    'state.homing': 'Referenzfahrt',
    'state.stopping': 'Stoppt',
    'state.disabled': 'Deaktiviert',
    'state.discreteMotion': 'Einzelbewegung',
    'state.continuousMotion': 'Kontinuierliche Bewegung',
    'state.synchronizedMotion': 'Synchrone Bewegung',
    // UI Labels
    'ui.axis': 'Achse',
    'ui.controlAndPosition': 'Bedienung & Position',
    'ui.statusFlags': 'Status Flags',
    'ui.errors': 'Fehler',
    'ui.positionAndVelocity': 'Position & Geschwindigkeit',
    'ui.worldPosition': 'Weltposition',
    'ui.actualPosition': 'Ist-Position',
    'ui.velocity': 'Geschwindigkeit',
    'ui.lastUpdate': 'Letztes Update',
    'ui.stepControl': 'Schrittbetrieb',
    'ui.stepControlRelease11Only': 'Schrittbetrieb nur mit Release 11 Format verfügbar',
    'ui.moveAbsolute': 'Absolut fahren',
    'ui.axisCommands': 'Achsenbefehle',
    'ui.errorMessages': 'Fehlermeldungen',
    'ui.open': 'offen',
    'ui.acknowledgeAll': 'Alle Quittieren',
    'ui.acknowledge': 'Quittieren',
    'ui.noErrors': 'Keine Fehlermeldungen',
    'ui.noDataAvailable': 'Keine Daten verfügbar',
    'ui.nodeStatusNotFound': 'Knotenstatus nicht gefunden. Bitte stellen Sie sicher, dass die Achse korrekt konfiguriert ist.',
    'ui.sending': 'Sende...',
    'ui.switchOn': 'Einschalten',
    'ui.homing': 'Referenzfahrt',
    'ui.moveTo': 'Fahre zu',
    // Status Flags
    'ui.statusFlagsMotMsk': 'Status Flags (motMsk)',
    'ui.activityStatusMtAcMk': 'Aktivitätsstatus (mtAcMk)',
    'ui.ready': 'Bereit',
    'ui.enabled': 'Freigegeben',
    'ui.switchedOn': 'Eingeschaltet',
    'ui.homed': 'Referenziert',
    'ui.commutated': 'Kommutiert',
    'ui.inVelocity': 'In Geschwindigkeit',
    'ui.override': 'Override',
    'ui.hwEnable': 'HW Freigabe',
    'ui.internalLimit': 'Internes Limit',
    'ui.warning': 'Warnung',
    'ui.error': 'Fehler',
    'ui.homeSwitch': 'Home-Schalter',
    'ui.hwLimitNeg': 'HW Limit-',
    'ui.hwLimitPos': 'HW Limit+',
    'ui.swLimitNeg': 'SW Limit-',
    'ui.swLimitPos': 'SW Limit+',
    'ui.swReachedNeg': 'SW Erreicht-',
    'ui.swReachedPos': 'SW Erreicht+',
    'ui.emergency': 'Notfall',
    'ui.motionActive': 'Bewegung aktiv',
    'ui.jogNeg': 'Jog-',
    'ui.jogPos': 'Jog+',
    'ui.velPos': 'Vel+',
    'ui.velNeg': 'Vel-',
    'ui.stopping': 'Stoppt',
    'ui.resetFault': 'Fehler Reset',
    // Notifications
    'notify.noMqttBroker': 'Keine MQTT-Broker konfiguriert',
    'notify.mqttBrokerNotFound': 'MQTT Broker "{source}" nicht gefunden',
    'notify.configureAxisName': 'Bitte Achsname für {name} konfigurieren',
    'notify.monitoringActive': 'Monitoring: {name}',
    'notify.stepSent': 'Step {value} gesendet',
    'notify.stepCommandFailed': 'Step-Befehl fehlgeschlagen: {error}',
    'notify.stepCommandError': 'Fehler beim Senden des Step-Befehls',
    'notify.switchOnSent': 'Switch On gesendet',
    'notify.switchOnFailed': 'Switch On fehlgeschlagen: {error}',
    'notify.switchOnError': 'Fehler beim Senden des Switch On-Befehls',
    'notify.homingStarted': 'Referenzfahrt gestartet',
    'notify.homingFailed': 'Referenzfahrt fehlgeschlagen: {error}',
    'notify.homingError': 'Fehler beim Senden des Referenzfahrt-Befehls',
    'notify.moveToSent': 'Fahre zu {position} mm gesendet',
    'notify.moveToFailed': 'Fahre zu fehlgeschlagen: {error}',
    'notify.moveToError': 'Fehler beim Senden des Fahre zu-Befehls',
    'notify.errorAcknowledged': '{name}: Fehler quittiert',
    'notify.errorsAcknowledgedCount': '{name}: {count} Fehler quittiert',
    'notify.mqttFormatError': 'MQTT Format-Fehler: {expected} erwartet, aber anderes Format empfangen',
  },
  en: {
    // MotionState
    'state.errorStop': 'Error Stop',
    'state.standstill': 'Standstill',
    'state.homing': 'Homing',
    'state.stopping': 'Stopping',
    'state.disabled': 'Disabled',
    'state.discreteMotion': 'Discrete Motion',
    'state.continuousMotion': 'Continuous Motion',
    'state.synchronizedMotion': 'Synchronized Motion',
    // UI Labels
    'ui.axis': 'Axis',
    'ui.controlAndPosition': 'Control & Position',
    'ui.statusFlags': 'Status Flags',
    'ui.errors': 'Errors',
    'ui.positionAndVelocity': 'Position & Velocity',
    'ui.worldPosition': 'World Position',
    'ui.actualPosition': 'Actual Position',
    'ui.velocity': 'Velocity',
    'ui.lastUpdate': 'Last Update',
    'ui.stepControl': 'Step Control',
    'ui.stepControlRelease11Only': 'Step control only available with Release 11 format',
    'ui.moveAbsolute': 'Move Absolute',
    'ui.axisCommands': 'Axis Commands',
    'ui.errorMessages': 'Error Messages',
    'ui.open': 'open',
    'ui.acknowledgeAll': 'Acknowledge All',
    'ui.acknowledge': 'Acknowledge',
    'ui.noErrors': 'No error messages',
    'ui.noDataAvailable': 'No data available',
    'ui.nodeStatusNotFound': 'Node status not found. Please ensure the axis is properly configured.',
    'ui.sending': 'Sending...',
    'ui.switchOn': 'Switch On',
    'ui.homing': 'Homing',
    'ui.moveTo': 'Move To',
    // Status Flags
    'ui.statusFlagsMotMsk': 'Status Flags (motMsk)',
    'ui.activityStatusMtAcMk': 'Activity Status (mtAcMk)',
    'ui.ready': 'Ready',
    'ui.enabled': 'Enabled',
    'ui.switchedOn': 'Switched On',
    'ui.homed': 'Homed',
    'ui.commutated': 'Commutated',
    'ui.inVelocity': 'In Velocity',
    'ui.override': 'Override',
    'ui.hwEnable': 'HW Enable',
    'ui.internalLimit': 'Internal Limit',
    'ui.warning': 'Warning',
    'ui.error': 'Error',
    'ui.homeSwitch': 'Home Switch',
    'ui.hwLimitNeg': 'HW Limit-',
    'ui.hwLimitPos': 'HW Limit+',
    'ui.swLimitNeg': 'SW Limit-',
    'ui.swLimitPos': 'SW Limit+',
    'ui.swReachedNeg': 'SW Reached-',
    'ui.swReachedPos': 'SW Reached+',
    'ui.emergency': 'Emergency',
    'ui.motionActive': 'Motion Active',
    'ui.jogNeg': 'Jog-',
    'ui.jogPos': 'Jog+',
    'ui.velPos': 'Vel+',
    'ui.velNeg': 'Vel-',
    'ui.stopping': 'Stopping',
    'ui.resetFault': 'Reset Fault',
    // Notifications
    'notify.noMqttBroker': 'No MQTT broker configured',
    'notify.mqttBrokerNotFound': 'MQTT Broker "{source}" not found',
    'notify.configureAxisName': 'Please configure axis name for {name}',
    'notify.monitoringActive': 'Monitoring: {name}',
    'notify.stepSent': 'Step {value} sent',
    'notify.stepCommandFailed': 'Step command failed: {error}',
    'notify.stepCommandError': 'Error sending step command',
    'notify.switchOnSent': 'Switch On sent',
    'notify.switchOnFailed': 'Switch On failed: {error}',
    'notify.switchOnError': 'Error sending Switch On command',
    'notify.homingStarted': 'Homing started',
    'notify.homingFailed': 'Homing failed: {error}',
    'notify.homingError': 'Error sending Homing command',
    'notify.moveToSent': 'Move to {position} mm sent',
    'notify.moveToFailed': 'Move to failed: {error}',
    'notify.moveToError': 'Error sending Move To command',
    'notify.errorAcknowledged': '{name}: Error acknowledged',
    'notify.errorsAcknowledgedCount': '{name}: {count} errors acknowledged',
    'notify.mqttFormatError': 'MQTT format error: Expected {expected}, but received different format',
  },
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
