import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Hero (education): solid band holding a meta line (read time | date), H1 and subtitle,
 * followed by an inline feature photo that overlaps the bottom edge of the band.
 * Authored as 1 column: one row with the image, one row with meta paragraph, H1, subtitle.
 * Row order is not significant: the image is detected by content.
 * @param {Element} block
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const band = document.createElement('div');
  band.className = 'hero-education-band';
  const content = document.createElement('div');
  content.className = 'hero-education-content';
  band.append(content);

  const media = document.createElement('div');
  media.className = 'hero-education-media';

  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    media.append(img
      ? createOptimizedPicture(img.src, img.alt, true, [{ media: '(min-width: 900px)', width: '1600' }, { width: '900' }])
      : picture);
    const parent = picture.parentElement;
    picture.remove();
    if (parent && parent.tagName === 'P' && !parent.textContent.trim() && !parent.children.length) parent.remove();
  }

  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    while (cell.firstChild) content.append(cell.firstChild);
  });
  [...content.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });

  // Meta line: a plain paragraph before the main heading ("4-Minute Article | Apr 24, 2018").
  const heading = content.querySelector(':scope > h1, :scope > h2');
  if (heading) {
    const prev = heading.previousElementSibling;
    if (prev && prev.tagName === 'P' && !prev.querySelector('a, picture')) {
      prev.classList.add('hero-education-meta');
      // split "read time | date" into items so the separator gets its own spacing
      const parts = prev.textContent.split('|').map((t) => t.trim()).filter(Boolean);
      if (parts.length > 1) {
        prev.textContent = '';
        parts.forEach((text, i) => {
          if (i) {
            const sep = document.createElement('span');
            sep.className = 'hero-education-meta-sep';
            sep.setAttribute('aria-hidden', 'true');
            sep.textContent = '|';
            prev.append(' ', sep, ' ');
          }
          const item = document.createElement('span');
          item.className = 'hero-education-meta-item';
          item.textContent = text;
          prev.append(item);
        });
      }
    }
    const next = heading.nextElementSibling;
    if (next && next.tagName === 'P') next.classList.add('hero-education-subtitle');
  }

  block.replaceChildren(band);
  if (media.childElementCount) block.append(media);
  else block.classList.add('hero-education-no-image');
}
