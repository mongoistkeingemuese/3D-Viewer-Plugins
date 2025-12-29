/**
 * Valve Plugin
 *
 * Features:
 * - Displays valve status (Generic State, Specific State)
 * - Position animation (GST/AST) with configurable duration
 * - Emissive highlighting during movement
 * - Runtime measurement for valve movements
 * - HTTP API integration for valve commands
 * - Error tracking with acknowledge functionality
 *
 * Purpose: Monitor and control industrial valves in real-time
 * Usage: Bind to 3D objects representing physical valves
 * Rationale: Provides comprehensive valve monitoring with visual feedback and control
 *
 * @module valve
 * @version 1.0.0
 */

import type {
  Plugin,
  PluginContext,
  BoundNode,
  Unsubscribe,
  MqttMessage,
} from '@3dviewer/plugin-sdk';

import { ValveDetailsPopup } from './components/ValveDetailsPopup';
import {
  GenericState,
  ValvePosition,
  ValvePositionNames,
  FunctionCommand,
  type NodeState,
  type ValvePayload,
  type ErrorPayload,
  type ErrorEntry,
  type AstPosition,
  type MqttFormat,
} from './types';
import { hexToInt, parseMqttTimestamp, normalizeValveName } from './utils';

/**
 * Plugin state manager
 *
 * Purpose: Centralized state management for all valve nodes
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

  addNode(nodeId: string, valveName: string, functionNo: number): NodeState {
    const state: NodeState = {
      nodeId,
      valveName,
      functionNo,
      subscriptions: [],
      genericState: GenericState.Idle,
      specificState: ValvePosition.IsInUndefinedPosition,
      previousSpecificState: ValvePosition.IsInUndefinedPosition,
      recipe: 0,
      moveStartTimestamp: null,
      lastDurationGstToAst: null,
      lastDurationAstToGst: null,
      errors: [],
      lastUpdate: null,
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
 * Get configured MQTT format
 */
