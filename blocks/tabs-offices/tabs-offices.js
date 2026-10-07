import { toClassName } from '../../scripts/aem.js';

let instanceCount = 0;

/**
 * Office tabs: pill-style state selector; each panel holds a list of office links
 * (shown in two columns) or a paragraph of contact text.
 * Each row = one tab: [label] | [content]. Rows missing a label or content are tolerated.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  instanceCount += 1;
  const prefix = `tabs-offices-${instanceCount}`;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-offices-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children].filter((row) => row.textContent.trim());
  const panels = [];
  const buttons = [];

  const select = (index, focus = false) => {
    panels.forEach((panel, i) => {
      panel.setAttribute('aria-hidden', i !== index);
      buttons[i].setAttribute('aria-selected', i === index);
      buttons[i].tabIndex = i === index ? 0 : -1;
    });
    if (focus) buttons[index].focus();
  };

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const labelCell = cells.length > 1 ? cells[0] : null;
    const label = (labelCell && labelCell.textContent.trim()) || `Tab ${i + 1}`;
    const id = `${prefix}-${toClassName(label) || i}-${i}`;

    const panel = document.createElement('div');
    panel.className = 'tabs-offices-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${id}-tab`);
    (labelCell ? cells.slice(1) : cells).forEach((cell) => {
      while (cell.firstChild) panel.append(cell.firstChild);
    });
    panel.querySelectorAll('ul, ol').forEach((list) => list.classList.add('tabs-offices-links'));

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-offices-tab';
    button.id = `${id}-tab`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    if (labelCell) button.innerHTML = labelCell.innerHTML;
    else button.textContent = label;
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') select((i + 1) % rows.length, true);
      else if (e.key === 'ArrowLeft') select((i - 1 + rows.length) % rows.length, true);
    });

    tablist.append(button);
    buttons.push(button);
    panels.push(panel);
  });

  block.replaceChildren(tablist, ...panels);
  if (panels.length) select(0);
}
