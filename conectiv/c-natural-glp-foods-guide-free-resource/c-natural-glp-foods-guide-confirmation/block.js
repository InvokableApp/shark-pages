/* conectiv / c-natural-glp-foods-guide-free-resource / c-natural-glp-foods-guide-confirmation
 *
 * Loads the shared confirmation engine, and before it, resolves this page's step links onto
 * the buyer's own domain. Same mechanic as the GLP Foods confirmation, DIFFERENT CUSTOM VALUE,
 * and the difference is the whole point of this comment.
 *
 * ── WHICH DOMAIN CV, AND WHY NOT THE ONE GLP USES ────────────────────────────────────────
 * GLP builds step links from `your_email_designated_domain`, because on GLP that value holds
 * the connected apex domain (GLP-BUYER-ONBOARDING-SOP: "the connected domain, apex").
 *
 * CONECTIV SPLITS THAT INTO TWO VALUES AND THE NAMES NEARLY COLLIDE:
 *
 *     conectiv__main_url                 "Enter your main domain WITHOUT https://
 *                                          (e.g. yourbrand.com)"          <-- serves the funnel
 *     conectiv__email_designated_domain  "Enter your GHL email sending domain
 *                                          (e.g. mail.yourbrand.com)"     <-- does NOT
 *
 * A mail subdomain does not serve funnel pages, so reaching for the same-sounding CV here
 * would build every step link on mail.yourbrand.com and kill all of them. This page uses
 * `conectiv__main_url`. (CLAUDE.md: nothing generalises between systems without measuring.)
 *
 * ── THE TWO THINGS THAT ARE NOT A STRING JOIN ────────────────────────────────────────────
 *   1. THE CV IS SCHEME-LESS. Conectiv states it in the CV's own instruction text ("WITHOUT
 *      https://"), the same house rule as GLP and Vital. An href of
 *      "yourbrand.com/c-glp-dm-redirect" is a RELATIVE PATH, so the browser resolves it
 *      against the host it is already on and you get
 *      currenthost.com/yourbrand.com/c-glp-dm-redirect. The scheme is added here.
 *
 *   2. AN UNFILLED CV MUST NOT PRODUCE A DEAD LINK. On the snapshot this CV holds its own
 *      instruction text, which is correct (CLAUDE.md, Account TYPES). The markup already
 *      carries a DOCUMENT-relative href and this only ever upgrades it, so an unfilled CV
 *      simply leaves the working fallback in place.
 *
 * Document-relative is the safe fallback because GHL serves a step at {domain}/{step-slug}
 * with no trailing slash and does not redirect to add one, so it resolves identically to the
 * root-relative form when a domain is connected, and still resolves when one is not.
 * Measured 2026-09-18, recorded in NOTES §Linking to another funnel STEP.
 *
 * ⚠️ GHL injects blocks with innerHTML, which does not execute <script>, so appending the
 * shared engine from here is the only route it has onto the page. The hrefs are resolved
 * BEFORE that append, because confirm.js's route wiring reads them and drops any route whose
 * href is empty.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  var root = document.querySelector(".sk-conf-ctvglp");

  if (root && !root.dataset.skStepsBooted) {
    root.dataset.skStepsBooted = "1";

    /* Empty, still-unsubstituted, and the snapshot's "Enter your..." instruction all count as
       NOT filled. Same guard the Nueva confirmation and the links hub use. */
    function cv(key) {
      var v = (root.getAttribute("data-cv-" + key) || "").trim();
      if (!v || v.indexOf("{") !== -1 || /^(paste|enter|add)\b/i.test(v)) return "";
      return v;
    }

    var domain = cv("conectiv__main_url");
    if (domain) {
      /* Trim a scheme if the buyer pasted one anyway, and any trailing slash, so the join
         below cannot produce "https://https://x" or "x//slug". */
      var host = domain.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
      var links = root.querySelectorAll("[data-sk-step]");
      for (var i = 0; i < links.length; i++) {
        var slug = (links[i].getAttribute("data-sk-step") || "").replace(/^\/+/, "");
        if (slug) links[i].setAttribute("href", "https://" + host + "/" + slug);
      }
    }
    /* No else: the markup already carries the document-relative href, so an unfilled CV
       simply leaves the working fallback in place. */

    /* THE PAGE-LEVEL TEXT LINE GOES AWAY ENTIRELY WHEN THERE IS NO NUMBER. confirm.js would
       otherwise leave it reading "Prefer to text? Text INFO now" with nothing to text, which
       is worse than not offering it. Decided from the CV here rather than by inspecting what
       confirm.js did, so there is no ordering dependency between the two files. */
    if (!cv("conectiv__your_phone")) {
      var line = root.querySelector(".sk-conf-ctvglp-textline");
      if (line && line.parentNode) line.parentNode.removeChild(line);
    }
  }

  ["_shared/confirm/v1/confirm.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();
