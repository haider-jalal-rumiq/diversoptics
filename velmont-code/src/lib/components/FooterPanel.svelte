<script>
  import OutlineWord from "./OutlineWord.svelte";
  import { brand } from "$lib/content.js";
  import { prefersReducedMotion, reveal } from "$lib/motion.js";

  let { tone = "ink" } = $props();
  let word = $derived(tone === "ink" ? brand.footerWord : brand.footerWordAtelier);

  /** @param {string} id */
  function scrollToSection(id) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
</script>

<footer class="site-footer">
  <div class="footer-main">
    <div class="footer-brand" use:reveal>
      <span class="footer-logo serif-display"
        >{brand.name} <span class="desc">{brand.descriptor}</span></span
      >
      <p class="footer-tagline">{brand.footerTagline}</p>
    </div>

    <nav class="footer-col" aria-label="Footer" use:reveal={{ delay: 0.08 }}>
      <span class="footer-head label-caps">{brand.footerNavTitle}</span>
      {#each brand.footerNav as link (link.target)}
        <button
          class="footer-link"
          type="button"
          onclick={() => scrollToSection(link.target)}
        >
          {link.label}
        </button>
      {/each}
    </nav>

    <div class="footer-col" use:reveal={{ delay: 0.16 }}>
      <span class="footer-head label-caps">{brand.footerContactTitle}</span>
      {#each brand.footerContact as line (line)}
        <span class="footer-line">{line}</span>
      {/each}
    </div>

    <div class="footer-col" use:reveal={{ delay: 0.24 }}>
      <span class="footer-head label-caps">{brand.footerSocialsTitle}</span>
      {#each brand.footerSocials as social (social.label)}
        <a
          class="footer-link"
          href={social.href}
          target="_blank"
          rel="noreferrer noopener"
        >
          {social.label}
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M7 17L17 7M17 7H8M17 7v9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>
      {/each}
    </div>
  </div>

  <div class="word-footer">
    <div use:reveal={{ y: 60, duration: 1 }}>
      <span class="word"><OutlineWord {word} {tone} scale={0.9} /></span>
    </div>
  </div>

  <div class="footer-bar">
    <span class="footer-legal">{brand.legalLine}</span>
    <span class="footer-note">{brand.footerNote}</span>
    <button
      class="footer-link footer-top"
      type="button"
      onclick={() => scrollToSection("top")}
    >
      {brand.backToTop}
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 19V5M5 12l7-7 7 7"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</footer>
