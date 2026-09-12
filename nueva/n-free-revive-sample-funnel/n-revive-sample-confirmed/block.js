/* glp / glp-free-ignyt-sample / ignyt-sample-confirmation
 *
 * Loads the shared product-page engine for its scroll reveals, and hardens the one control
 * on the page: the sms: link that opens the visitor's messaging app with the word SAMPLE
 * already typed and the rep's number already in the To field.
 *
 * THE PREFILL IS THE MARKUP, NOT THIS FILE. href="sms:{number}?&body=SAMPLE" is what does
 * the work, and it works with JS off. The `?&` is not a typo: Android wants ?body=, iOS 8+
 * wants &body=, and this shape satisfies both and degrades to a plain compose on anything
 * that ignores the parameter. What no page can do is press send for them.
 *
 * What this file adds is the two things a merge field breaks:
 *
 *   1. THE NUMBER IS A HUMAN-FORMATTED STRING, AND AN sms: URI IS NOT.
 *      rep_phone is filled by hand at onboarding, so it arrives as "(555) 123-4567" or
 *      "555-123-4567 ext 2" or with a stray space. Spaces and parens inside the URI are
 *      where prefill quietly stops working on some handsets. GHL substitutes server-side,
 *      before this runs, so by the time we look the real string is in the DOM and can be
 *      normalised to digits.
 *
 *   2. ON A SNAPSHOT THE CV IS INSTRUCTION TEXT, NOT A NUMBER.
 *      rep_phone holds "Add the phone number they can text and call you at here." until a
 *      buyer fills it, which is correct for a snapshot account (CLAUDE.md, Account TYPES).
 *      Printed inside a pill button that is a whole sentence, so when the value carries no
 *      usable number the label falls back to "Text SAMPLE now" and the button stops
 *      pretending to be a link. Nothing is "fixed" here: the page is just legible in both
 *      the snapshot state and the live state.
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

  var cta = document.querySelector("[data-sms-cta]");
  if (!cta) return;
  var slot = cta.querySelector("[data-rep-phone]");
  var raw = (slot ? slot.textContent : "").trim();

  /* ⚠️ VALIDATE THAT THE VALUE *IS* A NUMBER, NEVER THAT IT *CONTAINS* ONE.
   *
   * This was `raw.replace(/[^\d+]/g, "")` until 2026-09-12, and that is wrong in exactly the
   * state point 2 above describes. The instruction sentence sitting in nueva_rep_phone ENDS IN
   * AN EXAMPLE NUMBER:
   *
   *   "Enter the mobile number your lead notifications should text, in the format +15551234567."
   *
   * Stripping non-digits out of that prose yields 11 digits beginning with 1, so the length
   * checks below accepted it and the page rendered a confident, correctly formatted sms: link
   * to a number belonging to nobody. The fallback that exists precisely to prevent this never
   * ran. Measured on the live sibling Redirect SMS page; this block had the same defect.
   *
   * Any LETTER means prose, not a phone number, so the value is rejected outright. That also
   * correctly rejects "555-123-4567 ext 2", which the old digit-strip turned into
   * "+55512345672", a different number. An sms: URI cannot carry an extension anyway.
   */
  var looksLikePhone = raw !== "" && !/[A-Za-z]/.test(raw) && /^\+?[\d\s().-]+$/.test(raw);
  var nums = looksLikePhone ? raw.replace(/\D/g, "") : "";
  var plus = looksLikePhone && raw.charAt(0) === "+";

  // 10 digits is the bare US number, 11 starting with 1 is the same number with its country
  // code. Anything else is left alone rather than guessed at: a wrong normalisation sends
  // the text to nobody, which is worse than an unformatted one that the handset can still parse.
  var e164 = plus ? "+" + nums
    : nums.length === 10 ? "+1" + nums
    : nums.length === 11 && nums.charAt(0) === "1" ? "+" + nums
    : nums;

  if (nums.length < 10) {
    // unresolved merge field, or an operator typo. Say the ask without the number.
    var label = cta.querySelector("[data-sms-label]");
    if (label) label.textContent = "Text SAMPLE now";
    cta.removeAttribute("href");
    cta.setAttribute("role", "text");
    return;
  }

  cta.setAttribute("href", "sms:" + e164 + "?&body=SAMPLE");
})();
