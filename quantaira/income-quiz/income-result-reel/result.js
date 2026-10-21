/* quantaira/income-quiz/income-result-reel/result.js — fills the result page (see block.html) from #pr-data.
 * Which result: ?r=<key> (an email's link) first, then the one the quiz kept in this browser (sessionStorage
 * "quantaira-pq"), else "allocator" (straight to Quantaira). It runs as soon as the page is read, before reel.js counts
 * the screens, so the screens a Quantaira result skips are taken out rather than hidden. */
(function () {
  var root = document.querySelector(".rl-pr");
  var el = document.getElementById("pr-data");
  if (!root || !el) return;
  var d = JSON.parse(el.textContent);
  var key = (location.search.match(/[?&]r=([a-z]+)/) || [])[1];
  if (!d.results[key]) { try { key = sessionStorage.getItem("quantaira-pq"); } catch (e) { key = null; } }
  if (!d.results[key]) key = "allocator";
  var r = d.results[key];
  root.setAttribute("data-result", key);

  function markIn(el, phrase) {
    if (!el || !phrase) return; var t = el.textContent, at = t.indexOf(phrase); if (at < 0) return;
    var m = document.createElement("mark"); m.textContent = t.slice(at, at + phrase.length);
    el.textContent = ""; el.appendChild(document.createTextNode(t.slice(0, at))); el.appendChild(m); el.appendChild(document.createTextNode(t.slice(at + phrase.length)));
  }
  function fill(name, text) { [].forEach.call(root.querySelectorAll('[data-pr="' + name + '"]'), function (x) { x.textContent = text; }); }
  fill("name", r.name); fill("h", r.h); fill("p", r.p); fill("start", r.start); fill("search", r.search);
  fill("real", r.real.replace(/^"|"(?= \()/g, "").replace(/ \((r\/[^)]+)\)$/, ""));
  var src = r.real.match(/\((r\/[^)]+)\)$/); if (src) root.querySelector(".pq-real").setAttribute("data-src", src[1]);
  fill("pitch", key === "connector" ? d.connector_p : d.pitch_p);
  // "get paid to share it" on the yellow (Jeff, 2026-10-21)
  markIn(root.querySelector('[data-pr="pitch"]'), key === "connector" ? d.connector_p_mark : d.pitch_p_mark);
  // No name known: the platform drops the name span, so the headline starts with a capital.
  var h = root.querySelector('[data-pr="h"]');
  if (!h.parentNode.textContent.slice(0, h.parentNode.textContent.indexOf(h.textContent)).trim()) h.textContent = h.textContent.charAt(0).toUpperCase() + h.textContent.slice(1);
  // The match itself on a yellow highlight (Jeff, 2026-10-21: "highlight their match. your best fit is (highlighted match)").
  if (r.h_mark && h.textContent.indexOf(r.h_mark) >= 0) {
    var at = h.textContent.indexOf(r.h_mark), t = h.textContent, m = document.createElement("mark");
    m.textContent = t.slice(at, at + r.h_mark.length);
    h.textContent = ""; h.appendChild(document.createTextNode(t.slice(0, at))); h.appendChild(m); h.appendChild(document.createTextNode(t.slice(at + r.h_mark.length)));
  }

  if (!r.side) {
    [].forEach.call(root.querySelectorAll("[data-pr-side]"), function (x) { x.parentNode.removeChild(x); });
  } else {
    r.values.forEach(function (v, i) { var b = root.querySelector('[data-pr-v="' + i + '"]'); if (b) b.textContent = v; });
    var wc = root.querySelectorAll(".pq-wc");
    [].forEach.call(wc, function (w, i) {
      [["y", r.scale[i], 34], ["q", Math.max(d.quantaira.scale[i], 3), 23]].forEach(function (a) {
        var c = w.querySelector(".ar." + a[0]), len = 2 * Math.PI * a[2];
        c.style.strokeDasharray = len.toFixed(1);
        c.style.setProperty("--full", len.toFixed(1));
        c.style.setProperty("--off", (len * (1 - a[1] / 100)).toFixed(1));
      });
    });
  }

  // Copy the YouTube search (the button's words come from the page, in its language). A browser that refuses the clipboard gets the words selected instead.
  var btn = root.querySelector("[data-pq-copy]");
  if (btn) btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var t = root.querySelector('[data-pr="search"]');
    function sel() { var g = document.createRange(); g.selectNodeContents(t); var s = getSelection(); s.removeAllRanges(); s.addRange(g); btn.textContent = btn.getAttribute("data-selected") || "Selected"; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t.textContent).then(function () { btn.textContent = btn.getAttribute("data-copied") || "Copied"; }, sel);
    else sel();
  });
})();

/* THE DOCK BEFORE THE TURN (Jeff, 2026-10-21: "button doesnt make sense here, theres no context - swipe up to see something
 * more passive should be that? then go right to this screen"). On the screens before "The path above trades your hours
 * for money" the platform's dock reads "Swipe up / See something more passive" (the words sit as on an opt-in dock, small over
 * bold, so they fit a phone) and a tap or a swipe jumps to that screen; from there on it is the message-the-rep dock the platform drew. The two Quantaira results have no turn screen
 * (result.js above removed it), so their dock is untouched. */
(function () {
  var root = document.querySelector(".rl-pr"), el = document.getElementById("pr-data");
  var turn = root && root.querySelector(".pq-turn");
  if (!root || !el || !turn) return;
  var peek = (JSON.parse(el.textContent).peek || "");
  if (!peek) return;
  var track = root.querySelector(".rl-track"), screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var dock = null, kept = null, before = false;
  var text = function (s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; };
  var swipeUp = (window.__pfWords && window.__pfWords["dock.swipe_up"]) || "Swipe up";
  function current() { for (var i = 0; i < screens.length; i++) if (screens[i].classList.contains("is-on")) return i; return 0; }
  function apply() {
    if (!dock) dock = document.querySelector(".pfn-dock");
    if (!dock) return;
    var txt = dock.querySelector(".pfn-txt");
    before = current() < screens.indexOf(turn);
    dock.classList.toggle("pq-peek", before);
    if (!txt) return;
    if (before) { if (kept === null) kept = txt.innerHTML; txt.innerHTML = "<small>" + text(swipeUp) + "</small><b>" + text(peek) + "</b>"; }
    else if (kept !== null) txt.innerHTML = kept;
  }
  function jump() { track.scrollTo({ top: turn.offsetTop, behavior: "smooth" }); }
  // In peek mode the dock's own listeners (funnel-native.js: open the message card, the swipe) never run: these capture
  // listeners stop the events at the document before they reach it.
  var y0 = null;
  function mine(e) { return before && dock && e.target && e.target.closest && e.target.closest(".pfn-dock") === dock; }
  document.addEventListener("click", function (e) { if (!mine(e)) return; e.preventDefault(); e.stopPropagation(); jump(); }, true);
  document.addEventListener("touchstart", function (e) { if (!mine(e)) return; e.stopPropagation(); y0 = e.touches[0].clientY; }, { capture: true, passive: true });
  document.addEventListener("touchmove", function (e) { if (!mine(e)) return; e.stopPropagation(); if (y0 != null && e.touches[0].clientY - y0 < -36) { y0 = null; jump(); } }, { capture: true, passive: true });
  document.addEventListener("touchend", function (e) { if (!mine(e)) return; e.stopPropagation(); y0 = null; }, { capture: true, passive: true });
  new MutationObserver(apply).observe(root, { subtree: true, attributes: true, attributeFilter: ["class"] });
  apply(); setTimeout(apply, 500); setTimeout(apply, 1200);
})();
