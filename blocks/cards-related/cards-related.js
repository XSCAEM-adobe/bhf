import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Cards (related): single-column stack of bordered horizontal cards used in a
 * sidebar/related section. Each row = one card: [square thumbnail | linked title].
 * Missing image cells are tolerated (text-only card); extra text cells merge into the body.
 * @param {Element} block
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-related-card';
    let body = null;
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !cell.textContent.trim()) {
        if (li.querySelector('.cards-related-card-image')) return;
        cell.className = 'cards-related-card-image';
        li.prepend(cell);
      } else if (cell.textContent.trim() || cell.children.length) {
        if (!body) {
          body = cell;
          body.className = 'cards-related-card-body';
          li.append(body);
        } else {
          while (cell.firstChild) body.append(cell.firstChild);
        }
      }
    });
    if (!li.querySelector('.cards-related-card-image')) li.classList.add('cards-related-card-no-image');

    const link = body && body.querySelector('a');
    if (link) {
      // the card title is a plain link, not a CTA: undo decorateButtons() on lone links
      link.classList.remove('button', 'primary', 'secondary');
      li.querySelectorAll('.button-container').forEach((el) => el.classList.remove('button-container'));
      link.classList.add('cards-related-card-link');
    }
    if (li.childElementCount) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(
    createOptimizedPicture(img.src, img.alt, false, [{ width: '240' }]),
  ));

  block.replaceChildren(ul);
}
