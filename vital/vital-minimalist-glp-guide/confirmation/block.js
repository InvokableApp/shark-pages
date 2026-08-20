/* Vital / Minimalist GLP Guide / Confirmation
   The treats CTA opens the page's own GHL popup, which holds the SMS opt-in form.
   `customWidgetOpenPopup` takes no argument, so nothing here is account-specific
   and the block survives a snapshot install unchanged (HOSTED-BLOCKS-SOP §7).
   Constraint that comes with it: this page must carry exactly ONE popup, because a
   no-id emit resolves to popupList[0]. */
(function () {
  var root = document.querySelector(".sk-vital-vital-minimalist-glp-guide-confirmation[data-sk-treats]");
  if (!root || root.dataset.skWired) return;
  root.dataset.skWired = "1";

  var btn = root.querySelector("[data-sk-open-treats]");
  if (!btn) return;

  btn.addEventListener("click", function () {
    window.dispatchEvent(new Event("customWidgetOpenPopup"));
  });

  // The popup form posts and then closes; GHL does not emit a "submitted" event we
  // can bind to, so reflect success off the form-submit message the iframe posts up.
  window.addEventListener("message", function (e) {
    var d = e && e.data;
    var type = typeof d === "string" ? d : (d && (d.type || d.event));
    if (!type || String(type).toLowerCase().indexOf("submit") === -1) return;
    btn.textContent = "You are on the list";
    btn.setAttribute("data-sk-done", "1");
    btn.disabled = true;
  });
})();
