(function () {
/* B-Epic's campaign list for the rep app's My funnels screen (platform/src/lib/rep-hub.mjs reads this SYS; it is not a
   page). Without it the system's My funnels screen draws no cards at all. The rep sees these words, never a lead: product
   names are fine here. One card so far (BEPICSHARK/campaigns/metabolism-coffees-teas, migration 0781). */
var SYS = {
  appTitle:   'Marketing Shark',
  themeColor: '#278030',
  nameCv: 'bepic_rep_first_name',
  training: null,
  domainCv: 'bepic_main_url',
  howtoDomainCv: 'bepic_main_url',
  groups: [
    { label:"Product guides", items:[
      { slug:"b-coffees-teas", icon:"leaf", platformOnly:true,
        name:"Metabolism Coffees and Teas",
        tease:"6 warm coffees and 6 warm teas, made with what you already drink",
        guides:[
          { label:"Read / print / share the guide", cv:"bepic_coffees_teas_guide_pdf_url" },
          { label:"The link for \"What To Add To Your Cup, And What To Skip\", the bonus you text on request", cv:"bepic_coffees_teas_supplement_pdf_url" }
        ],
        desc:"A free recipe guide of 6 warm coffees and 6 warm teas, made with the coffee or tea they already drink. The bonus is your supplement guide, sent by you with product info, and the people who ask for it hear about EpicSlim Coffee and Drink2Shrink." } ]}
  ]
};
})();
