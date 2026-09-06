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
  var DM = root.getAttribute("data-dm") || "#report";
  var form = root.querySelector(".sk-wat-form");
  var input = root.querySelector("#sk-wat-addr");
  var out = root.querySelector(".sk-wat-result");
  var pane = root.querySelector(".sk-wat-out");
  var btn = form.querySelector("button[type=submit]");

  root.addEventListener("click", function (e) {
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
      .then(render)
      .catch(function () {
        out.innerHTML = '<div class="sk-wat-err"><h3>That lookup did not come back</h3>' +
          '<p class="sk-wat-sub">The EPA services go down from time to time. Try again in a minute, ' +
          'or send me your town and I will look it up by hand.</p></div>';
      })
      .then(function () { btn.disabled = false; });
  });

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
  }

  function renderNone(d) {
    out.innerHTML = '<div class="sk-wat-err"><h2>No public water system on record for that address</h2>' +
      '<p class="sk-wat-sub">That usually means a private well, or a system too small to be mapped. ' +
      'Nobody is required to test a private well, so there is no public record to read, and the ' +
      'household is the only one who ever will.</p></div>' + ask(d);
  }

  function ask(d) {
    return '<div class="sk-wat-ask"><h3>Want the next step?</h3>' +
      '<p>I put together a 3 day reset: 27 swaps for the things in your house that carry endocrine ' +
      'disruptors, easiest first, including which filter takes out what you just read. It is free, ' +
      'just message me the word SWAP and I will send it over.</p>' +
      '<a class="sk-wat-btn" href="' + esc(DM) + '">Message Me The Word SWAP</a>' +
      (REP ? '<p class="sk-wat-sign">' + esc(REP) + '</p>' : "") + '</div>';
  }
})();
