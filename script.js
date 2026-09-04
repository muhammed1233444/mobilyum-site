const menuBtn=document.querySelector('.menu-btn');
const mobileNav=document.querySelector('.mobile-nav');
const closeMobileMenu=()=>{if(!menuBtn||!mobileNav)return;mobileNav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.setAttribute('aria-label','Menüyü aç');menuBtn.textContent='☰';};
if(menuBtn&&mobileNav){menuBtn.addEventListener('click',()=>{const open=mobileNav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç');menuBtn.textContent=open?'×':'☰'});mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMobileMenu));document.addEventListener('click',e=>{if(mobileNav.classList.contains('open')&&!mobileNav.contains(e.target)&&!menuBtn.contains(e.target))closeMobileMenu()});}
const progress=document.querySelector('.progress');
let progressFrame=0;
const updateProgress=()=>{progressFrame=0;const h=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.transform=`scaleX(${h>0?Math.min(1,scrollY/h):0})`};
addEventListener('scroll',()=>{if(!progressFrame)progressFrame=requestAnimationFrame(updateProgress)},{passive:true});updateProgress();
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.03,rootMargin:'0px 0px 80px 0px'});
document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));

// Görselleri görünmeden yaklaşık iki ekran önce hazırlar; kullanıcı kaydırırken boş alan beklemez.
const loadImageSource=img=>{
  if(!img)return;
  const source=img.dataset.smartSrc||img.dataset.gallerySrc;
  if(!source)return;
  img.addEventListener('load',()=>img.classList.add('is-loaded'),{once:true});
  img.src=source;
  delete img.dataset.smartSrc;
  delete img.dataset.gallerySrc;
};
const smartImageObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){loadImageSource(entry.target);smartImageObserver.unobserve(entry.target)}}),{rootMargin:'1400px 0px',threshold:.01}):null;
const observeSmartImages=(root=document)=>root.querySelectorAll('img[data-smart-src]').forEach(img=>{if(smartImageObserver)smartImageObserver.observe(img);else loadImageSource(img)});


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
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData=navigator.connection?.saveData===true;
  const loadSlide=slideIndex=>{
    const slide=slides[(slideIndex+slides.length)%slides.length];
    const img=slide?.querySelector('img[data-src]');
    if(!img)return;
    img.addEventListener('load',()=>img.classList.add('is-loaded'),{once:true});
    img.src=img.dataset.src;
    delete img.dataset.src;
  };
  const prepareAround=slideIndex=>{
    loadSlide(slideIndex);
    loadSlide(slideIndex+1);
    if(!saveData)loadSlide(slideIndex-1);
  };
  const renderDots=()=>{
    dots.innerHTML=slides.map((_,i)=>`<button class="hero-slider-dot${i===0?' is-active':''}" type="button" aria-label="${i+1}. fotoğraf"></button>`).join('');
    dots.querySelectorAll('button').forEach((b,i)=>b.addEventListener('click',()=>{go(i);restart()}));
  };
  const go=(to)=>{
    index=(to+slides.length)%slides.length;
    prepareAround(index);
    track.style.transform=`translate3d(${-index*100}%,0,0)`;
    slides.forEach((s,i)=>s.classList.toggle('is-active',i===index));
    dots.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('is-active',i===index));
  };
  const restart=()=>{clearInterval(timer);if(!reducedMotion&&!document.hidden)timer=setInterval(()=>go(index+1),5500)};
  prev?.addEventListener('click',()=>{go(index-1);restart()});
  next?.addEventListener('click',()=>{go(index+1);restart()});
  slider.addEventListener('mouseenter',()=>clearInterval(timer));
  slider.addEventListener('mouseleave',restart);
  slider.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;deltaX=0;dragging=true;clearInterval(timer)},{passive:true});
  slider.addEventListener('touchmove',e=>{if(!dragging)return;deltaX=e.touches[0].clientX-startX},{passive:true});
  slider.addEventListener('touchend',()=>{if(!dragging)return;dragging=false;if(Math.abs(deltaX)>45)go(index+(deltaX<0?1:-1));restart()});
  slider.addEventListener('touchcancel',()=>{dragging=false;restart()});
  document.addEventListener('visibilitychange',()=>document.hidden?clearInterval(timer):restart());
  renderDots();
  prepareAround(0);
  if(!saveData){
    const warmSlider=()=>{loadSlide(2);loadSlide(3)};
    if('requestIdleCallback' in window)requestIdleCallback(warmSlider,{timeout:1800});else setTimeout(warmSlider,900);
  }
  restart();
})();

