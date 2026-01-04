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
 * - Error tracking with acknowledge functionality
 *
 * Purpose: Monitor and control industrial axes in real-time
 * Usage: Bind to 3D objects representing physical axes
 * Rationale: Provides comprehensive axis monitoring with visual feedback and control
 *
 * @module axis
 * @version 1.3.0
 */

import type {
  Plugin,
  PluginContext,
  BoundNode,
  Unsubscribe,
  MqttMessage,
} from '@3dviewer/plugin-sdk';

import { AxisDetailsPopup } from './components/AxisDetailsPopup';
import {
  MotionState,
  DefaultTranslations,
  type NodeState,
  type ErrorPayload,
  type ErrorEntry,
  type MqttFormat,
  type AxisPayloadRelease11,
  type AxisPayloadRelease10,
} from './types';
import {
  hexToInt,
  hexToFloat,
  parseActivityBits,
  parseStatusMask,
  createEmptyActivityBits,
  createEmptyStatusMask,
  normalizeAxisName,
} from './utils';

/**
 * Get current language from host i18n
 */
function getCurrentLanguage(): string {
  // Try to get language from host i18n (available via window in proxy sandbox)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hostI18n = (window as any).__i18n__ || (window as any).i18n;
    if (hostI18n?.language) {
      return hostI18n.language.split('-')[0]; // Handle 'de-DE' -> 'de'
    }
  } catch {
    // Ignore errors
  }
  // Fallback: check localStorage
  const stored = localStorage.getItem('i18n_language');
  return stored || 'de';
}

/**
 * Translate a notification key using DefaultTranslations with optional parameters
 */
function translateNotify(key: string, params?: Record<string, string | number>): string {
  const lang = getCurrentLanguage();
  const translations = DefaultTranslations[lang] || DefaultTranslations['de'];
  let text = translations[key] || key;

  // Replace placeholders like {name} with actual values
  if (params) {
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
    }
  }

  return text;
}

/**
 * Plugin state manager
 *
 * Purpose: Centralized state management for all axis nodes
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

  hasErrorSubscription(): boolean {
    return this.errorSubscription !== null;
  }

  getContext(): PluginContext {
    if (!this.ctx) throw new Error('Plugin not initialized');
    return this.ctx;
  }

  addNode(nodeId: string, axisName: string, axisCommandNo: number, moveCommandNo: number): NodeState {
    const state: NodeState = {
      nodeId,
      axisName,
      axisCommandNo,
      moveCommandNo,
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
 * Setup global error subscription (called once in onLoad)
 *
 * Purpose: Subscribe to error topic ONCE globally to avoid duplicate error logs
 * when multiple nodes are bound to the plugin.
 */
function setupGlobalErrorSubscription(ctx: PluginContext): void {
  // Only subscribe once
  if (pluginState.hasErrorSubscription()) {
    ctx.log.debug('Global error subscription already exists, skipping');
    return;
  }

  const globalConfig = ctx.config.global.getAll();
  const errorTopic = (globalConfig.errorTopic as string) || 'machine/errors';
  const mqtt = getMqttApi(ctx);

  const availableSources = ctx.mqtt.getSources();
  if (availableSources.length === 0) {
    ctx.log.warn('No MQTT sources available for error subscription');
    return;
  }

  ctx.log.info('Setting up global error subscription', { errorTopic });
  const errorUnsub = mqtt.subscribe(errorTopic, (msg: MqttMessage) => {
    handleErrorMessage(ctx, msg.payload);
  });
  pluginState.setErrorSubscription(errorUnsub);
}

/**
 * Get configured MQTT format
 */
function getMqttFormat(ctx: PluginContext): MqttFormat {
  const globalConfig = ctx.config.global.getAll();
  return (globalConfig.mqttFormat as MqttFormat) || 'release11';
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
      ctx.ui.notify(translateNotify('notify.mqttBrokerNotFound', { source: mqttSource }), 'warning');
    }
    return ctx.mqtt.withSource(mqttSource);
  }
  return ctx.mqtt;
}

/**
 * Update node visual state based on MotionState
 *
 * Error State Priority:
 * - Error state has highest priority and MUST NOT be overwritten by other events
 * - Error always uses 100% intensity (ignores global config)
 * - Error state persists until manually acknowledged
 *
 * @param hasError - External error flag (from error subscription)
 */
