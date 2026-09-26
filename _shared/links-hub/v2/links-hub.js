/* links-hub/v2 — THE REP HUB ENGINE, shared by every system.
 *
 * ONE FILE BEHIND EVERY SYSTEM'S HUB. Before this, GLP, Conectiv and Nueva each
 * carried their own ~55KB copy: 82% identical engine, 65-95% identical CSS, and
 * 404 lines present verbatim in all three. Joe's September markup round was
 * ported by copying GLP and editing, so every later fix had to be applied three
 * times by hand and silently was not. Measured 2026-09-25.
 *
 * A BLOCK NOW SUPPLIES ONLY ITS DATA. Same contract as funnel-training/v1: the
 * block owns its content and its nine palette tokens, the component owns
 * everything else. A hub fix is one git push for every system again.
 *
 * ── The config a block passes ──────────────────────────────────────────────
 *   scope         REQUIRED  selector for the block root, e.g. '.sk-glp-...'
 *   SYS           REQUIRED  the system's cards, links, copy — the real content
 *                           incl. appTitle + themeColor, which dress the installed
 *                           home screen app and MUST be this system's own
 *   brandBase     REQUIRED  '…/_brand/{system}/', for the PWA icons
 *   TRAINING      optional  defaults to the 3-part shape below
 *   supportTease  optional  the one word of DEST that differed per system
 *   guideSub      optional  second line under every guide row (GLP prints one)
 *   showCardDesc  optional  render `desc` on a funnel card (Conectiv, Nueva; GLP dropped it)
 *   videoPage     optional  {slug, ariaLabel, note} for the 2-minute video row
 *   singleTrainingRow optional  one plain training link instead of three deep links
 *
 * ⚠️ TRAINING HAD THREE DIFFERENT SHAPES across the three forks — GLP an array
 * with icon+sub, Conectiv the same array without them, Nueva an OBJECT keyed
 * work/leads/close. Same concept, three data models, which is what unattended
 * forking does. The engine takes the GLP array (icon and sub optional); a
 * system holding another shape converts in its own config, not here.
 *
 * MOUNTING. A block pushes its config and loads this file; order does not
 * matter. Before this script runs, window.__sharkHubPending is a plain array
 * collecting configs; after, it is an object whose push() mounts immediately.
 */
