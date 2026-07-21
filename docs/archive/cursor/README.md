# Cursor Archive

This directory contains historical Cursor project material from the Excelsior-to-Codex migration on 2026-07-21.

Active Codex instructions now live in:

- [`AGENTS.md`](../../../AGENTS.md)
- [`.agents/skills/README.md`](../../../.agents/skills/README.md)
- [`.agents/skills/`](../../../.agents/skills/)

## Coverage Map

| Cursor material | Codex replacement or decision |
|-----------------|-------------------------------|
| `.cursor/skills/ship` | `.agents/skills/ship` |
| `.cursor/skills/add-card` | `.agents/skills/add-card` |
| `.cursor/skills/api-layer-migration` | `.agents/skills/api-layer-migration` |
| `.cursor/skills/start-aws-db-tunnel` | `.agents/skills/start-aws-db-tunnel` |
| `.cursor/skills/start` | Merged into `.agents/skills/start-excelsior` |
| `.cursor/skills/pdf-to-png` | `.agents/skills/pdf-to-png` |
| `.cursor/skills/add-community-deck` | Intentionally skipped; not needed in current Codex workflow |
| `.cursor/skills/add-tournament-deck` | Intentionally skipped; not needed in current Codex workflow |
| `.cursor/rules/*.mdc` | Active rules summarized in `AGENTS.md`; detailed historical copies archived here |
| `.cursor/instructions` and `.cursor/rules.md` | Replaced by `AGENTS.md` and `.agents/skills/README.md` |
| `.cursor/debug-*.log` | Removed during cleanup |

Do not treat files here as active instructions unless a task explicitly asks to inspect historical Cursor behavior.
