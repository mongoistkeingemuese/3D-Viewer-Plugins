# 3DViewer Plugin API Reference

> **LLM-optimierte Referenz** - Dieses Dokument ist für AI-Assistenten und Entwickler optimiert, um schnell die richtigen APIs und Patterns zu finden.

## Quick Reference: Was will ich tun?

| Aufgabe | API | Beispiel |
|---------|-----|----------|
| Node-Farbe ändern | `ctx.nodes.get(id).color` | `node.color = '#ff0000'` |
| MQTT abonnieren | `ctx.mqtt.subscribe()` | `ctx.mqtt.subscribe('topic', cb)` |
| OPC-UA lesen | `ctx.opcua.read()` | `await ctx.opcua.read('ns=2;s=Var')` |
| HTTP Request | `ctx.http.get()` | `await ctx.http.get('/api/data')` |
| Popup öffnen | `ctx.ui.showPopup()` | `ctx.ui.showPopup('Name', opts)` |
| Config lesen | `ctx.config.global.get()` | `ctx.config.global.get('key')` |
| Loggen | `ctx.log.info()` | `ctx.log.info('message')` |

---

## Plugin Struktur

```typescript
import type { Plugin, PluginContext, BoundNode } from '@3dviewer/plugin-sdk';

const plugin: Plugin = {
  // Optional: React-Komponenten
  components: {
    Panel: MyPanelComponent,
    Popup: MyPopupComponent,
  },

  // Lifecycle: Plugin geladen
  onLoad(ctx: PluginContext) {
    ctx.log.info('Plugin loaded');
  },

  // Lifecycle: Node gebunden
  onNodeBound(ctx: PluginContext, node: BoundNode) {
    const proxy = ctx.nodes.get(node.id);
    proxy.color = '#00ff00';
  },

  // Lifecycle: Node entbunden
  onNodeUnbound(ctx: PluginContext, node: BoundNode) {
    // Cleanup
  },

  // Lifecycle: Config geändert
  onConfigChange(ctx, type, key, nodeId?) {
    // React to config changes
  },

  // Lifecycle: Plugin entladen
  onUnload(ctx: PluginContext) {
    // Cleanup (subscriptions auto-cleaned)
  },
};

export default plugin;
```

---

## API Details

### NodesAPI - Node-Manipulation

```typescript
// Node abrufen (by ID oder Name)
const node = ctx.nodes.get('Motor_01');
const node = ctx.nodes.get('uuid-1234-5678');

// Alle Nodes
const allNodes = ctx.nodes.getAll();

// Nodes filtern
const motors = ctx.nodes.find({ namePattern: /^Motor_/ });
const visible = ctx.nodes.find({ visible: true });

// Properties ändern (reaktiv!)
node.color = '#ff0000';           // Hex-Farbe
node.opacity = 0.5;               // 0-1
node.visible = false;             // boolean
node.position = { x: 0, y: 1, z: 0 };  // Vector3
node.rotation = { x: 0, y: Math.PI, z: 0 };
node.scale = { x: 1.5, y: 1.5, z: 1.5 };
node.emissive = '#ff0000';        // Glow-Farbe
node.emissiveIntensity = 0.5;     // 0-1
node.duration = 500;              // Animation in ms

// Property-Änderungen beobachten
const unsub = ctx.nodes.onChange('node-id', 'visible', (newVal, oldVal) => {
  console.log(`Changed from ${oldVal} to ${newVal}`);
});
unsub(); // Unsubscribe
```

### MqttAPI - Pub/Sub Messaging

```typescript
// Einfaches Subscribe
const unsub = ctx.mqtt.subscribe('sensors/temperature', (msg) => {
  console.log(msg.topic, msg.payload, msg.timestamp);
});

// Pattern Subscribe (+ = single level, # = multi level)
ctx.mqtt.subscribePattern('sensors/+/temperature', (msg) => {
  // Matches: sensors/room1/temperature, sensors/room2/temperature
});

ctx.mqtt.subscribePattern('sensors/#', (msg) => {
  // Matches: sensors/anything/at/any/depth
});

// Publish
ctx.mqtt.publish('commands/motor', { speed: 100 });
ctx.mqtt.publish('commands/motor', { speed: 100 }, { qos: 1, retain: true });

// Mit Source-ID (für Multi-Broker)
const mqtt2 = ctx.mqtt.withSource('broker2');
mqtt2.subscribe('topic', callback);
```

