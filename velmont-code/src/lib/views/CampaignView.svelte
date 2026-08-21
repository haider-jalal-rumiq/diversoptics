<script>
  import { onMount, tick } from "svelte";
  import OutlineWord from "$lib/components/OutlineWord.svelte";
  import { campaign } from "$lib/content.js";
  import { gsap, prefersReducedMotion, reveal, maskReveal } from "$lib/motion.js";

  let index = $state(0);
  /** @type {ReturnType<typeof setInterval> | undefined} */
  let timer;
  /** @type {HTMLElement | undefined} */
  let copyEl = $state();

  const total = campaign.items.length;
  let item = $derived(campaign.items[index]);
  let next = $derived(campaign.items[(index + 1) % total]);

  async function advance() {
    index = (index + 1) % total;
    if (!prefersReducedMotion() && copyEl) {
      await tick();
      gsap.fromTo(
        copyEl,
        { opacity: 0, y: 34 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
      );
    }
  }

  onMount(() => {
    if (!prefersReducedMotion()) {
      timer = setInterval(() => {
        advance();
      }, campaign.slideMs);
    }
    return () => clearInterval(timer);
  });

  function restart() {
    clearInterval(timer);
    if (!prefersReducedMotion()) {
      timer = setInterval(() => {
        advance();
      }, campaign.slideMs);
    }
  }

  function onNextClick() {
    advance();
    restart();
  }
</script>

<div class="theme-dark" id="campaign">
  <section class="hero campaign-hero" aria-label="Campaign hero">
    <div class="hero-word" use:reveal={{ y: 40 }}>
      <span class="word"><OutlineWord word={campaign.heroWord} tone="ink" /></span>
    </div>

    <div class="mini-card mini-card--left" aria-hidden="true" use:reveal={{ delay: 0.14, y: 30 }}>
      <span class="frame">
        <img src={item.src} alt="" loading="eager" />
      </span>
      <span class="caption">
        <span class="label-caps" style:opacity="0.6">CAMPAIGN {item.index}</span>
        <span class="serif-display" style:font-size="1.05rem">{item.name}</span>
      </span>
    </div>

    <div class="mini-card mini-card--right" aria-hidden="true" use:reveal={{ delay: 0.24, y: 30 }}>
      <span class="frame">
        <img src={next.src} alt="" loading="lazy" />
        <span class="badge">{next.index}</span>
      </span>
    </div>
  </section>

  <section class="campaign-stage" aria-label="Campaign detail" aria-live="polite">
    <div class="visual">
      <div class="media-frame frame" use:maskReveal>
        {#each campaign.items as slide, i (slide.name)}
          <img
            src={slide.src}
            alt={i === index ? slide.alt : ""}
            class:is-active={i === index}
            loading={i === 0 ? "eager" : "lazy"}
          />
        {/each}
      </div>
    </div>

    <div class="campaign-copy" bind:this={copyEl}>
      {#key index}
        <span class="eyebrow label-caps">CAMPAIGN {item.index}</span>
        <h2 class="name">{item.name}</h2>
        <p>{item.body}</p>
        <button class="text-link" type="button" onclick={onNextClick}>
          {campaign.exploreLabel}
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
      {/key}
    </div>

    <button
      class="campaign-next"
      type="button"
      onclick={onNextClick}
      aria-label="Next campaign: {next.name}"
      use:reveal={{ y: 30 }}
    >
      <span class="media-frame frame">
        <img src={next.src} alt="" loading="lazy" />
      </span>
      <span class="meta">
        <span class="label-caps" style:opacity="0.55">CAMPAIGN {next.index}</span>
        <span class="serif-display" style:font-size="0.98rem">{next.name}</span>
      </span>
    </button>
  </section>
</div>