function getMqttFormat(ctx: PluginContext): MqttFormat {
  const globalConfig = ctx.config.global.getAll();
  return (globalConfig.mqttFormat as MqttFormat) || 'release10';
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
 * Get AST position from instance config
 */
function getAstPosition(ctx: PluginContext, nodeId: string): AstPosition {
  const config = ctx.config.instance.getForNode(nodeId);
  return {
    x: (config.astPosX as number) || 0,
    y: (config.astPosY as number) || 0,
    z: (config.astPosZ as number) || 0,
    rotX: (config.astRotX as number) || 0,
    rotY: (config.astRotY as number) || 0,
    rotZ: (config.astRotZ as number) || 0,
  };
}

/**
 * Update node position based on valve state
 *
 * Purpose: Animate valve node to GST or AST position
 */
function updateNodePosition(
  ctx: PluginContext,
  nodeId: string,
  position: ValvePosition
): void {
  const node = ctx.nodes.get(nodeId);
  if (!node) return;

  const config = ctx.config.instance.getForNode(nodeId);
  const astPos = getAstPosition(ctx, nodeId);

  // Determine target position and duration
  let duration: number;
  let targetPosition: { x: number; y: number; z: number };
  let targetRotation: { x: number; y: number; z: number };

  switch (position) {
    case ValvePosition.MovingToBasePosition:
    case ValvePosition.IsInBasePosition:
      // GST position: (0, 0, 0)
      targetPosition = { x: 0, y: 0, z: 0 };
      targetRotation = { x: 0, y: 0, z: 0 };
      duration = (config.durationMoveGST as number) || 500;
      break;

    case ValvePosition.MovingToWorkPosition:
    case ValvePosition.IsInWorkPosition:
      // AST position from config
      targetPosition = { x: astPos.x, y: astPos.y, z: astPos.z };
      targetRotation = { x: astPos.rotX, y: astPos.rotY, z: astPos.rotZ };
      duration = (config.durationMoveAST as number) || 500;
      break;

    default:
      // Don't update position for undefined/pressure-free states
      return;
  }

  node.position = targetPosition;
  node.rotation = targetRotation;
  node.duration = duration;

  ctx.log.debug('Node position updated', {
    nodeId,
    position,
    targetPosition,
    targetRotation,
    duration,
  });
}

/**
 * Update node visual state (emissive highlighting)
 *
 * Purpose: Show visual feedback during movement or error
 */
function updateNodeVisuals(
  ctx: PluginContext,
  nodeId: string,
  genericState: GenericState,
  specificState: ValvePosition
): void {
  const node = ctx.nodes.get(nodeId);
  if (!node) return;

  const globalConfig = ctx.config.global.getAll();
  const highlightColor = (globalConfig.highlightColor as string) || '#00aaff';
  const errorColor = (globalConfig.errorColor as string) || '#ff0000';
  const intensity = (globalConfig.highlightIntensity as number) || 0.6;

  // Reset emissive
  node.emissive = '#000000';
  node.emissiveIntensity = 0;

  // Error state has priority
  if (genericState === GenericState.Error) {
    node.emissive = errorColor;
    node.emissiveIntensity = intensity;
    return;
  }

  // Highlight during movement
  if (
    specificState === ValvePosition.MovingToBasePosition ||
    specificState === ValvePosition.MovingToWorkPosition
  ) {
    node.emissive = highlightColor;
    node.emissiveIntensity = intensity;
  }
}

/**
 * Handle incoming valve data from MQTT
 */
function handleValveData(
  ctx: PluginContext,
  nodeId: string,
  rawPayload: unknown
): void {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) return;

  try {
    let parsedPayload: ValvePayload;
    if (typeof rawPayload === 'string') {
      parsedPayload = JSON.parse(rawPayload);
    } else {
      parsedPayload = rawPayload as ValvePayload;
    }

    if (!parsedPayload.pack || parsedPayload.pack.length === 0) {
      return;
    }

    for (const packItem of parsedPayload.pack) {
      const valveData = packItem.Valve;
      if (!valveData) continue;

      const incomingValveName = normalizeValveName(valveData.name);
      const expectedValveName = normalizeValveName(nodeState.valveName);
      if (incomingValveName !== expectedValveName) continue;

      // Parse values
      const genericState = hexToInt(valveData.gS.val) as GenericState;
      const specificState = hexToInt(valveData.sS.val) as ValvePosition;
      const recipe = valveData.recipe ? hexToInt(valveData.recipe.val) : 0;
      const timestamp = parseMqttTimestamp(packItem.t);

      // Track previous state for runtime measurement
      const previousState = nodeState.specificState;

      // Handle runtime measurement
      // AST Laufzeit: IsInBasePosition → MovingToWorkPosition (start) → IsInWorkPosition (stop)
      // GST Laufzeit: IsInWorkPosition → MovingToBasePosition (start) → IsInBasePosition (stop)
      if (
        (specificState === ValvePosition.MovingToBasePosition ||
          specificState === ValvePosition.MovingToWorkPosition) &&
        previousState !== specificState
      ) {
        // Movement started - record start timestamp
        nodeState.moveStartTimestamp = timestamp;
        ctx.log.info('Movement started', {
          nodeId,
          previousState,
          previousStateName: ValvePositionNames[previousState],
          specificState,
          specificStateName: ValvePositionNames[specificState],
          startTimestamp: timestamp,
        });
      } else if (
        (specificState === ValvePosition.IsInBasePosition ||
          specificState === ValvePosition.IsInWorkPosition) &&
        nodeState.moveStartTimestamp !== null
      ) {
        // Movement completed - calculate duration
        const duration = timestamp - nodeState.moveStartTimestamp;

        ctx.log.info('Movement completed - calculating duration', {
          nodeId,
          previousState,
          previousStateName: ValvePositionNames[previousState],
          specificState,
          specificStateName: ValvePositionNames[specificState],
          startTimestamp: nodeState.moveStartTimestamp,
          endTimestamp: timestamp,
          durationMs: duration,
        });

        if (previousState === ValvePosition.MovingToWorkPosition) {
          nodeState.lastDurationGstToAst = duration;
          ctx.log.info('GST→AST duration stored', {
            nodeId,
            durationMs: duration,
            durationSec: duration / 1000,
          });
        } else if (previousState === ValvePosition.MovingToBasePosition) {
          nodeState.lastDurationAstToGst = duration;
          ctx.log.info('AST→GST duration stored', {
            nodeId,
            durationMs: duration,
            durationSec: duration / 1000,
          });
        } else {
          ctx.log.warn('Duration calculated but previousState not a moving state', {
            nodeId,
            previousState,
            previousStateName: ValvePositionNames[previousState],
            durationMs: duration,
          });
        }

        nodeState.moveStartTimestamp = null;
      }

      // Update state
      nodeState.previousSpecificState = previousState;
      nodeState.genericState = genericState;
      nodeState.specificState = specificState;
      nodeState.recipe = recipe;
      nodeState.lastUpdate = new Date();

      // Update visuals and position
      updateNodeVisuals(ctx, nodeId, genericState, specificState);
      updateNodePosition(ctx, nodeId, specificState);

      ctx.log.debug('Valve data updated', {
        nodeId,
        valveName: incomingValveName,
        genericState,
        specificState,
        recipe,
      });

      return;
    }
  } catch (error) {
    ctx.log.error('Failed to process valve data', { nodeId, error });
  }
}

