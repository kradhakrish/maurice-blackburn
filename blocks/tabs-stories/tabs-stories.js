import { toClassName } from '../../scripts/aem.js';

let instanceCount = 0;

/**
 * Builds an embed URL for a Vimeo or YouTube link, or null if the link is not a video.
 * @param {string} href authored link
 * @returns {string|null}
 */
function getEmbedUrl(href) {
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'player.vimeo.com') return url.href;
  if (host === 'vimeo.com') {
    const [id, hash] = url.pathname.split('/').filter(Boolean);
    if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ''}`;
  }
  if (host === 'youtu.be') return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
  if (host.endsWith('youtube.com')) {
    const id = url.searchParams.get('v');
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  return null;
}

/**
 * Replaces the video link in a panel with a placeholder; the iframe is created
 * the first time the panel is shown, so hidden panels don't load players.
 * @param {Element} panel tab panel
 * @returns {Element|null} media wrapper
 */
function prepareVideo(panel) {
  const link = [...panel.querySelectorAll('a[href]')].find((a) => getEmbedUrl(a.href));
  if (!link) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'tabs-stories-video';
  wrapper.dataset.src = getEmbedUrl(link.href);
  const text = link.textContent.trim();
  wrapper.dataset.title = text && text !== link.href ? text : 'Video';
  const para = link.closest('p');
  const target = para && para.textContent.trim() === text ? para : link;
  target.replaceWith(wrapper);
  return wrapper;
}

function loadVideo(panel) {
  const wrapper = panel.querySelector('.tabs-stories-video[data-src]');
  if (!wrapper || wrapper.querySelector('iframe')) return;
  const iframe = document.createElement('iframe');
  iframe.src = wrapper.dataset.src;
  iframe.title = wrapper.dataset.title;
  iframe.loading = 'lazy';
  iframe.allow = 'autoplay; fullscreen; picture-in-picture';
  iframe.allowFullscreen = true;
  wrapper.append(iframe);
}

/**
 * Story tabs: pill tab navigation; each panel shows a video beside a story
 * (title, paragraphs, quote, link). Each row = one tab: [label] | [content].
 * Rows missing a label or content are tolerated.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  instanceCount += 1;
  const prefix = `tabs-stories-${instanceCount}`;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-stories-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children].filter((row) => row.textContent.trim() || row.querySelector('a, picture'));
  const panels = [];
  const buttons = [];

  const select = (index, focus = false) => {
    panels.forEach((panel, i) => {
      panel.setAttribute('aria-hidden', i !== index);
      buttons[i].setAttribute('aria-selected', i === index);
      buttons[i].tabIndex = i === index ? 0 : -1;
    });
    loadVideo(panels[index]);
    if (focus) buttons[index].focus();
  };

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const labelCell = cells.length > 1 ? cells[0] : null;
    const label = (labelCell && labelCell.textContent.trim()) || `Tab ${i + 1}`;
    const id = `${prefix}-${toClassName(label) || i}-${i}`;

    // panel: everything except the label cell
    const panel = document.createElement('div');
    panel.className = 'tabs-stories-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${id}-tab`);

    const content = document.createElement('div');
    content.className = 'tabs-stories-content';
    (labelCell ? cells.slice(1) : cells).forEach((cell) => {
      while (cell.firstChild) content.append(cell.firstChild);
    });
    panel.append(content);

    const video = prepareVideo(content);
    if (video) {
      const media = document.createElement('div');
      media.className = 'tabs-stories-media';
      media.append(video);
      panel.prepend(media);
      panel.classList.add('tabs-stories-has-video');
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-stories-tab';
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
