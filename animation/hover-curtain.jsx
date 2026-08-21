import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

const CSS = String.raw`
.hvr-frame{height:100dvh}
.hvr-frame{display:flex;align-items:center;justify-content:center;width:100%;height:100%;overflow:hidden}
.hvr-viewport{position:relative;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:100%;height:min(var(--hvr-height),100%);padding-block:var(--hvr-pad);border-radius:var(--hvr-radius);overflow:hidden;isolation:isolate;container-type:size;background:transparent;font-family:Inter,'Helvetica Neue',Arial,sans-serif;color:#f2f2f2}
.hvr-list{display:flex;flex-direction:column;gap:var(--hvr-row-gap);margin:0;padding:0;list-style:none;--hvr-fit:calc((100cqh - (var(--hvr-rows) - 1) * var(--hvr-row-gap)) / (var(--hvr-rows) * var(--hvr-line-height)))}
.hvr-link{display:block;color:inherit;text-decoration:none;cursor:pointer;font-size:min(var(--hvr-font-size),max(var(--hvr-fit),9px));font-weight:var(--hvr-weight);letter-spacing:calc(var(--hvr-tracking) * 1em);line-height:var(--hvr-line-height);white-space:nowrap}
.hvr-link span{display:inline-block}
.hvr-stage{position:absolute;inset:0;z-index:2;pointer-events:none}
.hvr-reveal{position:absolute;top:0;left:0;width:var(--hvr-card-width);height:var(--hvr-card-height);opacity:0}
.hvr-reveal--clip{overflow:hidden}
.hvr-reveal__inner,.hvr-reveal__img{position:relative;width:100%;height:100%}
.hvr-reveal__inner{overflow:hidden}
.hvr-reveal__img{background-size:cover;background-position:50% 50%}
.hvr-reveal__deco{position:absolute;top:0;left:0;width:100%;height:100%;background-color:var(--hvr-deco)}
@media (prefers-reduced-motion: reduce){.hvr-stage{display:none}.hvr-link{cursor:default}}
`;

