/* _shared/webinar/v1/webinar.js: fills the webinar template from its socket and runs it.
 *
 * Everything that changes per webinar sits on the GHL socket, so a new webinar is a duplicated page with
 * these lines edited, never a code change:
 *
 *   <div data-shark-block="glp/info-session-196489/zoom"
 *        data-wb-start="2026-10-29T21:00:00-04:00"     start, with its UTC offset (-04:00 is Eastern in summer, -05:00 in winter)
 *        data-wb-minutes="60"                          how long it runs (the "live now" window)
 *        data-wb-eyebrow="Free live training on Zoom"
 *        data-wb-title="GLP Shark 2.0 Reveal"
 *        data-wb-blurb="..."
 *        data-wb-cta="Register for the reveal"
 *        data-wb-flyer="https://...png"               only where the block has an <img data-wb-src="flyer">
 *        data-wb-points-title="What you'll see"
 *        data-wb-points="Title::one line|Title::one line|Title::one line"
 *        data-wb-host1="Name|Role|photo url"  data-wb-host2="..."  (up to 4)
 *        data-wb-share="https://glpshark.com/zoom"     optional, defaults to this page's address
 *        data-wb-replay="https://..."                  optional: after it ends, the button goes here
 *   ></div>
 *
 * The confirmation page's socket takes the same start, minutes, title and share, plus:
 *        data-wb-name="{{contact.first_name}}"        greets them by name ("You're in, Sarah."); reads right without it
 *        data-wb-video="https://vimeo.com/123456789"   Vimeo or YouTube link; no value hides the video step
 *        data-wb-cal-note="The Zoom link is in your email."   the calendar event's description
 *
 * A missing optional value hides what it feeds. The register button opens the page's own GHL popup (the
 * form), through GHL's window event, so no popup id is ever needed (HOSTED-BLOCKS-SOP §7).
 */
