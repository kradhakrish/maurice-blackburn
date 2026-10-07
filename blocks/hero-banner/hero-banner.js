import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero banner: gradient band with text (heading, subtitle) and CTA on the left and a framed
 * photo on the right. Authors may put the image(s) in their own row or in the same row as the
 * text; either row may be omitted. A second image is used as the mobile art-direction image.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const [desktopPic, mobilePic] = [...block.querySelectorAll('picture')];

  const inner = document.createElement('div');
  inner.className = 'hero-banner-inner';

  const content = document.createElement('div');
  content.className = 'hero-banner-content';

  const actions = document.createElement('div');
  actions.className = 'hero-banner-actions';

  const media = document.createElement('div');
  media.className = 'hero-banner-media';

  if (desktopPic) {
    const desktopImg = desktopPic.querySelector('img');
    const mobileImg = mobilePic && mobilePic.querySelector('img');
    let picture = desktopPic;
    if (desktopImg) {
      picture = createOptimizedPicture(desktopImg.src, desktopImg.alt, true, [
        { media: '(min-width: 992px)', width: '1400' },
        { width: '750' },
      ]);
      if (mobileImg) {
        // art direction: the wide mobile crop below the desktop breakpoint. Built lazy so the
        // helper's throwaway <img> is never fetched; only its <source> elements are kept.
        const mobileSources = createOptimizedPicture(mobileImg.src, mobileImg.alt, false, [
          { media: '(max-width: 991px)', width: '750' },
          { width: '750' },
        ]).querySelectorAll('source[media]');
        picture.prepend(...mobileSources);
      }
    }
    // eager-load: hero is above the fold
    const img = picture.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
    const frame = document.createElement('div');
    frame.className = 'hero-banner-frame';
    frame.append(picture);
    media.append(frame);
    desktopPic.remove();
    if (mobilePic) mobilePic.remove();
  }

  // collect remaining authored content in authoring order; button paragraphs go to actions
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      [...cell.childNodes].forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // drop paragraphs left empty after the pictures were moved
          if (node.tagName === 'P' && !node.textContent.trim() && !node.querySelector('img, picture, a')) return;
          const isCta = node.matches('.button-wrapper')
            || (node.tagName === 'P' && node.querySelector('a') && node.textContent.trim() === node.querySelector('a').textContent.trim());
          (isCta ? actions : content).append(node);
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          const p = document.createElement('p');
          p.textContent = node.textContent.trim();
          content.append(p);
        }
      });
    });
  });

  inner.append(content);
  if (media.children.length) {
    inner.append(media);
    block.classList.add('hero-banner-has-media');
  }
  if (actions.children.length) inner.append(actions);
  block.replaceChildren(inner);
}
