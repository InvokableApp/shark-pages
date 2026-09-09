/* beneve / beneve-water-report / b-water-results
 *
 * The Water Report on its own URL. Page 1 looks the address up and renders inline; this page
 * exists so the result has an address of its own: shareable, re-openable, and something the rep
 * can send again later. Jeff, 2026-09-07: "I want to deliver the results on that page."
 *
 * ── HOW THE DATA GETS HERE ────────────────────────────────────────────────────────────────
 * GHL substitutes a contact merge field into a FORM'S REDIRECT URL at submit time, when it knows who
 * submitted. That is the one place it does: a merge field in a page socket attribute is NOT
 * substituted (probed 2026-09-07 against the live preview, every variant came back literal).
 * So page 1's form redirects here carrying the values as query params.
 *
 * THREE WAYS IN, best first, because the first one is not proven yet:
 *   1. ?address=…    re-runs the same lookup, so this page renders at FULL fidelity, identical
 *                    to page 1. Needs an address field on the contact, which does not exist yet.
 *   2. ?system=…&lead=…&pfas=…&date=…   the four values the form already captures. A summary
 *                    rather than the full detection list, but every number is the real one.
 *   3. nothing       an address box, so the page is never a dead end.
 *
 * The fallback chain is deliberate: every one of the eleven live redirect URLs in the fleet
 * passes only STANDARD contact fields (email, first_name, phone). Whether a CUSTOM field
 * substitutes there is unproven, so this page is built to work whether it does or not, and the
 * first real submit answers it for free.
 *
 * ⚠️ NEVER INTERPRETS, same rule as page 1. It prints the utility's own number beside the
 * federal limit. "Above the federal limit" is a fact about two numbers; "your water is unsafe"
 * is a medical opinion we are not licensed to give.
 */
