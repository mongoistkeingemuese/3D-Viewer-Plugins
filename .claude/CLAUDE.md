# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 3DViewer Plugin Development Environment

> Complete development environment for 3DViewer Plugins with SDK, Dev-Server, and Blueprint examples.

## Project Overview

This monorepo contains everything needed for 3DViewer plugin development:

- **SDK**: TypeScript SDK with all APIs (`packages/plugin-sdk`)
- **DevTools**: Dev-Server & CLI (`packages/plugin-devtools`)
- **Blueprints**: Example plugins (`plugins/blueprint-sandbox`, `plugins/blueprint-iframe`)
- **Playground**: Browser test environment (`playground/`)

## Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3100

# Build everything
npm run build

# Build SDK only
npm run build:sdk

# Build single plugin
npm run build --workspace=plugins/<plugin-name>

# Run tests
npm test

# Run single test file
npm test tests/unit/sdk.test.ts

# Unit tests
npm run test:unit

# Tests with coverage
npm test -- --coverage

# Type checking
npm run typecheck

# Lint
npm run lint

# Validate plugin
npm run validate

# Create new plugin
npm run new:plugin -- my-plugin -t sandbox
```

## Plugin Types

### Sandbox (Proxy)
- Fast, direct API access
- Full React integration
- For trusted internal plugins

### IFrame (Isolated)
- Maximum security through isolation
- Own JavaScript context
- For third-party plugins

## Available APIs

| API | Description |
|-----|-------------|
| `ctx.nodes` | Node manipulation (color, position, visibility) |
| `ctx.mqtt` | MQTT Pub/Sub |
| `ctx.opcua` | OPC-UA Read/Write/Subscribe |
| `ctx.http` | HTTP/REST Requests with polling |
| `ctx.events` | Internal event system |
| `ctx.ui` | Popups, Overlays, Notifications |
| `ctx.config` | Configuration (Global + Per-Node) |
| `ctx.state` | Persistent state |
| `ctx.vars` | Global variables |
| `ctx.log` | Logging (info, debug, warn, error) |

---

## Quality Gates (MANDATORY)

Every code change MUST pass these gates:

### Gate 1: Pre-Change Analysis
Before making changes:
- [ ] Read and understand existing code
- [ ] Identify affected components (upstream/downstream)
- [ ] Check existing tests for the area
- [ ] Review related documentation

### Gate 2: Implementation Standards
During implementation:
- [ ] Follow existing patterns in the codebase
- [ ] Add logging for new code paths (`ctx.log.*`)
- [ ] Include error handling with meaningful messages
- [ ] Consider performance implications
- [ ] Write LLM-readable code

### Gate 3: Post-Change Verification
After changes:
- [ ] TypeScript compiles without errors
- [ ] All existing tests pass
- [ ] New/modified code has test coverage
- [ ] Documentation updated if API/behavior changed
- [ ] No regressions in related functionality

---

## Documentation Standards

Every class and function declaration must be preceded by a structured comment:

```typescript
/**
 * Purpose: What the object does.
 * Usage: How it is utilized within the context.
 * Rationale: Why this specific implementation was chosen.
 */
