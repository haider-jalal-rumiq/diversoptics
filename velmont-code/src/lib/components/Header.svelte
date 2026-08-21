<script>
  import { onMount } from "svelte";
  import { brand, nav } from "$lib/content.js";

  // Single-page fixed header. It starts over the dark hero and switches
  // to ink whenever a light section crosses the header strip.
  let onPaper = $state(false);

  onMount(() => {
    const lightBlocks = document.querySelectorAll("[data-theme-block='light']");
    if (!lightBlocks.length) return;
    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Ignore zero-area edge touches at section boundaries.
          visible.set(entry.target, entry.intersectionRatio > 0.001);
        });
        onPaper = [...visible.values()].some(Boolean);
      },
      // Observe only the top strip of the viewport where the header lives.
      { rootMargin: "0px 0px -92% 0px", threshold: [0, 0.001, 1] }
    );
    lightBlocks.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
</script>

<header class="site-head" class:site-head--onpaper={onPaper}>
  <a class="brand-lockup" href="#top" aria-label="Velmont Horlogerie — back to top">
    <span class="brand-name">{brand.name}</span>
    <span class="brand-sub">{brand.descriptor}</span>
  </a>

  <nav class="site-nav" aria-label="Primary">
    <a class="nav-link" href="#collections">{nav.collections}</a>
    <a class="nav-link" href="#atelier">{nav.atelier}</a>
    <a class="nav-link" href="#campaign">{nav.campaign}</a>
  </nav>
</header>
