/* NUEVA / n-your-marketing-links / n-marketing-links
 *
 * THIS FILE IS THE CONFIG. Routing, card rendering, copy buttons, the product list and the
 * affiliate card all live in _shared/links-hub/v1/hub.js and are shared by every rep hub.
 * Only Nueva's own data is here.
 *
 * ⚠️ EVERY `cv` BELOW EXISTS IN THE ACCOUNT. A hub card whose custom value was never created
 * renders an empty link and a copy button that copies nothing, and neither errors. Checked
 * against Shark Beta 2026-09-08; nueva_shark_affiliate_link was minted for this page.
 *
 * ⚠️ EVERY `slug` BELOW IS A REAL STEP on the funnel it names, verified serving. The demo this
 * replaces invented slugs for funnels that did not exist (n-hormone-lunchbox, n-clean-iced-coffee,
 * n-aptitude-test), so most of its cards were dead links.
 *
 * Link model: domain custom value plus a fixed slug per funnel (the Vital model). All four Nueva
 * funnels sit on one domain today. Re-measure before any rep install: one rep on two domains
 * breaks the assumption for that rep. MARKETING-LINKS-PAGE-SOP §2.
 */
window.SHARK_HUB = {
  appTitle:   'Nueva Shark',
  themeColor: '#0ABAB5',
  brandDir:   'nueva',
  cvFolder:   'Nueva - Product & Opportunity URLs',
  nameCv:     'nueva_rep_first_name',
  domainCv:   'nueva_main_url',
  groups: [
    {
      label: "Quizzes",
      items: [
        { icon: "quiz", name: "Snow Slim Quiz",
          slug: "n-snow-slim",
          tease: "Sorts them into one starting point",
          desc: "A six question quiz for anyone whose weight has stopped moving. It sorts them into appetite, metabolism or firmness, gives them a free ninety day plan, and only then shows where a product fits. Use it when someone is frustrated rather than ready to buy." },
        { icon: "user", name: "Side Hustle Quiz",
          slug: "n-match-quiz",
          tease: "Is the opportunity a fit for them?",
          desc: "A short quiz that sorts curious people into the kind of side hustle that suits them, then hands them into the Nueva opportunity page. Use it when someone is interested in earning but not ready to talk." }
      ]
    },
    {
      label: "Free guides and samples",
      items: [
        { icon: "leaf", name: "Tone and Tighten Guide",
          slug: "n-tone-and-tighten-guide",
          tease: "A free guide, no shots involved",
          desc: "A free guide to everyday foods that support the body's own appetite hormones. A soft opener for the weight conversation that asks for nothing but an email." },
        { icon: "chart", name: "Free Revive Sample",
          slug: "n-free-revive-sample",
          tease: "They ask, you post it",
          desc: "A sample request form for Revive, the cellular hydration sachet. They give you an address, you confirm it and send it. The strongest first touch you have, because they have to talk to you to get it." }
      ]
    }
  ],
  lists: [
    { label: 'Direct product links', icon: 'cart', name: 'Product links',
      tease: 'Every link, ready to copy', perRep: true, items: [
        { cv: "nueva_buy_link",          name: "Nueva Shop" },
        { cv: "nueva_opportunity_url",   name: "Become a Social Marketer" },
        { cv: "nueva_snow_slim_link",    name: "Snow Slim" },
        { cv: "nueva_snow_collagen_link", name: "Snow Collagen" },
        { cv: "nueva_body_link",         name: "Body" }
      ] }
  ],
  affiliate: { cv: 'nueva_shark_affiliate_link', name: 'Your Nueva Shark affiliate link',
    desc: 'This is your affiliate link for the Nueva Shark marketing system itself, not for product and not for the opportunity. Send it to anyone who wants the funnels, emails and automations you are running. If they buy the system through your link, the sale is credited to you.' }
};

/* Load the shared engine. It reads window.SHARK_HUB, which is set above, so the config must
   come first. Version is PINNED: editing v1 reaches every page already on it, so a redesign
   forks v2 and pages move deliberately. */
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
