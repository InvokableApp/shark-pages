/* beneve/beneve-water-report/b-water-results-reel: the report inside the reel (see block.html).
 *
 * The lookup, every label and sentence, the ask built from her own numbers (askCopy) and the ZIP caveat are copied from
 * the GHL results page's block.js (beneve/beneve-water-report/b-water-results/block.js). That file is not loaded here: it
 * draws a long page into .sk-wat-rep and loads _shared/diagnostic-result from GitHub for its loader; this one draws the
 * same report into the reel's screens.
 *
 * WARNING: THE PAGE NEVER INTERPRETS. It prints the utility's own number beside the federal limit and stops.
 * WARNING: A LIMIT OF null MEANS NO FEDERAL LIMIT EXISTS FOR THAT COMPOUND ("No limit"), never "Under".
 */
(function () {
  var root = document.querySelector(".rl.wrr");
  if (!root || root.getAttribute("data-wrr-ready")) return;
  root.setAttribute("data-wrr-ready", "1");

  var API = root.getAttribute("data-api") || "https://water-api-production-c8d2.up.railway.app";
  /* What the data service sends, made right before anything shows or is sent (Jeff, 2026-10-15). It title-cases utility
   * names, so a state code at the front reads "Nj American Water": its capitals go back. Only a leading two-letter state code is touched: "Co" later
   * in a name is "company". */
  var STATES = "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" ");
  function fixName(d) {
    if (d && d.system && d.system.name) d.system.name = String(d.system.name).replace(/^([A-Za-z]{2})\b/, function (m) {
      return STATES.indexOf(m.toUpperCase()) > -1 ? m.toUpperCase() : m; });
    // EPA sampled 29 PFAS plus lithium; the service's panel of 30 counts lithium, which is not a PFAS. Kept out here, so
    // every PFAS count on the page and in the lead's email is of the 29 (Jeff, 2026-10-15).
    if (d && d.pfas && d.pfas.detections) d.pfas.detections = d.pfas.detections.filter(function (x) { return !/lithium/i.test(x.name || ""); });
    return d;
  }
  var KEY = "beneve-water";
  var track = root.querySelector(".rl-track");
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var head = root.querySelector(".wrr-head");
  var figsP = root.querySelector(".wrr-figs"), figsIn = figsP.querySelector(".rl-in");
  var tableP = root.querySelector(".wrr-table"), tableIn = tableP.querySelector(".rl-in");
  var askP = root.querySelector(".wrr-ask-p");

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var stored = function () { try { return JSON.parse(sessionStorage.getItem(KEY) || "null") || {}; } catch (e) { return {}; } };

  var q = new URLSearchParams(location.search);
  // An unsubstituted merge field arrives with its braces still on: absent. First name that answers wins (GHL val()).
  var val = function () {
    for (var i = 0; i < arguments.length; i++) {
      var v = q.get(arguments[i]);
      if (v && !/[{}]/.test(v)) return v.trim();
    }
    return "";
  };
  var mem = stored();
  // An address with "#" in it (Apt #4) arrives cut in two: the emails write ?address={{contact.address1}} unencoded and
  // last, so everything from the "#" lands in location.hash. Put it back, and below the bar gets the whole address.
  var hashTail = val("address") && location.hash && /[?&]address=[^&]*$/.test(location.search) ? decodeURIComponent(location.hash) : "";
  var address = (val("address") ? (hashTail ? (q.get("address") + hashTail).trim() : val("address")) : "") || mem.address || "";
  var system = val("system", "beneve_water_system");
  var lead   = val("lead", "beneve_water_lead_90th");
  var pfas   = val("pfas", "beneve_water_pfas_count");
  var date   = val("date", "beneve_water_report_date");
  // Somebody who came through the funnel gave an email address, so a copy really is on its way to her. On GHL that was
  // "arrived carrying the form's values"; here it is also "the opt-in reel saw the form sent in this tab".
  var FROM_FUNNEL = !!(val("address") || system || lead || pfas || mem.sent);
  // The address goes back on the address bar, so a reload or a shared link opens the same report (as on GHL).
  if (address && (!val("address") || hashTail)) {
    try { q.set("address", address); history.replaceState(null, "", location.pathname + "?" + q.toString() + (hashTail ? "" : location.hash)); } catch (e) {}
  }

  function syncDots() {
    var dots = root.querySelectorAll(".rl-dots button");
    screens.forEach(function (s, i) { if (dots[i]) dots[i].hidden = s.hidden; });
  }
  syncDots();
  // a screen filled while it is already on: its pieces arrive again
  function replay(sec) { if (sec.classList.contains("is-on")) { sec.classList.remove("is-on"); requestAnimationFrame(function () { sec.classList.add("is-on"); }); } }

  // ---------- the ask, built from their own result (GHL askCopy, verbatim) ----------
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
  var WORDS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  function num(n) { return n <= 10 ? WORDS[n] : String(n); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ---------- boot (GHL: address, else the summary, else ask) ----------
  if (address) lookup(address);
  else if (system || lead || pfas) summary();
  else askForAddress();

  function lookup(addr) {
    var t = setTimeout(function () {
      var w = head.querySelector(".wrr-wait");
      if (w) { w.querySelector(".wrr-wait-t").textContent = "Reading the federal record...";
               w.querySelector(".wrr-wait-s").textContent = "Lead sampling and the EPA's PFAS round"; }
    }, 1100);
    fetch(API + "/lookup?address=" + encodeURIComponent(addr))
      .then(function (r) { return r.json(); })
      .then(function (d) { clearTimeout(t); fixName(d); d && d.found ? render(d, addr) : summaryOrAsk(addr); })
      .catch(function () { clearTimeout(t); summaryOrAsk(addr); });
  }
  function summaryOrAsk(addr) {
    if (system || lead || pfas) summary(addr);
    else askForAddress("I could not place " + addr + ". Try it with the town and the state on it.");
  }

  // The API asks us to say this: a five digit lookup answers from the centre of the ZIP code (GHL zipCaveat, verbatim).
  function zipCaveat(d) {
    if (!d || d.how !== "zip-centroid") return "";
    return '<p class="wrr-zip"><b>Not your utility?</b> That was matched from the center of ' +
      'your ZIP code, so a ZIP with more than one utility in it can land on the wrong one. Try ' +
      'again with your exact address, in this format: ' +
      '<button type="button" class="wr-eg wrr-relook">500 Boston Post Rd, Sudbury, MA</button></p>';
  }
  function inboxLine() {
    if (!FROM_FUNNEL) return "";
    return '<p class="wrr-inbox"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 7h18v12H3z"/><path d="m3 8 9 6 9-6"/></svg>' +
      '<span><b>A copy is in your email.</b> Your utility, your lead number and your PFAS count, ' +
      'so you have them without coming back here.</span></p>';
  }

  // the cover: the system's name (the GHL masthead's h1), the address, the caveat, the inbox line
  function mast(title, addr, extra) {
    head.innerHTML = '<p class="wrr-sys">' + esc(title) + '</p>' +
      (addr ? '<p class="wrr-addr">' + esc(addr) + '</p>' : "") + (extra || "");
    replay(root.querySelector(".wrr-top"));
  }

  // screen 2: the two figures (GHL figs()), the record (GHL masthead meta), the fine print
  function figs(leadTxt, leadSub, leadFlag, leadBar, pfasTxt, pfasSub, pfasFlag, meta) {
    figsIn.innerHTML = '<span class="lk-tag" data-in>Your results</span>' +
      '<div class="wrr-grid" data-in style="--d:.08s">' +
        '<div class="wrr-fig' + (leadFlag ? " wrr-fig--flag" : "") + '">' +
          '<p class="wrr-fig-l">Lead, 90th percentile</p>' +
          '<p class="wrr-fig-v">' + leadTxt + '</p>' +
          (leadBar != null ? '<div class="lk-bar wrr-bar" aria-hidden="true"><i style="--lk-p:' + leadBar + '%"></i></div>' : "") +
          '<p class="wrr-fig-s">' + leadSub + '</p></div>' +
        '<div class="wrr-fig' + (pfasFlag ? " wrr-fig--flag" : "") + '">' +
          '<p class="wrr-fig-l">PFAS</p>' +
          '<p class="wrr-fig-v">' + pfasTxt + '</p>' +
          '<p class="wrr-fig-s">' + pfasSub + '</p></div>' +
      '</div>' +
      (meta.length ? '<ul class="wrr-meta" data-in style="--d:.16s">' + meta.map(function (m) {
        return '<li><span>' + esc(m[0]) + '</span><b>' + esc(m[1]) + '</b></li>'; }).join("") + '</ul>' : "") +
      '<p class="rl-fine wrr-fine" data-in style="--d:.24s">These are your utility\'s own compliance results, not a test of the tap ' +
      'in your kitchen. Private wells are not covered by any of it, because nobody is required to ' +
      'report them. Nothing here is a health assessment.</p>';
    figsP.hidden = false;
    replay(figsP);
  }

  function render(d, addr) {
    var meta = [];
    if (d.pwsid) meta.push(["EPA system id", d.pwsid]);
    if (d.system.population) meta.push(["People served", Number(d.system.population).toLocaleString()]);
    if (d.system.source) meta.push(["Source", d.system.source]);
    if (d.built) meta.push(["Federal data as published", d.built]);

    var leadTxt, leadSub, leadFlag = false, leadBar = null;
    if (d.lead && d.lead.ppb > 0) {
      leadTxt = d.lead.ppb + ' <small>ppb</small>';
      leadFlag = !!d.lead.overAction;
      leadBar = Math.max(2, Math.min(100, Math.round(d.lead.ppb / d.lead.actionPpb * 100)));
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
      pfasTxt = dets.length + ' <small>of 29 detected</small>';
      pfasFlag = over > 0;
      pfasSub = over ? "<b>" + cap(num(over)) + " over a federal limit.</b>" : "None over a federal limit.";
    } else {
      pfasTxt = 'Not sampled';
      pfasSub = "Your system was not in the EPA's monitoring round.";
    }

    mast(d.system.name, addr, zipCaveat(d) + inboxLine());
    figs(leadTxt, leadSub, leadFlag, leadBar, pfasTxt, pfasSub, pfasFlag, meta);

    if (dets && dets.length) {
      tableIn.innerHTML = '<h2 class="wrr-th" data-in>Every compound they found</h2>' +
        '<p class="wrr-tsub" data-in style="--d:.08s">Measured in parts per trillion, beside the federal limit where one exists.</p>' +
        '<div class="wrr-rows" data-in style="--d:.16s" role="table" aria-label="Every compound they found">' +
        '<div class="wrr-row wrr-row-h" role="row"><span role="columnheader">Compound</span><span role="columnheader">Detected</span>' +
        '<span role="columnheader">Federal limit</span><span role="columnheader">Status</span></div>' +
        dets.map(function (x) {
          return '<div class="wrr-row" role="row"><span role="cell">' + esc(x.name) + '</span>' +
            '<span role="cell" class="wrr-num">' + x.ppt + ' ppt</span>' +
            '<span role="cell" class="wrr-num">' + (x.limit ? x.limit + " ppt" : "None set") + '</span>' +
            '<span role="cell" class="' + (x.overLimit ? "wrr-over" : x.limit ? "wrr-under" : "wrr-none") + '">' +
            (x.overLimit ? "Over" : x.limit ? "Under" : "No limit") + '</span></div>';
        }).join("") +
        '</div>' +
        '<p class="wrr-tnote" data-in style="--d:.24s">A federal limit exists for six PFAS compounds. The rest are reported without one.</p>';
      tableP.hidden = false;
      tableP.classList.toggle("wrr-long", dets.length > 7);
      replay(tableP);
    } else tableP.hidden = true;

    askP.textContent = askCopy(d) + " It is free.";
    syncDots();
  }

  function summary(addr) {
    var meta = [];
    if (date) meta.push(["Federal data as published", date]);
    mast(system || "Your water report", addr || address, inboxLine());
    figs(lead ? esc(lead) : "No result on file", "The federal action level is 15 ppb.", false, null,
         pfas ? esc(pfas) + ' <small>detected</small>' : "Not sampled",
         "Measured in the EPA's national PFAS round.", false, meta);
    tableP.hidden = true;
    askP.textContent = askCopy(null) + " It is free.";
    syncDots();
  }

  // the caveat's own way out: the same box, the format in it (GHL relook)
  root.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest(".wrr-relook") : null;
    if (!t) return;
    e.preventDefault();
    askForAddress("Street, town and state, and we will match the exact utility.");
    var box = head.querySelector("#wrr-a2");
    if (box) { box.placeholder = "500 Boston Post Rd, Sudbury, MA"; box.focus(); }
  });

  // no address at all (opened straight, or another phone): the page asks for one itself (GHL askForAddress, verbatim)
  function askForAddress(msg) {
    head.innerHTML = '<div class="wrr-ask2"><h2>Look up a water report</h2>' +
      '<p>' + (msg ? esc(msg) : "Your ZIP code is enough. We read your utility's own EPA records.") + '</p>' +
      '<form class="wr-form wrr-f2"><input id="wrr-a2" type="text" autocomplete="postal-code" ' +
      'placeholder="Your ZIP code" aria-label="Your ZIP code, or your full address"><button type="submit" class="wr-go">Check My Water</button></form>' +
      '<p class="wr-note">Just the 5 digits. A full street address is more exact if more than ' +
      'one utility serves your ZIP.</p></div>';
    figsP.hidden = true; tableP.hidden = true; syncDots();
    head.querySelector(".wrr-f2").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = head.querySelector("#wrr-a2").value.trim();
      if (!v) return;
      address = v;
      try { q.set("address", v); history.replaceState(null, "", location.pathname + "?" + q.toString()); } catch (x) {}
      head.innerHTML = '<div class="wrr-wait"><p class="wrr-wait-t">Finding your water system...</p>' +
        '<p class="wrr-wait-s">Matching your address to the utility that supplies it</p><div class="lk-bar"><i></i></div></div>';
      lookup(v);
    });
  }
})();
