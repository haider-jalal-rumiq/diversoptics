import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

const CSS = String.raw`
.tex-frame-host{height:100dvh}
.tex-frame-host{display:flex;align-items:center;justify-content:center;width:100%;height:100%;overflow:hidden}
.tex-viewport{position:relative;box-sizing:border-box;width:100%;height:min(var(--tex-viewport-height),100%);overflow:hidden;border-radius:var(--tex-radius);background:transparent;color:#f2f2f2;isolation:isolate}
.tex-scroll{height:100%;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;overscroll-behavior:contain}
.tex-scroll::-webkit-scrollbar{display:none}
/* Still a scroll container the ticker can drive, just not one a wheel can grab. */
.tex-viewport[data-preview] .tex-scroll{overflow:hidden}
.tex-run{display:flex;flex-direction:column;padding:0 clamp(24px,6%,72px)}
.tex-gap{flex:none;height:calc(var(--tex-viewport-height) * 0.72)}
.tex-block{--tex-open:0;--tex-drift:0;flex:none;padding:9% 0;max-width:82%}
.tex-block[data-align='center']{align-self:center;text-align:center}
.tex-block[data-align='right']{align-self:flex-end;text-align:right}
.tex-meta{margin:0 0 1.4rem;font-family:Inter,system-ui,sans-serif;font-size:0.72rem;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;opacity:0.55}
.tex-meta::before{content:'—';padding-right:0.4rem}
.tex-type{margin:0;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,sans-serif;font-size:var(--tex-font-size);line-height:var(--tex-line-height);font-weight:var(--tex-weight);letter-spacing:calc(var(--tex-tracking) * 1em)}
/* The gap sits below the frame but the line above it only ever offered the
   leading of a 1.05 line-height, so an open image came within a few pixels of
   the descenders. Same gap above, scaled by the same reveal so a closed slot
   still reads as one continuous line of type. */
.tex-slot{display:inline-grid;grid-template-columns:min-content;vertical-align:top;padding-top:calc(var(--tex-open) * var(--tex-gap));gap:calc(var(--tex-open) * var(--tex-gap))}
.tex-frame{display:block;position:relative;width:calc(var(--tex-open) * 100%);aspect-ratio:var(--tex-ratio);overflow:hidden;border-radius:var(--tex-img-radius);will-change:width}
.tex-fill{position:absolute;top:50%;left:0;display:block;width:calc(var(--tex-viewport-width) * 0.5);aspect-ratio:var(--tex-ratio);transform:translateY(-50%);background-size:cover;background-position:center;background-color:#171717}
.tex-word{display:inline-block;white-space:nowrap;transform:skewX(calc(var(--tex-open) * var(--tex-skew)));will-change:transform}
/* No transform here on purpose. Any translate on the paragraph is applied on
   top of the scroll, so it always outruns the type and the image it belongs
   to — the block visibly comes apart. It travels with its block and only
   fades. */
.tex-body{margin:2.4rem 0 0;max-width:46ch;font-family:Inter,system-ui,sans-serif;font-size:0.94rem;line-height:1.65;opacity:calc(1 - var(--tex-drift) * (1 - var(--tex-fade)));will-change:opacity}
.tex-block[data-align='center'] .tex-body,.tex-block[data-align='right'] .tex-body{margin-left:auto}
.tex-block[data-align='center'] .tex-body{margin-right:auto}
@media (prefers-reduced-motion: reduce){.tex-scroll{scroll-behavior:auto}.tex-frame,.tex-word,.tex-body{will-change:auto}}
`;

