<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Play, X } from 'lucide-svelte';

  export interface VideoGalleryItem {
    id: string;
    title: string;
    description?: string;
    category: 'case-study' | 'product-intro';
    poster: string;
    posterAlt: string;
    date?: string;
    publishedAt?: string;
    sourceType: 'upload' | 'youtube';
    videoSrc?: string;
    captionsSrc?: string;
    youtubeId?: string;
  }

  export interface VideoGalleryLabels {
    caseStudy: string;
    productIntro: string;
    play: string;
    close: string;
    noVideos: string;
    videoUnavailable: string;
  }

  export let videos: VideoGalleryItem[] = [];
  export let labels: VideoGalleryLabels;

  const categoryOrder: Array<VideoGalleryItem['category']> = ['case-study', 'product-intro'];
  let selectedVideo: VideoGalleryItem | null = null;
  let closeButton: HTMLButtonElement;

  $: groups = categoryOrder.map((category) => ({
    category,
    label: category === 'case-study' ? labels.caseStudy : labels.productIntro,
    items: videos.filter((video) => video.category === category),
  }));

  $: if (typeof document !== 'undefined') {
    document.body.classList.toggle('overflow-hidden', Boolean(selectedVideo));
  }

  async function openVideo(video: VideoGalleryItem): Promise<void> {
    selectedVideo = video;
    await tick();
    closeButton?.focus();
  }

  function closeVideo(): void {
    selectedVideo = null;
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && selectedVideo) {
      closeVideo();
    }
  }

  function getYouTubeEmbedUrl(videoId: string): string {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
  }

  onMount(() => {
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if videos.length > 0}
  <div class="space-y-16 lg:space-y-20">
    {#each groups as group}
      {#if group.items.length > 0}
        <section aria-labelledby={`video-group-${group.category}`}>
          <div class="mb-8 flex items-center border-b border-gray-300 pb-4">
            <h2 id={`video-group-${group.category}`} class="text-2xl font-bold text-gray-950 lg:text-3xl">
              {group.label}
            </h2>
          </div>

          <div class="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            {#each group.items as video (video.id)}
              <article class="min-w-0">
                <button
                  type="button"
                  class="group relative block aspect-video w-full overflow-hidden rounded-md bg-gray-200 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-4"
                  aria-label={`${labels.play}: ${video.title}`}
                  on:click={() => openVideo(video)}
                >
                  {#if video.poster}
                    <img
                      src={video.poster}
                      alt={video.posterAlt}
                      class="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  {:else}
                    <span class="flex h-full w-full items-center justify-center bg-gray-300 text-sm font-semibold text-gray-600">
                      {video.title}
                    </span>
                  {/if}
                  <span class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/15 group-focus:bg-black/15">
                    <span class="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-orange-500 shadow-lg transition-transform duration-200 group-hover:scale-105 group-focus:scale-105">
                      <Play class="ml-1 h-6 w-6 fill-current" aria-hidden="true" />
                    </span>
                  </span>
                </button>

                <h3 class="mt-4 min-h-[3.5rem] text-lg font-semibold leading-snug text-gray-950 lg:text-xl">
                  {video.title}
                </h3>
                {#if video.date}
                  <time class="mt-2 block text-base text-gray-400" datetime={video.publishedAt}>
                    {video.date}
                  </time>
                {/if}
              </article>
            {/each}
          </div>
        </section>
      {/if}
    {/each}
  </div>
{:else}
  <div class="border-t border-gray-300 py-16 text-center text-gray-500">
    {labels.noVideos}
  </div>
{/if}

{#if selectedVideo}
  <div
    class="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 sm:p-8"
    role="presentation"
  >
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
        {#if selectedVideo.youtubeId}
          <iframe
            src={getYouTubeEmbedUrl(selectedVideo.youtubeId)}
            title={selectedVideo.title}
            class="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        {:else if selectedVideo.videoSrc}
          <video
            src={selectedVideo.videoSrc}
            poster={selectedVideo.poster}
            class="h-full w-full"
            controls
            autoplay
            playsinline
          >
            <track kind="captions" src={selectedVideo.captionsSrc || ''} srclang="en" label="English captions" />
          </video>
        {:else}
          <div class="flex h-full items-center justify-center px-6 text-center text-white">
            {labels.videoUnavailable}
          </div>
        {/if}
      </div>

      <div class="bg-white px-5 py-5 sm:px-8 sm:py-6">
        <h2 id="video-dialog-title" class="text-xl font-bold text-gray-950 sm:text-2xl">
          {selectedVideo.title}
        </h2>
        {#if selectedVideo.description}
          <p class="mt-3 max-w-3xl text-base leading-7 text-gray-600">
            {selectedVideo.description}
          </p>
        {/if}
      </div>
    </div>
  </div>
{/if}
