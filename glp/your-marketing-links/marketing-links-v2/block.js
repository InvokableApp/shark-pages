(function () {
var SYS = {
  /* Dress the installed home screen app. Per system, never the engine's:
     these two were literals in the merged engine for a day and would have
     put "GLP Shark" in orange on every other system's phone. */
  appTitle:   'GLP Shark',
  themeColor: '#EC5E2A',
  nameCv: 'rep_first_name',
  domainCv: null,
  /* ⚠️ NOT `domainCv`. Setting that one flips funnelUrl() into domain+slug
     mode, and every GLP card addresses its funnel by a full-link custom value
     (`cv:`), not a `slug:` - so borrowing it would blank every funnel link on
     the page. This key is read ONLY for how-to urls.

     Which custom value holds "the rep's domain" is per system: GLP reuses the
     email sending domain, Conectiv has conectiv__main_url, Vital differs again.
     So it is config, never hardcoded. (Jeff, 2026-09-23.) */
  howtoDomainCv: 'your_email_designated_domain',
  /* The "2 minute customer video page" the promote script tells a rep to send.
     It is a STEP in the rep's own weight-loss quiz funnel, so it is built from
     the same domain CV above plus this slug, exactly like the how-to links.
     Jeff, 2026-09-24: "cant we use their domain CV then the step slug?"

     Built rather than stored because there is no custom value for this page and
     adding one would mean filling it by hand in every account forever. The slug
     is identical across every GLP account (checked on all 8 carrying this hub),
     which is what makes deriving it safe. If a system ever renames that step,
     change it HERE, not in the markup. */
  videoPageSlug: 'products-info',
  /* Joe, 2026-09-24: a "Fast Start Training" tile above the others, pointing at
     this system's training hub. System level, not per rep: one page serves
     everyone, so it is a URL in config rather than a custom value. Each system
     sets its own when the hub is ported; leave it null and the tile does not
     render, which is the right answer for a system with no hub yet.
     Verified 2026-09-24: /training is the real page (titled "Training Hub").
     /training-hub serves the same content and /fast-start is the catch-all. */
  training: 'https://glpshark.com/training',
  /* Joe's categories, Sep 2026. The old five (start a conversation / quizzes /
     share the product / explain ORYGN / recruit) were sorted by what the rep
     DOES with a link. These sort by what the funnel SELLS on the back end,
     which is Jeff's rule: "if a funnel promotes a product on the backend it
     goes there". So a quiz is not its own group any more, it sits with whatever
     it ends up selling.

     ⚠️ `howto` is the PUBLISHED page on glpshark.com, not the how-to step that
     travels inside each buyer's own funnel. One shared training page serves
     every account, which is why it is a literal URL and not derived from the
     rep's link custom value.

     🪤 Do NOT probe for these slugs by fetching and checking the status code.
     A GLP domain has no 404: every unknown slug serves the sales page with a
     200, so half of them "exist". What separates them is SIZE - the catch-all
     is 1,614,651 bytes, a real how-to page is 77-80KB - and the definitive
     answer is the manifest install plus the page's own data-shark-block. Four
     of these were found that way on 2026-09-23; the obvious guesses were wrong
     twice (it is glp-workoutS-training, not glp-workout-guide-training, and
     opportunity-COLD-training, not opportunity-ads-training).

     ⚠️ Two cards still have no `howto`, deliberately:
       - "What I Do" Funnel. No page exists. The near-miss candidate,
         /personal-branded-training, is the how-to for the Personal Branded One
         Pager, which Jess RETIRED - wiring it would train reps on a dead
         funnel. Joe's own asset doc leaves this link blank too.
       - Drops, ads and social. The only unclaimed page is
         /orygn-products-training ("ORYGN Products Funnel"), which is a
         plausible match and not a proven one. That funnel is also one of the
         four Joe is dropping from the new snapshot.

     ⚠️ `desc` is no longer rendered. Joe, 2026-09-23 (Figma #11): "remove this
     (for all sections) - this information is in the 'how do I generate leads
     with this funnel?'" - the paragraph said the same thing the part 2 training
     row links to, twice on the same card. It is kept in the data because it is
     the only place each funnel's job is written down in plain language for
     whoever edits this file next. Do not re-render it without asking. */
  /* ⚠️ EMPTIED, NOT DELETED, same as _listsOff below. Joe is retiring the High
     Protein Recipe Guide funnel and Jess is deleting it from buyer accounts
     (2026-09-24). The tile has to go FIRST: deleting a funnel does not clear
     protein_recipe_guide_funnel_link, so a hub that still lists it would point
     every rep at a dead link. A row whose url does not resolve renders nothing
     (see `if (!full) return ''` in the group renderer), so lifting the item out
     here removes the card from every account on one push.

     Removed from marketing-links-v2 ONLY. Jeff, 2026-09-24: "just take it off
     the accounts that have the v2" - the v1 hub keeps its tile.

     The two data-cv bridges for this funnel stay in block.html on purpose. They
     are inert with no item reading them, and if the CVs are deleted along with
     the funnel the renderer already treats an unsubstituted {{...}} as empty. */
  _itemsOff: [
      { cv: 'protein_recipe_guide_funnel_link', icon: 'leaf', name: 'High Protein Recipe Guide',
        tease: 'Recipes and grocery list',
        howtoSlug: 'orygn-recipe-guide-how-to',
        canva: 'https://canva.link/n6t92pxvso2744m',
        howto: 'https://glpshark.com/protein-recipe-guide-training',
        print: 'https://canva.link/luaureyrm9zlnx3',
        guides: [{ label: 'Access / Print / Share The Guide', cv: 'protein_recipe_guide_pdf_url' }],
        desc: 'A free high protein recipe guide and grocery list. Best for anyone trying to lose weight without giving up the food they like.' },
  ],
  groups: [
    { label: 'Product funnels', items: [
      { cv: 'glp_foods_guide_funnel_link', icon: 'leaf', name: 'Natural GLP Foods Guide',
        tease: 'Free foods guide',
        howtoSlug: 'glp-food-guide-how-to',
        howto: 'https://glpshark.com/glp-food-guide-training',
        canva: 'https://canva.link/gszpkrgjxsn7fga',
        print: 'https://canva.link/q84wz59vwmx3oi1',
        guides: [{ label: 'Access / Print / Share The Guide', cv: 'glp_food_guide_pdf_url' }],
        desc: 'A free guide to the foods that support GLP naturally. Your widest opener, it works on anyone curious about weight without mentioning the product.' },
      { cv: 'glp_workout_guide_funnel_link', icon: 'dumbbell', name: 'GLP Workout Guide',
        tease: 'Free workout download',
        howtoSlug: 'how-to-use-12',
        howto: 'https://glpshark.com/glp-workouts-training',
        print: 'https://canva.link/zbk14hqzyp51rrj',
        guides: [{ label: 'Access / Print / Share The Guide', cv: 'glp_workout_guide_pdf_url' }],
        desc: 'A free workout guide built for people on GLP medication, where holding muscle matters as much as losing weight.' },
      { cv: 'ignyt_sample_funnel_link', icon: 'gift', name: 'Test-Drive IGNYT Funnel',
        tease: 'For folks who want to try out IGNYT.',
        howtoSlug: 'ignyt-sample-how-to',
        howto: 'https://glpshark.com/ignyt-sample-training',
        canva: 'https://canva.link/qtfm73vucfijq5z',
        desc: 'Sends a free 3 day IGNYT trial to their door. They hand you an address and expect you to make contact to confirm it, so every request is a conversation you are invited into.' },
      { cv: 'weight_loss_quiz_funnel_link', icon: 'quiz', name: 'Weight Loss Supplement Quiz',
        tease: 'Recommends the right support',
        howtoSlug: 'weight-loss-supplement-recommendation-quiz-funnel-how-to-use',
        howto: 'https://glpshark.com/weight-loss-quiz-training',
        desc: 'A short quiz that recommends the right weight support and lands them on the DROPS recommendation. Use it when someone is interested but unsure what to take.' },
      { cv: 'drops_funnel_link', icon: 'drop', name: 'Drops, warm leads',
        tease: 'For people who already know you',
        howtoSlug: 'how-to-use-3',
        howto: 'https://glpshark.com/drops-funnel-training',
        desc: 'The DROPS information page for people who have already spoken with you. Straight to the product, no warm up.' },
      { cv: 'drops_ads_funnel_link', icon: 'drop', name: 'Drops, ads and social',
        tease: 'For cold traffic',
        howtoSlug: 'how-to-use-13',
        desc: 'The DROPS funnel built for cold traffic. Captures first, then explains, so post it publicly or run ads to it.' } ]},

    { label: 'Recruiting funnels', items: [
      { cv: 'side_hustle_quiz_funnel_link', icon: 'quiz', name: 'Side Hustle Quiz',
        tease: 'Finds their work-from-home fit',
        howtoSlug: 'tour-funnel-how-to-use-wfh-quiz',
        howto: 'https://glpshark.com/side-hustle-quiz-training',
        desc: 'Sorts people into the work from home model that suits them, then shows where ORYGN fits. Good for the curious but not yet ready.' },
      { cv: 'opportunity_warm_funnel_link', icon: 'users', name: 'Opportunity, warm leads',
        tease: 'For people who asked about the business',
        howtoSlug: 'how-to-use-2',
        howto: 'https://glpshark.com/opportunity-warm-training',
        desc: 'The business explained, for people who have already told you they want to hear more.' },
      { cv: 'opportunity_funnel_link', icon: 'users', name: 'Opportunity, ads and social',
        tease: 'For cold traffic',
        howtoSlug: 'how-to-use-1',
        howto: 'https://glpshark.com/opportunity-cold-training',
        desc: 'The recruiting funnel for cold traffic. Captures first, then explains the business.' } ]},

    /* Joe's '"what I do" funnel' is the what-is page: for GLP that is the ORYGN
       Tour, whose step slug is literally /what-is-orygn. Jeff, 2026-09-17.
       (The Personal Branded One Pager would have been the other candidate and is
       retired, per Jess the same day.) */
    { label: '"What I do" funnel', items: [
      { cv: 'orygn_tour_funnel_link', icon: 'info', name: '&#8220;What I Do&#8221; Funnel',
        tease: 'A page that explains what you do',
        howtoSlug: 'tour-funnel-how-to-use1',
        /* Joe, 2026-09-23, voice note: "we don't want the 2nd and 3rd tabs, so
           the how I generate leads and the what to say to leads when they come
           in tabs for that one. We just want the how does this funnel work."
           This mirrors the training page, which is built data-parts="1" - so
           the rows we were showing linked to #part-2 and #part-3 anchors that
           do not exist on it. */
        parts: 1,
        desc: 'The full tour. Products, the opportunity and the comp plan in one place, for anyone who asks what ORYGN actually is, and what you are doing with it.' } ]},

    /* CONFIRMED 2026-09-23. This group was an inference: Joe listed "your
       linktree" as a category and GLP had no page by that name, so the
       Navigation Page was mapped to it on a guess. Joe's Figma pin #10 lands on
       that row and reads "Linktree page", so the mapping was right and the row
       now carries his word for it.
       REPOINTED 2026-09-23 for the v2 snapshot: the Navigation Page funnel this
       pointed at does not exist in v2, so the tile rendered dead. v2 ships a real
       page for this - "Links Page for Sharing On Social Profiles" (/your-links) -
       and its custom value is your_links_funnel_link. */
    /* RENAMED 2026-09-24. Joe: "we were getting rid of linktree yeah? swap out
       the words." Jess: "should say Social Share Links."
       ⚠️ That note used to say "display copy only, the block folder / funnel / step
       slug / custom value all still say linktree". Two thirds of that was wrong and
       it made the cleanup look more expensive than it was: the FUNNEL is "Links Page
       for Sharing On Social Profiles", the step slug is how-to-use-links and the
       custom value is your_links_funnel_link. All three already said "links". The
       block FOLDER was the only holdout, and it was renamed glp-linktree -> glp-links
       on 2026-09-25 (Jeff). The reason it was left alone on the 24th still held then:
       the folder name is baked into every shipped socket, so moving it costs a sweep
       of every account. What changed is that the sweep is happening anyway, to add the
       data-cv-* declarations, so the rename rides along instead of paying for itself.
       NOTHING about a rep's URLs moves. */
    { label: 'Social share links', items: [
      { cv: 'your_links_funnel_link', icon: 'compass', name: 'Social share links page',
        tease: 'Let them choose their path',
        howtoSlug: 'how-to-use-links',
        /* Joe, 2026-09-23: same call as "What I Do". The Linktree training
           page is data-parts="1", so rows 2 and 3 pointed at #part-2 and
           #part-3 anchors that are not on it. */
        parts: 1,
        howto: 'https://glpshark.com/navigation-page-training',
        desc: 'One page that lets people pick their own direction, product or opportunity. Strong link for social bios and broad ads.' } ]},

    /* Joe: "put replicated site links here (whatever is relevant to the system)".
       For GLP that is the ORYGN replicated site, which arrives as two per rep
       custom values. These are the company's pages, not funnels the rep built. */
    { label: 'Your company links', items: [
      { cv: 'rep_buy_link', icon: 'cart', name: 'Product link, for customers',
        tease: 'Your replicated ORYGN store',
        desc: 'Your own ORYGN store link. Send it to anyone ready to buy, and the order is credited to you.' },
      { cv: 'distributor_buy_link', icon: 'users', name: 'Recruitment link, for distributors',
        tease: 'Your replicated sign-up page',
        desc: 'Your ORYGN sign-up link, for anyone who has decided to join the business under you.' } ]}
  ],
  /* ⚠️ EMPTIED, NOT DELETED. Joe, 2026-09-23: "Remove social content section".
     The renderer drops an empty lists[], so moving the entry into _listsOff is
     the whole removal - and the five Canva urls survive in the file for the day
     he wants the section back, rather than having to be dug out of git. */
  lists: [],
  _listsOff: [
    { label: 'Social content', icon: 'image', name: 'Ready to post images',
      tease: 'Product, opportunity and lead magnet', items: [
      { name: 'Product images, 1x1',       url: 'https://canva.link/qryqd6ykd8cj52m' },
      { name: 'Product images, 9x16',      url: 'https://canva.link/x7jlmu1gmeo5umf' },
      { name: 'Opportunity images, 1x1',   url: 'https://canva.link/wpssx0sbep1xhej' },
      { name: 'Opportunity images, 9x16',  url: 'https://canva.link/d43ep73ca1unbjn' },
      { name: 'Recipe lead magnet images', url: 'https://canva.link/n6t92pxvso2744m' } ] }
  ],
  affiliate: { cv: 'glpshark_affiliate_link', name: 'Your GLP Shark affiliate link',
    desc: 'This is your affiliate link for the GLP Shark marketing system itself, not for product and not for the opportunity. Send it to anyone who wants the funnels, emails and automations you are running. If they buy the system through your link, the sale is credited to you.' }
};
  (window.__sharkHubPending = window.__sharkHubPending || []).push({
    scope: '.sk-glp-your-marketing-links-marketing-links',
    brandBase: 'https://invokableapp.github.io/shark-pages/_brand/glp/',
    supportTease: 'Email, text, or join office hours.',
    guideSub: 'Print the guide or quickly access the link',
    /* Find conversations to join. `repIdCv` is a custom value the socket
       ALREADY carries, so this needs no push-block to any account. It only
       spreads reps across the term pool, so thirty of them do not land in
       one hashtag on one morning. */
    search: {
      /* OFF at Joe's request, 2026-09-26. Flip to true to bring the tile,
         the screen and the #/search route back; nothing else is needed. */
      enabled: false,
      terms: 'https://invokableapp.github.io/shark-pages/_shared/search-terms/glp.json',
      repIdCv: 'your_email_designated_domain'
    },
    SYS: SYS
  });
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/links-hub/v2/links-hub.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script"); s.src = BASE + p; s.async = false;
    s.setAttribute("data-shark-shared", p); document.head.appendChild(s);
  });
})();
