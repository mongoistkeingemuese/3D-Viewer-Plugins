# 3DViewer Plugin API Reference

> **LLM-Optimized Reference** - This document is optimized for AI assistants and developers to quickly find the right APIs and patterns.

## Quick Reference: What do I want to do?

| Task | API | Example |
|------|-----|---------|
| Change node color | `ctx.nodes.get(id).color` | `node.color = '#ff0000'` |
| Subscribe to MQTT | `ctx.mqtt.subscribe()` | `ctx.mqtt.subscribe('topic', cb)` |
| Read OPC-UA | `ctx.opcua.read()` | `await ctx.opcua.read('ns=2;s=Var')` |
| HTTP Request | `ctx.http.get()` | `await ctx.http.get('/api/data')` |
| Open popup | `ctx.ui.showPopup()` | `ctx.ui.showPopup('Name', opts)` |
| Read config | `ctx.config.global.get()` | `ctx.config.global.get('key')` |
| Log message | `ctx.log.info()` | `ctx.log.info('message')` |
| Log error to Viewer Log | `ctx.log.error()` | `ctx.log.error('msg', {nodeId})` |
| Handle log acknowledgment | `ctx.events.onLogAcknowledged()` | Reset node error state |

---

## Plugin Structure

```typescript
import type { Plugin, PluginContext, BoundNode } from '@3dviewer/plugin-sdk';

const plugin: Plugin = {
  // Optional: React components
  components: {
    Panel: MyPanelComponent,
    Popup: MyPopupComponent,
  },

  // Lifecycle: Plugin loaded
  onLoad(ctx: PluginContext) {
    ctx.log.info('Plugin loaded');
  },

  // Lifecycle: Node bound
  onNodeBound(ctx: PluginContext, node: BoundNode) {
    const proxy = ctx.nodes.get(node.id);
    proxy.color = '#00ff00';
  },

  // Lifecycle: Node unbound
  onNodeUnbound(ctx: PluginContext, node: BoundNode) {
    // Cleanup
  },

  // Lifecycle: Config changed
  onConfigChange(ctx, type, key, nodeId?) {
    // React to config changes
  },

  // Lifecycle: Plugin unloaded
  onUnload(ctx: PluginContext) {
    // Cleanup (subscriptions auto-cleaned)
  },
};

export default plugin;
```

---

## API Details

### NodesAPI - Node Manipulation

```typescript
// Get node (by ID or name)
const node = ctx.nodes.get('Motor_01');
const node = ctx.nodes.get('uuid-1234-5678');

// All nodes
const allNodes = ctx.nodes.getAll();

// Filter nodes
const motors = ctx.nodes.find({ namePattern: /^Motor_/ });
const visible = ctx.nodes.find({ visible: true });

// Change properties (reactive!)
node.color = '#ff0000';           // Hex color
node.opacity = 0.5;               // 0-1
node.visible = false;             // boolean
node.position = { x: 0, y: 1, z: 0 };  // Vector3
node.rotation = { x: 0, y: Math.PI, z: 0 };
node.scale = { x: 1.5, y: 1.5, z: 1.5 };
node.emissive = '#ff0000';        // Glow color
node.emissiveIntensity = 0.5;     // 0-1
node.duration = 500;              // Animation in ms

// Watch property changes
const unsub = ctx.nodes.onChange('node-id', 'visible', (newVal, oldVal) => {
  console.log(`Changed from ${oldVal} to ${newVal}`);
});
unsub(); // Unsubscribe
```

### MqttAPI - Pub/Sub Messaging

```typescript
// Simple subscribe
const unsub = ctx.mqtt.subscribe('sensors/temperature', (msg) => {
  console.log(msg.topic, msg.payload, msg.timestamp);
});

// Pattern subscribe (+ = single level, # = multi level)
ctx.mqtt.subscribePattern('sensors/+/temperature', (msg) => {
  // Matches: sensors/room1/temperature, sensors/room2/temperature
});

ctx.mqtt.subscribePattern('sensors/#', (msg) => {
  // Matches: sensors/anything/at/any/depth
});

// Publish
ctx.mqtt.publish('commands/motor', { speed: 100 });
ctx.mqtt.publish('commands/motor', { speed: 100 }, { qos: 1, retain: true });

// With source ID (for multi-broker)
const mqtt2 = ctx.mqtt.withSource('broker2');
mqtt2.subscribe('topic', callback);

// Get available broker sources
const sources = ctx.mqtt.getSources();  // ['default', 'broker2', ...]
```

