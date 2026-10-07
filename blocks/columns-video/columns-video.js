/**
 * Builds an embed URL for a Vimeo or YouTube link, or null if the link is not a video.
 * @param {string} href authored link
 * @returns {string|null}
 */
function getEmbedUrl(href) {
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'player.vimeo.com') return url.href;
  if (host === 'vimeo.com') {
    const [id, hash] = url.pathname.split('/').filter(Boolean);
    if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ''}`;
  }
  if (host === 'youtu.be') return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
  if (host.endsWith('youtube.com')) {
    const id = url.searchParams.get('v') || url.pathname.split('/').pop();
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  return null;
}

/**
 * Replaces a video link with a lazily-loaded responsive iframe.
 * @param {HTMLAnchorElement} link the authored video link
 * @param {string} src embed url
 */
function embedVideo(link, src) {
  const wrapper = document.createElement('div');
  wrapper.className = 'columns-video-embed';
  const title = link.textContent.trim() && link.textContent.trim() !== link.href
    ? link.textContent.trim()
    : 'Video';

  const load = () => {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = title;
    iframe.loading = 'lazy';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    wrapper.append(iframe);
  };

  const target = link.closest('p') && link.closest('p').textContent.trim() === link.textContent.trim()
    ? link.closest('p')
    : link;
  target.replaceWith(wrapper);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        load();
      }
    }, { rootMargin: '200px' });
    observer.observe(wrapper);
  } else {
    load();
  }
}

/**
 * Video columns: an embedded video beside body copy.
 * 1 row x 2 cells: [video link] | [paragraphs]. Authors may omit or add cells.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const colCount = firstRow ? firstRow.children.length : 0;
  block.classList.add(`columns-video-${colCount}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-video-row');
    [...row.children].forEach((col) => {
      col.classList.add('columns-video-col');
      let hasVideo = false;
      col.querySelectorAll('a[href]').forEach((a) => {
        const src = getEmbedUrl(a.href);
        if (src) {
          embedVideo(a, src);
          hasVideo = true;
        }
      });
      if (hasVideo) col.classList.add('columns-video-media');
      else if (col.querySelector('picture') && !col.textContent.trim()) col.classList.add('columns-video-media');
      else col.classList.add('columns-video-text');
    });
  });
}
