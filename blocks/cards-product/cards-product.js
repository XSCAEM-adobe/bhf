import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Cards (product): side-by-side product entries separated by a vertical divider —
 * icon, label, paragraph, CTA link.
 * Authored as 1 row per card: [icon image | title, paragraph, CTA link].
 * @param {Element} block
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-product-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      const onlyImage = pic && !cell.textContent.trim();
      cell.className = onlyImage ? 'cards-product-card-image' : 'cards-product-card-body';
    });
    [...li.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture, img')) cell.remove();
    });
    const body = li.querySelector('.cards-product-card-body');
    if (body) {
      const last = body.lastElementChild;
      if (last && last.tagName === 'P' && last.children.length === 1
        && last.firstElementChild.tagName === 'A'
        && last.textContent.trim() === last.firstElementChild.textContent.trim()) {
        last.classList.add('cards-product-card-cta');
      }
    }
    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]));
  });

  block.replaceChildren(ul);
}
