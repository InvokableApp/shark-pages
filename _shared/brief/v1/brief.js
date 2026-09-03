/* _shared/brief/v1/brief.js — behaviour for the private-briefing opt-in page (.sk-brf).
 *
 * Serves both pages of the briefing funnel: the opt-in (.sk-brf) and the next-step page
 * (.sk-brf-next). Every next-step lookup no-ops on the opt-in.
 *
 * The jobs, no framework:
 *
 * 1. EVERY CTA OPENS THE PAGE POPUP. The opt-in form lives in the GHL page's own popup, not in
 *    this block, so each button carries `data-sk-open` and we dispatch the no-argument window
 *    event GHL ships for exactly this:
 *
 *        window.dispatchEvent(new Event("customWidgetOpenPopup"));
 *
 *    That is the only account-agnostic trigger channel (HOSTED-BLOCKS-SOP section 7). No popup id
 *    anywhere, so one block serves every account and survives a snapshot install. Popup ids are
 *    `hl_main_popup-<random>`, minted per page, and hardcoding one breaks on the next install.
 *    Constraint that comes with it: ONE popup per page. A no-id emit resolves to popupList[0].
 *
 * 2. THE VIDEO IS A FACADE. Nothing loads from YouTube until the poster is clicked, and the id
 *    comes from a custom value, so each rep drops in their own briefing. When that CV is empty or
 *    unsubstituted the whole frame is REMOVED, never left as a placeholder: a buyer has to see an
 *    unfilled value as absent (HOSTED-BLOCKS-SOP section 4).
 *
 * 3. Elements bound to an UNFILLED custom value are removed, with an optional fallback
 *    sibling shown in place. The footer year is stamped at load so it cannot go stale.
 *
 * Custom code does not run in the builder canvas. Test in Preview or published.
 */
