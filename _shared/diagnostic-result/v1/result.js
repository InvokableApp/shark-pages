/* _shared/diagnostic-result/v1/result.js
 *
 * Two jobs, both small:
 *   1. scroll reveal for [data-rise], staggered by data-delay
 *   2. remove the loader node once it has finished, so it cannot trap focus or clicks
 *
 * The loader animation itself is CSS. This script only cleans up after it, which means a
 * blocked script leaves a page that still works: the loader fades out via CSS either way, and
 * everything marked data-rise stays visible because the hiding rule is gated on .sk-dres-js.
 */
(function () {
  "use strict";
  var roots = document.querySelectorAll(".sk-dres");
  if (!roots.length) return;

  Array.prototype.forEach.call(roots, function (root) {
    if (root.getAttribute("data-dres-ready")) return;
    root.setAttribute("data-dres-ready", "1");
    root.classList.add("sk-dres-js");

    var rise = root.querySelectorAll("[data-rise]");
    Array.prototype.forEach.call(rise, function (el) {
      var d = el.getAttribute("data-delay");
      if (d) el.style.setProperty("--sk-d", d);
    });

    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(rise, function (el) { el.classList.add("sk-dres-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("sk-dres-in");
          io.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
      Array.prototype.forEach.call(rise, function (el) { io.observe(el); });
    }

    var loader = root.querySelector(".sk-dres-loader");
    if (loader) window.setTimeout(function () {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 3400);
  });
})();
