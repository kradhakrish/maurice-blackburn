/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-stories. Base: tabs.
 * Source: https://www.mauriceblackburn.com.au/ (#clients .tabs)
 * Output: one row per tab, 2 cells: [tab label] | [Vimeo video link, h2, paragraphs, story link].
 * Tabs (li.cmp-tabs__tab) are paired to panels (.cmp-tabs__tabpanel) by id
 * ("...-tab" -> "...-tabpanel"), falling back to document order.
 * Vimeo iframes are emitted as links (the block creates the player on first show).
 */
function toVideoUrl(src) {
  if (!src) return null;
  try {
    const url = new URL(src, 'https://www.mauriceblackburn.com.au/');
    const m = url.hostname.includes('vimeo.com') && url.pathname.match(/\/video\/(\d+)/);
    if (m) {
      const h = url.searchParams.get('h');
      return `https://vimeo.com/${m[1]}${h ? `/${h}` : ''}`;
    }
    const yt = url.hostname.includes('youtube') && url.pathname.match(/\/embed\/([^/?]+)/);
    if (yt) return `https://www.youtube.com/watch?v=${yt[1]}`;
    return url.href;
  } catch (e) {
    return null;
  }
}

function panelContent(panel, document) {
  const out = [];
  const iframe = panel.querySelector('iframe.video-iframe, iframe');
  const videoUrl = toVideoUrl(iframe && (iframe.getAttribute('src') || iframe.getAttribute('data-src')));
  if (videoUrl) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = videoUrl;
    a.textContent = videoUrl;
    p.append(a);
    out.push(p);
  }

  // story text lives in innermost .cmp-text containers (not the video heading section)
  let texts = [...panel.querySelectorAll('.cmp-text')].filter((t) => !t.querySelector('.cmp-text'));
  if (!texts.length) texts = [panel];
  texts.forEach((t) => {
    [...t.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > p, :scope > ul, :scope > ol, :scope > blockquote')]
      .forEach((el) => {
        if (el.closest('.video__heading-section')) return;
        if (!el.textContent.trim() && !el.querySelector('img')) return;
        out.push(el);
      });
  });
  return out;
}

export default function parse(element, { document }) {
  const tabs = [...element.querySelectorAll('.cmp-tabs__tablist > .cmp-tabs__tab, li.cmp-tabs__tab')]
    .filter((t, i, arr) => arr.indexOf(t) === i);
  const panels = [...element.querySelectorAll('.cmp-tabs__tabpanel')]
    .filter((p) => !p.parentElement.closest('.cmp-tabs__tabpanel'));

  const cells = [];
  const used = new Set();
  tabs.forEach((tab, i) => {
    const label = (tab.querySelector('.cmp-tabs__tab-title') || tab).textContent.replace(/\s+/g, ' ').trim();
    let panel = null;
    if (tab.id) {
      const panelId = tab.id.replace(/-tab$/, '-tabpanel');
      panel = panels.find((p) => p.id === panelId) || null;
    }
    if (!panel) {
      const ctl = tab.getAttribute('aria-controls');
      if (ctl) panel = panels.find((p) => p.id === ctl) || null;
    }
    if (!panel) panel = panels.filter((p) => !used.has(p))[0] || panels[i] || null;
    if (panel) used.add(panel);
    const content = panel ? panelContent(panel, document) : [];
    if (!label && !content.length) return;
    cells.push([label || `Tab ${i + 1}`, content.length ? content : '']);
  });

  // panels without a matching tab (defensive)
  panels.filter((p) => !used.has(p)).forEach((p, i) => {
    const content = panelContent(p, document);
    if (content.length) cells.push([`Tab ${tabs.length + i + 1}`, content]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-stories', cells });
  element.replaceWith(block);
}
