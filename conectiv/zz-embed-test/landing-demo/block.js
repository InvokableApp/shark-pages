/* No placeholder fallbacks. Every value on this page comes from a real CONECTIV
   custom value, handed in by the socket's data-cv-* attributes. An empty custom
   value renders empty, which is the correct state on a snapshot account.

   The only thing this does is derive the avatar's single initial from the first
   name, which is presentation, not invented data. */
(function () {
  var root = document.querySelector(".sk-conectiv-zz-embed-test-landing-demo");
  if (!root) return;

  var av = root.querySelector(".ld-avatar");
  if (av) av.textContent = (av.textContent || "").trim().charAt(0);
})();
