/* shark-embed.js — the universal loader.
 *
 * Every GHL Custom Code block that uses Pattern A contains the SAME two things:
 * a div naming which block to load, and a script tag pointing here. Nothing else.
 * The markup, styling and behaviour all live in this repo and update on git push.
 *
 *   <div data-shark-block="conectiv/zz-embed-test/landing-demo"
 *        data-cv-conectiv__your_full_name="{{custom_values.conectiv__your_full_name}}"></div>
 *   <script src="https://invokableapp.github.io/shark-pages/_loader/shark-embed.js"></script>
 *
 * For a block at {system}/{funnel}/{step}/{slot} it loads, in order:
 *   _brand/{system}/tokens.css      (if present)
 *   {block}/{slot}.css
 *   {block}/{slot}.html             merge fields filled from the stub's data-cv-* attrs
 *   {block}/{slot}.js               (if present)
 *
 * The same source files serve Pattern B, where they are compiled into GHL instead.
 * One source, two delivery modes.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  var MERGE = /\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/gi;

  function addCss(href, key) {
    if (document.querySelector('link[data-shark="' + key + '"]')) return;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    l.setAttribute("data-shark", key);
    document.head.appendChild(l);
  }

  function addJs(src, key) {
    if (document.querySelector('script[data-shark="' + key + '"]')) return;
    var s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.setAttribute("data-shark", key);
    document.body.appendChild(s);
  }

  function load(el) {
    var path = (el.getAttribute("data-shark-block") || "").replace(/^\/|\/$/g, "");
    if (!path) return;
    var parts = path.split("/");
    var system = parts[0];
    var slot = parts[parts.length - 1];
    var dir = BASE + path + "/";

    addCss(BASE + "_brand/" + system + "/tokens.css", "tokens-" + system);
    addCss(dir + slot + ".css", path + "-css");

    fetch(dir + slot + ".html", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status + " for " + slot + ".html");
        return r.text();
      })
      .then(function (html) {
        // strip source comments, then fill merge fields from the stub's data attributes.
        // GHL already substituted those attribute values server-side, so real custom
        // values arrive here even though GHL never saw this markup.
        html = html.replace(/<!--[\s\S]*?-->/g, "");
        html = html.replace(MERGE, function (_m, key) {
          var v = el.getAttribute("data-cv-" + key.toLowerCase());
          return v === null ? "" : v;
        });
        el.innerHTML = html;

        // scripts inserted via innerHTML never execute, so load the block's JS properly
        return fetch(dir + slot + ".js", { method: "HEAD" }).then(function (r) {
          if (r.ok) addJs(dir + slot + ".js", path + "-js");
        }).catch(function () {});
      })
      .catch(function (e) {
        if (window.console) console.error("[shark-embed] " + path + ": " + e.message);
      });
  }

  function run() {
    var nodes = document.querySelectorAll("[data-shark-block]");
    for (var i = 0; i < nodes.length; i++) load(nodes[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
