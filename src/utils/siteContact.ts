import type { SiteSeoAttributes } from '@/types/content';

export const DEFAULT_CONTACT_PHONE = '+86 19128973352';
export const DEFAULT_CONTACT_EMAIL = 'Sales@glorisauto.com';

const DEFAULT_MAP_EMBED_URL = 'https://maps.google.com/maps?q=23.1291,113.2644&z=12&output=embed';
const DEFAULT_MAP_LINK_URL = 'https://www.google.com/maps?q=23.1291,113.2644';

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getPhoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

function toGoogleMapsEmbedUrl(googleMaps: string): string {
  if (!googleMaps) return DEFAULT_MAP_EMBED_URL;
  if (googleMaps.includes('output=embed')) return googleMaps;

  try {
    const url = new URL(googleMaps);
    return `https://maps.google.com/maps?${url.searchParams.toString()}&z=12&output=embed`;
  } catch {
    return DEFAULT_MAP_EMBED_URL;
  }
}

export function getSiteContactInfo(siteSeo: SiteSeoAttributes | null | undefined) {
  const phone = cleanText(siteSeo?.contactPhone) || DEFAULT_CONTACT_PHONE;
  const email = cleanText(siteSeo?.contactEmail) || DEFAULT_CONTACT_EMAIL;
  const whatsappRaw = cleanText(siteSeo?.contactWhatsapp);
  const whatsappNumber = whatsappRaw.replace(/\D/g, '') || phone.replace(/\D/g, '');
  const googleMaps = cleanText(siteSeo?.googleMaps);

  return {
    phone,
    phoneHref: getPhoneHref(phone),
    email,
    whatsappRaw,
    whatsappNumber,
    whatsappHref: whatsappNumber ? `https://wa.me/${whatsappNumber}` : '',
    whatsappLabel: cleanText(siteSeo?.contactWhatsappLabel),
    chatLabel: cleanText(siteSeo?.contactChatLabel),
    addressTitle: cleanText(siteSeo?.addressTitle),
    address: cleanText(siteSeo?.address),
    mapLinkUrl: googleMaps || DEFAULT_MAP_LINK_URL,
    mapLinkLabel: cleanText(siteSeo?.mapLinkLabel),
    mapEmbedUrl: toGoogleMapsEmbedUrl(googleMaps),
    mapEmbedTitle: cleanText(siteSeo?.mapEmbedTitle),
  };
}
