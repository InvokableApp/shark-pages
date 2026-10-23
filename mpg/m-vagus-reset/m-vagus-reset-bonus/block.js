/* mpg/m-vagus-reset/m-vagus-reset-bonus: the rep's number in "text HOPS to ..." (see block.html). The same check as the
 * confirmation's popup: anything with a letter in it is the setup sentence, not a number, and then the paragraph leaves
 * the page. A phone gets a tap-to-text link with HOPS filled in; a computer gets the number as words. */
(function () {
  var num = document.querySelector("[data-cf-num]"), para = document.querySelector("[data-cf-sms]");
  if (!num) return;
  var raw = num.textContent.trim();
  var ok = raw !== "" && !/[A-Za-z{}]/.test(raw) && /^\+?[\d\s().-]+$/.test(raw);
  var d = ok ? raw.replace(/\D/g, "") : "";
  var e164 = raw.charAt(0) === "+" ? "+" + d : d.length === 10 ? "+1" + d : d.length === 11 && d.charAt(0) === "1" ? "+" + d : d;
  if (d.length < 10) { if (para) para.remove(); return; }
  var us = /^\+1\d{10}$/.test(e164) ? e164.slice(2) : "";
  num.textContent = us ? "(" + us.slice(0, 3) + ") " + us.slice(3, 6) + "-" + us.slice(6) : e164;
  if (window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches) num.setAttribute("href", "sms:" + e164 + "?&body=" + encodeURIComponent(num.getAttribute("data-word") || ""));
  else { num.removeAttribute("href"); num.classList.add("cf-num-plain"); }
})();
