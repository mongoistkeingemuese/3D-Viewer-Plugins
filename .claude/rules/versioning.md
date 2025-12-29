# Versioning Rules

## Version Format

All versions use **Semantic Versioning** (semver): `MAJOR.MINOR.PATCH`

| Part | When to Increment | Example |
|------|-------------------|---------|
| MAJOR | Breaking changes | `1.0.0` → `2.0.0` |
| MINOR | New features (backward compatible) | `1.0.0` → `1.1.0` |
| PATCH | Bug fixes | `1.0.0` → `1.0.1` |

## Version Locations

Each plugin has **TWO** version locations that MUST be synchronized:

```
plugins/<name>/
├── manifest.json    →  "version": "1.2.3"
├── package.json     →  "version": "1.2.3"
└── dist/            →  built artifacts
```

## Git Tags

Git tags use the format `vX.Y.Z` (with `v` prefix):

| File Version | Git Tag |
|--------------|---------|
| `1.0.0` | `v1.0.0` |
| `1.2.3` | `v1.2.3` |

**Important:** The git tag applies to the ENTIRE monorepo, not individual plugins.

## jsDelivr CDN URLs

jsDelivr uses the git tag for versioning:

```
https://cdn.jsdelivr.net/gh/mongoistkeingemuese/3D-Viewer-Plugins@v1.2.3/plugins/<name>/dist/
```

## Version Sync Checklist

Before deploying, verify:

| Location | Format | Example |
|----------|--------|---------|
| `manifest.json` | `"version": "X.Y.Z"` | `"version": "1.2.3"` |
| `package.json` | `"version": "X.Y.Z"` | `"version": "1.2.3"` |
| Git tag | `vX.Y.Z` | `v1.2.3` |

## Multi-Plugin Releases

When releasing multiple plugins:
- Use a single git tag for the release
- Update versions in ALL changed plugins
- Commit message should list all plugins

Example:
```
release(axis-release-10, blueprint-sandbox): v1.2.3

- axis-release-10: MQTT debugging improvements
- blueprint-sandbox: Minor UI fixes
```

## Version History

To check existing versions:

```bash
# List all tags
git tag -l "v*" --sort=-v:refname

# Check plugin version
jq '.version' plugins/<name>/manifest.json

# Compare manifest and package versions
for p in plugins/*/; do
  name=$(basename $p)
  m=$(jq -r '.version' $p/manifest.json 2>/dev/null || echo "N/A")
  pkg=$(jq -r '.version' $p/package.json 2>/dev/null || echo "N/A")
  echo "$name: manifest=$m package=$pkg"
done
```

## Versioning Strategy

This monorepo uses **two versioning approaches** that are BOTH updated on every deploy:

### 1. Plugin Version (Minor Bump - MANDATORY)
- Each plugin has its own version in `manifest.json` and `package.json`
- **MUST be bumped (minor) on EVERY deploy** - `1.5.1` → `1.6.0`
- Without this, users won't see the update in the 3D Viewer

### 2. Monorepo Tag (Patch Bump - MANDATORY)
- Tags like `v1.5.2` represent releases to jsDelivr CDN
- **MUST be created on EVERY deploy** - `v1.5.1` → `v1.5.2`
- Without this, jsDelivr returns cached (old) content

### Why Both Are Required

**jsDelivr CDN caches aggressively by tag:**
- Same tag = same content forever (even if you push new commits)
- New tag = fresh content from GitHub

**Plugin version identifies the release:**
- Users see this version in 3D Viewer plugin settings
- Must change so users know an update is available

### Example Deploy Flow
```
Before Deploy:
├── Latest tag:        v1.5.1
├── valve manifest:    1.5.0
└── valve package:     1.5.0

After Deploy:
├── New tag:           v1.5.2  (patch bump)
├── valve manifest:    1.6.0   (minor bump)
└── valve package:     1.6.0   (minor bump)
```

### CRITICAL: Never Deploy Without Version Bumps

If you deploy without bumping versions:
1. jsDelivr serves old cached content (tag unchanged)
2. Users cannot install the new version (plugin version unchanged)
3. **The deploy is effectively useless**

## Current Versions

<!-- Auto-updated by deploy agent -->

| Component | Version |
|-----------|---------|
| **Monorepo (latest tag)** | v1.1.0 |
| plugin-sdk | 1.1.0 |
| plugin-devtools | 1.0.0 |
| axis-release-10 | 1.0.8 |
| blueprint-sandbox | 1.0.0 |
| blueprint-iframe | 1.0.0 |

---

## Common Mistakes

### Version Mismatch
**Error:** manifest.json and package.json have different versions
**Fix:** Always update both files together

### Missing v Prefix
**Error:** Tag `1.2.3` instead of `v1.2.3`
**Fix:** Use `git tag v1.2.3` (with v prefix)

### Forgot to Push Tag
**Error:** jsDelivr returns 404
**Fix:** `git push origin v1.2.3`
