<script lang="ts">
  import { fly } from 'svelte/transition';
  import type { NavItem } from '@/utils/navigationData';

  export let locale: string;
  export let currentPath: string = '';
  export let navData: NavItem[] = [];

  let openIndex: number = -1;

  function isActive(href: string): boolean {
    const a = currentPath.replace(/\/$/, '') || '/';
    const b = href.replace(/\/$/, '') || '/';
    return a === b;
  }

  function isParentActive(href: string): boolean {
    const norm = href.replace(/\/$/, '');
    if (!norm || norm === `/${locale}`) return false;
    return currentPath.startsWith(norm + '/') || currentPath === norm;
  }

  function toggle(i: number) {
    openIndex = openIndex === i ? -1 : i;
  }

  function close() {
    openIndex = -1;
  }

  // 点击外部关闭
  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest('[data-nav-root]')) return;
    close();
  }

  import { onMount, onDestroy } from 'svelte';
  onMount(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
    }
  });
  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleClickOutside);
    }
  });
</script>

<nav data-nav-root class="hidden xl:flex items-center gap-6 flex-1">
  <!-- 顶栏仅后端导航项，Home 通过点击 logo 进入 -->
  {#each navData as item, i}
    {#if item.columns && item.columns.length > 0}
      <div class="relative">
        <button
          type="button"
          class={`px-2 py-4 text-xl font-bold transition-colors flex items-center gap-1 ${
            isParentActive(item.href)
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-gray-700 hover:text-orange-500'
          }`}
          on:click|preventDefault|stopPropagation={() => toggle(i)}
        >
          {item.label}
        </button>
        {#if openIndex === i}
        <!-- 二级导航 -->
          <div
            class="fixed inset-x-0 top-[100px] z-50 w-screen bg-gray-100/95 shadow-lg py-6 px-8 backdrop-blur-sm"
            role="dialog"
            aria-label={item.label}
            transition:fly={{ duration: 400 }}
          >
            <div class="container px-4 py-10 2xl:py-20 mx-auto">
              <div class="flex flex-wrap gap-x-16 gap-y-8">
              <!-- 三级导航 -->
              {#each item.columns as col}
                <!-- 三级导航项 -->
                <div>
                  {#if col.href}
                    <a href={col.href} class="font-bold text-lg mb-4 block hover:text-orange-500 no-underline">{col.title}</a>
                  {:else}
                    <p class="font-bold mb-4">{col.title}</p>
                  {/if}
                  <ul class="space-y-4">
                    {#each col.items as link}
                      <li>
                        <a
                          href={link.href}
                          class="block text-gray-700 hover:text-orange-500 no-underline font-medium"
                        >
                          {link.label}
                        </a>
                      </li>
                    {/each}
                  </ul>
                </div>
              {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <a
        href={item.href}
        class={`px-3 py-2 text-lg font-bold transition-colors no-underline ${
          isActive(item.href) || isParentActive(item.href)
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-gray-700 hover:text-orange-500'
        }`}
      >
        {item.label}
      </a>
    {/if}
  {/each}
</nav>
