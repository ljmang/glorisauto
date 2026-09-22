#!/usr/bin/env node

/**
 * Read-only production locale audit.
 *
 * Usage:
 *   node scripts/audit-vi-content.cjs
 *   OUTPUT_FILE=docs/vi-content-audit.json node scripts/audit-vi-content.cjs
 *   STRAPI_AUDIT_URL=https://admin.glorisauto.com TARGET_LOCALE=vi node scripts/audit-vi-content.cjs
 */

const fs = require('node:fs');

const BASE_URL = (process.env.STRAPI_AUDIT_URL || 'https://admin.glorisauto.com').replace(/\/$/, '');
const SOURCE_LOCALE = process.env.SOURCE_LOCALE || 'en';
const TARGET_LOCALE = process.env.TARGET_LOCALE || 'vi';
const PAGE_SIZE = Number(process.env.PAGE_SIZE || 100);
const OUTPUT_FILE = process.env.OUTPUT_FILE || '';

const SINGLETONS = [
  'home',
  'about-us',
  'brand-story',
  'become-dealer',
  'support',
  'site-seo',
  'navigation',
];

const COLLECTIONS = [
  'categories',
  'products',
  'insights',
  'help-categories',
  'help-centers',
  'insight-categories',
  'download-files',
  'flie-categories',
  'videos',
  'top-brands',
  'solutions',
  'seo-pages',
];

const META_KEYS = new Set([
  'id',
  'documentId',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'locale',
  'slug',
  'url',
  'href',
  'path',
  'link',
  'canonicalURL',
  'metaRobots',
  'metaViewport',
  'hideFromSearch',
  'schemaType',
  'sort',
  'featured',
  'enabled',
  'visible',
  'mime',
  'ext',
  'hash',
  'provider',
  'provider_metadata',
  'width',
  'height',
  'size',
  'formats',
]);

const MEDIA_KEYS = new Set([
  'cover',
  'images',
  'image',
  'file',
  'media',
  'heroMedia',
  'heroDefaultBackground',
  'aboutGlorisCover',
  'ctaBackground',
  'localizations',
]);

// Relations are audited by entry coverage, not by comparing their serialized
// IDs or populated labels. Comparing them as text produces false English
// residue warnings when the related entry is intentionally shared.
const RELATION_KEYS = new Set([
  'parent',
  'children',
  'category',
  'insight_category',
  'help_category',
  'flieCategory',
  'top_brand',
  'products',
  'help_centers',
  'insights',
  'relatedHelpCenters',
  'relatedInsights',
  'glorisNews',
  'downloadFiles',
  'videos',
]);

const ENGLISH_MARKERS = [
  'automotive',
  'application',
  'applications',
  'available',
  'body repair',
  'clear coat',
  'customer service',
  'download',
  'features',
  'for ',
  'from ',
  'help center',
  'how to',
  'insights',
  'paint',
  'product',
  'technical',
  'the ',
  'view all',
  'wholesale',
  'with ',
];

function normalizeText(value) {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]+\]\([^)]*\)/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function collectText(value, key = '') {
  if (value == null || META_KEYS.has(key) || MEDIA_KEYS.has(key)) return [];
  if (typeof value === 'string') {
    const normalized = normalizeText(value);
    return normalized ? [normalized] : [];
  }
  if (typeof value === 'number' || typeof value === 'boolean') return [];
  if (Array.isArray(value)) return value.flatMap((item) => collectText(item, key));
  if (typeof value !== 'object') return [];

  return Object.entries(value).flatMap(([childKey, childValue]) => collectText(childValue, childKey));
}

function textForField(value, key) {
  return collectText(value, key).join(' ').trim();
}

function hasEnglishResidue(value) {
  const text = normalizeText(value);
  if (!text || text.length < 24) return false;
  const hits = ENGLISH_MARKERS.filter((marker) => text.includes(marker));
  return new Set(hits).size >= 2;
}

function isComparableField(key, sourceValue) {
  if (META_KEYS.has(key) || MEDIA_KEYS.has(key) || RELATION_KEYS.has(key)) return false;
  if (sourceValue == null) return false;
  if (typeof sourceValue === 'number' || typeof sourceValue === 'boolean') return false;
  return collectText(sourceValue, key).length > 0;
}

function comparableKey(item) {
  return item?.documentId || item?.slug || item?.id;
}

function getFieldStatus(sourceValue, targetValue, key) {
  const sourceText = textForField(sourceValue, key);
  const targetText = textForField(targetValue, key);

  if (!sourceText) return 'not_applicable';
  if (!targetText) return 'missing';
  if (sourceText === targetText) return 'same_as_source';
  if (hasEnglishResidue(targetText)) return 'possible_english_residue';
  return 'translated_or_changed';
}

