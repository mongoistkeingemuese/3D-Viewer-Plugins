# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

3DViewer Plugin Development Environment - a monorepo for creating plugins that visualize and control 3D industrial models.

```
3DViewerPlugins/
├── packages/
│   ├── plugin-sdk/          # @3dviewer/plugin-sdk - Types, APIs, Testing Mocks
│   └── plugin-devtools/     # Dev-Server (port 3100) & CLI
├── plugins/
│   ├── blueprint-sandbox/   # Sandbox plugin example
│   └── blueprint-iframe/    # IFrame plugin example
├── docs/
│   ├── llm-context/PLUGIN_API_REFERENCE.md  # Complete API reference
│   └── guides/IFRAME_PLUGIN_PITFALLS.md     # IFrame async gotchas
└── tests/                   # Vitest tests
```

## Essential Commands

```bash
npm install                              # Install all dependencies
npm run dev                              # Start dev server → http://localhost:3100
npm run build                            # Build SDK → DevTools → Plugins (in order)
npm run build --workspace=plugins/<name> # Build single plugin
npm test                                 # Run all tests
npm test tests/unit/sdk.test.ts          # Single test file
npm run typecheck                        # TypeScript check
npm run new:plugin -- my-plugin -t sandbox  # Create new plugin
```

## Plugin Loading

### Local (Dev Server)
```
http://localhost:3100/plugins/<plugin-name>/dist/
```

### GitHub (via jsDelivr CDN)

| Field | Value |
|-------|-------|
| **Monorepo** | `mongoistkeingemuese/3D-Viewer-Plugins` |
| **Version** | Latest git tag (e.g., `v1.1.0`) |
| **Plugin Path** | `plugins/<plugin-name>/dist` |

## Plugin Types

| Type | Use Case | API Style |
|------|----------|-----------|
| **Sandbox (proxy)** | Internal/trusted plugins, full React | Synchronous |
| **IFrame (iframe)** | Third-party/untrusted plugins | **Async only** (Promise) |

## IFrame Critical Rules

IFrame plugins use postMessage - **ALL API calls return Promises**:

```typescript
// ❌ WRONG in iframe
onLoad(ctx) {
  const data = ctx.state.get('key');  // Returns Promise!
}

// ✅ CORRECT
async onLoad(ctx) {
  const data = await ctx.state.get('key');
}
```

See `docs/guides/IFRAME_PLUGIN_PITFALLS.md` for details.

## Plugin Architecture

```typescript
import type { Plugin, PluginContext, BoundNode, Unsubscribe } from '@3dviewer/plugin-sdk';

const subscriptions = new Map<string, Unsubscribe[]>();

const plugin: Plugin = {
  components: { Panel, Popup, Overlay },  // React components

  onLoad(ctx) {
    ctx.log.info('Loaded');
  },

  onNodeBound(ctx, node) {
    const subs: Unsubscribe[] = [];
    subs.push(ctx.mqtt.subscribe('topic', callback));
    subscriptions.set(node.id, subs);
  },

  onNodeUnbound(ctx, node) {
    subscriptions.get(node.id)?.forEach(unsub => unsub());
    subscriptions.delete(node.id);
  },

  onUnload(ctx) {
    subscriptions.forEach(subs => subs.forEach(unsub => unsub()));
    subscriptions.clear();
  },
};

export default plugin;
```

## Available APIs

| API | Purpose |
|-----|---------|
| `ctx.nodes` | Node manipulation (color, position, emissive, visibility) |
| `ctx.mqtt` | MQTT subscribe/publish |
| `ctx.opcua` | OPC-UA read/write/subscribe |
| `ctx.http` | HTTP requests and polling |
| `ctx.events` | Click, hover, select events |
| `ctx.ui` | Popups, overlays, notifications |
| `ctx.config` | Global and per-node configuration |
| `ctx.state` | Persistent state storage |
| `ctx.log` | Logging (debug/info/warn/error) |

Full API reference: `docs/llm-context/PLUGIN_API_REFERENCE.md`

## Node Manipulation Examples

```typescript
const node = ctx.nodes.get('Motor_01');
node.color = '#ff0000';              // Hex color
node.emissive = '#ff0000';           // Glow color
node.emissiveIntensity = 0.5;        // Glow strength 0-1
node.position = { x: 0, y: 1, z: 0 }; // World position
node.rotation = { x: 0, y: Math.PI, z: 0 };
node.visible = false;
node.duration = 500;                 // Animation duration ms
```

## Testing Plugins

```typescript
import { createMockContext } from '@3dviewer/plugin-sdk/testing';

const ctx = createMockContext({
  pluginId: 'com.test.plugin',
  initialNodes: [{ id: 'motor-1', name: 'Motor_01' }],
});

// Simulate MQTT message
ctx.mqtt.simulateMessage('sensors/temp', { value: 42 });

// Simulate node click
ctx.events.simulateClick({ nodeId: 'motor-1', nodeName: 'Motor_01' });
```

