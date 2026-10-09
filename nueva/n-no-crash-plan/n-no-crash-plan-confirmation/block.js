/* nueva/n-no-crash-plan/n-no-crash-plan-confirmation
 *
 * Deliberately almost empty. This page has no form, no popup and no reveal: everything on it is
 * a link, and a link needs no JavaScript. The one job is the desktop `sms:` case.
 *
 * ⚠️ `sms:` HAS NO HANDLER ON MOST DESKTOPS. The SMS redirect step itself prints the rep's
 * number as selectable text, so a desktop visitor who lands there can still read and type it.
 * This only softens the entry: on a device with no touch input the text option says so before
 * the click rather than after it.
 */
(function () {
  var root = document.querySelector(".sk-ew-conf");
  if (!root) return;
  var coarse = window.matchMedia && window.matchMedia("(any-pointer: coarse)").matches;
  if (coarse) return;
  var alt = root.querySelector(".ew-alt a");
  if (alt) alt.textContent = "Or text instead (we will show you the number)";
})();

/* THE HEADLINE TYPES ITSELF OUT when the platform has put the visitor's first name in it (2026-10-09,
 * the walkthrough's typed greeting, Jeff: "bring an aspect of this ... into the confirmation pages").
 * Only then: on GHL, or for a visitor whose name isn't known, .pf-lead-name never exists and the
 * headline sits still as before. No key sounds: a page can't play audio before the visitor taps it. */
(function () {
  var h = document.querySelector(".sk-ew-conf h1");
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
