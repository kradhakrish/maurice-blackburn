/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const heading = element.querySelector(".pb-title, h1, h2");
    const subtitle = element.querySelector(".pb-subtitle, .cmp-page-banner-content p");
    const image = element.querySelector("img.desktop-image") || element.querySelector(".image-container img, img.pb-image, img");
    const ctaContainer = element.querySelector(".pb-buttons--desktop") || element.querySelector(".pb-buttons");
    const ctaSources = ctaContainer ? [...ctaContainer.querySelectorAll("a")] : [];
    if (!heading && !subtitle) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (heading) {
      const h1 = document.createElement("h1");
      h1.innerHTML = heading.innerHTML;
      contentCell.push(h1);
    }
    if (subtitle) {
      const p = document.createElement("p");
      p.innerHTML = subtitle.innerHTML;
      contentCell.push(p);
    }
    ctaSources.forEach((src) => {
      const text = src.textContent.trim();
      if (!text) return;
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = src.getAttribute("href") || "#chat-with-morry";
      a.textContent = text;
      const strong = document.createElement("strong");
      strong.append(a);
      p.append(strong);
      contentCell.push(p);
    });
    const cells = [];
    if (image) cells.push([image]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-usp.js
  function parse2(element, { document }) {
    let items = [...element.querySelectorAll(".cmp-usp-banner-item")];
    if (!items.length) {
      const container = element.querySelector(".cmp-usp-banner-container") || element;
      items = [...container.children];
    }
    const cells = [];
    items.forEach((item) => {
      const icon = item.querySelector("img, picture");
      const textEl = item.querySelector("span, p");
      const text = (textEl ? textEl.textContent : item.textContent).trim();
      if (!icon && !text) return;
      const p = document.createElement("p");
      p.textContent = text;
      cells.push([icon || "", text ? p : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-usp", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-tile.js
  function parse3(element, { document }) {
    let bodies = [...element.querySelectorAll(".icon-tile-body")];
    if (!bodies.length) bodies = [...element.querySelectorAll(".card.icon-tile, .card")];
    bodies = bodies.filter((b) => !b.closest("#sellingPointContainer"));
    const cells = [];
    bodies.forEach((body) => {
      const icon = body.querySelector("img.icon-tile-img, .icon-tile-header img, img");
      const headingEl = body.querySelector(".icon-tile-heading, h2, h3, h4");
      const link = body.querySelector(".cmp-teaser__action-container a[href], a[href]") || body.closest("a[href]");
      const title = headingEl ? headingEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (!icon && !title) return;
      const bodyCell = [];
      if (title) {
        const h3 = document.createElement("h3");
        if (link) {
          const a = document.createElement("a");
          a.href = link.getAttribute("href");
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        bodyCell.push(h3);
      } else if (link) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = link.textContent.replace(/\s+/g, " ").trim();
        p.append(a);
        bodyCell.push(p);
      }
      cells.push([icon || "", bodyCell.length ? bodyCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon-tile", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-contact.js
  var FORM_HREF = "/forms/request-a-free-call";
  function parse4(element, { document }) {
    const left = [];
    const embed = element.querySelector(".cmp-embed") || element;
    [...embed.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > p")].forEach((el) => {
      if (!el.textContent.trim()) return;
      left.push(el);
    });
    const items = [...element.querySelectorAll(".info-item")];
    if (items.length) {
      const ul = document.createElement("ul");
      items.forEach((item) => {
        const text = item.textContent.replace(/\s+/g, " ").trim();
        if (!text) return;
        const li = document.createElement("li");
        const p = item.querySelector("p");
        if (p) li.innerHTML = p.innerHTML;
        else li.textContent = text;
        li.querySelectorAll("sup").forEach((s) => {
          if (!s.textContent.trim()) s.remove();
        });
        ul.append(li);
      });
      if (ul.children.length) left.push(ul);
    }
    const scope = element.closest(".full-width-background-extend, .customPadding") || element.ownerDocument;
    const float = scope.querySelector("#float") || element.ownerDocument.querySelector("#float");
    const right = [];
    if (float) {
      const headingEl = float.querySelector(".cmp-text h1, .cmp-text h2, .cmp-text h3, .cmp-text h4, h3, h2");
      const title = headingEl ? headingEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title;
        right.push(h3);
      }
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = FORM_HREF;
      a.textContent = title || "Request a FREE call";
      p.append(a);
      right.push(p);
      const col = float.closest(".aem-GridColumn");
      (col && !col.contains(element) ? col : float).remove();
    }
    if (!left.length && !right.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[left.length ? left : "", right.length ? right : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-contact", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-video.js
  function toVideoUrl(src) {
    if (!src) return null;
    try {
      const url = new URL(src, "https://www.mauriceblackburn.com.au/");
      const m = url.hostname.includes("vimeo.com") && url.pathname.match(/\/video\/(\d+)/);
      if (m) {
        const h = url.searchParams.get("h");
        return `https://vimeo.com/${m[1]}${h ? `/${h}` : ""}`;
      }
      const yt = url.hostname.includes("youtube") && url.pathname.match(/\/embed\/([^/?]+)/);
      if (yt) return `https://www.youtube.com/watch?v=${yt[1]}`;
      return url.href;
    } catch (e) {
      return null;
    }
  }
  function parse5(element, { document }) {
    const iframe = element.querySelector("iframe.video-iframe, iframe");
    const videoUrl = toVideoUrl(iframe && (iframe.getAttribute("src") || iframe.getAttribute("data-src")));
    const videoCell = [];
    if (videoUrl) {
      const titleEl = element.querySelector(".video__title");
      const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = videoUrl;
      a.textContent = title || videoUrl;
      p.append(a);
      videoCell.push(p);
    }
    const textCell = [];
    let sibling = element.nextElementSibling;
    while (sibling && !sibling.querySelector(".cmp-text") && !sibling.classList.contains("cmp-text")) {
      sibling = sibling.nextElementSibling;
    }
    if (sibling) {
      const texts = sibling.classList.contains("cmp-text") ? [sibling] : [...sibling.querySelectorAll(".cmp-text")];
      texts.filter((t) => !t.querySelector(".cmp-text")).forEach((t) => {
        [...t.children].forEach((child) => {
          if (child.textContent.trim() || child.querySelector("img, picture")) textCell.push(child);
        });
      });
      sibling.remove();
    }
    if (!videoCell.length && !textCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[videoCell.length ? videoCell : "", textCell.length ? textCell : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-stats.js
  var CONTENT_SEL = "blockquote, h1, h2, h3, h4, h5, h6, ul, ol, a.btn, .cmp-text > p";
  function buildColumn(col, document) {
    const nodes = [...col.querySelectorAll(CONTENT_SEL)].filter((el) => !el.parentElement.closest(CONTENT_SEL));
    const out = [];
    nodes.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      if (!el.textContent.trim()) return;
      if (tag === "blockquote") {
        const h2 = document.createElement("h2");
        const span = el.querySelector(".large-font");
        h2.innerHTML = (span || el).innerHTML.trim();
        out.push(h2);
      } else if (tag === "ul" || tag === "ol") {
        const list = document.createElement(tag);
        [...el.querySelectorAll(":scope > li")].forEach((li) => {
          const link = li.querySelector("a[href]");
          const titleEl = li.querySelector(".cmp-list__variation-item-title, .cmp-list__item-title");
          const text = (titleEl || li).textContent.replace(/\s+/g, " ").trim();
          if (!text) return;
          const item = document.createElement("li");
          if (link) {
            const a = document.createElement("a");
            a.href = link.getAttribute("href");
            a.textContent = text;
            item.append(a);
          } else {
            item.textContent = text;
          }
          list.append(item);
        });
        if (list.children.length) out.push(list);
      } else if (tag === "a") {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = el.getAttribute("href");
        a.textContent = el.textContent.replace(/\s+/g, " ").trim();
        p.append(a);
        out.push(p);
      } else {
        out.push(el);
      }
    });
    return out;
  }
  function parse6(element, { document }) {
    let columns = [...element.querySelectorAll(":scope > .aem-GridColumn")];
    if (!columns.length) columns = [...element.children];
    columns = columns.filter((c) => c.textContent.trim());
    const row = columns.map((col) => buildColumn(col, document)).filter((c) => c.length);
    if (!row.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-stories.js
  function toVideoUrl2(src) {
    if (!src) return null;
    try {
      const url = new URL(src, "https://www.mauriceblackburn.com.au/");
      const m = url.hostname.includes("vimeo.com") && url.pathname.match(/\/video\/(\d+)/);
      if (m) {
        const h = url.searchParams.get("h");
        return `https://vimeo.com/${m[1]}${h ? `/${h}` : ""}`;
      }
      const yt = url.hostname.includes("youtube") && url.pathname.match(/\/embed\/([^/?]+)/);
      if (yt) return `https://www.youtube.com/watch?v=${yt[1]}`;
      return url.href;
    } catch (e) {
      return null;
    }
  }
  function panelContent(panel, document) {
    const out = [];
    const iframe = panel.querySelector("iframe.video-iframe, iframe");
    const videoUrl = toVideoUrl2(iframe && (iframe.getAttribute("src") || iframe.getAttribute("data-src")));
    if (videoUrl) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = videoUrl;
      a.textContent = videoUrl;
      p.append(a);
      out.push(p);
    }
    let texts = [...panel.querySelectorAll(".cmp-text")].filter((t) => !t.querySelector(".cmp-text"));
    if (!texts.length) texts = [panel];
    texts.forEach((t) => {
      [...t.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > p, :scope > ul, :scope > ol, :scope > blockquote")].forEach((el) => {
        if (el.closest(".video__heading-section")) return;
        if (!el.textContent.trim() && !el.querySelector("img")) return;
        out.push(el);
      });
    });
    return out;
  }
  function parse7(element, { document }) {
    const tabs = [...element.querySelectorAll(".cmp-tabs__tablist > .cmp-tabs__tab, li.cmp-tabs__tab")].filter((t, i, arr) => arr.indexOf(t) === i);
    const panels = [...element.querySelectorAll(".cmp-tabs__tabpanel")].filter((p) => !p.parentElement.closest(".cmp-tabs__tabpanel"));
    const cells = [];
    const used = /* @__PURE__ */ new Set();
    tabs.forEach((tab, i) => {
      const label = (tab.querySelector(".cmp-tabs__tab-title") || tab).textContent.replace(/\s+/g, " ").trim();
      let panel = null;
      if (tab.id) {
        const panelId = tab.id.replace(/-tab$/, "-tabpanel");
        panel = panels.find((p) => p.id === panelId) || null;
      }
      if (!panel) {
        const ctl = tab.getAttribute("aria-controls");
        if (ctl) panel = panels.find((p) => p.id === ctl) || null;
      }
      if (!panel) panel = panels.filter((p) => !used.has(p))[0] || panels[i] || null;
      if (panel) used.add(panel);
      const content = panel ? panelContent(panel, document) : [];
      if (!label && !content.length) return;
      cells.push([label || `Tab ${i + 1}`, content.length ? content : ""]);
    });
    panels.filter((p) => !used.has(p)).forEach((p, i) => {
      const content = panelContent(p, document);
      if (content.length) cells.push([`Tab ${tabs.length + i + 1}`, content]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-stories", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/widget-reviews.js
  var WIDGET_PATH = "/widgets/reviews/elfsight.html";
  function parse8(element, { document }) {
    let appId = null;
    const mount = element.querySelector('[class*="elfsight-app-"]');
    if (mount) {
      const cls = [...mount.classList].find((c) => c.startsWith("elfsight-app-"));
      if (cls) appId = cls.replace("elfsight-app-", "");
    }
    if (!appId) {
      const root = element.querySelector('[class*="eapps-"]');
      const m = root && root.className.match(/eapps-[a-z-]+?-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/);
      if (m) [, appId] = m;
    }
    if (!appId) {
      element.remove();
      return;
    }
    const href = `${WIDGET_PATH}?appId=${encodeURIComponent(appId)}`;
    const a = document.createElement("a");
    a.href = href;
    a.textContent = href;
    const cells = [[a]];
    const block = WebImporter.Blocks.createBlock(document, { name: "widget-reviews", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse9(element, { document }) {
    const textCell = [];
    const heading = element.querySelector("h1, h2, h3, h4");
    if (heading) {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      textCell.push(h);
    }
    [...element.querySelectorAll("p")].filter((p) => !p.closest("a") && !p.querySelector("a.btn, a.morry-banner-btn") && p.textContent.trim()).forEach((p) => textCell.push(p));
    const buttons = [];
    const morry = element.querySelector("a.morry-banner-btn--desktop") || element.querySelector("a.morry-banner-btn");
    if (morry) buttons.push(morry);
    element.querySelectorAll("a.btn").forEach((a) => {
      if (!buttons.includes(a)) buttons.push(a);
    });
    const buttonCell = [];
    buttons.forEach((src) => {
      const labelEl = src.querySelector(".morry-banner-btn__label");
      const text = (labelEl || src).textContent.replace(/\s+/g, " ").trim();
      if (!text) return;
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = src.getAttribute("href") || "#";
      a.textContent = text;
      p.append(a);
      buttonCell.push(p);
    });
    if (!textCell.length && !buttonCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[textCell.length ? textCell : "", buttonCell.length ? buttonCell : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-promo.js
  function cleanGifSrc(src) {
    if (!src) return src;
    try {
      const url = new URL(src, "https://www.mauriceblackburn.com.au/");
      if (/\.gif$/i.test(url.pathname)) {
        url.search = "";
        return url.href;
      }
      return url.href;
    } catch (e) {
      return src;
    }
  }
  function resolveImageSrc(img) {
    const src = img.getAttribute("src") || "";
    if (src && !/^(data|blob):/i.test(src)) return src;
    const wrap = img.closest(".cmp-image, [data-cmp-src]");
    const lazy = wrap && wrap.getAttribute("data-cmp-src");
    if (lazy) return lazy.replace("{width}", "1080");
    const asset = wrap && wrap.getAttribute("data-asset");
    if (asset) return asset;
    return img.getAttribute("data-src") || src;
  }
  function parse10(element, { document }) {
    let columns = [...element.querySelectorAll(":scope > .aem-GridColumn")];
    if (!columns.length) columns = [...element.children];
    const imgSrc = element.querySelector("img.cmp-image__image, .cmp-image img, img");
    const imageCol = imgSrc ? columns.find((c) => c.contains(imgSrc)) : null;
    const mediaCell = [];
    if (imgSrc) {
      const img = document.createElement("img");
      img.src = cleanGifSrc(resolveImageSrc(imgSrc));
      img.alt = imgSrc.getAttribute("alt") || "";
      const link = imgSrc.closest("a[href]");
      if (link) {
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.append(img);
        mediaCell.push(a);
      } else {
        mediaCell.push(img);
      }
    }
    const textCell = [];
    const textScope = columns.filter((c) => c !== imageCol);
    const scopes = textScope.length ? textScope : [element];
    scopes.forEach((col) => {
      const nodes = [...col.querySelectorAll("h1, h2, h3, h4, h5, h6, .cmp-text p, a.btn")].filter((el) => !el.parentElement.closest("h1, h2, h3, h4, h5, h6, p, a.btn"));
      nodes.forEach((el) => {
        const text = el.textContent.replace(/\s+/g, " ").trim();
        if (!text) return;
        if (el.tagName === "A") {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = el.getAttribute("href");
          a.textContent = text;
          const strong = document.createElement("strong");
          strong.append(a);
          p.append(strong);
          textCell.push(p);
        } else if (/^H\d$/.test(el.tagName)) {
          const h = document.createElement(el.tagName.toLowerCase());
          h.textContent = text;
          textCell.push(h);
        } else {
          textCell.push(el);
        }
      });
    });
    if (!mediaCell.length && !textCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[mediaCell.length ? mediaCell : "", textCell.length ? textCell : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-offices.js
  function buildList(ul, document) {
    const list = document.createElement("ul");
    [...ul.querySelectorAll(":scope > li")].forEach((li) => {
      const link = li.querySelector("a[href]");
      const titleEl = li.querySelector(".cmp-list__item-title, .cmp-list__variation-item-title");
      const text = (titleEl || link || li).textContent.replace(/\s+/g, " ").replace(/\s*>\s*$/, "").trim();
      if (!text) return;
      const item = document.createElement("li");
      if (link) {
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = text;
        item.append(a);
      } else {
        item.textContent = text;
      }
      list.append(item);
    });
    return list.children.length ? list : null;
  }
  function panelContent2(panel, document) {
    const out = [];
    const nodes = [...panel.querySelectorAll("ul, ol, p, h2, h3, h4")].filter((el) => !el.parentElement.closest("ul, ol, p, h2, h3, h4"));
    nodes.forEach((el) => {
      if (!el.textContent.trim()) return;
      if (el.tagName === "UL" || el.tagName === "OL") {
        const list = buildList(el, document);
        if (list) out.push(list);
      } else {
        out.push(el);
      }
    });
    return out;
  }
  function parse11(element, { document }) {
    const tabs = [...element.querySelectorAll("li.cmp-tabs__tab")];
    const panels = [...element.querySelectorAll(".cmp-tabs__tabpanel")].filter((p) => !p.parentElement.closest(".cmp-tabs__tabpanel"));
    const intro = [...element.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter((h) => !h.closest(".cmp-tabs__tabpanel") && !h.closest(".cmp-tabs__tablist") && h.textContent.trim());
    const cells = [];
    const used = /* @__PURE__ */ new Set();
    tabs.forEach((tab, i) => {
      const label = (tab.querySelector(".cmp-tabs__tab-title") || tab).textContent.replace(/\s+/g, " ").trim();
      let panel = null;
      if (tab.id) panel = panels.find((p) => p.id === tab.id.replace(/-tab$/, "-tabpanel")) || null;
      if (!panel && tab.getAttribute("aria-controls")) {
        panel = panels.find((p) => p.id === tab.getAttribute("aria-controls")) || null;
      }
      if (!panel) panel = panels.find((p) => !used.has(p)) || null;
      if (panel) used.add(panel);
      const content = panel ? panelContent2(panel, document) : [];
      if (!label && !content.length) return;
      cells.push([label || `Tab ${i + 1}`, content.length ? content : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-offices", cells });
    intro.forEach((h) => element.before(h));
    element.replaceWith(block);
  }

  // tools/importer/transformers/mauriceblackburn-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function removeColumn(el) {
    if (!el) return;
    const col = el.closest(".aem-GridColumn");
    (col || el).remove();
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".state-selector-popup",
        // "Please select your location" modal
        "#mb-chat",
        // Morry chat mount
        "#cw-shadow-host",
        // chat widget shadow host
        "#__EAAPS_PORTAL",
        // Elfsight portal root (reviews widget overlay)
        '[id^="batBeacon"]',
        // Bing tracking beacon
        "iframe:not(.video-iframe)"
        // demdex / adsrvr / blank tracking iframes
      ]);
      WebImporter.DOMUtils.remove(element, [".AT_placeholder ~ .AT_placeholder"]);
      removeColumn(element.querySelector("#sellingPointContainer"));
      element.querySelectorAll("section.cta-fixed").forEach((s) => {
        const col = s.closest(".container-wrapper") && s.closest(".container-wrapper").closest(".aem-GridColumn");
        (col || s).remove();
      });
      element.querySelectorAll("#morry_cta").forEach((el) => {
        const xf = el.closest(".experiencefragment");
        (xf || el).remove();
      });
      element.querySelectorAll(".cmp-experiencefragment--live-chat").forEach((el) => {
        let xf = el.closest(".experiencefragment");
        const outer = xf && xf.parentElement && xf.parentElement.closest(".experiencefragment");
        if (outer) xf = outer;
        (xf || el).remove();
      });
      element.querySelectorAll(".body-content > .container-wrapper > div > .aem-Grid > .aem-GridColumn").forEach((col) => {
        const hasText = col.textContent.replace(/\s+/g, "").length > 0;
        const hasMedia = col.querySelector("img, picture, iframe, video, form");
        if (!hasText && !hasMedia) col.remove();
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--header",
        ".cmp-experiencefragment--footer",
        "nav.navbar",
        "footer.footer"
      ]);
      WebImporter.DOMUtils.remove(element, ["link", "iframe", "noscript"]);
      element.querySelectorAll("[data-cmp-data-layer], [data-at-src], .at-element-marker").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer");
        el.removeAttribute("data-at-src");
        el.classList.remove("at-element-marker");
      });
    }
  }

  // tools/importer/transformers/mauriceblackburn-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      let el = null;
      try {
        el = root.querySelector(sel);
      } catch (e) {
        el = null;
      }
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = element.ownerDocument.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      const doc = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-banner": parse,
    "cards-usp": parse2,
    "cards-icon-tile": parse3,
    "columns-contact": parse4,
    "columns-video": parse5,
    "columns-stats": parse6,
    "tabs-stories": parse7,
    "widget-reviews": parse8,
    "columns-cta": parse9,
    "columns-promo": parse10,
    "tabs-offices": parse11
  };
  var PAGE_TEMPLATE = {
    "name": "homepage",
    "description": "Homepage",
    "urls": [
      "https://www.mauriceblackburn.com.au/"
    ],
    "blocks": [
      {
        "name": "hero-banner",
        "instances": [
          ".cmp-page-banner > .cmp-page-banner-container"
        ]
      },
      {
        "name": "cards-usp",
        "instances": [
          ".cmp-page-banner > .cmp-usp-banner"
        ]
      },
      {
        "name": "cards-icon-tile",
        "instances": [
          "#serviceTile > .customPadding > .aem-Grid"
        ]
      },
      {
        "name": "columns-contact",
        "instances": [
          "#contact"
        ]
      },
      {
        "name": "columns-video",
        "instances": [
          "#plaintiff .aem-Grid > .video"
        ]
      },
      {
        "name": "columns-stats",
        "instances": [
          "#classAction > .customPadding > .aem-Grid"
        ]
      },
      {
        "name": "tabs-stories",
        "instances": [
          "#clients .tabs"
        ]
      },
      {
        "name": "widget-reviews",
        "instances": [
          "#fiveStar > .customPadding > .aem-Grid > .embed"
        ]
      },
      {
        "name": "columns-cta",
        "instances": [
          ".AT_placeholder:not(.AT_placeholder ~ .AT_placeholder) #full-width-cta:not(#full-width-cta *)"
        ]
      },
      {
        "name": "columns-promo",
        "instances": [
          '.full-width-background-extend:has(a.btn-inverse[href*="free-claim-check"]) > div > .aem-Grid'
        ]
      },
      {
        "name": "tabs-offices",
        "instances": [
          ".office-listing .right-container"
        ]
      }
    ],
    "sections": [
      {
        "id": "rc1c2",
        "name": "Hero banner with USP strip",
        "selector": [
          ".herobanner",
          ".pagebanner"
        ],
        "style": null,
        "blocks": [
          "hero-banner",
          "cards-usp"
        ],
        "defaultContent": []
      },
      {
        "id": "rc1c3c2",
        "name": "Practice-area quick links",
        "selector": [
          "#serviceTile"
        ],
        "style": "grey",
        "blocks": [
          "cards-icon-tile"
        ],
        "defaultContent": []
      },
      {
        "id": "rc1c3c6",
        "name": "Contact pitch with callback form",
        "selector": [
          ".full-width-background-extend:has(> .customPadding #contact)",
          "#cta",
          "#container-d3e356a43d"
        ],
        "style": "dark",
        "blocks": [
          "columns-contact"
        ],
        "defaultContent": []
      },
      {
        "id": "rc1c3c8",
        "name": "Plaintiff law firm intro with video",
        "selector": [
          "#plaintiff"
        ],
        "style": null,
        "blocks": [
          "columns-video"
        ],
        "defaultContent": [
          "#plaintiff > .customPadding > .aem-Grid > .cmp-text"
        ]
      },
      {
        "id": "rc1c3c9",
        "name": "Class actions stat and recent list",
        "selector": [
          "#classAction"
        ],
        "style": "beige",
        "blocks": [
          "columns-stats"
        ],
        "defaultContent": []
      },
      {
        "id": "rc1c3c10",
        "name": "Client stories",
        "selector": [
          "#clients"
        ],
        "style": null,
        "blocks": [
          "tabs-stories"
        ],
        "defaultContent": [
          "#clients > .customPadding > .aem-Grid > .cmp-text"
        ]
      },
      {
        "id": "rc1c3c11c1",
        "name": "Google reviews",
        "selector": [
          "#fiveStar > .customPadding",
          "#google-review"
        ],
        "style": null,
        "blocks": [
          "widget-reviews"
        ],
        "defaultContent": [
          "#fiveStar > .customPadding .cmp-text > .cmp-text"
        ]
      },
      {
        "id": "rc1c3c11c2",
        "name": "Easy ways to get in touch CTA band",
        "selector": [
          ".AT_placeholder:not(.AT_placeholder ~ .AT_placeholder)",
          "#fiveStar > .customPadding + .AT_placeholder"
        ],
        "style": "grey",
        "blocks": [
          "columns-cta"
        ],
        "defaultContent": []
      },
      {
        "id": "rc1c3c12",
        "name": "Free claim check promo",
        "selector": [
          '.full-width-background-extend:has(a.btn-inverse[href*="free-claim-check"])',
          "#container-45bf1692a1"
        ],
        "style": "dark",
        "blocks": [
          "columns-promo"
        ],
        "defaultContent": []
      },
      {
        "id": "rc1c3c14",
        "name": "Office locator by state",
        "selector": [
          ".cmp-experiencefragment--office-locator-default-master",
          ".office-listing-container"
        ],
        "style": "lavender",
        "blocks": [
          "tabs-offices"
        ],
        "defaultContent": [
          ".office-listing .left-container"
        ]
      },
      {
        "id": "rc1c3c15",
        "name": "Conditions apply disclaimer",
        "selector": [
          '.body-content .aem-Grid > .cmp-text:has(a[href*="/about-us/fees/"] > sup)',
          "#text-4736f6ad8e"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          '.body-content .aem-Grid > .cmp-text:has(a[href*="/about-us/fees/"] > sup)'
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document.querySelectorAll(selector);
        } catch (e) {
          console.warn(`Invalid selector for block "${blockDef.name}": ${selector}`);
        }
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