function compareRecords(source, target) {
  const keys = new Set([
    ...Object.keys(source || {}),
    ...Object.keys(target || {}),
  ]);
  const fields = {};

  for (const key of keys) {
    if (!isComparableField(key, source?.[key])) continue;
    fields[key] = getFieldStatus(source?.[key], target?.[key], key);
  }

  return fields;
}

function summarizeFields(fieldStatuses) {
  const summary = {
    missing: 0,
    sameAsSource: 0,
    possibleEnglishResidue: 0,
    translatedOrChanged: 0,
    notApplicable: 0,
  };

  for (const status of Object.values(fieldStatuses)) {
    if (status === 'missing') summary.missing += 1;
    else if (status === 'same_as_source') summary.sameAsSource += 1;
    else if (status === 'possible_english_residue') summary.possibleEnglishResidue += 1;
    else if (status === 'translated_or_changed') summary.translatedOrChanged += 1;
    else summary.notApplicable += 1;
  }

  return summary;
}

function buildUrl(endpoint, locale, page) {
  const url = new URL(`${BASE_URL}/api/${endpoint}`);
  url.searchParams.set('locale', locale);
  url.searchParams.set('populate', '*');
  if (page) {
    url.searchParams.set('pagination[page]', String(page));
    url.searchParams.set('pagination[pageSize]', String(PAGE_SIZE));
  }
  return url;
}

