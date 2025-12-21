# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 3DViewer Plugin Development Environment

> Vollständige Entwicklungsumgebung für 3DViewer Plugins mit SDK, Dev-Server und Blueprint-Beispielen.

## Projekt-Übersicht

Dieses Monorepo enthält alles, was zur Plugin-Entwicklung für den 3DViewer benötigt wird:

- **SDK**: TypeScript SDK mit allen APIs (`packages/plugin-sdk`)
- **DevTools**: Dev-Server & CLI (`packages/plugin-devtools`)
- **Blueprints**: Beispiel-Plugins (`plugins/blueprint-sandbox`, `plugins/blueprint-iframe`)
- **Playground**: Browser-Testumgebung (`playground/`)

## Häufige Befehle

```bash
# Dependencies installieren
npm install

# Dev-Server starten
npm run dev
# → http://localhost:3100

# Alles bauen
npm run build

# Nur SDK bauen
npm run build:sdk

# Einzelnes Plugin bauen
npm run build --workspace=plugins/<plugin-name>

# Tests ausführen
npm test

# Einzelne Testdatei ausführen
npm test tests/unit/sdk.test.ts

# Unit-Tests
npm run test:unit

# Tests mit Coverage
npm test -- --coverage

# Typprüfung
npm run typecheck

# Lint
npm run lint

# Plugin validieren
npm run validate

# Neues Plugin erstellen
npm run new:plugin -- my-plugin -t sandbox
```

## Plugin-Typen

### Sandbox (Proxy)
- Schneller, direkter API-Zugriff
- Volle React-Integration
- Für vertrauenswürdige interne Plugins

### IFrame (Isoliert)
- Maximale Sicherheit durch Isolation
- Eigener JavaScript-Kontext
- Für Drittanbieter-Plugins

## Verfügbare APIs

| API | Beschreibung |
|-----|-------------|
| `ctx.nodes` | Node-Manipulation (Farbe, Position, Sichtbarkeit) |
| `ctx.mqtt` | MQTT Pub/Sub |
| `ctx.opcua` | OPC-UA Read/Write/Subscribe |
| `ctx.http` | HTTP/REST Requests mit Polling |
| `ctx.events` | Internes Event-System |
| `ctx.ui` | Popups, Overlays, Notifications |
| `ctx.config` | Konfiguration (Global + Per-Node) |
| `ctx.state` | Persistenter State |
| `ctx.vars` | Globale Variablen |
| `ctx.log` | Logging (info, debug, warn, error) |

## Monorepo-Architektur

NPM Workspaces mit folgender Build-Reihenfolge:
1. `packages/plugin-sdk` → SDK-Typen und Helpers
2. `packages/plugin-devtools` → Dev-Server & CLI (abhängig von SDK)
3. `plugins/*` → Plugins (abhängig von SDK)

```
3DViewerPlugins/
├── packages/
│   ├── plugin-sdk/          # @3dviewer/plugin-sdk - Typen, Helpers, Testing-Utils
│   │   └── src/types/       # Alle TypeScript-Typdefinitionen
│   └── plugin-devtools/     # @3dviewer/plugin-devtools - Dev-Server & CLI
├── plugins/
│   ├── blueprint-sandbox/   # Vollständiges Sandbox-Beispiel
│   └── blueprint-iframe/    # Vollständiges IFrame-Beispiel
├── docs/
│   ├── llm-context/         # PLUGIN_API_REFERENCE.md - LLM-optimierte API-Referenz
│   └── agents/              # AGENT_INSTRUCTIONS.md - Anweisungen für Agents
├── tests/                   # Unit/Integration Tests (vitest)
├── playground/              # Browser-Playground
└── .claude/
    └── agents/              # Custom Claude Agents (init, new-plugin)
```

### SDK-Exports

```typescript
// Haupt-Typen
import type { Plugin, PluginContext, BoundNode, NodeProxy } from '@3dviewer/plugin-sdk';

// Testing-Utilities
import { createMockContext } from '@3dviewer/plugin-sdk/testing';
```

## Plugin-Lifecycle

Plugins implementieren das `Plugin` Interface mit folgenden Lifecycle-Hooks:

```typescript
const plugin: Plugin = {
  components: { Panel, Popup, Overlay },  // React-Komponenten
  onLoad(ctx) { /* Initialisierung */ },
  onNodeBound(ctx, node) { /* Node hinzugefügt */ },
  onNodeUnbound(ctx, node) { /* Node entfernt - Cleanup */ },
  onConfigChange(ctx, type, key, nodeId?) { /* Config geändert */ },
  onUnload(ctx) { /* Plugin entladen - Cleanup */ },
};
export default plugin;
```

## Code-Konventionen

- **TypeScript** für allen neuen Code
- **2 Spaces** Indentation
- Alle APIs mit Typen aus `@3dviewer/plugin-sdk` typisieren
- Subscriptions immer speichern und in `onNodeUnbound`/`onUnload` aufräumen
- Logging mit `ctx.log.*` statt `console.log`

## Custom Agents

Dieses Projekt definiert spezialisierte Claude-Agents in `.claude/agents/`:

- **init**: Projekt-Initialisierung (npm install, build, Validierung)
- **new-plugin**: Erstellt neues Plugin mit korrekter Struktur und Manifest

## Dokumentation

- @docs/llm-context/PLUGIN_API_REFERENCE.md - Vollständige API-Referenz
- @docs/agents/AGENT_INSTRUCTIONS.md - Anweisungen für Agents

## VS Code Integration

- **F5**: Dev-Server starten
- **Strg+Shift+B**: Build All
