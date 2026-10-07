/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://www.mauriceblackburn.com.au/ (.cmp-page-banner > .cmp-page-banner-container)
 * Output: Row 1 = image (optional), Row 2 = [h1, subtitle, CTA].
 * Source has a desktop + mobile image and a desktop + mobile CTA duplicate - only the desktop
 * versions are kept.
 */
export default function parse(element, { document }) {
  const heading = element.querySelector('.pb-title, h1, h2');
  const subtitle = element.querySelector('.pb-subtitle, .cmp-page-banner-content p');
  const image = element.querySelector('img.desktop-image')
    || element.querySelector('.image-container img, img.pb-image, img');

  // CTA: desktop buttons first, fall back to any button set.
  const ctaContainer = element.querySelector('.pb-buttons--desktop')
    || element.querySelector('.pb-buttons');
  const ctaSources = ctaContainer ? [...ctaContainer.querySelectorAll('a')] : [];

  if (!heading && !subtitle) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (heading) {
    const h1 = document.createElement('h1');
    h1.innerHTML = heading.innerHTML;
    contentCell.push(h1);
  }
  if (subtitle) {
    const p = document.createElement('p');
    p.innerHTML = subtitle.innerHTML;
    contentCell.push(p);
  }
  ctaSources.forEach((src) => {
    const text = src.textContent.trim();
    if (!text) return;
    const p = document.createElement('p');
    const a = document.createElement('a');
    // "Chat with Morry" opens the chat widget via JS and has no href on the source.
    a.href = src.getAttribute('href') || '#chat-with-morry';
    a.textContent = text;
    const strong = document.createElement('strong');
    strong.append(a);
    p.append(strong);
    contentCell.push(p);
  });

  const cells = [];
  if (image) cells.push([image]);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
