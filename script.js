const menuBtn=document.querySelector('.menu-btn');
const mobileNav=document.querySelector('.mobile-nav');
if(menuBtn&&mobileNav){menuBtn.addEventListener('click',()=>{const open=mobileNav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.textContent=open?'×':'☰'});mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileNav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.textContent='☰'}));}
const progress=document.querySelector('.progress');
const updateProgress=()=>{const h=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.width=(h>0?(scrollY/h)*100:0)+'%'};
addEventListener('scroll',updateProgress,{passive:true});updateProgress();
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));


// Ana sayfa hero fotoğraf sliderı: masaüstünde oklarla, telefonda parmak hareketiyle çalışır.
(function initHeroSlider(){
  const slider=document.querySelector('.hero-slider');
  if(!slider) return;
  const track=slider.querySelector('.hero-slider-track');
  const slides=[...slider.querySelectorAll('.hero-slide')];
  const dots=slider.querySelector('.hero-slider-dots');
  const prev=slider.querySelector('.hero-slider-prev');
  const next=slider.querySelector('.hero-slider-next');
  if(!track||slides.length<2) return;
  let index=0;
  let timer=null;
  let startX=0;
  let deltaX=0;
  let dragging=false;
  const renderDots=()=>{
    dots.innerHTML=slides.map((_,i)=>`<button class="hero-slider-dot${i===0?' is-active':''}" type="button" aria-label="${i+1}. fotoğraf"></button>`).join('');
    dots.querySelectorAll('button').forEach((b,i)=>b.addEventListener('click',()=>{go(i);restart()}));
  };
  const go=(to)=>{
    index=(to+slides.length)%slides.length;
    track.style.transform=`translate3d(${-index*100}%,0,0)`;
    slides.forEach((s,i)=>s.classList.toggle('is-active',i===index));
    dots.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('is-active',i===index));
  };
  const restart=()=>{clearInterval(timer);timer=setInterval(()=>go(index+1),5500)};
  prev?.addEventListener('click',()=>{go(index-1);restart()});
  next?.addEventListener('click',()=>{go(index+1);restart()});
  slider.addEventListener('mouseenter',()=>clearInterval(timer));
  slider.addEventListener('mouseleave',restart);
  slider.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;deltaX=0;dragging=true;clearInterval(timer)},{passive:true});
  slider.addEventListener('touchmove',e=>{if(!dragging)return;deltaX=e.touches[0].clientX-startX},{passive:true});
  slider.addEventListener('touchend',()=>{if(!dragging)return;dragging=false;if(Math.abs(deltaX)>45)go(index+(deltaX<0?1:-1));restart()});
  slider.addEventListener('touchcancel',()=>{dragging=false;restart()});
  renderDots();
  restart();
})();

// Lightbox: delegated so products copied into category pages are also clickable.
const openLightbox=(img)=>{if(!img)return;const layer=document.createElement('div');layer.className='lightbox';layer.innerHTML='<button aria-label="Kapat">×</button><img src="'+img.currentSrc+'" alt="'+(img.alt||'')+'">';document.body.appendChild(layer);requestAnimationFrame(()=>layer.classList.add('show'));const close=()=>{layer.classList.remove('show');setTimeout(()=>layer.remove(),220)};layer.addEventListener('click',e=>{if(e.target===layer||e.target.tagName==='BUTTON')close()});};
document.addEventListener('click',e=>{const img=e.target.closest('.product-image img,.hero-image img,.campaign-image img,.store-showcase>img');if(img)openLightbox(img)});
const style=document.createElement('style');style.textContent='.lightbox{position:fixed;inset:0;background:rgba(25,21,17,.88);backdrop-filter:blur(10px);z-index:400;display:flex;align-items:center;justify-content:center;padding:5vw;opacity:0;transition:.22s}.lightbox.show{opacity:1}.lightbox img{max-width:92vw;max-height:88vh;width:auto;height:auto;object-fit:contain;box-shadow:0 25px 80px rgba(0,0,0,.35)}.lightbox button{position:absolute;right:25px;top:18px;background:none;border:0;color:white;font-size:36px;cursor:pointer}';document.head.appendChild(style);

// Wedding package modal
const modal=document.querySelector('.package-modal');
const closeModal=()=>{if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';};
document.querySelectorAll('.package-open').forEach(b=>b.addEventListener('click',()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}));
document.querySelector('.modal-close')?.addEventListener('click',closeModal);document.querySelector('.package-modal-backdrop')?.addEventListener('click',closeModal);

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeCategory();}});