// Lightbox: delegated so products copied into category pages are also clickable.
const openLightbox=(img)=>{if(!img)return;const src=img.currentSrc||img.src||img.dataset.smartSrc||img.dataset.gallerySrc;if(!src)return;const layer=document.createElement('div');layer.className='lightbox';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','Ürün fotoğrafı');layer.innerHTML='<button type="button" aria-label="Fotoğrafı kapat">×</button><img src="'+src+'" alt="'+(img.alt||'')+'">';document.body.appendChild(layer);requestAnimationFrame(()=>layer.classList.add('show'));const close=()=>{layer.classList.remove('show');setTimeout(()=>layer.remove(),220)};layer.addEventListener('click',e=>{if(e.target===layer||e.target.tagName==='BUTTON')close()});};
document.addEventListener('click',e=>{const img=e.target.closest('.product-image img,.hero-image img,.campaign-image img,.store-showcase>img');if(img)openLightbox(img)});

// Wedding package modal
const modal=document.querySelector('.package-modal');
const closeModal=()=>{if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';};
document.querySelectorAll('.package-open').forEach(b=>b.addEventListener('click',()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';modal.querySelector('.modal-close')?.focus()}));
document.querySelector('.modal-close')?.addEventListener('click',closeModal);document.querySelector('.package-modal-backdrop')?.addEventListener('click',closeModal);

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMobileMenu();closeModal();closeCategory();}});

// Fareyi takip eden premium nokta: yalnızca gerçek masaüstü işaretçilerinde çalışır.
const dot=document.querySelector('.cursor-dot');
const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
if(dot&&finePointer.matches){
  let mouseX=0,mouseY=0,rafPending=false;
  const moveDot=()=>{rafPending=false;dot.style.transform=`translate3d(${mouseX}px,${mouseY}px,0) translate(-50%,-50%)`};
  window.addEventListener('pointermove',e=>{mouseX=e.clientX;mouseY=e.clientY;dot.classList.add('is-visible');if(!rafPending){rafPending=true;requestAnimationFrame(moveDot)}},{passive:true});
  document.addEventListener('pointerover',e=>{if(e.target.closest?.('a,button'))dot.classList.add('is-hovering')});
  document.addEventListener('pointerout',e=>{if(e.target.closest?.('a,button'))dot.classList.remove('is-hovering')});
  document.addEventListener('mouseleave',()=>dot.classList.remove('is-visible'));
}

// Dedicated category views — ürünler yalnızca admin panelinden gelir.
const categoryPage=document.getElementById('category-page');
const title=document.getElementById('category-page-title');
const desc=document.getElementById('category-page-desc');
const categoryProducts=document.getElementById('category-page-products');
const managedContainer=document.getElementById('managed-products');
let managedProducts=[];
let managedProductsReady=Promise.resolve([]);
const categoryData={
 yatak:{name:'Yatak Odaları',title:'Yatak <em>Odaları</em>',desc:'Yeni sezon yatak odası modellerimizi inceleyin.'},
 oturma:{name:'Oturma Grupları',title:'Oturma <em>Grupları</em>',desc:'Konforu ve modern çizgileri bir araya getiren modeller.'},
 yemek:{name:'Yemek Odaları',title:'Yemek <em>Odaları</em>',desc:'Masa, sandalye, konsol ve tamamlayıcı modeller.'},
 genc:{name:'Genç Odaları',title:'Genç <em>Odaları</em>',desc:'Genç odası modellerimizi inceleyin.'}
};
const categoryIds={'Yatak Odaları':'urunler-yatak','Oturma Grupları':'urunler-oturma','Yemek Odaları':'urunler-yemek','Genç Odaları':'urunler-genc'};
const escapeHtml=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const whatsapp='905446504459';

function galleryHtml(p){
  const imgs=(Array.isArray(p.images)&&p.images.length?p.images:[p.image]).filter(Boolean);
  const slides=imgs.map((src,i)=>`<img class="managed-gallery-img${i===0?' active':''}" ${i===0?'data-smart-src':'data-gallery-src'}="${escapeHtml(src)}" alt="${escapeHtml(p.name)}${i?` · ${i+1}. fotoğraf`:''}" data-index="${i}" decoding="async">`).join('');
  const controls=imgs.length>1?`
    <button class="managed-gallery-btn managed-gallery-prev" type="button" aria-label="Önceki fotoğraf">‹</button>
    <button class="managed-gallery-btn managed-gallery-next" type="button" aria-label="Sonraki fotoğraf">›</button>
    <div class="managed-gallery-dots">${imgs.map((_,i)=>`<button type="button" class="managed-gallery-dot${i===0?' active':''}" data-gallery-index="${i}" aria-label="Fotoğraf ${i+1}"></button>`).join('')}</div>`:'';
  return `<div class="product-image managed-gallery" data-gallery-count="${imgs.length}">${slides}${p.tag?`<span class="product-tag">${escapeHtml(p.tag)}</span>`:''}${controls}</div>`;
}
function productCardHtml(p){
  return `<article class="product-card managed-product">
    ${galleryHtml(p)}
    <div class="product-info"><p>${escapeHtml(p.type||'Mobilya')}</p><h4>${escapeHtml(p.name)}</h4>
    <span>${escapeHtml(p.price||'Fiyat için bilgi alın')}</span>
    ${p.description?`<small class="managed-desc">${escapeHtml(p.description)}</small>`:''}
    <a class="product-btn" href="https://wa.me/${whatsapp}?text=${encodeURIComponent('Merhaba Mobilyum, '+p.name+' hakkında bilgi almak istiyorum.')}" target="_blank" rel="noopener noreferrer">WhatsApp'tan bilgi al ↗</a></div>
  </article>`;
}
function renderManagedProducts(){
  if(!managedContainer)return;
  managedContainer.innerHTML='';
  const order=['Yatak Odaları','Oturma Grupları','Yemek Odaları','Genç Odaları'];
  const cats=[...order,...managedProducts.map(p=>p.category).filter(c=>c&&!order.includes(c))];
  [...new Set(cats)].forEach((category,i)=>{
    const list=managedProducts.filter(p=>p.category===category);
    if(!list.length)return;
    const group=document.createElement('div');
    group.className='product-group reveal';
    group.id=categoryIds[category]||('managed-'+i);
    group.innerHTML=`<div class="group-title"><span>${String(i+1).padStart(2,'0')}</span><h3>${escapeHtml(category)}</h3><em>${list.length} model</em></div><div class="product-grid"></div>`;
    group.querySelector('.product-grid').innerHTML=list.map(productCardHtml).join('');
    managedContainer.appendChild(group);
    observeSmartImages(group);
  });
}
function warmCategoryCovers(){
  if(navigator.connection?.saveData===true||/2g/.test(navigator.connection?.effectiveType||''))return;
  ['Yatak Odaları','Oturma Grupları','Yemek Odaları','Genç Odaları'].forEach(category=>{
    const product=managedProducts.find(item=>item.category===category);
    const src=(Array.isArray(product?.images)&&product.images[0])||product?.image;
    if(src){const img=new Image();img.decoding='async';img.src=src;}
  });
}
function renderCategory(k){
  const d=categoryData[k];
  if(!d)return;
  title.innerHTML=d.title;
  desc.textContent=d.desc;
  const list=managedProducts.filter(p=>p.category===d.name);
  categoryProducts.innerHTML=list.length?list.map(productCardHtml).join(''):'<div class="empty-products"><div><span>ŞU ANDA ÜRÜN YOK</span><h4>Yakında burada.</h4><p>Bu kategorideki ürünler mağaza yönetim panelinden eklenecek.</p></div></div>';
  observeSmartImages(categoryProducts);
}
async function openCategory(k, push=true){
  const d=categoryData[k]; if(!d)return;
  await managedProductsReady;
  renderCategory(k);
  categoryPage.classList.add('open');categoryPage.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  if(push)history.pushState({category:k},'', '#kategori/'+k);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{categoryPage.classList.add('page-ready');categoryPage.querySelector('.category-page-close')?.focus()}));
}
function closeCategory(){if(!categoryPage)return;categoryPage.classList.remove('open','page-ready');categoryPage.setAttribute('aria-hidden','true');document.body.style.overflow='';if(location.hash.startsWith('#kategori/'))history.pushState({},'',location.pathname+location.search);}
document.querySelectorAll('[data-category]').forEach(x=>x.addEventListener('click',e=>{
  if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();
  openCategory(x.dataset.category);
}));
document.querySelector('.category-page-close')?.addEventListener('click',closeCategory);
window.addEventListener('popstate',()=>{if(location.hash.startsWith('#kategori/'))openCategory(location.hash.split('/')[1],false);else{closeCategory();closeModal();}});

