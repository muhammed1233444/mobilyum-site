let adminPassword = sessionStorage.getItem("mobilyum_admin_password") || "";
const $=s=>document.querySelector(s);
const login=$('#login'), panel=$('#panel'), loginMsg=$('#loginMsg');
const descriptionInput=$('#descriptionInput');
const descriptionCount=$('#descriptionCount');
const descriptionTemplates=$('#descriptionTemplates');
const categoryInput=document.querySelector('[name="category"]');
let selectedCoverIndex=0;
let previewObjectUrls=[];

const DESCRIPTION_TEMPLATES={
  "Yatak Odaları":[
    {label:"Modern ve şık",text:"Modern çizgileri ve dengeli tasarımıyla yatak odanıza şık, düzenli ve huzurlu bir görünüm kazandırır. Takım içeriği, ölçü ve renk seçenekleri için mağazamızdan bilgi alabilirsiniz."},
    {label:"Takım uyumu",text:"Birbiriyle uyumlu parçaları sayesinde yatak odanızda bütünlüklü ve ferah bir atmosfer oluşturur. Ürünün ölçüleri, takım içeriği ve teslimat seçenekleri için bizimle iletişime geçebilirsiniz."},
    {label:"Zamansız tasarım",text:"Zamansız tasarım anlayışını kullanışlı detaylarla bir araya getiren bu model, farklı dekorasyon tarzlarına kolayca uyum sağlar. Renk, ölçü, fiyat ve stok bilgisi mağazamızdan alınabilir."}
  ],
  "Oturma Grupları":[
    {label:"Konfor odaklı",text:"Konforlu oturum hissi ve dengeli tasarımıyla salonunuzda keyifli bir yaşam alanı oluşturur. Kumaş, renk, ölçü ve takım içeriği seçenekleri için mağazamızdan bilgi alabilirsiniz."},
    {label:"Modern salon",text:"Modern çizgileriyle salonunuza güçlü ve şık bir karakter kazandıran bu model, günlük yaşamın farklı ihtiyaçlarına uyum sağlar. Güncel fiyat, renk ve teslimat bilgisi için bizimle iletişime geçebilirsiniz."},
    {label:"Sade ve zamansız",text:"Sade detayları ve zamansız görünümüyle farklı salon düzenlerine kolayca uyum sağlar. Kumaş seçeneklerini, takım içeriğini ve ölçü bilgilerini mağazamızda birlikte değerlendirebilirsiniz."}
  ],
  "Yemek Odaları":[
    {label:"Şık sofralar",text:"Uyumlu takım parçaları ve zarif tasarımıyla sofralarınıza sıcak ve şık bir atmosfer katar. Masa, sandalye, konsol içeriği ile ölçü ve renk seçenekleri için mağazamızdan bilgi alabilirsiniz."},
    {label:"Modern yemek alanı",text:"Modern görünümüyle yemek alanınızı sade, düzenli ve bütünlüklü bir şekilde tamamlar. Takım içeriği, ölçüler, güncel fiyat ve teslimat seçenekleri için bizimle iletişime geçebilirsiniz."},
    {label:"Zamansız uyum",text:"Zamansız çizgileri sayesinde farklı dekorasyon stilleriyle kolayca uyum sağlayan bu model, yemek alanınıza dengeli bir görünüm kazandırır. Detaylı ürün bilgisi mağazamızdan alınabilir."}
  ],
  "Genç Odaları":[
    {label:"Kullanışlı alan",text:"Çalışma, dinlenme ve düzen ihtiyaçlarını bir araya getiren kullanışlı tasarımıyla genç odalarına uyum sağlar. Takım içeriği, ölçü ve renk seçenekleri için mağazamızdan bilgi alabilirsiniz."},
    {label:"Modern genç odası",text:"Modern ve dinamik çizgileriyle gençlerin yaşam alanına ferah bir görünüm kazandırır. Ürün içeriği, ölçüler, renk seçenekleri ve teslimat bilgisi için bizimle iletişime geçebilirsiniz."},
    {label:"Düzenli ve ferah",text:"Dengeli tasarımıyla odadaki alanı verimli kullanmaya ve düzenli bir atmosfer oluşturmaya yardımcı olur. Takım içeriğini ve ölçü seçeneklerini mağazamızda birlikte değerlendirebilirsiniz."}
  ],
  "Diğer":[
    {label:"Genel ürün metni",text:"Evinize uyum sağlayan tasarımı ve kullanışlı detaylarıyla yaşam alanınızı tamamlar. Ölçü, renk, fiyat, stok ve teslimat seçenekleri için mağazamızdan bilgi alabilirsiniz."},
    {label:"Premium görünüm",text:"Zarif detayları ve dengeli tasarımıyla yaşam alanınıza güçlü ve şık bir görünüm kazandırır. Ürünün seçenekleri ve güncel fiyat bilgisi için bizimle iletişime geçebilirsiniz."}
  ]
};

