# VELMONT Horlogerie — Website Delivery State

```yaml
task_id: velmont-horlogerie-landing-20260730
integration_owner: root
repository: Mdx2025/VelmontHorlogerieMDX
branch: main
target_route: /
site_name: VELMONT Horlogerie
current_phase: deployed
primary_style_pack: Cinematic Editorial (dark/ivory dual theme)
visual_thesis: "A watchmaking atelier presented as a couture-grade editorial experience."
reference_sources:
  - Supplied 21s walkthrough video (1920x1080 @ 60fps), analyzed to frames + REFERENCE_MAP.md
quality_contract:
  target: WCAG 2.2 AA
  typography_floor: "12px supplementary UI; 14px compact body; 16px normal body"
  contrast: "4.5:1 normal text; 3:1 large text and UI components"
  viewports: [360x800, 390x844, 768x1024, 1024x768, 1280x800, 1440x900, 1920x1080, 2560x1440]
  interaction: "keyboard, visible focus, reduced motion, pointer and touch alternatives"
locked_decisions:
  - "Brand is fictional VELMONT Horlogerie (haute horlogerie); no sales, orders, or real-presence claims."
  - "ONE continuous scrolling landing page: Home -> Collections -> Atelier -> Hands -> Banner -> Crafted -> Campaign -> Footer (client feedback 2026-07-31: no click-through between views)."
  - "Header nav uses anchor scrolling with scroll-margin; header theme (ink/ivory) auto-adapts per section via IntersectionObserver."
  - "Hero giant words use Bodoni Moda outline (text-stroke); footer word PRECISION at ~73% viewport width."
  - "Hero mini-cards anchor-scroll to their section (atelier from home, campaign from atelier)."
  - "Giant outline words shrink-to-fit via measured scale so they never overflow narrow viewports."
  - "All imagery is original generated editorial photography, served locally as WebP."
  - "Fonts self-hosted (Bodoni Moda + Inter variable latin subsets)."
completed:
  - "Full video analysis (5 passes) and REFERENCE_MAP.md authored."
  - "18 image assets generated, reviewed via contact sheet, converted to WebP (1.3MB total)."
  - "SvelteKit + Tailwind 4 + GSAP implementation of all three views and roll transitions."
  - "svelte-check 0/0, node tests 4/4, production build PASS."
  - "Playwright 1920x1080 capture at 13 checkpoints; side-by-side comparison vs 8 reference keyframes at ~90-95% fidelity."
  - "Hero roll carousel, page roll transition, campaign auto-slider, reveals, and parallax verified live."
  - "Responsive overflow audit PASS at 8 viewports; reduced-motion audit PASS (no auto-rotation)."
  - "Single-page refactor: roll router removed; all views render as stacked sections (2026-07-31)."
  - "Header theme observer fix: paper sections (atelier..crafted) flip header to ink (2026-07-31)."
  - "Mobile 390px pass: nav fits without clipping; hero word lifted above mini-card; word fit-scale (2026-07-31)."
next_exact_action: "Commit single-page refactor, push main, Dokploy redeploy, smoke-verify production."
blockers: []
highest_risk_selectors:
  - ".outline-word"
  - ".hero-word"
  - ".mini-card"
  - ".collections-grid"
  - ".hands-grid"
  - ".campaign-stage"
validation_evidence:
  reference_video: "inbound 2026-07-30_20-05-24 mp4, md5 771415e1b9244792e27b0a17c44367ec"
  local_validate: "svelte-check 0 errors; node --test 4/4 pass; vite build done"
  footer_word_width: "73.0% of viewport at 1920x1080"
  production_url: "https://velmont.apps.mdxpreview.xyz/"
  deployed_commit: "cb8fd95"
  dokploy_status: "live — bidirectional motion verified in prod 2026-07-31"
```
