/* glp / glp-free-ignyt-sample / ignyt-sample-optin
 *
 * Loads the shared product-page engine (reveals, hero parallax, reading line, mobile bar)
 * and adds the two things an opt-in lander needs that a product page does not:
 *
 *   1. data-optin CTAs open the page's NATIVE GHL popup form, via GHL's own no-argument
 *      window event. No popup id is ever named, so one block serves every account and it
 *      survives a snapshot install. (HOSTED-BLOCKS-SOP section 7.)
 *   2. the proof stat numbers count up when they scroll into view.
 *
 * The click handler is bound in the CAPTURE phase on the same root the shared engine binds
 * to. Both listeners sit on that element, and capture always runs before bubble on the same
 * node, so this one wins and the shared anchor-scroll never sees the click. The href="#claim"
 * stays on the markup on purpose: if this script fails to load, or the operator has not
 * wired the popup yet, the button still moves the reader to the closing section instead of
 * being dead.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/product/v1/product.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });

  var root = document.querySelector(".sk-prod-ig");
  if (!root || root.dataset.igBooted) return;
  root.dataset.igBooted = "1";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 1. every CTA opens the native popup form ----------------------------
  root.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-optin]");
    if (!t) return;
    ev.preventDefault();
    ev.stopPropagation();
    window.dispatchEvent(new Event("customWidgetOpenPopup"));
  }, true);

  // ---- 2. offer countdown --------------------------------------------------
  // Evergreen, per visitor. The deadline is stamped once in localStorage and read back on
  // every later view, so the clock keeps falling across reloads and across pages instead
  // of resetting to 57:00 on each load, which is what makes a timer read as fake.
  //
  // The markup ships `hidden`. It is only revealed once a real deadline exists, so a
  // visitor with JS off or blocked storage sees no timer rather than a frozen one.
  //
  // Past the deadline the pill switches to "Last call" instead of sitting on 00:00, which
  // looks like a broken clock. A deadline older than a day is treated as a new visit and
  // restarted, otherwise anyone returning next week meets a permanently dead offer.
  (function () {
    var el = root.querySelector("[data-offer-timer]");
    if (!el) return;
    var clock = el.querySelector(".sk-prod-ig-timer-clock");
    var KEY = "ignyt-offer-deadline";
    var WINDOW_MS = 57 * 60 * 1000;
    var STALE_MS = 24 * 60 * 60 * 1000;

    // Safari in private mode throws on localStorage rather than returning null, so every
    // access is guarded and falls back to a memory-only deadline for this page view.
    var store = {
      get: function () { try { return parseInt(window.localStorage.getItem(KEY) || "0", 10) || 0; } catch (e) { return 0; } },
      set: function (v) { try { window.localStorage.setItem(KEY, String(v)); } catch (e) { /* memory only */ } },
    };

    var now = Date.now();
    var deadline = store.get();
    if (!deadline || now - deadline > STALE_MS) {
      deadline = now + WINDOW_MS;
      store.set(deadline);
    }

    var pad = function (n) { return n < 10 ? "0" + n : String(n); };
    var timer = null;

    function tick() {
      var left = deadline - Date.now();
      if (left <= 0) {
        el.setAttribute("data-expired", "");
        clock.textContent = "Last call";
        if (timer) clearInterval(timer);
        return;
      }
      var total = Math.floor(left / 1000);
      clock.textContent = pad(Math.floor(total / 60)) + ":" + pad(total % 60);
    }

    tick();
    el.removeAttribute("hidden");
    timer = setInterval(tick, 1000);
  })();

  // ---- 3. stat counters ----------------------------------------------------
  var nums = root.querySelectorAll("[data-count]");
  if (!nums.length) return;
  if (reduce || !("IntersectionObserver" in window)) return;   // markup already holds the value

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      var el = e.target;
      var end = parseInt(el.getAttribute("data-count"), 10) || 0;
      var t0 = null;
      var DUR = 900;
      function tick(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / DUR);
        // ease-out so it decelerates onto the final number rather than snapping
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      }
      el.textContent = "0";
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });

  for (var i = 0; i < nums.length; i++) io.observe(nums[i]);
})();
