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

  function fill(name, text) { [].forEach.call(root.querySelectorAll('[data-pr="' + name + '"]'), function (x) { x.textContent = text; }); }
  fill("name", r.name); fill("h", r.h); fill("p", r.p); fill("start", r.start); fill("search", r.search);
  fill("real", r.real.replace(/^"|"(?= \()/g, "").replace(/ \((r\/[^)]+)\)$/, ""));
  var src = r.real.match(/\((r\/[^)]+)\)$/); if (src) root.querySelector(".pq-real").setAttribute("data-src", src[1]);
  fill("pitch", key === "connector" ? d.connector_p : d.pitch_p);
  // No name known: the platform drops the name span, so the headline starts with a capital.
  var h = root.querySelector('[data-pr="h"]');
  if (!h.parentNode.textContent.slice(0, h.parentNode.textContent.indexOf(h.textContent)).trim()) h.textContent = h.textContent.charAt(0).toUpperCase() + h.textContent.slice(1);

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
