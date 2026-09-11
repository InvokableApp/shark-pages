/* nueva/n-teen-hydration/n-teen-hydration
   Every CTA on this lander opens the page's native popup, which holds the survey.

   ⚠️ NO POPUP ID AND NO NATIVE BUTTON. GHL registers a window-level listener per popup component
   and a NO-ARGUMENT emit resolves to popupList[0], so a page with exactly one popup needs neither.
   That matters more than it looks: `hl_main_popup-<random>` is minted per page, so a hardcoded id
   works on the page it was copied from and silently does nothing everywhere else, including in
   every buyer account the snapshot lands in. → NOTES §Custom-code block → open the page POPUP

   ⚠️ ONE POPUP PER PAGE IS THEREFORE A CONSTRAINT, NOT A PREFERENCE. Add a second and popupList[0]
   is whichever one GHL happens to order first.

   ⚠️ THE BLOCK RENDERS INLINE, NOT IN AN IFRAME (custom code shares the page scope), which is why
   this can reach `window` at all. It also means anything unscoped here leaks into the rest of the
   page, so the listener is bound to elements inside this block only. */
(function () {
  var root = document.currentScript && document.currentScript.closest
    ? document.currentScript.closest(".sk-teen") : null;
  var scope = root || document;
  var open = function (e) {
    e.preventDefault();
    window.dispatchEvent(new Event("customWidgetOpenPopup"));
  };
  var btns = scope.querySelectorAll("[data-sk-popup]");
  for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", open);
})();
