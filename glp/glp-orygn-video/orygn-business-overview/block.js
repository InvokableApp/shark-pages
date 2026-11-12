/* glp/glp-orygn-video/orygn-business-overview (Beneve's b-business-overview block.js, unchanged but for these notes): the four
 * choices' pop-ups, the rep's name in them, each choice's step opened quietly so the rep's alert runs (see block.html),
 * the message copied, and the bar under the video and the move on to the choices when it ends, for a file or Vimeo. */
(function () {
  var root = document.querySelector(".rv");
  if (!root) return;
  var d = {}; try { d = JSON.parse(document.getElementById("pfn-data").textContent); } catch (e) {}
  var first = d.rep && d.rep.first;
  if (first) {
    [].forEach.call(root.querySelectorAll("[data-rv-rep]"), function (s) { s.textContent = first; });
    // "They've been alerted": only true when the page knows whose link this is.
    [].forEach.call(root.querySelectorAll("[data-if-rep]"), function (s) { s.hidden = false; });
  }
  // The banner: the rep's picture (made on the server, escaped there: rep-avatar.mjs) and name.
  var banner = root.querySelector(".rv-banner");
  if (banner && first) {
    if (d.rep.pic) banner.querySelector(".rv-banner-pic").innerHTML = d.rep.pic; else banner.querySelector(".rv-banner-pic").remove();
    banner.hidden = false; root.classList.add("rv-has-banner");
  }

  var open = null, told = {};
  function shut() { if (open) { open.hidden = true; open = null; } }
  root.addEventListener("click", function (e) {
    var card = e.target.closest && e.target.closest("[data-rv]");
    if (card) {
      shut(); open = root.querySelector('[data-rv-pop="' + card.getAttribute("data-rv") + '"]'); if (open) open.hidden = false;
      // The choice's step: a known lead's view of it is the rep's alert (platform 0749). Once per page, the automation is once anyway.
      var step = card.getAttribute("data-rv-step");
      if (step && !told[step]) {
        told[step] = 1;
        try { fetch(step, { credentials: "same-origin", redirect: "manual", keepalive: true }).catch(function () {}); } catch (x) {}
      }
      return;
    }
    var copy = e.target.closest && e.target.closest("[data-rv-copy]");
    if (copy) {
      var say = copy.parentNode.querySelector("[data-rv-say]"), text = say ? say.textContent.replace(/\s+/g, " ").trim() : "";
      var done = function () { copy.textContent = "Copied! Now paste it to " + (first || "them"); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { pick(say); });
      else pick(say);
      return;
    }
    if (open && (e.target === open || e.target.closest(".rv-x"))) shut();
  });
  // No clipboard (an old phone or an in-app browser): select the words so the phone's own Copy shows.
  function pick(el) { try { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); } catch (x) {} }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") shut(); });

  /* The bar, and on to the choices at the end. watch.js builds the player after this runs, so wait for it. */
  var box = root.querySelector(".rv-video"), bar = root.querySelector(".bv-bar"), tries = 0;
  function show(at, len) { if (len && bar) bar.style.setProperty("--lk-p", Math.min(100, at / len * 100).toFixed(2) + "%"); }
  function end() { var ask = root.querySelector(".rv-ask"); if (ask) ask.scrollIntoView({ behavior: "smooth" }); }
  (function hook() {
    var v = box && box.querySelector("video"), f = box && box.querySelector("iframe");
    if (!v && !f) { if (box && tries++ < 40) setTimeout(hook, 250); return; }
    if (v) {
      var raf = 0;
      var prog = function () { show(v.currentTime, v.duration); };
      var run = function () { prog(); raf = !v.paused && !v.ended ? requestAnimationFrame(run) : 0; };
      v.addEventListener("play", function () { if (!raf) run(); });
      ["timeupdate", "seeked", "loadedmetadata", "pause"].forEach(function (ev) { v.addEventListener(ev, prog); });
      v.addEventListener("ended", end);
      return;
    }
    if (!/player\.vimeo\.com/.test(f.src)) return;
    function attach() {
      if (!window.Vimeo) return;
      var p = new window.Vimeo.Player(f);
      p.getDuration().then(function (len) { show(0, len); }).catch(function () {});
      p.on("timeupdate", function (e) { show(e && e.seconds, e && e.duration); });
      p.on("ended", end);
    }
    if (window.Vimeo) return attach();
    var s = document.createElement("script"); s.src = "https://player.vimeo.com/api/player.js"; s.async = true; s.onload = attach;
    document.head.appendChild(s);
  })();
})();
