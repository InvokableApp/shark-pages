/* _shared/text-me/v1/text-me.js — the page an email's "text me for the guide" button opens (references/REEL-PAGE-SOP.md
 * §The email's text me page; Jeff, 2026-10-24: "make the button prefill a sms ... or take them to a page where they can
 * choose to fb message or sms the rep with a prefilled message").
 *
 * The root ([data-tm]) carries the lead's message to the rep as data-pf-say ({first} = the rep), and the page offers two
 * ways to send it:
 *   [data-tm-text]   a text with the words already typed (sms:<number>?&body=...), the number from [data-tm-num]
 *   [data-pf-ask]    Messenger, or the app the rep picked, through the copy-the-message card (funnel-native.js)
 * [data-tm-words] shows the message. A computer can't send a text, so it gets the number written out ([data-tm-desk])
 * and Messenger becomes the main button. No number: no text button. A rep on texts only: no second button.
 *
 * Load it BEFORE reel.js in the page: both are deferred and run in page order, and funnel-native.js (added by the
 * platform at the end of the body) must find the text link's finished address for its card's "Send a text".
 */
(function () {
  var root = document.querySelector("[data-tm]");
  if (!root) return;
  var D = {}; try { D = JSON.parse((document.getElementById("pfn-data") || {}).textContent || "{}"); } catch (e) {}
  var rep = D.rep || {};
  var say = root.getAttribute("data-pf-say") || "";
  var words = rep.first ? say.replace(/\{first\}/g, rep.first) : say.replace(/ ?\{first\}/g, "");
  [].forEach.call(root.querySelectorAll("[data-tm-words]"), function (el) { el.textContent = words; });

  var touch = window.matchMedia("(pointer: coarse)").matches;
  var btn = root.querySelector("[data-tm-text]"), desk = root.querySelector("[data-tm-desk]");
  var ask = root.querySelector("[data-pf-ask]");

  // The rep's own app (0311): the card names it, so the button does too. On texts the card is the text, so it goes.
  if (ask) {
    if (rep.via === "sms") ask.remove();
    else if (rep.via === "whatsapp") ask.textContent = ask.getAttribute("data-tm-whatsapp") || "Message me on WhatsApp";
    else if (rep.via === "telegram") ask.textContent = ask.getAttribute("data-tm-telegram") || "Message me on Telegram";
  }

  // The number: the same check as the bonus pages (anything with a letter in it is the setup sentence, not a number).
  var num = root.querySelector("[data-tm-num]"), raw = num ? num.textContent.trim() : "";
  var d = raw && /^\+?[\d\s().-]+$/.test(raw) ? raw.replace(/\D/g, "") : "";
  var e164 = raw.charAt(0) === "+" ? "+" + d : d.length === 10 ? "+1" + d : d.length === 11 && d.charAt(0) === "1" ? "+" + d : d;
  if (d.length < 10) { if (btn) btn.remove(); if (desk) desk.remove(); return; }
  var us = /^\+1\d{10}$/.test(e164) ? e164.slice(2) : "";
  if (num) num.textContent = us ? "(" + us.slice(0, 3) + ") " + us.slice(3, 6) + "-" + us.slice(6) : e164;
  if (btn) btn.setAttribute("href", "sms:" + e164 + "?&body=" + encodeURIComponent(words));
  if (!touch) {
    if (btn) { btn.hidden = true; btn.removeAttribute("data-pf-text-link"); }
    if (ask && ask.parentNode) ask.classList.remove("rl-btn-2");
    if (desk) desk.hidden = false;
  }
})();
