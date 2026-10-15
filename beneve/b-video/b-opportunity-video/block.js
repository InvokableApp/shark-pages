/* beneve/b-video (both pages; GLP's glp/glp-orygn-video block.js, plus Vimeo): the three cards' pop-ups, the rep's name
 * in them, the progress bar and time under the video, and the video moving the page on to the cards when it ends (see
 * block.html). The taps themselves are reported by watch.js.
 * watch.js makes a <video> for a file and an <iframe> for Vimeo; GLP's only listened to a <video>, and the placeholder
 * here is Vimeo, so this listens to either. */
(function () {
  var root = document.querySelector(".rv");
  if (!root) return;
  var d = {}; try { d = JSON.parse(document.getElementById("pfn-data").textContent); } catch (e) {}
  var first = d.rep && d.rep.first;
  if (first) [].forEach.call(root.querySelectorAll("[data-rv-rep]"), function (s) { s.textContent = first; });
  // The banner: the rep's picture (made on the server, escaped there: rep-avatar.mjs) and name.
  var banner = root.querySelector(".rv-banner");
  if (banner && first) {
    if (d.rep.pic) banner.querySelector(".rv-banner-pic").innerHTML = d.rep.pic; else banner.querySelector(".rv-banner-pic").remove();
    banner.hidden = false; root.classList.add("rv-has-banner");
  }

  var open = null;
  function shut() { if (open) { open.hidden = true; open = null; } }
  root.addEventListener("click", function (e) {
    var card = e.target.closest && e.target.closest("[data-rv]");
    if (card) { shut(); open = root.querySelector('[data-rv-pop="' + card.getAttribute("data-rv") + '"]'); if (open) open.hidden = false; return; }
    if (open && (e.target === open || e.target.closest(".rv-x"))) shut();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") shut(); });

  /* The bar, the time, and on to the cards at the end. watch.js builds the player after this runs, so wait for it. */
  var box = root.querySelector(".rv-video"), bar = root.querySelector(".bv-bar"), atEl = root.querySelector("[data-bv-at]"),
      lenEl = root.querySelector("[data-bv-len]"), tries = 0;
  function clock(s) { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  function show(at, len) {
    if (!len) return;
    if (bar) bar.style.setProperty("--lk-p", Math.min(100, at / len * 100).toFixed(2) + "%");
    if (atEl) atEl.textContent = clock(at);
    if (lenEl) lenEl.textContent = clock(len);
  }
  function done() { var ask = root.querySelector(".rv-ask"); if (ask) ask.scrollIntoView({ behavior: "smooth" }); }
  (function hook() {
    var v = box && box.querySelector("video"), f = box && box.querySelector("iframe");
    if (!v && !f) { if (box && tries++ < 40) setTimeout(hook, 250); return; }
    if (v) {
      var raf = 0;
      var prog = function () { show(v.currentTime, v.duration); };
      var run = function () { prog(); raf = !v.paused && !v.ended ? requestAnimationFrame(run) : 0; };
      v.addEventListener("play", function () { if (!raf) run(); });
      ["timeupdate", "seeked", "loadedmetadata", "pause"].forEach(function (ev) { v.addEventListener(ev, prog); });
      v.addEventListener("ended", done);
      return;
    }
    if (!/player\.vimeo\.com/.test(f.src)) return;
    function attach() {
      if (!window.Vimeo) return;
      var p = new window.Vimeo.Player(f);
      p.getDuration().then(function (len) { show(0, len); }).catch(function () {});
      p.on("timeupdate", function (e) { show(e && e.seconds, e && e.duration); });
      p.on("ended", done);
    }
    if (window.Vimeo) return attach();
    var s = document.createElement("script"); s.src = "https://player.vimeo.com/api/player.js"; s.async = true; s.onload = attach;
    document.head.appendChild(s);
  })();
})();