/**
 * Handle incoming error messages from MQTT
 */
function handleErrorMessage(ctx: PluginContext, rawPayload: unknown): void {
  try {
    // Parse payload if it's a string
    let payload: ErrorPayload;
    if (typeof rawPayload === 'string') {
      payload = JSON.parse(rawPayload);
    } else {
      payload = rawPayload as ErrorPayload;
    }

    // Extract message text and error number safely (handle different payload formats)
    // Known formats:
    // 1. msg: "string"
    // 2. msg: { txt: "string", val: {...} }
    // 3. msg: { text: "string" }
    // 4. msg: { val: { txt: "string" } }
    // 5. msg: { no: 123, txt: "string" }
    // 6. msg: { errNo: 123, errTxt: "string" }
    // 7. msg: { code: 123, message: "string" }
    let messageText = '';
    let errorNo: number | string | undefined;
    const msgObj = typeof payload.msg === 'object' && payload.msg !== null
      ? payload.msg as Record<string, unknown>
      : null;

    // Extract error number (try multiple field names)
    if (msgObj) {
      errorNo = msgObj.no as number | string | undefined
        ?? msgObj.errNo as number | string | undefined
        ?? msgObj.errorNo as number | string | undefined
        ?? msgObj.code as number | string | undefined
        ?? msgObj.errorCode as number | string | undefined;
    }

    // Extract message text
    if (typeof payload.msg === 'string') {
      messageText = payload.msg;
    } else if (msgObj) {
      // Try direct text fields
      const textFields = ['txt', 'text', 'errTxt', 'errorTxt', 'message', 'msg', 'description'];
      for (const field of textFields) {
        const value = msgObj[field];
        if (typeof value === 'string' && value.trim()) {
          messageText = value;
          break;
        }
      }

      // Try nested val object
      if (!messageText && msgObj.val && typeof msgObj.val === 'object') {
        const val = msgObj.val as Record<string, unknown>;
        for (const field of textFields) {
          const value = val[field];
          if (typeof value === 'string' && value.trim()) {
            messageText = value;
            break;
          }
        }
        // Also extract errorNo from val if not found yet
        if (errorNo === undefined) {
          errorNo = val.no as number | string | undefined
            ?? val.errNo as number | string | undefined
            ?? val.code as number | string | undefined;
        }
      }

      // Ultimate fallback: serialize the entire msg object
      if (!messageText) {
        messageText = JSON.stringify(payload.msg);
      }
    }

    // If still no message, use generic text
    if (!messageText) {
      messageText = errorNo !== undefined ? `Fehler ${errorNo}` : 'Unbekannter Fehler';
    }

    ctx.log.info('Error message received', {
      rawPayload: JSON.stringify(payload).slice(0, 500),
      src: payload.src,
      lvl: payload.lvl,
      extractedMessage: messageText,
      extractedErrorNo: errorNo,
      msgType: typeof payload.msg,
      msgKeys: msgObj ? Object.keys(msgObj) : [],
    });

    const source = normalizeValveName(payload.src || '');
    const allNodes = pluginState.getAllNodes();

    ctx.log.debug('Checking error against nodes', {
      normalizedSource: source,
      nodeCount: allNodes.length,
      nodeNames: allNodes.map((n) => n.valveName),
    });

    allNodes.forEach((nodeState) => {
      const expectedValveName = normalizeValveName(nodeState.valveName);
      ctx.log.debug('Comparing valve names', {
        source,
        expectedValveName,
        match: source === expectedValveName,
      });
      if (source === expectedValveName) {
        // Extract values from payload
        const values = msgObj?.val as Record<string, unknown> | undefined;

        const errorEntry: ErrorEntry = {
          timestamp: payload.utc,
          level: payload.lvl,
          source: payload.src,
          message: messageText,
          errorNo: errorNo,
          values: values,
          rawMsg: payload,  // Store complete payload, not just msg
          acknowledged: false,
        };

        // Add to errors list
        nodeState.errors.unshift(errorEntry);
        if (nodeState.errors.length > 10) {
          nodeState.errors = nodeState.errors.slice(0, 10);
        }

        // Debug: Log what we stored
        ctx.log.info('ErrorEntry created and stored', {
          storedMessage: errorEntry.message,
          storedValues: errorEntry.values,
          errorCount: nodeState.errors.length,
        });

        // Log the error to Viewer Log
        ctx.log.error(`Valve error: ${messageText}`, {
          nodeId: nodeState.nodeId,
          nodeName: nodeState.valveName,
          level: payload.lvl,
          values: values,
          timestamp: new Date(payload.utc).toISOString(),
        });

        // Set node to error state visually
        if (payload.lvl === 'ERR') {
          nodeState.genericState = GenericState.Error;
          updateNodeVisuals(ctx, nodeState.nodeId, GenericState.Error, nodeState.specificState);

          ctx.ui.notify(
            `Valve Error: ${nodeState.valveName} - ${messageText}`,
            'error'
          );
        } else if (payload.lvl === 'WARN') {
          ctx.ui.notify(
            `Valve Warning: ${nodeState.valveName} - ${messageText}`,
            'warning'
          );
        }
      }
    });
  } catch (error) {
    ctx.log.error('Failed to process error message', { error });
  }
}

