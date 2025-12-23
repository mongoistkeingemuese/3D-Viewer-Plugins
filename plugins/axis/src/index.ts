/**
 * Axis Plugin
 *
 * Features:
 * - Displays comprehensive axis status via node emissive color
 * - Shows all status bits (MotionActivityStatus, MotionStatusMask)
 * - Step control function with configurable step sizes (0.1, 1, 10, 100)
 * - HTTP API integration for axis movement commands
 * - SF number configuration per node
 * - Supports Release 10 and Release 11 MQTT formats
 *
 * Purpose: Monitor and control industrial axes in real-time
 * Usage: Bind to 3D objects representing physical axes
 * Rationale: Provides comprehensive axis monitoring with visual feedback and control
 *
 * @module axis
 * @version 1.0.0
 */

import type {
  Plugin,
  PluginContext,
  BoundNode,
  Unsubscribe,
  MqttMessage,
} from '@3dviewer/plugin-sdk';

import { AxisDetailsPopup } from './components/AxisDetailsPopup';

/**
 * MotionState enum values
 *
 * Purpose: Define motion states for axis visualization
 */
enum MotionState {
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
 * MotionActivityStatusBits (mtAcMk)
 *
 * Purpose: Parse and store activity status bits
 */
interface MotionActivityStatusBits {
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
interface MotionStatusMaskBits {
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
interface AxisDataRelease11 {
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
interface AxisPayloadRelease11 {
  t: string;
  data: AxisDataRelease11[];
}

/**
 * Axis data from Release 10 MQTT payload (nested objects with typ/val)
 */
interface AxisDataRelease10 {
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
interface AxisPayloadRelease10 {
  pack: Array<{
    t: string;
    Axis: AxisDataRelease10;
  }>;
}

/**
 * MQTT format type
 */
type MqttFormat = 'release11' | 'release10';

/**
 * Error message payload structure
 */
interface ErrorPayload {
  utc: number;
  lvl: string;
  src: string;
  typ: string;
  msg: {
    txt: string;
    val: Record<string, unknown>;
  };
}

/**
 * Internal error storage structure
 */
interface ErrorEntry {
  timestamp: number;
  level: string;
  source: string;
  message: string;
  acknowledged: boolean;
}

/**
 * Node-specific state
 *
 * Purpose: Track state for each bound axis node
 */
interface NodeState {
  nodeId: string;
  axisName: string;
  functionNo: number;
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

/**
 * Normalize axis name by trimming whitespace
 */
function normalizeAxisName(name: string): string {
  return name.trim();
}

/**
 * Plugin state manager
 */
class PluginState {
  private nodes: Map<string, NodeState> = new Map();
  private ctx: PluginContext | null = null;
  private errorSubscription: Unsubscribe | null = null;
  private mqttSources: string[] = [];

  initialize(ctx: PluginContext): void {
    this.ctx = ctx;
    this.mqttSources = ctx.mqtt.getSources();
    ctx.log.info('Available MQTT sources', { sources: this.mqttSources });
  }

  getMqttSources(): string[] {
    return this.mqttSources;
  }

  setErrorSubscription(unsub: Unsubscribe): void {
    this.errorSubscription = unsub;
  }

  getContext(): PluginContext {
    if (!this.ctx) throw new Error('Plugin not initialized');
    return this.ctx;
  }

  addNode(nodeId: string, axisName: string, functionNo: number): NodeState {
    const state: NodeState = {
      nodeId,
      axisName,
      functionNo,
      subscriptions: [],
      currentState: MotionState.Disabled,
      activityBits: createEmptyActivityBits(),
      statusMask: createEmptyStatusMask(),
      position: 0,
      velocity: 0,
      worldPosition: 0,
      errors: [],
      lastUpdate: null,
      selectedStepSize: 1,
    };
    this.nodes.set(nodeId, state);
    return state;
  }

