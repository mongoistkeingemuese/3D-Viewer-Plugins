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
│   ├── valve/               # Produktions-Plugin für Ventilsteuerung
│   ├── axis/                # Produktions-Plugin für Achsenvisualisierung
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

## Produktions-Plugins

### valve
- Vollständige MQTT-Integration mit Broker-Auswahl
- Fehlertracking mit Bestätigungs-UI
- HTTP-Befehlsintegration
- Positionsanimation mit Laufzeitmessung
- PluginState-Klassenmuster mit korrektem Cleanup
- React Popup-Komponente für Details/Steuerung

### axis
- MQTT-Integration für Achsenüberwachung
- Broker-Auswahl über 3D Viewer Serverliste
- Schrittsteuerungsfunktion
- HTTP-API-Integration

### blueprint-iframe
- IFrame-Beispiel für Drittanbieter-Plugins
- Isolierte Ausführung
- Async APIs
- postMessage-Kommunikation

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

### Local (Dev Server)

```
http://localhost:3100/plugins/<plugin-name>/dist/
```

### GitHub (via jsDelivr CDN)

Nach commit und git tag:

| Feld | Wert |
|------|------|
| **Monorepo** | `mongoistkeingemuese/3D-Viewer-Plugins` |
| **Version** | `v1.1.0` (oder neuester Tag) |
| **Plugin Path** | `plugins/<plugin-name>/dist` |

Direkte URLs:
```
https://cdn.jsdelivr.net/gh/mongoistkeingemuese/3D-Viewer-Plugins@v1.1.0/plugins/<plugin-name>/dist/manifest.json
https://cdn.jsdelivr.net/gh/mongoistkeingemuese/3D-Viewer-Plugins@v1.1.0/plugins/<plugin-name>/dist/index.js
```

### Verfügbare Plugins

| Plugin | Path | Beschreibung |
|--------|------|--------------|
| valve | `plugins/valve/dist` | Produktions-Plugin für Ventilsteuerung |
| axis | `plugins/axis/dist` | Produktions-Plugin für Achsenvisualisierung |
| blueprint-iframe | `plugins/blueprint-iframe/dist` | IFrame-Beispiel für Drittanbieter-Plugins |
