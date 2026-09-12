/* nueva / n-free-revive-sample-funnel / n-revive-sample-redirect-sms
 *
 * The SMS hand-off step. The PAGEVIEW is the point (it is what the rep-notification workflow
 * triggers on), so nothing here may prevent the page from loading normally. The hand-off is
 * strictly an enhancement layered on top of markup that already works with JS off.
 *
 * THE NUMBER NORMALISATION IS LIFTED FROM THE SIBLING CONFIRMED BLOCK, deliberately, because
 * both pages print the same CV and the two must not disagree about what a valid number is:
 *
 *   1. THE CV IS A HUMAN-FORMATTED STRING AND AN sms: URI IS NOT. nueva_rep_phone is filled by
 *      hand at onboarding, so it arrives as "(555) 123-4567" or with a stray space. Spaces and
 *      parens inside the URI are where prefill quietly stops working on some handsets.
 *   2. ON A SNAPSHOT THE CV IS INSTRUCTION TEXT, NOT A NUMBER. It holds "Enter the mobile number
 *      your lead notifications should text..." until a buyer fills it, which is CORRECT for a
 *      snapshot account (CLAUDE.md, Account TYPES). So the page has to stay legible with no
 *      number at all rather than render "sms:Enter the mobile number" and a dead button.
 *
 * WHY THE AUTO HAND-OFF IS GUARDED THE WAY IT IS
 *   - Touch only. On a desktop `location.href = "sms:..."` opens nothing, and firing it anyway
 *     risks a protocol-handler prompt for an app the visitor does not have.
 *   - Once per pageview, and never on a bfcache restore. Coming BACK from Messages must not
 *     bounce straight back out to Messages, which is an inescapable loop on iOS.
 *   - After a short delay, so the page has painted. If the hand-off is suppressed (Safari can
 *     refuse a protocol navigation with no user gesture) the visitor is looking at a page that
 *     already shows the number and the button, not at a blank screen.
 *   - ?noauto=1 disables it, for QA on a phone without being thrown into Messages every load.
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

  var root = document.querySelector(".sk-prod-nva-revivesms");
  if (!root) return;
  var cta = root.querySelector("[data-sms-cta]");
  var status = root.querySelector("[data-sms-status]");
  var print = root.querySelector("[data-rep-phone-print]");
  var copyBtn = root.querySelector("[data-sms-copy]");
  if (!cta) return;

  var slot = cta.querySelector("[data-rep-phone]");
  var raw = (slot ? slot.textContent : "").trim();

  /* ⚠️ VALIDATE THAT THE VALUE *IS* A NUMBER, NEVER THAT IT *CONTAINS* ONE.
   *
   * The obvious implementation, `raw.replace(/[^\d+]/g, "")`, is what shipped first and it is
   * wrong in the exact state this page spends most of its life in. On a snapshot account
   * nueva_rep_phone holds its instruction sentence, and that sentence ENDS IN AN EXAMPLE NUMBER:
   *
   *   "Enter the mobile number your lead notifications should text, in the format +15551234567."
   *
   * Stripping non-digits out of that prose yields 11 digits beginning with 1, which every
   * length check below would have accepted. The page then rendered a confident, correctly
   * formatted sms: link to a number belonging to nobody, with no error anywhere. Measured on the
   * live page 2026-09-12. A dead button is a visible failure; a plausible wrong number is not.
   *
   * So: any LETTER means this is prose, not a phone number, and the value is rejected outright.
   * That also rejects "555-123-4567 ext 2", correctly. An sms: URI cannot carry an extension,
   * and the digit-strip reading of it produced "+55512345672", a different number entirely.
   */
  var looksLikePhone = raw !== "" && !/[A-Za-z]/.test(raw) && /^\+?[\d\s().-]+$/.test(raw);
  var nums = looksLikePhone ? raw.replace(/\D/g, "") : "";
  var plus = looksLikePhone && raw.charAt(0) === "+";

  // 10 digits is the bare US number, 11 starting with 1 is the same number with its country
  // code. Anything else is left alone rather than guessed at: a wrong normalisation sends the
  // text to nobody, which is worse than an unformatted one the handset can still parse.
  var e164 = plus ? "+" + nums
    : nums.length === 10 ? "+1" + nums
    : nums.length === 11 && nums.charAt(0) === "1" ? "+" + nums
    : nums;

  /* ── no usable number: say the ask without it, and stop ──────────────────────────────── */
  if (nums.length < 10) {
    var label = cta.querySelector("[data-sms-label]");
    if (label) label.textContent = "Text SAMPLE now";
    cta.removeAttribute("href");
    cta.setAttribute("role", "text");
    // The card would otherwise print the whole instruction sentence where a number belongs.
    if (print) print.textContent = "Number not set yet";
    return;
  }

  var href = "sms:" + e164 + "?&body=SAMPLE";
  cta.setAttribute("href", href);
  if (print) print.textContent = e164;

  /* ── copy fallback: only offered where it can actually work ──────────────────────────── */
  if (copyBtn && navigator.clipboard && navigator.clipboard.writeText) {
    copyBtn.hidden = false;
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(e164).then(function () {
        var was = copyBtn.textContent;
        copyBtn.textContent = "Copied";
        setTimeout(function () { copyBtn.textContent = was; }, 2000);
      }, function () {
        // Clipboard can reject on a permissions policy even where the API exists. Say so
        // rather than leaving the button looking like it worked.
        copyBtn.textContent = "Select the number above to copy";
      });
    });
  }

  /* ── the hand-off ────────────────────────────────────────────────────────────────────── */
  var params = new URLSearchParams(window.location.search);
  if (params.get("noauto") === "1") return;

  // matchMedia is the reliable read for "this is a touch device". Checking for ontouchstart
  // alone reports true on touch-capable laptops, which have no messaging app.
  var touch = window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (!touch) return;

  var fired = false;
  function handoff() {
    if (fired) return;
    fired = true;
    if (status) status.textContent = "Opening your messaging app.";
    window.location.href = href;
  }

  // A bfcache restore means they came BACK from Messages. Firing again would send them
  // straight out, with no way to return to this page.
  window.addEventListener("pageshow", function (e) { if (e.persisted) fired = true; });
  // If they return by any other route the tab becomes visible again; same reasoning.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") fired = true;
  });

  setTimeout(handoff, 700);
})();
