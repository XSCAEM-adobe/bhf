import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Columns (statement): small logo mark beside a large statement paragraph.
 * Authored as 1 row, 2 cells [logo image | paragraph (may contain <sup>)].
 * @param {Element} block
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  [...block.children].forEach((row) => {
    row.classList.add('columns-statement-row');
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      cell.className = pic && !cell.textContent.trim()
        ? 'columns-statement-logo'
        : 'columns-statement-text';
    });
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture, img')) cell.remove();
    });
  });

  block.querySelectorAll('.columns-statement-logo picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]));
  });
}
