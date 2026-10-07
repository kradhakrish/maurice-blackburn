/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Maurice Blackburn site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html (homepage capture).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Remove the nearest AEM grid column wrapping `el` (falls back to `el` itself).
function removeColumn(el) {
  if (!el) return;
  const col = el.closest('.aem-GridColumn');
  (col || el).remove();
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / widgets that sit outside the page body content.
    WebImporter.DOMUtils.remove(element, [
      '.state-selector-popup', // "Please select your location" modal
      '#mb-chat', // Morry chat mount
      '#cw-shadow-host', // chat widget shadow host
      '#__EAAPS_PORTAL', // Elfsight portal root (reviews widget overlay)
      '[id^="batBeacon"]', // Bing tracking beacon
      'iframe:not(.video-iframe)', // demdex / adsrvr / blank tracking iframes
    ]);

    // Duplicate Adobe Target insert of the "Easy ways to get in touch" CTA band:
    // keep only the first .AT_placeholder sibling.
    WebImporter.DOMUtils.remove(element, ['.AT_placeholder ~ .AT_placeholder']);

    // Hidden selling-point tile sets (hidden on every breakpoint, incl. mobile-only icon tiles).
    removeColumn(element.querySelector('#sellingPointContainer'));

    // Sticky CTA bar #1: fixed "Call 1800 111 222 / Start your free claim check" embed.
    element.querySelectorAll('section.cta-fixed').forEach((s) => {
      const col = s.closest('.container-wrapper') && s.closest('.container-wrapper').closest('.aem-GridColumn');
      (col || s).remove();
    });

    // Sticky CTA bar #2: Morry CTA experience fragment ("We're here to help, speak to our team now").
    element.querySelectorAll('#morry_cta').forEach((el) => {
      const xf = el.closest('.experiencefragment');
      (xf || el).remove();
    });

    // Live-chat experience fragment (empty embed) - remove the outer XF column too.
    element.querySelectorAll('.cmp-experiencefragment--live-chat').forEach((el) => {
      let xf = el.closest('.experiencefragment');
      const outer = xf && xf.parentElement && xf.parentElement.closest('.experiencefragment');
      if (outer) xf = outer;
      (xf || el).remove();
    });

    // "Office locations" is an eyebrow label authored as an h4 after an h2; as a heading it skips
    // a level, so carry it over as a paragraph.
    element.querySelectorAll('.office-listing .left-container h4').forEach((h) => {
      const p = element.ownerDocument.createElement('p');
      p.innerHTML = h.innerHTML;
      h.replaceWith(p);
    });

    // Empty spacer / empty embed columns directly in the body-content grid.
    element.querySelectorAll('.body-content > .container-wrapper > div > .aem-Grid > .aem-GridColumn').forEach((col) => {
      const hasText = col.textContent.replace(/\s+/g, '').length > 0;
      const hasMedia = col.querySelector('img, picture, iframe, video, form');
      if (!hasText && !hasMedia) col.remove();
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome: header and footer experience fragments (contain nav.navbar / footer.footer).
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--header',
      '.cmp-experiencefragment--footer',
      'nav.navbar',
      'footer.footer',
    ]);

    // Leftover non-authorable elements (Adobe Target <link> injections, remaining iframes, noscript).
    WebImporter.DOMUtils.remove(element, ['link', 'iframe', 'noscript']);

    // Strip tracking / AT marker attributes.
    element.querySelectorAll('[data-cmp-data-layer], [data-at-src], .at-element-marker').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
      el.removeAttribute('data-at-src');
      el.classList.remove('at-element-marker');
    });
  }
}
