/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-article. Base: hero.
 * Source: https://www.brighthousefinancial.com/
 * Instance selector: section.overview-hero
 * Structure (blocks/hero-article/README.md): 1 column;
 *   row 1: background image
 *   row 2: H2, paragraph, eyebrow paragraph, linked H4 (featured article), CTA link (strong = primary)
 * Background is a CSS background-image on .hero-image (inline style) with renditions in
 * [data-picture-rendition] > div[data-src]; extracted as an <img>.
 * Mobile-only duplicates (.show-for-small-only) are ignored.
 */
function resolveUrl(src, document) {
  try { return new URL(src, document.location?.href || 'https://www.brighthousefinancial.com/').href; } catch (e) { return src; }
}

function getBackgroundImage(element, document) {
  const holder = element.querySelector('.hero-image, [class*="data-picture-rendition"]') || element;
  let src = '';
  const renditions = [...element.querySelectorAll('[data-picture-rendition] > [data-src]')]
    .filter((d) => d.getAttribute('data-src'))
    .map((d) => ({
      src: d.getAttribute('data-src'),
      w: parseInt(((d.getAttribute('data-media') || '').match(/(\d+)px/) || [0, 0])[1], 10),
    }))
    .sort((a, b) => b.w - a.w);
  if (renditions.length) src = renditions[0].src;
  if (!src) {
    const styled = [element, ...element.querySelectorAll('[style*="background"]')]
      .find((el) => /url\(/.test(el.getAttribute('style') || ''));
    if (styled) {
      const m = styled.getAttribute('style').match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
      if (m) src = m[1];
    }
  }
  if (!src) {
    const existing = element.querySelector('img');
    if (existing) return existing;
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.src = resolveUrl(src, document);
  img.alt = holder.getAttribute('title') || '';
  return img;
}

export default function parse(element, { document }) {
  // Drop mobile-only duplicates before extraction
  element.querySelectorAll('.show-for-small-only').forEach((el) => el.remove());

  const bgImage = getBackgroundImage(element, document);

  const heading = element.querySelector('.overview_subtitle h2, h2')
    || element.querySelector('h1, h3');
  const description = element.querySelector('.heading_subtitle p')
    || element.querySelector('.heading_subtitle');

  // Featured article card
  const card = element.querySelector('.opaque-article, .pennal-opaque');
  let eyebrow = null;
  let featured = null;
  if (card) {
    const eyebrowEl = card.querySelector('.article-text');
    const eyebrowText = eyebrowEl ? eyebrowEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (eyebrowText) {
      eyebrow = document.createElement('p');
      eyebrow.textContent = eyebrowText;
    }
    const cardHeading = card.querySelector('h4, h3, h5');
    const cardLink = card.querySelector('a[href]');
    if (cardHeading || cardLink) {
      featured = document.createElement(cardHeading ? cardHeading.tagName.toLowerCase() : 'h4');
      const text = (cardHeading || cardLink).textContent.replace(/\s+/g, ' ').trim();
      if (cardLink) {
        const a = document.createElement('a');
        a.href = cardLink.getAttribute('href');
        a.textContent = text;
        featured.append(a);
      } else {
        featured.textContent = text;
      }
    }
  }

  // Primary CTA button (bold = primary)
  let ctaP = null;
  const cta = element.querySelector('.mainBox a.button, a.blueBtn');
  if (cta) {
    ctaP = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
  element.replaceWith(block);
}
