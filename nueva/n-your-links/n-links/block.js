/* NUEVA, PUBLIC LINK HUB
   The audience facing page a rep posts in their social bio.

   Forked from glp/your-links/links on 2026-09-22. The LAYOUT is identical and
   that is deliberate; the LINK MODEL is not, and it is the reason this is a
   fork rather than a shared component:

     GLP    one custom value per funnel, because its snapshot already ships them
     Nueva  {domain}/{slug}, the model every other system uses

   Jeff, 2026-09-22: "we know the cv for default domain and we know the slugs so
   we can do it the way we do the marketing-links pages, glp is the exception in
   this case." One value for the rep to fill instead of six, and it works the
   moment their domain is attached.

   ⚠️ ONE DOMAIN IS AN ASSUMPTION, NOT A LAW. Every Nueva funnel sits on one
   domain today. A rep whose funnels straddle two domains breaks this model and
   nothing errors: the second domain's rows just point at the first. Re-measure
   before a rep install (MARKETING-LINKS-PAGE-SOP section 2).

   Everything unfilled is dropped, never shown as a placeholder.
*/
(function () {
  var root = document.currentScript && document.currentScript.closest
    ? document.currentScript.closest('.sk-nva-links')
    : null;
  if (!root) root = document.querySelector('.sk-nva-links');
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

  var domain = cv('nueva_main_url')
    .replace(/^https?:\/\//i, '').replace(/\/+$/, '');

  /* The rep's domain plus the funnel's entry step slug, then document relative.
     Document relative is the safe last resort rather than a broken link: the
     live page has no trailing slash and GHL does not add one, so "n-no-crash-plan"
     resolves against the host the visitor is already on, which on a correctly
     installed account is the same domain anyway. */
  function url(it) {
    if (domain) return 'https://' + domain + '/' + it.slug;
    return it.slug;
  }
  /* A row is live once the domain is filled. There is no per row value to check,
     so the page is all or nothing: that is the trade the domain model makes, and
     it is why the setup message below has to be legible. */
  function isLive() { return !!domain; }

  /* ---------- the funnels ----------
     ⚠️ EVERY slug IS A REAL ENTRY STEP in the Nueva snapshot sKmJ8BrXPCYR2g7aYRX0,
     read 2026-09-22. Never the funnel PATH: the funnel path does not route, the
     step slug does (BUYER-ONBOARDING-SOP, the router table).

     THREE FUNNELS, NOT SEVEN, and that is the current correct answer rather than
     an oversight. The snapshot holds three; Shark Beta holds four more (Free
     Revive Sample, Snow Slim, Teen Hydration, Caffeine Curve) that have not been
     installed into it yet. A card for a funnel the account does not have is a
     dead link that nothing errors on, which is exactly how the throwaway Nueva
     demo skin shipped with most of its rows pointing nowhere. Add each one here
     when it lands in the snapshot. Jeff, 2026-09-22: "only whats in the snapshot
     today".

     The copy here is AUDIENCE facing. The rep console says "use it when someone
     is frustrated rather than ready to buy"; a stranger gets told what they get. */
  var GROUPS = [
    { label: 'Free guides', items: [
      { icon: 'pulse', slug: 'n-tone-and-tighten-guide',
        name: 'Tone and tighten in 8 weeks',
        tease: 'Eight 20 minute workouts and 12 high protein recipes.' },
      { icon: 'leaf', slug: 'n-no-crash-plan',
        name: 'Stop the 3pm crash',
        tease: 'A 19 page plan for steady energy through the afternoon.' }
    ]},
    { label: 'Work with me', items: [
      { icon: 'sign', slug: 'n-match-quiz',
        name: 'Which side hustle fits you?',
        tease: 'A few questions, then the model that suits how you live.' }
    ]}
  ];

  /* Buy links are their own group and their own treatment. A visitor who has
     already decided should not have to read past four free guides to find them. */
  var SHOP = [
    { icon: 'cart',  cvKey: 'nueva_buy_link',       name: 'Shop Nueva',
      tease: 'Order as a customer.' },
    { icon: 'badge', cvKey: 'nueva_opportunity_url', name: 'Become a Social Marketer',
      tease: 'Start your own Nueva business with me.' }
  ];

  /* ---------- socials ----------
     "Only if they have them" is the whole ask, and the standard cv() filter is
     not enough here: the snapshot seeds these keys with the bare platform host
     ("facebook.com", "Instagram.com", "x.com"), which is a filled looking value
     that points at nobody. A social value only counts when something follows
     the host. */
  var SOCIALS = [
    { key: 'nueva_instagram', icon: 'ig', label: 'Instagram', host: 'instagram.com' },
    { key: 'nueva_facebook',  icon: 'fb', label: 'Facebook',  host: 'facebook.com' },
    { key: 'nueva_tiktok',    icon: 'tt', label: 'TikTok',    host: 'tiktok.com', at: true },
    { key: 'nueva_youtube',   icon: 'yt', label: 'YouTube',   host: 'youtube.com' }
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
      'Fill in your domain in the custom values for this account and every link ' +
      'on this page fills itself in.</div>';
  }
  body.innerHTML = html;

  /* ---------- header ---------- */
  var name = cv('nueva_rep_full_name');
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
  var legal = cv('nueva_income_disclaimer');
  root.querySelector('[data-legal]').textContent = legal || '';
})();
