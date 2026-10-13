/* nueva/n-revive-video/n-revive-video — the three cards' pop-ups, the rep's name in them, and the video moving the
 * page on to the cards when it ends (see block.html). The taps themselves are reported by the platform's watch.js. */
(function () {
  var root = document.querySelector(".rv");
  if (!root) return;
  var d = {}; try { d = JSON.parse(document.getElementById("pfn-data").textContent); } catch (e) {}
  var first = d.rep && d.rep.first;
  if (first) [].forEach.call(root.querySelectorAll("[data-rv-rep]"), function (s) { s.textContent = first; });

  var open = null;
  function shut() { if (open) { open.hidden = true; open = null; } }
  root.addEventListener("click", function (e) {
    var card = e.target.closest && e.target.closest("[data-rv]");
    if (card) { shut(); open = root.querySelector('[data-rv-pop="' + card.getAttribute("data-rv") + '"]'); if (open) open.hidden = false; return; }
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
    v.addEventListener("ended", function () { var ask = root.querySelector(".rv-ask"); if (ask) ask.scrollIntoView({ behavior: "smooth" }); });
  })();
})();
