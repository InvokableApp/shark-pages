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

/* ── "Working out their number" ────────────────────────────────────────────────────────────
   Jeff, 2026-09-11: submit sits for a moment before the result page appears, so the visitor gets
   a dead popup and no signal that anything happened.

   ⚠️ THIS CANNOT BE A NATIVE PROCESSING SLIDE. A survey's footer JS does NOT run inside a popup
   embed (QUIZ-FUNNEL-SOP §52, measured on Beneve), which is why the generator's processing slide
   was dropped from this survey in the first place: it would have loaded and never advanced.

   ⚠️ IT CAN BE DONE HERE ONLY BECAUSE THE SURVEY IS NOT IFRAMED. Measured on the live popup: it
   renders inline as <form class="ghl-survey-form"> in the page's own DOM, so this block's script
   can see its slides and its buttons. If GHL ever moves surveys into an iframe this stops working
   silently, and the check below (no form found) is what makes it fail quietly rather than throw.

   ⚠️ THE LISTENER IS ON document, NOT on the block. The survey lives in the POPUP, which is not
   inside .sk-teen, so a scoped listener would never see the click. */
(function () {
  var root = document.querySelector(".sk-teen");
  if (!root) return;

  var ov = document.createElement("div");
  ov.className = "sk-teen-calc";
  ov.setAttribute("aria-live", "polite");
  ov.hidden = true;
  ov.innerHTML =
    '<div class="sk-teen-calc-in">' +
      '<span class="sk-teen-calc-ring" aria-hidden="true"></span>' +
      '<p class="sk-teen-calc-head" data-calc-line>Working out their number</p>' +
      '<p class="sk-teen-calc-sub">This takes a few seconds.</p>' +
    '</div>';
  /* ⚠️ IT HAS TO BE A CHILD OF <body>, NOT OF THE BLOCK. Appending it inside .sk-teen looked
     right and tested green on every property read (hidden:false, lines rotating) while being
     INVISIBLE on screen: GHL's page sections create their own stacking contexts, so a fixed
     child of the block is positioned against the viewport but still painted inside its
     ancestor's layer, underneath the popup. No z-index can climb out of a stacking context.
     ⚠️ AND IT HAS TO CARRY .sk-teen, because this sheet is scoped `.sk-teen .sk-teen-calc`.
     display:contents on the host keeps the wrapper from generating a box of its own. */
  var host = document.createElement("div");
  host.className = "sk-teen sk-teen-calc-host";
  host.appendChild(ov);
  document.body.appendChild(host);

  /* True statements about what the model actually does, in order. A rotation of invented steps
     would be theatre; these are the three terms of the sum on the result page. */
  var LINES = ["Working out their number", "Adding what the sweat costs", "Almost there"];
  var timers = [];
  var clear = function () { timers.forEach(clearTimeout); timers = []; };

  var show = function () {
    var line = ov.querySelector("[data-calc-line]");
    ov.hidden = false;
    clear();
    LINES.slice(1).forEach(function (t, i) {
      timers.push(setTimeout(function () { line.textContent = t; }, (i + 1) * 1800));
    });
    /* ⚠️ IT MUST BE ABLE TO GO AWAY AGAIN. If the submit fails validation, or Cloudflare's
       Turnstile challenge blocks it, no navigation happens and a permanent overlay would strand
       the visitor behind a spinner with their answers underneath it. */
    timers.push(setTimeout(hide, 15000));
  };
  var hide = function () { clear(); ov.hidden = true; };

  document.addEventListener("click", function (e) {
    /* ⚠️ TWO CLASS FAMILIES, AND THE POPUP USES THE OTHER ONE (QUIZ-FUNNEL-SOP §102).
       Page-embed and popup render `.ghl-btn.ghl-footer-next` / `.ghl-footer-buttons .ghl-btn`;
       the bare widget renders `.ghl-next-button` / `.ghl-mobile-next`. A probe of the live popup
       showed the widget family, so both are matched: keying on the one I happened to observe is
       how this silently stops firing the day GHL renders the other. */
    var btn = e.target && e.target.closest &&
      e.target.closest(".ghl-next-button, .ghl-mobile-next, .ghl-footer-next, .ghl-footer-buttons .ghl-btn");
    if (!btn) return;
    /* Only the LAST slide submits; every earlier one is a Continue and must not trigger this.
       Found by position rather than by slide number or button label: the slide count changes
       whenever a question is added, and the label is editable in the survey builder. */
    var slides = document.querySelectorAll(".form-builder--wrap-questions");
    if (!slides.length) return;
    if (slides[slides.length - 1].classList.contains("ghl-page-current")) show();
  }, true);

  // Navigation is the success case: keep it up until the browser tears the page down.
  window.addEventListener("pagehide", clear);
})();
