/**
 * Promo columns: a (linked) image on the left, eyebrow heading, main heading, note text
 * and a CTA button on the right. 1 row x 2 cells: [image] | [h3, h2, paragraph, button].
 * Animated GIFs are left untouched (no optimized-picture conversion, which would drop
 * the animation). Authors may omit or add cells.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const colCount = firstRow ? firstRow.children.length : 0;
  block.classList.add(`columns-promo-${colCount}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-promo-row');
    [...row.children].forEach((col) => {
      col.classList.add('columns-promo-col');
      const pic = col.querySelector('picture, img');
      if (pic && !col.textContent.trim()) {
        col.classList.add('columns-promo-media');
        col.querySelectorAll('img').forEach((img) => {
          img.loading = 'lazy';
        });
      } else {
        col.classList.add('columns-promo-text');
      }
    });
  });
}