function updateNodeVisuals(
  ctx: PluginContext,
  nodeId: string,
  motionState: MotionState,
  hasError: boolean = false
): void {
  const node = ctx.nodes.get(nodeId);
  if (!node) return;

  const globalConfig = ctx.config.global.getAll();
  const errorColor = globalConfig.errorColor as string || '#ff0000';
  const homingColor = globalConfig.homingColor as string || '#00aaff';
  const motionColor = globalConfig.motionColor as string || '#00ff00';
  const intensity = globalConfig.emissiveIntensity as number || 0.6;

  // Check for unacknowledged errors (highest priority)
  const nodeState = pluginState.getNode(nodeId);
  const hasUnacknowledgedErrors = nodeState?.errors.some(e => !e.acknowledged) ?? false;

  // Error state has HIGHEST priority - always 100% intensity
  // Error state MUST NOT be overwritten until acknowledged
  if (hasUnacknowledgedErrors || hasError || motionState === MotionState.ErrorStop) {
    node.emissive = errorColor;
    node.emissiveIntensity = 1.0; // Always 100% for errors
    return;
  }

  // Reset emissive for non-error states
  node.emissive = '#000000';
  node.emissiveIntensity = 0;

  // Other states use configured intensity
  switch (motionState) {
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

    // Check for unacknowledged errors
    const hasUnacknowledgedErrors = nodeState.errors.some(e => !e.acknowledged);

    // Update visuals
    updateNodeVisuals(ctx, nodeId, motionState, hasUnacknowledgedErrors);
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

    // Check for unacknowledged errors
    const hasUnacknowledgedErrors = nodeState.errors.some(e => !e.acknowledged);

    // Update visuals
    updateNodeVisuals(ctx, nodeId, motionState, hasUnacknowledgedErrors);
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
        ctx.ui.notify(translateNotify('notify.mqttFormatError', { expected: 'Release 11' }), 'error');
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
        ctx.ui.notify(translateNotify('notify.mqttFormatError', { expected: 'Release 10' }), 'error');
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
function handleErrorMessage(ctx: PluginContext, rawPayload: unknown): void {
  try {
    // Convert to string for storage
    const payloadString = typeof rawPayload === 'string'
      ? rawPayload
      : JSON.stringify(rawPayload, null, 2);

    // Parse for field extraction
    let payload: ErrorPayload;
    if (typeof rawPayload === 'string') {
      payload = JSON.parse(rawPayload);
    } else {
      payload = rawPayload as ErrorPayload;
    }

    ctx.log.info('Error message received', { src: payload.src, lvl: payload.lvl });

    const source = normalizeAxisName(payload.src || '');
    const allNodes = pluginState.getAllNodes();

    allNodes.forEach((nodeState) => {
      const expectedAxisName = normalizeAxisName(nodeState.axisName);
      if (source === expectedAxisName) {
        const errorEntry: ErrorEntry = {
          timestamp: payload.utc,
          level: payload.lvl,
          source: payload.src,
          rawPayload: payloadString,
          acknowledged: false,
        };

        nodeState.errors.unshift(errorEntry);
        if (nodeState.errors.length > 20) {
          nodeState.errors = nodeState.errors.slice(0, 20);
        }

        // Extract message text for logging
        let msgText = 'Unknown error';
        if (typeof payload.msg === 'string') {
          msgText = payload.msg;
        } else if (payload.msg?.txt) {
          msgText = payload.msg.txt;
        } else if (payload.msg?.text) {
          msgText = payload.msg.text;
        }

        // Log to 3D Viewer log based on level - include nodeId for acknowledgment
        if (payload.lvl === 'ERR') {
          ctx.log.error(`[${nodeState.axisName}] ${msgText}`, {
            nodeId: nodeState.nodeId,
            nodeName: nodeState.axisName,
            payload: payload,
          });
          // Update visuals to show error state
          updateNodeVisuals(ctx, nodeState.nodeId, nodeState.currentState, true);
          ctx.ui.notify(`Error: ${nodeState.axisName} - ${msgText}`, 'error');
        } else if (payload.lvl === 'WARN') {
          ctx.log.warn(`[${nodeState.axisName}] ${msgText}`, {
            nodeId: nodeState.nodeId,
            nodeName: nodeState.axisName,
            payload: payload,
          });
          ctx.ui.notify(`Warning: ${nodeState.axisName} - ${msgText}`, 'warning');
        } else {
          ctx.log.info(`[${nodeState.axisName}] ${msgText}`, {
            nodeId: nodeState.nodeId,
            nodeName: nodeState.axisName,
            payload: payload,
          });
        }
      }
    });
  } catch (error) {
    ctx.log.error('Failed to process error message', { error });
  }
}

/**
 * Setup MQTT subscriptions for a node (axis data only)
 *
 * Note: Error subscription is handled globally in onLoad to prevent
 * duplicate error logs when multiple nodes are bound.
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
    ctx.ui.notify(translateNotify('notify.noMqttBroker'), 'error');
    return;
  }

  // Subscribe to axis topic for this specific node
  ctx.log.info('Setting up axis subscription', { nodeId, mainTopic });
  const axisUnsub = mqtt.subscribe(mainTopic, (msg: MqttMessage) => {
    handleAxisData(ctx, nodeId, msg.payload);
  });
  nodeState.subscriptions.push(axisUnsub);
}

// ============================================================================
// HTTP COMMAND FUNCTIONS
// ============================================================================

/**
 * Send step command via HTTP API
 *
 * Purpose: Execute axis step movement via function call API
 * Uses: Move Command No., functionCommand: 83, parameterIndex: 4
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
    functionNo: nodeState.moveCommandNo,
    functionCommand: 83,
    functionInvokerCommand: 'Start',
    inputs: [
      {
        functionNo: nodeState.moveCommandNo,
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
      moveCommandNo: nodeState.moveCommandNo,
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
      ctx.ui.notify(translateNotify('notify.stepSent', { value: `${stepValue > 0 ? '+' : ''}${stepValue}` }), 'success');
      return true;
    } else {
      ctx.log.error('Step command failed', {
        nodeId,
        status: response.status,
        statusText: response.statusText,
      });
      ctx.ui.notify(translateNotify('notify.stepCommandFailed', { error: response.statusText }), 'error');
      return false;
    }
  } catch (error) {
    ctx.log.error('Step command error', { nodeId, error });
    ctx.ui.notify(translateNotify('notify.stepCommandError'), 'error');
    return false;
  }
}

/**
 * Send Switch On command via HTTP API
 *
 * Purpose: Turn axis on
 * Uses: Axis Command No., functionCommand: 9
 */
export async function sendSwitchOnCommand(nodeId: string): Promise<boolean> {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);

  if (!nodeState) {
    ctx.log.error('Node state not found for switch on command', { nodeId });
    return false;
  }

  const globalConfig = ctx.config.global.getAll();
  const httpBaseUrl = globalConfig.httpBaseUrl as string || 'http://localhost:3021';
  const url = `${httpBaseUrl}/v1/commands/functioncall`;

  const payload = {
    functionNo: nodeState.axisCommandNo,
    functionCommand: 9,
    functionInvokerCommand: 'Start',
    inputs: [],
  };

  try {
    ctx.log.info('Sending switch on command', {
      nodeId,
      axisName: nodeState.axisName,
      axisCommandNo: nodeState.axisCommandNo,
      url,
    });

    const response = await ctx.http.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      ctx.log.info('Switch on command sent successfully', { nodeId, status: response.status });
      ctx.ui.notify(translateNotify('notify.switchOnSent'), 'success');
      return true;
    } else {
      ctx.log.error('Switch on command failed', {
        nodeId,
        status: response.status,
        statusText: response.statusText,
      });
      ctx.ui.notify(translateNotify('notify.switchOnFailed', { error: response.statusText }), 'error');
      return false;
    }
  } catch (error) {
    ctx.log.error('Switch on command error', { nodeId, error });
    ctx.ui.notify(translateNotify('notify.switchOnError'), 'error');
    return false;
  }
}

