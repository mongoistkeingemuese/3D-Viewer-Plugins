# Source Selection Patterns

Reference implementation: `plugins/axis` and `plugins/valve`

This document describes the standard patterns for MQTT and OPC-UA source selection.

## Overview

The 3D Viewer provides a list of configured data sources (MQTT brokers, OPC-UA servers).
Plugins should:
1. Let users select a source from this list (global config)
2. Use the selected source for all subscriptions
3. Fallback gracefully if source is unavailable

## MQTT Source Pattern

### Manifest Configuration

```json
{
  "config": {
    "global": {
      "schema": {
        "type": "object",
        "properties": {
          "mqttSource": {
            "type": "string",
            "title": "MQTT Broker",
            "description": "Select MQTT broker (leave empty for default)",
            "x-source-type": "mqtt"
          },
          "mainTopic": {
            "type": "string",
            "title": "Data Topic",
            "description": "MQTT topic for data subscription",
            "default": "sensors/data"
          }
        }
      }
    }
  }
}
```

**Key:** `"x-source-type": "mqtt"` enables the broker selection dropdown in UI.

### Plugin Code Pattern

```typescript
import type { Plugin, PluginContext, Unsubscribe } from '@3dviewer/plugin-sdk';

class PluginState {
  private ctx: PluginContext | null = null;
  private mqttSources: string[] = [];

  initialize(ctx: PluginContext): void {
    this.ctx = ctx;
    // Fetch available sources on load
    this.mqttSources = ctx.mqtt.getSources();
    ctx.log.info('Available MQTT sources', { sources: this.mqttSources });
  }

  getMqttSources(): string[] {
    return this.mqttSources;
  }
}

const pluginState = new PluginState();

/**
 * Get MQTT API with configured source
 * Falls back to default if not configured or source not found
 */
function getMqttApi(ctx: PluginContext): typeof ctx.mqtt {
  const globalConfig = ctx.config.global.getAll();
  const mqttSource = globalConfig.mqttSource as string;

  if (mqttSource) {
    const availableSources = pluginState.getMqttSources();
    if (!availableSources.includes(mqttSource)) {
      ctx.log.warn(`MQTT source "${mqttSource}" not found`, {
        available: availableSources,
      });
      ctx.ui.notify(`MQTT Broker "${mqttSource}" not found`, 'warning');
    }
    return ctx.mqtt.withSource(mqttSource);
  }
  return ctx.mqtt; // Default
}

// Usage in subscription setup
function setupSubscriptions(ctx: PluginContext, nodeId: string): void {
  const mqtt = getMqttApi(ctx);
  const globalConfig = ctx.config.global.getAll();
  const topic = globalConfig.mainTopic as string || 'default/topic';

  // Check if sources are available
  const availableSources = ctx.mqtt.getSources();
  if (availableSources.length === 0) {
    ctx.log.error('No MQTT sources available');
    ctx.ui.notify('No MQTT brokers configured', 'error');
    return;
  }

  const unsub = mqtt.subscribe(topic, (msg) => {
    // Handle message
  });

  // Store unsub for cleanup
}
```

## OPC-UA Source Pattern

### Manifest Configuration

```json
{
  "config": {
    "global": {
      "schema": {
        "type": "object",
        "properties": {
          "opcuaSource": {
            "type": "string",
            "title": "OPC-UA Server",
            "description": "Select OPC-UA server (leave empty for default)",
            "x-source-type": "opcua"
          }
        }
      }
    },
    "instance": {
      "schema": {
        "type": "object",
        "properties": {
          "nodeIdRead": {
            "type": "string",
            "title": "OPC-UA Node ID",
            "description": "Node ID to subscribe to (e.g., ns=2;s=MyVariable)"
          }
        }
      }
    }
  }
}
```

**Key:** `"x-source-type": "opcua"` enables the server selection dropdown in UI.

### Plugin Code Pattern

