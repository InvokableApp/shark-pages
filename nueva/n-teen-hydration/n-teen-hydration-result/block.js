/* nueva/n-teen-hydration/n-teen-hydration-result
   Fill the result page from the query string the survey's conditional ladder put there.

   ⚠️ THIS REPLACED A _shared/confirm/v1 STUB, and the reason is not preference. That component is
   the generic "thanks, check your email" result page and it renders a headline, a body and a
   button. This page's whole job is a NUMBER, a comparison bar against a second number, one of
   four band paragraphs and a two-way handoff, none of which the shared component knows about.
   Forking it would have pushed four campaign-specific concepts into a file that 174 blocks across
   seven systems load at request time. Standalone is the smaller blast radius.

   ⚠️ THE PAGE COMPUTES NOTHING. Every number arrives already worked out, because the SURVEY is
   what decided them: its 240 rules are a lookup table generated from hydration() in _lib.mjs, and
   each rule writes its own combination's answer into its redirect URL. A second copy of the
   formula here would be a second source of truth, and the first time somebody tuned the sweat
   constant the page and the routing would start disagreeing with no way to tell which was right.

   ⚠️ THE NO-NUMBERS STATE IS THE DEFAULT, NOT A FALLBACK. The result markup ships `hidden` and is
   only revealed once every value has parsed as a finite number. A page that renders "About
   undefined oz", or worse a confident 0, to a parent who opened the link directly is worse than
   one that says it has nothing yet. Anything unexpected fails CLOSED.

   ⚠️ NOT AN ES MODULE. A hosted block is inlined into the page, so a bare `import` is a syntax
   error at load and the whole block ships with no behaviour (NEW-SYSTEM-SOP, caught on the Beneve
   Skin Diagnostic). Everything here is plain script. */
(function () {
  var root = document.querySelector(".sk-teen-res");
  if (!root) return;

  var q = new URLSearchParams(window.location.search);
  // The keys are a CONTRACT with NUEVASHARK/campaigns/teen-hydration/_build/06-routing.mjs.
  // Rename one and 240 rules keep sending the old one, silently.
  var num = function (k) { var v = parseFloat(q.get(k)); return isFinite(v) ? v : null; };
  var n = num("n"), i = num("i"), nb = num("nb"), gb = num("gb"), p = num("p");
  var band = q.get("b");

  var BANDS = {
    wellShort: {
      head: "They are running on about {p} percent of that.",
      body: "A gap of roughly {gb} bottles on a day like the one you described. It is the most " +
            "common answer we see, and it is usually nothing to do with effort. The bottle is " +
            "often the same size it was two years ago while the athlete kept growing."
    },
    short: {
      head: "They are getting about {p} percent of that.",
      body: "Closer than most, and still short by roughly {gb} bottles on a day like that. It " +
            "tends to be the middle of the session where it goes missing, not the start."
    },
    close: {
      head: "They are getting about {p} percent of that.",
      body: "Close. Around {gb} bottles off, which on most days is one refill. Worth knowing the " +
            "number anyway, because a hotter week moves it."
    },
    onTrack: {
      head: "They are drinking about what a day like that costs.",
      body: "Which is not where most athletes land. The useful part now is knowing the number, so " +
            "you can tell when a hotter week or a tournament changes it."
    }
  };

  var ok = n !== null && i !== null && nb !== null && gb !== null && p !== null && BANDS[band];
  var show = function (sel, on) {
    var els = root.querySelectorAll(sel);
    for (var k = 0; k < els.length; k++) els[k].hidden = !on;
  };
  if (!ok) { show("[data-res]", false); show("[data-nores]", true); return; }
  show("[data-nores]", false);

  var set = function (sel, v) {
    var els = root.querySelectorAll(sel);
    for (var k = 0; k < els.length; k++) els[k].textContent = String(v);
  };
  // One decimal only when there is one: "6.6 bottles" is useful, "6.0 bottles" is noise.
  var tidy = function (v) { return Math.round(v * 10) / 10; };

  set("[data-n]", Math.round(n));
  set("[data-n2]", Math.round(n));
  set("[data-i]", Math.round(i));
  set("[data-nb]", tidy(nb));

  var fill = function (s) { return s.replace("{p}", Math.round(p)).replace("{gb}", tidy(Math.abs(gb))); };
  set("[data-band-head]", fill(BANDS[band].head));
  set("[data-band-body]", fill(BANDS[band].body));

  /* The bar. Capped at 100 so an athlete who drinks MORE than the estimate does not render a fill
     that overshoots its own track, which reads as a broken widget rather than as good news. */
  var pct = Math.max(2, Math.min(100, p));
  var barFill = root.querySelector("[data-fill]");
  if (barFill) {
    // Painted on the next frame so the width animates up from zero instead of arriving finished.
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { barFill.style.width = pct + "%"; });
    });
  }
  var bar = root.querySelector("[data-bar-label]");
  if (bar) bar.setAttribute("aria-label",
    "They drink about " + Math.round(i) + " ounces of about " + Math.round(n) + " ounces, roughly " + Math.round(p) + " percent.");

  show("[data-res]", true);
})();
