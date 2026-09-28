import { getMetadata } from '../../scripts/aem.js';

// supported networks: share URL builders keyed by the name authors type in the block
const NETWORKS = {
  x: { label: 'X', url: (u, t) => `https://twitter.com/share?url=${u}&text=${t}` },
  twitter: { label: 'X', icon: 'x', url: (u, t) => `https://twitter.com/share?url=${u}&text=${t}` },
  facebook: { label: 'Facebook', url: (u, t) => `https://www.facebook.com/sharer.php?u=${u}&t=${t}` },
  linkedin: { label: 'LinkedIn', url: (u, t) => `https://www.linkedin.com/shareArticle?mini=true&url=${u}&title=${t}` },
};

/**
 * Builds share links for the current page from the networks listed in the block.
 * Rows that are not a known network become the block label (e.g. "Share :").
 * @param {Element} block The share block element
 */
export default function decorate(block) {
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  const pageUrl = encodeURIComponent(canonical || window.location.href.split('#')[0]);
  const title = encodeURIComponent(getMetadata('og:title') || document.title);

  const list = document.createElement('ul');
  list.className = 'share-list';
  [...block.children].forEach((row) => {
    const text = row.textContent.trim();
    if (!text) return;
    const li = document.createElement('li');
    const key = text.toLowerCase().replace(/[^a-z]/g, '');
    const network = NETWORKS[key];
    if (network) {
      li.className = 'share-item';
      const a = document.createElement('a');
      a.href = network.url(pageUrl, title);
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('aria-label', `Share on ${network.label} (opens in a new tab)`);
      const img = document.createElement('img');
      img.src = `${window.hlx.codeBasePath}/icons/share-${network.icon || key}.svg`;
      img.alt = '';
      img.width = 36;
      img.height = 36;
      img.loading = 'lazy';
      a.append(img);
      li.append(a);
    } else {
      li.className = 'share-label';
      li.textContent = text;
    }
    list.append(li);
  });
  block.replaceChildren(list);
}
