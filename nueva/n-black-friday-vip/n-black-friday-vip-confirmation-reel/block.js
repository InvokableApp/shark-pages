/* nueva/n-black-friday-vip/n-black-friday-vip-confirmation-reel: the dock moves to the picks (screen 2) and steps out of
 * the way after the first screen, because the picks are the asks. A flick past the last screen does nothing: a pick is a
 * tap, so scrolling never alerts the rep. Same idea as the Tone and Tighten confirmation's bonus frame. */
(function () {
  var root = document.querySelector(".vipc"); if (!root) return;
  var track = root.querySelector(".rl-track"), screens = [].slice.call(root.querySelectorAll(".rl-p"));
  function here() { var t = track ? track.scrollTop : 0, b = 0; screens.forEach(function (s, i) { if (Math.abs(s.offsetTop - t) < Math.abs(screens[b].offsetTop - t)) b = i; }); return b; }
  function dock() { return document.querySelector(".pfn-dock"); }
  function sync() { var dk = dock(); if (dk) dk.classList.toggle("pfn-gone", here() > 0); }
  if (track) track.addEventListener("scroll", sync, { passive: true });
  setTimeout(sync, 500);
  document.addEventListener("click", function (e) {
    var dk = dock(); if (!dk || !dk.contains(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    if (screens[1]) track.scrollTo({ top: screens[1].offsetTop, behavior: "smooth" });
  }, true);
})();