### OpcUaAPI - Industrial Automation

```typescript
// Read value (async!)
const value = await ctx.opcua.read('ns=2;s=MyVariable');
console.log(value.value, value.dataType, value.statusCode);

// Write value
await ctx.opcua.write('ns=2;s=MyVariable', 42);

// Subscribe to value changes
const unsub = ctx.opcua.subscribe('ns=2;s=MyVariable', (value) => {
  console.log('New value:', value.value);
});

// With source ID
const opcua2 = ctx.opcua.withSource('plc2');

// Get available OPC-UA sources
const sources = ctx.opcua.getSources();  // ['default', 'plc2', ...]
```

### HttpAPI - REST Requests

```typescript
// GET request
const response = await ctx.http.get('https://api.example.com/data');
console.log(response.status, response.data);

// POST request
const response = await ctx.http.post('https://api.example.com/data', {
  name: 'Test',
  value: 42,
});

// Full fetch
const response = await ctx.http.fetch('https://api.example.com/data', {
  method: 'PUT',
  headers: { 'Authorization': 'Bearer token' },
  body: { update: true },
  timeout: 5000,
});

// Polling (automatic interval)
const unsub = ctx.http.poll('https://api.example.com/status', 1000, (resp) => {
  if (resp.status === 200) {
    console.log('Status:', resp.data);
  }
});
```

### EventsAPI - Event Handling

```typescript
// Node events
ctx.events.onNodeClick((event) => {
  console.log('Clicked:', event.nodeId, event.nodeName);
  console.log('3D Point:', event.point);
  console.log('Screen:', event.screenPosition);
});

ctx.events.onNodeHover((event) => { /* Mouse enter/leave */ });
ctx.events.onNodeSelect((event) => { /* Selection changed */ });

// Binding events
ctx.events.onNodeBound((node) => {
  console.log('Node bound:', node.id, node.name);
});

ctx.events.onNodeUnbound((node) => {
  console.log('Node unbound:', node.id);
});

// Custom events (plugin <-> plugin communication)
ctx.events.emit('my-custom-event', { data: 'value' });

ctx.events.on('my-custom-event', (data) => {
  console.log('Received:', data);
});

// Activation events
ctx.events.onActivate(() => console.log('Plugin activated'));
ctx.events.onDeactivate(() => console.log('Plugin deactivated'));

// Log acknowledgment events (Viewer Log integration)
ctx.events.onLogAcknowledged((entries) => {
  // Triggered when user acknowledges log entries in Viewer Log
  entries.forEach((entry) => {
    if (entry.nodeId) {
      // Reset node visual state (e.g., remove error glow)
      const node = ctx.nodes.get(entry.nodeId);
      if (node) {
        node.emissive = '#000000';
        node.emissiveIntensity = 0;
      }
    }
  });
});
```

### UiAPI - Dialogs & Overlays

```typescript
// Show popup (must be defined in manifest.json)
const handle = ctx.ui.showPopup('MyPopup', {
  title: 'Details',
  width: 400,
  height: 300,
  position: { x: 100, y: 100 },
  data: { nodeId: 'xyz' },
  onClose: () => console.log('Closed'),
});

// Close popup
ctx.ui.closePopup(handle);
ctx.ui.closeAllPopups();

// 3D overlay (floats above node)
const overlay = ctx.ui.showOverlay('StatusOverlay', {
  nodeId: 'motor-1',
  offset: { x: 0, y: 1, z: 0 },
  data: { value: 42 },
  occlude: false,  // Visible through objects?
});

ctx.ui.updateOverlay(overlay, { data: { value: 43 } });
ctx.ui.hideOverlay(overlay);

// Notifications
ctx.ui.notify('Successfully saved', 'success');
ctx.ui.notify('Warning!', 'warning');
ctx.ui.notify('Error occurred', 'error');

// Dialogs (async)
const confirmed = await ctx.ui.confirm('Really delete?');
const input = await ctx.ui.prompt('New name:', 'Default');
```

### ConfigAPI - Configuration

