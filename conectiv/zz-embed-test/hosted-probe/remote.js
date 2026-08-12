/* Served from GitHub Pages, never written into GHL.
   Proves three things at once:
     1. GHL's sanitizer allows an external <script src> in a custom-code block
     2. hosted JS can read merge-field values handed in via data-* on the stub
     3. changing THIS file changes the live page with no GHL write */
(function () {
  var root = document.querySelector(".sk-conectiv-zz-embed-test-hosted-probe");
  if (!root) return;

  var name = (root.getAttribute("data-cv-name") || "").trim();
  var amaze = (root.getAttribute("data-cv-amaze") || "").trim();
  var disc = (root.getAttribute("data-cv-disclaimer") || "").trim();

  root.innerHTML =
    '<span class="hp-tag">Rendered from GitHub Pages</span>' +
    "<h3>This markup was never written into GHL.</h3>" +
    "<p>The block in GoHighLevel is a 12 line stub. Everything you are reading came from " +
    "the shark-pages repo at page load, so a git push changes it with no GHL write.</p>" +
    "<p>Merge fields handed in from the stub:</p>" +
    "<p>full name: <code>" + (name || "(empty on the snapshot, as expected)") + "</code></p>" +
    "<p>amaze link: <code>" + (amaze || "(empty)") + "</code></p>" +
    "<p>disclaimer: <code>" + (disc ? disc.slice(0, 68) + "..." : "(empty)") + "</code></p>" +
    '<p style="margin-top:14px">build marker: <code>v1</code></p>';
})();
