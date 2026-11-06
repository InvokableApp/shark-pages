/* nueva/n-opportunity-public/n-opportunity-public-watch-reel (cloned from the trackable link's, n-opportunity-video-reel): the
 * four cards' pop-ups, the rep's name in them, and the video moving the page on to the cards when it ends (see block.html).
 * A card's tap also opens its step in the background: a known lead's view of it is the rep's alert (0613, as 0572). */
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

  var open = null, told = {};
  function shut() { if (open) { open.hidden = true; open = null; } }
  root.addEventListener("click", function (e) {
    var card = e.target.closest && e.target.closest("[data-rv]");
    if (card) {
      shut(); open = root.querySelector('[data-rv-pop="' + card.getAttribute("data-rv") + '"]'); if (open) open.hidden = false;
      // Once per page; the automation is once anyway.
      var step = card.getAttribute("data-rv-step");
      if (step && !told[step]) {
        told[step] = 1;
        try { fetch(step, { credentials: "same-origin", redirect: "manual", keepalive: true }).catch(function () {}); } catch (x) {}
      }
      return;
    }
    if (open && (e.target === open || e.target.closest(".rv-x"))) shut();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") shut(); });

  /* The video ends: on to the cards. watch.js makes the <video> after this runs, so wait for it. */
  var box = root.querySelector(".rv-video"), tries = 0;
  (function hook() {
    var v = box && box.querySelector("video");
    if (!v) { if (box && tries++ < 40) setTimeout(hook, 250); return; }
    var poster = box.getAttribute("data-poster");
    if (poster && /^https?:\/\//.test(poster)) v.poster = poster;
    // The green line above the video is its progress bar (Jeff, 2026-10-13): filled as it plays, smooth while playing.
    var bar = box.closest(".rl-in"), raf = 0;
    function prog() { if (bar && v.duration) bar.style.setProperty("--rv-p", Math.min(100, v.currentTime / v.duration * 100).toFixed(2) + "%"); }
    function run() { prog(); raf = !v.paused && !v.ended ? requestAnimationFrame(run) : 0; }
    v.addEventListener("play", function () { if (!raf) run(); });
    ["timeupdate", "seeked", "loadedmetadata", "pause"].forEach(function (ev) { v.addEventListener(ev, prog); });
    v.addEventListener("ended", function () { var ask = root.querySelector(".rv-ask"); if (ask) ask.scrollIntoView({ behavior: "smooth" }); });
  })();
})();
