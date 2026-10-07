/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-usp. Base: cards.
 * Source: https://www.mauriceblackburn.com.au/ (.cmp-page-banner > .cmp-usp-banner)
 * Output: one row per USP item, 2 cells: [icon] | [text].
 * Iterates the block-level .cmp-usp-banner-item wrappers (structure.json: 3 items, iterationSafe).
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.cmp-usp-banner-item')];
  if (!items.length) {
    const container = element.querySelector('.cmp-usp-banner-container') || element;
    items = [...container.children];
  }

  const cells = [];
  items.forEach((item) => {
    const icon = item.querySelector('img, picture');
    const textEl = item.querySelector('span, p');
    const text = (textEl ? textEl.textContent : item.textContent).trim();
    if (!icon && !text) return;
    const p = document.createElement('p');
    p.textContent = text;
    cells.push([icon || '', text ? p : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-usp', cells });
  element.replaceWith(block);
}
