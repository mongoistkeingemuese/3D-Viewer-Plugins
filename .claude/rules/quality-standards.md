# Quality Standards

These rules apply to ALL code changes in this repository.

## Mandatory Checks Before Commit

Every code change MUST pass:

1. **TypeScript** - `npm run typecheck` must pass
2. **Tests** - `npm test -- --run` must pass
3. **Build** - `npm run build` must pass

## Code Quality Rules

### Forbidden Patterns

| Pattern | Reason | Alternative |
|---------|--------|-------------|
| `: any` | Defeats TypeScript safety | Use proper types from SDK |
| `@ts-ignore` | Hides real problems | Fix the type issue |
| `console.log` | Not visible in production | Use `ctx.log.*` |
| `// TODO` without issue | Lost and forgotten | Create GitHub issue |

### Required Patterns

| Pattern | Where | Why |
|---------|-------|-----|
| `Map<string, Unsubscribe[]>` | Every plugin | Track subscriptions |
| Cleanup in `onNodeUnbound` | Every plugin | Prevent memory leaks |
| Cleanup in `onUnload` | Every plugin | Clean shutdown |
| `try/catch` around async | All async code | Handle errors gracefully |
| `ctx.log.error` on catch | All catch blocks | Visible error tracking |

## Plugin-Specific Rules

### Manifest Requirements

- `id`: Must be reverse-domain format (`com.company.plugin-name`)
- `version`: Must be valid semver (`X.Y.Z`)
- `permissions`: Must match actual API usage (no unused permissions)
- `entryPoint`: Must point to existing built file

### Version Synchronization

These files MUST have matching versions:
- `plugins/<name>/manifest.json` → `version`
- `plugins/<name>/package.json` → `version`
- Git tag (on deploy) → `vX.Y.Z`

## Deployment Rules

1. **Never deploy without quality checks** - Use `deploy` agent
2. **Never force push to main** - History must be preserved
3. **Always tag releases** - For jsDelivr CDN versioning
4. **Verify CDN access** - Check URL returns 200 after deploy

## Self-Learning

When you encounter:
- A new error pattern → Add to quality-check agent
- A missing rule → Add to this file
- A false positive → Document exception

This keeps our quality standards evolving and accurate.
