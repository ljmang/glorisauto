<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowRight, Pause, Play } from 'lucide-svelte';

  export let media: { type: 'image' | 'video'; src: string; poster?: string } | null = null;
  export let defaultBackground: string | null = null;
  export let title = '';
  export let subtitle: string | null = null;
  export let cta = '';
  export let ctaHref = '/';
  export let secondaryCta = '';
  export let secondaryCtaHref = '/';

  let heroVideo: HTMLVideoElement | null = null;
  let heroVideoReady = false;
  let mobileVideoPlaying = false;
  let heroVideoLoadStarted = false;

  function loadHeroVideo() {
    if (!heroVideo || heroVideoLoadStarted || media?.type !== 'video' || !media.src) return;

    heroVideoLoadStarted = true;
    heroVideo.src = media.src;
    heroVideo.load();
  }

  async function toggleMobileVideo() {
    if (!heroVideo) return;

    if (heroVideo.paused) {
      // A direct interaction should start loading immediately instead of waiting
      // for the idle-time preload used by the desktop background video.
      loadHeroVideo();
      try {
        await heroVideo.play();
        mobileVideoPlaying = true;
      } catch {
        mobileVideoPlaying = false;
      }
      return;
    }

    heroVideo.pause();
    mobileVideoPlaying = false;
  }

  $: videoPoster = media?.poster || defaultBackground || '';

  onMount(() => {
    if (media?.type !== 'video' || !media.src) return;

    const loadAfterIdle = () => {
      loadHeroVideo();

      // Keep the existing behavior on larger screens: the background video
      // starts automatically, but only after the poster has had a chance to
      // become the first meaningful paint/LCP element.
      if (window.matchMedia('(min-width: 768px)').matches && heroVideo) {
        heroVideo.play().catch(() => undefined);
      }
    };

    const requestIdle = (window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    }).requestIdleCallback;

    if (requestIdle) {
      const idleHandle = requestIdle(loadAfterIdle, { timeout: 2000 });
      const cancelIdle = (window as Window & {
        cancelIdleCallback?: (handle: number) => void;
      }).cancelIdleCallback;
      return () => {
        cancelIdle?.(idleHandle);
      };
    }

    const timeoutHandle = window.setTimeout(loadAfterIdle, 1200);
    return () => window.clearTimeout(timeoutHandle);
  });
</script>

<div class="w-full relative h-[520px] md:h-[640px] 2xl:h-[800px] overflow-hidden bg-black">
  {#if media?.type === 'video' && videoPoster}
    <img
      src={videoPoster}
      alt=""
      class="absolute inset-0 z-0 h-full w-full object-cover"
      aria-hidden="true"
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
  {:else if !media?.src && defaultBackground}
    <img
      src={defaultBackground}
      alt=""
      class="absolute inset-0 z-0 h-full w-full object-cover"
      aria-hidden="true"
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
  {/if}

  {#if media?.type === 'video' && media.src}
    <div class="relative h-full">
      <video
        bind:this={heroVideo}
        class={`relative z-[1] h-full w-full object-cover transition-opacity duration-300 ${heroVideoReady ? 'opacity-100' : 'opacity-0'}`}
        poster={videoPoster}
        muted
        loop
        playsinline
        preload="none"
        onloadeddata={() => (heroVideoReady = true)}
        onpause={() => (mobileVideoPlaying = false)}
        onplay={() => (mobileVideoPlaying = true)}
      ></video>
      <button
        type="button"
        class="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/70 bg-black/45 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-white md:hidden"
        aria-label={mobileVideoPlaying ? 'Pause hero video' : 'Play hero video'}
        aria-pressed={mobileVideoPlaying}
        onclick={toggleMobileVideo}
      >
        {#if mobileVideoPlaying}
          <Pause class="h-5 w-5" strokeWidth={2.4} />
        {:else}
          <Play class="h-5 w-5 translate-x-px" strokeWidth={2.4} />
        {/if}
      </button>
    </div>
  {:else if media?.src}
    <img
      src={media.src}
      alt=""
      class="relative h-full w-full object-cover"
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
  {/if}

  <div
    class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pointer-events-none z-10"
    aria-hidden="true"
  >
    <div class="container mx-auto px-4 py-10 md:py-20 pointer-events-auto">
      <div class="md:max-w-4xl">
        {#if title}
          <h1 class="text-4xl lg:text-6xl font-bold text-white drop-shadow-md mb-4">
            {title}
          </h1>
        {/if}
        {#if subtitle}
          <p class="text-lg sm:text-xl text-white/95 drop-shadow mb-8">
            {subtitle}
          </p>
        {/if}
        {#if cta || secondaryCta}
          <div class="flex flex-col sm:flex-row sm:flex-wrap gap-3">
            {#if cta}
              <a
                href={ctaHref}
                class="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold bg-white rounded-lg shadow-lg hover:bg-orange-400 hover:text-white transition-colors no-underline"
              >
                <span>{cta}</span>
                <ArrowRight class="w-5 h-5" />
              </a>
            {/if}
            {#if secondaryCta}
              <a
                href={secondaryCtaHref}
                class="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white border border-white/80 rounded-lg shadow-lg bg-white/10 backdrop-blur-sm hover:bg-white hover:text-orange-600 transition-colors no-underline"
              >
                <span>{secondaryCta}</span>
                <ArrowRight class="w-5 h-5" />
              </a>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
