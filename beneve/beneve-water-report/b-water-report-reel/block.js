/* beneve/beneve-water-report/b-water-report-reel: the tool inside the reel (see block.html).
 *
 * One job, as on GHL: take an address, ask water-api, show what was found, and only THEN let the form open.
 * The lookup, the gate's words and the values handed to the form are copied from the GHL page's block.js
 * (beneve/beneve-water-report/b-water-report/block.js: submit, gate(), pfasList(), formUrl()). That file is not loaded
 * here because it builds a GHL form iframe into its own markup; this one hands the same values to the platform's form.
 *
 * WARNING: THE PAGE NEVER INTERPRETS. It names the utility and says what the report holds. "Above the federal limit" is
 * a fact about two numbers; "your water is unsafe" is a medical opinion (the GHL page's rule).
 *
 * The dock (the platform's, funnel-native.js) and the computer's .rl-cta both carry data-sk-open, which form.js opens the
 * form on. Until a lookup has come back, a tap, a swipe or a flick past the last screen is caught here first (window,
 * capture) and goes to the ZIP box instead; after it, the form opens and the dock says "Show my water report".
 */
(function () {
  var root = document.querySelector(".rl.wr");
  if (!root || root.getAttribute("data-wr-ready")) return;
  root.setAttribute("data-wr-ready", "1");

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
  var REP = root.getAttribute("data-rep") || "";
  if (/[{}]/.test(REP)) REP = "";
  var KEY = "beneve-water";               // sessionStorage: the address, for the results reel (the next step)
  var track = root.querySelector(".rl-track");
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var cover = root.querySelector(".wr-cover");
  var gateP = root.querySelector(".wr-gate");
  var gateIn = gateP.querySelector(".rl-in");
  var form = root.querySelector(".wr-form");
  var input = root.querySelector("#wr-addr");
  var btn = form.querySelector("button[type=submit]");
  var LAST = null;                        // the last lookup that came back (found or not); null after an error
  var seq = 0;

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var num = function (n) { return Number(n).toLocaleString(); };
  var store = function (o) { try { sessionStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
  var stored = function () { try { return JSON.parse(sessionStorage.getItem(KEY) || "null") || {}; } catch (e) { return {}; } };

  // a screen this script hid or showed takes its dot with it (reel.js drew one per screen)
  function syncDots() {
    var dots = root.querySelectorAll(".rl-dots button");
    screens.forEach(function (s, i) { if (dots[i]) dots[i].hidden = s.hidden; });
  }
  syncDots();
  function show(sec) { track.scrollTo({ top: sec.offsetTop, behavior: "smooth" }); }

  function goTool() {
    show(cover);
    setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); } }, 420);
  }

  // the two examples, and the gate's "Not your utility?" format, fill the box (as on GHL)
  root.addEventListener("click", function (e) {
    var eg = e.target.closest ? e.target.closest("[data-wr-eg]") : null;
    if (!eg) return;
    e.preventDefault();
    input.value = eg.getAttribute("data-wr-eg");
    if (eg.closest(".wr-gate")) goTool(); else input.focus();
  });

  // ---------- the lookup (GHL block.js submit, unchanged but for where the answer is drawn) ----------
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = (input.value || "").trim();
    if (!v) { input.focus(); return; }
    var mine = ++seq;
    btn.disabled = true;
    if (input.blur) input.blur();
    paint('<div class="wr-wait"><p>Reading the EPA records now...</p><div class="lk-bar"><i></i></div></div>');
    fetch(API + "/lookup?address=" + encodeURIComponent(v))
      .then(function (r) { return r.json(); })
      .then(function (d) { if (mine !== seq) return; fixName(d); LAST = d; LAST.address = v; store({ address: v }); gate(d); })
      .catch(function () {
        if (mine !== seq) return;
        LAST = null; window.__pfExtra = {}; dockSays(false);
        paint('<span class="lk-tag" data-in>Water Report</span><h2 data-in style="--d:.1s">That lookup did not come back</h2>' +
          '<p class="wr-gate-p" data-in style="--d:.2s">The EPA services go down from time to time. Try again in a minute, ' +
          'or send me your town and I will look it up by hand.</p>');
      })
      .then(function () { btn.disabled = false; });
  });

  function paint(html) {
    gateIn.innerHTML = html;
    gateP.hidden = false;
    syncDots();
    gateP.classList.remove("is-on");
    requestAnimationFrame(function () { show(gateP); setTimeout(function () { gateP.classList.add("is-on"); }, 60); });
  }

  // ---------- the gate: the GHL gate card's words, a screen of its own ----------
  function gate(d) {
    var name = d && d.found && d.system && d.system.name;
    paint(
      (name
        ? '<span class="lk-tag" data-in>Report ready</span>' +
          '<h2 data-in style="--d:.08s">We found your water system</h2>' +
          '<div class="wr-sys" data-in style="--d:.16s"><div class="wr-sys-name">' + esc(name) + '</div></div>' +
          '<p class="wr-gate-p" data-in style="--d:.22s">Your report has the lead result, the PFAS ' +
          'result and the federal limit beside each one.</p>' +
          (d.how === "zip-centroid"
            ? '<p class="wr-zip" data-in style="--d:.28s"><b>Not your utility?</b> That was matched from the ' +
              'center of your ZIP code. Try again with your exact address, in this format: ' +
              '<button type="button" class="wr-eg" data-wr-eg="500 Boston Post Rd, Sudbury, MA">500 Boston Post Rd, Sudbury, MA</button></p>'
            : "")
        : '<h2 data-in>No public water system on record for that address</h2>' +
          '<p class="wr-gate-p" data-in style="--d:.12s">That usually means a private well, or a system too small to ' +
          'report. The 3 Day Reset still applies, and it covers what to do when nobody publishes ' +
          'a number for you.</p>') +
      '<p class="wr-ask" data-in style="--d:.34s">Where are we sending your water report?</p>' +
      (REP ? '<p class="wr-sign" data-in style="--d:.4s">' + esc(REP) + '</p>' : "")
    );
    window.__pfExtra = extra(d);
    dockSays(true);
  }

  // ---------- what rides with the form (GHL formUrl(), the same values under the same keys) ----------
  // The keys are the GHL form's hidden-field keys, which are the contact fields the delivery email and the rep alert merge
  // ({{contact.beneve_water_system}} and the rest); the address is the standard address field, {{contact.address1}}.
  // WARNING: A LIMIT OF null MEANS NO FEDERAL LIMIT EXISTS FOR THAT ONE, never "under the limit" (GHL pfasList()).
  function pfasList(d) {
    if (!d || !d.pfas || !d.pfas.sampled) return "not sampled";
    var det = (d.pfas.detections || []).slice();
    if (!det.length) return "none detected";
    det.sort(function (a, b) { return (b.overLimit - a.overLimit) || (b.ppt - a.ppt); });
    return det.map(function (x) {
      var s = x.name + " " + x.ppt + " ppt";
      if (x.overLimit) return s + " (over the " + x.limit + " ppt federal limit)";
      if (x.limit) return s + " (federal limit " + x.limit + " ppt)";
      return s;
    }).join(" · ");
  }
  function extra(d) {
    var q = {};
    var add = function (k, v) { if (v !== null && v !== undefined && v !== "") q[k] = String(v); };
    add("address1", d && d.address);
    if (d && d.found) {
      add("beneve_water_system", d.system.name);
      add("beneve_water_system_id", d.pwsid);
      add("beneve_water_lead_90th", d.lead ? (d.lead.ppb > 0 ? d.lead.ppb + " ppb" : "none detected") : "no result on file");
      add("beneve_water_pfas_count", d.pfas.sampled ? String(d.pfas.detections.length) : "not sampled");
      add("beneve_water_pfas_flag", d.pfas.anyOverLimit ? "yes" : "no");
      add("beneve_water_report_date", d.built);
      add("beneve_water_pfas_list", pfasList(d));
      add("beneve_water_pfas_over", d.pfas.sampled
        ? String((d.pfas.detections || []).filter(function (x) { return x.overLimit; }).length) : "not sampled");
      add("beneve_water_city", d.system.city);
      add("beneve_water_source", d.system.source);
      add("beneve_water_population", d.system.population ? num(d.system.population) : "");
    } else {
      add("beneve_water_system", "no public system on record");
      add("beneve_water_pfas_count", "not sampled");
      add("beneve_water_pfas_flag", "no");
    }
    return q;
  }

  // ---------- the dock and the computer's button ----------
  var TOOL = root.getAttribute("data-pf-dock") || "Check My Water", OPEN = "Show me what's in my water 💧";
  function dockSays(ready) {
    var t = ready ? OPEN : TOOL;
    root.setAttribute("data-pf-dock", t);
    var b = document.querySelector(".pfn-dock .pfn-txt b"); if (b) b.textContent = t;
    var c = root.querySelector(".rl-cta"); if (c) c.textContent = t;
  }
  // Before a lookup has come back, the opener goes to the ZIP box. Window, capture: before form.js sees the click.
  window.addEventListener("click", function (e) {
    var o = e.target.closest && e.target.closest(".pfn-dock, .rl-cta, [data-sk-open]");
    if (!o || LAST) return;
    e.preventDefault(); e.stopImmediatePropagation();
    goTool();
  }, true);

  // The form is sent: the results reel may say "A copy is in your email" (the GHL page's FROM_FUNNEL), and reads the
  // address from here, since the platform's form goes on to the next step without it.
  document.addEventListener("submit", function (e) {
    if (e.target && e.target.classList && e.target.classList.contains("pf-form") && LAST) store({ address: LAST.address, sent: 1 });
  }, true);

  // Back on this page in the same tab: the box keeps what was typed last.
  var was = stored();
  if (was.address && !input.value) input.value = was.address;
})();
