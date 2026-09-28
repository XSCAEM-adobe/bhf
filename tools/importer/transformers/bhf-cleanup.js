/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Brighthouse Financial (bhf) site-wide cleanup.
 * Shared by all bhf templates (home, education-article, ...).
 * All selectors verified in migration-work/cleaned.html (education-article) and
 * migration-work/templates/home/cleaned.html (home).
 *
 * IMPORTANT (home): Children of `#content > div` are targeted by block/section selectors
 * using :nth-of-type (e.g. div.iconLockupStatic.section:nth-of-type(4),
 * div.masterSectionContainer.section:nth-of-type(7)). Removing any sibling div there
 * in beforeTransform would shift those indexes, so those removals happen in afterTransform.
 * The education-article removals done in beforeTransform are all nested deeper
 * (inside .articleDetailsContainer / the hero) or are <section> elements, so they never
 * affect div:nth-of-type counting.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Tracking pixel hosts found in cleaned.html / metadata.json image mapping
const TRACKING_HOSTS = ['bat.bing.com', 'doubleclick.net', 'adservice.google.com', 'omtrdc.net'];

const REMOVE_MARKER_ATTR = 'data-bhf-remove';

// Hidden / personalized / non-authorable sections inside #content on home (verified in
// templates/home/cleaned.html; none of these match on education-article pages)
const HIDDEN_CONTENT_SELECTORS = [
  '#content > div > div.experiencefragment.section:nth-of-type(3)', // login panel (#login-section)
  '#content > div > div.iconLockupStatic.section:nth-of-type(5)', // register panel
  '#content > div > div.interactiveToolsHTML.section', // retirement goal selector form / style-only html
  '#content > div > div.htmlComponent.section', // script-only html components
];

const BLOCK_TAGS = new Set([
  'ADDRESS', 'BLOCKQUOTE', 'DIV', 'DL', 'FIGURE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'HR', 'OL', 'P', 'PRE', 'SECTION', 'TABLE', 'UL',
]);