export default function HoverCurtain() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (!document.querySelector('style[data-hover-curtain]')) {
      const tag = document.createElement('style');
      tag.setAttribute('data-hover-curtain', '');
      tag.textContent = CSS;
      document.head.append(tag);
    }
    const node = root.current;
    const __q = (sel) => (node.matches(sel) ? node : node.querySelector(sel));
    /**
     * Hover Curtain — Codrops Image Reveal Hover, effect 1.
     *
     * A thumbnail follows the pointer over a list of links: the mask slides in from the left while the image slides in from the
     * right, so the frame reads as a curtain rather than a stretch.
     *
     * Self-contained on purpose — the editor ships engines verbatim, so this file
     * cannot import a shared helper.
     *
     * Returns its own teardown so `gsap.context(...)` reverts the listeners too.
     */
    function buildHoverFx1(gsap, root, config) {
      const stage = root.querySelector('.hvr-stage');
      const links = [...root.querySelectorAll('.hvr-link')];
      if (!stage || !links.length) return null;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

      const teardowns = links.map((link) => {
        const reveal = document.createElement('div');
        reveal.className = 'hvr-reveal';
        reveal.innerHTML =
          '<div class="hvr-reveal__inner">' +
          `<div class="hvr-reveal__img" style="background-image:url(${link.dataset.img})"></div>` +
          '</div>';
        stage.append(reveal);

        const inner = reveal.querySelector('.hvr-reveal__inner');
        const img = reveal.querySelector('.hvr-reveal__img');
        let frame = 0;
        let tl = null;

        const follow = (event) => {
          const box = root.getBoundingClientRect();
          // The editor scales the whole stage, so screen pixels must be divided
          // back into layout pixels before they mean anything to a position.
          const scale = box.width / root.offsetWidth || 1;
          const x = (event.clientX - box.left) / scale + config.offsetX;
          const y = (event.clientY - box.top) / scale + config.offsetY;
          // Clamped because this stage has a hard edge, unlike the full page the
          // effect was written for.
          reveal.style.left = `${gsap.utils.clamp(0, root.offsetWidth - config.cardWidth, x)}px`;
          reveal.style.top = `${gsap.utils.clamp(0, root.offsetHeight - config.cardHeight, y)}px`;
        };

        const timeline = (vars) => {
          gsap.killTweensOf([reveal, inner, img]);
          tl?.kill();
          tl = gsap.timeline(vars);
          tl.timeScale(config.speed);
          return tl;
        };

        const show = () => {
          const tl = timeline({ onStart: () => gsap.set(reveal, { opacity: 1, zIndex: 2 }) });
          tl.fromTo(inner, { xPercent: -100 }, { xPercent: 0, duration: 0.2, ease: 'sine.out' }, 0)
            .fromTo(img, { xPercent: 100 }, { xPercent: 0, duration: 0.2, ease: 'sine.out' }, 0);
        };

        const hide = () => {
          const tl = timeline({
            onStart: () => gsap.set(reveal, { zIndex: 1 }),
            onComplete: () => gsap.set(reveal, { opacity: 0, zIndex: '' })
          });
          tl.to(inner, { xPercent: 100, duration: 0.2, ease: 'sine.out' }, 0)
            .to(img, { xPercent: -100, duration: 0.2, ease: 'sine.out' }, 0);
        };

        const onEnter = (event) => {
          follow(event);
          show();
        };

        const onMove = (event) => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => follow(event));
        };

        link.addEventListener('mouseenter', onEnter);
        link.addEventListener('mousemove', onMove);
        link.addEventListener('mouseleave', hide);

        return () => {
          cancelAnimationFrame(frame);
          link.removeEventListener('mouseenter', onEnter);
          link.removeEventListener('mousemove', onMove);
          link.removeEventListener('mouseleave', hide);
          tl?.kill();
          reveal.remove();
        };
      });

      return () => teardowns.forEach((off) => off());
    }

    const config = {
      "cardWidth": 240,
      "cardHeight": 170,
      "offsetX": 20,
      "offsetY": 20,
      "speed": 1
    };
    const viewport = __q('.hvr-viewport');
    buildHoverFx1(gsap, viewport, config);
  }, []);

  return (
    <div ref={root} className="hvr-frame">
      <div className="hvr-viewport" style={{ '--hvr-height': '620px', '--hvr-radius': '24px', '--hvr-card-width': '240px', '--hvr-card-height': '170px', '--hvr-font-size': '48px', '--hvr-weight': '700', '--hvr-tracking': '-0.05', '--hvr-line-height': '1.15', '--hvr-row-gap': '4px', '--hvr-pad': 'clamp(8px, 36.00px, 56px)', '--hvr-rows': '8', '--hvr-deco': '#141414' }}>
        <ul className="hvr-list">
          <li>
            <a className="hvr-link" href="#" data-img="/images/tools/hover-fx1/img-1.webp">
              Components
            </a>
          </li>
          <li>
            <a className="hvr-link" href="#" data-img="/images/tools/hover-fx1/img-2.webp">
              Templates
            </a>
          </li>
          <li>
            <a className="hvr-link" href="#" data-img="/images/tools/hover-fx1/img-3.webp">
              Figma Kits
            </a>
          </li>
          <li>
            <a className="hvr-link" href="#" data-img="/images/tools/hover-fx1/img-4.webp">
              Blocks
            </a>
          </li>
          <li>
            <a className="hvr-link" href="#" data-img="/images/tools/hover-fx1/img-5.webp">
              Motion
            </a>
          </li>
          <li>
            <a className="hvr-link" href="#" data-img="/images/tools/hover-fx1/img-6.webp">
              Licensing
            </a>
          </li>
          <li>
            <a className="hvr-link" href="#" data-img="/images/tools/hover-fx1/img-7.webp">
              Membership
            </a>
          </li>
          <li>
            <a className="hvr-link" href="#" data-img="/images/tools/hover-fx1/img-8.webp">
              Changelog
            </a>
          </li>
        </ul>
        <div className="hvr-stage"></div>
      </div>
    </div>
  );
}
