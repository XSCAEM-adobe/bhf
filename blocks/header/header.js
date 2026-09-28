// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the nav fragment. Metadata-independent: /content first (local preview),
 * then the site root (DA / EDS).
 * @returns {Promise<Element|null>} wrapper holding the nav sections
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // images in the fragment are relative to the fragment, not the current page
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  wrapper.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = source.getAttribute('srcset').split(',').map((candidate) => {
      const [url, ...descriptor] = candidate.trim().split(/\s+/);
      return [new URL(url, resp.url).href, ...descriptor].join(' ');
    }).join(', ');
  });
  // published fragments wrap list-item text in a paragraph; unwrap it so items read the
  // same as the plain fragment (label text / link directly inside the <li>)
  wrapper.querySelectorAll('li > p:first-child').forEach((para) => para.replaceWith(...para.childNodes));
  return wrapper;
}

/**
 * Returns the direct text of an element (ignoring child elements).
 * @param {Element} el
 * @returns {string}
 */
function ownText(el) {
  return [...el.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ')
    .trim();
}

/**
 * Normalizes a path for comparison (drops /content prefix, /index and trailing slash).
 * @param {string} path
 * @returns {string}
 */
function normalizePath(path) {
  const p = path.replace(/^\/content(?=\/)/, '').replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '');
  return p.length > 1 ? p.replace(/\/$/, '') : '/';
}

function markExternal(a) {
  const url = new URL(a.href, window.location.href);
  if (url.hostname !== window.location.hostname && !url.hostname.endsWith('localhost')) {
    a.target = '_blank';
    a.rel = 'noopener';
  }
}

/**
 * Builds a trigger element from a list item's own text label.
 * @param {Element} li
 * @param {string} className
 * @returns {HTMLButtonElement}
 */
function buildTrigger(li, className) {
  const label = ownText(li);
  [...li.childNodes].forEach((n) => { if (n.nodeType === Node.TEXT_NODE) n.remove(); });
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-expanded', 'false');
  button.textContent = label;
  li.prepend(button);
  return button;
}

/**
 * Builds link columns from a list: an item with a nested list becomes its own column
 * (heading + links); consecutive items without nested lists share one column of headings.
 * @param {Element} ul
 * @returns {Element} columns container
 */
function buildColumns(ul) {
  const columns = document.createElement('div');
  columns.className = 'nav-panel-columns';
  let current = null;
  [...ul.children].forEach((li) => {
    const heading = li.querySelector(':scope > a');
    const sub = li.querySelector(':scope > ul');
    if (sub || !current || current.dataset.type === 'list') {
      current = document.createElement('div');
      current.className = 'nav-panel-column';
      current.dataset.type = sub ? 'list' : 'headings';
      columns.append(current);
    }
    if (heading) {
      heading.classList.add('nav-panel-heading');
      current.append(heading);
    }
    if (sub) {
      sub.className = 'nav-panel-links';
      current.append(sub);
    }
  });
  return columns;
}

/**
 * Builds a featured card from the paragraphs that follow a panel list
 * (image paragraph, eyebrow paragraph, link paragraph).
 * @param {Element[]} paragraphs
 * @returns {Element|null}
 */
function buildCard(paragraphs) {
  if (!paragraphs.length) return null;
  const card = document.createElement('div');
  card.className = 'nav-card';
  paragraphs.forEach((p) => {
    const img = p.querySelector('img');
    const link = p.querySelector('a');
    if (img && !p.textContent.trim()) {
      p.className = 'nav-card-image';
    } else if (link) {
      p.className = 'nav-card-title';
      card.dataset.href = link.href;
    } else {
      p.className = 'nav-card-eyebrow';
    }
    card.append(p);
  });
  card.addEventListener('click', (e) => {
    if (!e.target.closest('a') && card.dataset.href) window.location.href = card.dataset.href;
  });
  return card;
}

/**
 * Builds the mobile slide-in panel header: a Back button and the panel title.
 * @param {Element} li item that owns the panel
 * @param {string} title
 * @returns {Element}
 */
function buildPanelHeader(li, title) {
  const header = document.createElement('div');
  header.className = 'nav-panel-header';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'nav-back';
  back.textContent = 'Back';
  back.addEventListener('click', () => {
    li.classList.remove('is-open');
    li.querySelector(':scope > button')?.setAttribute('aria-expanded', 'false');
  });
  const heading = document.createElement('p');
  heading.className = 'nav-panel-title';
  heading.textContent = title;
  header.append(back, heading);
  return header;
}