async function request(url) {
  const response = await fetch(url);
  const body = await response.text();
  if (response.status === 404) {
    return { __notFound: true };
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}: ${body.slice(0, 300)}`);
  }
  return JSON.parse(body);
}

async function fetchSingleton(endpoint, locale) {
  const result = await request(buildUrl(endpoint, locale));
  if (result?.__notFound) return { available: false, data: null };
  return { available: true, data: result?.data || null };
}

async function fetchCollection(endpoint, locale) {
  const rows = [];
  let page = 1;

  while (true) {
    const result = await request(buildUrl(endpoint, locale, page));
    if (result?.__notFound) return { available: false, rows: [] };
    const pageRows = Array.isArray(result?.data) ? result.data : [];
    rows.push(...pageRows);

    const pagination = result?.meta?.pagination;
    if (!pagination || page >= Number(pagination.pageCount || page) || pageRows.length < PAGE_SIZE) break;
    page += 1;
  }

  return { available: true, rows };
}

function compareSingleton(sourceResult, targetResult) {
  if (!sourceResult.available && !targetResult.available) {
    return { status: 'endpoint_unavailable', fields: {}, fieldSummary: summarizeFields({}) };
  }
  if (!sourceResult.available) {
    return { status: 'source_endpoint_unavailable', fields: {}, fieldSummary: summarizeFields({}) };
  }
  if (!targetResult.available) {
    return { status: 'missing_locale_entry', fields: {}, fieldSummary: summarizeFields({}) };
  }

  const source = sourceResult.data;
  const target = targetResult.data;
  if (!source && !target) return { status: 'not_published', fields: {}, fieldSummary: summarizeFields({}) };
  if (!target) return { status: 'missing_locale_entry', fields: {}, fieldSummary: summarizeFields({}) };

  const fields = compareRecords(source || {}, target || {});
  return {
    status: 'available',
    fields,
    fieldSummary: summarizeFields(fields),
  };
}

function compareCollection(sourceResult, targetResult) {
  if (!sourceResult.available) {
    return {
      status: !targetResult.available ? 'endpoint_unavailable' : 'source_endpoint_unavailable',
      aggregate: {
        sourceCount: null,
        targetCount: null,
        missingEntries: 0,
        missingFields: 0,
        sameAsSourceFields: 0,
        possibleEnglishResidueFields: 0,
        translatedOrChangedFields: 0,
      },
      entries: [],
    };
  }

  if (!targetResult.available) {
    const sourceCount = sourceResult.rows.length;
    return {
      status: 'missing_locale_entries',
      aggregate: {
        sourceCount,
        targetCount: 0,
        missingEntries: sourceCount,
        missingFields: 0,
        sameAsSourceFields: 0,
        possibleEnglishResidueFields: 0,
        translatedOrChangedFields: 0,
      },
      entries: sourceResult.rows.map((source) => ({
        key: String(comparableKey(source)),
        slug: source.slug || null,
        status: 'missing_locale_entry',
      })),
    };
  }

  const sourceRows = sourceResult.rows;
  const targetRows = targetResult.rows;
  const targetByKey = new Map(targetRows.map((row) => [String(comparableKey(row)), row]));
  const entries = [];
  const aggregate = {
    sourceCount: sourceRows.length,
    targetCount: targetRows.length,
    missingEntries: 0,
    missingFields: 0,
    sameAsSourceFields: 0,
    possibleEnglishResidueFields: 0,
    translatedOrChangedFields: 0,
  };

  for (const source of sourceRows) {
    const key = String(comparableKey(source));
    const target = targetByKey.get(key);
    if (!target) {
      aggregate.missingEntries += 1;
      entries.push({ key, slug: source.slug || null, status: 'missing_locale_entry' });
      continue;
    }

    const fields = compareRecords(source, target);
    const fieldSummary = summarizeFields(fields);
    aggregate.missingFields += fieldSummary.missing;
    aggregate.sameAsSourceFields += fieldSummary.sameAsSource;
    aggregate.possibleEnglishResidueFields += fieldSummary.possibleEnglishResidue;
    aggregate.translatedOrChangedFields += fieldSummary.translatedOrChanged;
    entries.push({
      key,
      slug: source.slug || target.slug || null,
      status: 'available',
      fieldSummary,
      fields,
    });
  }

  return { status: 'available', aggregate, entries };
}

function displayCount(value) {
  return value == null ? '—' : String(value);
}

function compactReport(report) {
  const lines = [];
  lines.push(`Vietnamese locale audit: ${report.meta.targetLocale}`);
  lines.push(`Generated: ${report.meta.generatedAt}`);
  lines.push(`Source: ${report.meta.sourceLocale}`);
  lines.push('');
  lines.push('| Type | Status | Source | Target | Missing entries | Missing fields | Same as source | Possible English residue |');
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |');

  for (const item of report.collections) {
    const s = item.aggregate;
    lines.push(`| ${item.endpoint} | ${item.status} | ${displayCount(s.sourceCount)} | ${displayCount(s.targetCount)} | ${s.missingEntries} | ${s.missingFields} | ${s.sameAsSourceFields} | ${s.possibleEnglishResidueFields} |`);
  }

  lines.push('');
  lines.push('## Singletons');
  lines.push('');
  lines.push('| Endpoint | Status | Missing fields | Same as source | Possible English residue |');
  lines.push('| --- | --- | ---: | ---: | ---: |');
  for (const item of report.singletons) {
    const s = item.fieldSummary;
    lines.push(`| ${item.endpoint} | ${item.status} | ${s.missing} | ${s.sameAsSource} | ${s.possibleEnglishResidue} |`);
  }

  lines.push('');
  lines.push('## Review samples');
  lines.push('');
  for (const item of report.collections) {
    const samples = item.entries
      .filter((entry) => entry.status === 'missing_locale_entry' || entry.fieldSummary?.missing || entry.fieldSummary?.sameAsSource || entry.fieldSummary?.possibleEnglishResidue)
      .slice(0, 8);
    if (samples.length === 0) continue;
    lines.push(`### ${item.endpoint}`);
    for (const sample of samples) {
      const fields = Object.entries(sample.fields || {})
        .filter(([, status]) => status !== 'translated_or_changed')
        .map(([field, status]) => `${field}=${status}`)
        .join(', ');
      lines.push(`- ${sample.slug || sample.key}: ${sample.status}${fields ? ` (${fields})` : ''}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const report = {
    meta: {
      generatedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      sourceLocale: SOURCE_LOCALE,
      targetLocale: TARGET_LOCALE,
      readOnly: true,
    },
    singletons: [],
    collections: [],
  };

  for (const endpoint of SINGLETONS) {
    const [sourceResult, targetResult] = await Promise.all([
      fetchSingleton(endpoint, SOURCE_LOCALE),
      fetchSingleton(endpoint, TARGET_LOCALE),
    ]);
    const comparison = compareSingleton(sourceResult, targetResult);
    report.singletons.push({ endpoint, ...comparison });
    console.log(`[singleton] ${endpoint} ${comparison.status} missing=${comparison.fieldSummary.missing} same=${comparison.fieldSummary.sameAsSource} residue=${comparison.fieldSummary.possibleEnglishResidue}`);
  }

  for (const endpoint of COLLECTIONS) {
    const [sourceResult, targetResult] = await Promise.all([
      fetchCollection(endpoint, SOURCE_LOCALE),
      fetchCollection(endpoint, TARGET_LOCALE),
    ]);
    const comparison = compareCollection(sourceResult, targetResult);
    report.collections.push({ endpoint, ...comparison });
    const s = comparison.aggregate;
    console.log(`[collection] ${endpoint} source=${s.sourceCount} target=${s.targetCount} missingEntries=${s.missingEntries} missingFields=${s.missingFields} same=${s.sameAsSourceFields} residue=${s.possibleEnglishResidueFields}`);
  }

  const markdown = compactReport(report);
  if (OUTPUT_FILE) {
    const outputPath = require('node:path').resolve(OUTPUT_FILE);
    fs.mkdirSync(require('node:path').dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, OUTPUT_FILE.endsWith('.md') ? markdown : `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(`[audit] wrote ${outputPath}`);
  }
  console.log('\n' + markdown);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
