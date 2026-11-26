/*!
 * ToolifyHub QR encoder — a compact, dependency-free QR Code (Model 2) generator.
 * Byte mode, versions 1–40, error correction L/M/Q/H, automatic mask selection.
 * Algorithm follows ISO/IEC 18004; structure inspired by Project Nayuki's
 * public-domain-style reference implementation (MIT licence).
 *
 * Usage: var qr = QRCodeEncoder.encode('text', 'M');
 *        qr.size, qr.version, qr.isDark(x, y)
 */
(function (global) {
  'use strict';

  var ECL = { L: { ord: 0, bits: 1 }, M: { ord: 1, bits: 0 }, Q: { ord: 2, bits: 3 }, H: { ord: 3, bits: 2 } };

  var ECC_CODEWORDS_PER_BLOCK = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
  ];
  var NUM_ERROR_CORRECTION_BLOCKS = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
  ];

  function getBit(x, i) { return ((x >>> i) & 1) !== 0; }

  function numRawDataModules(ver) {
    var result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }

  function numDataCodewords(ver, ecl) {
    return Math.floor(numRawDataModules(ver) / 8) - ECC_CODEWORDS_PER_BLOCK[ecl.ord][ver] * NUM_ERROR_CORRECTION_BLOCKS[ecl.ord][ver];
  }

  /** Maximum number of bytes that fit at a given version / error correction level (byte mode). */
  function byteCapacity(ver, ecl) {
    var ccBits = ver < 10 ? 8 : 16;
    return Math.floor((numDataCodewords(ver, ecl) * 8 - 4 - ccBits) / 8);
  }

  /* ---- Reed–Solomon over GF(2^8) with polynomial 0x11D ---- */
  function rsMultiply(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }
  function rsDivisor(degree) {
    var result = [];
    for (var i = 0; i < degree - 1; i++) result.push(0);
    result.push(1);
    var root = 1;
    for (i = 0; i < degree; i++) {
      for (var j = 0; j < result.length; j++) {
        result[j] = rsMultiply(result[j], root);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      root = rsMultiply(root, 0x02);
    }
    return result;
  }
  function rsRemainder(data, divisor) {
    var result = divisor.map(function () { return 0; });
    data.forEach(function (b) {
      var factor = b ^ result.shift();
      result.push(0);
      divisor.forEach(function (coef, i) { result[i] ^= rsMultiply(coef, factor); });
    });
    return result;
  }

  function utf8Bytes(str) {
    if (typeof TextEncoder !== 'undefined') return Array.prototype.slice.call(new TextEncoder().encode(str));
    var out = [], s = unescape(encodeURIComponent(str));
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }

  function encode(text, eclName) {
    var ecl = ECL[eclName] || ECL.M;
    var bytes = utf8Bytes(String(text));

    var version = 0;
    for (var v = 1; v <= 40; v++) {
      if (bytes.length <= byteCapacity(v, ecl)) { version = v; break; }
    }
    if (!version) {
      var err = new Error('Data too long');
      err.code = 'DATA_TOO_LONG';
      err.maxBytes = byteCapacity(40, ecl);
      err.bytes = bytes.length;
      throw err;
    }

    // Data bits: mode indicator, character count, payload, terminator, padding
    var bits = [];
    var push = function (val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    push(0x4, 4);
    push(bytes.length, version < 10 ? 8 : 16);
    bytes.forEach(function (b) { push(b, 8); });
    var capacityBits = numDataCodewords(version, ecl) * 8;
    push(0, Math.min(4, capacityBits - bits.length));
    push(0, (8 - bits.length % 8) % 8);
    for (var pad = 0xEC; bits.length < capacityBits; pad ^= 0xEC ^ 0x11) push(pad, 8);

    var dataCodewords = [];
    for (var i = 0; i < bits.length; i += 8) {
      var byte = 0;
      for (var k = 0; k < 8; k++) byte = (byte << 1) | bits[i + k];
      dataCodewords.push(byte);
    }

    var allCodewords = addEccAndInterleave(dataCodewords, version, ecl);
    return buildMatrix(allCodewords, version, ecl);
  }

  function addEccAndInterleave(data, ver, ecl) {
    var numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ecl.ord][ver];
    var blockEccLen = ECC_CODEWORDS_PER_BLOCK[ecl.ord][ver];
    var rawCodewords = Math.floor(numRawDataModules(ver) / 8);
    var numShortBlocks = numBlocks - rawCodewords % numBlocks;
    var shortBlockLen = Math.floor(rawCodewords / numBlocks);

    var blocks = [];
    var divisor = rsDivisor(blockEccLen);
    for (var i = 0, k = 0; i < numBlocks; i++) {
      var dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
      k += dat.length;
      var ecc = rsRemainder(dat, divisor);
      if (i < numShortBlocks) dat.push(0);
      blocks.push(dat.concat(ecc));
    }

    var result = [];
    for (i = 0; i < blocks[0].length; i++) {
      for (var j = 0; j < blocks.length; j++) {
        if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(blocks[j][i]);
      }
    }
    return result;
  }

  function alignmentPositions(ver, size) {
    if (ver === 1) return [];
    var numAlign = Math.floor(ver / 7) + 2;
    var step = Math.floor((ver * 8 + numAlign * 3 + 5) / (numAlign * 4 - 4)) * 2;
    var result = [6];
    for (var pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  }

  function buildMatrix(codewords, ver, ecl) {
    var size = ver * 4 + 17;
    var modules = [], isFunction = [];
    for (var y = 0; y < size; y++) {
      modules.push(new Array(size).fill(false));
      isFunction.push(new Array(size).fill(false));
    }
    function setFn(x, y, dark) { modules[y][x] = dark; isFunction[y][x] = true; }

    // Timing patterns
    for (var i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); }
    // Finder patterns (with separators)
    [[3, 3], [size - 4, 3], [3, size - 4]].forEach(function (c) {
      for (var dy = -4; dy <= 4; dy++) {
        for (var dx = -4; dx <= 4; dx++) {
          var dist = Math.max(Math.abs(dx), Math.abs(dy));
          var xx = c[0] + dx, yy = c[1] + dy;
          if (xx >= 0 && xx < size && yy >= 0 && yy < size) setFn(xx, yy, dist !== 2 && dist !== 4);
        }
      }
    });
    // Alignment patterns
    var pos = alignmentPositions(ver, size);
    var n = pos.length;
    for (i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
        for (var ay = -2; ay <= 2; ay++) {
          for (var ax = -2; ax <= 2; ax++) setFn(pos[i] + ax, pos[j] + ay, Math.max(Math.abs(ax), Math.abs(ay)) !== 1);
        }
      }
    }

    function drawFormatBits(mask) {
      var data = (ecl.bits << 3) | mask;
      var rem = data;
      for (var r = 0; r < 10; r++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var bits = ((data << 10) | rem) ^ 0x5412;
      for (var a = 0; a <= 5; a++) setFn(8, a, getBit(bits, a));
      setFn(8, 7, getBit(bits, 6));
      setFn(8, 8, getBit(bits, 7));
      setFn(7, 8, getBit(bits, 8));
      for (a = 9; a < 15; a++) setFn(14 - a, 8, getBit(bits, a));
      for (a = 0; a < 8; a++) setFn(size - 1 - a, 8, getBit(bits, a));
      for (a = 8; a < 15; a++) setFn(8, size - 15 + a, getBit(bits, a));
      setFn(8, size - 8, true); // dark module
    }
    drawFormatBits(0); // reserve area

    // Version information (v7+)
    if (ver >= 7) {
      var rem = ver;
      for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var vbits = (ver << 12) | rem;
      for (i = 0; i < 18; i++) {
        var bit = getBit(vbits, i);
        var a = size - 11 + i % 3, b = Math.floor(i / 3);
        setFn(a, b, bit);
        setFn(b, a, bit);
      }
    }

    // Place codewords in zig-zag order
    var bitIndex = 0, totalBits = codewords.length * 8;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var k = 0; k < 2; k++) {
          var x = right - k;
          var upward = ((right + 1) & 2) === 0;
          var yy = upward ? size - 1 - vert : vert;
          if (!isFunction[yy][x] && bitIndex < totalBits) {
            modules[yy][x] = getBit(codewords[bitIndex >>> 3], 7 - (bitIndex & 7));
            bitIndex++;
          }
        }
      }
    }

    function applyMask(mask) {
      for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
          var inv;
          switch (mask) {
            case 0: inv = (x + y) % 2 === 0; break;
            case 1: inv = y % 2 === 0; break;
            case 2: inv = x % 3 === 0; break;
            case 3: inv = (x + y) % 3 === 0; break;
            case 4: inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
            case 5: inv = (x * y) % 2 + (x * y) % 3 === 0; break;
            case 6: inv = ((x * y) % 2 + (x * y) % 3) % 2 === 0; break;
            default: inv = ((x + y) % 2 + (x * y) % 3) % 2 === 0;
          }
          if (inv && !isFunction[y][x]) modules[y][x] = !modules[y][x];
        }
      }
    }

    function penalty() {
      var score = 0, x, y, run, color;
      // N1: runs of 5+ same-colour modules in rows and columns
      for (y = 0; y < size; y++) {
        run = 1;
        for (x = 1; x <= size; x++) {
          if (x < size && modules[y][x] === modules[y][x - 1]) run++;
          else { if (run >= 5) score += 3 + (run - 5); run = 1; }
        }
      }
      for (x = 0; x < size; x++) {
        run = 1;
        for (y = 1; y <= size; y++) {
          if (y < size && modules[y][x] === modules[y - 1][x]) run++;
          else { if (run >= 5) score += 3 + (run - 5); run = 1; }
        }
      }
      // N2: 2x2 blocks
      for (y = 0; y < size - 1; y++) {
        for (x = 0; x < size - 1; x++) {
          color = modules[y][x];
          if (color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1]) score += 3;
        }
      }
      // N3: finder-like patterns 1011101 with 4 light modules on either side
      var pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
      function matchAt(get) {
        var m1 = true, m2 = true;
        for (var t = 0; t < 11; t++) {
          var v = get(t) ? 1 : 0;
          if (v !== pat1[t]) m1 = false;
          if (v !== pat2[t]) m2 = false;
          if (!m1 && !m2) return 0;
        }
        return (m1 ? 1 : 0) + (m2 ? 1 : 0);
      }
      for (y = 0; y < size; y++) {
        for (x = 0; x + 11 <= size; x++) {
          score += 40 * matchAt(function (t) { return modules[y][x + t]; });
          score += 40 * matchAt(function (t) { return modules[x + t][y]; });
        }
      }
      // N4: dark/light balance
      var dark = 0;
      for (y = 0; y < size; y++) for (x = 0; x < size; x++) if (modules[y][x]) dark++;
      var total = size * size;
      var kk = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
      score += Math.max(0, kk) * 10;
      return score;
    }

    var bestMask = 0, minPenalty = Infinity;
    for (var m = 0; m < 8; m++) {
      applyMask(m);
      drawFormatBits(m);
      var p = penalty();
      if (p < minPenalty) { minPenalty = p; bestMask = m; }
      applyMask(m); // undo (XOR)
    }
    applyMask(bestMask);
    drawFormatBits(bestMask);

    return {
      version: ver,
      size: size,
      mask: bestMask,
      modules: modules,
      isDark: function (x, y) { return x >= 0 && x < size && y >= 0 && y < size && modules[y][x]; }
    };
  }

  var api = { encode: encode, byteCapacity: function (ver, name) { return byteCapacity(ver, ECL[name] || ECL.M); } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.QRCodeEncoder = api;
})(typeof window !== 'undefined' ? window : this);
