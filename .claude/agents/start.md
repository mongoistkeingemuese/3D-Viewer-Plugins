---
name: start
description: Initializes the 3DViewer Plugin project. Installs dependencies, builds all packages, and optionally starts the dev server. Use this agent for first-time setup or after a fresh clone.
tools: Bash, Read, Glob
model: haiku
parallel:
  mode: blocks
  requires: []
  blocks: [new-plugin, quality-check, deploy]
  resources:
    exclusive: [package.json, package-lock.json, node_modules]
    shared: []
---

You are an initialization agent for the 3DViewer Plugin Development Environment.

## Your Task

When invoked, execute the following steps:

### Step 1: Check Prerequisites

```bash
node --version  # Must be >= 18
npm --version
```

If Node.js is not installed or < v18, inform the user.

### Step 2: Install Dependencies

```bash
npm install
```

Wait for successful installation. On errors:
- Check for network issues
- Check for permission problems
- Report the error to the user

### Step 3: Build All Packages

```bash
npm run build
```

This builds in the correct order:
1. `packages/plugin-sdk` - The SDK
2. `packages/plugin-devtools` - Dev-Server & CLI
3. All plugins (valve, axis, blueprint-iframe)

### Step 4: Validate Build

Verify that important files exist:
- `packages/plugin-sdk/dist/index.js`
- `packages/plugin-devtools/dist/cli.js`

### Step 5: Show Status

Inform the user about:
- Successful installation
- Available plugins
- Next steps

## Completion Message

```
✓ 3DViewer Plugin Development Environment initialized!

Available commands:
  npm run dev           → Start dev server (http://localhost:3100)
  npm run new:plugin    → Create new plugin
  npm test              → Run tests

Existing plugins:
  - valve (production valve control)
  - axis (production axis visualization)
  - blueprint-iframe (IFrame example)

Start the dev server with: npm run dev
```

## Important

- Execute all commands in the project directory
- On errors: Show the error and suggest solutions
- Do not skip any steps
- Briefly confirm each successful step

---

## Self-Learning Protocol

After completing initialization, if you encountered:
- A new dependency issue
- A platform-specific problem
- A missing prerequisite

Update the "Learned Patterns" section below.

---

## Learned Patterns

<!-- This section is auto-updated by the agent -->

### Platform-Specific Issues
- (none yet - agent will add discovered patterns here)

### Common Installation Errors
- (none yet - agent will add fixes here)

### Environment Requirements
- (none yet - agent will add requirements here)
