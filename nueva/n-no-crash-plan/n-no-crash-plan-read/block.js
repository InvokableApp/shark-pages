/* The No Crash Plan — live web guide behaviour.
 *
 * Three jobs, no dependencies, safe to run inside a GHL custom-code block:
 *   1. the hero curve FLATTENS as the reader scrolls (the page's signature motion)
 *   2. a scroll-progress hairline under the sticky nav
 *   3. per-section print buttons, isolated so the surrounding funnel chrome never prints
 *
 * ⚠️ Runs inside a GHL page, so everything is scoped to .ew-read and every lookup is
 * guarded. A throw here takes the rest of the page's scripts down with it.
 */
(function () {
  "use strict";
  var root = document.querySelector(".ew-read");
  if (!root) return;

  /* ---------- 1 + 2. scroll ----------
     FRAMES are generated at BUILD time from the same curvePaths() the PDF uses, so the
     page cannot draw a different curve from the document. Interpolating here would be a
     second implementation of the guide's own argument. */
  var FRAMES = ["M 30 62.400000000000006 C 90 62.400000000000006 110 26.400000000000006 165 26.400000000000006 C 215 26.400000000000006 225 88.32000000000001 280 88.32000000000001 C 330 88.32000000000001 345 26.400000000000006 400 26.400000000000006 C 450 26.400000000000006 465 88.32000000000001 530 88.32000000000001","M 30 62.400000000000006 C 90 62.400000000000006 110 28.20000000000001 165 28.20000000000001 C 215 28.20000000000001 225 87.024 280 87.024 C 330 87.024 345 28.20000000000001 400 28.20000000000001 C 450 28.20000000000001 465 87.024 530 87.024","M 30 62.400000000000006 C 90 62.400000000000006 110 30.000000000000007 165 30.000000000000007 C 215 30.000000000000007 225 85.72800000000001 280 85.72800000000001 C 330 85.72800000000001 345 30.000000000000007 400 30.000000000000007 C 450 30.000000000000007 465 85.72800000000001 530 85.72800000000001","M 30 62.400000000000006 C 90 62.400000000000006 110 31.800000000000008 165 31.800000000000008 C 215 31.800000000000008 225 84.432 280 84.432 C 330 84.432 345 31.800000000000008 400 31.800000000000008 C 450 31.800000000000008 465 84.432 530 84.432","M 30 62.400000000000006 C 90 62.400000000000006 110 33.60000000000001 165 33.60000000000001 C 215 33.60000000000001 225 83.13600000000001 280 83.13600000000001 C 330 83.13600000000001 345 33.60000000000001 400 33.60000000000001 C 450 33.60000000000001 465 83.13600000000001 530 83.13600000000001","M 30 62.400000000000006 C 90 62.400000000000006 110 35.400000000000006 165 35.400000000000006 C 215 35.400000000000006 225 81.84 280 81.84 C 330 81.84 345 35.400000000000006 400 35.400000000000006 C 450 35.400000000000006 465 81.84 530 81.84","M 30 62.400000000000006 C 90 62.400000000000006 110 37.2 165 37.2 C 215 37.2 225 80.54400000000001 280 80.54400000000001 C 330 80.54400000000001 345 37.2 400 37.2 C 450 37.2 465 80.54400000000001 530 80.54400000000001","M 30 62.400000000000006 C 90 62.400000000000006 110 39 165 39 C 215 39 225 79.248 280 79.248 C 330 79.248 345 39 400 39 C 450 39 465 79.248 530 79.248","M 30 62.400000000000006 C 90 62.400000000000006 110 40.80000000000001 165 40.80000000000001 C 215 40.80000000000001 225 77.952 280 77.952 C 330 77.952 345 40.80000000000001 400 40.80000000000001 C 450 40.80000000000001 465 77.952 530 77.952","M 30 62.400000000000006 C 90 62.400000000000006 110 42.60000000000001 165 42.60000000000001 C 215 42.60000000000001 225 76.656 280 76.656 C 330 76.656 345 42.60000000000001 400 42.60000000000001 C 450 42.60000000000001 465 76.656 530 76.656","M 30 62.400000000000006 C 90 62.400000000000006 110 44.400000000000006 165 44.400000000000006 C 215 44.400000000000006 225 75.36 280 75.36 C 330 75.36 345 44.400000000000006 400 44.400000000000006 C 450 44.400000000000006 465 75.36 530 75.36","M 30 62.400000000000006 C 90 62.400000000000006 110 46.2 165 46.2 C 215 46.2 225 74.06400000000001 280 74.06400000000001 C 330 74.06400000000001 345 46.2 400 46.2 C 450 46.2 465 74.06400000000001 530 74.06400000000001","M 30 62.400000000000006 C 90 62.400000000000006 110 48.00000000000001 165 48.00000000000001 C 215 48.00000000000001 225 72.768 280 72.768 C 330 72.768 345 48.00000000000001 400 48.00000000000001 C 450 48.00000000000001 465 72.768 530 72.768","M 30 62.400000000000006 C 90 62.400000000000006 110 49.800000000000004 165 49.800000000000004 C 215 49.800000000000004 225 71.47200000000001 280 71.47200000000001 C 330 71.47200000000001 345 49.800000000000004 400 49.800000000000004 C 450 49.800000000000004 465 71.47200000000001 530 71.47200000000001","M 30 62.400000000000006 C 90 62.400000000000006 110 51.60000000000001 165 51.60000000000001 C 215 51.60000000000001 225 70.176 280 70.176 C 330 70.176 345 51.60000000000001 400 51.60000000000001 C 450 51.60000000000001 465 70.176 530 70.176","M 30 62.400000000000006 C 90 62.400000000000006 110 53.400000000000006 165 53.400000000000006 C 215 53.400000000000006 225 68.88000000000001 280 68.88000000000001 C 330 68.88000000000001 345 53.400000000000006 400 53.400000000000006 C 450 53.400000000000006 465 68.88000000000001 530 68.88000000000001","M 30 62.400000000000006 C 90 62.400000000000006 110 55.20000000000001 165 55.20000000000001 C 215 55.20000000000001 225 67.584 280 67.584 C 330 67.584 345 55.20000000000001 400 55.20000000000001 C 450 55.20000000000001 465 67.584 530 67.584","M 30 62.400000000000006 C 90 62.400000000000006 110 57.00000000000001 165 57.00000000000001 C 215 57.00000000000001 225 66.28800000000001 280 66.28800000000001 C 330 66.28800000000001 345 57.00000000000001 400 57.00000000000001 C 450 57.00000000000001 465 66.28800000000001 530 66.28800000000001","M 30 62.400000000000006 C 90 62.400000000000006 110 58.800000000000004 165 58.800000000000004 C 215 58.800000000000004 225 64.992 280 64.992 C 330 64.992 345 58.800000000000004 400 58.800000000000004 C 450 58.800000000000004 465 64.992 530 64.992","M 30 62.400000000000006 C 90 62.400000000000006 110 60.6 165 60.6 C 215 60.6 225 63.696000000000005 280 63.696000000000005 C 330 63.696000000000005 345 60.6 400 60.6 C 450 60.6 465 63.696000000000005 530 63.696000000000005","M 30 62.400000000000006 C 90 62.400000000000006 110 62.400000000000006 165 62.400000000000006 C 215 62.400000000000006 225 62.400000000000006 280 62.400000000000006 C 330 62.400000000000006 345 62.400000000000006 400 62.400000000000006 C 450 62.400000000000006 465 62.400000000000006 530 62.400000000000006"];
  var spike = root.querySelector("#ew-hero-curve .spike");
  var bar = root.querySelector(".ewnav-bar i");
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var top = root.getBoundingClientRect().top;
      var h = root.offsetHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, -top / h)) : 0;
      if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
      if (spike) {
        // The curve settles over the first ~55% of the page, so it has visibly flattened
        // by the time the reader reaches week two rather than only at the very foot.
        var f = Math.min(1, p / 0.55);
        spike.setAttribute("d", FRAMES[Math.round(f * (FRAMES.length - 1))]);
      }
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---------- 3. per-section print ----------
     window.print() from inside an embed prints the WHOLE funnel page, chrome and all. So
     the section is cloned into an off-screen iframe carrying this block's own stylesheet,
     and that iframe is what prints. Any element tagged data-pf-print="Label" gets a
     button, which is the whole extension mechanism: one attribute, nothing else.
     (references/leadmag-web-guide-sop.md §Per-section printing) */
  function cssHref() {
    var l = document.querySelector('link[href*="n-no-crash-plan-read/block.css"]');
    return l ? l.href : null;
  }

  function printSection(el, label) {
    var fr = document.createElement("iframe");
    fr.setAttribute("aria-hidden", "true");
    fr.style.cssText = "position:fixed;left:-10000px;top:0;width:820px;height:1200px;border:0;";
    document.body.appendChild(fr);
    var d = fr.contentDocument;
    var href = cssHref();
    // The stylesheet is fetched by the loader at request time, so in the iframe it is
    // pulled again by URL. If it cannot be found the section still prints, unstyled, which
    // is a worse printout but never a dead button.
    d.open();
    d.write(
      '<!doctype html><html><head><meta charset="utf-8"><title>' + (label || "Print") + "</title>" +
      (href ? '<link rel="stylesheet" href="' + href + '">' : "") +
      "<style>@page{margin:14mm}body{margin:0;background:#fff}" +
      ".ew-read{background:#fff}" +
      ".ew-read .card{box-shadow:none;border-radius:0;margin:0;padding:0;background:#fff}" +
      ".ew-read .pf-print{display:none}" +
      "*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>" +
      '</head><body><div class="ew-read"></div></body></html>'
    );
    d.close();
    var host = d.querySelector(".ew-read");
    var clone = d.importNode(el, true);
    // The button itself rides along in the clone. The print CSS hides it, but that depends
    // on a stylesheet that is fetched over the network and may lose the race, so the node
    // is removed outright rather than hidden.
    clone.querySelectorAll(".pf-print").forEach(function (x) { x.remove(); });
    host.appendChild(clone);
    var go = function () {
      try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) {}
    };
    // Give the stylesheet a chance to land; print anyway if it never does.
    if (href) {
      var link = d.querySelector("link");
      var done = false;
      var fire = function () { if (done) return; done = true; setTimeout(go, 60); };
      link.addEventListener("load", fire);
      link.addEventListener("error", fire);
      setTimeout(fire, 1200);
    } else {
      setTimeout(go, 60);
    }
    fr.contentWindow.addEventListener("afterprint", function () {
      setTimeout(function () { if (fr.parentNode) fr.parentNode.removeChild(fr); }, 200);
    });
  }

  root.querySelectorAll("[data-pf-print]").forEach(function (el) {
    var label = el.getAttribute("data-pf-print");
    var b = document.createElement("button");
    b.className = "pf-print";
    b.type = "button";
    b.textContent = label;
    b.style.cssText =
      "display:inline-block;margin-top:22px;background:transparent;border:1px solid #8a9a7b;" +
      "color:#4c5a41;font:650 12px/1 Inter,system-ui,sans-serif;letter-spacing:.1em;" +
      "text-transform:uppercase;padding:12px 20px;border-radius:999px;cursor:pointer;";
    b.addEventListener("click", function () { printSection(el, label); });
    el.appendChild(b);
  });

  // The injected buttons must never appear in a full-page print either.
  var st = document.createElement("style");
  st.textContent = "@media print{.ew-read .pf-print{display:none !important}}";
  document.head.appendChild(st);
})();