### OpcUaAPI - Industrial Automation

```typescript
// Wert lesen (async!)
const value = await ctx.opcua.read('ns=2;s=MyVariable');
console.log(value.value, value.dataType, value.statusCode);

// Wert schreiben
await ctx.opcua.write('ns=2;s=MyVariable', 42);

// Subscribe auf Wertänderungen
const unsub = ctx.opcua.subscribe('ns=2;s=MyVariable', (value) => {
  console.log('New value:', value.value);
});

// Mit Source-ID
const opcua2 = ctx.opcua.withSource('plc2');
```

### HttpAPI - REST Requests

```typescript
// GET Request
const response = await ctx.http.get('https://api.example.com/data');
console.log(response.status, response.data);

// POST Request
const response = await ctx.http.post('https://api.example.com/data', {
  name: 'Test',
  value: 42,
});

// Vollständiger fetch
const response = await ctx.http.fetch('https://api.example.com/data', {
  method: 'PUT',
  headers: { 'Authorization': 'Bearer token' },
  body: { update: true },
  timeout: 5000,
});

// Polling (automatisches Interval)
const unsub = ctx.http.poll('https://api.example.com/status', 1000, (resp) => {
  if (resp.status === 200) {
    console.log('Status:', resp.data);
  }
});
```

### EventsAPI - Event Handling

```typescript
// Node Events
ctx.events.onNodeClick((event) => {
  console.log('Clicked:', event.nodeId, event.nodeName);
  console.log('3D Point:', event.point);
  console.log('Screen:', event.screenPosition);
});

ctx.events.onNodeHover((event) => { /* Mouse enter/leave */ });
ctx.events.onNodeSelect((event) => { /* Selection changed */ });

// Binding Events
ctx.events.onNodeBound((node) => {
  console.log('Node bound:', node.id, node.name);
});

ctx.events.onNodeUnbound((node) => {
  console.log('Node unbound:', node.id);
});

// Custom Events (Plugin <-> Plugin Kommunikation)
ctx.events.emit('my-custom-event', { data: 'value' });

ctx.events.on('my-custom-event', (data) => {
  console.log('Received:', data);
});

// Activation Events
ctx.events.onActivate(() => console.log('Plugin activated'));
ctx.events.onDeactivate(() => console.log('Plugin deactivated'));
```

### UiAPI - Dialogs & Overlays

```typescript
// Popup anzeigen (muss in manifest.json definiert sein)
const handle = ctx.ui.showPopup('MyPopup', {
  title: 'Details',
  width: 400,
  height: 300,
  position: { x: 100, y: 100 },
  data: { nodeId: 'xyz' },
  onClose: () => console.log('Closed'),
});

// Popup schließen
ctx.ui.closePopup(handle);
ctx.ui.closeAllPopups();

// 3D Overlay (schwebt über Node)
const overlay = ctx.ui.showOverlay('StatusOverlay', {
  nodeId: 'motor-1',
  offset: { x: 0, y: 1, z: 0 },
  data: { value: 42 },
  occlude: false,  // Durch Objekte sichtbar?
});

ctx.ui.updateOverlay(overlay, { data: { value: 43 } });
ctx.ui.hideOverlay(overlay);

// Notifications
ctx.ui.notify('Erfolgreich gespeichert', 'success');
ctx.ui.notify('Warnung!', 'warning');
ctx.ui.notify('Fehler aufgetreten', 'error');

// Dialogs (async)
const confirmed = await ctx.ui.confirm('Wirklich löschen?');
const input = await ctx.ui.prompt('Neuer Name:', 'Default');
```

