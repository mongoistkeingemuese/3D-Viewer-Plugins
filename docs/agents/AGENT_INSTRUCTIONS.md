# 3DViewer Plugin Development - Agent Instructions

> This document contains instructions for AI assistants developing plugins for the 3DViewer.

## Quick Start for Agents

### Create New Plugin

```bash
cd /home/martin/Dokumente/Projekte/3DViewerPlugins
npm run new:plugin -- my-plugin-name -t sandbox
```

### Plugin Structure

```
plugins/my-plugin/
├── manifest.json          # Plugin metadata and config
├── package.json           # NPM configuration
├── tsconfig.json          # TypeScript config
├── src/
│   ├── index.ts           # Plugin entry (onLoad, onNodeBound, etc.)
│   └── components/        # React components (Panel, Popup, Overlay)
└── dist/
    └── index.js           # Compiled bundle
```

### Start Dev Server

```bash
npm run dev
# → http://localhost:3100
```

---

## Quality Gates (MANDATORY)

Every code change MUST pass these gates:

### Gate 1: Pre-Change Analysis
- [ ] Read and understand existing code
- [ ] Identify affected components
- [ ] Check existing tests
- [ ] Review documentation

### Gate 2: Implementation Standards
- [ ] Follow existing patterns
- [ ] Add logging for new code paths
- [ ] Include error handling
- [ ] Write LLM-readable code

### Gate 3: Post-Change Verification
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] No regressions

---

## Important Rules

### 1. Always Use TypeScript

```typescript
// ✅ Correct
import type { Plugin, PluginContext, BoundNode } from '@3dviewer/plugin-sdk';

const plugin: Plugin = {
  onLoad(ctx: PluginContext) { /* ... */ }
};

// ❌ Wrong - no types
const plugin = {
  onLoad(ctx) { /* ... */ }
};
```

### 2. Save Subscriptions

```typescript
// ✅ Correct - Save subscription for cleanup
const subscriptions = new Map<string, Unsubscribe[]>();

onNodeBound(ctx, node) {
  const subs: Unsubscribe[] = [];
  subs.push(ctx.mqtt.subscribe('topic', callback));
  subscriptions.set(node.id, subs);
}

onNodeUnbound(ctx, node) {
  subscriptions.get(node.id)?.forEach(unsub => unsub());
  subscriptions.delete(node.id);
}

// ❌ Wrong - Memory leak!
onNodeBound(ctx, node) {
  ctx.mqtt.subscribe('topic', callback); // Subscription ignored!
}
```

### 3. Cleanup in onUnload

Subscriptions are automatically cleaned up, but custom resources must be cleaned manually.

### 4. Async-Aware for IFrame

```typescript
// Proxy Plugin (sync possible)
const node = ctx.nodes.get(id);
node.color = '#ff0000';

// IFrame Plugin (everything async)
// ATTENTION: In IFrame some operations can be async
```

### 5. Complete Manifest

- `permissions` - Only request necessary permissions
- `config.schema` - JSON Schema for automatic UI generation
- `ui.components` - Only use registered components

---

## Decision Trees

### Which Sandbox Type?

```
Do I need direct DOM access?
├── Yes → Proxy
└── No
    ├── Is the plugin from third parties? → IFrame
    ├── Do I need maximum security? → IFrame
    └── Otherwise → Proxy
```

### Which Binding System?

```
Where does the data come from?
├── MQTT Broker → ctx.mqtt.subscribe()
├── OPC-UA Server → ctx.opcua.subscribe()
├── REST API → ctx.http.poll()
├── WebSocket → Custom implementation
└── Internal → ctx.events.on()
```

### Which UI Component?

```
What do I want to display?
├── Side panel (permanent) → ui.panel
├── Popup/Modal (temporary) → ui.popup + ctx.ui.showPopup()
├── 3D Label over node → ui.overlay + ctx.ui.showOverlay()
├── In node properties panel → ui.nodeSection
└── In context menu → ui.contextMenu
```

---

## Code Examples for Agents

### Minimal Plugin

```typescript
/**
 * Purpose: Minimal plugin demonstrating basic lifecycle hooks.
 * Usage: Starting point for new plugins.
 * Rationale: Shows correct structure with proper types.
 */
import type { Plugin, PluginContext } from '@3dviewer/plugin-sdk';

const plugin: Plugin = {
  onLoad(ctx: PluginContext) {
    ctx.log.info('Plugin loaded');
  },
};

export default plugin;
```

### Plugin with MQTT Binding

