/**
 * Blueprint Sandbox Plugin
 *
 * Vollständiges Beispiel-Plugin, das alle verfügbaren Features der
 * 3DViewer Plugin API demonstriert:
 *
 * - Node-Manipulation (Farbe, Position, Sichtbarkeit)
 * - Event-Handling (Click, Hover, Select)
 * - Daten-Bindings (MQTT, OPC-UA, HTTP)
 * - UI-Komponenten (Panel, Popup, Overlay)
 * - Konfiguration (Global und Per-Instance)
 * - State-Persistenz
 * - Logging
 *
 * @module blueprint-sandbox
 * @version 1.0.0
 */

import type {
  Plugin,
  PluginContext,
  BoundNode,
  NodeEvent,
  Unsubscribe,
  MqttMessage,
  OpcUaValue,
  HttpResponse,
} from '@3dviewer/plugin-sdk';

// Components
import { ControlPanel } from './components/ControlPanel';
import { NodeDetailsPopup } from './components/NodeDetailsPopup';
import { BindingConfigPopup } from './components/BindingConfigPopup';
import { NodeStatusOverlay } from './components/NodeStatusOverlay';
import { DataLabelOverlay } from './components/DataLabelOverlay';
import { NodePropertiesSection } from './components/NodePropertiesSection';

// Types
interface NodeState {
  nodeId: string;
  bindingType: 'none' | 'mqtt' | 'opcua' | 'http';
  lastValue: unknown;
  lastUpdate: Date | null;
  subscriptions: Unsubscribe[];
  overlayHandle?: { id: string };
}

interface ThresholdConfig {
  warning: number;
  critical: number;
}

// ============================================================================
// PLUGIN IMPLEMENTATION
// ============================================================================

/**
 * Plugin state management
 */
class PluginState {
  private nodes: Map<string, NodeState> = new Map();
  private globalSubscriptions: Unsubscribe[] = [];
  private ctx: PluginContext | null = null;

  initialize(ctx: PluginContext): void {
    this.ctx = ctx;
  }

  getContext(): PluginContext {
    if (!this.ctx) throw new Error('Plugin not initialized');
    return this.ctx;
  }

  addNode(nodeId: string): NodeState {
    const state: NodeState = {
      nodeId,
      bindingType: 'none',
      lastValue: null,
      lastUpdate: null,
      subscriptions: [],
    };
    this.nodes.set(nodeId, state);
    return state;
  }

  getNode(nodeId: string): NodeState | undefined {
    return this.nodes.get(nodeId);
  }

  removeNode(nodeId: string): void {
    const state = this.nodes.get(nodeId);
    if (state) {
      // Cleanup subscriptions
      state.subscriptions.forEach((unsub) => unsub());
      this.nodes.delete(nodeId);
    }
  }

  addGlobalSubscription(unsub: Unsubscribe): void {
    this.globalSubscriptions.push(unsub);
  }

  cleanup(): void {
    // Cleanup all node subscriptions
    this.nodes.forEach((state) => {
      state.subscriptions.forEach((unsub) => unsub());
    });
    this.nodes.clear();

    // Cleanup global subscriptions
    this.globalSubscriptions.forEach((unsub) => unsub());
    this.globalSubscriptions = [];
  }
}

const state = new PluginState();

// ============================================================================
// BINDING HANDLERS
// ============================================================================

/**
 * Setup MQTT binding for a node
 */
function setupMqttBinding(ctx: PluginContext, nodeId: string): Unsubscribe {
  const config = ctx.config.instance.getForNode(nodeId);
  const globalConfig = ctx.config.global.getAll();

  const baseTopic = globalConfig.mqttBaseTopic as string || '3dviewer/nodes/';
  const nodeTopic = config.mqttTopic as string || nodeId;
  const fullTopic = `${baseTopic}${nodeTopic}`;

  ctx.log.debug(`Setting up MQTT binding for ${nodeId} on topic ${fullTopic}`);

  return ctx.mqtt.subscribe(fullTopic, (message: MqttMessage) => {
    handleDataUpdate(ctx, nodeId, message.payload, 'mqtt');
  });
}

/**
 * Setup OPC-UA binding for a node
 */
function setupOpcUaBinding(ctx: PluginContext, nodeId: string): Unsubscribe {
  const config = ctx.config.instance.getForNode(nodeId);
  const opcuaNodeId = config.opcuaNodeId as string;

  if (!opcuaNodeId) {
    ctx.log.warn(`No OPC-UA Node ID configured for ${nodeId}`);
    return () => {};
  }

  ctx.log.debug(`Setting up OPC-UA binding for ${nodeId} on node ${opcuaNodeId}`);

  return ctx.opcua.subscribe(opcuaNodeId, (value: OpcUaValue) => {
    handleDataUpdate(ctx, nodeId, value.value, 'opcua');
  });
}

/**
 * Setup HTTP polling for a node
 */
