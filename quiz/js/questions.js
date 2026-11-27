/*
  MathRush 7 question bank.

  Every topic is a list of generator functions. Each generator builds a brand-new
  question with random numbers, so no two games are the same. Topics follow the
  Grade 7 math standards: ratios (7.RP), number system (7.NS), expressions and
  equations (7.EE), geometry (7.G), and statistics and probability (7.SP).

  A question looks like this:
    {
      prompt:      HTML for the question,
      choices:     [{ key, html }, ...]   (4 answer choices),
      answer:      index of the correct choice,
      correctHtml: HTML of the correct answer,
      explain:     HTML that shows how to solve it,
      numeric:     the answer as a number (only when it can be typed in),
      figure:      optional SVG drawing
    }
*/
(function (global) {
  'use strict';

  // ---------- Small helpers ----------
  const MINUS = '−';
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const nz = (a, b) => { let n; do { n = ri(a, b); } while (n === 0); return n; };
  const nz2 = (a, b) => { let n; do { n = ri(a, b); } while (Math.abs(n) < 2); return n; };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // Rounds away floating point noise (0.1 + 0.2 = 0.30000000000000004).
  const round = (x, p = 6) => {
    const f = Math.pow(10, p);
    return Math.round(Number((x * f).toPrecision(12))) / f;
  };
  const sum = (arr) => arr.reduce((s, x) => s + x, 0);
  const fmtAbs = (a) => round(a, 6).toLocaleString('en-US', { maximumFractionDigits: 6 });
  const fmt = (n) => {
    n = round(n, 6);
    if (n === 0) return '0';
    return (n < 0 ? MINUS : '') + fmtAbs(Math.abs(n));
  };
  const paren = (n) => (n < 0 ? '(' + fmt(n) + ')' : fmt(n));
  const money = (x) => '$' + round(x, 2).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dollars = (x) => '$' + fmtAbs(x);
  const decimals = (x) => {
    const s = String(round(Math.abs(x), 6));
    const i = s.indexOf('.');
    return i < 0 ? 0 : s.length - i - 1;
  };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const V = (v) => '<var>' + v + '</var>';
  const fracHtml = (n, d) =>
    '<span class="frac"><span>' + n + '</span><span class="sr-only"> over </span><span>' + d + '</span></span>';
  const fracSigned = (n, d) => (n < 0 ? MINUS : '') + fracHtml(Math.abs(n), d);

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

  // ---------- Fractions ----------
  class Frac {
    constructor(n, d = 1) {
      if (d < 0) { n = -n; d = -d; }
      const g = gcd(n, d);
      this.n = n / g;
      this.d = d / g;
    }
    add(o) { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { return new Frac(this.n * o.n, this.d * o.d); }
    div(o) { return new Frac(this.n * o.d, this.d * o.n); }
    neg() { return new Frac(-this.n, this.d); }
    eq(o) { return this.n === o.n && this.d === o.d; }
    get value() { return this.n / this.d; }
    key() { return this.n + '/' + this.d; }
    // mixed = true shows 7/4 as 1 3/4
    html(mixed = true) {
      if (this.d === 1) return fmt(this.n);
      const sign = this.n < 0 ? MINUS : '';
      const a = Math.abs(this.n);
      if (mixed && a > this.d) return sign + Math.floor(a / this.d) + '<span class="sr-only"> and </span>' + fracHtml(a % this.d, this.d);
      return sign + fracHtml(a, this.d);
    }
  }
  const F = (n, d) => new Frac(n, d);

  // ---------- Algebra formatting ----------
  function termHtml(c, v, first) {
    const a = Math.abs(c);
    const body = v ? (a === 1 ? V(v) : fmtAbs(a) + V(v)) : fmtAbs(a);
    if (first) return (c < 0 ? MINUS : '') + body;
    return (c < 0 ? ' ' + MINUS + ' ' : ' + ') + body;
  }
  // terms: [[coefficient, variable], ...]  ('' is a constant)
  function expr(terms) {
    const t = terms.filter((x) => x[0] !== 0);
    if (!t.length) return '0';
    return t.map((x, i) => termHtml(x[0], x[1], i === 0)).join('');
  }
  const lin = (a, b, v = 'x') => expr([[a, v], [b, '']]);

  // ---------- Answer choices ----------
  function numStep(n) {
    if (Number.isInteger(n)) {
      const a = Math.abs(n);
      if (a >= 100) return pick([5, 10, 20]);
      if (a >= 20) return pick([1, 2, 5]);
      return 1;
    }
    return Math.pow(10, -decimals(n)) * pick([1, 2, 5, 10]);
  }
  const C = {
    num(n, unit = '', prefix = '') {
      n = round(n, 6);
      return {
        key: 'n' + prefix + n + unit, html: prefix + fmt(n) + unit, value: n, unit, prefix,
        near() {
          let m = n;
          for (let i = 0; i < 10 && (m === n || (n > 0 && m <= 0)); i++) m = round(n + pick([-3, -2, -1, 1, 2, 3]) * numStep(n), 6);
          return C.num(m, unit, prefix);
        },
      };
    },
    money(x) {
      x = round(x, 2);
      return {
        key: 'm' + x, html: money(x), value: x, unit: '', prefix: '$', isMoney: true,
        near: () => C.money(Math.max(0.05, x + pick([-1, 1]) * pick(x >= 20 ? [1, 2, 5, 10] : [0.05, 0.1, 0.25, 0.5, 1]))),
      };
    },
    frac(f) {
      return {
        key: 'f' + f.key(), html: f.html(), value: f.value,
        near() {
          const s = f.n < 0 ? -1 : 1;
          const a = Math.abs(f.n);
          const o = pick([[a + 1, f.d], [a, f.d + 1], [a + 1, f.d + 1], [Math.max(1, a - 1), f.d], [f.d, a || 1]]);
          return C.frac(F(s * o[0], o[1]));
        },
      };
    },
    text: (s) => ({ key: 't' + s, html: s }),
    sol: (x, v = 'x') => C.num(x, '', V(v) + ' = '),
  };

  // Puts the correct answer with up to 3 distinct wrong answers, in random order.
  function mc(correct, distractors, fallback) {
    const seen = new Set([correct.key]);
    const out = [];
    const tryAdd = (d) => {
      if (d && d.key && !seen.has(d.key) && !/NaN|Infinity|undefined/.test(d.html)) {
        seen.add(d.key);
        out.push(d);
      }
    };
    distractors.forEach((d) => { if (out.length < 3) tryAdd(d); });
    const fb = fallback || correct.near;
    for (let g = 0; out.length < 3 && fb && g < 60; g++) tryAdd(fb());
    const choices = shuffle([correct].concat(out));
    return { choices, answer: choices.indexOf(correct) };
  }

  function Q(prompt, correct, distractors, explain, opts = {}) {
    const q = Object.assign({ prompt, explain, correctHtml: correct.html }, mc(correct, distractors, opts.fallback));
    if (opts.input && typeof correct.value === 'number') {
      q.numeric = correct.value;
      q.isMoney = !!correct.isMoney;
      q.inputPrefix = (correct.prefix || '').replace(/\s*=\s*$/, ' =');
      q.inputUnit = (correct.unit || '').trim();
    }
    if (opts.figure) q.figure = opts.figure;
    return q;
  }

  // ---------- Figures (SVG) ----------
  const FIG = {
    circle(label, diameter) {
      const line = diameter
        ? '<line x1="22" y1="80" x2="138" y2="80" class="fig-accent"/>'
        : '<line x1="80" y1="80" x2="138" y2="80" class="fig-accent"/>';
      return '<svg viewBox="0 0 160 160" role="img" aria-label="Circle with ' + (diameter ? 'diameter ' : 'radius ') + label + '">' +
        '<circle cx="80" cy="80" r="58" class="fig-shape"/>' + line +
        '<circle cx="80" cy="80" r="3.5" class="fig-dot"/>' +
        '<text x="' + (diameter ? 80 : 109) + '" y="71" text-anchor="middle">' + label + '</text></svg>';
    },
    triangle(a, b, c) {
      return '<svg viewBox="0 0 240 150" role="img" aria-label="Triangle with angles ' + a + ', ' + b + ', and ' + c + '">' +
        '<polygon points="20,128 220,128 92,22" class="fig-shape"/>' +
        '<text x="52" y="119" text-anchor="middle">' + a + '</text>' +
        '<text x="188" y="119" text-anchor="middle">' + b + '</text>' +
        '<text x="94" y="56" text-anchor="middle">' + c + '</text></svg>' +
        '<p class="fig-note">Not drawn to scale</p>';
    },
    triArea(base, height) {
      return '<svg viewBox="0 0 240 165" role="img" aria-label="Triangle with base ' + base + ' and height ' + height + '">' +
        '<polygon points="20,130 220,130 150,24" class="fig-shape"/>' +
        '<line x1="150" y1="24" x2="150" y2="130" class="fig-dash"/>' +
        '<polyline points="150,118 162,118 162,130" class="fig-thin"/>' +
        '<text x="120" y="153" text-anchor="middle">' + base + '</text>' +
        '<text x="143" y="88" text-anchor="end">' + height + '</text></svg>';
    },
    trapezoid(top, bottom, h) {
      return '<svg viewBox="0 0 240 160" role="img" aria-label="Trapezoid with bases ' + top + ' and ' + bottom + ' and height ' + h + '">' +
        '<polygon points="20,125 220,125 170,32 70,32" class="fig-shape"/>' +
        '<line x1="120" y1="32" x2="120" y2="125" class="fig-dash"/>' +
        '<polyline points="120,113 132,113 132,125" class="fig-thin"/>' +
        '<text x="120" y="22" text-anchor="middle">' + top + '</text>' +
        '<text x="120" y="148" text-anchor="middle">' + bottom + '</text>' +
        '<text x="113" y="84" text-anchor="end">' + h + '</text></svg>';
    },
    box(l, w, h) {
      return '<svg viewBox="0 0 260 175" role="img" aria-label="Rectangular prism ' + l + ' long, ' + w + ' wide, and ' + h + ' tall">' +
        '<polygon points="56,60 176,60 176,140 56,140" class="fig-shape"/>' +
        '<polygon points="56,60 104,26 224,26 176,60" class="fig-shape fig-top"/>' +
        '<polygon points="176,60 224,26 224,106 176,140" class="fig-shape fig-side"/>' +
        '<text x="116" y="162" text-anchor="middle">' + l + '</text>' +
        '<text x="48" y="105" text-anchor="end">' + h + '</text>' +
        '<text x="206" y="138" text-anchor="start">' + w + '</text></svg>';
    },
    rect(top, side) {
      return '<svg viewBox="0 0 240 140" role="img" aria-label="Rectangle">' +
        '<rect x="34" y="28" width="150" height="86" class="fig-shape"/>' +
        '<text x="109" y="19" text-anchor="middle">' + top + '</text>' +
        '<text x="192" y="76" text-anchor="start">' + side + '</text></svg>';
    },
  };

  // =====================================================================
  // Integers (7.NS.1, 7.NS.2, 7.NS.3)
  // =====================================================================
  function explainAdd(a, b) {
    const c = round(a + b, 6);
    const A = Math.abs(a), B = Math.abs(b);
    if (a === 0 || b === 0) return 'Adding 0 does not change a number, so the sum is ' + fmt(c) + '.';
    if ((a < 0) === (b < 0)) {
      return `Both numbers have the same sign, so add their absolute values (${fmtAbs(A)} + ${fmtAbs(B)} = ${fmtAbs(Math.abs(c))}) and keep the ${a < 0 ? 'negative' : 'positive'} sign: ${fmt(c)}.`;
    }
    if (c === 0) return `${fmt(a)} and ${fmt(b)} are opposites, so their sum is 0.`;
    const big = A > B ? a : b;
    return `The signs are different, so subtract the absolute values: ${fmtAbs(Math.max(A, B))} − ${fmtAbs(Math.min(A, B))} = ${fmtAbs(Math.abs(c))}. The answer takes the sign of ${fmt(big)}, which is farther from 0: ${fmt(c)}.`;
  }

  const integers = [
    function addIntegers() {
      const a = nz(-20, 20);
      let b = nz(-20, 20);
      if (a > 0 && b > 0) b = -b;
      const c = a + b, A = Math.abs(a), B = Math.abs(b);
      return Q(`${fmt(a)} + ${paren(b)} = ?`, C.num(c),
        [C.num(a - b), C.num(-c), C.num(A + B), C.num(-(A + B))],
        explainAdd(a, b), { input: true });
    },
    function subtractIntegers() {
      const a = nz(-15, 15);
      let b = nz(-15, 15);
      if (Math.random() < 0.7) b = -Math.abs(b);
      const c = a - b;
      return Q(`${fmt(a)} − ${paren(b)} = ?`, C.num(c),
        [C.num(a + b), C.num(b - a), C.num(-(Math.abs(a) + Math.abs(b)))],
        `Subtracting a number is the same as adding its opposite: ${fmt(a)} − ${paren(b)} = ${fmt(a)} + ${paren(-b)}. ${explainAdd(a, -b)}`,
        { input: true });
    },
    function multiplyIntegers() {
      let a = nz2(-12, 12);
      const b = nz2(-12, 12);
      if (a > 0 && b > 0) a = -a;
      const c = a * b;
      const same = (a < 0) === (b < 0);
      return Q(`${fmt(a)} × ${paren(b)} = ?`, C.num(c), [C.num(-c), C.num(a + b), C.num(a - b)],
        `${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(c)}. ${same ? 'A negative times a negative is positive' : 'A negative times a positive is negative'}, so the answer is ${fmt(c)}.`,
        { input: true });
    },
    function divideIntegers() {
      const q = nz2(-12, 12);
      let b = nz2(-9, 9);
      if (q > 0 && b > 0) b = -b;
      const a = q * b;
      const same = (a < 0) === (b < 0);
      return Q(`${fmt(a)} ÷ ${paren(b)} = ?`, C.num(q), [C.num(-q), C.num(q * 2)],
        `${Math.abs(a)} ÷ ${Math.abs(b)} = ${Math.abs(q)}. ${same ? 'The signs are the same, so the quotient is positive' : 'The signs are different, so the quotient is negative'}: ${fmt(q)}.`,
        { input: true });
    },
    function temperature() {
      const t0 = ri(-15, 6), ch = nz(-14, 18), t1 = t0 + ch, rose = ch > 0;
      return Q(`At 6 a.m. the temperature was ${fmt(t0)}°F. By noon it had ${rose ? 'risen' : 'dropped'} ${Math.abs(ch)}°F. What was the temperature at noon?`,
        C.num(t1, '°F'), [C.num(t0 - ch, '°F'), C.num(-t1, '°F'), C.num(Math.abs(t0) + Math.abs(ch), '°F')],
        `A ${rose ? 'rise means you add' : 'drop means you subtract'}: ${fmt(t0)} ${rose ? '+' : '−'} ${Math.abs(ch)} = ${fmt(t1)}°F.`,
        { input: true });
    },
    function elevation() {
      const high = ri(15, 90), low = -ri(10, 60);
      return Q(`A seagull is flying at an elevation of ${high} feet. A scuba diver is swimming at an elevation of ${fmt(low)} feet. How many feet apart are they?`,
        C.num(high - low, ' ft'), [C.num(high + low, ' ft'), C.num(low - high, ' ft'), C.num(high, ' ft')],
        `Subtract the lower elevation from the higher one: ${high} − (${fmt(low)}) = ${high} + ${Math.abs(low)} = ${high - low} feet.`,
        { input: true });
    },
    function orderOfOperations() {
      const a = nz2(-6, 6), b = ri(-6, 9);
      let c = ri(-6, 9);
      if (c === b) c = b - 3;
      const d = b - c, r = a * d;
      return Q(`${fmt(a)} × (${fmt(b)} − ${paren(c)}) = ?`, C.num(r), [C.num(a * b - c), C.num(-r), C.num(a * (b + c))],
        `Do the parentheses first: ${fmt(b)} − ${paren(c)} = ${fmt(d)}. Then multiply: ${fmt(a)} × ${paren(d)} = ${fmt(r)}.`,
        { input: true });
    },
    function absoluteValue() {
      const a = nz(-20, 20), b = nz(-20, 20), A = Math.abs(a), B = Math.abs(b);
      if (Math.random() < 0.5) {
        const r = A - B;
        return Q(`|${fmt(a)}| − |${fmt(b)}| = ?`, C.num(r), [C.num(a - b), C.num(-r), C.num(A + B)],
          `Absolute value is the distance from 0, so |${fmt(a)}| = ${A} and |${fmt(b)}| = ${B}. Then ${A} − ${B} = ${fmt(r)}.`,
          { input: true });
      }
      const d = a - b, r = Math.abs(d);
      return Q(`|${fmt(a)} − ${paren(b)}| = ?`, C.num(r), [C.num(-r), C.num(Math.abs(A - B)), C.num(A + B)],
        `Work inside the absolute value bars first: ${fmt(a)} − ${paren(b)} = ${fmt(d)}. The distance from ${fmt(d)} to 0 is ${r}.`,
        { input: true });
    },
  ];

  // =====================================================================
  // Fractions & decimals (7.NS.1, 7.NS.2, 7.NS.2d)
  // =====================================================================
  const DENS = [2, 3, 4, 5, 6, 8, 10, 12];
  const properFrac = () => { const d = pick(DENS); return F(ri(1, d - 1), d); };
  const showFrac = (f) => (f.n < 0 ? '(' + f.html(false) + ')' : f.html(false));
  const decHtml = (s) => s.replace(/\[(\d+)\]/, '<span class="rep">$1</span>');
  // [numerator, denominator, decimal ([..] marks the repeating part), wrong answers]
  const FRAC_DEC = [
    [1, 8, '0.125', ['0.18', '1.8', '0.8']],
    [3, 8, '0.375', ['0.38', '3.8', '2.[6]']],
    [5, 8, '0.625', ['0.58', '1.6', '0.85']],
    [7, 8, '0.875', ['0.78', '0.87', '1.14']],
    [3, 4, '0.75', ['0.34', '3.4', '1.[3]']],
    [2, 5, '0.4', ['0.25', '2.5', '0.04']],
    [3, 5, '0.6', ['0.35', '1.[6]', '0.06']],
    [7, 20, '0.35', ['0.72', '7.2', '0.035']],
    [9, 20, '0.45', ['0.92', '0.9', '0.045']],
    [1, 3, '0.[3]', ['0.13', '0.3', '3.3']],
    [2, 3, '0.[6]', ['0.23', '0.6', '1.5']],
    [1, 6, '0.1[6]', ['0.16', '0.[6]', '0.6']],
    [5, 6, '0.8[3]', ['0.56', '0.83', '1.2']],
    [1, 9, '0.[1]', ['0.19', '0.9', '0.09']],
    [4, 9, '0.[4]', ['0.49', '0.44', '2.25']],
    [2, 11, '0.[18]', ['0.211', '0.2', '0.18']],
    [5, 12, '0.41[6]', ['0.512', '0.42', '2.4']],
  ];

  const rational = [
    function addSubtractFractions() {
      let f1, f2;
      do { f1 = properFrac(); f2 = properFrac(); } while (f1.d === f2.d);
      if (Math.random() < 0.35) f1 = f1.neg();
      const plus = Math.random() < 0.5, op = plus ? '+' : '−';
      const r = plus ? f1.add(f2) : f1.sub(f2);
      const L = lcm(f1.d, f2.d), x = f1.n * (L / f1.d), y = f2.n * (L / f2.d), top = plus ? x + y : x - y;
      let why = `Rewrite both fractions with a common denominator of ${L}: ${fracSigned(x, L)} ${op} ${fracHtml(y, L)} = ${fracSigned(top, L)}`;
      if (r.d !== L) why += `, which simplifies to ${r.html()}`;
      else if (Math.abs(r.n) > r.d) why += ` = ${r.html()}`;
      return Q(`${f1.html(false)} ${op} ${f2.html(false)} = ?`, C.frac(r),
        [C.frac(F(f1.n + (plus ? f2.n : -f2.n), f1.d + f2.d)), C.frac(r.neg()), C.frac(plus ? f1.sub(f2) : f1.add(f2))],
        why + '.');
    },
    function multiplyFractions() {
      const a = properFrac();
      let b = properFrac();
      if (Math.random() < 0.4) b = b.neg();
      const r = a.mul(b);
      return Q(`${a.html(false)} × ${showFrac(b)} = ?`, C.frac(r),
        [C.frac(a.div(b)), C.frac(r.neg()), C.frac(F(a.n + b.n, a.d + b.d))],
        `Multiply the numerators and multiply the denominators: ${fracSigned(a.n * b.n, a.d * b.d)}${r.d !== a.d * b.d ? ` = ${r.html()}` : ''}.${b.n < 0 ? ' A positive times a negative is negative.' : ''}`);
    },
    function divideFractions() {
      const a = properFrac(), b = properFrac(), r = a.div(b);
      const recip = b.n === 1 ? String(b.d) : fracHtml(b.d, b.n);
      return Q(`${a.html(false)} ÷ ${b.html(false)} = ?`, C.frac(r),
        [C.frac(a.mul(b)), C.frac(F(r.d, r.n)), C.frac(F(a.n * b.n, a.d))],
        `Dividing by a fraction is the same as multiplying by its reciprocal: ${a.html(false)} × ${recip} = ${r.html()}.`);
    },
    function fractionToDecimal() {
      const [n, d, dec, wrong] = pick(FRAC_DEC);
      const s = Math.random() < 0.3 ? MINUS : '';
      const repeating = dec.indexOf('[') >= 0;
      const long = (Math.floor((n / d) * 1e6) / 1e6).toFixed(6);
      return Q(`Which decimal is equal to ${s}${fracHtml(n, d)}?`, C.text(s + decHtml(dec)), wrong.map((w) => C.text(s + decHtml(w))),
        repeating
          ? `Divide the numerator by the denominator: ${n} ÷ ${d} = ${long}… The digits keep repeating, so put a bar over the repeating part: ${s}${decHtml(dec)}.`
          : `Divide the numerator by the denominator: ${n} ÷ ${d} = ${dec}. So ${s}${fracHtml(n, d)} = ${s}${dec}.`);
    },
    function multiplyDecimals() {
      let a, b;
      do { a = nz(-45, 45) / 10; } while (Number.isInteger(a));
      if (Math.random() < 0.5) b = nz2(-9, 9);
      else do { b = nz(-25, 25) / 10; } while (Number.isInteger(b));
      if (a > 0 && b > 0) a = -a;
      const r = round(a * b, 4);
      const da = decimals(a), db = decimals(b), k = da + db;
      const A = Math.round(Math.abs(a) * Math.pow(10, da)), B = Math.round(Math.abs(b) * Math.pow(10, db));
      const raw = ((A * B) / Math.pow(10, k)).toFixed(k);
      const same = (a < 0) === (b < 0);
      return Q(`${fmt(a)} × ${paren(b)} = ?`, C.num(r), [C.num(r * 10), C.num(r / 10), C.num(-r)],
        `Multiply without the decimal points: ${A} × ${B} = ${A * B}. The factors have ${k} decimal place${k === 1 ? '' : 's'} in all, so the product does too: ${raw}. ${same ? 'Both factors are negative, so the product is positive' : 'One factor is negative, so the product is negative'}: ${fmt(r)}.`,
        { input: true });
    },
    function addSubtractDecimals() {
      const a = nz(-950, 950) / 100, b = nz(-95, 95) / 10, plus = Math.random() < 0.5;
      const r = round(plus ? a + b : a - b, 2);
      const why = plus
        ? `Line up the decimal points. ${explainAdd(a, b)}`
        : `Subtracting is the same as adding the opposite: ${fmt(a)} − ${paren(b)} = ${fmt(a)} + ${paren(-b)}. ${explainAdd(a, -b)}`;
      return Q(`${fmt(a)} ${plus ? '+' : '−'} ${paren(b)} = ?`, C.num(r),
        [C.num(plus ? a - b : a + b), C.num(-r), C.num(round(a + (plus ? b : -b) / 10, 3))], why, { input: true });
    },
    function compareRationals() {
      const greatest = Math.random() < 0.5;
      const items = [];
      for (let g = 0; items.length < 4 && g < 200; g++) {
        const d = pick([2, 4, 5, 8, 10]);
        const f = F(nz(-(2 * d - 1), d - 1), d);
        if (items.some((it) => Math.abs(it.f.value - f.value) < 1e-9)) continue;
        items.push({ f, c: C.text(Math.random() < 0.5 ? fmt(f.value) : f.html(false)) });
      }
      const sorted = items.slice().sort((x, y) => y.f.value - x.f.value);
      const target = greatest ? sorted[0] : sorted[sorted.length - 1];
      return Q(`Which number is the ${greatest ? 'greatest' : 'least'}?`, target.c, items.filter((it) => it !== target).map((it) => it.c),
        `Write each number as a decimal. From greatest to least: ${sorted.map((it) => fmt(it.f.value)).join(', ')}. The ${greatest ? 'greatest number is farthest to the right' : 'least number is farthest to the left'} on a number line: ${target.c.html}.`);
    },
    function recipe() {
      const per = pick([F(1, 2), F(2, 3), F(3, 4), F(1, 3), F(3, 8), F(5, 8)]);
      const batches = pick([F(3, 2), F(5, 2), F(2), F(3), F(7, 2), F(4)]);
      const r = per.mul(batches), ing = pick(['flour', 'sugar', 'milk', 'oats']);
      return Q(`A recipe uses ${per.html()} cup of ${ing} for one batch. How many cups of ${ing} do you need for ${batches.html()} batches?`, C.frac(r),
        [C.frac(per.add(batches)), C.frac(batches.div(per)), C.frac(per.div(batches))],
        `Multiply the amount for one batch by the number of batches: ${per.html(false)} × ${batches.html(false)} = ${r.html()} cups.`);
    },
  ];

  // =====================================================================
  // Ratios & rates (7.RP.1, 7.RP.2)
  // =====================================================================
  const ratios = [
    function unitPrice() {
      const [plural, single] = pick([['granola bars', 'bar'], ['pencils', 'pencil'], ['bottles of water', 'bottle'], ['markers', 'marker'], ['notebooks', 'notebook']]);
      const per = pick([0.35, 0.45, 0.6, 0.75, 0.85, 1.25, 1.5, 2.4, 0.9]);
      const n = ri(4, 12), total = round(per * n, 2);
      return Q(`A pack of ${n} ${plural} costs ${money(total)}. What is the price per ${single}?`, C.money(per),
        [C.money(round(n / total, 2)), C.money(round(total / (n - 2), 2)), C.money(per + 0.1)],
        `Unit price = total cost ÷ number of items = ${money(total)} ÷ ${n} = ${money(per)} per ${single}.`, { input: true });
    },
    function speed() {
      const [who, unit, per] = pick([['A car', 'miles', 'miles per hour'], ['A train', 'kilometers', 'kilometers per hour'], ['A cyclist', 'miles', 'miles per hour']]);
      const rate = who === 'A cyclist' ? ri(8, 16) : ri(35, 75);
      const t = pick([2, 3, 4, 5, 1.5, 2.5]), dist = round(rate * t, 2);
      return Q(`${who} travels ${fmt(dist)} ${unit} in ${fmt(t)} hours at a constant speed. What is its speed in ${per}?`, C.num(rate),
        [C.num(round(dist * t, 2)), C.num(rate + 5), C.num(rate - 5)],
        `Speed = distance ÷ time = ${fmt(dist)} ÷ ${fmt(t)} = ${rate} ${per}.`, { input: true });
    },
    function complexUnitRate() {
      const amt = pick([F(1, 2), F(2, 3), F(3, 4), F(1, 3), F(3, 5), F(5, 6)]);
      let time;
      do { time = pick([F(1, 4), F(1, 2), F(1, 3), F(3, 4), F(1, 6)]); } while (time.eq(amt));
      const r = amt.div(time);
      const ctx = pick([
        { q: `Maya walks ${amt.html()} mile every ${time.html()} hour. At this rate, how many miles per hour does Maya walk?`, u: 'miles per hour' },
        { q: `Leo paints ${amt.html()} of a fence in ${time.html()} hour. At this rate, how many fences can Leo paint in one hour?`, u: 'fences per hour' },
        { q: `A snail crawls ${amt.html()} foot in ${time.html()} hour. How many feet per hour is that?`, u: 'feet per hour' },
      ]);
      const recip = time.n === 1 ? String(time.d) : fracHtml(time.d, time.n);
      return Q(ctx.q, C.frac(r), [C.frac(amt.mul(time)), C.frac(time.div(amt)), C.frac(amt.add(time))],
        `Divide the amount by the time: ${amt.html()} ÷ ${time.html()} = ${amt.html()} × ${recip} = ${r.html()} ${ctx.u}.`);
    },
    function proportion() {
      const a = ri(1, 9);
      let b = ri(2, 12);
      if (b === a) b += 1;
      const k = ri(2, 6), c = a * k, d = b * k, x = V('x');
      if (Math.random() < 0.5) {
        return Q(`Solve for ${x}: ${fracHtml(a, b)} = ${fracHtml(x, d)}`, C.sol(c),
          [C.sol(d - (b - a)), C.sol(round((b * d) / a, 2)), C.sol(a + k)],
          `${b} × ${k} = ${d}, so multiply the numerator by ${k} too: ${x} = ${a} × ${k} = ${c}.`, { input: true });
      }
      return Q(`Solve for ${x}: ${fracHtml(a, b)} = ${fracHtml(c, x)}`, C.sol(d),
        [C.sol(c + (b - a)), C.sol(round((a * c) / b, 2)), C.sol(b + k)],
        `${a} × ${k} = ${c}, so multiply the denominator by ${k} too: ${x} = ${b} × ${k} = ${d}.`, { input: true });
    },
    function constantOfProportionality() {
      const k = pick([1.5, 2.5, 3, 3.5, 4, 0.5, 1.2, 6, 0.75, 2.4]);
      const xs = shuffle([2, 3, 4, 5, 6, 8, 10]).slice(0, 3).sort((p, q) => p - q);
      const ys = xs.map((x) => round(k * x, 2));
      const table = '<table class="mini-table"><tbody>' +
        `<tr><th scope="row">${V('x')}</th>${xs.map((x) => `<td>${fmt(x)}</td>`).join('')}</tr>` +
        `<tr><th scope="row">${V('y')}</th>${ys.map((y) => `<td>${fmt(y)}</td>`).join('')}</tr></tbody></table>`;
      const why = `In a proportional relationship, ${V('y')} ÷ ${V('x')} is the same for every pair: ${fmt(ys[0])} ÷ ${xs[0]} = ${fmt(k)} and ${fmt(ys[1])} ÷ ${xs[1]} = ${fmt(k)}. So the constant of proportionality is ${fmt(k)}`;
      if (Math.random() < 0.5) {
        return Q(`The table shows a proportional relationship. What is the constant of proportionality?${table}`, C.num(k),
          [C.num(round(ys[0] - xs[0], 2)), C.num(round(1 / k, 2)), C.num(k + 1)], why + '.', { input: true });
      }
      const eq = (rhs) => `${V('y')} = ${rhs}`;
      return Q(`The table shows a proportional relationship. Which equation represents it?${table}`, C.text(eq(fmt(k) + V('x'))),
        [C.text(eq(lin(1, round(ys[0] - xs[0], 2)))), C.text(`${V('x')} = ${fmt(k)}${V('y')}`), C.text(eq(lin(1, k))), C.text(eq(fmt(k + 1) + V('x')))],
        why + `, and the equation is ${eq(fmt(k) + V('x'))}.`);
    },
    function scaleDrawing() {
      const s = pick([5, 8, 12, 15, 20, 25, 40, 50]), d = pick([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 6]), r = round(s * d, 2);
      if (Math.random() < 0.6) {
        return Q(`On a map, 1 inch represents ${s} miles. Two towns are ${fmt(d)} inches apart on the map. What is the actual distance between the towns?`,
          C.num(r, ' miles'), [C.num(d + s, ' miles'), C.num(round(s / d, 2), ' miles'), C.num(r + s, ' miles')],
          `Each inch stands for ${s} miles, so multiply: ${fmt(d)} × ${s} = ${fmt(r)} miles.`, { input: true });
      }
      return Q(`On a map, 1 inch represents ${s} miles. Two cities are ${fmt(r)} miles apart. How far apart are they on the map?`,
        C.num(d, ' in.'), [C.num(r * s, ' in.'), C.num(r - s, ' in.'), C.num(d * 2, ' in.')],
        `Divide the actual distance by the miles in each inch: ${fmt(r)} ÷ ${s} = ${fmt(d)} inches.`, { input: true });
    },
    function betterBuy() {
      const [item, unit] = pick([['cereal', 'oz'], ['juice', 'fl oz'], ['shampoo', 'fl oz'], ['peanut butter', 'oz'], ['trail mix', 'oz']]);
      const sizes = shuffle([6, 8, 10, 12, 16, 18, 20, 24, 32]).slice(0, 4);
      const cents = shuffle([14, 16, 18, 20, 22, 24, 25, 28, 30, 32, 35]).slice(0, 4);
      const opts = sizes.map((s, i) => ({ s, up: cents[i] / 100, price: round((s * cents[i]) / 100, 2) }));
      opts.forEach((o) => { o.c = C.text(`${o.s} ${unit} for ${money(o.price)}`); });
      const best = opts.reduce((m, o) => (o.up < m.up ? o : m));
      const list = opts.slice().sort((p, q) => p.s - q.s).map((o) => `${o.s} ${unit}: ${money(o.price)} ÷ ${o.s} = ${money(o.up)}`).join('; ');
      return Q(`Which size of ${item} is the best buy?`, best.c, opts.filter((o) => o !== best).map((o) => o.c),
        `Find the unit price of each size (price ÷ size). ${list}. The lowest unit price is ${money(best.up)} per ${unit}, so ${best.s} ${unit} is the best buy.`);
    },
    function ratioProblem() {
      let a = ri(1, 7), b = ri(2, 9);
      if (a === b) b += 1;
      const g = gcd(a, b);
      a /= g; b /= g;
      const k = ri(2, 9);
      const [A, B, place, all] = pick([['boys', 'girls', 'a robotics club', 'students'], ['red marbles', 'blue marbles', 'a bag', 'marbles'], ['cats', 'dogs', 'an animal shelter', 'animals'], ['fiction books', 'nonfiction books', 'a classroom library', 'books']]);
      if (Math.random() < 0.5) {
        return Q(`In ${place}, the ratio of ${A} to ${B} is ${a}:${b}. There are ${b * k} ${B}. How many ${A} are there?`, C.num(a * k),
          [C.num(b * k - (b - a)), C.num(round((b * k * b) / a, 2)), C.num(a * k + b * k)],
          `${b * k} ÷ ${b} = ${k}, so each part of the ratio stands for ${k}. ${cap(A)}: ${a} × ${k} = ${a * k}.`, { input: true });
      }
      const total = (a + b) * k;
      return Q(`In ${place}, the ratio of ${A} to ${B} is ${a}:${b}. There are ${total} ${all} in all. How many ${A} are there?`, C.num(a * k),
        [C.num(b * k), C.num(round(total / a, 2)), C.num(total - a)],
        `The ratio has ${a} + ${b} = ${a + b} parts. ${total} ÷ ${a + b} = ${k} in each part. ${cap(A)}: ${a} × ${k} = ${a * k}.`, { input: true });
    },
  ];

  // =====================================================================
  // Percents (7.RP.3)
  // =====================================================================
  const ITEMS = ['pair of sneakers', 'video game', 'backpack', 'skateboard', 'jacket', 'board game', 'pair of headphones'];

  const percents = [
    function percentOfNumber() {
      const p = pick([5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 60, 75, 80, 120, 150]);
      const n = ri(2, 20) * pick([10, 20]), r = round((p * n) / 100, 2);
      return Q(`What is ${p}% of ${fmt(n)}?`, C.num(r), [C.num(r * 10), C.num(r / 10), C.num(Math.abs(n - r))],
        `${p}% = ${fmt(p / 100)}. Multiply: ${fmt(p / 100)} × ${fmt(n)} = ${fmt(r)}.`, { input: true });
    },
    function salesTax() {
      const price = ri(12, 140), rate = pick([5, 6, 7, 8, 9, 10]);
      const tax = round((price * rate) / 100, 2), total = round(price + tax, 2);
      return Q(`A ${pick(ITEMS)} costs ${dollars(price)}. The sales tax is ${rate}%. What is the total cost with tax?`, C.money(total),
        [C.money(tax), C.money(price + rate), C.money(price - tax)],
        `Tax = ${rate}% of ${dollars(price)} = ${fmt(rate / 100)} × ${price} = ${money(tax)}. Total = ${money(price)} + ${money(tax)} = ${money(total)}.`,
        { input: true });
    },
    function discount() {
      const price = ri(4, 30) * 5, d = pick([10, 15, 20, 25, 30, 40, 50, 60]);
      const off = round((price * d) / 100, 2), sale = round(price - off, 2);
      return Q(`A ${pick(ITEMS)} normally costs ${dollars(price)}. It is on sale for ${d}% off. What is the sale price?`, C.money(sale),
        [C.money(off), C.money(price - d), C.money(price + off)],
        `Discount = ${d}% of ${dollars(price)} = ${money(off)}. Sale price = ${money(price)} − ${money(off)} = ${money(sale)}.`, { input: true });
    },
    function markup() {
      const cost = ri(4, 40) * 5, m = pick([20, 25, 30, 40, 50, 60, 75, 100]);
      const up = round((cost * m) / 100, 2), sell = round(cost + up, 2);
      return Q(`A store buys a ${pick(ITEMS)} for ${dollars(cost)} and marks the price up by ${m}%. What is the selling price?`, C.money(sell),
        [C.money(up), C.money(cost - up), C.money(cost + m)],
        `Markup = ${m}% of ${dollars(cost)} = ${money(up)}. Selling price = ${money(cost)} + ${money(up)} = ${money(sell)}.`, { input: true });
    },
    function tip() {
      const bill = ri(18, 96), rate = pick([10, 15, 18, 20, 25]), t = round((bill * rate) / 100, 2);
      return Q(`Your family's restaurant bill is ${dollars(bill)}. You want to leave a ${rate}% tip. How much is the tip?`, C.money(t),
        [C.money(bill + t), C.money(rate), C.money(t * 10)],
        `${rate}% = ${fmt(rate / 100)}, so the tip is ${fmt(rate / 100)} × ${dollars(bill)} = ${money(t)}.${rate === 10 ? ' Shortcut: to find 10%, move the decimal point one place to the left.' : ''}`,
        { input: true });
    },
    function percentChange() {
      const [thing, isMoney] = pick([['price of a movie ticket', true], ['number of members in the robotics club', false], ['number of visitors to a museum each day', false], ['price of a school hoodie', true]]);
      let o, p;
      do {
        o = pick(isMoney ? [20, 25, 40, 50, 60, 80] : [20, 25, 40, 50, 60, 80, 120, 200, 250, 400]);
        p = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]);
      } while ((o * p) % 100 !== 0);
      const up = Math.random() < 0.55, ch = (o * p) / 100, nw = up ? o + ch : o - ch;
      const show = (v) => (isMoney ? dollars(v) : fmt(v));
      const word = up ? 'increase' : 'decrease', other = up ? 'decrease' : 'increase';
      return Q(`The ${thing} went from ${show(o)} to ${show(nw)}. What is the percent change?`, C.text(`${p}% ${word}`),
        [C.text(`${p}% ${other}`), C.text(`${fmt(round((ch / nw) * 100, 1))}% ${word}`), C.text(`${fmt(ch)}% ${word}`)],
        `Find the amount of change: ${show(Math.max(o, nw))} − ${show(Math.min(o, nw))} = ${show(ch)}. Divide by the original amount: ${fmt(ch)} ÷ ${fmt(o)} = ${fmt(p / 100)} = ${p}%. The value went ${up ? 'up' : 'down'}, so it is a ${p}% ${word}.`,
        { fallback: () => { let v; do { v = p + pick([-10, -5, 5, 10, 15]); } while (v <= 0); return C.text(`${v}% ${word}`); } });
    },
    function simpleInterest() {
      const P = pick([200, 300, 400, 500, 800, 1000, 1200, 1500, 2000]), r = pick([2, 3, 4, 5, 6, 2.5, 3.5]), t = ri(2, 6);
      const I = round((P * r * t) / 100, 2);
      return Q(`You put ${dollars(P)} in a savings account that earns ${fmt(r)}% simple interest each year. How much interest will you earn in ${t} years?`,
        C.money(I), [C.money(P + I), C.money((P * r) / 100), C.money(I * 10)],
        `Use I = P × r × t. I = ${fmt(P)} × ${fmt(r / 100)} × ${t} = ${money(I)}.`, { input: true });
    },
    function whatPercent() {
      let whole, p, part;
      do {
        whole = pick([20, 25, 40, 50, 60, 80, 120, 160, 200, 250]);
        p = pick([5, 10, 15, 20, 25, 30, 40, 45, 60, 75, 80]);
        part = (whole * p) / 100;
      } while (!Number.isInteger(part));
      const prompt = Math.random() < 0.5
        ? `${part} is what percent of ${whole}?`
        : `You answered ${part} out of ${whole} questions correctly. What percent of the questions did you get right?`;
      return Q(prompt, C.num(p, '%'), [C.num(round((whole / part) * 100, 1), '%'), C.num(100 - p, '%'), C.num(part, '%')],
        `Divide the part by the whole: ${part} ÷ ${whole} = ${fmt(p / 100)}. Multiply by 100 to write it as a percent: ${p}%.`, { input: true });
    },
    function findWhole() {
      let p, n, part;
      do { p = pick([10, 20, 25, 40, 50, 15, 30, 75, 5]); n = ri(4, 40) * 5; part = (n * p) / 100; } while (!Number.isInteger(part));
      return Q(`${p}% of a number is ${part}. What is the number?`, C.num(n),
        [C.num(round((part * p) / 100, 2)), C.num(part + p), C.num(round(part * (1 + p / 100), 2))],
        `Write an equation: ${fmt(p / 100)} × ${V('n')} = ${part}. Divide both sides by ${fmt(p / 100)}: ${V('n')} = ${part} ÷ ${fmt(p / 100)} = ${n}.`,
        { input: true });
    },
  ];

  // =====================================================================
  // Expressions (7.EE.1, 7.EE.2)
  // =====================================================================
  const expressions = [
    function combineLikeTerms() {
      const v = pick(['x', 'y', 'n', 'a', 'm']);
      const a1 = ri(2, 9) * (Math.random() < 0.8 ? 1 : -1);
      let a2 = nz(-9, 9);
      while (a1 + a2 === 0) a2 = nz(-9, 9);
      const b1 = nz(-12, 12), b2 = nz(-12, 12);
      const terms = Math.random() < 0.5 ? [[a1, v], [b1, ''], [a2, v], [b2, '']] : [[a1, v], [b1, ''], [b2, ''], [a2, v]];
      const A = a1 + a2, B = b1 + b2;
      return Q(`Simplify: ${expr(terms)}`, C.text(lin(A, B, v)),
        [C.text(lin(a1 - a2, B, v)), C.text(lin(A, b1 - b2, v)), C.text(lin(-A, B, v)), A + B !== 0 ? C.text(termHtml(A + B, v, true)) : null],
        `Combine the ${V(v)} terms: ${expr([[a1, v], [a2, v]])} = ${expr([[A, v]])}. Combine the constants: ${expr([[b1, ''], [b2, '']])} = ${fmt(B)}. Together: ${lin(A, B, v)}.`);
    },
    function distribute() {
      const v = pick(['x', 'y', 'n']), k = nz2(-6, 6), a = ri(1, 5), b = nz(-9, 9);
      return Q(`Which expression is equivalent to ${fmt(k)}(${lin(a, b, v)})?`, C.text(lin(k * a, k * b, v)),
        [C.text(lin(k * a, b, v)), C.text(lin(k * a, -k * b, v)), C.text(lin(a, k * b, v)), C.text(lin(k + a, k + b, v))],
        `Multiply ${fmt(k)} by each term inside the parentheses: ${fmt(k)} × ${termHtml(a, v, true)} = ${termHtml(k * a, v, true)} and ${fmt(k)} × ${paren(b)} = ${fmt(k * b)}. So the expression is ${lin(k * a, k * b, v)}.`);
    },
    function factorGCF() {
      const v = pick(['x', 'y', 'n']);
      let g, a, b;
      do { g = ri(2, 8); a = ri(1, 6); b = ri(1, 9) * pick([1, -1]); } while (gcd(a, b) !== 1);
      const p = [2, 3, 5, 7].find((pr) => g % pr === 0 && pr < g);
      return Q(`Factor completely using the greatest common factor: ${lin(g * a, g * b, v)}`, C.text(`${g}(${lin(a, b, v)})`),
        [C.text(`${g}(${lin(g * a, b, v)})`), C.text(`${g}(${lin(a, g * b, v)})`), p ? C.text(`${p}(${lin((g * a) / p, (g * b) / p, v)})`) : null, C.text(`${g}(${lin(a, -b, v)})`), C.text(`${g * a}(${lin(1, b, v)})`)],
        `The greatest common factor of ${g * a} and ${Math.abs(g * b)} is ${g}. Divide each term by ${g}: ${termHtml(g * a, v, true)} ÷ ${g} = ${termHtml(a, v, true)} and ${fmt(g * b)} ÷ ${g} = ${fmt(b)}. So ${lin(g * a, g * b, v)} = ${g}(${lin(a, b, v)}).`);
    },
    function evaluate() {
      if (Math.random() < 0.6) {
        const a = nz2(-7, 7), b = nz(-12, 12), x = nz(-6, 6), r = a * x + b;
        const op = b < 0 ? '−' : '+';
        return Q(`Evaluate ${lin(a, b)} when ${V('x')} = ${fmt(x)}.`, C.num(r), [C.num(a * -x + b), C.num(a * x - b), C.num(a + x + b)],
          `Replace ${V('x')} with ${fmt(x)}: ${fmt(a)}(${fmt(x)}) ${op} ${Math.abs(b)} = ${fmt(a * x)} ${op} ${Math.abs(b)} = ${fmt(r)}.`, { input: true });
      }
      const p = nz2(-5, 5), q = nz2(-5, 5), A = nz(-6, 6), B = nz(-6, 6), r = p * A + q * B;
      return Q(`Evaluate ${expr([[p, 'a'], [q, 'b']])} when ${V('a')} = ${fmt(A)} and ${V('b')} = ${fmt(B)}.`, C.num(r),
        [C.num(p * A - q * B), C.num(-r), C.num(p * B + q * A)],
        `Replace the variables: ${fmt(p)}(${fmt(A)}) + ${paren(q)}(${fmt(B)}) = ${fmt(p * A)} + ${paren(q * B)} = ${fmt(r)}.`, { input: true });
    },
    function writeExpression() {
      const n = V('n'), a = ri(2, 9);
      let b = ri(2, 12);
      if (b === a) b += 1;
      const t = pick([
        [`${b} less than ${a} times a number ${n}`, `${a}${n} − ${b}`, [`${b} − ${a}${n}`, `${a}(${n} − ${b})`, `${a}${n} + ${b}`],
          `“${a} times a number” is ${a}${n}. “${b} less than” that means subtract ${b} from it: ${a}${n} − ${b}.`],
        [`${a} times the sum of a number ${n} and ${b}`, `${a}(${n} + ${b})`, [`${a}${n} + ${b}`, `${b}(${n} + ${a})`, `${n} + ${a + b}`],
          `“The sum of ${n} and ${b}” is ${n} + ${b}. It is one group, so it goes in parentheses before you multiply by ${a}: ${a}(${n} + ${b}).`],
        [`the quotient of a number ${n} and ${a}, increased by ${b}`, `${fracHtml(n, a)} + ${b}`, [`${fracHtml(a, n)} + ${b}`, fracHtml(n, a + b), `${a}${n} + ${b}`],
          `“The quotient of ${n} and ${a}” means ${n} ÷ ${a}, written ${fracHtml(n, a)}. “Increased by ${b}” means add ${b}.`],
        [`${b} more than the product of ${a} and a number ${n}`, `${a}${n} + ${b}`, [`${a}(${n} + ${b})`, `${b}${n} + ${a}`, `${a} + ${n} + ${b}`],
          `“The product of ${a} and ${n}” is ${a}${n}. “${b} more than” that means add ${b}: ${a}${n} + ${b}.`],
        [`a number ${n} decreased by ${b}, then multiplied by ${a}`, `${a}(${n} − ${b})`, [`${a}${n} − ${b}`, `${b} − ${a}${n}`, `${a}(${b} − ${n})`],
          `First ${n} is decreased by ${b}: ${n} − ${b}. Then that whole amount is multiplied by ${a}, so it needs parentheses: ${a}(${n} − ${b}).`],
        [`half of a number ${n}, minus ${b}`, `${fracHtml(n, 2)} − ${b}`, [fracHtml(`${n} − ${b}`, 2), `2${n} − ${b}`, `${b} − ${fracHtml(n, 2)}`],
          `“Half of ${n}” is ${fracHtml(n, 2)}. Then subtract ${b}: ${fracHtml(n, 2)} − ${b}.`],
      ]);
      return Q(`Which expression means “${t[0]}”?`, C.text(t[1]), t[2].map((s) => C.text(s)), t[3]);
    },
    function perimeterExpression() {
      const c = ri(2, 9), w = ri(2, 9);
      return Q(`A rectangle has a length of (${lin(1, c)}) units and a width of ${w} units. Which expression represents its perimeter?`,
        C.text(lin(2, 2 * c + 2 * w)), [C.text(lin(1, c + w)), C.text(lin(w, w * c)), C.text(lin(2, 2 * c + w))],
        `Perimeter = 2 × length + 2 × width = 2(${lin(1, c)}) + 2(${w}) = ${lin(2, 2 * c)} + ${2 * w} = ${lin(2, 2 * c + 2 * w)}.`,
        { figure: FIG.rect(`(<tspan class="fig-var">x</tspan> + ${c})`, String(w)) });
    },
  ];

  // =====================================================================
  // Equations & inequalities (7.EE.3, 7.EE.4)
  // =====================================================================
  const LT = (s) => (s === '<' ? '&lt;' : s === '>' ? '&gt;' : s);
  const FLIP = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' };

  const equations = [
    function twoStepEquation() {
      const v = pick(['x', 'y', 'n', 'm']);
      const a = nz2(-9, 9), b = nz(-15, 15), x = nz(-10, 10), c = a * x + b;
      return Q(`Solve for ${V(v)}: ${lin(a, b, v)} = ${fmt(c)}`, C.sol(x, v),
        [Number.isInteger((c + b) / a) ? C.sol((c + b) / a, v) : null, C.sol(-x, v), C.sol(x + (x > 0 ? 2 : -2), v)],
        `${b > 0 ? `Subtract ${b} from` : `Add ${-b} to`} both sides: ${termHtml(a, v, true)} = ${fmt(c - b)}. Then divide both sides by ${fmt(a)}: ${V(v)} = ${fmt(c - b)} ÷ ${paren(a)} = ${fmt(x)}.`,
        { input: true });
    },
    function distributiveEquation() {
      const p = nz2(-7, 7), q = nz(-9, 9), x = nz(-10, 10), r = p * (x + q);
      return Q(`Solve for ${V('x')}: ${fmt(p)}(${lin(1, q)}) = ${fmt(r)}`, C.sol(x),
        [C.sol(r / p + q), Number.isInteger((r - q) / p) ? C.sol((r - q) / p) : null, C.sol(-x)],
        `Divide both sides by ${fmt(p)}: ${lin(1, q)} = ${fmt(r / p)}. Then ${q > 0 ? `subtract ${q} from` : `add ${-q} to`} both sides: ${V('x')} = ${fmt(x)}.`,
        { input: true });
    },
    function divisionEquation() {
      const a = ri(2, 9) * (Math.random() < 0.25 ? -1 : 1), b = nz(-12, 12), k = nz(-8, 8), x = a * k, c = k + b;
      const left = fracHtml(V('x'), fmt(a));
      return Q(`Solve for ${V('x')}: ${left} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${fmt(c)}`, C.sol(x),
        [C.sol(a * (c + b)), C.sol(k), C.sol(c * a)],
        `${b > 0 ? `Subtract ${b} from` : `Add ${-b} to`} both sides: ${left} = ${fmt(k)}. Multiply both sides by ${fmt(a)}: ${V('x')} = ${fmt(k)} × ${paren(a)} = ${fmt(x)}.`,
        { input: true });
    },
    function solveInequality() {
      const a = nz2(-6, 6), b = nz(-12, 12), bound = nz(-8, 8), c = a * bound + b;
      const s = pick(['<', '>', '≤', '≥']), sol = a < 0 ? FLIP[s] : s;
      const ans = (sym, n) => C.text(`${V('x')} ${LT(sym)} ${fmt(n)}`);
      const wrong = (c + b) / a;
      return Q(`Solve: ${lin(a, b)} ${LT(s)} ${fmt(c)}`, ans(sol, bound),
        [ans(FLIP[sol], bound), ans(sol, -bound), Number.isInteger(wrong) ? ans(sol, wrong) : null, ans(FLIP[sol], -bound)],
        `${b > 0 ? `Subtract ${b} from` : `Add ${-b} to`} both sides: ${termHtml(a, 'x', true)} ${LT(s)} ${fmt(c - b)}. Divide both sides by ${fmt(a)}${a < 0 ? '. Dividing by a negative number flips the inequality sign' : ''}: ${V('x')} ${LT(sol)} ${fmt(bound)}.`);
    },
    function shoppingInequality() {
      let budget, price, fee, max;
      do {
        budget = pick([40, 50, 60, 75, 80, 100]); price = ri(6, 18); fee = ri(3, 9);
        max = Math.floor((budget - fee) / price);
      } while (max < 2 || (budget - fee) % price === 0);
      const s = V('s');
      const setup = `You have ${dollars(budget)} to spend. T-shirts cost ${dollars(price)} each, and there is a one-time shipping fee of ${dollars(fee)}.`;
      if (Math.random() < 0.5) {
        return Q(`${setup} Which inequality shows how many shirts, ${s}, you can buy?`, C.text(`${price}${s} + ${fee} ≤ ${budget}`),
          [C.text(`${price}${s} + ${fee} ≥ ${budget}`), C.text(`${fee}${s} + ${price} ≤ ${budget}`), C.text(`${price}${s} ≤ ${budget} + ${fee}`), C.text(`${price}${s} − ${fee} ≤ ${budget}`)],
          `${cap(s)} shirts cost ${price}${s} dollars. Add the ${dollars(fee)} fee to get ${price}${s} + ${fee}. The total can be at most ${dollars(budget)}, so use ≤.`);
      }
      return Q(`${setup} What is the greatest number of shirts you can buy?`, C.num(max),
        [C.num(max + 1), C.num(Math.floor(budget / price)), C.num(Math.ceil((budget + fee) / price))],
        `Solve ${price}${s} + ${fee} ≤ ${budget}. Subtract ${fee}: ${price}${s} ≤ ${budget - fee}. Divide by ${price}: ${s} ≤ ${budget - fee} ÷ ${price} ≈ ${fmt(round((budget - fee) / price, 2))}. You can only buy whole shirts, so the most you can buy is ${max}.`,
        { input: true });
    },
    function equationWordProblem() {
      if (Math.random() < 0.5) {
        const start = ri(2, 12) * 5, per = pick([5, 6, 8, 10, 12, 15]), w = ri(3, 12), goal = start + per * w;
        return Q(`Jada has ${dollars(start)} saved and adds ${dollars(per)} every week. After how many weeks will Jada have ${dollars(goal)}?`,
          C.num(w, ' weeks'), [Number.isInteger(goal / per) ? C.num(goal / per, ' weeks') : null, C.num(w + 1, ' weeks'), C.num(w - 1, ' weeks')],
          `Write an equation: ${start} + ${per}${V('w')} = ${goal}. Subtract ${start}: ${per}${V('w')} = ${goal - start}. Divide by ${per}: ${V('w')} = ${w} weeks.`,
          { input: true });
      }
      const fee = pick([20, 25, 30, 40, 50]), monthly = pick([15, 18, 20, 25, 30, 35]), m = ri(3, 12), total = fee + monthly * m;
      return Q(`A gym charges a ${dollars(fee)} sign-up fee plus ${dollars(monthly)} per month. Sam has paid ${dollars(total)} in all. How many months has Sam been a member?`,
        C.num(m, ' months'), [Number.isInteger(total / monthly) ? C.num(total / monthly, ' months') : null, C.num(m - 1, ' months'), C.num(Math.round((total + fee) / monthly), ' months')],
        `Write an equation: ${fee} + ${monthly}${V('m')} = ${total}. Subtract ${fee}: ${monthly}${V('m')} = ${total - fee}. Divide by ${monthly}: ${V('m')} = ${m} months.`,
        { input: true });
    },
    function whichEquation() {
      const x0 = nz(-6, 6);
      const make = (sol) => {
        const a = nz2(-6, 6), b = nz(-10, 10);
        return { a, b, c: a * sol + b, html: `${lin(a, b)} = ${fmt(a * sol + b)}` };
      };
      const right = make(x0);
      const op = right.b < 0 ? '−' : '+';
      return Q(`Which equation has the solution ${V('x')} = ${fmt(x0)}?`, C.text(right.html),
        [make(-x0), make(x0 + 1), make(x0 - 2), make(x0 + 3)].map((o) => C.text(o.html)),
        `Replace ${V('x')} with ${fmt(x0)} in each equation. Only one comes out true: ${fmt(right.a)}(${fmt(x0)}) ${op} ${Math.abs(right.b)} = ${fmt(right.a * x0)} ${op} ${Math.abs(right.b)} = ${fmt(right.c)}.`,
        { fallback: () => C.text(make(x0 + pick([-4, -3, 2, 4])).html) });
    },
  ];

  // =====================================================================
  // Geometry (7.G.1 to 7.G.6)
  // =====================================================================
  const UNITS = ['cm', 'm', 'in', 'ft'];
  const CROSS = [
    ['A cylinder is sliced parallel to its base. What shape is the cross section?', 'Circle', ['Rectangle', 'Triangle', 'Square'],
      'Every slice parallel to the base of a cylinder is a copy of the base, which is a circle.'],
    ['A cylinder is sliced straight down through its center, perpendicular to its base. What shape is the cross section?', 'Rectangle', ['Circle', 'Triangle', 'Trapezoid'],
      'A straight-down slice through a cylinder has two sides as tall as the cylinder and two sides as wide as the diameter, which makes a rectangle.'],
    ['A cone is sliced straight down through its tip, perpendicular to its base. What shape is the cross section?', 'Triangle', ['Circle', 'Rectangle', 'Square'],
      'The slice goes from the tip down to the diameter of the base, which makes a triangle.'],
    ['A right rectangular pyramid is sliced parallel to its base. What shape is the cross section?', 'Rectangle', ['Triangle', 'Circle', 'Pentagon'],
      'Slices parallel to the base of a pyramid are smaller copies of the base. The base is a rectangle.'],
    ['A cube is sliced parallel to one of its faces. What shape is the cross section?', 'Square', ['Triangle', 'Hexagon', 'Circle'],
      'A slice parallel to a face of a cube is the same size and shape as that face, which is a square.'],
    ['A sphere is sliced by a flat plane. What shape is the cross section?', 'Circle', ['Square', 'Triangle', 'Rectangle'],
      'Every flat slice of a sphere is a circle. Slices closer to the center make bigger circles.'],
  ];

  const geometry = [
    function circleArea() {
      const r = ri(2, 12), u = pick(UNITS), useD = Math.random() < 0.4, A = round(3.14 * r * r, 2);
      return Q(`Find the area of a circle with a ${useD ? 'diameter' : 'radius'} of ${useD ? 2 * r : r} ${u}. Use 3.14 for π.`, C.num(A, ` ${u}²`),
        [C.num(round(6.28 * r, 2), ` ${u}²`), C.num(round(3.14 * 4 * r * r, 2), ` ${u}²`), C.num(round(3.14 * r, 2), ` ${u}²`)],
        `${useD ? `The radius is half the diameter: ${2 * r} ÷ 2 = ${r} ${u}. ` : ''}A = πr² ≈ 3.14 × ${r}² = 3.14 × ${r * r} = ${fmt(A)} ${u}².`,
        { input: true, figure: FIG.circle(`${useD ? 2 * r : r} ${u}`, useD) });
    },
    function circumference() {
      const r = ri(2, 12), d = 2 * r, u = pick(UNITS), useR = Math.random() < 0.5, Cc = round(3.14 * d, 2);
      return Q(`Find the circumference of a circle with a ${useR ? 'radius' : 'diameter'} of ${useR ? r : d} ${u}. Use 3.14 for π.`, C.num(Cc, ` ${u}`),
        [C.num(round(3.14 * r * r, 2), ` ${u}`), C.num(round(3.14 * r, 2), ` ${u}`), C.num(round(3.14 * d * 2, 2), ` ${u}`)],
        `${useR ? `The diameter is twice the radius: 2 × ${r} = ${d} ${u}. ` : ''}C = πd ≈ 3.14 × ${d} = ${fmt(Cc)} ${u}.`,
        { input: true, figure: FIG.circle(`${useR ? r : d} ${u}`, !useR) });
    },
    function complementSupplement() {
      const comp = Math.random() < 0.5, a = comp ? ri(12, 78) : ri(15, 165), total = comp ? 90 : 180, r = total - a;
      const otherTotal = comp ? 180 : 90;
      return Q(`An angle measures ${a}°. What is the measure of its ${comp ? 'complement' : 'supplement'}?`, C.num(r, '°'),
        [otherTotal - a > 0 ? C.num(otherTotal - a, '°') : null, C.num(360 - a, '°'), C.num(a, '°')],
        `${comp ? 'Complementary angles add up to 90°' : 'Supplementary angles add up to 180°'}: ${total}° − ${a}° = ${r}°.`, { input: true });
    },
    function angleAlgebra() {
      const total = pick([90, 180]), name = total === 90 ? 'complementary' : 'supplementary';
      let a1, a2, b1, b2, x;
      do { x = ri(5, 25); a1 = ri(1, 5); a2 = ri(1, 4); b1 = ri(0, 20); b2 = total - (a1 + a2) * x - b1; } while (b2 < 0 || b2 > 60);
      const B = b1 + b2, wrongTotal = total === 90 ? 180 : 90, w = (wrongTotal - B) / (a1 + a2);
      const steps = B ? `Subtract ${B}: ${termHtml(a1 + a2, 'x', true)} = ${total - B}. ` : '';
      return Q(`Two angles are ${name}. One measures (${lin(a1, b1)})° and the other measures (${lin(a2, b2)})°. What is the value of ${V('x')}?`, C.num(x),
        [C.num(a1 * x + b1), Number.isInteger(w) && w > 0 ? C.num(w) : null, C.num(x + 5)],
        `${cap(name)} angles add up to ${total}°: (${lin(a1, b1)}) + (${lin(a2, b2)}) = ${total}. Combine like terms: ${lin(a1 + a2, B)} = ${total}. ${steps}Divide by ${a1 + a2}: ${V('x')} = ${x}.`,
        { input: true });
    },
    function triangleAngle() {
      let A, B;
      do { A = ri(25, 95); B = ri(20, 100); } while (A + B > 160);
      const Cc = 180 - A - B;
      return Q(`Two angles of a triangle measure ${A}° and ${B}°. What is the measure of the third angle?`, C.num(Cc, '°'),
        [C.num(360 - A - B, '°'), C.num(A + B, '°'), C.num(Math.abs(A - B), '°')],
        `The three angles of a triangle add up to 180°: 180° − ${A}° − ${B}° = ${Cc}°.`,
        { input: true, figure: FIG.triangle(`${A}°`, `${B}°`, '?') });
    },
    function triangleArea() {
      const b = ri(3, 16), h = ri(3, 14), u = pick(UNITS), A = (b * h) / 2;
      return Q(`What is the area of a triangle with a base of ${b} ${u} and a height of ${h} ${u}?`, C.num(A, ` ${u}²`),
        [C.num(b * h, ` ${u}²`), C.num(b + h, ` ${u}²`), C.num(2 * (b + h), ` ${u}²`)],
        `A = ½ × base × height = ½ × ${b} × ${h} = ${fmt(A)} ${u}².`,
        { input: true, figure: FIG.triArea(`${b} ${u}`, `${h} ${u}`) });
    },
    function trapezoidArea() {
      const b1 = ri(3, 10), b2 = b1 + ri(2, 8), h = ri(2, 10), u = pick(UNITS), A = ((b1 + b2) * h) / 2;
      return Q(`A trapezoid has bases of ${b1} ${u} and ${b2} ${u} and a height of ${h} ${u}. What is its area?`, C.num(A, ` ${u}²`),
        [C.num((b1 + b2) * h, ` ${u}²`), C.num(b2 * h, ` ${u}²`), C.num(b1 + b2 + h, ` ${u}²`)],
        `A = ½ × (base 1 + base 2) × height = ½ × (${b1} + ${b2}) × ${h} = ½ × ${b1 + b2} × ${h} = ${fmt(A)} ${u}².`,
        { input: true, figure: FIG.trapezoid(`${b1} ${u}`, `${b2} ${u}`, `${h} ${u}`) });
    },
    function prismVolume() {
      const l = ri(2, 12), w = ri(2, 9), h = ri(2, 10), u = pick(UNITS), Vol = l * w * h;
      return Q(`A rectangular prism is ${l} ${u} long, ${w} ${u} wide, and ${h} ${u} tall. What is its volume?`, C.num(Vol, ` ${u}³`),
        [C.num(2 * (l * w + l * h + w * h), ` ${u}³`), C.num(l + w + h, ` ${u}³`), C.num(l * w, ` ${u}³`)],
        `V = length × width × height = ${l} × ${w} × ${h} = ${Vol} ${u}³.`,
        { input: true, figure: FIG.box(`${l} ${u}`, `${w} ${u}`, `${h} ${u}`) });
    },
    function prismSurfaceArea() {
      const l = ri(2, 10), w = ri(2, 8), h = ri(2, 8), u = pick(UNITS), SA = 2 * (l * w + l * h + w * h);
      return Q(`What is the surface area of a rectangular prism that is ${l} ${u} long, ${w} ${u} wide, and ${h} ${u} tall?`, C.num(SA, ` ${u}²`),
        [C.num(l * w * h, ` ${u}²`), C.num(SA / 2, ` ${u}²`), C.num(6 * l * w, ` ${u}²`)],
        `Add the areas of all 6 faces: 2(${l} × ${w}) + 2(${l} × ${h}) + 2(${w} × ${h}) = ${2 * l * w} + ${2 * l * h} + ${2 * w * h} = ${SA} ${u}².`,
        { input: true, figure: FIG.box(`${l} ${u}`, `${w} ${u}`, `${h} ${u}`) });
    },
    function triangularPrismVolume() {
      const b = 2 * ri(1, 6), h = ri(2, 9), L = ri(3, 12), u = pick(UNITS), base = (b * h) / 2, Vol = base * L;
      return Q(`A triangular prism has a triangle base with a base of ${b} ${u} and a height of ${h} ${u}. The prism is ${L} ${u} long. What is its volume?`, C.num(Vol, ` ${u}³`),
        [C.num(b * h * L, ` ${u}³`), C.num(base + L, ` ${u}³`), C.num(b + h + L, ` ${u}³`)],
        `First find the area of the triangle base: ½ × ${b} × ${h} = ${base} ${u}². Then multiply by the length: ${base} × ${L} = ${Vol} ${u}³.`, { input: true });
    },
    function scaleFactorArea() {
      const w = ri(2, 8), l = ri(3, 10), k = ri(2, 4), A = w * l, newA = A * k * k;
      return Q(`A rectangle is ${w} cm by ${l} cm. It is enlarged using a scale factor of ${k}. What is the area of the new rectangle?`, C.num(newA, ' cm²'),
        [C.num(A * k, ' cm²'), C.num(A, ' cm²'), C.num(2 * (w + l) * k, ' cm²')],
        `Multiply each side by ${k}: the new rectangle is ${w * k} cm by ${l * k} cm. New area = ${w * k} × ${l * k} = ${newA} cm². The area grows by ${k}² = ${k * k} times, not ${k} times.`,
        { input: true });
    },
    function triangleInequality() {
      const make = (ok) => {
        const a = ri(2, 9), b = ri(a, 11);
        return [a, b, ok ? ri(b, a + b - 1) : ri(a + b, a + b + 5)];
      };
      const good = make(true), bads = [];
      while (bads.length < 3) {
        const s = make(false);
        if (!bads.some((x) => x.join() === s.join())) bads.push(s);
      }
      const show = (s) => shuffle(s).map((x) => `${x} cm`).join(', ');
      return Q('Which set of side lengths can form a triangle?', C.text(show(good)), bads.map((s) => C.text(show(s))),
        `In a triangle, the two shorter sides must add up to more than the longest side. ${good[0]} + ${good[1]} = ${good[0] + good[1]}, which is greater than ${good[2]}. In each of the other sets, the two shorter sides add up to the longest side or less, so they cannot meet to close a triangle.`);
    },
    function crossSection() {
      const [q, a, wrong, why] = pick(CROSS);
      return Q(q, C.text(a), wrong.map((s) => C.text(s)), why);
    },
  ];

  // =====================================================================
  // Probability & statistics (7.SP.1 to 7.SP.8)
  // =====================================================================
  const SAMPLING = [
    ['The student council wants to know what all students at the school think about the lunch menu. Which sample is most likely to represent the whole school?',
      'Survey 60 students picked at random from a list of every student',
      ['Survey 60 students on the basketball team', 'Survey the first 60 students who arrive in the morning', 'Survey 60 students in the math club'],
      'A random sample from the whole school gives every student the same chance of being picked, so it is the most likely to represent everyone.'],
    ['A city wants to estimate how many residents use the public library. Which method gives a random sample?',
      'Call 200 residents chosen at random from a list of all residents',
      ['Ask 200 people who are inside the library', 'Ask 200 people at a bookstore', 'Ask the first 200 people who answer an online library poll'],
      'Choosing at random from a list of all residents avoids bias. People already at a library or bookstore are more likely than others to use the library.'],
    ['A school wants to know the favorite sport of its 7th graders. Which sample is biased?',
      'Ask 30 students at a soccer game',
      ['Pick 30 names at random from the 7th grade roster', 'Draw 30 student ID numbers at random from all 7th graders', 'Ask every 5th student on an alphabetical list of 7th graders'],
      'Students at a soccer game are more likely to pick soccer, so that sample does not represent all 7th graders.'],
  ];

  const probability = [
    function marbles() {
      const colors = shuffle(['red', 'blue', 'green', 'yellow']).slice(0, Math.random() < 0.5 ? 3 : 4);
      const counts = colors.map(() => ri(1, 9)), total = sum(counts);
      const ti = ri(0, colors.length - 1), k = counts[ti], target = colors[ti], p = F(k, total);
      const list = colors.map((c, i) => `${counts[i]} ${c}`);
      const listText = list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1];
      return Q(`A bag has ${listText} marbles. You pick one without looking. What is the probability that it is ${target}?`, C.frac(p),
        [C.frac(F(k, total - k)), C.frac(F(total - k, total)), C.frac(F(1, colors.length))],
        `P(${target}) = ${target} marbles ÷ all marbles = ${fracHtml(k, total)}${p.d !== total ? ` = ${p.html()}` : ''}.`);
    },
    function numberCube() {
      const [ev, outs] = pick([['an even number', [2, 4, 6]], ['an odd number', [1, 3, 5]], ['a number greater than 4', [5, 6]], ['a number greater than 2', [3, 4, 5, 6]],
        ['a number less than 3', [1, 2]], ['a multiple of 3', [3, 6]], ['a prime number', [2, 3, 5]], ['a 5', [5]], ['a number that is not 6', [1, 2, 3, 4, 5]], ['a factor of 6', [1, 2, 3, 6]]]);
      const k = outs.length, p = F(k, 6);
      return Q(`You roll a fair number cube with faces numbered 1 to 6. What is the probability of rolling ${ev}?`, C.frac(p),
        [C.frac(F(6 - k, 6)), C.frac(F(1, 6)), C.frac(F(k, 12))],
        `The outcomes that count are ${outs.join(', ')}: that is ${k} of the 6 possible outcomes. P = ${fracHtml(k, 6)}${p.d !== 6 ? ` = ${p.html()}` : ''}.`);
    },
    function complementEvent() {
      const [yes, no] = pick([['it will rain tomorrow', 'it will not rain tomorrow'], ['the school bus is late', 'the school bus is not late'],
        ['a randomly chosen student walks to school', 'the student does not walk to school'], ['the home team wins the game', 'the home team does not win']]);
      const pc = ri(1, 19) * 5;
      if (Math.random() < 0.5) {
        return Q(`The probability that ${yes} is ${pc}%. What is the probability that ${no}?`, C.num(100 - pc, '%'),
          [C.num(pc, '%'), C.num(Math.abs(50 - pc), '%'), C.num(100 + pc, '%')],
          `An event and its complement add up to 100%: 100% − ${pc}% = ${100 - pc}%.`, { input: true });
      }
      return Q(`The probability that ${yes} is ${fmt(pc / 100)}. What is the probability that ${no}?`, C.num((100 - pc) / 100),
        [C.num(pc / 100), C.num(Math.abs(50 - pc) / 100), C.num(1 + pc / 100)],
        `An event and its complement add up to 1: 1 − ${fmt(pc / 100)} = ${fmt((100 - pc) / 100)}.`, { input: true });
    },
    function compoundEvents() {
      const n = pick([3, 4, 5, 8]);
      const exps = [
        { name: 'flip a coin', short: 'coin', events: [['heads', F(1, 2)], ['tails', F(1, 2)]] },
        { name: 'roll a number cube numbered 1 to 6', short: 'number cube', events: [['a 4', F(1, 6)], ['an even number', F(1, 2)], ['a number greater than 4', F(1, 3)], ['a 1 or a 2', F(1, 3)]] },
        { name: `spin a spinner with ${n} equal sections numbered 1 to ${n}`, short: 'spinner', events: [['a 1', F(1, n)], [`a number less than ${n}`, F(n - 1, n)]] },
      ];
      const i = ri(0, 1), j = ri(i + 1, 2), A = exps[i], B = exps[j];
      const [ea, pa] = pick(A.events), [eb, pb] = pick(B.events), p = pa.mul(pb);
      return Q(`You ${A.name} and ${B.name}. What is the probability of getting ${ea} on the ${A.short} and ${eb} on the ${B.short}?`, C.frac(p),
        [C.frac(pa.add(pb)), C.frac(F(1, pa.d + pb.d)), C.frac(p.mul(F(2)))],
        `The two events are independent, so multiply their probabilities: ${pa.html()} × ${pb.html()} = ${p.html()}.`);
    },
    function countingOutcomes() {
      const a = ri(2, 6), b = ri(2, 6);
      if (Math.random() < 0.5) {
        const c = ri(2, 4), tot = a * b * c;
        return Q(`You have ${a} shirts, ${b} pairs of pants, and ${c} pairs of shoes. How many different outfits can you make with one shirt, one pair of pants, and one pair of shoes?`,
          C.num(tot), [C.num(a + b + c), C.num(a * b), C.num(tot * 2)],
          `Each choice can go with every other choice, so multiply: ${a} × ${b} × ${c} = ${tot} outfits.`, { input: true });
      }
      return Q(`A sandwich shop offers ${a} kinds of bread and ${b} kinds of filling. How many different sandwiches can you make with one bread and one filling?`,
        C.num(a * b), [C.num(a + b), C.num(a * b * 2), C.num(a * b - 1)],
        `Each bread can go with each filling, so multiply: ${a} × ${b} = ${a * b} sandwiches.`, { input: true });
    },
    function expectedCount() {
      if (Math.random() < 0.5) {
        const n = ri(5, 30) * 6, target = ri(1, 6);
        return Q(`You roll a fair number cube ${n} times. About how many times would you expect to roll a ${target}?`, C.num(n / 6),
          [C.num(n / 2), C.num(n - n / 6), C.num(n / 3)],
          `The probability of rolling a ${target} is ${fracHtml(1, 6)}. Expected number = ${fracHtml(1, 6)} × ${n} = ${n / 6}.`, { input: true });
      }
      const p = pick([0.2, 0.25, 0.3, 0.4, 0.75]), n = ri(4, 20) * 20, e = round(p * n, 2);
      return Q(`A spinner lands on blue with a probability of ${fmt(p)}. If you spin it ${n} times, about how many times would you expect it to land on blue?`, C.num(e),
        [C.num(n - e), C.num(e * 2), C.num(round(e / 2, 1))],
        `Expected number = probability × number of spins = ${fmt(p)} × ${n} = ${fmt(e)}.`, { input: true });
    },
    function mean() {
      const [what, lo, hi] = pick([['quiz scores', 60, 100], ['minutes spent reading', 10, 60], ['points scored in basketball games', 4, 30]]);
      const k = ri(5, 7);
      let vals, m;
      do {
        m = ri(lo + 5, hi - 5);
        vals = Array.from({ length: k - 1 }, () => ri(lo, hi));
        vals.push(m * k - sum(vals));
      } while (vals[k - 1] < lo || vals[k - 1] > hi);
      vals = shuffle(vals);
      const total = m * k, sorted = vals.slice().sort((a, b) => a - b);
      const med = k % 2 ? sorted[(k - 1) / 2] : (sorted[k / 2 - 1] + sorted[k / 2]) / 2;
      return Q(`Find the mean of these ${what}: ${vals.join(', ')}`, C.num(m),
        [C.num(med), C.num(sorted[k - 1] - sorted[0]), C.num(round(total / (k - 1), 1))],
        `Add the values: ${vals.join(' + ')} = ${total}. Divide by the number of values (${k}): ${total} ÷ ${k} = ${m}.`, { input: true });
    },
    function median() {
      const k = pick([5, 6, 7]), vals = Array.from({ length: k }, () => ri(1, 30));
      const sorted = vals.slice().sort((a, b) => a - b), odd = k % 2 === 1;
      const lo = sorted[Math.floor((k - 1) / 2)], hi = sorted[Math.floor(k / 2)], med = (lo + hi) / 2;
      return Q(`What is the median of this data set? ${vals.join(', ')}`, C.num(med),
        [C.num(vals[Math.floor(k / 2)]), C.num(round(sum(vals) / k, 1)), C.num(sorted[k - 1] - sorted[0])],
        `First put the values in order: ${sorted.join(', ')}. ${odd ? `The middle value is ${lo}.` : `There are two middle values, ${lo} and ${hi}, so the median is (${lo} + ${hi}) ÷ 2 = ${fmt(med)}.`}`,
        { input: true });
    },
    function likelihood() {
      const LABELS = ['Impossible', 'Unlikely', 'As likely as not', 'Likely', 'Certain'];
      const cat = ri(0, 4), v = pick([[0], [0.1, 0.15, 0.2, 0.25, 0.3], [0.5], [0.7, 0.75, 0.8, 0.9, 0.95], [1]][cat]);
      const style = pick(['dec', 'pct', 'frac']);
      const repr = style === 'pct' ? `${Math.round(v * 100)}%` : style === 'frac' ? F(Math.round(v * 100), 100).html() : fmt(v);
      const half = fracHtml(1, 2);
      const why = [
        'A probability of 0 means the event can never happen.',
        `${repr} is less than ${half}, so the event is unlikely.`,
        `A probability of ${half} means the event is just as likely to happen as not.`,
        `${repr} is greater than ${half}, so the event is likely.`,
        'A probability of 1 means the event is sure to happen.',
      ][cat];
      return Q(`An event has a probability of ${repr}. Which word best describes how likely it is?`, C.text(LABELS[cat]),
        shuffle(LABELS.filter((_, i) => i !== cat)).map((s) => C.text(s)),
        `Probabilities go from 0 (impossible) to 1 (certain). ${why}`);
    },
    function experimentalProbability() {
      const n = pick([20, 25, 30, 40, 50]), made = ri(Math.round(n * 0.3), Math.round(n * 0.9)), p = F(made, n);
      return Q(`Priya made ${made} of ${n} free throws in practice. Based on these results, what is the experimental probability that Priya makes the next free throw?`,
        C.frac(p), [C.frac(F(n - made, n)), C.frac(F(made, n - made)), C.frac(F(1, 2))],
        `Experimental probability = number of times it happened ÷ number of tries = ${fracHtml(made, n)}${p.d !== n ? ` = ${p.html()}` : ''}.`);
    },
    function sampling() {
      const [q, a, wrong, why] = pick(SAMPLING);
      return Q(q, C.text(a), shuffle(wrong).map((s) => C.text(s)), why);
    },
    function inference() {
      let n, k, N;
      do {
        n = pick([20, 25, 40, 50]); k = ri(Math.round(n * 0.2), Math.round(n * 0.7)); N = pick([300, 400, 500, 600, 800, 1000]);
      } while ((k * N) % n !== 0);
      const est = (k * N) / n, act = pick(['ride the bus to school', 'bring lunch from home', 'play a musical instrument', 'have a pet']);
      return Q(`In a random sample of ${n} students, ${k} said they ${act}. There are ${fmt(N)} students in the school. Based on the sample, about how many students in the school ${act}?`,
        C.num(est), [C.num(k), C.num(N - est), C.num(est / 2)],
        `In the sample, ${k} out of ${n} is ${fmt(round((k / n) * 100, 1))}%. Use the same rate for the whole school: ${fmt(k / n)} × ${fmt(N)} = ${fmt(est)} students.`,
        { input: true });
    },
  ];

  // =====================================================================
  // Topic list and game helpers
  // =====================================================================
  const TOPICS = [
    { id: 'integers', label: 'Integers', strand: '7.NS', gens: integers },
    { id: 'rational', label: 'Fractions & Decimals', strand: '7.NS', gens: rational },
    { id: 'ratios', label: 'Ratios & Rates', strand: '7.RP', gens: ratios },
    { id: 'percents', label: 'Percents', strand: '7.RP', gens: percents },
    { id: 'expressions', label: 'Expressions', strand: '7.EE', gens: expressions },
    { id: 'equations', label: 'Equations & Inequalities', strand: '7.EE', gens: equations },
    { id: 'geometry', label: 'Geometry', strand: '7.G', gens: geometry },
    { id: 'probability', label: 'Probability & Statistics', strand: '7.SP', gens: probability },
  ];

  // Builds a game: spreads questions evenly across the chosen topics and
  // avoids repeating a question type until every type in that topic was used.
  function buildQuestions(topicIds, count, inputShare = 0.25) {
    const topics = shuffle(TOPICS.filter((t) => topicIds.indexOf(t.id) >= 0));
    if (!topics.length) return [];
    const bags = {}, seen = new Set(), out = [];
    for (let guard = 0; out.length < count && guard < count * 40; guard++) {
      const t = topics[out.length % topics.length];
      if (!bags[t.id] || !bags[t.id].length) bags[t.id] = shuffle(t.gens.map((_, i) => i));
      const gen = t.gens[bags[t.id].pop()];
      const q = gen();
      if (seen.has(q.prompt) || q.choices.length < 2) continue;
      seen.add(q.prompt);
      q.topic = t.id;
      q.kind = gen.name;
      q.type = q.numeric !== undefined && Math.random() < inputShare ? 'input' : 'mc';
      out.push(q);
    }
    return shuffle(out);
  }

  // Reads typed answers like "-12", "−12", "$4.50", "x = 7", "3/4", "1 1/2", "45%", "12 cm".
  function parseAnswer(raw) {
    let s = String(raw == null ? '' : raw).toLowerCase().replace(/[−‒–—]/g, '-').replace(/[$,%°]/g, '').trim();
    s = s.replace(/^[a-z]\s*=\s*/, '');
    let m = s.match(/^(-)?\s*(\d+)\s+(\d+)\s*\/\s*(\d+)/);
    if (m) {
      if (+m[4] === 0) return null;
      const v = +m[2] + +m[3] / +m[4];
      return m[1] ? -v : v;
    }
    m = s.match(/^(-)?\s*(\d*\.?\d+)\s*(?:\/\s*(\d*\.?\d+))?/);
    if (!m) return null;
    let v = parseFloat(m[2]);
    if (m[3] !== undefined) {
      const d = parseFloat(m[3]);
      if (!d) return null;
      v /= d;
    }
    return m[1] ? -v : v;
  }

  function checkInput(q, raw) {
    const v = parseAnswer(raw);
    if (v === null || Number.isNaN(v)) return false;
    return Math.abs(v - q.numeric) < (q.isMoney ? 0.005 : 1e-6);
  }

  const API = { TOPICS, buildQuestions, parseAnswer, checkInput, shuffle, pick };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else global.MathRushQuestions = API;
})(typeof window !== 'undefined' ? window : globalThis);
