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
  /* WHOLE CATALOG FROM ONE CUSTOM VALUE. Nueva attributes by SUBDOMAIN: a rep's entire
     replicated site lives at {username}.nuevalife.com, and every product is the same
     ?productcode= on it. So a product link is DERIVED, never stored, exactly the way funnel
     links are derived from nueva_main_url plus a slug. Jeff, 2026-09-22, on the funnel links:
     "we know the cv for default domain and we know the slugs so we can do it the way we do the
     marketing-links pages."

     What this replaces: four per-product custom values covering four of twenty-eight SKUs. The
     alternative was minting twenty-four more values for a rep to paste by hand, each one a
     chance to paste someone else's subdomain and credit them the sale.

     ⚠️ compose() RENDERS NOTHING WHEN THE USERNAME IS EMPTY, and that is the point. A Nueva
     product URL with no subdomain resolves to a real page with NO sponsor on it, so a link that
     silently loses the rep's credit is worse than no link at all. Every row below disappears
     until nueva_user_name is filled.

     ⚠️ nueva_user_name MUST BE ON THE SOCKET (block.html data-cv-*). Adding a custom value to a
     hosted block needs a push-block re-push per account; changing these rows does not.

     Every productcode below was fetched under a real rep subdomain on 2026-09-22 and returned
     200 with the right product title. */
  compose: { cv: 'nueva_user_name', base: 'https://{id}.nuevalife.com' },
  lists: [
    { label: 'Direct product links', icon: 'cart', name: 'Product links',
      tease: 'Every product, ready to copy', perRep: true, items: [
        { path: "shop.html",                          name: "Nueva Shop (everything)" },
        /* ⚠️ THE OPPORTUNITY LINK IS THE CORPORATE PAGE, NOT A COMPOSED REP ONE, and that is
           Jeff's call (2026-09-22): "the opportunity url, is https://nuevalife.com/opportunity.html".
           It is the one row here that stays a stored custom value while every product row is
           derived. Do not "fix" it to opportunity.html under the rep subdomain. */
        { cv: "nueva_opportunity_url",                name: "Become a Social Marketer" },
        { path: "product.html?productcode=mp8916-vm", name: "Nitro" },
        { path: "product.html?productcode=mp8924",    name: "Nitro+ 12-Pack Case" },
        { path: "product.html?productcode=nv-rev",    name: "Revive" },
        { path: "product.html?productcode=mp8907-vm", name: "Snow Slim" },
        { path: "product.html?productcode=mp8900",    name: "Snow Collagen" },
        { path: "product.html?productcode=mp8908",    name: "Morning Coffee" },
        { path: "product.html?productcode=nv1210",    name: "Boost" },
        { path: "product.html?productcode=nv1208",    name: "Alive" },
        { path: "product.html?productcode=nv-bio",    name: "Biotic" },
        { path: "product.html?productcode=mp8903",    name: "Body" },
        { path: "product.html?productcode=bb7035",    name: "Elevate" },
        { path: "product.html?productcode=bb7037",    name: "Beauty" },
        { path: "product.html?productcode=nvtravel",  name: "Travel" }
      ] },
    { label: 'Bundles and systems', icon: 'cart', name: 'Bundle links',
      tease: 'The packs, ready to copy', perRep: true, items: [
        { path: "product.html?productcode=nv9988", name: "Signature Power Pack" },
        { path: "product.html?productcode=bb7032", name: "Ultimate Pack" },
        { path: "product.html?productcode=nv9999", name: "Body Kickstart Bundle" },
        { path: "product.html?productcode=mp8943", name: "Slim Body System" },
        { path: "product.html?productcode=bb7036", name: "Body+ Elevate Pack" },
        { path: "product.html?productcode=mp8941", name: "Body System" },
        { path: "product.html?productcode=bb7033", name: "Slim Body+ System" },
        { path: "product.html?productcode=mp8909", name: "Nitro Set" },
        { path: "product.html?productcode=nv3101", name: "Slim Body Kickstart" },
        { path: "product.html?productcode=bb7031", name: "Choice Pack" },
        { path: "product.html?productcode=bb7034", name: "Body+" },
        { path: "product.html?productcode=nv3100", name: "Body Kickstart" }
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
