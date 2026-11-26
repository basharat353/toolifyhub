#!/usr/bin/env node
/*
 * ToolifyHub static site builder (no dependencies — needs Node.js 16+).
 *
 *   node build/build.js
 *
 * Generates every HTML page, sitemap.xml, robots.txt and js/search-index.js
 * from build/tools-data.js and build/pages.js. The generated site is plain
 * static HTML/CSS/JS and can be hosted anywhere.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { icon } = require('./icons');
const { categories, tools } = require('./tools-data');

/* ======================================================================
 * CONFIG — update these before going live
 * ==================================================================== */
const CONFIG = {
  siteName: 'ToolifyHub',
  tagline: 'Free Online Tools for Everyone',
  // Your live domain, without a trailing slash. Used for canonical URLs, Open Graph and the sitemap.
  siteUrl: 'https://www.example.com',
  // Where the site lives on the domain. "/" for a root domain; "/repo-name/" for GitHub project pages.
  // Only used by 404.html, which can be served from any URL and therefore needs absolute paths.
  basePath: '/',
  contactEmail: 'contact@example.com',
  jurisdiction: 'the country in which ToolifyHub’s operator is based',
  // Set to false to remove all advertisement placeholders from the generated pages.
  showAdPlaceholders: true,
  lastUpdated: '2026-10-18'
};
CONFIG.lastUpdatedHuman = new Date(CONFIG.lastUpdated + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

const OUT = path.resolve(__dirname, '..');
const pages = require('./pages')(CONFIG);
const YEAR = CONFIG.lastUpdated.slice(0, 4);

/* ---------------------------------------------------------------- utils */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const write = (rel, content) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.replace(/[ \t]+$/gm, '') + (content.endsWith('\n') ? '' : '\n'));
  written.push(rel);
};
const written = [];
const hash = (rel) => crypto.createHash('sha1').update(fs.readFileSync(path.join(OUT, rel))).digest('hex').slice(0, 8);
const catOf = (key) => categories.find((c) => c.key === key);
const toolBySlug = (slug) => {
  const t = tools.find((x) => x.slug === slug);
  if (!t) throw new Error('Unknown related tool: ' + slug);
  return t;
};
const toolUrl = (t) => `tools/${t.slug}/`;
const abs = (url) => CONFIG.siteUrl + '/' + url;

// Validate data up front so broken links never reach the output.
(function validate() {
  const titles = new Set(), slugs = new Set();
  tools.forEach((t) => {
    if (slugs.has(t.slug)) throw new Error('Duplicate slug ' + t.slug);
    if (titles.has(t.title)) throw new Error('Duplicate title ' + t.title);
    slugs.add(t.slug); titles.add(t.title);
    if (!catOf(t.cat)) throw new Error('Unknown category for ' + t.slug);
    t.related.forEach(toolBySlug);
    ['name', 'short', 'title', 'description', 'intro', 'ui', 'steps', 'uses', 'faqs'].forEach((k) => {
      if (!t[k] || (Array.isArray(t[k]) && !t[k].length)) throw new Error(`Tool ${t.slug} is missing ${k}`);
    });
    if (t.title.length > 70) console.warn(`  ! Long title (${t.title.length}) for ${t.slug}`);
    if (t.description.length > 165) console.warn(`  ! Long description (${t.description.length}) for ${t.slug}`);
  });
})();

/* ------------------------------------------------------------ templates */
const ASSET_VERSION = {};
['css/style.css', 'js/main.js', 'js/tools.js', 'js/qrcode.js'].forEach((f) => { ASSET_VERSION[f] = hash(f); });

