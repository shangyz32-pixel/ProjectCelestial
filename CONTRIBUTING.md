# Contributing to Project Celestial

## Architecture Freeze

Project Celestial v1.0.0 is Architecture Frozen.
Do NOT redesign runtime, kernel, or simulation without ADR + human approval.

## Development Flow

1. All work happens on `develop` or feature branches
2. `main` is protected — PR + CI required
3. Never push directly to `main`

## Branch Naming

```
feature/description    — New features
fix/description        — Bug fixes
release/vX.Y.Z         — Release preparation
hotfix/description     — Emergency fixes
```

## Commit Convention

```
type(scope): description

Types: feat, fix, refactor, docs, test, chore, perf
Scope: runtime, simulation, web, gameplay, kernel

Example: feat(gameplay): add breakthrough decision mechanic
```

## Quality Gates

Every commit/push must pass:
- Replay verification
- Snapshot consistency
- World Hash match
- No regression increase
- Performance acceptable

## Pull Requests

- One feature = one PR
- Include test results
- Include verification output
- Wait for human approval
- Squash merge preferred

## Testing

Every implementation must include:
- Unit tests
- Integration tests
- Replay tests
- Snapshot tests

See `runtime/tests/` for examples.