```typescript
// Global config (for all nodes)
const value = ctx.config.global.get<string>('apiUrl', 'http://default');
ctx.config.global.set('apiUrl', 'http://new-url');
const all = ctx.config.global.getAll();

ctx.config.global.onChange('apiUrl', (newVal, oldVal) => {
  console.log('Config changed');
});

// Instance config (per node)
const nodeValue = ctx.config.instance.get<number>('node-1', 'threshold', 50);
ctx.config.instance.set('node-1', 'threshold', 75);
const nodeConfig = ctx.config.instance.getForNode('node-1');

ctx.config.instance.onChange('node-1', 'threshold', (newVal, oldVal) => {
  console.log('Node config changed');
});
```

### StateAPI - Persistence

```typescript
// Persistent (survives browser reload)
ctx.state.set('myData', { count: 42 });
const data = ctx.state.get<{ count: number }>('myData', { count: 0 });
ctx.state.delete('myData');

// Session (current session only)
ctx.state.session.set('tempData', 'value');
const temp = ctx.state.session.get('tempData');
```

### VarsAPI & ConstsAPI - Global Variables

```typescript
// Variables (read/write)
ctx.vars.set('globalCounter', 42);
const counter = ctx.vars.get('globalCounter');
const allVars = ctx.vars.getAll();

ctx.vars.onChange('globalCounter', (newVal, oldVal) => {
  console.log('Variable changed');
});

// Constants (read-only)
const appVersion = ctx.consts.get('version');
const allConsts = ctx.consts.getAll();
```

### LogAPI - Debugging & Viewer Log Integration

```typescript
ctx.log.debug('Debug info', { details: 'data' });  // Dev-Mode only
ctx.log.info('Information', { nodeId: 'x' });
ctx.log.warn('Warning message');
ctx.log.error('Error occurred', new Error('details'));

// Viewer Log integration (warn/error appear in Viewer Log panel)
// Include nodeId/nodeName for acknowledgment support:
ctx.log.error('Valve error', {
  nodeId: 'valve-123',
  nodeName: 'Valve_01',
  message: 'Pressure too high',
});

// Listen for acknowledgment in Viewer Log:
ctx.events.onLogAcknowledged((entries) => {
  entries.forEach((entry) => {
    if (entry.nodeId) {
      // Reset error state when user acknowledges
      const node = ctx.nodes.get(entry.nodeId);
      if (node) {
        node.emissive = '#000000';
        node.emissiveIntensity = 0;
      }
    }
  });
});
```

---

## Manifest.json Reference

```json
{
  "id": "com.company.my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "Plugin description",
  "license": "MIT",
  "icon": "🔧",
  "entryPoint": "index.js",

  "permissions": [
    "mqtt:subscribe", "mqtt:publish",
    "opcua:read", "opcua:write",
    "http:fetch",
    "nodes:read", "nodes:write",
    "vars:read", "vars:write",
    "ui:popup", "ui:panel", "ui:overlay",
    "state:persist"
  ],

  "sandbox": "proxy",

  "nodeBinding": {
    "mode": "manual",
    "filter": {
      "namePattern": "^Motor_",
      "metadata": { "type": "motor" }
    }
  },

  "ui": {
    "toolbar": { "enabled": true, "icon": "🔧", "tooltip": "Open" },
    "panel": { "component": "Panel", "title": "Controls", "width": 300 },
    "popups": {
      "Settings": { "component": "SettingsPopup", "width": 400 }
    },
    "overlays": {
      "Status": { "component": "StatusOverlay", "occlude": false }
    },
    "nodeSection": { "component": "NodeSection", "title": "Settings" },
    "contextMenu": [
      { "id": "action", "label": "Do Action", "icon": "⚡" }
    ]
  },

  "config": {
    "global": {
      "schema": {
        "type": "object",
        "properties": {
          "apiUrl": { "type": "string", "default": "http://localhost" }
        }
      }
    },
    "instance": {
      "schema": {
        "type": "object",
        "properties": {
          "threshold": { "type": "number", "default": 50 }
        }
      }
    }
  }
}
```

---

## Sandbox Types

### Proxy (Default)
- Fast, direct API access
- Full React integration
- Same JavaScript context
- Permission checks via Proxy

### IFrame (Isolated)
- Maximum security
- Own JavaScript context
- Async-only APIs
- postMessage communication
- For untrusted plugins

---

## Common Patterns

### Data Binding with Color Change

