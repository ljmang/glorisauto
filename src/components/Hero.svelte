<script lang="ts">
  import { ArrowRight, Pause, Play } from 'lucide-svelte';

  export let media: { type: 'image' | 'video'; src: string; poster?: string } | null = null;
  export let title = '';
  export let subtitle: string | null = null;
  export let cta = '';
  export let ctaHref = '/';
  export let secondaryCta = '';
  export let secondaryCtaHref = '/';

  let mobileVideo: HTMLVideoElement | null = null;
  let mobileVideoPlaying = false;

  async function toggleMobileVideo() {
    if (!mobileVideo) return;

    if (mobileVideo.paused) {
      try {
        await mobileVideo.play();
        mobileVideoPlaying = true;
      } catch {
        mobileVideoPlaying = false;
      }
      return;
    }

    mobileVideo.pause();
    mobileVideoPlaying = false;
  }
</script>

<div class="w-full relative h-[520px] md:h-[640px] 2xl:h-[800px] overflow-hidden bg-black">
  {#if media?.type === 'video' && media.src}
    <div class="relative h-full md:hidden">
      <video
        bind:this={mobileVideo}
        class="h-full w-full object-cover md:hidden"
        src={media.src}
        poster={media.poster ?? ''}
        muted
        playsinline
        preload="metadata"
        onpause={() => (mobileVideoPlaying = false)}
        onplay={() => (mobileVideoPlaying = true)}
      ></video>
      <button
        type="button"
        class="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/70 bg-black/45 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-white"
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

    <div class="hidden h-full overflow-hidden md:block">
      <video
        class="h-full w-full object-cover"
        poster={media.poster ?? ''}
        muted
        loop
        playsinline
        autoplay
        preload="metadata"
      >
        <source src={media.src} media="(min-width: 768px)" />
      </video>
    </div>
  {:else if media?.src}
    <img src={media.src} alt="" class="h-full w-full object-cover" />
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
