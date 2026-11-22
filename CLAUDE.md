# Roblox Game Development Toolkit

This repo is Kenji's portfolio site plus planning for **EduQuest**, a Roblox learning-adventure game.
Design research is in `research/README.md`. The toolkit's references and install notes are in `.claude/references/roblox-toolkit.md`.

## Installed skills (`.claude/skills/`)

Pick the skill by task. Skills load on demand.

| Task | Skill |
|---|---|
| Luau language, idioms, types | `roblox-luau-core`, `roblox-luau-patterns`, `roblox-luau-types` |
| Project structure, client/server split | `roblox-architecture` |
| Remotes, replication | `roblox-networking` |
| Anti-exploit, server authority | `roblox-security` |
| Saving player data | `roblox-data`, `roblox-server-data` |
| Performance / memory / mobile FPS | `roblox-performance` |
| Core loop, FTUE, levels, economy design | `roblox-game-design` |
| Retention psychology, rewards, streaks, pricing ethics | `roblox-player-psychology` |
| Stats, discovery, LiveOps, A/B tests | `roblox-growth-design` |
| Game passes, dev products, ProcessReceipt | `roblox-monetization` |
| Analytics events, funnels | `roblox-analytics` |
| Cost curves, income, rebirth math (balancing) | `roblox-simulator-economy` |
| Roblox GUI implementation | `roblox-gui` (engine-neutral rules: `game-ui-ux`) |
| Juice: screen shake, hit-stop, tweens | `game-feel`, plus `roblox-animation-vfx` and `roblox-audio` |
| Input, localization (EN/ID), building, physics, NPCs | `roblox-input`, `roblox-localization`, `roblox-building`, `roblox-physics`, `roblox-npc-ai` |
| Fast "is it fun?" prototype | `prototype-fast` |
| Logic and grid puzzles (EduQuest Logic Lab) | `puzzle` |
| Level layout, gating, pacing | `level-design` |
| Studio MCP, Rojo and tooling, release checks | `roblox-studio-mcp`, `roblox-tooling`, `roblox-publish-checklist` |

**Name mapping:** the gamedev-skills skills mention sibling skills that are not installed. Use these instead:
`roblox-luau` → `roblox-luau-core` · `roblox-ui` → `roblox-gui` · `roblox-datastores` → `roblox-data` · `roblox-studio-workflow` → `roblox-tooling` / `roblox-studio-mcp`.

**Kid-safe rule for EduQuest:** learning content stays free. No loot boxes, no fake urgency, no pay-to-win.

**Updating:** `npx skills update -p` (sources and commits are pinned in `skills-lock.json`).
