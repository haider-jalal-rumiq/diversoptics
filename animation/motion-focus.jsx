import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

const CSS = String.raw`
.mf-stage{height:100dvh}
.mf-stage{display:flex;align-items:center;justify-content:center;width:100%;height:100%;overflow:hidden}
.mf-viewport{--mf-card-height:calc(var(--mf-width) * 4 / 3);position:relative;box-sizing:border-box;width:100%;height:calc(var(--mf-card-height) + var(--mf-pad) * 2);overflow:hidden;background:transparent;mask-image:linear-gradient(to right,transparent 0,#000 var(--mf-fade),#000 calc(100% - var(--mf-fade)),transparent 100%)}
.mf-track{position:absolute;inset:var(--mf-pad) 0;margin:0;padding:0}
.mf-card{position:absolute;top:0;left:0;box-sizing:border-box;width:var(--mf-width);height:var(--mf-card-height);margin:0;border-radius:var(--mf-radius);overflow:hidden;background:#111;transform-origin:50% 50%;will-change:transform}
.mf-media{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover}
.mf-card::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgb(9 9 9 / 18%),transparent 31%),linear-gradient(0deg,rgb(9 9 9 / 34%),transparent 38%)}
@media (prefers-reduced-motion: reduce){.mf-card{will-change:auto}}
`;

export default function MotionFocus() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (!document.querySelector('style[data-motion-focus]')) {
      const tag = document.createElement('style');
      tag.setAttribute('data-motion-focus', '');
      tag.textContent = CSS;
      document.head.append(tag);
    }
    const node = root.current;
    const __q = (sel) => (node.matches(sel) ? node : node.querySelector(sel));
    /**
     * Motion Focus — a stepped carousel whose centre card grows while the deck
     * advances one role per cycle. Translation and scale are the only animated
     * properties, matching the source component and keeping the loop cheap.
     */

    /** Newton-refined cubic-bezier, so no CustomEase plugin is required. */
    function cubicBezier([x1, y1, x2, y2]) {
      const cx = 3 * x1;
      const bx = 3 * (x2 - x1) - cx;
      const ax = 1 - cx - bx;
      const cy = 3 * y1;
      const by = 3 * (y2 - y1) - cy;
      const ay = 1 - cy - by;

      const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
      const slopeX = (t) => (3 * ax * t + 2 * bx) * t + cx;

      return (x) => {
        if (x <= 0) return 0;
        if (x >= 1) return 1;

        let t = x;
        for (let i = 0; i < 6; i += 1) {
          const dx = sampleX(t) - x;
          if (Math.abs(dx) < 1e-6) break;
          const d = slopeX(t);
          if (Math.abs(d) < 1e-6) break;
          t -= dx / d;
        }
        return ((ay * t + by) * t + cy) * t;
      };
    }

    const mod = (n, m) => ((n % m) + m) % m;

    /** Fully visible cards, one bleeding at each edge and one wrap slot. */
    function focusSlots(viewportWidth, cardWidth, gap) {
      const full = Math.max(1, Math.floor((viewportWidth + gap) / (cardWidth + gap)));
      return full + 3;
    }

    function fillFocusTrack(root, images, config) {
      const track = root.querySelector('.mf-track');
      if (!track) return;
      const deck = images.filter(Boolean);
      if (!deck.length) {
        track.replaceChildren();
        return;
      }

      const width = root.clientWidth || (config.cardWidth + config.gap) * 3;
      const slots = Math.max(deck.length, focusSlots(width, config.cardWidth, config.gap));
      track.innerHTML = Array.from({ length: slots }, (_, index) => {
        const src = String(deck[index % deck.length])
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;');
        return `<figure class="mf-card" data-slot="${index % deck.length}"><img class="mf-media" src="${src}" alt="" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async"></figure>`;
      }).join('');
    }

    function buildMotionFocus(gsap, root, config) {
      const cards = [...root.querySelectorAll('.mf-card')];
      if (!cards.length) return null;

      const pitch = config.cardWidth + config.gap;
      const slots = cards.length;
      const width = root.clientWidth || pitch * 3;
      const full = Math.max(1, Math.floor((width + config.gap) / pitch));
      const margin = (width - (full * pitch - config.gap)) / 2;
      const centerSlot = Math.floor(full / 2) + 1;
      const scaleFor = (slot) => (slot === centerSlot ? 1.44 : 1);
      const zFor = (slot) => (slot === centerSlot ? 2 : 1);
      const restX = (slot) => margin + (slot - 1) * pitch;
      const rightward = config.direction === 'right';
      const toX = (slot) => (rightward ? width - config.cardWidth - restX(slot) : restX(slot));

      cards.forEach((el, index) => {
        gsap.set(el, { x: toX(index), scale: scaleFor(index), zIndex: zFor(index) });
      });

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

      const ease = cubicBezier(config.easing);
      const maxDelay = Math.max(0, config.cycle - config.duration);
      const staggerCap = Math.min(config.stagger, maxDelay / Math.max(1, full + 1));
      const delayFor = (slot) => Math.min(slot, full + 1) * staggerCap;
      const timeline = gsap.timeline({ repeat: -1, defaults: { ease } });

      for (let step = 0; step < slots; step += 1) {
        const base = step * config.cycle;
        cards.forEach((el, index) => {
          const from = mod(index - step, slots);
          const at = base + delayFor(from);
          const destination = from - 1;

          timeline.fromTo(
            el,
            { x: toX(from), scale: scaleFor(from) },
            {
              x: toX(destination),
              scale: scaleFor(destination),
              duration: config.duration,
              onStart: () => gsap.set(el, { zIndex: Math.max(zFor(from), zFor(destination)) }),
              onComplete: () => gsap.set(el, { zIndex: zFor(destination) })
            },
            at
          );

          if (from === 0) {
            timeline.set(
              el,
              { x: toX(slots - 1), scale: scaleFor(slots - 1), zIndex: zFor(slots - 1) },
              at + config.duration
            );
          }
        });
      }

      timeline.duration(slots * config.cycle);
      return timeline;
    }

    const config = {
      "direction": "left",
      "cardWidth": 250,
      "gap": 90,
      "cycle": 2,
      "duration": 1.5,
      "stagger": 0,
      "easing": [
        0.33,
        0,
        0,
        1
      ]
    };
    const images = [
      "/images/tools/motion-focus/card-1.webp",
      "/images/tools/motion-focus/card-2.webp",
      "/images/tools/motion-focus/card-3.webp",
      "/images/tools/motion-focus/card-4.webp",
      "/images/tools/motion-focus/card-5.webp",
      "/images/tools/motion-focus/card-6.webp"
    ];
    const viewport = __q('.mf-viewport');
    let timeline = null;
    function paint() {
      timeline?.kill();
      fillFocusTrack(viewport, images, config);
      timeline = buildMotionFocus(gsap, viewport, config);
    }
    paint();
    new ResizeObserver(paint).observe(viewport);
  }, []);

  return (
    <div ref={root} className="mf-stage">
      <div className="mf-viewport" style={{ '--mf-width': '250px', '--mf-gap': '90px', '--mf-radius': '30px', '--mf-pad': '119px', '--mf-fade': '18%' }}>
        <div className="mf-track"></div>
      </div>
    </div>
  );
}
