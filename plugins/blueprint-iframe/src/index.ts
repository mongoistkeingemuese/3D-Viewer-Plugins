/**
 * Blueprint IFrame Plugin
 *
 * Beispiel für ein isoliertes Plugin, das in einem IFrame läuft.
 *
 * WICHTIGE UNTERSCHIEDE ZU SANDBOX-PLUGINS:
 * 1. Alle API-Aufrufe sind asynchron (Promise-basiert)
 * 2. Keine direkten React-Komponenten (werden separat gebundelt)
 * 3. Kommunikation über postMessage
 * 4. Vollständige Isolation vom Host
 * 5. Serialisierbare Daten erforderlich
 *
 * @module blueprint-iframe
 * @version 1.0.0
 */

import type {
  Plugin,
  PluginContext,
  BoundNode,
  Unsubscribe,
} from '@3dviewer/plugin-sdk';

// Components (werden für IFrame separat registriert)
import { IFramePanel } from './components/IFramePanel';
import { SettingsPopup } from './components/SettingsPopup';
import { StatusBadgeOverlay } from './components/StatusBadgeOverlay';

// ============================================================================
// IFRAME PLUGIN STATE
// ============================================================================

interface NodeData {
  nodeId: string;
  value: unknown;
  lastUpdate: Date | null;
  subscription?: Unsubscribe;
}

class IFramePluginState {
  private nodes: Map<string, NodeData> = new Map();
  private subscriptions: Unsubscribe[] = [];
  private ctx: PluginContext | null = null;

  initialize(ctx: PluginContext): void {
    this.ctx = ctx;
  }

  getContext(): PluginContext {
    if (!this.ctx) throw new Error('Not initialized');
    return this.ctx;
  }

  addNode(nodeId: string): NodeData {
    const data: NodeData = {
      nodeId,
      value: null,
      lastUpdate: null,
    };
    this.nodes.set(nodeId, data);
    return data;
  }

  getNode(nodeId: string): NodeData | undefined {
    return this.nodes.get(nodeId);
  }

  removeNode(nodeId: string): void {
    const data = this.nodes.get(nodeId);
    if (data?.subscription) {
      data.subscription();
    }
    this.nodes.delete(nodeId);
  }

  addSubscription(unsub: Unsubscribe): void {
    this.subscriptions.push(unsub);
  }

  cleanup(): void {
    this.nodes.forEach((data) => {
      if (data.subscription) data.subscription();
    });
    this.nodes.clear();
    this.subscriptions.forEach((unsub) => unsub());
    this.subscriptions = [];
  }
}

const state = new IFramePluginState();

// ============================================================================
// DATA FETCHING (ASYNC)
// ============================================================================

/**
 * Fetch data via HTTP (all calls are async in iframe context)
 */
async function fetchNodeData(ctx: PluginContext, nodeId: string): Promise<void> {
  const config = ctx.config.instance.getForNode(nodeId);
  const globalConfig = ctx.config.global.getAll();

  const dataSource = config.dataSource as string || 'manual';
  if (dataSource === 'manual') return;

  const endpoint = config.endpoint as string;
  if (!endpoint) return;

  const nodeData = state.getNode(nodeId);
  if (!nodeData) return;

  try {
    if (dataSource === 'http') {
      const baseUrl = globalConfig.apiUrl as string || 'http://localhost:8080/api';
      const response = await ctx.http.get(`${baseUrl}/${endpoint}`);

      if (response.status === 200) {
        nodeData.value = response.data;
        nodeData.lastUpdate = new Date();
        await updateNodeVisuals(ctx, nodeId, response.data);
      }
    }
  } catch (error) {
    ctx.log.error(`Failed to fetch data for ${nodeId}:`, error);
  }
}

/**
 * Update node visuals based on data
 */
async function updateNodeVisuals(
  ctx: PluginContext,
  nodeId: string,
  data: unknown
): Promise<void> {
  const node = ctx.nodes.get(nodeId);
  if (!node) return;

  // Extract numeric value
  let numericValue: number | null = null;
  if (typeof data === 'number') {
    numericValue = data;
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.value === 'number') {
      numericValue = obj.value;
    }
  }

  // Apply color based on value
  if (numericValue !== null) {
    if (numericValue >= 90) {
      node.color = '#ff4444';
      node.emissive = '#ff4444';
      node.emissiveIntensity = 0.5;
    } else if (numericValue >= 70) {
      node.color = '#ffaa00';
      node.emissive = '#ffaa00';
      node.emissiveIntensity = 0.3;
    } else {
      node.color = '#00ff88';
      node.emissive = '#000000';
      node.emissiveIntensity = 0;
    }
  }
}

/**
 * Setup data subscription for a node
 */
