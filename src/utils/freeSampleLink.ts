export const FREE_SAMPLE_INQUIRY_TYPE = 'free-sample';
export const CONTACT_FORM_ANCHOR = 'contact-form';

export function getFreeSampleHref(locale: string): string {
  const normalizedLocale = locale.replace(/^\/+|\/+$/g, '') || 'en';
  return `/${normalizedLocale}/support/customer-service/?type=${FREE_SAMPLE_INQUIRY_TYPE}#${CONTACT_FORM_ANCHOR}`;
}
