/* nueva/n-opportunity-public/n-opportunity-public-reel: the rep's name on the cover and in the banner (see block.html). */
(function () {
  var root = document.querySelector(".rv");
  if (!root) return;
  var d = {}; try { d = JSON.parse(document.getElementById("pfn-data").textContent); } catch (e) {}
  var first = d.rep && d.rep.first;
  if (first) [].forEach.call(root.querySelectorAll("[data-rv-rep]"), function (s) { s.textContent = first; });
  var banner = root.querySelector(".rv-banner");
  if (banner && first) {
    if (d.rep.pic) banner.querySelector(".rv-banner-pic").innerHTML = d.rep.pic; else banner.querySelector(".rv-banner-pic").remove();
    banner.hidden = false; root.classList.add("rv-has-banner");
  }
})();