function setupDataSubscription(ctx: PluginContext, nodeId: string): void {
  const config = ctx.config.instance.getForNode(nodeId);
  const globalConfig = ctx.config.global.getAll();

  const dataSource = config.dataSource as string || 'manual';
  const endpoint = config.endpoint as string;

  if (dataSource === 'manual' || !endpoint) return;

  const nodeData = state.getNode(nodeId);
  if (!nodeData) return;

  // Cleanup existing subscription
  if (nodeData.subscription) {
    nodeData.subscription();
    nodeData.subscription = undefined;
  }

  if (dataSource === 'mqtt') {
    nodeData.subscription = ctx.mqtt.subscribe(endpoint, (message) => {
      nodeData.value = message.payload;
      nodeData.lastUpdate = new Date();
      updateNodeVisuals(ctx, nodeId, message.payload);
    });
  } else if (dataSource === 'http') {
    const interval = globalConfig.pollingInterval as number || 2000;

    nodeData.subscription = ctx.http.poll(
      `${globalConfig.apiUrl}/${endpoint}`,
      interval,
      (response) => {
        if (response.status === 200) {
          nodeData.value = response.data;
          nodeData.lastUpdate = new Date();
          updateNodeVisuals(ctx, nodeId, response.data);
        }
      }
    );
  }
}

// ============================================================================
// PLUGIN DEFINITION
// ============================================================================

const plugin: Plugin = {
  /**
   * Components für IFrame werden anders registriert,
   * aber wir exportieren sie trotzdem für Typsicherheit
   */
  components: {
    IFramePanel,
    SettingsPopup,
    StatusBadgeOverlay,
  },

  /**
   * Plugin initialization
   * NOTE: In iframe context, many API calls are async!
   */
  async onLoad(ctx: PluginContext): Promise<void> {
    state.initialize(ctx);

    ctx.log.info('Blueprint IFrame Plugin loaded', {
      version: ctx.version,
      sandbox: 'iframe',
    });

    // In IFrame context, we need to be careful about what we can access
    // All external data must go through the API

    // Subscribe to node clicks (async in iframe context)
    const unsubClick = await ctx.events.onNodeClick((event: { nodeId: string }) => {
      ctx.log.debug('Click in IFrame plugin:', event.nodeId);

      // Show popup on click
      const nodeData = state.getNode(event.nodeId);
      if (nodeData) {
        ctx.ui.showPopup('Settings', {
          title: 'Node Settings',
          data: {
            nodeId: event.nodeId,
            value: nodeData.value,
          },
        });
      }
    });
    state.addSubscription(unsubClick);

    // Load persisted state (async in iframe context)
    const savedNodes = await ctx.state.get<string[]>('nodes', []);
    ctx.log.debug('Restored nodes:', savedNodes);
  },

  /**
   * Node bound to plugin
   * NOTE: In iframe context, this is async!
   */
  async onNodeBound(ctx: PluginContext, node: BoundNode): Promise<void> {
    ctx.log.info(`IFrame Plugin: Node bound - ${node.name}`);

    // Add to state
    state.addNode(node.id);

    // Setup data subscription
    setupDataSubscription(ctx, node.id);

    // Initial fetch
    fetchNodeData(ctx, node.id);

    // Visual feedback
    const nodeProxy = await ctx.nodes.get(node.id);
    if (nodeProxy) {
      nodeProxy.color = '#00d4ff';
      nodeProxy.duration = 300;
    }

    // Show overlay based on config
    const config = await ctx.config.instance.getForNode(node.id);
    if (config.displayMode !== 'none') {
      ctx.ui.showOverlay('StatusBadge', {
        nodeId: node.id,
        data: { value: null, mode: config.displayMode },
      });
    }

    // Persist (async in iframe context)
    const nodes = await ctx.state.get<string[]>('nodes', []);
    if (!nodes.includes(node.id)) {
      nodes.push(node.id);
      await ctx.state.set('nodes', nodes);
    }
  },

  /**
   * Node unbound from plugin
   * NOTE: In iframe context, this is async!
   */
  async onNodeUnbound(ctx: PluginContext, node: BoundNode): Promise<void> {
    ctx.log.info(`IFrame Plugin: Node unbound - ${node.name}`);

    // Cleanup
    state.removeNode(node.id);

    // Reset visuals
    const nodeProxy = await ctx.nodes.get(node.id);
    if (nodeProxy) {
      nodeProxy.color = '#ffffff';
      nodeProxy.emissive = '#000000';
      nodeProxy.emissiveIntensity = 0;
    }

    // Update persisted state (async in iframe context)
    const nodes = await ctx.state.get<string[]>('nodes', []);
    const filtered = nodes.filter((id: string) => id !== node.id);
    await ctx.state.set('nodes', filtered);
  },

  /**
   * Config changed
   */
  onConfigChange(
    ctx: PluginContext,
    type: 'global' | 'instance',
    key: string,
    nodeId?: string
  ): void {
    ctx.log.debug(`IFrame Config change: ${type}.${key}`, nodeId);

    if (type === 'instance' && nodeId) {
      // Re-setup subscription on data source change
      if (key === 'dataSource' || key === 'endpoint') {
        setupDataSubscription(ctx, nodeId);
        fetchNodeData(ctx, nodeId);
      }
    }

    if (type === 'global' && key === 'pollingInterval') {
      // Would need to restart all HTTP pollers
      ctx.log.info('Polling interval changed, restart required');
    }
  },

  /**
   * Plugin unload
   */
  onUnload(ctx: PluginContext): void {
    ctx.log.info('Blueprint IFrame Plugin unloading...');
    state.cleanup();
    ctx.log.info('Blueprint IFrame Plugin unloaded');
  },
};

export default plugin;
