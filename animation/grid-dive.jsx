import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

const CSS = String.raw`
html,body{margin:0;height:100%;background:#060606}.g3d-frame{height:100dvh}.g3d-frame{display:flex;align-items:center;justify-content:center;width:100%;height:100%;overflow:hidden}
.g3d-viewport{position:relative;box-sizing:border-box;flex:0 0 auto;width:var(--g3d-viewport-width);max-width:100%;height:var(--g3d-viewport-height);overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;background:transparent;color:#fff;outline:none}
.g3d-viewport[data-preview]{overflow:hidden}
.g3d-viewport::-webkit-scrollbar{display:none}
.g3d-track{position:relative;height:var(--g3d-track-height,300%)}
.g3d-window{position:sticky;top:0;height:var(--g3d-viewport-height);overflow:hidden}
.g3d-hint{position:absolute;z-index:4;left:50%;bottom:18px;margin:0;display:grid;justify-items:center;gap:7px;pointer-events:none;font-size:0.6875rem;font-weight:500;line-height:1;letter-spacing:0.14em;text-transform:uppercase;color:#f5f3ee;text-shadow:0 1px 10px rgba(0,0,0,0.7);opacity:1;transform:translateX(-50%);transition:opacity 0.45s ease}
.g3d-hint i{display:block;width:1px;height:20px;background:currentColor;box-shadow:0 1px 8px rgba(0,0,0,0.55);transform-origin:50% 0;animation:g3d-hint-float 1.5s ease-in-out infinite}
@keyframes g3d-hint-float{0%,100%{opacity:0.35;transform:scaleY(0.5)}50%{opacity:1;transform:scaleY(1)}}
.g3d-viewport[data-scrolled='true'] .g3d-hint{opacity:0}
@media(prefers-reduced-motion:reduce){.g3d-hint i{animation:none}}
.g3d-grid{position:absolute;top:0;left:0;box-sizing:border-box;display:grid;place-items:center;padding:2rem;width:100%;perspective:var(--g3d-perspective)}
.g3d-wrap{width:var(--g3d-grid-width);display:grid;grid-template-columns:repeat(var(--g3d-columns),1fr);gap:var(--g3d-gap);transform-style:preserve-3d}
.g3d-item{position:relative;aspect-ratio:var(--g3d-item-ratio);width:100%;height:auto;min-width:0;overflow:hidden;border-radius:var(--g3d-radius);display:grid;place-items:center}
.g3d-item-inner{position:relative;width:calc(1 / var(--g3d-inner-scale) * 100%);height:calc(1 / var(--g3d-inner-scale) * 100%)}
.g3d-item-inner > img,.g3d-item-inner > video{display:block;width:100%;height:100%;object-fit:cover}
.g3d-item-inner > span{display:block;width:100%;height:100%}
@media(prefers-reduced-motion:reduce){.g3d-viewport{overflow-y:hidden}}
`;

