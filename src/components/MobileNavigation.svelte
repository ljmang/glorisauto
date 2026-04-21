<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { NavItem } from '@/utils/navigationData';
  import { supportedLocales, localeDisplayConfig, type Locale } from '@/i18n/config';
  import { PhoneCall, Mail, Menu, X, Plus, Minus } from 'lucide-svelte';

  let {
    currentPath = '',
    locale = '',
    messages = {},
    navData = [],
  }: {
    currentPath?: string;
    locale?: string;
    messages?: Record<string, unknown>;
    navData?: NavItem[];
  } = $props();

  let isOpen = $state(false);
  /** Index of the top-level nav item whose L2/L3 are expanded; -1 = none */
  let expandedIndex = $state(-1);
  let langExpanded = $state(false);

  function toggle() {
    isOpen = !isOpen;
    if (!isOpen) {
      expandedIndex = -1;
      langExpanded = false;
    }
  }

  function close() {
    isOpen = false;
    expandedIndex = -1;
    langExpanded = false;
  }

  function toggleExpand(index: number) {
    expandedIndex = expandedIndex === index ? -1 : index;
  }

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

  function t(key: string): string {
    const keys = key.split('.');
    let value: unknown = messages;
    for (const k of keys) {
      value = value != null && typeof value === 'object' ? (value as Record<string, unknown>)[k] : undefined;
    }
    return typeof value === 'string' ? value : key;
  }

  const pathWithoutLocale = $derived(
    currentPath.replace(new RegExp(`^/${locale}(/|$)`), '$1') || '/'
  );
  const currentLocaleDisplay = $derived(localeDisplayConfig[locale as Locale]);
  const isRtl = $derived(locale === 'ar');
</script>
<!-- 手机版汉堡菜单按钮（搜索入口在 Header 里，与汉堡并排） -->
<button
  onclick={toggle}
  class="md:hidden p-2  hover:text-orange-500 transition-colors"
  aria-label="Toggle menu"
>
  {#if isOpen}
    <X class="w-6 h-6" />
  {:else}
    <Menu class="w-6 h-6" />
  {/if}
</button>

{#if isOpen}
  <div
    class="md:hidden fixed inset-0 z-50 flex flex-col bg-white font-medium text-lg"
    transition:fade={{ duration: 200 }}
  >
    <!-- 右上角关闭 -->
    <button
      type="button"
      onclick={close}
      class={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-[60] p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors`}
      aria-label={t('common.close')}
    >
      <X class="w-6 h-6" />
    </button>
    <!-- 顶部固定：联系方式 + 语言 -->
    <div class="shrink-0 flex flex-col gap-3 px-4 py-4 pt-14 border-b border-gray-200 bg-white">
      <div class="flex items-center gap-2">
        <PhoneCall class="w-4 h-4 shrink-0 text-gray-500" />
        <a href="tel:+8618122288163" class=" hover:text-orange-500 transition-colors no-underline"
          >+86 18122288163</a
        >
      </div>
      <div class="flex items-center gap-2">
        <Mail class="w-4 h-4 shrink-0 text-gray-500" />
        <a href="mailto:Sales@glorisauto.com" class=" hover:text-orange-500 transition-colors no-underline"
          >Sales@glorisauto.com</a
        >
      </div>
      <div class="space-y-1 font-medium text-lg">
        <button
          type="button"
          onclick={() => (langExpanded = !langExpanded)}
          class={`w-full flex items-center justify-between gap-2 py-1 hover:text-orange-500 transition-colors ${isRtl ? 'text-right' : 'text-left'}`}
          aria-expanded={langExpanded}
        >
          <span class="flex items-center gap-2">
            <span class="leading-none">{currentLocaleDisplay.flag}</span>
            <span class="">{currentLocaleDisplay.label}</span>
          </span>
          {#if langExpanded}
            <Minus class="w-5 h-5 shrink-0 " />
          {:else}
            <Plus class="w-5 h-5 shrink-0" />
          {/if}
        </button>
        {#if langExpanded}
          <div class={`${isRtl ? 'pr-6' : 'pl-6'} space-y-0.5`}>
            {#each supportedLocales as loc}
              <a
                href={`/${loc}${pathWithoutLocale}`}
                onclick={close}
                class={`flex items-center gap-2 py-2 rounded px-2 -mx-2 no-underline  transition-colors ${
                  loc === locale ? 'text-orange-500' : ' hover:text-orange-500'
                }`}
              >
                <span class="leading-none">{localeDisplayConfig[loc].flag}</span>
                <span>{localeDisplayConfig[loc].label}</span>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- 中间可上下滑动：导航 -->
    <nav class="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-1 bg-gray-50">
        <a
          href={`/${locale}`}
          onclick={close}
          class={`font-black text-xl block p-4 rounded bg-white transition-colors no-underline ${
            isActive(`/${locale}`) ? 'text-orange-500' : ' hover:text-orange-500'
          }`}
        >
          {t('pageTitle.home')}
        </a>
        <!-- 一级导航项 -->
        {#each navData as item, i}
          {#if item.columns && item.columns.length > 0}
            <div class="space-y-0">
              <button
                type="button"
                onclick={() => toggleExpand(i)}
                class={`font-black text-xl w-full p-4 rounded bg-white transition-colors flex items-center justify-between ${
                  isRtl ? 'text-right' : 'text-left'
                } ${
                  isParentActive(item.href) ? 'text-orange-500' : 'text-gray-900'
                } hover:text-orange-500`}
                aria-expanded={expandedIndex === i}
              >
                <span>{item.label}</span>
                {#if expandedIndex === i}
                  <Minus class="w-5 h-5 shrink-0" />
                {:else}
                  <Plus class="w-5 h-5 shrink-0" />
                {/if}
              </button>
              <!-- 二级导航内容 -->
              {#if expandedIndex === i}
                <div class="my-1">
                  {#each item.columns as col}
                    {#if col.href}
                      <a
                        href={col.href}
                        onclick={close}
                        class={`font-bold block p-3 px-6 mt-1 bg-white rounded transition-colors no-underline ${
                          isActive(col.href) ? 'text-orange-500' : ' hover:text-orange-500'
                        }`}
                      >
                        {col.title}
                      </a>
                    {/if}
                    <!-- 三级导航项 -->
                    {#each col.items as link}
                      <a
                        href={link.href}
                        onclick={close}
                        class={`block font-normal text-base py-3 px-6 bg-white rounded transition-colors no-underline ${
                          isActive(link.href) ? 'text-orange-500' : 'hover:text-orange-500'
                        }`}
                      >
                        {link.label}
                      </a>
                    {/each}
                  {/each}
                </div>
              {/if}
            </div>
          {:else}
            <a
              href={item.href}
              onclick={close}
              class={`block px-4 py-2 rounded transition-colors no-underline ${
                isActive(item.href) || isParentActive(item.href)
                  ? 'text-orange-500'
                  : ' hover:text-orange-500'
              }`}
            >
              {item.label}
            </a>
          {/if}
        {/each}

    </nav>
  </div>
{/if}
