<script>
  import { onMount } from "svelte";

  let { word, tone = "ink", scale = 1 } = $props();

  // Width-fit sizing: reference giant words span ~86vw regardless of length.
  let fontSize = $derived(
    `min(${((86 * scale) / Math.max(word.length * 0.68, 1)).toFixed(2)}vw, ${30 * scale}vh)`
  );

  // Glyph widths vary per word; shrink-to-fit so the word never overflows
  // narrow viewports (measured after fonts load).
  /** @type {HTMLElement | undefined} */
  let el = $state();
  let fit = $state(1);

  onMount(() => {
    if (!el) return;
    const node = el;
    const update = () => {
      // scrollWidth is layout size (transforms do not affect it).
      const full = node.scrollWidth;
      const max = Math.min(window.innerWidth * 0.94, node.parentElement?.clientWidth ?? Infinity);
      if (!Number.isFinite(max) || max <= 0 || full <= 0) return;
      fit = Math.min(1, max / Math.max(full, 1));
    };
    update();
    document.fonts?.ready.then(update);
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  });
</script>

<span
  bind:this={el}
  class="outline-word {tone === 'ink' ? 'outline-word--ink' : 'outline-word--paper'}"
  style:font-size={fontSize}
  style:transform="scale({fit})"
  aria-hidden="true">{word}</span
>
