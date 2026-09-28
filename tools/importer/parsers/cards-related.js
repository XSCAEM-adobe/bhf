/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-related. Base: cards.
 * Source: https://www.brighthousefinancial.com/education/retirement-planning/5-things-to-consider-to-retire-early
 * Instance selector: .articleDetailsContainer .large-pull-1 ul.articleCardList
 * Structure (blocks/cards-related/README.md): 2 columns, 1 row per card:
 *   [square thumbnail image | paragraph with linked title]
 * Thumbnail is a CSS background-image on .cardContenBoximg with CSS-escaped url
 * (e.g. url(\2f content\2f dam...)); decoded and emitted as an absolute <img>.
 * Title is h6 > a (span.card-link) -> emitted as <p><a>.
 * Rail labels (.articleCardHead) and "See all" link sit outside the ul and stay default content.
 * Iterates block-level li / .redirectable-card wrappers (not anchors).
 */
const ORIGIN = 'https://www.brighthousefinancial.com';

function cssUnescape(value) {
  return value
    .replace(/\\([0-9a-fA-F]{1,6})[ \t\n\r\f]?/g, (m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\(.)/g, '$1');
}

function absolutize(src) {
  try { return new URL(src, `${ORIGIN}/`).href; } catch (e) { return src; }
}

function getThumbnail(card, document) {
  const holder = card.querySelector('.cardContenBoximg');
  const existing = (holder || card).querySelector('img');
  if (existing) {
    const src = existing.getAttribute('src') || existing.getAttribute('data-src');
    if (!src) return null;
    const img = document.createElement('img');
    img.src = absolutize(src);
    img.alt = existing.getAttribute('alt') || '';
    return img;
  }
  if (!holder) return null;
  let src = '';
  const style = holder.getAttribute('style') || '';
  const m = style.match(/url\(\s*(['"]?)(.*?)\1\s*\)/);
  if (m) src = cssUnescape(m[2]).trim();
  if (!src && holder.style && holder.style.backgroundImage) {
    const m2 = holder.style.backgroundImage.match(/url\(\s*(['"]?)(.*?)\1\s*\)/);
    if (m2) src = m2[2].trim();
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.src = absolutize(src);
  img.alt = '';
  return img;
}

export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll(':scope > li')];
  if (!cards.length) cards = [...element.querySelectorAll('.redirectable-card')];

  const cells = [];
  cards.forEach((card) => {
    const image = getThumbnail(card, document);
    const titleEl = card.querySelector('h6, h5, h4, h3, .cardContenBox');
    const link = (titleEl && titleEl.querySelector('a[href]')) || card.querySelector('a[href]');
    const text = ((link || titleEl) ? (link || titleEl).textContent : '').replace(/\s+/g, ' ').trim();
    if (!text && !image) return;
    let body = '';
    if (text) {
      body = document.createElement('p');
      if (link) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = text;
        body.append(a);
      } else {
        body.textContent = text;
      }
    }
    cells.push([image || '', body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-related', cells });
  element.replaceWith(block);
}
