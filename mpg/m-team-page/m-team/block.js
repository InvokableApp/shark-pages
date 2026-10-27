/* mpg/m-team-page/m-team: the team page's moves (block.html is Mike's own markup, MPGSHARK/_build/make-team-page.py).
 *   - his .reveal fade-in: each block rises in as it scrolls into view (.is-in, his stylesheet); everything shows at once
 *     where the browser can't watch the scroll
 *   - Dr. Ben's clip list: a title plays its clip in the player above, and becomes "Now playing" as on his page
 *   - the full interview and Sam's overview open in a pop-up (watch.js builds their players and tells the rep)
 *   - the rep who shared it: their first name and picture (#pfn-data), and [data-needs] buttons whose value came through
 *     empty (no texting number, no Messenger) leave the page
 *   - the product links: the rep's MPG shop link + that product's path (marketplaceglobal.com/<id>/product/...); a shop
 *     link of another shape is used as it is, and no shop link at all takes the link off */
(function () {
  var root = document.querySelector(".om-lv");
  if (!root) return;

  var reveal = root.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    [].forEach.call(reveal, function (el) { io.observe(el); });
  } else [].forEach.call(reveal, function (el) { el.classList.add("is-in"); });

  var player = root.querySelector("[data-om-player]");
  var clips = root.querySelectorAll("[data-om-clip]");
  var subs = [].map.call(clips, function (b) { var s = b.querySelector(".mt-1.block"); return s ? s.textContent : ""; });
  [].forEach.call(clips, function (b, n) {
    b.addEventListener("click", function () {
      if (!player) return;
      player.src = b.getAttribute("data-om-clip");
      var p = player.play(); if (p && p.catch) p.catch(function () {});
      [].forEach.call(clips, function (o, m) {
        o.classList.toggle("text-primary", o === b); o.classList.toggle("text-foreground", o !== b);
        var s = o.querySelector(".mt-1.block"); if (s) s.textContent = o === b ? "Now playing" : (subs[m] === "Now playing" ? "" : subs[m]);
      });
      player.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  // His first title's line says "Now playing"; the others' own lines are kept for when it isn't.
  if (subs[0] === "Now playing") subs[0] = "";

  [].forEach.call(root.querySelectorAll("[data-om-pop]"), function (b) {
    b.addEventListener("click", function () {
      var box = root.querySelector('[data-om-pop-box="' + b.getAttribute("data-om-pop") + '"]');
      if (box) box.hidden = false;
    });
  });
  [].forEach.call(root.querySelectorAll(".om-pop"), function (box) {
    var close = function () {
      box.hidden = true;
      [].forEach.call(box.querySelectorAll("video"), function (v) { v.pause(); });
      [].forEach.call(box.querySelectorAll("iframe"), function (f) { var s = f.src; f.src = ""; f.src = s; });   // stops Vimeo
    };
    box.addEventListener("click", function (e) { if (e.target === box || e.target.closest("[data-om-x]")) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.hidden) close(); });
  });

  var d = {}; try { d = JSON.parse(document.getElementById("pfn-data").textContent); } catch (e) {}
  var rep = d.rep || {};
  if (rep.first) {
    [].forEach.call(root.querySelectorAll("[data-om-first]"), function (s) { s.textContent = rep.first; });
    var line = root.querySelector("[data-om-rep]");
    if (line) {
      var pic = line.querySelector(".om-rep-pic");
      if (rep.pic) pic.innerHTML = rep.pic; else pic.remove();
      line.hidden = false;
    }
  }
  [].forEach.call(root.querySelectorAll("[data-om-product]"), function (a) {
    var shop = String(a.getAttribute("href") || "").trim();
    if (shop && !/\{\{/.test(shop) && !/^https?:\/\//i.test(shop) && /^[\w-]+(\.[\w-]+)+/.test(shop)) shop = "https://" + shop;
    if (!shop || /\{\{/.test(shop) || !/^https?:\/\/./i.test(shop)) { a.hidden = true; return; }
    a.href = shop;
    var m = shop.match(/^(https?:\/\/(?:www\.)?marketplaceglobal\.com\/[^\/?#]+)\/?(?:[?#].*)?$/i);
    if (m) a.href = m[1] + a.getAttribute("data-om-product");
  });
  [].forEach.call(root.querySelectorAll("[data-needs]"), function (el) {
    var v = String(el.getAttribute("data-needs") || "").trim();
    if (!v || /\{\{|^https?:\/\/$/.test(v)) el.hidden = true;
  });
})();