(function () {
  var root = document.querySelector(".sk-wb");
  if (!root || root.dataset.wbOn) return;
  root.dataset.wbOn = "1";
  var sock = root.closest("[data-shark-block]") || root;

  function val(k) {
    var v = (sock.getAttribute("data-wb-" + k) || "").trim();
    // An unfilled or still-raw merge field reads as empty.
    if (!v || v.indexOf("{" + "{") > -1 || /^(paste|enter|add)\b/i.test(v)) return "";
    return v;
  }
  function all(sel) { return [].slice.call(root.querySelectorAll(sel)); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }

  // Plain words.
  all("[data-wb]").forEach(function (n) {
    var v = val(n.getAttribute("data-wb"));
    if (v) n.textContent = v; else n.hidden = true;
  });
  all("[data-wb-src]").forEach(function (n) {
    var v = val(n.getAttribute("data-wb-src"));
    if (v) { n.src = v; n.alt = val("title"); } else (n.closest("figure") || n).hidden = true;
  });

  // Points: "Title::line|Title::line".
  var list = root.querySelector("[data-wb-points]"), pts = val("points");
  if (list && pts) pts.split("|").forEach(function (p) {
    var bits = p.split("::"), li = el("li");
    li.appendChild(el("b", "", bits[0].trim()));
    if (bits[1]) li.appendChild(el("span", "", bits[1].trim()));
    list.appendChild(li);
  });

  // Hosts: "Name|Role|photo".
  var hosts = root.querySelector("[data-wb-hosts]");
  for (var i = 1; i <= 4 && hosts; i++) {
    var h = val("host" + i);
    if (!h) continue;
    var b = h.split("|"), card = el("div", "wb-host");
    if (b[2]) { var img = el("img"); img.src = b[2].trim(); img.alt = b[0].trim();card.appendChild(img); }
    var t = el("div"); t.appendChild(el("b", "", b[0].trim())); if (b[1]) t.appendChild(el("span", "", b[1].trim()));
    card.appendChild(t); hosts.appendChild(card);
  }
  all("[data-wb-has]").forEach(function (n) { if (!val(n.getAttribute("data-wb-has"))) n.hidden = true; });

  // The date and times, worked out from one start time so nobody types four time zones by hand.
  var start = new Date(val("start")), mins = parseInt(val("minutes"), 10) || 60;
  var ok = !isNaN(start.getTime());
  function fmt(opts, tz) { try { return new Intl.DateTimeFormat("en-US", tz ? Object.assign({ timeZone: tz }, opts) : opts).format(start); } catch (e) { return ""; } }
  function hour(tz) { return fmt({ hour: "numeric", minute: "2-digit" }, tz).replace(":00", "").replace(" ", "").toLowerCase(); }
  if (ok) {
    var ET = "America/New_York";
    all("[data-wb-date]").forEach(function (n) {
      var k = n.getAttribute("data-wb-date");
      n.textContent = k === "month" ? fmt({ month: "short" }, ET) : k === "day" ? fmt({ day: "numeric" }, ET) : fmt({ weekday: "long" }, ET);
    });
    var z = root.querySelector("[data-wb-zones]");
    if (z) {
      z.textContent = hour(ET) + " ET ";
      var rest = el("span", "", "/ " + hour("America/Chicago") + " CT / " + hour("America/Denver") + " MT / " + hour("America/Los_Angeles") + " PT");
      z.appendChild(rest);
    }
    var here = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    var loc = root.querySelector("[data-wb-local]");
    if (loc && !/^America\/(New_York|Chicago|Denver|Los_Angeles|Detroit|Phoenix|Toronto|Vancouver|Edmonton|Winnipeg|Indiana)/.test(here)) {
      loc.textContent = "Where you are: ";
      loc.appendChild(el("b", "", fmt({ weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })));
    } else if (loc) loc.hidden = true;
    var short = fmt({ weekday: "short", month: "short", day: "numeric" }, ET) + ", " + hour(ET) + " ET";
    all("[data-wb-short]").forEach(function (n) { n.textContent = short; });
  } else {
    all(".wb-when, [data-wb-count], [data-wb-short]").forEach(function (n) { n.hidden = true; });
  }

  // Countdown, then "live now", then ended.
  var count = root.querySelector("[data-wb-count]"), status = root.querySelector("[data-wb-status]");
  var cells = {}; all("[data-wb-count] [data-u]").forEach(function (n) { cells[n.getAttribute("data-u")] = n; });
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    if (!ok || !count) return;
    var now = Date.now(), s = Math.floor((start.getTime() - now) / 1000), end = start.getTime() + mins * 60000;
    if (s > 0) {
      cells.d.textContent = pad(Math.floor(s / 86400)); cells.h.textContent = pad(Math.floor(s % 86400 / 3600));
      cells.m.textContent = pad(Math.floor(s % 3600 / 60)); cells.s.textContent = pad(s % 60);
      return;
    }
    clearInterval(timer);
    if (now < end) {
      count.className = "wb-count is-live"; count.innerHTML = "";
      count.appendChild(el("div", "wb-now", "Happening now on Zoom"));
      if (status) { status.textContent = "Live now"; status.parentNode.classList.add("is-live"); }
    } else {
      count.hidden = true;
      if (status) status.textContent = "This session has ended";
      var rp = val("replay");
      all("[data-wb-register]").forEach(function (btn) {
        if (rp) { btn.setAttribute("data-wb-go", rp); var w = btn.querySelector("[data-wb]"); (w || btn).textContent = "Watch the replay"; }
      });
    }
  }
  var timer = setInterval(tick, 1000); tick();

  // Register: the page's own GHL popup.
  all("[data-wb-register]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var go = btn.getAttribute("data-wb-go");
      if (go) { location.href = go; return; }
      window.dispatchEvent(new Event("customWidgetOpenPopup"));
    });
  });

  // Share link with a copy button.
  var share = val("share") || (location.origin + location.pathname);
  all("[data-wb-share-url]").forEach(function (n) { n.textContent = share.replace(/^https?:\/\//, ""); });
  all("[data-wb-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var em = btn.querySelector("em"), done = function () { em.textContent = "Copied"; setTimeout(function () { em.textContent = "Copy"; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(share).then(done, done);
      else { var ta = el("textarea"); ta.value = share; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); done(); }
    });
  });

  // A phone picture with several app screens ([data-wb-shots]): slide to the next one every few seconds.
  all("[data-wb-shots]").forEach(function (track) {
    var n = track.children.length, i = 0;
    if (n < 2 || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    setInterval(function () { i = (i + 1) % n; track.style.transform = "translateX(" + (-100 * i) + "%)"; }, 3200);
  });

  // Sticky header bar (HOSTED-BLOCKS-SOP §8b): ships hidden, slides in on the first scroll.
  var dock = root.querySelector("[data-wb-dock]");
  if (dock) {
    dock.removeAttribute("hidden");
    var on = false, queued = false;
    var sync = function () {
      queued = false;
      var want = (window.pageYOffset || document.documentElement.scrollTop || 0) > 4;
      if (want === on) return;
      on = want;
      dock.classList.toggle("is-on", on);
    };
    window.addEventListener("scroll", function () { if (!queued) { queued = true; window.requestAnimationFrame(sync); } }, { passive: true });
    sync();
  }

  // Confirmation page: "You're in, Sarah." from the socket's data-wb-name (a contact merge field), else "You're in."
  all("[data-wb-greet]").forEach(function (n) {
    var who = val("name").split(" ")[0];
    n.textContent = n.getAttribute("data-wb-greet") + (who ? ", " + who.charAt(0).toUpperCase() + who.slice(1) : "") + ".";
  });

  // The page's own video (data-wb-video: a Vimeo or YouTube link, or a Vimeo id).
  all("[data-wb-player]").forEach(function (box) {
    var v = val("video"), src = "";
    var vm = v.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/) || v.match(/^(\d+)$/);
    var yt = v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    if (vm) src = "https://player.vimeo.com/video/" + vm[1] + "?badge=0&autopause=0&dnt=1" + (vm[2] ? "&h=" + vm[2] : "");
    else if (yt) src = "https://www.youtube.com/embed/" + yt[1] + "?rel=0";
    if (!src) { (box.closest("[data-wb-has-video]") || box).hidden = true; return; }
    var f = el("iframe"); f.src = src; f.title = val("title") || "Video";
    f.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; encrypted-media");
    f.setAttribute("allowfullscreen", "");
    box.appendChild(f);
  });
  all("[data-wb-has-video]").forEach(function (n) { if (!val("video")) n.hidden = true; });

  // Add to calendar: Google opens its form; Apple and Outlook download an .ics.
  if (ok) {
    var endD = new Date(start.getTime() + mins * 60000);
    var utc = function (d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
    var what = val("title") || "Live session", note = val("cal-note") || "The Zoom link is in your email.";
    all("[data-wb-cal]").forEach(function (a) {
      if (a.getAttribute("data-wb-cal") === "google") {
        a.href = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(what) +
          "&dates=" + utc(start) + "/" + utc(endD) + "&details=" + encodeURIComponent(note) + "&location=Zoom";
        a.target = "_blank"; a.rel = "noopener";
      } else {
        var esc = function (s) { return s.replace(/([,;\\])/g, "\\$1"); };
        var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Shark//Webinar//EN", "BEGIN:VEVENT",
          "UID:" + utc(start) + "-" + what.replace(/\W+/g, "").toLowerCase() + "@shark", "DTSTAMP:" + utc(new Date()),
          "DTSTART:" + utc(start), "DTEND:" + utc(endD), "SUMMARY:" + esc(what), "DESCRIPTION:" + esc(note), "LOCATION:Zoom",
          "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:" + esc(what), "END:VALARM",
          "END:VEVENT", "END:VCALENDAR"].join("\r\n");
        a.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
        a.setAttribute("download", what.replace(/[^\w ]+/g, "").trim().replace(/\s+/g, "-").toLowerCase() + ".ics");
      }
    });
  } else all("[data-wb-cal]").forEach(function (a) { (a.closest("[data-wb-cal-row]") || a).hidden = true; });
})();
