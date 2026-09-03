/* funnelshark / br-private-briefing / br-next-step
 * Loader stub. Behaviour lives in _shared/brief/v1/brief.js, shared by both pages of the
 * briefing funnel. A hosted block is injected with innerHTML, so a <script src> inside the
 * markup never executes: the script has to be appended from here.
 */
(function () {
  var s = document.createElement("script");
  s.src = "https://invokableapp.github.io/shark-pages/_shared/brief/v1/brief.js";
  s.defer = true;
  document.body.appendChild(s);
})();
