# 3DViewer Plugin Development - Agent Instructions

> Dieses Dokument enthält Anweisungen für AI-Assistenten, die Plugins für den 3DViewer entwickeln.

## Schnellstart für Agents

### Neues Plugin erstellen

```bash
cd /home/martin/Dokumente/Projekte/3DViewerPlugins
npm run new:plugin -- my-plugin-name -t sandbox
```

### Plugin-Struktur

```
plugins/my-plugin/
├── manifest.json          # Plugin-Metadaten und Config
├── package.json           # NPM-Konfiguration
├── tsconfig.json          # TypeScript-Config
├── src/
│   ├── index.ts           # Plugin-Entry (onLoad, onNodeBound, etc.)
│   └── components/        # React-Komponenten (Panel, Popup, Overlay)
└── dist/
    └── index.js           # Kompiliertes Bundle
```

### Dev-Server starten

```bash
npm run dev
# → http://localhost:3100
```

---

## Wichtige Regeln

### 1. Immer TypeScript verwenden

```typescript
// ✅ Richtig
import type { Plugin, PluginContext, BoundNode } from '@3dviewer/plugin-sdk';

const plugin: Plugin = {
  onLoad(ctx: PluginContext) { /* ... */ }
};

// ❌ Falsch - keine Typen
const plugin = {
  onLoad(ctx) { /* ... */ }
};
```

### 2. Subscriptions speichern

```typescript
// ✅ Richtig - Subscription speichern
const subscriptions: Unsubscribe[] = [];

onLoad(ctx) {
  subscriptions.push(
    ctx.mqtt.subscribe('topic', callback)
  );
}

// ❌ Falsch - Subscription ignoriert (Memory Leak)
onLoad(ctx) {
  ctx.mqtt.subscribe('topic', callback);
}
```

### 3. Cleanup in onUnload

Subscriptions werden automatisch bereinigt, aber eigene Ressourcen müssen manuell aufgeräumt werden.

### 4. Async-Aware für IFrame

```typescript
// Proxy-Plugin (sync möglich)
const node = ctx.nodes.get(id);
node.color = '#ff0000';

// IFrame-Plugin (alles async)
// ACHTUNG: In IFrame können manche Operationen async sein
```

### 5. Manifest vollständig ausfüllen

- `permissions` - Nur benötigte Permissions anfordern
- `config.schema` - JSON Schema für automatische UI-Generierung
- `ui.components` - Nur registrierte Komponenten verwenden

---

## Entscheidungsbaum

### Welcher Sandbox-Typ?

```
Brauche ich direkten DOM-Zugriff?
├── Ja → Proxy
└── Nein
    ├── Ist das Plugin von Drittanbietern? → IFrame
    ├── Brauche ich maximale Sicherheit? → IFrame
    └── Sonst → Proxy
```

### Welches Binding-System?

```
Woher kommen die Daten?
├── MQTT Broker → ctx.mqtt.subscribe()
├── OPC-UA Server → ctx.opcua.subscribe()
├── REST API → ctx.http.poll()
├── WebSocket → Eigene Implementierung
└── Intern → ctx.events.on()
```

### Welche UI-Komponente?

```
Was will ich anzeigen?
├── Seitenpanel (permanent) → ui.panel
├── Popup/Modal (temporär) → ui.popup + ctx.ui.showPopup()
├── 3D-Label über Node → ui.overlay + ctx.ui.showOverlay()
├── Im Node-Properties-Panel → ui.nodeSection
└── Im Kontextmenü → ui.contextMenu
```

---

## Code-Beispiele für Agents

### Minimal-Plugin

```typescript
import type { Plugin, PluginContext } from '@3dviewer/plugin-sdk';

const plugin: Plugin = {
  onLoad(ctx: PluginContext) {
    ctx.log.info('Plugin loaded');
  },
};

export default plugin;
```

### Plugin mit MQTT-Binding

```typescript
import type { Plugin, PluginContext, BoundNode, Unsubscribe } from '@3dviewer/plugin-sdk';

const subscriptions = new Map<string, Unsubscribe>();

const plugin: Plugin = {
  onLoad(ctx: PluginContext) {
    ctx.log.info('MQTT Plugin loaded');
  },

  onNodeBound(ctx: PluginContext, node: BoundNode) {
    const topic = ctx.config.instance.get<string>(node.id, 'topic', `nodes/${node.id}`);

    const unsub = ctx.mqtt.subscribe(topic, (msg) => {
      const proxy = ctx.nodes.get(node.id);
      if (!proxy) return;

      const value = msg.payload as { value: number };
      proxy.color = value.value > 80 ? '#ff0000' : '#00ff00';
    });

    subscriptions.set(node.id, unsub);
  },

  onNodeUnbound(ctx: PluginContext, node: BoundNode) {
    subscriptions.get(node.id)?.();
    subscriptions.delete(node.id);
  },
};

export default plugin;
```

### Plugin mit HTTP-Polling und Overlay

```typescript
import type { Plugin, PluginContext, BoundNode, Unsubscribe, OverlayHandle } from '@3dviewer/plugin-sdk';

const state = new Map<string, { polling: Unsubscribe; overlay: OverlayHandle }>();

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
      if (resp.status === 200) {
        ctx.ui.updateOverlay(overlay, { data: resp.data });

        const proxy = ctx.nodes.get(node.id);
        if (proxy && typeof resp.data?.value === 'number') {
          proxy.color = resp.data.value > 50 ? '#ff0000' : '#00ff00';
        }
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
};

export default plugin;
```

---

## Checkliste vor Fertigstellung

- [ ] `manifest.json` vollständig und korrekt
- [ ] Alle Permissions in manifest deklariert
- [ ] TypeScript-Typen für alle Parameter
- [ ] Subscriptions werden gespeichert
- [ ] Cleanup in `onNodeUnbound` und `onUnload`
- [ ] Logging für Debugging (`ctx.log.info/debug/warn/error`)
- [ ] Config-Schema für automatische UI
- [ ] Tests geschrieben (optional aber empfohlen)

---

## Fehlerbehebung

### Plugin wird nicht geladen

1. Prüfe `manifest.json` Syntax
2. Prüfe `entryPoint` Pfad
3. Prüfe Dev-Server Logs

### API-Aufrufe scheitern

1. Prüfe Permissions in manifest
2. Prüfe ob API korrekt aufgerufen wird
3. Logge mit `ctx.log.error()`

### Overlay erscheint nicht

1. Prüfe ob Komponente in manifest unter `ui.overlays` registriert
2. Prüfe ob Komponente in `components` exportiert
3. Prüfe `nodeId` Parameter

---

## SDK-Import Referenz

```typescript
// Haupt-Imports
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

// Für Helpers
import { definePlugin, defineManifest, validateManifest } from '@3dviewer/plugin-sdk';

// Für Testing
import { createMockContext, MockMqttAPI, MockNodesAPI } from '@3dviewer/plugin-sdk/testing';
```
