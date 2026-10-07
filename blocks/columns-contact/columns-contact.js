/**
 * Contact columns: pitch copy + tick list on the left, a callback-request card
 * (heading + form reference) on the right. Each row is a set of side-by-side columns;
 * authors may omit or add cells.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const colCount = firstRow ? firstRow.children.length : 0;
  block.classList.add(`columns-contact-${colCount}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-contact-row');
    const cols = [...row.children];
    cols.forEach((col, i) => {
      col.classList.add('columns-contact-col');
      // the last column of a multi-column row holds the form card
      if (cols.length > 1 && i === cols.length - 1) col.classList.add('columns-contact-card');
      else col.classList.add('columns-contact-text');

      col.querySelectorAll('ul').forEach((ul) => ul.classList.add('columns-contact-list'));

      // a lone link to a form definition is flagged so a form loader can pick it up downstream
      col.querySelectorAll('a[href]').forEach((a) => {
        const href = a.getAttribute('href') || '';
        if (/\/forms?\//i.test(href) || /\.json(\?|$)/i.test(href)) {
          a.classList.add('columns-contact-form-link');
        }
      });
    });
  });
}
