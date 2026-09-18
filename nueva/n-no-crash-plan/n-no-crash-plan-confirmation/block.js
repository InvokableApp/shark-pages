/* nueva/n-no-crash-plan/n-no-crash-plan-confirmation
 *
 * Deliberately almost empty. This page has no form, no popup and no reveal: everything on it is
 * a link, and a link needs no JavaScript. The one job is the desktop `sms:` case.
 *
 * ⚠️ `sms:` HAS NO HANDLER ON MOST DESKTOPS. The SMS redirect step itself prints the rep's
 * number as selectable text, so a desktop visitor who lands there can still read and type it.
 * This only softens the entry: on a device with no touch input the text option says so before
 * the click rather than after it.
 */
(function () {
  var root = document.querySelector(".sk-ew-conf");
  if (!root) return;
  var coarse = window.matchMedia && window.matchMedia("(any-pointer: coarse)").matches;
  if (coarse) return;
  var alt = root.querySelector(".ew-alt a");
  if (alt) alt.textContent = "Or text instead (we will show you the number)";
})();
