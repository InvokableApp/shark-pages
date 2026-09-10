/* _shared/confirm/v1/confirm.js
 *
 * The ONE confirmation-page behaviour file, for every campaign in every system, scoped .sk-conf.
 * Same contract as _shared/howto/v1/howto.js: a page's block.js loads this and nothing else.
 *
 * It does three things.
 *
 *   1. VIDEO FACADE. The markup ships a poster and a play button, never an iframe. The vimeo
 *      player is only injected on click, so a confirmation page carrying a video still loads
 *      like one that does not, and no third-party frame is created for a visitor who never
 *      presses play. The id lives in data-vimeo, so swapping the video is a one-token edit.
 *
 *   2. EMPTY-SLOT HIDING. If data-vimeo is empty the whole section is hidden. This is what lets
 *      the page ship BEFORE the video exists. The alternative, a "video coming soon" card, is
 *      worst on exactly this page: it is the one screen where you are asking someone to believe
 *      a stranger will put something in the post, and an unkept promise in the middle of it is
 *      the wrong first impression. Paste the id in later and the section appears by itself.
 *
 *   3. POPUP CTA. A CTA carrying `data-sk-open` opens the GHL page's own popup instead of
 *      navigating. Added 2026-09-02 for the Beneve Hormone Lunchbox split test, whose B page
 *      asks the reader to note the rep's name before joining the group, and that ask lives in
 *      the page popup rather than in this block so the rep's name comes from the account.
 *
 *      Same attribute and same mechanic as _shared/capture/v1: the no-argument window event
 *      GHL ships for custom widgets. It is the ONLY account-agnostic trigger channel, because
 *      it names no popup id, and ids are `hl_main_popup-<random>`, minted per page
 *      (HOSTED-BLOCKS-SOP §7). Constraint that rides along: ONE popup per page, since a
 *      no-id emit resolves to popupList[0].
 *
 *      ADDITIVE. Every .sk-conf page shipped before this date has zero [data-sk-open] nodes
 *      (checked across all four), so this binds nothing on them.
 *
 *      2026-09-10: if NOTHING listens to that event, the CTA now follows its href instead of
 *      doing nothing at all. A no-id emit on a page with no popup is completely silent, which
 *      made the Hormone Lunchbox group button look broken to a tester with no way to see why.
 *      Of the 11 pages carrying [data-sk-open], exactly ONE is a .sk-conf page, so this
 *      behaviour change reaches a single shipped page; the other ten are capture/v1.
 *
 * ES5 only, no build step, no dependencies. GHL injects blocks with innerHTML, which does not
 * execute <script>, so the socket loader is what calls boot() (see HOSTED-BLOCKS-SOP).
 */
