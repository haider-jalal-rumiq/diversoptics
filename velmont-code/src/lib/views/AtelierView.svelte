<script>
  import { onMount } from "svelte";
  import OutlineWord from "$lib/components/OutlineWord.svelte";
  import { atelier, motion } from "$lib/content.js";
  import { prefersReducedMotion, reveal, maskReveal, parallax } from "$lib/motion.js";

  // ---- hero inline card crossfade ----
  let cardIndex = $state(0);
  /** @type {ReturnType<typeof setInterval> | undefined} */
  let cardTimer;

  onMount(() => {
    if (!prefersReducedMotion()) {
      cardTimer = setInterval(() => {
        cardIndex = (cardIndex + 1) % atelier.cardImages.length;
      }, 3000);
    }
    return () => clearInterval(cardTimer);
  });

  function scrollToCrafted() {
    document
      .getElementById("crafted")
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
</script>

<div class="theme-light" id="atelier" data-theme-block="light">
  <section class="hero atelier-hero" aria-label="Atelier hero">
    <div class="hero-statement" aria-hidden="true" use:reveal>
      {#each atelier.statement as line (line)}
        <span class="label-caps">{line}</span>
      {/each}
    </div>

    <div class="hero-word" use:reveal={{ delay: 0.1, y: 40 }}>
      <span class="word"><OutlineWord word={atelier.heroWord} tone="paper" /></span>
    </div>

    <div class="mini-card" aria-hidden="true" use:reveal={{ delay: 0.22, y: 30 }}>
      <span class="frame">
        {#each atelier.cardImages as src, i (src)}
          <img
            {src}
            alt={i === cardIndex ? atelier.cardAlt : ""}
            style:opacity={i === cardIndex ? 1 : 0}
            loading={i === 0 ? "eager" : "lazy"}
          />
        {/each}
        <span class="badge">{atelier.badge}</span>
      </span>
    </div>
  </section>

  <section class="hands" aria-label="The hands behind the craft">
    <div class="hands-copy">
      <h2 class="stack">
        <span class="l1" use:reveal>{atelier.hands.lines[0]}</span>
        <span class="l2" use:reveal={{ delay: 0.06 }}>{atelier.hands.lines[1]}</span>
        <span class="l3" use:reveal={{ delay: 0.12 }}>{atelier.hands.lines[2]}</span>
        <span class="l4" use:reveal={{ delay: 0.18 }}>{atelier.hands.lines[3]}</span>
      </h2>
      <p use:reveal={{ delay: 0.24 }}>{atelier.hands.paragraph}</p>
      <button
        class="text-link"
        type="button"
        onclick={scrollToCrafted}
        use:reveal={{ delay: 0.3 }}
      >
        {atelier.hands.link}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 17L17 7M17 7H8M17 7v9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div class="hands-grid">
      {#each atelier.hands.images as image, i (image.src)}
        <div class="media-frame frame" use:maskReveal={{ delay: (i % 2) * motion.stagger + 0.05 }}>
          <img src={image.src} alt={image.alt} loading="lazy" />
        </div>
      {/each}
    </div>
  </section>

  <section class="banner" aria-label="Atelier workshop">
    <img
      src={atelier.banner.src}
      alt={atelier.banner.alt}
      loading="lazy"
      use:parallax={{ amount: 7 }}
    />
  </section>

  <section class="crafted" id="crafted" aria-label="Crafted in detail">
    <div class="crafted-head">
      <span class="label-caps" use:reveal>{atelier.crafted.eyebrow}</span>
      <h2 class="serif-display title" use:reveal={{ delay: 0.08 }}>
        {atelier.crafted.title}
      </h2>
    </div>

    <div class="crafted-cols">
      <div class="lead-image">
        <div class="media-frame frame" use:maskReveal>
          <img
            src={atelier.crafted.lead.src}
            alt={atelier.crafted.lead.alt}
            loading="lazy"
          />
        </div>
      </div>

      <div class="detail-card" use:reveal={{ delay: 0.14, y: 60 }}>
        <div class="media-frame frame" use:maskReveal={{ delay: 0.14 }}>
          <img
            src={atelier.crafted.detail.src}
            alt={atelier.crafted.detail.alt}
            loading="lazy"
          />
        </div>
        <div class="caption">
          <span class="t">{atelier.crafted.detail.title}</span>
          <span class="d">{atelier.crafted.detail.body}</span>
        </div>
      </div>

      <div class="crafted-side">
        <h3 use:reveal={{ delay: 0.1 }}>{atelier.crafted.side.title}</h3>
        <p use:reveal={{ delay: 0.18 }}>{atelier.crafted.side.body}</p>
        <div class="stat" use:reveal={{ delay: 0.26 }}>
          {atelier.crafted.side.stat}
        </div>
      </div>
    </div>
  </section>
</div>
