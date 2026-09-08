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
  // A LOOPING urgency clock, not a real deadline (Jeff, 2026-09-01: "its just manufactured
  // urgency not a real countdown"). Nothing actually changes when it reaches zero, so it
  // rolls forward another window and keeps running rather than pretending the offer died.
  //
  // A new visitor starts at a full 29:00 (Jeff, 2026-09-03; it was 57). The deadline is
  // stamped in localStorage so the clock keeps falling across reloads instead of snapping
  // back to 29:00 on every page view,
  // which is the thing that makes these obvious. A returning visitor whose deadline has
  // passed gets it rolled forward in WHOLE windows, so it is always mid-countdown and never
  // sits on 00:00 or on a dead "expired" state.
  //
  // The markup ships `hidden`. It is only revealed once a deadline exists, so a visitor with
  // JS off never sees a frozen clock.
  (function () {
    var el = root.querySelector("[data-offer-timer]");
    if (!el) return;
    var clock = el.querySelector(".sk-prod-ig-timer-clock");
    // ⚠️ THE KEY IS VERSIONED WITH THE WINDOW. A returning visitor carries a deadline
    // stamped under the old 57 minute window, and roll-forward only adds whole windows to
    // it, so without a new key they would keep seeing a clock as high as 57:00 while the
    // page is now built around 29. Change the suffix whenever WINDOW_MS changes.
    var KEY = "ignyt-offer-deadline-29";
    var WINDOW_MS = 29 * 60 * 1000;

    // Safari in private mode THROWS on localStorage rather than returning null, so every
    // access is guarded and falls back to a memory-only deadline for this page view.
    var store = {
      get: function () { try { return parseInt(window.localStorage.getItem(KEY) || "0", 10) || 0; } catch (e) { return 0; } },
      set: function (v) { try { window.localStorage.setItem(KEY, String(v)); } catch (e) { /* memory only */ } },
    };

    var deadline = store.get() || (Date.now() + WINDOW_MS);

    // Roll forward in whole windows. A plain `deadline = now + WINDOW` here would hand every
    // returning visitor a fresh 29:00, which is the reset that gives the trick away.
    function normalise() {
      var now = Date.now();
      if (deadline <= now) {
        deadline += Math.ceil((now - deadline + 1) / WINDOW_MS) * WINDOW_MS;
      }
      store.set(deadline);
    }
    normalise();

    var pad = function (n) { return n < 10 ? "0" + n : String(n); };

    function tick() {
      var left = deadline - Date.now();
      if (left <= 0) { normalise(); left = deadline - Date.now(); }
      var total = Math.max(0, Math.floor(left / 1000));
      clock.textContent = pad(Math.floor(total / 60)) + ":" + pad(total % 60);
    }

    tick();
    el.removeAttribute("hidden");
    setInterval(tick, 1000);
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
