# Roblox Toolkit: references and install notes

Installed 22 Nov 2026 with the official `skills` CLI (vercel-labs/skills 1.9.0), using a project-level `--copy` install for Claude Code.
Exact commits are pinned in `/skills-lock.json`.

## Installed sources

| Source | License | Commit | Skills taken |
|---|---|---|---|
| [TabooHarmony/roblox-brain](https://github.com/TabooHarmony/roblox-brain) | MIT | ceee4aa | 25 of 29: core (all), design (all), gameplay (gui, input, animation-vfx, localization, building, physics, audio, npc-ai), tools (studio-mcp, tooling, publish-checklist) |
| [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) | Apache-2.0 | c6ca6c4 | 6 of 80: roblox-simulator-economy, game-feel, game-ui-ux, prototype-fast, puzzle, level-design |

Skipped from roblox-brain because EduQuest doesn't need them yet: `roblox-cloud` (Open Cloud APIs), `roblox-collaboration-mode`, `roblox-camera`, `roblox-lighting`.
Add any of them later with: `npx skills add TabooHarmony/roblox-brain -a claude-code --copy -s <name>`.

## Optional dependency (not installed)

- **Lune 0.11.0** ([lune-org/lune](https://github.com/lune-org/lune)) runs the economy calculator in `roblox-simulator-economy/scripts/` (`lune run scripts/balance.luau`). The skill's guidance works without it. Install it on your own computer (for example with `rokit add lune-org/lune@0.11.0`) if you want the calculator.

## MCP (not configured here, on purpose)

Roblox Studio has a **built-in MCP server** ([docs](https://create.roblox.com/docs/studio/mcp)) that lets Claude read and edit your open place. It runs inside Studio on **your computer**, so it can't connect to a cloud container. To use it, enable it in Studio and add it in Claude Code on your own machine (see the `roblox-studio-mcp` skill). Alternatives: [Roblox/studio-rust-mcp-server](https://github.com/Roblox/studio-rust-mcp-server) (official, standalone) and [boshyxd/robloxstudio-mcp](https://github.com/boshyxd/robloxstudio-mcp) (community).

## Saved as references instead of installed (they duplicate the installed skills)

| Repo | Why it's useful | Why not installed |
|---|---|---|
| [MSayib/roblox-dev-skill](https://github.com/MSayib/roblox-dev-skill) | Single skill, every example type-checked and run in Studio, CI | Overlaps roblox-brain core. Its installer is `curl \| bash`. |
| [nonlooped/roblox-suite](https://github.com/nonlooped/roblox-suite) | 16 API-focused skills with dated official sources | Overlaps roblox-brain core and gameplay |
| [AshExplained/roblox-skills](https://github.com/AshExplained/roblox-skills) | 40 lifecycle skills (PRD → issues, LiveOps roadmap, social systems) | Overlaps roblox-brain design. Its setup rewrites CLAUDE.md and assumes a workflow. |
| [brockmartin/roblox-game-skill](https://github.com/brockmartin/roblox-game-skill) | One big router skill plus 16 reference files | One giant skill; overlaps everything above |
| [SyphoDev-yt/roblox-ai-skills](https://github.com/SyphoDev-yt/roblox-ai-skills) | Asset pipeline (Blender models, VFX, maps) | 164 scripts; needs Blender and setup on your machine |

## Avoided

Several search results were brand-new repos with SEO names like "Best Open-Source Roblox Studio AI Workflow 2026" or "Official MCP Verification Layer". These are a common malware-bait pattern, so none were downloaded.
