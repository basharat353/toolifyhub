/*!
 * ToolifyHub — shared site script
 * Theme toggle, mobile menu, tool search, All Tools filter and shared helpers
 * (copy, download, toast) used by js/tools.js. No external dependencies.
 */
(function () {
  'use strict';

  var doc = document.documentElement;
  var ROOT = doc.getAttribute('data-root') || '';
  var TOOLS = window.TOOLIFY_TOOLS || [];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------------ *
   * Shared helpers (exposed as window.Toolify)
   * ------------------------------------------------------------------ */
  var toastRegion;
  function toast(message, type) {
    if (!toastRegion) {
      toastRegion = document.createElement('div');
      toastRegion.className = 'toast-region';
      toastRegion.setAttribute('role', 'status');
      toastRegion.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastRegion);
    }
    var el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' is-error' : '');
    el.textContent = message;
    toastRegion.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
  }

  function flashButton(btn, label) {
    if (!btn) return;
    if (!btn.dataset.label) btn.dataset.label = btn.innerHTML;
    btn.textContent = label;
    clearTimeout(btn._flashTimer);
    btn._flashTimer = setTimeout(function () { btn.innerHTML = btn.dataset.label; }, 1600);
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function copy(text, btn) {
    if (text == null || String(text) === '') {
      toast('Nothing to copy yet.', 'error');
      return Promise.resolve(false);
    }
    text = String(text);
    var done = function (ok) {
      if (ok) { flashButton(btn, 'Copied!'); toast('Copied to clipboard'); }
      else toast('Copy failed. Select the text and press Ctrl+C / Cmd+C.', 'error');
      return ok;
    };
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return done(true); }, function () { return done(legacyCopy(text)); });
    }
    return Promise.resolve(done(legacyCopy(text)));
  }

  function download(data, filename, mime) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function formatBytes(bytes) {
    if (!isFinite(bytes)) return '–';
    if (bytes < 1024) return bytes + ' B';
    var units = ['KB', 'MB', 'GB'];
    var i = -1;
    do { bytes /= 1024; i++; } while (bytes >= 1024 && i < units.length - 1);
    return (bytes >= 100 ? bytes.toFixed(0) : bytes.toFixed(bytes >= 10 ? 1 : 2)) + ' ' + units[i];
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  window.Toolify = { copy: copy, download: download, toast: toast, formatBytes: formatBytes, escapeHtml: escapeHtml, flashButton: flashButton, root: ROOT };

  /* ------------------------------------------------------------------ *
   * Theme toggle (preference stored in localStorage under "theme")
   * ------------------------------------------------------------------ */
  function currentTheme() { return doc.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function syncThemeButtons() {
    var dark = currentTheme() === 'dark';
    $$('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', dark ? 'Light mode' : 'Dark mode');
    });
  }
  $$('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      doc.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
      syncThemeButtons();
    });
  });
  syncThemeButtons();

  /* ------------------------------------------------------------------ *
   * Mobile menu
   * ------------------------------------------------------------------ */
  var menuBtn = $('[data-menu-toggle]');
  var panel = $('#mobile-panel');
  if (menuBtn && panel) {
    var setMenu = function (open) {
      panel.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menuBtn.addEventListener('click', function () {
      var open = panel.hidden;
      setMenu(open);
      if (open) { var input = $('input', panel); if (input) input.focus(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { setMenu(false); menuBtn.focus(); }
    });
  }

  /* ------------------------------------------------------------------ *
   * Tool search
   * ------------------------------------------------------------------ */
  function normalize(s) { return String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim(); }

  function scoreTool(tool, q, tokens) {
    var name = normalize(tool.n);
    var hay = normalize(tool.n + ' ' + tool.k + ' ' + tool.c + ' ' + tool.d);
    var score = 0;
    if (name === q) score += 200;
    if (name.indexOf(q) === 0) score += 80;
    else if (name.indexOf(q) > -1) score += 50;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (name.indexOf(t) > -1) score += 20;
      else if (normalize(tool.k).indexOf(t) > -1) score += 10;
      else if (hay.indexOf(t) > -1) score += 4;
      else return 0; // every word must match somewhere
    }
    return score;
  }

  function searchTools(query, limit) {
    var q = normalize(query);
    if (!q) return [];
    var tokens = q.split(/\s+/).filter(Boolean);
    return TOOLS.map(function (t) { return { tool: t, score: scoreTool(t, q, tokens) }; })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, limit || 8)
      .map(function (r) { return r.tool; });
  }
  window.Toolify.searchTools = searchTools;

  function initSearch(box) {
    var input = $('input', box);
    var list = $('.search-results', box);
    if (!input || !list) return;
    var active = -1;
    var results = [];

    function close() {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    }
    function setActive(i) {
      var items = $$('li[role="option"]', list);
      items.forEach(function (li, idx) { li.setAttribute('aria-selected', String(idx === i)); });
      active = i;
      if (items[i]) {
        input.setAttribute('aria-activedescendant', items[i].id);
        items[i].scrollIntoView({ block: 'nearest' });
      }
    }
    function render() {
      var q = input.value;
      if (!q.trim()) { close(); return; }
      results = searchTools(q, 8);
      list.innerHTML = '';
      if (!results.length) {
        var empty = document.createElement('li');
        empty.className = 'search-empty';
        empty.innerHTML = 'No tools match “' + escapeHtml(q.trim()) + '”. <a href="' + ROOT + 'tools/">Browse all tools</a>';
        list.appendChild(empty);
      } else {
        results.forEach(function (t, i) {
          var li = document.createElement('li');
          li.setAttribute('role', 'option');
          li.id = list.id + '-opt-' + i;
          li.setAttribute('aria-selected', 'false');
          li.innerHTML = '<a href="' + ROOT + t.u + '" tabindex="-1"><span class="tool-icon ' + t.cls + '">' + t.svg + '</span><span>' +
            escapeHtml(t.n) + '<small>' + escapeHtml(t.c) + '</small></span></a>';
          list.appendChild(li);
        });
      }
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      active = -1;
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', function () { if (input.value.trim()) render(); });
    input.addEventListener('keydown', function (e) {
      var count = results.length;
      if (e.key === 'ArrowDown' && count) { e.preventDefault(); if (list.hidden) render(); setActive((active + 1) % count); }
      else if (e.key === 'ArrowUp' && count) { e.preventDefault(); setActive(active <= 0 ? count - 1 : active - 1); }
      else if (e.key === 'Enter') {
        if (active > -1 && results[active]) { e.preventDefault(); window.location.href = ROOT + results[active].u; }
        else if (results.length === 1) { e.preventDefault(); window.location.href = ROOT + results[0].u; }
        // otherwise let the form submit to the All Tools page (?q=...)
      } else if (e.key === 'Escape') { if (!list.hidden) { e.stopPropagation(); close(); } }
    });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
  }
  $$('[data-search]').forEach(initSearch);

  /* ------------------------------------------------------------------ *
   * All Tools page filter (?q= support)
   * ------------------------------------------------------------------ */
  var filterInput = $('#tool-filter');
  if (filterInput) {
    var cards = $$('[data-tool-card]');
    var sections = $$('.cat-section');
    var status = $('#filter-status');
    var applyFilter = function () {
      var q = filterInput.value.trim();
      var matches = q ? searchTools(q, 100).map(function (t) { return t.u; }) : null;
      var shown = 0;
      cards.forEach(function (card) {
        var visible = !matches || matches.indexOf(card.getAttribute('data-tool-card')) > -1;
        card.hidden = !visible;
        if (visible) shown++;
      });
      sections.forEach(function (sec) { sec.hidden = !$$('[data-tool-card]:not([hidden])', sec).length; });
      if (status) status.textContent = q ? (shown ? shown + ' tool' + (shown === 1 ? '' : 's') + ' found for “' + q + '”.' : 'No tools found for “' + q + '”. Try a different word, such as “image” or “count”.') : '';
    };
    try {
      var initial = new URLSearchParams(window.location.search).get('q');
      if (initial) filterInput.value = initial;
    } catch (e) { /* ignore */ }
    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  /* ------------------------------------------------------------------ *
   * Contact page: compose an email in the visitor's own mail app
   * ------------------------------------------------------------------ */
  var contactForm = $('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#cf-name').value.trim(), msg = $('#cf-message').value.trim(), err = $('#cf-error');
      if (!name || !msg) {
        err.textContent = 'Please enter your name and a message.';
        err.hidden = false;
        (name ? $('#cf-message') : $('#cf-name')).focus();
        return;
      }
      err.hidden = true;
      var subject = 'ToolifyHub: ' + $('#cf-topic').value;
      var body = msg + '\n\n— ' + name;
      window.location.href = 'mailto:' + contactForm.getAttribute('data-email') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
})();
