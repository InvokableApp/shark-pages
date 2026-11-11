/* glp/glp-real-results/real-results-reel: what reel.js doesn't do for this reel.
 *  - the cover's faces jump to the gallery (screen 6);
 *  - a "Swipe up" prompt at the bottom of every screen but the last (Jeff, 2026-11-11: "lets ad swipe prompts to the
 *    bottom of the pages"; phone only, a computer has the arrows);
 *  - MOTION (Jeff, 2026-11-11: "this is feeling ... like a powerpoint more than a interactive experience ... make it
 *    more flowing"): each screen's progress through the swipe as --p (-1 above, 0 in place, 1 below) and --a (|p|), so
 *    block.css can drift the words, the pictures and the background at different speeds as a finger drags; and the
 *    small SVGs each screen draws when it comes on (.rl-p.is-on, set by reel.js). Every piece added here is aria-hidden;
 *    the words carry the meaning without it. prefers-reduced-motion: no drift, and block.css shows each piece finished. */
(function () {
  var root = document.querySelector(".rr");
  if (!root || root.hasAttribute("data-rr")) return;   // the platform loads block.js itself; once is enough
  root.setAttribute("data-rr", "");
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-jump]");
    if (!b) return;
    var t = document.getElementById(b.getAttribute("data-jump"));
    if (t) t.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
  });

  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var add = function (el, html, where) { if (el) el.insertAdjacentHTML(where || "beforeend", html); };
  var svg = function (cls, box, body) { return '<svg class="' + cls + '" viewBox="' + box + '" aria-hidden="true" focusable="false">' + body + "</svg>"; };

  // The swipe prompt
  var arrow = '<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>';
  screens.slice(0, -1).forEach(function (s) {
    add(s, '<div class="rr-swipe" aria-hidden="true"><span>' + arrow + arrow + "</span><b>Swipe up</b></div>");
  });

  // The ember wave along the bottom of the cover and the close: two long sine lines drifting sideways, slowly
  var wave = svg("rr-wave", "0 0 1600 120",
    '<path d="M0 70 C 100 30 300 30 400 70 S 700 110 800 70 S 1100 30 1200 70 S 1500 110 1600 70"/>' +
    '<path d="M0 82 C 100 52 300 52 400 82 S 700 112 800 82 S 1100 52 1200 82 S 1500 112 1600 82"/>');
  [screens[0], screens[screens.length - 1]].forEach(function (s) { add(s, wave); });

  // 2. The two ways: drops falling from the dropper; a stir swirl drawing in the glass
  var ways = root.querySelectorAll(".rr-ways > div");
  add(ways[0], svg("rr-drops", "0 0 40 90",
    '<path d="M20 4c5 8 9 13 9 18a9 9 0 0 1-18 0c0-5 4-10 9-18z"/>' +
    '<path d="M20 34c4 6 7 10 7 14a7 7 0 0 1-14 0c0-4 3-8 7-14z"/>' +
    '<path d="M20 60c3 5 5 8 5 11a5 5 0 0 1-10 0c0-3 2-6 5-11z"/>'));
  add(ways[1], svg("rr-swirl", "0 0 60 60", '<path pathLength="1" d="M30 30m-4 0a4 4 0 1 1 8 0a8 8 0 1 1-16 0a12 12 0 1 1 24 0a16 16 0 1 1-32 0a20 20 0 1 1 40 0"/>'));

  // 3. A ring that draws round each pathway's number
  [].forEach.call(root.querySelectorAll(".rli-paths .rli-list > li > span"), function (n) {
    add(n, svg("rr-ring", "0 0 40 40", '<circle pathLength="1" cx="20" cy="20" r="17"/>'));
  });

  // 5. Every line icon draws itself
  [].forEach.call(root.querySelectorAll(".rr-more .rli-ico svg *"), function (p) { p.setAttribute("pathLength", "1"); });

  // 6. The gallery: a line that fills as you swipe through the people
  var row = root.querySelector(".rr-gallery");
  if (row) {
    add(row, '<div class="rr-progress" aria-hidden="true"><i></i></div>', "afterend");
    var bar = row.nextElementSibling.firstChild;
    var fill = function () {
      var max = row.scrollWidth - row.clientWidth;
      var cards = row.children.length, at = max > 0 ? row.scrollLeft / max : 0;
      bar.style.transform = "scaleX(" + Math.max(1 / cards, at).toFixed(3) + ")";
    };
    row.addEventListener("scroll", fill, { passive: true }); fill();
  }

  // 7. A check that draws in each line of what people notice first
  [].forEach.call(root.querySelectorAll(".rr-ticks li"), function (li) {
    add(li, svg("rr-chk", "0 0 24 24", '<circle cx="12" cy="12" r="11"/><path pathLength="1" d="m6.5 12.5 3.6 3.6 7.4-8.2"/>'), "afterbegin");
  });

  // 9. A shield that draws a check beside the headline
  add(root.querySelector(".rr-made h2"), svg("rr-shield", "0 0 48 56",
    '<path pathLength="1" d="M24 3 44 10v15c0 13-8.6 23.4-20 28C12.6 48.4 4 38 4 25V10z"/><path pathLength="1" d="m15 28 6.5 6.5L34 21"/>'));

  // 10. Embers rising behind the close
  var close = screens[screens.length - 1], sparks = "";
  for (var k = 0; k < 9; k++) sparks += "<i></i>";
  add(close, '<div class="rr-sparks" aria-hidden="true">' + sparks + "</div>", "afterbegin");

  // One-time moves when a screen first comes on: the gallery nudges sideways once to show it swipes
  var nudged = false;
  var people = root.querySelector(".rr-people");
  if (people && row && !still && "MutationObserver" in window) {
    new MutationObserver(function () {
      if (nudged || !people.classList.contains("is-on")) return;
      nudged = true;
      setTimeout(function () {
        if (row.scrollLeft > 4) return;   // they already swiped
        row.scrollTo({ left: 40, behavior: "smooth" });
        setTimeout(function () { if (row.scrollLeft <= 44) row.scrollTo({ left: 0, behavior: "smooth" }); }, 650);
      }, 1300);
    }).observe(people, { attributes: true, attributeFilter: ["class"] });
  }

  // THE DRIFT: each screen's place in the swipe, as a finger drags
  var track = root.querySelector(".rl-track");
  if (!track || still) return;
  var queued = false;
  var paint = function () {
    queued = false;
    var h = track.clientHeight || 1, top = track.scrollTop;
    for (var i = 0; i < screens.length; i++) {
      var p = (i * h - top) / h;
      if (p < -1.2 || p > 1.2) { screens[i].classList.remove("rr-in"); continue; }
      p = Math.max(-1, Math.min(1, p));
      screens[i].style.setProperty("--p", p.toFixed(4));
      screens[i].style.setProperty("--a", Math.abs(p).toFixed(4));
      // .rr-in: a screen fills in while it is still being dragged in (reel.js's is-on comes only once it settles, so
      // between two screens both were blank), and stays filled while it slides away
      if (Math.abs(p) < 0.6) screens[i].classList.add("rr-in");
      else if (Math.abs(p) > 0.98) screens[i].classList.remove("rr-in");
    }
  };
  track.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(paint); } }, { passive: true });
  addEventListener("resize", paint);
  paint();
})();
