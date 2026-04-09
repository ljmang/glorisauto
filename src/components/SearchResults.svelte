<script lang="ts">
  import Fuse from 'fuse.js';
  import type { FuseResult } from 'fuse.js';
  import type { SearchItem } from '@/utils/searchIndex';

  let { searchIndex, initialQuery = '', locale, messages }: {
    searchIndex: SearchItem[];
    initialQuery?: string;
    locale: string;
    messages: any;
  } = $props();

  let query = $state('');
  let results = $state<FuseResult<SearchItem>[]>([]);
  let fuse: Fuse<SearchItem> | null = $state(null);
  let selectedType = $state<string | null>(null);
  let mounted = $state(false);

  // 初始化 Fuse.js（仅在客户端）
  function initFuse() {
    if (typeof window === 'undefined') return;
    fuse = new Fuse(searchIndex, {
      keys: ['title', 'content'],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }

  // 搜索函数
  function performSearch(searchQuery: string) {
    if (!mounted) return; // 确保只在客户端执行
    if (!fuse) initFuse();
    if (!searchQuery.trim()) {
      results = [];
      return;
    }
    if (fuse) {
      let filteredResults = fuse.search(searchQuery);
      
      // 按类型筛选
      if (selectedType) {
        filteredResults = filteredResults.filter(r => r.item.type === selectedType);
      }
      
      results = filteredResults;
    }
  }

  // 处理搜索
  function handleSearch() {
    performSearch(query);
    // 更新 URL（仅在客户端）
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.pushState({}, '', url);
  }

  // 处理输入
  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    query = target.value;
    performSearch(query);
  }

  // 翻译函数
  function t(key: string, params?: Record<string, string>): string {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    if (typeof value !== 'string') return key;
    if (!params) return value;
    return Object.entries(params).reduce((s, [k, v]) => s.replace(`{${k}}`, v), value);
  }

  // 获取类型标签
  function getTypeLabel(type: string): string {
    return t(`search.types.${type}`) || type;
  }

  // 获取所有类型
  const types = ['product', 'insight', 'help', 'about', 'support'] as const;

  function getInitialQueryFromLocation(): string {
    if (typeof window === 'undefined') return '';
    return new URL(window.location.href).searchParams.get('q') || '';
  }

  // 仅在客户端初始化
  import { onMount } from 'svelte';
  onMount(() => {
    mounted = true;
    // 设置初始查询值
    query = initialQuery || getInitialQueryFromLocation();
    initFuse();
    if (query) {
      performSearch(query);
    }
  });
</script>

<div class="space-y-6">
  <!-- 搜索框 -->
  <div class="relative">
    <input
      type="text"
      bind:value={query}
      oninput={handleInput}
      onkeydown={(e) => { if (e.key === 'Enter') handleSearch(); }}
      placeholder={t('search.placeholder')}
      class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
    />
    <svg
      class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <button
      onclick={handleSearch}
      class="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      {t('pageTitle.search')}
    </button>
  </div>

  <!-- 类型筛选 -->
  <div class="flex flex-wrap gap-2">
    <button
      onclick={() => {
        selectedType = null;
        performSearch(query);
      }}
      class={`px-4 py-2 rounded transition-colors ${
        selectedType === null
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {t('common.all') || 'All'}
    </button>
    {#each types as type}
      <button
        onclick={() => {
          selectedType = type;
          performSearch(query);
        }}
        class={`px-4 py-2 rounded transition-colors ${
          selectedType === type
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {getTypeLabel(type)}
      </button>
    {/each}
  </div>

  <!-- 搜索结果 -->
  {#if query && results.length > 0}
    <div>
      <p class="text-gray-600 mb-4">
        {t('search.results', { count: results.length.toString() })}
      </p>
      <div class="space-y-4">
        {#each results as result}
          {@const item = result.item}
          <a
            href={item.url}
            class="block p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all no-underline"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {getTypeLabel(item.type)}
                  </span>
                  {#if item.category}
                    <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {item.category}
                    </span>
                  {/if}
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p class="text-gray-600 mb-2">{item.content}</p>
                <p class="text-sm text-gray-400">{item.url}</p>
              </div>
              <svg
                class="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {:else if query && results.length === 0}
    <div class="text-center py-12">
      <p class="text-gray-500 text-lg mb-4">{t('search.noResults')}</p>
      <p class="text-gray-400 text-sm">{t('search.placeholder')}</p>
    </div>
  {:else}
    <div class="text-center py-12">
      <p class="text-gray-500 text-lg">{t('search.placeholder')}</p>
    </div>
  {/if}
</div>