/* Admin panelindeki ürünleri tek kaynak olarak kullanır. */
managedProductsReady=(async()=>{
  try{
    const res=await fetch('/api/products',{cache:'no-store'});
    if(!res.ok) throw new Error(`Ürünler alınamadı (${res.status})`);
    const data=await res.json();
    managedProducts=Array.isArray(data)?data:[];
    renderManagedProducts();
    if('requestIdleCallback' in window)requestIdleCallback(warmCategoryCovers,{timeout:2200});else setTimeout(warmCategoryCovers,1200);
    if(location.hash.startsWith('#kategori/')) openCategory(location.hash.split('/')[1],false);
  }catch(e){console.warn('Yönetim ürünleri yüklenemedi.',e);managedProducts=[];renderManagedProducts();}
  return managedProducts;
})();

/* Yönetim ürün galerileri: ok, nokta ve mobil kaydırma. */
(function initManagedGalleries(){
  const setIndex=(gallery,index)=>{
    const imgs=[...gallery.querySelectorAll('.managed-gallery-img')];
    if(!imgs.length)return;
    index=(index+imgs.length)%imgs.length;
    loadImageSource(imgs[index]);
    if(navigator.connection?.saveData!==true)loadImageSource(imgs[(index+1)%imgs.length]);
    imgs.forEach((img,i)=>img.classList.toggle('active',i===index));
    gallery.querySelectorAll('.managed-gallery-dot').forEach((dot,i)=>dot.classList.toggle('active',i===index));
    gallery.dataset.galleryIndex=index;
  };
  document.addEventListener('click',e=>{
    const next=e.target.closest('.managed-gallery-next');
    const prev=e.target.closest('.managed-gallery-prev');
    const dot=e.target.closest('.managed-gallery-dot');
    if(!next&&!prev&&!dot)return;
    e.preventDefault();
    e.stopPropagation();
    const gallery=e.target.closest('.managed-gallery');
    if(!gallery)return;
    const current=Number(gallery.dataset.galleryIndex||0);
    if(next)setIndex(gallery,current+1);
    else if(prev)setIndex(gallery,current-1);
    else setIndex(gallery,Number(dot.dataset.galleryIndex||0));
  });
  document.addEventListener('touchstart',e=>{
    const gallery=e.target.closest('.managed-gallery');
    if(gallery) gallery._touchX=e.touches[0].clientX;
  },{passive:true});
  document.addEventListener('touchend',e=>{
    const gallery=e.target.closest('.managed-gallery');
    if(!gallery||gallery._touchX==null)return;
    const dx=e.changedTouches[0].clientX-gallery._touchX;
    gallery._touchX=null;
    if(Math.abs(dx)<40)return;
    const current=Number(gallery.dataset.galleryIndex||0);
    setIndex(gallery,dx<0?current+1:current-1);
  },{passive:true});
})();;
