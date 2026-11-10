<script>
  import { logoSlug } from "./providers.js";

  let { provider, url = null } = $props();
  let failedUrl = $state(false);
  let failedSlug = $state(false);
  let slug = $derived(logoSlug(provider));
  let letter = $derived(provider.replace(/[^a-z0-9]/gi, "").slice(0, 1).toUpperCase());

  $effect(() => {
    url;
    slug;
    failedUrl = false;
    failedSlug = false;
  });
</script>

{#if url && !failedUrl}
  <img src={url} alt="" width="20" height="20" onerror={() => (failedUrl = true)} />
{:else if slug && !failedSlug}
  <img
    src="https://cdn.simpleicons.org/{slug}/e4e4e7"
    alt=""
    width="20"
    height="20"
    onerror={() => (failedSlug = true)}
  />
{:else}
  <span class="mark">{letter}</span>
{/if}
