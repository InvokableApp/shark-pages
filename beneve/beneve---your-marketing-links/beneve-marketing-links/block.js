/* BENEVE / beneve---your-marketing-links / beneve-marketing-links
 *
 * THIS FILE IS THE CONFIG. Routing, card rendering, copy buttons, the product
 * list and the affiliate card all live in _shared/links-hub/v1/hub.js and are
 * shared by every rep hub. Only Beneve's own data is here.
 *
 * Link model: domain custom value plus a fixed slug per funnel (the Vital
 * model). It was MEASURED before being chosen, not assumed: all five Beneve
 * funnels sit on one domain and every step slug was verified serving.
 * Re-measure before any Beneve rep install, because a single rep on two
 * domains breaks the assumption for that rep. MARKETING-LINKS-PAGE-SOP §2.
 */
window.SHARK_HUB = {
  appTitle:   'Beneve Shark',
  themeColor: '#1E386A',
  brandDir:   'beneve',
  cvFolder:   'Beneve Funnel Links',
  nameCv: 'beneve_rep_first_name',
  domainCv: 'beneve_main_url',
  groups: [
    {
      label: "Start a conversation",
      items: [
        { icon: "leaf", name: "Hormone Lunchbox Guide",
          slug: "b-hormone-lunchbox", scripts: "https://sharksuite.ai/hormone-recipe-scripts",
          tease: "Free make ahead lunches",
          desc: "A free guide with make ahead lunches built around the vegetables that support your hormones. Good opener for anyone who feels tired and puffy by the middle of the afternoon." },
        { icon: "chart", name: "Natural GLP Foods Guide",
          slug: "b-glp-food-guide", scripts: "https://sharksuite.ai/glp-foods-guide-scripts",
          tease: "Foods that support GLP naturally",
          desc: "A free guide to the everyday foods that help the body make more of its own GLP-1, no shots required. Strong opener for the weight conversation, and it leads into Gut Advantage." },
        { icon: "coffee", name: "Clean Iced Coffee Recipes",
          slug: "b-clean-iced-coffee",
          tease: "Iced coffee without the junk",
          desc: "A free iced coffee recipe guide. Easy share for coffee drinkers who want to cut the sugar and the additives, and it leads into Original Coffee Sticks." }
      ]
    },
    {
      label: "Quizzes and tools",
      items: [
        { icon: "quiz", name: "Side Hustle Quiz",
          slug: "b-match-quiz", scripts: "https://sharksuite.ai/side-hustle-scripts",
          tease: "Sorts them into the right fit",
          desc: "A short quiz that sorts curious people into the kind of side hustle that suits them, then shows them where Beneve fits. Use it when someone is interested but not ready to talk." },
        { icon: "user", name: "Influencer Aptitude Test",
          slug: "b-aptitude-test",
          tease: "Is sharing Beneve a fit for them?",
          desc: "A short test that tells someone whether sharing products on social is a fit for them. Each result page speaks to their type and hands them straight into the opportunity." }
      ]
    }
  ],
  /* Every Beneve URL is beneve.com/{username}/... and the username is the ONLY thing
     carrying the rep's commission, so the whole catalogue composes from one custom
     value instead of one per product. All 28 slugs were verified live against
     beneve.com on 2026-09-04 (a wrong slug serves a stub, so the check is real).
     Adding a product Beneve launches later is an edit here and a git push, with no
     write to any rep account. */
  compose: { cv: 'beneve_user_name', base: 'https://beneve.com/{id}' },
  lists: [
    { label: 'Start here', icon: 'cart', name: 'Shop and opportunity',
      tease: 'Your shop, and the join link', perRep: true, items: [
        { name: "Beneve Shop",              path: "customer/shop" },
        { name: "Become an Influencer",     path: "customer/become-an-influencer" },
        { name: "4-Day Sampler",            path: "customer/product-default/4-day-sampler" }
      ] },
    /* Beneve's own shop grouping and its own order, so this list and beneve.com
       never disagree in front of a customer. */
    { label: 'Individual products', icon: 'leaf', name: 'Every product link',
      tease: 'All 18, ready to copy', perRep: true, items: [
        { name: "Renew",                          path: "customer/product-default/renew" },
        { name: "Luxe Liquid Collagen Peptides",  path: "customer/product-default/luxe-liquid-collagen-peptides" },
        { name: "Creatine + HMB",                 path: "customer/product-default/creatine-hmb" },
        { name: "Amino Surge",                    path: "customer/product-default/amino-surge" },
        { name: "GlucoGuard",                     path: "customer/product-default/glucoguard" },
        { name: "Glutathione+",                   path: "customer/product-default/glutathione" },
        { name: "Original Coffee Tub",            path: "customer/product-default/original-coffee-tub" },
        { name: "Original Coffee Sticks",         path: "customer/product-default/original-coffee-sticks" },
        { name: "Coffee Lite Tub",                path: "customer/product-default/coffee-lite-tub" },
        { name: "Coffee Lite Sticks",             path: "customer/product-default/coffee-lite-sticks" },
        { name: "Watermelon Berry Tub",           path: "customer/product-default/watermelon-berry-tub" },
        { name: "Watermelon Berry Sticks",        path: "customer/product-default/watermelon-berry-sticks" },
        { name: "Tropical Sunrise Tub",           path: "customer/product-default/tropical-sunrise-tub" },
        { name: "Tropical Sunrise Sticks",        path: "customer/product-default/tropical-sunrise-sticks" },
        { name: "Electrolytes Tub",               path: "customer/product-default/electrolytes-tub" },
        { name: "Electrolytes Sticks",            path: "customer/product-default/electrolytes-sticks" },
        { name: "Gut Advantage Capsules",         path: "customer/product-default/gut-advantage-capsules" },
        { name: "Gut Advantage Powder",           path: "customer/product-default/gut-advantage-powder" }
      ] },
    { label: 'X24 Bundles', icon: 'chart', name: 'X24 bundle links',
      tease: 'Sculpt and Trim bundles', perRep: true, items: [
        { name: "Sculpt Core Bundle",      path: "customer/product-default/sculpt-core-bundle" },
        { name: "Sculpt Advanced Bundle",  path: "customer/product-default/sculpt-advanced-bundle" },
        { name: "Sculpt Elite",            path: "customer/product-default/sculpt-elite" },
        { name: "Trim Core Powder",        path: "customer/product-default/trim-core-powder" },
        { name: "Trim Core Capsule",       path: "customer/product-default/trim-core-capsule" },
        { name: "Trim Advanced Powder",    path: "customer/product-default/trim-advanced-powder" },
        { name: "Trim Advanced Capsule",   path: "customer/product-default/trim-advanced-capsule" },
        { name: "Trim Elite Powder",       path: "customer/product-default/trim-elite-powder" },
        { name: "Trim Elite Capsule",      path: "customer/product-default/trim-elite-capsule" }
      ] }
  ],
  /* Beneve records its own iPhone walkthrough, so it overrides the shared iOS
     recording. Android is not overridden and keeps the shared one. */
  a2hsVideo: {
    ios: { src: 'https://assets.cdn.filesafe.space/k5tyIG2Q85sUQ1RlSxBo/media/6a98637a8a50b9d88a1b76ff.mp4', hint: '(1 minute video)' }
  },
  affiliate: { cv: 'beneveshark_affiliate_link', name: 'Your Beneve Shark affiliate link',
    desc: 'This is your affiliate link for the Beneve Shark marketing system itself, not for product and not for the opportunity. Send it to anyone who wants the funnels, emails and automations you are running. If they buy the system through your link, the sale is credited to you.' }
};

/* Load the shared engine. It reads window.SHARK_HUB, which is set above, so the
   config must come first. Version is PINNED: editing v1 reaches every page
   already on it, so a redesign forks v2 and pages move deliberately. */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/links-hub/v1/hub.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();
