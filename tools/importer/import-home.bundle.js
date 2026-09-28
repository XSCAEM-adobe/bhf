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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-headline.js
  function resolveUrl(src, document2) {
    var _a;
    try {
      return new URL(src, ((_a = document2.location) == null ? void 0 : _a.href) || "https://www.brighthousefinancial.com/").href;
    } catch (e) {
      return src;
    }
  }
  function getBackgroundImage(element, document2) {
    let src = "";
    const renditions = [...element.querySelectorAll("[data-picture-rendition] > [data-src]")].filter((d) => d.getAttribute("data-src")).map((d) => ({
      src: d.getAttribute("data-src"),
      w: parseInt(((d.getAttribute("data-media") || "").match(/(\d+)px/) || [0, 0])[1], 10)
    })).sort((a, b) => b.w - a.w);
    if (renditions.length) src = renditions[0].src;
    if (!src) {
      const styled = [element, ...element.querySelectorAll('[style*="background"]')].find((el) => /url\(/.test(el.getAttribute("style") || ""));
      if (styled) {
        const m = styled.getAttribute("style").match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
        if (m) src = m[1];
      }
    }
    if (!src) {
      const existing = element.querySelector(":scope > img, img");
      if (existing) return existing;
    }
    if (!src) return null;
    const img = document2.createElement("img");
    img.src = resolveUrl(src, document2);
    img.alt = element.getAttribute("title") || "";
    return img;
  }
  function parse(element, { document: document2 }) {
    const bgImage = getBackgroundImage(element, document2);
    const heading = element.querySelector("h1") || element.querySelector("h2, h3");
    if (!heading && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    const contentCell = [];
    if (heading) contentCell.push(heading);
    element.querySelectorAll(".cmp-text p, .cmp-text a.button").forEach((p) => {
      if (p.textContent.replace(/ /g, " ").trim()) contentCell.push(p);
    });
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-headline", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  function parse2(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .static-lockup-item")];
    if (!items.length) items = [...element.querySelectorAll(':scope > .columns, :scope > [class*="cell"]')];
    const cells = [];
    items.forEach((item) => {
      var _a;
      const srcImg = item.querySelector("img");
      let img = null;
      if (srcImg) {
        img = document2.createElement("img");
        let src = srcImg.getAttribute("src") || "";
        try {
          src = new URL(src, ((_a = document2.location) == null ? void 0 : _a.href) || "https://www.brighthousefinancial.com/").href;
        } catch (e) {
        }
        if (/\.svg$/i.test(src)) src += "?format=svg";
        img.src = src;
        img.alt = srcImg.getAttribute("alt") || "";
      }
      const headingEl = item.querySelector("h1, h2, h3, h4, h5, h6");
      const desc = item.querySelector("p.static-icon-center-desc") || item.querySelector("p");
      const cta = item.querySelector("a.tertiaryButton") || item.querySelector('a[class*="button" i], a[class*="Button"]');
      let title = null;
      if (headingEl) {
        title = document2.createElement("h3");
        const headingLink = headingEl.querySelector("a");
        const text = headingEl.textContent.trim();
        if (headingLink) {
          const a = document2.createElement("a");
          a.href = headingLink.getAttribute("href");
          a.textContent = text;
          title.append(a);
        } else {
          title.textContent = text;
        }
      }
      let ctaP = null;
      if (cta) {
        ctaP = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = cta.textContent.trim();
        ctaP.append(a);
      }
      const content = [title, desc, ctaP].filter(Boolean);
      if (!img && !content.length) return;
      cells.push([img || "", content]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-icon", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function toImage(srcImg, document2) {
    var _a;
    const img = document2.createElement("img");
    let src = srcImg.getAttribute("src") || "";
    try {
      src = new URL(src, ((_a = document2.location) == null ? void 0 : _a.href) || "https://www.brighthousefinancial.com/").href;
    } catch (e) {
    }
    if (/\.svg$/i.test(src)) src += "?format=svg";
    img.src = src;
    img.alt = srcImg.getAttribute("alt") || "";
    return img;
  }
  function parse3(element, { document: document2 }) {
    const columns = [...element.querySelectorAll(":scope > .cell")];
    const cols = columns.length ? columns : [...element.children];
    const cells = [];
    const row = [];
    cols.forEach((col) => {
      const content = col.querySelector(".cmp-text") || col;
      const imgs = [...content.querySelectorAll("img")];
      const hasText = content.textContent.trim().length > 0;
      if (!hasText && imgs.length) {
        row.push(imgs.map((i) => toImage(i, document2)));
        return;
      }
      const parts = [];
      [...content.children].forEach((child) => {
        if (!child.textContent.trim() && !child.querySelector("img")) return;
        const btn = child.querySelector('a.tertiaryButton, a[class*="button" i]');
        if (child.tagName === "P" && btn && child.textContent.trim() === btn.textContent.trim()) {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          a.href = btn.getAttribute("href");
          a.textContent = btn.textContent.trim();
          p.append(a);
          parts.push(p);
          return;
        }
        child.querySelectorAll("img").forEach((i) => i.replaceWith(toImage(i, document2)));
        parts.push(child);
      });
      row.push(parts);
    });
    if (!row.length || row.every((c) => !c.length)) {
      element.replaceWith(...element.childNodes);
      return;
    }
    cells.push(row);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function toImage2(srcImg, document2) {
    var _a;
    const img = document2.createElement("img");
    let src = srcImg.getAttribute("src") || "";
    try {
      src = new URL(src, ((_a = document2.location) == null ? void 0 : _a.href) || "https://www.brighthousefinancial.com/").href;
    } catch (e) {
    }
    if (/\.svg$/i.test(src)) src += "?format=svg";
    img.src = src;
    img.alt = srcImg.getAttribute("alt") || "";
    return img;
  }
  function isDivider(cell) {
    if (cell.matches(".hide-for-small-only.medium-2")) return true;
    if (cell.textContent.trim()) return false;
    const img = cell.querySelector("img");
    return !!cell.querySelector("svg") || !img || /^data:image\/svg/.test(img.getAttribute("src") || "");
  }
  function parse4(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .cell")];
    if (!items.length) items = [...element.children];
    items = items.filter((c) => !isDivider(c));
    const cells = [];
    items.forEach((item) => {
      const srcImg = [...item.querySelectorAll("img")].find((i) => !/^data:/.test(i.getAttribute("src") || ""));
      const image = srcImg ? toImage2(srcImg, document2) : "";
      const content = [];
      const textBlocks = [...item.querySelectorAll(".cmp-text")].filter((t) => t.textContent.trim());
      const sources = textBlocks.length ? textBlocks : [item];
      sources.forEach((t) => {
        [...t.children].forEach((child) => {
          if (!child.textContent.trim()) return;
          const btn = child.querySelector('a.tertiaryButton, a[class*="button" i]');
          if (child.tagName === "P" && btn && child.textContent.trim() === btn.textContent.trim()) {
            const p = document2.createElement("p");
            const a = document2.createElement("a");
            a.href = btn.getAttribute("href");
            a.textContent = btn.textContent.trim();
            p.append(a);
            content.push(p);
            return;
          }
          child.querySelectorAll("img").forEach((i) => i.remove());
          content.push(child);
        });
      });
      if (!image && !content.length) return;
      cells.push([image, content]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-article.js
  function resolveUrl2(src, document2) {
    var _a;
    try {
      return new URL(src, ((_a = document2.location) == null ? void 0 : _a.href) || "https://www.brighthousefinancial.com/").href;
    } catch (e) {
      return src;
    }
  }
  function getBackgroundImage2(element, document2) {
    const holder = element.querySelector('.hero-image, [class*="data-picture-rendition"]') || element;
    let src = "";
    const renditions = [...element.querySelectorAll("[data-picture-rendition] > [data-src]")].filter((d) => d.getAttribute("data-src")).map((d) => ({
      src: d.getAttribute("data-src"),
      w: parseInt(((d.getAttribute("data-media") || "").match(/(\d+)px/) || [0, 0])[1], 10)
    })).sort((a, b) => b.w - a.w);
    if (renditions.length) src = renditions[0].src;
    if (!src) {
      const styled = [element, ...element.querySelectorAll('[style*="background"]')].find((el) => /url\(/.test(el.getAttribute("style") || ""));
      if (styled) {
        const m = styled.getAttribute("style").match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
        if (m) src = m[1];
      }
    }
    if (!src) {
      const existing = element.querySelector("img");
      if (existing) return existing;
    }
    if (!src) return null;
    const img = document2.createElement("img");
    img.src = resolveUrl2(src, document2);
    img.alt = holder.getAttribute("title") || "";
    return img;
  }
  function parse5(element, { document: document2 }) {
    element.querySelectorAll(".show-for-small-only").forEach((el) => el.remove());
    const bgImage = getBackgroundImage2(element, document2);
    const heading = element.querySelector(".overview_subtitle h2, h2") || element.querySelector("h1, h3");
    const description = element.querySelector(".heading_subtitle p") || element.querySelector(".heading_subtitle");
    const card = element.querySelector(".opaque-article, .pennal-opaque");
    let eyebrow = null;
    let featured = null;
    if (card) {
      const eyebrowEl = card.querySelector(".article-text");
      const eyebrowText = eyebrowEl ? eyebrowEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (eyebrowText) {
        eyebrow = document2.createElement("p");
        eyebrow.textContent = eyebrowText;
      }
      const cardHeading = card.querySelector("h4, h3, h5");
      const cardLink = card.querySelector("a[href]");
      if (cardHeading || cardLink) {
        featured = document2.createElement(cardHeading ? cardHeading.tagName.toLowerCase() : "h4");
        const text = (cardHeading || cardLink).textContent.replace(/\s+/g, " ").trim();
        if (cardLink) {
          const a = document2.createElement("a");
          a.href = cardLink.getAttribute("href");
          a.textContent = text;
          featured.append(a);
        } else {
          featured.textContent = text;
        }
      }
    }
    let ctaP = null;
    const cta = element.querySelector(".mainBox a.button, a.blueBtn");
    if (cta) {
      ctaP = document2.createElement("p");
      const strong = document2.createElement("strong");
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = cta.textContent.replace(/\s+/g, " ").trim();
      strong.append(a);
      ctaP.append(strong);
    }
    if (!heading && !description && !featured && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    const contentCell = [heading, description, eyebrow, featured, ctaP].filter(Boolean);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-statement.js
  function toImage3(srcImg, document2) {
    var _a;
    const img = document2.createElement("img");
    let src = srcImg.getAttribute("src") || "";
    try {
      src = new URL(src, ((_a = document2.location) == null ? void 0 : _a.href) || "https://www.brighthousefinancial.com/").href;
    } catch (e) {
    }
    if (/\.svg$/i.test(src)) src += "?format=svg";
    img.src = src;
    img.alt = srcImg.getAttribute("alt") || "";
    return img;
  }
  function parse6(element, { document: document2 }) {
    const columns = [...element.querySelectorAll(":scope > .cell")];
    const cols = columns.length ? columns : [...element.children];
    let imageCell = null;
    const textParts = [];
    cols.forEach((col) => {
      const content = col.querySelector(".cmp-text") || col;
      const imgs = [...content.querySelectorAll("img")];
      if (!content.textContent.trim() && imgs.length) {
        if (!imageCell) imageCell = imgs.map((i) => toImage3(i, document2));
        return;
      }
      [...content.children].forEach((child) => {
        if (child.textContent.trim()) textParts.push(child);
      });
    });
    if (!imageCell && !textParts.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[imageCell || "", textParts]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-statement", cells });
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
        const wrapper = xf.closest(".articleDetailsContainer div.large-1.sticky-container, section.defaultMargin.only-top-space-0");
        (wrapper || xf).remove();
      });
      WebImporter.DOMUtils.remove(element, ["ul.social-icons-list"]);
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

  // tools/importer/import-home.js
  var parsers = {
    "hero-headline": parse,
    "cards-icon": parse2,
    "columns-media": parse3,
    "cards-product": parse4,
    "hero-article": parse5,
    "columns-statement": parse6
  };
  var PAGE_TEMPLATE = {
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
  var import_home_default = {
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
      if (PAGE_TEMPLATE.name !== "home") meta.Template = PAGE_TEMPLATE.name;
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
  return __toCommonJS(import_home_exports);
})();
