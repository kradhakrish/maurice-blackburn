/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-cta. Base: columns.
 * Source: https://www.mauriceblackburn.com.au/
 *   (.AT_placeholder:not(.AT_placeholder ~ .AT_placeholder) #full-width-cta:not(#full-width-cta *))
 * Output: 1 row x 2 cells: [heading, paragraph] | [button links].
 * Buttons: the Morry AI button exists twice (desktop + mobile) - only the desktop one is kept;
 * its decorative inline SVG icon is dropped. Then the .btn links (call, free claim check).
 */
export default function parse(element, { document }) {
  // ---- Text column -----------------------------------------------------------
  const textCell = [];
  const heading = element.querySelector('h1, h2, h3, h4');
  if (heading) {
    const h = document.createElement(heading.tagName.toLowerCase());
    h.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    textCell.push(h);
  }
  [...element.querySelectorAll('p')]
    .filter((p) => !p.closest('a') && !p.querySelector('a.btn, a.morry-banner-btn') && p.textContent.trim())
    .forEach((p) => textCell.push(p));

  // ---- Button column ---------------------------------------------------------
  const buttons = [];
  const morry = element.querySelector('a.morry-banner-btn--desktop') || element.querySelector('a.morry-banner-btn');
  if (morry) buttons.push(morry);
  element.querySelectorAll('a.btn').forEach((a) => {
    if (!buttons.includes(a)) buttons.push(a);
  });

  const buttonCell = [];
  buttons.forEach((src) => {
    const labelEl = src.querySelector('.morry-banner-btn__label');
    const text = (labelEl || src).textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = src.getAttribute('href') || '#';
    a.textContent = text;
    p.append(a);
    buttonCell.push(p);
  });

  if (!textCell.length && !buttonCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell.length ? textCell : '', buttonCell.length ? buttonCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
  element.replaceWith(block);
}
