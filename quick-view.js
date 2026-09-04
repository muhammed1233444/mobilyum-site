(() => {
  const cardsSelector='[data-quick-view="1"]';
  const whatsapp='905446504459';
  let dialog=null;
  let activeCard=null;
  let returnFocus=null;
  let images=[];
  let imageIndex=0;
  let touchStartX=null;
  let closeTimer=null;

  const ensureDialog=()=>{
    if(dialog)return dialog;
    const shell=document.createElement('dialog');
    shell.className='quick-view-dialog';
    shell.id='quick-view';
    shell.setAttribute('aria-labelledby','quick-view-title');
    shell.innerHTML=`
      <div class="quick-view-box" role="document">
        <button class="quick-view-close" type="button" aria-label="Hızlı inceleme penceresini kapat">×</button>
        <div class="quick-view-media">
          <div class="quick-view-stage">
            <button class="quick-view-arrow quick-view-prev" type="button" aria-label="Önceki ürün fotoğrafı">‹</button>
            <img class="quick-view-main-image" alt="" decoding="async">
            <button class="quick-view-arrow quick-view-next" type="button" aria-label="Sonraki ürün fotoğrafı">›</button>
            <div class="quick-view-count" aria-live="polite"></div>
          </div>
          <div class="quick-view-thumbs" aria-label="Ürün fotoğrafları"></div>
        </div>
        <div class="quick-view-copy">
          <p class="eyebrow quick-view-category"></p>
          <h2 id="quick-view-title"></h2>
          <div class="quick-view-meta"><span class="quick-view-type"></span><span class="quick-view-tag" hidden></span></div>
          <p class="quick-view-description"></p>
          <div class="quick-view-price"><del class="quick-view-old-price" hidden></del><strong class="quick-view-current-price"></strong></div>
          <a class="quick-view-whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp'tan bu ürünü sor <span aria-hidden="true">↗</span></a>
          <small class="quick-view-note">Ölçü, renk, stok ve teslimat seçenekleri için mağazamızdan bilgi alabilirsiniz.</small>
        </div>
      </div>`;
    document.body.appendChild(shell);
    dialog=shell;

    dialog.querySelector('.quick-view-close').addEventListener('click',close);
    dialog.querySelector('.quick-view-prev').addEventListener('click',()=>setImage(imageIndex-1));
    dialog.querySelector('.quick-view-next').addEventListener('click',()=>setImage(imageIndex+1));
    dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
    dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
    dialog.addEventListener('close',cleanupAfterClose);

    const stage=dialog.querySelector('.quick-view-stage');
    stage.addEventListener('touchstart',e=>{touchStartX=e.touches[0]?.clientX??null},{passive:true});
    stage.addEventListener('touchend',e=>{
      if(touchStartX==null)return;
      const x=e.changedTouches[0]?.clientX??touchStartX;
      const dx=x-touchStartX;touchStartX=null;
      if(Math.abs(dx)>45)setImage(imageIndex+(dx<0?1:-1));
    },{passive:true});
    return dialog;
  };

  function parseImages(card){
    try{
      const parsed=JSON.parse(card.dataset.qvImages||'[]');
      if(Array.isArray(parsed)&&parsed.length)return parsed.filter(Boolean);
    }catch{}
    const img=card.querySelector('.product-image img');
    const src=img?.currentSrc||img?.src||img?.dataset?.smartSrc||img?.dataset?.gallerySrc;
    return src?[src]:[];
  }

  function renderThumbs(){
    const box=dialog.querySelector('.quick-view-thumbs');
    box.innerHTML='';
    images.forEach((src,i)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='quick-view-thumb'+(i===imageIndex?' is-active':'');
      button.setAttribute('aria-label',`${i+1}. fotoğrafı göster`);
      const img=document.createElement('img');
      img.src=src;img.alt='';img.loading='lazy';img.decoding='async';
      button.appendChild(img);
      button.addEventListener('click',()=>setImage(i));
      box.appendChild(button);
    });
    box.hidden=images.length<2;
  }

  function setImage(next){
    if(!dialog||!images.length)return;
    imageIndex=(next+images.length)%images.length;
    const main=dialog.querySelector('.quick-view-main-image');
    main.classList.remove('is-ready');
    main.alt=`${activeCard?.dataset.qvName||'Mobilyum ürünü'} · ${imageIndex+1}. fotoğraf`;
    main.onload=()=>main.classList.add('is-ready');
    main.onerror=()=>main.classList.add('is-ready');
    main.src=images[imageIndex];
    if(main.complete)main.classList.add('is-ready');
    dialog.querySelector('.quick-view-count').textContent=images.length>1?`${imageIndex+1} / ${images.length}`:'';
    dialog.querySelectorAll('.quick-view-thumb').forEach((b,i)=>b.classList.toggle('is-active',i===imageIndex));
    const multi=images.length>1;
    dialog.querySelector('.quick-view-prev').hidden=!multi;
    dialog.querySelector('.quick-view-next').hidden=!multi;
  }

  function open(card,trigger){
    if(!card)return;
    ensureDialog();
    clearTimeout(closeTimer);
    activeCard=card;
    returnFocus=trigger instanceof HTMLElement?trigger:null;
    images=parseImages(card);
    imageIndex=0;

    const name=card.dataset.qvName||'Mobilyum ürünü';
    const category=card.dataset.qvCategory||'MOBİLYUM ÇORLU';
    const type=card.dataset.qvType||'Mobilya';
    const tag=card.dataset.qvTag||'';
    const price=card.dataset.qvPrice||'Fiyat için bilgi alın';
    const oldPrice=card.dataset.qvOldPrice||'';
    const description=card.dataset.qvDescription||'Bu modelin ölçü, renk, stok ve teslimat seçenekleri için ekibimizden bilgi alabilirsiniz.';

    dialog.querySelector('.quick-view-category').textContent=category.toUpperCase();
    dialog.querySelector('#quick-view-title').textContent=name;
    dialog.querySelector('.quick-view-type').textContent=type;
    const tagEl=dialog.querySelector('.quick-view-tag');
    tagEl.textContent=tag;tagEl.hidden=!tag;
    dialog.querySelector('.quick-view-description').textContent=description;
    dialog.querySelector('.quick-view-current-price').textContent=price;
    const oldEl=dialog.querySelector('.quick-view-old-price');
    oldEl.textContent=oldPrice;oldEl.hidden=!oldPrice;
    const wa=dialog.querySelector('.quick-view-whatsapp');
    wa.href=`https://wa.me/${whatsapp}?text=${encodeURIComponent('Merhaba Mobilyum, '+name+' hakkında bilgi almak istiyorum.')}`;

    renderThumbs();
    if(images.length)setImage(0);
    else dialog.querySelector('.quick-view-main-image').removeAttribute('src');

    if(!dialog.open)dialog.showModal();
    requestAnimationFrame(()=>requestAnimationFrame(()=>dialog.classList.add('is-ready')));
    dialog.querySelector('.quick-view-close').focus({preventScroll:true});
  }

  function close(){
    if(!dialog?.open)return;
    dialog.classList.remove('is-ready');
    clearTimeout(closeTimer);
    closeTimer=setTimeout(()=>{if(dialog?.open)dialog.close()},180);
  }

  function cleanupAfterClose(){
    dialog?.classList.remove('is-ready');
    const target=returnFocus;returnFocus=null;activeCard=null;
    if(target&&document.contains(target))target.focus({preventScroll:true});
  }

  document.addEventListener('click',e=>{
    const button=e.target.closest('.quick-view-open');
    const card=e.target.closest(cardsSelector);
    if(!card)return;
    if(!button&&e.target.closest('a,button'))return;
    e.preventDefault();
    e.stopPropagation();
    open(card,button||card.querySelector('.quick-view-open'));
  });

  document.addEventListener('keydown',e=>{
    if(!dialog?.open)return;
    if(e.key==='ArrowLeft'){e.preventDefault();setImage(imageIndex-1)}
    else if(e.key==='ArrowRight'){e.preventDefault();setImage(imageIndex+1)}
  });
})();
