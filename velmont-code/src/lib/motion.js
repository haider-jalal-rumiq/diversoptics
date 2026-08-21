import { browser } from "$app/environment";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (browser) {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

export function prefersReducedMotion() {
  return (
    browser && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * @typedef {Object} RevealParams
 * @property {number} [delay]
 * @property {number} [y]
 * @property {number | null} [scale]
 * @property {number} [duration]
 * @property {string} [start]
 */

/**
 * Scroll-triggered reveal action.
 * use:reveal={{ delay: 0.1, y: 40, scale: 0.985 }}
 * Behavior: reversible (Motion Lab v2) — plays every time the node enters the
 * viewport scrolling down, and reverses back out when scrolling back up past
 * its start, so entrances replay bidirectionally.
 * @param {HTMLElement} node
 * @param {RevealParams} [params]
 */
export function reveal(node, params = {}) {
  if (!browser || prefersReducedMotion()) {
    return {};
  }
  const { delay = 0, y = 44, scale = null, duration = 0.9, start = "top 82%" } =
    params;

  /** @type {Record<string, number>} */
  const from = { opacity: 0, y };
  if (scale != null) from.scale = scale;
  gsap.set(node, from);

  const tween = gsap.to(node, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration,
    delay,
    ease: "power3.out",
    scrollTrigger: {
      trigger: node,
      start,
      toggleActions: "play none none reverse"
    }
  });

  return {
    destroy() {
      tween.scrollTrigger?.kill();
      tween.kill();
    }
  };
}

/**
 * Mask-clip reveal for media frames (Motion Lab v2 `mask-clip`): the frame
 * unclips upward while the inner media settles from a slight overscale.
 * Same reversible bidirectional behavior as reveal().
 * use:maskReveal={{ delay: 0.1 }}
 * @param {HTMLElement} node
 * @param {{ delay?: number, start?: string, duration?: number }} [params]
 */
export function maskReveal(node, params = {}) {
  if (!browser || prefersReducedMotion()) {
    return {};
  }
  const { delay = 0, start = "top 85%", duration = 1.05 } = params;
  const media = node.querySelector("img, video");

  gsap.set(node, { clipPath: "inset(100% 0% 0% 0%)" });
  const tween = gsap.to(node, {
    clipPath: "inset(0% 0% 0% 0%)",
    duration,
    delay,
    ease: "power3.out",
    scrollTrigger: {
      trigger: node,
      start,
      toggleActions: "play none none reverse"
    }
  });

  /** @type {gsap.core.Tween | undefined} */
  let inner;
  if (media) {
    gsap.set(media, { scale: 1.18 });
    inner = gsap.to(media, {
      scale: 1,
      duration: duration + 0.3,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: node,
        start,
        toggleActions: "play none none reverse"
      }
    });
  }

  return {
    destroy() {
      tween.scrollTrigger?.kill();
      tween.kill();
      inner?.scrollTrigger?.kill();
      inner?.kill();
    }
  };
}

/**
 * Parallax scrub for banner media.
 * @param {HTMLElement} node
 * @param {{ amount?: number }} [params]
 */
export function parallax(node, params = {}) {
  if (!browser || prefersReducedMotion()) {
    return {};
  }
  const { amount = 9 } = params;
  const tween = gsap.fromTo(
    node,
    { yPercent: -amount },
    {
      yPercent: amount,
      ease: "none",
      scrollTrigger: {
        trigger: node.parentElement ?? node,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    }
  );
  return {
    destroy() {
      tween.scrollTrigger?.kill();
      tween.kill();
    }
  };
}
