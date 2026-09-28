/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icon. Base: cards.
 * Source: https://www.brighthousefinancial.com/
 * Instance selector: .product-benefit-wrapper.imagebox-nocta-remove-margin .row:has(> .static-lockup-item)
 * Structure (blocks/cards-icon/README.md): 1 row per card, 2 cells
 *   [icon image | H3 title (linked), paragraph, CTA link]
 * Iterates the .static-lockup-item wrapper divs (not the anchors) so adjacent-anchor
 * merging in html2md preprocessing cannot collapse items.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .static-lockup-item')];
  if (!items.length) items = [...element.querySelectorAll(':scope > .columns, :scope > [class*="cell"]')];

  const cells = [];
  items.forEach((item) => {
    const srcImg = item.querySelector('img');
    // Icons are .svg files; html2md's default convertIcons rule turns any <img> whose src
    // ends with ".svg" into a :name: icon token, which cards-icon.js cannot render (it
    // expects a picture and there is no matching /icons/*.svg). Keep it as a real image by
    // using the absolute URL with a harmless query string.
    let img = null;
    if (srcImg) {
      img = document.createElement('img');
      let src = srcImg.getAttribute('src') || '';
      try { src = new URL(src, document.location?.href || 'https://www.brighthousefinancial.com/').href; } catch (e) { /* keep as-is */ }
      if (/\.svg$/i.test(src)) src += '?format=svg';
      img.src = src;
      img.alt = srcImg.getAttribute('alt') || '';
    }
    const headingEl = item.querySelector('h1, h2, h3, h4, h5, h6');
    const desc = item.querySelector('p.static-icon-center-desc') || item.querySelector('p');
    const cta = item.querySelector('a.tertiaryButton') || item.querySelector('a[class*="button" i], a[class*="Button"]');

    // Title: rebuild as linked H3 per block convention
    let title = null;
    if (headingEl) {
      title = document.createElement('h3');
      const headingLink = headingEl.querySelector('a');
      const text = headingEl.textContent.trim();
      if (headingLink) {
        const a = document.createElement('a');
        a.href = headingLink.getAttribute('href');
        a.textContent = text;
        title.append(a);
      } else {
        title.textContent = text;
      }
    }

    let ctaP = null;
    if (cta) {
      ctaP = document.createElement('p');
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = cta.textContent.trim();
      ctaP.append(a);
    }

    const content = [title, desc, ctaP].filter(Boolean);
    if (!img && !content.length) return;
    cells.push([img || '', content]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon', cells });
  element.replaceWith(block);
}
