(function () {
/* B-Epic's campaign list for the rep app's My funnels screen (platform/src/lib/rep-hub.mjs reads this SYS; it is not a
   page). Without it the system's My funnels screen draws no cards at all. The rep sees these words, never a lead: product
   names are fine here. Cards: BEPICSHARK/campaigns/metabolism-coffees-teas (migration 0781), BEPICSHARK/campaigns/3pm-crash (0791) and
   BEPICSHARK/campaigns/coffee-sample (0800). */
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
          { label:"The link for \"What To Add To Your Cup, And What To Skip\", the supplement guide you send on request", cv:"bepic_coffees_teas_supplement_pdf_url" }
        ],
        desc:"A free recipe guide of 6 warm coffees and 6 warm teas, made with the coffee or tea they already drink. The bonus is your supplement guide, sent by you with product info, and the people who ask for it hear about EpicSlim Coffee and Drink2Shrink." },
      { slug:"b-crash-plan", icon:"chart", platformOnly:true,
        name:"The 3 PM Crash Plan",
        tease:"Free 14 day plan for steadier energy at 3 PM",
        guides:[
          { label:"Read / print / share the plan", cv:"bepic_crash_plan_guide_pdf_url" },
          { label:"The link for \"What To Take For Steady Energy, And What To Skip\", the supplement guide you send on request", cv:"bepic_crash_plan_supplement_pdf_url" }
        ],
        desc:"A free 14 day plan for the afternoon energy crash: a walk after lunch, ten squats, and protein first at breakfast, about ten minutes a day. The bonus is your supplement guide, sent by you with product info, and the people who ask for it hear about ELEV8 and ELEV8 Drink 2.0." },
      { slug:"b-greens-breakfast", icon:"leaf", platformOnly:true,
        name:"The Greens at Breakfast Recipe Guide",
        tease:"12 breakfast recipes with greens cooked in, free",
        guides:[
          { label:"Read / print / share the guide", cv:"bepic_greens_breakfast_guide_pdf_url" },
          { label:"The link for \"My Morning Supplement List\", the supplement list you send on request", cv:"bepic_greens_breakfast_supplement_pdf_url" }
        ],
        desc:"A free recipe guide of twelve breakfasts with the greens cooked in: eggs, oats, toast, muffins and pancakes, five ready in fifteen minutes and five to make ahead, with amounts for 2, 4 or 6 and a shopping list for each. The bonus is your morning supplement list, sent by you with product info, and the people who ask for it hear about ACTIV Greens." },
      { slug:"b-coffee-sample", icon:"send", platformOnly:true,
        name:"Coffee Sample",
        tease:"Someone asks to try your coffee, you sort out how they get it",
        desc:"A sample request page for EpicSlim Coffee (the opt-in never names it): what's in the cup, how to take it, and a form for how they'd like it, mailed or handed over. You set the terms: how much, and how it gets to them. The confirmation asks them to text you COFFEE right away, and you get their request with a ready reply." } ]}
  ]
};
})();
