/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-headline. Base: hero.
 * Source: https://www.brighthousefinancial.com/
 * Instance selector: section.section-container.large-padding.data-picture-rendition.bg-cover
 * Structure (blocks/hero-headline/README.md): 1 column; row 1 background image, row 2 H1.
 * The background is a CSS background-image on the section (inline style), with
 * responsive renditions in [data-picture-rendition] > div[data-src]. It is extracted as an <img>.
 */
function resolveUrl(src, document) {
  try { return new URL(src, document.location?.href || 'https://www.brighthousefinancial.com/').href; } catch (e) { return src; }
}

function getBackgroundImage(element, document) {
  let src = '';
  // 1. Largest data-src rendition (highest min-width media query)
  const renditions = [...element.querySelectorAll('[data-picture-rendition] > [data-src]')]
    .filter((d) => d.getAttribute('data-src'))
    .map((d) => ({
      src: d.getAttribute('data-src'),
      w: parseInt(((d.getAttribute('data-media') || '').match(/(\d+)px/) || [0, 0])[1], 10),
    }))
    .sort((a, b) => b.w - a.w);
  if (renditions.length) src = renditions[0].src;
  // 2. Inline background-image style on the section or a descendant
  if (!src) {
    const styled = [element, ...element.querySelectorAll('[style*="background"]')]
      .find((el) => /url\(/.test(el.getAttribute('style') || ''));
    if (styled) {
      const m = styled.getAttribute('style').match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
      if (m) src = m[1];
    }
  }
  // 3. Existing <img> (e.g. cleaned/cached HTML)
  if (!src) {
    const existing = element.querySelector(':scope > img, img');
    if (existing) return existing;
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.src = resolveUrl(src, document);
  img.alt = element.getAttribute('title') || '';
  return img;
}

export default function parse(element, { document }) {
  const bgImage = getBackgroundImage(element, document);
  const heading = element.querySelector('h1') || element.querySelector('h2, h3');

  if (!heading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (bgImage) cells.push([bgImage]);
  const contentCell = [];
  if (heading) contentCell.push(heading);
  // Include any non-empty paragraphs/CTAs in the headline area (skip &nbsp; spacers)
  element.querySelectorAll('.cmp-text p, .cmp-text a.button').forEach((p) => {
    if (p.textContent.replace(/ /g, ' ').trim()) contentCell.push(p);
  });
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-headline', cells });
  element.replaceWith(block);
}
