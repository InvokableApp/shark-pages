/* nueva / n-free-revive-sample-funnel / n-revive-sample-confirmed
 *
 * One job now: the single CTA opens the page's own popup, where the visitor picks text or
 * Facebook Messenger. Each choice in the popup points at its own redirect step, so whichever
 * they pick is a pageview and can carry a rep-notification trigger.
 *
 * THE PHONE PARSING THAT USED TO LIVE HERE IS GONE, on purpose. This page printed the rep's
 * number three times and hard-coded an sms: link, which made it a single-channel SMS ask and
 * outranked the Messenger option before the visitor saw it. The number now lives only on the
 * SMS redirect step, whose whole job is the text. One page owns it, so there is one place for
 * it to be wrong. (That block also carries the fix for the parser bug this one had: the CV
 * holds instruction text CONTAINING an example number, and a digit-strip happily extracted it.
 * See NOTES §Redirect targets.)
 *
 * WHY THE EVENT AND NOT A POPUP ID. GHL's page runtime registers a window-level event API for
 * custom widgets, and it takes NO argument:
 *
 *     window.dispatchEvent(new Event("customWidgetOpenPopup"));
 *
 * Popup ids are `hl_main_popup-<random>`, minted per page and at risk of re-minting on snapshot
 * install, so hardcoding one breaks in every other account. The event resolves to the page's
 * first popup, which is the only popup this page has. NOTES §Custom-code block → open the page
 * POPUP.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/product/v1/product.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });

  var btn = document.querySelector("[data-open-popup]");
  if (!btn) return;

  btn.addEventListener("click", function () {
    // ⚠️ NO SILENT FALLBACK. Sending them to one channel because the popup is missing would
    // quietly delete the other channel and look like it worked, which is the failure nobody
    // notices. If the popup is not on the page, say so loudly and do nothing else.
    if (!document.querySelector('[id^="hl_main_popup-"]')) {
      console.warn(
        "[shark] n-revive-sample-confirmed: no popup on this page, so the CTA has nothing to " +
        "open. Build the popup in the GHL page builder with the two channel buttons:\n" +
        "  text       https://{{custom_values.nueva_main_url}}/n-revive-sample-redirect-sms\n" +
        "  messenger  https://{{custom_values.nueva_main_url}}/n-revive-sample-redirect-dm"
      );
    }
    window.dispatchEvent(new Event("customWidgetOpenPopup"));
  });
})();
