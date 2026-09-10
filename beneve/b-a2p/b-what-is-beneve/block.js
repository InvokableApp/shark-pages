/* beneve / b-what-is-beneve-overview / b-what-is-beneve
 *
 * Two jobs. First, load the shared product-page engine, which is what every long-form page in the
 * system ships and where the scroll progress, sticky bar, reveal-on-scroll and smooth anchor
 * scrolling live. A fix there reaches every page on one push.
 *
 * Second, the video slots. Each one carries data-video. While that is empty the slot renders the
 * placeholder already in the markup plus a "coming soon" line, and is not clickable. Put a Vimeo id
 * in the attribute and the same slot becomes a click to load facade: nothing is requested from
 * vimeo.com until the visitor actually clicks, so an unwatched video costs the page nothing.
 *
 * data-video-h is OPTIONAL and carries Vimeo's privacy hash, the "?h=" on a share URL. A public
 * video does not need it and Vimeo ignores it; an UNLISTED one answers 401 without it and the slot
 * would show a black box with no error anywhere. So it is passed through whenever it is present,
 * which means a video flipped to unlisted later keeps playing instead of silently dying.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";

  ["_shared/product/v1/product.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });

  function play(slot, id, hash) {
    var f = document.createElement("iframe");
    // dnt=1 keeps Vimeo from setting tracking cookies, which matters because this page ships into
    // buyer accounts under their own domain and their own privacy policy.
    f.src = "https://player.vimeo.com/video/" + encodeURIComponent(id) + "?autoplay=1&dnt=1" +
            (hash ? "&h=" + encodeURIComponent(hash) : "");
    f.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
    f.setAttribute("allowfullscreen", "");
    f.setAttribute("title", "Beneve video");
    slot.appendChild(f);
    var btn = slot.querySelector(".sk-what-video-btn");
    if (btn) btn.remove();
  }

  function wire(slot) {
    var id = (slot.getAttribute("data-video") || "").trim();
    var hash = (slot.getAttribute("data-video-h") || "").trim();
    var inner = slot.querySelector(".sk-what-video-in");

    if (!id) {
      // No video yet. Say so plainly rather than showing a play button that does nothing.
      if (inner && !inner.querySelector(".sk-what-video-soon")) {
        var note = document.createElement("p");
        note.className = "sk-what-video-soon";
        note.textContent = "Video coming soon";
        inner.appendChild(note);
      }
      return;
    }

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sk-what-video-btn";
    var cap = slot.querySelector(".sk-what-video-cap");
    btn.setAttribute("aria-label", "Play video" + (cap ? ": " + cap.textContent.trim() : ""));
    btn.addEventListener("click", function () { play(slot, id, hash); });
    slot.appendChild(btn);
  }

  function run() {
    var slots = document.querySelectorAll(".sk-prod-bnv-what .sk-what-video");
    for (var i = 0; i < slots.length; i++) wire(slots[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
