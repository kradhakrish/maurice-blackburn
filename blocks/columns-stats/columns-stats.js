/**
 * Stats columns: a highlighted stat with supporting statements on the left, and a short
 * heading, list of links and a button on the right.
 * 1 row x 2 cells: [stat heading + statements] | [heading, link list, button].
 * Authors may omit or add cells.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const colCount = firstRow ? firstRow.children.length : 0;
  block.classList.add(`columns-stats-${colCount}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-stats-row');
    [...row.children].forEach((col, i) => {
      col.classList.add('columns-stats-col');
      const hasList = col.querySelector('ul, ol');
      // first column (or any column without a link list) is the stat column
      if (i === 0 && (!hasList || row.children.length === 1)) col.classList.add('columns-stats-stat');
      else col.classList.add('columns-stats-links');

      // mark the leading heading of a stat column as the stat figure
      if (col.classList.contains('columns-stats-stat')) {
        const figure = col.querySelector('h1, h2, h3, h4, h5, h6');
        if (figure) figure.classList.add('columns-stats-figure');
      }

      col.querySelectorAll('ul, ol').forEach((list) => list.classList.add('columns-stats-list'));
    });
  });
}
