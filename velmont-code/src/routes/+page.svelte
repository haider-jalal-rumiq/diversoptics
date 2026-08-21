<script>
  import Header from "$lib/components/Header.svelte";
  import FooterPanel from "$lib/components/FooterPanel.svelte";
  import HomeView from "$lib/views/HomeView.svelte";
  import AtelierView from "$lib/views/AtelierView.svelte";
  import CampaignView from "$lib/views/CampaignView.svelte";
</script>

<svelte:head>
  <link rel="preload" as="image" href="/assets/velmont-hero-1.webp" />
</svelte:head>

<Header />

<main id="top">
  <!-- Single continuous landing: dark home, light atelier, dark campaign. -->
  <div class="theme-dark">
    <HomeView />
  </div>

  <AtelierView />

  <CampaignView />

  <div class="theme-dark">
    <FooterPanel tone="ink" />
  </div>
</main>
