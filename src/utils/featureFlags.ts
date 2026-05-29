const truthyValues = new Set(['1', 'true', 'yes', 'on']);
const falsyValues = new Set(['0', 'false', 'no', 'off']);

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (typeof value !== 'string') return fallback;

  const normalized = value.trim().toLowerCase();
  if (truthyValues.has(normalized)) return true;
  if (falsyValues.has(normalized)) return false;
  return fallback;
}

function readEnv(name: 'PUBLIC_SOLUTIONS_ENABLED'): string | undefined {
  if (
    typeof process !== 'undefined' &&
    process.env &&
    typeof process.env[name] === 'string'
  ) {
    return process.env[name];
  }

  return import.meta.env[name];
}

export function isSolutionsEnabled(): boolean {
  return parseBooleanEnv(readEnv('PUBLIC_SOLUTIONS_ENABLED'), true);
}