function setupHttpBinding(ctx: PluginContext, nodeId: string): Unsubscribe {
  const config = ctx.config.instance.getForNode(nodeId);
  const globalConfig = ctx.config.global.getAll();

  const baseUrl = globalConfig.httpBaseUrl as string || 'http://localhost:8080/api';
  const endpoint = config.httpEndpoint as string || nodeId;
  const fullUrl = `${baseUrl}/${endpoint}`;
  const interval = globalConfig.refreshInterval as number || 1000;

  ctx.log.debug(`Setting up HTTP binding for ${nodeId} on ${fullUrl} every ${interval}ms`);

  return ctx.http.poll(fullUrl, interval, (response: HttpResponse) => {
    if (response.status === 200) {
      handleDataUpdate(ctx, nodeId, response.data, 'http');
    } else {
      ctx.log.warn(`HTTP polling failed for ${nodeId}: ${response.statusText}`);
    }
  });
}

/**
 * Handle data updates from any binding source
 */
function handleDataUpdate(
  ctx: PluginContext,
  nodeId: string,
  data: unknown,
  source: 'mqtt' | 'opcua' | 'http'
): void {
  const nodeState = state.getNode(nodeId);
  if (!nodeState) return;

  nodeState.lastValue = data;
  nodeState.lastUpdate = new Date();

  const config = ctx.config.instance.getForNode(nodeId);
  const globalConfig = ctx.config.global.getAll();

  // Get the node proxy
  const node = ctx.nodes.get(nodeId);
  if (!node) return;

  // Extract value using configured path
  const valuePath = config.valueProperty as string || 'value';
  const value = getNestedValue(data, valuePath);

  // Apply threshold-based coloring
  if (typeof value === 'number') {
    const thresholds = config.thresholds as ThresholdConfig || { warning: 70, critical: 90 };

    if (value >= thresholds.critical) {
      node.color = '#ff0000'; // Red
      node.emissive = '#ff0000';
      node.emissiveIntensity = 0.5;
    } else if (value >= thresholds.warning) {
      node.color = '#ffaa00'; // Orange
      node.emissive = '#ffaa00';
      node.emissiveIntensity = 0.3;
    } else {
      node.color = globalConfig.defaultColor as string || '#00ff00'; // Green
      node.emissive = '#000000';
      node.emissiveIntensity = 0;
    }
  }

  // Extract color from data if configured
  const colorPath = config.colorProperty as string;
  if (colorPath) {
    const colorValue = getNestedValue(data, colorPath);
    if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
      node.color = colorValue;
    }
  }

  // Update overlay if shown
  if (config.showOverlay && nodeState.overlayHandle) {
    ctx.ui.updateOverlay(nodeState.overlayHandle, {
      data: { value, source, timestamp: nodeState.lastUpdate },
    });
  }

  // Emit custom event
  ctx.events.emit('data-update', { nodeId, value, source });

  ctx.log.debug(`Data update for ${nodeId} from ${source}:`, value);
}

/**
 * Helper to get nested value from object using dot notation
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;

  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Setup binding based on instance configuration
 */
function setupNodeBinding(ctx: PluginContext, nodeId: string): void {
  const nodeState = state.getNode(nodeId);
  if (!nodeState) return;

  // Cleanup existing subscriptions
  nodeState.subscriptions.forEach((unsub) => unsub());
  nodeState.subscriptions = [];

  const config = ctx.config.instance.getForNode(nodeId);
  const bindingType = config.bindingType as string || 'none';

  nodeState.bindingType = bindingType as NodeState['bindingType'];

  switch (bindingType) {
    case 'mqtt':
      nodeState.subscriptions.push(setupMqttBinding(ctx, nodeId));
      break;
    case 'opcua':
      nodeState.subscriptions.push(setupOpcUaBinding(ctx, nodeId));
      break;
    case 'http':
      nodeState.subscriptions.push(setupHttpBinding(ctx, nodeId));
      break;
    default:
      ctx.log.debug(`No binding configured for ${nodeId}`);
  }

  // Setup overlay if enabled
  if (config.showOverlay) {
    nodeState.overlayHandle = ctx.ui.showOverlay('NodeStatus', {
      nodeId,
      data: { value: null, bindingType },
    });
  }
}

// ============================================================================
// PLUGIN DEFINITION
// ============================================================================

