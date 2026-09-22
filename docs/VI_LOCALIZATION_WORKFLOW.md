# Vietnamese localization workflow

The Vietnamese site has two independent localization layers:

1. `src/i18n/locales/vi.json` and the locale-aware Astro components provide shared UI copy, routes, labels, and fallbacks.
2. Strapi provides localized page, product, help-center, insight, download, and SEO content.

Both layers must be complete before a Pages deployment. Publishing a new Strapi locale does not rebuild the static Cloudflare Pages output automatically.

## Read-only audit

From `glorisauto/`:

```bash
pnpm run check:i18n
OUTPUT_FILE=/tmp/vi-content-audit.md pnpm run audit:i18n:vi
```

The audit compares the English and Vietnamese API responses and reports:

- missing localized entries or fields;
- fields identical to English;
- likely English residue in Vietnamese text;
- endpoints that are unavailable in the current Strapi deployment.

Relation and media fields should be reviewed separately from translatable text. The high-priority translatable fields are product `information`, `technicalDetails`, and `seo`; help-center `contentMarkdown` and `seo`; insight `content` and `seo`; and shared page/navigation copy.

## Translation and release order

1. Complete and human-review the Strapi `vi` fields in the priority order above. Preserve product names, SKU values, measurements, URLs, Markdown links, and technical units.
2. Publish the reviewed Vietnamese entries in Strapi.
3. Run the read-only audit again and keep the report with the release notes.
4. Run `pnpm run build:pages` from the same frontend commit that is intended for deployment.
5. Smoke-test `/vi/`, `/vi/products/`, one product detail page, one help article, one insight, `/vi/support/download/`, canonical/hreflang tags, and the language switcher from `dist/` or the preview deployment.
6. Deploy with `pnpm run deploy:pages` only after the audit and smoke test pass.

The admin repository also exposes `pnpm run i18n:audit:coverage:vi` for local Strapi database coverage checks. It checks entry coverage, while the frontend audit checks field-level English residue; use both when the admin database is the source of truth.
