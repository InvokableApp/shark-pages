/* beneve / beneve-water-report / b-water-results
 *
 * The report on its own URL, so it can be shared, re-opened and re-sent by the rep.
 *
 * ⚠️ THE PAGE NEVER INTERPRETS. It prints the utility's own number beside the federal limit and
 * stops. "Above the federal limit" is a fact about two numbers; "your water is unsafe" is a
 * medical opinion nobody here is licensed to give. The interpretation lives in the guide, which
 * is post-DM and asked for, and that split is the reason this page needs only one call to action.
 *
 * ⚠️ ONE ACTION, AND IT IS THE MESSAGE. Jeff, 2026-09-09: "it should be a NO BRAINER for them to
 * message the rep for the 3 day pdf, thats the whole point of this funnel." The ask under the
 * numbers is built FROM the numbers, which is the one thing the Disruptor result pages cannot do:
 * a reader who has just been told two compounds in their own water are over a federal limit is
 * being offered the document that names the filter standard which removes them.
 *
 * ── HOW THE DATA GETS HERE ────────────────────────────────────────────────────────────────
 * Page 1 builds the opt-in form's iframe with the lookup already on its query string. On submit
 * GHL forward-appends that whole query string onto the redirect target and navigates the TOP
 * window (NOTES §A form redirect navigates the TOP window), so this page arrives carrying
 * ?address= plus the six beneve_water_* values. The address is the good one: it re-runs the same
 * lookup, so the page renders at full fidelity rather than from a summary.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  var root = document.querySelector(".sk-wat-rep");
  if (!root || root.getAttribute("data-wat-ready")) return;
  root.setAttribute("data-wat-ready", "1");

  // The shared component owns the loader and the reveal on the STATIC offer markup below.
  ["_shared/diagnostic-result/v1/result.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p; s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });

  var API = root.getAttribute("data-api") || "";
  var DM_STEP = root.getAttribute("data-dm-step") || "";
  var pane = root.querySelector(".sk-wat-report");
  var KEYWORD = "WATER";

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var q = new URLSearchParams(location.search);
  // An unsubstituted merge field arrives with its braces still on. Treat that as absent rather
  // than printing braces at somebody. First name that answers wins.
  var val = function () {
    for (var i = 0; i < arguments.length; i++) {
      var v = q.get(arguments[i]);
      if (v && !/[{}]/.test(v)) return v.trim();
    }
    return "";
  };
  // ⚠️ TWO SPELLINGS, AND THE SECOND IS THE ONE THAT ACTUALLY ARRIVES. GHL forward-appends the
  // form iframe's query string, and those params are named after the contact fields. The short
  // names were this page's own design and nothing in the funnel has ever sent them.
  var address = val("address");
  var system = val("system", "beneve_water_system");
  var lead   = val("lead", "beneve_water_lead_90th");
  var pfas   = val("pfas", "beneve_water_pfas_count");
  var date   = val("date", "beneve_water_report_date");

  // ── the one call to action, and there is only one ─────────────────────────────────────────
  // ⚠️ NO DIRECT-PDF FALLBACK, EVER. This page used to fall back to the guide URL when
  // beneve_rep_messenger was unset, so an unconfigured account still had a working next step.
  // Jeff killed it 2026-09-09: "the cta isnt to open the reset, its to dm the rep and the rep can
  // send the reset." A button that hands over the PDF removes the only reason this funnel exists,
  // and it is worse on a live account than on a broken one, because it works. An account with no
  // Messenger link is an ONBOARDING defect and it is caught there, not papered over here.
  // → references/BENEVE-BUYER-ONBOARDING-SOP.md §beneve_rep_messenger
  function ctaButton(cls) {
    return '<a class="' + cls + '" href="' + esc(DM_STEP) + '" data-sk-copy="' + KEYWORD + '">' +
      "Message Me The Word " + KEYWORD + arrow() + '</a>';
  }
  function arrow() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  }
  function howLine() {
    return '<p class="sk-ask-how">Tap the button and we will copy the word <b>' + KEYWORD +
      '</b> for you. Paste it and send.</p>';
  }

  // ⚠️ THE BLURB SITS ABOVE THE NUMBERS, WHICH IS THE ONLY PLACE IT WORKS. Jeff, 2026-09-09:
  // "confused about what these things mean? download our 3 day reset, page whatever will explain
  // some of these chemicals." The report deliberately never interprets, so the reader meets a
  // table of compound names with no idea what they are, and that gap is the offer. It names the
  // PAGE NUMBER because a specific page is a thing that exists and "a free guide" is not.
  // ⚠️ PAGE 8 IS DERIVED, NOT DECORATIVE: render-pdf.mjs puts the water page at
  // G.days.length * 2 + 2. If the guide gains or loses a day, this number is wrong.
  function blurb() {
    return '<section class="sk-wat-blurb"><div class="sk-dres-wrap"><div class="sk-wat-blurb-in">' +
      '<div><p class="sk-wat-blurb-t">Not sure what any of these are?</p>' +
      '<p class="sk-wat-blurb-p">Page 8 of the 3 Day Reset is how to read a report like this one: ' +
      'what the lead figure means, what the PFAS count means, and which filter standard takes out ' +
      'what. It is free and I will send it over.</p></div>' +
      ctaButton("sk-wat-blurb-btn") +
      '</div></div></section>';
  }

  // ⚠️ THE ASK IS BUILT FROM THEIR OWN RESULT. A generic "want a free guide" is a different offer
  // to "the two compounds over the limit in your water are covered by a filter standard the guide
  // names". Only this page can write the second one, because only this page knows the numbers.
  function askCopy(d) {
    var over = d && d.pfas && d.pfas.sampled
      ? (d.pfas.detections || []).filter(function (x) { return x.overLimit; }).length : 0;
    var found = d && d.pfas && d.pfas.sampled ? (d.pfas.detections || []).length : 0;
    var leadOver = d && d.lead && d.lead.overAction;

    if (over) {
      return cap(num(over)) + " of the " + num(found) +
        " PFAS compounds detected in your water " + (over === 1 ? "is" : "are") +
        " over the federal limit. The 3 Day Reset names the filter standard that takes them out, and 26 other swaps.";
    }
    if (leadOver) {
      return "Your utility's lead figure is over the federal action level. The 3 Day Reset names the filter standard certified for lead, and 26 other swaps.";
    }
    if (found) {
      return cap(num(found)) + " PFAS compounds were detected in your water, all under the limits that exist. " +
        "The 3 Day Reset names which filter standard covers which one, and 26 other swaps.";
    }
    if (d && d.pfas && !d.pfas.sampled) {
      return "Your system was not sampled in the EPA's PFAS round, which is an absence of data rather than an absence of PFAS. " +
        "The 3 Day Reset explains what that means, names the filter standard for each thing, and lists 26 other swaps.";
    }
    return "The 3 Day Reset names which filter standard takes out lead, which one addresses PFAS, and 26 other swaps.";
  }
  // Lower case, because these land mid-sentence far more often than they start one. Whatever
  // starts a sentence is capitalised at the point of use with cap(), rather than every caller
  // having to remember to lower it: the first draft shipped "Two of the Seven".
  var WORDS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  function num(n) { return n <= 10 ? WORDS[n] : String(n); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ── boot ──────────────────────────────────────────────────────────────────────────────────
  if (address) lookup(address);
  else if (system || lead || pfas) summary();
  else askForAddress();

  function lookup(addr) {
    fetch(API + "/lookup?address=" + encodeURIComponent(addr))
      .then(function (r) { return r.json(); })
      .then(function (d) { d && d.found ? render(d, addr) : summaryOrAsk(addr); })
      .catch(function () { summaryOrAsk(addr); });
  }
  function summaryOrAsk(addr) {
    if (system || lead || pfas) summary(addr);
    else askForAddress("I could not place " + addr + ". Try it with the town and the state on it.");
  }

  function mast(title, addr, meta) {
    return '<header class="sk-wat-mast sk-grain"><div class="sk-dres-wrap">' +
      '<nav class="sk-dres-crumbs" aria-label="Breadcrumb"><span>Water Report</span><i>&rsaquo;</i><b>Your results</b></nav>' +
      '<p class="sk-wat-eyebrow">Water quality report</p>' +
      '<h1>' + esc(title) + '</h1>' +
      (addr ? '<p class="sk-wat-addr">' + esc(addr) + '</p>' : "") +
      (meta.length ? '<ul class="sk-wat-meta">' + meta.map(function (m) {
        return '<li>' + esc(m[0]) + '<b>' + esc(m[1]) + '</b></li>'; }).join("") + '</ul>' : "") +
      '</div></header>';
  }

  function figs(leadTxt, leadSub, leadFlag, pfasTxt, pfasSub, pfasFlag) {
    return '<section class="sk-wat-figs"><div class="sk-dres-wrap"><div class="sk-wat-grid">' +
      '<div class="sk-wat-fig' + (leadFlag ? " sk-wat-fig--flag" : "") + '">' +
        '<p class="sk-wat-fig-l">Lead, 90th percentile</p>' +
        '<p class="sk-wat-fig-v">' + leadTxt + '</p>' +
        '<p class="sk-wat-fig-s">' + leadSub + '</p></div>' +
      '<div class="sk-wat-fig' + (pfasFlag ? " sk-wat-fig--flag" : "") + '">' +
        '<p class="sk-wat-fig-l">PFAS</p>' +
        '<p class="sk-wat-fig-v">' + pfasTxt + '</p>' +
        '<p class="sk-wat-fig-s">' + pfasSub + '</p></div>' +
      '</div></div></section>';
  }

  function askBlock(d) {
    return '<section class="sk-wat-tablewrap" style="padding-top:0"><div class="sk-dres-wrap">' +
      '<div class="sk-ask"><p class="sk-ask-t">Want the rest of it?</p>' +
      '<p class="sk-ask-p">' + esc(askCopy(d)) + ' It is free.</p>' +
      howLine() + ctaButton("sk-ask-btn") +
      '</div></div></section>';
  }

  function render(d, addr) {
    var meta = [["Water system", d.system.name]];
    if (d.pwsid) meta.push(["EPA system id", d.pwsid]);
    if (d.system.population) meta.push(["People served", Number(d.system.population).toLocaleString()]);
    if (d.system.source) meta.push(["Source", d.system.source]);
    if (d.built) meta.push(["Federal data as published", d.built]);

    var leadTxt, leadSub, leadFlag = false;
    if (d.lead && d.lead.ppb > 0) {
      leadTxt = d.lead.ppb + ' <small>ppb</small>';
      leadFlag = !!d.lead.overAction;
      leadSub = d.lead.overAction
        ? "<b>Over the federal action level of " + d.lead.actionPpb + " ppb.</b>"
        : "The federal action level is " + d.lead.actionPpb + " ppb.";
    } else if (d.lead) {
      leadTxt = 'None detected';
      leadSub = "The federal action level is " + d.lead.actionPpb + " ppb.";
    } else {
      leadTxt = 'No result on file';
      leadSub = "Your utility has not reported a lead figure.";
    }

    var dets = (d.pfas && d.pfas.sampled) ? (d.pfas.detections || []) : null;
    var over = dets ? dets.filter(function (x) { return x.overLimit; }).length : 0;
    var pfasTxt, pfasSub, pfasFlag = false;
    if (dets) {
      pfasTxt = dets.length + ' <small>of 30 detected</small>';
      pfasFlag = over > 0;
      pfasSub = over
        ? "<b>" + cap(num(over)) + " over a federal limit.</b>"
        : "None over a federal limit.";
    } else {
      pfasTxt = 'Not sampled';
      pfasSub = "Your system was not in the EPA's monitoring round.";
    }

    var h = mast(d.system.name, addr, meta) + blurb() + figs(leadTxt, leadSub, leadFlag, pfasTxt, pfasSub, pfasFlag);

    if (dets && dets.length) {
      h += '<section class="sk-wat-tablewrap"><div class="sk-dres-wrap">' +
        '<h2 class="sk-wat-th">Every compound they found</h2>' +
        '<p class="sk-wat-tsub">Measured in parts per trillion, beside the federal limit where one exists.</p>' +
        '<div class="sk-wat-scroll"><table><thead><tr>' +
        '<th>Compound</th><th>Detected</th><th>Federal limit</th><th>Status</th>' +
        '</tr></thead><tbody>' +
        dets.map(function (x) {
          return '<tr><td>' + esc(x.name) + '</td>' +
            '<td class="sk-wat-num">' + x.ppt + ' ppt</td>' +
            '<td class="sk-wat-num">' + (x.limit ? x.limit + " ppt" : "None set") + '</td>' +
            '<td class="' + (x.overLimit ? "sk-wat-over" : "sk-wat-under") + '">' +
            (x.overLimit ? "Over" : x.limit ? "Under" : "No limit") + '</td></tr>';
        }).join("") +
        '</tbody></table></div>' +
        '<p class="sk-wat-tnote">A federal limit exists for six PFAS compounds. The rest are reported without one.</p>' +
        '</div></section>';
    }

    h += askBlock(d);
    paint(h);
  }

  function summary(addr) {
    var meta = [];
    if (system) meta.push(["Water system", system]);
    if (date) meta.push(["Federal data as published", date]);
    var h = mast(system || "Your water report", addr || address, meta) + blurb() +
      figs(lead ? esc(lead) : "No result on file", "The federal action level is 15 ppb.", false,
           pfas ? esc(pfas) + ' <small>detected</small>' : "Not sampled",
           "Measured in the EPA's national PFAS round.", false) +
      askBlock(null);
    paint(h);
  }

  function askForAddress(msg) {
    paint('<section class="sk-wat-ask2"><div class="sk-dres-wrap">' +
      '<h2>Look up a water report</h2>' +
      '<p>' + (msg ? esc(msg) : "Type an address and we will read your utility's own EPA records.") + '</p>' +
      '<form class="sk-wat-f2"><input id="sk-wat-a2" type="text" autocomplete="street-address" ' +
      'placeholder="123 Main St, your town, ST"><button type="submit">Check this address</button></form>' +
      '</div></section>');
    pane.querySelector(".sk-wat-f2").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = pane.querySelector("#sk-wat-a2").value.trim();
      if (v) { address = v; pane.innerHTML = ""; lookup(v); }
    });
  }

  function paint(html) {
    pane.innerHTML = html;
    // The static offer's CTA slot is filled from the same builder, so the two buttons can never
    // disagree about whether this account has a Messenger link.
    var slot = root.querySelector(".sk-prog-cta");
    if (slot && !slot.innerHTML) {
      slot.innerHTML = ctaButton("sk-prog-btn") + howLine();
    }
  }

  /* ── THE BAR FLIPS ONCE THE OFFER HAS BEEN SEEN ───────────────────────────────────────────
     Jeff, 2026-09-09: "the WHOLE POINT is to get people to convert to send a dm for the pdf." The
     bar carries the ask for the whole page after that, rather than only inside one section the
     reader may have scrolled past. One-way: it never flips back, because somebody who has read
     the offer and scrolled up has not un-read it. */
  var bar = root.querySelector(".sk-prog-bar");
  var offer = root.querySelector("#reset");
  if (bar && offer && window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) {
      if (!es.some(function (e) { return e.isIntersecting; })) return;
      io.disconnect();
      bar.setAttribute("data-bar", "ask");
      bar.innerHTML = '<span><b>The 3 Day Reset</b>Free, for one message</span>' +
        ctaButton("sk-prog-bar-btn");
    }, { rootMargin: "0px 0px -25% 0px" });
    io.observe(offer);
  }

  // ⚠️ COPY THE WORD, THEN FOLLOW THE LINK. Named in the copy as well as copied: a refused
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
        navigator.clipboard.writeText(text).then(function () { setTimeout(go, 700); }, go);
      } else go();
    } catch (err) { go(); }
    setTimeout(go, 1400);
  });
})();
