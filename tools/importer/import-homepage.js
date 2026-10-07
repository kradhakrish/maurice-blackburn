/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsUspParser from './parsers/cards-usp.js';
import cardsIconTileParser from './parsers/cards-icon-tile.js';
import columnsContactParser from './parsers/columns-contact.js';
import columnsVideoParser from './parsers/columns-video.js';
import columnsStatsParser from './parsers/columns-stats.js';
import tabsStoriesParser from './parsers/tabs-stories.js';
import widgetReviewsParser from './parsers/widget-reviews.js';
import columnsCtaParser from './parsers/columns-cta.js';
import columnsPromoParser from './parsers/columns-promo.js';
import tabsOfficesParser from './parsers/tabs-offices.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/mauriceblackburn-cleanup.js';
import sectionsTransformer from './transformers/mauriceblackburn-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-usp': cardsUspParser,
  'cards-icon-tile': cardsIconTileParser,
  'columns-contact': columnsContactParser,
  'columns-video': columnsVideoParser,
  'columns-stats': columnsStatsParser,
  'tabs-stories': tabsStoriesParser,
  'widget-reviews': widgetReviewsParser,
  'columns-cta': columnsCtaParser,
  'columns-promo': columnsPromoParser,
  'tabs-offices': tabsOfficesParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "homepage",
  "description": "Homepage",
  "urls": [
    "https://www.mauriceblackburn.com.au/"
  ],
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        ".cmp-page-banner > .cmp-page-banner-container"
      ]
    },
    {
      "name": "cards-usp",
      "instances": [
        ".cmp-page-banner > .cmp-usp-banner"
      ]
    },
    {
      "name": "cards-icon-tile",
      "instances": [
        "#serviceTile > .customPadding > .aem-Grid"
      ]
    },
    {
      "name": "columns-contact",
      "instances": [
        "#contact"
      ]
    },
    {
      "name": "columns-video",
      "instances": [
        "#plaintiff .aem-Grid > .video"
      ]
    },
    {
      "name": "columns-stats",
      "instances": [
        "#classAction > .customPadding > .aem-Grid"
      ]
    },
    {
      "name": "tabs-stories",
      "instances": [
        "#clients .tabs"
      ]
    },
    {
      "name": "widget-reviews",
      "instances": [
        "#fiveStar > .customPadding > .aem-Grid > .embed"
      ]
    },
    {
      "name": "columns-cta",
      "instances": [
        ".AT_placeholder:not(.AT_placeholder ~ .AT_placeholder) #full-width-cta:not(#full-width-cta *)"
      ]
    },
    {
      "name": "columns-promo",
      "instances": [
        ".full-width-background-extend:has(a.btn-inverse[href*=\"free-claim-check\"]) > div > .aem-Grid"
      ]
    },
    {
      "name": "tabs-offices",
      "instances": [
        ".office-listing .right-container"
      ]
    }
  ],
  "sections": [
    {
      "id": "rc1c2",
      "name": "Hero banner with USP strip",
      "selector": [
        ".herobanner",
        ".pagebanner"
      ],
      "style": null,
      "blocks": [
        "hero-banner",
        "cards-usp"
      ],
      "defaultContent": []
    },
    {
      "id": "rc1c3c2",
      "name": "Practice-area quick links",
      "selector": [
        "#serviceTile"
      ],
      "style": "grey",
      "blocks": [
        "cards-icon-tile"
      ],
      "defaultContent": []
    },
    {
      "id": "rc1c3c6",
      "name": "Contact pitch with callback form",
      "selector": [
        ".full-width-background-extend:has(> .customPadding #contact)",
        "#cta",
        "#container-d3e356a43d"
      ],
      "style": "dark",
      "blocks": [
        "columns-contact"
      ],
      "defaultContent": []
    },
    {
      "id": "rc1c3c8",
      "name": "Plaintiff law firm intro with video",
      "selector": [
        "#plaintiff"
      ],
      "style": null,
      "blocks": [
        "columns-video"
      ],
      "defaultContent": [
        "#plaintiff > .customPadding > .aem-Grid > .cmp-text"
      ]
    },
    {
      "id": "rc1c3c9",
      "name": "Class actions stat and recent list",
      "selector": [
        "#classAction"
      ],
      "style": "beige",
      "blocks": [
        "columns-stats"
      ],
      "defaultContent": []
    },
    {
      "id": "rc1c3c10",
      "name": "Client stories",
      "selector": [
        "#clients"
      ],
      "style": null,
      "blocks": [
        "tabs-stories"
      ],
      "defaultContent": [
        "#clients > .customPadding > .aem-Grid > .cmp-text"
      ]
    },
    {
      "id": "rc1c3c11c1",
      "name": "Google reviews",
      "selector": [
        "#fiveStar > .customPadding",
        "#google-review"
      ],
      "style": null,
      "blocks": [
        "widget-reviews"
      ],
      "defaultContent": [
        "#fiveStar > .customPadding .cmp-text > .cmp-text"
      ]
    },
    {
      "id": "rc1c3c11c2",
      "name": "Easy ways to get in touch CTA band",
      "selector": [
        ".AT_placeholder:not(.AT_placeholder ~ .AT_placeholder)",
        "#fiveStar > .customPadding + .AT_placeholder"
      ],
      "style": "grey",
      "blocks": [
        "columns-cta"
      ],
      "defaultContent": []
    },
    {
      "id": "rc1c3c12",
      "name": "Free claim check promo",
      "selector": [
        ".full-width-background-extend:has(a.btn-inverse[href*=\"free-claim-check\"])",
        "#container-45bf1692a1"
      ],
      "style": "dark",
      "blocks": [
        "columns-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "rc1c3c14",
      "name": "Office locator by state",
      "selector": [
        ".cmp-experiencefragment--office-locator-default-master",
        ".office-listing-container"
      ],
      "style": "lavender",
      "blocks": [
        "tabs-offices"
      ],
      "defaultContent": [
        ".office-listing .left-container"
      ]
    },
    {
      "id": "rc1c3c15",
      "name": "Conditions apply disclaimer",
      "selector": [
        ".body-content .aem-Grid > .cmp-text:has(a[href*=\"/about-us/fees/\"] > sup)",
        "#text-4736f6ad8e"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".body-content .aem-Grid > .cmp-text:has(a[href*=\"/about-us/fees/\"] > sup)"
      ]
    }
  ]
};

// TRANSFORMER REGISTRY - section transformer runs after cleanup
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for block "${blockDef.name}": ${selector}`);
      }
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Initial cleanup + section break markers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements detached by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path; root URL maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