(function () {
  if (window.SharkLinksHub) return;

  var SUPPORT_TEASE_DEFAULT = 'Email, text, or send us a message.';

  function mount(cfg) {
    if (!cfg || !cfg.scope || !cfg.SYS) return;
    var SYS = cfg.SYS;
    var SUPPORT_TEASE = cfg.supportTease || SUPPORT_TEASE_DEFAULT;
    var GUIDE_SUB = cfg.guideSub || '';
    var SHOW_CARD_DESC = !!cfg.showCardDesc;

  var root = document.querySelector(cfg.scope);
  if (!root) return;

  /* The shared stylesheet is scoped `.sk-hub`, but the scope class lives in
     block.html — which IS the socket pasted into the GHL page, not git-served
     markup. Adding `sk-hub` there by hand would turn every version migration
     into a per-account `push-block --live` write on every buyer. Stamping it
     here instead keeps a version bump a pure git push, which is the whole
     point of the shared component. Runs before any content is built, so there
     is no unstyled flash. (2026-09-25.) */
  root.classList.add('sk-hub');

  /* ---------- typeface ----------
     The block styles Archivo on the VARIABLE axes, wdth and wght, but it never
     loaded the font: it inherited whatever the host GHL page happened to
     request. GHL asks for static weights, and against a static face
     font-variation-settings is ignored outright, so every weight in the design
     silently collapsed to one. Load the variable file ourselves so the block
     owns its own typography instead of borrowing the page's.
     No IIFE here: the build appends the extra script at the first '})();'. */
  var FONT_HREF = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap';
  if (!document.querySelector('link[href^="https://fonts.googleapis.com/css2?family=Archivo:wdth"]')) {
    var fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = FONT_HREF;
    document.head.appendChild(fontLink);
  }

  /* ---------- icons ----------
     Inline path data in one map, 24x24, fill none, stroke currentColor. Never an
     icon font, never a remote sprite. */
  var I = {
    search:  '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/>',
    x:       '<path d="M6 6l12 12M18 6 6 18"/>',
    link:    '<path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7"/><path d="M14 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.7-1.7"/>',
    inbox:   '<path d="M2.5 13.5h5l1.6 2.6h5.8l1.6-2.6h5"/><path d="M4.6 5.4 2.5 13.5v3.6a2.4 2.4 0 0 0 2.4 2.4h14.2a2.4 2.4 0 0 0 2.4-2.4v-3.6L19.4 5.4A2.4 2.4 0 0 0 17.2 4H6.8a2.4 2.4 0 0 0-2.2 1.4z"/>',
    rocket:  '<path d="M13.5 4.5c3.4-2.2 6-2 6-2s.2 2.6-2 6c-2.5 3.9-6.4 5.6-6.4 5.6l-3.2-3.2S9.6 7 13.5 4.5z"/><path d="M8 15.5 5 18M6.5 11.5 4 12.8l1.8 1.8M12.5 17.5l1.3-2.5 1.8 1.8"/>',
    life:    '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="4"/><path d="m5.3 5.3 3.9 3.9M14.8 14.8l3.9 3.9M18.7 5.3l-3.9 3.9M9.2 14.8l-3.9 3.9"/>',
    leaf:    '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    dumbbell:'<path d="M6.5 6.5v11"/><path d="M17.5 6.5v11"/><path d="M3.5 9v6"/><path d="M20.5 9v6"/><path d="M6.5 12h11"/>',
    quiz:    '<path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9.5"/>',
    drop:    '<path d="M12 2.7s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.1 12 2.7 12 2.7Z"/>',
    gift:    '<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 13.5h18"/><path d="M12 9v11"/><path d="M12 9S10.6 5 8.6 5a2.5 2.5 0 0 0 0 5"/><path d="M12 9s1.4-4 3.4-4a2.5 2.5 0 0 1 0 5"/>',
    info:    '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-5"/><path d="M12 8h.01"/>',
    user:    '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    users:   '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 19.5a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6"/><path d="M18 14.4a6.5 6.5 0 0 1 3.5 5.1"/>',
    compass: '<circle cx="12" cy="12" r="9.5"/><path d="m15.5 8.5-2 5.2-5.2 2 2-5.2Z"/>',
    copy:    '<rect x="9" y="9" width="12" height="12" rx="2.4"/><path d="M5.5 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v.5"/>',
    check:   '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    out:     '<path d="M14 4h6v6"/><path d="M20 4 10.5 13.5"/><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
    video:   '<rect x="2.5" y="6" width="12" height="12" rx="2.5"/><path d="m14.5 11 6-3.4v8.8l-6-3.4z"/>',
    play:    '<path d="M21 7.5v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z"/><path d="M10.5 9.2v5.6l5-2.8z" fill="currentColor" stroke="none"/>',
    chev:    '<path d="m9 5 7 7-7 7"/>',
    down:    '<path d="m6 9 6 6 6-6"/>',
    scan:    '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="11" r="3"/><path d="M7 17c1-2 2.9-3 5-3s4 1 5 3"/>',
    coffee:  '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M7 2v3"/><path d="M11 2v3"/>',
    kids:    '<circle cx="12" cy="8.5" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/><path d="M8.5 3.5 12 1l3.5 2.5"/>',
    chart:   '<path d="M3 20h18"/><rect x="5" y="11" width="3.5" height="6" rx="1"/><rect x="10.2" y="7" width="3.5" height="10" rx="1"/><rect x="15.5" y="13" width="3.5" height="4" rx="1"/>',
    image:   '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m3.5 17 4.7-4.7a2 2 0 0 1 2.8 0l3.2 3.2"/><path d="m13 14.2 2.1-2.1a2 2 0 0 1 2.8 0l2.6 2.6"/>',
    cart:    '<circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/><path d="M2.5 3h2.2l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.5a1.6 1.6 0 0 0 1.6-1.3L20.5 7H6"/>',
    share:   '<circle cx="18" cy="5.5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="18.5" r="2.6"/><path d="m8.3 10.7 7.4-3.9"/><path d="m8.3 13.3 7.4 3.9"/>',
    /* added for the training buttons and the lead magnet, 2026-09-17 */
    printer: '<path d="M7 9V4.2h10V9"/><path d="M7 17H5.6A2.1 2.1 0 0 1 3.5 15v-3.9A2.1 2.1 0 0 1 5.6 9h12.8a2.1 2.1 0 0 1 2.1 2.1V15a2.1 2.1 0 0 1-2.1 2.1H17"/><path d="M7 14h10v5.8H7z"/>',
    guide:   '<path d="M4.5 5.2A1.7 1.7 0 0 1 6.2 3.5H19v13.2H6.2a1.7 1.7 0 0 0-1.7 1.7z"/><path d="M4.5 18.4a1.7 1.7 0 0 0 1.7 1.7H19v-3.4"/><path d="M8.2 7.6h6.6M8.2 11h4.4"/>',
    target:  '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    speech:  '<path d="M20.5 12.4c0 4-3.8 7.2-8.5 7.2a10 10 0 0 1-2.6-.34L4 21l1.2-3.4A6.9 6.9 0 0 1 3.5 12.4c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2z"/>'
  };
  function icon(k, w) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
      (w || 1.7) + '" stroke-linecap="round" stroke-linejoin="round">' + I[k] + '</svg>';
  }

  /* ---------- platform brand marks ----------
     ⚠️ COPIED FROM simple-icons v16.32.0, NEVER DRAWN. A brand mark reproduced
     from memory is recognisably wrong, which is worse than no icon at all. Same
     eight strings the platform app ships, lifted from its generated file so the
     two cannot drift.

     These are FILLED paths on a 24x24 box, not the stroked outline set above,
     so they get their own renderer rather than being forced through icon().
     They inherit the button's ink rather than each brand's own hex: eight brand
     colours in one card fights the palette, and the SHAPE is what carries
     recognition. Nobody identifies Reddit by the orange alone. */
  var BRAND_MARKS = {
    x: 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z',
    reddit: 'M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z',
    instagram: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077',
    tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    facebook: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
    threads: 'M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z',
    youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    quora: 'M7.3799.9483A11.9628 11.9628 0 0 1 21.248 19.5397l2.4096 2.4225c.7322.7362.21 1.9905-.8272 1.9905l-10.7105.01a12.52 12.52 0 0 1-.304 0h-.02A11.9628 11.9628 0 0 1 7.3818.9503Zm7.3217 4.428a7.1717 7.1717 0 1 0-5.4873 13.2512 7.1717 7.1717 0 0 0 5.4883-13.2511Z'
  };
  function brandMark(k) {
    var d = BRAND_MARKS[k];
    return d ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' + d + '"/></svg>' : '';
  }

  /* ---------- custom values ----------
     Empty, unsubstituted, and the "Paste the full link" placeholder all count as
     not filled, exactly as the live marketing links block treats them. */
  function cv(key) {
    var v = (root.getAttribute('data-cv-' + key) || '').trim();
    if (!v || v.indexOf('{') !== -1 || /^(paste|enter|add)\b/i.test(v)) return '';
    return v;
  }
  function href(v) { return /^https?:\/\//i.test(v) ? v : 'https://' + v.replace(/^\/+/, ''); }

  /* ---------- helpers the other systems' forks grew ----------
     Merged in when the three hubs were de-forked, 2026-09-25. Both are no-ops
     for a system whose config does not reach for them, which is why they live
     here rather than in a block: the alternative is the next system inventing
     a fourth slightly-different copy, which is exactly how the forks started.

     actionRow — Conectiv and Nueva. A pure helper, no state.
     composed  — Nueva. A sponsor-composed url, and it returns '' unless the
                 config carries SYS.compose AND the rep's id is filled, because
                 the un-composed base resolves to a real page with NO SPONSOR on
                 it: rendering that is worse than rendering no link at all. */
  function actionRow(href_, mark, label) {
    return '<a class="sk-action" href="' + href_ + '" target="_blank" rel="noopener">' +
      mark + '<span class="sk-action-label">' + label + '</span>' +
      '<span class="sk-action-go" aria-hidden="true">' + icon('out', 1.8) + '</span></a>';
  }

  var composeId = SYS.compose ? cv(SYS.compose.cv) : '';
  function composed(path) {
    if (!SYS.compose || !composeId) return '';
    return SYS.compose.base.replace('{id}', encodeURIComponent(composeId)).replace(/\/+$/, '') +
      '/' + String(path).replace(/^\/+/, '');
  }

  /* ---------- the four destinations ---------- */
  var DEST = [
    { id: 'links',   icon: 'link',   name: 'View my funnel links', tease: 'Every link you can share, ready to copy.' },
    { id: 'leads',   icon: 'inbox',  name: 'View my leads',        tease: 'Where your leads and conversations live.' },
    { id: 'promote', icon: 'rocket', name: 'Generate leads now',   tease: 'What your day should actually look like.' },
    { id: 'support', icon: 'life',   name: 'Contact support',      tease: SUPPORT_TEASE }
  ];

  /* Referral is a destination, not a card at the bottom of the funnel list. PUSHED
     rather than declared inline so a system whose config carries no affiliate program
     never grows a tile that leads nowhere. Last on purpose: the others are the rep's
     job, this one is their upside. */
  /* Joe, 2026-09-24: "Fast Start Training / Learn how to use this system, this is
     where you start" with a video icon, above the others. UNSHIFTED rather than
     declared inline, same reason the referral tile is pushed: a system with no
     training hub in its config never grows a tile that leads nowhere.

     It is the one destination that leaves the app, so it carries an href of its
     own instead of a #/screen route. */
  if (SYS.training) DEST.unshift({ id: 'training', icon: 'video',
    name: 'Fast Start Training', tease: 'Learn how to use this system. This is where you start.',
    /* Joe wrote it with a dash: "Learn how to use this system - this is where
       you start." Two sentences instead, because a dash clause is out in
       shipped copy and a comma there is a splice. His words, unchanged. */
    href: SYS.training });

  /* Find conversations. PUSHED like the referral tile, for the same reason: a
     system with no term file never grows a tile that leads nowhere. It sits
     above referral because it is the rep's job and referral is their upside. */
  if (cfg.search) DEST.push({ id: 'search', icon: 'search',
    name: 'Find conversations to join',
    tease: 'Today\u2019s search term, on every platform worth checking.' });

  if (SYS.affiliate) DEST.push({ id: 'referral', icon: 'share',
    name: 'My Shark System Referral Link', tease: 'Share the system, get yours for free.' });


  /* ---------- link building ----------
     Two models across the fleet, and the difference is deliberate.
       cv   : one custom value per funnel holding a FULL url. GLP reps run
              several domains per account and their slugs drift per install, so
              an assembled url silently serves the 404 fallback with a 200.
       slug : one domain custom value plus a fixed slug per funnel. Vital and
              Conectiv installs are uniform, so the slugs hold.
     A slug starting with http is absolute and used verbatim, which is how the
     central how-to pages sit alongside a rep's own domain. */
  var domain = SYS.domainCv
    ? cv(SYS.domainCv).replace(/^https?:\/\//i, '').replace(/\/+$/, '')
    : '';

  /* The rep's OWN how-to page, on the rep's OWN domain.
     Joe's v2 three-part training pages live as a step inside each funnel and
     travel with the snapshot; the glpshark.com/*-training pages are the OLD v1
     single-page versions, and those must keep serving because older accounts
     still point at them. So the v2 hub addresses the copy in the rep's account.

     ⚠️ On a SNAPSHOT the domain custom value holds INSTRUCTION TEXT ("Enter the
     domain you set up as..."), not a domain. Rendering that would produce
     https://Enter the domain you set up.../glp-food-guide-how-to on every card.
     So the value has to look like a hostname before it is used; when it does
     not, this returns '' and the caller falls back to the published v1 page. */
  var howtoDomain = (function () {
    var v = SYS.howtoDomainCv ? cv(SYS.howtoDomainCv) : '';
    v = String(v || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v) ? v : '';
  })();

  function howtoUrl(it) {
    if (it.howtoSlug && howtoDomain) return 'https://' + howtoDomain + '/' + it.howtoSlug;
    return it.howto || '';   // published v1 page, or nothing
  }

  function funnelUrl(it) {
    /* a card can be gated on its own custom value being filled (Nueva's fork
       added this). No-op for a card that carries no gateCv. */
    if (it.gateCv && !cv(it.gateCv)) return '';
    if (SYS.domainCv) {
      if (!domain) return '';
      if (/^https?:/i.test(it.slug || '')) return it.slug;
      return 'https://' + domain + (it.slug ? '/' + it.slug : '');
    }
    var v = cv(it.cv);
    return v ? href(v) : '';
  }

  /* ---------- greeting ---------- */
  var firstName = cv(SYS.nameCv);
  var nameEl = root.querySelector('[data-name]');
  if (nameEl) nameEl.textContent = firstName;
  var commaEl = root.querySelector('[data-comma]');
  if (commaEl) commaEl.textContent = firstName ? ', ' : '';

  /* A destination is normally a screen in this app (#/id). One of them leaves for
     the training hub, so it needs a real href and a new tab. Shared by the home
     grid and the nav sheet so the two can never disagree about where a tile goes. */
  function destAttrs(d) {
    return d.href
      ? 'href="' + d.href + '" target="_blank" rel="noopener"'
      : 'href="#/' + d.id + '"';
  }

  /* ---------- home destinations ---------- */
  var grid = root.querySelector('[data-menugrid]');
  grid.innerHTML = DEST.map(function (d, i) {
    return '<a class="sk-dest" ' + destAttrs(d) + ' style="animation-delay:' + (0.1 + i * 0.05) + 's">' +
      '<span class="sk-mark" aria-hidden="true">' + icon(d.icon) + '</span>' +
      '<span><span class="sk-dest-name">' + d.name + '</span>' +
      '<span class="sk-dest-tease">' + d.tease + '</span></span>' +
      '<span class="sk-dest-go" aria-hidden="true">' + icon('chev', 2) + '</span></a>';
  }).join('');

  /* ---------- nav sheet ---------- */
  var navlist = root.querySelector('[data-navlist]');
  navlist.innerHTML = [{ id: 'home', icon: 'compass', name: 'Home' }].concat(DEST).map(function (d) {
    return '<a class="sk-nav" ' + destAttrs(d) + '>' +
      '<span class="sk-mark" aria-hidden="true">' + icon(d.icon) + '</span>' +
      '<span>' + d.name + '</span></a>';
  }).join('');


  /* ---------- per funnel: training, then quick actions ----------
     Joe's spec, Sep 2026: three training buttons under every funnel link, then a
     "useful quick actions" row. All three training buttons go to the SAME funnel
     training page and differ only by the hash, because that page is three tabs
     and honours #part-N on load. So the hub needs no knowledge of the page
     beyond its url, and a funnel that has no training page yet simply renders
     no training block rather than three dead buttons. */
  /* Joe, 2026-09-23: "those three items under training / guidance, lets use the
     emojis we use on the inside page instead of the icons". The emoji is the
     SAME one each part wears on the funnel training page it links to - its
     header and its sticky footer - so a rep sees one mark per part wherever
     they meet it. Kept beside `icon` rather than replacing it, because the
     outline set still dresses every other row on this page. */
  var TRAINING = cfg.TRAINING || [
    { part: 1, emoji: '\uD83D\uDEE0\uFE0F', icon: 'play',   label: 'How does this funnel work?',
      sub: 'Video and write up that explains this funnel!' },
    { part: 2, emoji: '\uD83D\uDE80',        icon: 'target', label: 'How do I generate leads with this funnel?',
      sub: 'Video, write up, post ideas &amp; content to guide you on generating leads!' },
    { part: 3, emoji: '\uD83D\uDCAC',        icon: 'speech', label: 'What to say to leads who come through this funnel?',
      sub: 'Video and write up that trains you on how to turn your leads into sales / recruits!' }
  ];

  function subhead(text) {
    return '<p class="sk-subhead">' + text + '</p>';
  }

  /* ---------- the Training / Guidance rows on a funnel card ----------
     UNIFIED from three forks, 2026-09-25. All three rendered these rows and all
     three did it differently, including a real correctness split.

     `it.parts` accepts either shape:
       a NUMBER  — the first n parts (GLP's model: parts are contiguous)
       an ARRAY  — specific part keys, e.g. ['work','close'] skipping the middle
                   one (Nueva's model; its No Crash Plan funnel does exactly this)

     🪤 ANCHORS ARE BY POSITION, NOT BY PART NUMBER, and that is not cosmetic.
     The training page itself numbers its panels `panel.id = "sk-part-" + (i+1)`
     (funnel-training/v1), so a page built WITHOUT part 2 has panels sk-part-1
     and sk-part-2. GLP's fork linked to the part NUMBER, which happens to agree
     only because its parts are always 1..n; point it at a funnel with parts 1
     and 3 and it would link to #part-3, which does not exist on that page.
     Nueva's fork had it right. Index-based is correct for both.

     `sub` is optional: present, the row gets the --sub modifier and a second
     line; absent, it renders exactly what Conectiv and Nueva's actionRow did. */
  function trainingBlock(it) {
    var base = howtoUrl(it);
    if (!base) return '';
    var want = it.parts, list;
    if (Object.prototype.toString.call(want) === '[object Array]') {
      list = want.map(function (k) {
        for (var i = 0; i < TRAINING.length; i++)
          if (TRAINING[i].key === k || TRAINING[i].part === k) return TRAINING[i];
        return null;
      }).filter(Boolean);
    } else {
      var n = want || TRAINING.length;
      list = TRAINING.filter(function (t, i) { return (i + 1) <= n; });
    }
    if (!list.length) return '';
    /* ESCAPE HATCH, from Conectiv's fork. Its how-to pages were still the old
       SINGLE-PAGE format when the deep links were written, so #part-N landed
       every row at the top of the same page. `singleTrainingRow` collapses the
       three deep links to one plain link at the page top. Conectiv runs with it
       OFF today (its pages were rebuilt), so this branch is currently unused —
       carried anyway, because a deliberate fallback that quietly disappears in
       a refactor is the kind of thing nobody notices until they need it. */
    if (cfg.singleTrainingRow) {
      return subhead('Training / Guidance') + '<div class="sk-actions">' +
        actionRow(base,
          '<span class="sk-action-mark" aria-hidden="true">' + icon('play', 1.7) + '</span>',
          'How to use this funnel') + '</div>';
    }
    return subhead('Training / Guidance') + '<div class="sk-actions">' +
      list.map(function (t, i) {
        return '<a class="sk-action' + (t.sub ? ' sk-action--sub' : '') + '" href="' +
          base + '#part-' + (i + 1) + '" target="_blank" rel="noopener">' +
          '<span class="sk-action-mark sk-action-mark--emoji" aria-hidden="true">' + t.emoji + '</span>' +
          '<span class="sk-action-label">' + t.label +
            (t.sub ? '<span class="sk-action-sub">' + t.sub + '</span>' : '') + '</span>' +
          '<span class="sk-action-go" aria-hidden="true">' + icon('out', 1.8) + '</span></a>';
      }).join('') + '</div>';
  }

  /* The lead magnet itself, so a rep can read or print what they are sending.
     `guides` is a list because some funnels ship two (a guide and a grocery
     list). Canva sits here too: it is an asset the rep fetches, not training. */
  /* ---------- the Useful Quick Actions rows ----------
     UNIFIED from three forks, 2026-09-25. The only real difference was the
     second line on a guide row: GLP printed a fixed "Print the guide or quickly
     access the link" under every one, Conectiv and Nueva printed none.

     So it is config: `g.sub` per guide, else cfg.guideSub for the whole system,
     else no second line and no --sub modifier. The print row is unchanged (it
     renders only when a card carries one) and the canva row was already
     byte-identical across all three. */
  function quickActions(it) {
    function row(u, mark, label, sub) {
      return '<a class="sk-action' + (sub ? ' sk-action--sub' : '') + '" href="' + u +
        '" target="_blank" rel="noopener">' +
        '<span class="sk-action-mark" aria-hidden="true">' + mark + '</span>' +
        '<span class="sk-action-label">' + label +
          (sub ? '<span class="sk-action-sub">' + sub + '</span>' : '') + '</span>' +
        '<span class="sk-action-go" aria-hidden="true">' + icon('out', 1.8) + '</span></a>';
    }
    var rows = (it.guides || []).map(function (g) {
      var u = g.cv ? cv(g.cv) : g.url;
      if (!u) return '';
      return row(href(u), icon('guide', 1.7), g.label, g.sub || GUIDE_SUB);
    }).filter(Boolean);
    if (it.print) {
      rows.push(row(it.print, icon('printer', 1.7), 'Print optimized version',
        'Opens in Canva, sized for printing and handing out.'));
    }
    if (it.canva) {
      rows.push(row(it.canva, icon('image', 1.7), 'Images for social posts', ''));
    }
    /* Follow up scripts. v1 rendered these and NONE of the three forks merged into
       this engine carried one, so the merge quietly dropped a capability nobody
       noticed was missing. Beneve has five and was the first system to need it
       back. Kept last: the guide is what they send, the images are what they post,
       the scripts are what they say once somebody replies. (2026-09-25.) */
    if (it.scripts) {
      rows.push(row(it.scripts, icon('speech', 1.7), 'Follow up scripts',
        'What to say when somebody replies.'));
    }
    if (!rows.length) return '';
    return subhead('Useful Quick Actions') + '<div class="sk-actions">' + rows.join('') + '</div>';
  }

  /* ---------- the "2 minute customer video" row on the promote screen ----------
     Rendered rather than hardcoded because it is the rep's own link, and an
     empty custom value has to drop the row instead of linking to nothing. */
  var twoMin = root.querySelector('[data-two-min-video]');
  if (twoMin) {
    /* Was cv('drops_funnel_link'), which was a guess: GLP has no custom value for
       this page, that CV is EMPTY in every account, and no "drops" funnel exists
       for it to point at, so the row only ever rendered the support note. It is
       the rep's own /products-info step, so it is derived the same way the how-to
       links are. (Jeff, 2026-09-24, answering the ASSUMED CV note in block.html.) */
    /* ---------- the "two minute customer video page" row ----------
       UNIFIED from two forks, 2026-09-25, and they built the URL differently
       because the two link models differ:
         domainCv systems (Conectiv, Nueva) — funnelUrl({slug}), the SAME
           mechanism as every other link on the page. No extra custom value.
         per-funnel-cv systems (GLP) — there is no cv for this page, so it is
           assembled from the how-to domain plus a slug. Nueva's own comment on
           this: "GLP had to guess at a CV here because GLP's links are
           per-funnel CVs." Nueva's is the better shape; GLP cannot use it.

       ⚠️ ORDER AND WORDING ARE CONFIG, DELIBERATELY. GLP puts the url ABOVE the
       button (Joe, Figma #41: "Swap these, put the link above the button" — a
       rep reads the address to check it is theirs before reaching for copy).
       Nueva still has the old button-first order. Both are preserved verbatim
       here rather than quietly unified, because a de-fork has to be
       behaviour-preserving: mix a refactor with an improvement and you cannot
       tell a merge bug from an intended change. Giving Nueva Joe's order is a
       one-line config flip, and it should be made on purpose. */
    var VP = cfg.videoPage || (SYS.videoPageSlug ? { slug: SYS.videoPageSlug } : null);
    var tmv = !VP ? ''
      : SYS.domainCv ? funnelUrl({ slug: VP.slug })
      : (howtoDomain && VP.slug ? 'https://' + howtoDomain + '/' + VP.slug : '');
    var tmvUrl = tmv
      ? '<div class="sk-url"><span class="sk-url-text">' + tmv.replace(/^https?:\/\//, '') + '</span>' +
        '<a class="sk-open" href="' + href(tmv) + '" target="_blank" rel="noopener" aria-label="' +
          ((VP && VP.ariaLabel) || 'Open your customer video page') + '">' + icon('out', 1.8) + '</a></div>'
      : '';
    var tmvBtn = tmv
      ? '<button class="sk-copy" type="button" data-copy-label="Copy the page link" data-copy="' + href(tmv) + '">' +
        icon('copy', 1.8) + '<span class="sk-copy-label">Copy the page link</span></button>'
      : '';
    twoMin.innerHTML = tmv
      /* URL above the copy button, every system. Joe's Figma note 41 landed on
         GLP first and the other two kept button-first purely because nobody
         diffed the forks. Jeff, 2026-09-25: "that's something that should be
         universal." So it is not config: there is one right order. */
      ? tmvUrl + tmvBtn
      : '<p class="sk-note-line">' + ((VP && VP.note) ||
          'Your domain has not been set up yet, so this link cannot be built. Contact support and we will finish it.') + '</p>';
  }

  /* ---------- funnel links ---------- */
  var linksHost = root.querySelector('[data-links]');
  var html = '';
  var liveCount = 0;
  SYS.groups.forEach(function (g) {
    var rows = g.items.map(function (it) {
      var full = funnelUrl(it);
      if (!full) return '';
      var url = full.replace(/^https?:\/\//, '');
      return '<article class="sk-card" data-open="false">' +
        '<button class="sk-trigger" type="button" aria-expanded="false">' +
          '<span class="sk-mark" aria-hidden="true">' + icon(it.icon) + '</span>' +
          '<span><span class="sk-name">' + it.name + '</span>' +
          '<span class="sk-tease">' + it.tease + '</span></span>' +
          '<span class="sk-chev" aria-hidden="true">' + icon('down', 2) + '</span>' +
        '</button>' +
        '<div class="sk-panel"><div class="sk-panel-inner"><div class="sk-panel-pad">' +
          /* ⚠️ THE CARD DESCRIPTION IS OPT-IN, and the default is OFF.
             Joe, 2026-09-23 (Figma #11): "remove this (for all sections) - this
             information is in the 'how do I generate leads with this funnel?'"
             The paragraph said the same thing the part 2 training row links to,
             twice on one card. GLP dropped it; Conectiv and Nueva still render
             it, so they set cfg.showCardDesc and keep what they have today.
             `desc` stays in every system's data either way — it is the only
             place each funnel's job is written in plain language for whoever
             edits the config next. Do not render it by default without asking. */
          (SHOW_CARD_DESC && it.desc ? '<p class="sk-desc">' + it.desc + '</p>' : '') +
          '<button class="sk-copy" type="button" data-copy="' + full + '">' +
            icon('copy', 1.8) + '<span class="sk-copy-label">Copy my link</span></button>' +
          '<div class="sk-url"><span class="sk-url-text">' + url + '</span>' +
            '<a class="sk-open" href="' + full + '" target="_blank" rel="noopener" aria-label="Open ' + it.name + '">' + icon('out', 1.8) + '</a></div>' +
          trainingBlock(it) + quickActions(it) +
        '</div></div></div></article>';
    }).join('');
    if (!rows) return;
    var shown = rows.split('<article').length - 1;
    liveCount += shown;
    html += '<div class="sk-group"><div class="sk-group-head">' +
      '<span class="sk-group-label">' + g.label + '</span>' +
      '<span class="sk-group-rule"></span>' +
      '<span class="sk-group-count">' + shown + '</span></div>' + rows + '</div>';
  });
  /* Extra groups: a row list of name plus link, used for the social image
     library, product and buy links, and anything else that is a directory
     rather than a funnel. Static entries carry a url, per rep entries carry a
     custom value and drop out when it is empty. */
  (SYS.lists || []).forEach(function (L) {
    /* A library that is ONE destination rather than a directory. A dropdown
       holding a single row costs two taps to reach one link, so it renders as
       a card with a primary button instead. */
    if (L.single) {
      html += '<div class="sk-group"><div class="sk-group-head">' +
        '<span class="sk-group-label">' + L.label + '</span><span class="sk-group-rule"></span>' +
        '<span class="sk-group-count">1</span></div>' +
        '<article class="sk-card" data-open="false">' +
          '<button class="sk-trigger" type="button" aria-expanded="false">' +
            '<span class="sk-mark" aria-hidden="true">' + icon(L.icon) + '</span>' +
            '<span><span class="sk-name">' + L.name + '</span>' +
            '<span class="sk-tease">' + L.tease + '</span></span>' +
            '<span class="sk-chev" aria-hidden="true">' + icon('down', 2) + '</span>' +
          '</button>' +
          '<div class="sk-panel"><div class="sk-panel-inner"><div class="sk-panel-pad">' +
            '<p class="sk-desc">' + L.single.desc + '</p>' +
            '<a class="sk-copy" href="' + L.single.url + '" target="_blank" rel="noopener">' +
              icon('image', 1.8) + L.single.cta + '</a>' +
          '</div></div></div></article></div>';
      return;
    }
    var rows = L.items.map(function (x) {
      /* THREE WAYS A ROW GETS ITS URL, and a system may mix them in one list.
           url   a literal
           path  COMPOSED onto the rep's own subdomain from one custom value
                 (Nueva: 36 product links derive from nueva_user_name alone,
                 rather than 36 stored values). Yields '' unless the rep's id is
                 filled, so an uncomposed link never renders — see composed().
           cv    a stored full url (GLP's model, one value per link)
         Nueva's product list deliberately mixes path and cv: every product row
         is composed, and the opportunity row stays a stored value because it
         points at the CORPORATE page, not a rep one. (Jeff, 2026-09-22.) */
      var u = x.url || (x.path ? composed(x.path) : '') || (x.cv ? cv(x.cv) : '');
      if (!u) return '';
      u = href(u);
      return '<li class="sk-prow"><a class="sk-prow-name" href="' + u + '" target="_blank" rel="noopener">' +
        x.name + '</a>' + (x.url
          ? '<a class="sk-chip sk-chip--go" href="' + u + '" target="_blank" rel="noopener">Open</a>'
          : '<button class="sk-copy sk-copy--mini" type="button" data-copy="' + u + '">' +
            icon('copy', 1.8) + '<span class="sk-copy-label">Copy</span></button>') + '</li>';
    }).filter(Boolean);
    if (!rows.length) return;
    if (L.perRep) liveCount += rows.length;
    html += '<div class="sk-group"><div class="sk-group-head">' +
      '<span class="sk-group-label">' + L.label + '</span><span class="sk-group-rule"></span>' +
      '<span class="sk-group-count">' + rows.length + '</span></div>' +
      '<article class="sk-card" data-open="false">' +
        '<button class="sk-trigger" type="button" aria-expanded="false">' +
          '<span class="sk-mark" aria-hidden="true">' + icon(L.icon) + '</span>' +
          '<span><span class="sk-name">' + L.name + '</span>' +
          '<span class="sk-tease">' + L.tease + '</span></span>' +
          '<span class="sk-chev" aria-hidden="true">' + icon('down', 2) + '</span>' +
        '</button>' +
        '<div class="sk-panel"><div class="sk-panel-inner"><div class="sk-panel-pad">' +
          '<ul class="sk-plist">' + rows.join('') + '</ul>' +
        '</div></div></div></article></div>';
  });

  linksHost.innerHTML = html;

  /* ---------- refer the system ----------
     Its own screen since it became a home destination, so it is one tap from home
     instead of buried under the funnel list. The link is per rep, so an unfilled
     custom value gets the setup message rather than a dead link or, worse, someone
     else's. It deliberately does NOT count toward liveCount: that gate is about
     whether the FUNNEL links are ready. */
  var referralHost = root.querySelector('[data-referral]');
  var affiliate = SYS.affiliate ? cv(SYS.affiliate.cv) : '';
  if (referralHost) {
    if (affiliate) {
      var au = href(affiliate);
      referralHost.innerHTML =
        '<article class="sk-card" data-open="true">' +
          '<button class="sk-trigger" type="button" aria-expanded="true">' +
            '<span class="sk-mark" aria-hidden="true">' + icon('share') + '</span>' +
            '<span><span class="sk-name">' + SYS.affiliate.name + '</span>' +
            '<span class="sk-tease">Share the Shark marketing system</span></span>' +
            '<span class="sk-chev" aria-hidden="true">' + icon('down', 2) + '</span>' +
          '</button>' +
          '<div class="sk-panel"><div class="sk-panel-inner"><div class="sk-panel-pad">' +
            '<p class="sk-desc">' + SYS.affiliate.desc + '</p>' +
            '<button class="sk-copy" type="button" data-copy="' + au + '">' +
              icon('copy', 1.8) + '<span class="sk-copy-label">Copy my link</span></button>' +
            '<div class="sk-url"><span class="sk-url-text">' + au.replace(/^https?:\/\//, '') + '</span>' +
              '<a class="sk-open" href="' + au + '" target="_blank" rel="noopener" aria-label="Open your affiliate link">' + icon('out', 1.8) + '</a></div>' +
          '</div></div></div></article>';
    } else {
      referralHost.innerHTML =
        '<div class="sk-setup"><h2>Finish your setup first</h2>' +
        '<p>Your referral link has not been added yet. Paste it into your affiliate ' +
        'link custom value and this page fills in automatically.</p></div>';
    }
  }

  /* ---------- copy to clipboard ----------
     Idle to done state machine: the label swaps to a confirmation for 1.9s and
     then restores, so the tap is acknowledged without a toast. */
  root.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-copy]') : null;
    if (!btn) return;
    var url = btn.getAttribute('data-copy');
    var label = btn.querySelector('.sk-copy-label');
    /* the button is no longer only used for funnel links: the daily-method
       scripts copy a message, so the restored label comes from the button */
    var idle = btn.getAttribute('data-copy-label') || 'Copy my link';
    function done() {
      btn.setAttribute('data-state', 'done');
      if (label) label.textContent = 'Copied';
      setTimeout(function () {
        btn.removeAttribute('data-state');
        if (label) label.textContent = idle;
      }, 1900);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, done);
    } else {
      var t = document.createElement('textarea');
      t.value = url; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (err) {}
      document.body.removeChild(t);
      done();
    }
  });

  /* ---------- accordions ----------
     State lives in data-open on the card, mirrored to aria-expanded on the
     trigger. One open at a time, per group of cards on the active screen. */
  root.addEventListener('click', function (e) {
    var trigger = e.target.closest ? e.target.closest('.sk-trigger') : null;
    if (!trigger) return;
    var card = trigger.closest('.sk-card');
    var screen = trigger.closest('.sk-screen');
    var willOpen = card.getAttribute('data-open') !== 'true';
    screen.querySelectorAll('.sk-card').forEach(function (c) {
      c.setAttribute('data-open', 'false');
      var t = c.querySelector('.sk-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
    if (willOpen) {
      card.setAttribute('data-open', 'true');
      trigger.setAttribute('aria-expanded', 'true');
      fillEmbedsIn(card);

      /* ---- land at the TOP of the card that just opened ----
         Joe, 2026-09-24, on a walkthrough video of the mobile hub: "there's
         still some sections where you click, depending on how you click, and it
         scrolls to the bottom of the section."

         Nothing here was scrolling, which is the bug. One card is open at a
         time, so opening a card COLLAPSES the one above it and the document
         loses that card's whole height from above the reader. The scroll offset
         does not move, so the viewport ends up parked inside the card that just
         opened. "Depending on how you click" is the tell: it only bites when the
         card you open sits BELOW the one already open, which is why it reads as
         intermittent.

         Same shape as the fix already proven on the funnel training pages: the
         panel animation is suppressed for the single layout pass where the
         target is measured, so the collapse above is already applied. Measuring
         without that pass reads the mid animation layout and lands just as
         wrong.

         The bar is sticky at top:0, so its height comes off the target or the
         card header lands underneath it. Measured, never hardcoded. */
      var skBar = root.querySelector('.sk-bar');
      var skBarH = skBar ? Math.round(skBar.getBoundingClientRect().height) : 0;
      screen.classList.add('sk-nosnap');
      void screen.offsetHeight;
      var skY = Math.max(0, card.getBoundingClientRect().top + window.scrollY - skBarH - 10);
      requestAnimationFrame(function () {
        screen.classList.remove('sk-nosnap');
        if (Math.abs(skY - window.scrollY) >= 4) {
          window.scrollTo({ top: skY, behavior: 'smooth' });
        }
      });
    }
  });

  /* ---------- INLINE video embeds ----------
     Joe, 2026-09-23: "just put the video in with nothing covering it". Every
     video in the six action-item cards was behind a button or a thumbnail
     facade, and his read of that was simply that the videos were not in.

     So the player is visible, not summoned. It is still not in the MARKUP: six
     Vimeo iframes on one page is six third-party players loading before anyone
     has opened a card. Each embed fills the moment its card opens, which for a
     rep is indistinguishable from it always having been there, and an embed
     that sits outside a card fills on load.

     ⚠️ Fills ONCE. A card the rep closes and reopens keeps the iframe it
     already has, so playback position survives and the player does not reload
     under them. */
  function fillEmbed(box) {
    if (box.getAttribute('data-filled') === 'true') return;
    var id = box.getAttribute('data-vimeo');
    if (!id) return;
    box.setAttribute('data-filled', 'true');
    var f = document.createElement('iframe');
    f.src = 'https://player.vimeo.com/video/' + id + '?title=0&byline=0&portrait=0&dnt=1';
    f.title = box.getAttribute('data-vimeo-title') || 'Video';
    f.loading = 'lazy';
    f.allow = 'fullscreen; picture-in-picture';
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('frameborder', '0');
    box.appendChild(f);
  }
  function fillEmbedsIn(scope) {
    (scope || root).querySelectorAll('.sk-embed[data-vimeo]').forEach(fillEmbed);
  }
  /* anything not inside a collapsed card is visible right now */
  root.querySelectorAll('.sk-embed[data-vimeo]').forEach(function (box) {
    if (!box.closest('.sk-card')) fillEmbed(box);
  });

  /* ---------- video facade ----------
     The player is never in the markup: data-vimeo holds the numeric id and the
     iframe is injected on click, so a page carrying videos costs nothing until
     a viewer asks for one. */
  root.addEventListener('click', function (e) {
    var frame = e.target.closest ? e.target.closest('.sk-frame') : null;
    if (!frame) return;
    var id = frame.getAttribute('data-vimeo');
    if (!id) return;
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;width:100%;aspect-ratio:16/9';
    var f = document.createElement('iframe');
    f.src = 'https://player.vimeo.com/video/' + id + '?autoplay=1&title=0&byline=0&portrait=0';
    f.allow = 'autoplay; fullscreen; picture-in-picture';
    f.allowFullscreen = true;
    f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
    wrap.appendChild(f);
    frame.replaceWith(wrap);
  });

  /* ---------- menu sheet ---------- */
  var sheet = root.querySelector('[data-menu]');
  var lastFocus = null;
  function openMenu() {
    lastFocus = document.activeElement;
    sheet.hidden = false;
    document.body.style.overflow = 'hidden';
    sheet.querySelector('.sk-sheet-panel').focus();
  }
  function closeMenu() {
    sheet.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  root.querySelector('[data-menu-open]').addEventListener('click', openMenu);
  sheet.querySelectorAll('[data-menu-close]').forEach(function (el) {
    el.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !sheet.hidden) closeMenu();
  });

  /* ================= find conversations to join =================
     Ported from platform/src/lib/social.mjs, which is the same feature server
     rendered for the platform buyer app. The link building half of that file is
     pure, so this is the same logic rather than a second implementation.

     ⚠️ THE SCREEN IS BUILT HERE, NOT IN block.html. block.html is git served, so
     markup there would also have been a pure git push, but it would have been
     FOUR copies of the same section drifting apart again, which is the thing the
     merged engine exists to stop. Built here, every system gets the screen and
     future changes from one file.

     ⚠️ IT MUST RUN BEFORE THE ROUTER, which snapshots .sk-screen once. */
  if (cfg.search) (function () {
    var SEARCH = cfg.search;
    var ROTATE_HOURS = SEARCH.rotateHours || 24;
    var CHIP_COUNT = SEARCH.chipCount || 6;

    function esc(x) {
      return String(x == null ? '' : x)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function q(x) { return encodeURIComponent(String(x == null ? '' : x).trim()); }

    /* ⚠️ DO NOT DERIVE A TAG FROM A PHRASE. "cant afford ozempic" strips to
       #cantaffordozempic, which is a real URL that returns an empty feed and
       reads to the rep as a broken feature. One word is lossless to strip;
       anything longer needs a human to say which tag people actually follow,
       which is why `hashtag` is authored in the term file and not computed. */
    function hashtagify(x) {
      return String(x == null ? '' : x).toLowerCase()
        .replace(/[^a-z0-9\s]/g, '').replace(/^\s+|\s+$/g, '').replace(/\s+/g, '');
    }
    function tagFor(t) {
      if (t && t.hashtag) return t.hashtag;
      var w = String((t && t.term) || '').replace(/^\s+|\s+$/g, '').split(/\s+/);
      return (w.length === 1 && w[0]) ? hashtagify(w[0]) : null;
    }

    /* ⚠️ THE QUERY STRINGS ARE THE FEATURE, copied from social.mjs and never
       retyped. Every one of these platforms defaults to ranking by popularity,
       which serves the same viral posts for weeks. A rep looking for a
       conversation to JOIN needs the newest posts: an eighteen month old thread
       with 4,000 comments is not somewhere to introduce yourself. Drop f=live,
       sort=new or the upload date sort and the feature still "works" while
       quietly being useless. */
    var PLATFORMS = {
      instagram: { label: 'Instagram', needsTag: true,
        url: function (t) { return 'https://www.instagram.com/explore/tags/' + q(tagFor(t)) + '/'; } },
      tiktok:    { label: 'TikTok',   url: function (t) { return 'https://www.tiktok.com/search?q=' + q(t.term); } },
      x:         { label: 'X',        url: function (t) { return 'https://x.com/search?q=' + q(t.term) + '&f=live'; } },
      reddit:    { label: 'Reddit',   url: function (t) { return 'https://www.reddit.com/search/?q=' + q(t.term) + '&sort=new'; } },
      facebook:  { label: 'Facebook', url: function (t) { return 'https://www.facebook.com/search/posts?q=' + q(t.term); } },
      threads:   { label: 'Threads',  url: function (t) { return 'https://www.threads.net/search?q=' + q(t.term) + '&serp_type=default'; } },
      youtube:   { label: 'YouTube',  url: function (t) { return 'https://www.youtube.com/results?search_query=' + q(t.term) + '&sp=CAI%253D'; } },
      quora:     { label: 'Quora',    url: function (t) { return 'https://www.quora.com/search?q=' + q(t.term); } }
    };
    /* the order a rep should work them: where conversation happens, then where
       people perform */
    var ORDER = ['x', 'reddit', 'instagram', 'tiktok', 'facebook', 'threads', 'youtube', 'quora'];

    /* ⚠️ `platforms` NARROWS, it does not enumerate. Read as the full list, a term
       tagged {instagram,tiktok} offers two buttons and leaves out X, the single
       best place to find a live conversation. Default is everywhere the term can
       honestly go; the field exists only to rule one out. */
    function searchLinks(t) {
      if (!t || !String(t.term || '').trim()) return [];
      var allow = (t.platforms && t.platforms.length) ? t.platforms : null;
      var out = [];
      ORDER.forEach(function (k) {
        if (allow && allow.indexOf(k) === -1) return;
        var p = PLATFORMS[k];
        if (!p) return;
        /* a tag platform with no honest tag is a dead button, and a dead button
           reads as broken rather than absent */
        if (p.needsTag && !tagFor(t)) return;
        out.push({ key: k, label: p.label, url: p.url(t) });
      });
      return out;
    }

    /* ---------- which term, this slot ----------
       Computed from the date and a stable per rep offset: no daily job to miss,
       nothing stored, and a rep refreshing either side of midnight correctly
       sees two different terms. The offset spreads reps across the pool, because
       thirty people arriving in one hashtag on one morning is a pile on.

       ⚠️ LOCAL TIME, NOT UTC. The platform divides the epoch by a day, which
       flips the term at UTC midnight: early evening across the US, exactly when
       a rep is working. This runs in the rep's own browser, so it uses their
       midnight and the word "today" stays true.

       ⚠️ THE POOL SIZE IS THE CYCLE LENGTH. ~100 terms at one a day is a repeat
       every ~100 days; six terms is a repeat every six and reads as broken. */
    function offsetOf(id) {
      var h = 0, v = String(id || '');
      for (var i = 0; i < v.length; i++) h = (h * 31 + v.charCodeAt(i)) >>> 0;
      return h;
    }
    function slotNumber() {
      var d = new Date();
      return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / (3600000 * ROTATE_HOURS));
    }
    /* the rep's own identity, from a custom value the socket ALREADY carries, so
       this feature needs no push-block to any account */
    var REP_ID = SEARCH.repIdCv ? cv(SEARCH.repIdCv) : '';
    function pick(terms, n) {
      var live = terms.filter(function (t) { return t.active !== false; });
      if (!live.length) return null;
      var i = slotNumber() + offsetOf(REP_ID) + (n || 0);
      return live[((i % live.length) + live.length) % live.length];
    }

    /* ---------- the screen ---------- */
    var sec = document.createElement('section');
    sec.className = 'sk-screen';
    sec.setAttribute('data-screen', 'search');
    sec.innerHTML =
      '<header class="sk-page-head">' +
        '<h1 class="sk-page-title">Find conversations to&nbsp;join</h1>' +
        '<p class="sk-page-sub">Answer questions where people are asking questions. Somebody is asking ' +
        'yours right now, so here is today\u2019s term and every place worth looking.</p>' +
      '</header>' +
      '<div class="sk-srch">' +
        '<label class="sk-srch-lab" for="sk-q">' +
          (ROTATE_HOURS >= 24 ? 'Today\u2019s search term' : 'Your search term right now') + '</label>' +
        '<div class="sk-srch-in">' +
          '<span class="sk-srch-mark" aria-hidden="true">' + icon('search', 1.9) + '</span>' +
          '<input id="sk-q" class="sk-srch-field" type="text" autocomplete="off" spellcheck="false" ' +
            'aria-describedby="sk-q-note" value="">' +
          '<button class="sk-srch-x" type="button" aria-label="Clear the search term" hidden>' +
            icon('x', 2) + '</button>' +
        '</div>' +
        '<p class="sk-note-line" id="sk-q-note" data-note></p>' +
      '</div>' +
      '<h2 class="sk-h2" data-plathead>Look for it on</h2>' +
      '<div class="sk-plats" data-plats></div>' +
      '<p class="sk-note-line sk-plats-note" data-platnote hidden></p>' +
      /* ⚠️ NOT .sk-callout. That class is already an SVG speech bubble component in
         this stylesheet (rect / text / arrow), so reusing it for a text panel
         inherited nothing and quietly collided. Own class, own rules. */
      '<div class="sk-srch-rule">' +
        '<p class="sk-srch-rule-head">One rule holds the whole strategy together: be useful first.</p>' +
        '<p>Answer real questions, several times over, before you ever post a link. Authority is what ' +
        'makes the link get clicked, and you have to build it before you spend it.</p>' +
      '</div>' +
      '<h2 class="sk-h2">Other terms worth working</h2>' +
      '<div class="sk-chips" data-chips></div>';
    root.appendChild(sec);

    var platHead = null;   /* assigned once the screen is in the DOM */
    var field = sec.querySelector('#sk-q'), note = sec.querySelector('[data-note]');
    var plats = sec.querySelector('[data-plats]'), platnote = sec.querySelector('[data-platnote]');
    var chips = sec.querySelector('[data-chips]'), clear = sec.querySelector('.sk-srch-x');
    platHead = sec.querySelector('[data-plathead]');

    function paint(t) {
      var links = searchLinks(t);
      /* EMPTY FIELD IS A REAL STATE, not an edge case: the rep clears it to type
         their own. A heading with nothing under it reads as a page that failed to
         load, so the whole block goes and a line says what to do instead. */
      var blank = !String(t.term || '').trim();
      if (platHead) platHead.hidden = blank;
      plats.hidden = blank;
      if (blank) {
        plats.innerHTML = '';
        note.textContent = '';
        clear.hidden = true;
        platnote.hidden = false;
        platnote.textContent = 'Type a term above, or pick one from the list below.';
        chips.querySelectorAll('.sk-chip-t').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        return;
      }
      plats.innerHTML = links.map(function (l) {
        return '<a class="sk-plat" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer" ' +
          'aria-label="Search ' + esc(l.label) + ' for ' + esc(t.term) + '">' +
          '<span class="sk-plat-mark" aria-hidden="true">' + brandMark(l.key) + '</span>' +
          '<span>' + esc(l.label) + '</span></a>';
      }).join('');
      note.textContent = t.note || '';
      var live = !!String(t.term || '').trim();
      platnote.hidden = !(live && !tagFor(t));
      if (!platnote.hidden) {
        platnote.textContent = 'Instagram is not offered for this term: it only has a tag page, ' +
          'and this phrase has no tag people actually follow.';
      }
      clear.hidden = !field.value;
      chips.querySelectorAll('.sk-chip-t').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-term') === t.term));
      });
    }

    /* The terms are a file on Pages, not a custom value: a ~100 term pool cannot
       live in a merge field, and a git push updates every account at once. */
    fetch(SEARCH.terms, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (doc) {
        var TERMS = (doc && doc.terms) || [];
        if (!TERMS.length) throw new Error('no terms');
        var today = pick(TERMS, 0);
        /* the chips are the NEXT slots, so they are fresh every slot, never
           duplicate today's term, and a rep working ahead gets tomorrow's */
        var upcoming = [];
        for (var i = 1; i <= Math.min(CHIP_COUNT, TERMS.length - 1); i++) upcoming.push(pick(TERMS, i));
        chips.innerHTML = upcoming.map(function (t) {
          return '<button class="sk-chip-t" type="button" data-term="' + esc(t.term) +
            '" aria-pressed="false">' + esc(t.term) + '</button>';
        }).join('');
        chips.addEventListener('click', function (e) {
          var b = e.target.closest && e.target.closest('.sk-chip-t');
          if (!b) return;
          var hit = TERMS.filter(function (x) { return x.term === b.getAttribute('data-term'); })[0];
          var t = hit || { term: b.getAttribute('data-term') };
          field.value = t.term; paint(t);
        });
        field.addEventListener('input', function () {
          var hit = TERMS.filter(function (x) { return x.term === field.value; })[0];
          paint(hit || { term: field.value });
        });
        clear.addEventListener('click', function () {
          field.value = ''; paint({ term: '' }); field.focus();
        });
        field.value = today.term;
        paint(today);
      })
      .catch(function (err) {
        /* A failed fetch must not leave a blank screen pretending to be a tool.
           Say what happened and keep the field usable, because the links are
           built client side and work on anything the rep types. */
        chips.innerHTML = '';
        note.textContent = '';
        platnote.hidden = false;
        platnote.textContent = 'Today\u2019s suggested term could not be loaded. Type anything and the ' +
          'links below still work.';
        field.addEventListener('input', function () { paint({ term: field.value }); });
        clear.addEventListener('click', function () { field.value = ''; paint({ term: '' }); field.focus(); });
        paint({ term: '' });
        if (window.console) console.warn('[shark hub] search terms:', err && err.message);
      });

    /* ---------- the entry point that is not a tile ----------
       The promote screen's fourth daily item already reads "Answer questions
       where people are asking questions" on all four systems. It was a statement
       with nothing behind it; now it opens the screen. Matched on its text
       because that is what the tile IS, and guarded: no match, no change. */
    var tiles = root.querySelectorAll('[data-screen="promote"] .sk-tile');
    for (var ti = 0; ti < tiles.length; ti++) {
      if (!/asking questions/i.test(tiles[ti].textContent || '')) continue;
      var t = tiles[ti];
      var a = document.createElement('a');
      a.className = t.className + ' sk-tile--go';
      a.setAttribute('href', '#/search');
      if (t.getAttribute('style')) a.setAttribute('style', t.getAttribute('style'));
      a.innerHTML = t.innerHTML + '<span class="sk-tile-go" aria-hidden="true">' + icon('chev', 2) + '</span>';
      t.parentNode.replaceChild(a, t);
      break;
    }
  })();

  /* ---------- router ----------
     Hash routed so the whole hub is one block at one URL, which is what lets it
     travel inside a snapshot as a single custom code socket. */
  var screens = root.querySelectorAll('.sk-screen');
  var backBtn = root.querySelector('[data-back]');
  var VALID = { home: 1, links: 1, leads: 1, promote: 1, support: 1, referral: 1 };
  if (cfg.search) VALID.search = 1;

  function route() {
    var id = (location.hash || '').replace(/^#\/?/, '') || 'home';
    if (!VALID[id]) id = 'home';
    screens.forEach(function (s) {
      s.setAttribute('data-active', String(s.getAttribute('data-screen') === id));
    });
    root.setAttribute('data-route', id);
    backBtn.hidden = (id === 'home');
    navlist.querySelectorAll('.sk-nav').forEach(function (a) {
      if (a.getAttribute('href') === '#/' + id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (!sheet.hidden) closeMenu();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  backBtn.addEventListener('click', function () { location.hash = '#/home'; });
  route();

  /* the bar grows a hairline once the page has moved, so it separates from the
     content without drawing a permanent line across the top */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      root.setAttribute('data-scrolled', String(window.scrollY > 4));
      ticking = false;
    });
  }, { passive: true });


  /* ---------- setup state ----------
     An account with nothing filled in yet gets told what to do, not an empty
     screen. Shown INSTEAD of the funnel list, per the design system. */
  if (!liveCount) {
    linksHost.innerHTML =
      '<div class="sk-setup"><h2>Finish your setup first</h2>' +
      '<p>Your funnel links have not been added yet. Paste each one into the GLP ' +
      'Funnel Links custom values and this page fills in automatically.</p></div>';
  }

  /* ---------- home screen icon ----------
     Reps are told to add this to their home screen. Without an apple-touch-icon
     iOS screenshots the page and uses that as the icon, which looks broken.
     GHL always emits its own <link rel="icon"> pointing at the HighLevel
     default, so "skip if one exists" silently loses every time: drop the
     platform default first, then add ours, and leave anything deliberate. */
  (function () {
    var ICON = cfg.brandBase;
    function head(tag, attrs) {
      if (attrs.rel) {
        var existing = document.head.querySelectorAll(tag + '[rel="' + attrs.rel + '"]');
        for (var i = 0; i < existing.length; i++) {
          if (/leadconnectorhq|stcdn/.test(existing[i].getAttribute('href') || '')) existing[i].remove();
          else return;
        }
      }
      var el = document.createElement(tag);
      for (var a in attrs) el.setAttribute(a, attrs[a]);
      document.head.appendChild(el);
    }
    head('link', { rel: 'apple-touch-icon', sizes: '180x180', href: ICON + 'icon-180.png' });
    head('link', { rel: 'icon', type: 'image/png', sizes: '512x512', href: ICON + 'icon-512.png' });
    /* ⚠️ PER SYSTEM, NEVER LITERAL. The de-fork collapsed three forks into this
       file and baked GLP's two values in, which would have installed a home
       screen app called "GLP Shark" in GLP orange on every Nueva and Conectiv
       rep's phone. v1 read them from config and the three forks each carried
       the right pair; only the merge lost it. Caught 2026-09-25 while porting
       Beneve, because the DOM diff that verified the merge compared the block
       root and never looked at <head>. */
    if (SYS.appTitle)   head('meta', { name: 'apple-mobile-web-app-title', content: SYS.appTitle });
    if (SYS.themeColor) head('meta', { name: 'theme-color', content: SYS.themeColor });
  })();

  /* ---------- add to home screen ----------
     CAN THIS BE AUTOMATIC? Only partly, and only on Android.
       iOS: Safari exposes NO API. Add to Home Screen is Share then Add, a manual
            gesture no script can trigger or fake, so instructions lead.
       Android: Chrome MAY fire beforeinstallprompt, a real one tap install. It
            is not guaranteed, so it is a bonus: when it fires the button
            installs directly and the sheet never opens. */
  (function () {
    var openBtn = root.querySelector('[data-a2hs-open]');
    var sheet   = root.querySelector('[data-a2hs-sheet]');
    if (!openBtn || !sheet) return;

    // already installed: the button would be pure noise, so it never appears
    var installed = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                    window.navigator.standalone === true;
    if (installed) return;

    var label   = openBtn.querySelector('[data-a2hs-label]');
    var stepsEl = sheet.querySelector('[data-a2hs-steps]');
    var videoEl = sheet.querySelector('[data-a2hs-video]');
    var watch   = sheet.querySelector('.sk-watch');

    /* One walkthrough per platform. The runtimes differ, so the hint is per
       platform rather than one static claim. */
    var VIDEO = {
      ios:     { src: 'https://assets.cdn.filesafe.space/k5tyIG2Q85sUQ1RlSxBo/media/6a85cfbf005891114d29ddef.mp4', hint: '(1 minute video)' },
      android: { src: 'https://assets.cdn.filesafe.space/k5tyIG2Q85sUQ1RlSxBo/media/6a85d91f9cca634f084ab692.mp4', hint: '(2 minute video)' }
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
    /* Opening from inside another app's browser makes the real steps impossible,
       and it is common: reps reach this from a Facebook or Instagram message.
       Naming it saves the "it isn't there" support message. */
    var INAPP = /FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp/i.test(navigator.userAgent || '');
    var ua = navigator.userAgent || '';
    var guess = (/iPad|iPhone|iPod/.test(ua) || (ua.indexOf('Mac') > -1 && navigator.maxTouchPoints > 1))
      ? 'ios' : (/Android/i.test(ua) ? 'android' : 'ios');

    function paint(os) {
      sheet.querySelectorAll('.sk-seg-btn').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-os') === os));
      });
      var list = STEPS[os].map(function (t) { return '<li><span>' + t + '</span></li>'; }).join('');
      if (INAPP) {
        list = '<li><span>You opened this inside another app. Tap that app’s menu and choose ' +
               '<b>Open in ' + (os === 'ios' ? 'Safari' : 'Chrome') + '</b> first.</span></li>' + list;
      }
      stepsEl.innerHTML = list;
      /* Rebuilt on every switch so only the platform being viewed is fetched,
         and preload="none" keeps even that at zero bytes until play. These files
         are ~23MB each; preloading both would cost a rep 46MB for nothing. */
      videoEl.innerHTML = '<video controls playsinline preload="none" src="' + VIDEO[os].src + '"></video>';
      var hint = sheet.querySelector('[data-a2hs-size]');
      if (hint) hint.textContent = VIDEO[os].hint;
      if (watch) watch.open = false;
    }

    var lastA2hsFocus = null;
    function openSheet() {
      lastA2hsFocus = document.activeElement;
      paint(guess);
      sheet.hidden = false;
      document.body.style.overflow = 'hidden';
      var x = sheet.querySelector('.sk-sheet-x');
      if (x) x.focus();
    }
    function closeSheet() {
      // stop playback and drop the buffer, or audio keeps going behind the sheet
      var v = sheet.querySelector('video');
      if (v) { try { v.pause(); } catch (e) {} }
      videoEl.innerHTML = '';
      sheet.hidden = true;
      document.body.style.overflow = '';
      if (lastA2hsFocus && lastA2hsFocus.focus) lastA2hsFocus.focus();
    }

    sheet.addEventListener('click', function (e) {
      if (e.target.closest('[data-a2hs-close]')) { closeSheet(); return; }
      var seg = e.target.closest('.sk-seg-btn');
      if (seg) { guess = seg.getAttribute('data-os'); paint(guess); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sheet.hidden) closeSheet();
    });

    // Android's real install prompt, when the browser offers one
    var deferred = null;
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferred = e;
      label.textContent = 'Add this page to your home screen';
    });
    window.addEventListener('appinstalled', function () { openBtn.hidden = true; deferred = null; });

    openBtn.addEventListener('click', function () {
      if (deferred) {
        deferred.prompt();
        deferred.userChoice.then(function (r) {
          if (r && r.outcome === 'accepted') openBtn.hidden = true;
          /* dismissed: the browser will not re-offer, so fall back to the written
             steps rather than leaving a button that silently does nothing */
          else { deferred = null; label.textContent = 'How to add this to your home screen'; }
        });
        deferred = null;
        return;
      }
      openSheet();
    });

    label.textContent = 'How to add this to your home screen';
    openBtn.hidden = false;
  })();

  /* ---------- training video sheet ----------
     One sheet, any number of buttons. Everything a video needs travels on the
     button (id, title, natural pixel size), so the next one is markup only and
     no JS changes. */
  (function () {
    var sheet = root.querySelector('[data-video-sheet]');
    if (!sheet) return;
    var stage = sheet.querySelector('[data-video-stage]');
    var head  = sheet.querySelector('[data-video-heading]');
    var lastVideoFocus = null;

    function closeVideo() {
      /* dropping the iframe is what stops playback: pausing a cross origin
         player is not something this page is allowed to do, and a sheet that
         closes while audio keeps running is the a2hs bug all over again. */
      stage.innerHTML = '';
      stage.style.removeProperty('--sk-vid-ar');
      stage.style.removeProperty('max-width');
      sheet.hidden = true;
      document.body.style.overflow = '';
      if (lastVideoFocus && lastVideoFocus.focus) lastVideoFocus.focus();
    }

    root.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-video]') : null;
      if (!btn) return;
      var id = btn.getAttribute('data-video');
      if (!id) return;
      lastVideoFocus = btn;

      var w = parseFloat(btn.getAttribute('data-video-w')) || 16;
      var h = parseFloat(btn.getAttribute('data-video-h')) || 9;
      stage.style.setProperty('--sk-vid-ar', w + ' / ' + h);
      // capped by HEIGHT, so a portrait clip fits the sheet instead of scrolling it
      stage.style.maxWidth = 'calc(' + (w / h).toFixed(4) + ' * 62vh)';

      head.textContent = btn.getAttribute('data-video-title') || 'Watch';

      var f = document.createElement('iframe');
      f.src = 'https://player.vimeo.com/video/' + id + '?autoplay=1&title=0&byline=0&portrait=0&dnt=1';
      f.allow = 'autoplay; fullscreen; picture-in-picture';
      f.allowFullscreen = true;
      f.title = head.textContent;
      stage.appendChild(f);

      sheet.hidden = false;
      document.body.style.overflow = 'hidden';
      var x = sheet.querySelector('.sk-sheet-x');
      if (x) x.focus();
    });

    sheet.addEventListener('click', function (e) {
      if (e.target.closest('[data-video-close]')) closeVideo();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sheet.hidden) closeVideo();
    });
  })();

  /* ---------- scroll cue ----------
     Joe: the glance grid and the leads copy both end flush at the fold, so the
     screen reads as finished and everything under it gets ignored.

     The cue is MEASURED, never assumed. It appears only when the document
     really does continue past the viewport by more than a token amount, and it
     retires on the first scroll of that screen, because once a rep has scrolled
     they know the page moves and a permanent arrow is just furniture. Each
     route resets it, since every screen is a fresh question. */
  (function () {
    var cue = root.querySelector('[data-more]');
    if (!cue) return;
    var MIN = 140;          // less than this below the fold is not worth a prompt
    var MOVED = 24;         // a scroll this small still counts as "they know"
    var armed = false;

    function below() {
      var doc = document.documentElement;
      return Math.max(doc.scrollHeight, document.body.scrollHeight) -
             window.innerHeight - (window.scrollY || window.pageYOffset || 0);
    }
    function paint() {
      var show = armed &&
                 (window.scrollY || window.pageYOffset || 0) < MOVED &&
                 below() > MIN;
      cue.hidden = !show;
      cue.setAttribute('data-show', String(show));
    }
    function arm() {
      armed = true;
      paint();
      // the screen it just switched to may still be settling its images and fonts
      setTimeout(paint, 260);
    }

    window.addEventListener('scroll', function () {
      if ((window.scrollY || window.pageYOffset || 0) >= MOVED) armed = false;
      paint();
    }, { passive: true });
    window.addEventListener('resize', paint);
    window.addEventListener('hashchange', arm);
    // an accordion opening or closing changes the height under the fold
    if (window.ResizeObserver) new ResizeObserver(paint).observe(root);

    arm();
  })();


  }

  window.SharkLinksHub = { mount: mount };

  /* drain anything a block queued before this file landed, then make the queue
     mount on push so a later block needs no different code path */
  var queued = window.__sharkHubPending;
  window.__sharkHubPending = { push: mount };
  if (queued && queued.length) queued.forEach(mount);
})();
