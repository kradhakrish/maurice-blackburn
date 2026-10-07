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

// class of the generic auto-block that scripts.js buildWidgetAutoBlocks() creates
const AUTO_WIDGET_CLASS = 'widget';

/**
 * Undoes the generic `/widgets/` auto-block that scripts.js builds around any widget link
 * whose ancestors lack the generic widget class (this block's own class does not count),
 * so this block stays the only loader: the nested auto-block is replaced by its link.
 * @param {Element} block the block element
 */
function unwrapAutoWidgets(block) {
  [...block.querySelectorAll('div')]
    .filter((el) => el.classList.contains(AUTO_WIDGET_CLASS))
    .forEach((nested) => {
      const link = nested.querySelector('a[href]');
      if (link) nested.replaceWith(link);
      else nested.remove();
    });
}

/**
 * Hides the block when the widget can't be rendered, so neither the raw widget URL
 * nor an empty placeholder box is shown.
 * @param {Element} block the block element
 */
function markUnavailable(block) {
  block.replaceChildren();
  block.classList.add('widget-reviews-unavailable');
  block.setAttribute('aria-hidden', 'true');
}

/**
 * Reviews widget: loads a project widget (HTML + CSS + JS from /widgets/) that renders
 * the third-party reviews carousel. Single cell containing a link to
 * /widgets/<path>/<name>.html; query params on the link are exposed as data attributes.
 * If the link is missing or not a widget link, the authored content is left as-is.
 * If the widget files are missing (e.g. 404) the block hides itself.
 * @param {Element} block the block element
 */
export default async function decorate(block) {
  unwrapAutoWidgets(block);

  const source = block.querySelector('a[href*="/widgets/"]') || block.querySelector('a[href]');
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

  // the authored link is configuration, not content: never show the raw URL
  const content = document.createElement('div');
  content.className = 'widget-reviews-content';
  block.replaceChildren(content);

  try {
    const resp = await fetch(widgetUrl(widgetPath, widgetName, 'html'));
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();
    if (!html.trim()) throw new Error('empty widget markup');
    content.innerHTML = html;

    const cssLoaded = loadCSS(widgetUrl(widgetPath, widgetName, 'css'));
    const decorated = (async () => {
      const mod = await import(widgetUrl(widgetPath, widgetName, 'js'));
      if (mod.default) await mod.default(block);
    })();
    await Promise.all([cssLoaded, decorated]);
  } catch (error) {
    markUnavailable(block);
    // eslint-disable-next-line no-console
    console.warn(`widget-reviews: widget ${widgetPath}/${widgetName} unavailable, block hidden`, error.message);
  }
}
