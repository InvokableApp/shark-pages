(function () {
/* Quantaira's campaign list for the rep app's Links screen (platform/src/lib/rep-hub.mjs reads this SYS; it is not a
   page). Quantaira is a "watch" system: the video page, the signup link and the referral link come first
   (links.mjs watchLinks), and these campaign cards sit under them (Jeff, 2026-10-15: "yea we should add those campaign
   cards"). The video funnel itself is left out here, so it isn't on the screen twice. */
var SYS = {
  appTitle:   'Quantaira Shark',
  themeColor: '#2B6BFF',
  nameCv: 'rep_first_name',
  training: null,
  domainCv: 'quantaira_main_url',
  howtoDomainCv: 'quantaira_main_url',
  groups: [
    { label:"Lead generation", items:[
      { slug:"income-quiz", icon:"quiz", platformOnly:true,
        name:"Passive Income Quiz",
        tease:"Find the AI income that fits your life",
        desc:"A free 2 minute quiz: eight questions, then their match with the real hours, effort, cost and wait behind it, side by side with Quantaira's. Every result ends on Quantaira, and you get an alert with their result and every answer." },
      { slug:"alert-bot", icon:"phone", platformOnly:true,
        name:"Crypto Alert Bot",
        tease:"A free prompt that builds their own crypto alert bot",
        desc:"A free prompt they paste into ChatGPT or Claude, and it walks them through building a Telegram bot that pings them when Bitcoin moves 2% in an hour, with the headlines. Then the follow ups show them Quantaira's AI, which places the trades." } ]}
  ]
};
})();
