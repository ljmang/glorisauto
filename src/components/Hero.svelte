<script lang="ts">
  import { ArrowRight } from 'lucide-svelte';

  export let media: { type: 'image' | 'video'; src: string; poster?: string } | null = null;
  export let title = '';
  export let subtitle: string | null = null;
  export let cta = '';
  export let ctaHref = '/';
</script>

<div class="w-full relative h-128 md:h-full overflow-hidden bg-black">
  {#if media?.type === 'video' && media.src}
    <div class="absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true">
      <video
        class="w-full h-full object-cover scale-110 blur-md"
        src={media.src}
        poster={media.poster ?? ''}
        muted
        loop
        playsinline
        autoplay
      ></video>
      <div class="absolute inset-0 bg-black/35"></div>
    </div>

    <div class="relative z-[1] h-full overflow-hidden md:mx-auto md:w-[calc(100%-2rem)] lg:max-w-[100rem]">
      <video
        class="w-full h-full object-cover"
        src={media.src}
        poster={media.poster ?? ''}
        muted
        loop
        playsinline
        autoplay
      ></video>
    </div>
  {:else if media?.src}
    <img src={media.src} alt="" class="h-120 lg:h-160 2xl:h-200 w-full object-cover" />
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
        {#if cta}
          <a
            href={ctaHref}
            class="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold bg-white rounded-lg shadow-lg hover:bg-orange-400 hover:text-white transition-colors no-underline"
          >
            <span>{cta}</span>
            <ArrowRight class="w-5 h-5" />
          </a>
        {/if}
      </div>
    </div>
  </div>
</div>
