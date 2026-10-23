/* mpg/m-vagus-reset/m-vagus-reset-read: the read-online guide's two jobs. By hand.
 *   1. the menu: a reading-progress hairline, and the section you're in lit up (scrolled into view in the menu)
 *   2. the sleep diary: 30 nights, three lines each, kept in this browser only (localStorage, every access guarded:
 *      a private window or blocked storage still gets a diary that works for the visit, it just isn't kept)
 * Scoped to .vr-read; every lookup guarded, so a throw never takes the page's other scripts down.
 */
(function () {
  "use strict";
  var root = document.querySelector(".vr-read");
  if (!root) return;

  /* ---------- 1. menu ---------- */
  var bar = root.querySelector(".vrnav-bar i");
  var links = [].slice.call(root.querySelectorAll(".vrnav-links a"));
  var targets = links.map(function (a) { return root.querySelector(a.getAttribute("href")); });
  var ticking = false, lit = null;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var top = root.getBoundingClientRect().top, h = root.offsetHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? Math.min(1, Math.max(0, -top / h)) * 100 : 0).toFixed(2) + "%";
      var on = null;
      for (var i = 0; i < targets.length; i++) if (targets[i] && targets[i].getBoundingClientRect().top < 120) on = links[i];
      if (on !== lit) {
        if (lit) lit.classList.remove("on");
        if (on) { on.classList.add("on"); var nav = on.parentNode; nav.scrollTo({ left: on.offsetLeft - nav.clientWidth / 2 + on.clientWidth / 2, behavior: "smooth" }); }
        lit = on;
      }
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---------- 2. diary ---------- */
  var box = root.querySelector("[data-diary]");
  if (!box) return;
  var KEY = "vr-diary-v1", NIGHTS = 30, SHOW = 7;
  var data = {};
  try { data = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { data = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* not kept; still works */ } }
  var FIELDS = [["bed", "Last night I went to bed at", "e.g. 10:45"], ["slept", "Last night I slept", "well, okay, badly, anything you noticed"],
    ["felt", "This morning I felt", ""]];
  function summary(n) {
    var d = data[n];
    if (d && (d.bed || d.slept || d.felt)) return [d.bed, d.slept, d.felt].filter(Boolean).join(" · ");
    return "Tap to fill in";
  }
  var lastFilled = 0;
  for (var k in data) if (+k > lastFilled && data[k] && (data[k].bed || data[k].slept || data[k].felt)) lastFilled = +k;
  var shown = Math.min(NIGHTS, Math.max(SHOW, lastFilled + 1));

  function row(n) {
    var det = document.createElement("details"); det.className = "night";
    var s = document.createElement("summary");
    var b = document.createElement("b"); b.textContent = n;
    var sp = document.createElement("span"); sp.textContent = summary(n); if (data[n]) sp.className = "done";
    s.appendChild(b); s.appendChild(sp); det.appendChild(s);
    var inner = document.createElement("div"); inner.className = "night-in";
    FIELDS.forEach(function (f) {
      var l = document.createElement("label"); l.textContent = f[1];
      var i = document.createElement("input"); i.type = "text"; i.placeholder = f[2]; i.value = (data[n] && data[n][f[0]]) || "";
      i.addEventListener("input", function () {
        data[n] = data[n] || {}; data[n][f[0]] = i.value; save();
        sp.textContent = summary(n); sp.className = summary(n) === "Tap to fill in" ? "" : "done";
      });
      l.appendChild(i); inner.appendChild(l);
    });
    det.appendChild(inner);
    return det;
  }
  for (var n = 1; n <= shown; n++) box.appendChild(row(n));
  if (shown < NIGHTS) {
    var more = document.createElement("button"); more.type = "button"; more.className = "diary-more"; more.textContent = "Show all 30 nights";
    more.addEventListener("click", function () { for (var m = shown + 1; m <= NIGHTS; m++) box.insertBefore(row(m), more); more.remove(); });
    box.appendChild(more);
  }
})();
