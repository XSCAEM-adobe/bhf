import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Columns (media): text column (heading, paragraph, CTA link) beside an illustration column.
 * Authored as 1 row, 2 cells [heading, paragraph, CTA link | image]. Either cell order works.
 * @param {Element} block
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  [...block.children].forEach((row) => {
    row.classList.add('columns-media-row');
    const cells = [...row.children];
    cells.forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !cell.textContent.trim()) {
        cell.className = 'columns-media-image';
      } else {
        cell.className = 'columns-media-text';
      }
    });
    // image authored first -> keep visual order image-left on desktop
    if (cells[0] && cells[0].classList.contains('columns-media-image')) {
      row.classList.add('columns-media-image-first');
    }
  });

  block.querySelectorAll('.columns-media-image picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]));
  });
}
