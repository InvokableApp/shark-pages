/* GLP webinar opt-in (glpshark.com/zoom, Shark Sales).
 * From 2026-11-09 the live GLP calls sign up on the platform, marketingshark.app/glp/zoom (references/WEBINAR-SOP.md).
 * Jeff, 2026-11-09, for Training With The Titans: "lets also put this on the glpshark/zoom link in case joe doesnt want
 * to change link". So a visitor on glpshark.com goes straight there, keeping any ?utm or ref on the address. A preview
 * of this block anywhere else still shows the old page. */
(function () {
  if (/(^|\.)glpshark\.com$/i.test(location.hostname)) {
    location.replace("https://marketingshark.app/glp/zoom" + location.search);
    return;
  }
  var s = document.createElement("script");
  s.src = "https://invokableapp.github.io/shark-pages/_shared/webinar/v1/webinar.js";
  if (window.__wbLocal) s.src = window.__wbLocal + "_shared/webinar/v1/webinar.js";
  document.body.appendChild(s);
})();
