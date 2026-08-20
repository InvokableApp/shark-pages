/* ============================================================
   SHARED TRAINING PORTAL BEHAVIOUR
   One script for every training-portal page in every system.

   Four jobs:
     1. icons        — inline SVG by name, so the markup carries no path data
     2. video facade — poster now, iframe only on click
     3. progress     — localStorage checklist, only where content is a sequence
     4. filter       — type-to-narrow on the library pages
     5. reveal       — progressive-enhancement scroll-in, guarded by .sk-motion
   ============================================================ */
(function () {
  "use strict";

  var ICONS = {
    play:   '<path d="m10 8.5 6 3.5-6 3.5Z"/><circle cx="12" cy="12" r="9.5"/>',
    home:   '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/>',
    cog:    '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/>',
    mega:   '<path d="M4 9.5v5h3l6 4V5.5l-6 4Z"/><path d="M17 9a4.5 4.5 0 0 1 0 6"/>',
    cal:    '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    life:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.6"/><path d="m5.6 5.6 3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9"/>',
    check:  '<path d="m4.5 12.5 5 5 10-11"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    ext:    '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
    apple:  '<path d="M15.5 3c.2 1.2-.3 2.3-1 3.1-.7.8-1.8 1.4-2.9 1.3-.2-1.1.4-2.3 1-3 .8-.8 2-1.4 2.9-1.4Z"/><path d="M19 16.5c-.5 1.2-.8 1.7-1.4 2.7-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9s-2.3.9-3.7.9c-1.6 0-2.8-1.5-3.7-2.9C1 16.5.8 11.9 2.5 9.6c1.2-1.7 3-2.6 4.8-2.6 1.8 0 2.9 1 4.4 1 1.4 0 2.3-1 4.4-1 1.6 0 3.2.9 4.4 2.4-3.9 2.1-3.2 7.6-1.5 7.1Z"/>',
    droid:  '<path d="M6 10.5h12V18a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 18v-7.5Z"/><path d="M6 10.5a6 6 0 0 1 12 0"/><path d="m7.5 4.5 1.6 2.4M16.5 4.5l-1.6 2.4"/><path d="M3.2 11.5v4.2M20.8 11.5v4.2M9.5 19.5v2.3M14.5 19.5v2.3"/>',
    key:    '<circle cx="8" cy="12" r="4"/><path d="M12 12h9l-1.5 2.5M17 12v3"/>',
    doc:    '<path d="M14 3.5H7.5A1.5 1.5 0 0 0 6 5v14a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V7.5Z"/><path d="M14 3.5V7a.5.5 0 0 0 .5.5H18"/><path d="M9 12.5h6M9 16h4"/>',
    users:  '<circle cx="9.5" cy="8.5" r="3.2"/><path d="M3.5 19.5c.5-3.2 3-5.2 6-5.2s5.5 2 6 5.2"/><path d="M16.5 6.5a3 3 0 0 1 0 5.6M17.5 14.6c2.1.5 3.6 2.3 4 4.9"/>',
    chart:  '<path d="M4 19.5h16"/><rect x="6" y="11" width="3.2" height="6"/><rect x="11.4" y="7" width="3.2" height="10"/><rect x="16.8" y="13.5" width="3.2" height="3.5"/>',
    flag:   '<path d="M6 21V4"/><path d="M6 4.5h11l-2 3.5 2 3.5H6"/>',
    chat:   '<path d="M20.5 12.2c0 4-3.8 7.2-8.5 7.2a9.8 9.8 0 0 1-2.6-.35L4.5 20.5l1.2-3.4A6.9 6.9 0 0 1 3.5 12.2C3.5 8.2 7.3 5 12 5s8.5 3.2 8.5 7.2Z"/>',
    mail:   '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.8 7 8.2 6 8.2-6"/>',
  };
  function icon(n) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[n] || ICONS.play) + "</svg>";
  }

  /* Vimeo and YouTube take different embed URLs and different poster hosts, and
     the block config only ever carries the raw share URL, so both are parsed
     here rather than in every page's config. */
  function parseVideo(raw) {
    if (!raw) return null;
    var v = String(raw).match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (v) return { kind: "vimeo", id: v[1], embed: "https://player.vimeo.com/video/" + v[1] + "?autoplay=1&title=0&byline=0&portrait=0" };
    var y = String(raw).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{6,})/);
    if (y) return { kind: "yt", id: y[1], embed: "https://www.youtube.com/embed/" + y[1] + "?autoplay=1&rel=0", poster: "https://i.ytimg.com/vi/" + y[1] + "/maxresdefault.jpg" };
    return null;
  }

  function mountVideo(frame) {
    var vid = parseVideo(frame.getAttribute("data-video"));
    if (!vid) { frame.remove(); return; }
    var img = frame.querySelector("img");

    if (vid.kind === "yt") {
      img.onload = function () { img.classList.add("ok"); };
      img.src = vid.poster;
    } else {
      /* Vimeo posters need an oEmbed lookup; the request is public and needs no
         key. If it fails the brand-deep ground stays, which reads as a
         deliberate card rather than a broken image. */
      fetch("https://vimeo.com/api/oembed.json?url=https://vimeo.com/" + vid.id)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d) return;
          if (d.thumbnail_url) { img.onload = function () { img.classList.add("ok"); }; img.src = d.thumbnail_url.replace(/-d_\d+x\d+$/, "-d_1280x720"); }
          if (d.duration) {
            var m = Math.floor(d.duration / 60), s = d.duration % 60;
            var tag = document.createElement("span");
            tag.className = "sk-dur";
            tag.textContent = m + ":" + (s < 10 ? "0" : "") + s;
            frame.appendChild(tag);
          }
        })
        .catch(function () {});
    }

    frame.addEventListener("click", function () {
      if (frame.getAttribute("data-live") === "true") return;
      var f = document.createElement("iframe");
      f.src = vid.embed;
      f.allow = "autoplay; fullscreen; picture-in-picture";
      f.setAttribute("allowfullscreen", "");
      f.setAttribute("title", frame.getAttribute("data-title") || "Training video");
      frame.appendChild(f);
      frame.setAttribute("data-live", "true");
    });
  }

  function initProgress(root, key) {
    var rail = root.querySelector("[data-progress]");
    var cards = [].slice.call(root.querySelectorAll(".sk-steps .sk-card[data-step]"));
    if (!rail || !cards.length) return;

    var store = "sk-train:" + key;
    var done = {};
    try { done = JSON.parse(localStorage.getItem(store) || "{}") || {}; } catch (e) { done = {}; }

    var ring = rail.querySelector(".v");
    var C = 2 * Math.PI * 19;
    ring.setAttribute("stroke-dasharray", C.toFixed(1));

    function paint() {
      var n = 0;
      cards.forEach(function (c) {
        var on = !!done[c.getAttribute("data-step")];
        c.setAttribute("data-done", on ? "true" : "false");
        c.querySelector(".sk-step").setAttribute("aria-pressed", on ? "true" : "false");
        if (on) n++;
      });
      ring.setAttribute("stroke-dashoffset", (C * (1 - n / cards.length)).toFixed(1));
      rail.querySelector(".sk-progress-count").textContent = n + " of " + cards.length + " complete";
      rail.querySelector(".sk-progress-hint").textContent = n === cards.length
        ? "You are through the setup. Time to drive traffic."
        : "Tap a step number as you finish it. Saved on this device.";
      rail.querySelector(".sk-progress-reset").hidden = n === 0;
    }

    cards.forEach(function (c) {
      c.querySelector(".sk-step").addEventListener("click", function () {
        var k = c.getAttribute("data-step");
        done[k] = !done[k];
        try { localStorage.setItem(store, JSON.stringify(done)); } catch (e) {}
        paint();
      });
    });
    rail.querySelector(".sk-progress-reset").addEventListener("click", function () {
      done = {};
      try { localStorage.removeItem(store); } catch (e) {}
      paint();
    });
    paint();
  }

  function initFilter(root) {
    var box = root.querySelector("[data-filter]");
    var lib = root.querySelector(".sk-lib");
    if (!box || !lib) return;
    var cards = [].slice.call(lib.querySelectorAll(".sk-card"));
    box.addEventListener("input", function () {
      var q = box.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var hit = !q || c.textContent.toLowerCase().indexOf(q) > -1;
        c.hidden = !hit;
        if (hit) shown++;
      });
      lib.setAttribute("data-empty", shown ? "false" : "true");
    });
  }

  window.SharkTraining = function (root) {
    if (!root || root.getAttribute("data-mounted") === "1") return;
    root.setAttribute("data-mounted", "1");

    root.querySelectorAll("[data-icon]").forEach(function (n) { n.innerHTML = icon(n.getAttribute("data-icon")); });
    root.querySelectorAll(".sk-frame[data-video]").forEach(mountVideo);
    initProgress(root, root.getAttribute("data-key") || "default");
    initFilter(root);

    /* Reveal is progressive enhancement: the .sk-motion guard is added HERE, so
       a browser without IntersectionObserver, or a failed script, leaves every
       card visible rather than a page of invisible content. */
    if (!("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("sk-motion");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("sk-reveal");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .06 });
    root.querySelectorAll(".sk-card, .sk-progress").forEach(function (n) { io.observe(n); });
  };

  document.querySelectorAll(".sk-train:not([data-mounted])").forEach(window.SharkTraining);
})();
