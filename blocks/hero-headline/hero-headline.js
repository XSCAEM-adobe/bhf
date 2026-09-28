import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Hero (headline): full-bleed background image with a large headline.
 * Authored as 1 column: row 1 = background image, row 2 = H1 (tolerates both in one cell).
 * @param {Element} block
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const picture = block.querySelector('picture');
  const media = document.createElement('div');
  media.className = 'hero-headline-media';
  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt, true, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }])
      : picture;
    media.append(optimized);
    // remove the now-empty paragraph wrapper, if any
    const parent = picture.parentElement;
    picture.remove();
    if (parent && parent.tagName === 'P' && !parent.textContent.trim() && !parent.children.length) parent.remove();
  }

  const content = document.createElement('div');
  content.className = 'hero-headline-content';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    while (cell.firstChild) content.append(cell.firstChild);
  });
  // drop whitespace-only text nodes
  [...content.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });

  block.replaceChildren();
  if (picture) block.append(media);
  else block.classList.add('hero-headline-no-image');
  block.append(content);
}
