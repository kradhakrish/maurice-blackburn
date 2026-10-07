import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * USP strip: a horizontal row of short selling points, each an inline icon followed by text.
 * Each authored row = one item: [icon/image] | [text]. Either cell may be omitted.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length || cells.every((c) => !c.textContent.trim() && !c.querySelector('picture, img, .icon'))) return;

    const li = document.createElement('li');
    cells.forEach((cell) => {
      const hasMedia = cell.querySelector('picture, img, .icon');
      const isMediaOnly = hasMedia && !cell.textContent.trim();
      cell.className = isMediaOnly ? 'cards-usp-icon' : 'cards-usp-text';
      li.append(cell);
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '96' }]));
  });

  block.replaceChildren(ul);
}
