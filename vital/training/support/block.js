/* vital/training/support — behaviour is shared, see _shared/training/training.js */
(function () {
  if (window.SharkTraining) {
    document.querySelectorAll(".sk-train:not([data-mounted])").forEach(window.SharkTraining);
    return;
  }
  var s = document.createElement("script");
  s.src = "https://invokableapp.github.io/shark-pages/_shared/training/training.js";
  s.onload = function () {
    document.querySelectorAll(".sk-train:not([data-mounted])").forEach(window.SharkTraining);
  };
  document.head.appendChild(s);
})();
