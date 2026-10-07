/* eslint-disable */
/* global WebImporter */
/**
 * Parser for widget-reviews. Base: widget (project widget block, no library convention).
 * Source: https://www.mauriceblackburn.com.au/ (#fiveStar > .customPadding > .aem-Grid > .embed)
 * Output: 1 row x 1 cell: link to the project widget /widgets/reviews/elfsight.html?appId=<id>.
 * The source is a client-rendered Elfsight "All-in-one reviews" app (~860KB of rendered review
 * cards). That markup is NOT migrated - only the Elfsight app id is kept so the widget can
 * re-mount the live third-party embed. The block exposes query params as data attributes
 * (block.dataset.appId).
 */
const WIDGET_PATH = '/widgets/reviews/elfsight.html';

export default function parse(element, { document }) {
  // Elfsight mount: <div class="elfsight-app-<uuid>">
  let appId = null;
  const mount = element.querySelector('[class*="elfsight-app-"]');
  if (mount) {
    const cls = [...mount.classList].find((c) => c.startsWith('elfsight-app-'));
    if (cls) appId = cls.replace('elfsight-app-', '');
  }
  if (!appId) {
    // fallback: rendered root carries eapps-<type>-<uuid>-custom-css-root
    const root = element.querySelector('[class*="eapps-"]');
    const m = root && root.className.match(/eapps-[a-z-]+?-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/);
    if (m) [, appId] = m;
  }

  if (!appId) {
    // not an Elfsight embed - leave nothing behind rather than 860KB of rendered markup
    element.remove();
    return;
  }

  const href = `${WIDGET_PATH}?appId=${encodeURIComponent(appId)}`;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = href;

  const cells = [[a]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'widget-reviews', cells });
  element.replaceWith(block);
}
