<script lang="ts">
  import { ThumbsDown, ThumbsUp } from 'lucide-svelte';

  let {
    messages = {},
    articleSlug = '',
    contactHref = '#',
  }: {
    messages?: Record<string, unknown>;
    articleSlug?: string;
    contactHref?: string;
  } = $props();

  type FeedbackValue = 'yes' | 'no';
  let selected = $state<FeedbackValue | null>(null);

  function t(key: string): string {
    const keys = key.split('.');
    let value: unknown = messages;
    for (const part of keys) {
      value = value != null && typeof value === 'object'
        ? (value as Record<string, unknown>)[part]
        : undefined;
    }
    return typeof value === 'string' ? value : key;
  }

  function storageKey(): string {
    return `gloris-help-feedback:${articleSlug || window.location.pathname}`;
  }

  function submit(value: FeedbackValue) {
    selected = value;

    try {
      window.localStorage.setItem(storageKey(), value);
    } catch {
      // Private browsing or a blocked storage provider should not break feedback.
    }

    const payload = {
      event: 'help_article_feedback',
      helpful: value === 'yes',
      article_slug: articleSlug,
      article_path: window.location.pathname,
    };

    const analyticsWindow = window as Window & {
      dataLayer?: Array<Record<string, unknown>>;
    };
    analyticsWindow.dataLayer?.push(payload);
    window.dispatchEvent(new CustomEvent('help-article-feedback', { detail: payload }));
  }

  $effect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = window.localStorage.getItem(storageKey());
      if (saved === 'yes' || saved === 'no') selected = saved;
    } catch {
      // Ignore storage access errors.
    }
  });
</script>

<section class="my-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6" aria-labelledby="help-feedback-title">
  {#if selected}
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p id="help-feedback-title" class="font-semibold text-slate-900" role="status">
        {t('helpCenter.feedbackThanks')}
      </p>
      {#if selected === 'no'}
        <a
          href={contactHref}
          class="inline-flex w-fit items-center rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:border-orange-400 hover:bg-orange-50"
        >
          {t('helpCenter.feedbackContact')}
        </a>
      {/if}
    </div>
  {:else}
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p id="help-feedback-title" class="font-semibold text-slate-900">{t('helpCenter.feedbackTitle')}</p>
      <div class="flex gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-400 hover:text-emerald-700"
          aria-label={t('helpCenter.feedbackYes')}
          onclick={() => submit('yes')}
        >
          <ThumbsUp class="h-4 w-4" aria-hidden="true" />
          {t('helpCenter.feedbackYes')}
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-orange-400 hover:text-orange-700"
          aria-label={t('helpCenter.feedbackNo')}
          onclick={() => submit('no')}
        >
          <ThumbsDown class="h-4 w-4" aria-hidden="true" />
          {t('helpCenter.feedbackNo')}
        </button>
      </div>
    </div>
  {/if}
</section>
