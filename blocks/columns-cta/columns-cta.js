/**
 * CTA columns: heading + paragraph on the left, a stack of button links on the right.
 * 1 row x 2 cells: [heading, paragraph] | [button links]. Authors may omit or add cells.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const colCount = firstRow ? firstRow.children.length : 0;
  block.classList.add(`columns-cta-${colCount}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-cta-row');
    [...row.children].forEach((col) => {
      col.classList.add('columns-cta-col');
      const links = [...col.querySelectorAll('a[href]')];
      const text = col.textContent.replace(/\s+/g, '');
      const linkText = links.map((a) => a.textContent).join('').replace(/\s+/g, '');
      // a column made up only of links is the button stack
      if (links.length && text === linkText) {
        col.classList.add('columns-cta-actions');
        links.forEach((a) => {
          a.classList.add('button');
          const p = a.closest('p');
          if (p && p.parentElement === col) p.classList.add('button-container');
        });
      } else {
        col.classList.add('columns-cta-text');
      }
    });
  });
}
