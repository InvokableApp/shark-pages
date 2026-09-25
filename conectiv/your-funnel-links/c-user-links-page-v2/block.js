(function () {
var SYS = {
  nameCv: 'conectiv__your_first_name',
  /* The system's training hub. Verified serving 2026-09-24, by byte size against
     the domain's catch-all because these domains have no 404. */
  training: 'https://conectivshark.com/training',
  domainCv: 'conectiv__main_url',
  /* The rep's OWN v2 training pages travel with the snapshot as a step inside
     each funnel, so they sit on the rep's own domain. conectiv__main_url is that
     domain and is ALREADY declared on the block root, so this needs no new custom
     value and no socket re-push.
     NOT conectiv__email_designated_domain: on Conectiv that one is the GHL email
     sending domain (its own instruction text says mail.yourbrand.com), which does
     not serve funnel pages. It would pass the hostname guard below and produce a
     link that 404s silently. GLP's block uses its email-domain CV for this and
     gets away with it only because GLP reps happen to fill theirs with a root
     domain; the name does not port. */
  howtoDomainCv: 'conectiv__main_url',
  /* Joe's v2 categories, Sep 2026. The old five (start a conversation / quizzes
     / explain Conectiv / recruit / your own pages) sorted by what the rep DOES
     with a link. These sort by what the funnel SELLS on the back end, which is
     Jeff's rule: "if a funnel promotes a product on the backend it goes there".
     So a quiz is not its own group any more, it sits with whatever it sells.

     SERVICES is Conectiv-only and is Jeff's call, 2026-09-23. GLP had nowhere
     to put the travel and investment quizzes because GLP sells neither; Conectiv
     does, and they are not products and not the opportunity. */
  groups: [
    { label:"Product funnels", items:[
      { howtoSlug:"c-natural-glp-foods-guide-how-to", slug:"c-natural-glp-foods-guide", canva:"https://canva.link/wq64jii9m8k6wf5", howto:"https://conectivshark.com/c-natural-glp-foods-guide-training", icon:"leaf", name:"Natural GLP Foods Guide",
        tease:"Free foods guide",
        guides:[{ label:"Access / Print / Share The Guide", cv:"conectiv__glp_foods_guide_download_url" }],
        desc:"A free guide to the foods that support GLP naturally. Your widest opener, it works on anyone curious about weight without mentioning the product." },
      { howtoSlug:"c-clean-brew-how-to", slug:"c-clean-iced-coffee", canva:"https://canva.link/e95p5e6tvk9bfcu", howto:"https://conectivshark.com/c-clean-brew-training", icon:"drop", name:"Clean Iced Coffee Recipes",
        tease:"Free recipe guide",
        guides:[{ label:"Access / Print / Share The Guide", cv:"conectiv__coffee_guide_download_url" }],
        desc:"A free clean iced coffee recipe guide. Light, shareable, and a natural lead in to the coffee products." },
      { howtoSlug:"c-free-coffee-sample-how-to", slug:"c-free-coffee-sample-optin", gateCv:"conectiv__free_sample_live",
        canva:"https://canva.link/xfj62nc69jesx7q", howto:"https://conectivshark.com/c-free-coffee-sample-training", icon:"coffee", name:"Free ALIVE Sample",
        tease:"You post them a real sample",
        desc:"They ask for a free ALIVE sample and you put it in the post yourself. Nothing is delivered automatically, so this one lives or dies on you calling and texting. The scripts are on the how to page." } ]},

    { label:"Opportunity funnels", items:[
      { howtoSlug:"c-side-hustle-how-to", slug:"c-side-hustle-quiz", canva:"https://canva.link/s6qp9hd49af04zk", howto:"https://conectivshark.com/c-side-hustle-training", icon:"quiz", name:"Side Hustle Quiz",
        tease:"Finds their work-from-home fit",
        desc:"Sorts people into the side hustle that suits them, then shows where Conectiv fits. Good for the curious but not yet ready." },
      { slug:"c-opportunity-explainer", canva:"https://canva.link/auwgogirjanwxfu", howto:"https://conectivshark.com/c-opportunity-training", icon:"users", name:"Opportunity Explainer",
        tease:"The business, explained",
        desc:"The business explained end to end, for anyone who has told you they want to hear more." } ]},

    { label:"Services", items:[
      { slug:"c-travel-destination-quiz", canva:"https://canva.link/u7kmb8ff96e3l53", howto:"https://conectivshark.com/c-travel-destination-training", icon:"compass", name:"Travel Destination Quiz",
        tease:"Matches them to a destination",
        desc:"A light, high completion quiz that matches someone to a travel destination. Use it to open conversations with people who would ignore a business post." },
      { howtoSlug:"c-investment-how-to", slug:"c-investment-options", canva:"https://canva.link/c1mqv0iaol3twrc", howto:"https://conectivshark.com/c-investment-training", icon:"quiz", name:"Investment Options Quiz",
        tease:"Matches them to an option",
        desc:"Walks someone through the investment options that suit them. Best for a more financially minded audience." } ]},

    { label:"\"What I do\" funnel", items:[
      { howtoSlug:"c-what-is-conectiv-how-to", slug:"c-what-is-conectiv", canva:"https://canva.link/icwp67xvbmaimze", howto:"https://conectivshark.com/c-what-is-conectiv-training", icon:"info", name:"What Is Conectiv",
        tease:"The full overview",
        desc:"The complete explainer. What Conectiv is, what it does and who it is for, in one page you can send to anyone who asks." } ]},

    { label:"Your linktree", items:[
      { howtoSlug:"c-links-how-to", slug:"c-links", howto:"https://conectivshark.com/c-social-links-training", icon:"compass", name:"Social Links Share Page",
        tease:"All your socials in one place",
        desc:"One page holding every social profile you have filled in. Handy as a single link to hand out." } ]}
  ],
  lists: [
    /* ⚠️ MOVED, NOT DELETED. Joe, 2026-09-23: "Remove social content section".
       The renderer skips anything in _listsOff, so this is the whole removal and
       the Canva folder survives in the file for the day he wants it back.
       NOTE the GLP port emptied lists[] entirely; Conectiv cannot, because its
       second entry is the rep's DIRECT BUY LINKS, which Joe did not ask to touch
       and which are this system's equivalent of GLP's "company links" group. */
    { label: 'Direct buy links', icon: 'cart', name: 'Your buy links',
      tease: 'Product and partner links', perRep: true, items: [
    { cv:"conectiv__your_mylife_wellness_link", name:"MyLife Wellness, for customers" },
    { cv:"conectiv__alive_link",                name:"ALIVE coffee" },
    { cv:"conectiv__amaze_link",                name:"AMAZE" },
    { cv:"conectiv__your_coneqtx_link",         name:"ConeqtX, for partners" }
  ] }
  ],
  _listsOff: [
    { label: 'Social content', icon: 'image', name: 'Ready to post images',
      tease: 'Product, opportunity and lead magnet', single: {
        url: 'https://www.canva.com/design/DAHRi1jc7jI/xscZV8kpW6--BbQ3JQDl4w/view',
        desc: 'Every ready to post image for Conectiv, in one Canva folder. Open it, take your own copy, then edit that copy so the originals stay clean for everyone else.',
        cta: 'Open the image library' } }
  ],
  affiliate: { cv: 'conectivshark_affiliate_link', name: 'Your Conectiv Shark affiliate link',
    desc: 'This is your affiliate link for the Conectiv Shark marketing system itself, not for product and not for the opportunity. Send it to anyone who wants the funnels, emails and automations you are running. If they buy the system through your link, the sale is credited to you.' }
};
  var root = document.querySelector('.sk-conectiv-your-funnel-links-c-user-links-page');
  if (!root) return;

  /* ---------- typeface ----------
     The block styles Archivo on the VARIABLE axes, wdth and wght, but it never
     loaded the font: it inherited whatever the host GHL page happened to
     request. GHL asks for static weights, and against a static face
     font-variation-settings is ignored outright, so every weight in the design
     silently collapsed to one. Load the variable file ourselves so the block
     owns its own typography instead of borrowing the page's.
     No IIFE here: the build appends the extra script at the first '})();'. */
  var FONT_HREF = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap';
  if (!document.querySelector('link[href^="https://fonts.googleapis.com/css2?family=Archivo:wdth"]')) {
    var fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = FONT_HREF;
    document.head.appendChild(fontLink);
  }

  /* ---------- icons ----------
     Inline path data in one map, 24x24, fill none, stroke currentColor. Never an
     icon font, never a remote sprite. */
  var I = {
    link:    '<path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7"/><path d="M14 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.7-1.7"/>',
    inbox:   '<path d="M2.5 13.5h5l1.6 2.6h5.8l1.6-2.6h5"/><path d="M4.6 5.4 2.5 13.5v3.6a2.4 2.4 0 0 0 2.4 2.4h14.2a2.4 2.4 0 0 0 2.4-2.4v-3.6L19.4 5.4A2.4 2.4 0 0 0 17.2 4H6.8a2.4 2.4 0 0 0-2.2 1.4z"/>',
    rocket:  '<path d="M13.5 4.5c3.4-2.2 6-2 6-2s.2 2.6-2 6c-2.5 3.9-6.4 5.6-6.4 5.6l-3.2-3.2S9.6 7 13.5 4.5z"/><path d="M8 15.5 5 18M6.5 11.5 4 12.8l1.8 1.8M12.5 17.5l1.3-2.5 1.8 1.8"/>',
    life:    '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="4"/><path d="m5.3 5.3 3.9 3.9M14.8 14.8l3.9 3.9M18.7 5.3l-3.9 3.9M9.2 14.8l-3.9 3.9"/>',
    leaf:    '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    dumbbell:'<path d="M6.5 6.5v11"/><path d="M17.5 6.5v11"/><path d="M3.5 9v6"/><path d="M20.5 9v6"/><path d="M6.5 12h11"/>',
    quiz:    '<path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9.5"/>',
    drop:    '<path d="M12 2.7s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.1 12 2.7 12 2.7Z"/>',
    info:    '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-5"/><path d="M12 8h.01"/>',
    user:    '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    users:   '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 19.5a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6"/><path d="M18 14.4a6.5 6.5 0 0 1 3.5 5.1"/>',
    compass: '<circle cx="12" cy="12" r="9.5"/><path d="m15.5 8.5-2 5.2-5.2 2 2-5.2Z"/>',
    copy:    '<rect x="9" y="9" width="12" height="12" rx="2.4"/><path d="M5.5 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v.5"/>',
    check:   '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    out:     '<path d="M14 4h6v6"/><path d="M20 4 10.5 13.5"/><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
    video:   '<rect x="2.5" y="6" width="12" height="12" rx="2.5"/><path d="m14.5 11 6-3.4v8.8l-6-3.4z"/>',
    play:    '<path d="M21 7.5v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z"/><path d="M10.5 9.2v5.6l5-2.8z" fill="currentColor" stroke="none"/>',
    chev:    '<path d="m9 5 7 7-7 7"/>',
    down:    '<path d="m6 9 6 6 6-6"/>',
    scan:    '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="11" r="3"/><path d="M7 17c1-2 2.9-3 5-3s4 1 5 3"/>',
    coffee:  '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M7 2v3"/><path d="M11 2v3"/>',
    kids:    '<circle cx="12" cy="8.5" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/><path d="M8.5 3.5 12 1l3.5 2.5"/>',
    chart:   '<path d="M3 20h18"/><rect x="5" y="11" width="3.5" height="6" rx="1"/><rect x="10.2" y="7" width="3.5" height="10" rx="1"/><rect x="15.5" y="13" width="3.5" height="4" rx="1"/>',
    guide:   '<path d="M4.5 5.2A1.7 1.7 0 0 1 6.2 3.5H19v13.2H6.2a1.7 1.7 0 0 0-1.7 1.7z"/><path d="M4.5 18.4a1.7 1.7 0 0 0 1.7 1.7H19v-3.4"/><path d="M8.2 7.6h6.6M8.2 11h4.4"/>',
    image:   '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m3.5 17 4.7-4.7a2 2 0 0 1 2.8 0l3.2 3.2"/><path d="m13 14.2 2.1-2.1a2 2 0 0 1 2.8 0l2.6 2.6"/>',
    cart:    '<circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/><path d="M2.5 3h2.2l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.5a1.6 1.6 0 0 0 1.6-1.3L20.5 7H6"/>',
    share:   '<circle cx="18" cy="5.5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="18.5" r="2.6"/><path d="m8.3 10.7 7.4-3.9"/><path d="m8.3 13.3 7.4 3.9"/>'
  };
  /* ---------- per funnel: training, then quick actions ----------
     Joe's v2 spec: three training buttons under every funnel link, then a
     "useful quick actions" row. All three go to the SAME funnel training page
     and differ only by the hash, because that page is three tabs and honours
     #part-N on load. A funnel with no training page renders no training block
     rather than three dead buttons.

     ⚠️ CONECTIV'S HOW-TO PAGES ARE STILL THE OLD SINGLE-PAGE FORMAT, so
     #part-N currently lands all three rows at the top of the same page. Jeff,
     2026-09-23: the how-to pages get rebuilt in the three-part format "probably
     today", so the deep links are written now and start working the moment they
     land. If that slips, PARTS = false renders one row instead of three.

     The emoji is the SAME one each part wears on the funnel training page it
     links to, its header and its sticky footer, so a rep meets one mark per
     part wherever they see it. */
  var PARTS = true;
  var TRAINING = [
    { part: 1, emoji: '\uD83D\uDEE0\uFE0F', label: 'How does this funnel work?' },
    { part: 2, emoji: '\uD83D\uDE80',        label: 'How do I generate leads with this funnel?' },
    { part: 3, emoji: '\uD83D\uDCAC',        label: 'What to say to leads who come through this funnel?' }
  ];

  function subhead(text) { return '<p class="sk-subhead">' + text + '</p>'; }

  function actionRow(href_, mark, label) {
    return '<a class="sk-action" href="' + href_ + '" target="_blank" rel="noopener">' +
      mark + '<span class="sk-action-label">' + label + '</span>' +
      '<span class="sk-action-go" aria-hidden="true">' + icon('out', 1.8) + '</span></a>';
  }

  /* The rep's own copy when their domain is set, the central conectivshark.com
     page otherwise. On a SNAPSHOT the domain custom value holds instruction text
     ("Enter your main domain WITHOUT https://"), which would otherwise render as
     https://Enter your main domain.../c-side-hustle-how-to on every card, so the
     value has to look like a hostname before it is trusted. The fallback is why
     these rows still work in the snapshot itself. */
  function howtoUrl(it) {
    var d = SYS.howtoDomainCv ? String(cv(SYS.howtoDomainCv) || '') : '';
    d = d.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    if (it.howtoSlug && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(d)) {
      return 'https://' + d + '/' + it.howtoSlug;
    }
    return it.howto || '';
  }

  function trainingBlock(it) {
    var base = howtoUrl(it);
    if (!base) return '';
    var rows = PARTS
      ? TRAINING.map(function (t) {
          return actionRow(base + '#part-' + t.part,
            '<span class="sk-action-mark sk-action-mark--emoji" aria-hidden="true">' + t.emoji + '</span>',
            t.label);
        }).join('')
      : actionRow(base,
          '<span class="sk-action-mark" aria-hidden="true">' + icon('play', 1.7) + '</span>',
          'How to use this funnel');
    return subhead('Training / Guidance') + '<div class="sk-actions">' + rows + '</div>';
  }

  /* The lead magnet itself, so a rep can read or print what they are sending.
     `guides` is a list because a funnel may ship more than one. Canva sits here
     too: it is an asset the rep fetches, not training. An empty custom value
     DROPS its row rather than linking to nothing. */
  function quickActions(it) {
    var rows = (it.guides || []).map(function (g) {
      var u = g.cv ? cv(g.cv) : g.url;
      if (!u) return '';
      return actionRow(href(u),
        '<span class="sk-action-mark" aria-hidden="true">' + icon('guide', 1.7) + '</span>', g.label);
    }).filter(Boolean);
    if (it.canva) {
      rows.push(actionRow(it.canva,
        '<span class="sk-action-mark" aria-hidden="true">' + icon('image', 1.7) + '</span>',
        'Images for social posts'));
    }
    if (!rows.length) return '';
    return subhead('Useful Quick Actions') + '<div class="sk-actions">' + rows.join('') + '</div>';
  }

  function icon(k, w) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
      (w || 1.7) + '" stroke-linecap="round" stroke-linejoin="round">' + I[k] + '</svg>';
  }

  /* ---------- custom values ----------
     Empty, unsubstituted, and the "Paste the full link" placeholder all count as
     not filled, exactly as the live marketing links block treats them. */
  function cv(key) {
    var v = (root.getAttribute('data-cv-' + key) || '').trim();
    if (!v || v.indexOf('{') !== -1 || /^(paste|enter|add)\b/i.test(v)) return '';
    return v;
  }
  function href(v) { return /^https?:\/\//i.test(v) ? v : 'https://' + v.replace(/^\/+/, ''); }

  /* ---------- the four destinations ---------- */
  var DEST = [
    { id: 'links',   icon: 'link',   name: 'View my funnel links', tease: 'Every link you can share, ready to copy.' },
    { id: 'leads',   icon: 'inbox',  name: 'View my leads',        tease: 'Where your leads and conversations live.' },
    { id: 'promote', icon: 'rocket', name: 'Generate leads now',   tease: 'What your day should actually look like.' },
    { id: 'support', icon: 'life',   name: 'Contact support',      tease: 'Email, text, or send us a message.' }
  ];

  /* Referral is a destination, not a card at the bottom of the funnel list. PUSHED
     rather than declared inline so a system whose config carries no affiliate program
     never grows a tile that leads nowhere. Last on purpose: the others are the rep's
     job, this one is their upside. */
  /* Joe, 2026-09-24: "Fast Start Training / Learn how to use this system, this is
     where you start", a video icon, above the others. UNSHIFTED rather than
     declared inline, same reason the referral tile is pushed: a system whose
     config names no training hub never grows a tile that leads nowhere.

     It is the one destination that leaves the app, so it carries an href of its
     own instead of a #/screen route. */
  if (SYS.training) DEST.unshift({ id: 'training', icon: 'video',
    name: 'Fast Start Training', tease: 'Learn how to use this system. This is where you start.',
    href: SYS.training });

  if (SYS.affiliate) DEST.push({ id: 'referral', icon: 'share',
    name: 'My Shark System Referral Link', tease: 'Share the system, get yours for free.' });


  /* ---------- link building ----------
     Two models across the fleet, and the difference is deliberate.
       cv   : one custom value per funnel holding a FULL url. GLP reps run
              several domains per account and their slugs drift per install, so
              an assembled url silently serves the 404 fallback with a 200.
       slug : one domain custom value plus a fixed slug per funnel. Vital and
              Conectiv installs are uniform, so the slugs hold.
     A slug starting with http is absolute and used verbatim, which is how the
     central how-to pages sit alongside a rep's own domain. */
  var domain = SYS.domainCv
    ? cv(SYS.domainCv).replace(/^https?:\/\//i, '').replace(/\/+$/, '')
    : '';

  /* gateCv: render this funnel ONLY on accounts where that custom value is filled.
     This block is ONE file served to every Conectiv buyer, so a new entry would otherwise
     appear on all of their hubs and link to a page that only exists on some. cv() already
     returns '' for an unsubstituted merge field ({...}) and for the "Paste your..." instruction
     text a snapshot ships, so an account without the CV hides the card with no extra work.
     Remove the gate once a funnel is installed fleet-wide. */
  function funnelUrl(it) {
    if (it.gateCv && !cv(it.gateCv)) return '';
    if (SYS.domainCv) {
      if (!domain) return '';
      if (/^https?:/i.test(it.slug || '')) return it.slug;
      return 'https://' + domain + (it.slug ? '/' + it.slug : '');
    }
    var v = cv(it.cv);
    return v ? href(v) : '';
  }

  /* ---------- the "2 minute customer video" row on the promote screen ----------
     Joe's script step says "send them your 2 minute customer video page". For
     Conectiv that page is the What Is Conectiv funnel, so the row is built by
     funnelUrl() from the rep's own domain + slug - the SAME mechanism as every
     other link on this page. No new custom value, and nothing to fill in.
     (GLP had to guess at a CV here because GLP's links are per-funnel CVs.)
     An unfilled domain drops the row to a note rather than linking to nothing. */
  var twoMin = root.querySelector('[data-two-min-video]');
  if (twoMin) {
    var tmv = funnelUrl({ slug: 'c-what-is-conectiv' });
    twoMin.innerHTML = tmv
      ? '<button class="sk-copy" type="button" data-copy-label="Copy the page link" data-copy="' + tmv + '">' +
          icon('copy', 1.8) + '<span class="sk-copy-label">Copy the page link</span></button>' +
        '<div class="sk-url"><span class="sk-url-text">' + tmv.replace(/^https?:\/\//, '') + '</span>' +
          '<a class="sk-open" href="' + tmv + '" target="_blank" rel="noopener" aria-label="Open your What Is Conectiv page">' + icon('out', 1.8) + '</a></div>'
      : '<p class="sk-note-line">Your main domain has not been filled in yet, so this link cannot be built. Add it in your custom values and it appears here.</p>';
  }

  /* ---------- greeting ---------- */
  var firstName = cv(SYS.nameCv);
  var nameEl = root.querySelector('[data-name]');
  if (nameEl) nameEl.textContent = firstName;
  var commaEl = root.querySelector('[data-comma]');
  if (commaEl) commaEl.textContent = firstName ? ', ' : '';

  /* A destination is normally a screen in this app (#/id). One of them leaves for
     the training hub, so it needs a real href and a new tab. Shared by the home
     grid and the nav sheet so the two can never disagree about where a tile goes. */
  function destAttrs(d) {
    return d.href
      ? 'href="' + d.href + '" target="_blank" rel="noopener"'
      : 'href="#/' + d.id + '"';
  }

  /* ---------- home destinations ---------- */
  var grid = root.querySelector('[data-menugrid]');
  grid.innerHTML = DEST.map(function (d, i) {
    return '<a class="sk-dest" ' + destAttrs(d) + '" style="animation-delay:' + (0.1 + i * 0.05) + 's">' +
      '<span class="sk-mark" aria-hidden="true">' + icon(d.icon) + '</span>' +
      '<span><span class="sk-dest-name">' + d.name + '</span>' +
      '<span class="sk-dest-tease">' + d.tease + '</span></span>' +
      '<span class="sk-dest-go" aria-hidden="true">' + icon('chev', 2) + '</span></a>';
  }).join('');

  /* ---------- nav sheet ---------- */
  var navlist = root.querySelector('[data-navlist]');
  navlist.innerHTML = [{ id: 'home', icon: 'compass', name: 'Home' }].concat(DEST).map(function (d) {
    return '<a class="sk-nav" ' + destAttrs(d) + '>' +
      '<span class="sk-mark" aria-hidden="true">' + icon(d.icon) + '</span>' +
      '<span>' + d.name + '</span></a>';
  }).join('');

  /* ---------- funnel links ---------- */
  var linksHost = root.querySelector('[data-links]');
  var html = '';
  var liveCount = 0;
  SYS.groups.forEach(function (g) {
    var rows = g.items.map(function (it) {
      var full = funnelUrl(it);
      if (!full) return '';
      var url = full.replace(/^https?:\/\//, '');
      return '<article class="sk-card" data-open="false">' +
        '<button class="sk-trigger" type="button" aria-expanded="false">' +
          '<span class="sk-mark" aria-hidden="true">' + icon(it.icon) + '</span>' +
          '<span><span class="sk-name">' + it.name + '</span>' +
          '<span class="sk-tease">' + it.tease + '</span></span>' +
          '<span class="sk-chev" aria-hidden="true">' + icon('down', 2) + '</span>' +
        '</button>' +
        '<div class="sk-panel"><div class="sk-panel-inner"><div class="sk-panel-pad">' +
          '<p class="sk-desc">' + it.desc + '</p>' +
          '<button class="sk-copy" type="button" data-copy="' + full + '">' +
            icon('copy', 1.8) + '<span class="sk-copy-label">Copy my link</span></button>' +
          '<div class="sk-url"><span class="sk-url-text">' + url + '</span>' +
            '<a class="sk-open" href="' + full + '" target="_blank" rel="noopener" aria-label="Open ' + it.name + '">' + icon('out', 1.8) + '</a></div>' +
          trainingBlock(it) + quickActions(it) +
        '</div></div></div></article>';
    }).join('');
    if (!rows) return;
    liveCount += rows.split('<article').length - 1;
    html += '<div class="sk-group"><div class="sk-group-head">' +
      '<span class="sk-group-label">' + g.label + '</span>' +
      '<span class="sk-group-rule"></span>' +
      '<span class="sk-group-count">' + g.items.length + '</span></div>' + rows + '</div>';
  });
  /* Extra groups: a row list of name plus link, used for the social image
     library, product and buy links, and anything else that is a directory
     rather than a funnel. Static entries carry a url, per rep entries carry a
     custom value and drop out when it is empty. */
  (SYS.lists || []).forEach(function (L) {
    /* A library that is ONE destination rather than a directory. A dropdown
       holding a single row costs two taps to reach one link, so it renders as
       a card with a primary button instead. */
    if (L.single) {
      html += '<div class="sk-group"><div class="sk-group-head">' +
        '<span class="sk-group-label">' + L.label + '</span><span class="sk-group-rule"></span>' +
        '<span class="sk-group-count">1</span></div>' +
        '<article class="sk-card" data-open="false">' +
          '<button class="sk-trigger" type="button" aria-expanded="false">' +
            '<span class="sk-mark" aria-hidden="true">' + icon(L.icon) + '</span>' +
            '<span><span class="sk-name">' + L.name + '</span>' +
            '<span class="sk-tease">' + L.tease + '</span></span>' +
            '<span class="sk-chev" aria-hidden="true">' + icon('down', 2) + '</span>' +
          '</button>' +
          '<div class="sk-panel"><div class="sk-panel-inner"><div class="sk-panel-pad">' +
            '<p class="sk-desc">' + L.single.desc + '</p>' +
            '<a class="sk-copy" href="' + L.single.url + '" target="_blank" rel="noopener">' +
              icon('image', 1.8) + L.single.cta + '</a>' +
          '</div></div></div></article></div>';
      return;
    }
    var rows = L.items.map(function (x) {
      var u = x.url || (x.cv ? cv(x.cv) : '');
      if (!u) return '';
      u = href(u);
      return '<li class="sk-prow"><a class="sk-prow-name" href="' + u + '" target="_blank" rel="noopener">' +
        x.name + '</a>' + (x.url
          ? '<a class="sk-chip sk-chip--go" href="' + u + '" target="_blank" rel="noopener">Open</a>'
          : '<button class="sk-copy sk-copy--mini" type="button" data-copy="' + u + '">' +
            icon('copy', 1.8) + '<span class="sk-copy-label">Copy</span></button>') + '</li>';
    }).filter(Boolean);
    if (!rows.length) return;
    if (L.perRep) liveCount += rows.length;
    html += '<div class="sk-group"><div class="sk-group-head">' +
      '<span class="sk-group-label">' + L.label + '</span><span class="sk-group-rule"></span>' +
      '<span class="sk-group-count">' + rows.length + '</span></div>' +
      '<article class="sk-card" data-open="false">' +
        '<button class="sk-trigger" type="button" aria-expanded="false">' +
          '<span class="sk-mark" aria-hidden="true">' + icon(L.icon) + '</span>' +
          '<span><span class="sk-name">' + L.name + '</span>' +
          '<span class="sk-tease">' + L.tease + '</span></span>' +
          '<span class="sk-chev" aria-hidden="true">' + icon('down', 2) + '</span>' +
        '</button>' +
        '<div class="sk-panel"><div class="sk-panel-inner"><div class="sk-panel-pad">' +
          '<ul class="sk-plist">' + rows.join('') + '</ul>' +
        '</div></div></div></article></div>';
  });

  linksHost.innerHTML = html;

  /* ---------- refer the system ----------
     Its own screen since it became a home destination, so it is one tap from home
     instead of buried under the funnel list. The link is per rep, so an unfilled
     custom value gets the setup message rather than a dead link or, worse, someone
     else's. It deliberately does NOT count toward liveCount: that gate is about
     whether the FUNNEL links are ready. */
  var referralHost = root.querySelector('[data-referral]');
  var affiliate = SYS.affiliate ? cv(SYS.affiliate.cv) : '';
  if (referralHost) {
    if (affiliate) {
      var au = href(affiliate);
      referralHost.innerHTML =
        '<article class="sk-card" data-open="true">' +
          '<button class="sk-trigger" type="button" aria-expanded="true">' +
            '<span class="sk-mark" aria-hidden="true">' + icon('share') + '</span>' +
            '<span><span class="sk-name">' + SYS.affiliate.name + '</span>' +
            '<span class="sk-tease">Share the Shark marketing system</span></span>' +
            '<span class="sk-chev" aria-hidden="true">' + icon('down', 2) + '</span>' +
          '</button>' +
          '<div class="sk-panel"><div class="sk-panel-inner"><div class="sk-panel-pad">' +
            '<p class="sk-desc">' + SYS.affiliate.desc + '</p>' +
            '<button class="sk-copy" type="button" data-copy="' + au + '">' +
              icon('copy', 1.8) + '<span class="sk-copy-label">Copy my link</span></button>' +
            '<div class="sk-url"><span class="sk-url-text">' + au.replace(/^https?:\/\//, '') + '</span>' +
              '<a class="sk-open" href="' + au + '" target="_blank" rel="noopener" aria-label="Open your affiliate link">' + icon('out', 1.8) + '</a></div>' +
          '</div></div></div></article>';
    } else {
      referralHost.innerHTML =
        '<div class="sk-setup"><h2>Finish your setup first</h2>' +
        '<p>Your referral link has not been added yet. Paste it into your affiliate ' +
        'link custom value and this page fills in automatically.</p></div>';
    }
  }

  /* ---------- copy to clipboard ----------
     Idle to done state machine: the label swaps to a confirmation for 1.9s and
     then restores, so the tap is acknowledged without a toast. */
  root.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-copy]') : null;
    if (!btn) return;
    var url = btn.getAttribute('data-copy');
    var label = btn.querySelector('.sk-copy-label');
    function done() {
      btn.setAttribute('data-state', 'done');
      if (label) label.textContent = 'Copied';
      setTimeout(function () {
        btn.removeAttribute('data-state');
        if (label) label.textContent = 'Copy my link';
      }, 1900);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, done);
    } else {
      var t = document.createElement('textarea');
      t.value = url; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (err) {}
      document.body.removeChild(t);
      done();
    }
  });

  /* ---------- accordions ----------
     State lives in data-open on the card, mirrored to aria-expanded on the
     trigger. One open at a time, per group of cards on the active screen. */
  root.addEventListener('click', function (e) {
    var trigger = e.target.closest ? e.target.closest('.sk-trigger') : null;
    if (!trigger) return;
    var card = trigger.closest('.sk-card');
    var screen = trigger.closest('.sk-screen');
    var willOpen = card.getAttribute('data-open') !== 'true';
    screen.querySelectorAll('.sk-card').forEach(function (c) {
      c.setAttribute('data-open', 'false');
      var t = c.querySelector('.sk-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
    if (willOpen) {
      card.setAttribute('data-open', 'true');
      trigger.setAttribute('aria-expanded', 'true');

      /* ---- land at the TOP of the card that just opened ----
         Joe, 2026-09-24, on a walkthrough video of the mobile hub: "there's
         still some sections where you click, depending on how you click, and it
         scrolls to the bottom of the section."

         Nothing here was scrolling, which is the bug. One card is open at a
         time, so opening a card COLLAPSES the one above it and the document
         loses that card's whole height from above the reader. The scroll offset
         does not move, so the viewport ends up parked inside the card that just
         opened. "Depending on how you click" is the tell: it only bites when the
         card you open sits BELOW the one already open, which is why it reads as
         intermittent.

         Same shape as the fix already proven on the funnel training pages: the
         panel animation is suppressed for the single layout pass where the
         target is measured, so the collapse above is already applied. Measuring
         without that pass reads the mid animation layout and lands just as
         wrong.

         The bar is sticky at top:0, so its height comes off the target or the
         card header lands underneath it. Measured, never hardcoded. */
      var skBar = root.querySelector('.sk-bar');
      var skBarH = skBar ? Math.round(skBar.getBoundingClientRect().height) : 0;
      screen.classList.add('sk-nosnap');
      void screen.offsetHeight;
      var skY = Math.max(0, card.getBoundingClientRect().top + window.scrollY - skBarH - 10);
      requestAnimationFrame(function () {
        screen.classList.remove('sk-nosnap');
        if (Math.abs(skY - window.scrollY) >= 4) {
          window.scrollTo({ top: skY, behavior: 'smooth' });
        }
      });
    }
  });

  /* ---------- video facade ----------
     The player is never in the markup: data-vimeo holds the numeric id and the
     iframe is injected on click, so a page carrying videos costs nothing until
     a viewer asks for one. */
  root.addEventListener('click', function (e) {
    var frame = e.target.closest ? e.target.closest('.sk-frame') : null;
    if (!frame) return;
    var id = frame.getAttribute('data-vimeo');
    if (!id) return;
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;width:100%;aspect-ratio:16/9';
    var f = document.createElement('iframe');
    f.src = 'https://player.vimeo.com/video/' + id + '?autoplay=1&title=0&byline=0&portrait=0';
    f.allow = 'autoplay; fullscreen; picture-in-picture';
    f.allowFullscreen = true;
    f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
    wrap.appendChild(f);
    frame.replaceWith(wrap);
  });

  /* ---------- menu sheet ---------- */
  var sheet = root.querySelector('[data-menu]');
  var lastFocus = null;
  function openMenu() {
    lastFocus = document.activeElement;
    sheet.hidden = false;
    document.body.style.overflow = 'hidden';
    sheet.querySelector('.sk-sheet-panel').focus();
  }
  function closeMenu() {
    sheet.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  root.querySelector('[data-menu-open]').addEventListener('click', openMenu);
  sheet.querySelectorAll('[data-menu-close]').forEach(function (el) {
    el.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !sheet.hidden) closeMenu();
  });

  /* ---------- router ----------
     Hash routed so the whole hub is one block at one URL, which is what lets it
     travel inside a snapshot as a single custom code socket. */
  var screens = root.querySelectorAll('.sk-screen');
  var backBtn = root.querySelector('[data-back]');
  var VALID = { home: 1, links: 1, leads: 1, promote: 1, support: 1, referral: 1 };

  function route() {
    var id = (location.hash || '').replace(/^#\/?/, '') || 'home';
    if (!VALID[id]) id = 'home';
    screens.forEach(function (s) {
      s.setAttribute('data-active', String(s.getAttribute('data-screen') === id));
    });
    root.setAttribute('data-route', id);
    backBtn.hidden = (id === 'home');
    navlist.querySelectorAll('.sk-nav').forEach(function (a) {
      if (a.getAttribute('href') === '#/' + id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (!sheet.hidden) closeMenu();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  backBtn.addEventListener('click', function () { location.hash = '#/home'; });
  route();

  /* the bar grows a hairline once the page has moved, so it separates from the
     content without drawing a permanent line across the top */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      root.setAttribute('data-scrolled', String(window.scrollY > 4));
      ticking = false;
    });
  }, { passive: true });


  /* ---------- setup state ----------
     An account with nothing filled in yet gets told what to do, not an empty
     screen. Shown INSTEAD of the funnel list, per the design system. */
  if (!liveCount) {
    linksHost.innerHTML =
      '<div class="sk-setup"><h2>Finish your setup first</h2>' +
      '<p>Your funnel links have not been added yet. Paste each one into the GLP ' +
      'Funnel Links custom values and this page fills in automatically.</p></div>';
  }

  /* ---------- home screen icon ----------
     Reps are told to add this to their home screen. Without an apple-touch-icon
     iOS screenshots the page and uses that as the icon, which looks broken.
     GHL always emits its own <link rel="icon"> pointing at the HighLevel
     default, so "skip if one exists" silently loses every time: drop the
     platform default first, then add ours, and leave anything deliberate. */
  (function () {
    var ICON = 'https://invokableapp.github.io/shark-pages/_brand/conectiv/';
    function head(tag, attrs) {
      if (attrs.rel) {
        var existing = document.head.querySelectorAll(tag + '[rel="' + attrs.rel + '"]');
        for (var i = 0; i < existing.length; i++) {
          if (/leadconnectorhq|stcdn/.test(existing[i].getAttribute('href') || '')) existing[i].remove();
          else return;
        }
      }
      var el = document.createElement(tag);
      for (var a in attrs) el.setAttribute(a, attrs[a]);
      document.head.appendChild(el);
    }
    head('link', { rel: 'apple-touch-icon', sizes: '180x180', href: ICON + 'icon-180.png' });
    head('link', { rel: 'icon', type: 'image/png', sizes: '512x512', href: ICON + 'icon-512.png' });
    head('meta', { name: 'apple-mobile-web-app-title', content: 'Conectiv Shark' });
    head('meta', { name: 'theme-color', content: '#2563EB' });
  })();

  /* ---------- add to home screen ----------
     CAN THIS BE AUTOMATIC? Only partly, and only on Android.
       iOS: Safari exposes NO API. Add to Home Screen is Share then Add, a manual
            gesture no script can trigger or fake, so instructions lead.
       Android: Chrome MAY fire beforeinstallprompt, a real one tap install. It
            is not guaranteed, so it is a bonus: when it fires the button
            installs directly and the sheet never opens. */
  (function () {
    var openBtn = root.querySelector('[data-a2hs-open]');
    var sheet   = root.querySelector('[data-a2hs-sheet]');
    if (!openBtn || !sheet) return;

    // already installed: the button would be pure noise, so it never appears
    var installed = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                    window.navigator.standalone === true;
    if (installed) return;

    var label   = openBtn.querySelector('[data-a2hs-label]');
    var stepsEl = sheet.querySelector('[data-a2hs-steps]');
    var videoEl = sheet.querySelector('[data-a2hs-video]');
    var watch   = sheet.querySelector('.sk-watch');

    /* One walkthrough per platform. The runtimes differ, so the hint is per
       platform rather than one static claim. */
    var VIDEO = {
      ios:     { src: 'https://assets.cdn.filesafe.space/k5tyIG2Q85sUQ1RlSxBo/media/6a85cfbf005891114d29ddef.mp4', hint: '(1 minute video)' },
      android: { src: 'https://assets.cdn.filesafe.space/k5tyIG2Q85sUQ1RlSxBo/media/6a85d91f9cca634f084ab692.mp4', hint: '(2 minute video)' }
    };
    var share = '<span class="sk-gl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m8.5 6.5 3.5-3.5 3.5 3.5"/><path d="M6 11H4.8A1.8 1.8 0 0 0 3 12.8v6.4A1.8 1.8 0 0 0 4.8 21h14.4a1.8 1.8 0 0 0 1.8-1.8v-6.4A1.8 1.8 0 0 0 19.2 11H18"/></svg>Share</span>';
    var kebab = '<span class="sk-gl"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>menu</span>';

    var STEPS = {
      ios: [
        'Tap the ' + share + ' button at the bottom of Safari.',
        'Scroll down the list and tap <b>Add to Home Screen</b>.',
        'Tap <b>Add</b> in the top right. The icon appears with your other apps.'
      ],
      android: [
        'Tap the ' + kebab + ' in the top right of Chrome.',
        'Tap <b>Install app</b>, or <b>Add to Home screen</b> if you do not see it.',
        'Confirm with <b>Install</b>. The icon appears with your other apps.'
      ]
    };
    /* Opening from inside another app's browser makes the real steps impossible,
       and it is common: reps reach this from a Facebook or Instagram message.
       Naming it saves the "it isn't there" support message. */
    var INAPP = /FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp/i.test(navigator.userAgent || '');
    var ua = navigator.userAgent || '';
    var guess = (/iPad|iPhone|iPod/.test(ua) || (ua.indexOf('Mac') > -1 && navigator.maxTouchPoints > 1))
      ? 'ios' : (/Android/i.test(ua) ? 'android' : 'ios');

    function paint(os) {
      sheet.querySelectorAll('.sk-seg-btn').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-os') === os));
      });
      var list = STEPS[os].map(function (t) { return '<li><span>' + t + '</span></li>'; }).join('');
      if (INAPP) {
        list = '<li><span>You opened this inside another app. Tap that app’s menu and choose ' +
               '<b>Open in ' + (os === 'ios' ? 'Safari' : 'Chrome') + '</b> first.</span></li>' + list;
      }
      stepsEl.innerHTML = list;
      /* Rebuilt on every switch so only the platform being viewed is fetched,
         and preload="none" keeps even that at zero bytes until play. These files
         are ~23MB each; preloading both would cost a rep 46MB for nothing. */
      videoEl.innerHTML = '<video controls playsinline preload="none" src="' + VIDEO[os].src + '"></video>';
      var hint = sheet.querySelector('[data-a2hs-size]');
      if (hint) hint.textContent = VIDEO[os].hint;
      if (watch) watch.open = false;
    }

    var lastA2hsFocus = null;
    function openSheet() {
      lastA2hsFocus = document.activeElement;
      paint(guess);
      sheet.hidden = false;
      document.body.style.overflow = 'hidden';
      var x = sheet.querySelector('.sk-sheet-x');
      if (x) x.focus();
    }
    function closeSheet() {
      // stop playback and drop the buffer, or audio keeps going behind the sheet
      var v = sheet.querySelector('video');
      if (v) { try { v.pause(); } catch (e) {} }
      videoEl.innerHTML = '';
      sheet.hidden = true;
      document.body.style.overflow = '';
      if (lastA2hsFocus && lastA2hsFocus.focus) lastA2hsFocus.focus();
    }

    sheet.addEventListener('click', function (e) {
      if (e.target.closest('[data-a2hs-close]')) { closeSheet(); return; }
      var seg = e.target.closest('.sk-seg-btn');
      if (seg) { guess = seg.getAttribute('data-os'); paint(guess); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sheet.hidden) closeSheet();
    });

    // Android's real install prompt, when the browser offers one
    var deferred = null;
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferred = e;
      label.textContent = 'Add this page to your home screen';
    });
    window.addEventListener('appinstalled', function () { openBtn.hidden = true; deferred = null; });

    openBtn.addEventListener('click', function () {
      if (deferred) {
        deferred.prompt();
        deferred.userChoice.then(function (r) {
          if (r && r.outcome === 'accepted') openBtn.hidden = true;
          /* dismissed: the browser will not re-offer, so fall back to the written
             steps rather than leaving a button that silently does nothing */
          else { deferred = null; label.textContent = 'How to add this to your home screen'; }
        });
        deferred = null;
        return;
      }
      openSheet();
    });

    label.textContent = 'How to add this to your home screen';
    openBtn.hidden = false;
  })();


  /* ---------- training video sheet ----------
     One sheet, any number of buttons. Everything a video needs travels on the
     button (id, title, natural pixel size), so the next one is markup only. */
  (function () {
    var sheet = root.querySelector('[data-video-sheet]');
    if (!sheet) return;
    var stage = sheet.querySelector('[data-video-stage]');
    var head  = sheet.querySelector('[data-video-heading]');
    var lastVideoFocus = null;

    function closeVideo() {
      /* dropping the iframe is what stops playback: pausing a cross origin player
         is not something this page is allowed to do, and a sheet that closes while
         audio keeps running is the add-to-home-screen bug all over again. */
      stage.innerHTML = '';
      stage.style.removeProperty('--sk-vid-ar');
      stage.style.removeProperty('max-width');
      sheet.hidden = true;
      document.body.style.overflow = '';
      if (lastVideoFocus && lastVideoFocus.focus) lastVideoFocus.focus();
    }

    root.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-video]') : null;
      if (!btn) return;
      var id = btn.getAttribute('data-video');
      if (!id) return;
      lastVideoFocus = btn;

      var w = parseFloat(btn.getAttribute('data-video-w')) || 16;
      var h = parseFloat(btn.getAttribute('data-video-h')) || 9;
      stage.style.setProperty('--sk-vid-ar', w + ' / ' + h);
      // capped by HEIGHT, so a portrait clip fits the sheet instead of scrolling it
      stage.style.maxWidth = 'calc(' + (w / h).toFixed(4) + ' * 62vh)';

      head.textContent = btn.getAttribute('data-video-title') || 'Watch';

      var f = document.createElement('iframe');
      f.src = 'https://player.vimeo.com/video/' + id + '?autoplay=1&title=0&byline=0&portrait=0&dnt=1';
      f.allow = 'autoplay; fullscreen; picture-in-picture';
      f.allowFullscreen = true;
      f.title = head.textContent;
      stage.appendChild(f);

      sheet.hidden = false;
      document.body.style.overflow = 'hidden';
      var x = sheet.querySelector('.sk-sheet-x');
      if (x) x.focus();
    });

    sheet.addEventListener('click', function (e) {
      if (e.target.closest('[data-video-close]')) closeVideo();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sheet.hidden) closeVideo();
    });
  })();

  /* ---------- scroll cue ----------
     Joe: the glance grid and the leads copy both end flush at the fold, so those
     screens read as finished and everything under them got ignored.

     MEASURED, never assumed. It appears only when the document really does
     continue past the viewport, and it retires on the first scroll of a screen,
     because once a rep has scrolled they know the page moves. Each route resets
     it, since every screen is a fresh question. */
  (function () {
    var cue = root.querySelector('[data-more]');
    if (!cue) return;
    var MIN = 140;          // less than this below the fold is not worth a prompt
    var MOVED = 24;         // a scroll this small still counts as "they know"
    var armed = false;

    function below() {
      var doc = document.documentElement;
      return Math.max(doc.scrollHeight, document.body.scrollHeight) -
             window.innerHeight - (window.scrollY || window.pageYOffset || 0);
    }
    function paint() {
      var show = armed &&
                 (window.scrollY || window.pageYOffset || 0) < MOVED &&
                 below() > MIN;
      cue.hidden = !show;
      cue.setAttribute('data-show', String(show));
    }
    function arm() {
      armed = true;
      paint();
      // the screen it just switched to may still be settling its fonts and images
      setTimeout(paint, 260);
    }

    window.addEventListener('scroll', function () {
      if ((window.scrollY || window.pageYOffset || 0) >= MOVED) armed = false;
      paint();
    }, { passive: true });
    window.addEventListener('resize', paint);
    window.addEventListener('hashchange', arm);
    // an accordion opening or closing changes the height under the fold
    if (window.ResizeObserver) new ResizeObserver(paint).observe(root);

    arm();
  })();

})();
