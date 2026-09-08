/* beneve/beneve-natural-foods-guide/beneve-glp-food-guide-read
 *
 * Behaviour for the read-online guide. Vanilla only: a hosted block is injected with innerHTML,
 * so a <script src> inside the markup never executes (HOSTED-BLOCKS-SOP).
 *
 *  1. buy      point the CTAs at the funnel's redirect step (tracked), fall back to the buy link
 *  2. nav      smooth scroll for the sticky jump nav (scroll-behavior lives on the page's html,
 *              which a hosted block must not touch, so it is done here instead)
 *  3. print    a "Print this recipe" button on every recipe card
 */
(function () {
  var root = document.querySelector(".sk-bnv-guide");
  if (!root || root.dataset.skBooted) return;
  root.dataset.skBooted = "1";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 1. purchase CTAs ----------------------------------------------------
  // The redirect step is what fires Fire Lead; it forwards to the shop on its own. Authored
  // sibling-relative so it survives any funnel path, resolved here so a trailing slash cannot
  // shift it, and falling back to the buy link when the page is not served from inside the
  // funnel (builder preview), so the button is never dead.
  (function () {
    var step = root.getAttribute("data-buy-step");
    var buy = root.getAttribute("data-cv-beneve_gut_advantage_link");
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
    var a = ev.target.closest("a[href^='#']");
    if (!a) return;
    var dest = root.querySelector(a.getAttribute("href"));
    if (!dest) return;
    ev.preventDefault();
    dest.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  // ---- 3. per-recipe print -------------------------------------------------
  // The print window is a bare iframe, so it needs the guide's CSS handed to it. In a hosted
  // block that CSS is a <link> the loader added, not an inline <style>, so it is fetched once
  // and cached. Printing without it would produce an unstyled page.
  var cssText = null;
  function guideCss() {
    if (cssText !== null) return Promise.resolve(cssText);
    var link = document.querySelector('link[data-shark$="-css"][href*="b-glp-food-guide-read"]');
    if (!link) { cssText = ""; return Promise.resolve(cssText); }
    return fetch(link.href).then(function (r) { return r.ok ? r.text() : ""; })
      .catch(function () { return ""; })
      .then(function (t) { cssText = t; return t; });
  }

  function printCard(card) {
    guideCss().then(function (css) {
      var clone = card.cloneNode(true);
      var rows = clone.querySelectorAll(".pf-print-row");
      for (var i = 0; i < rows.length; i++) rows[i].remove();
      // The block CSS is scoped under .sk-bnv-guide, so the print document needs that wrapper too.
      var extra = "@page{margin:14mm}html,body{background:#fff!important}" +
        ".sk-bnv-guide .guide-wrap{max-width:none!important;margin:0!important;padding:0!important}" +
        ".sk-bnv-guide .page.recipe{border:none!important;box-shadow:none!important;margin:0!important;padding:0!important}" +
        ".sk-bnv-guide .recipe-photo{margin:0 0 20px!important}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}";
      var doc = '<!doctype html><html><head><meta charset="utf-8"><style>' + css + "</style><style>" + extra +
        '</style></head><body><div class="sk-bnv-guide"><div class="guide-wrap">' + clone.outerHTML + "</div></div></body></html>";
      var f = document.createElement("iframe");
      f.setAttribute("aria-hidden", "true");
      f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
      document.body.appendChild(f);
      var w = f.contentWindow, d = w.document;
      d.open(); d.write(doc); d.close();
      var cleaned = false;
      function cleanup() { if (cleaned) return; cleaned = true; setTimeout(function () { f.remove(); }, 500); }
      w.onafterprint = cleanup;
      setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} setTimeout(cleanup, 60000); }, 600);
    });
  }

  var ICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>';
  var recipes = root.querySelectorAll(".page.recipe");
  for (var r = 0; r < recipes.length; r++) {
    var el = recipes[r];
    if (el.querySelector(".pf-print-btn")) continue;
    var row = document.createElement("div");
    row.className = "pf-print-row";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pf-print-btn";
    btn.innerHTML = ICON + "<span>Print this recipe</span>";
    (function (card) { btn.addEventListener("click", function () { printCard(card); }); })(el);
    row.appendChild(btn);
    el.appendChild(row);
  }
})();