(function () {
  var root = document.querySelector(".sk-wat-results");
  if (!root || root.getAttribute("data-wat-ready")) return;
  root.setAttribute("data-wat-ready", "1");
  var API = root.getAttribute("data-api") || "";
  var pane = root.querySelector(".sk-wat-result");
  var GUIDE = root.getAttribute("data-guide") || "";
  var DM = root.getAttribute("data-messenger") || "";
  var DM_STEP = root.getAttribute("data-dm-step") || "";

  /* ── IS THIS CUSTOM VALUE ACTUALLY SET? ────────────────────────────────────────────────────
     Same three non-answers as _shared/confirm/v1, and all three must fail:
       ""                          the socket carries no data-cv for it, or the CV is blank
       a merge field with its braces still on   never substituted at all
       "Paste the link that ..."   the ONBOARDING INSTRUCTION, which is the correct resting value
                                   on a snapshot (CLAUDE.md, Account TYPES)
     The instruction is the dangerous one: it contains the literal example "messenger.com/t/
     yourhandle", so any regex hunting for a messenger URL passes it. What separates a real value
     from prose is WHITESPACE, so that is the first test. */
  function valueIsSet(v) {
    v = (v || "").trim();
    if (!v) return false;
    if (/\s/.test(v)) return false;
    if (v.indexOf("{{") > -1) return false;
    if (/yourhandle|yourname|yourusername|example\.com/i.test(v)) return false;
    return /^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}\/\S+/i.test(v);
  }
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var q = new URLSearchParams(location.search);
  // An unsubstituted merge field arrives with its braces still on. Treat that as absent
  // rather than printing braces at somebody.
  var val = function (k) { var v = q.get(k); return (!v || /[{}]/.test(v)) ? "" : v.trim(); };

  var address = val("address");
  var system = val("system"), lead = val("lead"), pfas = val("pfas"), date = val("date");

  if (address) return lookup(address);
  if (system || lead || pfas) return summary();
  return askForAddress();

  function lookup(addr) {
    pane.innerHTML = '<div class="sk-wat-loading"><p class="sk-wat-sub">Reading the federal record for ' + esc(addr) + '…</p></div>';
    fetch(API + "/lookup?address=" + encodeURIComponent(addr))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        // page 1's renderer lives in its own block and is not loaded here, so this page draws
        // the same facts in the same classes rather than importing a function across blocks
        if (!d || !d.found) return summaryFrom({ system: "no public water system on record" }, addr);
        summaryFrom({
          system: d.system && d.system.name,
          lead: d.lead ? (d.lead.ppb > 0 ? d.lead.ppb + " ppb" : "none detected") : "no result on file",
          leadLimit: d.lead && d.lead.actionPpb,
          pfas: d.pfas && d.pfas.sampled ? String(d.pfas.detections.length) : "not sampled",
          panel: d.pfas && d.pfas.panel,
          over: d.pfas && d.pfas.anyOverLimit,
          date: d.built,
        }, addr);
      })
      .catch(function () { askForAddress("That lookup did not come back. Try the address again."); });
  }

  function summary() { summaryFrom({ system: system, lead: lead, pfas: pfas, date: date }, ""); }

  function summaryFrom(d, addr) {
    var h = '<div class="sk-wat-card"><h2>Your water report</h2>';
    if (addr) h += '<p class="sk-wat-sub">' + esc(addr) + '</p>';
    if (d.system) h += '<p class="sk-wat-sub">Water system: <strong>' + esc(d.system) + '</strong></p>';
    if (d.lead) {
      h += '<h3>Lead</h3><div class="sk-wat-big">' + esc(d.lead) + '</div>';
      if (d.leadLimit) h += '<p class="sk-wat-sub">Federal action level is ' + esc(d.leadLimit) + ' ppb.</p>';
    }
    if (d.pfas) {
      h += '<h3>PFAS</h3>';
      if (d.pfas === "not sampled") {
        h += '<p class="sk-wat-sub">This system was not part of the EPA\'s 2023 to 2025 sampling, which covered ' +
             'larger systems. That means nobody has published a PFAS result for it, not that it is clear.</p>';
      } else {
        h += '<div class="sk-wat-big' + (d.over ? " sk-wat-flag" : "") + '">' + esc(d.pfas) +
             '<small>' + (d.panel ? " of " + esc(d.panel) + " " : " ") + 'detected</small></div>';
      }
    }
    if (d.date) h += '<p class="sk-wat-sub">Report built ' + esc(d.date) + '.</p>';
    h += '<p class="sk-wat-sub">These are your utility\'s own reported numbers beside the federal limits. ' +
         'Nothing here is a health assessment.</p></div>' + cta();
    pane.innerHTML = h;
  }


  // ── one CTA, and it is the thing this page deliberately does not do ─────────────────────────
  // The page prints the utility's number beside the federal limit and stops, because "above the
  // limit" is a fact about two numbers and anything past that is a medical opinion nobody here is
  // licensed to give. The guide is where the interpretation lives: what a 90th percentile lead
  // figure actually is, what "not sampled" means, and which NSF standard removes which thing.
  // So there is ONE offer and it is not a second opt-in: they already gave their details to see
  // this page. (Jeff, 2026-09-07: "no it needs to be one cta".)
  // ⚠️ THE RESET IS HANDED OVER BY THE REP, IN A DM. Changed 2026-09-09. It used to be a direct
  // PDF link, which delivers the guide and produces nothing else. This campaign has no Beneve
  // water product, no hot tier and no product click to chase (build-automations.mjs): the ONLY
  // thing it can produce is a rep conversation, and a lead who opens that conversation themselves
  // is worth more than a rep cold-DMing off the opt-in alert.
  //
  // ⚠️ THE HREF IS A FUNNEL STEP, NOT A MESSENGER LINK. A direct link is invisible to us. Routing
  // the click through /b-water-dm-redirect makes it a PAGEVIEW, which is a trigger, which is how
  // the tag and the rep SMS happen at all. The step is a 0.5s timer page forwarding to
  // {{custom_values.beneve_rep_messenger}}, built by 09-dm-step.mjs.
  //
  // ⚠️ DOCUMENT-RELATIVE, no leading slash. A root-relative href resolves only while a domain is
  // connected and 404s on a preview or an un-domained account. (NOTES §Linking to another step.)
  //
  // ⚠️ IT FAILS CLOSED, AND THEN IT FALLS BACK. On the snapshot beneve_rep_messenger holds its
  // onboarding instruction, and some reps have no Facebook at all. Rather than show a button that
  // opens a conversation with nobody, those accounts get the direct PDF instead. Either way the
  // page shows exactly ONE call to action, and no account is left with a report and no next step.
  // (Jeff, 2026-09-07: "no it needs to be one cta".)
  function cta() {
    var explain = '<h3>What these numbers actually mean</h3>' +
      '<p>This page shows what your utility reported. The 3 Day Reset explains it: how to read a ' +
      'lead 90th percentile, what it means when a system was never sampled, and which filter ' +
      'standard removes which thing. Plus twenty seven swaps for the rest of the house.</p>';

    if (valueIsSet(DM) && DM_STEP) {
      return '<div class="sk-wat-ask">' + explain +
        '<p>Message me the words <b>3 DAY RESET</b> and I will send it over. Tap below and we will ' +
        'copy those words for you, so in Messenger you only have to paste and send.</p>' +
        '<p><a class="sk-wat-btn" href="' + esc(DM_STEP) + '" data-sk-copy="3 DAY RESET">Send me a message</a></p>' +
        '</div>';
    }
    if (GUIDE && !/[{}]/.test(GUIDE)) {
      return '<div class="sk-wat-ask">' + explain +
        '<p><a class="sk-wat-btn" href="' + esc(GUIDE) + '" target="_blank" rel="noopener">Open the 3 Day Reset</a></p>' +
        '</div>';
    }
    return "";
  }

  // Copy the words, THEN follow the link. Named in the copy above as well as copied, so a refused
  // clipboard write (insecure context, locked-down browser) still leaves the visitor knowing what
  // to type rather than arriving in Messenger with nothing. Navigation happens either way.
  root.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-sk-copy]") : null;
    if (!t || !root.contains(t)) return;
    var text = (t.getAttribute("data-sk-copy") || "").trim();
    var href = t.getAttribute("href");
    if (!text || !href) return;
    e.preventDefault();
    var went = false;
    var go = function () { if (went) return; went = true; window.location.href = href; };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          t.textContent = "Copied. Paste it and send.";
          setTimeout(go, 900);
        }, go);
      } else { go(); }
    } catch (err) { go(); }
    setTimeout(go, 1400);
  });

  function askForAddress(msg) {
    pane.innerHTML = '<div class="sk-wat-card"><h2>Look up a water report</h2>' +
      (msg ? '<p class="sk-wat-sub">' + esc(msg) + '</p>' : "") +
      '<form class="sk-wat-form2"><input id="sk-wat-a2" type="text" placeholder="123 Main St, your town, ST" ' +
      'autocomplete="street-address"><button type="submit">Check this address</button></form></div>';
    pane.querySelector(".sk-wat-form2").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = pane.querySelector("#sk-wat-a2").value.trim();
      if (v) lookup(v);
    });
  }
})();
