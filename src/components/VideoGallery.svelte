<script lang="ts">
  import VideoPlayerModal, { type VideoPlayerItem } from './VideoPlayerModal.svelte';

  export interface VideoGalleryItem extends VideoPlayerItem {
    id: string;
    title: string;
    category: 'Product Demos' | 'Application Cases';
    posterAlt: string;
    date?: string;
    publishedAt?: string;
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

  const categoryOrder: Array<VideoGalleryItem['category']> = ['Product Demos', 'Application Cases'];
  let selectedVideo: VideoGalleryItem | null = null;

  $: groups = categoryOrder.map((category) => ({
    category,
    label: category === 'Application Cases' ? labels.caseStudy : labels.productIntro,
    items: videos.filter((video) => video.category === category),
  }));

  function openVideo(video: VideoGalleryItem): void {
    selectedVideo = video;
  }

  function closeVideo(): void {
    selectedVideo = null;
  }

</script>

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
  <VideoPlayerModal
    video={selectedVideo}
    labels={{ close: labels.close, videoUnavailable: labels.videoUnavailable }}
    on:close={closeVideo}
  />
{/if}
