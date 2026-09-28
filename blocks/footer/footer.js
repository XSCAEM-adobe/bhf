/**
 * Fetches the footer fragment. Metadata-independent: /content first (local preview),
 * then the site root (DA / EDS).
 * @returns {Promise<Element|null>} wrapper holding the footer sections
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // images in the fragment are relative to the fragment, not the current page
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
    img.loading = 'lazy';
  });
  return wrapper;
}

const isHeading = (el) => !!el && /^H[1-6]$/.test(el.tagName);
const isImageOnly = (el) => !!el && el.tagName === 'P' && !!el.querySelector('img') && !el.textContent.trim();
const isLabel = (el) => !!el && el.tagName === 'P' && !el.querySelector('a, img') && !!el.textContent.trim();

/**
 * Classifies a footer section by its content shape.
 * @param {Element} section
 * @returns {string}
 */
function sectionType(section) {
  const first = section.firstElementChild;
  if (isHeading(first)) return 'column';
  if (isImageOnly(first)) return 'brand';
  if (isLabel(first) && section.querySelector('ul')) return 'inline';
  if (first?.tagName === 'UL') return 'links';
  return 'text';
}

/**
 * Marks off-site links: new tab, plus an external-link icon on text links in lists.
 * @param {Element} root
 */
function decorateLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.href, window.location.href);
    if (url.origin === window.location.origin) return;
    a.target = '_blank';
    a.rel = 'noopener';
    if (!a.querySelector('img') && a.closest('li')) {
      const icon = document.createElement('span');
      icon.className = 'footer-external-icon';
      icon.setAttribute('aria-hidden', 'true');
      a.append(icon);
      a.setAttribute('aria-label', `${a.textContent.trim()} (opens in a new tab)`);
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  let columns = null;

  [...fragment.children].forEach((section) => {
    const type = sectionType(section);
    section.className = `footer-${type}`;

    // lists where every item is an image link are icon grids (e.g. social links);
    // any text next to the image becomes its label
    section.querySelectorAll('ul').forEach((ul) => {
      const items = [...ul.children];
      if (!items.length || !items.every((li) => li.querySelector('a img'))) return;
      ul.classList.add('footer-icon-list');
      items.forEach((li) => {
        const a = li.querySelector('a');
        const text = [...a.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE);
        const label = text.map((n) => n.textContent).join('').trim();
        if (!label) return;
        text.forEach((n) => n.remove());
        const span = document.createElement('span');
        span.className = 'footer-icon-label';
        span.textContent = label;
        a.append(span);
        a.querySelector('img').alt = '';
      });
    });

    if (type === 'column') {
      // consecutive heading-led sections share one multi-column band
      if (!columns) {
        columns = document.createElement('div');
        columns.className = 'footer-band footer-columns';
        inner.append(columns);
      }
      columns.append(section);
      return;
    }
    columns = null;

    if (type === 'brand') {
      const logo = section.firstElementChild;
      logo.className = 'footer-brand-logo';
      const text = document.createElement('div');
      text.className = 'footer-brand-text';
      while (logo.nextElementSibling) text.append(logo.nextElementSibling);
      section.append(text);
    } else if (type === 'inline') {
      section.firstElementChild.className = 'footer-inline-label';
    }
    section.classList.add('footer-band');
    inner.append(section);
  });

  decorateLinks(inner);
  block.append(inner);
}