/**
 * Setup MQTT subscriptions for a node
 */
function setupSubscriptions(ctx: PluginContext, nodeId: string): void {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) return;

  const globalConfig = ctx.config.global.getAll();
  const mainTopic = (globalConfig.mainTopic as string) || 'machine/valves';
  const mqtt = getMqttApi(ctx);

  const availableSources = ctx.mqtt.getSources();
  if (availableSources.length === 0) {
    ctx.log.error('No MQTT sources available', { nodeId });
    ctx.ui.notify('Keine MQTT-Broker konfiguriert', 'error');
    return;
  }

  const errorTopic = (globalConfig.errorTopic as string) || 'machine/errors';

  // SUBSCRIPTION 1: Valve topic
  ctx.log.info('SUB 1: valve topic', { mainTopic });
  const valveUnsub = mqtt.subscribe(mainTopic, (msg: MqttMessage) => {
    ctx.log.info('CALLBACK 1 (valve) fired!', { topic: mainTopic });
    handleValveData(ctx, nodeId, msg.payload);
  });
  nodeState.subscriptions.push(valveUnsub);

  // SUBSCRIPTION 2: Error topic
  ctx.log.info('SUB 2: error topic', { errorTopic });
  const errorUnsub = mqtt.subscribe(errorTopic, (msg: MqttMessage) => {
    ctx.log.info('CALLBACK 2 (error) fired!', { topic: errorTopic, payload: msg.payload });
    handleErrorMessage(ctx, msg.payload);
  });
  nodeState.subscriptions.push(errorUnsub);

  ctx.log.info('Both subscriptions created', { mainTopic, errorTopic });
}

// ============================================================================
// HTTP COMMAND FUNCTIONS
// ============================================================================

/**
 * Send valve command via HTTP API
 *
 * Purpose: Execute valve function call
 */
