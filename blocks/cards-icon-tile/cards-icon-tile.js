import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Icon tiles: a row of equal tiles, each an icon above a short (linked) heading.
 * Each authored row = one tile: [icon] | [heading, optional text, optional link].
 * The first link in a tile is stretched so the whole tile is clickable.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.some((c) => c.textContent.trim() || c.querySelector('picture, img, .icon'))) return;

    const li = document.createElement('li');
    cells.forEach((cell) => {
      const hasMedia = cell.querySelector('picture, img, .icon');
      cell.className = hasMedia && !cell.textContent.trim()
        ? 'cards-icon-tile-icon'
        : 'cards-icon-tile-body';
      li.append(cell);
    });

    // make the whole tile clickable via the first link (heading link preferred)
    const link = li.querySelector('h1 a, h2 a, h3 a, h4 a, h5 a, h6 a') || li.querySelector('a[href]');
    if (link) {
      link.classList.add('cards-icon-tile-link');
      li.classList.add('cards-icon-tile-linked');
      // hide secondary links that duplicate the tile target (e.g. a hidden "Learn more")
      li.querySelectorAll('a[href]').forEach((a) => {
        if (a !== link && a.href === link.href) {
          const wrapper = a.closest('p') || a;
          wrapper.classList.add('cards-icon-tile-duplicate');
        }
      });
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '160' }]));
  });

  block.replaceChildren(ul);
}
