/* glp / glp-ignyt-info / ignyt-info-confirmation
 *
 * Loads the shared product-page engine for its scroll reveals, and hardens the page's one
 * scripted control: the OPTIONAL "Questions? Text me" sms: link (no pre-typed word).
 *
 * rep_phone is typed by hand at onboarding ("(555) 123-4567", stray spaces), and spaces and
 * parens inside an sms: URI are where some handsets stop working, so the number is normalised
 * to E.164. On a snapshot the custom value is instruction text with no usable number: the link
 * then goes inert instead of pointing nowhere, and the label still reads as text.
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
  var raw = slot ? slot.textContent : "";
  var digits = raw.replace(/[^\d+]/g, "");
  var plus = digits.charAt(0) === "+";
  var nums = digits.replace(/\D/g, "");

  // 10 digits is the bare US number, 11 starting with 1 is the same number with its country
  // code. Anything else is left alone rather than guessed at: a wrong normalisation sends
  // the text to nobody, which is worse than an unformatted one that the handset can still parse.
  var e164 = plus ? "+" + nums
    : nums.length === 10 ? "+1" + nums
    : nums.length === 11 && nums.charAt(0) === "1" ? "+" + nums
    : nums;

  if (nums.length < 10) {
    // unresolved merge field, or an operator typo: no link rather than a dead one.
    cta.removeAttribute("href");
    cta.setAttribute("role", "text");
    return;
  }

  cta.setAttribute("href", "sms:" + e164);
})();
