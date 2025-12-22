/**
 * Axis Release 10 Plugin
 *
 * Features:
 * - Displays axis status via node emissive color (glowing)
 * - Shows detailed axis information in popup (position, velocity, errors)
 * - Animates node position based on ActualPositionInWorldCoordinates
 * - Subscribes to MQTT axis and error topics
 * - Filters payloads by configured axis name
 * - Maintains error log with acknowledgement functionality
 *
 * Purpose: Monitor and visualize industrial axis status in real-time
 * Usage: Bind to 3D objects representing physical axes
 * Rationale: Provides comprehensive axis monitoring with visual feedback
 *
 * @module axis-release-10
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
 * MotionState enum values and their corresponding visual states
 *
 * Purpose: Define motion states for axis visualization
 * Rationale: Maps industrial axis states to visual feedback
 */
enum MotionState {
  ErrorStop = 0,           // Emissive error color
  Standstill = 1,          // No glow
  Homing = 2,              // Emissive homing color
  Stopping = 3,            // No glow
  Disabled = 4,            // No glow
  DiscreteMotion = 5,      // Emissive motion color
  ContinuousMotion = 6,    // Emissive motion color
  SynchronizedMotion = 7,  // Emissive motion color
}

/**
 * Structure of axis data in MQTT payload
 *
 * Purpose: Type definition for incoming axis data
 */
interface AxisData {
  id: string;
  name: string;
  sS: { typ: string; val: string };      // MotionState (hex string)
  posS0: { typ: string; val: string };   // World position (hex float)
  pos: { typ: string; val: string };     // Actual position (hex float)
  vel: { typ: string; val: string };     // Velocity (hex float)
}

/**
 * Structure of MQTT axis payload
 */
interface AxisPayload {
  pack: Array<{
    t: string;
    Axis: AxisData;
  }>;
}

/**
 * Structure of error message payload
 *
 * Purpose: Type definition for error messages
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
 * Rationale: Maintains subscriptions, current values, and error history per node
 */
interface NodeState {
  nodeId: string;
  axisName: string;
  subscriptions: Unsubscribe[];
  currentState: MotionState;
  position: number;
  velocity: number;
  worldPosition: number;
  errors: ErrorEntry[];
  lastUpdate: Date | null;
}

/**
 * Normalize axis name by trimming whitespace
 *
 * Purpose: Handle axis names with trailing spaces from PLC
 * Rationale: PLC payload contains padded axis names
 */
function normalizeAxisName(name: string): string {
  return name.trim();
}

/**
 * Plugin state manager
 *
 * Purpose: Centralized state management for all nodes
 * Usage: Single instance shared across plugin lifecycle
 * Rationale: Ensures proper cleanup and state tracking
 */
class PluginState {
  private nodes: Map<string, NodeState> = new Map();
  private ctx: PluginContext | null = null;
  private errorSubscription: Unsubscribe | null = null;
  private mqttSources: string[] = [];