## Manifest Structure

```json
{
  "id": "com.company.plugin-name",
  "name": "Plugin Name",
  "version": "1.0.0",
  "entryPoint": "index.js",
  "sandbox": "proxy",
  "permissions": ["mqtt:subscribe", "nodes:read", "nodes:write"],
  "config": {
    "global": { "schema": { "type": "object", "properties": {...} } },
    "instance": { "schema": { "type": "object", "properties": {...} } }
  }
}
```

## Code Standards

### Required Patterns
- TypeScript with types from `@3dviewer/plugin-sdk`
- Save all subscriptions in `Map<string, Unsubscribe[]>`
- Clean up in `onNodeUnbound` and `onUnload`
- Use `ctx.log.*` instead of `console.log`
- Error handling with try/catch and `ctx.log.error`

### Documentation Format
```typescript
/**
 * Purpose: What the object does.
 * Usage: How it is utilized.
 * Rationale: Why this implementation.
 */
```

### Forbidden
- `: any` types
- `@ts-ignore`
- Untracked subscriptions (memory leaks)
- `console.log` (use `ctx.log`)

## Pre-Commit Checklist

```bash
npm run typecheck && npm test && npm run build
```

## Commit Format

```
[type]([scope]): [summary]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
Scopes: `sdk`, `devtools`, `plugin`, `docs`, `tests`

## Quality Workflow

### Before Any Deployment

```
1. quality-check  →  Validates code (typecheck, tests, build)
2. deploy         →  Handles versioning, commit, tag, push
```

**NEVER deploy without quality checks.** Use the `deploy` agent.

### Quality Gates

| Gate | Command | Blocking |
|------|---------|----------|
| TypeScript | `npm run typecheck` | YES |
| Tests | `npm test -- --run` | YES |
| Build | `npm run build` | YES |
| Manifest | `npm run validate` | YES |

### Quick Quality Check

```bash
npm run typecheck && npm test -- --run && npm run build
```

## Claude Agents

| Agent | Purpose | Mode | Requires |
|-------|---------|------|----------|
| **init** | First-time setup | blocks | - |
| **new-plugin** | Create plugin | independent | init |
| **quality-check** | Validate code | independent | init |
| **deploy** | Release plugin | blocks | quality-check |

All agents are **self-learning** and declare parallelization rules.

## Task Orchestration

### Parallel-Safe Combinations

```
SAFE (can run simultaneously):
├── new-plugin:foo + new-plugin:bar     (different plugins)
├── new-plugin:foo + quality-check:bar  (different plugins)
└── quality-check:* + quality-check:*   (read-only)

UNSAFE (must be sequential):
├── init + anything                     (setup first)
├── deploy + deploy                     (git conflicts)
└── quality-check:foo → deploy:foo      (gate)
```

### Execution Order for Multi-Step Tasks

```
"Create and deploy plugin foo":

1. [init]         ← if not done
2. [new-plugin]   ← create plugin
3. [quality-check]← validate (MUST PASS)
4. [deploy]       ← release

Each step waits for previous to complete.
```

See `.claude/rules/parallelization.md` for full documentation.

## Versioning

| Location | Format | Example |
|----------|--------|---------|
| `manifest.json` | `X.Y.Z` | `1.2.3` |
| `package.json` | `X.Y.Z` | `1.2.3` |
| Git tag | `vX.Y.Z` | `v1.2.3` |

**All three MUST match.** See `.claude/rules/versioning.md` for details.

## Plugin Templates

### Production Reference: `axis-release-10`

**USE THIS** for new MQTT/OPC-UA plugins:
- Source selection from 3D Viewer server list (`x-source-type: "mqtt"`)
- `ctx.mqtt.getSources()` + `ctx.mqtt.withSource()`
- PluginState class pattern
- Proper subscription cleanup

### Demo Plugins: `blueprint-*`

**Legacy patterns** - demonstrate all UI features but use direct URLs:
- `blueprint-sandbox` - Full feature demo (Panel, Popup, Overlay, Context Menu)
- `blueprint-iframe` - IFrame async patterns

**Do NOT copy** the config patterns from blueprints for new plugins.

## Rules

Rules in `.claude/rules/` apply to all interactions:
- `quality-standards.md` - Code quality requirements
- `versioning.md` - Version sync rules (manifest, package, git tag)
- `source-patterns.md` - MQTT/OPC-UA source selection patterns
- `parallelization.md` - Agent dependencies and safe parallel execution
- `self-learning.md` - How agents improve over time
- `common-errors.md` - Known issues and fixes

## VS Code

- **F5**: Start dev server
- **Ctrl+Shift+B**: Build all