function closeAll(nav) {
  nav.querySelectorAll('[aria-expanded="true"]').forEach((el) => {
    if (!el.classList.contains('nav-hamburger-button')) el.setAttribute('aria-expanded', 'false');
  });
  nav.querySelectorAll('.is-open').forEach((el) => el.classList.remove('is-open'));
  nav.classList.remove('nav-open');
}

function openItem(nav, li) {
  const trigger = li.querySelector(':scope > button');
  if (!trigger) return;
  if (isDesktop.matches) closeAll(nav);
  li.classList.add('is-open');
  trigger.setAttribute('aria-expanded', 'true');
  if (isDesktop.matches) nav.classList.add('nav-open');
}

function toggleItem(nav, li) {
  if (li.classList.contains('is-open')) {
    li.classList.remove('is-open');
    li.querySelector(':scope > button').setAttribute('aria-expanded', 'false');
    if (!nav.querySelector('.is-open')) nav.classList.remove('nav-open');
  } else {
    openItem(nav, li);
  }
}

/**
 * Moves the underline indicator under an item (or hides it when no item).
 * @param {Element} sections
 * @param {Element|null} item
 */
function moveIndicator(sections, item) {
  const indicator = sections.querySelector('.nav-indicator');
  if (!indicator) return;
  if (!item || !isDesktop.matches) {
    indicator.style.opacity = '0';
    return;
  }
  const listBox = sections.getBoundingClientRect();
  const box = item.getBoundingClientRect();
  indicator.style.opacity = '1';
  indicator.style.width = `${box.width}px`;
  indicator.style.transform = `translateX(${box.left - listBox.left}px)`;
}

/**
 * Finds the top-level item matching the current page (own link or first path segment).
 * @param {Element[]} items
 * @returns {Element|null}
 */
function findActiveItem(items) {
  const current = normalizePath(window.location.pathname);
  const segment = current.split('/')[1] || '';
  return items.find((li) => {
    const own = li.querySelector(':scope > a');
    if (own) return normalizePath(new URL(own.href).pathname) === current;
    return segment && [...li.querySelectorAll('a')]
      .some((a) => normalizePath(new URL(a.href).pathname).split('/')[1] === segment);
  }) || null;
}

function decorateTools(tools, nav) {
  const list = tools.querySelector('ul');
  if (!list) return;
  list.className = 'nav-tools-list';
  const items = [...list.children];
  items.forEach((li) => {
    const sub = li.querySelector(':scope > ul');
    if (sub) {
      li.className = 'nav-tools-dropdown';
      sub.className = 'nav-tools-menu';
      const trigger = buildTrigger(li, 'nav-tools-trigger');
      const panel = document.createElement('div');
      panel.className = 'nav-tools-panel';
      panel.append(buildPanelHeader(li, trigger.textContent), sub);
      li.append(panel);
      trigger.addEventListener('click', () => toggleItem(nav, li));
      li.addEventListener('mouseenter', () => { if (isDesktop.matches) openItem(nav, li); });
      li.addEventListener('mouseleave', () => { if (isDesktop.matches) closeAll(nav); });
    } else {
      li.className = 'nav-tools-link';
    }
  });
  const links = items.filter((li) => li.classList.contains('nav-tools-link'));
  if (links.length > 1) links[links.length - 1].classList.add('nav-tools-cta');
}

