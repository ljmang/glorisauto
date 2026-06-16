<script lang="ts">
  import { onMount } from 'svelte';
  import Fuse from 'fuse.js';
  import type { FuseResult } from 'fuse.js';
  import { Search } from 'lucide-svelte';
  import type { HelpSearchItem } from '@/utils/helpSearch';

  let {
    items = [],
    locale = 'en',
    messages = {},
    maxResults = 8,
  }: {
    items?: HelpSearchItem[];
    locale?: string;
    messages?: Record<string, unknown>;
    maxResults?: number;
  } = $props();

  let query = $state('');
  let isOpen = $state(false);
  let results = $state<FuseResult<HelpSearchItem>[]>([]);
  let selectedIndex = $state(-1);
  let mounted = $state(false);
  let fuse: Fuse<HelpSearchItem> | null = $state(null);

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

  function navigateTo(item: HelpSearchItem | undefined) {
    if (!item || typeof window === 'undefined') return;
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

<div class="relative max-w-2xl">
  <div class="relative">
    <input
      type="search"
      value={query}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onfocus={() => {
        isOpen = query.trim().length > 0;
      }}
      onblur={handleBlur}
      placeholder={t('search.placeholder')}
      aria-label={t('search.placeholder')}
      aria-expanded={isOpen}
      class={`w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 ${
        isRtl ? 'pr-12 text-right' : 'pl-12'
      }`}
    />
    <span
      class={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400 ${
        isRtl ? 'right-4' : 'left-4'
      }`}
      aria-hidden="true"
    >
      <Search class="h-5 w-5" />
    </span>
  </div>

  {#if isOpen && hasQuery}
    <div
      class="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
    >
      {#if results.length > 0}
        {#each results as result, index}
          {@const item = result.item}
          <a
            href={item.href}
            onmousedown={(event) => event.preventDefault()}
            class={`block rounded-lg border px-4 py-3 no-underline transition-colors ${
              index === selectedIndex
                ? 'border-orange-200 bg-orange-50'
                : 'border-transparent hover:border-orange-100 hover:bg-orange-50/60'
            }`}
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                {#if item.categoryName}
                  <div class="mb-1 text-xs font-semibold uppercase tracking-wide text-orange-500">
                    {item.categoryName}
                  </div>
                {/if}
                <div class="font-semibold text-gray-900">{item.title}</div>
                {#if item.description || item.content}
                  <p class="mt-1 line-clamp-2 text-sm leading-6 text-gray-600">
                    {item.description || item.content}
                  </p>
                {/if}
              </div>
            </div>
          </a>
        {/each}
      {:else}
        <div class="px-4 py-6 text-center text-sm text-gray-500">
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
