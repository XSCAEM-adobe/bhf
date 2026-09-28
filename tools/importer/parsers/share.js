/* eslint-disable */
/* global WebImporter */
/**
 * Parser for share (social sharing buttons).
 * Source: https://www.brighthousefinancial.com/education/retirement-planning/5-things-to-consider-to-retire-early
 * Instance selector: .articleDetailsContainer .large-1 .cmp-experiencefragment--page-sharing
 * Structure (blocks/share/README.md): 1 column, 1 row per entry:
 *   first row = label text ("Share :"), then one row per network name (X, Facebook, LinkedIn).
 * The share URLs are page-specific, so only the network names are authored;
 * blocks/share/share.js builds the links for the current page.
 */
export default function parse(element, { document }) {
  const list = element.querySelector('ul.social-icons-list') || element;
  const cells = [];
  [...list.querySelectorAll(':scope > li')].forEach((li) => {
    const link = li.querySelector('a');
    if (!link) {
      const label = li.textContent.replace(/\s+/g, ' ').trim();
      if (label) cells.push([label]);
      return;
    }
    const img = link.querySelector('img');
    const name = (link.id || (img && (img.getAttribute('title') || img.getAttribute('alt'))) || '').trim();
    if (name) cells.push([name]);
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'share', cells });
  element.replaceWith(block);
}
