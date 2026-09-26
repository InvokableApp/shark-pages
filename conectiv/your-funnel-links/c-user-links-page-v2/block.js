(function () {
var SYS = {
  /* Dress the installed home screen app. Per system, never the engine's:
     these two were literals in the merged engine for a day and would have
     put "GLP Shark" in orange on every other system's phone. */
  appTitle:   'Conectiv Shark',
  themeColor: '#2563EB',
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

    /* RENAMED 2026-09-25, the same call Joe and Jess made for GLP on 2026-09-24
       ("we were getting rid of linktree yeah? swap out the words" / "should say
       Social Share Links"). Conectiv was missed in that pass and was still saying
       "Your linktree" to every rep. Wording matches GLP exactly so the two systems
       do not drift apart on the same label. */
    { label:"Social share links", items:[
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

  (window.__sharkHubPending = window.__sharkHubPending || []).push({
    scope: '.sk-conectiv-your-funnel-links-c-user-links-page',
    brandBase: 'https://invokableapp.github.io/shark-pages/_brand/conectiv/',
    showCardDesc: true,
    TRAINING: [
      { part: 1, emoji: '\uD83D\uDEE0\uFE0F', label: 'How does this funnel work?' },
      { part: 2, emoji: '\uD83D\uDE80',        label: 'How do I generate leads with this funnel?' },
      { part: 3, emoji: '\uD83D\uDCAC',        label: 'What to say to leads who come through this funnel?' }
    ],
    videoPage: {
      slug: 'c-what-is-conectiv',
      ariaLabel: 'Open your What Is Conectiv page',
      note: 'Your main domain has not been filled in yet, so this link cannot be built. Add it in your custom values and it appears here.'
    },
    /* "Find conversations to join". `repIdCv` only spreads reps across the term
       pool, so thirty of them do not land in one hashtag on one morning. It must
       be UNIQUE PER REP (a shared first name would collide them onto one term)
       and it is a value the socket ALREADY carries, so this needs no push-block. */
    search: {
      enabled: true,
      terms: 'https://invokableapp.github.io/shark-pages/_shared/search-terms/conectiv.json',
      repIdCv: 'conectiv__main_url'
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
