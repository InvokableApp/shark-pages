(function () {
/* MPG's campaign list for the rep app's My funnels screen (platform/src/lib/rep-hub.mjs reads this SYS; it is not a
   page). Only the two lead gen funnels are cards here. The four video funnels (Gut Health, Daily Drop, Opportunity,
   Networker Opportunity) are sent to one person at a time, so they live in Send › Trackable link only
   (systems.rep_app.send_funnels), not on this screen (Jeff, 2026-10-23: "everything except the feed your gut and
   vagus nerve reset need to be put in the trackable links not in funnels"). */
var SYS = {
  appTitle:   'MPG Shark',
  themeColor: '#7B6A55',
  nameCv: 'mpg_rep_first_name',
  training: null,
  domainCv: 'mpg_main_url',
  howtoDomainCv: 'mpg_main_url',
  groups: [
    { label:"Lead generation", items:[
      { slug:"m-feed-your-gut", icon:"leaf", platformOnly:true,
        name:"Feed Your Gut",
        tease:"10 easy recipes that feed the good bacteria in your gut",
        /* The second label is the kit's gated.label word for word (campaign-kits/mpg/m-feed-your-gut.json): Generate
           leads finds the bonus link by it. */
        guides:[
          { label:"Read / print / share the recipe guide", cv:"mpg_feed_your_gut_pdf_url" },
          { label:"The link for the Fermented Foods Starter Guide, the bonus you text on request", cv:"mpg_fermented_foods_pdf_url" }
        ],
        desc:"A free recipe guide: ten everyday meals from a normal grocery store, with the shopping list already written. The follow ups keep the conversation on gut health, so you can introduce the gut powder you take." },
      { slug:"m-vagus-reset", icon:"chart", platformOnly:true,
        name:"Vagus Nerve Reset",
        tease:"Four weeks of small habits for tired all day, wired at night",
        guides:[
          { label:"Read / print / share the guide", cv:"mpg_vagus_reset_pdf_url" },
          { label:"The link for the Supplement Companion Guide, the bonus you text on request", cv:"mpg_supplement_companion_pdf_url" }
        ],
        desc:"A free four week guide: each habit goes on something they already do, like the shower, the coffee or the drive home. The follow ups keep the conversation on stress and winding down, so you can introduce the drop you use." } ]}
  ]
};
})();