  getNode(nodeId: string): NodeState | undefined {
    return this.nodes.get(nodeId);
  }

  getAllNodes(): NodeState[] {
    return Array.from(this.nodes.values());
  }

  removeNode(nodeId: string): void {
    const state = this.nodes.get(nodeId);
    if (state) {
      state.subscriptions.forEach((unsub) => unsub());
      this.nodes.delete(nodeId);
    }
  }

  cleanup(): void {
    this.nodes.forEach((state) => {
      state.subscriptions.forEach((unsub) => unsub());
    });
    this.nodes.clear();
    if (this.errorSubscription) {
      this.errorSubscription();
      this.errorSubscription = null;
    }
  }
}

const pluginState = new PluginState();

/**
 * Create empty activity bits object
 */
function createEmptyActivityBits(): MotionActivityStatusBits {
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
 */
function createEmptyStatusMask(): MotionStatusMaskBits {
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
 * Convert IEEE 754 hex string to float
 */
function hexToFloat(hexString: string): number {
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
 * Parse hex-encoded integer
 */
function hexToInt(hexString: string): number {
  if (!hexString) return 0;
  try {
    return parseInt(hexString, 16);
  } catch {
    return 0;
  }
}

/**
 * Parse MotionActivityStatusBits from hex WORD
 */
function parseActivityBits(hexWord: string): MotionActivityStatusBits {
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
 */
function parseStatusMask(hexDword: string): MotionStatusMaskBits {
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
 * Update node visual state based on MotionState
 */
function updateNodeVisuals(
  ctx: PluginContext,
  nodeId: string,
  motionState: MotionState
): void {
  const node = ctx.nodes.get(nodeId);
  if (!node) return;

  const globalConfig = ctx.config.global.getAll();
  const errorColor = globalConfig.errorColor as string || '#ff0000';
  const homingColor = globalConfig.homingColor as string || '#00aaff';
  const motionColor = globalConfig.motionColor as string || '#00ff00';
  const intensity = globalConfig.emissiveIntensity as number || 0.6;

  node.emissive = '#000000';
  node.emissiveIntensity = 0;

  switch (motionState) {
    case MotionState.ErrorStop:
      node.emissive = errorColor;
      node.emissiveIntensity = intensity;
      break;

    case MotionState.Homing:
      node.emissive = homingColor;
      node.emissiveIntensity = intensity;
      break;

    case MotionState.DiscreteMotion:
    case MotionState.ContinuousMotion:
    case MotionState.SynchronizedMotion:
      node.emissive = motionColor;
      node.emissiveIntensity = intensity;
      break;

    default:
      break;
  }
}

/**
 * Update node position based on world coordinates
 */
function updateNodePosition(
  ctx: PluginContext,
  nodeId: string,
  worldPosition: number
): void {
  const node = ctx.nodes.get(nodeId);
  if (!node) return;

  const config = ctx.config.instance.getForNode(nodeId);
  const conversionFactor = config.conversionFactor as number || 1.0;
  const transformAxis = config.transformAxis as string || 'y';
  const invertDirection = config.invertDirection as boolean || false;

  let value = worldPosition * conversionFactor;
  if (invertDirection) {
    value *= -1;
  }

  switch (transformAxis) {
    case 'x':
      node.position = { ...node.position, x: value };
      break;
    case 'y':
      node.position = { ...node.position, y: value };
      break;
    case 'z':
      node.position = { ...node.position, z: value };
      break;
    case 'rotX':
      node.rotation = { ...node.rotation, x: value };
      break;
    case 'rotY':
      node.rotation = { ...node.rotation, y: value };
      break;
    case 'rotZ':
      node.rotation = { ...node.rotation, z: value };
      break;
  }

  node.duration = 100;
}

/**
 * Get configured MQTT format
 */
function getMqttFormat(ctx: PluginContext): MqttFormat {
  const globalConfig = ctx.config.global.getAll();
  return (globalConfig.mqttFormat as MqttFormat) || 'release11';
}

/**
 * Handle incoming axis data from MQTT - Release 11 format
 */
function handleAxisDataRelease11(
  ctx: PluginContext,
  nodeId: string,
  payload: AxisPayloadRelease11
): boolean {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) return false;

  if (!payload.data || payload.data.length === 0) {
    return false;
  }

  for (const axisData of payload.data) {
    if (axisData.typ !== 'Axis') continue;

    const incomingAxisName = normalizeAxisName(axisData.name);
    if (incomingAxisName !== nodeState.axisName) continue;

    // Parse all values (Release 11: direct hex strings)
    const motionState = hexToInt(axisData.sS) as MotionState;
    const activityBits = parseActivityBits(axisData.mtAcMk);
    const statusMask = parseStatusMask(axisData.motMsk);
    const worldPosition = hexToFloat(axisData.posS0);
    const position = hexToFloat(axisData.pos);
    const velocity = hexToFloat(axisData.vel);

    // Update state
    nodeState.currentState = motionState;
    nodeState.activityBits = activityBits;
    nodeState.statusMask = statusMask;
    nodeState.position = position;
    nodeState.velocity = velocity;
    nodeState.worldPosition = worldPosition;
    nodeState.lastUpdate = new Date();

    // Update visuals
    updateNodeVisuals(ctx, nodeId, motionState);
    updateNodePosition(ctx, nodeId, worldPosition);

    ctx.log.debug('Axis data updated (Release 11)', {
      nodeId,
      axisName: incomingAxisName,
      motionState,
      position,
      velocity,
    });

    return true;
  }

  return false;
}

/**
 * Handle incoming axis data from MQTT - Release 10 format
 */
function handleAxisDataRelease10(
  ctx: PluginContext,
  nodeId: string,
  payload: AxisPayloadRelease10
): boolean {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) return false;

  if (!payload.pack || payload.pack.length === 0) {
    return false;
  }

  for (const packItem of payload.pack) {
    const axisData = packItem.Axis;
    if (!axisData) continue;

    const incomingAxisName = normalizeAxisName(axisData.name);
    if (incomingAxisName !== nodeState.axisName) continue;

    // Parse values (Release 10: nested objects with typ/val)
    const motionState = hexToInt(axisData.sS.val) as MotionState;
    const worldPosition = hexToFloat(axisData.posS0.val);
    const position = hexToFloat(axisData.pos.val);
    const velocity = hexToFloat(axisData.vel.val);

    // Release 10 does NOT have mtAcMk and motMsk - keep empty
    nodeState.activityBits = createEmptyActivityBits();
    nodeState.statusMask = createEmptyStatusMask();

    // Update state
    nodeState.currentState = motionState;
    nodeState.position = position;
    nodeState.velocity = velocity;
    nodeState.worldPosition = worldPosition;
    nodeState.lastUpdate = new Date();

    // Update visuals
    updateNodeVisuals(ctx, nodeId, motionState);
    updateNodePosition(ctx, nodeId, worldPosition);

    ctx.log.debug('Axis data updated (Release 10)', {
      nodeId,
      axisName: incomingAxisName,
      motionState,
      position,
      velocity,
    });

    return true;
  }

  return false;
}

/**
 * Handle incoming axis data from MQTT (supports both formats)
 */
function handleAxisData(
  ctx: PluginContext,
  nodeId: string,
  rawPayload: unknown
): void {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) return;

  const configuredFormat = getMqttFormat(ctx);

  try {
    let parsedPayload: unknown;
    if (typeof rawPayload === 'string') {
      parsedPayload = JSON.parse(rawPayload);
    } else {
      parsedPayload = rawPayload;
    }

    ctx.log.debug('MQTT payload received', {
      nodeId,
      axisName: nodeState.axisName,
      configuredFormat,
    });

    let success = false;

    if (configuredFormat === 'release11') {
      // Try Release 11 format
      const payload = parsedPayload as AxisPayloadRelease11;
      if (payload.data && Array.isArray(payload.data)) {
        success = handleAxisDataRelease11(ctx, nodeId, payload);
      } else {
        ctx.log.error('Format mismatch: Expected Release 11 format (data array)', {
          nodeId,
          hasData: !!payload.data,
          hasPack: !!(parsedPayload as AxisPayloadRelease10).pack,
        });
        ctx.ui.notify('MQTT Format-Fehler: Release 11 erwartet, aber anderes Format empfangen', 'error');
      }
    } else {
      // Try Release 10 format
      const payload = parsedPayload as AxisPayloadRelease10;
      if (payload.pack && Array.isArray(payload.pack)) {
        success = handleAxisDataRelease10(ctx, nodeId, payload);
      } else {
        ctx.log.error('Format mismatch: Expected Release 10 format (pack array)', {
          nodeId,
          hasPack: !!payload.pack,
          hasData: !!(parsedPayload as AxisPayloadRelease11).data,
        });
        ctx.ui.notify('MQTT Format-Fehler: Release 10 erwartet, aber anderes Format empfangen', 'error');
      }
    }

    if (!success) {
      ctx.log.debug('No matching axis found in payload', {
        nodeId,
        axisName: nodeState.axisName,
      });
    }
  } catch (error) {
    ctx.log.error('Failed to process axis data', { nodeId, error });
  }
}

/**
 * Handle incoming error messages from MQTT
 */
function handleErrorMessage(
  ctx: PluginContext,
  payload: ErrorPayload
): void {
  try {
    const source = normalizeAxisName(payload.src);

    pluginState.getAllNodes().forEach((nodeState) => {
      if (source === nodeState.axisName) {
        const errorEntry: ErrorEntry = {
          timestamp: payload.utc,
          level: payload.lvl,
          source: payload.src,
          message: payload.msg.txt,
          acknowledged: false,
        };

        nodeState.errors.unshift(errorEntry);
        if (nodeState.errors.length > 5) {
          nodeState.errors = nodeState.errors.slice(0, 5);
        }

        ctx.log.warn('Axis error received', {
          nodeId: nodeState.nodeId,
          axisName: nodeState.axisName,
          error: errorEntry,
        });

        if (payload.lvl === 'ERR') {
          ctx.ui.notify(`Axis Error: ${nodeState.axisName} - ${payload.msg.txt}`, 'error');
        }
      }
    });
  } catch (error) {
    ctx.log.error('Failed to process error message', { error });
  }
}

/**
 * Get MQTT API with configured source
 */
function getMqttApi(ctx: PluginContext): typeof ctx.mqtt {
  const globalConfig = ctx.config.global.getAll();
  const mqttSource = globalConfig.mqttSource as string;

  if (mqttSource) {
    const availableSources = pluginState.getMqttSources();
    if (!availableSources.includes(mqttSource)) {
      ctx.log.warn(`Configured MQTT source "${mqttSource}" not found`, {
        available: availableSources,
      });
      ctx.ui.notify(`MQTT Broker "${mqttSource}" nicht gefunden`, 'warning');
    }
    return ctx.mqtt.withSource(mqttSource);
  }
  return ctx.mqtt;
}

/**
 * Setup MQTT subscriptions for a node
 */
function setupSubscriptions(ctx: PluginContext, nodeId: string): void {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) return;

  const globalConfig = ctx.config.global.getAll();
  const mainTopic = globalConfig.mainTopic as string || 'machine/axes';
  const mqtt = getMqttApi(ctx);

  const availableSources = ctx.mqtt.getSources();
  if (availableSources.length === 0) {
    ctx.log.error('No MQTT sources available', { nodeId });
    ctx.ui.notify('Keine MQTT-Broker konfiguriert', 'error');
    return;
  }

  const axisUnsub = mqtt.subscribe(mainTopic, (msg: MqttMessage) => {
    handleAxisData(ctx, nodeId, msg.payload);
  });
  nodeState.subscriptions.push(axisUnsub);

  ctx.log.info('Axis subscription setup', {
    nodeId,
    axisName: nodeState.axisName,
    mainTopic,
  });
}

/**
 * Setup shared error subscription
 */
function setupErrorSubscription(ctx: PluginContext): void {
  const globalConfig = ctx.config.global.getAll();
  const errorTopic = globalConfig.errorTopic as string || 'machine/errors';
  const mqtt = getMqttApi(ctx);

  const availableSources = ctx.mqtt.getSources();
  if (availableSources.length === 0) {
    ctx.log.warn('No MQTT sources available for error subscription');
    return;
  }

  const errorUnsub = mqtt.subscribe(errorTopic, (msg: MqttMessage) => {
    handleErrorMessage(ctx, msg.payload as ErrorPayload);
  });
  pluginState.setErrorSubscription(errorUnsub);

  ctx.log.info('Error subscription setup', { errorTopic });
}

/**
 * Send step command via HTTP API
 *
 * Purpose: Execute axis step movement via function call API
 */
export async function sendStepCommand(
  nodeId: string,
  stepValue: number
): Promise<boolean> {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);

  if (!nodeState) {
    ctx.log.error('Node state not found for step command', { nodeId });
    return false;
  }

  const globalConfig = ctx.config.global.getAll();
  const httpBaseUrl = globalConfig.httpBaseUrl as string || 'http://localhost:3021';
  const url = `${httpBaseUrl}/v1/commands/functioncall`;

  const payload = {
    functionNo: nodeState.functionNo,
    functionCommand: 83,
    functionInvokerCommand: 'Start',
    inputs: [
      {
        functionNo: nodeState.functionNo,
        parameters: [
          {
            parameterIndex: 4,
            typeOfParameter: 'float',
            parameter: stepValue,
          },
        ],
      },
    ],
  };

  try {
    ctx.log.info('Sending step command', {
      nodeId,
      axisName: nodeState.axisName,
      functionNo: nodeState.functionNo,
      stepValue,
      url,
    });

    const response = await ctx.http.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      ctx.log.info('Step command sent successfully', {
        nodeId,
        stepValue,
        status: response.status,
      });
      ctx.ui.notify(`Step ${stepValue > 0 ? '+' : ''}${stepValue} gesendet`, 'success');
      return true;
    } else {
      ctx.log.error('Step command failed', {
        nodeId,
        status: response.status,
        statusText: response.statusText,
      });
      ctx.ui.notify(`Step-Befehl fehlgeschlagen: ${response.statusText}`, 'error');
      return false;
    }
  } catch (error) {
    ctx.log.error('Step command error', { nodeId, error });
    ctx.ui.notify('Fehler beim Senden des Step-Befehls', 'error');
    return false;
  }
}

/**
 * Set step size for a node
 */
export function setStepSize(nodeId: string, stepSize: number): void {
  const nodeState = pluginState.getNode(nodeId);
  if (nodeState) {
    nodeState.selectedStepSize = stepSize;
  }
}

/**
 * Acknowledge an error
 */
export function acknowledgeError(nodeId: string, errorIndex: number): void {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);

