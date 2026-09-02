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
  lists: [
    { label: 'Direct product links', icon: 'cart', name: 'Product links',
      tease: 'Every product link, ready to copy', perRep: true, items: [
    { cv: "beneve_buy_link",             name: "Beneve Shop" },
    { cv: "beneve_opportunity_url",      name: "Become an Influencer" },
    { cv: "beneve_gut_advantage_link",   name: "Gut Advantage Capsules" },
    { cv: "beneve_glutathione_link",     name: "Glutathione+ with DIM" },
    { cv: "beneve_original_coffee_link", name: "Original Coffee Sticks" }
  ] }
  ],
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
