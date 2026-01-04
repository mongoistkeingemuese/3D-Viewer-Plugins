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
  rawPayload: string;  // Complete raw MQTT payload as JSON string
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
 * i18n keys for GenericState names
 * These are translation keys - actual translations happen in UI components via i18n.t()
 */
export const GenericStateKeys: Record<number, string> = {
  [-1]: 'state.unknown',
  [0]: 'state.idle',
  [1]: 'state.executing',
  [2]: 'state.done',
  [3]: 'state.error',
  [4]: 'state.pausing',
  [5]: 'state.paused',
  [6]: 'state.aborting',
  [7]: 'state.aborted',
  [8]: 'state.resetting',
  [9]: 'state.preparing',
  [10]: 'state.initialising',
};

/**
 * i18n keys for ValvePosition names
 * These are translation keys - actual translations happen in UI components via i18n.t()
 */
export const ValvePositionKeys: Record<number, string> = {
  [0]: 'position.pressureFree',
  [1]: 'position.movingToBase',
  [2]: 'position.movingToWork',
  [3]: 'position.inBase',
  [4]: 'position.inWork',
  [5]: 'position.undefined',
};

/**
 * i18n keys for FunctionCommand names
 * These are translation keys - actual translations happen in UI components via i18n.t()
 */
export const FunctionCommandKeys: Record<number, string> = {
  [0]: 'command.moveToBase',
  [1]: 'command.moveToWork',
  [2]: 'command.togglePosition',
  [3]: 'command.pressureFree',
  [50]: 'command.modeMonostable',
  [51]: 'command.modeBistablePulsed',
  [52]: 'command.modeBistablePermanent',
  [53]: 'command.modeBistableMiddle',
};

/**
 * Default translations (German) - used as fallback
 */