function updateDescriptionCount(){if(descriptionCount)descriptionCount.textContent=`${descriptionInput?.value.length||0} / 600`}
function renderDescriptionTemplates(){
  if(!descriptionTemplates)return;
  descriptionTemplates.innerHTML="";
  const templates=DESCRIPTION_TEMPLATES[categoryInput?.value]||DESCRIPTION_TEMPLATES.Diğer;
  templates.forEach(template=>{
    const button=document.createElement("button");
    button.type="button";
    button.className="description-template";
    button.textContent=template.label;
    button.title="Bu metni açıklama alanına yaz";
    button.onclick=()=>{descriptionInput.value=template.text;updateDescriptionCount();descriptionInput.focus()};
    descriptionTemplates.append(button);
  });
}
descriptionInput?.addEventListener("input",updateDescriptionCount);
categoryInput?.addEventListener("change",renderDescriptionTemplates);
renderDescriptionTemplates();
updateDescriptionCount();

async function api(url, options={}) {
  options.headers = options.headers || {};
  if (adminPassword) options.headers["x-admin-password"]=adminPassword;
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), 120000);
  options.signal = controller.signal;
  try {
    const r=await fetch(url, options);
    const data=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data.error || `Sunucu hatası (${r.status}).`);
    return data;
  } catch(err) {
    if (err.name === "AbortError") throw new Error("Sunucu 2 dakika içinde cevap vermedi. Railway loglarını kontrol et.");
    if (err instanceof TypeError) throw new Error("Sunucuya bağlanılamadı. Railway deploy durumunu kontrol et.");
    throw err;
  } finally { clearTimeout(timer); }
}
async function check(){
  if(!adminPassword) return;
  try { await api("/api/admin/check"); login.hidden=true; panel.hidden=false; loadAll(); }
  catch { sessionStorage.removeItem("mobilyum_admin_password"); adminPassword=""; }
}
$("#loginBtn").onclick=async()=>{
  adminPassword=$("#password").value;
  try { await api("/api/admin/check"); sessionStorage.setItem("mobilyum_admin_password",adminPassword); login.hidden=true; panel.hidden=false; loadAll(); }
  catch(e){ loginMsg.textContent=e.message; adminPassword=""; }
};
$("#logoutBtn").onclick=()=>{sessionStorage.removeItem("mobilyum_admin_password");location.reload()};
$("#refreshBtn").onclick=loadProducts;
$("#analyticsRefreshBtn").onclick=loadAnalytics;
$("#exportDataBtn").onclick=async()=>{
  const msg=$("#exportMsg");
  msg.textContent="Yedek hazırlanıyor...";
  try{
    const r=await fetch("/api/admin/export",{headers:{"x-admin-password":adminPassword},cache:"no-store"});
    if(!r.ok){const data=await r.json().catch(()=>({}));throw new Error(data.error||`Sunucu hatası (${r.status}).`)}
    const blob=await r.blob();
    const disposition=r.headers.get("content-disposition")||"";
    const name=disposition.match(/filename="([^"]+)"/)?.[1]||"mobilyum-veri-yedegi.json";
    const link=document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download=name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(link.href),1000);
    msg.textContent="Ürün ve analiz yedeği indirildi.";
  }catch(error){msg.textContent=error.message||"Yedek indirilemedi."}
};

function clearPreviewUrls(){previewObjectUrls.forEach(url=>URL.revokeObjectURL(url));previewObjectUrls=[]}
function selectCoverPreview(index){
  selectedCoverIndex=index;
  document.querySelectorAll("#imagePreview .preview-item").forEach((item,i)=>{
    const active=i===selectedCoverIndex;
    item.classList.toggle("is-cover",active);
    item.setAttribute("aria-pressed",String(active));
    item.querySelector("span").textContent=active?"Kapak":"Kapak yap";
  });
}

