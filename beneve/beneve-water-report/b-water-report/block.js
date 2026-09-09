/* beneve / beneve-water-report / b-water-report
 *
 * One job: take an address, ask water-api, render what the EPA has. No third-party script, no
 * tracking, no library.
 *
 * ⚠️ THE PAGE NEVER INTERPRETS. It prints the utility's own number beside the federal limit and
 * lets the reader do the comparing. "Above the federal limit" is a fact about two numbers;
 * "your water is unsafe" is a medical opinion we are not qualified or licensed to give.
 */
(function () {
  var root = document.querySelector(".sk-wat");
  if (!root || root.getAttribute("data-wat-ready")) return;
  root.setAttribute("data-wat-ready", "1");
  var API = root.getAttribute("data-api") || "https://water-api-production-c8d2.up.railway.app";
  var REP = root.getAttribute("data-rep") || "";
  var FORM = root.getAttribute("data-form") || "";
  var FORM_HOST = root.getAttribute("data-form-host") || "";
  // an unsubstituted merge field means the account has no such custom value: show nothing rather
  // than an iframe pointed at the literal string "{{custom_values...}}"
  if (/[{}]/.test(FORM)) FORM = "";
  var LAST = null;
  var form = root.querySelector(".sk-wat-form");
  var input = root.querySelector("#sk-wat-addr");
  var out = root.querySelector(".sk-wat-result");
  var pane = root.querySelector(".sk-wat-out");
  var btn = form.querySelector("button[type=submit]");

  root.addEventListener("click", function (e) {
    var eg = e.target.closest ? e.target.closest("[data-sk-eg]") : null;
    if (eg) { e.preventDefault(); input.value = eg.getAttribute("data-sk-eg"); input.focus(); return; }
    var t = e.target.closest ? e.target.closest("[data-sk-focus]") : null;
    if (!t) return;
    e.preventDefault();
    input.focus({ preventScroll: false });
    input.scrollIntoView({ block: "center", behavior: "smooth" });
  });

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var num = function (n) { return Number(n).toLocaleString(); };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = (input.value || "").trim();
    if (!v) { input.focus(); return; }
    btn.disabled = true;
    pane.hidden = false;
    out.innerHTML = '<div class="sk-wat-err">Reading the EPA records now...</div>';
    pane.scrollIntoView({ behavior: "smooth", block: "start" });
    fetch(API + "/lookup?address=" + encodeURIComponent(v))
      .then(function (r) { return r.json(); })
      .then(function (d) { LAST = d; LAST.address = v; gate(d); })
      .catch(function () {
        out.innerHTML = '<div class="sk-wat-err"><h3>That lookup did not come back</h3>' +
          '<p class="sk-wat-sub">The EPA services go down from time to time. Try again in a minute, ' +
          'or send me your town and I will look it up by hand.</p></div>';
      })
      .then(function () { btn.disabled = false; });
  });


  // ── the gate ────────────────────────────────────────────────────────────────────────────────
  // The lookup runs first and its result is NOT shown here any more. Jeff, 2026-09-07: the report
  // moves to its own page and the opt-in comes before it. That order matters both ways:
  //   · the lead gives their details to see their own report, which is the whole reason this
  //     funnel captures anyone. Previously the report rendered inline and the form was an
  //     afterthought under it, so a visitor could take everything and leave nothing.
  //   · the lookup still runs FIRST, so the six water values are prefilled into the form's hidden
  //     fields. Put the form before the lookup and the rep's notification paste block ships empty,
  //     which is the best thing this campaign has.
  // What is shown is honest about what is behind it: the system name is already known, so the gate
  // names it rather than teasing a mystery.
  function gate(d) {
    var name = d && d.found && d.system && d.system.name;
    /* ⚠️ pane IS THE SECTION, out IS THE LIVE REGION INSIDE IT, and this function had them the
       wrong way round: it unhid `out` (never hidden) and wrote the card into `pane`, which
       REPLACED the .sk-wat-result div rather than filling it. Everything looked fine, because
       markup written into the section still renders. The cost showed up on the second search:
       `out` was by then a detached node, so the loading line went nowhere, and a second lookup
       that FAILED wrote its error message into nothing and left the previous card on screen. */
    pane.hidden = false;
    out.innerHTML =
      /* ONE CARD, NOT FOUR. This was a white card holding text, holding a dark green box, holding
         a paper box, holding the form's own white card. Jeff, 2026-09-09: "its a little confusing
         and disconnected." Four nested surfaces read as four separate things, and the form ended
         up looking like an advert embedded in the answer rather than the next step of it. The
         header and the form are now two halves of one bordered object. */
      '<div class="sk-wat-gate">' +
      '<div class="sk-wat-gate-h">' +
      (name
        ? '<span class="sk-wat-chip sk-wat-chip--under">Report ready</span>' +
          '<h2>We found your water system</h2>' +
          '<p class="sk-wat-gate-p">' + esc(name) + '. Your report has the lead result, the PFAS ' +
          'result and the federal limit beside each one.</p>' +
          /* ⚠️ A FIVE DIGIT LOOKUP ANSWERS FROM THE CENTRE OF THE ZIP, and the API says so itself
             (how: "zip-centroid"). This card puts a utility's NAME in front of a reader as fact,
             and in a ZIP served by more than one utility it can be the wrong one. Saying it here,
             before she hands over an email address, is the only honest place for it. */
          (d && d.how === "zip-centroid"
            ? '<p class="sk-wat-gate-zip"><b>Not your utility?</b> That was matched from the ' +
              'centre of your ZIP code. Try again with your exact address, in this format: ' +
              '<button type="button" class="sk-wat-eg sk-wat-eg--dark" ' +
              'data-sk-eg="500 Boston Post Rd, Sudbury, MA">500 Boston Post Rd, Sudbury, MA</button></p>'
            : "")
        : '<h2>No public water system on record for that address</h2>' +
          '<p class="sk-wat-gate-p">That usually means a private well, or a system too small to ' +
          'report. The 3 Day Reset still applies, and it covers what to do when nobody publishes ' +
          'a number for you.</p>') +
      '<p class="sk-wat-gate-ask">Tell me where to send it and the report opens next.</p>' +
      (REP ? '<p class="sk-wat-sign">' + esc(REP) + '</p>' : "") +
      '</div>' + ask(d) + '</div>';
    wireForm();
  }

  /* ⚠️ THE INLINE REPORT PATH WAS DELETED, 2026-09-09. render() and renderNone() rendered the
     lead and PFAS cards straight onto this page, and they stopped being reachable on 2026-09-07
     when the report moved behind the opt-in: the only caller is gate(). They were ~70 lines
     describing a page shape that no longer exists, next to the code that replaced them, which is
     the most expensive kind of dead code to leave lying around. The report markup they held now
     lives in b-water-results/block.js, in a better version. */

  // ── the ask, with the form embedded and the report already inside it ────────────────────────
  // ⚠️ THE QUERY STRING IS THE WIRE. GHL prefills a form field from a query parameter of the URL
  // the form is loaded with, matched on the field's hiddenFieldQueryKey. Building the iframe HERE,
  // after the lookup has returned, is what guarantees the values exist before the form loads: a
  // popup wired in the builder loads with the page, long before anyone has typed an address.
  function formUrl(d) {
    if (!FORM || !FORM_HOST) return "";
    var q = [];
    var add = function (k, v) { if (v !== null && v !== undefined && v !== "") q.push(k + "=" + encodeURIComponent(v)); };
    add("address", d && d.address);
    if (d && d.found) {
      add("beneve_water_system", d.system.name);
      add("beneve_water_system_id", d.pwsid);
      add("beneve_water_lead_90th", d.lead ? (d.lead.ppb > 0 ? d.lead.ppb + " ppb" : "none detected") : "no result on file");
      add("beneve_water_pfas_count", d.pfas.sampled ? String(d.pfas.detections.length) : "not sampled");
      add("beneve_water_pfas_flag", d.pfas.anyOverLimit ? "yes" : "no");
      add("beneve_water_report_date", d.built);
    } else {
      add("beneve_water_system", "no public system on record");
      add("beneve_water_pfas_count", "not sampled");
      add("beneve_water_pfas_flag", "no");
    }
    return FORM_HOST + "/" + FORM + "?" + q.join("&");
  }

  // ── hand off to the results page ────────────────────────────────────────────────────────
  // The report gets its own URL so it can be shared, re-opened and re-sent. Getting the data
  // there could have gone through a form redirect carrying contact merge fields, and that is a
  // real mechanism: GHL substitutes them into a form's redirect URL at submit time, which is
  // the one surface where it does (a merge field in a page socket attribute comes back literal,
  // probed 2026-09-07). Two things ruled it out here:
  //   · no form in this fleet uses a form-level redirect; every one is on a page form ELEMENT,
  //     and this form is an iframe built by this block, so there is no element to configure
  //   · a form-level redirect fires INSIDE the iframe, so the report would render in a 500px box
  // This block already holds the address and the full lookup, so it hands off itself. No merge
  // fields, no contact session, full fidelity because the results page re-runs the same lookup.
  //
  // ⚠️ CORRECTED 2026-09-09: the second bullet is WRONG, and a form redirect is now set as well.
  // The widget bundle does `window.top.location.href = r.href`, not the frame's, so it breaks out
  // of the iframe. It also forward-appends the IFRAME's query string onto the redirect target,
  // which means the ?address= this block puts on the iframe URL reaches the results page by
  // itself. (NOTES §A form redirect navigates the TOP window.) Both paths now exist and both land
  // on the same page carrying the same address, so whichever fires first is fine. The handoff
  // below stays because it does not depend on GHL's param forwarding continuing to behave.
  var HANDOFF = root.getAttribute("data-results") || "";
  window.addEventListener("message", function (ev) {
    if (!HANDOFF || !LAST || !LAST.address) return;
    // GHL form embeds post on submit. The payload shape is not contractual, so match loosely on
    // the words rather than an exact type, and require the message to come from the form host.
    var d = ev.data;
    var txt = typeof d === "string" ? d : JSON.stringify(d || "");
    if (!/form.?submit|submitted|onFormSubmit/i.test(txt)) return;
    if (FORM_HOST && ev.origin && FORM_HOST.indexOf(ev.origin) === -1) return;
    var to = HANDOFF + (HANDOFF.indexOf("?") > -1 ? "&" : "?") + "address=" + encodeURIComponent(LAST.address);
    try { window.top.location.href = to; } catch (e) { window.location.href = to; }
  });

  // ⚠️ THE FORM IFRAME MUST BE RESIZED BY GHL, NOT GUESSED AT. A fixed height clips the form, and
  // it clips it at the bottom, which is where the submit button is: the visitor sees a complete
  // form with no way to send it. It is not fixable with a bigger number either, because the
  // consent paragraph is a merge field, so the form is one height in the snapshot (where the
  // custom value holds the instruction text) and another in a rep's live account (where it holds
  // their name), and taller again on a narrow phone.
  //
  // GHL's form widget speaks the iframe-resizer protocol: the child posts
  // `[iFrameSizer]{iframeId}:{height}:{width}:{type}` to the parent. Probed 2026-09-09: the child
  // sends NOTHING until the parent completes the handshake, so a bare postMessage listener here
  // receives zero messages and the height never moves. The handshake is what form_embed.js does,
  // so we load it, from the SAME first-party host the form is served from. It is not a
  // third-party script and it is not injected as markup (innerHTML does not execute a script tag,
  // HOSTED-BLOCKS-SOP); the element is created here in JS, which does.
  //
  // The id has to be unique per render and the script re-appended after each one, because the
  // script binds the iframes present when it runs and a second lookup replaces the iframe.
  var askSeq = 0;
  function ask(d) {
    var url = formUrl(d);
    var id = "sk-wat-fi-" + (++askSeq);
    // ⚠️ NO SECOND OFFER HERE. This box used to open "Want the next step?" and pitch the 3 Day
    // Reset above the form, while the card around it was already promising the water report. One
    // form, two offers, and a submit button that named the wrong one. The reset is real and it is
    // still the next step, but it belongs AFTER the report, on the results page, where the rep
    // hands it over by DM. (Jeff, 2026-09-09: "3 day pdf shouldnt show on optin page".)
    // ⚠️ NO WRAPPER OF ITS OWN. The rep's name moved up into the header with the rest of the
    // sentence it belongs to; it used to sit orphaned under the form, which on a phone is a
    // signature nine hundred pixels below anything it could be signing.
    return url
      ? '<div class="sk-wat-embed"><iframe title="Show my water report" src="' + esc(url) + '" ' +
        'id="' + id + '" data-layout=\'{"id":"INLINE"}\' data-form-id="' + esc(FORM) + '" ' +
        'data-layout-iframe-id="' + id + '" data-height="760" scrolling="no"></iframe></div>'
      : '<div class="sk-wat-embed sk-wat-embed--none"><p>Message me and I will send your report ' +
        'over myself.</p></div>';
  }

  // Call after any innerHTML write that may have put an ask() iframe on the page.
  function wireForm() {
    if (!FORM || !FORM_HOST) return;
    if (!root.querySelector(".sk-wat-embed iframe")) return;
    var src = FORM_HOST.replace(/\/widget\/form\/?$/, "") + "/js/form_embed.js";
    var old = document.getElementById("sk-wat-fe");
    if (old) old.parentNode.removeChild(old);
    var s = document.createElement("script");
    s.id = "sk-wat-fe"; s.src = src; s.async = true;
    document.body.appendChild(s);
  }

  /* ── sticky bar reveal (HOSTED-BLOCKS-SOP §8b) ───────────────────────────────────────────
     Ships `hidden` so a blocked script leaves no dead bar welded across the top, and the
     attribute is cleared once here; visibility after that is a class, because display:none
     cannot transition. The 4px threshold ignores the rubber-band bounce iOS reports at rest,
     the rAF gate keeps the handler off the critical path, and the sync() at the end covers a
     reload that restores a scroll position partway down the page. */
  (function () {
    var bar = root.querySelector(".sk-wat-bar");
    if (!bar) return;
    bar.removeAttribute("hidden");
    var on = false, queued = false;
    var sync = function () {
      queued = false;
      var want = (window.pageYOffset || document.documentElement.scrollTop || 0) > 4;
      if (want === on) return;
      on = want;
      bar.classList.toggle("sk-wat-bar-on", on);
      if (on) root.style.setProperty("--sk-bar-h", bar.offsetHeight + "px");
    };
    window.addEventListener("scroll", function () {
      if (!queued) { queued = true; window.requestAnimationFrame(sync); }
    }, { passive: true });
    sync();
  })();
})();
