/* beneve/beneve-menopause-blueprint/b-menopause-reel: the self-check's count line, and what she ticked handed to the
 * opt-in form. The line follows her count: nothing ticked asks her to check honestly, one or two shows the count, more
 * than two shows Maria's own line from the guide's self-check (Jeff, 2026-10-31: the fixed line read machine-written).
 * The platform's form.js sends window.__pfExtra with the lead (as the side hustle quiz does), and the rep's lead page
 * shows each key under "Here's what they told you", named from the key after its first two words:
 * beneve_mb_ticked_on_the_self_check -> "Ticked on the self check". Nothing ticked sends nothing. */
(function () {
  var box = document.querySelector(".mb-boxes");
  if (!box) return;
  var extra = window.__pfExtra = window.__pfExtra || {};
  var all = [].slice.call(box.querySelectorAll("input[type=checkbox]"));
  var line = box.querySelector(".mb-count");
  box.addEventListener("change", function () {
    var on = all.filter(function (x) { return x.checked; })
      .map(function (x) { return x.parentNode.textContent.replace(/\s+/g, " ").trim().replace(/\.$/, ""); });
    var n = on.length, of = '<b class="mb-n">' + n + "</b> of " + all.length;
    line.innerHTML = !n ? "Check the ones that sound like you. Be honest."
      : n < 3 ? of + " so far."
      : of + ". That's more than two. Your body has something to tell you.";
    if (on.length) {
      extra.beneve_mb_ticked_on_the_self_check = on.join("; ");
      extra.beneve_mb_self_check_score = on.length + " of " + all.length;
    } else {
      delete extra.beneve_mb_ticked_on_the_self_check;
      delete extra.beneve_mb_self_check_score;
    }
  });
})();
