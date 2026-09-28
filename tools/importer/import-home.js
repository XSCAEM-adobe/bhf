/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHeadlineParser from './parsers/hero-headline.js';
import cardsIconParser from './parsers/cards-icon.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsProductParser from './parsers/cards-product.js';
import heroArticleParser from './parsers/hero-article.js';
import columnsStatementParser from './parsers/columns-statement.js';

// TRANSFORMER IMPORTS
import bhfCleanupTransformer from './transformers/bhf-cleanup.js';
import bhfSectionsTransformer from './transformers/bhf-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-headline': heroHeadlineParser,
  'cards-icon': cardsIconParser,
  'columns-media': columnsMediaParser,
  'cards-product': cardsProductParser,
  'hero-article': heroArticleParser,
  'columns-statement': columnsStatementParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "home",
  "description": "Brighthouse Financial home page",
  "urls": [
    "https://www.brighthousefinancial.com/"
  ],
  "blocks": [
    {
      "name": "hero-headline",
      "instances": [
        "section.section-container.large-padding.data-picture-rendition.bg-cover"
      ]
    },
    {
      "name": "cards-icon",
      "instances": [
        ".product-benefit-wrapper.imagebox-nocta-remove-margin .row:has(> .static-lockup-item)"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        "section.section-container.medium-padding .grid-x"
      ]
    },
    {
      "name": "cards-product",
      "instances": [
        "#content > div > div.masterSectionContainer.section:nth-of-type(7) .grid-x:has(> .cell.hide-for-small-only.medium-2)"
      ]
    },
    {
      "name": "hero-article",
      "instances": [
        "section.overview-hero"
      ]
    },
    {
      "name": "columns-statement",
      "instances": [
        ".cmp-experiencefragment--mission-statement section.bg-lighter-gray .grid-x"
      ]
    }
  ],
  "sections": [
    {
      "id": "rc7",
      "name": "hero",
      "selector": [
        ".masterSectionContainer:has(> section.bg-cover.large-padding)",
        "#content > div > div.masterSectionContainer.section:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "hero-headline"
      ],
      "defaultContent": []
    },
    {
      "id": "rc9",
      "name": "product-benefits",
      "selector": [
        "#content > div > div.iconLockupStatic.section:nth-of-type(4)"
      ],
      "style": null,
      "blocks": [
        "cards-icon"
      ],
      "defaultContent": []
    },
    {
      "id": "rc11",
      "name": "income-calculator",
      "selector": [
        ".masterSectionContainer:has(> section.medium-padding)",
        "#content > div > div.masterSectionContainer.section:nth-of-type(6)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "rc12",
      "name": "our-products",
      "selector": [
        "#content > div > div.masterSectionContainer.section:nth-of-type(7)"
      ],
      "style": null,
      "blocks": [
        "cards-product"
      ],
      "defaultContent": [
        "#content > div > div.masterSectionContainer.section:nth-of-type(7) h2"
      ]
    },
    {
      "id": "rc14",
      "name": "education-feature",
      "selector": [
        ".educationOverviewHero"
      ],
      "style": null,
      "blocks": [
        "hero-article"
      ],
      "defaultContent": []
    },
    {
      "id": "rc15",
      "name": "explore-brighthouse",
      "selector": [
        "#content > div > div.iconLockupStatic.section:nth-of-type(10)"
      ],
      "style": null,
      "blocks": [
        "cards-icon"
      ],
      "defaultContent": [
        ".iconLockupStatic .body-Slab-Large"
      ]
    },
    {
      "id": "rc17",
      "name": "mission-statement",
      "selector": [
        ".cmp-experiencefragment--mission-statement .masterSectionContainer"
      ],
      "style": "light-grey",
      "blocks": [
        "columns-statement"
      ],
      "defaultContent": []
    },
    {
      "id": "rc18",
      "name": "disclaimers",
      "selector": [
        ".cmp-experiencefragment--mission-statement .disclaimer",
        "#content > div > div.disclaimer"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".cmp-experiencefragment--mission-statement .disclaimer .cmp-text",
        "#content > div > div.disclaimer .cmp-text"
      ]
    }
  ]
};

// TRANSFORMER REGISTRY - section transformer runs after cleanup
const transformers = [
  bhfCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [bhfSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  // Shared (not copied) so values a transformer stores on the payload,
  // e.g. payload.bhfMetadata, are still available in later hooks.
  payload.template = PAGE_TEMPLATE;
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, payload);
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
          name: blockDef.name, selector, element, section: blockDef.section || null,
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

    // 1. Initial cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
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

    // 4. Final cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    // Page metadata + site-specific fields collected by transformers (payload.bhfMetadata)
    const meta = WebImporter.Blocks.getMetadata(document) || {};
    Object.assign(meta, payload.bhfMetadata || {});
    // Template drives the body class used by template-level layout CSS
    if (PAGE_TEMPLATE.name !== 'home') meta.Template = PAGE_TEMPLATE.name;
    main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (root URL maps to /index)
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
