/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-stats. Base: columns.
 * Source: https://www.mauriceblackburn.com.au/ (#classAction > .customPadding > .aem-Grid)
 * Output: 1 row x 2 cells: [stat heading + statements] | [heading, link list, button].
 * Iterates the two direct grid columns (structure.json: 2 columns). The stat is a styled
 * <blockquote> in the source; it is emitted as an h2 so the block can mark it as the figure.
 */
const CONTENT_SEL = 'blockquote, h1, h2, h3, h4, h5, h6, ul, ol, a.btn, .cmp-text > p';

function buildColumn(col, document) {
  const nodes = [...col.querySelectorAll(CONTENT_SEL)]
    .filter((el) => !el.parentElement.closest(CONTENT_SEL));
  const out = [];
  nodes.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (!el.textContent.trim()) return;
    if (tag === 'blockquote') {
      const h2 = document.createElement('h2');
      const span = el.querySelector('.large-font');
      h2.innerHTML = (span || el).innerHTML.trim();
      out.push(h2);
    } else if (tag === 'ul' || tag === 'ol') {
      const list = document.createElement(tag);
      [...el.querySelectorAll(':scope > li')].forEach((li) => {
        const link = li.querySelector('a[href]');
        const titleEl = li.querySelector('.cmp-list__variation-item-title, .cmp-list__item-title');
        const text = (titleEl || li).textContent.replace(/\s+/g, ' ').trim();
        if (!text) return;
        const item = document.createElement('li');
        if (link) {
          const a = document.createElement('a');
          a.href = link.getAttribute('href');
          a.textContent = text;
          item.append(a);
        } else {
          item.textContent = text;
        }
        list.append(item);
      });
      if (list.children.length) out.push(list);
    } else if (tag === 'a') {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = el.getAttribute('href');
      a.textContent = el.textContent.replace(/\s+/g, ' ').trim();
      p.append(a);
      out.push(p);
    } else if (/^h[4-6]$/.test(tag)) {
      // source jumps h3 -> h5 ("Recent class actions:"); cap at h3 so heading order doesn't skip
      const h3 = document.createElement('h3');
      h3.innerHTML = el.innerHTML;
      out.push(h3);
    } else {
      out.push(el);
    }
  });
  return out;
}

export default function parse(element, { document }) {
  let columns = [...element.querySelectorAll(':scope > .aem-GridColumn')];
  if (!columns.length) columns = [...element.children];
  columns = columns.filter((c) => c.textContent.trim());

  const row = columns.map((col) => buildColumn(col, document)).filter((c) => c.length);
  if (!row.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-stats', cells });
  element.replaceWith(block);
}
