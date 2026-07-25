# master → main Migration Plan
Date: 2026-07-25

## Status

DO NOT EXECUTE. Human approval required.

## References to "master"

Search results:
- git branch: `master` (only direct reference)
- `Canon/npcs/npc_master_li/memory.yaml` — "Master Li" character name (NOT a branch reference)
- No other references found in source files

## Migration Steps

### Step 1: Rename local branch
```bash
git branch -m master main
```

### Step 2: Push new branch
```bash
git push -u origin main
```

### Step 3: Update GitHub default branch
Go to: https://github.com/shangyz32-pixel/ProjectCelestial/settings/branches
- Change default branch from `master` to `main`
- Click "Update"

### Step 4: Delete old remote branch
```bash
git push origin --delete master
```

### Step 5: Update local tracking
```bash
git branch --set-upstream-to=origin/main main
git remote set-head origin main
```

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Open PRs targeting master | None | No open PRs exist |
| CI config references | None | No CI exists yet |
| Downstream forks | None | No forks |
| Local clones out of sync | Low | `git fetch --prune` resolves |
| Data loss | None | Branch rename preserves history |

## Rollback

If migration fails:
```bash
git branch -m main master
git push -u origin master
git push origin --delete main
# Revert GitHub default branch to master
```

## Recommendation

✅ SAFE TO MIGRATE. Zero structural references. Zero downstream dependencies.
Risk: minimal. One git command + one GitHub settings change.

**Awaiting human approval.**
