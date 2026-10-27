/* mpg/m-team-page/m-team: the team page's own moves.
 *   - the rep's first name and picture ("That's Sarah.", "Text Sarah"), from the platform's #pfn-data
 *   - [data-needs] buttons leave the page when the value they name came through empty (no texting number, no Messenger)
 * The videos are watch.js boxes ([data-video]); it builds the players and tells the rep who watched. */
(function () {
  var root = document.querySelector(".om");
  if (!root) return;
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
  [].forEach.call(root.querySelectorAll("[data-needs]"), function (el) {
    var v = String(el.getAttribute("data-needs") || "").trim();
    if (!v || /\{\{|^https?:\/\/$/.test(v)) el.hidden = true;
  });
})();