```typescript
/**
 * Get OPC-UA API with configured source
 */
function getOpcuaApi(ctx: PluginContext): typeof ctx.opcua {
  const globalConfig = ctx.config.global.getAll();
  const opcuaSource = globalConfig.opcuaSource as string;

  if (opcuaSource) {
    const availableSources = ctx.opcua.getSources();
    if (!availableSources.includes(opcuaSource)) {
      ctx.log.warn(`OPC-UA server "${opcuaSource}" not found`, {
        available: availableSources,
      });
      ctx.ui.notify(`OPC-UA Server "${opcuaSource}" not found`, 'warning');
    }
    return ctx.opcua.withSource(opcuaSource);
  }
  return ctx.opcua; // Default
}

// Usage in subscription setup
function setupOpcuaSubscription(ctx: PluginContext, nodeId: string): void {
  const opcua = getOpcuaApi(ctx);
  const config = ctx.config.instance.getForNode(nodeId);
  const opcuaNodeId = config.nodeIdRead as string;

  if (!opcuaNodeId) {
    ctx.log.warn('No OPC-UA Node ID configured');
    return;
  }

  const unsub = opcua.subscribe(opcuaNodeId, (data) => {
    // Handle data
    ctx.log.debug('OPC-UA value received', { nodeId: opcuaNodeId, value: data.value });
  });

  // Store unsub for cleanup
}
```

## Combined MQTT + OPC-UA Pattern

Some plugins may need both sources:

### Manifest

```json
{
  "permissions": ["mqtt:subscribe", "opcua:read", "opcua:subscribe"],
  "config": {
    "global": {
      "schema": {
        "type": "object",
        "properties": {
          "mqttSource": {
            "type": "string",
            "title": "MQTT Broker",
            "x-source-type": "mqtt"
          },
          "opcuaSource": {
            "type": "string",
            "title": "OPC-UA Server",
            "x-source-type": "opcua"
          },
          "dataSourceType": {
            "type": "string",
            "title": "Primary Data Source",
            "enum": ["mqtt", "opcua"],
            "default": "mqtt"
          }
        }
      }
    }
  }
}
```

### Code Pattern

```typescript
function setupSubscriptions(ctx: PluginContext, nodeId: string): void {
  const globalConfig = ctx.config.global.getAll();
  const sourceType = globalConfig.dataSourceType as string || 'mqtt';

  if (sourceType === 'mqtt') {
    setupMqttSubscription(ctx, nodeId);
  } else if (sourceType === 'opcua') {
    setupOpcuaSubscription(ctx, nodeId);
  }
}
```

## Source Availability Check

Always verify sources are available before subscribing:

```typescript
function validateSources(ctx: PluginContext): boolean {
  const globalConfig = ctx.config.global.getAll();

  // Check MQTT if needed
  if (globalConfig.mqttSource || permissions.includes('mqtt:subscribe')) {
    const mqttSources = ctx.mqtt.getSources();
    if (mqttSources.length === 0) {
      ctx.ui.notify('No MQTT brokers configured', 'error');
      return false;
    }
  }

  // Check OPC-UA if needed
  if (globalConfig.opcuaSource || permissions.includes('opcua:subscribe')) {
    const opcuaSources = ctx.opcua.getSources();
    if (opcuaSources.length === 0) {
      ctx.ui.notify('No OPC-UA servers configured', 'error');
      return false;
    }
  }

  return true;
}
```

## State Management Pattern

From axis and valve plugins - centralized state with proper cleanup:

```typescript
interface NodeState {
  nodeId: string;
  subscriptions: Unsubscribe[];
  // ... plugin-specific state
}

class PluginState {
  private nodes: Map<string, NodeState> = new Map();
  private ctx: PluginContext | null = null;
  private globalSubscriptions: Unsubscribe[] = [];

  initialize(ctx: PluginContext): void {
    this.ctx = ctx;
  }

  addNode(nodeId: string): NodeState {
    const state: NodeState = {
      nodeId,
      subscriptions: [],
    };
    this.nodes.set(nodeId, state);
    return state;
  }

  removeNode(nodeId: string): void {
    const state = this.nodes.get(nodeId);
    if (state) {
      state.subscriptions.forEach(unsub => unsub());
      this.nodes.delete(nodeId);
    }
  }

  cleanup(): void {
    this.nodes.forEach(state => {
      state.subscriptions.forEach(unsub => unsub());
    });
    this.nodes.clear();
    this.globalSubscriptions.forEach(unsub => unsub());
    this.globalSubscriptions = [];
  }
}
```

## Checklist for New Plugins

- [ ] Add `x-source-type` hint to global config schema
- [ ] Implement `getSources()` call in `onLoad`
- [ ] Implement `withSource()` wrapper function
- [ ] Add source availability check
- [ ] Show user-friendly notification if source unavailable
- [ ] Store subscriptions in NodeState
- [ ] Cleanup in `onNodeUnbound` and `onUnload`