// Mouse-following point
const dot=document.querySelector('.cursor-dot');
window.addEventListener('mousemove',e=>{if(dot){dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px'}document.documentElement.style.setProperty('--mx',e.clientX+'px');document.documentElement.style.setProperty('--my',e.clientY+'px')});
document.addEventListener('mouseenter',e=>{const el=e.target.closest?.('a,button');if(el&&dot){dot.style.width='15px';dot.style.height='15px'}},{capture:true});
document.addEventListener('mouseleave',e=>{const el=e.target.closest?.('a,button');if(el&&dot){dot.style.width='9px';dot.style.height='9px'}},{capture:true});

// Yönetim panelindeki ürünler: ana sitede tek kaynak API'dir.
const categoryPage=document.getElementById('category-page');
const title=document.getElementById('category-page-title');
const desc=document.getElementById('category-page-desc');
const products=document.getElementById('category-page-products');
let managedProducts=[];
const categoryInfo={
  yatak:['Yatak <em>Odaları</em>','Yeni sezon yatak odası modellerimizi inceleyin.','Yatak Odaları'],
  oturma:['Oturma <em>Grupları</em>','Konforu ve modern çizgileri bir araya getiren modeller.','Oturma Grupları'],
  yemek:['Yemek <em>Odaları</em>','Masa, sandalye, konsol ve tamamlayıcı modeller.','Yemek Odaları'],
  genc:['Genç <em>Odaları</em>','Genç odası modellerimizi inceleyin.','Genç Odaları'],
  diger:['Diğer <em>Ürünler</em>','Mobilyum ürünlerini inceleyin.','Diğer']
};
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const getImages=p=>Array.isArray(p.images)&&p.images.length?p.images:(p.image?[p.image]:[]);
const productCard=p=>{
  const imgs=getImages(p);
  const slides=imgs.map((src,i)=>`<div class="managed-slide${i===0?' is-active':''}"><img src="${escapeHtml(src)}" alt="${escapeHtml(p.name)} - ${i+1}. fotoğraf"></div>`).join('');
  const controls=imgs.length>1?`<button class="managed-prev" type="button" aria-label="Önceki fotoğraf">‹</button><button class="managed-next" type="button" aria-label="Sonraki fotoğraf">›</button><div class="managed-dots">${imgs.map((_,i)=>`<button type="button" class="managed-dot${i===0?' is-active':''}" aria-label="${i+1}. fotoğraf"></button>`).join('')}</div>`:'';
  return `<article class="product-card managed-product" data-product-id="${escapeHtml(p.id)}">
    <div class="product-image managed-gallery" data-index="0"><div class="managed-track">${slides}</div>${controls}${p.tag?`<span class="product-tag">${escapeHtml(p.tag)}</span>`:''}</div>
    <div class="product-info"><p>${escapeHtml(p.type||'Mobilya')}</p><h4>${escapeHtml(p.name)}</h4><span>${escapeHtml(p.price||'Fiyat için bilgi alın')}</span>${p.description?`<small class="managed-desc">${escapeHtml(p.description)}</small>`:''}<a class="product-btn" href="https://wa.me/905446504459?text=${encodeURIComponent('Merhaba Mobilyum, '+p.name+' hakkında bilgi almak istiyorum.') }" target="_blank" rel="noopener">WhatsApp'tan bilgi al ↗</a></div>
  </article>`;
};
function bindGalleries(scope=document){
  scope.querySelectorAll('.managed-gallery').forEach(g=>{
    if(g.dataset.bound==='1')return; g.dataset.bound='1';
    const slides=[...g.querySelectorAll('.managed-slide')]; const track=g.querySelector('.managed-track'); const dots=[...g.querySelectorAll('.managed-dot')];
    if(slides.length<2)return;
    let i=0,startX=0,delta=0;
    const go=n=>{i=(n+slides.length)%slides.length;track.style.transform=`translate3d(${-i*100}%,0,0)`;slides.forEach((s,j)=>s.classList.toggle('is-active',j===i));dots.forEach((d,j)=>d.classList.toggle('is-active',j===i));};
    g.querySelector('.managed-prev')?.addEventListener('click',e=>{e.stopPropagation();go(i-1)});
    g.querySelector('.managed-next')?.addEventListener('click',e=>{e.stopPropagation();go(i+1)});
    dots.forEach((d,j)=>d.addEventListener('click',e=>{e.stopPropagation();go(j)}));
    g.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;delta=0},{passive:true});
    g.addEventListener('touchmove',e=>{delta=e.touches[0].clientX-startX},{passive:true});
    g.addEventListener('touchend',()=>{if(Math.abs(delta)>45)go(i+(delta<0?1:-1))});
  });
}
function renderHomeProducts(){
  const box=document.getElementById('managed-products-home'); if(!box)return;
  if(!managedProducts.length){box.innerHTML='<div class="managed-empty">Henüz yönetim panelinden ürün eklenmedi.</div>';return;}
  const groups=[['Yatak Odaları','01'],['Oturma Grupları','02'],['Yemek Odaları','03'],['Genç Odaları','04'],['Diğer','05']];
  box.innerHTML=groups.map(([cat,no])=>{const list=managedProducts.filter(p=>p.category===cat);if(!list.length)return '';return `<div class="product-group reveal"><div class="group-title"><span>${no}</span><h3>${escapeHtml(cat)}</h3><em>${list.length} model</em></div><div class="product-grid">${list.map(productCard).join('')}</div></div>`}).join('');
  bindGalleries(box);
}
function openCategory(k){
  const d=categoryInfo[k]; if(!d)return;
  const list=managedProducts.filter(p=>p.category===d[2]);
  title.innerHTML=d[0];desc.textContent=d[1];
  products.innerHTML=list.length?`<div class="product-grid">${list.map(productCard).join('')}</div>`:'<p class="managed-empty">Bu kategoride henüz ürün eklenmedi.</p>';
  bindGalleries(products);
  categoryPage.classList.add('open');categoryPage.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  history.pushState({category:k},'', '#kategori/'+k);
  requestAnimationFrame(()=>requestAnimationFrame(()=>categoryPage.classList.add('page-ready')));
}
function closeCategory(){if(!categoryPage)return;categoryPage.classList.remove('open','page-ready');categoryPage.setAttribute('aria-hidden','true');document.body.style.overflow='';if(location.hash.startsWith('#kategori/'))history.pushState({},'',location.pathname+location.search);}
document.querySelectorAll('[data-category]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();openCategory(x.dataset.category)}));
document.querySelector('.category-page-close')?.addEventListener('click',closeCategory);
window.addEventListener('popstate',()=>{if(location.hash.startsWith('#kategori/'))openCategory(location.hash.split('/')[1]);else{closeCategory();closeModal();}});
(async function loadManagedProducts(){
  try{const res=await fetch('/api/products');if(!res.ok)throw new Error('API');managedProducts=await res.json();if(!Array.isArray(managedProducts))managedProducts=[];renderHomeProducts();if(location.hash.startsWith('#kategori/'))openCategory(location.hash.split('/')[1]);}
  catch(e){console.warn('Yönetim ürünleri yüklenemedi.',e);const box=document.getElementById('managed-products-home');if(box)box.innerHTML='<div class="managed-empty">Ürünler şu anda yüklenemiyor.</div>';}
})();


// Stiller: yönetim ürün galerileri ve mobil kaydırma.
const managedStyle=document.createElement('style');
managedStyle.textContent=`
.managed-gallery{position:relative;overflow:hidden;touch-action:pan-y;cursor:pointer}
.managed-track{display:flex;width:100%;height:100%;transition:transform .3s ease}
.managed-slide{min-width:100%;height:100%}
.managed-slide img{display:block;width:100%;height:100%;object-fit:cover}
.managed-prev,.managed-next{position:absolute;top:50%;transform:translateY(-50%);width:36px;height:36px;padding:0;border-radius:50%;background:rgba(20,18,15,.68);color:#fff;font-size:27px;line-height:32px;z-index:3}
.managed-prev{left:10px}.managed-next{right:10px}
.managed-dots{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:6px;z-index:3}
.managed-dot{width:7px;height:7px;padding:0;border-radius:50%;background:rgba(255,255,255,.6);border:1px solid rgba(30,25,20,.2)}
.managed-dot.is-active{background:#fff;transform:scale(1.25)}
.managed-desc{display:block;margin-top:8px;opacity:.75}
.managed-empty,.managed-loading{padding:30px 10px;text-align:center;opacity:.7}
@media(max-width:700px){.managed-prev,.managed-next{width:32px;height:32px;font-size:24px}.managed-dots{bottom:8px}}
`;document.head.appendChild(managedStyle);