/**
 * Send Homing command via HTTP API
 *
 * Purpose: Start homing operation
 * Uses: Move Command No., functionCommand: 13
 */
export async function sendHomingCommand(nodeId: string): Promise<boolean> {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);

  if (!nodeState) {
    ctx.log.error('Node state not found for homing command', { nodeId });
    return false;
  }

  const globalConfig = ctx.config.global.getAll();
  const httpBaseUrl = globalConfig.httpBaseUrl as string || 'http://localhost:3021';
  const url = `${httpBaseUrl}/v1/commands/functioncall`;

  const payload = {
    functionNo: nodeState.moveCommandNo,
    functionCommand: 13,
    functionInvokerCommand: 'Start',
    inputs: [],
  };

  try {
    ctx.log.info('Sending homing command', {
      nodeId,
      axisName: nodeState.axisName,
      moveCommandNo: nodeState.moveCommandNo,
      url,
    });

    const response = await ctx.http.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      ctx.log.info('Homing command sent successfully', { nodeId, status: response.status });
      ctx.ui.notify(translateNotify('notify.homingStarted'), 'success');
      return true;
    } else {
      ctx.log.error('Homing command failed', {
        nodeId,
        status: response.status,
        statusText: response.statusText,
      });
      ctx.ui.notify(translateNotify('notify.homingFailed', { error: response.statusText }), 'error');
      return false;
    }
  } catch (error) {
    ctx.log.error('Homing command error', { nodeId, error });
    ctx.ui.notify(translateNotify('notify.homingError'), 'error');
    return false;
  }
}

