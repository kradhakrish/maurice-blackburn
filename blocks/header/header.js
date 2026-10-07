// desktop layout (utility bar + horizontal megamenu nav) from this width up
const isDesktop = window.matchMedia('(min-width: 1200px)');

let idCount = 0;
const nextId = (prefix) => {
  idCount += 1;
  return `${prefix}-${idCount}`;
};

const ownText = (el) => [...el.childNodes]
  .filter((n) => n.nodeType === Node.TEXT_NODE)
  .map((n) => n.textContent)
  .join('')
  .trim();

// authors may wrap list item content in <p> and/or <strong>
const itemLink = (li) => li.querySelector(':scope > a, :scope > p > a, :scope > strong > a, :scope > p > strong > a');

const itemLabel = (li) => {
  const link = itemLink(li);
  if (link) return link.textContent.trim();
  const p = li.querySelector(':scope > p');
  return p ? p.textContent.trim() : ownText(li);
};

/**
 * Fetches the nav fragment: /content (local preview) first, then the site root (DA/EDS).
 * Relative image paths are resolved against the fragment URL so they work on any page.
 * @returns {Promise<Element|null>} wrapper whose children are the nav sections
 */
async function fetchNav() {
  let resp = await fetch('/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return wrapper;
}

/**
 * Sorts the flat nav sections by what they contain, so authors can reorder them freely.
 * @param {Element} wrapper fragment wrapper
 */
function classifySections(wrapper) {
  const sections = [...wrapper.children].filter((s) => s.tagName === 'DIV');
  const found = { promos: [] };
  sections.forEach((section) => {
    const heading = section.querySelector(':scope > h1, :scope > h2, :scope > h3');
    const nestedLinks = section.querySelector(':scope > ul > li > ul a');
    if (heading) found.promos.push(section);
    else if (section.querySelector('a[href^="tel:"]') || section.querySelector(':scope > ul > li > ul > li:not(:has(a))')) found.utility = section;
    else if (nestedLinks) found.nav = section;
    else if (section.querySelector('img') && !found.brand) found.brand = section;
    else found.cta = section;
  });
  return found;
}

function buildUtility(section) {
  const bar = document.createElement('nav');
  bar.className = 'nav-utility';
  bar.setAttribute('aria-label', 'Utility');
  const search = { label: 'Search', placeholder: '', action: '/search/' };

  [...section.children].forEach((el) => {
    if (el.tagName === 'UL' && el.querySelector(':scope > li > ul')) {
      // list item text = accessible label; nested items = options
      const selects = document.createElement('div');
      selects.className = 'nav-utility-selects';
      [...el.children].forEach((li) => {
        const options = [...li.querySelectorAll(':scope > ul > li')].map((o) => o.textContent.trim());
        if (!options.length) return;
        const label = document.createElement('label');
        label.className = 'nav-select';
        const name = document.createElement('span');
        name.className = 'nav-visually-hidden';
        name.textContent = itemLabel(li) || options[0];
        const select = document.createElement('select');
        const key = `mb-nav-${name.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        options.forEach((text) => select.append(new Option(text, text)));
        try {
          const saved = localStorage.getItem(key);
          if (saved && options.includes(saved)) select.value = saved;
        } catch { /* storage unavailable */ }
        select.addEventListener('change', () => {
          try { localStorage.setItem(key, select.value); } catch { /* storage unavailable */ }
          document.dispatchEvent(new CustomEvent('mb:nav-preference', { detail: { key, value: select.value } }));
        });
        label.append(name, select);
        selects.append(label);
      });
      bar.append(selects);
    } else if (el.tagName === 'UL') {
      el.className = 'nav-utility-links';
      el.querySelectorAll(':scope > li').forEach((li) => {
        const strong = li.querySelector('strong');
        if (strong) {
          li.classList.add('nav-highlight');
          strong.replaceWith(...strong.childNodes);
        }
      });
      bar.append(el);
    } else if (el.tagName === 'P') {
      const link = el.querySelector('a');
      if (link && link.getAttribute('href').startsWith('tel:')) {
        const phone = document.createElement('div');
        phone.className = 'nav-phone nav-highlight';
        // the number may sit beside the link rather than inside it
        link.append(...[...el.childNodes].filter((n) => n !== link));
        link.querySelectorAll('strong').forEach((s) => s.replaceWith(...s.childNodes));
        link.querySelectorAll('img').forEach((img) => {
          if (!/^https?:/.test(img.src)) {
            img.remove();
            return;
          }
          img.alt = '';
          img.width = 16;
          img.height = 16;
        });
        if (!link.textContent.trim()) {
          link.append(link.getAttribute('href').replace(/^tel:/, ''));
        }
        phone.append(link);
        bar.append(phone);
      } else if (link) {
        search.label = link.textContent.trim();
        search.action = link.getAttribute('href');
      } else if (el.textContent.trim()) {
        search.placeholder = el.textContent.trim();
      }
    }
  });
  return { bar, search };
}

function buildSearch(search) {
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-search-toggle';
  toggle.textContent = search.label;

  const panel = document.createElement('div');
  panel.className = 'nav-search';
  panel.id = nextId('nav-search');
  panel.hidden = true;
  toggle.setAttribute('aria-controls', panel.id);
  toggle.setAttribute('aria-expanded', 'false');

  const form = document.createElement('form');
  form.action = search.action;
  form.method = 'get';
  form.setAttribute('role', 'search');
  const label = document.createElement('label');
  label.className = 'nav-visually-hidden';
  label.htmlFor = nextId('nav-search-input');
  label.textContent = search.placeholder || search.label;
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.id = label.htmlFor;
  input.placeholder = search.placeholder;
  input.autocomplete = 'off';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', search.label);
  form.append(label, input, submit);
  panel.append(form);
  return { toggle, panel, input };
}

/**
 * Builds one megamenu panel from a level 1 list item and its matching promo section.
 * Level 2 items with nested lists become group buttons that swap the aside column
 * from the promo card to that group's links.
 */
function buildPanel(li, promo) {
  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  panel.id = nextId('nav-panel');
  panel.hidden = true;
  const inner = document.createElement('div');
  inner.className = 'nav-panel-inner';

  const headingLink = itemLink(li);
  if (headingLink) {
    const heading = headingLink.cloneNode(true);
    heading.className = 'nav-panel-heading';
    inner.append(heading);
  }

  const list = document.createElement('ul');
  list.className = 'nav-panel-list';
  const aside = document.createElement('div');
  aside.className = 'nav-panel-aside';

  const promoEl = document.createElement('div');
  promoEl.className = 'nav-panel-promo';
  if (promo) {
    [...promo.children].filter((c) => !/^H[1-6]$/.test(c.tagName)).forEach((c, i) => {
      const link = c.querySelector('a');
      if (link && c.textContent.trim() === link.textContent.trim()) c.className = 'nav-panel-promo-link';
      else if (i === 0) c.className = 'nav-panel-promo-eyebrow';
      else c.className = 'nav-panel-promo-title';
      promoEl.append(c);
    });
    aside.append(promoEl);
  }

  const groups = [];
  const showGroup = (index) => {
    groups.forEach((g, i) => {
      const open = i === index;
      g.button.setAttribute('aria-expanded', open);
      g.panel.hidden = !open;
    });
    promoEl.hidden = index !== -1;
  };

  const items = li.querySelector(':scope > ul');
  [...(items ? items.children : [])].forEach((item) => {
    const row = document.createElement('li');
    const link = itemLink(item);
    const sub = item.querySelector(':scope > ul');
    if (link && sub) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nav-group-trigger';
      button.textContent = link.textContent.trim();
      const groupPanel = document.createElement('div');
      groupPanel.className = 'nav-group-panel';
      groupPanel.id = nextId('nav-group');
      groupPanel.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', groupPanel.id);
      const overview = link.cloneNode(true);
      overview.className = 'nav-group-overview';
      sub.className = 'nav-group-links';
      groupPanel.append(overview, sub);
      aside.append(groupPanel);
      const index = groups.length;
      groups.push({ button, panel: groupPanel });
      button.addEventListener('click', () => {
        showGroup(button.getAttribute('aria-expanded') === 'true' ? -1 : index);
      });
      row.append(button);
    } else if (link) {
      row.append(link);
    } else {
      return;
    }
    list.append(row);
  });

  inner.append(list, aside);
  panel.append(inner);
  return { panel, reset: () => showGroup(-1) };
}

function buildSections(navSection, promos) {
  const ul = document.createElement('ul');
  ul.className = 'nav-sections nav-list';
  const triggers = [];
  const promoFor = (label) => promos.find((p) => p.querySelector('h1, h2, h3').textContent.trim() === label);

  [...navSection.querySelectorAll(':scope > ul > li')].forEach((li) => {
    const headingLink = itemLink(li);
    const label = itemLabel(li);
    const item = document.createElement('li');
    item.className = 'nav-section';
    if (!li.querySelector(':scope > ul')) {
      if (headingLink) item.append(headingLink);
      ul.append(item);
      return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-trigger';
    button.textContent = label;
    button.setAttribute('aria-expanded', 'false');
    const { panel, reset } = buildPanel(li, promoFor(label));
    button.setAttribute('aria-controls', panel.id);
    item.append(button, panel);
    ul.append(item);
    triggers.push({ button, panel, reset });
  });
  return { ul, triggers };
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;
  const { utility, brand, nav: navSection, cta, promos } = classifySections(fragment);

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.className = 'nav-main';
  nav.setAttribute('aria-label', 'Main');

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.hidden = true;

  let search = null;
  let utilityBar = null;
  if (utility) {
    const built = buildUtility(utility);
    search = buildSearch(built.search);
    const phone = built.bar.querySelector('.nav-phone');
    built.bar.insertBefore(search.toggle, phone);
    utilityBar = built.bar;
  }

  const main = nav;
  if (brand) {
    brand.className = 'nav-brand';
    const logo = brand.querySelector('img');
    if (logo) {
      logo.width = 200;
      logo.height = 64;
    }
    main.append(brand);
  }

  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';

  const menu = document.createElement('div');
  menu.className = 'nav-menu';
  menu.id = nextId('nav-menu');
  hamburger.setAttribute('aria-controls', menu.id);

  let triggers = [];
  if (navSection) {
    const built = buildSections(navSection, promos);
    triggers = built.triggers;
    menu.append(built.ul);
  }
  if (cta) {
    cta.querySelectorAll('a').forEach((a) => {
      a.className = 'button primary nav-cta';
      menu.append(a);
    });
  }
  main.append(menu, hamburger);

  const closePanels = (except) => {
    triggers.forEach((t) => {
      if (t === except) return;
      t.button.setAttribute('aria-expanded', 'false');
      t.panel.hidden = true;
    });
  };
  const closeSearch = () => {
    if (!search) return;
    search.toggle.setAttribute('aria-expanded', 'false');
    search.panel.hidden = true;
  };
  const syncOverlay = () => {
    const anyOpen = triggers.some((t) => !t.panel.hidden) || (search && !search.panel.hidden);
    overlay.hidden = !(anyOpen && isDesktop.matches);
    block.classList.toggle('is-open', anyOpen);
  };

  triggers.forEach((t) => {
    t.button.addEventListener('click', () => {
      const open = t.button.getAttribute('aria-expanded') !== 'true';
      closePanels(t);
      closeSearch();
      t.reset();
      t.button.setAttribute('aria-expanded', open);
      t.panel.hidden = !open;
      syncOverlay();
    });
  });

  if (search) {
    search.toggle.addEventListener('click', () => {
      const open = search.panel.hidden;
      closePanels();
      search.panel.hidden = !open;
      search.toggle.setAttribute('aria-expanded', open);
      syncOverlay();
      if (open) search.input.focus();
    });
  }

  const closeAll = () => {
    closePanels();
    closeSearch();
    syncOverlay();
  };
  overlay.addEventListener('click', closeAll);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openTrigger = triggers.find((t) => !t.panel.hidden);
    const searchOpen = search && !search.panel.hidden;
    if (!openTrigger && !searchOpen) return;
    closeAll();
    (openTrigger ? openTrigger.button : search.toggle).focus();
  });

  // mobile drawer
  const setMenu = (open) => {
    hamburger.setAttribute('aria-expanded', open);
    hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    block.classList.toggle('menu-open', open);
    document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  };
  hamburger.addEventListener('click', () => setMenu(hamburger.getAttribute('aria-expanded') !== 'true'));

  isDesktop.addEventListener('change', () => {
    setMenu(false);
    closeAll();
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  if (utilityBar) wrapper.append(utilityBar);
  wrapper.append(nav);
  if (search) wrapper.append(search.panel);
  // overlay sits outside the wrapper so it dims the page but not the header
  block.append(wrapper, overlay);
}
