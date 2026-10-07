/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-video. Base: columns.
 * Source: https://www.mauriceblackburn.com.au/ (#plaintiff .aem-Grid > .video)
 * Output: 1 row x 2 cells: [Vimeo video link] | [body paragraphs].
 * The text column is the next sibling grid column (.container holding .cmp-text);
 * it is consumed here and removed so it is not imported twice.
 * The Vimeo iframe is emitted as a link (the block re-embeds it lazily).
 */
function toVideoUrl(src) {
  if (!src) return null;
  try {
    const url = new URL(src, 'https://www.mauriceblackburn.com.au/');
    const m = url.hostname.includes('vimeo.com') && url.pathname.match(/\/video\/(\d+)/);
    if (m) {
      const h = url.searchParams.get('h');
      return `https://vimeo.com/${m[1]}${h ? `/${h}` : ''}`;
    }
    const yt = url.hostname.includes('youtube') && url.pathname.match(/\/embed\/([^/?]+)/);
    if (yt) return `https://www.youtube.com/watch?v=${yt[1]}`;
    return url.href;
  } catch (e) {
    return null;
  }
}

export default function parse(element, { document }) {
  // ---- Video column ---------------------------------------------------------
  const iframe = element.querySelector('iframe.video-iframe, iframe');
  const videoUrl = toVideoUrl(iframe && (iframe.getAttribute('src') || iframe.getAttribute('data-src')));
  const videoCell = [];
  if (videoUrl) {
    const titleEl = element.querySelector('.video__title');
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = videoUrl;
    a.textContent = title || videoUrl;
    p.append(a);
    videoCell.push(p);
  }

  // ---- Text column (next sibling container) ---------------------------------
  const textCell = [];
  let sibling = element.nextElementSibling;
  while (sibling && !sibling.querySelector('.cmp-text') && !sibling.classList.contains('cmp-text')) {
    sibling = sibling.nextElementSibling;
  }
  if (sibling) {
    const texts = sibling.classList.contains('cmp-text') ? [sibling] : [...sibling.querySelectorAll('.cmp-text')];
    // .cmp-text is nested (column div + inner div): keep only innermost ones
    texts.filter((t) => !t.querySelector('.cmp-text')).forEach((t) => {
      [...t.children].forEach((child) => {
        if (child.textContent.trim() || child.querySelector('img, picture')) textCell.push(child);
      });
    });
    sibling.remove();
  }

  if (!videoCell.length && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[videoCell.length ? videoCell : '', textCell.length ? textCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-video', cells });
  element.replaceWith(block);
}
