/* mlm/mlm-insurance-kit/result.js (Marketing Shark | MLM): the one result page of each insurance check works its answer out
 * from the answers ins.js kept ("mlmins:<funnel>" in sessionStorage), or from ?a=<base64 json> (an email's link).
 * Fills [data-o="name"] with text, shows [data-r="key"] for the result key and hides the rest, [data-show="name"] only
 * when that output is set. THE RESULT RULES for iul and career are the form's endings in the migration; change both.
 * Numbers: NFDA 2023 national medians (copy.json sources). An estimate only, and the page says so. */
(function () {
  var root = document.querySelector(".ins-r");
  if (!root) return;
  var f = root.getAttribute("data-ins"), a = {};
  try { a = JSON.parse(sessionStorage.getItem("mlmins:" + f) || "{}"); } catch (x) {}
  try { var q = new URLSearchParams(location.search).get("a"); if (q) a = JSON.parse(atob(q)); } catch (x) {}
  var out = {}, key = null;
  function $(n) { return "$" + Math.round(n).toLocaleString("en-US"); }

  if (f === "fe") {
    var who = a.mlm_fe_for || "", svc = a.mlm_fe_service || "Not sure yet", saved = a.mlm_fe_saved || "";
    var cost = { "A burial": 8300, "Cremation with a service": 6280 }[svc];
    var range = { "Nothing yet": [0, 0], "Under $2,000": [0, 2000], "$2,000 to $5,000": [2000, 5000], "More than $5,000": [5000, null] }[saved];
    out.service = { "A burial": "a burial", "Cremation with a service": "a cremation with a service", "A simple cremation, no service": "a simple cremation", "Not sure yet": "a burial or a cremation" }[svc] || "a funeral";
    out.typical = svc === "A burial" ? "$8,300 + cemetery" : svc === "Cremation with a service" ? "$6,280" : svc === "Not sure yet" ? "$6,280 to $8,300" : "Ask for the price list";
    out.saved = saved === "Nothing yet" ? "$0" : saved === "Not sure" ? "Not sure" : saved || "Not sure";
    if (cost && range) {
      var lo = range[1] == null ? 0 : Math.max(cost - range[1], 0), hi = Math.max(cost - range[0], 0);
      out.gap = range[1] == null ? "Up to " + $(hi) : lo === hi ? $(hi) : $(lo) + " to " + $(hi);
      if (svc === "A burial") out.gap += " + cemetery";
    } else if (svc === "Not sure yet" && range && range[0] === 0 && range[1] === 0) out.gap = "$6,280 to $8,300";
    else out.gap = "Depends on the price list";
    out.you = who === "Me" ? "you" : "them";
    if (a.mlm_fe_cover === "Yes, enough to cover it") out.covered = "1";
  }

  if (f === "mp") {
    var bal = +a.mlm_mp_balance || 0, own = +a.mlm_mp_own || 0;
    out.balance = bal ? $(bal) : "Your balance";
    out.own = own ? $(own) : (a.mlm_mp_own === "Not sure" ? "Not sure" : "$0");
    out.work = a.mlm_mp_work === "Yes" ? "Yes" : a.mlm_mp_work === "Not sure" ? "Not sure" : "None";
    out.gap = bal ? $(Math.max(bal - own, 0)) : "";
    if (a.mlm_mp_work === "Yes") out.worknote = "1";
    if (a.mlm_mp_home === "Just me") out.justme = "1";
    var pct = bal ? Math.min(Math.round(own / bal * 100), 100) : 0;
    root.style.setProperty("--covered", pct + "%");
  }

  if (f === "iul") {
    if (a.mlm_iul_cover === "None" && a.mlm_iul_depend !== "Nobody right now") key = "cover-first";
    else if (a.mlm_iul_need === "Until the kids are grown or the house is paid off" || a.mlm_iul_cushion === "Not yet" || a.mlm_iul_commit === "I'm not sure") key = "term-fits";
    else key = "worth-a-look";
  }

  if (f === "ic") {
    if (a.mlm_ic_exam === "Not for me" || a.mlm_ic_calls === "I'd rather not") key = "not-now";
    else if (a.mlm_ic_hours === "Under 5" || a.mlm_ic_exam === "Nervous, but I'd do it" || a.mlm_ic_background === "I'd like to ask about it privately") key = "closer-look";
    else key = "strong-fit";
    if (a.mlm_ic_hours === "Under 5") out.why_hours = "1";
    if (a.mlm_ic_exam === "Nervous, but I'd do it") out.why_exam = "1";
    if (a.mlm_ic_background === "I'd like to ask about it privately") out.why_background = "1";
  }

  [].forEach.call(root.querySelectorAll("[data-o]"), function (el) { var v = out[el.getAttribute("data-o")]; if (v != null && v !== "") el.textContent = v; });
  [].forEach.call(root.querySelectorAll("[data-show]"), function (el) { el.hidden = !out[el.getAttribute("data-show")]; });
  if (key || root.querySelector("[data-r]")) {
    var k = key || root.getAttribute("data-default");
    [].forEach.call(root.querySelectorAll("[data-r]"), function (el) { el.hidden = el.getAttribute("data-r").split(" ").indexOf(k) < 0; });
    root.setAttribute("data-result", k);
  }
})();