async function sendValveCommand(
  nodeId: string,
  functionCommand: FunctionCommand
): Promise<boolean> {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);

  if (!nodeState) {
    ctx.log.error('Node state not found for valve command', { nodeId });
    return false;
  }

  const globalConfig = ctx.config.global.getAll();
  const httpBaseUrl =
    (globalConfig.httpBaseUrl as string) || 'http://localhost:3021';
  const url = `${httpBaseUrl}/v1/commands/functioncall`;

  const payload = {
    functionNo: nodeState.functionNo,
    functionCommand,
    functionInvokerCommand: 'Start',
    inputs: [],
  };

  try {
    ctx.log.info('Sending valve command', {
      nodeId,
      valveName: nodeState.valveName,
      functionNo: nodeState.functionNo,
      functionCommand,
      url,
    });

    const response = await ctx.http.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      ctx.log.info('Valve command sent successfully', {
        nodeId,
        functionCommand,
        status: response.status,
      });
      return true;
    } else {
      ctx.log.error('Valve command failed', {
        nodeId,
        status: response.status,
        statusText: response.statusText,
      });
      ctx.ui.notify(`Befehl fehlgeschlagen: ${response.statusText}`, 'error');
      return false;
    }
  } catch (error) {
    ctx.log.error('Valve command error', { nodeId, error });
    ctx.ui.notify('Fehler beim Senden des Befehls', 'error');
    return false;
  }
}

/**
 * Send Move to Base Position (GST) command
 */
export async function sendMoveToBase(nodeId: string): Promise<boolean> {
  const result = await sendValveCommand(nodeId, FunctionCommand.MoveToBasePosition);
  if (result) {
    pluginState.getContext().ui.notify('GST fahren gesendet', 'success');
  }
  return result;
}

/**
 * Send Move to Work Position (AST) command
 */
export async function sendMoveToWork(nodeId: string): Promise<boolean> {
  const result = await sendValveCommand(nodeId, FunctionCommand.MoveToWorkPosition);
  if (result) {
    pluginState.getContext().ui.notify('AST fahren gesendet', 'success');
  }
  return result;
}

/**
 * Send Toggle Position command
 */
export async function sendTogglePosition(nodeId: string): Promise<boolean> {
  const result = await sendValveCommand(nodeId, FunctionCommand.TogglePosition);
  if (result) {
    pluginState.getContext().ui.notify('Position wechseln gesendet', 'success');
  }
  return result;
}

/**
 * Send Pressure Free command
 */
export async function sendPressureFree(nodeId: string): Promise<boolean> {
  const result = await sendValveCommand(nodeId, FunctionCommand.SwitchToPressureFree);
  if (result) {
    pluginState.getContext().ui.notify('Drucklos gesendet', 'success');
  }
  return result;
}

/**
 * Send Mode switch commands
 */
export async function sendModeMonostable(nodeId: string): Promise<boolean> {
  const result = await sendValveCommand(nodeId, FunctionCommand.SwitchToOptionMonostable);
  if (result) {
    pluginState.getContext().ui.notify('Monostabil aktiviert', 'success');
  }
  return result;
}

export async function sendModeBistablePulsed(nodeId: string): Promise<boolean> {
  const result = await sendValveCommand(nodeId, FunctionCommand.SwitchToOptionBistablePulsed);
  if (result) {
    pluginState.getContext().ui.notify('Bistabil Pulsed aktiviert', 'success');
  }
  return result;
}

export async function sendModeBistablePermanent(nodeId: string): Promise<boolean> {
  const result = await sendValveCommand(nodeId, FunctionCommand.SwitchToOptionBistablePermanent);
  if (result) {
    pluginState.getContext().ui.notify('Bistabil Permanent aktiviert', 'success');
  }
  return result;
}

export async function sendModeBistableMiddle(nodeId: string): Promise<boolean> {
  const result = await sendValveCommand(nodeId, FunctionCommand.SwitchToOptionBistableMiddlePositionOpen);
  if (result) {
    pluginState.getContext().ui.notify('Bistabil Mittelstellung aktiviert', 'success');
  }
  return result;
}

