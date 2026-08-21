# CALIBER

Industry design system for **watch brand and boutique websites**. Deep **Ink** ground, **Instrument Sans** type, **Champagne** accent with **Sapphire** support, precise **3px** radius, and **web-ready product photography** (space · material · object). Built for brand sites, model pages, boutique catalogs, and pitch decks — not abstract aesthetic demos.

## How to use this

1. **CSS** — link the stylesheet:
   ```html
   <link rel="stylesheet" href="styles.css">
   ```
2. **Variables** — use tokens, never hardcode:
   - Colors: `var(--color-*)`
   - Fonts: `var(--font-heading)`, `var(--font-body)`
   - Spacing: `var(--space-1)` … `var(--space-8)`
   - Radius: `var(--radius)` (`3px`)
   - Shadows: `var(--shadow-1|2|3)`
3. **Markup** — build with the provided classes (`.btn`, `.card`, `.badge`, `.specs`, `.nav`, …). Prefer extending over inventing new primitives.
4. **Templates** — start from `templates/landing` (Atelier Meridian brand site) or `templates/deck` (boutique / collection deck).
5. **Theme control** — the whole system derives from `theme.json`. Edit the token block at the top of `styles.css` (or regenerate from `theme.json`) and every page follows.
6. **Imagery** — use `assets/imagery/` samples and follow `foundations/imagery.md`. Photos stay in **full color**.

## Direction

- One industry: **Watches / horology**
- Precision dark UI, tight radius, hairline rules
- Champagne for primary actions; Sapphire for secondary depth; Steel for muted voice
- Photography is website-ready watch imagery — Space / Material / Object
- Components ship with **states** (hover / focus / disabled / error) and industry patterns (collection nav, model cards, movement chips, discover CTA)

## Package map

```
caliber/
├── README.md
├── theme.json                 # token + industry brief
├── theme.html                 # rendered theme sheet
├── styles.css                 # single stylesheet
├── foundations/
│   ├── color.md
│   ├── typography.md
│   ├── spacing.md
│   ├── imagery.md
│   └── patterns.md
├── components/                # HTML specimens with states
├── templates/
│   ├── landing/               # Atelier Meridian watch brand site
│   └── deck/                  # boutique / collection deck
└── assets/imagery/            # Space / Material / Object samples
```

## Tokens at a glance

| Role | Name | Hex |
|------|------|-----|
| bg | Ink | `#0A0B0D` |
| text | Bone | `#EDE8DF` |
| secondary | Steel | `#8E9499` |
| accent | Champagne | `#C4A35A` |
| tertiary | Sapphire | `#1E3A5F` |

Type: **Instrument Sans** · Radius: **3px** · Version: **1.0.1**
