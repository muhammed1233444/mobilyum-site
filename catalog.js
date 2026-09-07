/* Progressive photo viewer: native links and photos remain usable without JavaScript. */
(() => {
  'use strict';
  const product=document.body.classList.contains('seo-page-product');
  if(!product)return;
  const photos=[...document.querySelectorAll('.seo-landing-image img,.catalog-photo-grid img')];
  if(!photos.length || typeof HTMLDialogElement==='undefined')return;
  const dialog=document.createElement('dialog');
  dialog.className='catalog-lightbox';
  dialog.setAttribute('aria-label','Ürün fotoğrafları');
  dialog.innerHTML='<div class="catalog-lightbox-bar"><span aria-live="polite"></span><button type="button" data-close aria-label="Fotoğrafı kapat">×</button></div><div class="catalog-lightbox-stage"><button type="button" data-prev aria-label="Önceki fotoğraf">‹</button><img alt=""><button type="button" data-next aria-label="Sonraki fotoğraf">›</button></div><p class="catalog-lightbox-caption"></p>';
  document.body.append(dialog);
  const display=dialog.querySelector('img'),counter=dialog.querySelector('[aria-live]');
  let index=0,returnFocus=null,previousOverflow='',touch=null;
  const show=n=>{
    index=(n+photos.length)%photos.length;
    display.src=photos[index].currentSrc||photos[index].src;
    display.alt=photos[index].alt;
    counter.textContent=`${index+1} / ${photos.length}`;
    dialog.querySelector('.catalog-lightbox-caption').textContent=display.alt;
  };
  photos.forEach((img,i)=>{
    const link=img.closest('a');
    if(!link)return;
    link.addEventListener('click',event=>{
      if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();returnFocus=link;previousOverflow=document.body.style.overflow;
      show(i);dialog.showModal();document.body.style.overflow='hidden';
    });
  });
  dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
  dialog.querySelector('[data-prev]').addEventListener('click',()=>show(index-1));
  dialog.querySelector('[data-next]').addEventListener('click',()=>show(index+1));
  dialog.querySelectorAll('[data-prev],[data-next]').forEach(button=>button.hidden=photos.length<2);
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(index+(event.key==='ArrowLeft'?-1:1))}});
  dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;display.removeAttribute('src');returnFocus?.focus({preventScroll:true})});
  dialog.addEventListener('touchstart',event=>{touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null},{passive:true});
  dialog.addEventListener('touchend',event=>{const end=event.changedTouches[0];if(touch&&end){const dx=end.clientX-touch.x,dy=end.clientY-touch.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)show(index+(dx<0?1:-1))}touch=null},{passive:true});
  dialog.addEventListener('touchcancel',()=>{touch=null},{passive:true});
})();
