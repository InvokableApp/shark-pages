(function () {
  "use strict";
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-sk-open-popup]");
    if (!t) return;
    e.preventDefault();
    window.dispatchEvent(new Event("customWidgetOpenPopup"));
  });
})();
