(function(){
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function meter(form){
  var bar=form.parentNode.querySelector('.meter-fill'),txt=form.parentNode.querySelector('.meter-text');if(!bar)return;
  var req=[].slice.call(form.querySelectorAll('[required]'));
  var msgs=['Empty glass','Getting pulpy','Half squeezed','Almost juiced','Fully squeezed. Hit the button!'];
  function up(){var n=req.filter(function(el){return el.value.trim()!==''}).length;var p=Math.round(n/req.length*100);
    bar.style.width=Math.max(p,4)+'%';txt.textContent=msgs[Math.min(n,msgs.length-1)];form.parentNode.classList.toggle('juiced',p===100);}
  form.addEventListener('input',up);form.addEventListener('change',up);up();
}
function countUp(el){var end=parseInt(el.textContent,10);if(reduce||!end)return;el.textContent='0';
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.disconnect();var t0=null;
    function step(t){if(!t0)t0=t;var k=Math.min((t-t0)/1100,1);el.textContent=Math.round(end*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step);}requestAnimationFrame(step);});},{threshold:.4});io.observe(el);}
function confetti(){if(reduce)return;var c=document.createElement('div');c.className='confetti';c.setAttribute('aria-hidden','true');
  for(var i=0;i<34;i++){var s=document.createElement('span');var sz=10+Math.random()*16;s.style.left=Math.random()*100+'%';s.style.width=s.style.height=sz+'px';
    s.style.animationDelay=(Math.random()*.6)+'s';s.style.animationDuration=(1.8+Math.random()*1.4)+'s';s.style.setProperty('--r',(Math.random()*720-360)+'deg');if(i%3===0)s.className='drop';c.appendChild(s);}
  document.body.appendChild(c);setTimeout(function(){c.remove()},4200);}
window.JJinit=function(root){
  root.querySelectorAll('input[name=page]').forEach(function(i){i.value=location.pathname+location.hash;});
  root.querySelectorAll('.qcard form').forEach(meter);
  root.querySelectorAll('.bignum').forEach(countUp);
  if(root.querySelector('.juice-glass'))setTimeout(confetti,500);
};
document.addEventListener('DOMContentLoaded',function(){
  var b=document.querySelector('.burger'),n=document.getElementById('nav');
  if(b&&n&&!b.dataset.bound){b.dataset.bound=1;b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o);b.textContent=o?'Close':'Menu';});}
  window.JJinit(document);
});
})();
/* GA4 events: phone taps and form submissions */
(function(){
  function ev(n,p){if(typeof window.gtag==='function')window.gtag('event',n,p||{});}
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="tel:"]');if(a)ev('phone_call_click',{link_text:(a.textContent||'').trim(),page_path:location.pathname});});
  document.addEventListener('submit',function(e){var f=e.target;if(f&&f.getAttribute('name'))ev('generate_lead',{form_name:f.getAttribute('name'),page_path:location.pathname});},true);
})();
