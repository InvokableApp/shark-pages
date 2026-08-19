(function () {
  var root = document.querySelector(".sk-glp-your-marketing-links-marketing-links");
  if (!root) return;

  /* ---------- home-screen icon ----------
     Reps are told to bookmark this and Add to Home Screen. Without an
     apple-touch-icon iOS screenshots the page and uses that as the icon, which
     looks broken. GHL's per-funnel faviconUrl covers the browser tab; these
     cover the home screen and the tab title, and cost nothing per account. */
  (function () {
    var ICON = "https://invokableapp.github.io/shark-pages/_brand/glp/";
    /* GHL always emits its own <link rel="icon"> pointing at the HighLevel default,
       so "skip if one exists" silently loses every time. Drop the platform default
       first, then add ours; anything the account set deliberately is left alone. */
    function head(tag, attrs) {
      if (attrs.rel) {
        var existing = document.head.querySelectorAll(tag + '[rel="' + attrs.rel + '"]');
        for (var i = 0; i < existing.length; i++) {
          if (/leadconnectorhq|stcdn/.test(existing[i].getAttribute("href") || "")) existing[i].remove();
          else return;
        }
      }
      var el = document.createElement(tag);
      for (var a in attrs) el.setAttribute(a, attrs[a]);
      document.head.appendChild(el);
    }
    head("link", { rel: "apple-touch-icon", sizes: "180x180", href: ICON + "icon-180.png" });
    head("link", { rel: "icon", type: "image/png", sizes: "512x512", href: ICON + "icon-512.png" });
    head("meta", { name: "apple-mobile-web-app-title", content: "GLP Links" });
    head("meta", { name: "theme-color", content: "#EC5E2A" });
  })();


  var I = {
    leaf:   '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    dumbbell:'<path d="M6.5 6.5v11"/><path d="M17.5 6.5v11"/><path d="M3.5 9v6"/><path d="M20.5 9v6"/><path d="M6.5 12h11"/>',
    quiz:   '<path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9.5"/>',
    drop:   '<path d="M12 2.7s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.1 12 2.7 12 2.7Z"/>',
    info:   '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-5"/><path d="M12 8h.01"/>',
    user:   '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    users:  '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 19.5a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6"/><path d="M18 14.4a6.5 6.5 0 0 1 3.5 5.1"/>',
    compass:'<circle cx="12" cy="12" r="9.5"/><path d="m15.5 8.5-2 5.2-5.2 2 2-5.2Z"/>',
    image:  '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m3.5 17 4.7-4.7a2 2 0 0 1 2.8 0l3.2 3.2"/><path d="m13 14.2 2.1-2.1a2 2 0 0 1 2.8 0l2.6 2.6"/>',
    cart:   '<circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/><path d="M2.5 3h2.2l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.5a1.6 1.6 0 0 0 1.6-1.3L20.5 7H6"/>'
  };
  function icon(k){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'+I[k]+'</svg>';}

  /* Reads a custom value off the block root. Empty, unsubstituted, and the
     "Paste the full link…" placeholder all count as not filled. */
  function cv(key){
    var v=(root.getAttribute("data-cv-"+key)||"").trim();
    if(!v) return "";
    if(v.indexOf("{")!==-1) return "";
    if(/^(paste|enter|add)\b/i.test(v)) return "";
    return v;
  }
  function href(v){ return /^https?:\/\//i.test(v) ? v : "https://"+v.replace(/^\/+/,""); }

  /* GLP funnel links come from ONE custom value each, not domain + slug.
     GLP buyers run several domains and their slugs drift per install, so a
     fixed slug would silently 404. The rep pastes each link once. */
  var GROUPS = [
    { label:"Start a conversation", items:[
      { cv:"glp_foods_guide_funnel_link",      icon:"leaf",     name:"Natural GLP Foods Guide",
        tease:"Free foods guide", canva:"https://canva.link/gszpkrgjxsn7fga",
        howto:"https://glpshark.com/glp-food-guide-training",
        desc:"A free guide to the foods that support GLP naturally. Your widest opener, it works on anyone curious about weight without mentioning the product." },
      { cv:"protein_recipe_guide_funnel_link", icon:"leaf",     name:"High Protein Recipe Guide",
        tease:"Recipes and grocery list", canva:"https://canva.link/n6t92pxvso2744m",
        desc:"A free high protein recipe guide and grocery list. Best for anyone trying to lose weight without giving up the food they like." },
      { cv:"glp_workout_guide_funnel_link",    icon:"dumbbell", name:"GLP Workout Guide",
        tease:"Free workout download",
        desc:"A free workout guide built for people on GLP medication, where holding muscle matters as much as losing weight." } ]},

    { label:"Quizzes and tools", items:[
      { cv:"weight_loss_quiz_funnel_link",  icon:"quiz", name:"Weight Loss Supplement Quiz",
        tease:"Recommends the right support",
        desc:"A short quiz that recommends the right weight support and lands them on the DROPS recommendation. Use it when someone is interested but unsure what to take." },
      { cv:"side_hustle_quiz_funnel_link",  icon:"quiz", name:"Side Hustle Quiz",
        tease:"Finds their work-from-home fit",
        desc:"Sorts people into the work from home model that suits them, then shows where ORYGN fits. Good for the curious but not yet ready." } ]},

    { label:"Share the product", items:[
      { cv:"drops_funnel_link",     icon:"drop", name:"Drops, warm leads",
        tease:"For people who already know you",
        desc:"The DROPS information page for people who have already spoken with you. Straight to the product, no warm up." },
      { cv:"drops_ads_funnel_link", icon:"drop", name:"Drops, ads and social",
        tease:"For cold traffic",
        desc:"The DROPS funnel built for cold traffic. Captures first, then explains, so post it publicly or run ads to it." } ]},

    { label:"Explain ORYGN", items:[
      { cv:"orygn_tour_funnel_link", icon:"info",    name:"ORYGN Tour",
        tease:"Products, opportunity, comp plan",
        desc:"The full tour. Products, the opportunity and the comp plan in one place, for anyone who asks what ORYGN actually is." },
      { cv:"navigation_funnel_link", icon:"compass", name:"Navigation Page",
        tease:"Let them choose their path",
        desc:"One page that lets people pick their own direction, product or opportunity. Strong link for social bios and broad ads." } ]},

    { label:"Recruit", items:[
      { cv:"opportunity_warm_funnel_link", icon:"users", name:"Opportunity, warm leads",
        tease:"For people who asked about the business",
        desc:"The business explained, for people who have already told you they want to hear more." },
      { cv:"opportunity_funnel_link",      icon:"users", name:"Opportunity, ads and social",
        tease:"For cold traffic",
        desc:"The recruiting funnel for cold traffic. Captures first, then explains the business." } ]},

    { label:"Your own pages", items:[
      { cv:"personal_branded_funnel_link", icon:"user", name:"Personal Branded One Pager",
        tease:"Your name, your contact details",
        desc:"Your own branded page with your name and details. Use it as your link in bio." } ]}
  ];

  /* the rep's own buy links, which are not funnels */

  /* Ready-to-post social library. Identical for every GLP rep, so these are
     static in the block rather than custom values. Source: the GLP ads
     training page (glpshark.com/ads-training-page1-769355). */
  var SOCIAL = [
    { name:"Product images, 1x1",      url:"https://canva.link/qryqd6ykd8cj52m" },
    { name:"Product images, 9x16",     url:"https://canva.link/x7jlmu1gmeo5umf" },
    { name:"Opportunity images, 1x1",  url:"https://canva.link/wpssx0sbep1xhej" },
    { name:"Opportunity images, 9x16", url:"https://canva.link/d43ep73ca1unbjn" },
    { name:"Recipe lead magnet images",url:"https://canva.link/n6t92pxvso2744m" }
  ];

  var DIRECT = [
    { cv:"rep_buy_link",         name:"Product link, for customers" },
    { cv:"distributor_buy_link", name:"Recruitment link, for distributors" }
  ];

  var firstName = cv("rep_first_name");
  root.querySelector("[data-greeting]").textContent =
    firstName ? "Hi " + firstName + ", here are your marketing links."
              : "Here are your marketing links.";

  var body = root.querySelector("[data-body]");
  var html = "", n = 0, live = 0;

  GROUPS.forEach(function (g) {
    var items = g.items.map(function(f){ f.link = cv(f.cv); return f; })
                       .filter(function(f){ return !!f.link; });
    if (!items.length) return;
    live += items.length;

    html += '<section class="sk-group"><div class="sk-group-head">' +
              '<span class="sk-group-label">'+g.label+'</span>' +
              '<span class="sk-group-rule"></span>' +
              '<span class="sk-group-count">'+items.length+'</span>' +
            '</div>';

    items.forEach(function (f) {
      var link = href(f.link);
      html +=
        '<article class="sk-card" data-open="false" style="animation-delay:'+(0.04*n++).toFixed(2)+'s">' +
          '<button class="sk-trigger" type="button" aria-expanded="false">' +
            '<span class="sk-mark">'+icon(f.icon)+'</span>' +
            '<span><span class="sk-name">'+f.name+'</span><span class="sk-tease">'+f.tease+'</span></span>' +
            '<span class="sk-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>' +
          '</button>' +
          '<div class="sk-panel"><div class="sk-panel-inner"><div class="sk-panel-pad">' +
            '<p class="sk-desc">'+f.desc+'</p>' +
            '<button class="sk-copy" type="button" data-state="idle" data-link="'+link+'">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
              '<span class="sk-copy-label">Copy Funnel Link</span>' +
            '</button>' +
            '<div class="sk-url">' +
              '<span class="sk-url-text">'+link.replace(/^https?:\/\//,"")+'</span>' +
              '<a class="sk-open" href="'+link+'" target="_blank" rel="noopener" aria-label="Open funnel">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>' +
              '</a>' +
            '</div>' +
            /* Resource chips. The training link is ONE canonical url per funnel,
               hosted on glpshark.com rather than copied into every rep account,
               so Joe updates the training in one place. */
            (f.canva || f.howto ?
              '<div class="sk-links">' +
              (f.howto ? '<a class="sk-chip" href="'+f.howto+'" target="_blank" rel="noopener">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5A4.5 4.5 0 0 1 16.5 2H21v13.5H16.5A4.5 4.5 0 0 0 12 20a4.5 4.5 0 0 0-4.5-4.5H3V2h4.5A4.5 4.5 0 0 1 12 6.5Z"/><path d="M12 6.5V20"/></svg>' +
                'How to use this funnel</a>' : '') +
              (f.canva ? '<a class="sk-chip" href="'+f.canva+'" target="_blank" rel="noopener">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m3.5 17 4.7-4.7a2 2 0 0 1 2.8 0l3.2 3.2"/><path d="m13 14.2 2.1-2.1a2 2 0 0 1 2.8 0l2.6 2.6"/></svg>' +
                'Images for social posts</a>' : '') +
              '</div>' : '') +
          '</div></div></div>' +
        '</article>';
    });
    html += '</section>';
  });


  /* social content dropdown */
  var socialRows = SOCIAL.map(function (x) {
    return '<li class="sk-prow">' +
             '<a class="sk-prow-name" href="'+x.url+'" target="_blank" rel="noopener">'+x.name+'</a>' +
             '<a class="sk-chip sk-chip--go" href="'+x.url+'" target="_blank" rel="noopener">Open</a>' +
           '</li>';
  }).join("");
  html += '<section class="sk-group"><div class="sk-group-head">' +
            '<span class="sk-group-label">Social content</span><span class="sk-group-rule"></span>' +
            '<span class="sk-group-count">'+SOCIAL.length+'</span></div>' +
          '<article class="sk-card" data-open="false" style="animation-delay:'+(0.04*n++).toFixed(2)+'s">' +
            '<button class="sk-trigger" type="button" aria-expanded="false">' +
              '<span class="sk-mark">'+icon("image")+'</span>' +
              '<span><span class="sk-name">Ready to post images</span><span class="sk-tease">Product, opportunity and lead magnet</span></span>' +
              '<span class="sk-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>' +
            '</button>' +
            '<div class="sk-panel"><div class="sk-panel-inner"><div class="sk-panel-pad">' +
              '<ul class="sk-plist">'+socialRows+'</ul>' +
            '</div></div></div>' +
          '</article></section>';

  /* direct buy links, one dropdown */
  var direct = DIRECT.map(function(d){ d.link=cv(d.cv); return d; }).filter(function(d){ return !!d.link; });
  if (direct.length) {
    var rows = direct.map(function (d) {
      var u = href(d.link);
      return '<li class="sk-prow">' +
               '<a class="sk-prow-name" href="'+u+'" target="_blank" rel="noopener">'+d.name+'</a>' +
               '<button class="sk-copy sk-copy--mini" type="button" data-state="idle" data-done="Copied" data-link="'+u+'" aria-label="Copy the '+d.name+'">' +
                 '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
                 '<span class="sk-copy-label">Copy</span>' +
               '</button>' +
             '</li>';
    }).join("");
    html += '<section class="sk-group"><div class="sk-group-head">' +
              '<span class="sk-group-label">Direct buy links</span><span class="sk-group-rule"></span>' +
              '<span class="sk-group-count">'+direct.length+'</span></div>' +
            '<article class="sk-card" data-open="false" style="animation-delay:'+(0.04*n++).toFixed(2)+'s">' +
              '<button class="sk-trigger" type="button" aria-expanded="false">' +
                '<span class="sk-mark">'+icon("cart")+'</span>' +
                '<span><span class="sk-name">Your buy links</span><span class="sk-tease">Product and recruitment</span></span>' +
                '<span class="sk-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>' +
              '</button>' +
              '<div class="sk-panel"><div class="sk-panel-inner"><div class="sk-panel-pad">' +
                '<ul class="sk-plist">'+rows+'</ul>' +
              '</div></div></div>' +
            '</article></section>';
  }

  if (!live && !direct.length) {
    root.querySelector("[data-setup]").hidden = false;
    body.hidden = true;
  } else {
    body.innerHTML = html;
  }

  body.addEventListener("click", function (e) {
    var t=e.target.closest(".sk-trigger"); if(!t) return;
    var card=t.closest(".sk-card"), open=card.getAttribute("data-open")==="true";
    body.querySelectorAll('.sk-card[data-open="true"]').forEach(function(c){
      c.setAttribute("data-open","false"); c.querySelector(".sk-trigger").setAttribute("aria-expanded","false");
    });
    if(!open){card.setAttribute("data-open","true");t.setAttribute("aria-expanded","true");}
  });

  body.addEventListener("click", function (e) {
    var btn=e.target.closest(".sk-copy"); if(!btn) return;
    var link=btn.getAttribute("data-link"), label=btn.querySelector(".sk-copy-label");
    if(!btn.getAttribute("data-idle")) btn.setAttribute("data-idle",label.textContent);
    function done(){
      btn.setAttribute("data-state","done");
      label.textContent=btn.getAttribute("data-done")||"Link copied";
      clearTimeout(btn._t);
      btn._t=setTimeout(function(){btn.setAttribute("data-state","idle");label.textContent=btn.getAttribute("data-idle");},1900);
    }
    function fallback(){
      var ta=document.createElement("textarea");
      ta.value=link; ta.setAttribute("readonly",""); ta.style.cssText="position:absolute;left:-9999px;top:0";
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0,ta.value.length);
      try{document.execCommand("copy");done();}catch(err){label.textContent="Press and hold the link";}
      document.body.removeChild(ta);
    }
    if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(link).then(done,fallback);
    else fallback();
  });

  var IOS="https://apps.apple.com/us/app/highlevel/id1425004076";
  var PLAY="https://play.google.com/store/apps/details?id=com.gohighlevel";
  var ua=navigator.userAgent||"";
  var isIOS=/iPad|iPhone|iPod/.test(ua)||(ua.indexOf("Mac")>-1&&navigator.maxTouchPoints>1);
  var isAndroid=/Android/i.test(ua);
  var apple='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.9-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.2 1.2-2.4 1.3-2.5-.1 0-2.5-1-2.5-3.5zM14.2 5.3c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z"/></svg>';
  var play='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1 9.3-9.3v-.2L3.6 2.3zM17 15.4l-3.1-3.1 3.1-3.1 3.7 2.1c1.1.6 1.1 1.6 0 2.2L17 15.4zM13.6 11.6 4.3 20.9c.4.4 1 .4 1.7 0l10.1-5.7-2.5-3.6zM16.1 8.1 6 2.4c-.7-.4-1.3-.4-1.7 0l9.3 9.3 2.5-3.6z"/></svg>';
  var store=root.querySelector("[data-store]");
  var ios='<a class="'+(isIOS?"is-primary":"")+'" href="'+IOS+'" target="_blank" rel="noopener">'+apple+'App Store</a>';
  var goog='<a class="'+(isAndroid?"is-primary":"")+'" href="'+PLAY+'" target="_blank" rel="noopener">'+play+'Google Play</a>';
  store.innerHTML = isAndroid ? (goog+ios) : (ios+goog);


  /* ---------- add to home screen ----------
     CAN THIS BE AUTOMATIC? Only partly, and only on Android.
       iOS: Safari exposes NO API for this. Add to Home Screen is Share -> Add,
              a manual gesture, and no script can trigger or fake it. Instructions
              are the only option there, which is why they lead.
       Android: Chrome MAY fire `beforeinstallprompt`, which is a real one tap
              install. It is not guaranteed (it depends on the browser and on the
              page being installable), so it is treated as a bonus: when it fires
              the button installs directly and the sheet never opens.
     The platform is DETECTED rather than asked, so nobody taps through a
     "which phone?" question to reach their own steps. */
  (function () {
    var openBtn = root.querySelector("[data-a2hs-open]");
    var sheet   = root.querySelector("[data-a2hs-sheet]");
    if (!openBtn || !sheet) return;

    // Already installed: the button would be pure noise, so it never appears.
    var installed = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
                    window.navigator.standalone === true;
    if (installed) return;

    var label   = openBtn.querySelector("[data-a2hs-label]");
    var stepsEl = sheet.querySelector("[data-a2hs-steps]");
    var videoEl = sheet.querySelector("[data-a2hs-video]");
    var watch   = sheet.querySelector(".sk-watch");

    /* One walkthrough per platform. The runtimes differ (iOS ~1 min, Android ~2 min),
       so the hint on the summary is per platform rather than one static claim. */
    var VIDEO = {
      ios:     { src: "https://assets.cdn.filesafe.space/k5tyIG2Q85sUQ1RlSxBo/media/6a85cfbf005891114d29ddef.mp4", hint: "(1 minute video)" },
      android: { src: "https://assets.cdn.filesafe.space/k5tyIG2Q85sUQ1RlSxBo/media/6a85d91f9cca634f084ab692.mp4", hint: "(2 minute video)" }
    };
    var share = '<span class="sk-gl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m8.5 6.5 3.5-3.5 3.5 3.5"/><path d="M6 11H4.8A1.8 1.8 0 0 0 3 12.8v6.4A1.8 1.8 0 0 0 4.8 21h14.4a1.8 1.8 0 0 0 1.8-1.8v-6.4A1.8 1.8 0 0 0 19.2 11H18"/></svg>Share</span>';
    var kebab = '<span class="sk-gl"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>menu</span>';

    var STEPS = {
      ios: [
        'Tap the ' + share + ' button at the bottom of Safari.',
        'Scroll down the list and tap <b>Add to Home Screen</b>.',
        'Tap <b>Add</b> in the top right. The icon appears with your other apps.'
      ],
      android: [
        'Tap the ' + kebab + ' in the top right of Chrome.',
        'Tap <b>Install app</b>, or <b>Add to Home screen</b> if you do not see it.',
        'Confirm with <b>Install</b>. The icon appears with your other apps.'
      ]
    };
    // Opening from inside another app's browser is the one thing that makes the real
    // steps impossible, and it is common: reps reach this from a Facebook or Instagram
    // message. Naming it here saves the "it isn't there" support message.
    var INAPP = /FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp/i.test(navigator.userAgent || "");

    var ua = navigator.userAgent || "";
    var guess = (/iPad|iPhone|iPod/.test(ua) || (ua.indexOf("Mac") > -1 && navigator.maxTouchPoints > 1))
      ? "ios" : (/Android/i.test(ua) ? "android" : "ios");

    function paint(os) {
      sheet.querySelectorAll(".sk-seg-btn").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-os") === os));
      });
      var list = STEPS[os].map(function (t) { return "<li><span>" + t + "</span></li>"; }).join("");
      if (INAPP) {
        list = '<li><span>You opened this inside another app. Tap that app’s menu and choose ' +
               '<b>Open in ' + (os === "ios" ? "Safari" : "Chrome") + '</b> first.</span></li>' + list;
      }
      stepsEl.innerHTML = list;
      // Rebuilt on every switch so only the platform being viewed is ever fetched, and
      // preload="none" keeps even that at zero bytes until the rep presses play. These
      // files are ~23MB each; preloading both would cost a rep 46MB for nothing.
      videoEl.innerHTML = '<video controls playsinline preload="none" src="' + VIDEO[os].src + '"></video>';
      var hint = sheet.querySelector("[data-a2hs-size]");
      if (hint) hint.textContent = VIDEO[os].hint;
      if (watch) watch.open = false;
    }

    var lastFocus = null;
    function open() {
      lastFocus = document.activeElement;
      paint(guess);
      sheet.hidden = false;
      document.body.style.overflow = "hidden";
      var x = sheet.querySelector(".sk-sheet-x");
      if (x) x.focus();
    }
    function close() {
      // stop playback and drop the buffer, or audio keeps going behind the closed sheet
      var v = sheet.querySelector("video");
      if (v) { try { v.pause(); } catch (e) {} }
      videoEl.innerHTML = "";
      sheet.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    sheet.addEventListener("click", function (e) {
      if (e.target.closest("[data-a2hs-close]")) { close(); return; }
      var seg = e.target.closest(".sk-seg-btn");
      if (seg) { guess = seg.getAttribute("data-os"); paint(guess); }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !sheet.hidden) close(); });

    // Android's real install prompt, when the browser offers one.
    var deferred = null;
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      deferred = e;
      label.textContent = "Add this page to your home screen";
    });
    window.addEventListener("appinstalled", function () { openBtn.hidden = true; deferred = null; });

    openBtn.addEventListener("click", function () {
      if (deferred) {
        deferred.prompt();
        deferred.userChoice.then(function (r) {
          if (r && r.outcome === "accepted") openBtn.hidden = true;
          // dismissed: the browser will not re-offer this prompt, so fall back to the
          // written steps rather than leaving a button that silently does nothing
          else { deferred = null; label.textContent = "How to add this to your home screen"; }
        });
        deferred = null;
        return;
      }
      open();
    });

    label.textContent = "How to add this to your home screen";
    openBtn.hidden = false;
  })();

  root.querySelector(".sk-title").innerHTML = 'Your <em>Marketing</em> Links';
})();
