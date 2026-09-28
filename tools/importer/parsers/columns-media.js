/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns.
 * Source: https://www.brighthousefinancial.com/
 * Instance selector: section.section-container.medium-padding .grid-x
 * Structure (blocks/columns-media/README.md): 1 row, 2 cells
 *   [H2/H3 heading, paragraph, CTA link | image]
 * Source: .grid-x > .cell (text cell with .cmp-text, image cell with <img>).
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

  const cells = [];
  const row = [];
  cols.forEach((col) => {
    const content = col.querySelector('.cmp-text') || col;
    const imgs = [...content.querySelectorAll('img')];
    const hasText = content.textContent.trim().length > 0;
    if (!hasText && imgs.length) {
      row.push(imgs.map((i) => toImage(i, document)));
      return;
    }
    const parts = [];
    [...content.children].forEach((child) => {
      if (!child.textContent.trim() && !child.querySelector('img')) return;
      // Normalise CTA paragraphs to plain links
      const btn = child.querySelector('a.tertiaryButton, a[class*="button" i]');
      if (child.tagName === 'P' && btn && child.textContent.trim() === btn.textContent.trim()) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = btn.getAttribute('href');
        a.textContent = btn.textContent.trim();
        p.append(a);
        parts.push(p);
        return;
      }
      child.querySelectorAll('img').forEach((i) => i.replaceWith(toImage(i, document)));
      parts.push(child);
    });
    row.push(parts);
  });

  if (!row.length || row.every((c) => !c.length)) {
    element.replaceWith(...element.childNodes);
    return;
  }
  cells.push(row);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
