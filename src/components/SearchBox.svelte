<script lang="ts">
  import Fuse from 'fuse.js';
  import type { FuseResult } from 'fuse.js';
  import { Search } from 'lucide-svelte';
  import type { SearchItem } from '@/utils/searchIndex';

  let { searchIndex, locale, messages, onSelect }: {
    searchIndex: SearchItem[];
    locale: string;
    messages: any;
    onSelect?: (item: SearchItem) => void;
  } = $props();

  let query = $state('');
  let isOpen = $state(false);
  let results = $state<FuseResult<SearchItem>[]>([]);
  let selectedIndex = $state(-1);

  let fuse: Fuse<SearchItem> | null = $state(null);
  let mounted = $state(false);
  const isRtl = $derived(locale === 'ar');

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
      results = fuse.search(searchQuery).slice(0, 10);
    }
  }

  // 处理输入
  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    query = target.value;
    performSearch(query);
    isOpen = query.length > 0;
    selectedIndex = -1;
  }

  // 处理键盘事件
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      selectItem(results[selectedIndex].item);
    } else if (e.key === 'Escape') {
      isOpen = false;
      query = '';
    }
  }

  // 选择结果项
  function selectItem(item: SearchItem) {
    if (onSelect) {
      onSelect(item);
    } else if (typeof window !== 'undefined') {
      window.location.href = item.url;
    }
    isOpen = false;
    query = '';
  }

  // 翻译函数
  function t(key: string): string {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  }

  // 获取类型标签
  function getTypeLabel(type: string): string {
    return t(`search.types.${type}`) || type;
  }

  // 仅在客户端初始化
  import { onMount } from 'svelte';
  onMount(() => {
    mounted = true;
    initFuse();
  });
</script>

<div class="relative">
  <div class="relative">
    <input
      type="text"
      bind:value={query}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onfocus={() => { isOpen = query.length > 0; }}
      placeholder={t('search.placeholder')}
      class={`w-full md:w-48 lg:w-64 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        isRtl ? 'px-4 pr-10 text-right' : 'px-4 pl-10'
      }`}
    />
    <span class={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRtl ? 'right-3' : 'left-3'}`}>
      <Search size={20} />
    </span>
  </div>

  {#if isOpen && results.length > 0}
    <div class={`absolute top-full left-0 right-0 md:w-96 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto ${isRtl ? 'md:left-auto' : 'md:right-auto'}`}>
      <div class="p-2">
        {#each results as result, index}
          {@const item = result.item}
          <a
            href={item.url}
            onclick={(e) => {
              e.preventDefault();
              selectItem(item);
            }}
            class={`block px-4 py-3 rounded transition-colors no-underline ${
              index === selectedIndex
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {getTypeLabel(item.type)}
                  </span>
                  <h3 class="font-medium text-gray-900 truncate">{item.title}</h3>
                </div>
                <p class="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                <p class="text-xs text-gray-400 mt-1 truncate">{item.url}</p>
              </div>
            </div>
          </a>
        {/each}
        <div class="px-4 py-2 border-t border-gray-200">
          <a
            href={`/${locale}/search?q=${encodeURIComponent(query)}`}
            class="text-sm text-blue-600 hover:text-blue-700 no-underline"
          >
            {t('search.allResults')}
          </a>
        </div>
      </div>
    </div>
  {:else if isOpen && query.length > 0 && results.length === 0}
    <div class={`absolute top-full left-0 right-0 md:w-96 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${isRtl ? 'md:left-auto' : 'md:right-auto'}`}>
      <div class="p-4 text-center text-gray-500">
        {t('search.noResults')}
      </div>
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
