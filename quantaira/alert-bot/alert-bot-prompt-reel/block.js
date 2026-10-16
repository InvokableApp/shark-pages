/* quantaira/alert-bot/alert-bot-prompt-reel — the Copy the prompt button. Copies the prompt exactly as shown, then says
 * so. A browser that refuses the clipboard (an in-app browser can) gets the prompt selected instead, to copy by hand. */
(function () {
  var btn = document.querySelector("[data-qab-copy]");
  var pre = document.getElementById("qab-prompt");
  var done = document.querySelector("[data-qab-copied]");
  if (!btn || !pre) return;
  function said(text) { if (done) { done.textContent = text; done.classList.add("on"); } }
  function selectIt() {
    var r = document.createRange(); r.selectNodeContents(pre);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    said("Selected. Tap Copy, then paste it into a new chat.");
  }
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var text = pre.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { said("Copied. Paste it into a new chat."); }, selectIt);
    } else selectIt();
  });
})();

/* The bonus bar: a tap scrolls the reel to the pitch (the last screen) rather than jumping the page. */
(function () {
  var bar = document.querySelector("[data-qab-bonus]");
  var pitch = document.getElementById("qab-pitch");
  var track = document.querySelector(".rl-track");
  if (!bar || !pitch || !track) return;
  bar.addEventListener("click", function (e) {
    e.preventDefault(); e.stopPropagation();
    track.scrollTo({ top: pitch.offsetTop, behavior: "smooth" });
  });
})();

/* Loads fit.js, the words-as-big-as-the-phone-allows script all three pages share (2026-10-16). */
(function () { var s = document.createElement("script"); s.src = "/_p/quantaira/alert-bot/alert-bot-reel/fit.js?v=1"; s.defer = true; document.head.appendChild(s); })();
