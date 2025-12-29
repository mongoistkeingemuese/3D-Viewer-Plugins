# Self-Learning Protocol

This protocol enables agents to improve over time by documenting learnings.

## When to Self-Learn

After completing ANY task, check if you discovered:

1. **New Error Patterns** - Errors that should be checked for
2. **Missing Documentation** - Gaps in agent instructions
3. **Better Approaches** - More efficient ways to do things
4. **Edge Cases** - Scenarios not covered by current rules
5. **False Positives** - Checks that incorrectly flag valid code

## How to Self-Learn

### Step 1: Identify the Learning

Ask yourself:
- Did I encounter something unexpected?
- Did I have to improvise or deviate from instructions?
- Did the user correct me or provide better guidance?
- Did I discover a pattern that should be documented?

### Step 2: Document the Learning

Update the appropriate file:

| Learning Type | Update Location |
|--------------|-----------------|
| Agent-specific | Agent's own `.md` file (Learned Patterns section) |
| Quality rule | `.claude/rules/quality-standards.md` |
| General workflow | `.claude/CLAUDE.md` |
| Common error | `.claude/rules/common-errors.md` |

### Step 3: Format the Update

Use this format for learned patterns:

```markdown
### [Date] - [Brief Title]

**Context:** What situation triggered this learning
**Discovery:** What was learned
**Action:** How to apply this learning
**Added by:** [Agent name] during [task description]
```

## What NOT to Learn

- One-off user preferences (unless they ask to save them)
- Project-specific hacks that don't generalize
- Temporary workarounds for external issues
- Changes that contradict explicit user instructions

## Context7 for Research

When learning about new patterns or verifying best practices, use Context7:

```
What's the current best practice for X in React? use context7
Is this TypeScript pattern still recommended? use context7
```

Document helpful Context7 queries in learned patterns for future reference.
See `.claude/rules/context7.md` for full Context7 documentation.

## Learning Categories

### Error Patterns
Document recurring errors and their fixes:
```markdown
**Error:** `Type 'X' is not assignable to type 'Y'`
**Cause:** Usually happens when...
**Fix:** Cast properly or use type guard
```

### Workflow Improvements
Document better ways to do things:
```markdown
**Old way:** Run commands sequentially
**Better way:** Run independent commands in parallel
**Reason:** Faster execution
```

### Edge Cases
Document scenarios that need special handling:
```markdown
**Scenario:** Plugin has no UI components
**Handling:** Skip UI validation, only check core files
```

## Self-Learning Triggers

Agents should automatically self-learn when:

1. A task takes multiple attempts to complete
2. User provides correction or clarification
3. An unexpected error occurs that wasn't in documentation
4. A workaround is needed for an undocumented scenario
5. The agent discovers a more efficient approach

## Review Cycle

Periodically review learned patterns to:
- Remove outdated learnings
- Consolidate duplicate entries
- Promote important learnings to main documentation
- Archive patterns that are no longer relevant
