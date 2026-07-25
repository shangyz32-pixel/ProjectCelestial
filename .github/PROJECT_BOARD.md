# Project Board — manual setup guide

## Create Board

1. Open https://github.com/shangyz32-pixel/ProjectCelestial/projects
2. Click "New project"
3. Select "Board" layout
4. Name: "Project Celestial"

## Columns

```
📋 Backlog          — Ideas, future features, unprioritized
📥 Ready            — Prioritized, ready to start
🚧 In Progress      — Currently being implemented
👀 Code Review      — PR submitted, awaiting review
🧪 Testing          — Automated + manual verification
🚫 Blocked          — Blocked by dependency/issue
✅ Done             — Merged + verified
```

## Automation (if supported)

- When PR opened → move to "Code Review"
- When PR merged → move to "Done"
- When issue labeled "ready" → move to "Ready"
