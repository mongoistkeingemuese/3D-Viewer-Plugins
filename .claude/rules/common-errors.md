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

(none yet - agents will add discovered patterns here)
