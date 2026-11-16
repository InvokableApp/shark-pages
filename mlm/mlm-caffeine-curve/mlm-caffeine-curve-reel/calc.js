/* mlm/mlm-caffeine-curve/mlm-caffeine-curve-reel/calc.js (Marketing Shark | MLM): THE ONE COPY of the Caffeine Curve's
 * arithmetic, loaded by the opt-in reel (quiz.js) and the result page (result.js). Ported unchanged in what it computes
 * from the shared calculator's "caffeine-decay" formula and the Caffeine Curve's constants
 * (_shared/calculator/v1/calc.js and the source Caffeine Curve config), which explain every number:
 *   - mg per drink: the FDA's published figures per 12 fl oz, the midpoint where the FDA gives a range
 *     (brewed coffee 113 to 247, energy drinks 41 to 246, soft drinks 23 to 83; black and green tea single figures).
 *   - half life 5 hours: a population average; people vary widely (Drake 2013: advice on when to stop ranges 4 to 11 hours).
 *   - the morning and midday windows (7:30 and noon) and "clear" (under 30 mg) are OURS.
 *   remaining = SUM over doses of n * mg * 0.5 ^ (hours since the dose / half life)
 * The cutoff answers "for your drink at your size, how late can you have one and still be under 30 mg at bed".
 * An estimate, not a measurement and not medical advice. Change a number here and the result page's method text with it. */
(function () {
  var BED = { b1: [21.5, "Around 9:30"], b2: [22.5, "Around 10:30"], b3: [23.5, "Around 11:30"], b4: [24.5, "After midnight"] };
  var DRINK = { brewed: [180, "Brewed coffee", "coffees"], energy: [144, "An energy drink", "energy drinks"], blackTea: [71, "Black tea", "cups of black tea"],
                greenTea: [37, "Green tea", "cups of green tea"], soda: [53, "Soda", "sodas"] };
  var SIZE = { small: [0.67, "Small, about 8 oz"], regular: [1, "Regular, about 12 oz"], large: [1.33, "Large, about 16 oz"], xl: [1.67, "Extra large, 20 oz or more"] };
  var COUNT = { c0: [0, "None"], c1: [1, "1"], c2: [2, "2"], c3: [3, "3"], c4: [4, "4 or more"] };
  var LAST = { l1: [13, "1pm or earlier"], l2: [14.5, "Around 2 or 3"], l3: [16.5, "Around 4 or 5"], l4: [18.5, "Around 6 or 7"], l5: [20, "8pm or later"] };
  var HALF = 5, CLEAR = 30, WIN = { morning: 7.5, midday: 12 };

  function clock(h) {
    if (h == null || isNaN(h)) return "";
    var t = ((h % 24) + 24) % 24, hh = Math.floor(t), mm = Math.round((t - hh) * 60);
    if (mm === 60) { hh = (hh + 1) % 24; mm = 0; }
    var ap = hh < 12 ? "am" : "pm", h12 = hh % 12 === 0 ? 12 : hh % 12;
    return h12 + ":" + (mm < 10 ? "0" : "") + mm + " " + ap;
  }

  function calc(a) {
    var bed = BED[a.b], dr = DRINK[a.k], sz = SIZE[a.z], m = COUNT[a.m], md = COUNT[a.n], af = COUNT[a.a], last = LAST[a.l];
    if (!bed || !dr || !sz || !m || !md || !af || !last) return null;
    var b = bed[0], mg = dr[0] * sz[0];
    var doses = [{ hour: WIN.morning, n: m[0] }, { hour: WIN.midday, n: md[0] }, { hour: last[0], n: af[0] }].filter(function (d) { return d.n > 0; });
    function level(t, list) { return list.reduce(function (s, d) { return t < d.hour ? s : s + d.n * mg * Math.pow(0.5, (t - d.hour) / HALF); }, 0); }
    var raw = level(b, doses), value = Math.round(raw);
    var lastN = Math.max(doses.length ? doses[doses.length - 1].n : 0, 1), cutoff = null, t;
    for (t = b; t >= b - 24; t -= 0.25) if (lastN * mg * Math.pow(0.5, (b - t) / HALF) < CLEAR) { cutoff = t; break; }
    var clears = null;
    for (t = (doses.length ? doses[doses.length - 1].hour : b); t <= b + 24; t += 0.25) if (level(t, doses) < CLEAR) { clears = t; break; }
    var first = doses.length ? Math.floor(doses[0].hour) : Math.floor(b) - 12, series = [], shifted = [];
    var moved = doses.length && cutoff != null ? doses.slice(0, -1).concat([{ hour: cutoff, n: doses[doses.length - 1].n }]) : doses;
    for (t = first; t <= b + 2; t += 0.5) { series.push(Math.round(level(t, doses))); shifted.push(Math.round(level(t, moved))); }
    var band = raw < CLEAR ? "clear" : raw < 80 ? "light" : raw < 160 ? "meaningful" : "high";   // the unrounded level, so the band and "clear before bed" agree
    return { value: value, band: band, bed: b, cutoff: cutoff, clears: clears, start: first, step: 0.5, series: series, shifted: shifted,
      perDrink: Math.round(mg), drinks: m[0] + md[0] + af[0],
      clock: { bed: clock(b), cutoff: clock(cutoff), clears: clock(clears) },
      labels: { b: bed[1], k: dr[1], z: sz[1], m: m[1], n: md[1], a: af[1], l: last[1] }, plural: dr[2] };
  }
  window.mlmCaffeine = { calc: calc, clock: clock };
})();
