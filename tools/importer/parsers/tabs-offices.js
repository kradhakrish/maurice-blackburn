/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-offices. Base: tabs.
 * Source: https://www.mauriceblackburn.com.au/ (.office-listing .right-container)
 * Output: one row per state tab, 2 cells: [state label] | [list of office links, or paragraph].
 * Tabs (li.cmp-tabs__tab) are paired to panels (.cmp-tabs__tabpanel) by id
 * ("...-tab" -> "...-tabpanel"), falling back to document order.
 * Office list items are rebuilt from the title span only (drops the decorative ">" chevron).
 * The "Select your state below" label above the tabs is kept as default content before the block.
 */
function buildList(ul, document) {
  const list = document.createElement('ul');
  [...ul.querySelectorAll(':scope > li')].forEach((li) => {
    const link = li.querySelector('a[href]');
    const titleEl = li.querySelector('.cmp-list__item-title, .cmp-list__variation-item-title');
    const text = (titleEl || link || li).textContent.replace(/\s+/g, ' ').replace(/\s*>\s*$/, '').trim();
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
  return list.children.length ? list : null;
}

function panelContent(panel, document) {
  const out = [];
  const nodes = [...panel.querySelectorAll('ul, ol, p, h2, h3, h4')]
    .filter((el) => !el.parentElement.closest('ul, ol, p, h2, h3, h4'));
  nodes.forEach((el) => {
    if (!el.textContent.trim()) return;
    if (el.tagName === 'UL' || el.tagName === 'OL') {
      const list = buildList(el, document);
      if (list) out.push(list);
    } else {
      out.push(el);
    }
  });
  return out;
}

export default function parse(element, { document }) {
  const tabs = [...element.querySelectorAll('li.cmp-tabs__tab')];
  const panels = [...element.querySelectorAll('.cmp-tabs__tabpanel')]
    .filter((p) => !p.parentElement.closest('.cmp-tabs__tabpanel'));

  // label heading above the tab list (not inside any panel)
  const intro = [...element.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    .filter((h) => !h.closest('.cmp-tabs__tabpanel') && !h.closest('.cmp-tabs__tablist') && h.textContent.trim());

  const cells = [];
  const used = new Set();
  tabs.forEach((tab, i) => {
    const label = (tab.querySelector('.cmp-tabs__tab-title') || tab).textContent.replace(/\s+/g, ' ').trim();
    let panel = null;
    if (tab.id) panel = panels.find((p) => p.id === tab.id.replace(/-tab$/, '-tabpanel')) || null;
    if (!panel && tab.getAttribute('aria-controls')) {
      panel = panels.find((p) => p.id === tab.getAttribute('aria-controls')) || null;
    }
    if (!panel) panel = panels.find((p) => !used.has(p)) || null;
    if (panel) used.add(panel);
    const content = panel ? panelContent(panel, document) : [];
    if (!label && !content.length) return;
    cells.push([label || `Tab ${i + 1}`, content.length ? content : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-offices', cells });
  intro.forEach((h) => element.before(h));
  element.replaceWith(block);
}
