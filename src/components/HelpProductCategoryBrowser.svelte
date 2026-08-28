<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    HelpProductCategoryArticle,
    HelpProductCategoryOption,
  } from '@/utils/helpProductCategories';

  let {
    options = [],
    articles = [],
    title = '',
    description = '',
    filterLabel = '',
    articleCountLabel = '{count} articles',
    noArticlesLabel = 'No articles found.',
    selectCategoryLabel = '',
    showArticlesWhenUnfiltered = true,
  }: {
    options?: HelpProductCategoryOption[];
    articles?: HelpProductCategoryArticle[];
    title?: string;
    description?: string;
    filterLabel?: string;
    articleCountLabel?: string;
    noArticlesLabel?: string;
    selectCategoryLabel?: string;
    showArticlesWhenUnfiltered?: boolean;
  } = $props();

  let selectedSlug = $state<string | null>(null);
  const activeSlug = $derived(selectedSlug ?? options[0]?.slug ?? '');

  const visibleArticles = $derived(
    activeSlug
      ? articles.filter((article) => article.productCategorySlugs.includes(activeSlug))
      : articles
  );
  const shouldShowArticles = $derived(showArticlesWhenUnfiltered || activeSlug.length > 0);

  function formatArticleCount(count: number): string {
    return articleCountLabel.replace('{count}', String(count));
  }

  function isKnownCategory(slug: string): boolean {
    return options.some((option) => option.slug === slug);
  }

  function getDefaultCategorySlug(): string {
    return options[0]?.slug ?? '';
  }

  function syncFromUrl() {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const requestedSlug = url.searchParams.get('productCategory') ?? '';
    const nextSlug = requestedSlug && isKnownCategory(requestedSlug) ? requestedSlug : getDefaultCategorySlug();
    selectedSlug = nextSlug || null;

    if (nextSlug && requestedSlug !== nextSlug) {
      url.searchParams.set('productCategory', nextSlug);
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      window.dispatchEvent(new CustomEvent('help-product-category-change', { detail: { slug: nextSlug } }));
    }
  }

  function selectCategory(slug: string) {
    selectedSlug = slug;
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set('productCategory', slug);
    } else {
      url.searchParams.delete('productCategory');
    }

    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    window.dispatchEvent(new CustomEvent('help-product-category-change', { detail: { slug } }));
  }

  onMount(() => {
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  });
</script>

<section class="border-y border-gray-200 py-8" aria-labelledby="help-product-category-title">
  {#if title}
    <div class="mb-5 max-w-3xl">
      <h2 id="help-product-category-title" class="text-2xl font-bold tracking-tight lg:text-3xl">
        {title}
      </h2>
      {#if description}
        <p class="mt-2 text-sm leading-6 text-gray-600">{description}</p>
      {/if}
    </div>
  {/if}

  {#if options.length > 0}
    <div class="flex flex-wrap items-center gap-2.5" aria-label={filterLabel}>
      {#if filterLabel}
        <span class="mr-1 text-sm font-semibold text-gray-700">{filterLabel}</span>
      {/if}
      {#each options as option}
        <button
          type="button"
          aria-pressed={activeSlug === option.slug}
          class={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
            activeSlug === option.slug
              ? 'border-orange-500 bg-orange-500 text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700'
          }`}
          onclick={() => selectCategory(option.slug)}
        >
          {option.name} ({formatArticleCount(option.count)})
        </button>
      {/each}
    </div>
  {/if}

  {#if shouldShowArticles}
    {#if visibleArticles.length > 0}
      <div class="mt-7 divide-y divide-gray-200">
        {#each visibleArticles as article}
          <article class="py-6 first:pt-0 last:pb-0">
            <h3 class="text-xl font-semibold leading-8">
              <a href={article.href} class="text-cyan-600 transition-colors hover:text-orange-500 hover:underline">
                {article.title}
              </a>
            </h3>
            {#if article.description}
              <p class="mt-2 text-gray-600">{article.description}</p>
            {/if}
          </article>
        {/each}
      </div>
    {:else}
      <div class="py-10 text-center">
        <p class="text-gray-500">{noArticlesLabel}</p>
      </div>
    {/if}
  {:else if selectCategoryLabel}
    <p class="mt-6 text-sm text-gray-500">{selectCategoryLabel}</p>
  {/if}
</section>
