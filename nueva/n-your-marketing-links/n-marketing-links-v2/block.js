(function () {
var SYS = {
  /* Dress the installed home screen app. Per system, never the engine's:
     these two were literals in the merged engine for a day and would have
     put "GLP Shark" in orange on every other system's phone. */
  appTitle:   'Nueva Shark',
  themeColor: '#0ABAB5',
  nameCv: 'nueva_rep_first_name',
  /* The system's training hub. NOT KNOWN YET: no live host was found for this
     system on 2026-09-24, so the Fast Start Training tile does not render. Set
     it to the URL and the tile appears; that is the only change needed. */
  training: null,
  domainCv: 'nueva_main_url',
  /* The rep's own how-to page is a STEP INSIDE each funnel, so it sits on the
     rep's own domain, and nueva_main_url is already on the block root. Nueva
     has no central nuevashark.com mirror, so there is no `howto` fallback to
     write: on the snapshot, where this value holds its onboarding instruction
     text, the training rows render nothing, which is correct.
     NOT nueva_email_designated_domain, which is the GHL sending domain and
     does not serve funnel pages. */
  howtoDomainCv: 'nueva_main_url',
  /* Joe's v2 categories: sorted by what the funnel SELLS on the back end, not
     by what the rep DOES with it. A quiz is not its own group any more, it
     sits with whatever it sells.
     No "your linktree" group here, unlike Conectiv. Jeff, 2026-09-24: the
     rep's links page is the page they are already standing on. */
  groups: [
    { label:"Product funnels", items:[
      { slug:"n-no-crash-plan", howtoSlug:"n-no-crash-plan-how-to", icon:"chart",
        name:"The No Crash Plan",
        tease:"Free 14 day plan for the 3pm crash",
        canva:"https://canva.link/azr1yqqdtzrl5hc",
        guides:[
          { label:"Read / print / share the plan", cv:"nueva_no_crash_plan_guide_pdf_url" },
          { label:"The supplement guide you send on request", cv:"nueva_no_crash_plan_supplement_pdf_url" },
          { label:"The plan, print ready in Canva", url:"https://canva.link/190d9m8801yjmpf" },
          { label:"What To Take, print ready in Canva", url:"https://canva.link/1mxvpi5mnuzmtwp" }
        ],
        desc:"A free fourteen day plan for the afternoon crash. It ships under Everyday Well, a neutral brand with no Nueva mark on it, so you can post it into a group. The people who ask you for the second guide are the ones worth your time, because asking costs them something, and you get a text the moment they do." },
      { slug:"n-tone-and-tighten-guide", howtoSlug:"n-tone-and-tighten-guide-how-to", icon:"leaf",
        name:"Tone and Tighten Guide",
        tease:"A free guide, no shots involved",
        canva:"https://canva.link/gmt6ngmhri0ce3d",
        guides:[
          { label:"Read / print / share the guide", cv:"nueva_tone_and_tighten_guide_pdf_url" },
          { label:"Which One Is Right, the companion guide", cv:"nueva_tone_and_tighten_companion_pdf_url" },
          { label:"The guide, print ready in Canva", url:"https://canva.link/c7miytdp4ku0py8" },
          { label:"Which One Is Right, print ready in Canva", url:"https://canva.link/97sdbxn2w14y0w9" }
        ],
        desc:"A free workout and food guide for women who already train and want the work to show: eight twenty minute sessions and twelve high protein recipes. The ones who ask for the companion guide, the one that says which supplements are worth the money, are the ones ready to talk." } ]},

    { label:"Opportunity funnels", items:[
      { slug:"n-match-quiz", howtoSlug:"n-side-hustle-how-to", icon:"quiz",
        name:"Side Hustle Quiz",
        tease:"Is the opportunity a fit for them?",
        canva:"https://canva.link/bngpbfh4y2eme3c",
        desc:"A short quiz that sorts curious people into the kind of side hustle that suits them, then hands them into the Nueva opportunity page. Use it on someone who is interested in earning but not ready to talk to you yet." } ]},

    { label:"\"What I do\" funnel", items:[
      { slug:"n-what-is-nueva", howtoSlug:"n-what-is-nueva-how-to", icon:"info",
        /* two parts, and the second is the scripts one: this funnel is sent in a
           DM, so it has no lead-generation part to link to */
        parts:["work","close"],
        name:"What Is Nueva",
        tease:"The two minute overview",
        desc:"The whole company in one page. What Nueva is, what the range does and who it is for, written to be sent to anyone who asks what you are doing. It is the page to send the moment someone says yes, tell me more." } ]}
  ],
  /* WHOLE CATALOG FROM ONE CUSTOM VALUE. Nueva attributes by SUBDOMAIN: a rep's
     entire replicated site lives at {username}.nuevalife.com and every product
     is the same path on it, so a product link is DERIVED, never stored, exactly
     the way a funnel link is derived from nueva_main_url plus a slug.

     What this replaces: four per-product custom values covering four of
     twenty-eight SKUs. The alternative was minting twenty-four more for a rep
     to paste by hand, each one a chance to paste someone else's subdomain and
     credit them the sale.

     ⚠️ compose() RENDERS NOTHING WHEN THE USERNAME IS EMPTY, and that is the
     point. A Nueva product URL with no subdomain resolves to a real page with
     NO sponsor on it, so a link that silently loses the rep's credit is worse
     than no link at all. Every row below disappears until it is filled.

     ⚠️ THE CODES COME FROM NUEVA'S OWN CATALOG PAGE, shop.html?catekey=allproducts,
     never a hand-written list. A first pass carried 27 hand-listed codes and
     silently missed all six BEYOND skus, which is the line the field is
     currently being sold on. */
  compose: { cv: 'nueva_user_name', base: 'https://{id}.nuevalife.com' },
  lists: [
    { label: 'Direct product links', icon: 'cart', name: 'Product links',
      tease: 'Every product, ready to copy', perRep: true, items: [
        { path: "shop.html",        name: "Nueva Shop (everything)" },
        /* ⚠️ THE OPPORTUNITY LINK IS THE CORPORATE PAGE, NOT A COMPOSED REP ONE,
           and that is Jeff's call (2026-09-22). It is the one row here that stays
           a stored custom value while every product row is derived. Do not "fix"
           it to opportunity.html under the rep subdomain. */
        { cv: "nueva_opportunity_url", name: "Become a Social Marketer" },
        { path: "product/mp8916-vm", name: "Nitro" },
        { path: "product/nv-rev",    name: "Revive" },
        { path: "product/mp8907-vm", name: "Snow Slim" },
        { path: "product/mp8900",    name: "Snow Collagen" },
        { path: "product/mp8908",    name: "Morning Coffee" },
        { path: "product/nv1210",    name: "Boost" },
        { path: "product/nv1208",    name: "Alive" },
        { path: "product/nv-bio",    name: "Biotic" },
        { path: "product/mp8903",    name: "Body" },
        { path: "product/bb7035",    name: "Elevate" },
        { path: "product/bb7037",    name: "Beauty" },
        { path: "product/mp8924",    name: "Nitro+ 12-Pack Case" },
        { path: "product/nvtravel",  name: "Travel" }
      ] },
    /* Beyond gets its own group rather than six more rows in the product list.
       It is a LINE, not a product (one BeyondMI story, two formulas, four ways
       to buy them), it launched 2026-09-09 and is what the field is currently
       being pushed on, so a rep looking for it should not have to read past
       Alive to find it. */
    { label: 'Beyond', icon: 'cart', name: 'Beyond links',
      tease: 'Daily, Advanced and the combos', perRep: true, items: [
        { path: "product/nv1256", name: "Beyond Daily" },
        { path: "product/nv1257", name: "Beyond Advanced" },
        { path: "product/nv1258", name: "Beyond Daily Duo" },
        { path: "product/nv1259", name: "Beyond Daily + Advanced Duo" },
        { path: "product/nv9005", name: "Beyond Choice" },
        { path: "product/nv9006", name: "Beyond Body+ Combo" }
      ] },
    { label: 'Bundles and systems', icon: 'cart', name: 'Bundle links',
      tease: 'The packs, ready to copy', perRep: true, items: [
        { path: "product/nv9988", name: "Signature Power Pack" },
        { path: "product/bb7032", name: "Ultimate Pack" },
        { path: "product/nv9999", name: "Body Kickstart Bundle" },
        { path: "product/mp8943", name: "Slim Body System" },
        { path: "product/bb7036", name: "Body+ Elevate Pack" },
        { path: "product/mp8941", name: "Body System" },
        { path: "product/bb7033", name: "Slim Body+ System" },
        { path: "product/mp8909", name: "Nitro Set" },
        { path: "product/nv3101", name: "Slim Body Kickstart" },
        { path: "product/bb7031", name: "Choice Pack" },
        { path: "product/bb7034", name: "Body+" },
        { path: "product/nv3100", name: "Body Kickstart" }
      ] },
    { label: 'Merch and events', icon: 'cart', name: 'Other links',
      tease: 'Bottles, brochures, tickets', perRep: true, items: [
        { path: "product/nv3016",         name: "Teal 40oz Tumbler" },
        { path: "product/mp8923",         name: "Creator Bottle (Black)" },
        { path: "product/nv3008",         name: "Nitro Brochure (25-pack)" },
        { path: "product/nv-pmm-fall-t1", name: "Growth Summit ticket" }
      ] }
  ],
  affiliate: { cv: 'nueva_shark_affiliate_link', name: 'Your Nueva Shark affiliate link',
    desc: 'This is your affiliate link for the Nueva Shark marketing system itself, not for product and not for the opportunity. Send it to anyone who wants the funnels, emails and automations you are running. If they buy the system through your link, the sale is credited to you.' }
};

  (window.__sharkHubPending = window.__sharkHubPending || []).push({
    scope: '.sk-nueva-n-your-marketing-links-n-marketing-links-v2',
    brandBase: 'https://invokableapp.github.io/shark-pages/_brand/nueva/',
    showCardDesc: true,
    /* Nueva builds this from its own domain + slug, keeps the old button-first
       order and its own wording. Joe's Figma #41 order is GLP-only for now. */
    videoPage: {
      slug: 'n-what-is-nueva',
      ariaLabel: 'Open your What Is Nueva page',
      note: 'Your main domain has not been filled in yet, so this link cannot be built. Add it in your custom values and it appears here.'
    },
    TRAINING: [
      { key: 'work',  part: 1, emoji: '\uD83D\uDEE0\uFE0F', label: 'How does this funnel work?' },
      { key: 'leads', part: 2, emoji: '\uD83D\uDE80',        label: 'How do I generate leads with this funnel?' },
      { key: 'close', part: 3, emoji: '\uD83D\uDCAC',        label: 'What to say to leads who come through this funnel?' }
    ],
    /* "Find conversations to join". `repIdCv` only spreads reps across the term
       pool, so thirty of them do not land in one hashtag on one morning. It must
       be UNIQUE PER REP (a shared first name would collide them onto one term)
       and it is a value the socket ALREADY carries, so this needs no push-block. */
    search: {
      enabled: true,
      terms: 'https://invokableapp.github.io/shark-pages/_shared/search-terms/nueva.json',
      repIdCv: 'nueva_user_name'
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