```typescript
onNodeBound(ctx, node) {
  const config = ctx.config.instance.getForNode(node.id);
  const topic = config.mqttTopic as string;

  ctx.mqtt.subscribe(topic, (msg) => {
    try {
      const value = msg.payload as number;
      const proxy = ctx.nodes.get(node.id);

      if (value > 90) {
        proxy.color = '#ff0000';
        proxy.emissive = '#ff0000';
        proxy.emissiveIntensity = 0.5;
      } else if (value > 70) {
        proxy.color = '#ffaa00';
      } else {
        proxy.color = '#00ff00';
      }
    } catch (error) {
      ctx.log.error('Failed to update node', { nodeId: node.id, error });
    }
  });
}
```

### HTTP Polling with Overlay

```typescript
onNodeBound(ctx, node) {
  const overlay = ctx.ui.showOverlay('Status', {
    nodeId: node.id,
    data: { value: null },
  });

  ctx.http.poll('/api/nodes/' + node.id, 1000, (resp) => {
    try {
      if (resp.status === 200) {
        ctx.ui.updateOverlay(overlay, {
          data: { value: resp.data },
        });
      }
    } catch (error) {
      ctx.log.error('Failed to poll', { nodeId: node.id, error });
    }
  });
}
```

### Config-Based Logic

```typescript
onConfigChange(ctx, type, key, nodeId) {
  if (type === 'instance' && key === 'enabled' && nodeId) {
    const enabled = ctx.config.instance.get<boolean>(nodeId, 'enabled', true);
    const node = ctx.nodes.get(nodeId);

    if (node) {
      node.visible = enabled;
      node.opacity = enabled ? 1 : 0.3;
    }
  }
}
```

---

## Error Handling

```typescript
try {
  const value = await ctx.opcua.read('ns=2;s=NonExistent');
} catch (error) {
  ctx.log.error('OPC-UA read failed', error);
  ctx.ui.notify('Connection failed', 'error');
}
```

---

## Testing

```typescript
import { createMockContext } from '@3dviewer/plugin-sdk/testing';
import plugin from '../src';

test('plugin subscribes to MQTT on load', () => {
  const ctx = createMockContext({
    initialNodes: [{ id: 'node-1', name: 'Motor' }],
  });

  plugin.onLoad?.(ctx);

  expect(ctx.mqtt.subscriptions).toHaveLength(1);
  expect(ctx.mqtt.subscriptions[0].topic).toBe('expected/topic');
});

test('node changes color on data', () => {
  const ctx = createMockContext({
    initialNodes: [{ id: 'node-1', name: 'Motor' }],
  });

  plugin.onLoad?.(ctx);
  plugin.onNodeBound?.(ctx, { id: 'node-1', name: 'Motor', metadata: {} });

  // Simulate MQTT message
  ctx.mqtt.simulateMessage('sensor/data', { value: 95 });

  const node = ctx.nodes.get('node-1');
  expect(node?.color).toBe('#ff0000');
});
```

---

## SDK Import Reference

```typescript
// Main imports
import type {
  Plugin,
  PluginContext,
  PluginManifest,
  BoundNode,
  NodeProxy,
  NodeEvent,
  Unsubscribe,
  Vector3,
  MqttMessage,
  OpcUaValue,
  HttpResponse,
  OverlayHandle,
  PopupHandle,
} from '@3dviewer/plugin-sdk';

// Helpers
import { definePlugin, defineManifest, validateManifest } from '@3dviewer/plugin-sdk';

// Testing
import { createMockContext, MockMqttAPI, MockNodesAPI } from '@3dviewer/plugin-sdk/testing';
```

---

## Performance Considerations

| Check | Risk if Violated |
|-------|------------------|
| Use `ctx.log.debug` for frequent logs | Log flooding |
| Debounce rapid MQTT messages | UI lag, high CPU |
| Clean up overlays on unbind | Memory leak |
| Batch state updates | Multiple re-renders |
| Use threshold checks | Unnecessary color updates |

---

## Quality Checklist

Before completing a plugin:

- [ ] All types from `@3dviewer/plugin-sdk`
- [ ] No `: any` types
- [ ] Subscriptions saved and cleaned up
- [ ] Error handling with try/catch
- [ ] Logging for debugging
- [ ] Permissions declared in manifest
- [ ] Config schema for UI generation
- [ ] Documentation comments (Purpose, Usage, Rationale)
