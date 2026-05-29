const truthyValues = new Set(['1', 'true', 'yes', 'on']);
const falsyValues = new Set(['0', 'false', 'no', 'off']);

type EnvName =
  | 'PUBLIC_SOLUTIONS_ENABLED'
  | 'CF_PAGES'
  | 'CF_PAGES_BRANCH'
  | 'CF_PAGES_URL'
  | 'BUILD_TARGET'
  | 'NODE_ENV';

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (typeof value !== 'string') return fallback;

  const normalized = value.trim().toLowerCase();
  if (truthyValues.has(normalized)) return true;
  if (falsyValues.has(normalized)) return false;
  return fallback;
}

function readEnv(name: EnvName): string | undefined {
  if (
    typeof process !== 'undefined' &&
    process.env &&
    typeof process.env[name] === 'string'
  ) {
    return process.env[name];
  }

  return import.meta.env[name];
}

function isCanonicalProductionSite(): boolean {
  const siteUrl = import.meta.env.SITE;
  if (typeof siteUrl !== 'string' || siteUrl.trim() === '') return false;

  try {
    const { hostname } = new URL(siteUrl);
    return hostname === 'www.glorisauto.com' || hostname === 'glorisauto.com';
  } catch {
    return false;
  }
}

function isPagesBuild(): boolean {
  return /^(1|true)$/i.test(readEnv('CF_PAGES') ?? '') || readEnv('BUILD_TARGET') === 'pages';
}

function isCloudflareProductionBuild(): boolean {
  if (!isPagesBuild()) return false;

  const branch = readEnv('CF_PAGES_BRANCH')?.trim().toLowerCase();
  if (branch) return branch === 'main' || branch === 'master';

  const pagesUrl = readEnv('CF_PAGES_URL')?.trim().toLowerCase();
  if (pagesUrl) {
    return pagesUrl === 'www.glorisauto.com' || pagesUrl === 'glorisauto.com';
  }

  return isCanonicalProductionSite();
}

function isProductionServerRuntime(): boolean {
  return readEnv('NODE_ENV') === 'production' && isCanonicalProductionSite();
}

export function isSolutionsEnabled(): boolean {
  const configured = readEnv('PUBLIC_SOLUTIONS_ENABLED');
  if (typeof configured === 'string') {
    return parseBooleanEnv(configured, false);
  }

  if (isCloudflareProductionBuild() || isProductionServerRuntime()) {
    return false;
  }

  return true;
}
