/* Vital / Minimalist GLP Guide / Opt In
   Two jobs:
   1. Alternate the highlight between Day A and Day B, so the page demonstrates the
      loop rather than describing it. Paused when the section is off screen and
      skipped entirely under prefers-reduced-motion.
   2. Both CTAs open the page's own GHL popup, which holds the opt-in form.
      `customWidgetOpenPopup` takes no argument, so nothing here is account-specific
      and the block survives a snapshot install (HOSTED-BLOCKS-SOP §7).
      Constraint: this page must carry exactly ONE popup. */
(function () {
  var root = document.querySelector(".sk-vital-vital-minimalist-glp-guide-optin[data-sk-optin]");
  if (!root || root.dataset.skWired) return;
  root.dataset.skWired = "1";

  root.querySelectorAll("[data-sk-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.dispatchEvent(new Event("customWidgetOpenPopup"));
    });
  });

  /* ---- scroll reveals ---------------------------------------------------
     A scroll SWEEP rather than IntersectionObserver. IO looked like the obvious
     tool and is wrong for this: it only fires when an intersection threshold is
     crossed, so an element that goes from below the viewport to above it in one
     jump (anchor link, Cmd+End, a browser-restored scroll position) never gets a
     callback and stays invisible. Measured: 4 elements stuck hidden after a jump
     to the bottom. A sweep just asks "is it above the line yet", which is true
     however the reader got there.

     CSS keeps everything VISIBLE until .sk-motion lands, so a dead script or a
     blocked file can never leave the page blank. Reduced motion opts out and the
     class is never added. The listener removes itself once the last element has
     played: these are entrances, not scroll-linked animation. */
  var reducedMo = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducedMo) {
    root.classList.add("sk-motion");
    var pending = [].slice.call(root.querySelectorAll("[data-sk-reveal],[data-sk-stagger]"));
    var queued = false;
    var play = function (el) {
      if (el.hasAttribute("data-sk-stagger")) {
        var kids = el.children;
        for (var k = 0; k < kids.length; k++) kids[k].style.setProperty("--sk-d", (k * 90) + "ms");
      }
      el.setAttribute("data-sk-in", "1");
    };
    var sweep = function () {
      queued = false;
      var line = window.innerHeight * 0.92;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top >= line) return true;
        play(el);
        return false;
      });
      if (!pending.length) window.removeEventListener("scroll", onScroll);
    };
    var onScroll = function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    sweep();
  }

  /* ---- sticky download bar ----------------------------------------------
     Shown only once the hero CTA has scrolled off, so the page never shows two
     copies of the same button at once. The bar's button is wired by the same
     [data-sk-open] handler above, so it opens the page popup like any other CTA.
     `hidden` comes off as soon as we take control: with JS dead the bar stays
     hidden rather than sitting permanently across the top. */
  var bar = root.querySelector("[data-sk-bar]");
  var heroCta = root.querySelector("[data-sk-hero-cta]");
  if (bar && heroCta && window.IntersectionObserver) {
    bar.hidden = false;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) bar.removeAttribute("data-sk-on");
        else if (e.boundingClientRect.top < 0) bar.setAttribute("data-sk-on", "1");
        else bar.removeAttribute("data-sk-on");
      });
    }, { threshold: 0 }).observe(heroCta);
  }

  var days = root.querySelectorAll("[data-sk-day]");
  if (!days.length) return;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) { days[0].setAttribute("data-sk-on", "1"); return; }

  var i = 0;
  var timer = null;
  var tick = function () {
    days.forEach(function (d, n) {
      if (n === i % days.length) d.setAttribute("data-sk-on", "1");
      else d.removeAttribute("data-sk-on");
    });
    i++;
  };
  var start = function () { if (!timer) { tick(); timer = setInterval(tick, 2600); } };
  var stop = function () { if (timer) { clearInterval(timer); timer = null; } };

  // Only run while the loop is actually on screen: an interval ticking in a
  // background tab is wasted work on a page that may sit open for a long time.
  var loop = root.querySelector("[data-sk-loop]");
  if (loop && window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
    }, { threshold: 0.15 }).observe(loop);
  } else {
    start();
  }
})();
