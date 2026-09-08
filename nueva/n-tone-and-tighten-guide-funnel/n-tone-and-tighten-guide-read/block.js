/* nueva/n-tone-and-tighten-guide-funnel/n-tone-and-tighten-guide-read
 *
 * Behaviour for the read-online guide. Vanilla only: a hosted block is injected with innerHTML,
 * so a <script src> inside the markup never executes (HOSTED-BLOCKS-SOP).
 *
 *  0. custom values  fill the optional text + link from the socket's data-cv bridge's data-cv-* bridge
 *  1. buy            point the CTAs at the funnel's redirect step (tracked), fall back to the shop
 *  2. nav            smooth scroll for the sticky jump nav (scroll-behavior lives on the page's
 *                    html, which a hosted block must not touch, so it is done here instead)
 *  3. print          a "Print this recipe" button on every recipe card
 *
 * ⚠️ THE SCOPE CLASS IS THE WHOLE SCRIPT. This file was forked from Beneve and kept querying
 * `.sk-bnv-guide`, which does not exist on this page, so every line below was a no-op: no CTA
 * routing, no smooth scrolling, no print buttons, and no merge-field substitution. Nothing threw,
 * nothing logged, and the page still rendered, which is why it survived a fork and a publish.
 * If you fork this file again, change the selector FIRST.
 */
(function () {
  var root = document.querySelector(".sk-nva-guide");
  if (!root || root.dataset.skBooted) return;
  root.dataset.skBooted = "1";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 0. merge fields ----------------------------------------------------
     GHL substitutes a merge field only in ITS OWN html, never in a file served from
     GitHub Pages, so the literal braces reach the reader unless something replaces them. The
     socket carries each value as data-cv-<key> (push-block.mjs derives the list from the
     {{...}} occurrences in this block's markup, so the braces below must stay), and this is
     where they get swapped in.

     A value counts as NOT filled when it is empty, still unsubstituted, or still holding the
     "Enter your..." instruction text the snapshot ships. That last case is the common one: on a
     snapshot account every custom value holds its instruction, and rendering it would put
     "Shared with you by Enter YOUR first name." on the page. */
  function cv(key) {
    var v = (root.getAttribute("data-cv-" + key) || "").trim();
    if (!v || v.indexOf("{") !== -1 || /^(paste|enter|add)\b/i.test(v)) return "";
    return v;
  }
  (function () {
    /* ⚠️ THE LOADER HAS ALREADY SUBSTITUTED EVERY MERGE FIELD by the time this runs, and it does
       so RAW: `html.replace(MERGE, function (_, key) { return el.getAttribute("data-cv-" + key) })`
       with no notion of a value that is not filled in yet. On a snapshot account every custom
       value holds its own instruction text, so a merge field written straight into the copy ships
       as "Shared with you by Enter YOUR first name." and a merge field written into an href ships
       as a link to "https://paste the link to the guide pdf here...".

       So nothing optional is written as a merge field in this block's markup. The root carries the
       values as data-cv-* (the loader fills those attributes, and push-block derives the socket's
       list from them), and the two constructs below read them through cv(), which treats empty,
       still-unsubstituted and instruction text alike as NOT filled. */

    // Optional TEXT: <el data-cv-opt="key"> ... <span data-cv-val></span> ... </el>
    // Filled, the span gets the value. Unfilled, the whole element is hidden, because
    // "Shared with you by" on its own is worse than no line at all.
    var opt = root.querySelectorAll("[data-cv-opt]");
    for (var j = 0; j < opt.length; j++) {
      var el = opt[j], v = cv(el.getAttribute("data-cv-opt"));
      if (!v) { el.style.display = "none"; continue; }
      var slot = el.querySelector("[data-cv-val]");
      if (slot) slot.textContent = v; else el.textContent = v;
    }

    // Optional LINK: <a data-cv-href="key"> with no href at all until this resolves one.
    // Unfilled, the anchor is removed rather than left pointing at nothing.
    var lk = root.querySelectorAll("[data-cv-href]");
    for (var i = 0; i < lk.length; i++) {
      var val = cv(lk[i].getAttribute("data-cv-href"));
      if (!val) { if (lk[i].parentNode) lk[i].parentNode.removeChild(lk[i]); continue; }
      lk[i].setAttribute("href", /^https?:\/\//i.test(val) ? val : "https://" + val.replace(/^\/+/, ""));
    }
  })();

  // ---- 1. purchase CTAs ----------------------------------------------------
  // The redirect step is what fires Fire Lead; it forwards to the shop on its own. Authored
  // sibling-relative so it survives any funnel path, resolved here so a trailing slash cannot
  // shift it, and falling back to the shop link when the page is not served from inside the
  // funnel (builder preview), so the button is never dead.
  (function () {
    var step = root.getAttribute("data-buy-step");
    var buy = cv("nueva_buy_link");
    var btns = root.querySelectorAll("[data-buy]");
    if (!btns.length) return;
    var path = location.pathname.replace(/\/+$/, "");
    var href = null;
    if (step && path && !/\/preview\//.test(path)) href = path.replace(/[^\/]*$/, "") + step;
    else if (buy) href = "https://" + buy.replace(/^https?:\/\//, "");
    if (!href) return;
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute("href", href);
  })();

  // ---- 2. jump nav ---------------------------------------------------------
  root.addEventListener("click", function (ev) {
    var a = ev.target.closest ? ev.target.closest("a[href^='#']") : null;
    if (!a) return;
    var dest = root.querySelector(a.getAttribute("href"));
    if (!dest) return;
    ev.preventDefault();
    var nav = root.querySelector(".gnav");
    var top = dest.getBoundingClientRect().top + window.pageYOffset - ((nav && nav.offsetHeight) || 0) - 8;
    window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
  });

  // ---- 3. per-recipe print -------------------------------------------------
  // Prints ONE recipe. The whole-guide PDF is the nav's Print item, which is a different thing
  // and the reason that item is required rather than optional (leadmag-web-guide-sop §6).
  var recipes = root.querySelectorAll(".recipe");
  for (var r = 0; r < recipes.length; r++) {
    (function (card) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "recipe-print";
      b.textContent = "Print this recipe";
      b.addEventListener("click", function () {
        root.setAttribute("data-printing", "1");
        card.setAttribute("data-print", "1");
        var done = function () { root.removeAttribute("data-printing"); card.removeAttribute("data-print"); window.removeEventListener("afterprint", done); };
        window.addEventListener("afterprint", done);
        window.print();
      });
      card.appendChild(b);
    })(recipes[r]);
  }
})();
