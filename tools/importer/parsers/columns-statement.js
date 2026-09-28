/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-statement. Base: columns.
 * Source: https://www.brighthousefinancial.com/
 * Instance selector: .cmp-experiencefragment--mission-statement section.bg-lighter-gray .grid-x
 * Structure (blocks/columns-statement/README.md): 1 row, 2 cells [logo image | paragraph with <sup>].
 * Source: .grid-x > .cell (logo cell is .hide-for-small-only but is the desktop logo, kept).
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

export default function parse(element, { document }) {
  const columns = [...element.querySelectorAll(':scope > .cell')];
  const cols = columns.length ? columns : [...element.children];

  let imageCell = null;
  const textParts = [];
  cols.forEach((col) => {
    const content = col.querySelector('.cmp-text') || col;
    const imgs = [...content.querySelectorAll('img')];
    if (!content.textContent.trim() && imgs.length) {
      if (!imageCell) imageCell = imgs.map((i) => toImage(i, document));
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

  const cells = [[imageCell || '', textParts]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-statement', cells });
  element.replaceWith(block);
}
