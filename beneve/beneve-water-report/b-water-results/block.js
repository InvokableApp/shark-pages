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

  // ⚠️ CAPTURED AT BOOT, BEFORE askForAddress() CAN REASSIGN `address`. This is the difference
  // between a reader who came through the funnel (she gave an email address, so a copy of the
  // report really is being sent to her) and one who typed into this page's own box or opened a
  // shared link (nobody has her email and nothing is being sent). Telling the second one to check
  // her inbox is a promise the system cannot keep, so the line is gated on this.
  var FROM_FUNNEL = !!(address || system || lead || pfas);

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
  // ⚠️ PAGE 9 IS DERIVED, NOT DECORATIVE: render-pdf.mjs puts the water page at
  // G.days.length * 2 + 3. It was 8 until the guide gained its mechanisms page on 2026-09-09,
  // which is exactly how this number goes stale. Re-derive it whenever the guide gains a page.
  function blurb() {
    return '<section class="sk-wat-blurb"><div class="sk-dres-wrap"><div class="sk-wat-blurb-in">' +
      '<div><p class="sk-wat-blurb-t">Not sure what any of these are?</p>' +
      '<p class="sk-wat-blurb-p">Page 9 of the 3 Day Reset is how to read a report like this one: ' +
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

  // ⚠️ THE API ASKS US TO SAY THIS. A five digit lookup answers from the CENTRE of the ZIP code,
  // and the response says so itself: how: "zip-centroid", with a note reading "matched from the
  // centre of this ZIP code, so check that this is your utility". Where one ZIP holds more than
  // one utility that can be the wrong system, and this page puts a person's name and numbers in
  // front of a reader as fact. Nothing else on the page hedges, so this is the one place it must.
  function zipCaveat(d) {
    if (!d || d.how !== "zip-centroid") return "";
    return '<p class="sk-wat-zipnote">Matched from the centre of your ZIP code. If more than one ' +
      'utility serves your area, check the name above against your water bill. For an exact match, ' +
      '<button type="button" class="sk-wat-relook">look it up by street address</button>.</p>';
  }

  function mast(title, addr, meta, extra) {
    return '<header class="sk-wat-mast sk-grain"><div class="sk-dres-wrap">' +
      '<nav class="sk-dres-crumbs" aria-label="Breadcrumb"><span>Water Report</span><i>&rsaquo;</i><b>Your results</b></nav>' +
      '<p class="sk-wat-eyebrow">Water quality report</p>' +
      '<h1>' + esc(title) + '</h1>' +
      (addr ? '<p class="sk-wat-addr">' + esc(addr) + '</p>' : "") +
      (meta.length ? '<ul class="sk-wat-meta">' + meta.map(function (m) {
        return '<li>' + esc(m[0]) + '<b>' + esc(m[1]) + '</b></li>'; }).join("") + '</ul>' : "") +
      (extra || "") +
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

  // ⚠️ THE HEADING ASKS ABOUT MEANING, NOT ABOUT MORE. Jeff, 2026-09-09: "theres still 'want the
  // rest of it' messaging, lets get rid of that and make it more 'want to know what these things
  // mean?'". "The rest of it" implies this page is holding something back, which is both untrue
  // and the wrong offer: she has ALL of her numbers and none of the meaning. The gap is
  // interpretation, and that is exactly what the guide is for.
  function askBlock(d) {
    return '<section class="sk-wat-tablewrap" style="padding-top:0"><div class="sk-dres-wrap">' +
      '<div class="sk-ask"><p class="sk-ask-t">Want to know what these things mean?</p>' +
      '<p class="sk-ask-p">' + esc(askCopy(d)) + ' It is free.</p>' +
      ctaButton("sk-ask-btn") + howLine() +
      '</div></div></section>';
  }

  // ⚠️ ONLY SHOWN TO SOMEBODY WHO ACTUALLY GAVE US AN EMAIL ADDRESS. See FROM_FUNNEL above.
  // The delivery email merges her six water values into the body, so this line is literally true:
  // the numbers are in her inbox, not just a link to them.
  // → BENEVESHARK/campaigns/water-report/_build/email-copy.mjs
  function inboxLine() {
    if (!FROM_FUNNEL) return "";
    return '<p class="sk-wat-inbox"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 7h18v12H3z"/><path d="m3 8 9 6 9-6"/></svg>' +
      '<span><b>A copy is in your email.</b> Your utility, your lead number and your PFAS count, ' +
      'so you have them without coming back here.</span></p>';
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

    var h = mast(d.system.name, addr, meta, zipCaveat(d) + inboxLine()) + blurb() + figs(leadTxt, leadSub, leadFlag, pfasTxt, pfasSub, pfasFlag);

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
    var h = mast(system || "Your water report", addr || address, meta, inboxLine()) + blurb() +
      figs(lead ? esc(lead) : "No result on file", "The federal action level is 15 ppb.", false,
           pfas ? esc(pfas) + ' <small>detected</small>' : "Not sampled",
           "Measured in the EPA's national PFAS round.", false) +
      askBlock(null);
    paint(h);
  }

  // ⚠️ ZIP FIRST, ADDRESS STILL ACCEPTED. Jeff, 2026-09-09: "lets make sure the user knows they
  // can just enter a zipcode and they dont need to add their full address." Five digits is the
  // whole ask; a street address is the more exact answer and stays available in the same box.
  // autocomplete is postal-code, but inputmode is deliberately NOT numeric, or the address path
  // becomes untypeable on a phone.
  // The caveat's own escape hatch. Delegated on the root, because the caveat is painted into
  // innerHTML after this runs and a direct listener would bind to a node that no longer exists.
  root.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest(".sk-wat-relook") : null;
    if (!t) return;
    e.preventDefault();
    pane.innerHTML = "";
    askForAddress("Type the street, the town and the state, and we will match the exact utility.");
  });

  function askForAddress(msg) {
    paint('<section class="sk-wat-ask2"><div class="sk-dres-wrap">' +
      '<h2>Look up a water report</h2>' +
      '<p>' + (msg ? esc(msg) : "Your ZIP code is enough. We read your utility's own EPA records.") + '</p>' +
      '<form class="sk-wat-f2"><input id="sk-wat-a2" type="text" autocomplete="postal-code" ' +
      'placeholder="Your ZIP code"><button type="submit">Check My Water</button></form>' +
      '<p class="sk-wat-f2-n">Just the 5 digits. A full street address is more exact if more than ' +
      'one utility serves your ZIP.</p>' +
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
      slot.innerHTML = ctaButton("sk-prog-btn");
    }
    wireBar();
  }

  /* ── THE BAR FLIPS ONCE THE OFFER HAS BEEN SEEN ───────────────────────────────────────────
     Jeff, 2026-09-09: "the WHOLE POINT is to get people to convert to send a dm for the pdf." The
     bar carries the ask for the whole page after that, rather than only inside one section the
     reader may have scrolled past. One-way: it never flips back, because somebody who has read
     the offer and scrolled up has not un-read it.

     ⚠️ IT CANNOT BE WIRED AT BOOT. The report region is empty until the lookup returns, so at boot
     #reset sits directly under the loader, inside the first viewport, and the observer fires on
     the spot: measured shipping in the "ask" state before the reader had seen a single number.
     It is armed from paint(), against the page that actually exists. */
  var barWired = false;
  function wireBar() {
    if (barWired) return;
    var bar = root.querySelector(".sk-prog-bar");
    var offer = root.querySelector("#reset");
    if (!bar || !offer || !window.IntersectionObserver) return;
    barWired = true;
    var io = new IntersectionObserver(function (es) {
      if (!es.some(function (e) { return e.isIntersecting; })) return;
      io.disconnect();
      bar.setAttribute("data-bar", "ask");
      bar.innerHTML = '<span><b>The 3 Day Reset</b>Free, just send me a message on Facebook</span>' +
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

  /* ── sticky bar reveal (HOSTED-BLOCKS-SOP §8b) ───────────────────────────────────────────
     Ships `hidden` so a blocked script leaves no dead bar welded across the top, and the
     attribute is cleared once here; visibility after that is a class, because display:none
     cannot transition. The 4px threshold ignores the rubber-band bounce iOS reports at rest,
     the rAF gate keeps the handler off the critical path, and the sync() at the end covers a
     reload that restores a scroll position partway down the page. */
  (function () {
    var bar = root.querySelector(".sk-prog-bar");
    if (!bar) return;
    bar.removeAttribute("hidden");
    var on = false, queued = false;
    var sync = function () {
      queued = false;
      var want = (window.pageYOffset || document.documentElement.scrollTop || 0) > 4;
      if (want === on) return;
      on = want;
      bar.classList.toggle("sk-prog-bar-on", on);
      if (on) root.style.setProperty("--sk-bar-h", bar.offsetHeight + "px");
    };
    window.addEventListener("scroll", function () {
      if (!queued) { queued = true; window.requestAnimationFrame(sync); }
    }, { passive: true });
    sync();
  })();
})();