### ConfigAPI - Konfiguration

```typescript
// Global Config (für alle Nodes)
const value = ctx.config.global.get<string>('apiUrl', 'http://default');
ctx.config.global.set('apiUrl', 'http://new-url');
const all = ctx.config.global.getAll();

ctx.config.global.onChange('apiUrl', (newVal, oldVal) => {
  console.log('Config changed');
});

// Instance Config (pro Node)
const nodeValue = ctx.config.instance.get<number>('node-1', 'threshold', 50);
ctx.config.instance.set('node-1', 'threshold', 75);
const nodeConfig = ctx.config.instance.getForNode('node-1');

ctx.config.instance.onChange('node-1', 'threshold', (newVal, oldVal) => {
  console.log('Node config changed');
});
```

### StateAPI - Persistenz

```typescript
// Persistent (überlebt Browser-Reload)
ctx.state.set('myData', { count: 42 });
const data = ctx.state.get<{ count: number }>('myData', { count: 0 });
ctx.state.delete('myData');

// Session (nur für aktuelle Session)
ctx.state.session.set('tempData', 'value');
const temp = ctx.state.session.get('tempData');
```

### VarsAPI & ConstsAPI - Globale Variablen

```typescript
// Variablen (read/write)
ctx.vars.set('globalCounter', 42);
const counter = ctx.vars.get('globalCounter');
const allVars = ctx.vars.getAll();

ctx.vars.onChange('globalCounter', (newVal, oldVal) => {
  console.log('Variable changed');
});

// Konstanten (read-only)
const appVersion = ctx.consts.get('version');
const allConsts = ctx.consts.getAll();
```

### LogAPI - Debugging

```typescript
ctx.log.debug('Debug info', { details: 'data' });  // Nur in Dev-Mode
ctx.log.info('Information', { nodeId: 'x' });
ctx.log.warn('Warning message');
ctx.log.error('Error occurred', new Error('details'));
```

---

## Manifest.json Referenz

```json
{
  "id": "com.company.my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "Plugin description",
  "license": "MIT",
  "icon": "🔧",
  "entryPoint": "dist/index.js",

  "permissions": [
    "mqtt:subscribe", "mqtt:publish",
    "opcua:read", "opcua:write",
    "http:fetch",
    "nodes:read", "nodes:write",
    "vars:read", "vars:write",
    "ui:popup", "ui:panel", "ui:overlay",
    "state:persist"
  ],

  "sandbox": "proxy",  // oder "iframe"

  "nodeBinding": {
    "mode": "manual",  // oder "auto"
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

## Sandbox-Typen

### Proxy (Standard)
- Schneller, direkter API-Zugriff
- Volle React-Integration
- Gleicher JavaScript-Kontext
- Permission-Checks via Proxy

### IFrame (Isoliert)
- Maximale Sicherheit
- Eigener JavaScript-Kontext
- Async-only APIs
- postMessage-Kommunikation
- Für nicht vertrauenswürdige Plugins

---

## Häufige Patterns

### Daten-Binding mit Farbänderung

```typescript
onNodeBound(ctx, node) {
  const config = ctx.config.instance.getForNode(node.id);
  const topic = config.mqttTopic as string;

  ctx.mqtt.subscribe(topic, (msg) => {
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
  });
}
```

### HTTP Polling mit Overlay

```typescript
onNodeBound(ctx, node) {
  const overlay = ctx.ui.showOverlay('Status', {
    nodeId: node.id,
    data: { value: null },
  });

  ctx.http.poll('/api/nodes/' + node.id, 1000, (resp) => {
    if (resp.status === 200) {
      ctx.ui.updateOverlay(overlay, {
        data: { value: resp.data },
      });
    }
  });
}
```

### Config-basierte Logik

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

## Fehlerbehandlung

```typescript
try {
  const value = await ctx.opcua.read('ns=2;s=NonExistent');
} catch (error) {
  ctx.log.error('OPC-UA read failed', error);
  ctx.ui.notify('Verbindung fehlgeschlagen', 'error');
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
