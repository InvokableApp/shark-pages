/* glp / glp-natural-foods-guide / glp-food-guide-confirmation
 *
 * Loads the shared confirmation engine, and before it, resolves this page's step links onto
 * the buyer's own domain.
 *
 * ── WHY THE STEP LINKS ARE BUILT HERE ────────────────────────────────────────────────────
 * Jeff, 2026-09-18: "we can use {{custom_values.your_email_designated_domain}} < its the same
 * call, it will call their default domain."
 *
 * So a step link is {domain}/{step-slug}. Two things make that more than a string join:
 *
 *   1. THE CV HOLDS A BARE DOMAIN, NOT A URL. GLP's convention is domain with no scheme (its
 *      sibling CV says so in its own instruction text: "with no https://"). An href of
 *      "yourdomain.com/glp-food-guide-dm-redirect" is a RELATIVE PATH, so the browser
 *      resolves it against the current host and you get
 *      currenthost.com/yourdomain.com/glp-food-guide-dm-redirect. The scheme is added
 *      here, exactly as the Nueva confirmation does for its PDF custom value.
 *
 *   2. AN UNFILLED CV MUST NOT PRODUCE A DEAD LINK. On the snapshot this CV holds "Enter the
 *      domain you set up as your GHL email designated domain." (CLAUDE.md, Account TYPES:
 *      that is correct, not a defect). Rather than ship a link to a sentence, the href FALLS
 *      BACK to the document-relative form, which is what this page shipped with and which is
 *      measured to work.
 *
 * ── THE MEASUREMENT BEHIND THE FALLBACK ──────────────────────────────────────────────────
 * Read on a live buyer page, 2026-09-18:
 *
 *     page                       https://{domain}/glp-food-guide-confirmation
 *     trailing slash             false, and GHL does not redirect to add one
 *     "glp-food-guide-product"   -> https://{domain}/glp-food-guide-product
 *     "/glp-food-guide-product"  -> https://{domain}/glp-food-guide-product
 *
 * With a domain connected, document-relative and root-relative land on the SAME url. Without
 * one, root-relative 404s and document-relative still resolves. So document-relative is the
 * safe fallback, and the absolute form is the deliberate upgrade when the CV is filled.
 *
 * ⚠️ NOTES §"Linking to another funnel STEP" says to use {{custom_values.domain}}/slug. That
 *    entry was written for VITAL in July 2026, before the document-relative form was in use,
 *    and it does not mention that a bare-domain CV needs its scheme added. Both corrections
 *    are recorded there now.
 *
 * ⚠️ GHL injects blocks with innerHTML, which does not execute <script>, so appending the
 * shared engine from here is the only route it has onto the page. The hrefs are resolved
 * BEFORE that append, because confirm.js's route wiring reads them and drops any route whose
 * href is empty.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  var root = document.querySelector(".sk-conf-glpf");

  if (root && !root.dataset.skStepsBooted) {
    root.dataset.skStepsBooted = "1";

    /* Empty, still-unsubstituted, and the snapshot's "Enter your..." instruction all count as
       NOT filled. Same guard the Nueva confirmation and the links hub use. */
    function cv(key) {
      var v = (root.getAttribute("data-cv-" + key) || "").trim();
      if (!v || v.indexOf("{") !== -1 || /^(paste|enter|add)\b/i.test(v)) return "";
      return v;
    }

    var domain = cv("your_email_designated_domain");
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
    if (!cv("rep_phone")) {
      var line = root.querySelector(".sk-conf-glpf-textline");
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
