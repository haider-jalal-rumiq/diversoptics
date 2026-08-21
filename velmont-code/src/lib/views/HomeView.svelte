<script>
  import { onMount } from "svelte";
  import OutlineWord from "$lib/components/OutlineWord.svelte";
  import { brand, homeHero, collections, motion } from "$lib/content.js";
  import { gsap, prefersReducedMotion, reveal, maskReveal } from "$lib/motion.js";

  // ---- hero roll carousel ----
  let current = $state(0);
  let incoming = $state(-1);
  /** @type {HTMLElement | undefined} */
  let heroEl = $state();
  /** @type {ReturnType<typeof setInterval> | undefined} */
  let timer;

  function slideEls() {
    return heroEl ? Array.from(heroEl.querySelectorAll(".hero-slide")) : [];
  }

  /** @param {number} next */
  function rollTo(next) {
    if (incoming !== -1 || next === current) return;
    incoming = next;
    requestAnimationFrame(() => {
      const els = slideEls();
      const outEl = els[current];
      const inEl = els[next];
      if (!outEl || !inEl || prefersReducedMotion()) {
        current = next;
        incoming = -1;
        return;
      }
      gsap.set(inEl, { yPercent: 100, zIndex: 2 });
      gsap.set(outEl, { zIndex: 1 });
      gsap.to(outEl, {
        yPercent: -100,
        duration: motion.heroRoll,
        ease: "power2.inOut"
      });
      gsap.to(inEl, {
        yPercent: 0,
        duration: motion.heroRoll,
        ease: "power2.inOut",
        onComplete() {
          gsap.set(outEl, { yPercent: 0, zIndex: 0 });
          current = next;
          incoming = -1;
        }
      });
    });
  }

  onMount(() => {
    if (!prefersReducedMotion()) {
      timer = setInterval(() => {
        rollTo((current + 1) % homeHero.slides.length);
      }, homeHero.slideMs);
    }
    return () => clearInterval(timer);
  });

  // Ken Burns drift on the visible slide
  $effect(() => {
    if (prefersReducedMotion()) return;
    const idx = incoming !== -1 ? incoming : current;
    const media = slideEls()[idx]?.querySelector("img");
    if (!media) return;
    gsap.fromTo(
      media,
      { scale: 1.05 },
      { scale: 1.13, duration: homeHero.slideMs / 900, ease: "none" }
    );
  });

  let shownIndex = $derived(incoming !== -1 ? incoming : current);

  /** @param {string} id */
  function scrollToSection(id) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
</script>

<div>
  <section class="hero" aria-label="Velmont hero" bind:this={heroEl}>
    {#each homeHero.slides as slide, i (slide.src)}
      <div
        class="hero-slide"
        style:z-index={i === shownIndex ? 1 : 0}
        aria-hidden={i !== shownIndex}
      >
        <div class="hero-slide__media">
          <img
            src={slide.src}
            alt={i === shownIndex ? slide.alt : ""}
            fetchpriority={i === 0 ? "high" : "auto"}
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
        <div class="hero-word">
          <span class="word"><OutlineWord word={brand.heroWord} tone="ink" /></span>
          <span class="sub">{brand.heroSub}</span>
        </div>
      </div>
    {/each}

    <button
      class="mini-card"
      type="button"
      onclick={() => scrollToSection("atelier")}
      aria-label="Scroll to the atelier section"
    >
      <span class="frame">
        <img
          src={homeHero.slides[shownIndex].src}
          alt=""
          style:object-position="center 62%"
        />
        <span class="badge">{String(shownIndex + 1).padStart(2, "0")}</span>
      </span>
    </button>

    <div class="hero-corner-r" aria-hidden="true">
      <span class="count">({homeHero.slides.length.toString().padStart(2, "0")})</span>
      <span class="label-caps">{brand.heroCountLabel}</span>
    </div>
  </section>

  <section class="collections" id="collections" aria-label="Collections">
    <div class="collections-head">
      <span class="label-caps" use:reveal>{collections.eyebrow}</span>
      <h2 class="serif-display title" use:reveal={{ delay: 0.08 }}>
        {collections.title}
      </h2>
      <button
        class="circle-cta"
        type="button"
        onclick={() => scrollToSection("campaign")}
        aria-label="Scroll to the campaign section"
        use:reveal={{ delay: 0.15 }}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 17L17 7M17 7H8M17 7v9"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div class="collections-grid">
      {#each collections.items as item, i (item.name)}
        <article class="collection-card" use:reveal={{ delay: i * motion.stagger }}>
          <div class="media-frame frame" use:maskReveal={{ delay: i * motion.stagger }}>
            <img src={item.src} alt={item.alt} loading="lazy" />
          </div>
          <div class="meta">
            <span class="index label-caps">{item.index}</span>
            <h3 class="name">{item.name}</h3>
            <span class="tagline">{item.tagline}</span>
            <span class="season">{item.series}</span>
          </div>
        </article>
      {/each}
    </div>
  </section>
</div>
