/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-education-article.js
  var import_education_article_exports = {};
  __export(import_education_article_exports, {
    default: () => import_education_article_default
  });

  // tools/importer/parsers/hero-education.js
  function resolveUrl(src, document2) {
    var _a;
    try {
      return new URL(src, ((_a = document2.location) == null ? void 0 : _a.href) || "https://www.brighthousefinancial.com/").href;
    } catch (e) {
      return src;
    }
  }
  function cssUnescape(value) {
    return value.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (m, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/\\(.)/g, "$1");
  }
  function getImage(element, document2) {
    const imageSection = element.querySelector("section.education-hero-image, .education-hero-pic") || element;
    const img = imageSection.querySelector("img") || element.querySelector(":scope > section:not(.education-hero-section) img");
    if (img) {
      const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
      if (!img.getAttribute("src") && src) img.setAttribute("src", src);
      return img;
    }
    const styled = [...imageSection.querySelectorAll('[style*="background"]')].find((el) => /url\(/.test(el.getAttribute("style") || ""));
    if (styled) {
      const m = styled.getAttribute("style").match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
      if (m) {
        const bg = document2.createElement("img");
        bg.src = resolveUrl(cssUnescape(m[1]).trim(), document2);
        bg.alt = "";
        return bg;
      }
    }
    return null;
  }
  function parse(element, { document: document2 }) {
    element.querySelectorAll("ul.breadcrumb-links").forEach((el) => el.remove());
    const textSection = element.querySelector("section.education-hero-section") || element;
    let meta = null;
    const metaList = textSection.querySelector("ul.hero-article");
    if (metaList) {
      const parts = [...metaList.querySelectorAll(":scope > li")].map((li) => li.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
      const text = parts.join(" ").replace(/\s*\|\s*/g, " | ").trim();
      if (text) {
        meta = document2.createElement("p");
        meta.textContent = text;
      }
    }
    const heading = textSection.querySelector("h1") || textSection.querySelector("h2");
    let subtitle = null;
    if (heading) {
      let sib = heading.nextElementSibling;
      while (sib && sib.tagName !== "P") sib = sib.nextElementSibling;
      subtitle = sib;
    }
    if (!subtitle) {
      subtitle = [...textSection.querySelectorAll("p")].find((p) => p.textContent.trim() && !p.closest("ul"));
    }
    const image = getImage(element, document2);
    if (!heading && !subtitle && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) cells.push([image]);
    const contentCell = [meta, heading, subtitle].filter(Boolean);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-education", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-related.js
  var ORIGIN = "https://www.brighthousefinancial.com";
  function cssUnescape2(value) {
    return value.replace(/\\([0-9a-fA-F]{1,6})[ \t\n\r\f]?/g, (m, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/\\(.)/g, "$1");
  }
  function absolutize(src) {
    try {
      return new URL(src, `${ORIGIN}/`).href;
    } catch (e) {
      return src;
    }
  }
  function getThumbnail(card, document2) {
    const holder = card.querySelector(".cardContenBoximg");
    const existing = (holder || card).querySelector("img");
    if (existing) {
      const src2 = existing.getAttribute("src") || existing.getAttribute("data-src");
      if (!src2) return null;
      const img2 = document2.createElement("img");
      img2.src = absolutize(src2);
      img2.alt = existing.getAttribute("alt") || "";
      return img2;
    }
    if (!holder) return null;
    let src = "";
    const style = holder.getAttribute("style") || "";
    const m = style.match(/url\(\s*(['"]?)(.*?)\1\s*\)/);
    if (m) src = cssUnescape2(m[2]).trim();
    if (!src && holder.style && holder.style.backgroundImage) {
      const m2 = holder.style.backgroundImage.match(/url\(\s*(['"]?)(.*?)\1\s*\)/);
      if (m2) src = m2[2].trim();
    }
    if (!src) return null;
    const img = document2.createElement("img");
    img.src = absolutize(src);
    img.alt = "";
    return img;
  }
  function parse2(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(":scope > li")];
    if (!cards.length) cards = [...element.querySelectorAll(".redirectable-card")];
    const cells = [];
    cards.forEach((card) => {
      const image = getThumbnail(card, document2);
      const titleEl = card.querySelector("h6, h5, h4, h3, .cardContenBox");
      const link = titleEl && titleEl.querySelector("a[href]") || card.querySelector("a[href]");
      const text = (link || titleEl ? (link || titleEl).textContent : "").replace(/\s+/g, " ").trim();
      if (!text && !image) return;
      let body = "";
      if (text) {
        body = document2.createElement("p");
        if (link) {
          const a = document2.createElement("a");
          a.href = link.getAttribute("href");
          a.textContent = text;
          body.append(a);
        } else {
          body.textContent = text;
        }
      }
      cells.push([image || "", body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-related", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/share.js
  function parse3(element, { document: document2 }) {
    const list = element.querySelector("ul.social-icons-list") || element;
    const cells = [];
    [...list.querySelectorAll(":scope > li")].forEach((li) => {
      const link = li.querySelector("a");
      if (!link) {
        const label = li.textContent.replace(/\s+/g, " ").trim();
        if (label) cells.push([label]);
        return;
      }
      const img = link.querySelector("img");
      const name = (link.id || img && (img.getAttribute("title") || img.getAttribute("alt")) || "").trim();
      if (name) cells.push([name]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "share", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/bhf-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var TRACKING_HOSTS = ["bat.bing.com", "doubleclick.net", "adservice.google.com", "omtrdc.net"];
  var REMOVE_MARKER_ATTR = "data-bhf-remove";
  var HIDDEN_CONTENT_SELECTORS = [
    "#content > div > div.experiencefragment.section:nth-of-type(3)",
    // login panel (#login-section)
    "#content > div > div.iconLockupStatic.section:nth-of-type(5)",
    // register panel
    "#content > div > div.interactiveToolsHTML.section",
    // retirement goal selector form / style-only html
    "#content > div > div.htmlComponent.section"
    // script-only html components
  ];
  var BLOCK_TAGS = /* @__PURE__ */ new Set([
    "ADDRESS",
    "BLOCKQUOTE",
    "DIV",
    "DL",
    "FIGURE",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "HR",
    "OL",
    "P",
    "PRE",
    "SECTION",
    "TABLE",
    "UL"
  ]);
  var isBlankText = (text) => !(text || "").replace(/ /g, " ").trim();
  var cleanText = (text) => (text || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  function trimEdgeBreaks(el, isBlock) {
    ["lastChild", "firstChild"].forEach((edge) => {
      const step = edge === "lastChild" ? "previousSibling" : "nextSibling";
      let node = el[edge];
      while (node) {
        const next = node[step];
        if (node.nodeType === 1 && node.tagName === "BR") {
          node.remove();
        } else if (node.nodeType === 3 && isBlankText(node.textContent)) {
          if (isBlock) node.remove();
        } else {
          break;
        }
        node = next;
      }
    });
  }
  function extractArticleMetadata(element, payload) {
    if (!payload) return;
    const meta = {};
    element.querySelectorAll(".education-hero-section ul.hero-article > li").forEach((li) => {
      const text = cleanText(li.textContent);
      if (!text || text === "|") return;
      if (/minute/i.test(text) && !meta["Read Time"]) meta["Read Time"] = text;
      else if (/^[A-Z][a-z]{2,8}\.? \d{1,2}, \d{4}$/.test(text) && !meta["Publish Date"]) meta["Publish Date"] = text;
    });
    const crumbs = [...element.querySelectorAll("ul.breadcrumb-links a")];
    if (crumbs.length > 2) {
      const category = cleanText(crumbs[crumbs.length - 1].textContent);
      if (category) meta.Category = category;
    }
    const updated = element.querySelector(".articleDetailsContainer .medium-8.large-7 > div > .richText:first-child p");
    if (updated) {
      const m = cleanText(updated.textContent).match(/^Updated:\s*(.+)$/i);
      if (m) meta["Updated Date"] = m[1];
    }
    if (Object.keys(meta).length) {
      payload.bhfMetadata = Object.assign(payload.bhfMetadata || {}, meta);
    }
  }
  function normalizeQuestionGuide(element) {
    element.querySelectorAll(".question-guide").forEach((box) => {
      let run = [];
      const flush = () => {
        if (run.some((n) => n.nodeType === 1 || !isBlankText(n.textContent))) {
          const p = document.createElement("p");
          run[0].before(p);
          run.forEach((n) => p.append(n));
        }
        run = [];
      };
      [...box.childNodes].forEach((node) => {
        if (node.nodeType === 1 && BLOCK_TAGS.has(node.tagName)) flush();
        else if (node.nodeType === 1 || node.nodeType === 3) run.push(node);
      });
      flush();
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        // OneTrust cookie preference center
        ".reveal-overlay"
        // video modals: #genericVideoBox, #genericVideoBoxAdvisor
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".educationOverviewHero > .all-blog-section.show-for-small-only"
      ]);
      extractArticleMetadata(element, payload);
      WebImporter.DOMUtils.remove(element, ["ul.breadcrumb-links"]);
      element.querySelectorAll(".cmp-experiencefragment--page-sharing").forEach((xf) => {
        if (xf.closest(".articleDetailsContainer .large-1")) return;
        const wrapper = xf.closest("section.defaultMargin.only-top-space-0");
        (wrapper || xf).remove();
      });
      WebImporter.DOMUtils.remove(element, [".articleDetailsContainer .articleCards.hide-for-medium"]);
      element.querySelectorAll("span.has-tip").forEach((span) => {
        span.replaceWith(document.createTextNode(span.textContent));
      });
      normalizeQuestionGuide(element);
      HIDDEN_CONTENT_SELECTORS.forEach((sel) => {
        element.querySelectorAll(sel).forEach((el) => el.setAttribute(REMOVE_MARKER_ATTR, ""));
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "div.header-container.consumer",
        // global header
        "#footer",
        // footer#footer (appears twice)
        ".iparys_inherited"
        // inherited header/footer iparsys wrappers (incl. footer disclaimers, header tools)
      ]);
      let hidden = [...element.querySelectorAll(`[${REMOVE_MARKER_ATTR}]`)];
      if (!hidden.length) {
        hidden = HIDDEN_CONTENT_SELECTORS.flatMap((sel) => [...element.querySelectorAll(sel)]);
      }
      hidden.forEach((el) => el.remove());
      WebImporter.DOMUtils.remove(element, ['div.tooltip[id$="-tooltip"]']);
      WebImporter.DOMUtils.remove(element, ["#batBeacon155976616664", '[id^="batBeacon"]']);
      element.querySelectorAll("img[src]").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (TRACKING_HOSTS.some((host) => src.includes(host))) img.remove();
      });
      WebImporter.DOMUtils.remove(element, [
        "input",
        "#bhf-page-data",
        "iframe",
        "link",
        "meta",
        "noscript",
        "script",
        "style"
      ]);
      element.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        h.querySelectorAll(":scope > div").forEach((d) => {
          if (isBlankText(d.textContent) && !d.querySelector("img, picture")) d.remove();
        });
        trimEdgeBreaks(h, true);
      });
      element.querySelectorAll("sup, sub, span, b, strong, em").forEach((el) => trimEdgeBreaks(el, false));
      element.querySelectorAll("p, li").forEach((el) => trimEdgeBreaks(el, true));
      element.querySelectorAll("p").forEach((p) => {
        if (isBlankText(p.textContent) && !p.querySelector("img, picture, video, iframe, a, table")) p.remove();
      });
    }
  }

  // tools/importer/transformers/bhf-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-education-article.js
  var parsers = {
    "hero-education": parse,
    "cards-related": parse2,
    "share": parse3
  };
  var PAGE_TEMPLATE = {
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
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    payload.template = PAGE_TEMPLATE;
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, payload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document2.querySelectorAll(selector);
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_education_article_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      const meta = WebImporter.Blocks.getMetadata(document2) || {};
      Object.assign(meta, payload.bhfMetadata || {});
      if (PAGE_TEMPLATE.name !== "home") meta.template = PAGE_TEMPLATE.name;
      main.append(WebImporter.Blocks.getMetadataBlock(document2, meta));
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_education_article_exports);
})();
