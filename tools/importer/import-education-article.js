/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroEducationParser from './parsers/hero-education.js';
import cardsRelatedParser from './parsers/cards-related.js';
import shareParser from './parsers/share.js';

// TRANSFORMER IMPORTS
import bhfCleanupTransformer from './transformers/bhf-cleanup.js';
import bhfSectionsTransformer from './transformers/bhf-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-education': heroEducationParser,
  'cards-related': cardsRelatedParser,
  'share': shareParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "education-article",
  "description": "Education article / content page (e.g. retirement planning articles)",
  "urls": [
    "https://www.brighthousefinancial.com/education/retirement-planning/5-things-to-consider-to-retire-early"
  ],
  "blocks": [
    {
      "name": "hero-education",
      "instances": [
        "div:has(> section.education-hero-section)"
      ]
    },
    {
      "name": "cards-related",
      "instances": [
        ".articleDetailsContainer .large-pull-1 ul.articleCardList"
      ]
    },
    {
      "name": "share",
      "instances": [
        ".articleDetailsContainer .large-1 .cmp-experiencefragment--page-sharing"
      ]
    }
  ],
  "sections": [
    {
      "id": "rc7",
      "name": "article-hero",
      "selector": [
        "div:has(> section.education-hero-section)"
      ],
      "style": null,
      "blocks": [
        "hero-education"
      ],
      "defaultContent": []
    },
    {
      "id": "rc9-share",
      "name": "share",
      "selector": [
        ".articleDetailsContainer .large-1"
      ],
      "style": null,
      "blocks": [
        "share"
      ],
      "defaultContent": []
    },
    {
      "id": "rc9-updated",
      "name": "article-updated-date",
      "selector": [
        ".articleDetailsContainer .medium-8.large-7 > div > .richText:first-child"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".articleDetailsContainer .medium-8.large-7 > div > .richText:first-child p"
      ]
    },
    {
      "id": "rc9-questions",
      "name": "question-guide",
      "selector": [
        ".articleDetailsContainer .medium-8.large-7 .masterSectionContainer"
      ],
      "style": "question-guide",
      "blocks": [],
      "defaultContent": [
        ".articleDetailsContainer .medium-8.large-7 .masterSectionContainer .question-guide"
      ]
    },
    {
      "id": "rc9-body",
      "name": "article-body",
      "selector": [
        ".articleDetailsContainer .medium-8.large-7 .masterSectionContainer + .richText"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".articleDetailsContainer .medium-8.large-7 .richText .cmp-text"
      ]
    },
    {
      "id": "rc9-related",
      "name": "related-content",
      "selector": [
        ".articleDetailsContainer .large-pull-1"
      ],
      "style": "related",
      "blocks": [
        "cards-related"
      ],
      "defaultContent": [
        ".articleDetailsContainer .large-pull-1 .articleCardHead",
        ".articleDetailsContainer .large-pull-1 a.tertiaryButton"
      ]
    },
    {
      "id": "rc9-disclaimer",
      "name": "footnotes-disclaimer",
      "selector": [
        "#content .disclaimer.section"
      ],
      "style": "disclaimer",
      "blocks": [],
      "defaultContent": [
        "#content .disclaimer.section .cmp-text"
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
    if (PAGE_TEMPLATE.name !== 'home') meta.template = PAGE_TEMPLATE.name;
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
