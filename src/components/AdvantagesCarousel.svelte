<script lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';

  interface Item {
    title?: string;
    description?: string;
    contentHtml?: string;
    imageSrc?: string;
    imageAlt?: string;
  }

  let { items = [], title = '' }: { items?: Item[]; title?: string } = $props();

  let currentIndex = $state(0);
  let touchStartX = 0;
  let touchEndX = 0;

  const len = $derived(Math.max(0, items.length));
  const index = $derived(len === 0 ? 0 : ((currentIndex % len) + len) % len);
  const currentItem = $derived(items[index] ?? null);

  function goPrev() {
    if (len <= 1) return;
    currentIndex = index - 1;
    if (currentIndex < 0) currentIndex = len - 1;
  }

  function goNext() {
    if (len <= 1) return;
    currentIndex = index + 1;
    if (currentIndex >= len) currentIndex = 0;
  }

  function onTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }

  function onTouchMove(e: TouchEvent) {
    touchEndX = e.touches[0].clientX;
  }

  function onTouchEnd() {
    const diff = touchStartX - touchEndX;
    const threshold = 50;
    if (diff > threshold) goNext();
    else if (diff < -threshold) goPrev();
  }
</script>

{#if len === 0}
  <!-- no items -->
{:else}
  <section class="mb-12" aria-label="Advantages carousel">
    {#if title}
      <h2 class="text-3xl font-bold text-center mb-8">{title}</h2>
    {/if}

    <div
      class="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={title || 'Advantages'}
      ontouchstart={onTouchStart}
      ontouchmove={onTouchMove}
      ontouchend={onTouchEnd}
    >
      {#if len > 1}
        <button
          type="button"
          class="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-orange-500 hover:text-white transition-colors"
          aria-label="Previous"
          onclick={goPrev}
        >
          <ChevronLeft class="w-6 h-6" />
        </button>
      {/if}

      <div class="max-w-4xl mx-auto px-4 md:px-14 grid grid-cols-1 md:grid-cols-2 gap-6 items-center min-h-[16rem]">
        {#if currentItem?.imageSrc}
          <div class="flex justify-center order-2 md:order-1">
            <img
              src={currentItem.imageSrc}
              alt={currentItem.imageAlt || currentItem.title || ''}
              class="max-h-80 w-auto object-contain"
            />
          </div>
        {/if}
        <div class="prose prose-lg max-w-none order-1 md:order-2">
          {#if currentItem?.title}
            <h3 class="text-xl font-bold">{currentItem.title}</h3>
          {/if}
          {#if currentItem?.contentHtml}
            <div class="blocks-content text-gray-700">{@html currentItem.contentHtml}</div>
          {:else if currentItem?.description}
            <div class="text-gray-700 whitespace-pre-wrap">{currentItem.description}</div>
          {/if}
        </div>
      </div>

      {#if len > 1}
        <button
          type="button"
          class="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-orange-500 hover:text-white transition-colors"
          aria-label="Next"
          onclick={goNext}
        >
          <ChevronRight class="w-6 h-6" />
        </button>
      {/if}
    </div>

    {#if len > 1}
      <div class="flex justify-center gap-2 mt-6" role="tablist" aria-label="Slide navigation">
        {#each items as _, i}
          <button
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label="Go to slide {i + 1}"
            class="h-2.5 w-2.5 rounded-full transition-all {i === index ? 'bg-orange-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'}"
            onclick={() => (currentIndex = i)}
          >
            <span class="sr-only">Slide {i + 1}</span>
          </button>
        {/each}
      </div>
    {/if}
  </section>
{/if}
