<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import type { Locale } from '@/i18n/config';
  import type { VideoAttributes } from '@/types/content';
  import {
    getMediaUrlFromField,
    getImageSrcSet,
    parseImage,
    parseMedia,
    resolveLocalizedImageAltText,
  } from '@/utils/strapiApi';
  import { extractYouTubeVideoId } from '@/utils/youtubeEmbed';
  import VideoPlayerModal, { type VideoPlayerItem } from './VideoPlayerModal.svelte';

  interface Props {
    title: string;
    videos: VideoAttributes[];
    locale: Locale;
    playLabel: string;
    previousLabel: string;
    nextLabel: string;
    closeLabel: string;
    videoUnavailableLabel: string;
  }

  export let title: Props['title'];
  export let videos: Props['videos'];
  export let locale: Props['locale'];
  export let playLabel: Props['playLabel'];
  export let previousLabel: Props['previousLabel'];
  export let nextLabel: Props['nextLabel'];
  export let closeLabel: Props['closeLabel'];
  export let videoUnavailableLabel: Props['videoUnavailableLabel'];

  type VideoCard = {
    id: string;
    title: string;
    image?: ReturnType<typeof parseImage>;
    imageAlt: string;
    publishedAt?: string;
    publishedAtValue?: string;
    player: VideoPlayerItem;
  };

  let selectedVideo: VideoPlayerItem | null = null;
  let track: HTMLDivElement;
  let canScrollLeft = false;
  let canScrollRight = false;

  function formatPublishedAt(value: string | undefined): string {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  function getVideoId(video: VideoAttributes, index: number): string {
    const record = video as VideoAttributes & { id?: number; documentId?: string };
    return String(record.documentId || record.id || `${video.category}-${index}`);
  }

  function createVideoCard(video: VideoAttributes, index: number): VideoCard {
    const image = parseImage(video.cover);
    const uploadedVideo = parseMedia(video.videoFile);
    const youtubeId = video.sourceType === 'youtube' ? extractYouTubeVideoId(video.youtubeUrl) : null;
    const poster = image?.src || uploadedVideo?.poster || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : '');
    const videoSrc = video.sourceType === 'upload' && uploadedVideo?.type === 'video' ? uploadedVideo.src : undefined;
    const imageAlt = resolveLocalizedImageAltText(locale, video.coverAlt, image?.alt, video.title);

    return {
      id: getVideoId(video, index),
      title: video.title,
      image,
      imageAlt,
      publishedAt: formatPublishedAt(video.publishedAt),
      publishedAtValue: video.publishedAt,
      player: {
        title: video.title,
        description: video.description,
        poster: poster || undefined,
        videoSrc,
        captionsSrc: getMediaUrlFromField(video.captionsFile) || undefined,
        youtubeId: youtubeId || undefined,
      },
    };
  }

  $: cardVideos = videos.map(createVideoCard);

  function updateScrollButtons(): void {
    if (!track) return;

    const edgeTolerance = 4;
    canScrollLeft = track.scrollLeft > edgeTolerance;
    canScrollRight = track.scrollLeft + track.clientWidth < track.scrollWidth - edgeTolerance;
  }

  function scrollRail(direction: -1 | 1): void {
    if (!track) return;

    const firstCard = track.querySelector<HTMLElement>('[data-home-video-card]');
    const trackStyles = window.getComputedStyle(track);
    const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;
    const step = firstCard ? firstCard.getBoundingClientRect().width + gap : track.clientWidth * 0.75;

    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  function openVideo(video: VideoPlayerItem): void {
    selectedVideo = video;
  }

  function closeVideo(): void {
    selectedVideo = null;
  }

  onMount(() => {
    updateScrollButtons();
    track.addEventListener('scroll', updateScrollButtons, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(track);

    return () => {
      track?.removeEventListener('scroll', updateScrollButtons);
      resizeObserver.disconnect();
    };
  });
</script>

<div class="home-video-rail-shell relative">
  <div
    bind:this={track}
    id="home-video-rail-track"
    class="home-video-rail-bleed flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3 scroll-smooth md:gap-8"
    data-home-video-track
    role="region"
    aria-label={title}
  >
    {#each cardVideos as video (video.id)}
      <article class="home-video-card min-w-0 snap-start" data-home-video-card>
        <button
          type="button"
          class="group block w-full min-w-0 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-4"
          on:click={() => openVideo(video.player)}
        >
          <span class="sr-only">{playLabel}: </span>
          <div class="aspect-video overflow-hidden bg-gray-100">
            {#if video.image?.src}
              <img
                src={video.image.src}
                srcset={getImageSrcSet(video.image)}
                sizes="(min-width: 768px) 42vw, 82vw"
                alt={video.imageAlt}
                width={video.image.width}
                height={video.image.height}
                class="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
            {:else if video.player.poster}
              <img
                src={video.player.poster}
                alt={video.imageAlt}
                class="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
            {:else}
              <div class="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-gray-500">
                {video.title}
              </div>
            {/if}
          </div>

          <h3 class="mt-4 min-h-[3.5rem] text-xl font-semibold leading-snug text-gray-950">
            {video.title}
          </h3>
          {#if video.publishedAt}
            <time class="mt-2 block text-base text-gray-600" datetime={video.publishedAtValue}>
              {video.publishedAt}
            </time>
          {/if}
        </button>
      </article>
    {/each}
  </div>

  {#if cardVideos.length > 1}
    <button
      type="button"
      class="home-video-rail-control left-2"
      aria-label={previousLabel}
      aria-controls="home-video-rail-track"
      disabled={!canScrollLeft}
      on:click={() => scrollRail(-1)}
    >
      <ChevronLeft class="h-5 w-5" aria-hidden="true" />
    </button>
    <button
      type="button"
      class="home-video-rail-control right-2"
      aria-label={nextLabel}
      aria-controls="home-video-rail-track"
      disabled={!canScrollRight}
      on:click={() => scrollRail(1)}
    >
      <ChevronRight class="h-5 w-5" aria-hidden="true" />
    </button>
  {/if}
</div>

{#if selectedVideo}
  <VideoPlayerModal
    video={selectedVideo}
    labels={{ close: closeLabel, videoUnavailable: videoUnavailableLabel }}
    on:close={closeVideo}
  />
{/if}

<style>
  .home-video-rail-bleed {
    width: calc(100% + (100vw - 100%) / 2);
    max-width: 100vw;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .home-video-rail-bleed::-webkit-scrollbar {
    display: none;
  }

  .home-video-card {
    flex: 0 0 42%;
  }

  .home-video-rail-control {
    position: absolute;
    top: 34%;
    z-index: 10;
    display: none;
    height: 2.75rem;
    width: 2.75rem;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background: rgb(255 255 255 / 0.96);
    color: rgb(17 24 39);
    border: 1px solid rgb(229 231 235);
    box-shadow: 0 8px 24px rgb(15 23 42 / 0.14);
    transition: color 160ms ease, opacity 160ms ease, transform 160ms ease;
  }

  .home-video-rail-control:hover:not(:disabled) {
    color: rgb(234 88 12);
    transform: translateY(-1px);
  }

  .home-video-rail-control:focus-visible {
    outline: 2px solid rgb(249 115 22);
    outline-offset: 3px;
  }

  .home-video-rail-control:disabled {
    cursor: not-allowed;
    opacity: 0.35;
  }

  @media (max-width: 767px) {
    .home-video-card {
      flex-basis: 82vw;
    }
  }

  @media (min-width: 768px) {
    .home-video-rail-control {
      display: flex;
    }
  }
</style>