/**
 * Send Move To Position command via HTTP API
 *
 * Purpose: Move axis to absolute position
 * Uses: Move Command No., functionCommand: 93, parameterIndex: 0 = position
 */
export async function sendMoveToPositionCommand(
  nodeId: string,
  targetPosition: number
): Promise<boolean> {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);

  if (!nodeState) {
    ctx.log.error('Node state not found for move to position command', { nodeId });
    return false;
  }

  const globalConfig = ctx.config.global.getAll();
  const httpBaseUrl = globalConfig.httpBaseUrl as string || 'http://localhost:3021';
  const url = `${httpBaseUrl}/v1/commands/functioncall`;

  const payload = {
    functionNo: nodeState.moveCommandNo,
    functionCommand: 93,
    functionInvokerCommand: 'Start',
    inputs: [
      {
        functionNo: nodeState.moveCommandNo,
        parameters: [
          {
            parameterIndex: 0,
            typeOfParameter: 'float',
            parameter: targetPosition,
          },
        ],
      },
    ],
  };

  try {
    ctx.log.info('Sending move to position command', {
      nodeId,
      axisName: nodeState.axisName,
      moveCommandNo: nodeState.moveCommandNo,
      targetPosition,
      url,
    });

    const response = await ctx.http.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      ctx.log.info('Move to position command sent successfully', {
        nodeId,
        targetPosition,
        status: response.status,
      });
      ctx.ui.notify(translateNotify('notify.moveToSent', { position: targetPosition }), 'success');
      return true;
    } else {
      ctx.log.error('Move to position command failed', {
        nodeId,
        status: response.status,
        statusText: response.statusText,
      });
      ctx.ui.notify(translateNotify('notify.moveToFailed', { error: response.statusText }), 'error');
      return false;
    }
  } catch (error) {
    ctx.log.error('Move to position command error', { nodeId, error });
    ctx.ui.notify(translateNotify('notify.moveToError'), 'error');
    return false;
  }
}

// ============================================================================
// EXPORTED FUNCTIONS FOR UI COMPONENTS
// ============================================================================

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
 * Acknowledge an error and reset node visual state
 */
export function acknowledgeError(nodeId: string, errorIndex: number): void {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);

  if (!nodeState || errorIndex < 0 || errorIndex >= nodeState.errors.length) {
    return;
  }

  const error = nodeState.errors[errorIndex];
  error.acknowledged = true;

  // Log the acknowledgement
  ctx.log.info('Error acknowledged', {
    nodeId,
    axisName: nodeState.axisName,
    errorIndex,
    level: error.level,
    acknowledgedAt: new Date().toISOString(),
  });

  // Check if all errors are acknowledged
  const hasUnacknowledgedErrors = nodeState.errors.some(e => !e.acknowledged);

  // Reset node visual state if no more unacknowledged errors
  if (!hasUnacknowledgedErrors) {
    updateNodeVisuals(ctx, nodeId, nodeState.currentState, false);

    ctx.log.info('Node error state reset after acknowledgement', {
      nodeId,
      axisName: nodeState.axisName,
    });

    ctx.ui.notify(translateNotify('notify.errorAcknowledged', { name: nodeState.axisName }), 'success');
  }
}

/**
 * Acknowledge all errors for a node
 */
