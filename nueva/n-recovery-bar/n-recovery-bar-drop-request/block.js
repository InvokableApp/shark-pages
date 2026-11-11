/* nueva/n-recovery-bar/n-recovery-bar-drop-request: the season, from the visitor's date (see the confirmation reel). */
(function () {
  function rbSeason(d){var m=(d.getMonth()+1)*100+d.getDate();return (m>=1115||m<=229)?"winter":m<=531?"spring":m<=831?"summer":"fall";}
  var el = document.querySelector(".rl-rb"); if (!el) return;
  el.className = el.className.replace(/\brb-s-\w+/, "") + " rb-s-" + rbSeason(new Date());
})();
