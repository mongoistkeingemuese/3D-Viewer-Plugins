# Common Errors

This file documents recurring errors and their solutions. Auto-updated by agents.

## TypeScript Errors

### TS2322: Type 'X' is not assignable to type 'Y'
**Cause:** Incorrect type usage
**Fix:** Check SDK types, use proper casting or type guards

### TS7006: Parameter implicitly has 'any' type
**Cause:** Missing type annotation
**Fix:** Add explicit type from `@3dviewer/plugin-sdk`

### TS2339: Property does not exist on type
**Cause:** Accessing undefined property
**Fix:** Check if property exists in type definition, use optional chaining

---

## Build Errors

### Module not found
**Cause:** Missing dependency or incorrect import path
**Fix:**
1. Check if package is in dependencies
2. Verify import path (relative vs absolute)
3. Run `npm install`

### Cannot find module '@3dviewer/plugin-sdk'
**Cause:** SDK not built or linked
**Fix:** Run `npm run build:sdk` first

---

## Runtime Errors

### ctx.mqtt is undefined
**Cause:** Plugin doesn't have mqtt permission
**Fix:** Add `"mqtt:subscribe"` and/or `"mqtt:publish"` to manifest permissions

### Cannot read properties of undefined
**Cause:** Node or config not initialized
**Fix:** Add null checks, use optional chaining (`?.`)

---

## Manifest Errors

### Invalid manifest: missing required field
**Cause:** Manifest JSON incomplete
**Fix:** Check required fields: id, name, version, entryPoint, permissions

### Permission denied for operation
**Cause:** Missing permission in manifest
**Fix:** Add required permission to `permissions` array

---

## Deployment Errors

### jsDelivr returns 404
**Cause:** Tag not pushed or wrong path
**Fix:**
1. Verify tag exists: `git tag -l`
2. Push tag: `git push origin <tag>`
3. Wait 1-2 minutes for CDN propagation
4. Check exact path in URL

### Version mismatch
**Cause:** manifest.json and package.json have different versions
**Fix:** Sync versions in both files before commit

---

## Agent-Discovered Errors

<!-- This section is auto-updated by agents -->

### Global Error Acknowledgment Has No Effect on Plugin
**Date:** 2024-12-29
**Context:** Valve plugin error state not reset by 3D Viewer global acknowledgment
**Cause:** Global error acknowledgment in the 3D Viewer does NOT trigger `ctx.events.onLogAcknowledged()`. The event only fires for per-entry acknowledgments with matching `nodeId`.
**Fix:** Plugins must provide their own UI for error acknowledgment (e.g., "Acknowledge All" button in plugin popup). The valve plugin implements this via `acknowledgeAllErrors()` function.
**Prevention:** Always implement plugin-level error acknowledgment UI. Do not rely on global Viewer acknowledgment for plugin error states.

### Duplicate Error Logs When Multiple Nodes Bound to Plugin
**Date:** 2024-12-30
**Context:** Plugin error messages appear N times in Diagnostics Log (N = number of bound nodes)
**Cause:** MQTT subscriptions for global topics (like error topics) were created per-node in `onNodeBound` via `setupSubscriptions()`. Each subscription receives the same message, resulting in N log entries.
**Fix:** Separate global subscriptions (error topics) from per-node subscriptions (valve data topics):
- Global subscriptions: Create ONCE in `onLoad` using `setupGlobalErrorSubscription()`
- Per-node subscriptions: Create in `onNodeBound` for node-specific data filtering
**Prevention:**
- Global topics (errors, status, etc.): Subscribe ONCE in `onLoad`, store unsubscribe in `PluginState`
- Per-node topics (node-specific data): Subscribe in `onNodeBound`, filter by node identifier
- Use `pluginState.hasErrorSubscription()` guard to prevent duplicate subscriptions