export const DefaultTranslations: Record<string, Record<string, string>> = {
  de: {
    // GenericState
    'state.unknown': 'Unbekannt',
    'state.idle': 'Bereit',
    'state.executing': 'Ausführen',
    'state.done': 'Fertig',
    'state.error': 'Fehler',
    'state.pausing': 'Pausieren',
    'state.paused': 'Pausiert',
    'state.aborting': 'Abbrechen',
    'state.aborted': 'Abgebrochen',
    'state.resetting': 'Zurücksetzen',
    'state.preparing': 'Vorbereiten',
    'state.initialising': 'Initialisieren',
    // ValvePosition
    'position.pressureFree': 'Drucklos',
    'position.movingToBase': 'Fährt zu GST',
    'position.movingToWork': 'Fährt zu AST',
    'position.inBase': 'In GST',
    'position.inWork': 'In AST',
    'position.undefined': 'Undefiniert',
    // FunctionCommand
    'command.moveToBase': 'GST fahren',
    'command.moveToWork': 'AST fahren',
    'command.togglePosition': 'Position wechseln',
    'command.pressureFree': 'Drucklos',
    'command.modeMonostable': 'Monostabil',
    'command.modeBistablePulsed': 'Bistabil Pulsed',
    'command.modeBistablePermanent': 'Bistabil Permanent',
    'command.modeBistableMiddle': 'Bistabil Mittelstellung',
    // UI Labels
    'ui.valve': 'Ventil',
    'ui.status': 'Status',
    'ui.control': 'Bedienung',
    'ui.errors': 'Fehler',
    'ui.valveStatus': 'Ventilstatus',
    'ui.generalStatus': 'Allgemeiner Status',
    'ui.specificStatus': 'Spezifischer Status',
    'ui.recipe': 'Rezept',
    'ui.runtimes': 'Laufzeiten',
    'ui.lastBaseToWork': 'Letzte Grund → Arbeit',
    'ui.lastWorkToBase': 'Letzte Arbeit → Grund',
    'ui.lastUpdate': 'Letztes Update',
    'ui.mainControl': 'Hauptbedienung',
    'ui.operatingMode': 'Betriebsmodus',
    'ui.errorMessages': 'Fehlermeldungen',
    'ui.open': 'offen',
    'ui.acknowledgeAll': 'Alle Quittieren',
    'ui.noErrors': 'Keine Fehlermeldungen',
    'ui.noDataAvailable': 'Keine Daten verfügbar',
    'ui.nodeStatusNotFound': 'Knotenstatus nicht gefunden. Bitte stellen Sie sicher, dass das Ventil korrekt konfiguriert ist.',
    'ui.noFunctionNumber': 'Keine Funktionsnummer konfiguriert - Befehle deaktiviert',
    'ui.modeHint': 'Hinweis: Modi werden ohne Feedback vom PLC gesendet',
    'ui.sending': 'Sende...',
    'ui.moveToWork': 'Arbeitsstellung fahren',
    'ui.moveToBase': 'Grundstellung fahren',
    'ui.pressureFree': 'Drucklos',
    // Notifications
    'notify.noMqttBroker': 'Keine MQTT-Broker konfiguriert',
    'notify.sendError': 'Fehler beim Senden des Befehls',
    'notify.commandFailed': 'Befehl fehlgeschlagen',
    'notify.moveToBaseSent': 'GST fahren gesendet',
    'notify.moveToWorkSent': 'AST fahren gesendet',
    'notify.togglePositionSent': 'Position wechseln gesendet',
    'notify.pressureFreeSent': 'Drucklos gesendet',
    'notify.modeMonostable': 'Monostabil aktiviert',
    'notify.modeBistablePulsed': 'Bistabil Pulsed aktiviert',
    'notify.modeBistablePermanent': 'Bistabil Permanent aktiviert',
    'notify.modeBistableMiddle': 'Bistabil Mittelstellung aktiviert',
    'notify.errorsAcknowledged': 'Fehler quittiert',
    'notify.configureValveName': 'Bitte Ventilname für {name} konfigurieren',
    'notify.monitoringActive': 'Monitoring: {name}',
    'notify.monitoringCommandsDisabled': 'Monitoring: {name} (Befehle deaktiviert - keine Funktionsnummer)',
    'notify.mqttBrokerNotFound': 'MQTT Broker "{source}" nicht gefunden',
    'notify.errorAcknowledged': '{name}: Fehler quittiert',
    'notify.errorsAcknowledgedCount': '{name}: {count} Fehler quittiert',
  },
  en: {
    // GenericState
    'state.unknown': 'Unknown',
    'state.idle': 'Idle',
    'state.executing': 'Executing',
    'state.done': 'Done',
    'state.error': 'Error',
    'state.pausing': 'Pausing',
    'state.paused': 'Paused',
    'state.aborting': 'Aborting',
    'state.aborted': 'Aborted',
    'state.resetting': 'Resetting',
    'state.preparing': 'Preparing',
    'state.initialising': 'Initialising',
    // ValvePosition
    'position.pressureFree': 'Pressure Free',
    'position.movingToBase': 'Moving to Base',
    'position.movingToWork': 'Moving to Work',
    'position.inBase': 'In Base Position',
    'position.inWork': 'In Work Position',
    'position.undefined': 'Undefined',
    // FunctionCommand
    'command.moveToBase': 'Move to Base',
    'command.moveToWork': 'Move to Work',
    'command.togglePosition': 'Toggle Position',
    'command.pressureFree': 'Pressure Free',
    'command.modeMonostable': 'Monostable',
    'command.modeBistablePulsed': 'Bistable Pulsed',
    'command.modeBistablePermanent': 'Bistable Permanent',
    'command.modeBistableMiddle': 'Bistable Middle',
    // UI Labels
    'ui.valve': 'Valve',
    'ui.status': 'Status',
    'ui.control': 'Control',
    'ui.errors': 'Errors',
    'ui.valveStatus': 'Valve Status',
    'ui.generalStatus': 'General Status',
    'ui.specificStatus': 'Specific Status',
    'ui.recipe': 'Recipe',
    'ui.runtimes': 'Runtimes',
    'ui.lastBaseToWork': 'Last Base → Work',
    'ui.lastWorkToBase': 'Last Work → Base',
    'ui.lastUpdate': 'Last Update',
    'ui.mainControl': 'Main Control',
    'ui.operatingMode': 'Operating Mode',
    'ui.errorMessages': 'Error Messages',
    'ui.open': 'open',
    'ui.acknowledgeAll': 'Acknowledge All',
    'ui.noErrors': 'No error messages',
    'ui.noDataAvailable': 'No data available',
    'ui.nodeStatusNotFound': 'Node status not found. Please make sure the valve is configured correctly.',
    'ui.noFunctionNumber': 'No function number configured - commands disabled',
    'ui.modeHint': 'Note: Modes are sent without PLC feedback',
    'ui.sending': 'Sending...',
    'ui.moveToWork': 'Move to Work Position',
    'ui.moveToBase': 'Move to Base Position',
    'ui.pressureFree': 'Pressure Free',
    // Notifications
    'notify.noMqttBroker': 'No MQTT broker configured',
    'notify.sendError': 'Error sending command',
    'notify.commandFailed': 'Command failed',
    'notify.moveToBaseSent': 'Move to base sent',
    'notify.moveToWorkSent': 'Move to work sent',
    'notify.togglePositionSent': 'Toggle position sent',
    'notify.pressureFreeSent': 'Pressure free sent',
    'notify.modeMonostable': 'Monostable activated',
    'notify.modeBistablePulsed': 'Bistable Pulsed activated',
    'notify.modeBistablePermanent': 'Bistable Permanent activated',
    'notify.modeBistableMiddle': 'Bistable Middle activated',
    'notify.errorsAcknowledged': 'Errors acknowledged',
    'notify.configureValveName': 'Please configure valve name for {name}',
    'notify.monitoringActive': 'Monitoring: {name}',
    'notify.monitoringCommandsDisabled': 'Monitoring: {name} (commands disabled - no function number)',
    'notify.mqttBrokerNotFound': 'MQTT Broker "{source}" not found',
    'notify.errorAcknowledged': '{name}: Error acknowledged',
    'notify.errorsAcknowledgedCount': '{name}: {count} errors acknowledged',
  },
};
