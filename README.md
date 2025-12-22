# 3DViewer Plugin Development Environment

Vollständige Entwicklungsumgebung für 3DViewer Plugins mit SDK, Dev-Server und Blueprint-Beispielen.

## Schnellstart

```bash
# Dependencies installieren
npm install

# Dev-Server starten
npm run dev
# → http://localhost:3100

# Neues Plugin erstellen
npm run new:plugin -- my-plugin -t sandbox
```

## Projektstruktur

```
3DViewerPlugins/
├── packages/
│   ├── plugin-sdk/          # TypeScript SDK mit allen APIs
│   └── plugin-devtools/     # Dev-Server & CLI
├── plugins/
│   ├── blueprint-sandbox/   # Vollständiges Sandbox-Beispiel
│   └── blueprint-iframe/    # Vollständiges IFrame-Beispiel
├── docs/
│   ├── llm-context/         # LLM-optimierte Referenz
│   └── agents/              # AI-Agent Anweisungen
├── tests/                   # Unit/Integration Tests
└── playground/              # Browser-Playground
```

## Plugin-Typen

### Sandbox (Proxy)
- Schneller, direkter API-Zugriff
- Volle React-Integration
- Für vertrauenswürdige Plugins

### IFrame (Isoliert)
- Maximale Sicherheit
- Eigener JavaScript-Kontext
- Für Drittanbieter-Plugins

## Verfügbare APIs

| API | Beschreibung |
|-----|-------------|
| `ctx.nodes` | Node-Manipulation (Farbe, Position, etc.) |
| `ctx.mqtt` | MQTT Pub/Sub |
| `ctx.opcua` | OPC-UA Read/Write/Subscribe |
| `ctx.http` | HTTP/REST Requests |
| `ctx.events` | Event-System |
| `ctx.ui` | Popups, Overlays, Notifications |
| `ctx.config` | Konfiguration (Global + Per-Node) |
| `ctx.state` | Persistenter State |
| `ctx.vars` | Globale Variablen |
| `ctx.log` | Logging |

## VS Code Integration

- **F5**: Dev-Server starten
- **Strg+Shift+B**: Build All
- **Tasks**: `Dev Server`, `Build`, `Test`, `New Plugin`

## Dokumentation

- `docs/llm-context/PLUGIN_API_REFERENCE.md` - Vollständige API-Referenz
- `docs/agents/AGENT_INSTRUCTIONS.md` - Anweisungen für AI-Assistenten

## Testing

```bash
# Alle Tests
npm test

# Nur Unit-Tests
npm run test:unit

# Mit Coverage
npm test -- --coverage
```

## Blueprint Plugins

Die Blueprint-Plugins demonstrieren alle verfügbaren Features:

### blueprint-sandbox
- Node-Manipulation
- MQTT/OPC-UA/HTTP Bindings
- UI-Komponenten (Panel, Popup, Overlay)
- Konfiguration mit JSON Schema
- Event-Handling

### blueprint-iframe
- Isolierte Ausführung
- Async APIs
- postMessage-Kommunikation
- Sichere Datenbindung

## Plugin erstellen

```bash
npm run new:plugin -- my-plugin -t sandbox
```

Erstellt:
```
plugins/my-plugin/
├── manifest.json
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

## Manifest-Beispiel

```json
{
  "id": "com.example.my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "entryPoint": "index.js",
  "permissions": ["nodes:read", "nodes:write", "mqtt:subscribe"],
  "sandbox": "proxy",
  "config": {
    "global": {
      "schema": {
        "type": "object",
        "properties": {
          "apiUrl": { "type": "string", "default": "http://localhost" }
        }
      }
    }
  }
}
```

## Verbindung zum 3DViewer

Plugins vom Dev-Server laden:

```json
{
  "type": "url",
  "url": "http://localhost:3100/plugins/my-plugin/manifest.json"
}
```