$("#imageInput").onchange=e=>{
  const box=$("#imagePreview");
  clearPreviewUrls();
  box.innerHTML="";
  const files=Array.from(e.target.files||[]).slice(0,12);
  selectedCoverIndex=0;
  files.forEach((file,i)=>{
    const wrap=document.createElement("button");
    wrap.type="button";
    wrap.className="preview-item";
    wrap.setAttribute("aria-label",`${i+1}. fotoğrafı kapak yap`);
    wrap.onclick=()=>selectCoverPreview(i);
    const img=document.createElement("img");
    const url=URL.createObjectURL(file);
    previewObjectUrls.push(url);
    img.src=url;
    img.alt=`Fotoğraf ${i+1}`;
    const label=document.createElement("span");
    label.textContent=i===0?"Kapak":"Kapak yap";
    wrap.append(img,label);
    box.append(wrap);
  });
  selectCoverPreview(0);
};

async function optimizeImage(file) {
  // Telefon fotoğraflarını her zaman web için küçültüyoruz. Böylece 8-12 fotoğraflı
  // bir ürün Railway'e tek seferde çok büyük bir istek göndermiyor.
  if (!file.type.startsWith("image/")) throw new Error("Geçersiz fotoğraf dosyası.");
  const bitmap = await createImageBitmap(file);
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d", {alpha:false});
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise(resolve=>canvas.toBlob(resolve, "image/jpeg", 0.74));
  if (!blob) throw new Error("Fotoğraf hazırlanamadı.");
  if (blob.size > 5 * 1024 * 1024) throw new Error("Fotoğraf çok büyük. Daha küçük bir fotoğraf seç.");
  return new File([blob], (file.name.replace(/\.[^.]+$/, "") || "foto") + ".jpg", {type:"image/jpeg"});
}

$("#productForm").onsubmit=async e=>{
  e.preventDefault();
  const msg=$("#formMsg"); msg.textContent="Kaydediliyor...";
  try{
    const fd=new FormData();
    for (const el of e.target.elements) {
      if (!el.name || el.name === "images") continue;
      if (el.type !== "file") fd.append(el.name, el.value);
    }
    const files=Array.from(document.querySelector("#imageInput").files||[]).slice(0,12);
    if (!files.length) throw new Error("En az 1 fotoğraf seç.");
    fd.append("coverIndex",String(Math.min(selectedCoverIndex,files.length-1)));
    for (const file of files) {
      const optimized = await optimizeImage(file);
      fd.append("images", optimized, optimized.name);
    }
    const saved=await api("/api/products",{method:"POST",body:fd});
    e.target.reset();
    clearPreviewUrls();
    selectedCoverIndex=0;
    document.querySelector("#imagePreview").innerHTML="";
    renderDescriptionTemplates();
    updateDescriptionCount();
    msg.textContent=`Ürün başarıyla eklendi (${Array.isArray(saved.images)?saved.images.length:1} fotoğraf).`;
    await loadProducts();
  }catch(err){msg.textContent=err.message||"Ürün kaydedilemedi."}
};
async function loadProducts(){
  const items=await api("/api/products");
  const box=$("#products");
  if(!items.length){box.innerHTML="<p>Henüz yönetim panelinden ürün eklenmedi.</p>";return}
  box.innerHTML=items.map(p=>{
    const imgs=Array.isArray(p.images)&&p.images.length?p.images:[p.image];
    const cover=(p.image&&imgs.includes(p.image)?p.image:imgs[Number(p.coverIndex)||0])||imgs[0];
    const thumbs=imgs.filter(Boolean).slice(0,12).map((src,i)=>`<button type="button" class="item-cover${src===cover?' is-cover':''}" data-id="${escapeHtml(p.id)}" data-index="${i}" aria-pressed="${src===cover?'true':'false'}" title="${src===cover?'Mevcut kapak':'Bu fotoğrafı kapak yap'}"><img src="${escapeHtml(src)}" alt="Fotoğraf ${i+1}"><span>${src===cover?'Kapak':'Kapak yap'}</span></button>`).join("");
    return `<article class="item">
      <div class="item-images">${thumbs}</div>
      <div class="item-body"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.category)} · ${escapeHtml(p.price)}</p><small>${imgs.length} fotoğraf</small>
      <button class="delete" data-id="${p.id}">Ürünü sil</button></div></article>`;
  }).join("");
  box.querySelectorAll(".item-cover").forEach(button=>button.onclick=async()=>{
    if(button.getAttribute("aria-pressed")==="true")return;
    const original=button.querySelector("span").textContent;
    button.disabled=true;
    button.querySelector("span").textContent="Kaydediliyor";
    try{
      await api(`/api/products/${encodeURIComponent(button.dataset.id)}/cover`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({coverIndex:Number(button.dataset.index)})});
      await loadProducts();
    }catch(error){button.disabled=false;button.querySelector("span").textContent=original;alert(error.message)}
  });
  box.querySelectorAll(".delete").forEach(b=>b.onclick=async()=>{
    if(!confirm("Bu ürünü silmek istediğine emin misin?"))return;
    try{await api("/api/products/"+b.dataset.id,{method:"DELETE"});loadProducts()}catch(e){alert(e.message)}
  });
}