function decorateSections(sections, nav) {
  const list = sections.querySelector('ul');
  if (!list) return;
  list.className = 'nav-sections-list';
  const items = [...list.children];
  items.forEach((li) => {
    li.classList.add('nav-item');
    const sub = li.querySelector(':scope > ul');
    if (!sub) {
      const link = li.querySelector(':scope > a');
      link?.classList.add('nav-link');
      // a link with an image swaps its label for the image when the header condenses
      const img = link?.querySelector('img');
      if (img) {
        const slider = document.createElement('span');
        slider.className = 'nav-link-slider';
        const label = document.createElement('span');
        label.className = 'nav-link-label';
        label.textContent = link.textContent.trim();
        const media = document.createElement('span');
        media.className = 'nav-link-media';
        media.setAttribute('aria-hidden', 'true');
        img.alt = '';
        media.append(img);
        slider.append(label, media);
        link.replaceChildren(slider);
      }
      li.addEventListener('mouseenter', () => {
        if (!isDesktop.matches) return;
        closeAll(nav);
        moveIndicator(sections, li);
      });
      return;
    }
    li.classList.add('nav-drop');
    const trigger = buildTrigger(li, 'nav-drop-trigger');
    const panel = document.createElement('div');
    panel.className = 'nav-panel';
    panel.append(buildPanelHeader(li, trigger.textContent));
    const inner = document.createElement('div');
    inner.className = 'nav-panel-inner';
    inner.append(buildColumns(sub));
    sub.remove();
    const card = buildCard([...li.querySelectorAll(':scope > p')]);
    if (card) inner.append(card);
    panel.append(inner);
    li.append(panel);

    // desktop: click opens (hover may already have opened it); mobile: click toggles
    trigger.addEventListener('click', () => {
      if (isDesktop.matches) {
        openItem(nav, li);
        moveIndicator(sections, li);
      } else {
        toggleItem(nav, li);
      }
    });
    li.addEventListener('mouseenter', () => {
      if (!isDesktop.matches) return;
      openItem(nav, li);
      moveIndicator(sections, li);
    });
  });

  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  sections.append(indicator);

  const active = findActiveItem(items);
  if (active) {
    active.classList.add('is-active');
    active.querySelector(':scope > a, :scope > button')?.setAttribute('aria-current', 'page');
  }
  const reset = () => moveIndicator(sections, active);
  list.addEventListener('mouseleave', () => { if (!nav.classList.contains('nav-open')) reset(); });
  nav.addEventListener('nav:closed', reset);
  requestAnimationFrame(reset);
  window.addEventListener('resize', reset);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');
  nav.setAttribute('aria-expanded', 'false');

  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  const [brand, tools, sections] = [...fragment.children];
  [['brand', brand], ['tools', tools], ['sections', sections]].forEach(([name, section]) => {
    if (!section) return;
    section.className = `nav-${name}`;
    bar.append(section);
  });
  nav.append(bar);

  if (brand) {
    // first logo is the full (desktop) logo, a second one is the compact (mobile) logo
    const [logo, compact] = brand.querySelectorAll('img');
    if (logo) {
      logo.loading = 'eager';
      logo.width = 234;
      logo.height = 36;
      logo.classList.add('nav-brand-logo');
    }
    if (compact) {
      compact.loading = 'eager';
      compact.classList.add('nav-brand-logo-compact');
    }
  }
  if (tools) decorateTools(tools, nav);
  if (sections) decorateSections(sections, nav);
  nav.querySelectorAll('a[href]').forEach(markExternal);

  // hamburger (mobile)
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" class="nav-hamburger-button" aria-controls="nav" aria-expanded="false" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  const hamburgerButton = hamburger.querySelector('button');
  hamburgerButton.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    hamburgerButton.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    hamburgerButton.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    document.body.style.overflowY = expanded ? '' : 'hidden';
    if (expanded) closeAll(nav);
  });
  bar.prepend(hamburger);

  // page overlay shown while a desktop panel is open
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.addEventListener('click', () => {
    closeAll(nav);
    nav.dispatchEvent(new CustomEvent('nav:closed'));
  });
  nav.append(overlay);

  // close desktop panels when the pointer leaves the header
  nav.addEventListener('mouseleave', (e) => {
    if (!isDesktop.matches || overlay.contains(e.relatedTarget)) return;
    closeAll(nav);
    nav.dispatchEvent(new CustomEvent('nav:closed'));
  });
  overlay.addEventListener('mouseenter', () => {
    if (!isDesktop.matches) return;
    closeAll(nav);
    nav.dispatchEvent(new CustomEvent('nav:closed'));
  });
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    closeAll(nav);
    nav.dispatchEvent(new CustomEvent('nav:closed'));
  });

  // reset state when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => {
    closeAll(nav);
    nav.setAttribute('aria-expanded', 'false');
    hamburgerButton.setAttribute('aria-expanded', 'false');
    hamburgerButton.setAttribute('aria-label', 'Open navigation');
    document.body.style.overflowY = '';
    nav.dispatchEvent(new CustomEvent('nav:closed'));
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);

  // condensed header + reading progress bar on scroll (desktop)
  const progress = document.createElement('span');
  progress.className = 'nav-progress';
  progress.setAttribute('aria-hidden', 'true');
  navWrapper.append(progress);
  const onScroll = () => {
    const condensed = isDesktop.matches && window.scrollY > 70;
    if (condensed !== navWrapper.classList.contains('is-condensed')) {
      navWrapper.classList.toggle('is-condensed', condensed);
      if (condensed) closeAll(nav);
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty('--nav-progress', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  isDesktop.addEventListener('change', onScroll);
  onScroll();

  block.append(navWrapper);
}
