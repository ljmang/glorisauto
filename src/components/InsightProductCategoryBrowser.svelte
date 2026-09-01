<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    InsightProductCategoryOption,
    InsightCardItem,
  } from '@/utils/insightProductCategories';

  let {
    options = [],
    articles = [],
    title = '',
    filterLabel = 'Product Category:',
    allLabel = 'All',
    readMoreLabel = 'Read more',
    noCoverLabel = 'No cover',
    noArticlesLabel = 'No articles found.',
    articleCountLabel = '{count} articles',
    previousPageLabel = 'Previous page',
    nextPageLabel = 'Next page',
    pageLabel = 'Page',
    pageSize = 12,
  }: {
    options?: InsightProductCategoryOption[];
    articles?: InsightCardItem[];
    title?: string;
    filterLabel?: string;
    allLabel?: string;
    readMoreLabel?: string;
    noCoverLabel?: string;
    noArticlesLabel?: string;
    articleCountLabel?: string;
    previousPageLabel?: string;
    nextPageLabel?: string;
    pageLabel?: string;
    pageSize?: number;
  } = $props();

  let selectedSlug = $state<string | null>(null);
  let currentPage = $state<number>(1);
  let containerRef = $state<HTMLElement | null>(null);

  // Filter out any option with count <= 0
  const validOptions = $derived(options.filter((opt) => opt.count > 0));

  const totalCount = $derived(articles.length);

  const activeArticles = $derived(
    selectedSlug
      ? articles.filter((article) => article.productCategorySlugs.includes(selectedSlug))
      : articles
  );

  const pageCount = $derived(Math.max(1, Math.ceil(activeArticles.length / pageSize)));

  const safeCurrentPage = $derived(Math.min(currentPage, pageCount));

  const pagedArticles = $derived(
    activeArticles.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)
  );

  function formatCount(count: number): string {
    return articleCountLabel.replace('{count}', String(count));
  }

  function isKnownCategory(slug: string): boolean {
    return validOptions.some((option) => option.slug === slug);
  }

  function selectCategory(slug: string | null) {
    selectedSlug = slug;
    currentPage = 1;

    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set('productCategory', slug);
    } else {
      url.searchParams.delete('productCategory');
    }
    url.searchParams.delete('page');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function goToPage(page: number) {
    currentPage = Math.max(1, Math.min(page, pageCount));

    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (currentPage > 1) {
      url.searchParams.set('page', String(currentPage));
    } else {
      url.searchParams.delete('page');
    }
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);

    if (containerRef) {
      containerRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function syncFromUrl() {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const requestedSlug = url.searchParams.get('productCategory');
    if (requestedSlug && isKnownCategory(requestedSlug)) {
      selectedSlug = requestedSlug;
    } else {
      selectedSlug = null;
    }

    const requestedPage = Number.parseInt(url.searchParams.get('page') || '1', 10);
    if (Number.isFinite(requestedPage) && requestedPage > 0) {
      currentPage = requestedPage;
    } else {
      currentPage = 1;
    }
  }

  onMount(() => {
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  });
</script>

<div class="mt-8" bind:this={containerRef}>
  {#if validOptions.length > 0}
    <!-- Product Category Filter Bar -->
    <div class="mb-8 flex flex-col gap-4 border border-slate-200 bg-white p-5 lg:flex-row lg:items-center lg:p-6">
      <p class="shrink-0 text-base font-bold text-slate-900 lg:w-48">
        {filterLabel.replace(/[:：]$/, '')}
      </p>
      <div class="flex min-w-0 flex-wrap items-center gap-2.5" aria-label={filterLabel}>
        <button
          type="button"
          aria-pressed={selectedSlug === null}
          class={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            selectedSlug === null
              ? 'border-orange-500 bg-orange-500 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700'
          }`}
          onclick={() => selectCategory(null)}
        >
          {allLabel} ({totalCount})
        </button>

        {#each validOptions as option}
          <button
            type="button"
            aria-pressed={selectedSlug === option.slug}
            class={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              selectedSlug === option.slug
                ? 'border-orange-500 bg-orange-500 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700'
            }`}
            onclick={() => selectCategory(option.slug)}
          >
            {option.name} ({option.count})
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Articles List Header -->
  <div class="mb-6 flex items-end justify-between gap-4">
    {#if title}
      <h2 class="text-3xl font-black tracking-tight text-slate-950 lg:text-4xl">
        {title}
      </h2>
    {/if}
    {#if activeArticles.length > 0}
      <span class="text-sm font-medium text-slate-500">
        {formatCount(activeArticles.length)}
      </span>
    {/if}
  </div>

  <!-- Articles Grid -->
  {#if pagedArticles.length > 0}
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {#each pagedArticles as article (article.href)}
        <a
          href={article.href}
          class="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white transition-colors duration-300 hover:border-orange-200"
        >
          <div class="relative aspect-[16/9] overflow-hidden bg-slate-100">
            {#if article.coverSrc}
              <img
                src={article.coverSrc}
                alt={article.coverAlt || article.title}
                width={article.coverWidth || 1200}
                height={article.coverHeight || 675}
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            {:else}
              <div class="flex h-full items-center justify-center text-sm text-slate-500">
                {noCoverLabel}
              </div>
            {/if}
          </div>

          <div class="flex flex-1 flex-col p-5 lg:p-6">
            <div class="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              {#if article.categoryName}
                <span>{article.categoryName}</span>
              {/if}
              {#if article.categoryName && article.publishedDate}
                <span aria-hidden="true">·</span>
              {/if}
              {#if article.publishedDate}
                <time datetime={article.publishedAt}>{article.publishedDate}</time>
              {/if}
            </div>

            <h3 class="text-2xl font-extrabold leading-tight text-slate-950 transition-colors group-hover:text-orange-600">
              {article.title}
            </h3>

            {#if article.description || article.excerpt}
              <p class="mt-4 line-clamp-3 text-base leading-7 text-slate-600">
                {article.description || article.excerpt}
              </p>
            {/if}

            <span class="mt-auto pt-6 text-sm font-bold text-orange-600">
              {readMoreLabel} <span aria-hidden="true">→</span>
            </span>
          </div>
        </a>
      {/each}
    </div>

    <!-- Pagination -->
    {#if pageCount > 1}
      <nav class="mt-12 flex items-center justify-center gap-2" aria-label={pageLabel}>
        <button
          type="button"
          disabled={safeCurrentPage <= 1}
          onclick={() => goToPage(safeCurrentPage - 1)}
          class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {previousPageLabel}
        </button>

        <div class="flex items-center gap-1">
          {#each Array.from({ length: pageCount }, (_, i) => i + 1) as p}
            <button
              type="button"
              aria-current={safeCurrentPage === p ? 'page' : undefined}
              onclick={() => goToPage(p)}
              class={`h-9 min-w-9 rounded-md border px-3 text-sm font-semibold transition ${
                safeCurrentPage === p
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-orange-400 hover:text-orange-600'
              }`}
            >
              {p}
            </button>
          {/each}
        </div>

        <button
          type="button"
          disabled={safeCurrentPage >= pageCount}
          onclick={() => goToPage(safeCurrentPage + 1)}
          class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {nextPageLabel}
        </button>
      </nav>
    {/if}
  {:else}
    <p class="border border-dashed border-slate-300 py-16 text-center text-slate-500">
      {noArticlesLabel}
    </p>
  {/if}
</div>
