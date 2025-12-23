# Parallelization Rules

Safe parallel execution of agents and tasks.

## Agent Dependency Graph

```
                    ┌─────────────┐
                    │    init     │
                    │  (setup)    │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ new-plugin │  │  quality-  │  │   other    │
    │  (create)  │  │   check    │  │   tasks    │
    └─────┬──────┘  └──────┬─────┘  └────────────┘
          │                │
          │                │ BLOCKS
          │                ▼
          │         ┌────────────┐
          └────────►│   deploy   │
                    │ (release)  │
                    └────────────┘
```

## Parallelization Matrix

| Agent A | Agent B | Parallel Safe? | Notes |
|---------|---------|----------------|-------|
| init | * | NO | Must complete first |
| new-plugin | new-plugin | NO | Same plugin name conflict |
| new-plugin | quality-check | YES | Different concerns |
| quality-check | quality-check | YES | Read-only operations |
| quality-check | deploy | NO | Quality must pass first |
| deploy | deploy | NO | Git conflicts |
| deploy | new-plugin | YES | Different plugins |

## Execution Modes

### Sequential (Default)
```
Task A → Task B → Task C
```
Use when tasks have dependencies or modify shared resources.

### Parallel
```
Task A ─┐
Task B ─┼→ Wait All → Continue
Task C ─┘
```
Use when tasks are independent and read-only or modify different files.

### Pipeline
```
Task A → Task B (uses A's output) → Task C (uses B's output)
```
Use when each task's output feeds the next.

## Resource Locking

### Exclusive Resources (ONE writer at a time)

| Resource | Lock Type | Holders |
|----------|-----------|---------|
| `plugins/<name>/` | Plugin Lock | new-plugin, deploy |
| `package.json` | Root Lock | init |
| `package-lock.json` | Root Lock | init |
| `.git/` | Git Lock | deploy |
| Git tags | Git Lock | deploy |

### Shared Resources (Multiple readers OK)

| Resource | Access Type |
|----------|-------------|
| `packages/plugin-sdk/` | Read |
| `docs/` | Read |
| `.claude/rules/` | Read (Write for self-learning) |
| `.claude/agents/` | Read (Write for self-learning) |

## Safe Parallel Patterns

### Pattern 1: Independent Plugin Operations

```
# SAFE - Different plugins
┌─────────────────────┐     ┌─────────────────────┐
│ new-plugin: foo     │     │ quality-check: bar  │
│ → plugins/foo/      │     │ → plugins/bar/      │
└─────────────────────┘     └─────────────────────┘
         │                           │
         └───────────┬───────────────┘
                     ▼
              Both complete
```

### Pattern 2: Read-Only Analysis

```
# SAFE - All read-only
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ typecheck    │  │ lint         │  │ test         │
└──────────────┘  └──────────────┘  └──────────────┘
        │                │                 │
        └────────────────┼─────────────────┘
                         ▼
                  All must pass
```

### Pattern 3: Sequential with Gates

```
# REQUIRED - Deploy depends on quality
┌──────────────┐      ┌──────────────┐
│ quality-     │ PASS │    deploy    │
│ check        │─────►│              │
└──────────────┘      └──────────────┘
        │ FAIL
        ▼
    STOP (no deploy)
```

## Agent Annotations

Each agent should declare its parallelization characteristics:

```yaml
---
name: agent-name
parallel:
  mode: independent | requires | blocks
  requires: [list of agents that must complete first]
  blocks: [list of agents that cannot run while this runs]
  resources:
    exclusive: [list of exclusive resources]
    shared: [list of shared resources]
---
```

## Conflict Resolution

### Git Conflicts
If two agents try to commit simultaneously:
1. First agent wins
2. Second agent must pull and retry
3. Max 3 retries before failing

### File Conflicts
If two agents modify the same file:
1. Detect conflict before starting
2. Queue second agent
3. Or: Fail fast with clear error

### Resource Starvation
If an agent holds a lock too long:
1. Timeout after 5 minutes
2. Force release lock
3. Notify user of stuck agent

## Implementation for Agents

### Agent Header Update

Add to each agent's frontmatter:

```yaml
---
name: deploy
parallel:
  mode: blocks
  requires: [quality-check]
  blocks: [deploy]
  resources:
    exclusive: [git, plugins/<target>]
    shared: [packages/plugin-sdk]
---
```

