/* beneve / beneve-clean-iced-coffee-recipes / beneve-clean-brew-guide
 *
 * GENERATED. The per-recipe print engine comes from the guide builder; the CTA resolver is the
 * same one every Beneve page uses. Vanilla only: a hosted block is injected with innerHTML, so a
 * <script src> inside the markup never executes.
 */
(function () {
  var root = document.querySelector(".sk-bnv-cofguide");
  if (!root || root.dataset.skBooted) return;
  root.dataset.skBooted = "1";

  // Purchase CTAs go to the funnel's redirect step, which is what fires Fire Lead. Authored
  // sibling-relative so they survive any funnel path; resolved here so a trailing slash cannot
  // shift them, and left alone when the page is not served from inside the funnel.
  (function () {
    var step = root.getAttribute("data-buy-step");
    var path = location.pathname.replace(/\/+$/, "");
    if (!step || !path || /\/preview\//.test(path)) return;
    var href = path.replace(/[^\/]*$/, "") + step;
    var btns = root.querySelectorAll('a[href="' + step + '"]');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute("href", href);
  })();

  // Smooth scroll for the jump nav. scroll-behavior lives on the page's html element, which a
  // hosted block must not touch, so it is done here instead.
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.addEventListener("click", function (ev) {
    var a = ev.target.closest("a[href^='#']");
    if (!a) return;
    var dest = root.querySelector(a.getAttribute("href"));
    if (!dest) return;
    ev.preventDefault();
    dest.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

(function(){
  function printSection(card){
    var clone=card.cloneNode(true);
    var rows=clone.querySelectorAll('.vg-print-row'); for(var i=0;i<rows.length;i++) rows[i].remove();
    var styleEl=document.getElementById('vg-guide-css'); var css=styleEl?styleEl.textContent:'';
    var extra='@page{margin:14mm}html,body{background:#fff!important}.wrap{max-width:none!important;margin:0!important;padding:0!important}.recipe{border:none!important;box-shadow:none!important;margin:0!important}.vg-print-head{font-family:Fraunces,serif;font-weight:900;color:#2a1d15;font-size:20px;margin:0 0 16px;padding-bottom:10px;border-bottom:2px solid #2a1d15}.vg-print-head span{color:#0fb5a6}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}';
    var doc='<!doctype html><html><head><meta charset="utf-8"><style>'+css+'</style><style>'+extra+'</style></head><body><div class="wrap"><div class="vg-print-head">Iced Coffee Guide<span>.</span></div>'+clone.outerHTML+'</div></body></html>';
    var f=document.createElement('iframe'); f.setAttribute('aria-hidden','true'); f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(f); var w=f.contentWindow,d=w.document; d.open(); d.write(doc); d.close();
    var cleaned=false; function cleanup(){ if(cleaned)return; cleaned=true; setTimeout(function(){f.remove();},500); }
    w.onafterprint=cleanup; setTimeout(function(){ try{w.focus();w.print();}catch(e){} setTimeout(cleanup,60000); },500);
  }
  var ICON='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>';
  function addBtn(el,label){ if(el.querySelector('.vg-print-btn'))return; var row=document.createElement('div'); row.className='vg-print-row'; var btn=document.createElement('button'); btn.type='button'; btn.className='vg-print-btn'; btn.innerHTML=ICON+'<span>'+label+'</span>'; btn.addEventListener('click',function(){printSection(el);}); row.appendChild(btn); el.appendChild(row); }
  var cards=document.querySelectorAll('.recipe'); for(var i=0;i<cards.length;i++) addBtn(cards[i],'Print this recipe');
})();

})();
