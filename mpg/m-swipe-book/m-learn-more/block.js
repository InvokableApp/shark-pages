/* mpg/m-swipe-book/m-learn-more: Joe's deck script (see block.html), with the platform's additions marked: the rep's
 * name, [data-needs], and each last choice's own next steps in the pop-up. watch.js reports the taps to the rep. */
(function(){
  const root=document.querySelector('.lm'); if(!root) return;
  const deck=document.getElementById('deck');
  const slides=[...deck.querySelectorAll('.slide')];
  const rail=document.getElementById('rail');
  const tabs=[...document.querySelectorAll('.tab')];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur=0;

  // The rep (the platform's #pfn-data): "Sent to you by Sarah", and the pop-ups name them.
  let D={}; try{ D=JSON.parse((document.getElementById('pfn-data')||{}).textContent||'{}') }catch(e){}
  const first=(D.rep&&D.rep.first)||'';
  if(first){
    root.querySelectorAll('[data-lm-rep]').forEach(s=>{s.textContent=first});
    const f=root.querySelector('[data-lm-from]'); if(f) f.hidden=false;
  }
  const who=first||'the person who shared this with you';

  // [data-needs]: a button whose value came through empty (no shop link, no texting number) goes to data-alt-href when
  // it has one (their Messenger), or leaves the pop-up. Same rule as the reel kit's.
  root.querySelectorAll('[data-needs]').forEach(el=>{
    const v=String(el.getAttribute('data-needs')||'').trim();
    if(v && !/\{\{|^https?:\/\/$/.test(v)) return;
    if(el.hasAttribute('data-alt-href')){ el.setAttribute('href',el.getAttribute('data-alt-href')); return; }
    el.remove();
  });

  slides.forEach((s,i)=>{
    const d=document.createElement('button');
    d.className='dot';d.type='button';d.id='dot-'+i;
    if(i>0 && s.dataset.sec!==slides[i-1].dataset.sec) d.classList.add('gap');
    d.setAttribute('aria-label','Go to '+s.getAttribute('aria-label'));
    d.addEventListener('click',()=>goIdx(i));
    rail.appendChild(d);
  });
  const dots=[...rail.querySelectorAll('.dot')];

  function goIdx(i){ i=Math.max(0,Math.min(slides.length-1,i)); slides[i].scrollIntoView({behavior:reduce?'auto':'smooth'}); }
  function goId(id){ const i=slides.findIndex(s=>s.id===id); if(i>=0) goIdx(i); }

  function setActive(i){
    cur=i;
    slides.forEach((s,k)=>s.classList.toggle('active',k===i));
    dots.forEach((d,k)=>d.classList.toggle('on',k===i));
    const sec=slides[i].dataset.sec;
    tabs.forEach(t=>t.setAttribute('aria-current', t.dataset.sec===sec?'true':'false'));
    const id=slides[i].id;
    if(location.hash!=='#'+id){ try{history.replaceState(null,'','#'+id)}catch(e){} }
  }

  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting && e.intersectionRatio>.55) setActive(slides.indexOf(e.target)); });
  },{root:deck,threshold:[.55]});
  slides.forEach(s=>io.observe(s));

  document.querySelectorAll('[data-to]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();goId(b.dataset.to)}));
  addEventListener('keydown',e=>{
    if(e.target.closest('button,a') && e.key===' ') return;
    if(['ArrowDown','PageDown'].includes(e.key)){e.preventDefault();goIdx(cur+1)}
    if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();goIdx(cur-1)}
  });

  // Welcome particles
  const w=document.getElementById('welcome');
  for(let k=0;k<7;k++){
    const p=document.createElement('span');
    p.className='plus';p.textContent=k%2?'♥':'+1';
    p.style.left=(55+Math.random()*38)+'%';p.style.top=(25+Math.random()*55)+'%';
    p.style.animationDelay=(k*0.7)+'s';
    w.appendChild(p);
  }

  // Mission chips
  const chips=[...document.querySelectorAll('.chip')], tally=document.getElementById('tally');
  chips.forEach(c=>c.addEventListener('click',()=>{
    c.setAttribute('aria-pressed', c.getAttribute('aria-pressed')==='true'?'false':'true');
    const n=chips.filter(x=>x.getAttribute('aria-pressed')==='true').length;
    tally.textContent = n ? (n===chips.length ? "All five. That's the whole idea." : n+' picked. Each one starts with one more person.') : '';
  }));

  // Opportunity loop
  const steps=[...document.querySelectorAll('.stepc')];
  steps.forEach((s,i)=>s.addEventListener('click',()=>steps.forEach((x,k)=>x.classList.toggle('on',k===i))));

  // Impact choices -> bottom sheet
  // Joe's words; "the person who shared this with you" becomes the rep's name when we know it.
  const MSG={
    customer:['Great choice','Ready to try the products?','To get started with pHix and VeraCell, reach back out to '+who+'. They\'ll help you get your first order set up.'],
    build:['Love that','Let\'s build this together.','To get started building the business and sharing the mission, reach back out to '+who+'. They\'ll walk you through your first steps.'],
    questions:['Good questions are welcome','Let\'s get you some answers.','Reach back out to '+who+'. They\'re happy to answer anything and help you decide.'],
    no:['No problem','Thanks for taking a look.','If anything changes, or someone you know comes to mind, reach back out to '+who+'.']
  };
  const sheet=document.getElementById('sheet'), sbg=document.getElementById('sheet-bg');
  let lastBtn=null;
  function openSheet(k,btn){
    const m=MSG[k]; lastBtn=btn;
    document.getElementById('sheet-tag').textContent=m[0];
    document.getElementById('sheet-title').textContent=m[1];
    document.getElementById('sheet-body').textContent=m[2];
    // only this choice's next steps; "Got it" leads when there's nothing else to do
    sheet.querySelectorAll('[data-for]').forEach(b=>{ b.hidden=b.getAttribute('data-for')!==k });
    const close=document.getElementById('sheet-close');
    close.className='btn '+(sheet.querySelector('.sheet-btns [data-for]:not([hidden])')?'ghost':'primary');
    sheet.hidden=false; sbg.hidden=false;
    requestAnimationFrame(()=>{sheet.classList.add('open');sbg.classList.add('open')});
    (sheet.querySelector('.sheet-btns [data-for]:not([hidden])')||document.getElementById('sheet-close')).focus();
  }
  function closeSheet(){
    sheet.classList.remove('open'); sbg.classList.remove('open');
    setTimeout(()=>{sheet.hidden=true;sbg.hidden=true},reduce?0:280);
    if(lastBtn) lastBtn.focus();
  }
  document.querySelectorAll('[data-pick]').forEach(b=>b.addEventListener('click',()=>openSheet(b.dataset.pick,b)));
  document.getElementById('sheet-close').addEventListener('click',closeSheet);
  sbg.addEventListener('click',closeSheet);
  addEventListener('keydown',e=>{ if(e.key==='Escape' && !sheet.hidden) closeSheet(); });

  // Tools to-do demo
  const todos=[...document.querySelectorAll('#todo button')], bar=document.getElementById('todo-bar'), cnt=document.getElementById('todo-count');
  todos.forEach(t=>t.addEventListener('click',()=>{
    t.setAttribute('aria-pressed', t.getAttribute('aria-pressed')==='true'?'false':'true');
    const n=todos.filter(x=>x.getAttribute('aria-pressed')==='true').length;
    bar.style.width=(n/5*100)+'%'; cnt.textContent=n+' of 5';
    bar.parentElement.classList.toggle('gold', n===5);
  }));

  function fromHash(){
    const id=location.hash.slice(1);
    const i=slides.findIndex(s=>s.id===id);
    if(i>0){ slides[i].scrollIntoView({behavior:'auto'}); setActive(i); }
  }
  addEventListener('hashchange',fromHash);
  setActive(0);
  fromHash();
})();