(function () {
  "use strict";

  /* "Did an overlay open?" without naming a popup id, because ids are minted per page
     (hl_main_popup-<random>) and naming one breaks on the next install. Counts large,
     visible, fixed-position boxes plus the length of the rendered text.
     MEASURED, not assumed, 2026-09-10 on shark-test.com: clicking the opener on the Beneve
     opt-in page (which HAS a popup) moved this from 1 fixed box / 2513 chars to 2 / 3096,
     while the confirmation page (which has none) was byte-identical before and after.
     800ms is well clear of the open animation, and it only ever delays the BROKEN case: a
     page whose popup works never reaches the navigation branch. */
  function popupSignature() {
    var n = 0, all = document.getElementsByTagName("div");
    for (var i = 0; i < all.length; i++) {
      var st = window.getComputedStyle(all[i]);
      if (st.position === "fixed" && st.display !== "none" && st.visibility !== "hidden" &&
          all[i].getBoundingClientRect().width > 300) n++;
    }
    return n + ":" + ((document.body && document.body.innerText) || "").length;
  }

  function playVideo(frame) {
    if (frame.getAttribute("data-playing") === "true") return;

    /* A SELF-HOSTED file (data-video) plays in a native <video>, no third party involved.
       Added 2026-09-01: Beneve's confirmation video is an H.264/AAC file on GHL's own CDN,
       served as video/quicktime because it is named .mov. The `src` is set bare, with no
       <source type>, precisely so no browser gates playback on that wrong mime type. */
    var file = frame.getAttribute("data-video");
    if (file) {
      var v = document.createElement("video");
      v.src = file;
      v.controls = true;
      v.autoplay = true;
      v.setAttribute("playsinline", "");
      v.setAttribute("preload", "none");
      v.setAttribute("title", frame.getAttribute("aria-label") || "Video");
      frame.setAttribute("data-playing", "true");
      frame.appendChild(v);
      return;
    }

    var id = frame.getAttribute("data-vimeo");
    if (!id) return;
    var f = document.createElement("iframe");
    f.src = "https://player.vimeo.com/video/" + encodeURIComponent(id) +
            "?autoplay=1&title=0&byline=0&portrait=0&dnt=1";
    f.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
    f.setAttribute("allowfullscreen", "");
    f.setAttribute("title", frame.getAttribute("aria-label") || "Video");
    f.setAttribute("loading", "lazy");
    frame.setAttribute("data-playing", "true");
    frame.appendChild(f);
  }


  /* ── THE SMS ASK ─ additive 2026-09-02 ──────────────────────────────────────
     The giveaway confirmation now asks the VISITOR to send the first text. The
     prefill is the MARKUP, not this function: href="sms:{number}?&body=CONFIRM"
     does the work and keeps working with JS off. The `?&` is not a typo, Android
     wants ?body= and iOS wants &body=, and this shape satisfies both.

     What a merge field breaks, and what this fixes, is two things:

       1. THE NUMBER IS A HUMAN STRING, AN sms: URI IS NOT. A rep types
          "(555) 123-4567" into the CV at onboarding. Spaces and parens inside the
          URI are where prefill quietly stops working on some handsets. GHL
          substitutes server-side, so by the time this runs the real value is in
          the DOM and can be normalised to digits.

       2. ON A SNAPSHOT THE CV IS INSTRUCTION TEXT. conectiv__your_phone holds
          "Enter your phone number" until a buyer fills it, which is CORRECT for a
          snapshot account (CLAUDE.md, Account TYPES). With no usable number the
          button stops pretending to be a link rather than opening Messages
          addressed to a sentence.

     Ported from glp-free-ignyt-sample's block.js, which is where the mechanic was
     first built. It lives here now so the next giveaway inherits it. */
  function wireSms(scope) {
    var cta = scope.querySelector("[data-sms-cta]");
    if (!cta) return;
    var word = (cta.getAttribute("data-sms-body") || "CONFIRM").trim();
    var slot = scope.querySelector("[data-rep-phone]");
    var raw = slot ? slot.textContent : "";
    var digits = raw.replace(/[^\d+]/g, "");
    var plus = digits.charAt(0) === "+";
    var nums = digits.replace(/\D/g, "");

    /* 10 digits is the bare US number, 11 starting with 1 is the same number with its
       country code. Anything else is left alone rather than guessed at: a wrong
       normalisation sends the text to nobody, which is worse than an unformatted one
       the handset can still parse. */
    var e164 = plus ? "+" + nums
      : nums.length === 10 ? "+1" + nums
      : nums.length === 11 && nums.charAt(0) === "1" ? "+" + nums
      : nums;

    if (nums.length < 10) {
      var label = cta.querySelector("[data-sms-label]");
      if (label) label.textContent = "Text " + word + " now";
      cta.removeAttribute("href");
      cta.setAttribute("role", "text");
      return;
    }
    cta.setAttribute("href", "sms:" + e164 + "?&body=" + encodeURIComponent(word));
  }

  /* ── COPY, THEN GO ─ additive 2026-09-08 ────────────────────────────────────
     Jeff: "when i click the button to messenger make it also put DISCOUNTED
     GLUTATHIONE SAMPLE in my clipboard ... this works really well".

     A CTA carrying a NON-EMPTY data-sk-copy puts that text on the clipboard and
     THEN follows its href. The visitor lands in Messenger with the message already
     copied, so the ask collapses to paste and send. The same pattern the Disruptor
     campaign runs by hand ("message me the word SWAP") and the reason it converts.

     ⚠️ ATTRIBUTE REUSED ON PURPOSE, AND THE EMPTY CASE IS NOT OURS. _shared/scripts,
     _shared/howto and _shared/brief already ship [data-sk-copy] as a bare MARKER,
     where the text comes from a sibling node. Those live on different components and
     never load this file, but the empty-value guard below keeps the two meanings from
     ever colliding if they meet.

     ⚠️ NEVER STRAND THE VISITOR ON A CLIPBOARD PROMISE. Navigation happens on a hard
     1200ms cap whether or not the write settles, and go() is idempotent, so a slow or
     rejected clipboard costs a copy and never the click.

     ADDITIVE: every .sk-conf page shipped before today has zero [data-sk-copy] nodes
     (checked across all four), so this binds nothing on them. */
  function legacyCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:absolute;left:-9999px;top:0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { done(); }
    document.body.removeChild(ta);
  }

  function copyThen(text, btn, after) {
    var was = btn.textContent;
    var done = function () {
      btn.textContent = btn.getAttribute("data-copy-done") || "Copied. Paste it and send.";
      /* let them SEE the confirmation before the page changes under them */
      setTimeout(after, 550);
      setTimeout(function () { btn.textContent = was; }, 1900);
    };
    /* the clipboard API needs a secure context, and a GHL page on a not-yet-SSL domain is
       exactly where this would otherwise fail silently */
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text, done); });
    } else legacyCopy(text, done);
  }

  function wireCopy(scope) {
    if (scope.getAttribute("data-sk-copy-wired")) return;
    scope.setAttribute("data-sk-copy-wired", "1");
    scope.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-sk-copy]") : null;
      if (!t || !scope.contains(t)) return;
      var text = (t.getAttribute("data-sk-copy") || "").trim();
      if (!text) return;                    /* bare marker: not this component's contract */
      var href = t.getAttribute("href");
      e.preventDefault();
      var went = false;
      var go = function () { if (went) return; went = true; if (href) window.location.href = href; };
      copyThen(text, t, go);
      setTimeout(go, 1200);
    });
  }

  /* ── REQUIRE A CUSTOM VALUE ─ additive 2026-09-08 ───────────────────────────
     A node carrying data-sk-requires stays hidden unless that custom value is
     actually set. The value arrives through the socket's data-cv-* bridge, because
     GHL substitutes merge fields in ITS OWN html and never in a hosted block.

     ⚠️ "SET" IS NOT "NON-EMPTY". Three different non-answers arrive here and all
     three must fail:
       ""                         the socket has no data-cv for it, or the CV is blank
       "{{custom_values.x}}"      never substituted at all
       "Paste the link that ..."  the ONBOARDING INSTRUCTION, which is the correct
                                  resting value on a snapshot (CLAUDE.md, Account TYPES)
     The instruction is the dangerous one: it contains the literal example
     "messenger.com/t/yourhandle", so any regex looking for a messenger URL passes it.
     What separates a real value from prose is WHITESPACE, so that is the first test.

     ADDITIVE: every .sk-conf page shipped before today has zero [data-sk-requires]
     nodes, so this reveals and hides nothing on them. */
  function valueIsSet(v) {
    v = (v || "").trim();
    if (!v) return false;
    if (/\s/.test(v)) return false;              /* prose, not a link */
    if (v.indexOf("{{") > -1) return false;      /* never substituted */
    if (/yourhandle|yourname|example\.com/i.test(v)) return false;  /* the instruction's sample */
    return /^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}\/\S+/i.test(v);
  }

  /* ── CALCULATOR RESULT ─ additive 2026-09-10 ────────────────────────────────
     A calculator hands its answer to the NEXT step, and this fills it in. The
     result page is a plain funnel step, so there is no server session to read: the
     number arrives two ways and either alone is enough.

       1. THE QUERY STRING. GHL's form widget does `window.top.location.href = ...`
          on redirect and FORWARD-APPENDS the iframe's own query string onto the
          target. The calculator block puts the answers on that iframe URL to fill
          the form's hidden fields, so they arrive here for free.
          (NOTES §A form redirect navigates the TOP window.)
       2. sessionStorage, written by the calculator block before it showed the form.
          Same origin, and it does not depend on GHL's param forwarding continuing
          to behave.

     ⚠️ THE PAGE MUST STILL READ IF BOTH FAIL. Someone will open this URL directly,
     from an email or a bookmark, with no number anywhere. Every [data-sk-calc] node
     carries its own fallback text, and a node marked data-sk-calc-hide is removed
     rather than left showing a blank. The argument on the page stands without her
     number; only the personalisation goes.

     ADDITIVE: every .sk-conf page shipped before today has zero [data-sk-calc] and
     zero [data-sk-band] nodes, verified across all five. */
  function calcValues(scope) {
    var out = {};
    try {
      var q = new URLSearchParams(window.location.search);
      q.forEach(function (v, k) { if (v) out[k] = v; });
    } catch (e) {}
    var key = scope.getAttribute("data-sk-calc-key");
    if (key) {
      try {
        var raw = sessionStorage.getItem("sk-calc:" + key);
        if (raw) {
          var o = JSON.parse(raw);
          /* The query string wins: it is what the FORM was loaded with, so it is what
             actually landed on the contact. If the two ever disagree, the page should
             say the same thing the rep is looking at. */
          Object.keys(o).forEach(function (k) { if (!out[k]) out[k] = o[k]; });
        }
      } catch (e) {}
    }
    return out;
  }

  function wireCalc(scope) {
    var vals = calcValues(scope);
    var nodes = scope.querySelectorAll("[data-sk-calc]");
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i], v = vals[n.getAttribute("data-sk-calc")];
      // ⚠️ AN HOUR ARRIVES AS A NUMBER LIKE "16.5" AND NOBODY READS THAT. A node marked
      // data-sk-clock formats it as a time, which is the whole reason these values are worth
      // showing: "your cutoff was 9:30am" lands, "your cutoff was 9.5" does not.
      if (v != null && v !== "" && n.hasAttribute("data-sk-clock")) {
        var h = Number(v);
        if (!isNaN(h)) {
          var hh = ((Math.floor(h) % 24) + 24) % 24, mm = Math.round((h % 1) * 60);
          var ap = hh < 12 ? "am" : "pm", h12 = hh % 12 === 0 ? 12 : hh % 12;
          v = h12 + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + ap;
        }
      }
      if (v) { n.textContent = v; n.removeAttribute("hidden"); }
      else if (n.hasAttribute("data-sk-calc-hide") && n.parentNode) n.parentNode.removeChild(n);
    }
    /* One band's copy shows, the rest are removed. With no band, the neutral node
       (data-sk-band="*") survives so the page is never blank where copy should be. */
    drawCurve(scope, vals);
    var band = vals[scope.getAttribute("data-sk-band-key") || "band"] || "";
    var bands = scope.querySelectorAll("[data-sk-band]");
    for (var j = bands.length - 1; j >= 0; j--) {
      var b = bands[j], want = b.getAttribute("data-sk-band").split(/\s+/);
      var keep = band ? want.indexOf(band) > -1 : want.indexOf("*") > -1;
      if (!keep && b.parentNode) b.parentNode.removeChild(b);
      else b.removeAttribute("hidden");
    }
  }

  /* ── THE CURVE ─ additive 2026-09-10 ────────────────────────────────────────
     Draws a calculator's own output as a line, from values the previous step put
     on the query string. A page with no [data-sk-curve] node is untouched.

     ⚠️ WHY THIS EXISTS AT ALL. The campaign is called the Caffeine Curve and the
     result page showed a number. Jeff, 2026-09-10: "its interesting but its not
     CAPTIVATING". A milligram figure has no reference frame, so nobody knows
     whether theirs is bad. A line with her bedtime marked on it answers that
     without a word of copy, and the second, dashed line is the entire offer made
     visual: same caffeine, moved earlier, and you can see where the two separate.

     ⚠️ SVG BUILT BY HAND, NO CHART LIBRARY. A hosted block cannot load a third
     party script (the loader injects with innerHTML), and a chart library would be
     tens of kilobytes to draw two polylines.

     ⚠️ IT MUST DEGRADE. Open this page with no parameters and there is no curve to
     draw, so the whole figure is removed rather than left as an empty box. */
  function drawCurve(scope, vals) {
    var host = scope.querySelector("[data-sk-curve]");
    if (!host) return;
    var series = String(vals.series || "").split(",").map(Number).filter(function (n) { return !isNaN(n); });
    if (series.length < 4) { if (host.parentNode) host.parentNode.removeChild(host); return; }
    var shifted = String(vals.shifted || "").split(",").map(Number).filter(function (n) { return !isNaN(n); });
    var start = Number(vals.startHour), step = Number(vals.stepHours) || 0.5, bed = Number(vals.bedHour);
    var W = 640, H = 260, PAD_L = 34, PAD_R = 14, PAD_T = 16, PAD_B = 26;
    var max = Math.max.apply(null, series.concat(shifted).concat([1]));
    var x = function (i) { return PAD_L + (i / (series.length - 1)) * (W - PAD_L - PAD_R); };
    var y = function (v) { return PAD_T + (1 - v / max) * (H - PAD_T - PAD_B); };
    var pts = function (arr) { return arr.map(function (v, i) { return x(i) + "," + y(v); }).join(" "); };
    var hourAt = function (i) { return start + i * step; };
    var idxOfHour = function (h) { return (h - start) / step; };
    var clock = function (h) {
      var hh = ((Math.floor(h) % 24) + 24) % 24, mm = Math.round((h % 1) * 60);
      var ap = hh < 12 ? "am" : "pm", h12 = hh % 12 === 0 ? 12 : hh % 12;
      return h12 + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + ap;
    };
    var ticks = "";
    for (var i = 0; i < series.length; i += Math.max(2, Math.round(series.length / 6))) {
      ticks += '<text class="sk-curve-tick" x="' + x(i) + '" y="' + (H - 8) + '">' + clock(hourAt(i)) + "</text>";
    }
    var bedX = !isNaN(bed) ? x(Math.max(0, Math.min(series.length - 1, idxOfHour(bed)))) : null;
    host.innerHTML =
      '<svg class="sk-curve-svg" viewBox="0 0 ' + W + " " + H + '" role="img" ' +
        'aria-label="Your caffeine level across the day, with bedtime marked">' +
        (shifted.length === series.length
          ? '<polyline class="sk-curve-alt" points="' + pts(shifted) + '"></polyline>' : "") +
        '<polyline class="sk-curve-line" points="' + pts(series) + '"></polyline>' +
        (bedX != null
          ? '<line class="sk-curve-bed" x1="' + bedX + '" y1="' + PAD_T + '" x2="' + bedX + '" y2="' + (H - PAD_B) + '"></line>' +
            '<text class="sk-curve-bedlabel" x="' + (bedX - 6) + '" y="' + (PAD_T + 12) + '">bedtime</text>' : "") +
        '<text class="sk-curve-tick" x="4" y="' + (PAD_T + 10) + '">' + Math.round(max) + "mg</text>" +
        ticks +
      "</svg>";
    host.removeAttribute("hidden");
  }

  function wireRequires(scope) {
    var nodes = scope.querySelectorAll("[data-sk-requires]");
    for (var i = 0; i < nodes.length; i++) {
      if (valueIsSet(nodes[i].getAttribute("data-sk-requires"))) nodes[i].removeAttribute("hidden");
      else nodes[i].setAttribute("hidden", "hidden");
    }
  }

  function wire(scope) {
    /* ── popup CTA ──────────────────────────────────────────────────────────────
       Delegated from the block root so a button added to the markup later needs no
       rebinding. preventDefault only fires for a real [data-sk-open] target, which
       leaves every other CTA on the component navigating as it always has.

       The anchor keeps its href on purpose: if this script never runs, the button is
       still a working link to the next step rather than dead markup. It skips the
       popup in that case, which is the mild failure, not the bad one. */
    if (!scope.getAttribute("data-sk-popup-wired")) {
      scope.setAttribute("data-sk-popup-wired", "1");
      scope.addEventListener("click", function (e) {
        var t = e.target.closest ? e.target.closest("[data-sk-open]") : null;
        if (!t || !scope.contains(t)) return;
        e.preventDefault();

        /* A NO-ID EMIT WITH NO POPUP ON THE PAGE IS SILENT (fixed 2026-09-10).
           preventDefault used to be unconditional, so on a page carrying NO popup the event
           went nowhere, navigation was suppressed, and the button was simply dead: no error,
           no console warning, nothing to see. Nicole hit exactly that on the Beneve Hormone
           Lunchbox confirmation page, which ships the split test's B block without B's popup.
           So: emit, then check whether anything actually opened, and fall through to the href
           if not. That restores the degradation this component already promises below, instead
           of honouring it only when the script never runs at all. */
        var sig = popupSignature();
        window.dispatchEvent(new Event("customWidgetOpenPopup"));

        var href = t.getAttribute("href");
        if (!href) return;
        window.setTimeout(function () {
          if (popupSignature() !== sig) return;   /* a popup opened: leave the reader in it */
          window.location.href = href;            /* nothing listened: follow the link */
        }, 800);
      });
    }

    wireSms(scope);
    wireCopy(scope);
    wireCalc(scope);      /* before wireRequires: a band node may itself carry data-sk-requires */
    wireRequires(scope);

    var frames = scope.querySelectorAll("[data-vimeo],[data-video]");
    for (var i = 0; i < frames.length; i++) {
      (function (frame) {
        var id = (frame.getAttribute("data-vimeo") || frame.getAttribute("data-video") || "").trim();
        var section = frame.closest ? frame.closest(".sk-conf-video") : null;

        /* no id yet: hide the section and wire nothing */
        if (!id) {
          if (section) section.setAttribute("hidden", "hidden");
          return;
        }
        if (section) section.removeAttribute("hidden");

        /* the poster is a background-image so it never counts as a broken <img> in a headless
           check and never reflows the frame while it loads */
        var poster = frame.getAttribute("data-poster");
        if (poster) frame.style.backgroundImage = "url('" + poster + "')";

        frame.addEventListener("click", function () { playVideo(frame); });
        frame.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playVideo(frame); }
        });
      })(frames[i]);
    }
  }

  function boot() {
    var blocks = document.querySelectorAll(".sk-conf");
    for (var i = 0; i < blocks.length; i++) wire(blocks[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else boot();

  window.skConfirmBoot = boot;
})();