export default function TypeReveal() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (!document.querySelector('style[data-type-reveal]')) {
      const tag = document.createElement('style');
      tag.setAttribute('data-type-reveal', '');
      tag.textContent = CSS;
      document.head.append(tag);
    }
    const node = root.current;
    const __q = (sel) => (node.matches(sel) ? node : node.querySelector(sel));
    /**
     * On-scroll image expansion inside a line of type.
     *
     * The reference drives this with GSAP Flip: it toggles an `open` class, lets
     * Flip measure the before/after layout, then scrubs between the two. Here the
     * open state is expressed directly as a `--tex-open` ratio the stylesheet reads,
     * so the engine only has to produce one number per block per frame. That keeps
     * every knob live — changing the gap or the aspect ratio mid-scroll needs no
     * re-measure, because there is no captured layout to invalidate.
     *
     * Progress is measured against the component's own scroller rather than the
     * page, since the tool has to work inside a fixed-size stage.
     */

    const clamp = (value) => (value < 0 ? 0 : value > 1 ? 1 : value);

    // Matches the reference's `power1.inOut`: slow to commit, slow to settle.
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

    // How far up the stage a paragraph travels before it starts leaving, as a share
    // of the stage height. Below this line it holds still at full weight, which is
    // the only window the reader has to actually read it.
    const BODY_HOLD = 0.25;

    function buildTypeReveal(lib, root, config) {
      const scroller = root.querySelector('.tex-scroll');
      if (!scroller) return null;

      const blocks = Array.from(root.querySelectorAll('.tex-block')).map((element) => ({
        element,
        body: element.querySelector('.tex-body'),
        open: 0,
        drift: 0,
        paintedOpen: -1,
        paintedDrift: -1
      }));
      if (!blocks.length) return null;

      const paint = (block, open, drift) => {
        // A hundredth of a ratio is under half a pixel of frame width at this
        // scale, so anything finer would only cost layout passes.
        if (Math.abs(open - block.paintedOpen) > 0.002) {
          block.element.style.setProperty('--tex-open', open.toFixed(4));
          block.paintedOpen = open;
        }
        if (Math.abs(drift - block.paintedDrift) > 0.002) {
          block.element.style.setProperty('--tex-drift', drift.toFixed(4));
          block.paintedDrift = drift;
        }
      };

      const reduced =
        typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduced) {
        // One readable frame: every image open, no scrolling required to reach it.
        blocks.forEach((block) => paint(block, 1, 0));
        return () => {};
      }

      const running = config.autoSpeed > 0 && !config.paused;

      const targets = () => {
        const stage = scroller.getBoundingClientRect();
        const height = scroller.clientHeight;
        // A catalog card scales the whole stage down to fit, so measured rects are
        // in screen pixels while `clientHeight` is in layout pixels. Undo the scale
        // before the two are compared or the reveal fires at the wrong position.
        const scale = stage.height / (height || 1) || 1;
        const span = (height * config.span) / 100 || 1;

        blocks.forEach((block) => {
          const rect = block.element.getBoundingClientRect();
          const top = (rect.top - stage.top) / scale;
          block.targetOpen = ease(clamp((height - top) / span));

          if (!block.body) {
            block.targetDrift = 0;
            return;
          }
          const bodyRect = block.body.getBoundingClientRect();
          const bodyTop = (bodyRect.top - stage.top) / scale;
          const bodyHeight = bodyRect.height / scale;
          // The paragraph drifts out, not in. Measuring from the bottom edge of the
          // stage started the rise and the fade on the frame the paragraph first
          // appeared, so it read as leaving ahead of the block it belongs to.
          const exit = height * BODY_HOLD;
          block.targetDrift = clamp((exit - bodyTop) / (exit + bodyHeight));
        });
      };

      let last = lib.ticker.time;

      const frame = () => {
        const _rect = root.getBoundingClientRect();
        if (document.documentElement.classList.contains('is-scrolling') || _rect.bottom < 0 || _rect.top > innerHeight) return;
        const now = lib.ticker.time;
        const dt = Math.min(now - last, 0.1);
        last = now;

        if (running) {
          const limit = scroller.scrollHeight - scroller.clientHeight;
          const next = scroller.scrollTop + config.autoSpeed * dt;
          // Snapping back to the top rather than reversing keeps every block's
          // reveal running in the one direction it was designed for.
          scroller.scrollTop = next >= limit ? 0 : next;
        }

        targets();

        // Frame-rate independent approach to the target, so the same smoothing
        // value feels identical at 60Hz and 120Hz.
        const blend = config.smoothing >= 1 ? 1 : 1 - (1 - config.smoothing) ** (dt * 60);

        blocks.forEach((block) => {
          block.open += (block.targetOpen - block.open) * blend;
          block.drift += (block.targetDrift - block.drift) * blend;
          paint(block, block.open, block.drift);
        });
      };

      // Seed the resting state before the first tick so nothing pops open on mount.
      targets();
      blocks.forEach((block) => {
        block.open = block.targetOpen;
        block.drift = block.targetDrift;
        paint(block, block.open, block.drift);
      });

      lib.ticker.add(frame);
      const observer = new ResizeObserver(targets);
      observer.observe(scroller);

      return () => {
        lib.ticker.remove(frame);
        observer.disconnect();
      };
    }

    // The slot fill is a background rather than an `<img>` so the inner layer can
    // stay wider than its clipping frame — that is what makes the frame read as a
    // curtain drawing back instead of an image being stretched open.
    function fillTypeRevealDeck(root, images) {
      const frames = Array.from(root.querySelectorAll('.tex-frame'));
      frames.forEach((frame, index) => {
        const src = images[index % (images.length || 1)];
        const fill = frame.querySelector('.tex-fill');
        if (!fill) return;
        fill.style.backgroundImage = src ? `url(${src})` : '';
      });
    }

    const config = {
      "span": 135,
      "smoothing": 0.12,
      "autoSpeed": 90,
      "paused": false
    };
    const images = [
      "/images/tools/type-reveal/reveal-1.webp",
      "/images/tools/type-reveal/reveal-2.webp",
      "/images/tools/type-reveal/reveal-3.webp"
    ];
    const viewport = __q('.tex-viewport');
    fillTypeRevealDeck(viewport, images);
    buildTypeReveal(gsap, viewport, config);
  }, []);

  return (
    <div ref={root} className="tex-frame-host">
      <div className="tex-viewport" style={{ '--tex-viewport-width': '1040px', '--tex-viewport-height': '620px', '--tex-radius': '0px', '--tex-font-size': '72px', '--tex-weight': '700', '--tex-tracking': '-0.05', '--tex-line-height': '1.05', '--tex-ratio': '1.78', '--tex-img-radius': '48px', '--tex-gap': '24px', '--tex-skew': '-20deg', '--tex-fade': '0.2' }} aria-label="Image expansion typography">
        <div className="tex-scroll" data-lenis-prevent="">
          <div className="tex-run">
            <div className="tex-gap"></div>
            <article className="tex-block" data-align="left">
              <p className="tex-meta">
                The library
              </p>
              <h2 className="tex-type">
                The premium UI
                &
                <br />
                code library for the
                <br />
                <span className="tex-slot">
                  <span className="tex-frame">
                    <span className="tex-fill" role="img" aria-label="Sculptural concrete facade folding against an overcast sky"></span>
                  </span>
                  <span className="tex-word">
                    vibecoding era.
                  </span>
                </span>
              </h2>
              <p className="tex-body">
                React and Tailwind components, Figma templates and UI kits, every one designed in-house and delivered under a commercial license.
              </p>
            </article>
            <article className="tex-block" data-align="center">
              <p className="tex-meta">
                Built to ship
              </p>
              <h2 className="tex-type">
                Code that ships,
                <br />
                not another
                <br />
                <span className="tex-slot">
                  <span className="tex-frame">
                    <span className="tex-fill" role="img" aria-label="Dense syntax-highlighted code filling a dark editor"></span>
                  </span>
                  <span className="tex-word">
                    screenshot.
                  </span>
                </span>
              </h2>
              <p className="tex-body">
                Typed, accessible and styled with Tailwind out of the box. Drop it into Cursor, Lovable or v0 and keep building instead of rebuilding.
              </p>
            </article>
            <article className="tex-block" data-align="right">
              <p className="tex-meta">
                One subscription
              </p>
              <h2 className="tex-type">
                One membership,
                <br />
                zero
                <br />
                <span className="tex-slot">
                  <span className="tex-frame">
                    <span className="tex-fill" role="img" aria-label="A lamp throwing warm light across a laptop on a dark desk"></span>
                  </span>
                  <span className="tex-word">
                    per-asset math.
                  </span>
                </span>
              </h2>
              <p className="tex-body">
                Daily access to every kit, component, template and asset in the catalog. Download, copy, ship, and keep the license when the project ends.
              </p>
            </article>
            <div className="tex-gap"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
