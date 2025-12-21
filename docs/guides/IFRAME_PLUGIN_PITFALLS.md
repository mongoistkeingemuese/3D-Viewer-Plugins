# IFrame Plugin Pitfalls

> Dokumentation häufiger Fehler bei der Entwicklung von iframe-Plugins und wie man sie vermeidet.

## Übersicht

IFrame-Plugins laufen in einem isolierten Kontext und kommunizieren über `postMessage` mit dem Host. Dies bringt wichtige Unterschiede zu Sandbox-Plugins mit sich.

## Kritische Unterschiede: Sandbox vs. IFrame

| Aspekt | Sandbox Plugin | IFrame Plugin |
|--------|----------------|---------------|
| API-Aufrufe | Synchron | **Async (Promise)** |
| Callbacks | Direkt übergeben | **Nicht serialisierbar** |
| Context in Lifecycle | Immer verfügbar | **Muss übergeben werden** |
| Daten | Direkte Referenzen | **Nur serialisierbare Daten** |

---

## Fehler 1: Synchrone API-Aufrufe

### Problem
```typescript
// ❌ FALSCH - funktioniert nur in Sandbox
onLoad(ctx: PluginContext): void {
  const nodes = ctx.state.get<string[]>('nodes', []);  // Returns Promise!
  ctx.log.debug('Nodes:', nodes);  // Logs: "Nodes: [object Promise]"
}
```

### Lösung
```typescript
// ✅ RICHTIG - async/await für iframe
async onLoad(ctx: PluginContext): Promise<void> {
  const nodes = await ctx.state.get<string[]>('nodes', []);
  ctx.log.debug('Nodes:', nodes);
}
```

### Betroffene APIs
Alle diese APIs sind im iframe-Kontext async:
- `ctx.state.get()`, `ctx.state.set()`
- `ctx.nodes.get()`, `ctx.nodes.find()`
- `ctx.config.instance.getForNode()`
- `ctx.mqtt.subscribe()`, `ctx.opcua.subscribe()`
- `ctx.events.onNodeClick()`, etc.

---

## Fehler 2: Callbacks über postMessage senden

### Problem
```typescript
// ❌ FALSCH - Funktionen können nicht serialisiert werden!
ctx.events.onNodeClick((event) => {
  console.log('Clicked:', event.nodeId);
});
// Error: DataCloneError: (event) => {...} could not be cloned
```

### Ursache
`postMessage` kann nur serialisierbare Daten übertragen:
- ✅ Strings, Numbers, Booleans, null, undefined
- ✅ Arrays, Plain Objects
- ❌ **Functions**
- ❌ **Promises**
- ❌ DOM Elements
- ❌ Class Instances (außer bestimmte Built-ins)

### Lösung
Das iframe-System speichert Callbacks lokal und gibt eine `subscriptionId` zurück:

```typescript
// ✅ RICHTIG - Callback wird lokal im iframe gespeichert
async onLoad(ctx: PluginContext): Promise<void> {
  // subscribe() gibt ein Promise<Unsubscribe> zurück
  const unsubscribe = await ctx.events.onNodeClick((event) => {
    ctx.log.debug('Clicked:', event.nodeId);
  });

  // Wichtig: Unsubscribe-Funktion speichern!
  this.subscriptions.push(unsubscribe);
}
```

---

## Fehler 3: Fehlender Context bei onUnload

### Problem
```typescript
// ❌ FALSCH - ctx ist undefined wenn nicht übergeben
onUnload(ctx: PluginContext): void {
  ctx.log.info('Unloading...');  // TypeError: Cannot read properties of undefined
}
```

### Ursache
Der Host muss den Context explizit an `onUnload` übergeben. Dies war ein Bug in `IframeSandbox.ts`.

### Lösung (Host-seitig - bereits gefixt)
```javascript
// In IframeSandbox.ts IFRAME_HTML
if (plugin && plugin.onUnload) {
  await plugin.onUnload(context);  // Context übergeben!
}
```

---

## Fehler 4: Falsche Permission-Deklaration

### Problem
```json
// manifest.json
{
  "permissions": [
    "state:persist"  // Spezifische Permission
  ]
}
```

```
Error: Permission denied: state
```

### Ursache
Die Permission-Prüfung muss Präfix-basiert sein:
- `state:persist` sollte Zugriff auf die `state` API gewähren
- `mqtt:subscribe` sollte Zugriff auf die `mqtt` API gewähren

