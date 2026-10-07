/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icon-tile. Base: cards.
 * Source: https://www.mauriceblackburn.com.au/ (#serviceTile > .customPadding > .aem-Grid)
 * Output: one row per tile, 2 cells: [icon] | [h3 linked to the tile target].
 * Iterates the block-level .icon-tile-body wrappers (6 tiles). The visually hidden
 * "Learn more" link supplies the tile href and is folded into the heading link.
 * Tiles inside the hidden #sellingPointContainer set are skipped.
 */
export default function parse(element, { document }) {
  let bodies = [...element.querySelectorAll('.icon-tile-body')];
  if (!bodies.length) bodies = [...element.querySelectorAll('.card.icon-tile, .card')];
  bodies = bodies.filter((b) => !b.closest('#sellingPointContainer'));

  const cells = [];
  bodies.forEach((body) => {
    const icon = body.querySelector('img.icon-tile-img, .icon-tile-header img, img');
    const headingEl = body.querySelector('.icon-tile-heading, h2, h3, h4');
    const link = body.querySelector('.cmp-teaser__action-container a[href], a[href]')
      || body.closest('a[href]');
    const title = headingEl ? headingEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!icon && !title) return;

    const bodyCell = [];
    if (title) {
      const h3 = document.createElement('h3');
      if (link) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      bodyCell.push(h3);
    } else if (link) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.replace(/\s+/g, ' ').trim();
      p.append(a);
      bodyCell.push(p);
    }

    cells.push([icon || '', bodyCell.length ? bodyCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-tile', cells });
  element.replaceWith(block);
}
