/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards.
 * Source: https://www.brighthousefinancial.com/
 * Instance selector: #content > div > div.masterSectionContainer.section:nth-of-type(7) .grid-x:has(> .cell.hide-for-small-only.medium-2)
 * Structure (blocks/cards-product/README.md): 1 row per card, 2 cells
 *   [icon image | title, paragraph, CTA link]
 * Source: .grid-x > .cell; each product cell holds an image .cmp-text and a text .cmp-text.
 * The middle .cell.hide-for-small-only.medium-2 is a decorative SVG divider line and is skipped.
 */
function toImage(srcImg, document) {
  const img = document.createElement('img');
  let src = srcImg.getAttribute('src') || '';
  try { src = new URL(src, document.location?.href || 'https://www.brighthousefinancial.com/').href; } catch (e) { /* keep */ }
  // keep .svg as an image rather than letting html2md convert it to an :icon: token
  if (/\.svg$/i.test(src)) src += '?format=svg';
  img.src = src;
  img.alt = srcImg.getAttribute('alt') || '';
  return img;
}

function isDivider(cell) {
  if (cell.matches('.hide-for-small-only.medium-2')) return true;
  // Fallback: no text and only an inline svg / data-uri svg image
  if (cell.textContent.trim()) return false;
  const img = cell.querySelector('img');
  return !!cell.querySelector('svg') || !img || /^data:image\/svg/.test(img.getAttribute('src') || '');
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .cell')];
  if (!items.length) items = [...element.children];
  items = items.filter((c) => !isDivider(c));

  const cells = [];
  items.forEach((item) => {
    const srcImg = [...item.querySelectorAll('img')]
      .find((i) => !/^data:/.test(i.getAttribute('src') || ''));
    const image = srcImg ? toImage(srcImg, document) : '';

    // Text: all non-empty paragraphs/headings from text-bearing .cmp-text blocks
    const content = [];
    const textBlocks = [...item.querySelectorAll('.cmp-text')].filter((t) => t.textContent.trim());
    const sources = textBlocks.length ? textBlocks : [item];
    sources.forEach((t) => {
      [...t.children].forEach((child) => {
        if (!child.textContent.trim()) return;
        const btn = child.querySelector('a.tertiaryButton, a[class*="button" i]');
        if (child.tagName === 'P' && btn && child.textContent.trim() === btn.textContent.trim()) {
          const p = document.createElement('p');
          const a = document.createElement('a');
          a.href = btn.getAttribute('href');
          a.textContent = btn.textContent.trim();
          p.append(a);
          content.push(p);
          return;
        }
        child.querySelectorAll('img').forEach((i) => i.remove());
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