// ============================================================================
// EXPORTED FUNCTIONS FOR UI COMPONENTS
// ============================================================================

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
    valveName: nodeState.valveName,
    errorIndex,
    level: error.level,
    message: error.message,
    acknowledgedAt: new Date().toISOString(),
  });

  // Check if all errors are acknowledged
  const hasUnacknowledgedErrors = nodeState.errors.some(e => !e.acknowledged);

  // Reset node visual state if no more unacknowledged errors
  if (!hasUnacknowledgedErrors && nodeState.genericState === GenericState.Error) {
    // Reset to Idle state (the actual state will be updated by next MQTT message)
    nodeState.genericState = GenericState.Idle;
    updateNodeVisuals(ctx, nodeId, GenericState.Idle, nodeState.specificState);

    ctx.log.info('Node error state reset after acknowledgement', {
      nodeId,
      valveName: nodeState.valveName,
    });

    ctx.ui.notify(`${nodeState.valveName}: Fehler quittiert`, 'success');
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

  const unacknowledgedCount = nodeState.errors.filter(e => !e.acknowledged).length;
  if (unacknowledgedCount === 0) {
    return;
  }

  // Mark all as acknowledged
  nodeState.errors.forEach(e => {
    e.acknowledged = true;
  });

  // Log the acknowledgement
  ctx.log.info('All errors acknowledged', {
    nodeId,
    valveName: nodeState.valveName,
    count: unacknowledgedCount,
    acknowledgedAt: new Date().toISOString(),
  });

  // Reset node visual state
  if (nodeState.genericState === GenericState.Error) {
    nodeState.genericState = GenericState.Idle;
    updateNodeVisuals(ctx, nodeId, GenericState.Idle, nodeState.specificState);

    ctx.log.info('Node error state reset after bulk acknowledgement', {
      nodeId,
      valveName: nodeState.valveName,
    });
  }

  ctx.ui.notify(`${nodeState.valveName}: ${unacknowledgedCount} Fehler quittiert`, 'success');
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
    ValveDetailsPopup,
  },

  onLoad(ctx: PluginContext): void {
    pluginState.initialize(ctx);

    ctx.log.info('Valve Plugin loaded', {
      pluginId: ctx.pluginId,
    });

    ctx.events.on('context-menu-action', (data: unknown) => {
      const event = data as { action: string; nodeId: string };
      if (event.action === 'show-valve-details') {
        ctx.ui.showPopup('ValveDetails', {
          title: 'Valve Details',
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
            if (hasUnacknowledged && nodeState.genericState === GenericState.Error) {
              nodeState.genericState = GenericState.Idle;
              updateNodeVisuals(ctx, entry.nodeId, GenericState.Idle, nodeState.specificState);
              ctx.log.info('Node error state reset via Viewer Log acknowledgement', {
                nodeId: entry.nodeId,
                valveName: nodeState.valveName,
              });
            }
          }
        }
      });
    });
  },

  onNodeBound(ctx: PluginContext, node: BoundNode): void {
    const config = ctx.config.instance.getForNode(node.id);
    const valveName = config.valveName as string;
    const functionNo = (config.functionNo as number) || 0;

    if (!valveName) {
      ctx.log.warn(`No valve name configured for node ${node.id}`);
      ctx.ui.notify(`Bitte Ventilname für ${node.name} konfigurieren`, 'warning');
      return;
    }

    ctx.log.info(
      `Node bound: ${node.name} (${node.id}) -> Valve: ${valveName}, FunctionNo: ${functionNo || 'not set'}`
    );

    pluginState.addNode(node.id, valveName, functionNo);
    setupSubscriptions(ctx, node.id);

    if (!functionNo) {
      ctx.ui.notify(`Monitoring: ${valveName} (Befehle deaktiviert - keine Funktionsnummer)`, 'warning');
    } else {
      ctx.ui.notify(`Monitoring: ${valveName}`, 'success');
    }
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
      if (key === 'valveName' || key === 'functionNo') {
        const config = ctx.config.instance.getForNode(nodeId);
        const newValveName = config.valveName as string;
        const newFunctionNo = config.functionNo as number;

        if (newValveName && newFunctionNo) {
          pluginState.removeNode(nodeId);
          pluginState.addNode(nodeId, newValveName, newFunctionNo);
          setupSubscriptions(ctx, nodeId);
          ctx.log.info(
            `Config updated for ${nodeId}: ${newValveName}, FunctionNo: ${newFunctionNo}`
          );
        }
      }
    }

    if (type === 'global' && (key === 'highlightColor' || key === 'errorColor')) {
      pluginState.getAllNodes().forEach((nodeState) => {
        updateNodeVisuals(
          ctx,
          nodeState.nodeId,
          nodeState.genericState,
          nodeState.specificState
        );
      });
    }
  },

  onUnload(ctx: PluginContext): void {
    ctx.log.info('Valve Plugin unloading...');
    pluginState.cleanup();
    ctx.log.info('Valve Plugin unloaded');
  },
};

export default plugin;