(function () {
  var root = document.querySelector(".sk-brf");
  if (!root) return;

  /* The single test for "this custom value is not filled in": empty, an unsubstituted
     merge field, or one of the onboarding placeholder phrases a buyer has not replaced.
     fill() returns the usable value or "". Used by every CV-bound feature below. */
  function fill(v) {
    v = (v || "").trim();
    return (!v || v.indexOf("{") !== -1 || /^(paste|enter|add|your)\b/i.test(v)) ? "" : v;
  }
  function url(v) { return /^https?:\/\//i.test(v) ? v : "https://" + v.replace(/^\/+/, ""); }

  /* ── 1. every CTA opens the page popup ─────────────────────────────────
     Delegated, so a button added to the markup later needs no re-binding. */
  root.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-sk-open]") : null;
    if (!t || !root.contains(t)) return;
    e.preventDefault();
    window.dispatchEvent(new Event("customWidgetOpenPopup"));
  });

  /* ── 2. the briefing video ─────────────────────────────────────────────
     Accepts a bare id, a watch url, a youtu.be url or an embed url, because the
     buyer filling the custom value will paste whatever the address bar gave them. */
  (function () {
    var box = root.querySelector("[data-sk-video]");
    if (!box) return;

    var raw = (box.getAttribute("data-yt") || "").trim();
    // unsubstituted merge field, empty CV, or an onboarding placeholder: no video exists.
    if (!fill(raw)) { box.parentNode.removeChild(box); return; }

    var m = raw.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{6,})/);
    var id = m ? m[1] : (/^[A-Za-z0-9_-]{6,}$/.test(raw) ? raw : "");
    if (!id) { box.parentNode.removeChild(box); return; }

    var title = box.getAttribute("data-title") || "Private briefing";

    var img = document.createElement("img");
    img.className = "sk-brf-video-img";
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.src = "https://i.ytimg.com/vi/" + id + "/maxresdefault.jpg";
    // maxres does not exist for every upload; YouTube serves a 120x90 grey placeholder instead
    // of a 404, so detect it by size rather than by an error handler.
    img.addEventListener("load", function () {
      if (img.naturalWidth < 200) img.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
    });

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sk-brf-play";
    btn.setAttribute("aria-label", "Play: " + title);
    btn.innerHTML = '<i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></i>';

    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?rel=0&autoplay=1";
      f.title = title;
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      f.referrerPolicy = "strict-origin-when-cross-origin";
      f.allowFullscreen = true;
      box.innerHTML = "";
      box.appendChild(f);
    });

    box.appendChild(img);
    box.appendChild(btn);
    box.removeAttribute("hidden");
  })();

  /* ── 3. unfilled custom values ─────────────────────────────────────────
     A rep who has not filled their name yet must not ship a page reading
     "A private overview from ". An element carrying `data-sk-needs` is REMOVED
     when that value is empty or unsubstituted, and its `data-sk-else` sibling is
     shown in its place. Never a placeholder name: an empty CV renders as absent
     (HOSTED-BLOCKS-SOP section 4). */
  (function () {
    var need = root.querySelectorAll("[data-sk-needs]");
    for (var i = 0; i < need.length; i++) {
      if (!fill(need[i].getAttribute("data-sk-needs"))) need[i].parentNode.removeChild(need[i]);
    }
    var els = root.querySelectorAll("[data-sk-else]");
    for (var j = 0; j < els.length; j++) {
      // shown only when its paired value is unfilled; ships hidden so the filled
      // case never flashes the fallback.
      if (!fill(els[j].getAttribute("data-sk-else"))) els[j].removeAttribute("hidden");
      else els[j].parentNode.removeChild(els[j]);
    }
  })();

  /* ── 4. the next-step page: outbound link, mailto, copy ────────────────
     Only present on .sk-brf-next; every lookup below no-ops on the opt-in page. */

  /* The agent-portal button.

     TWO ATTRIBUTES, TWO JOBS, and they are deliberately not the same value:

       data-url  the rep's portal custom value. Read ONLY to decide whether the button
                 is live. Unfilled, the button stays VISIBLE but inert and flagged, because
                 a buyer has to be able to see that the value still needs filling and a dead
                 link that looks live is worse than one that says so.
       data-go   where the click actually goes: the funnel's own tracked redirect step.

     Why the click does not go straight to data-url: an outbound click to another domain is
     invisible to GHL, so nothing could fire the Fire Lead alert Joe asked for. The redirect
     step registers the pageview, the workflow fires, and its native minute-timer forwards to
     the same custom value half a second later. Keeping the fill test on data-url means a
     buyer who has not pasted their link yet can never be sent into a redirect that goes
     nowhere. Without data-go the button behaves exactly as it did before.

     New tab: the instructions for step 02 are on this page and the lead needs them AFTER
     creating their account. Same domain, so GHL's contact cookie travels and the pageview is
     still attributed. */
  (function () {
    var a = root.querySelector("[data-sk-portal]");
    if (!a) return;
    var v = fill(a.getAttribute("data-url"));
    if (!v) { a.setAttribute("aria-disabled", "true"); a.removeAttribute("href"); a.setAttribute("data-unset", ""); return; }
    var go = (a.getAttribute("data-go") || "").trim();
    a.href = go || url(v);
    a.target = "_blank";
    a.rel = "noopener";
  })();

  /* One button that opens the lead's mail app with the whole message already written,
     because the source page asked them to retype it by hand. */
  (function () {
    var btn = root.querySelector("[data-sk-mailto]");
    if (!btn) return;
    var to   = fill(root.querySelector("[data-sk-field=to]") ? root.querySelector("[data-sk-field=to]").textContent : "");
    var subj = (root.querySelector("[data-sk-field=subject]") || {}).textContent || "";
    var body = (root.querySelector("[data-sk-field=body]") || {}).textContent || "";
    if (!to) { btn.parentNode.removeChild(btn); return; }
    btn.href = "mailto:" + to +
      "?subject=" + encodeURIComponent(subj.trim()) +
      "&body=" + encodeURIComponent(body.replace(/\s+/g, " ").trim());
  })();

  /* Copy control on each field. Falls back to a hidden textarea + execCommand because
     navigator.clipboard is unavailable on http and in some in-app browsers, which is
     exactly where a lead following a text-message link ends up. */
  (function () {
    var btns = root.querySelectorAll("[data-sk-copy]");
    for (var i = 0; i < btns.length; i++) {
      // a control that would copy an unfilled custom value is dead UI: drop it.
      var f = root.querySelector("[data-sk-field=" + btns[i].getAttribute("data-sk-copy") + "]");
      if (!f || !fill(f.textContent)) { btns[i].parentNode.removeChild(btns[i]); continue; }
      btns[i].addEventListener("click", function (e) {
        var b = e.currentTarget;
        var src = root.querySelector("[data-sk-field=" + b.getAttribute("data-sk-copy") + "]");
        if (!src) return;
        var text = src.textContent.replace(/\s+/g, " ").trim();
        var done = function () {
          var was = b.textContent;
          b.textContent = "Copied";
          b.setAttribute("data-done", "");
          setTimeout(function () { b.textContent = was; b.removeAttribute("data-done"); }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {});
          return;
        }
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:absolute;left:-9999px";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (err) {}
        document.body.removeChild(ta);
      });
    }
  })();

  /* ── 5. footer year ────────────────────────────────────────────────────── */
  (function () {
    var y = root.querySelector("[data-sk-year]");
    if (y) y.textContent = String(new Date().getFullYear());
  })();
})();
