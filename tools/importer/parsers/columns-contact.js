/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-contact. Base: columns.
 * Source: https://www.mauriceblackburn.com.au/ (#contact; right column = sibling #float)
 * Output: 1 row x 2 cells:
 *   [h2, h3, paragraphs, tick list] | [h3 "Request a FREE call", form link]
 * The callback form is an AEM adaptive form (not migrated) - the right column gets a link
 * under /forms/ which the block flags (.columns-contact-form-link) for a downstream form loader.
 * #float is consumed here and removed so it is not imported twice.
 */
const FORM_HREF = '/forms/request-a-free-call';

export default function parse(element, { document }) {
  // ---- Left column -------------------------------------------------------
  const left = [];
  const embed = element.querySelector('.cmp-embed') || element;
  [...embed.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > p')].forEach((el) => {
    if (!el.textContent.trim()) return;
    left.push(el);
  });

  // tick list: .info-item = [tick icon, p]; the tick is decorative (block styles the list)
  const items = [...element.querySelectorAll('.info-item')];
  if (items.length) {
    const ul = document.createElement('ul');
    items.forEach((item) => {
      const text = item.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return;
      const li = document.createElement('li');
      const p = item.querySelector('p');
      if (p) li.innerHTML = p.innerHTML;
      else li.textContent = text;
      li.querySelectorAll('sup').forEach((s) => { if (!s.textContent.trim()) s.remove(); });
      ul.append(li);
    });
    if (ul.children.length) left.push(ul);
  }

  // ---- Right column (#float sibling) ---------------------------------------
  const scope = element.closest('.full-width-background-extend, .customPadding') || element.ownerDocument;
  const float = scope.querySelector('#float') || element.ownerDocument.querySelector('#float');
  const right = [];
  if (float) {
    const headingEl = float.querySelector('.cmp-text h1, .cmp-text h2, .cmp-text h3, .cmp-text h4, h3, h2');
    const title = headingEl ? headingEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      right.push(h3);
    }
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = FORM_HREF;
    a.textContent = title || 'Request a FREE call';
    p.append(a);
    right.push(p);
    // remove the consumed column so the form markup is not imported as default content
    const col = float.closest('.aem-GridColumn');
    (col && !col.contains(element) ? col : float).remove();
  }

  if (!left.length && !right.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[left.length ? left : '', right.length ? right : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);
}
