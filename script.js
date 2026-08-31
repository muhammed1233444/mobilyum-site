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

// Dedicated category views
const categoryPage=document.getElementById('category-page');
const title=document.getElementById('category-page-title');
const desc=document.getElementById('category-page-desc');
const products=document.getElementById('category-page-products');
const categoryData={
 yatak:['urunler-yatak','Yatak <em>Odaları</em>','Yeni sezon yatak odası modellerimizi inceleyin.'],
 oturma:['urunler-oturma','Oturma <em>Grupları</em>','Konforu ve modern çizgileri bir araya getiren modeller.'],
 yemek:['urunler-yemek','Yemek <em>Odaları</em>','Masa, sandalye, konsol ve tamamlayıcı modeller.']
};
function openCategory(k){
 const d=categoryData[k]; if(!d)return;
 const g=document.querySelector('#'+d[0]+' .product-grid');
 title.innerHTML=d[1];desc.textContent=d[2];
 products.innerHTML=g?g.innerHTML:'<p>Ürünler hazırlanıyor.</p>';
 categoryPage.classList.add('open');categoryPage.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
 history.pushState({category:k},'', '#kategori/'+k);
 requestAnimationFrame(()=>requestAnimationFrame(()=>categoryPage.classList.add('page-ready')));
}
function closeCategory(){if(!categoryPage)return;categoryPage.classList.remove('open','page-ready');categoryPage.setAttribute('aria-hidden','true');document.body.style.overflow='';if(location.hash.startsWith('#kategori/'))history.pushState({},'',location.pathname+location.search);}
document.querySelectorAll('[data-category]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();openCategory(x.dataset.category)}));
document.querySelector('.category-page-close')?.addEventListener('click',closeCategory);
window.addEventListener('popstate',()=>{if(location.hash.startsWith('#kategori/'))openCategory(location.hash.split('/')[1]);else{closeCategory();closeModal();}});

/* Mobilyum yönetim panelinden eklenen ürünleri ana siteye getirir. */
(async function loadManagedProducts(){
  try{
    const res = await fetch('/api/products');
    if(!res.ok) return;
    const managed = await res.json();
    if(!Array.isArray(managed) || !managed.length) return;

    const groups = {
      "Yatak Odaları":"urunler-yatak",
      "Oturma Grupları":"urunler-oturma",
      "Yemek Odaları":"urunler-yemek",
      "Genç Odaları":"urunler-genc"
    };
    const whatsapp="905446504459";
    const escape=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
    const productImages=p=>Array.isArray(p.images)&&p.images.length?p.images:(p.image?[p.image]:[]);
    const card=p=>{
      const imgs=productImages(p);
      const slider=imgs.length>1 ? `<div class="managed-product-slider" data-managed-slider>
        <div class="managed-product-track">${imgs.map((src,i)=>`<div class="managed-product-slide${i===0?' is-active':''}"><img src="${escape(src)}" alt="${escape(p.name)} - ${i+1}"></div>`).join('')}</div>
        <button type="button" class="managed-product-prev" aria-label="Önceki fotoğraf">‹</button>
        <button type="button" class="managed-product-next" aria-label="Sonraki fotoğraf">›</button>
        <div class="managed-product-dots">${imgs.map((_,i)=>`<button type="button" class="managed-product-dot${i===0?' is-active':''}" aria-label="${i+1}. fotoğraf"></button>`).join('')}</div>
      </div>` : `<div class="product-image"><img src="${escape(imgs[0]||'')}" alt="${escape(p.name)}"></div>`;
      return `<article class="product-card managed-product">${slider}<div class="product-info"><p>${escape(p.type||"Mobilya")}</p><h4>${escape(p.name)}</h4><span>${escape(p.price||"Fiyat için bilgi alın")}</span>${p.description?`<small class="managed-desc">${escape(p.description)}</small>`:""}<a class="product-btn" href="https://wa.me/${whatsapp}?text=${encodeURIComponent("Merhaba Mobilyum, "+p.name+" hakkında bilgi almak istiyorum.")}" target="_blank">WhatsApp'tan bilgi al ↗</a></div></article>`;
    };

    managed.forEach(p=>{
      let groupId=groups[p.category];
      let group=groupId && document.getElementById(groupId);
      if(!group){
        const container=document.querySelector('.products');
        if(!container)return;
        group=document.createElement('div');
        group.className='product-group reveal';
        group.id='managed-'+p.id;
        group.innerHTML=`<div class="group-title"><span>+</span><h3>${escape(p.category)}</h3><em>Yönetim paneli</em></div><div class="product-grid"></div>`;
        container.appendChild(group);
      }
      group.querySelector('.product-grid').insertAdjacentHTML('beforeend',card(p));
    });

    document.querySelectorAll('[data-managed-slider]').forEach(slider=>{
      const track=slider.querySelector('.managed-product-track');
      const slides=[...slider.querySelectorAll('.managed-product-slide')];
      const dots=[...slider.querySelectorAll('.managed-product-dot')];
      if(slides.length<2)return;
      let index=0,startX=0;
      const go=i=>{index=(i+slides.length)%slides.length;track.style.transform=`translate3d(${-index*100}%,0,0)`;slides.forEach((x,n)=>x.classList.toggle('is-active',n===index));dots.forEach((x,n)=>x.classList.toggle('is-active',n===index));};
      slider.querySelector('.managed-product-prev')?.addEventListener('click',()=>go(index-1));
      slider.querySelector('.managed-product-next')?.addEventListener('click',()=>go(index+1));
      dots.forEach((d,n)=>d.addEventListener('click',()=>go(n)));
      slider.addEventListener('touchstart',e=>startX=e.touches[0].clientX,{passive:true});
      slider.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>40)go(index+(dx<0?1:-1));},{passive:true});
    });

    // If a category modal is already open, rebuild it after API products arrive.
    if(categoryPage && categoryPage.classList.contains('open')){
      const hash=location.hash.match(/^#kategori\/(.+)$/);
      if(hash){
        const d=categoryData[hash[1]];
        const g=d && document.querySelector('#'+d[0]+' .product-grid');
        if(g) products.innerHTML=g.innerHTML;
      }
    }
  }catch(e){ console.warn("Yönetim ürünleri yüklenemedi.",e); }
})();
