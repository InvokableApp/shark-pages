/* mlm/mlm-recovery-bar/mlm-recovery-bar-drop: open this season's drop. */
(function () {
  function rbSeason(d){var m=(d.getMonth()+1)*100+d.getDate();return (m>=1115||m<=229)?"winter":m<=531?"spring":m<=831?"summer":"fall";}
  location.replace("/mlm-recovery-bar-" + rbSeason(new Date()) + location.search);
})();