const formatNumber=value=>new Intl.NumberFormat("tr-TR").format(Number(value||0));
const pageNames={
  "/":"Ana sayfa","/yatak-odasi":"Yatak Odası","/koltuk-takimlari":"Koltuk Takımları","/yemek-odasi":"Yemek Odası","/genc-odasi":"Genç Odası","/dugun-paketi":"Düğün Paketi","/hakkimizda":"Hakkımızda","/iletisim":"İletişim"
};

function renderCountList(target, entries, emptyText){
  const box=$(target);
  if(!entries.length){box.innerHTML=`<p>${escapeHtml(emptyText)}</p>`;return}
  const max=Math.max(...entries.map(([,value])=>Number(value||0)),1);
  box.innerHTML=entries.slice(0,8).map(([name,value])=>`<div class="analytics-row"><span>${escapeHtml(name)}</span><i><b style="width:${Math.max(4,Math.round(Number(value||0)/max*100))}%"></b></i><strong>${formatNumber(value)}</strong></div>`).join("");
}

async function loadAnalytics(){
  const msg=$("#analyticsMsg");
  msg.textContent="İstatistikler yükleniyor...";
  try{
    const data=await api("/api/admin/analytics");
    $("#statVisits").textContent=formatNumber(data.totals?.visits);
    $("#statPageViews").textContent=formatNumber(data.totals?.pageViews);
    $("#statWhatsapp").textContent=formatNumber(data.totals?.whatsappClicks);
    $("#statPhone").textContent=formatNumber(data.totals?.phoneClicks);
    $("#statDirections").textContent=formatNumber(data.totals?.directionsClicks);
    const pages=Object.entries(data.pages||{}).map(([name,value])=>[pageNames[name]||name,value]).sort((a,b)=>b[1]-a[1]);
    const referrers=Object.entries(data.referrers||{}).sort((a,b)=>b[1]-a[1]);
    const devices=[["Mobil",data.devices?.mobile||0],["Masaüstü",data.devices?.desktop||0]].sort((a,b)=>b[1]-a[1]);
    renderCountList("#analyticsPages",pages,"Henüz sayfa görüntüleme verisi yok.");
    renderCountList("#analyticsReferrers",referrers,"Henüz ziyaret kaynağı verisi yok.");
    renderCountList("#analyticsDevices",devices,"Henüz cihaz verisi yok.");
    const days=Object.entries(data.byDay||{}).sort(([a],[b])=>b.localeCompare(a)).slice(0,14);
    $("#analyticsDays").innerHTML=days.length?`<table><thead><tr><th>Tarih</th><th>Ziyaret</th><th>Sayfa</th><th>WhatsApp</th><th>Telefon</th></tr></thead><tbody>${days.map(([day,values])=>`<tr><td>${escapeHtml(day)}</td><td>${formatNumber(values.visits)}</td><td>${formatNumber(values.pageViews)}</td><td>${formatNumber(values.whatsappClicks)}</td><td>${formatNumber(values.phoneClicks)}</td></tr>`).join("")}</tbody></table>`:"<p>İlk analiz verileri ziyaretçiler onay verdikten sonra burada görünecek.</p>";
    msg.textContent=data.updatedAt?`Son veri: ${new Date(data.updatedAt).toLocaleString("tr-TR")}`:"Henüz analiz verisi yok.";
  }catch(error){msg.textContent=error.message||"Analiz verileri alınamadı."}
}

function loadAll(){
  Promise.allSettled([loadProducts(),loadAnalytics()]);
}

function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
check();