### Pre-Execution Check

Each agent should:
1. Check if required agents have completed
2. Acquire locks for exclusive resources
3. Verify no blocking agents are running
4. Proceed only if all checks pass

### Post-Execution Cleanup

Each agent should:
1. Release all held locks
2. Update self-learning sections
3. Report completion status
4. Trigger dependent agents if configured

## Task Queue Example

```
User Request: "Create plugin foo, run quality check, and deploy"

Queue Analysis:
1. new-plugin:foo     - no dependencies, can start
2. quality-check:foo  - requires new-plugin:foo complete
3. deploy:foo         - requires quality-check:foo pass

Execution Plan:
┌─────────────────┐
│ new-plugin:foo  │ ← Start immediately
└────────┬────────┘
         │ complete
         ▼
┌─────────────────┐
│ quality-check   │ ← Start after new-plugin
└────────┬────────┘
         │ pass
         ▼
┌─────────────────┐
│ deploy:foo      │ ← Start after quality passes
└─────────────────┘
```

## Error Handling

### Dependency Failure
```
If quality-check FAILS:
  → deploy is CANCELLED (not failed)
  → User notified: "Deploy cancelled - quality check failed"
```

### Timeout
```
If agent runs > 10 minutes:
  → Force timeout
  → Release locks
  → Mark as TIMEOUT
  → Notify user
```

### Deadlock Detection
```
If Agent A waits for B, and B waits for A:
  → Detect cycle
  → Abort newer agent
  → Notify user of deadlock
```

## Task Decomposition

### Complex Request Analysis

When receiving a complex user request, decompose into atomic tasks:

**Example Request:** "Create plugins sensor-monitor and alarm-handler, test both, deploy sensor-monitor"

**Decomposition:**
```
1. Identify atomic tasks:
   - new-plugin:sensor-monitor
   - new-plugin:alarm-handler
   - quality-check:sensor-monitor
   - quality-check:alarm-handler
   - deploy:sensor-monitor

2. Build dependency graph:
   new-plugin:sensor-monitor ──┬──► quality-check:sensor-monitor ──► deploy:sensor-monitor
                               │
   new-plugin:alarm-handler ───┴──► quality-check:alarm-handler

3. Identify parallel groups:
   Group 1 (parallel): [new-plugin:sensor-monitor, new-plugin:alarm-handler]
   Group 2 (parallel): [quality-check:sensor-monitor, quality-check:alarm-handler]
   Group 3 (sequential): [deploy:sensor-monitor]

4. Execute:
   Phase 1: Run Group 1 in parallel
   Phase 2: Wait for Group 1, then run Group 2 in parallel
   Phase 3: Wait for quality-check:sensor-monitor, then run deploy
```

### Decomposition Rules

1. **Identify Resources:** What files/directories does each task touch?
2. **Check Conflicts:** Do any tasks write to same resource?
3. **Build Graph:** Create dependency edges based on conflicts
4. **Find Parallel Groups:** Tasks with no edges between them can parallelize
5. **Order Groups:** Topological sort of groups

### Task Types

| Type | Parallelizable | Notes |
|------|----------------|-------|
| Create | Per-plugin | Different plugins: YES |
| Read/Analyze | Always | Multiple readers OK |
| Build | Careful | Shared artifacts may conflict |
| Test | Usually | Unless modifying test fixtures |
| Deploy | Never | Git is sequential |

### Abort Conditions

Stop entire workflow if:
- Critical task fails (quality-check before deploy)
- Resource conflict detected mid-execution
- User cancels
- Timeout exceeded

Continue despite failure if:
- Non-critical parallel task fails (can report partial success)
- Task marked as `optional: true`

### Progress Reporting

During parallel execution, report:
```
[====    ] 50% - Running 2 tasks in parallel
  ├─ [DONE] new-plugin:sensor-monitor
  ├─ [RUN ] new-plugin:alarm-handler (45s)
  └─ [WAIT] quality-check:* (waiting for plugins)
```

### Batch Operations

For batch operations on multiple plugins:

```
User: "Deploy all changed plugins"

1. Identify changed plugins: [foo, bar, baz]
2. Run quality-check in parallel: [qc:foo, qc:bar, qc:baz]
3. Wait for all to pass
4. Deploy sequentially: foo → bar → baz (git commits)
```
