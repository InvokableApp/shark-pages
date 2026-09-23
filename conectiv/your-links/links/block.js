/* CONECTIV SHARK, PUBLIC LINK HUB
   The audience facing page a rep posts in their social bio.
   Ported from glp/your-links/links, 2026-09-23.

   Link model: the rep's own domain (conectiv__main_url) plus the funnel's ENTRY
   STEP slug. Conectiv installs are uniform so the slugs hold, which is the same
   model the Conectiv rep console uses. This is deliberately NOT GLP's model:
   GLP ships a per funnel custom value holding a full url because GLP reps run
   several domains per account and their slugs drift per install. A per funnel
   value still wins if one is ever added, since url() checks cvKey first.

   Everything unfilled is dropped, never shown as a placeholder.
*/
(function () {
  var root = document.currentScript && document.currentScript.closest
    ? document.currentScript.closest('.sk-conectiv-links')
    : null;
  if (!root) root = document.querySelector('.sk-conectiv-links');
  if (!root || root.getAttribute('data-built') === '1') return;
  root.setAttribute('data-built', '1');

  /* ---------- icons, 24x24, stroke currentColor ---------- */
  var I = {
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.2 8.8-2 4.4-4.4 2 2-4.4z"/>',
    leaf:    '<path d="M4.5 19.5C3 15 4.5 9 9 6.4 12.4 4.4 17 4.6 20 4.5c.2 3-.1 7.6-2.1 11-2.6 4.4-8.6 5.9-13.1 4z"/><path d="M4.5 19.5C7 15.8 11 11.8 15.5 9.4"/>',
    book:    '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H18a1 1 0 0 1 1 1v12"/><path d="M4 5.5v12A1.5 1.5 0 0 0 5.5 19H19"/><path d="M8 8.5h7M8 12h5"/>',
    pulse:   '<path d="M3 12h3.5l2-5.5 3.5 11 2.5-7 1.8 3.5H21"/>',
    gift:    '<path d="M4 11h16v8.5a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5z"/><path d="M3.5 7.5h17V11h-17z"/><path d="M12 7.5V20"/><path d="M12 7.5S10.5 4 8.6 4a2.1 2.1 0 0 0 0 3.5z"/><path d="M12 7.5S13.5 4 15.4 4a2.1 2.1 0 0 1 0 3.5z"/>',
    scale:   '<path d="M12 4v16"/><path d="M7 8h10"/><path d="m4 15 3-7 3 7a3 3 0 0 1-6 0z"/><path d="m14 15 3-7 3 7a3 3 0 0 1-6 0z"/>',
    sign:    '<path d="M12 3v18"/><path d="M12 5.5h6.2l1.8 2.3-1.8 2.3H12z"/><path d="M12 13H5.8L4 15.3l1.8 2.3H12z"/>',
    cart:    '<circle cx="9.5" cy="19" r="1.4"/><circle cx="17.5" cy="19" r="1.4"/><path d="M3 4h2.2l2.3 11.2a1.4 1.4 0 0 0 1.4 1.1h8.4a1.4 1.4 0 0 0 1.4-1.1L20.5 8H6"/>',
    badge:   '<path d="M8 4h8a1 1 0 0 1 1 1v3H7V5a1 1 0 0 1 1-1z"/><rect x="3.5" y="8" width="17" height="11.5" rx="1.6"/><path d="M3.5 13h17"/>',
    chev:    '<path d="m9 5 7 7-7 7"/>',
    ig:      '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.1" cy="6.9" r="1.1" fill="currentColor" stroke="none"/>',
    fb:      '<path d="M14.5 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.6 1.6-1.6h1.6V3.2A21 21 0 0 0 15.4 3c-2.4 0-4 1.5-4 4.3v2.5H8.6V13h2.8v8z"/>',
    tt:      '<path d="M14.2 3h2.9a5 5 0 0 0 4.4 4.3v2.9a7.8 7.8 0 0 1-4.4-1.5v6.1a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v3a2.9 2.9 0 1 0 2 2.8z"/>',
    yt:      '<rect x="2.5" y="5.5" width="19" height="13" rx="3.6"/><path d="m10.2 9.4 5 2.6-5 2.6z"/>',
    li:      '<rect x="3.5" y="3.5" width="17" height="17" rx="2.4"/><path d="M8 10.5V17"/><circle cx="8" cy="7.4" r="1.1" fill="currentColor" stroke="none"/><path d="M12 17v-3.6a2.1 2.1 0 0 1 4.2 0V17"/><path d="M12 10.5V17"/>',
    x:       '<path d="M4 4h3.6l4.6 6.2L17.6 4H20l-6.6 7.6L20.4 20h-3.6l-4.9-6.6L6 20H3.6l7-8.1z"/>'
  };
  function icon(k, w) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
      (w || 1.7) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[k] + '</svg>';
  }

  /* ---------- custom values ----------
     Empty, unsubstituted and the snapshot's own instruction copy all count as
     not filled. The snapshot ships "Paste the full link ...", "Enter your ...",
     "Add the email ..." as the VALUE of each key, which is correct for a
     snapshot and must never render to a visitor. */
  function cv(key) {
    var v = (root.getAttribute('data-cv-' + key) || '').trim();
    if (!v || v.indexOf('{') !== -1 || /^(paste|enter|add)\b/i.test(v)) return '';
    return v;
  }
  function abs(v) { return /^https?:\/\//i.test(v) ? v : 'https://' + v.replace(/^\/+/, ''); }

  /* conectiv__main_url, NOT conectiv__email_designated_domain. The email one is
     the GHL sending domain (its instruction text says mail.yourbrand.com) and
     does not serve funnel pages. GLP's copy of this block reads its email domain
     key and survives only because GLP reps fill theirs with a root domain. */
  var domain = cv('conectiv__main_url')
    .replace(/^https?:\/\//i, '').replace(/\/+$/, '');

  /* Per funnel value wins, then the rep's domain plus the entry step slug, then
     document relative. Document relative is the safe last resort: the live page
     has no trailing slash and GHL does not add one, so "sample" resolves against
     the host the visitor is already on. */
  function url(it) {
    var own = cv(it.cvKey);
    if (own) return abs(own);
    if (domain) return 'https://' + domain + '/' + it.slug;
    return it.slug;
  }
  /* gateCv is an explicit off switch: the free ALIVE sample is posted by hand,
     so a rep who is not running it must not advertise it. An unfilled gate
     hides the row even when the funnel itself would resolve. */
  function isLive(it) {
    if (it.gateCv && !cv(it.gateCv)) return false;
    return !!(cv(it.cvKey) || domain);
  }

  /* ---------- the funnels ----------
     slug is the funnel's ENTRY STEP url in the GLP Shark snapshot
     hKYM2WhsSBKHjvCPGkZo, read 2026-09-22. Never the funnel path: the funnel
     path does not route. */
  var GROUPS = [
    { label: 'Learn more', items: [
      { icon: 'compass', slug: 'c-what-is-conectiv',
        name: 'See what I do',
        tease: 'A short tour of the products and the business.' }
    ]},
    { label: 'Resources', items: [
      { icon: 'leaf', slug: 'c-natural-glp-foods-guide',
        name: 'Natural GLP foods guide',
        tease: 'The everyday foods to build your meals around.' },
      { icon: 'book', slug: 'c-clean-iced-coffee',
        name: 'Clean iced coffee recipes',
        tease: 'Eight low sugar iced coffees worth repeating.' },
      { icon: 'scale', slug: 'c-investment-options',
        name: 'Which investment option fits you?',
        tease: 'A few questions, then a recommendation.' },
      { icon: 'sign', slug: 'c-side-hustle-quiz',
        name: 'Which side hustle fits you?',
        tease: 'Find the work from home model that matches how you live.' }
    ]},
    { label: 'Test drive the product', items: [
      { icon: 'gift', slug: 'c-free-coffee-sample-optin', gateCv: 'conectiv__free_sample_live',
        name: 'Try ALIVE coffee free',
        tease: 'I post you a real sample. Ask and it goes out.' }
    ]}
  ];

  /* Buy links are their own group and their own treatment. A visitor who has
     already decided should not have to read past four free guides to find them. */
  var SHOP = [
    { icon: 'cart',  cvKey: 'conectiv__your_mylife_wellness_link', name: 'Shop MyLife Wellness',
      tease: 'Order as a customer.' },
    { icon: 'cart',  cvKey: 'conectiv__alive_link',                name: 'Shop ALIVE coffee',
      tease: 'The coffee itself.' },
    { icon: 'cart',  cvKey: 'conectiv__amaze_link',                name: 'Shop AMAZE',
      tease: 'Order as a customer.' },
    { icon: 'badge', cvKey: 'conectiv__your_coneqtx_link',         name: 'Join as a partner',
      tease: 'Start your own business with me.' }
  ];

  /* ---------- socials ----------
     "Only if they have them" is the whole ask, and the standard cv() filter is
     not enough here: the snapshot seeds these keys with the bare platform host
     ("facebook.com", "Instagram.com", "x.com"), which is a filled looking value
     that points at nobody. A social value only counts when something follows
     the host. */
  var SOCIALS = [
    { key: 'conectiv__instagram_link', icon: 'ig', label: 'Instagram', host: 'instagram.com' },
    { key: 'conectiv__facebook_link',  icon: 'fb', label: 'Facebook',  host: 'facebook.com' },
    { key: 'conectiv__twitter_link',   icon: 'x',  label: 'X',         host: 'x.com' },
    { key: 'conectiv__tiktok_link',    icon: 'tt', label: 'TikTok',    host: 'tiktok.com', at: true },
    { key: 'conectiv__youtube_link',   icon: 'yt', label: 'YouTube',   host: 'youtube.com' },
    { key: 'conectiv__linkedin_link',  icon: 'li', label: 'LinkedIn',  host: 'linkedin.com' }
  ];
  function socialUrl(s) {
    var v = cv(s.key);
    if (!v) return '';
    var bare = v.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
    var slash = bare.indexOf('/');
    var path = slash === -1 ? '' : bare.slice(slash + 1);
    /* a bare handle with no host at all is completed onto the platform.
       TikTok profile urls carry the @, the others must not have one. */
    if (slash === -1 && bare.indexOf('.') === -1) {
      var handle = bare.replace(/^@/, '');
      return 'https://' + s.host + '/' + (s.at ? '@' + handle : handle);
    }
    if (!path) return '';
    return 'https://' + bare;
  }

  /* ---------- render ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function row(it, href, mod) {
    return '<a class="sk-row' + (mod ? ' ' + mod : '') + '" href="' + esc(href) + '">' +
      '<span class="sk-mark">' + icon(it.icon) + '</span>' +
      '<span class="sk-text">' +
        '<span class="sk-row-name">' + esc(it.name) + '</span>' +
        '<span class="sk-row-tease">' + esc(it.tease) + '</span>' +
      '</span>' +
      '<span class="sk-chev">' + icon('chev', 2) + '</span>' +
    '</a>';
  }

  var body = root.querySelector('[data-body]');
  var html = '';
  var live = 0;

  GROUPS.forEach(function (g) {
    var items = g.items.filter(isLive);
    if (!items.length) return;
    live += items.length;
    html += '<section class="sk-group"><div class="sk-group-head">' +
      '<span class="sk-group-label">' + esc(g.label) + '</span>' +
      '<span class="sk-rule"></span></div>' +
      items.map(function (it) { return row(it, url(it)); }).join('') +
      '</section>';
  });

  /* Connect on social is a SECTION, not footer furniture (Jessica, 2026-09-22).
     It renders only when at least one profile is actually filled. */
  var socLinks = SOCIALS.map(function (s) {
    var u = socialUrl(s);
    return u ? '<a class="sk-soc" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer"' +
      ' aria-label="' + esc(s.label) + '">' + icon(s.icon, 1.6) + '</a>' : '';
  }).join('');
  if (socLinks) {
    html += '<section class="sk-group"><div class="sk-group-head">' +
      '<span class="sk-group-label">Connect with me</span>' +
      '<span class="sk-rule"></span></div>' +
      '<nav class="sk-social" aria-label="Social profiles">' + socLinks + '</nav>' +
      '</section>';
  }

  var shop = SHOP.filter(function (it) { return !!cv(it.cvKey); });
  if (shop.length) {
    live += shop.length;
    html += '<section class="sk-group"><div class="sk-group-head">' +
      '<span class="sk-group-label">Ready to order</span>' +
      '<span class="sk-rule"></span></div>' +
      shop.map(function (it) { return row(it, abs(cv(it.cvKey)), 'sk-row--buy'); }).join('') +
      '</section>';
  }

  /* Nothing real to show means the account is not set up yet. Say so plainly
     instead of rendering an empty page that reads as broken. */
  if (!live) {
    html = '<div class="sk-setup"><b>Not set up yet</b>' +
      'Add your domain and your links in the custom values for this account, ' +
      'and this page fills itself in.</div>';
  }
  body.innerHTML = html;

  /* ---------- header ---------- */
  var name = cv('conectiv__your_full_name');
  var nameEl = root.querySelector('[data-name]');
  var subEl = root.querySelector('[data-sub]');
  if (name) {
    var parts = name.trim().split(/\s+/);
    var first = esc(parts.shift());
    nameEl.innerHTML = '<span class="sk-hl">' + first + '</span>' +
      (parts.length ? ' ' + esc(parts.join(' ')) : '');
  } else {
    nameEl.remove();
  }
  if (live) {
    subEl.textContent = 'Everything in one place. Tap any one to get started.';
  } else {
    subEl.remove();
  }

  /* ---------- legal ---------- */
  var legal = cv('conectiv__income_disclaimer');
  root.querySelector('[data-legal]').textContent = legal || '';
})();
