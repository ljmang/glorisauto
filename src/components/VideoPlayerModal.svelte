<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount, tick } from 'svelte';
  import { X } from 'lucide-svelte';

  export interface VideoPlayerItem {
    title: string;
    description?: string;
    poster?: string;
    videoSrc?: string;
    captionsSrc?: string;
    youtubeId?: string;
  }

  export interface VideoPlayerModalLabels {
    close: string;
    videoUnavailable: string;
  }

  export let video: VideoPlayerItem;
  export let labels: VideoPlayerModalLabels;

  const dispatch = createEventDispatcher<{ close: void }>();
  let closeButton: HTMLButtonElement;

  function closeVideo(): void {
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      closeVideo();
    }
  }

  function getYouTubeEmbedUrl(videoId: string): string {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
  }

onMount(() => {
  document.body.classList.add('overflow-hidden');
  void tick().then(() => closeButton?.focus());

  return () => {
    document.body.classList.remove('overflow-hidden');
  };
});
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 sm:p-8" role="presentation">
  <button
    type="button"
    class="absolute inset-0 h-full w-full cursor-default"
    aria-label={labels.close}
    on:click={closeVideo}
  ></button>

  <div
    class="relative z-10 w-full max-w-5xl overflow-hidden rounded-lg bg-gray-950 shadow-2xl"
    role="dialog"
    aria-modal="true"
    aria-labelledby="video-dialog-title"
    tabindex="-1"
  >
    <button
      bind:this={closeButton}
      type="button"
      class="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-white"
      aria-label={labels.close}
      on:click={closeVideo}
    >
      <X class="h-6 w-6" aria-hidden="true" />
    </button>

    <div class="aspect-video w-full bg-black">
      {#if video.youtubeId}
        <iframe
          src={getYouTubeEmbedUrl(video.youtubeId)}
          title={video.title}
          class="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      {:else if video.videoSrc}
        <video
          src={video.videoSrc}
          poster={video.poster}
          class="h-full w-full"
          controls
          autoplay
          playsinline
        >
          {#if video.captionsSrc}
            <track kind="captions" src={video.captionsSrc} srclang="en" label="English captions" />
          {/if}
        </video>
      {:else}
        <div class="flex h-full items-center justify-center px-6 text-center text-white">
          {labels.videoUnavailable}
        </div>
      {/if}
    </div>

    <div class="bg-white px-5 py-5 sm:px-8 sm:py-6">
      <h2 id="video-dialog-title" class="text-xl font-bold text-gray-950 sm:text-2xl">
        {video.title}
      </h2>
      {#if video.description}
        <p class="mt-3 max-w-3xl text-base leading-7 text-gray-600">
          {video.description}
        </p>
      {/if}
    </div>
  </div>
</div>
