(function () {
  var root = document.querySelector(".sk-vital-vital---your-funnel-links-vital-user-links");
  if (!root) return;

  /* ---------- icons ---------- */
  var I = {
    leaf:   '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    scan:   '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="11" r="3"/><path d="M7 17c1-2 2.9-3 5-3s4 1 5 3"/>',
    quiz:   '<path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9.5"/>',
    info:   '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-5"/><path d="M12 8h.01"/>',
    user:   '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    link:   '<path d="M9.5 13.5a4 4 0 0 0 5.66 0l3-3a4 4 0 1 0-5.66-5.66l-1.2 1.2"/><path d="M14.5 10.5a4 4 0 0 0-5.66 0l-3 3a4 4 0 1 0 5.66 5.66l1.2-1.2"/>',
    coffee: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M7 2v3"/><path d="M11 2v3"/>',
    kids:   '<circle cx="12" cy="8.5" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/><path d="M8.5 3.5 12 1l3.5 2.5"/>',
    chart:  '<path d="M3 20h18"/><rect x="5" y="11" width="3.5" height="6" rx="1"/><rect x="10.2" y="7" width="3.5" height="10" rx="1"/><rect x="15.5" y="13" width="3.5" height="4" rx="1"/>'
  };
  function icon(k) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">' + I[k] + '</svg>';
  }

  /* ---------- the funnels ----------
     slug: "" means the domain root. Vital points the root at the
     What Is Vital page, verified live on wellness-forge.com.
     Every slug and how-to below was checked against a live buyer
     and resolves to a real page, not the 404 fallback.          */
  var GROUPS = [
    {
      label: "Start a conversation",
      items: [
        { icon: "leaf", name: "High Protein Recipe Guide",
          slug: "vital-protein-first", canva: "https://canva.link/glkotdv7npi40hl", howto: "vital-protein-first-how-to",
          tease: "Free recipes and grocery list",
          desc: "A free high protein recipe guide and grocery list. Your best cold opener for anyone who wants to lose weight without giving up food they actually like." },
        { icon: "chart", name: "GLP Recipe Guide",
          slug: "vital-free-glp-recipe-guide", howto: "vital-glp-recipe-how-to",
          tease: "Built for people on GLP medications",
          desc: "A free recipe and shopping list guide written for people taking GLP medications. Strong opener for the weight loss conversation, and it leads into Nourish+." },
        { icon: "coffee", name: "Clean Coffee Recipes",
          slug: "vital-clean-iced-coffee", canva: "https://canva.link/reyh5ko5e8260am", howto: "vital-clean-brew-how-to",
          tease: "Iced coffee without the junk",
          desc: "A free clean iced coffee recipe guide. Easy share for coffee drinkers who want to cut the sugar and the additives." },
        { icon: "kids", name: "Einstein Kids Meal Guide",
          slug: "vital-einstein-kids", canva: "https://canva.link/65wch4c5w1he7ma", howto: "vital-einstein-kids-how-to",
          tease: "Kid friendly meals for parents",
          desc: "A free kid friendly meal guide for parents. Works well in mom groups, school communities and family pages." }
      ]
    },
    {
      label: "Quizzes and tools",
      items: [
        { icon: "scan", name: "Health Scanner",
          slug: "vital-health-scan", canva: "https://canva.link/8r9y6jcyifb3002", howto: "vital-health-scan-how-to-use",
          tease: "Free face scan in about a minute",
          desc: "Sends them to a free face scan that reads key wellness markers in about a minute. High curiosity, low commitment, and it hands you the follow up." },
        { icon: "quiz", name: "Side Hustle Quiz",
          slug: "vital-match-quiz", canva: "https://canva.link/iei2zd7bavlwksq", howto: "vital-side-hustle-how-to",
          tease: "Sorts them into the right fit",
          desc: "A short quiz that sorts curious people into the kind of side hustle that suits them, then shows them where Vital fits. Use it when someone is interested but not ready to talk." }
      ]
    },
    {
      label: "Explain Vital",
      items: [
        { icon: "info", name: "What Is Vital",
          slug: "", canva: "https://canva.link/8mtdfsarwmyz3jk", howto: "what-is-vital-how-to",
          tease: "Your main site, the simple version",
          desc: "The plain explainer. Send it the moment someone asks what Vital actually is, so you are not answering the same question by text every week. This one is your domain on its own." },
        { icon: "chart", name: "Opportunity One Pager",
          slug: "vital-opportunity-explainer", canva: "https://canva.link/8mtdfsarwmyz3jk", howto: "vital-opportunity-how-to",
          tease: "The business side, on one page",
          desc: "One page that lays out the business side start to finish. Best for people who have already told you they want to hear more." }
      ]
    },
    {
      label: "Your own pages",
      items: [
        { icon: "user", name: "Personal Branded Site",
          slug: "vital-personal-site", howto: "vital-personal-branded-how-to",
          tease: "Your name, your contact details",
          desc: "Your own branded page carrying your name and contact details. Use it as the link in your bio and on your business card." },
        { icon: "link", name: "Social Links Page",
          slug: "vital-social-links", howto: "vital-social-links-how-to",
          tease: "One link that holds all your links",
          desc: "One link that holds every other link. Put it in your Instagram and TikTok bio so you are never editing a bio again." }
      ]
    }
  ];

  /* ---------- domain ---------- */
  var domain = (root.getAttribute("data-domain") || "")
    .trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");

  var ready = !!domain && domain.indexOf("{") === -1;

  if (!ready) {
    root.querySelector("[data-setup]").hidden = false;
    root.querySelector("[data-body]").hidden = true;
    return;
  }

  var strip = root.querySelector("[data-domain-strip]");
  strip.hidden = false;
  strip.querySelector(".sk-domain-text").textContent = domain;

  function url(slug) { return "https://" + domain + (slug ? "/" + slug : ""); }

  /* ---------- render ---------- */
  var body = root.querySelector("[data-body]");
  var html = "";
  var n = 0;

  GROUPS.forEach(function (g) {
    html += '<section class="sk-group">' +
              '<div class="sk-group-head">' +
                '<span class="sk-group-label">' + g.label + '</span>' +
                '<span class="sk-group-rule"></span>' +
                '<span class="sk-group-count">' + g.items.length + '</span>' +
              '</div>';

    g.items.forEach(function (f) {
      var link = url(f.slug);
      var delay = (0.04 * n++).toFixed(2);
      html +=
        '<article class="sk-card" data-open="false" style="animation-delay:' + delay + 's">' +
          '<button class="sk-trigger" type="button" aria-expanded="false">' +
            '<span class="sk-mark">' + icon(f.icon) + '</span>' +
            '<span>' +
              '<span class="sk-name">' + f.name + '</span>' +
              '<span class="sk-tease">' + f.tease + '</span>' +
            '</span>' +
            '<span class="sk-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>' +
          '</button>' +
          '<div class="sk-panel"><div class="sk-panel-inner"><div class="sk-panel-pad">' +
            '<div class="sk-shot"></div>' +
            '<p class="sk-desc">' + f.desc + '</p>' +
            '<button class="sk-copy" type="button" data-state="idle" data-link="' + link + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
              '<span class="sk-copy-label">Copy Funnel Link</span>' +
            '</button>' +
            '<div class="sk-url">' +
              '<span class="sk-url-text">' + link.replace(/^https:\/\//, "") + '</span>' +
              '<a class="sk-open" href="' + link + '" target="_blank" rel="noopener" aria-label="Open funnel">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>' +
              '</a>' +
            '</div>' +
            '<div class="sk-links">' +
              '<a class="sk-chip" href="' + url(f.howto) + '" target="_blank" rel="noopener">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="m10 8.5 6 3.5-6 3.5Z"/></svg>' +
                'How to use this funnel' +
              '</a>' +
              (f.canva
                ? '<a class="sk-chip" href="' + f.canva + '" target="_blank" rel="noopener">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m3.5 17 4.7-4.7a2 2 0 0 1 2.8 0l3.2 3.2"/><path d="m13 14.2 2.1-2.1a2 2 0 0 1 2.8 0l2.6 2.6"/></svg>' +
                    'Images for social posts' +
                  '</a>'
                : '') +
            '</div>' +
          '</div></div></div>' +
        '</article>';
    });

    html += '</section>';
  });

  body.innerHTML = html;

  /* ---------- accordion, one open at a time ---------- */
  body.addEventListener("click", function (e) {
    var trigger = e.target.closest(".sk-trigger");
    if (!trigger) return;
    var card = trigger.closest(".sk-card");
    var open = card.getAttribute("data-open") === "true";

    body.querySelectorAll('.sk-card[data-open="true"]').forEach(function (c) {
      c.setAttribute("data-open", "false");
      c.querySelector(".sk-trigger").setAttribute("aria-expanded", "false");
    });

    if (!open) {
      card.setAttribute("data-open", "true");
      trigger.setAttribute("aria-expanded", "true");
    }
  });

  /* ---------- copy ---------- */
  body.addEventListener("click", function (e) {
    var btn = e.target.closest(".sk-copy");
    if (!btn) return;
    var link = btn.getAttribute("data-link");
    var label = btn.querySelector(".sk-copy-label");

    function done() {
      btn.setAttribute("data-state", "done");
      label.textContent = "Link copied";
      clearTimeout(btn._t);
      btn._t = setTimeout(function () {
        btn.setAttribute("data-state", "idle");
        label.textContent = "Copy Funnel Link";
      }, 1900);
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link).then(done, fallback);
    } else {
      fallback();
    }

    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = link;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:absolute;left:-9999px;top:0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      try { document.execCommand("copy"); done(); }
      catch (err) { label.textContent = "Press and hold the link below"; }
      document.body.removeChild(ta);
    }
  });

  /* ---------- app store, by platform ---------- */
  var IOS  = "https://apps.apple.com/us/app/highlevel/id1425004076";
  var PLAY = "https://play.google.com/store/apps/details?id=com.gohighlevel";
  var ua = navigator.userAgent || "";
  var isIOS = /iPad|iPhone|iPod/.test(ua) ||
              (ua.indexOf("Mac") > -1 && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);

  var apple = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.9-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.2 1.2-2.4 1.3-2.5-.1 0-2.5-1-2.5-3.5zM14.2 5.3c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z"/></svg>';
  var play  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1 9.3-9.3v-.2L3.6 2.3zM17 15.4l-3.1-3.1 3.1-3.1 3.7 2.1c1.1.6 1.1 1.6 0 2.2L17 15.4zM13.6 11.6 4.3 20.9c.4.4 1 .4 1.7 0l10.1-5.7-2.5-3.6zM16.1 8.1 6 2.4c-.7-.4-1.3-.4-1.7 0l9.3 9.3 2.5-3.6z"/></svg>';

  var store = root.querySelector("[data-store]");
  var ios  = '<a class="' + (isIOS ? "is-primary" : "") + '" href="' + IOS + '" target="_blank" rel="noopener">' + apple + 'App Store</a>';
  var goog = '<a class="' + (isAndroid ? "is-primary" : "") + '" href="' + PLAY + '" target="_blank" rel="noopener">' + play + 'Google Play</a>';

  store.innerHTML = isAndroid ? (goog + ios) : (ios + goog);

  /* headline gets the two tone treatment */
  var title = root.querySelector(".sk-title");
  title.innerHTML = 'Your <em>Funnel</em> Links';
})();
