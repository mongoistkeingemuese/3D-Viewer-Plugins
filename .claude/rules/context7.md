# Context7 Integration

Context7 provides up-to-date documentation for libraries and frameworks directly in prompts.

## When to Use Context7

Use the phrase **"use context7"** when you need:

1. **Current API Documentation** - React 19, TypeScript 5.x, Vite, etc.
2. **Library-Specific Patterns** - Correct usage of external dependencies
3. **Version-Specific Features** - Features that may have changed since training cutoff
4. **Migration Guidance** - When upgrading dependencies

## Usage Pattern

Add "use context7" to your request:

```
How do I use React 19's use() hook? use context7
```

```
What's the correct way to configure Vite for a library build? use context7
```

## Common Use Cases in This Project

### Plugin Development

```
How do I create a React component with TypeScript strict mode? use context7
```

```
What's the proper way to use Map with TypeScript generics? use context7
```

### Build Tools

```
How do I configure esbuild for a browser target? use context7
```

```
What are the Vite library mode options? use context7
```

### Testing

```
How do I mock modules in Vitest? use context7
```

```
What's the latest Vitest assertion syntax? use context7
```

## Libraries Relevant to This Project

| Library | Context7 ID | Use For |
|---------|-------------|---------|
| React | `/facebook/react` | UI components |
| TypeScript | `/microsoft/typescript` | Type definitions |
| Vite | `/vitejs/vite` | Build configuration |
| Vitest | `/vitest-dev/vitest` | Testing |
| esbuild | `/evanw/esbuild` | Bundling |

## Agent Integration

### new-plugin Agent

When generating React components or TypeScript code, consider using Context7 for:
- Current React patterns (hooks, context, etc.)
- TypeScript best practices
- Component library patterns

### quality-check Agent

When validating code, Context7 can help verify:
- Current ESLint rule configurations
- TypeScript strict mode requirements
- Testing library best practices

## Best Practices

1. **Be Specific** - Request documentation for specific features, not entire libraries
2. **Include Version** - If version matters, include it: "React 19" not just "React"
3. **Context Matters** - Add project context: "for a Vite-based plugin system"

## Limitations

- Requires network access to Context7 MCP server
- May not have documentation for very new or obscure libraries
- Focus on popular, well-documented libraries for best results

## MCP Server Setup

Context7 is available as an MCP server. To enable:

```bash
# Via Claude Code CLI
claude mcp add context7 -- npx -y @upstash/context7-mcp

# Or via HTTP
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```

## Self-Learning

When Context7 provides helpful documentation:
- Note which libraries were most useful
- Document common queries that work well
- Add library-specific patterns to templates

---

## Context7 Query Examples for This Project

### React Component with TypeScript

```
I need to create a React functional component that:
- Uses TypeScript strict mode
- Accepts props interface
- Has proper cleanup in useEffect
use context7
```

### MQTT Subscription Pattern

```
What's the correct pattern for managing subscriptions in React with cleanup?
use context7
```

### Build Configuration

```
How do I configure Vite to build a library that:
- Exports TypeScript types
- Bundles React as external
- Supports both ESM and CJS
use context7
```