### Lösung (Host-seitig - bereits gefixt)
```typescript
// In IframeApiRouter.ts
return permissions.some((p: string) =>
  p === prefix || p.startsWith(prefix + ':')
);
```

### Empfohlene Permissions für iframe-Plugins
```json
{
  "permissions": [
    "mqtt:subscribe",
    "mqtt:publish",
    "opcua:read",
    "http:fetch",
    "nodes:read",
    "nodes:write",
    "ui:popup",
    "ui:overlay",
    "state:persist",
    "events:click"    // Für onNodeClick etc.
  ]
}
```

---

## Fehler 5: Lifecycle-Hooks nicht async

### Problem
```typescript
// ❌ FALSCH - Mischt sync und async
onNodeBound(ctx: PluginContext, node: BoundNode): void {
  const config = ctx.config.instance.getForNode(node.id);  // Promise!
  if (config.displayMode !== 'none') {  // Vergleicht mit Promise-Objekt
    // ...
  }
}
```

### Lösung
```typescript
// ✅ RICHTIG - Alle Lifecycle-Hooks async machen
async onNodeBound(ctx: PluginContext, node: BoundNode): Promise<void> {
  const config = await ctx.config.instance.getForNode(node.id);
  if (config.displayMode !== 'none') {
    await ctx.ui.showOverlay('StatusBadge', { nodeId: node.id });
  }
}
```

---

## Checkliste für IFrame-Plugins

Vor dem Deployment prüfen:

- [ ] Alle Lifecycle-Hooks sind `async`
- [ ] Alle API-Aufrufe verwenden `await`
- [ ] Event-Subscriptions werden als Unsubscribe-Funktionen gespeichert
- [ ] Keine Funktionen werden direkt an APIs übergeben
- [ ] Alle benötigten Permissions sind im Manifest deklariert
- [ ] `onUnload` erwartet `ctx` als Parameter

---

## Template für IFrame-Plugin

```typescript
import type { Plugin, PluginContext, BoundNode, Unsubscribe } from '@3dviewer/plugin-sdk';

// Subscription-Verwaltung
const subscriptions: Unsubscribe[] = [];

const plugin: Plugin = {
  // Async onLoad
  async onLoad(ctx: PluginContext): Promise<void> {
    ctx.log.info('Plugin loaded');

    // Events abonnieren - await verwenden!
    const unsub = await ctx.events.onNodeClick((event) => {
      ctx.log.debug('Click:', event.nodeId);
    });
    subscriptions.push(unsub);

    // State laden - await verwenden!
    const savedData = await ctx.state.get('data', {});
    ctx.log.debug('Loaded data:', savedData);
  },

  // Async onNodeBound
  async onNodeBound(ctx: PluginContext, node: BoundNode): Promise<void> {
    ctx.log.info(`Node bound: ${node.name}`);

    // Config laden - await verwenden!
    const config = await ctx.config.instance.getForNode(node.id);

    // State speichern - await verwenden!
    await ctx.state.set('lastNode', node.id);
  },

  // Async onNodeUnbound
  async onNodeUnbound(ctx: PluginContext, node: BoundNode): Promise<void> {
    ctx.log.info(`Node unbound: ${node.name}`);
  },

  // onUnload mit ctx Parameter
  onUnload(ctx: PluginContext): void {
    ctx.log.info('Plugin unloading');

    // Alle Subscriptions aufräumen
    subscriptions.forEach(unsub => unsub());
    subscriptions.length = 0;
  },
};

export default plugin;
```

---

## Debugging-Tipps

### 1. DataCloneError identifizieren
```
DataCloneError: ... could not be cloned
```
→ Prüfen, ob Funktionen oder Promises an APIs übergeben werden

### 2. Permission denied
```
Error: Permission denied: <api-name>
```
→ Manifest-Permissions prüfen, ggf. `<api>:*` hinzufügen

### 3. Cannot read properties of undefined
```
TypeError: Cannot read properties of undefined (reading 'log')
```
→ Prüfen, ob `ctx` an alle Lifecycle-Hooks übergeben wird

### 4. Promise statt Wert
```
console.log(value)  // Output: [object Promise]
```
→ `await` vergessen - alle API-Aufrufe sind async

---

## Referenzen

- [Plugin API Reference](../llm-context/PLUGIN_API_REFERENCE.md)
- [IframeSandbox Implementation](../../packages/plugin-sdk/src/sandbox/IframeSandbox.ts)
- [Blueprint IFrame Plugin](../../plugins/blueprint-iframe/src/index.ts)
