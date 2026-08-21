# Color

CALIBER uses a dark **Ink** ground with **Bone** text, **Steel** muted voice, **Champagne** accent, and **Sapphire** depth.

## Roles

| Token | Name | Hex | Use |
|-------|------|-----|-----|
| `--color-bg` | Ink | `#0A0B0D` | Page ground |
| `--color-surface` | Surface | `#14161A` | Cards, panels |
| `--color-text` | Bone | `#EDE8DF` | Primary type |
| `--color-muted` / `--color-secondary` | Steel | `#8E9499` | Secondary type |
| `--color-accent` | Champagne | `#C4A35A` | Primary actions, marks |
| `--color-tertiary` | Sapphire | `#1E3A5F` | Depth, chips, info |
| `--color-divider` | Divider | `#24282E` | Hairlines |

## Rules

- Prefer semantic roles over raw hex in components.
- Champagne is scarce — one primary mark per view.
- Sapphire supports chips, info states, and quiet depth — not neon.
- Keep contrast AA+ on Bone/Ink and Champagne-on-Ink CTAs.
