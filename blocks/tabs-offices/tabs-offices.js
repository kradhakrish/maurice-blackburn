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
      // native `hidden` removes inactive panels from layout AND the accessibility tree
      // (aria-hidden + display:none still leaked the links' CSS-generated chevrons)
      panel.hidden = i !== index;
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
    // drop whitespace-only text nodes and empty paragraphs left by authoring
    [...panel.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node.remove();
      else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P'
        && !node.textContent.trim() && !node.querySelector('img, picture, a')) node.remove();
    });
    panel.querySelectorAll('ul, ol').forEach((list) => list.classList.add('tabs-offices-links'));

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-offices-tab';
    button.id = `${id}-tab`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    // buttons only allow phrasing content: unwrap the <p> that wrapTextNodes adds to the label
    const labelSource = labelCell && labelCell.children.length === 1 && labelCell.firstElementChild.tagName === 'P'
      ? labelCell.firstElementChild
      : labelCell;
    if (labelSource && !labelSource.querySelector('p, div, ul, ol, h1, h2, h3, h4, h5, h6')) {
      button.innerHTML = labelSource.innerHTML;
    } else {
      button.textContent = label;
    }
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
