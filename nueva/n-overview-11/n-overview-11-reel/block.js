/* nueva/n-overview-11/n-overview-11-reel (cloned from nueva/n-business-overview/n-business-overview-reel): the
 * four choices' pop-ups, the rep's name in them, each choice's step opened quietly so the rep's alert runs (see
 * block.html), the message copied, and the video moving the page on to the choices when it ends. */
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
      // The choice's step: a known lead's view of it is the rep's alert (0670). Once per page, the automation is once anyway.
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

  /* The video ends: on to the choices. watch.js makes the <video> after this runs, so wait for it. */
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
  /* WATCH IT LATER (MPG's, mpg/m-swipe-book/m-learn-more block.js): an event tomorrow at 7pm, linking back to this page.
   * Android gets Google Calendar's filled-in add-event page; an iPhone or a computer gets the server's calendar file
   * (/_cal, platform server.mjs), which an iPhone opens as Apple's "Add to Calendar". */
  var later = document.getElementById("watch-later");
  if (later) later.addEventListener("click", function () {
    var at = new Date(); at.setDate(at.getDate() + 1); at.setHours(19, 0, 0, 0);
    var end = new Date(at.getTime() + 15 * 60000);
    var z = function (x) { return x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
    // the step's own slug answers on every rep address (the page may have been opened as /{funnel}/{step})
    var path = "/" + location.pathname.split("/").filter(Boolean).pop();
    var title = "Watch the 11 minute opportunity overview";
    var note = "The 11 minute overview, from " + (first || "the person who shared it with you") + ".";
    if (/Android/i.test(navigator.userAgent)) {
      location.href = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(title) + "&dates=" + z(at) + "/" + z(end) +
        "&details=" + encodeURIComponent(note + " Open: " + location.origin + path);
      return;
    }
    location.href = "/_cal?t=" + encodeURIComponent(title) + "&s=" + z(at) + "&m=15&p=" + encodeURIComponent(path) + "&n=" + encodeURIComponent(note);
  });
})();
