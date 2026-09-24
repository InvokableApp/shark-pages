/* Loads the shared product-page engine and nothing else. Every product page ships this exact
 * file: behaviour is shared, so a fix there reaches every page on one push.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/product/v1/product.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();

/* ── the ask modal ─────────────────────────────────────────────────────────────────────
 * Page-local, NOT in _shared/product/v1: that engine is shared by every product page in
 * every system, and this behaviour belongs to one page. A fix here reaches this page only,
 * which is the point.
 *
 * ⚠️ THE DESTINATION IS BUILT HERE BECAUSE IT CANNOT BE WRITTEN IN THE MARKUP. The markup is
 * fetched from GitHub Pages, so GHL never sees it and never substitutes {{custom_values.x}}.
 * The loader fills the data-cv-* attributes on the root; this reads nueva_main_url off there
 * and assembles the redirect URL.
 *
 * ⚠️ AND IT MUST GO THROUGH THE REDIRECT STEP, never straight to Messenger. The step's
 * pageview is the trigger that tags the contact, opens the opportunity card and alerts the
 * rep. A direct messenger.com link would do none of that, and the rep would never know.
 */
(function () {
  var root = document.querySelector('.sk-prod-nva-what');
  if (!root) return;
  var modal = root.querySelector('[data-nva-modal]');
  if (!modal) return;

  /* Same guard the links hub uses: a snapshot ships instruction text in its custom values
     ("Enter YOUR OWN funnel domain..."), and an unsubstituted merge field keeps its braces.
     Either one would assemble a nonsense URL, so the value has to look like a hostname
     before it is trusted. */
  function cv(key) {
    var v = (root.getAttribute('data-cv-' + key) || '').trim();
    if (!v || v.indexOf('{') !== -1 || /^(paste|enter|add)\b/i.test(v)) return '';
    return v;
  }
  var domain = cv('nueva_main_url').replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  var hasDomain = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain);

  var DOORS = {
    product: {
      slug: 'n-what-is-nueva-product-dm-redirect',
      h: 'Send me a message and I will send your link',
      p: 'Tell me what you are after and I will point you at the right products, with the link to order them.'
    },
    opportunity: {
      slug: 'n-what-is-nueva-opportunity-dm-redirect',
      h: 'Send me a message and I will send you the details',
      p: 'I will send you how sharing Nueva actually works, and answer anything you want to ask first.'
    }
  };

  var h = modal.querySelector('[data-nva-h]');
  var p = modal.querySelector('[data-nva-p]');
  var go = modal.querySelector('[data-nva-go]');
  var note = modal.querySelector('[data-nva-note]');
  var lastFocus = null;

  function open(key) {
    var d = DOORS[key];
    if (!d) return;
    h.textContent = d.h;
    p.textContent = d.p;
    if (hasDomain) {
      go.href = 'https://' + domain + '/' + d.slug;
      go.hidden = false;
      note.hidden = true;
    } else {
      /* No domain means no redirect step to send them to. Say so rather than shipping a
         link to https:///slug, which looks like a broken page and loses the lead. */
      go.hidden = true;
      note.hidden = false;
      note.textContent = 'This link is not set up yet. Fill in your funnel domain in your custom values and it appears here.';
    }
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    (hasDomain ? go : note).focus && (hasDomain ? go : note).focus();
  }
  function close() {
    modal.hidden = true;
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  root.addEventListener('click', function (e) {
    var opener = e.target.closest ? e.target.closest('[data-nva-ask]') : null;
    if (opener) { e.preventDefault(); open(opener.getAttribute('data-nva-ask')); return; }
    if (e.target.closest && e.target.closest('[data-nva-close]')) { e.preventDefault(); close(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) close();
  });
})();
