import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

function isLinkOnly(el) {
  const a = el.querySelector('a');
  return !!a && el.textContent.trim() === a.textContent.trim();
}

/**
 * Hero (article): background image with heading, body copy, a featured-article card
 * (eyebrow + linked heading) and a primary CTA button.
 * Authored as 1 column: row 1 = background image; row 2 = H2, paragraph, eyebrow paragraph,
 * linked H4 (featured article), CTA link (bold = primary button).
 * @param {Element} block
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const picture = block.querySelector('picture');
  const media = document.createElement('div');
  media.className = 'hero-article-media';
  if (picture) {
    const img = picture.querySelector('img');
    media.append(img
      ? createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }])
      : picture);
    const parent = picture.parentElement;
    picture.remove();
    if (parent && parent.tagName === 'P' && !parent.textContent.trim() && !parent.children.length) parent.remove();
  }

  const content = document.createElement('div');
  content.className = 'hero-article-content';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    while (cell.firstChild) content.append(cell.firstChild);
  });
  [...content.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });

  // Featured article: the first linked heading after the main heading, plus an eyebrow
  // paragraph directly preceding it (if any).
  const headings = [...content.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6')];
  const featuredHeading = headings.slice(1).find((h) => h.querySelector('a'));
  if (featuredHeading) {
    const feature = document.createElement('div');
    feature.className = 'hero-article-feature';
    const prev = featuredHeading.previousElementSibling;
    featuredHeading.before(feature);
    if (prev && prev.tagName === 'P' && !prev.querySelector('a, picture')) {
      prev.classList.add('hero-article-eyebrow');
      feature.append(prev);
    }
    feature.append(featuredHeading);
  }

  // CTA: last link-only paragraph after the feature card (or anywhere, if no card).
  const ctaCandidates = [...content.querySelectorAll(':scope > p')].filter(isLinkOnly);
  const cta = ctaCandidates[ctaCandidates.length - 1];
  if (cta) cta.classList.add('hero-article-cta');

  block.replaceChildren();
  if (picture) block.append(media);
  else block.classList.add('hero-article-no-image');
  block.append(content);
}
