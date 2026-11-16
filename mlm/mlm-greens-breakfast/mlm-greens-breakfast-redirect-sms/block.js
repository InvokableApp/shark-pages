/* mlm/mlm-greens-breakfast/mlm-greens-breakfast-redirect-sms (Marketing Shark | MLM). Built from the Greens at Breakfast reel pages. */
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

  var root = document.querySelector(".sk-prod-mlm-gbsms");
  if (!root) return;
  var cta = root.querySelector("[data-sms-cta]");
  var status = root.querySelector("[data-sms-status]");
  var print = root.querySelector("[data-rep-phone-print]");
  var copyBtn = root.querySelector("[data-sms-copy]");
  if (!cta) return;

  var slot = cta.querySelector("[data-rep-phone]");
  var raw = (slot ? slot.textContent : "").trim();

  
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

  
  if (nums.length < 10) {
    var label = cta.querySelector("[data-sms-label]");
    if (label) label.textContent = "Text GREENS now";
    cta.removeAttribute("href");
    cta.setAttribute("role", "text");
    // The card would otherwise print the whole instruction sentence where a number belongs.
    if (print) print.textContent = "Number not set yet";
    return;
  }

  var href = "sms:" + e164 + "?&body=GREENS";   // the word the page asks for (the campaign's comment word)
  cta.setAttribute("href", href);
  if (print) print.textContent = e164;

  
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
