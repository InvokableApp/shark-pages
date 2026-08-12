/* DEMO-ONLY placeholder filling.
   On a snapshot account almost every custom value is intentionally empty, so a
   merge field renders as an empty string and the page reads as broken in a
   walkthrough. This fills those gaps with plausible demo values so the team sees
   the finished shape.

   Do NOT copy this into a shipped buyer block. There, an empty field must read
   empty so the buyer notices it still needs filling. */
(function () {
  var root = document.querySelector(".sk-conectiv-zz-embed-test-landing-demo");
  if (!root) return;

  // NEVER write a literal double-brace in a custom-code block, not even inside a
  // JS string. GHL parses the whole block for merge fields before render, and an
  // unpaired opening brace pair makes it give up, leaving EVERY merge field on the
  // page unsubstituted. Build the needle from parts instead.
  var OPEN = "{" + "{";

  // text nodes: use the fallback when the merge field resolved to nothing
  root.querySelectorAll("[data-cvf]").forEach(function (el) {
    var v = (el.textContent || "").trim();
    if (!v || v.indexOf(OPEN) === 0) el.textContent = el.getAttribute("data-cvf");
  });

  // the avatar wants a single initial, not the whole first name
  var av = root.querySelector(".ld-avatar");
  if (av) av.textContent = (av.textContent || "J").trim().charAt(0);

  // links: "https://" with nothing after it means the link custom value is empty
  root.querySelectorAll("[data-hrf]").forEach(function (a) {
    var h = a.getAttribute("href") || "";
    if (h === "https://" || h === "http://" || h.indexOf(OPEN) > -1) {
      a.setAttribute("href", "https://" + a.getAttribute("data-hrf"));
    }
  });

  // tel: / mailto: rebuilt from whatever the row ended up displaying
  root.querySelectorAll('.ld-guide-rows a[href^="tel:"], .ld-guide-rows a[href^="mailto:"]').forEach(function (a) {
    var h = a.getAttribute("href") || "";
    var scheme = h.split(":")[0];
    if (h === scheme + ":" || h.indexOf(OPEN) > -1) {
      var b = a.querySelector("b");
      if (b) a.setAttribute("href", scheme + ":" + b.textContent.trim().replace(/\s+/g, ""));
    }
  });
})();