const isBlankText = (text) => !(text || '').replace(/ /g, ' ').trim();
const cleanText = (text) => (text || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Remove <br> (and, for block containers, whitespace-only text) from both edges of el.
 * Inline elements keep edge whitespace so words don't get glued together.
 */
function trimEdgeBreaks(el, isBlock) {
  ['lastChild', 'firstChild'].forEach((edge) => {
    const step = edge === 'lastChild' ? 'previousSibling' : 'nextSibling';
    let node = el[edge];
    while (node) {
      const next = node[step];
      if (node.nodeType === 1 && node.tagName === 'BR') {
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

/**
 * education-article: extract page metadata fields from the hero meta line and the breadcrumb
 * BEFORE the breadcrumb is removed / the hero is parsed. Stored on payload.bhfMetadata so the
 * import script can merge them into the Metadata block (WebImporter.rules.createMetadata only
 * emits Title/Description/Image). No-op on pages without these elements (e.g. home).
 */
function extractArticleMetadata(element, payload) {
  if (!payload) return;
  const meta = {};

  // <ul class="hero-article"><li><i class="article-white-icon icon"></i>4-Minute Article</li><li>|</li><li>Apr 24, 2018</li></ul>
  element.querySelectorAll('.education-hero-section ul.hero-article > li').forEach((li) => {
    const text = cleanText(li.textContent);
    if (!text || text === '|') return;
    if (/minute/i.test(text) && !meta['Read Time']) meta['Read Time'] = text;
    else if (/^[A-Z][a-z]{2,8}\.? \d{1,2}, \d{4}$/.test(text) && !meta['Publish Date']) meta['Publish Date'] = text;
  });

  // <ul class="breadcrumb-links"> Home / Education / Retirement Planning / -> last link = category
  const crumbs = [...element.querySelectorAll('ul.breadcrumb-links a')];
  if (crumbs.length > 2) {
    const category = cleanText(crumbs[crumbs.length - 1].textContent);
    if (category) meta.Category = category;
  }

  // <div class="cmp-text"><p>Updated: December 15, 2025</p></div> (first rich text of article column)
  const updated = element.querySelector('.articleDetailsContainer .medium-8.large-7 > div > .richText:first-child p');
  if (updated) {
    const m = cleanText(updated.textContent).match(/^Updated:\s*(.+)$/i);
    if (m) meta['Updated Date'] = m[1];
  }

  if (Object.keys(meta).length) {
    payload.bhfMetadata = Object.assign(payload.bhfMetadata || {}, meta);
  }
}

/**
 * education-article question-guide box: lead-in is a bare <b> directly inside
 * div.question-guide (no <p>). Wrap loose inline runs in <p> so the lead-in survives
 * as its own paragraph next to the bullet list.
 */
function normalizeQuestionGuide(element) {
  element.querySelectorAll('.question-guide').forEach((box) => {
    let run = [];
    const flush = () => {
      if (run.some((n) => n.nodeType === 1 || !isBlankText(n.textContent))) {
        const p = document.createElement('p');
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

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / widgets outside #content (do not affect nth-of-type in #content > div)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk', // OneTrust cookie preference center
      '.reveal-overlay', // video modals: #genericVideoBox, #genericVideoBoxAdvisor
    ]);

    // home: mobile-only duplicate article card (sibling of section.overview-hero inside
    // .educationOverviewHero). Desktop card (.row.opaquespace.hide-for-small-only) is kept.
    WebImporter.DOMUtils.remove(element, [
      '.educationOverviewHero > .all-blog-section.show-for-small-only',
    ]);

    // education-article: grab metadata before breadcrumb removal / hero parsing
    extractArticleMetadata(element, payload);

    // education-article: breadcrumb is derived from the page path, not authored.
    // Removed before parsing so the hero-education parser never picks it up.
    WebImporter.DOMUtils.remove(element, ['ul.breadcrumb-links']);

    // education-article: the left share rail (.articleDetailsContainer .large-1) is parsed
    // into a Share block; the bottom share bar is its mobile duplicate, so remove it.
    element.querySelectorAll('.cmp-experiencefragment--page-sharing').forEach((xf) => {
      if (xf.closest('.articleDetailsContainer .large-1')) return;
      const wrapper = xf.closest('section.defaultMargin.only-top-space-0');
      (wrapper || xf).remove();
    });

    // education-article: mobile-only duplicates of the related-article cards inside the
    // article column (desktop copies live in .large-pull-1 and are parsed as cards-related)
    WebImporter.DOMUtils.remove(element, ['.articleDetailsContainer .articleCards.hide-for-medium']);

    // education-article: glossary tooltips -> plain text
    // <span class="has-tip" title="">immediate annuity</span>
    element.querySelectorAll('span.has-tip').forEach((span) => {
      span.replaceWith(document.createTextNode(span.textContent));
    });

    // education-article: question-guide lead-in + bullet list stay as default content
    normalizeQuestionGuide(element);

    // Resolve positional selectors NOW (before any removal shifts :nth-of-type indexes)
    // and mark them; the marked elements are removed in afterTransform.
    HIDDEN_CONTENT_SELECTORS.forEach((sel) => {
      element.querySelectorAll(sel).forEach((el) => el.setAttribute(REMOVE_MARKER_ATTR, ''));
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome - handled separately (nav/footer)
    WebImporter.DOMUtils.remove(element, [
      'div.header-container.consumer', // global header
      '#footer', // footer#footer (appears twice)
      '.iparys_inherited', // inherited header/footer iparsys wrappers (incl. footer disclaimers, header tools)
    ]);

    // Hidden / personalized / non-authorable sections inside #content.
    // Prefer elements marked in beforeTransform; fall back to resolving the selectors
    // all at once (collect first, then remove) so indexes cannot shift mid-removal.
    let hidden = [...element.querySelectorAll(`[${REMOVE_MARKER_ATTR}]`)];
    if (!hidden.length) {
      hidden = HIDDEN_CONTENT_SELECTORS.flatMap((sel) => [...element.querySelectorAll(sel)]);
    }
    hidden.forEach((el) => el.remove());

    // education-article: glossary tooltip definition popups (div.tooltip#xxxx-tooltip at body end)
    WebImporter.DOMUtils.remove(element, ['div.tooltip[id$="-tooltip"]']);

    // Tracking pixels
    WebImporter.DOMUtils.remove(element, ['#batBeacon155976616664', '[id^="batBeacon"]']);
    element.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (TRACKING_HOSTS.some((host) => src.includes(host))) img.remove();
    });

    // Hidden inputs, analytics data holders and non-content elements
    WebImporter.DOMUtils.remove(element, [
      'input',
      '#bhf-page-data',
      'iframe',
      'link',
      'meta',
      'noscript',
      'script',
      'style',
    ]);

    // Headings: drop decorative spacer divs (e.g. <div class="colorBarGradient">&nbsp;</div>
    // inside h2.h2fontsize) and trailing/leading <br>.
    element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      h.querySelectorAll(':scope > div').forEach((d) => {
        if (isBlankText(d.textContent) && !d.querySelector('img, picture')) d.remove();
      });
      trimEdgeBreaks(h, true);
    });

    // Stray edge <br> in inline wrappers (e.g. <sup>1<br><br></sup>), then in paragraphs/list items
    element.querySelectorAll('sup, sub, span, b, strong, em').forEach((el) => trimEdgeBreaks(el, false));
    element.querySelectorAll('p, li').forEach((el) => trimEdgeBreaks(el, true));

    // Empty spacer paragraphs (<p>&nbsp;</p>, <p><br></p>)
    element.querySelectorAll('p').forEach((p) => {
      if (isBlankText(p.textContent) && !p.querySelector('img, picture, video, iframe, a, table')) p.remove();
    });
  }
}