const plugin: Plugin = {
  /**
   * React components provided by this plugin
   */
  components: {
    ControlPanel,
    NodeDetailsPopup,
    BindingConfigPopup,
    NodeStatusOverlay,
    DataLabelOverlay,
    NodePropertiesSection,
  },

  /**
   * Called when the plugin is loaded
   */
  onLoad(ctx: PluginContext): void {
    state.initialize(ctx);

    ctx.log.info('Blueprint Sandbox Plugin loaded', {
      version: ctx.version,
      pluginId: ctx.pluginId,
    });

    // Load persisted state
    const persistedNodes = ctx.state.get<string[]>('boundNodes', []);
    ctx.log.debug('Restored bound nodes:', persistedNodes);

    // Subscribe to global events
    state.addGlobalSubscription(
      ctx.events.onNodeClick((event: NodeEvent) => {
        ctx.log.debug('Node clicked:', event.nodeId);

        // Show popup on double-click (detected via custom event)
        // Single click just logs
      })
    );

    state.addGlobalSubscription(
      ctx.events.onNodeHover((event: NodeEvent) => {
        // Could show tooltip or highlight
        ctx.log.debug('Node hover:', event.nodeId);
      })
    );

    // Subscribe to custom events from other plugins
    state.addGlobalSubscription(
      ctx.events.on('external-data', (data: unknown) => {
        ctx.log.info('Received external data:', data);
      })
    );

    // Watch for global config changes
    state.addGlobalSubscription(
      ctx.config.global.onChange('refreshInterval', (newVal, oldVal) => {
        ctx.log.info(`Refresh interval changed: ${oldVal} -> ${newVal}`);
        // Could restart all HTTP pollers here
      })
    );

    // Register activation/deactivation handlers
    ctx.events.onActivate(() => {
      ctx.log.info('Plugin activated');
      ctx.ui.notify('Blueprint Plugin aktiviert', 'success');
    });

    ctx.events.onDeactivate(() => {
      ctx.log.info('Plugin deactivated');
    });
  },

  /**
   * Called when a node is bound to this plugin
   */
  onNodeBound(ctx: PluginContext, node: BoundNode): void {
    ctx.log.info(`Node bound: ${node.name} (${node.id})`);

    // Create state for this node
    state.addNode(node.id);

    // Setup binding based on configuration
    setupNodeBinding(ctx, node.id);

    // Persist bound nodes
    const boundNodes = ctx.state.get<string[]>('boundNodes', []);
    if (!boundNodes.includes(node.id)) {
      boundNodes.push(node.id);
      ctx.state.set('boundNodes', boundNodes);
    }

    // Initial visual feedback
    const nodeProxy = ctx.nodes.get(node.id);
    if (nodeProxy) {
      const config = ctx.config.global.getAll();
      nodeProxy.color = config.defaultColor as string || '#00ff00';

      if (config.enableAnimations) {
        nodeProxy.duration = 500;
      }
    }

    ctx.ui.notify(`${node.name} wurde an Blueprint gebunden`, 'info');
  },

  /**
   * Called when a node is unbound from this plugin
   */
  onNodeUnbound(ctx: PluginContext, node: BoundNode): void {
    ctx.log.info(`Node unbound: ${node.name} (${node.id})`);

    // Cleanup state
    const nodeState = state.getNode(node.id);
    if (nodeState?.overlayHandle) {
      ctx.ui.hideOverlay(nodeState.overlayHandle);
    }
    state.removeNode(node.id);

    // Update persisted state
    const boundNodes = ctx.state.get<string[]>('boundNodes', []);
    const filtered = boundNodes.filter((id) => id !== node.id);
    ctx.state.set('boundNodes', filtered);

    // Reset node appearance
    const nodeProxy = ctx.nodes.get(node.id);
    if (nodeProxy) {
      nodeProxy.color = '#ffffff';
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
    ctx.log.debug(`Config changed: ${type}.${key}`, nodeId ? `for ${nodeId}` : '');

    if (type === 'instance' && nodeId) {
      // Reconfigure node binding
      if (key === 'bindingType' || key.startsWith('mqtt') || key.startsWith('opcua') || key.startsWith('http')) {
        setupNodeBinding(ctx, nodeId);
      }

      // Toggle overlay
      if (key === 'showOverlay') {
        const config = ctx.config.instance.getForNode(nodeId);
        const nodeState = state.getNode(nodeId);

        if (nodeState) {
          if (config.showOverlay && !nodeState.overlayHandle) {
            nodeState.overlayHandle = ctx.ui.showOverlay('NodeStatus', {
              nodeId,
              data: { value: nodeState.lastValue },
            });
          } else if (!config.showOverlay && nodeState.overlayHandle) {
            ctx.ui.hideOverlay(nodeState.overlayHandle);
            nodeState.overlayHandle = undefined;
          }
        }
      }
    }

    if (type === 'global') {
      // Apply global changes to all nodes
      if (key === 'defaultColor') {
        ctx.nodes.getAll().forEach((node) => {
          const nodeState = state.getNode(node.id);
          if (nodeState && !nodeState.lastValue) {
            node.color = ctx.config.global.get<string>('defaultColor', '#00ff00');
          }
        });
      }
    }
  },

  /**
   * Called when the plugin is unloaded
   */
  onUnload(ctx: PluginContext): void {
    ctx.log.info('Blueprint Sandbox Plugin unloading...');

    // Cleanup all state and subscriptions
    state.cleanup();

    ctx.log.info('Blueprint Sandbox Plugin unloaded');
  },
};

export default plugin;
