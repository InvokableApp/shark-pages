/* nueva / n-tone-and-tighten-guide-funnel / n-tone-and-tighten-guide-confirmation
 *
 * Loads the shared confirmation engine, then resolves this page's two optional custom values.
 *
 * ⚠️ THE LOADER HAS ALREADY SUBSTITUTED EVERY MERGE FIELD by the time this runs, and it does so
 * raw, with no notion of a value that is not filled in yet. On a snapshot account every custom
 * value holds its own instruction text, so a merge field written straight into the copy ships as
 * "Message Enter YOUR first name." and one written into an href ships as a link to
 * "https://paste the link to the guide pdf here". Nothing optional is written that way here: the
 * root carries the values as data-cv-*, and the two constructs below read them through cv().
 *
 * ⚠️ GHL injects blocks with innerHTML, which does not execute <script>, so appending the shared
 * engine from here is the only route it has onto the page. A block that gains an interactive
 * element gains a block.js in the same edit.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/confirm/v1/confirm.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });

  var root = document.querySelector(".sk-conf-nva");
  if (!root || root.dataset.skCvBooted) return;
  root.dataset.skCvBooted = "1";

  // Empty, still-unsubstituted, and the snapshot's "Enter your..." instruction all count as
  // NOT filled. Same guard as the guide page and the links hub.
  function cv(key) {
    var v = (root.getAttribute("data-cv-" + key) || "").trim();
    if (!v || v.indexOf("{") !== -1 || /^(paste|enter|add)\b/i.test(v)) return "";
    return v;
  }

  // Optional TEXT: <el data-cv-opt="key"><span data-cv-val></span></el>
  // Unfilled, the element is hidden. The phone mock's name bar with no name in it reads as a
  // broken screenshot, which is worse than a bar that is not there.
  var opt = root.querySelectorAll("[data-cv-opt]");
  for (var j = 0; j < opt.length; j++) {
    var el = opt[j], v = cv(el.getAttribute("data-cv-opt"));
    if (!v) { el.style.display = "none"; continue; }
    var slot = el.querySelector("[data-cv-val]");
    if (slot) slot.textContent = v; else el.textContent = v;
  }

  // Optional LINK: <a data-cv-href="key"> ships with NO href at all until this resolves one.
  // Unfilled, the button is removed rather than left pointing at "https://". The page still has
  // its READ IT ONLINE button, which needs no custom value, so the lead is never stranded.
  var lk = root.querySelectorAll("[data-cv-href]");
  for (var i = 0; i < lk.length; i++) {
    var val = cv(lk[i].getAttribute("data-cv-href"));
    if (!val) { if (lk[i].parentNode) lk[i].parentNode.removeChild(lk[i]); continue; }
    lk[i].setAttribute("href", /^https?:\/\//i.test(val) ? val : "https://" + val.replace(/^\/+/, ""));
  }
})();
