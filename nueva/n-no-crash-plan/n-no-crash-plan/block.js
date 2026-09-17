/* nueva/n-no-crash-plan/n-no-crash-plan
 * Loader stub. Behaviour lives in _shared/capture/v1/capture.js, shared by every capture page:
 * the mobile CTA bar, the scroll reveal, and the popup open that every [data-sk-open] button
 * on this page depends on.
 *
 * A hosted block is injected with innerHTML, so a <script src> inside the markup never executes.
 * The script has to be appended from here.
 *
 * This page overrides the shared HERO LAYOUT in its own block.css and nothing else, so the
 * shared engine works here exactly as it does on every other opt-in.
 */
(function () {
  var s = document.createElement("script");
  s.src = "https://invokableapp.github.io/shark-pages/_shared/capture/v1/capture.js";
  s.defer = true;
  document.body.appendChild(s);
})();
