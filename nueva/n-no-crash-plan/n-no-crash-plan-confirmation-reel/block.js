/* nueva/n-no-crash-plan/n-no-crash-plan-confirmation-reel — the confirmation reel (platform only; see block.html).
 * The reel's moves are _shared/reel/v1/reel.js (block.html loads it); this adds the typed headline, the rep's picture on
 * the ask screen and the computer's button, and the dock's way to the request step (the last part, shared with the Tone and
 * Tighten confirmation reel). (A newer reel uses reel.js's own versions of the first ones: h1.rl-type, .rl-who, .rl-gift-word.) */

/* THE REP'S PICTURE, big, with the check: the same picture the dock shows (src/lib/funnel-native.mjs puts it in
 * #pfn-data). No picture and no name: the space stays empty rather than showing a stranger's initial. */
(function () {
  var box = document.querySelector(".rlc-who");
  if (!box) return;
  var d = {}; try { d = JSON.parse(document.getElementById("pfn-data").textContent); } catch (e) { return; }
  if (!d.rep || !d.rep.pic) return;
  box.querySelector(".rlc-pic").innerHTML = d.rep.pic;   // made on the server (rep-avatar.mjs pictureHtml), escaped there
  box.hidden = false;
  // A computer's floating button carries the rep too: their picture, the check, then "Get a discount code".
  var cta = document.querySelector(".rlc .rl-cta");
  if (cta) {
    var name = document.createElement("span"); name.textContent = cta.textContent.trim();
    cta.textContent = "";
    cta.insertAdjacentHTML("afterbegin", '<span class="rlc-cta-pic" aria-hidden="true"><span>' + d.rep.pic + '</span><span class="rlc-check"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span></span>');
    cta.appendChild(name);
  }
})();

/* "Swipe for a free gift" under the buttons; a computer scrolls. */
(function () {
  var w = document.querySelector(".rlc-gift-word");
  if (w && !window.matchMedia("(pointer: coarse)").matches) w.textContent = "Scroll for a free gift";
})();

/* THE HEADLINE TYPES ITSELF OUT when the platform has put the visitor's first name in it, exactly as on the
 * scrolling confirmation: every letter in place from the start and revealed in turn, so nothing below moves. */
(function () {
  var h = document.querySelector(".rlc h1");
  if (!h || !h.querySelector(".pf-lead-name") || h.dataset.typed) return;
  h.dataset.typed = "1";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
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
  setTimeout(function tick() {
    if (i) letters[i - 1].classList.remove("tw-cur");
    if (i >= letters.length) { h.classList.remove("is-typing"); return; }
    var s = letters[i++]; s.classList.add("tw-on", "tw-cur");
    var ch = s.textContent, next = letters[i] && letters[i].previousSibling;
    setTimeout(tick, ch === "." || ch === "," ? 260 : next && next.nodeType === 3 ? 60 : 42);
  }, 450);   // after the page has risen out of the cream
})();

/* ---------- the ask: the dock goes to the request step ---------- */
/* The dock is drawn by the platform from data-pf-dock (funnel-native.js) as a button that opens a form, and this page has
 * no form: its tap, its swipe (which clicks it) and a flick past the last screen (reel.js clicks it) go to the request
 * step named in data-rl-next instead, where the rep is alerted (migration 0427). The ask's button and the computer's
 * .rl-cta are plain links to the same step.
 * ⚠️ The same code is in nueva/n-tone-and-tighten-guide-funnel/n-tone-and-tighten-guide-confirmation-reel/block.js: change both. */
(function () {
  var root = document.querySelector("[data-rl-next]");
  if (!root) return;
  var next = root.getAttribute("data-rl-next");
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".pfn-dock")) { e.preventDefault(); location.href = next; }
  });
})();
