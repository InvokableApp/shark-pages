(function () {
  var root = document.querySelector(".sk-glp-zz-probe-cv-probe");
  if (!root) return;
  var socket = document.querySelector("[data-shark-block]");
  var names = [].slice.call(socket.attributes)
    .filter(function (a) { return a.name.indexOf("data-cv-") === 0; })
    .map(function (a) { return a.name.replace("data-cv-", ""); });
  root.querySelector("[data-attrs]").textContent = names.length + " (" + names.slice(0, 4).join(", ") + " …)";
  root.querySelector("[data-has]").textContent =
    socket.getAttribute("data-cv-affiliate_link") === null ? "NO — attribute absent" : "yes";
})();