export default function GridDive() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (!document.querySelector('style[data-grid-dive]')) {
      const tag = document.createElement('style');
      tag.setAttribute('data-grid-dive', '');
      tag.textContent = CSS;
      document.head.append(tag);
    }
    const node = root.current;
    const __q = (sel) => (node.matches(sel) ? node : node.querySelector(sel));
    const clamp01 = (value) => (value < 0 ? 0 : value > 1 ? 1 : value);

    // Stable per-cell variation. A live random would resettle the whole grid every
    // time a slider rebuilds the timeline, so the layout has to be seeded.
    const hash = (index, salt) => {
      const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };

    const spanOf = (index, salt, min, max) => min + hash(index, salt) * (max - min);

    // Where a formation opens instead of at progress 0. Measured by sweeping the
    // scrub of all six variants: every one has entered by 0.25, and by 0.4 the
    // block is composed in the slot rather than still climbing in from the bottom
    // edge, while most of the scrub is still ahead.
    const REST_PROGRESS = 0.4;

    // Every variant ends its scrub spent — deck and tunnel land on `brightness(0%)`,
    // the fallback on `opacity: 0.2` — because on the source page the block is meant
    // to fade out as it leaves the viewport. In a fixed preview slot there is no
    // leaving, so an autoplay that reaches the end parks on a black rectangle. The
    // yoyo therefore turns around while the formation is still composed; a real
    // scroll still reaches the whole range.
    const AUTOPLAY_END = 0.6;

    function buildGrid3D(gsap, root, config) {
      if (root._g3dCleanup) root._g3dCleanup();

      const grid = root.querySelector('.g3d-grid');
      const wrap = root.querySelector('.g3d-wrap');
      const items = [...root.querySelectorAll('.g3d-item')];
      const inners = items.map((item) => item.querySelector('.g3d-item-inner')).filter(Boolean);
      if (!grid || !wrap || !items.length) return null;

      // A rebuild inherits whatever transform the previous timeline left behind, and
      // GSAP bakes a spent xPercent into a pixel `x` that the next tween adds to
      // instead of replacing. Start every build from a clean baseline.
      gsap.set([wrap, ...items, ...inners], { clearProps: 'all' });

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const depth = config.depth;
      const spread = config.spread;
      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

      if (config.variant === 'sweep') {
        timeline
          .set(wrap, { rotationY: config.tilt })
          .set(items, { z: (i) => spanOf(i, 1, -depth, depth * 0.125) })
          .fromTo(
            items,
            { xPercent: (i) => spanOf(i, 2, -spread, -spread * 0.5) },
            { xPercent: (i) => spanOf(i, 3, spread * 0.5, spread) },
            0
          )
          .fromTo(inners, { scale: 2 }, { scale: 0.5 }, 0);
      } else if (config.variant === 'tunnel') {
        timeline
          .set(wrap, { rotationX: config.tilt })
          .set(items, { z: (i) => spanOf(i, 1, -depth, -depth / 3) })
          .fromTo(
            items,
            {
              yPercent: (i) => spanOf(i, 2, spread * 0.1, spread),
              rotationY: -config.spin,
              filter: 'brightness(200%)'
            },
            {
              ease: 'power2',
              yPercent: (i) => spanOf(i, 3, -spread, -spread * 0.1),
              rotationY: config.spin,
              filter: 'brightness(0%)'
            },
            0
          )
          .fromTo(wrap, { rotationZ: -5 }, { rotationX: -config.tilt, rotationZ: 10, scale: 1.2 }, 0)
          .fromTo(inners, { scale: 2 }, { scale: 0.5 }, 0);
      } else if (config.variant === 'dive') {
        timeline
          .set(items, {
            transformOrigin: '50% 0%',
            z: (i) => spanOf(i, 1, -depth, -depth * 0.4),
            rotationX: (i) => spanOf(i, 2, -config.spin, -config.tilt),
            filter: 'brightness(0%)'
          })
          .to(
            items,
            {
              xPercent: (i) => spanOf(i, 3, -spread * 0.15, spread * 0.15),
              yPercent: (i) => spanOf(i, 4, -spread * 0.3, spread * 0.3),
              rotationX: 0,
              filter: 'brightness(200%)'
            },
            0
          )
          .to(wrap, { z: depth * 1.3 }, 0)
          .fromTo(inners, { scale: 2 }, { scale: 0.5 }, 0);
      } else if (config.variant === 'deck') {
        timeline
          .set(wrap, { transformOrigin: '0% 50%', rotationY: config.tilt, xPercent: -75 })
          .set(items, { transformOrigin: '50% 0%' })
          .to(items, { duration: 0.5, ease: 'power2', z: depth, stagger: 0.04 }, 0)
          .to(items, { duration: 0.5, ease: 'power2.in', z: 0, stagger: 0.04 }, 0.5)
          .fromTo(
            items,
            { rotationX: -config.spin, filter: 'brightness(120%)' },
            { duration: 1, rotationX: config.spin, filter: 'brightness(0%)', stagger: 0.04 },
            0
          );
      } else if (config.variant === 'split') {
        // Rows come straight from the column count, so no bounding-box measuring is
        // needed to tell an even row from an odd one.
        const evenRows = items.filter((_, i) => Math.floor(i / config.columns) % 2 === 0);
        const oddRows = items.filter((_, i) => Math.floor(i / config.columns) % 2 === 1);
        timeline
          .set(wrap, { rotationX: config.tilt })
          .to(wrap, { rotationX: config.tilt * 0.6 })
          .fromTo(items, { filter: 'brightness(0%)' }, { filter: 'brightness(100%)' }, 0)
          .to(evenRows, { xPercent: -100, ease: 'power1' }, 0)
          .to(oddRows, { xPercent: 100, ease: 'power1' }, 0)
          .addLabel('rowsEnd', '>-=0.15')
          .to(items, { ease: 'power1', yPercent: (i) => spanOf(i, 1, -spread * 0.1, spread * 0.2) }, 'rowsEnd');
      } else {
        timeline.fromTo(
          items,
          { transformOrigin: '50% 200%', rotationX: 0, yPercent: spread * 0.4 },
          { yPercent: 0, rotationY: config.spin, opacity: 0.2, scale: 0.8, stagger: 0.03 }
        );
      }

      let autoplay = null;
      let resumeTimer = 0;
      let frame = 0;

      // The source binds the timeline to `{ trigger: gridWrap, start: 'top
      // bottom+=5%', end: 'bottom top-=5%' }` and lets the page scroll carry the
      // block. Same window against the slot: the runway before and after the block
      // is 105% of the slot, progress 0 when the wrap top reaches the slot bottom
      // plus 5%, progress 1 once the wrap bottom clears the slot top by 5%.
      let geo = { runway: 0, start: 0, range: 1 };

      const measure = () => {
        const slot = root.clientHeight;
        const runway = slot * 1.05;
        root.style.setProperty('--g3d-track-height', `${runway * 2 + grid.offsetHeight}px`);
        geo = {
          runway,
          start: wrap.offsetTop,
          range: Math.max(1, wrap.offsetHeight + slot * 1.1)
        };
        root.dataset.scrub = `${Math.round(geo.start)},${Math.round(geo.range)}`;
      };

      const render = () => {
        const scrolled = reduced ? geo.start + geo.range * 0.5 : root.scrollTop;
        const progress = clamp01((scrolled - geo.start) / geo.range);
        grid.style.transform = `translate3d(0, ${geo.runway - scrolled}px, 0)`;
        timeline.progress(progress);
        root.dataset.progress = progress.toFixed(3);
        // The hint retires once the gesture lands, so its threshold has to clear
        // the resting point, or it would dismiss itself on load.
        root.dataset.scrolled = progress > REST_PROGRESS + 0.03 ? 'true' : 'false';
        root.dataset.ready = 'true';
      };

      // F1: the autoplay yoyo keeps driving root.scrollTop (and therefore the
      // scroll-driven render) every frame; while the page scrolls it pauses on
      // gsap's own ticker and resumes on settle (~140-160ms). Gesture pause still
      // outranks it: pauseForGesture kills the timeline outright.
      let autoplayPausedByScroll = false;
      const syncAutoplayPause = () => {
        const want = document.documentElement.classList.contains('is-scrolling');
        if (want === autoplayPausedByScroll) return;
        autoplayPausedByScroll = want;
        autoplay?.paused(want);
      };

      const startAutoplay = () => {
        if (reduced || !(config.autoPlayDuration > 0)) return;
        const travel = Math.max(1, root.scrollHeight - root.clientHeight);
        const proxy = { y: root.scrollTop };
        const at = (progress) => clamp01((geo.start + geo.range * progress) / travel) * travel;
        const near = at(REST_PROGRESS);
        const far = at(AUTOPLAY_END);
        // Aim at whichever end is further away. A rebuild keeps the scroll position it
        // had, and a shorter variant clamps it to the bottom, so always tweening up
        // would start the yoyo already parked at its target and look frozen.
        const target = Math.abs(proxy.y - far) >= Math.abs(proxy.y - near) ? far : near;
        autoplay = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 0.6 }).to(proxy, {
          y: target,
          duration: Math.max(1, config.autoPlayDuration),
          ease: 'sine.inOut',
          onUpdate: () => {
            root.scrollTop = proxy.y;
          }
        });
        gsap.ticker.add(syncAutoplayPause);
      };

      const stopAutoplay = () => {
        gsap.ticker.remove(syncAutoplayPause);
        autoplay?.kill();
        autoplay = null;
      };

      const pauseForGesture = () => {
        stopAutoplay();
        window.clearTimeout(resumeTimer);
        resumeTimer = window.setTimeout(startAutoplay, 1200);
      };

      measure();
      // The source lets the page scroll carry the block, so progress 0 parks it a
      // full runway below the slot and the first frame reads as an empty stage.
      // Inside a fixed editor slot there is no page above to scroll through, so the
      // formation opens already on stage instead of behind it.
      root.scrollTop = geo.start + geo.range * REST_PROGRESS;
      render();
      startAutoplay();

      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          stopAutoplay();
          measure();
          render();
          startAutoplay();
        });
      });
      observer.observe(root);

      root.addEventListener('scroll', render, { passive: true });
      root.addEventListener('wheel', pauseForGesture, { passive: true });
      root.addEventListener('touchstart', pauseForGesture, { passive: true });
      root.addEventListener('pointerdown', pauseForGesture);
      root.addEventListener('keydown', pauseForGesture);

      root._g3dCleanup = () => {
        root.removeEventListener('scroll', render);
        root.removeEventListener('wheel', pauseForGesture);
        root.removeEventListener('touchstart', pauseForGesture);
        root.removeEventListener('pointerdown', pauseForGesture);
        root.removeEventListener('keydown', pauseForGesture);
        observer.disconnect();
        cancelAnimationFrame(frame);
        window.clearTimeout(resumeTimer);
        stopAutoplay();
        timeline.kill();
        grid.style.transform = '';
        root.style.removeProperty('--g3d-track-height');
        gsap.set([wrap, ...items, ...inners], { clearProps: 'all' });
        delete root.dataset.scrolled;
        root.dataset.ready = 'disposed';
        root._g3dCleanup = null;
      };

      return { kill: root._g3dCleanup };
    }
    const viewport=__q('.g3d-viewport');
    buildGrid3D(gsap,viewport,{
      "variant": "dive",
      "columns": 8,
      "depth": 5000,
      "spread": 1000,
      "tilt": 25,
      "spin": 65,
      "autoPlayDuration": 12
    });
  }, []);

  return (
    <div ref={root} className="g3d-frame">
      <div className="g3d-viewport" style={{ '--g3d-viewport-width': '900px', '--g3d-viewport-height': '560px', '--g3d-perspective': '1500px', '--g3d-grid-width': '105%', '--g3d-columns': '8', '--g3d-item-ratio': '1.5', '--g3d-inner-scale': '0.5', '--g3d-gap': '18px', '--g3d-radius': '8px' }} data-variant="dive" data-lenis-prevent="" data-ready="pending" tabIndex="0" aria-label="Grid Dive scroll preview">
        <div className="g3d-track">
          <div className="g3d-window">
            <p className="g3d-hint">
              Scroll
              <i aria-hidden="true"></i>
            </p>
            <div className="g3d-grid g3d-grid--dive" aria-hidden="true">
              <div className="g3d-wrap">
                <div className="g3d-item" data-index="0">
                  <div className="g3d-item-inner">
                    <img data-slot="0" src="/images/tools/grid3d/card-01.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="1">
                  <div className="g3d-item-inner">
                    <img data-slot="1" src="/images/tools/grid3d/card-02.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="2">
                  <div className="g3d-item-inner">
                    <img data-slot="2" src="/images/tools/grid3d/card-03.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="3">
                  <div className="g3d-item-inner">
                    <img data-slot="3" src="/images/tools/grid3d/card-04.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="4">
                  <div className="g3d-item-inner">
                    <img data-slot="4" src="/images/tools/grid3d/card-05.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="5">
                  <div className="g3d-item-inner">
                    <img data-slot="5" src="/images/tools/grid3d/card-06.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="6">
                  <div className="g3d-item-inner">
                    <img data-slot="6" src="/images/tools/grid3d/card-07.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="7">
                  <div className="g3d-item-inner">
                    <img data-slot="7" src="/images/tools/grid3d/card-08.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="8">
                  <div className="g3d-item-inner">
                    <img data-slot="8" src="/images/tools/grid3d/card-09.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="9">
                  <div className="g3d-item-inner">
                    <img data-slot="9" src="/images/tools/grid3d/card-10.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="10">
                  <div className="g3d-item-inner">
                    <img data-slot="0" src="/images/tools/grid3d/card-01.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="11">
                  <div className="g3d-item-inner">
                    <img data-slot="1" src="/images/tools/grid3d/card-02.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="12">
                  <div className="g3d-item-inner">
                    <img data-slot="2" src="/images/tools/grid3d/card-03.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="13">
                  <div className="g3d-item-inner">
                    <img data-slot="3" src="/images/tools/grid3d/card-04.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="14">
                  <div className="g3d-item-inner">
                    <img data-slot="4" src="/images/tools/grid3d/card-05.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="15">
                  <div className="g3d-item-inner">
                    <img data-slot="5" src="/images/tools/grid3d/card-06.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="16">
                  <div className="g3d-item-inner">
                    <img data-slot="6" src="/images/tools/grid3d/card-07.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="17">
                  <div className="g3d-item-inner">
                    <img data-slot="7" src="/images/tools/grid3d/card-08.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="18">
                  <div className="g3d-item-inner">
                    <img data-slot="8" src="/images/tools/grid3d/card-09.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="19">
                  <div className="g3d-item-inner">
                    <img data-slot="9" src="/images/tools/grid3d/card-10.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="20">
                  <div className="g3d-item-inner">
                    <img data-slot="0" src="/images/tools/grid3d/card-01.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="21">
                  <div className="g3d-item-inner">
                    <img data-slot="1" src="/images/tools/grid3d/card-02.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="22">
                  <div className="g3d-item-inner">
                    <img data-slot="2" src="/images/tools/grid3d/card-03.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="23">
                  <div className="g3d-item-inner">
                    <img data-slot="3" src="/images/tools/grid3d/card-04.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="24">
                  <div className="g3d-item-inner">
                    <img data-slot="4" src="/images/tools/grid3d/card-05.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="25">
                  <div className="g3d-item-inner">
                    <img data-slot="5" src="/images/tools/grid3d/card-06.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="26">
                  <div className="g3d-item-inner">
                    <img data-slot="6" src="/images/tools/grid3d/card-07.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="27">
                  <div className="g3d-item-inner">
                    <img data-slot="7" src="/images/tools/grid3d/card-08.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="28">
                  <div className="g3d-item-inner">
                    <img data-slot="8" src="/images/tools/grid3d/card-09.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="29">
                  <div className="g3d-item-inner">
                    <img data-slot="9" src="/images/tools/grid3d/card-10.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="30">
                  <div className="g3d-item-inner">
                    <img data-slot="0" src="/images/tools/grid3d/card-01.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="31">
                  <div className="g3d-item-inner">
                    <img data-slot="1" src="/images/tools/grid3d/card-02.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="32">
                  <div className="g3d-item-inner">
                    <img data-slot="2" src="/images/tools/grid3d/card-03.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="33">
                  <div className="g3d-item-inner">
                    <img data-slot="3" src="/images/tools/grid3d/card-04.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="34">
                  <div className="g3d-item-inner">
                    <img data-slot="4" src="/images/tools/grid3d/card-05.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="35">
                  <div className="g3d-item-inner">
                    <img data-slot="5" src="/images/tools/grid3d/card-06.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="36">
                  <div className="g3d-item-inner">
                    <img data-slot="6" src="/images/tools/grid3d/card-07.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="37">
                  <div className="g3d-item-inner">
                    <img data-slot="7" src="/images/tools/grid3d/card-08.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="38">
                  <div className="g3d-item-inner">
                    <img data-slot="8" src="/images/tools/grid3d/card-09.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="39">
                  <div className="g3d-item-inner">
                    <img data-slot="9" src="/images/tools/grid3d/card-10.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="40">
                  <div className="g3d-item-inner">
                    <img data-slot="0" src="/images/tools/grid3d/card-01.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="41">
                  <div className="g3d-item-inner">
                    <img data-slot="1" src="/images/tools/grid3d/card-02.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="42">
                  <div className="g3d-item-inner">
                    <img data-slot="2" src="/images/tools/grid3d/card-03.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="43">
                  <div className="g3d-item-inner">
                    <img data-slot="3" src="/images/tools/grid3d/card-04.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="44">
                  <div className="g3d-item-inner">
                    <img data-slot="4" src="/images/tools/grid3d/card-05.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="45">
                  <div className="g3d-item-inner">
                    <img data-slot="5" src="/images/tools/grid3d/card-06.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="46">
                  <div className="g3d-item-inner">
                    <img data-slot="6" src="/images/tools/grid3d/card-07.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
                <div className="g3d-item" data-index="47">
                  <div className="g3d-item-inner">
                    <img data-slot="7" src="/images/tools/grid3d/card-08.webp" alt="" loading="eager" decoding="async" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
