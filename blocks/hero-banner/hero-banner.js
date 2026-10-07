import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero banner: split layout with text content (heading, subtitle, CTA) on the left
 * and a photo on the right. Authors may put the image in its own row (row 1) or in the
 * same row as the text; either row may be omitted.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');

  const content = document.createElement('div');
  content.className = 'hero-banner-content';

  const media = document.createElement('div');
  media.className = 'hero-banner-media';

  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt, true, [
        { media: '(min-width: 900px)', width: '1200' },
        { width: '750' },
      ])
      : picture;
    // eager-load: hero is above the fold
    const optimizedImg = optimized.querySelector('img');
    if (optimizedImg) {
      optimizedImg.loading = 'eager';
      optimizedImg.fetchPriority = 'high';
    }
    media.append(optimized);
    picture.remove();
  }

  // collect remaining authored content (text, headings, links) in authoring order
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      [...cell.childNodes].forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // drop paragraphs left empty after the picture was moved
          if (node.tagName === 'P' && !node.textContent.trim() && !node.querySelector('img, picture, a')) return;
          content.append(node);
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          const p = document.createElement('p');
          p.textContent = node.textContent.trim();
          content.append(p);
        }
      });
    });
  });

  block.replaceChildren(content);
  if (media.children.length) {
    block.append(media);
    block.classList.add('hero-banner-has-media');
  }
}
