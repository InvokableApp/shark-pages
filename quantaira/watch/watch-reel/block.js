/* WATCH IT LATER (Jeff, 2026-11-04: MPG's button on Quantaira's launch webinar, "a user can choose when to watch it"):
   the lead picks a day and time (tomorrow 7pm to start) and gets a calendar event for it, linking back to /webinar.
   Android: Google Calendar's filled-in add-event page; an iPhone or a computer: the server's calendar file (/_cal,
   platform server.mjs), which an iPhone opens as Apple's Add to Calendar. The words are the page's ({{words.later_*}}).
   The same file sits in webinar/ and watch-reel/: change both. */
(function () {
  var dlg = document.querySelector("dialog[data-later]");
  if (!dlg || !dlg.showModal) return;
  var at = dlg.querySelector(".qp-later-at");
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var local = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  var z = function (d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
  document.querySelectorAll("[data-later-open]").forEach(function (b) {
    b.addEventListener("click", function () {
      var d = new Date(); d.setDate(d.getDate() + 1); d.setHours(19, 0, 0, 0);
      at.value = local(d); at.min = local(new Date());
      dlg.showModal();
    });
  });
  dlg.querySelector(".qp-later-add").addEventListener("click", function () {
    var start = at.value ? new Date(at.value) : null;
    if (!start || isNaN(start.getTime())) { at.focus(); return; }
    var mins = 75, end = new Date(start.getTime() + mins * 60000);   // the webinar runs 1:00:33
    var title = dlg.getAttribute("data-title"), note = dlg.getAttribute("data-note"), back = "/webinar";
    dlg.close();
    if (/Android/i.test(navigator.userAgent)) {
      location.href = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(title) + "&dates=" + z(start) + "/" + z(end) +
        "&details=" + encodeURIComponent(note + " " + location.origin + back);
      return;
    }
    location.href = "/_cal?t=" + encodeURIComponent(title) + "&s=" + z(start) + "&m=" + mins + "&p=" + encodeURIComponent(back) + "&n=" + encodeURIComponent(note);
  });
})();
