/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-education. Base: hero.
 * Source: https://www.brighthousefinancial.com/education/retirement-planning/5-things-to-consider-to-retire-early
 * Instance selector: div:has(> section.education-hero-section)
 * Structure (blocks/hero-education/README.md): 1 column;
 *   row 1: inline feature image (section.education-hero-image img)
 *   row 2: meta paragraph (ul.hero-article items joined, e.g. "4-Minute Article | Apr 24, 2018"),
 *          H1, subtitle paragraph
 * Breadcrumb (ul.breadcrumb-links) is removed by the cleanup transformer; dropped here defensively.
 */
function resolveUrl(src, document) {
  try { return new URL(src, document.location?.href || 'https://www.brighthousefinancial.com/').href; } catch (e) { return src; }
}

function cssUnescape(value) {
  return value.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\(.)/g, '$1');
}

function getImage(element, document) {
  const imageSection = element.querySelector('section.education-hero-image, .education-hero-pic') || element;
  const img = imageSection.querySelector('img')
    || element.querySelector(':scope > section:not(.education-hero-section) img');
  if (img) {
    const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
    if (!img.getAttribute('src') && src) img.setAttribute('src', src);
    return img;
  }
  // Fallback: CSS background image on the image section
  const styled = [...imageSection.querySelectorAll('[style*="background"]')]
    .find((el) => /url\(/.test(el.getAttribute('style') || ''));
  if (styled) {
    const m = styled.getAttribute('style').match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
    if (m) {
      const bg = document.createElement('img');
      bg.src = resolveUrl(cssUnescape(m[1]).trim(), document);
      bg.alt = '';
      return bg;
    }
  }
  return null;
}

export default function parse(element, { document }) {
  element.querySelectorAll('ul.breadcrumb-links').forEach((el) => el.remove());

  const textSection = element.querySelector('section.education-hero-section') || element;

  // Meta line: "4-Minute Article | Apr 24, 2018"
  let meta = null;
  const metaList = textSection.querySelector('ul.hero-article');
  if (metaList) {
    const parts = [...metaList.querySelectorAll(':scope > li')]
      .map((li) => li.textContent.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    const text = parts.join(' ').replace(/\s*\|\s*/g, ' | ').trim();
    if (text) {
      meta = document.createElement('p');
      meta.textContent = text;
    }
  }

  const heading = textSection.querySelector('h1') || textSection.querySelector('h2');
  let subtitle = null;
  if (heading) {
    let sib = heading.nextElementSibling;
    while (sib && sib.tagName !== 'P') sib = sib.nextElementSibling;
    subtitle = sib;
  }
  if (!subtitle) {
    subtitle = [...textSection.querySelectorAll('p')].find((p) => p.textContent.trim() && !p.closest('ul'));
  }

  const image = getImage(element, document);

  if (!heading && !subtitle && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (image) cells.push([image]);
  const contentCell = [meta, heading, subtitle].filter(Boolean);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-education', cells });
  element.replaceWith(block);
}