  if (!nodeState || errorIndex < 0 || errorIndex >= nodeState.errors.length) {
    return;
  }

  nodeState.errors[errorIndex].acknowledged = true;
  ctx.log.info('Error acknowledged', { nodeId, errorIndex });
}

/**
 * Get node state for UI components
 */
export function getNodeState(nodeId: string): NodeState | undefined {
  return pluginState.getNode(nodeId);
}

/**
 * Get available MQTT sources for UI components
 */
export function getMqttSources(): string[] {
  return pluginState.getMqttSources();
}

/**
 * Get current MQTT source configuration
 */
export function getCurrentMqttSource(): string {
  const ctx = pluginState.getContext();
  const globalConfig = ctx.config.global.getAll();
  return (globalConfig.mqttSource as string) || '';
}

/**
 * Check if step control is available
 *
 * Purpose: Step control is only available for Release 11 format
 */
export function isStepControlAvailable(): boolean {
  const ctx = pluginState.getContext();
  const format = getMqttFormat(ctx);
  return format === 'release11';
}

/**
 * Get current MQTT format
 */
export function getCurrentMqttFormat(): MqttFormat {
  const ctx = pluginState.getContext();
  return getMqttFormat(ctx);
}

// ============================================================================
// PLUGIN DEFINITION
// ============================================================================

const plugin: Plugin = {
  components: {
    AxisDetailsPopup,
  },

  onLoad(ctx: PluginContext): void {
    pluginState.initialize(ctx);

    ctx.log.info('Axis Plugin loaded', {
      pluginId: ctx.pluginId,
    });

    setupErrorSubscription(ctx);

    ctx.events.on('context-menu-action', (data: unknown) => {
      const event = data as { action: string; nodeId: string };
      if (event.action === 'show-axis-details') {
        ctx.ui.showPopup('AxisDetails', {
          title: 'Axis Details',
          data: { nodeId: event.nodeId },
        });
      }
    });
  },

  onNodeBound(ctx: PluginContext, node: BoundNode): void {
    const config = ctx.config.instance.getForNode(node.id);
    const axisName = config.axisName as string;
    const functionNo = config.functionNo as number || 5031;

    if (!axisName) {
      ctx.log.warn(`No axis name configured for node ${node.id}`);
      ctx.ui.notify(`Bitte Achsname für ${node.name} konfigurieren`, 'warning');
      return;
    }

    ctx.log.info(`Node bound: ${node.name} (${node.id}) -> Axis: ${axisName}, SF: ${functionNo}`);

    pluginState.addNode(node.id, axisName, functionNo);
    setupSubscriptions(ctx, node.id);

    ctx.ui.notify(`Monitoring: ${axisName}`, 'success');
  },

  onNodeUnbound(ctx: PluginContext, node: BoundNode): void {
    ctx.log.info(`Node unbound: ${node.name} (${node.id})`);

    pluginState.removeNode(node.id);

    const nodeProxy = ctx.nodes.get(node.id);
    if (nodeProxy) {
      nodeProxy.emissive = '#000000';
      nodeProxy.emissiveIntensity = 0;
    }
  },

  onConfigChange(
    ctx: PluginContext,
    type: 'global' | 'instance',
    key: string,
    nodeId?: string
  ): void {
    ctx.log.debug(`Config changed: ${type}.${key}`, nodeId || '');

    if (type === 'instance' && nodeId) {
      if (key === 'axisName' || key === 'functionNo') {
        const config = ctx.config.instance.getForNode(nodeId);
        const newAxisName = config.axisName as string;
        const newFunctionNo = config.functionNo as number || 5031;

        if (newAxisName) {
          pluginState.removeNode(nodeId);
          pluginState.addNode(nodeId, newAxisName, newFunctionNo);
          setupSubscriptions(ctx, nodeId);
          ctx.log.info(`Config updated for ${nodeId}: ${newAxisName}, SF: ${newFunctionNo}`);
        }
      }
    }

    if (type === 'global' && (key === 'errorColor' || key === 'homingColor' || key === 'motionColor')) {
      pluginState.getAllNodes().forEach((nodeState) => {
        updateNodeVisuals(ctx, nodeState.nodeId, nodeState.currentState);
      });
    }
  },

  onUnload(ctx: PluginContext): void {
    ctx.log.info('Axis Plugin unloading...');
    pluginState.cleanup();
    ctx.log.info('Axis Plugin unloaded');
  },
};

export default plugin;
