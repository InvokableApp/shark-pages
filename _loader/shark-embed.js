/* shark-embed.js — the universal loader.
 *
 * Every GHL Custom Code block that uses Pattern A contains the SAME two things:
 * a div naming which block to load, and a script tag pointing here. Nothing else.
 * The markup, styling and behaviour all live in this repo and update on git push.
 *
 *   <div data-shark-block="conectiv/c-investment-options-guide/results"
 *        data-cv-conectiv__your_full_name="{{custom_values.conectiv__your_full_name}}"></div>
 *   <script src="https://invokableapp.github.io/shark-pages/_loader/shark-embed.js"></script>
 *
 * The path IS the address: {system}/{funnel}/{page}. Every block folder holds the
 * same three filenames, so nothing has to be guessed. It loads, in order:
 *   _brand/{system}/tokens.css      (if present)
 *   {system}/{funnel}/{page}/block.css
 *   {system}/{funnel}/{page}/block.html   merge fields filled from the stub's data-cv-*
 *   {system}/{funnel}/{page}/block.js     (if present)
 *
 * The same source files serve Pattern B, where they are compiled into GHL instead.
 * One source, two delivery modes.
 *
 * ── PAINT ORDER (added 2026-09-04, fixes the flash of unstyled content) ───────────
 * The markup used to be injected as soon as block.html resolved, with no regard for
 * whether the CSS had arrived. On the IGNYT opt-in that put a 27,865px unstyled stack
 * on screen for ~250ms before block.css collapsed it to its real 6,400px. Three things
 * caused it and all three are handled here:
 *
 *   1. block.css reaches its shared component through `@import`, which browsers resolve
 *      SERIALLY: block.css must download and parse before _shared/<x>/v1/*.css is even
 *      requested. 106 of 117 blocks do this. Rather than edit 106 files, the loader now
 *      reads block.css as text (a cache hit alongside the <link>) purely to discover its
 *      @import URLs, and injects each as a parallel <link> so the chain is flattened.
 *      block.css itself stays a <link>, so relative url() in it still resolves — 112
 *      blocks rely on that, which is why the CSS is not inlined into a <style>.
 *   2. Injection now WAITS for the stylesheets, so markup can never paint before the
 *      rules that lay it out.
 *   3. The socket is held at opacity 0 from before first paint and faded in when ready,
 *      so the block appears rather than pops. REVEAL_MS is a failsafe: if a stylesheet
 *      404s or the network stalls, the content is shown anyway. Never leave it invisible.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  var MERGE = /\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/gi;
  // Matches the whole at-rule INCLUDING any media conditions and the terminating
  // semicolon. Dropping the semicolon with it is not cosmetic: a stray top-level ";"
  // is consumed as the prelude of the NEXT qualified rule, which then fails to parse
  // and is discarded. Leaving it silently ate each block's opening token declaration.
  var IMPORT = /@import\s+(?:url\(\s*(["']?)([^"')]+)\1\s*\)|(["'])([^"']+)\3)[^;]*;/gi;
  var REVEAL_MS = 3000; // failsafe: never hold the block hidden longer than this

  // Fonts arrive last and from a cold origin (they sit behind the @import chain, so the
  // browser cannot discover them early). Warming the connection cuts the reflow when
  // display=swap finally trades the fallback face for the real one.
  function preconnect(href) {
    var l = document.createElement("link");
    l.rel = "preconnect";
    l.href = href;
    l.crossOrigin = "anonymous";
    document.head.appendChild(l);
  }

  // Resolves when the sheet AND its @imports have loaded. A 404 resolves too rather than
  // rejecting: a missing _brand/<system>/tokens.css is normal and must not block paint.
  function addCss(href, key) {
    var existing = document.querySelector('link[data-shark="' + key + '"]');
    if (existing) return existing.__shark || Promise.resolve();
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    l.setAttribute("data-shark", key);
    var done = new Promise(function (resolve) {
      l.onload = resolve;
      l.onerror = resolve;
    });
    l.__shark = done;
    document.head.appendChild(l);
    return done;
  }

  function addJs(src, key) {
    if (document.querySelector('script[data-shark="' + key + '"]')) return;
    var s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.setAttribute("data-shark", key);
    document.body.appendChild(s);
  }

  function reveal(el) {
    if (el.__shown) return;
    el.__shown = true;
    el.style.transition = "opacity .18s ease-out";
    el.style.opacity = "1";
  }

  // block.css is fetched ONCE, as text, and installed as a <style>. Two reasons:
  //
  //   - Its `@import`s are hoisted out and injected as parallel <link>s first. Browsers
  //     resolve @import serially (block.css must download AND parse before the shared
  //     component sheet is even requested), and 106 of 117 blocks reach their component
  //     that way. Hoisting turns one serial hop into a parallel one. The links go in
  //     BEFORE the <style> so cascade order still matches @import-at-the-top semantics.
  //   - Installing the remainder as a <style> costs no second round trip, where adding a
  //     <link> for the same file would.
  //
  // The cost of a <style> is that relative url() no longer resolves against the CSS file.
  // Only the literal "assets/" form is used in practice, and it is rewritten here exactly
  // as the HTML path below rewrites it. Absolute URLs and data: URIs are left alone.
  function installCss(cssHref, dir) {
    return fetch(cssHref)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status + " for block.css");
        return r.text();
      })
      .then(function (css) {
        var jobs = [];
        IMPORT.lastIndex = 0;
        css.replace(IMPORT, function (_m, _q, u1, _q2, u2) {
          var u = (u1 || u2 || "").trim();
          if (!u) return "";
          if (!/^data:/i.test(u)) {
            var abs = /^https?:\/\/|^\/\//i.test(u) ? u : new URL(u, dir).href;
            var job = addCss(abs, "imp-" + abs);
            // Font sheets are requested now but NOT waited on. The gate exists to stop
            // markup painting before the rules that lay it out, and a font sheet lays
            // nothing out: it is loaded display=swap, so the face arrives late and swaps
            // whether we block here or not. Waiting only adds a cold cross-origin round
            // trip to fonts.googleapis.com before anything is on screen.
            if (!/fonts\.googleapis\.com/i.test(abs)) jobs.push(job);
          }
          return "";
        });

        var body = css.replace(IMPORT, "").replace(/url\((["']?)assets\//g, "url($1" + dir + "assets/");

        // Wait for the imported sheets before installing ours, so the whole block's
        // styling lands in one frame rather than in two visibly different ones.
        return Promise.all(jobs).then(function () {
          var st = document.createElement("style");
          st.setAttribute("data-shark", cssHref);
          st.textContent = body;
          document.head.appendChild(st);
        });
      })
      // A stylesheet that will not load must not cost the visitor the CONTENT. Resolving
      // here lets the markup inject unstyled, which is what the old loader did on every
      // load and is still far better than a blank section.
      .catch(function (e) {
        if (window.console) console.error("[shark-embed] css " + cssHref + ": " + e.message);
      });
  }

  function load(el) {
    var path = (el.getAttribute("data-shark-block") || "").replace(/^\/|\/$/g, "");
    if (!path) return;
    var system = path.split("/")[0];
    var dir = BASE + path + "/";
    var cssHref = dir + "block.css";

    // Defensive: hideEarly() only sees sockets parsed before its script tag ran, so a
    // socket that appears after the last loader tag is hidden here instead.
    if (!el.__shown) el.style.opacity = "0";

    // Failsafe first, so no code path below can strand the block invisible.
    setTimeout(function () { reveal(el); }, REVEAL_MS);

    var cssReady = Promise.all([
      addCss(BASE + "_brand/" + system + "/tokens.css", "tokens-" + system),
      installCss(cssHref, dir),
    ]);

    // block.html and the block.js probe both start NOW, in parallel with the CSS, rather
    // than the probe waiting on the injection as it used to.
    var htmlReq = fetch(dir + "block.html", { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status + " for block.html");
      return r.text();
    });
    var jsReq = fetch(dir + "block.js", { method: "HEAD" })
      .then(function (r) { return r.ok; })
      .catch(function () { return false; });

    Promise.all([htmlReq, cssReady])
      .then(function (out) {
        var html = out[0];
        // strip source comments, then fill merge fields from the stub's data attributes.
        // GHL already substituted those attribute values server-side, so real custom
        // values arrive here even though GHL never saw this markup.
        html = html.replace(/<!--[\s\S]*?-->/g, "");
        html = html.replace(MERGE, function (_m, key) {
          var v = el.getAttribute("data-cv-" + key.toLowerCase());
          return v === null ? "" : v;
        });
        // Resolve the block's own assets/ folder against Pages. The markup is injected
        // into a GHL page, so a bare src="assets/x.webp" would resolve against the GHL
        // domain and 404. Only the literal "assets/" prefix is rewritten, so absolute
        // URLs and every other path are left exactly as authored.
        html = html.replace(/(\s(?:src|href|poster)=["'])assets\//g, "$1" + dir + "assets/");
        html = html.replace(/url\((["']?)assets\//g, "url($1" + dir + "assets/");

        el.innerHTML = html;
        reveal(el);

        // scripts inserted via innerHTML never execute, so load the block's JS properly
        return jsReq.then(function (ok) {
          if (ok) addJs(dir + "block.js", path + "-js");
        });
      })
      .catch(function (e) {
        reveal(el); // a broken block must still show whatever it has, never a blank page
        if (window.console) console.error("[shark-embed] " + path + ": " + e.message);
      });
  }

  function run() {
    var nodes = document.querySelectorAll("[data-shark-block]");
    for (var i = 0; i < nodes.length; i++) load(nodes[i]);
  }

  // Hide the sockets synchronously, before the parser can paint anything inside them.
  // This runs at script-execution time (the tag is parser-blocking and sits directly
  // after the div), which is why it is not deferred to DOMContentLoaded like run().
  (function hideEarly() {
    var nodes = document.querySelectorAll("[data-shark-block]");
    for (var i = 0; i < nodes.length; i++) nodes[i].style.opacity = "0";
  })();

  preconnect("https://fonts.googleapis.com");
  preconnect("https://fonts.gstatic.com");

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
