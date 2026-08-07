<script lang="ts">
  import { onMount } from 'svelte';
  import Fuse from 'fuse.js';
  import type { FuseResult } from 'fuse.js';
  import { Search } from 'lucide-svelte';
  import type { InsightSearchItem } from '@/utils/insightSearch';

  let {
    items = [],
    locale = 'en',
    messages = {},
    maxResults = 8,
  }: {
    items?: InsightSearchItem[];
    locale?: string;
    messages?: Record<string, unknown>;
    maxResults?: number;
  } = $props();

  let query = $state('');
  let isOpen = $state(false);
  let results = $state<FuseResult<InsightSearchItem>[]>([]);
  let selectedIndex = $state(-1);
  let mounted = $state(false);
  let fuse: Fuse<InsightSearchItem> | null = $state(null);

  const isRtl = $derived(locale === 'ar');
  const hasQuery = $derived(query.trim().length > 0);

  function getMinQueryLength(value: string): number {
    return /[\u3040-\u30ff\u3400-\u9fff]/.test(value) ? 1 : 2;
  }

  function t(key: string): string {
    const keys = key.split('.');
    let value: unknown = messages;
    for (const k of keys) {
      value = value != null && typeof value === 'object' ? (value as Record<string, unknown>)[k] : undefined;
    }
    return typeof value === 'string' ? value : key;
  }

  function initFuse() {
    if (typeof window === 'undefined') return;
    fuse = new Fuse(items, {
      keys: [
        { name: 'title', weight: 0.45 },
        { name: 'description', weight: 0.25 },
        { name: 'content', weight: 0.2 },
        { name: 'categoryName', weight: 0.1 },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 1,
    });
  }

  function runSearch(value: string) {
    if (!mounted) return;
    if (!fuse) initFuse();

    const nextQuery = value.trim();
    if (!nextQuery || nextQuery.length < getMinQueryLength(nextQuery) || !fuse) {
      results = [];
      selectedIndex = -1;
      return;
    }

    results = fuse.search(nextQuery).slice(0, maxResults);
    selectedIndex = results.length > 0 ? 0 : -1;
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    query = target.value;
    isOpen = query.trim().length > 0;
    runSearch(query);
  }

  function navigateTo(item: InsightSearchItem | undefined) {
    if (!item || typeof window === 'undefined') return;

    const analyticsWindow = window as Window & {
      dataLayer?: Array<Record<string, unknown>>;
    };
    analyticsWindow.dataLayer?.push({
      event: 'insight_search_select',
      query: query.trim(),
      result_title: item.title,
      result_path: item.href,
    });
    window.location.href = item.href;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen) return;

    if (event.key === 'ArrowDown') {
      if (results.length === 0) return;
      event.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
    } else if (event.key === 'ArrowUp') {
      if (results.length === 0) return;
      event.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      navigateTo(results[selectedIndex]?.item ?? results[0]?.item);
    } else if (event.key === 'Escape') {
      isOpen = false;
      selectedIndex = -1;
    }
  }

  function handleBlur() {
    window.setTimeout(() => {
      isOpen = false;
    }, 120);
  }

  onMount(() => {
    mounted = true;
    initFuse();
  });
</script>

<div class="relative max-w-xl">
  <div class="relative">
    <input
      id={`insights-search-${locale}`}
      type="search"
      value={query}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onfocus={() => {
        isOpen = query.trim().length > 0;
      }}
      onblur={handleBlur}
      placeholder={t('insights.searchArticles')}
      aria-label={t('insights.searchArticles')}
      aria-autocomplete="list"
      aria-controls={`insight-search-results-${locale}`}
      aria-activedescendant={selectedIndex >= 0 ? `insight-search-result-${locale}-${selectedIndex}` : undefined}
      role="combobox"
      aria-expanded={isOpen}
      class={`h-14 w-full rounded-xl border border-slate-200 bg-white px-5 text-base text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${
        isRtl ? 'pr-12 text-right' : 'pl-12 pr-14'
      }`}
    />
    <span
      class={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`}
      aria-hidden="true"
    >
      <Search class="h-5 w-5" />
    </span>
  </div>

  {#if isOpen && hasQuery}
    <div
      id={`insight-search-results-${locale}`}
      role="listbox"
      class="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
    >
      {#if results.length > 0}
        {#each results as result, index}
          {@const item = result.item}
          <a
            id={`insight-search-result-${locale}-${index}`}
            href={item.href}
            onmousedown={(event) => event.preventDefault()}
            role="option"
            aria-selected={index === selectedIndex}
            class={`block rounded-lg border px-4 py-3 no-underline transition-colors ${
              index === selectedIndex
                ? 'border-orange-200 bg-orange-50'
                : 'border-transparent hover:border-orange-100 hover:bg-orange-50/60'
            }`}
          >
            <div class="min-w-0">
              {#if item.categoryName}
                <div class="mb-1 text-xs font-semibold uppercase tracking-wide text-orange-500">
                  {item.categoryName}
                </div>
              {/if}
              <div class="font-semibold text-slate-900">{item.title}</div>
              {#if item.description || item.content}
                <p class="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                  {item.description || item.content}
                </p>
              {/if}
            </div>
          </a>
        {/each}
      {:else}
        <div class="px-4 py-6 text-center text-sm text-slate-500">
          {t('search.noResults')}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
</style>
