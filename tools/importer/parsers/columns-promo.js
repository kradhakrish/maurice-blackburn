/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-promo. Base: columns.
 * Source: https://www.mauriceblackburn.com.au/
 *   (.full-width-background-extend:has(a.btn-inverse[href*="free-claim-check"]) > div > .aem-Grid)
 * Output: 1 row x 2 cells: [linked animated GIF] | [h3 eyebrow, h2, optional note, CTA button].
 * The image is an animated GIF served by Dynamic Media with ?preferwebp=true - the query is
 * stripped so the original .gif (with animation) is imported instead of a static webp.
 */
function cleanGifSrc(src) {
  if (!src) return src;
  try {
    const url = new URL(src, 'https://www.mauriceblackburn.com.au/');
    if (/\.gif$/i.test(url.pathname)) {
      url.search = '';
      return url.href;
    }
    return url.href;
  } catch (e) {
    return src;
  }
}

// AEM core image lazy-loads: <img src> is a data:/blob: placeholder until in view, the real
// URL is on the .cmp-image wrapper (data-cmp-src with a {width} token, or data-asset).
function resolveImageSrc(img) {
  const src = img.getAttribute('src') || '';
  if (src && !/^(data|blob):/i.test(src)) return src;
  const wrap = img.closest('.cmp-image, [data-cmp-src]');
  const lazy = wrap && wrap.getAttribute('data-cmp-src');
  if (lazy) return lazy.replace('{width}', '1080');
  const asset = wrap && wrap.getAttribute('data-asset');
  if (asset) return asset;
  return img.getAttribute('data-src') || src;
}

export default function parse(element, { document }) {
  let columns = [...element.querySelectorAll(':scope > .aem-GridColumn')];
  if (!columns.length) columns = [...element.children];

  const imgSrc = element.querySelector('img.cmp-image__image, .cmp-image img, img');
  const imageCol = imgSrc ? columns.find((c) => c.contains(imgSrc)) : null;

  // ---- Image column ----------------------------------------------------------
  const mediaCell = [];
  if (imgSrc) {
    const img = document.createElement('img');
    img.src = cleanGifSrc(resolveImageSrc(imgSrc));
    img.alt = imgSrc.getAttribute('alt') || '';
    const link = imgSrc.closest('a[href]');
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.append(img);
      mediaCell.push(a);
    } else {
      mediaCell.push(img);
    }
  }

  // ---- Text column -----------------------------------------------------------
  const textCell = [];
  const textScope = columns.filter((c) => c !== imageCol);
  const scopes = textScope.length ? textScope : [element];
  scopes.forEach((col) => {
    const nodes = [...col.querySelectorAll('h1, h2, h3, h4, h5, h6, .cmp-text p, a.btn')]
      .filter((el) => !el.parentElement.closest('h1, h2, h3, h4, h5, h6, p, a.btn'));
    nodes.forEach((el) => {
      const text = el.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return;
      if (el.tagName === 'A') {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = el.getAttribute('href');
        a.textContent = text;
        const strong = document.createElement('strong');
        strong.append(a);
        p.append(strong);
        textCell.push(p);
      } else if (/^H\d$/.test(el.tagName)) {
        const h = document.createElement(el.tagName.toLowerCase());
        h.textContent = text;
        textCell.push(h);
      } else {
        textCell.push(el);
      }
    });
  });

  if (!mediaCell.length && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[mediaCell.length ? mediaCell : '', textCell.length ? textCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