export function acknowledgeAllErrors(nodeId: string): void {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);

  if (!nodeState) {
    return;
  }

  const errorCount = nodeState.errors.length;
  if (errorCount === 0) {
    return;
  }

  // Log the acknowledgement
  ctx.log.info('All errors acknowledged and cleared', {
    nodeId,
    axisName: nodeState.axisName,
    count: errorCount,
    acknowledgedAt: new Date().toISOString(),
  });

  // Clear all errors
  nodeState.errors = [];

  // Reset node visual state
  updateNodeVisuals(ctx, nodeId, nodeState.currentState, false);

  ctx.log.info('Node state reset after acknowledgement', {
    nodeId,
    axisName: nodeState.axisName,
    newState: 'Normal',
  });

  ctx.ui.notify(translateNotify('notify.errorsAcknowledgedCount', { name: nodeState.axisName, count: errorCount }), 'success');
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

/**
 * Get unacknowledged error count
 */
export function getUnacknowledgedErrorCount(nodeId: string): number {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) return 0;
  return nodeState.errors.filter((e) => !e.acknowledged).length;
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

    // Setup global error subscription ONCE (not per node)
    setupGlobalErrorSubscription(ctx);

    ctx.events.on('context-menu-action', (data: unknown) => {
      const event = data as { action: string; nodeId: string };
      if (event.action === 'show-axis-details') {
        ctx.ui.showPopup('AxisDetails', {
          title: 'Axis Details',
          data: { nodeId: event.nodeId },
        });
      }
    });

    // Listen for log acknowledgments from Viewer Log
    ctx.events.onLogAcknowledged((entries) => {
      entries.forEach((entry) => {
        if (entry.nodeId) {
          const nodeState = pluginState.getNode(entry.nodeId);
          if (nodeState) {
            // Mark all errors as acknowledged for this node
            let hasUnacknowledged = false;
            nodeState.errors.forEach((err) => {
              if (!err.acknowledged) {
                err.acknowledged = true;
                hasUnacknowledged = true;
              }
            });

            // Reset node visual state if errors were acknowledged
            if (hasUnacknowledged) {
              updateNodeVisuals(ctx, entry.nodeId, nodeState.currentState, false);
              ctx.log.info('Node error state reset via Viewer Log acknowledgement', {
                nodeId: entry.nodeId,
                axisName: nodeState.axisName,
              });
            }
          }
        }
      });
    });
  },

  onNodeBound(ctx: PluginContext, node: BoundNode): void {
    const config = ctx.config.instance.getForNode(node.id);
    const axisName = config.axisName as string;
    const axisCommandNo = config.axisCommandNo as number || 5031;
    const moveCommandNo = config.moveCommandNo as number || 5031;

    if (!axisName) {
      ctx.log.warn(`No axis name configured for node ${node.id}`);
      ctx.ui.notify(translateNotify('notify.configureAxisName', { name: node.name }), 'warning');
      return;
    }

    ctx.log.info(`Node bound: ${node.name} (${node.id}) -> Axis: ${axisName}, AxisCmd: ${axisCommandNo}, MoveCmd: ${moveCommandNo}`);

    pluginState.addNode(node.id, axisName, axisCommandNo, moveCommandNo);
    setupSubscriptions(ctx, node.id);

    ctx.ui.notify(translateNotify('notify.monitoringActive', { name: axisName }), 'success');
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
      if (key === 'axisName' || key === 'axisCommandNo' || key === 'moveCommandNo') {
        const config = ctx.config.instance.getForNode(nodeId);
        const newAxisName = config.axisName as string;
        const newAxisCommandNo = config.axisCommandNo as number || 5031;
        const newMoveCommandNo = config.moveCommandNo as number || 5031;

        if (newAxisName) {
          pluginState.removeNode(nodeId);
          pluginState.addNode(nodeId, newAxisName, newAxisCommandNo, newMoveCommandNo);
          setupSubscriptions(ctx, nodeId);
          ctx.log.info(`Config updated for ${nodeId}: ${newAxisName}, AxisCmd: ${newAxisCommandNo}, MoveCmd: ${newMoveCommandNo}`);
        }
      }
    }

    if (type === 'global' && (key === 'errorColor' || key === 'homingColor' || key === 'motionColor')) {
      pluginState.getAllNodes().forEach((nodeState) => {
        const hasUnacknowledgedErrors = nodeState.errors.some(e => !e.acknowledged);
        updateNodeVisuals(ctx, nodeState.nodeId, nodeState.currentState, hasUnacknowledgedErrors);
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
