/*!
 * ToolifyHub — tool implementations
 * Each tool page contains one element with [data-tool="slug"]; the matching
 * initialiser below wires up the interface. All processing happens in the
 * browser: nothing typed or uploaded is sent to a server or stored.
 *
 * Pure logic lives in `Core` so it can be unit-tested in Node
 * (require('./js/tools.js') returns Core).
 */
(function () {
  'use strict';

  /* ==================================================================== *
   * Core (pure functions, no DOM)
   * ==================================================================== */
  var Core = {};

  var segmenter = null;
  try { if (typeof Intl !== 'undefined' && Intl.Segmenter) segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' }); } catch (e) { segmenter = null; }

  /** Split a string into user-perceived characters (emoji and accents count as one). */
  Core.graphemes = function (str) {
    if (!str) return [];
    if (segmenter) { var out = []; for (var s of segmenter.segment(str)) out.push(s.segment); return out; }
    return Array.from(str);
  };

  var WORD_RE = /[\p{L}\p{M}\p{N}]+(?:['’.\-_][\p{L}\p{M}\p{N}]+)*/gu;
  Core.words = function (text) { return text.match(WORD_RE) || []; };
  Core.countWords = function (text) { return Core.words(text).length; };
  Core.countSentences = function (text) {
    return text.split(/[.!?…。！？]+(?=\s|$|["'”’)\]])/u).filter(function (s) { return /[\p{L}\p{N}]/u.test(s); }).length;
  };
  Core.countParagraphs = function (text) {
    return text.split(/\n\s*\n/).filter(function (p) { return p.trim().length; }).length;
  };

  Core.textStats = function (text) {
    var words = Core.countWords(text);
    return {
      words: words,
      chars: Core.graphemes(text).length,
      charsNoSpaces: Core.graphemes(text.replace(/\s+/g, '')).length,
      sentences: Core.countSentences(text),
      paragraphs: Core.countParagraphs(text),
      readingSeconds: Math.round(words / 238 * 60),
      speakingSeconds: Math.round(words / 130 * 60)
    };
  };

  Core.formatDuration = function (sec) {
    if (!sec) return '0 sec';
    if (sec < 60) return sec + ' sec';
    var m = Math.floor(sec / 60), s = sec % 60;
    if (m >= 60) { var h = Math.floor(m / 60); m = m % 60; return h + ' hr ' + m + ' min'; }
    return m + ' min' + (s ? ' ' + s + ' sec' : '');
  };

  Core.charStats = function (text) {
    var g = Core.graphemes(text);
    var r = { chars: g.length, noSpaces: 0, letters: 0, digits: 0, spaces: 0, symbols: 0, lines: 0, bytes: 0 };
    for (var i = 0; i < g.length; i++) {
      var c = g[i];
      if (/^\s+$/.test(c)) r.spaces++;
      else {
        r.noSpaces++;
        if (/\p{L}/u.test(c)) r.letters++;
        else if (/\p{N}/u.test(c)) r.digits++;
        else r.symbols++;
      }
    }
    r.lines = text.length ? text.split(/\r\n|\r|\n/).length : 0;
    r.bytes = typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(text).length : unescape(encodeURIComponent(text)).length;
    return r;
  };

  /* ---- Case conversion ---- */
  var MINOR_WORDS = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'nor', 'of', 'on', 'or', 'over', 'per', 'the', 'to', 'up', 'via', 'vs', 'with'];
  function capFirst(w) { var g = Core.graphemes(w); return g.length ? g[0].toUpperCase() + g.slice(1).join('') : w; }
  function splitIdentWords(line) {
    return line
      .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
      .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean);
  }
  function perLine(text, fn) { return text.split('\n').map(fn).join('\n'); }

  Core.convertCase = function (text, mode) {
    switch (mode) {
      case 'upper': return text.toUpperCase();
      case 'lower': return text.toLowerCase();
      case 'title':
        return perLine(text.toLowerCase(), function (line) {
          var re = /[\p{L}\p{N}][\p{L}\p{M}\p{N}'’]*/gu, m, list = [];
          while ((m = re.exec(line))) list.push({ i: m.index, w: m[0] });
          var out = line;
          for (var k = list.length - 1; k >= 0; k--) {
            var item = list[k];
            var keepLower = k !== 0 && k !== list.length - 1 && MINOR_WORDS.indexOf(item.w) > -1;
            if (!keepLower) out = out.slice(0, item.i) + capFirst(item.w) + out.slice(item.i + item.w.length);
          }
          return out;
        });
      case 'sentence':
        return text.toLowerCase()
          .replace(/(^\s*|[.!?…]\s+|\n\s*)(\p{L})/gu, function (m, p, l) { return p + l.toUpperCase(); })
          .replace(/(^|[^\p{L}\p{N}])i(?=$|[^\p{L}\p{N}])/gu, '$1I')
          .replace(/(^|[^\p{L}\p{N}])i(?=['’](m|ve|ll|d)\b)/gu, '$1I');
      case 'camel':
        return perLine(text, function (l) { return splitIdentWords(l).map(function (w, i) { w = w.toLowerCase(); return i ? capFirst(w) : w; }).join(''); });
      case 'pascal':
        return perLine(text, function (l) { return splitIdentWords(l).map(function (w) { return capFirst(w.toLowerCase()); }).join(''); });
      case 'snake':
        return perLine(text, function (l) { return splitIdentWords(l).map(function (w) { return w.toLowerCase(); }).join('_'); });
      case 'constant':
        return perLine(text, function (l) { return splitIdentWords(l).map(function (w) { return w.toUpperCase(); }).join('_'); });
      case 'kebab':
        return perLine(text, function (l) { return splitIdentWords(l).map(function (w) { return w.toLowerCase(); }).join('-'); });
      case 'alternating':
        var n = 0;
        return Core.graphemes(text).map(function (c) {
          if (c.toLowerCase() === c.toUpperCase()) return c;
          return (n++ % 2 === 0) ? c.toLowerCase() : c.toUpperCase();
        }).join('');
      case 'inverse':
        return Core.graphemes(text).map(function (c) {
          var u = c.toUpperCase(); return c === u ? c.toLowerCase() : u;
        }).join('');
      default: return text;
    }
  };

  /* ---- Whitespace cleaning ---- */
  Core.cleanSpaces = function (text, o) {
    var t = text.replace(/\r\n?/g, '\n');
    if (o.nbsp) t = t.replace(/[   -   　]/g, ' ').replace(/[​-‍⁠﻿]/g, '');
    if (o.tabs) t = t.replace(/\t/g, ' ');
    if (o.collapse) t = t.replace(/[ \t]{2,}/g, ' ');
    var lines = t.split('\n');
    if (o.trim) lines = lines.map(function (l) { return l.replace(/^[ \t]+|[ \t]+$/g, ''); });
    if (o.removeEmpty) {
      lines = lines.filter(function (l) { return l.trim() !== ''; });
    } else if (o.collapseEmpty) {
      var res = [];
      lines.forEach(function (l) {
        var blank = l.trim() === '';
        if (blank && (res.length === 0 || res[res.length - 1].trim() === '')) return;
        res.push(blank ? '' : l);
      });
      while (res.length && res[res.length - 1] === '') res.pop();
      lines = res;
    }
    if (o.join) {
      t = lines.filter(function (l) { return l.trim() !== ''; }).join(' ');
      if (o.collapse) t = t.replace(/[ \t]{2,}/g, ' ');
    } else t = lines.join('\n');
    if (o.trim) t = t.trim();
    return t;
  };

  /* ---- Reversing ---- */
  Core.reverseText = function (text, mode) {
    switch (mode) {
      case 'words':
        return perLine(text, function (l) {
          var lead = l.match(/^\s*/)[0], trail = l.match(/\s*$/)[0];
          var core = l.trim();
          if (!core) return l;
          return lead + core.split(/(\s+)/).reverse().join('') + trail;
        });
      case 'each': return text.replace(/\S+/g, function (w) { return Core.graphemes(w).reverse().join(''); });
      case 'lines': return text.split('\n').reverse().join('\n');
      default: return Core.graphemes(text).reverse().join('');
    }
  };

  /* ---- Lorem ipsum ---- */
  var LOREM_WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum pellentesque habitant morbi tristique senectus netus malesuada fames ac turpis egestas integer vitae justo eget magna fermentum iaculis eu facilisis volutpat blandit cursus risus at ultrices mi tempus imperdiet nunc porta nibh venenatis condimentum vel pharetra mauris augue neque gravida').split(' ');
  var LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';

  Core.lorem = function (count, unit, classic, rand) {
    rand = rand || Math.random;
    var pick = function () { return LOREM_WORDS[Math.floor(rand() * LOREM_WORDS.length)]; };
    var between = function (a, b) { return a + Math.floor(rand() * (b - a + 1)); };
    var sentence = function () {
      var n = between(7, 15), w = [];
      for (var i = 0; i < n; i++) w.push(pick());
      if (n > 9 && rand() < 0.5) w[between(3, n - 4)] += ',';
      return capFirst(w.join(' ')) + '.';
    };
    var paragraph = function () { var s = []; for (var i = between(4, 7); i > 0; i--) s.push(sentence()); return s.join(' '); };
    var items = [], i;
    if (unit === 'words') {
      var w = [];
      if (classic) w = LOREM_START.replace(',', '').toLowerCase().split(' ').slice(0, count);
      while (w.length < count) w.push(pick());
      var str = w.join(' ');
      return [capFirst(str) + '.'];
    }
    if (unit === 'sentences') {
      for (i = 0; i < count; i++) items.push(sentence());
      if (classic) items[0] = LOREM_START + '.';
      return [items.join(' ')];
    }
    for (i = 0; i < count; i++) items.push(paragraph());
    if (classic) items[0] = LOREM_START + ', ' + items[0].charAt(0).toLowerCase() + items[0].slice(1);
    return items;
  };

  /* ---- JSON ---- */
  Core.parseJSON = function (text) {
    try { return { ok: true, value: JSON.parse(text) }; }
    catch (e) {
      var msg = String(e.message || e);
      var line = null, col = null, m;
      if ((m = msg.match(/line (\d+) column (\d+)/i))) { line = +m[1]; col = +m[2]; }
      else if ((m = msg.match(/position (\d+)/i))) {
        var pos = +m[1], before = text.slice(0, pos).split('\n');
        line = before.length; col = before[before.length - 1].length + 1;
      }
      msg = msg.replace(/^JSON\.parse:\s*/i, '').replace(/^JSON Parse error:\s*/i, '');
      return { ok: false, message: msg, line: line, col: col };
    }
  };
  Core.sortKeys = function sortKeys(v) {
    if (Array.isArray(v)) return v.map(sortKeys);
    if (v && typeof v === 'object') {
      var o = {};
      Object.keys(v).sort().forEach(function (k) { o[k] = sortKeys(v[k]); });
      return o;
    }
    return v;
  };
  Core.jsonSummary = function (v) {
    var counts = { objects: 0, arrays: 0, keys: 0, depth: 0 };
    (function walk(x, d) {
      counts.depth = Math.max(counts.depth, d);
      if (Array.isArray(x)) { counts.arrays++; x.forEach(function (y) { walk(y, d + 1); }); }
      else if (x && typeof x === 'object') { counts.objects++; var k = Object.keys(x); counts.keys += k.length; k.forEach(function (key) { walk(x[key], d + 1); }); }
    })(v, 0);
    return counts;
  };

  /* ---- HTML entities ---- */
  Core.htmlEncode = function (str, nonAscii) {
    var out = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    if (nonAscii) {
      var res = '';
      for (var ch of out) { var cp = ch.codePointAt(0); res += cp > 126 ? '&#' + cp + ';' : ch; }
      out = res;
    }
    return out;
  };
  var BASIC_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', reg: '®', trade: '™', hellip: '…', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', euro: '€', pound: '£', yen: '¥', cent: '¢', deg: '°', times: '×', divide: '÷', middot: '·', bull: '•', laquo: '«', raquo: '»', sect: '§', para: '¶' };
  /**
   * Decode HTML entities. `namedLookup` (optional) resolves named entities the
   * small built-in table doesn't know (the browser version uses an inert DOMParser).
   */
  Core.htmlDecode = function (str, namedLookup) {
    return str.replace(/&(#[0-9]+|#[xX][0-9a-fA-F]+|[A-Za-z][A-Za-z0-9]*);/g, function (m, body) {
      if (body[0] === '#') {
        var cp = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
        if (!isFinite(cp) || cp <= 0 || cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) return '�';
        return String.fromCodePoint(cp);
      }
      if (Object.prototype.hasOwnProperty.call(BASIC_ENTITIES, body)) return BASIC_ENTITIES[body];
      var r = namedLookup ? namedLookup(m) : null;
      return r == null ? m : r;
    });
  };

  /* ---- CSS minifier ---- */
  Core.minifyCSS = function (css, keepImportant) {
    var saved = [], out = '', i = 0, n = css.length;
    var hold = function (s) { saved.push(s); return '' + (saved.length - 1) + ''; };
    while (i < n) {
      var c = css[i];
      if (c === '/' && css[i + 1] === '*') {
        var end = css.indexOf('*/', i + 2);
        if (end === -1) throw new Error('Unclosed comment: a "/*" was opened but never closed with "*/".');
        var comment = css.slice(i, end + 2);
        out += (keepImportant && comment.charAt(2) === '!') ? hold(comment + '\n') : ' ';
        i = end + 2;
        continue;
      }
      if (c === '"' || c === "'") {
        var j = i + 1;
        while (j < n && css[j] !== c) {
          if (css[j] === '\\') j++;
          else if (css[j] === '\n') throw new Error('Unclosed string starting near: ' + css.slice(i, i + 30));
          j++;
        }
        if (j >= n) throw new Error('Unclosed string starting near: ' + css.slice(i, i + 30));
        out += hold(css.slice(i, j + 1));
        i = j + 1;
        continue;
      }
      out += c;
      i++;
    }
    out = out
      .replace(/\s+/g, ' ')
      .replace(/\s*([{};,>~])\s*/g, '$1')
      .replace(/:\s+/g, ':')
      .replace(/([{;][-\w]+) :/g, '$1:') // "color : red" inside a declaration block
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/;+}/g, '}')
      .replace(/;{2,}/g, ';')
      .replace(/(^|[{}])[^{}@]+\{\}/g, '$1') // drop empty rules
      .trim();
    return out.replace(/(\d+)/g, function (m, k) { return saved[+k]; });
  };

  /* ---- JavaScript minifier (whitespace + comments, no renaming) ---- */
  var JS_PUNCT = ['>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=',
    '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '**', '<<', '>>'];
  var REGEX_AFTER_WORD = { 'return': 1, 'typeof': 1, 'instanceof': 1, 'in': 1, 'of': 1, 'new': 1, 'delete': 1, 'void': 1, 'throw': 1, 'case': 1, 'do': 1, 'else': 1, 'yield': 1, 'await': 1 };
  var RESTRICTED = { 'return': 1, 'break': 1, 'continue': 1, 'throw': 1, 'yield': 1, 'async': 1, 'let': 1 };
  var DROP_NL_AFTER = '{([,;:=?&|^!~*%<>+-/';
  var DROP_NL_BEFORE = '})],;:.?=&|^*%<>/([+-';
  function isIdChar(ch) { return !!ch && /[\w$\\\u0080-￿]/.test(ch); }
  function isNL(ch) { return ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029'; }

  Core.tokenizeJS = function (src, keepLicense) {
    var tokens = [], i = 0, n = src.length, nl = false, ws = false;
    var NUM_RE = /(?:0[xXoObB][\da-fA-F_]+n?|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?n?)/y;
    var ID_RE = /[A-Za-z_$#\\\u0080-￿][\w$\\\u0080-￿]*/y;
    function push(t, v) { tokens.push({ t: t, v: v, nl: nl, ws: ws || nl }); nl = false; ws = false; }
    function lineOf(pos) { return src.slice(0, pos).split('\n').length; }
    function fail(msg, pos) { var e = new Error(msg + ' (line ' + lineOf(pos) + ')'); e.line = lineOf(pos); throw e; }
    function regexAllowed() {
      var p = tokens[tokens.length - 1];
      if (!p || p.t === 'comment') return true;
      if (p.t === 'id') return !!REGEX_AFTER_WORD[p.v];
      if (p.t === 'punc') return !(p.v === ')' || p.v === ']' || p.v === '}' || p.v === '++' || p.v === '--');
      return false;
    }
    function skipString(j, q) {
      j++;
      while (j < n) {
        var d = src[j];
        if (d === '\\') { j += 2; continue; }
        if (d === q) return j + 1;
        if (isNL(d)) break;
        j++;
      }
      return fail('Unterminated string', j);
    }
    function skipTemplate(j) {
      var start = j;
      j++;
      while (j < n) {
        var d = src[j];
        if (d === '\\') { j += 2; continue; }
        if (d === '`') return j + 1;
        if (d === '$' && src[j + 1] === '{') {
          j += 2;
          var depth = 1;
          while (j < n && depth) {
            var e = src[j];
            if (e === '"' || e === "'") { j = skipString(j, e); continue; }
            if (e === '`') { j = skipTemplate(j); continue; }
            if (e === '/' && src[j + 1] === '/') { while (j < n && !isNL(src[j])) j++; continue; }
            if (e === '/' && src[j + 1] === '*') { var ce = src.indexOf('*/', j + 2); if (ce < 0) fail('Unterminated comment', j); j = ce + 2; continue; }
            if (e === '{') depth++;
            else if (e === '}') depth--;
            j++;
          }
          continue;
        }
        j++;
      }
      return fail('Unterminated template literal', start);
    }

    if (src.slice(0, 2) === '#!') {
      var hb = 0; while (hb < n && !isNL(src[hb])) hb++;
      push('hashbang', src.slice(0, hb)); i = hb;
    }
    while (i < n) {
      var c = src[i];
      if (isNL(c)) { nl = true; i++; continue; }
      if (/\s/.test(c)) { ws = true; i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < n && !isNL(src[i])) i++; continue; }
      if (c === '/' && src[i + 1] === '*') {
        var end = src.indexOf('*/', i + 2);
        if (end < 0) fail('Unterminated comment', i);
        var body = src.slice(i, end + 2);
        if (keepLicense && body.charAt(2) === '!') { push('comment', body); nl = true; }
        else if (/[\n\r\u2028\u2029]/.test(body)) nl = true;
        else ws = true;
        i = end + 2;
        continue;
      }
      if (c === '"' || c === "'") { var sj = skipString(i, c); push('str', src.slice(i, sj)); i = sj; continue; }
      if (c === '`') { var tj = skipTemplate(i); push('tpl', src.slice(i, tj)); i = tj; continue; }
      if (c === '/' && regexAllowed()) {
        var j = i + 1, inClass = false;
        while (j < n) {
          var d = src[j];
          if (d === '\\') { j += 2; continue; }
          if (isNL(d)) fail('Unterminated regular expression', i);
          if (inClass) { if (d === ']') inClass = false; }
          else if (d === '[') inClass = true;
          else if (d === '/') break;
          j++;
        }
        if (j >= n) fail('Unterminated regular expression', i);
        j++;
        while (j < n && /[a-z]/i.test(src[j])) j++;
        push('re', src.slice(i, j)); i = j;
        continue;
      }
      if (/\d/.test(c) || (c === '.' && /\d/.test(src[i + 1]))) {
        NUM_RE.lastIndex = i;
        var nm = NUM_RE.exec(src);
        push('num', nm[0]); i += nm[0].length;
        continue;
      }
      if (isIdChar(c) || c === '#') {
        ID_RE.lastIndex = i;
        var im = ID_RE.exec(src);
        if (im && im[0].length) { push('id', im[0]); i += im[0].length; continue; }
      }
      var p = null;
      for (var k = 0; k < JS_PUNCT.length; k++) {
        if (src.startsWith(JS_PUNCT[k], i)) { p = JS_PUNCT[k]; break; }
      }
      if (p === '?.' && /\d/.test(src[i + 2])) p = '?';
      if (!p) p = c;
      push('punc', p); i += p.length;
    }
    return tokens;
  };

  Core.minifyJS = function (src, keepLicense) {
    var tokens = Core.tokenizeJS(src, keepLicense);
    var out = '', prev = null;
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      if (prev) {
        var a = prev.v.charAt(prev.v.length - 1), b = tok.v.charAt(0);
        if (prev.t === 'hashbang' || prev.t === 'comment' || tok.t === 'comment') out += '\n';
        else if (tok.nl && keepNewline(prev, tok, a, b)) out += '\n';
        else if (tok.ws && needsSpace(prev, tok, a, b)) out += ' ';
      }
      out += tok.v;
      prev = tok;
    }
    return out;
  };
  function needsSpace(p, t, a, b) {
    if (isIdChar(a) && isIdChar(b)) return true;
    if ((a === '+' || a === '-') && (b === '+' || b === '-')) return true;
    if (a === '/' && (b === '/' || b === '*')) return true;
    if (p.t === 'num' && b === '.') return true;
    if (a === '<' && b === '!') return true;
    if (a === '-' && b === '>') return true;
    return false;
  }
  function keepNewline(p, t, a, b) {
    if (p.v === '++' || p.v === '--' || t.v === '++' || t.v === '--') return true;
    if (p.t === 'id' && RESTRICTED[p.v]) return true;
    if (p.t === 'punc' && DROP_NL_AFTER.indexOf(a) > -1) return false;
    if (t.t === 'punc' && DROP_NL_BEFORE.indexOf(b) > -1) return false;
    return true;
  }

  /* ---- UUID ---- */
  Core.uuidV4 = function (cryptoObj) {
    if (cryptoObj && typeof cryptoObj.randomUUID === 'function') return cryptoObj.randomUUID();
    var b = new Uint8Array(16);
    cryptoObj.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    var h = Array.prototype.map.call(b, function (x) { return (x + 0x100).toString(16).slice(1); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  };
  Core.inspectUUID = function (s) {
    var v = s.trim().replace(/^\{|\}$/g, '').replace(/^urn:uuid:/i, '');
    if (/^[0-9a-f]{32}$/i.test(v)) v = v.slice(0, 8) + '-' + v.slice(8, 12) + '-' + v.slice(12, 16) + '-' + v.slice(16, 20) + '-' + v.slice(20);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) return { valid: false };
    if (/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(v)) return { valid: true, nil: true, version: 0 };
    if (/^f{8}-f{4}-f{4}-f{4}-f{12}$/i.test(v)) return { valid: true, max: true, version: 0 };
    var variantNibble = parseInt(v.charAt(19), 16);
    return { valid: true, version: parseInt(v.charAt(14), 16), rfc: (variantNibble & 0xc) === 0x8 };
  };

  /* ---- Dates (age) ---- */
  Core.parseDate = function (s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > Core.daysInMonth(y, mo)) return null;
    return { y: y, m: mo, d: d };
  };
  Core.daysInMonth = function (y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); };
  function utc(dt) { var x = new Date(Date.UTC(2000, dt.m - 1, dt.d)); x.setUTCFullYear(dt.y); return x.getTime(); }
  function addMonths(dt, k) {
    var idx = dt.m - 1 + k;
    var y = dt.y + Math.floor(idx / 12), m = ((idx % 12) + 12) % 12 + 1;
    return { y: y, m: m, d: Math.min(dt.d, Core.daysInMonth(y, m)) };
  }
  Core.ageBetween = function (b, t) {
    // Count whole months to the last "monthly anniversary" on or before t, then the remaining days.
    var totalMonths = (t.y - b.y) * 12 + (t.m - b.m);
    var anchor = addMonths(b, totalMonths);
    if (utc(anchor) > utc(t)) { totalMonths--; anchor = addMonths(b, totalMonths); }
    var years = Math.floor(totalMonths / 12), months = totalMonths - years * 12;
    var days = Math.round((utc(t) - utc(anchor)) / 86400000);
    var totalDays = Math.round((utc(t) - utc(b)) / 86400000);
    var next = { y: t.y, m: b.m, d: b.d };
    var fix = function (dt) { if (dt.d > Core.daysInMonth(dt.y, dt.m)) dt.d = Core.daysInMonth(dt.y, dt.m); return dt; };
    fix(next);
    if (utc(next) < utc(t)) { next = fix({ y: t.y + 1, m: b.m, d: b.d }); }
    return {
      years: years, months: months, days: days,
      totalMonths: totalMonths,
      totalWeeks: Math.floor(totalDays / 7), weekRemainder: totalDays % 7,
      totalDays: totalDays,
      daysToBirthday: Math.round((utc(next) - utc(t)) / 86400000),
      nextBirthday: next,
      nextAge: next.y - b.y,
      bornWeekday: new Date(utc(b)).getUTCDay(),
      nextWeekday: new Date(utc(next)).getUTCDay()
    };
  };

  /* ---- BMI ---- */
  Core.bmi = function (kg, m) {
    var v = kg / (m * m);
    var cat = v < 18.5 ? 'Underweight' : v < 25 ? 'Healthy weight' : v < 30 ? 'Overweight' : 'Obesity';
    return { value: v, category: cat, minKg: 18.5 * m * m, maxKg: 24.9 * m * m };
  };

  /* ---- Passwords ---- */
  var PW_SETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.<>/?~|'
  };
  var SIMILAR = /[Il1|O0o]/g;
  Core.secureRandomInt = function (max, cryptoObj) {
    var limit = Math.floor(0x100000000 / max) * max, buf = new Uint32Array(1);
    do { cryptoObj.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % max;
  };
  Core.generatePassword = function (o, cryptoObj) {
    var sets = [];
    ['upper', 'lower', 'digits', 'symbols'].forEach(function (k) {
      if (o[k]) { var s = PW_SETS[k]; if (o.noSimilar) s = s.replace(SIMILAR, ''); sets.push(s); }
    });
    if (!sets.length) throw new Error('Select at least one character type.');
    var pool = sets.join('');
    var rnd = function (max) { return Core.secureRandomInt(max, cryptoObj); };
    var chars = sets.map(function (s) { return s[rnd(s.length)]; });
    while (chars.length < o.length) chars.push(pool[rnd(pool.length)]);
    chars = chars.slice(0, o.length);
    for (var i = chars.length - 1; i > 0; i--) { var j = rnd(i + 1); var t = chars[i]; chars[i] = chars[j]; chars[j] = t; }
    return { password: chars.join(''), poolSize: pool.length, entropy: o.length * Math.log2(pool.length) };
  };

  /* ---- SEO helpers ---- */
  var STOPWORDS = ('a about above after again against all am an and any are aren as at be because been before being below between both but by can cannot could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just let me more most my myself no nor not now of off on once only or other ought our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves also get got one two may might must shall us via per s t don doesn didn isn wasn weren won wouldn shouldn couldn ll ve re d m').split(' ');
  Core.syllables = function (word) {
    var w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/, '').replace(/^y/, '');
    var m = w.match(/[aeiouy]{1,2}/g);
    return m ? m.length : 1;
  };
  Core.readingEase = function (text) {
    var words = Core.words(text), sentences = Math.max(1, Core.countSentences(text));
    if (words.length < 10) return null;
    var syl = words.reduce(function (s, w) { return s + Core.syllables(w); }, 0);
    return 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syl / words.length);
  };
  Core.topKeywords = function (text, limit) {
    var words = Core.words(text.toLowerCase()).map(function (w) { return w.replace(/['’]s$/, ''); });
    var total = words.length, freq = {}, pairs = {};
    words.forEach(function (w, i) {
      var good = w.length > 2 && STOPWORDS.indexOf(w) === -1 && !/^\d+$/.test(w);
      if (good) freq[w] = (freq[w] || 0) + 1;
      var nxt = words[i + 1];
      if (nxt && good && nxt.length > 2 && STOPWORDS.indexOf(nxt) === -1 && !/^\d+$/.test(nxt)) {
        var p = w + ' ' + nxt; pairs[p] = (pairs[p] || 0) + 1;
      }
    });
    var top = function (obj, min) {
      return Object.keys(obj).filter(function (k) { return obj[k] >= min; })
        .sort(function (a, b) { return obj[b] - obj[a] || a.localeCompare(b); })
        .slice(0, limit || 10)
        .map(function (k) { return { term: k, count: obj[k], density: total ? obj[k] / total * 100 : 0 }; });
    };
    return { total: total, words: top(freq, 1), phrases: top(pairs, 2) };
  };
  Core.countPhrase = function (text, phrase) {
    var p = phrase.trim().toLowerCase();
    if (!p) return 0;
    var esc = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    var re = new RegExp('(^|[^\\p{L}\\p{N}])' + esc + '(?=$|[^\\p{L}\\p{N}])', 'giu');
    return (text.toLowerCase().match(re) || []).length;
  };

  /* ---- Number bases ---- */
  Core.parseBinary = function (input) {
    var s = input.replace(/[\s_,]/g, '');
    var neg = false;
    if (s[0] === '-') { neg = true; s = s.slice(1); }
    s = s.replace(/^0b/i, '');
    if (!s) return { error: 'Enter a binary number, for example 101101.' };
    var bad = s.match(/[^01]/);
    if (bad) return { error: '“' + bad[0] + '” is not a binary digit. Binary numbers can only contain 0 and 1.' };
    if (s.length > 4096) return { error: 'That number is too long. Please use 4,096 bits or fewer.' };
    var v = BigInt('0b' + s);
    return { value: neg ? -v : v, bits: s };
  };
  Core.parseDecimal = function (input) {
    var s = input.replace(/[\s_,]/g, '');
    if (!s) return { error: 'Enter a whole number, for example 45.' };
    if (!/^-?\d+$/.test(s)) return { error: /[.eE]/.test(s) ? 'Only whole numbers (integers) can be converted. Remove the decimal point or exponent.' : 'Use digits 0–9 only, with an optional leading minus sign.' };
    if (s.replace('-', '').length > 1300) return { error: 'That number is too long. Please use 1,300 digits or fewer.' };
    return { value: BigInt(s) };
  };
  Core.toBase = function (big, base) { return big < BigInt(0) ? '-' + (-big).toString(base) : big.toString(base); };

  /** Human-friendly number formatting. */
  Core.fmt = function (n, maxFrac) {
    if (!isFinite(n)) return '–';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: maxFrac == null ? 6 : maxFrac }).format(n);
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = Core; return; }

  /* ==================================================================== *
   * DOM helpers
   * ==================================================================== */
  var U = window.Toolify;
  function $(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }
  function debounce(fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); }; }
  function showAlert(box, msg, type) {
    if (!box) return;
    if (!msg) { box.hidden = true; box.textContent = ''; return; }
    box.className = 'alert alert-' + (type || 'error');
    if (typeof msg === 'string') box.textContent = msg; else { box.textContent = ''; box.appendChild(msg); }
    box.hidden = false;
  }
  function setText(id, v) { var el = $(id); if (el) el.textContent = v; }
  function baseName(name) { return (name || 'image').replace(/\.[^.]+$/, '').replace(/[^\w\-]+/g, '-').replace(/-+/g, '-').slice(0, 80) || 'image'; }
  function bindCopy(btnId, getText) { var b = $(btnId); on(b, 'click', function () { U.copy(getText(), b); }); }
  function bindDownload(btnId, getText, filename, mime) {
    on($(btnId), 'click', function () {
      var t = getText();
      if (!t) { U.toast('Nothing to download yet.', 'error'); return; }
      U.download(t, typeof filename === 'function' ? filename() : filename, mime);
    });
  }
  function getCrypto() { return (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) ? window.crypto : null; }

  var MAX_FILE = 50 * 1024 * 1024;
  function setupDropzone(zone, input, onFiles) {
    if (!zone || !input) return;
    ['dragenter', 'dragover'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('is-dragover'); });
    });
    ['dragleave', 'dragend', 'drop'].forEach(function (ev) {
      zone.addEventListener(ev, function () { zone.classList.remove('is-dragover'); });
    });
    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      var files = Array.prototype.slice.call((e.dataTransfer && e.dataTransfer.files) || []);
      if (files.length) onFiles(files);
    });
    input.addEventListener('change', function () {
      var files = Array.prototype.slice.call(input.files || []);
      input.value = '';
      if (files.length) onFiles(files);
    });
  }
  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) { reject(new Error('“' + (file && file.name) + '” is not an image file.')); return; }
      if (file.size > MAX_FILE) { reject(new Error('“' + file.name + '” is larger than 50 MB. Please choose a smaller image.')); return; }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { resolve({ img: img, url: url, width: img.naturalWidth, height: img.naturalHeight }); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('“' + file.name + '” could not be read. The file may be damaged or in a format your browser cannot open.')); };
      img.src = url;
    });
  }
  function canvasToBlob(canvas, type, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) resolve(blob);
        else reject(new Error('Your browser could not process this image. It may be too large — try a smaller image.'));
      }, type, quality);
    });
  }
  function drawToCanvas(source, w, h, background) {
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not available in this browser.');
    if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, w, h); }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, w, h);
    return canvas;
  }
  /** High-quality downscale by halving in steps, then a final draw. */
  function resizeImage(img, w, h, background) {
    var src = img, sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
    while (sw / 2 >= w && sh / 2 >= h) {
      sw = Math.round(sw / 2); sh = Math.round(sh / 2);
      src = drawToCanvas(src, sw, sh, null);
    }
    return drawToCanvas(src, w, h, background);
  }
  var webpSupport = null;
  function supportsWebpEncode() {
    if (webpSupport === null) {
      try { var c = document.createElement('canvas'); c.width = c.height = 1; webpSupport = c.toDataURL('image/webp').indexOf('data:image/webp') === 0; }
      catch (e) { webpSupport = false; }
    }
    return webpSupport;
  }
  var EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

  /* ==================================================================== *
   * Tool initialisers
   * ==================================================================== */
  var tools = {};

  /* ---------- Word Counter ---------- */
  tools['word-counter'] = function () {
    var input = $('wc-input');
    var update = function () {
      var s = Core.textStats(input.value);
      setText('wc-words', Core.fmt(s.words));
      setText('wc-chars', Core.fmt(s.chars));
      setText('wc-chars-ns', Core.fmt(s.charsNoSpaces));
      setText('wc-sentences', Core.fmt(s.sentences));
      setText('wc-paragraphs', Core.fmt(s.paragraphs));
      setText('wc-reading', Core.formatDuration(s.readingSeconds));
      setText('wc-speaking', Core.formatDuration(s.speakingSeconds));
    };
    var raf;
    on(input, 'input', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); });
    bindCopy('wc-copy', function () { return input.value; });
    on($('wc-clear'), 'click', function () { input.value = ''; update(); input.focus(); });
    update();
  };

  /* ---------- Character Counter ---------- */
  tools['character-counter'] = function () {
    var input = $('cc-input'), limitSel = $('cc-limit'), custom = $('cc-custom'), customWrap = $('cc-custom-wrap');
    var meter = $('cc-meter'), bar = meter.querySelector('span');
    var update = function () {
      var s = Core.charStats(input.value);
      setText('cc-chars', Core.fmt(s.chars));
      setText('cc-nospace', Core.fmt(s.noSpaces));
      setText('cc-letters', Core.fmt(s.letters));
      setText('cc-digits', Core.fmt(s.digits));
      setText('cc-spaces', Core.fmt(s.spaces));
      setText('cc-symbols', Core.fmt(s.symbols));
      setText('cc-lines', Core.fmt(s.lines));
      setText('cc-bytes', Core.fmt(s.bytes));
      var limit = limitSel.value === 'custom' ? parseInt(custom.value, 10) : parseInt(limitSel.value, 10);
      customWrap.hidden = limitSel.value !== 'custom';
      var wrap = $('cc-limit-status');
      if (!limit || limit < 1) { wrap.hidden = true; return; }
      wrap.hidden = false;
      var pct = Math.min(100, s.chars / limit * 100);
      bar.style.width = pct + '%';
      meter.className = 'meter ' + (s.chars > limit ? 'is-bad' : pct >= 90 ? 'is-warn' : 'is-ok');
      setText('cc-limit-used', Core.fmt(s.chars) + ' / ' + Core.fmt(limit) + ' characters');
      setText('cc-limit-left', s.chars > limit ? Core.fmt(s.chars - limit) + ' over the limit' : Core.fmt(limit - s.chars) + ' remaining');
    };
    on(input, 'input', update);
    on(limitSel, 'change', function () { update(); if (limitSel.value === 'custom') custom.focus(); });
    on(custom, 'input', update);
    bindCopy('cc-copy', function () { return input.value; });
    on($('cc-clear'), 'click', function () { input.value = ''; update(); input.focus(); });
    update();
  };

  /* ---------- Case Converter ---------- */
  tools['case-converter'] = function () {
    var input = $('cv-input'), output = $('cv-output'), status = $('cv-status');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-case]'));
    var lastMode = null;
    var run = function (mode) {
      lastMode = mode;
      if (!input.value) { showAlert(status, 'Type or paste some text first.', 'error'); output.value = ''; return; }
      output.value = Core.convertCase(input.value, mode);
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.case === mode)); });
      var btn = buttons.filter(function (b) { return b.dataset.case === mode; })[0];
      showAlert(status, 'Converted to ' + (btn ? btn.textContent.trim() : mode) + '.', 'success');
    };
    buttons.forEach(function (b) { on(b, 'click', function () { run(b.dataset.case); }); });
    on(input, 'input', debounce(function () { if (lastMode && input.value) run(lastMode); else if (!input.value) { output.value = ''; showAlert(status, ''); } }, 150));
    bindCopy('cv-copy', function () { return output.value; });
    bindDownload('cv-download', function () { return output.value; }, 'converted-text.txt');
    on($('cv-clear'), 'click', function () {
      input.value = ''; output.value = ''; lastMode = null; showAlert(status, '');
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      input.focus();
    });
  };

  /* ---------- Remove Extra Spaces ---------- */
  tools['remove-extra-spaces'] = function () {
    var input = $('rs-input'), output = $('rs-output');
    var ids = { nbsp: 'rs-nbsp', tabs: 'rs-tabs', collapse: 'rs-collapse', trim: 'rs-trim', collapseEmpty: 'rs-collapse-empty', removeEmpty: 'rs-remove-empty', join: 'rs-join' };
    var opts = function () { var o = {}; Object.keys(ids).forEach(function (k) { o[k] = $(ids[k]).checked; }); return o; };
    var update = function () {
      var o = opts();
      $('rs-collapse-empty').disabled = o.removeEmpty || o.join;
      $('rs-remove-empty').disabled = o.join;
      output.value = Core.cleanSpaces(input.value, o);
      var removed = input.value.length - output.value.length;
      var summary = $('rs-summary');
      if (!input.value) summary.textContent = 'Paste text above — the cleaned version appears here instantly.';
      else summary.textContent = removed > 0 ? 'Removed ' + Core.fmt(removed) + ' unnecessary character' + (removed === 1 ? '' : 's') + '.' : 'No extra spaces found with the selected options.';
    };
    on(input, 'input', update);
    Object.keys(ids).forEach(function (k) { on($(ids[k]), 'change', update); });
    bindCopy('rs-copy', function () { return output.value; });
    bindDownload('rs-download', function () { return output.value; }, 'cleaned-text.txt');
    on($('rs-clear'), 'click', function () { input.value = ''; update(); input.focus(); });
    update();
  };

  /* ---------- Text Reverser ---------- */
  tools['text-reverser'] = function () {
    var input = $('tr-input'), output = $('tr-output');
    var mode = function () { var r = document.querySelector('input[name="tr-mode"]:checked'); return r ? r.value : 'chars'; };
    var update = function () { output.value = Core.reverseText(input.value, mode()); };
    on(input, 'input', update);
    Array.prototype.forEach.call(document.querySelectorAll('input[name="tr-mode"]'), function (r) { on(r, 'change', update); });
    bindCopy('tr-copy', function () { return output.value; });
    on($('tr-swap'), 'click', function () { input.value = output.value; update(); input.focus(); });
    on($('tr-clear'), 'click', function () { input.value = ''; update(); input.focus(); });
    update();
  };

  /* ---------- Lorem Ipsum Generator ---------- */
  tools['lorem-ipsum-generator'] = function () {
    var count = $('li-count'), unit = $('li-unit'), output = $('li-output'), err = $('li-error');
    var LIMITS = { paragraphs: 100, sentences: 500, words: 5000 };
    var generate = function () {
      var n = Number(count.value), u = unit.value, max = LIMITS[u];
      if (!Number.isInteger(n) || n < 1 || n > max) {
        count.setAttribute('aria-invalid', 'true');
        showAlert(err, 'Please enter a whole number between 1 and ' + Core.fmt(max) + ' ' + u + '.');
        return;
      }
      count.removeAttribute('aria-invalid');
      showAlert(err, '');
      var items = Core.lorem(n, u, $('li-classic').checked);
      output.value = $('li-html').checked ? items.map(function (p) { return '<p>' + p + '</p>'; }).join('\n') : items.join('\n\n');
    };
    on($('li-generate'), 'click', generate);
    on(count, 'keydown', function (e) { if (e.key === 'Enter') generate(); });
    on(unit, 'change', function () { count.max = LIMITS[unit.value]; });
    bindCopy('li-copy', function () { return output.value; });
    bindDownload('li-download', function () { return output.value; }, function () { return $('li-html').checked ? 'lorem-ipsum.html' : 'lorem-ipsum.txt'; });
    on($('li-clear'), 'click', function () { output.value = ''; showAlert(err, ''); });
    generate();
  };

  /* ---------- Image Compressor ---------- */
  tools['image-compressor'] = function () {
    var file = null, loaded = null, resultBlob = null, outUrl = null;
    var err = $('ic-error'), work = $('ic-work'), quality = $('ic-quality'), format = $('ic-format'), maxw = $('ic-maxw');
    if (!supportsWebpEncode()) {
      var opt = format.querySelector('option[value="image/webp"]');
      if (opt) { opt.disabled = true; opt.textContent = 'WebP (not supported in this browser)'; }
    }
    var process = function () {
      if (!loaded) return;
      var q = Number(quality.value) / 100;
      setText('ic-quality-out', quality.value + '%');
      var w = loaded.width, h = loaded.height;
      var limit = parseInt(maxw.value, 10);
      if (maxw.value && (!limit || limit < 1 || limit > 20000)) { maxw.setAttribute('aria-invalid', 'true'); showAlert(err, 'Max width must be a whole number between 1 and 20,000 pixels.'); return; }
      maxw.removeAttribute('aria-invalid');
      showAlert(err, '');
      if (limit && limit < w) { h = Math.max(1, Math.round(h * limit / w)); w = limit; }
      var type = format.value;
      var canvas;
      try { canvas = resizeImage(loaded.img, w, h, type === 'image/jpeg' ? '#ffffff' : null); }
      catch (e) { showAlert(err, e.message); return; }
      canvasToBlob(canvas, type, q).then(function (blob) {
        resultBlob = blob;
        if (outUrl) URL.revokeObjectURL(outUrl);
        outUrl = URL.createObjectURL(blob);
        $('ic-out-img').src = outUrl;
        setText('ic-out-info', U.formatBytes(blob.size) + ' · ' + w + ' × ' + h + ' px · ' + (EXT[blob.type] || '').toUpperCase());
        var diff = file.size - blob.size, summary = $('ic-summary');
        if (diff > 0) {
          showAlert(summary, 'Saved ' + U.formatBytes(diff) + ' (' + Math.round(diff / file.size * 100) + '% smaller). Your compressed image is ready to download.', 'success');
        } else {
          showAlert(summary, 'The compressed file is not smaller than the original (' + U.formatBytes(file.size) + '). The original may already be well optimised — try a lower quality, a smaller max width or WebP.', 'warning');
        }
      }, function (e) { showAlert(err, e.message); });
    };
    var debounced = debounce(process, 200);
    setupDropzone($('ic-drop'), $('ic-file'), function (files) {
      var f = files[0];
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { showAlert(err, 'Please choose a JPG, PNG or WebP image. “' + f.name + '” is not supported.'); return; }
      loadImage(f).then(function (res) {
        if (loaded) URL.revokeObjectURL(loaded.url);
        file = f; loaded = res;
        $('ic-orig-img').src = res.url;
        setText('ic-orig-info', U.formatBytes(f.size) + ' · ' + res.width + ' × ' + res.height + ' px');
        if (f.type === 'image/png' && format.value === 'image/jpeg') {
          showAlert($('ic-summary'), 'Tip: PNG files are converted to JPEG or WebP for compression. Transparent areas become white in JPEG — choose WebP to keep transparency.', 'info');
        }
        work.hidden = false;
        process();
      }, function (e) { showAlert(err, e.message); });
    });
    on(quality, 'input', function () { setText('ic-quality-out', quality.value + '%'); debounced(); });
    on(format, 'change', process);
    on(maxw, 'input', debounced);
    on($('ic-download'), 'click', function () {
      if (!resultBlob) return;
      U.download(resultBlob, baseName(file.name) + '-compressed.' + (EXT[resultBlob.type] || 'jpg'));
    });
    on($('ic-reset'), 'click', function () {
      if (loaded) URL.revokeObjectURL(loaded.url);
      if (outUrl) URL.revokeObjectURL(outUrl);
      file = loaded = resultBlob = outUrl = null;
      work.hidden = true; showAlert(err, '');
      $('ic-orig-img').removeAttribute('src'); $('ic-out-img').removeAttribute('src');
    });
  };

  /* ---------- Image Resizer ---------- */
  tools['image-resizer'] = function () {
    var file = null, loaded = null, resultBlob = null, outUrl = null, mode = 'px';
    var err = $('ir-error'), width = $('ir-width'), height = $('ir-height'), lock = $('ir-lock'), pct = $('ir-pct');
    var format = $('ir-format'), quality = $('ir-quality');
    if (!supportsWebpEncode()) { var o = format.querySelector('option[value="image/webp"]'); if (o) { o.disabled = true; o.textContent = 'WebP (not supported in this browser)'; } }
    var setMode = function (m) {
      mode = m;
      $('ir-mode-px').setAttribute('aria-pressed', String(m === 'px'));
      $('ir-mode-pct').setAttribute('aria-pressed', String(m === 'pct'));
      $('ir-px-fields').hidden = m !== 'px';
      $('ir-pct-fields').hidden = m !== 'pct';
    };
    var outType = function () {
      if (format.value !== 'original') return format.value;
      return /^image\/(png|jpeg|webp)$/.test(file.type) && (file.type !== 'image/webp' || supportsWebpEncode()) ? file.type : 'image/png';
    };
    var syncQuality = function () { $('ir-quality-field').hidden = !file || outType() === 'image/png'; setText('ir-quality-out', quality.value + '%'); };
    on($('ir-mode-px'), 'click', function () { setMode('px'); });
    on($('ir-mode-pct'), 'click', function () { setMode('pct'); });
    on(width, 'input', function () { if (lock.checked && loaded && width.value) height.value = Math.max(1, Math.round(width.value * loaded.height / loaded.width)); });
    on(height, 'input', function () { if (lock.checked && loaded && height.value) width.value = Math.max(1, Math.round(height.value * loaded.width / loaded.height)); });
    on(format, 'change', syncQuality);
    on(quality, 'input', syncQuality);

    setupDropzone($('ir-drop'), $('ir-file'), function (files) {
      var f = files[0];
      loadImage(f).then(function (res) {
        if (loaded) URL.revokeObjectURL(loaded.url);
        file = f; loaded = res;
        width.value = res.width; height.value = res.height; pct.value = 50;
        setText('ir-orig-info', f.name + ' — ' + res.width + ' × ' + res.height + ' px, ' + U.formatBytes(f.size));
        $('ir-work').hidden = false; $('ir-result').hidden = true;
        showAlert(err, '');
        syncQuality();
      }, function (e) { showAlert(err, e.message); });
    });

    on($('ir-resize'), 'click', function () {
      if (!loaded) return;
      var w, h;
      if (mode === 'pct') {
        var p = Number(pct.value);
        if (!isFinite(p) || p <= 0 || p > 1000) { showAlert(err, 'Enter a percentage between 1 and 1000.'); return; }
        w = Math.max(1, Math.round(loaded.width * p / 100)); h = Math.max(1, Math.round(loaded.height * p / 100));
      } else {
        w = Number(width.value); h = Number(height.value);
        if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1) { showAlert(err, 'Width and height must be whole numbers of at least 1 pixel.'); return; }
      }
      if (w > 16384 || h > 16384 || w * h > 100000000) { showAlert(err, 'The new size (' + w + ' × ' + h + ' px) is too large for browsers to process. Keep each side under 16,384 px.'); return; }
      showAlert(err, '');
      var type = outType();
      var canvas;
      try { canvas = resizeImage(loaded.img, w, h, type === 'image/jpeg' ? '#ffffff' : null); } catch (e) { showAlert(err, e.message); return; }
      canvasToBlob(canvas, type, Number(quality.value) / 100).then(function (blob) {
        resultBlob = blob;
        if (outUrl) URL.revokeObjectURL(outUrl);
        outUrl = URL.createObjectURL(blob);
        $('ir-out-img').src = outUrl;
        setText('ir-out-info', w + ' × ' + h + ' px · ' + U.formatBytes(blob.size) + ' · ' + (EXT[blob.type] || '').toUpperCase());
        $('ir-result').hidden = false;
        if (w > loaded.width || h > loaded.height) showAlert(err, 'Note: enlarging an image cannot add detail, so upscaled images may look soft or blurry.', 'info');
      }, function (e) { showAlert(err, e.message); });
    });
    on($('ir-download'), 'click', function () {
      if (resultBlob) U.download(resultBlob, baseName(file.name) + '-resized.' + (EXT[resultBlob.type] || 'png'));
    });
    on($('ir-reset'), 'click', function () {
      if (loaded) URL.revokeObjectURL(loaded.url);
      if (outUrl) URL.revokeObjectURL(outUrl);
      file = loaded = resultBlob = outUrl = null;
      $('ir-work').hidden = true; showAlert(err, '');
    });
    setMode('px');
  };

  /* ---------- JPG ⇄ PNG converters ---------- */
  function formatConverter(fromTypes, fromLabel, toType) {
    return function () {
      var err = $('ix-error'), list = $('ix-list'), items = [];
      var bg = $('ix-bg'), quality = $('ix-quality');
      var convertItem = function (item) {
        var canvas;
        try { canvas = drawToCanvas(item.img, item.width, item.height, toType === 'image/jpeg' ? (bg ? bg.value : '#ffffff') : null); }
        catch (e) { item.info.textContent = e.message; item.info.classList.add('is-error'); return; }
        canvasToBlob(canvas, toType, quality ? Number(quality.value) / 100 : undefined).then(function (blob) {
          item.blob = blob;
          item.info.classList.remove('is-error');
          item.info.textContent = item.width + ' × ' + item.height + ' px · ' + U.formatBytes(item.file.size) + ' → ' + U.formatBytes(blob.size);
          item.btn.disabled = false;
        }, function (e) { item.info.textContent = e.message; item.info.classList.add('is-error'); });
      };
      var reconvert = debounce(function () { items.forEach(convertItem); }, 250);
      var updateActions = function () { $('ix-actions').hidden = !items.length; };
      setupDropzone($('ix-drop'), $('ix-file'), function (files) {
        showAlert(err, '');
        var skipped = [];
        if (items.length + files.length > 20) { showAlert(err, 'You can convert up to 20 images at a time. Extra files were skipped.'); files = files.slice(0, Math.max(0, 20 - items.length)); }
        files.forEach(function (f) {
          if (fromTypes.indexOf(f.type) === -1) { skipped.push(f.name); return; }
          loadImage(f).then(function (res) {
            var li = document.createElement('li');
            li.className = 'file-item';
            var thumb = new Image(); thumb.src = res.url; thumb.alt = 'Preview of ' + f.name;
            var meta = document.createElement('div'); meta.className = 'file-meta';
            var name = document.createElement('div'); name.className = 'file-name'; name.textContent = baseName(f.name) + '.' + EXT[toType];
            var info = document.createElement('div'); info.className = 'file-info'; info.textContent = 'Converting…';
            meta.appendChild(name); meta.appendChild(info);
            var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn btn-secondary btn-sm'; btn.textContent = 'Download'; btn.disabled = true;
            btn.setAttribute('aria-label', 'Download ' + name.textContent);
            li.appendChild(thumb); li.appendChild(meta); li.appendChild(btn);
            list.appendChild(li);
            var item = { file: f, img: res.img, url: res.url, width: res.width, height: res.height, info: info, btn: btn, li: li, blob: null };
            btn.addEventListener('click', function () { if (item.blob) U.download(item.blob, name.textContent); });
            items.push(item);
            updateActions();
            convertItem(item);
          }, function (e) { showAlert(err, e.message); });
        });
        if (skipped.length) showAlert(err, 'Skipped ' + skipped.length + ' file' + (skipped.length > 1 ? 's' : '') + ' that ' + (skipped.length > 1 ? 'are' : 'is') + ' not ' + fromLabel + ': ' + skipped.join(', '));
      });
      if (bg) on(bg, 'input', reconvert);
      if (quality) on(quality, 'input', function () { setText('ix-quality-out', quality.value + '%'); reconvert(); });
      on($('ix-download-all'), 'click', function () {
        var ready = items.filter(function (i) { return i.blob; });
        if (!ready.length) { U.toast('Nothing to download yet.', 'error'); return; }
        ready.forEach(function (item, k) { setTimeout(function () { U.download(item.blob, baseName(item.file.name) + '.' + EXT[toType]); }, k * 350); });
      });
      on($('ix-clear'), 'click', function () {
        items.forEach(function (i) { URL.revokeObjectURL(i.url); });
        items = []; list.innerHTML = ''; showAlert(err, ''); updateActions();
      });
    };
  }
  tools['jpg-to-png'] = formatConverter(['image/jpeg', 'image/pjpeg'], 'JPG images', 'image/png');
  tools['png-to-jpg'] = formatConverter(['image/png'], 'PNG images', 'image/jpeg');

  /* ---------- Image to Base64 ---------- */
  tools['image-to-base64'] = function () {
    var err = $('ib-error'), output = $('ib-output'), fmt = $('ib-format'), dataUrl = '', mime = '', fname = '';
    var render = function () {
      if (!dataUrl) { output.value = ''; return; }
      var b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
      switch (fmt.value) {
        case 'base64': output.value = b64; break;
        case 'img': output.value = '<img src="' + dataUrl + '" alt="">'; break;
        case 'css': output.value = 'background-image: url("' + dataUrl + '");'; break;
        default: output.value = dataUrl;
      }
      setText('ib-length', Core.fmt(output.value.length) + ' characters');
    };
    setupDropzone($('ib-drop'), $('ib-file'), function (files) {
      var f = files[0];
      showAlert(err, '');
      if (!/^image\//.test(f.type)) { showAlert(err, '“' + f.name + '” is not an image. Please choose a PNG, JPG, GIF, WebP, SVG or ICO file.'); return; }
      if (f.size > 10 * 1024 * 1024) { showAlert(err, 'Please choose an image under 10 MB. Base64 makes files about 33% larger, so very large images are impractical to embed.'); return; }
      var reader = new FileReader();
      reader.onload = function () {
        dataUrl = String(reader.result); mime = f.type; fname = f.name;
        $('ib-preview').src = dataUrl;
        $('ib-preview').alt = 'Preview of ' + f.name;
        setText('ib-info', f.name + ' · ' + mime + ' · ' + U.formatBytes(f.size));
        $('ib-work').hidden = false;
        if (f.size > 100 * 1024) showAlert(err, 'This image is ' + U.formatBytes(f.size) + '. Base64 embedding works best for small images (under ~10 KB) such as icons; larger images are usually better served as normal files.', 'info');
        render();
      };
      reader.onerror = function () { showAlert(err, 'The file could not be read. Please try again.'); };
      reader.readAsDataURL(f);
    });
    on(fmt, 'change', render);
    bindCopy('ib-copy', function () { return output.value; });
    bindDownload('ib-download', function () { return output.value; }, function () { return baseName(fname) + '-base64.txt'; });
    on($('ib-clear'), 'click', function () { dataUrl = ''; output.value = ''; $('ib-work').hidden = true; $('ib-preview').removeAttribute('src'); showAlert(err, ''); });
  };

  /* ---------- JSON Formatter & Validator ---------- */
  tools['json-formatter'] = function () {
    var input = $('jf-input'), output = $('jf-output'), status = $('jf-status');
    var SAMPLE = '{"name":"ToolifyHub","free":true,"tools":25,"categories":["text","image","developer","calculator"],"owner":{"country":"Worldwide","since":2026},"rating":null}';
    var indent = function () { var v = $('jf-indent').value; return v === 'tab' ? '\t' : Number(v); };
    var parse = function () {
      if (!input.value.trim()) { showAlert(status, 'Paste some JSON into the input box first.'); output.value = ''; return null; }
      var r = Core.parseJSON(input.value);
      if (!r.ok) {
        var where = r.line ? ' (line ' + r.line + ', column ' + r.col + ')' : '';
        var box = document.createElement('div');
        var p = document.createElement('p'); p.textContent = 'Invalid JSON' + where + ': ' + r.message;
        box.appendChild(p);
        if (r.line) {
          var lineText = input.value.split('\n')[r.line - 1] || '';
          var start = Math.max(0, r.col - 40);
          var pre = document.createElement('pre'); pre.className = 'mono'; pre.style.margin = '8px 0 0'; pre.style.whiteSpace = 'pre-wrap';
          pre.textContent = lineText.slice(start, start + 80) + '\n' + ' '.repeat(Math.max(0, r.col - 1 - start)) + '^';
          box.appendChild(pre);
        }
        var tip = document.createElement('p'); tip.style.marginTop = '8px';
        tip.textContent = 'Common causes: trailing commas, single quotes instead of double quotes, unquoted keys, or comments (JSON does not allow comments).';
        box.appendChild(tip);
        showAlert(status, box, 'error');
        output.value = '';
        return null;
      }
      return r;
    };
    var summary = function (v, extra) {
      var s = Core.jsonSummary(v);
      var type = Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v;
      showAlert(status, 'Valid JSON ✓ — top-level ' + type + ', ' + s.objects + ' object' + (s.objects === 1 ? '' : 's') + ', ' + s.arrays + ' array' + (s.arrays === 1 ? '' : 's') + ', ' + s.keys + ' key' + (s.keys === 1 ? '' : 's') + ', depth ' + s.depth + '.' + (extra || ''), 'success');
    };
    var maybeSort = function (v) { return $('jf-sort').checked ? Core.sortKeys(v) : v; };
    on($('jf-format'), 'click', function () { var r = parse(); if (r) { output.value = JSON.stringify(maybeSort(r.value), null, indent()); summary(r.value); } });
    on($('jf-minify'), 'click', function () {
      var r = parse();
      if (r) { output.value = JSON.stringify(maybeSort(r.value)); summary(r.value, ' Minified from ' + U.formatBytes(new Blob([input.value]).size) + ' to ' + U.formatBytes(new Blob([output.value]).size) + '.'); }
    });
    on($('jf-validate'), 'click', function () { var r = parse(); if (r) summary(r.value); });
    on($('jf-sample'), 'click', function () { input.value = SAMPLE; showAlert(status, ''); output.value = ''; input.focus(); });
    on($('jf-clear'), 'click', function () { input.value = ''; output.value = ''; showAlert(status, ''); input.focus(); });
    on(input, 'keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); $('jf-format').click(); } });
    bindCopy('jf-copy', function () { return output.value; });
    bindDownload('jf-download', function () { return output.value; }, 'formatted.json', 'application/json');
  };

  /* ---------- HTML Encoder / Decoder ---------- */
  tools['html-encoder-decoder'] = function () {
    var input = $('he-input'), output = $('he-output'), status = $('he-status');
    var cache = {};
    var parser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;
    var lookup = function (entity) {
      if (Object.prototype.hasOwnProperty.call(cache, entity)) return cache[entity];
      var r = null;
      if (parser) { // DOMParser documents are inert: no scripts run and nothing loads
        var txt = parser.parseFromString('<!doctype html><body>' + entity, 'text/html').body.textContent;
        if (txt !== entity) r = txt;
      }
      return (cache[entity] = r);
    };
    var run = function (mode) {
      if (!input.value) { showAlert(status, 'Enter some text or HTML first.'); output.value = ''; return; }
      if (mode === 'encode') {
        output.value = Core.htmlEncode(input.value, $('he-nonascii').checked);
        showAlert(status, 'Encoded: special characters were converted to HTML entities.', 'success');
      } else {
        output.value = Core.htmlDecode(input.value, lookup);
        showAlert(status, output.value === input.value ? 'No HTML entities were found to decode.' : 'Decoded: HTML entities were converted back to characters.', output.value === input.value ? 'info' : 'success');
      }
    };
    on($('he-encode'), 'click', function () { run('encode'); });
    on($('he-decode'), 'click', function () { run('decode'); });
    bindCopy('he-copy', function () { return output.value; });
    on($('he-swap'), 'click', function () { input.value = output.value; output.value = ''; showAlert(status, ''); input.focus(); });
    on($('he-clear'), 'click', function () { input.value = ''; output.value = ''; showAlert(status, ''); input.focus(); });
  };

  /* ---------- CSS / JS minifiers ---------- */
  function sizeReport(boxId, before, after) {
    var b = new Blob([before]).size, a = new Blob([after]).size;
    var saved = b - a;
    showAlert($(boxId), 'Original: ' + U.formatBytes(b) + ' → Minified: ' + U.formatBytes(a) + ' (' + (b ? Math.round(saved / b * 100) : 0) + '% smaller, saved ' + U.formatBytes(Math.max(0, saved)) + ').', 'success');
  }
  tools['css-minifier'] = function () {
    var input = $('cm-input'), output = $('cm-output'), status = $('cm-status');
    var SAMPLE = '/* Card component */\n.card {\n  display: flex;\n  padding: 16px 20px;\n  margin: 0 auto;\n  color: #333333;\n  background: rgba(255, 255, 255, 0.9);\n}\n\n.card > .title,\n.card .subtitle {\n  font: 600 1.25rem/1.4 "Helvetica Neue", Arial, sans-serif;\n  width: calc(100% - 2rem);\n}\n\n@media (max-width: 600px) {\n  .card { padding: 12px; }\n}\n';
    on($('cm-minify'), 'click', function () {
      if (!input.value.trim()) { showAlert(status, 'Paste some CSS into the input box first.'); output.value = ''; return; }
      try {
        output.value = Core.minifyCSS(input.value, $('cm-keep').checked);
        var opens = (output.value.match(/\{/g) || []).length, closes = (output.value.match(/\}/g) || []).length;
        sizeReport('cm-status', input.value, output.value);
        if (opens !== closes) showAlert(status, 'Minified, but the braces look unbalanced (' + opens + ' “{” vs ' + closes + ' “}”). Please check your CSS for a missing or extra brace.', 'warning');
      } catch (e) { output.value = ''; showAlert(status, 'Could not minify: ' + e.message); }
    });
    on($('cm-sample'), 'click', function () { input.value = SAMPLE; output.value = ''; showAlert(status, ''); });
    on($('cm-clear'), 'click', function () { input.value = ''; output.value = ''; showAlert(status, ''); input.focus(); });
    bindCopy('cm-copy', function () { return output.value; });
    bindDownload('cm-download', function () { return output.value; }, 'styles.min.css', 'text/css');
  };

  tools['javascript-minifier'] = function () {
    var input = $('jm-input'), output = $('jm-output'), status = $('jm-status');
    var SAMPLE = '/**\n * Calculate the total price of items in a cart.\n */\nfunction cartTotal(items, taxRate) {\n  // Sum up the line totals\n  const subtotal = items.reduce((sum, item) => {\n    return sum + item.price * item.quantity;\n  }, 0);\n\n  const tax = subtotal * (taxRate / 100);\n  return {\n    subtotal: subtotal,\n    tax: tax,\n    total: subtotal + tax\n  };\n}\n\nconsole.log(cartTotal([{ price: 9.99, quantity: 2 }], 8.25));\n';
    var compiles = function (code) { try { new Function(code); return true; } catch (e) { return false; } }; // compiles only, never runs the code
    on($('jm-minify'), 'click', function () {
      var src = input.value;
      if (!src.trim()) { showAlert(status, 'Paste some JavaScript into the input box first.'); output.value = ''; return; }
      var min;
      try { min = Core.minifyJS(src, $('jm-keep').checked); }
      catch (e) { output.value = ''; showAlert(status, 'Could not minify: ' + e.message + '. Check that every string, comment and template literal is closed.'); return; }
      var hasModuleSyntax = /(^|[;\n])\s*(import|export)\b/.test(src);
      if (!hasModuleSyntax && compiles(src) && !compiles(min)) {
        output.value = '';
        showAlert(status, 'Minification was stopped because the result did not pass a syntax check. This can happen with unusual code (for example a regular expression right after a closing bracket). Your code was not changed.');
        return;
      }
      output.value = min;
      sizeReport('jm-status', src, min);
      if (!hasModuleSyntax && !compiles(src)) showAlert(status, 'Minified, but your original code appears to contain a syntax error, so the result could not be verified. Please test it before use.', 'warning');
    });
    on($('jm-sample'), 'click', function () { input.value = SAMPLE; output.value = ''; showAlert(status, ''); });
    on($('jm-clear'), 'click', function () { input.value = ''; output.value = ''; showAlert(status, ''); input.focus(); });
    bindCopy('jm-copy', function () { return output.value; });
    bindDownload('jm-download', function () { return output.value; }, 'script.min.js', 'text/javascript');
  };

  /* ---------- URL Encoder / Decoder ---------- */
  tools['url-encoder-decoder'] = function () {
    var input = $('ue-input'), output = $('ue-output'), status = $('ue-status'), parts = $('ue-parts');
    var showParts = function (text) {
      parts.hidden = true;
      var u;
      try { u = new URL(text.trim()); } catch (e) { return; }
      if (!/^https?:|^ftp:/.test(u.protocol)) return;
      var rows = [['Protocol', u.protocol], ['Host', u.host], ['Path', decodeSafe(u.pathname)]];
      u.searchParams.forEach(function (v, k) { rows.push(['Query: ' + k, v]); });
      if (u.hash) rows.push(['Fragment', decodeSafe(u.hash.slice(1))]);
      var tbody = parts.querySelector('tbody');
      tbody.innerHTML = '';
      rows.forEach(function (r) {
        var tr = document.createElement('tr');
        var th = document.createElement('th'); th.scope = 'row'; th.textContent = r[0];
        var td = document.createElement('td'); td.className = 'mono'; td.textContent = r[1] === '' ? '(empty)' : r[1];
        tr.appendChild(th); tr.appendChild(td); tbody.appendChild(tr);
      });
      parts.hidden = false;
    };
    function decodeSafe(s) { try { return decodeURIComponent(s); } catch (e) { return s; } }
    var encode = function () {
      if (!input.value) { showAlert(status, 'Enter text or a URL to encode.'); return; }
      try {
        var full = $('ue-mode').value === 'full';
        var out = full ? encodeURI(input.value) : encodeURIComponent(input.value);
        if ($('ue-plus').checked) out = out.replace(/%20/g, '+');
        output.value = out;
        showAlert(status, full ? 'Encoded as a full URL — characters such as : / ? & = # were kept.' : 'Encoded as a URL component — all reserved characters were percent-encoded.', 'success');
        showParts(input.value);
      } catch (e) { showAlert(status, 'This text contains an invalid character sequence (an unpaired surrogate) and cannot be encoded.'); }
    };
    var decode = function () {
      if (!input.value) { showAlert(status, 'Enter encoded text or a URL to decode.'); return; }
      var src = $('ue-plus').checked ? input.value.replace(/\+/g, ' ') : input.value;
      try {
        output.value = decodeURIComponent(src);
        showAlert(status, output.value === input.value ? 'Nothing to decode — the text contains no percent-encoded characters.' : 'Decoded successfully.', output.value === input.value ? 'info' : 'success');
        showParts(output.value);
      } catch (e) {
        var bad = src.match(/%(?![0-9a-fA-F]{2})|%[0-9a-fA-F]{2}/);
        showAlert(status, 'Could not decode: the text contains an invalid percent-encoding sequence' + (bad ? ' near “' + src.substr(src.indexOf(bad[0]), 6) + '”' : '') + '. A “%” must be followed by two hexadecimal digits (for example %20), and the bytes must form valid UTF-8.');
      }
    };
    on($('ue-encode'), 'click', encode);
    on($('ue-decode'), 'click', decode);
    bindCopy('ue-copy', function () { return output.value; });
    on($('ue-swap'), 'click', function () { input.value = output.value; output.value = ''; showAlert(status, ''); parts.hidden = true; input.focus(); });
    on($('ue-clear'), 'click', function () { input.value = ''; output.value = ''; showAlert(status, ''); parts.hidden = true; input.focus(); });
  };

  /* ---------- UUID Generator ---------- */
  tools['uuid-generator'] = function () {
    var output = $('ug-output'), err = $('ug-error'), count = $('ug-count');
    var generate = function () {
      var c = getCrypto();
      if (!c) { showAlert(err, 'Your browser does not support secure random numbers (Web Crypto API), so UUIDs cannot be generated safely.'); return; }
      var n = Number(count.value);
      if (!Number.isInteger(n) || n < 1 || n > 1000) { count.setAttribute('aria-invalid', 'true'); showAlert(err, 'Enter a whole number from 1 to 1,000.'); return; }
      count.removeAttribute('aria-invalid'); showAlert(err, '');
      var list = [];
      for (var i = 0; i < n; i++) {
        var u = Core.uuidV4(c);
        if ($('ug-nohyphen').checked) u = u.replace(/-/g, '');
        if ($('ug-upper').checked) u = u.toUpperCase();
        if ($('ug-braces').checked) u = '{' + u + '}';
        list.push(u);
      }
      output.value = list.join('\n');
    };
    on($('ug-generate'), 'click', generate);
    ['ug-upper', 'ug-nohyphen', 'ug-braces'].forEach(function (id) { on($(id), 'change', generate); });
    on(count, 'keydown', function (e) { if (e.key === 'Enter') generate(); });
    bindCopy('ug-copy', function () { return output.value; });
    bindDownload('ug-download', function () { return output.value; }, 'uuids.txt');
    var check = $('ug-check'), checkOut = $('ug-check-result');
    on(check, 'input', function () {
      if (!check.value.trim()) { showAlert(checkOut, ''); return; }
      var r = Core.inspectUUID(check.value);
      if (!r.valid) showAlert(checkOut, 'Not a valid UUID. A UUID has 32 hexadecimal digits, usually shown as 8-4-4-4-12.', 'error');
      else if (r.nil) showAlert(checkOut, 'Valid: this is the special “nil” UUID (all zeros).', 'success');
      else if (r.max) showAlert(checkOut, 'Valid: this is the special “max” UUID (all F’s).', 'success');
      else showAlert(checkOut, 'Valid UUID — version ' + r.version + (r.rfc ? ', standard RFC 9562 variant.' : ', non-standard variant.'), 'success');
    });
    generate();
  };

  /* ---------- Percentage Calculator ---------- */
  tools['percentage-calculator'] = function () {
    var num = function (id) { var v = $(id).value.trim(); return v === '' ? null : Number(v); };
    var out = function (id, html, isErr) { var el = $(id); el.innerHTML = html; el.classList.toggle('is-error', !!isErr); };
    var f = Core.fmt;
    var calc = {
      a: function () {
        var p = num('pc-a1'), x = num('pc-a2');
        if (p === null || x === null) return out('pc-a-out', '<small>Enter both values to see the result.</small>');
        out('pc-a-out', f(p / 100 * x) + '<small>' + f(p) + '% of ' + f(x) + ' = (' + f(p) + ' ÷ 100) × ' + f(x) + '</small>');
      },
      b: function () {
        var x = num('pc-b1'), y = num('pc-b2');
        if (x === null || y === null) return out('pc-b-out', '<small>Enter both values to see the result.</small>');
        if (y === 0) return out('pc-b-out', 'The second number can’t be 0 — you can’t take a percentage of zero.', true);
        out('pc-b-out', f(x / y * 100, 4) + '%<small>(' + f(x) + ' ÷ ' + f(y) + ') × 100</small>');
      },
      c: function () {
        var x = num('pc-c1'), y = num('pc-c2');
        if (x === null || y === null) return out('pc-c-out', '<small>Enter both values to see the result.</small>');
        if (x === 0) return out('pc-c-out', 'The starting value can’t be 0 — percentage change from zero is undefined.', true);
        var ch = (y - x) / Math.abs(x) * 100;
        var word = ch > 0 ? 'increase' : ch < 0 ? 'decrease' : 'no change';
        out('pc-c-out', (ch > 0 ? '+' : '') + f(ch, 4) + '% <span class="muted">(' + word + ')</span><small>((' + f(y) + ' − ' + f(x) + ') ÷ |' + f(x) + '|) × 100</small>');
      },
      d: function () {
        var x = num('pc-d1'), p = num('pc-d2'), up = $('pc-d-op').value === 'increase';
        if (x === null || p === null) return out('pc-d-out', '<small>Enter both values to see the result.</small>');
        var r = up ? x * (1 + p / 100) : x * (1 - p / 100);
        out('pc-d-out', f(r) + '<small>' + f(x) + ' ' + (up ? '+' : '−') + ' ' + f(p) + '% = ' + f(x) + ' × ' + f(up ? 1 + p / 100 : 1 - p / 100, 6) + ' (a change of ' + (up ? '+' : '−') + f(Math.abs(x * p / 100)) + ')</small>');
      }
    };
    ['a', 'b', 'c', 'd'].forEach(function (k) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-calc="' + k + '"]'), function (el) {
        on(el, 'input', calc[k]); on(el, 'change', calc[k]);
      });
      calc[k]();
    });
    on($('pc-clear'), 'click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('[data-calc] '), function (el) { if (el.tagName === 'INPUT') el.value = ''; });
      Object.keys(calc).forEach(function (k) { calc[k](); });
    });
  };

  /* ---------- Age Calculator ---------- */
  tools['age-calculator'] = function () {
    var dob = $('ag-dob'), at = $('ag-at'), err = $('ag-error'), result = $('ag-result');
    var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var today = new Date();
    var iso = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    at.value = iso(today);
    dob.max = iso(today);
    var plural = function (n, w) { return Core.fmt(n) + ' ' + w + (n === 1 ? '' : 's'); };
    var calc = function (fromButton) {
      var b = Core.parseDate(dob.value), t = Core.parseDate(at.value);
      if (!b) { result.hidden = true; if (fromButton) showAlert(err, 'Please enter a valid date of birth.'); else showAlert(err, ''); return; }
      if (!t) { result.hidden = true; showAlert(err, 'Please enter a valid “age on” date.'); return; }
      if (b.y < 1000) { result.hidden = true; showAlert(err, 'Please enter a four-digit birth year.'); return; }
      var a = Core.ageBetween(b, t);
      if (a.totalDays < 0) { result.hidden = true; showAlert(err, 'The date of birth is after the “age on” date. Please check both dates.'); return; }
      showAlert(err, '');
      setText('ag-main', plural(a.years, 'year') + ', ' + plural(a.months, 'month') + ', ' + plural(a.days, 'day'));
      setText('ag-sub', 'Born on a ' + DAYS[a.bornWeekday] + ', ' + b.d + ' ' + MONTHS[b.m - 1] + ' ' + b.y + '.');
      setText('ag-months', Core.fmt(a.totalMonths));
      setText('ag-weeks', Core.fmt(a.totalWeeks) + (a.weekRemainder ? ' + ' + a.weekRemainder + 'd' : ''));
      setText('ag-days', Core.fmt(a.totalDays));
      setText('ag-hours', '≈ ' + Core.fmt(a.totalDays * 24));
      setText('ag-next', a.daysToBirthday === 0 ? 'Today!' : plural(a.daysToBirthday, 'day'));
      setText('ag-next-sub', a.daysToBirthday === 0 ? 'Happy birthday — ' + a.nextAge + ' today' : 'Turns ' + a.nextAge + ' on ' + DAYS[a.nextWeekday] + ', ' + a.nextBirthday.d + ' ' + MONTHS[a.nextBirthday.m - 1] + ' ' + a.nextBirthday.y);
      result.hidden = false;
    };
    on(dob, 'change', function () { calc(false); });
    on(at, 'change', function () { calc(false); });
    on($('ag-calc'), 'click', function () { calc(true); });
    on($('ag-reset'), 'click', function () { dob.value = ''; at.value = iso(new Date()); result.hidden = true; showAlert(err, ''); dob.focus(); });
  };

  /* ---------- Discount Calculator ---------- */
  tools['discount-calculator'] = function () {
    var type = 'percent', err = $('dc-error'), result = $('dc-result');
    var num = function (id) { var v = $(id).value.trim(); return v === '' ? null : Number(v); };
    var setType = function (t) {
      type = t;
      $('dc-type-pct').setAttribute('aria-pressed', String(t === 'percent'));
      $('dc-type-amt').setAttribute('aria-pressed', String(t === 'amount'));
      setText('dc-value-label', t === 'percent' ? 'Discount (%)' : 'Discount amount');
      calc();
    };
    var calc = function () {
      var price = num('dc-price'), val = num('dc-value'), extra = num('dc-extra') || 0, tax = num('dc-tax') || 0;
      var money;
      try { money = new Intl.NumberFormat(undefined, { style: 'currency', currency: $('dc-currency').value }); }
      catch (e) { money = { format: function (n) { return n.toFixed(2); } }; }
      if (price === null || val === null) { result.hidden = true; showAlert(err, ''); return; }
      var problem = null;
      if (!(price > 0)) problem = 'Enter an original price greater than 0.';
      else if (val < 0) problem = 'The discount can’t be negative.';
      else if (type === 'percent' && val > 100) problem = 'A percentage discount can’t be more than 100%.';
      else if (type === 'amount' && val > price) problem = 'The discount amount can’t be larger than the original price.';
      else if (extra < 0 || extra > 100) problem = 'The extra discount must be between 0% and 100%.';
      else if (tax < 0 || tax > 100) problem = 'Sales tax must be between 0% and 100%.';
      if (problem) { result.hidden = true; showAlert(err, problem); return; }
      showAlert(err, '');
      var first = type === 'percent' ? price * val / 100 : val;
      var afterFirst = price - first;
      var second = afterFirst * extra / 100;
      var final = afterFirst - second;
      var saved = price - final;
      var taxAmt = final * tax / 100;
      setText('dc-final', money.format(final));
      setText('dc-save', money.format(saved));
      setText('dc-effective', Core.fmt(saved / price * 100, 2) + '%');
      setText('dc-tax-amt', money.format(taxAmt));
      setText('dc-total', money.format(final + taxAmt));
      var lines = ['Original price: ' + money.format(price),
        (type === 'percent' ? 'Discount ' + Core.fmt(val) + '%' : 'Discount') + ': −' + money.format(first) + ' → ' + money.format(afterFirst)];
      if (extra) lines.push('Extra ' + Core.fmt(extra) + '% off: −' + money.format(second) + ' → ' + money.format(final));
      if (tax) lines.push('Sales tax ' + Core.fmt(tax) + '%: +' + money.format(taxAmt) + ' → ' + money.format(final + taxAmt));
      setText('dc-breakdown', lines.join('\n'));
      $('dc-tax-row').hidden = !tax;
      result.hidden = false;
    };
    on($('dc-type-pct'), 'click', function () { setType('percent'); });
    on($('dc-type-amt'), 'click', function () { setType('amount'); });
    ['dc-price', 'dc-value', 'dc-extra', 'dc-tax'].forEach(function (id) { on($(id), 'input', calc); });
    on($('dc-currency'), 'change', calc);
    on($('dc-reset'), 'click', function () { ['dc-price', 'dc-value', 'dc-extra', 'dc-tax'].forEach(function (id) { $(id).value = ''; }); calc(); $('dc-price').focus(); });
    setType('percent');
  };

  /* ---------- BMI Calculator ---------- */
  tools['bmi-calculator'] = function () {
    var unit = 'metric', err = $('bm-error'), result = $('bm-result');
    var num = function (id) { var v = $(id).value.trim(); return v === '' ? null : Number(v); };
    var setUnit = function (u) {
      unit = u;
      $('bm-metric').setAttribute('aria-pressed', String(u === 'metric'));
      $('bm-imperial').setAttribute('aria-pressed', String(u === 'imperial'));
      $('bm-metric-fields').hidden = u !== 'metric';
      $('bm-imperial-fields').hidden = u !== 'imperial';
      calc();
    };
    var calc = function () {
      var m, kg;
      if (unit === 'metric') {
        var cm = num('bm-cm'); kg = num('bm-kg');
        if (cm === null || kg === null) { result.hidden = true; showAlert(err, ''); return; }
        if (cm < 50 || cm > 272) { result.hidden = true; showAlert(err, 'Please enter a height between 50 and 272 cm.'); return; }
        m = cm / 100;
      } else {
        var ft = num('bm-ft'), inch = num('bm-in') || 0, lb = num('bm-lb');
        if (ft === null || lb === null) { result.hidden = true; showAlert(err, ''); return; }
        if (ft < 0 || inch < 0 || inch >= 12) { result.hidden = true; showAlert(err, 'Inches must be between 0 and 11.9.'); return; }
        var totalIn = ft * 12 + inch;
        if (totalIn < 20 || totalIn > 107) { result.hidden = true; showAlert(err, 'Please enter a height between 1 ft 8 in and 8 ft 11 in.'); return; }
        m = totalIn * 0.0254; kg = lb * 0.45359237;
      }
      if (!(kg >= 2 && kg <= 635)) { result.hidden = true; showAlert(err, unit === 'metric' ? 'Please enter a weight between 2 and 635 kg.' : 'Please enter a weight between 5 and 1,400 lb.'); return; }
      showAlert(err, '');
      var r = Core.bmi(kg, m);
      setText('bm-value', r.value.toFixed(1));
      var cat = $('bm-cat');
      cat.textContent = r.category;
      cat.style.color = r.category === 'Healthy weight' ? 'var(--success)' : r.category === 'Underweight' ? '#2563eb' : r.category === 'Overweight' ? 'var(--warning)' : 'var(--danger)';
      $('bm-marker').style.left = Math.max(0, Math.min(100, (r.value - 15) / 25 * 100)) + '%';
      var range = unit === 'metric'
        ? Core.fmt(r.minKg, 1) + ' – ' + Core.fmt(r.maxKg, 1) + ' kg'
        : Core.fmt(r.minKg / 0.45359237, 1) + ' – ' + Core.fmt(r.maxKg / 0.45359237, 1) + ' lb';
      setText('bm-range', 'For your height, a BMI of 18.5–24.9 corresponds to a weight of about ' + range + '.');
      result.hidden = false;
    };
    on($('bm-metric'), 'click', function () { setUnit('metric'); });
    on($('bm-imperial'), 'click', function () { setUnit('imperial'); });
    ['bm-cm', 'bm-kg', 'bm-ft', 'bm-in', 'bm-lb'].forEach(function (id) { on($(id), 'input', calc); });
    on($('bm-reset'), 'click', function () { ['bm-cm', 'bm-kg', 'bm-ft', 'bm-in', 'bm-lb'].forEach(function (id) { $(id).value = ''; }); calc(); });
    setUnit('metric');
  };

  /* ---------- QR Code Generator ---------- */
  tools['qr-code-generator'] = function () {
    var text = $('qr-text'), canvas = $('qr-canvas'), err = $('qr-error'), warn = $('qr-warn');
    var current = null;
    if (!window.QRCodeEncoder) { showAlert(err, 'The QR encoder failed to load. Please refresh the page.'); return; }
    var luminance = function (hex) {
      var rgb = [1, 3, 5].map(function (i) { var c = parseInt(hex.substr(i, 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };
    var settings = function () {
      return { size: Number($('qr-size').value), ecl: $('qr-ecl').value, fg: $('qr-fg').value, bg: $('qr-bg').value, margin: Math.max(0, Math.min(10, parseInt($('qr-margin').value, 10) || 0)) };
    };
    var render = function () {
      var value = text.value;
      var s = settings();
      if (!value) { current = null; canvas.hidden = true; $('qr-empty').hidden = false; setText('qr-info', ''); showAlert(err, ''); showAlert(warn, ''); return; }
      var qr;
      try { qr = window.QRCodeEncoder.encode(value, s.ecl); }
      catch (e) {
        current = null; canvas.hidden = true; $('qr-empty').hidden = false;
        if (e.code === 'DATA_TOO_LONG') showAlert(err, 'Too much data for one QR code: your content is ' + Core.fmt(e.bytes) + ' bytes, but the limit at error correction level ' + s.ecl + ' is ' + Core.fmt(e.maxBytes) + ' bytes. Shorten the text or choose a lower error correction level.');
        else showAlert(err, 'Could not create the QR code: ' + e.message);
        return;
      }
      showAlert(err, '');
      current = { qr: qr, s: s };
      var total = qr.size + s.margin * 2;
      var scale = Math.max(1, Math.floor(s.size / total));
      canvas.width = canvas.height = total * scale;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = s.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = s.fg;
      for (var y = 0; y < qr.size; y++) for (var x = 0; x < qr.size; x++) {
        if (qr.isDark(x, y)) ctx.fillRect((x + s.margin) * scale, (y + s.margin) * scale, scale, scale);
      }
      canvas.hidden = false; $('qr-empty').hidden = true;
      canvas.setAttribute('aria-label', 'QR code for: ' + value.slice(0, 120));
      setText('qr-info', 'Version ' + qr.version + ' · ' + qr.size + ' × ' + qr.size + ' modules · ' + canvas.width + ' px · ' + Core.fmt(new Blob([value]).size) + ' bytes');
      var lf = luminance(s.fg), lb = luminance(s.bg), ratio = (Math.max(lf, lb) + 0.05) / (Math.min(lf, lb) + 0.05);
      if (lf > lb) showAlert(warn, 'The foreground is lighter than the background. Many scanners can’t read inverted QR codes — use a dark foreground on a light background.', 'warning');
      else if (ratio < 4) showAlert(warn, 'Low contrast between the colours may make this QR code hard to scan. Test it with your phone before printing.', 'warning');
      else if (s.margin < 2) showAlert(warn, 'A small quiet zone (margin) can make scanning less reliable. A margin of 4 modules is the standard.', 'warning');
      else showAlert(warn, '');
    };
    var debounced = debounce(render, 120);
    on(text, 'input', debounced);
    ['qr-size', 'qr-ecl', 'qr-fg', 'qr-bg', 'qr-margin'].forEach(function (id) { on($(id), 'input', debounced); on($(id), 'change', render); });
    on($('qr-png'), 'click', function () {
      if (!current) { U.toast('Enter some text or a URL first.', 'error'); return; }
      canvas.toBlob(function (blob) { if (blob) U.download(blob, 'qr-code.png'); }, 'image/png');
    });
    on($('qr-svg'), 'click', function () {
      if (!current) { U.toast('Enter some text or a URL first.', 'error'); return; }
      var qr = current.qr, s = current.s, total = qr.size + s.margin * 2, d = '';
      for (var y = 0; y < qr.size; y++) for (var x = 0; x < qr.size; x++) if (qr.isDark(x, y)) d += 'M' + (x + s.margin) + ' ' + (y + s.margin) + 'h1v1h-1z';
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total + '" width="' + s.size + '" height="' + s.size + '" shape-rendering="crispEdges">' +
        '<rect width="100%" height="100%" fill="' + s.bg + '"/><path fill="' + s.fg + '" d="' + d + '"/></svg>';
      U.download(svg, 'qr-code.svg', 'image/svg+xml');
    });
    on($('qr-clear'), 'click', function () { text.value = ''; render(); text.focus(); });
    render();
  };

  /* ---------- Password Generator ---------- */
  tools['password-generator'] = function () {
    var out = $('pw-output'), err = $('pw-error'), range = $('pw-length'), numIn = $('pw-length-num');
    var meter = $('pw-meter'), bar = meter.querySelector('span');
    var c = getCrypto();
    var generate = function () {
      if (!c) { showAlert(err, 'Your browser does not support the Web Crypto API, which is required to generate secure passwords. Please update your browser.'); return; }
      var len = parseInt(numIn.value, 10);
      if (!(len >= 4 && len <= 128)) { numIn.setAttribute('aria-invalid', 'true'); showAlert(err, 'Choose a length between 4 and 128 characters.'); return; }
      numIn.removeAttribute('aria-invalid');
      var o = { length: len, upper: $('pw-upper').checked, lower: $('pw-lower').checked, digits: $('pw-digits').checked, symbols: $('pw-symbols').checked, noSimilar: $('pw-similar').checked };
      var r;
      try { r = Core.generatePassword(o, c); } catch (e) { showAlert(err, e.message); out.value = ''; return; }
      showAlert(err, '');
      out.value = r.password;
      var bits = Math.round(r.entropy);
      var level = bits < 40 ? ['Weak', 'is-bad', 25] : bits < 60 ? ['Fair', 'is-warn', 50] : bits < 80 ? ['Strong', 'is-ok', 75] : ['Very strong', 'is-ok', 100];
      meter.className = 'meter ' + level[1];
      bar.style.width = level[2] + '%';
      setText('pw-strength', level[0]);
      setText('pw-entropy', '≈ ' + bits + ' bits of entropy (' + r.poolSize + ' possible characters per position).');
    };
    on(range, 'input', function () { numIn.value = range.value; generate(); });
    on(numIn, 'input', function () { var v = parseInt(numIn.value, 10); if (v >= 4 && v <= 128) range.value = v; generate(); });
    ['pw-upper', 'pw-lower', 'pw-digits', 'pw-symbols', 'pw-similar'].forEach(function (id) { on($(id), 'change', generate); });
    on($('pw-regen'), 'click', generate);
    bindCopy('pw-copy', function () { return out.value; });
    generate();
  };

  /* ---------- SEO Word & Character Counter ---------- */
  tools['seo-word-counter'] = function () {
    var title = $('so-title'), desc = $('so-desc'), kw = $('so-keyword'), content = $('so-content');
    var ctx = document.createElement('canvas').getContext('2d');
    var px = function (s, font) { ctx.font = font; return Math.round(ctx.measureText(s).width); };
    var truncate = function (s, font, maxPx) {
      if (px(s, font) <= maxPx) return s;
      var g = Core.graphemes(s);
      while (g.length && px(g.join('') + ' …', font) > maxPx) g.pop();
      return g.join('').trim() + ' …';
    };
    var meter = function (id, value, ideal, max) {
      var m = $(id), bar = m.querySelector('span');
      bar.style.width = Math.min(100, value / max * 100) + '%';
      m.className = 'meter ' + (value === 0 ? '' : value > max ? 'is-bad' : value < ideal[0] ? 'is-warn' : 'is-ok');
    };
    var TITLE_FONT = '20px Arial', DESC_FONT = '14px Arial';
    var update = function () {
      var t = title.value, d = desc.value, k = kw.value.trim(), c = content.value;
      var tLen = Core.graphemes(t).length, dLen = Core.graphemes(d).length, tPx = px(t, TITLE_FONT), dPx = px(d, DESC_FONT);
      setText('so-title-count', tLen + ' characters · ≈ ' + tPx + ' px');
      setText('so-title-hint', !tLen ? 'Aim for roughly 50–60 characters.' : tPx > 600 ? 'Likely to be truncated in search results (over ≈ 600 px).' : tLen < 30 ? 'Quite short — consider describing the page more fully.' : 'Good length — likely to display in full.');
      meter('so-title-meter', tPx, [300, 600], 600);
      setText('so-desc-count', dLen + ' characters · ≈ ' + dPx + ' px');
      setText('so-desc-hint', !dLen ? 'Aim for roughly 120–160 characters.' : dLen > 160 ? 'May be shortened in search results (over ≈ 160 characters).' : dLen < 70 ? 'Quite short — a fuller summary can help searchers.' : 'Good length.');
      meter('so-desc-meter', dLen, [70, 160], 160);
      setText('so-serp-title', t ? truncate(t, TITLE_FONT, 600) : 'Your page title will appear here');
      setText('so-serp-desc', d ? (dLen > 160 ? Core.graphemes(d).slice(0, 157).join('').trim() + ' …' : d) : 'Your meta description will appear here. Search engines may show different text if they think it better matches the search.');

      var s = Core.textStats(c);
      setText('so-words', Core.fmt(s.words));
      setText('so-chars', Core.fmt(s.chars));
      setText('so-chars-ns', Core.fmt(s.charsNoSpaces));
      setText('so-sentences', Core.fmt(s.sentences));
      setText('so-paragraphs', Core.fmt(s.paragraphs));
      setText('so-reading', Core.formatDuration(s.readingSeconds));
      setText('so-avg', s.sentences ? Core.fmt(s.words / s.sentences, 1) : '0');
      var ease = Core.readingEase(c);
      setText('so-ease', ease === null ? '–' : Core.fmt(Math.max(0, Math.min(100, ease)), 0));
      setText('so-ease-label', ease === null ? 'Reading ease (needs 10+ words)' : 'Reading ease · ' + (ease >= 70 ? 'easy' : ease >= 50 ? 'fairly difficult' : 'difficult'));

      var checks = $('so-checks');
      checks.innerHTML = '';
      var add = function (ok, msg) { var li = document.createElement('li'); li.className = ok ? 'ok' : 'warn'; li.textContent = msg; checks.appendChild(li); };
      if (k) {
        var inContent = Core.countPhrase(c, k);
        var dens = s.words ? inContent * Core.countWords(k) / s.words * 100 : 0;
        add(Core.countPhrase(t, k) > 0, Core.countPhrase(t, k) > 0 ? 'Focus keyword appears in the title.' : 'Focus keyword does not appear in the title.');
        add(Core.countPhrase(d, k) > 0, Core.countPhrase(d, k) > 0 ? 'Focus keyword appears in the meta description.' : 'Focus keyword does not appear in the meta description.');
        var firstPara = c.split(/\n\s*\n/)[0] || '';
        add(Core.countPhrase(firstPara, k) > 0, Core.countPhrase(firstPara, k) > 0 ? 'Focus keyword appears in the first paragraph.' : 'Focus keyword does not appear in the first paragraph.');
        add(inContent > 0, 'Focus keyword used ' + inContent + ' time' + (inContent === 1 ? '' : 's') + ' in the content (' + Core.fmt(dens, 2) + '% of words).');
        if (dens > 3) add(false, 'The keyword makes up a large share of the text. Read it aloud — if it sounds repetitive, use natural variations instead.');
      } else {
        var li = document.createElement('li'); li.textContent = 'Enter a focus keyword to see where it appears.'; checks.appendChild(li);
      }
      if (s.words) add(s.words >= 300, s.words >= 300 ? 'Content has ' + Core.fmt(s.words) + ' words.' : 'Content has ' + Core.fmt(s.words) + ' words. Short pages can be fine if they fully answer the question.');

      var kwData = Core.topKeywords(c, 10);
      var fill = function (tbodyId, rows, emptyMsg) {
        var tb = $(tbodyId); tb.innerHTML = '';
        if (!rows.length) { var tr = document.createElement('tr'); var td = document.createElement('td'); td.colSpan = 3; td.className = 'muted'; td.textContent = emptyMsg; tr.appendChild(td); tb.appendChild(tr); return; }
        rows.forEach(function (r) {
          var tr = document.createElement('tr');
          [r.term, Core.fmt(r.count), Core.fmt(r.density, 2) + '%'].forEach(function (v) { var td = document.createElement('td'); td.textContent = v; tr.appendChild(td); });
          tb.appendChild(tr);
        });
      };
      fill('so-kw-body', kwData.words, 'Add content to see the most frequent words.');
      fill('so-phrase-body', kwData.phrases, 'No two-word phrase appears more than once yet.');
    };
    var debounced = debounce(update, 120);
    [title, desc, kw, content].forEach(function (el) { on(el, 'input', debounced); });
    on($('so-clear'), 'click', function () { [title, desc, kw, content].forEach(function (el) { el.value = ''; }); update(); title.focus(); });
    update();
  };

  /* ---------- Binary ⇄ Decimal ---------- */
  tools['binary-to-decimal'] = function () {
    var bin = $('bd-bin'), dec = $('bd-dec'), err1 = $('bd-error'), err2 = $('bd-error2');
    var fromBinary = function () {
      var outs = ['bd-dec-out', 'bd-hex-out', 'bd-oct-out'];
      if (!bin.value.trim()) { outs.forEach(function (id) { $(id).value = ''; }); showAlert(err1, ''); $('bd-steps-wrap').hidden = true; bin.removeAttribute('aria-invalid'); return; }
      var r = Core.parseBinary(bin.value);
      if (r.error) { outs.forEach(function (id) { $(id).value = ''; }); showAlert(err1, r.error); bin.setAttribute('aria-invalid', 'true'); $('bd-steps-wrap').hidden = true; return; }
      bin.removeAttribute('aria-invalid'); showAlert(err1, '');
      $('bd-dec-out').value = r.value.toString(10);
      $('bd-hex-out').value = Core.toBase(r.value, 16).toUpperCase();
      $('bd-oct-out').value = Core.toBase(r.value, 8);
      var bits = r.bits.replace(/^0+(?=.)/, '');
      if (bits.length <= 16) {
        var terms = [], vals = [];
        for (var i = 0; i < bits.length; i++) {
          var pow = bits.length - 1 - i;
          terms.push(bits[i] + '×2^' + pow);
          if (bits[i] === '1') vals.push(String(Math.pow(2, pow)));
        }
        setText('bd-steps', terms.join(' + ') + '\n= ' + (vals.length ? vals.join(' + ') : '0') + '\n= ' + (r.value < BigInt(0) ?(-r.value).toString() + ' (then apply the minus sign: ' + r.value.toString() + ')' : r.value.toString()));
        $('bd-steps-wrap').hidden = false;
      } else $('bd-steps-wrap').hidden = true;
    };
    var fromDecimal = function () {
      if (!dec.value.trim()) { $('bd-bin-out').value = ''; showAlert(err2, ''); dec.removeAttribute('aria-invalid'); return; }
      var r = Core.parseDecimal(dec.value);
      if (r.error) { $('bd-bin-out').value = ''; showAlert(err2, r.error); dec.setAttribute('aria-invalid', 'true'); return; }
      dec.removeAttribute('aria-invalid'); showAlert(err2, '');
      $('bd-bin-out').value = Core.toBase(r.value, 2);
    };
    on(bin, 'input', fromBinary);
    on(dec, 'input', fromDecimal);
    bindCopy('bd-copy-dec', function () { return $('bd-dec-out').value; });
    bindCopy('bd-copy-hex', function () { return $('bd-hex-out').value; });
    bindCopy('bd-copy-bin', function () { return $('bd-bin-out').value; });
    on($('bd-clear'), 'click', function () { bin.value = ''; dec.value = ''; fromBinary(); fromDecimal(); bin.focus(); });
    fromBinary(); fromDecimal();
  };

  /* ---------- Boot ---------- */
  var rootEl = document.querySelector('[data-tool]');
  if (rootEl && tools[rootEl.getAttribute('data-tool')]) {
    try { tools[rootEl.getAttribute('data-tool')](rootEl); }
    catch (e) {
      if (window.console) console.error(e);
      var box = document.createElement('div');
      box.className = 'alert alert-error';
      box.textContent = 'Sorry, this tool failed to start in your browser. Please make sure you are using an up-to-date browser and refresh the page.';
      rootEl.prepend(box);
    }
  }
})();