function head(p) {
  const r = p.root;
  const v = (f) => `${r}${f}?v=${ASSET_VERSION[f]}`;
  const canonical = abs(p.url);
  const scripts = [
    `<script src="${r}js/search-index.js?v=${ASSET_VERSION['js/search-index.js']}" defer></script>`,
    `<script src="${v('js/main.js')}" defer></script>`
  ].concat((p.scripts || []).map((s) => `<script src="${v(s)}" defer></script>`));
  const jsonLd = (p.jsonLd || []).map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en" data-root="${r}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${canonical}">
${p.noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta property="og:type" content="website">
<meta property="og:site_name" content="${CONFIG.siteName}">
<meta property="og:title" content="${esc(p.ogTitle || p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(p.ogTitle || p.title)}">
<meta name="twitter:description" content="${esc(p.description)}">
<meta name="theme-color" content="#4f46e5">
<link rel="icon" href="${r}assets/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="${r}site.webmanifest">
<script>(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light'&&t!=='dark')t=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})();</script>
<link rel="stylesheet" href="${v('css/style.css')}">
${scripts.join('\n')}
${jsonLd}
</head>`;
}

const NAV = [
  { key: 'home', label: 'Home', url: '' },
  { key: 'tools', label: 'All Tools', url: 'tools/' },
  { key: 'text', label: 'Text', url: 'tools/#text-tools' },
  { key: 'image', label: 'Image', url: 'tools/#image-tools' },
  { key: 'dev', label: 'Developer', url: 'tools/#developer-tools' },
  { key: 'calc', label: 'Calculators', url: 'tools/#calculators' }
];

function searchBox(id, root, large) {
  return `<form class="search${large ? ' search-lg' : ''}" data-search role="search" action="${root}tools/" method="get">
  <label for="${id}" class="sr-only">Search tools</label>
  ${icon('search', 'search-icon')}
  <input id="${id}" name="q" type="search" placeholder="${large ? 'Search tools — e.g. “compress image” or “word count”' : 'Search tools…'}" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="${id}-results" aria-autocomplete="list">
  <ul id="${id}-results" class="search-results" role="listbox" aria-label="Matching tools" hidden></ul>
</form>`;
}

function header(p) {
  const r = p.root;
  const home = r || './';
  const link = (n) => {
    const href = n.url ? r + n.url : home;
    const current = p.nav === n.key ? ' aria-current="page"' : '';
    return `<li><a href="${href}"${current}>${n.label}</a></li>`;
  };
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="logo" href="${home}" aria-label="${CONFIG.siteName} home"><span class="logo-mark">${icon('logo')}</span><span>Toolify<b>Hub</b></span></a>
    <nav class="main-nav" aria-label="Main">
      <ul>${NAV.map(link).join('')}</ul>
    </nav>
    <div class="header-actions">
      <div class="header-search">${searchBox('header-search', r)}</div>
      <button type="button" class="icon-btn theme-toggle" data-theme-toggle aria-label="Toggle dark mode">${icon('moon', 'i-moon')}${icon('sun', 'i-sun')}</button>
      <button type="button" class="icon-btn menu-toggle" data-menu-toggle aria-expanded="false" aria-controls="mobile-panel" aria-label="Open menu">${icon('menu')}</button>
    </div>
  </div>
  <div class="mobile-panel" id="mobile-panel" hidden>
    <div class="container">
      ${searchBox('mobile-search', r)}
      <nav aria-label="Mobile">
        <ul>${NAV.map(link).join('')}<li><a href="${r}about.html">About</a></li><li><a href="${r}contact.html">Contact</a></li></ul>
      </nav>
    </div>
  </div>
</header>`;
}

function footer(p) {
  const r = p.root;
  const popular = tools.filter((t) => t.popular).slice(0, 6);
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="logo" href="${r || './'}"><span class="logo-mark">${icon('logo')}</span><span>Toolify<b>Hub</b></span></a>
      <p>${CONFIG.tagline}. Fast, free tools that run in your browser — your text and files stay on your device.</p>
    </div>
    <nav aria-labelledby="ft-popular"><h2 class="footer-title" id="ft-popular">Popular tools</h2>
      <ul>${popular.map((t) => `<li><a href="${r}${toolUrl(t)}">${t.name}</a></li>`).join('')}</ul></nav>
    <nav aria-labelledby="ft-cats"><h2 class="footer-title" id="ft-cats">Categories</h2>
      <ul><li><a href="${r}tools/">All tools</a></li>${categories.map((c) => `<li><a href="${r}tools/#${c.slug}">${c.name}</a></li>`).join('')}</ul></nav>
    <nav aria-labelledby="ft-company"><h2 class="footer-title" id="ft-company">Company</h2>
      <ul>
        <li><a href="${r}about.html">About</a></li>
        <li><a href="${r}contact.html">Contact</a></li>
        <li><a href="${r}privacy-policy.html">Privacy Policy</a></li>
        <li><a href="${r}terms.html">Terms of Service</a></li>
        <li><a href="${r}disclaimer.html">Disclaimer</a></li>
      </ul></nav>
  </div>
  <div class="container footer-bottom">
    <p>© ${YEAR} ${CONFIG.siteName}. All rights reserved.</p>
    <p>Tools run locally in your browser. Results are for general information only.</p>
  </div>
</footer>`;
}

function adSlot(variant) {
  if (!CONFIG.showAdPlaceholders) return '';
  return `<!-- Advertisement slot: replace this placeholder with your ad unit code -->
<div class="ad-slot${variant ? ' ad-slot-' + variant : ''}" aria-hidden="true">Advertisement</div>`;
}

function layout(p, mainHtml) {
  return `${head(p)}
<body>
${header(p)}
<main id="main">
${mainHtml}
</main>
${footer(p)}
</body>
</html>
`;
}

function toolCard(t, r, opts = {}) {
  const c = catOf(t.cat);
  const tag = opts.heading || 'h3';
  return `<a class="tool-card ${c.cls}${opts.isNew ? ' has-badge' : ''}" href="${r}${toolUrl(t)}"${opts.filter ? ` data-tool-card="${toolUrl(t)}"` : ''}>
  <span class="tool-icon">${icon(t.icon)}</span>
  <span><${tag}>${t.name}</${tag}><p>${t.short}</p></span>${opts.isNew ? '\n  <span class="badge badge-new">New</span>' : ''}
</a>`;
}

function breadcrumb(r, items) {
  // items: [{name, url}] — last item is the current page (url ignored)
  const html = `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${items.map((it, i) =>
    i === items.length - 1 ? `<li aria-current="page">${esc(it.name)}</li>` : `<li><a href="${it.url === '' ? (r || './') : r + it.url}">${esc(it.name)}</a></li>`).join('')}</ol></nav>`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.url) }))
  };
  return { html, ld };
}

function faqHtml(faqs, headingId) {
  return `<div class="faq">${faqs.map(([q, a]) => `
  <details><summary>${q}</summary><div class="faq-body"><p>${a}</p></div></details>`).join('')}
</div>`;
}

/* --------------------------------------------------------------- search index */
function buildSearchIndex() {
  const data = tools.map((t) => {
    const c = catOf(t.cat);
    return { n: t.name, u: toolUrl(t), c: c.name, d: t.short, k: t.keywords, cls: c.cls, svg: icon(t.icon) };
  });
  write('js/search-index.js', `/* Generated by build/build.js — do not edit by hand. */\nwindow.TOOLIFY_TOOLS=${JSON.stringify(data)};\n`);
  ASSET_VERSION['js/search-index.js'] = hash('js/search-index.js');
}

/* --------------------------------------------------------------- pages */
function buildTool(t) {
  const r = '../../';
  const c = catOf(t.cat);
  const url = toolUrl(t);
  const bc = breadcrumb(r, [{ name: 'Home', url: '' }, { name: 'All Tools', url: 'tools/' }, { name: t.name, url }]);
  const sameCat = tools.filter((x) => x.cat === t.cat);
  const related = t.related.map(toolBySlug);
  const [lead, ...about] = t.intro;
  const sections = [];
  if (about.length) sections.push(`<section><h2>About the ${t.name}</h2>${about.map((p) => `<p>${p}</p>`).join('')}</section>`);
  sections.push(`<section><h2>How to use the ${t.name}</h2><ol class="steps">${t.steps.map((s) => `<li>${s}</li>`).join('')}</ol></section>`);
  sections.push(`<section><h2>Example use cases</h2><ul class="checklist">${t.uses.map((s) => `<li>${s}</li>`).join('')}</ul></section>`);
  (t.extra || []).forEach((x) => sections.push(`<section><h2>${x.h}</h2>${x.html}</section>`));
  sections.push(`<section><h2>Frequently asked questions</h2>${faqHtml(t.faqs)}</section>`);

  const main = `<div class="container">
${bc.html}
<header class="page-hero">
  <a class="badge ${c.cls}" href="${r}tools/#${c.slug}">${icon(c.icon)}${c.name}</a>
  <h1>${t.name}</h1>
  <p class="lead">${lead}</p>
</header>
<div class="page-layout">
  <div class="page-main">
    <section class="tool-panel" aria-label="${esc(t.name)}" data-tool="${t.slug}">
${t.ui.trim()}
    </section>
    <p class="privacy-note">${icon('shield')}Runs in your browser — your ${t.cat === 'image' ? 'images are' : 'data is'} never uploaded or stored.</p>
    ${adSlot()}
    <article class="prose">
      ${sections.join('\n      ')}
    </article>
    <section class="related" aria-labelledby="related-title">
      <h2 id="related-title">Related tools</h2>
      <div class="tool-grid">${related.map((x) => toolCard(x, r)).join('\n')}</div>
    </section>
  </div>
  <aside class="page-aside" aria-label="More ${c.name.toLowerCase()}">
    <div class="side-card">
      <h2>More ${c.name}</h2>
      <ul>${sameCat.map((x) => `<li><a href="${r}${toolUrl(x)}"${x.slug === t.slug ? ' aria-current="page"' : ''}><span class="tool-icon ${c.cls}">${icon(x.icon)}</span>${x.name}</a></li>`).join('')}</ul>
      <p style="margin:12px 0 0"><a class="link-arrow" href="${r}tools/">Browse all ${tools.length} tools ${icon('arrow')}</a></p>
      ${adSlot('side')}
    </div>
  </aside>
</div>
</div>`;

  write(`tools/${t.slug}/index.html`, layout({
    root: r, url, nav: t.cat, title: t.title, description: t.description, ogTitle: t.name + ' – Free Online Tool | ' + CONFIG.siteName,
    scripts: (t.scripts || []).concat(['js/tools.js']), jsonLd: [bc.ld]
  }, main));
}

function buildAllTools() {
  const r = '../';
  const bc = breadcrumb(r, [{ name: 'Home', url: '' }, { name: 'All Tools', url: 'tools/' }]);
  const main = `<div class="container">
${bc.html}
<header class="page-hero">
  <h1>All Free Online Tools</h1>
  <p class="lead">Browse all ${tools.length} ToolifyHub tools for text, images, development and everyday calculations. Every tool is free, needs no sign-up and runs in your browser.</p>
</header>
<div class="filter-bar">
  <div class="search">
    <label for="tool-filter" class="sr-only">Filter tools</label>
    ${icon('search', 'search-icon')}
    <input type="search" id="tool-filter" placeholder="Filter tools by name or task…" autocomplete="off" aria-describedby="filter-status">
  </div>
</div>
<p id="filter-status" class="muted" role="status" aria-live="polite"></p>
${categories.map((c) => {
    const list = tools.filter((t) => t.cat === c.key);
    return `<section class="cat-section" id="${c.slug}" aria-labelledby="h-${c.slug}">
  <h2 id="h-${c.slug}"><span class="tool-icon ${c.cls}">${icon(c.icon)}</span>${c.name}</h2>
  <p class="muted">${c.desc}</p>
  <div class="tool-grid">${list.map((t) => toolCard(t, r, { filter: true })).join('\n')}</div>
</section>`;
  }).join('\n')}
${adSlot()}
<div style="height:24px"></div>
</div>`;
  write('tools/index.html', layout({
    root: r, url: 'tools/', nav: 'tools',
    title: 'All Free Online Tools – Text, Image, Developer & Calculators',
    description: `Browse all ${tools.length} free ToolifyHub tools: word counter, image compressor, JSON formatter, QR code generator, password generator, calculators and more.`,
    jsonLd: [bc.ld]
  }, main));
}

function buildHome() {
  const r = '';
  const popular = tools.filter((t) => t.popular);
  const recent = tools.filter((t) => t.added).sort((a, b) => a.added - b.added).slice(0, 6);
  const features = [
    ['shield', 'cat-other', 'Private by design', 'Every tool runs in your browser. Your text, images and numbers are processed on your device and never uploaded to our servers.'],
    ['gift', 'cat-text', 'Free, no sign-up', 'Use every tool as often as you like. There are no accounts, no trials and no watermarks on your images.'],
    ['zap', 'cat-calc', 'Fast and lightweight', 'Pages are small and load quickly, and results appear instantly — even on slower mobile connections.'],
    ['device', 'cat-dev', 'Works on any device', 'A responsive design that works on phones, tablets, laptops and desktops, in light or dark mode.'],
    ['heart', 'cat-image', 'Accessible to everyone', 'Keyboard-friendly controls, clear labels, readable contrast and support for screen readers.'],
    ['check', 'cat-other', 'Clear, honest results', 'We explain the formulas behind our calculators and are upfront about each tool’s limitations.']
  ];
  const homeFaqs = [
    ['Are ToolifyHub tools really free?', 'Yes. Every tool is free to use without an account, a trial period or usage limits. To help cover running costs, the site may show clearly labelled advertisements, which are kept separate from the tools.'],
    ['Do you upload or store my files and text?', 'No. All 25 tools run entirely in your web browser using JavaScript. Images, documents, text and numbers you enter are processed on your own device and are never sent to our servers.'],
    ['Do I need to install anything?', 'No. ToolifyHub works in any modern browser, such as Chrome, Edge, Firefox or Safari, on Windows, macOS, Linux, Android and iOS.'],
    ['Do the tools work on my phone?', 'Yes. Every page is designed to work on small screens, and the image tools can use photos from your phone’s gallery or camera roll.'],
    ['Can I use the tools offline?', 'Once a tool page has loaded, most tools keep working without an internet connection, because all the processing happens on your device.'],
    ['Can I suggest a new tool?', 'Absolutely. We add tools based on what people need. Send your idea through our contact page.']
  ];
  const ldSite = { '@context': 'https://schema.org', '@type': 'WebSite', name: CONFIG.siteName, url: CONFIG.siteUrl + '/', description: CONFIG.tagline };
  const main = `<section class="hero">
  <div class="container">
    <h1>Free Online Tools to <span class="grad">Make Your Life Easier</span></h1>
    <p class="lead">ToolifyHub brings together ${tools.length} fast, free tools for text, images, development and everyday calculations. No sign-up, no downloads — and your files are processed right in your browser.</p>
    ${searchBox('hero-search', r, true)}
    <div class="hero-chips" aria-label="Popular searches">
      ${popular.slice(0, 6).map((t) => `<a class="chip" href="${toolUrl(t)}">${t.name}</a>`).join('\n      ')}
    </div>
    <ul class="hero-points">
      <li>${icon('check')}100% free</li><li>${icon('check')}No account needed</li><li>${icon('check')}Files stay on your device</li><li>${icon('check')}Works on mobile</li>
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="popular-title">
  <div class="container">
    <div class="section-head">
      <div><h2 id="popular-title">Popular tools</h2><p>The tools people reach for most often.</p></div>
      <a class="link-arrow" href="tools/">View all tools ${icon('arrow')}</a>
    </div>
    <div class="tool-grid">${popular.map((t) => toolCard(t, r)).join('\n')}</div>
  </div>
</section>

<div class="container">${adSlot()}</div>

<section class="section section-alt" aria-labelledby="cat-title">
  <div class="container">
    <div class="section-head"><div><h2 id="cat-title">Browse by category</h2><p>Find the right tool for the job.</p></div></div>
    <div class="cat-grid">
      ${categories.map((c) => {
    const list = tools.filter((t) => t.cat === c.key);
    return `<div class="cat-card ${c.cls}">
        <span class="tool-icon">${icon(c.icon)}</span>
        <h3><a href="tools/#${c.slug}" style="color:inherit;text-decoration:none">${c.name}</a></h3>
        <p>${c.desc}</p>
        <ul style="list-style:none;margin:4px 0 0;padding:0;display:grid;gap:4px;font-size:.9rem">${list.map((t) => `<li><a href="${toolUrl(t)}">${t.name}</a></li>`).join('')}</ul>
        <a class="count" href="tools/#${c.slug}" aria-label="View all ${list.length} ${c.name.toLowerCase()}">${list.length} tools →</a>
      </div>`;
  }).join('\n      ')}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="recent-title">
  <div class="container">
    <div class="section-head"><div><h2 id="recent-title">Recently added</h2><p>The newest tools on ToolifyHub.</p></div></div>
    <div class="tool-grid">${recent.map((t) => toolCard(t, r, { isNew: true })).join('\n')}</div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="why-title">
  <div class="container">
    <div class="section-head"><div><h2 id="why-title">Why choose ToolifyHub?</h2><p>Simple tools, built with care.</p></div></div>
    <div class="feature-grid">
      ${features.map(([ic, cls, h, p]) => `<div class="feature ${cls}"><span class="tool-icon">${icon(ic)}</span><h3>${h}</h3><p>${p}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="faq-title">
  <div class="container">
    <div class="section-head"><div><h2 id="faq-title">Frequently asked questions</h2></div></div>
    ${faqHtml(homeFaqs)}
  </div>
</section>`;
  write('index.html', layout({
    root: r, url: '', nav: 'home',
    title: 'ToolifyHub – Free Online Tools for Everyone',
    ogTitle: 'ToolifyHub – Free Online Tools for Everyone',
    description: `Free online tools that run in your browser: word counter, image compressor, JSON formatter, QR code and password generators, calculators and more. No sign-up.`,
    jsonLd: [ldSite]
  }, main));
}

function buildStatic(key, file) {
  const pg = pages[key];
  const r = '';
  const bc = breadcrumb(r, [{ name: 'Home', url: '' }, { name: pg.h1, url: file }]);
  const main = `<div class="container content-page">
${bc.html}
<header class="page-hero"><h1>${pg.h1}</h1><p class="lead">${pg.lead}</p></header>
<div class="prose">
${pg.body.trim()}
</div>
</div>`;
  write(file, layout({ root: r, url: file, nav: key, title: pg.title, description: pg.description, jsonLd: [bc.ld] }, main));
}

function build404() {
  const b = CONFIG.basePath;
  const p = {
    root: b, url: '404.html', nav: '', noindex: true,
    title: 'Page Not Found (404) – ToolifyHub',
    description: 'The page you were looking for could not be found. Search or browse ToolifyHub’s free online tools.'
  };
  const popular = tools.filter((t) => t.popular).slice(0, 4);
  const main = `<div class="container not-found">
  <p class="code" aria-hidden="true">404</p>
  <h1>Page not found</h1>
  <p class="muted">Sorry, we couldn’t find that page. It may have moved, or the link may be mistyped.</p>
  <div style="max-width:560px;margin:24px auto">${searchBox('nf-search', b, true)}</div>
  <div class="btn-row" style="justify-content:center"><a class="btn btn-primary" href="${b}">${icon('home')}Go to homepage</a><a class="btn btn-secondary" href="${b}tools/">${icon('grid')}Browse all tools</a></div>
  <div class="tool-grid" style="margin-top:32px;text-align:left">${popular.map((t) => toolCard(t, b)).join('\n')}</div>
</div>`;
  let html = layout(p, main);
  // 404 pages can be served at any path, so the canonical tag is dropped.
  html = html.replace(/<link rel="canonical"[^>]*>\n/, '').replace(/<meta property="og:url"[^>]*>\n/, '');
  write('404.html', html);
}

function buildMeta() {
  const urls = [''].concat(['tools/'], tools.map(toolUrl), ['about.html', 'contact.html', 'privacy-policy.html', 'terms.html', 'disclaimer.html']);
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${abs(u)}</loc><lastmod>${CONFIG.lastUpdated}</lastmod></url>`).join('\n')}
</urlset>
`);
  write('robots.txt', `User-agent: *
Allow: /

Sitemap: ${abs('sitemap.xml')}
`);
  write('site.webmanifest', JSON.stringify({
    name: CONFIG.siteName, short_name: CONFIG.siteName, description: CONFIG.tagline,
    start_url: CONFIG.basePath, display: 'standalone', background_color: '#f6f7fb', theme_color: '#4f46e5',
    icons: [{ src: 'assets/favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
  }, null, 2) + '\n');
}

/* --------------------------------------------------------------- run */
buildSearchIndex();
buildHome();
buildAllTools();
tools.forEach(buildTool);
buildStatic('about', 'about.html');
buildStatic('contact', 'contact.html');
buildStatic('privacy', 'privacy-policy.html');
buildStatic('terms', 'terms.html');
buildStatic('disclaimer', 'disclaimer.html');
build404();
buildMeta();
console.log(`Built ${written.length} files (${tools.length} tools) into ${OUT}`);
