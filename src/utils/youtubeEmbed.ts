const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_SHORTCODE_LINE_PATTERN = /^\s*\{\{\s*youtube\s+id="([^"\r\n]+)"(?:\s+title="([^"\r\n]{1,160})")?\s*\}\}\s*$/i;
const YOUTUBE_MARKER_PREFIX = 'GLORIS_YOUTUBE_EMBED_';

export interface YoutubeEmbed {
  marker: string;
  id: string;
  title: string;
}

export function extractYouTubeVideoId(value?: string | null): string | null {
  const candidate = value?.trim() ?? '';
  if (!candidate) return null;
  if (YOUTUBE_VIDEO_ID_PATTERN.test(candidate)) return candidate;

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    const pathSegments = url.pathname.split('/').filter(Boolean);
    let videoId = '';

    if (hostname === 'youtu.be') {
      videoId = pathSegments[0] ?? '';
    } else if (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtube-nocookie.com'
    ) {
      if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v') ?? '';
      } else if (['embed', 'shorts', 'live'].includes(pathSegments[0] ?? '')) {
        videoId = pathSegments[1] ?? '';
      }
    }

    return YOUTUBE_VIDEO_ID_PATTERN.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

function isFenceLine(line: string): { character: '`' | '~'; length: number } | null {
  const match = line.match(/^\s{0,3}(`{3,}|~{3,})/);
  if (!match) return null;
  return {
    character: match[1].startsWith('`') ? '`' : '~',
    length: match[1].length,
  };
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function prepareYoutubeShortcodes(markdown: string): {
  markdown: string;
  embeds: YoutubeEmbed[];
} {
  const embeds: YoutubeEmbed[] = [];
  const output: string[] = [];
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  let activeFence: { character: '`' | '~'; length: number } | null = null;

  for (const line of lines) {
    const fence = isFenceLine(line);
    if (fence) {
      if (!activeFence) {
        activeFence = fence;
      } else if (activeFence.character === fence.character && fence.length >= activeFence.length) {
        activeFence = null;
      }
      output.push(line);
      continue;
    }

    if (activeFence) {
      output.push(line);
      continue;
    }

    const match = line.match(YOUTUBE_SHORTCODE_LINE_PATTERN);
    const id = match ? extractYouTubeVideoId(match[1]) : null;
    if (!match || !id) {
      output.push(line);
      continue;
    }

    const marker = `${YOUTUBE_MARKER_PREFIX}${embeds.length}`;
    embeds.push({
      marker,
      id,
      title: match[2]?.trim() || 'YouTube video player',
    });
    // Keep the generated marker in its own Markdown paragraph so the final
    // HTML replacement can safely swap the whole paragraph for an iframe.
    output.push('', marker, '');
  }

  return { markdown: output.join('\n'), embeds };
}

export function stripYoutubeShortcodes(value?: string | null): string {
  if (!value) return '';
  return value.replace(/^\s*\{\{\s*youtube\b[^\r\n]*\}\}\s*$/gim, ' ');
}

export function renderYoutubeEmbed(embed: YoutubeEmbed): string {
  const title = escapeHtmlAttribute(embed.title || 'YouTube video player');
  const src = `https://www.youtube-nocookie.com/embed/${embed.id}?rel=0`;

  return `<div class="article-youtube-embed" data-youtube-id="${embed.id}"><iframe src="${src}" title="${title}" frameborder="0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
}

export function injectYoutubeEmbeds(html: string, embeds: YoutubeEmbed[]): string {
  return embeds.reduce((result, embed) => {
    const marker = escapeHtmlAttribute(embed.marker);
    const markerParagraph = new RegExp(`<p>\\s*${marker}\\s*</p>`, 'g');
    return result.replace(markerParagraph, renderYoutubeEmbed(embed));
  }, html);
}