```typescript
/**
 * Purpose: Plugin that binds nodes to MQTT topics for real-time updates.
 * Usage: Configure MQTT topic per node, plugin updates node color based on values.
 * Rationale: Common pattern for IoT sensor visualization.
 */
import type { Plugin, PluginContext, BoundNode, Unsubscribe } from '@3dviewer/plugin-sdk';

const subscriptions = new Map<string, Unsubscribe[]>();

const plugin: Plugin = {
  onLoad(ctx: PluginContext) {
    ctx.log.info('MQTT Plugin loaded');
  },

  onNodeBound(ctx: PluginContext, node: BoundNode) {
    const subs: Unsubscribe[] = [];
    const topic = ctx.config.instance.get<string>(node.id, 'topic', `nodes/${node.id}`);

    const unsub = ctx.mqtt.subscribe(topic, (msg) => {
      try {
        const proxy = ctx.nodes.get(node.id);
        if (!proxy) return;

        const value = msg.payload as { value: number };
        proxy.color = value.value > 80 ? '#ff0000' : '#00ff00';
        ctx.log.debug('Node color updated', { nodeId: node.id, value: value.value });
      } catch (error) {
        ctx.log.error('Failed to process MQTT message', { nodeId: node.id, error });
      }
    });

    subs.push(unsub);
    subscriptions.set(node.id, subs);
  },

  onNodeUnbound(ctx: PluginContext, node: BoundNode) {
    subscriptions.get(node.id)?.forEach(unsub => unsub());
    subscriptions.delete(node.id);
  },

  onUnload(ctx: PluginContext) {
    subscriptions.forEach(subs => subs.forEach(unsub => unsub()));
    subscriptions.clear();
  },
};

export default plugin;
```

### Plugin with HTTP Polling and Overlay

```typescript
/**
 * Purpose: Plugin that polls HTTP endpoints and displays overlays on nodes.
 * Usage: Configure API endpoint per node, plugin shows real-time data as 3D overlay.
 * Rationale: Demonstrates HTTP polling with overlay lifecycle management.
 */
import type { Plugin, PluginContext, BoundNode, Unsubscribe, OverlayHandle } from '@3dviewer/plugin-sdk';

interface NodeState {
  polling: Unsubscribe;
  overlay: OverlayHandle;
}

const state = new Map<string, NodeState>();

const plugin: Plugin = {
  components: {
    StatusOverlay: ({ data }) => (
      <div style={{ background: 'rgba(0,0,0,0.8)', padding: 8, borderRadius: 4, color: '#fff' }}>
        {data?.value ?? '-'}
      </div>
    ),
  },

  onLoad(ctx: PluginContext) {
    ctx.log.info('HTTP Plugin loaded');
  },

  onNodeBound(ctx: PluginContext, node: BoundNode) {
    const baseUrl = ctx.config.global.get<string>('apiUrl', 'http://localhost:8080');
    const endpoint = ctx.config.instance.get<string>(node.id, 'endpoint', node.id);

    const overlay = ctx.ui.showOverlay('StatusOverlay', {
      nodeId: node.id,
      data: { value: null },
    });

    const polling = ctx.http.poll(`${baseUrl}/api/${endpoint}`, 1000, (resp) => {
      try {
        if (resp.status === 200) {
          ctx.ui.updateOverlay(overlay, { data: resp.data });

          const proxy = ctx.nodes.get(node.id);
          if (proxy && typeof resp.data?.value === 'number') {
            proxy.color = resp.data.value > 50 ? '#ff0000' : '#00ff00';
          }
        }
      } catch (error) {
        ctx.log.error('Failed to process HTTP response', { nodeId: node.id, error });
      }
    });

    state.set(node.id, { polling, overlay });
  },

  onNodeUnbound(ctx: PluginContext, node: BoundNode) {
    const s = state.get(node.id);
    if (s) {
      s.polling();
      ctx.ui.hideOverlay(s.overlay);
      state.delete(node.id);
    }
  },

  onUnload(ctx: PluginContext) {
    state.forEach(s => {
      s.polling();
    });
    state.clear();
  },
};

export default plugin;
```

---

## Checklist Before Completion

- [ ] `manifest.json` complete and correct
- [ ] All permissions declared in manifest
- [ ] TypeScript types for all parameters
- [ ] Subscriptions are saved
- [ ] Cleanup in `onNodeUnbound` and `onUnload`
- [ ] Logging for debugging (`ctx.log.info/debug/warn/error`)
- [ ] Config schema for automatic UI
- [ ] Tests written (optional but recommended)

---

## Troubleshooting

### Plugin Not Loading

1. Check `manifest.json` syntax
2. Check `entryPoint` path
3. Check dev server logs

### API Calls Failing

1. Check permissions in manifest
2. Check if API is called correctly
3. Log with `ctx.log.error()`

### Overlay Not Appearing

1. Check if component is registered in manifest under `ui.overlays`
2. Check if component is exported in `components`
3. Check `nodeId` parameter

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
} from '@3dviewer/plugin-sdk';

// For helpers
import { definePlugin, defineManifest, validateManifest } from '@3dviewer/plugin-sdk';

// For testing
import { createMockContext, MockMqttAPI, MockNodesAPI } from '@3dviewer/plugin-sdk/testing';
```

---

## Code Quality Standards

### Documentation (Required for all classes/functions)

```typescript
/**
 * Purpose: What the object does.
 * Usage: How it is utilized within the context.
 * Rationale: Why this specific implementation was chosen.
 */
```

### LLM-Readable Code

- **Descriptive names:** `calculateThresholdColor` not `calc`
- **Consistent vocabulary:** Use terms from docs (SceneNode, MqttBinding)
- **No abbreviations:** `configuration` not `cfg`
- **Comments explain WHY, not WHAT**

### Code Quality Checklist

- [ ] No `: any` types (use proper interfaces)
- [ ] No `@ts-ignore` (fix the actual type issue)
- [ ] Functions < 50 lines (extract if larger)
- [ ] Max 3 levels nesting (use early returns)
- [ ] Meaningful names
- [ ] Logging added for new code paths
- [ ] Error handling with meaningful messages
