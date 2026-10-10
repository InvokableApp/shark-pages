/* glp/glp-free-ignyt-sample/ignyt-sample-confirmation-reel — prints the rep's number the way people write it.
 * The platform fills rep_phone as +16095551234 (setup's {phone_e164}); a US number reads (609) 555-1234 in the words and
 * on the buttons. The sms: links keep the +1 form, which every phone dials. Anything that isn't a US number is left as is. */
(function () {
  [].forEach.call(document.querySelectorAll("[data-rep-phone]"), function (el) {
    var d = el.textContent.replace(/\D/g, "");
    if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
    if (d.length === 10) el.textContent = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  });
})();
