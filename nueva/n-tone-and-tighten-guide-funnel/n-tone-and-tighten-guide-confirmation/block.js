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

/* THE HEADLINE TYPES ITSELF OUT when the platform has put the visitor's first name in it (2026-10-09,
 * the walkthrough's typed greeting, Jeff: "bring an aspect of this ... into the confirmation pages").
 * Only then: on GHL, or for a visitor whose name isn't known, .pf-lead-name never exists and the
 * headline sits still as before. No key sounds: a page can't play audio before the visitor taps it. */
(function () {
  var h = document.querySelector(".sk-conf-nva h1");
  if (!h || !h.querySelector(".pf-lead-name") || h.dataset.typed) return;
  h.dataset.typed = "1";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
  // Every letter stays in the layout from the start, hidden, and is revealed in turn, so the lines
  // wrap where they will end up and nothing below moves (measuring the height instead failed: the
  // web font arrived after the measurement and the paragraph jumped).
  var letters = [], w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [], n;
  while ((n = w.nextNode())) nodes.push(n);
  nodes.forEach(function (t) {
    var frag = document.createDocumentFragment();
    t.nodeValue.replace(/\s+/g, " ").split("").forEach(function (ch) {
      if (ch === " ") { frag.appendChild(document.createTextNode(" ")); return; }
      var s = document.createElement("span"); s.className = "tw-c"; s.textContent = ch;
      frag.appendChild(s); letters.push(s);
    });
    t.parentNode.replaceChild(frag, t);
  });
  h.classList.add("is-typing");
  var i = 0;
  (function tick() {
    if (i) letters[i - 1].classList.remove("tw-cur");
    if (i >= letters.length) { h.classList.remove("is-typing"); return; }
    var s = letters[i++]; s.classList.add("tw-on", "tw-cur");
    var ch = s.textContent, next = letters[i] && letters[i].previousSibling;
    var gap = next && next.nodeType === 3 ? 60 : 42;   // a word break reads as a beat
    setTimeout(tick, ch === "." || ch === "," ? 260 : gap);
  })();
})();