  initialize(ctx: PluginContext): void {
    this.ctx = ctx;
    // Fetch available MQTT sources
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

  addNode(nodeId: string, axisName: string): NodeState {
    const state: NodeState = {
      nodeId,
      axisName,
      subscriptions: [],
      currentState: MotionState.Disabled,
      position: 0,
      velocity: 0,
      worldPosition: 0,
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
 * Convert IEEE 754 hex string to float
 *
 * Purpose: Parse hex-encoded floating point values from MQTT payload
 * Usage: hexToFloat("41200000") => 10.0
 * Rationale: MQTT payload uses hex encoding for efficiency
 */
function hexToFloat(hexString: string): number {
  if (!hexString || hexString.length !== 8) {
    return 0;
  }

  try {
    // Convert hex string to 32-bit integer
    const int32 = parseInt(hexString, 16);

    // Create ArrayBuffer and views
    const buffer = new ArrayBuffer(4);
    const intView = new Uint32Array(buffer);
    const floatView = new Float32Array(buffer);

    // Set integer value and read as float
    intView[0] = int32;
    return floatView[0];
  } catch (error) {
    return 0;
  }
}

/**
 * Parse hex-encoded integer (MotionState)
 *
 * Purpose: Extract integer value from hex string
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
 * Update node visual state based on MotionState
 *
 * Purpose: Apply color and emissive properties to 3D node
 * Usage: Called when axis state changes
 * Rationale: Provides immediate visual feedback of axis status
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

  // Reset to no glow by default
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

    case MotionState.Standstill:
    case MotionState.Stopping:
    case MotionState.Disabled:
    default:
      // No glow (already set above)
      break;
  }
}

/**
 * Update node position based on world coordinates
 *
 * Purpose: Animate node position in 3D space
 * Usage: Called when axis position changes
 * Rationale: Visualizes physical axis movement in real-time
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

  // Apply to the configured axis
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

  node.duration = 100; // Smooth animation
}

/**
 * Handle incoming axis data from MQTT
 *
 * Purpose: Process axis updates and update node state
 * Usage: Called on every MQTT message on axis topic
 * Rationale: Central point for axis data processing
 */
function handleAxisData(
  ctx: PluginContext,
  nodeId: string,
  rawPayload: unknown
): void {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) return;

  try {
    // Parse payload if it's a string
    let payload: AxisPayload;
    if (typeof rawPayload === 'string') {
      payload = JSON.parse(rawPayload) as AxisPayload;
    } else {
      payload = rawPayload as AxisPayload;
    }

    // Debug: log raw payload structure (INFO level to ensure visibility)
    ctx.log.info('MQTT payload received', {
      nodeId,
      axisName: nodeState.axisName,
      payloadType: typeof rawPayload,
      hasPack: !!payload.pack,
      packLength: payload.pack?.length ?? 0,
    });

    // Extract axis data from payload
    if (!payload.pack || payload.pack.length === 0) {
      ctx.log.warn('Empty or missing pack array in payload');
      return;
    }

    // Iterate through all pack items to find matching axis
    for (const packItem of payload.pack) {
      const axisData = packItem.Axis;
      if (!axisData) {
        ctx.log.debug('Pack item has no Axis property', { packItem: JSON.stringify(packItem).slice(0, 200) });
        continue;
      }

      const incomingAxisName = normalizeAxisName(axisData.name);

      // Filter by axis name (normalize to handle trailing spaces from PLC)
      if (incomingAxisName !== nodeState.axisName) {
        ctx.log.debug('Axis name mismatch', {
          incoming: incomingAxisName,
          expected: nodeState.axisName
        });
        continue; // Not our axis
      }

      // Parse values
      const motionState = hexToInt(axisData.sS.val) as MotionState;
      const worldPosition = hexToFloat(axisData.posS0.val);
      const position = hexToFloat(axisData.pos.val);
      const velocity = hexToFloat(axisData.vel.val);

      // Update state
      nodeState.currentState = motionState;
      nodeState.position = position;
      nodeState.velocity = velocity;
      nodeState.worldPosition = worldPosition;
      nodeState.lastUpdate = new Date();

      // Update visuals
      updateNodeVisuals(ctx, nodeId, motionState);
      updateNodePosition(ctx, nodeId, worldPosition);

      ctx.log.debug('Axis data updated', {
        nodeId,
        axisName: normalizeAxisName(axisData.name),
        motionState,
        position,
        velocity,
        worldPosition,
      });

      // Found and processed our axis, no need to continue
      break;
    }
  } catch (error) {
    ctx.log.error('Failed to process axis data', { nodeId, error });
  }
}

/**
 * Handle incoming error messages from MQTT
 *
 * Purpose: Process and store error messages
 * Usage: Called on every MQTT message on error topic
 * Rationale: Maintains error log with filtering by axis name
 */
function handleErrorMessage(
  ctx: PluginContext,
  payload: ErrorPayload
): void {
  try {
    // Check if error is relevant to any of our axes
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

        // Add to error list (keep last 5)
        nodeState.errors.unshift(errorEntry);
        if (nodeState.errors.length > 5) {
          nodeState.errors = nodeState.errors.slice(0, 5);
        }

        ctx.log.warn('Axis error received', {
          nodeId: nodeState.nodeId,
          axisName: nodeState.axisName,
          error: errorEntry,
        });

        // Show notification for critical errors
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
 *
 * Purpose: Use configured MQTT broker or default
 * Rationale: Allows multi-broker setups
 */
function getMqttApi(ctx: PluginContext): typeof ctx.mqtt {
  const globalConfig = ctx.config.global.getAll();
  const mqttSource = globalConfig.mqttSource as string;

  if (mqttSource) {
    // Validate source exists
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
 *
 * Purpose: Subscribe to axis and error topics
 * Usage: Called when node is bound
 * Rationale: Establishes data flow from MQTT to node state
 */
function setupSubscriptions(ctx: PluginContext, nodeId: string): void {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) return;

  const globalConfig = ctx.config.global.getAll();
  const mainTopic = globalConfig.mainTopic as string || 'machine/axes';
  const configuredSource = globalConfig.mqttSource as string || '';
  const mqtt = getMqttApi(ctx);

  // Validate MQTT sources are available
  const availableSources = ctx.mqtt.getSources();
  if (availableSources.length === 0) {
    ctx.log.error('No MQTT sources available - cannot subscribe to axis data', {
      nodeId,
      axisName: nodeState.axisName,
    });
    ctx.ui.notify('Keine MQTT-Broker konfiguriert. Bitte zuerst einen MQTT-Broker hinzufügen.', 'error');
    return;
  }

  ctx.log.debug('MQTT sources check', {
    configured: configuredSource || '(using default)',
    available: availableSources,
  });

  // Subscribe to axis data (per-node subscription)
  const axisUnsub = mqtt.subscribe(mainTopic, (msg: MqttMessage) => {
    logRawMqttMessage(ctx, mainTopic, msg);
    handleAxisData(ctx, nodeId, msg.payload);
  });
  nodeState.subscriptions.push(axisUnsub);

  ctx.log.info('Axis subscription setup - waiting for MQTT messages', {
    nodeId,
    axisName: nodeState.axisName,
    mainTopic,
    mqttSource: configuredSource || '(default)',
  });
}

/**
 * DEBUG: Log every raw MQTT message for troubleshooting
 */
function logRawMqttMessage(ctx: PluginContext, topic: string, msg: MqttMessage): void {
  ctx.log.info('RAW MQTT message received', {
    topic,
    payloadType: typeof msg.payload,
    payloadPreview: typeof msg.payload === 'string'
      ? msg.payload.slice(0, 200)
      : JSON.stringify(msg.payload).slice(0, 200),
  });
}

/**
 * Setup shared error subscription (called once in onLoad)
 *
 * Purpose: Subscribe to error topic once for all nodes
 * Rationale: Avoids duplicate subscriptions when multiple nodes are bound
 */
function setupErrorSubscription(ctx: PluginContext): void {
  const globalConfig = ctx.config.global.getAll();
  const errorTopic = globalConfig.errorTopic as string || 'machine/errors';
  const configuredSource = globalConfig.mqttSource as string || '';
  const mqtt = getMqttApi(ctx);

  // Validate MQTT sources are available
  const availableSources = ctx.mqtt.getSources();
  if (availableSources.length === 0) {
    ctx.log.warn('No MQTT sources available - cannot subscribe to error messages');
    return;
  }

  const errorUnsub = mqtt.subscribe(errorTopic, (msg: MqttMessage) => {
    handleErrorMessage(ctx, msg.payload as ErrorPayload);
  });
  pluginState.setErrorSubscription(errorUnsub);

  ctx.log.info('Error subscription setup', { errorTopic, mqttSource: configuredSource || '(default)' });
}

/**
 * Acknowledge an error
 *
 * Purpose: Mark error as acknowledged
 * Usage: Called from UI when user acknowledges error
 * Rationale: Allows users to track which errors have been addressed
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
 *
 * Purpose: Expose node state to React components
 * Usage: Called from AxisDetailsPopup
 * Rationale: Provides read-only access to internal state
 */
export function getNodeState(nodeId: string): NodeState | undefined {
  return pluginState.getNode(nodeId);
}

/**
 * Get available MQTT sources for UI components
 *
 * Purpose: Expose available MQTT brokers for configuration UI
 * Usage: Called from settings components to populate dropdowns
 * Rationale: Enables dynamic broker selection in UI
 */
export function getMqttSources(): string[] {
  return pluginState.getMqttSources();
}

/**
 * Get current MQTT source configuration
 *
 * Purpose: Get currently configured MQTT broker
 * Usage: Called from settings components
 */
export function getCurrentMqttSource(): string {
  const ctx = pluginState.getContext();
  const globalConfig = ctx.config.global.getAll();
  return (globalConfig.mqttSource as string) || '';
}

// ============================================================================
// PLUGIN DEFINITION
// ============================================================================

const plugin: Plugin = {
  /**
   * React components provided by this plugin
   */
  components: {
    AxisDetailsPopup,
  },

  /**
   * Called when the plugin is loaded
   */
  onLoad(ctx: PluginContext): void {
    pluginState.initialize(ctx);

    ctx.log.info('Axis Release 10 Plugin loaded', {
      pluginId: ctx.pluginId,
    });

    // Setup shared error subscription (once for all nodes)
    setupErrorSubscription(ctx);

    // Setup context menu handler
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

  /**
   * Called when a node is bound to this plugin
   */
  onNodeBound(ctx: PluginContext, node: BoundNode): void {
    const config = ctx.config.instance.getForNode(node.id);
    const axisName = config.axisName as string;

    if (!axisName) {
      ctx.log.warn(`No axis name configured for node ${node.id}`);
      ctx.ui.notify(`Please configure axis name for ${node.name}`, 'warning');
      return;
    }

    ctx.log.info(`Node bound: ${node.name} (${node.id}) -> Axis: ${axisName}`);

    // Create state and setup subscriptions
    pluginState.addNode(node.id, axisName);
    setupSubscriptions(ctx, node.id);

    ctx.ui.notify(`Monitoring axis: ${axisName}`, 'success');
  },

  /**
   * Called when a node is unbound from this plugin
   */
  onNodeUnbound(ctx: PluginContext, node: BoundNode): void {
    ctx.log.info(`Node unbound: ${node.name} (${node.id})`);

    // Cleanup state and subscriptions
    pluginState.removeNode(node.id);

    // Reset node appearance
    const nodeProxy = ctx.nodes.get(node.id);
    if (nodeProxy) {
      nodeProxy.emissive = '#000000';
      nodeProxy.emissiveIntensity = 0;
    }
  },

  /**
   * Called when configuration changes
   */
  onConfigChange(
    ctx: PluginContext,
    type: 'global' | 'instance',
    key: string,
    nodeId?: string
  ): void {
    ctx.log.debug(`Config changed: ${type}.${key}`, nodeId || '');

    // If instance config changes, re-setup subscriptions
    if (type === 'instance' && nodeId) {
      if (key === 'axisName') {
        // Re-create node state with new axis name
        const config = ctx.config.instance.getForNode(nodeId);
        const newAxisName = config.axisName as string;

        if (newAxisName) {
          pluginState.removeNode(nodeId);
          pluginState.addNode(nodeId, newAxisName);
          setupSubscriptions(ctx, nodeId);
          ctx.log.info(`Axis name changed for ${nodeId}: ${newAxisName}`);
        }
      }
    }

    // If global config changes, update all node visuals
    if (type === 'global' && (key === 'errorColor' || key === 'homingColor' || key === 'motionColor')) {
      pluginState.getAllNodes().forEach((nodeState) => {
        updateNodeVisuals(ctx, nodeState.nodeId, nodeState.currentState);
      });
    }
  },

  /**
   * Called when the plugin is unloaded
   */
  onUnload(ctx: PluginContext): void {
    ctx.log.info('Axis Release 10 Plugin unloading...');
    pluginState.cleanup();
    ctx.log.info('Axis Release 10 Plugin unloaded');
  },
};

export default plugin;