```

**Rules:**
- Comments must be in English
- Do not explain obvious logic
- Focus on high-level abstraction

---

## Code Quality Checklist

Before committing, verify:
- [ ] No `: any` types (use proper interfaces)
- [ ] No `@ts-ignore` (fix the actual type issue)
- [ ] Functions < 50 lines (extract if larger)
- [ ] Max 3 levels nesting (use early returns)
- [ ] Meaningful names (not `getData`, use `getUserById`)
- [ ] Logging added for new code paths
- [ ] Error handling with meaningful messages

---

## LLM-Readable Code Standards

Write code that is easy for LLMs (and humans) to understand:

### Naming
- **Descriptive names:** `calculateTotalPrice` not `calc`
- **Consistent vocabulary:** Use terms from docs (SceneNode, MqttBinding)
- **No abbreviations:** `configuration` not `cfg`, `response` not `res`

### Structure
- **One concept per file:** Don't mix unrelated functionality
- **Logical ordering:** Public API first, then private helpers
- **Group related code:** Keep related functions/types together

### Comments
- **Why, not what:** Explain rationale, not obvious mechanics
- **Document edge cases:** Note non-obvious behavior
- **Keep updated:** Stale comments are worse than none

---

## Monorepo Architecture

NPM Workspaces with the following build order:
1. `packages/plugin-sdk` → SDK types and helpers
2. `packages/plugin-devtools` → Dev-Server & CLI (depends on SDK)
3. `plugins/*` → Plugins (depend on SDK)

```
3DViewerPlugins/
├── packages/
│   ├── plugin-sdk/          # @3dviewer/plugin-sdk - Types, Helpers, Testing-Utils
│   │   └── src/types/       # All TypeScript type definitions
│   └── plugin-devtools/     # @3dviewer/plugin-devtools - Dev-Server & CLI
├── plugins/
│   ├── blueprint-sandbox/   # Complete Sandbox example
│   └── blueprint-iframe/    # Complete IFrame example
├── docs/
│   ├── llm-context/         # PLUGIN_API_REFERENCE.md - LLM-optimized API reference
│   └── agents/              # AGENT_INSTRUCTIONS.md - Agent instructions
├── tests/                   # Unit/Integration Tests (vitest)
├── playground/              # Browser Playground
└── .claude/
    └── agents/              # Custom Claude Agents (init, new-plugin)
```

### SDK Exports

```typescript
// Main types
import type { Plugin, PluginContext, BoundNode, NodeProxy } from '@3dviewer/plugin-sdk';

// Testing utilities
import { createMockContext } from '@3dviewer/plugin-sdk/testing';
```

---

## Plugin Lifecycle

Plugins implement the `Plugin` interface with these lifecycle hooks:

```typescript
const plugin: Plugin = {
  components: { Panel, Popup, Overlay },  // React components
  onLoad(ctx) { /* Initialization */ },
  onNodeBound(ctx, node) { /* Node added */ },
  onNodeUnbound(ctx, node) { /* Node removed - Cleanup */ },
  onConfigChange(ctx, type, key, nodeId?) { /* Config changed */ },
  onUnload(ctx) { /* Plugin unloaded - Cleanup */ },
};
export default plugin;
```

---

## Code Conventions

- **TypeScript** for all new code
- **2 Spaces** indentation
- Type all APIs with types from `@3dviewer/plugin-sdk`
- Always save subscriptions and clean up in `onNodeUnbound`/`onUnload`
- Use `ctx.log.*` instead of `console.log`

---

## Subscription Management (CRITICAL)

```typescript
// ✅ CORRECT - Save subscription for cleanup
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

// ❌ WRONG - Memory leak!
onNodeBound(ctx, node) {
  ctx.mqtt.subscribe('topic', callback); // Subscription ignored!
}
```

---

## Error Handling

```typescript
// Always catch and log errors
try {
  await ctx.opcua.read(nodeId);
} catch (error) {
  ctx.log.error('OPC-UA read failed', { nodeId, error });
  ctx.ui.notify('Connection failed', 'error');
  throw error; // Re-throw if caller should handle
}
```

---

## Performance Considerations

| Check | Risk if Violated |
|-------|------------------|
| Use `ctx.log.debug` for frequent logs | Log flooding |
| Batch state updates | Multiple re-renders |
| Debounce rapid MQTT messages | Performance degradation |
| Clean up overlays on unbind | Memory leak |

---

## Custom Agents

This project defines specialized Claude agents in `.claude/agents/`:

- **init**: Project initialization (npm install, build, validation)
- **new-plugin**: Creates new plugin with correct structure and manifest

---

## Documentation

- @docs/llm-context/PLUGIN_API_REFERENCE.md - Complete API reference
- @docs/agents/AGENT_INSTRUCTIONS.md - Agent instructions

---

## VS Code Integration

- **F5**: Start Dev-Server
- **Ctrl+Shift+B**: Build All

---

## Safety Rules

- **NEVER** delete code without understanding it
- **NEVER** use `any` type as a quick fix
- **NEVER** use `// @ts-ignore` unless absolutely necessary
- **NEVER** skip logging for new functionality
- **NEVER** ignore error handling
- **ALWAYS** understand code before modifying
- **ALWAYS** save and clean up subscriptions
- **ALWAYS** test after changes

---

## Commit Workflow

### Pre-Commit Testing (MANDATORY)

**Before every commit, tests must be executed and verified!**

1. Run all checks:
   ```bash
   npm run typecheck && npm test && npm run build
   ```
2. On **all pass:** Proceed with commit
3. On **failures:**
   - Analyze errors
   - Fix issues
   - Re-run tests
   - Only commit when all pass

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
[type]([scope]): [summary]

- [Change 1]
- [Change 2]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring (no behavior change) |
| `docs` | Documentation only |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |

**Scopes:**
| Scope | Description |
|-------|-------------|
| `sdk` | packages/plugin-sdk |
| `devtools` | packages/plugin-devtools |
| `plugin` | plugins/* |
| `docs` | Documentation |
| `tests` | Test infrastructure |

### Commit Checklist

- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Commit message follows convention

### Commit Safety Rules

- **NEVER** use `--force` or `--no-verify`
- **NEVER** commit secrets (.env, credentials, API keys)
- **NEVER** amend commits that aren't yours
- **NEVER** push to main/master without PR
- **ALWAYS** run tests before commit
- **ALWAYS** update docs if code changes affect them
