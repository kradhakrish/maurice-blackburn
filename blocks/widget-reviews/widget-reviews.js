import { loadCSS } from '../../scripts/aem.js';

/**
 * Parses a widget href into folder path and name.
 * `/widgets/reviews/elfsight.html` -> { widgetPath: 'reviews', widgetName: 'elfsight' }
 * @param {string} pathname URL pathname
 * @returns {{ widgetPath: string, widgetName: string }|null}
 */
function parseWidgetHref(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const index = segments.indexOf('widgets');
  if (index === -1 || segments.length <= index + 1) return null;
  const widgetName = segments[segments.length - 1].split('.')[0];
  const widgetPath = segments.slice(index + 1, -1).join('/');
  return widgetName ? { widgetPath, widgetName } : null;
}

function widgetUrl(widgetPath, widgetName, extension) {
  const prefix = widgetPath ? `${widgetPath}/` : '';
  const base = (window.hlx && window.hlx.codeBasePath) || '';
  return `${base}/widgets/${prefix}${widgetName}.${extension}`;
}

/**
 * Reviews widget: loads a project widget (HTML + CSS + JS from /widgets/) that renders
 * the third-party reviews carousel. Single cell containing a link to
 * /widgets/<path>/<name>.html; query params on the link are exposed as data attributes.
 * If the link is missing or not a widget link, the authored content is left as-is.
 * @param {Element} block the block element
 */
export default async function decorate(block) {
  const source = block.querySelector('a[href]');
  if (!source) return;

  let url;
  try {
    url = new URL(source.href, window.location.href);
  } catch {
    return;
  }
  const parsed = parseWidgetHref(url.pathname);
  if (!parsed) return;
  const { widgetPath, widgetName } = parsed;

  block.classList.add(widgetName);
  block.dataset.source = source.href;
  url.searchParams.forEach((value, key) => {
    block.dataset[key] = value;
  });

  try {
    const resp = await fetch(widgetUrl(widgetPath, widgetName, 'html'));
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();
    const content = document.createElement('div');
    content.className = 'widget-reviews-content';
    content.innerHTML = html;
    block.replaceChildren(content);

    const cssLoaded = loadCSS(widgetUrl(widgetPath, widgetName, 'css'));
    const decorated = (async () => {
      const mod = await import(widgetUrl(widgetPath, widgetName, 'js'));
      if (mod.default) await mod.default(block);
    })();
    await Promise.all([cssLoaded, decorated]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`failed to load widget ${widgetPath}/${widgetName}`, error);
  }
}
