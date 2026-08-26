/* beneve / beneve-hormone-lunchbox-guide / beneve-hormone-lunchbox
 * Loader stub. Behaviour lives in _shared/capture/capture.js, shared by every capture page.
 * A hosted block is injected with innerHTML, so a <script src> inside the markup never executes:
 * the script has to be appended from here.
 */
(function () {
  var s = document.createElement("script");
  s.src = "https://invokableapp.github.io/shark-pages/_shared/capture/capture.js";
  s.defer = true;
  document.body.appendChild(s);
})();
