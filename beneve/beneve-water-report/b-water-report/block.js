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
    out.innerHTML = '<div class="sk-wat-err">Reading the EPA records for that address...</div>';
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
    out.hidden = false;
    pane.innerHTML =
      '<div class="sk-wat-card">' +
      (name
        ? '<span class="sk-wat-chip sk-wat-chip--under">Report ready</span>' +
          '<h2>We found your water system</h2>' +
          '<p class="sk-wat-sub">' + esc(name) + '. Your report has the lead result, the PFAS result ' +
          'and the federal limit beside each one.</p>'
        : '<h2>No public water system on record for that address</h2>' +
          '<p class="sk-wat-sub">That usually means a private well, or a system too small to report. ' +
          'The 3 Day Reset still applies, and it covers what to do when nobody publishes a number for you.</p>') +
      '<p>Tell me where to send it and the report opens next.</p>' +
      ask(d) + '</div>';
    wireForm();
  }

  function render(d) {
    if (!d || !d.found) return renderNone(d);
    var s = d.system;
    var h = '<div class="sk-wat-sys"><h2>' + esc(s.name) + '</h2>' +
      '<span class="sk-wat-meta">' + num(s.population) + ' people served' +
      (s.source ? ' &middot; ' + esc(s.source) : "") +
      (d.how === "boundary" ? "" : ' &middot; matched by ZIP code, check the name is yours') +
      '</span></div><div class="sk-wat-cards">';

    /* lead */
    h += '<div class="sk-wat-card"><h3>Lead, 90th percentile</h3>';
    if (d.lead) {
      var over = d.lead.overAction;
      h += '<span class="sk-wat-chip ' + (over ? "sk-wat-chip--over" : "sk-wat-chip--under") + '">' +
        (over ? "At or above the action level" : "Below the action level") + '</span>' +
        (d.lead.ppb > 0
          ? '<div class="sk-wat-big' + (over ? " sk-wat-flag" : "") + '">' + d.lead.ppb + '<small>ppb</small></div>'
          : '<div class="sk-wat-big">None<small>detected</small></div>') +
        '<p class="sk-wat-sub">Federal action level is ' + d.lead.actionPpb + ' ppb.' +
        (d.lead.date ? ' Last reported ' + esc(d.lead.date) + '.' : "") + '</p>';
    } else {
      h += '<p class="sk-wat-sub">No lead result on file for this system.</p>';
    }
    h += '</div>';

    /* pfas */
    h += '<div class="sk-wat-card"><h3>PFAS, EPA national sampling</h3>';
    if (!d.pfas.sampled) {
      h += '<p class="sk-wat-sub">This system was not part of the EPA\'s 2023 to 2025 sampling, which ' +
        'covered larger systems. That means nobody has published a PFAS result for it, not that it is clear.</p>';
    } else if (!d.pfas.detections.length) {
      h += '<span class="sk-wat-chip sk-wat-chip--under">Sampled, nothing detected</span>' +
        '<p class="sk-wat-sub">Every compound on the EPA panel came back below the reporting limit.</p>';
    } else {
      var top = d.pfas.detections[0];
      h += '<span class="sk-wat-chip ' + (d.pfas.anyOverLimit ? "sk-wat-chip--over" : "sk-wat-chip--under") + '">' +
        (d.pfas.anyOverLimit ? "Above a federal limit" : "Detected, under the limits") + '</span>' +
        '<div class="sk-wat-big' + (d.pfas.anyOverLimit ? " sk-wat-flag" : "") + '">' + d.pfas.detections.length +
        '<small>of ' + (d.pfas.panel || 29) + ' detected</small></div><ul class="sk-wat-list">';
      d.pfas.detections.slice(0, 6).forEach(function (p) {
        h += '<li><span>' + esc(p.name) + (p.limit ? ' <span class="sk-wat-sub">limit ' + p.limit + '</span>' : "") +
          '</span><b' + (p.overLimit ? ' class="sk-wat-flag"' : "") + '>' + p.ppt + ' ppt</b></li>';
      });
      h += '</ul>';
    }
    h += '</div></div>';

    h += ask(d);
    h += '<p class="sk-wat-src">EPA records as published, compiled ' + esc(d.built) + '. Sources: ' +
      d.sources.map(function (s) { return '<a href="' + s.u + '" target="_blank" rel="noopener">' + esc(s.n) + '</a>'; }).join(" &middot; ") +
      '. These are your utility\'s own compliance results, not a test of your kitchen tap.</p>';
    out.innerHTML = h;
    wireForm();
  }

  function renderNone(d) {
    var typed = (input.value || "").trim();
    var looksThin = typed.indexOf(",") === -1 && !/[0-9]{5}/.test(typed);
    out.innerHTML = '<div class="sk-wat-err">' +
      (looksThin
        ? '<h2>I could not place that address</h2>' +
          '<p class="sk-wat-sub">Add the town and the state and try again, like ' +
          '<b>500 Boston Post Rd, Sudbury, MA</b>. A ZIP code on its own works too.</p>'
        : '<h2>No public water system on record for that address</h2>' +
          '<p class="sk-wat-sub">That usually means a private well, or a system too small to be ' +
          'mapped. Nobody is required to test a private well, so there is no public record to ' +
          'read, and the household is the only one who ever will.</p>') +
      '</div>' + (looksThin ? "" : ask(d));
    wireForm();
  }

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
    return '<div class="sk-wat-ask">' +
      (url
        ? '<div class="sk-wat-embed"><iframe title="Show my water report" src="' + esc(url) + '" ' +
          'id="' + id + '" data-layout=\'{"id":"INLINE"}\' data-form-id="' + esc(FORM) + '" ' +
          'data-layout-iframe-id="' + id + '" data-height="760" scrolling="no"></iframe></div>'
        : '<p class="sk-wat-sub">Message me and I will send your report over myself.</p>') +
      (REP ? '<p class="sk-wat-sign">' + esc(REP) + '</p>' : "") + '</div>';
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
})();
