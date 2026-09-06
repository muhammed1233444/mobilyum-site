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
    {label:"Zamansız tasarım",text:"Zamansız tasarım anlayışını kullanışlı detaylarla bir araya getiren bu model, farklı dekorasyon tarzlarına kolayca uyum sağlar. Renk, ölçü, fiyat ve stok bilgisi mağazamızdan alınabilir."},
    {label:"Ferah ve düzenli",text:"Fonksiyonel depolama alanları ve ferah görünümüyle yatak odanızda düzenli bir yaşam alanı oluşturur. Takım içeriği, ölçüler ve renk seçenekleri için mağazamızdan bilgi alabilirsiniz."},
    {label:"Premium yatak odası",text:"Özenli detayları ve güçlü duruşuyla yatak odanıza premium bir atmosfer kazandırır. Modelin takım içeriği, güncel fiyatı ve teslimat seçenekleri için bizimle iletişime geçebilirsiniz."}
  ],
  "Oturma Grupları":[
    {label:"Konfor odaklı",text:"Konforlu oturum hissi ve dengeli tasarımıyla salonunuzda keyifli bir yaşam alanı oluşturur. Kumaş, renk, ölçü ve takım içeriği seçenekleri için mağazamızdan bilgi alabilirsiniz."},
    {label:"Modern salon",text:"Modern çizgileriyle salonunuza güçlü ve şık bir karakter kazandıran bu model, günlük yaşamın farklı ihtiyaçlarına uyum sağlar. Güncel fiyat, renk ve teslimat bilgisi için bizimle iletişime geçebilirsiniz."},
    {label:"Sade ve zamansız",text:"Sade detayları ve zamansız görünümüyle farklı salon düzenlerine kolayca uyum sağlar. Kumaş seçeneklerini, takım içeriğini ve ölçü bilgilerini mağazamızda birlikte değerlendirebilirsiniz."},
    {label:"Aile konforu",text:"Geniş ve konforlu oturum yapısıyla günlük kullanımdan misafir ağırlamaya kadar salonunuzun farklı ihtiyaçlarına uyum sağlar. Kumaş, renk ve takım seçenekleri için bilgi alabilirsiniz."},
    {label:"Premium oturum",text:"Şık dikiş detayları, dengeli formu ve konforlu yapısıyla salonunuza seçkin bir görünüm kazandırır. Güncel fiyat, ölçü, renk ve teslimat bilgisi mağazamızdan alınabilir."}
  ],
  "Yemek Odaları":[
    {label:"Şık sofralar",text:"Uyumlu takım parçaları ve zarif tasarımıyla sofralarınıza sıcak ve şık bir atmosfer katar. Masa, sandalye, konsol içeriği ile ölçü ve renk seçenekleri için mağazamızdan bilgi alabilirsiniz."},
    {label:"Modern yemek alanı",text:"Modern görünümüyle yemek alanınızı sade, düzenli ve bütünlüklü bir şekilde tamamlar. Takım içeriği, ölçüler, güncel fiyat ve teslimat seçenekleri için bizimle iletişime geçebilirsiniz."},
    {label:"Zamansız uyum",text:"Zamansız çizgileri sayesinde farklı dekorasyon stilleriyle kolayca uyum sağlayan bu model, yemek alanınıza dengeli bir görünüm kazandırır. Detaylı ürün bilgisi mağazamızdan alınabilir."},
    {label:"Davet sofraları",text:"Aileniz ve misafirleriniz için sıcak bir buluşma alanı oluşturan bu takım, şıklık ile kullanışlılığı bir araya getirir. Takım içeriği ve masa ölçüleri için bilgi alabilirsiniz."},
    {label:"Premium yemek odası",text:"Zarif yüzey detayları ve bütünlüklü tasarımıyla yemek alanınıza premium bir görünüm kazandırır. Renk, ölçü, fiyat ve teslimat seçenekleri için mağazamıza ulaşabilirsiniz."}
  ],
  "Genç Odaları":[
    {label:"Kullanışlı alan",text:"Çalışma, dinlenme ve düzen ihtiyaçlarını bir araya getiren kullanışlı tasarımıyla genç odalarına uyum sağlar. Takım içeriği, ölçü ve renk seçenekleri için mağazamızdan bilgi alabilirsiniz."},
    {label:"Modern genç odası",text:"Modern ve dinamik çizgileriyle gençlerin yaşam alanına ferah bir görünüm kazandırır. Ürün içeriği, ölçüler, renk seçenekleri ve teslimat bilgisi için bizimle iletişime geçebilirsiniz."},
    {label:"Düzenli ve ferah",text:"Dengeli tasarımıyla odadaki alanı verimli kullanmaya ve düzenli bir atmosfer oluşturmaya yardımcı olur. Takım içeriğini ve ölçü seçeneklerini mağazamızda birlikte değerlendirebilirsiniz."},
    {label:"Çalışma ve dinlenme",text:"Çalışma, dinlenme ve depolama alanlarını uyumlu biçimde bir araya getirerek gençler için konforlu ve düzenli bir oda oluşturur. Takım seçenekleri için bilgi alabilirsiniz."},
    {label:"Uzun yıllar kullanım",text:"Sade çizgileri ve kullanışlı parçalarıyla farklı yaş dönemlerine uyum sağlayan uzun ömürlü bir genç odası seçeneğidir. Ölçü, renk ve takım içeriği mağazamızdan öğrenilebilir."}
  ],
  "Diğer":[
    {label:"Genel ürün metni",text:"Evinize uyum sağlayan tasarımı ve kullanışlı detaylarıyla yaşam alanınızı tamamlar. Ölçü, renk, fiyat, stok ve teslimat seçenekleri için mağazamızdan bilgi alabilirsiniz."},
    {label:"Premium görünüm",text:"Zarif detayları ve dengeli tasarımıyla yaşam alanınıza güçlü ve şık bir görünüm kazandırır. Ürünün seçenekleri ve güncel fiyat bilgisi için bizimle iletişime geçebilirsiniz."},
    {label:"Dayanıklı seçim",text:"Sağlam yapısı ve kullanışlı tasarımıyla evinizde uzun yıllar keyifle kullanabileceğiniz bir seçenektir. Ölçü, renk, stok ve teslimat bilgisi için mağazamıza ulaşabilirsiniz."},
    {label:"Evinize uyumlu",text:"Dengeli ölçüleri ve sade görünümüyle farklı yaşam alanlarına kolayca uyum sağlar. Ürünün seçeneklerini ve güncel fiyat bilgisini mağazamızda birlikte değerlendirebiliriz."}
  ]
};

const withMdf=text=>`${String(text||"").trim()} Ürünümüz %100 MDF malzemeden üretilmiştir.`.slice(0,600);
const CATEGORY_DESCRIPTION_PARTS={
  "Yatak Odaları":{product:"Bu yatak odası takımı",space:"yatak odanıza",details:"takım içeriği, ölçü, renk ve teslimat seçenekleri"},
  "Oturma Grupları":{product:"Bu oturma grubu",space:"salonunuza",details:"kumaş, renk, ölçü ve takım seçenekleri"},
  "Yemek Odaları":{product:"Bu yemek odası takımı",space:"yemek alanınıza",details:"masa ölçüsü, sandalye, konsol ve renk seçenekleri"},
  "Genç Odaları":{product:"Bu genç odası takımı",space:"genç odanıza",details:"takım içeriği, ölçü, renk ve depolama seçenekleri"},
  "Diğer":{product:"Bu ürün",space:"yaşam alanınıza",details:"ölçü, renk, stok ve teslimat seçenekleri"}
};
const EXTRA_DESCRIPTION_STYLES=[
  ["Minimal çizgiler",p=>`${p.product}, minimal çizgileri ve sade detaylarıyla ${p.space} ferah ve modern bir görünüm kazandırır. ${p.details} için mağazamızdan bilgi alabilirsiniz.`],
  ["Güçlü duruş",p=>`${p.product}, dengeli oranları ve güçlü tasarım diliyle ${p.space} karakterli bir atmosfer katar. ${p.details} mağazamızda birlikte değerlendirilebilir.`],
  ["Sıcak atmosfer",p=>`${p.product}, sıcak tonları ve uyumlu detaylarıyla ${p.space} huzurlu ve davetkâr bir hava kazandırır. Güncel fiyat ile ${p.details} için bize ulaşabilirsiniz.`],
  ["Fonksiyonel tasarım",p=>`${p.product}, şık görünümünü günlük kullanımı kolaylaştıran fonksiyonel ayrıntılarla tamamlar. ${p.details} hakkında mağazamızdan bilgi alabilirsiniz.`],
  ["Modern yaşam",p=>`${p.product}, modern yaşam alanlarının ihtiyaçlarına uyum sağlayan kullanışlı ve estetik bir seçenektir. ${p.details} için bizimle iletişime geçebilirsiniz.`],
  ["Zarif detaylar",p=>`${p.product}, zarif yüzeyleri ve özenli detayları sayesinde ${p.space} seçkin bir görünüm kazandırır. Fiyat, stok ve ${p.details} mağazamızdan öğrenilebilir.`],
  ["Doğal görünüm",p=>`${p.product}, doğal tonları ve yalın tasarımıyla farklı dekorasyon stillerine kolayca uyum sağlar. ${p.details} için mağazamıza bekleriz.`],
  ["Şehirli stil",p=>`${p.product}, çağdaş çizgileriyle şehirli ve dinamik bir dekorasyon anlayışını ${p.space} taşır. Güncel fiyat ve ${p.details} için bilgi alabilirsiniz.`],
  ["Dengeli uyum",p=>`${p.product}, birbiriyle uyumlu parçaları ve dengeli formuyla ${p.space} bütünlüklü bir görünüm verir. ${p.details} için ekibimize ulaşabilirsiniz.`],
  ["Konfor ve şıklık",p=>`${p.product}, konforu şık bir tasarım anlayışıyla buluşturarak günlük yaşamınıza değer katar. ${p.details} mağazamızda birlikte belirlenebilir.`],
  ["Yeni sezon",p=>`${p.product}, yeni sezonun sade ve güçlü çizgilerini kullanışlı detaylarla bir araya getirir. Güncel fiyat, stok ve ${p.details} için bizimle iletişime geçebilirsiniz.`],
  ["Gösterişli tasarım",p=>`${p.product}, dikkat çekici detayları ve özenli formuyla ${p.space} gösterişli fakat dengeli bir atmosfer kazandırır. ${p.details} için bilgi alabilirsiniz.`],
  ["Kompakt çözüm",p=>`${p.product}, alanı verimli kullanmaya yardımcı olan ölçüleri ve işlevsel yapısıyla kompakt yaşam alanlarına uyum sağlar. ${p.details} mağazamızdan öğrenilebilir.`],
  ["Geniş alanlar",p=>`${p.product}, güçlü hacmi ve tamamlayıcı parçalarıyla geniş yaşam alanlarında etkileyici bir bütünlük oluşturur. ${p.details} için bize ulaşabilirsiniz.`],
  ["Uzun ömürlü",p=>`${p.product}, zamana dirençli görünümü ve sağlam yapısıyla uzun yıllar keyifle kullanabileceğiniz bir seçenektir. ${p.details} için mağazamızdan bilgi alabilirsiniz.`],
  ["Mobilyum seçimi",p=>`${p.product}, Mobilyum'un kalite, estetik ve kullanışlılık anlayışını ${p.space} taşır. Güncel fiyat, stok ve ${p.details} için Çorlu mağazamıza bekleriz.`]
];
function getDescriptionTemplates(category){
  const base=DESCRIPTION_TEMPLATES[category]||DESCRIPTION_TEMPLATES.Diğer;
  const parts=CATEGORY_DESCRIPTION_PARTS[category]||CATEGORY_DESCRIPTION_PARTS.Diğer;
  return [...base,...EXTRA_DESCRIPTION_STYLES.slice(0,Math.max(0,20-base.length)).map(([label,makeText])=>({label,text:makeText(parts)}))];
}
function updateDescriptionCount(){if(descriptionCount)descriptionCount.textContent=`${descriptionInput?.value.length||0} / 600`}
function renderDescriptionTemplates(){
  if(!descriptionTemplates)return;
  descriptionTemplates.innerHTML="";
  const templates=getDescriptionTemplates(categoryInput?.value);
  templates.forEach(template=>{
    const button=document.createElement("button");
    button.type="button";
    button.className="description-template";
    button.textContent=template.label;
    button.title="Bu metni açıklama alanına yaz";
    button.onclick=()=>{descriptionInput.value=withMdf(template.text);updateDescriptionCount();descriptionInput.focus()};
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
$("#loginForm").addEventListener("submit",async event=>{
  event.preventDefault();
  loginMsg.textContent="Giriş kontrol ediliyor…";
  adminPassword=$("#password").value;
  if(!adminPassword){loginMsg.textContent="Yönetici şifresini yazmalısın.";return}
  try { await api("/api/admin/check"); sessionStorage.setItem("mobilyum_admin_password",adminPassword); login.hidden=true; panel.hidden=false; loginMsg.textContent=""; loadAll(); }
  catch(e){ loginMsg.textContent=e.message; adminPassword=""; $("#password").focus(); }
});
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
  const categoryOrder=["Yatak Odaları","Oturma Grupları","Yemek Odaları","Genç Odaları","Diğer"];
  const grouped=new Map();
  items.forEach(product=>{const key=categoryOrder.includes(product.category)?product.category:"Diğer";if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(product)});
  const productHtml=p=>{
    const imgs=Array.isArray(p.images)&&p.images.length?p.images:[p.image];
    const cover=(p.image&&imgs.includes(p.image)?p.image:imgs[Number(p.coverIndex)||0])||imgs[0];
    const thumbs=imgs.filter(Boolean).slice(0,12).map((src,i)=>`<button type="button" class="item-cover${src===cover?' is-cover':''}" data-id="${escapeHtml(p.id)}" data-index="${i}" aria-pressed="${src===cover?'true':'false'}" title="${src===cover?'Mevcut kapak':'Bu fotoğrafı kapak yap'}"><img src="${escapeHtml(src)}" loading="lazy" decoding="async" fetchpriority="low" alt="Fotoğraf ${i+1}"><span>${src===cover?'Kapak':'Kapak yap'}</span></button>`).join("");
    return `<article class="item">
      <div class="item-images">${thumbs}</div>
      <div class="item-body"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.category)} · ${escapeHtml(p.price)}</p><small>${imgs.length} fotoğraf</small>
      <div class="item-actions"><button class="edit-product" data-id="${escapeHtml(p.id)}" type="button">Düzenle</button><button class="delete" data-id="${escapeHtml(p.id)}" type="button">Ürünü sil</button></div></div></article>`;
  };
  box.innerHTML=categoryOrder.filter(category=>grouped.has(category)).map(category=>`<details class="product-folder"><summary><span><b>${escapeHtml(category)}</b><small>${grouped.get(category).length} ürün</small></span><span class="folder-action"><b class="folder-show">Ürünleri göster</b><b class="folder-hide">Kapat</b><i aria-hidden="true">⌄</i></span></summary><div class="product-folder-grid">${grouped.get(category).map(productHtml).join("")}</div></details>`).join("");
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
  box.querySelectorAll(".edit-product").forEach(button=>button.onclick=()=>openEditProduct(items.find(item=>String(item.id)===String(button.dataset.id))));
}

const editModal=$("#editProductModal");
const editForm=$("#editProductForm");
const editImageInput=$("#editImageInput");
let editProduct=null;
let editCoverIndex=0;
let editPreviewUrls=[];

function renderEditTemplates(){
  const box=$("#editDescriptionTemplates");
  if(!box||!editForm)return;
  const category=editForm.elements.category.value;
  box.innerHTML="";
  getDescriptionTemplates(category).forEach(template=>{
    const button=document.createElement("button");button.type="button";button.className="description-template";button.textContent=template.label;
    button.onclick=()=>{editForm.elements.description.value=withMdf(template.text);editForm.elements.description.focus()};box.append(button);
  });
}
function renderEditCurrentImages(){
  const box=$("#editCurrentImages");if(!box||!editProduct)return;
  const images=(Array.isArray(editProduct.images)&&editProduct.images.length?editProduct.images:[editProduct.image]).filter(Boolean);
  box.innerHTML=images.map((src,index)=>`<button type="button" class="preview-item${index===editCoverIndex?' is-cover':''}" data-edit-cover="${index}"><img src="${escapeHtml(src)}" loading="lazy" decoding="async" alt="Mevcut fotoğraf ${index+1}"><span>${index===editCoverIndex?'Kapak':'Kapak yap'}</span></button>`).join("");
  box.querySelectorAll("[data-edit-cover]").forEach(button=>button.onclick=()=>{editCoverIndex=Number(button.dataset.editCover);renderEditCurrentImages()});
}
function openEditProduct(product){
  if(!product||!editModal||!editForm)return;
  editProduct=product;editCoverIndex=Math.max(0,Number(product.coverIndex)||0);
  ["id","name","category","type","price","oldPrice","tag","description"].forEach(name=>{if(editForm.elements[name])editForm.elements[name].value=product[name]||""});
  editImageInput.value="";editPreviewUrls.forEach(URL.revokeObjectURL);editPreviewUrls=[];$("#editNewImages").innerHTML="";$("#editMsg").textContent="";
  renderEditCurrentImages();renderEditTemplates();editModal.hidden=false;document.body.classList.add("edit-open");
  requestAnimationFrame(()=>editModal.classList.add("open"));
}
function closeEditProduct(){
  if(!editModal)return;editModal.classList.remove("open");document.body.classList.remove("edit-open");editPreviewUrls.forEach(URL.revokeObjectURL);editPreviewUrls=[];
  setTimeout(()=>{if(!editModal.classList.contains("open"))editModal.hidden=true},220);
}
document.querySelectorAll("[data-edit-close]").forEach(button=>button.addEventListener("click",closeEditProduct));
editForm?.elements.category.addEventListener("change",renderEditTemplates);
editImageInput?.addEventListener("change",event=>{
  editPreviewUrls.forEach(URL.revokeObjectURL);editPreviewUrls=[];editCoverIndex=0;
  const files=Array.from(event.target.files||[]).slice(0,12);const box=$("#editNewImages");
  box.innerHTML=files.map((file,index)=>{const url=URL.createObjectURL(file);editPreviewUrls.push(url);return `<button type="button" class="preview-item${index===0?' is-cover':''}" data-edit-new-cover="${index}"><img src="${url}" alt="Yeni fotoğraf ${index+1}"><span>${index===0?'Kapak':'Kapak yap'}</span></button>`}).join("");
  box.querySelectorAll("[data-edit-new-cover]").forEach(button=>button.onclick=()=>{editCoverIndex=Number(button.dataset.editNewCover);box.querySelectorAll("[data-edit-new-cover]").forEach(item=>{const active=Number(item.dataset.editNewCover)===editCoverIndex;item.classList.toggle("is-cover",active);item.querySelector("span").textContent=active?"Kapak":"Kapak yap"})});
});
editForm?.addEventListener("submit",async event=>{
  event.preventDefault();if(!editProduct)return;
  const msg=$("#editMsg");const submit=editForm.querySelector('[type="submit"]');submit.disabled=true;msg.textContent="Değişiklikler kaydediliyor…";
  try{
    const newFiles=Array.from(editImageInput.files||[]).slice(0,12);const fd=new FormData();
    ["name","category","type","price","oldPrice","tag","description"].forEach(name=>fd.append(name,editForm.elements[name].value));
    fd.append("coverIndex",String(editCoverIndex));
    for(const file of newFiles){const optimized=await optimizeImage(file);fd.append("images",optimized,optimized.name)}
    await api(`/api/products/${encodeURIComponent(editProduct.id)}`,{method:"PUT",body:fd});
    if(!newFiles.length&&editCoverIndex!==(Number(editProduct.coverIndex)||0))await api(`/api/products/${encodeURIComponent(editProduct.id)}/cover`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({coverIndex:editCoverIndex})});
    msg.textContent="Ürün başarıyla güncellendi.";await loadProducts();setTimeout(closeEditProduct,650);
  }catch(error){msg.textContent=error.message||"Ürün güncellenemedi."}finally{submit.disabled=false}
});

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

/* V10.4 · Dosya adı gerektirmeyen akıllı toplu ürün ekleme */
const bulkInput=$("#bulkImageInput");
const bulkWorkspace=$("#bulkWorkspace");
const bulkPool=$("#bulkPhotoPool");
const bulkGroupsBox=$("#bulkGroups");
const bulkGroupButton=$("#bulkGroupBtn");
const bulkPublishButton=$("#bulkPublishBtn");
const bulkMessage=$("#bulkMsg");
let bulkPhotos=[];
let bulkGroups=[];
let bulkSelected=new Set();
let bulkGroupSequence=0;

const bulkTypeForCategory=category=>({
  "Yatak Odaları":"Yatak Odası Takımı","Oturma Grupları":"Koltuk Takımı",
  "Yemek Odaları":"Yemek Odası Takımı","Genç Odaları":"Genç Odası Takımı","Diğer":"Mobilya"
}[category]||"Mobilya");
const bulkDefaultDescription=category=>withMdf(getDescriptionTemplates(category)[0].text);

function updateBulkSummary(){
  $("#bulkSelectionCount").textContent=bulkSelected.size;
  $("#bulkGroupCount").textContent=`${bulkGroups.length} ürün`;
  bulkGroupButton.disabled=!bulkSelected.size||bulkSelected.size>12;
  bulkPublishButton.disabled=!bulkGroups.length;
  if(bulkSelected.size>12)bulkMessage.textContent="Bir üründe en fazla 12 fotoğraf olabilir. Daha az fotoğraf seç.";
  else if(bulkMessage.textContent.startsWith("Bir üründe"))bulkMessage.textContent="";
}

function renderBulkPool(){
  const grouped=new Set(bulkGroups.flatMap(group=>group.photos.map(photo=>photo.id)));
  const available=bulkPhotos.filter(photo=>!grouped.has(photo.id));
  bulkPool.innerHTML=available.map(photo=>`<button class="bulk-photo${bulkSelected.has(photo.id)?' is-selected':''}" type="button" data-bulk-photo="${photo.id}" aria-pressed="${bulkSelected.has(photo.id)}"><img src="${photo.url}" alt="Seçilen ürün fotoğrafı"><span>${bulkSelected.has(photo.id)?'✓':'+'}</span></button>`).join("");
  if(!available.length&&bulkPhotos.length)bulkPool.innerHTML='<p>Bütün fotoğraflar ürünlere ayrıldı. İstersen aşağıdaki kartlardan fotoğrafları geri çıkarabilirsin.</p>';
  bulkPool.querySelectorAll("[data-bulk-photo]").forEach(button=>button.onclick=()=>{
    const id=Number(button.dataset.bulkPhoto);
    bulkSelected.has(id)?bulkSelected.delete(id):bulkSelected.add(id);
    renderBulkPool();updateBulkSummary();
  });
}

function renderBulkGroups(){
  bulkGroupsBox.innerHTML=bulkGroups.map((group,index)=>`<article class="bulk-group" data-bulk-group="${group.id}">
    <div class="bulk-group-top"><div class="bulk-group-images">${group.photos.map((photo,photoIndex)=>`<button type="button" class="bulk-group-image${photoIndex===group.coverIndex?' is-cover':''}" data-cover="${photoIndex}" title="Kapak fotoğrafı yap"><img src="${photo.url}" alt="${index+1}. ürün fotoğrafı"><span>${photoIndex===group.coverIndex?'Kapak':'Kapak yap'}</span></button>`).join("")}</div>
    <div class="bulk-group-fields"><input data-field="name" value="${escapeHtml(group.name)}" placeholder="Ürün adı*" aria-label="Ürün adı"><select data-field="category" aria-label="Kategori">${Object.keys(DESCRIPTION_TEMPLATES).map(category=>`<option${category===group.category?' selected':''}>${escapeHtml(category)}</option>`).join("")}</select><input data-field="price" value="${escapeHtml(group.price)}" placeholder="Fiyat için bilgi alın" aria-label="Fiyat"><input data-field="tag" value="${escapeHtml(group.tag)}" placeholder="Etiket (isteğe bağlı)" aria-label="Etiket"></div></div>
    <div class="bulk-group-actions"><small>${group.photos.length} fotoğraf · ${index+1}. ürün</small><button class="bulk-remove" type="button">Grubu geri al</button></div></article>`).join("");
  bulkGroupsBox.querySelectorAll("[data-bulk-group]").forEach(article=>{
    const group=bulkGroups.find(item=>item.id===Number(article.dataset.bulkGroup));
    article.querySelectorAll("[data-field]").forEach(field=>field.oninput=()=>{group[field.dataset.field]=field.value});
    article.querySelector('[data-field="category"]').onchange=e=>{group.category=e.target.value;group.description=bulkDefaultDescription(group.category)};
    article.querySelectorAll("[data-cover]").forEach(button=>button.onclick=()=>{group.coverIndex=Number(button.dataset.cover);renderBulkGroups()});
    article.querySelector(".bulk-remove").onclick=()=>{bulkGroups=bulkGroups.filter(item=>item.id!==group.id);renderBulkPool();renderBulkGroups();updateBulkSummary()};
  });
}

bulkInput?.addEventListener("change",event=>{
  const incoming=Array.from(event.target.files||[]).filter(file=>file.type.startsWith("image/"));
  incoming.forEach(file=>bulkPhotos.push({id:Date.now()+(bulkPhotos.length*10)+Math.random(),file,url:URL.createObjectURL(file)}));
  event.target.value="";
  if(bulkPhotos.length){bulkWorkspace.hidden=false;bulkMessage.textContent=`${incoming.length} fotoğraf hazır. Aynı ürüne ait fotoğraflara dokun.`}
  renderBulkPool();updateBulkSummary();
});

bulkGroupButton?.addEventListener("click",()=>{
  const photos=bulkPhotos.filter(photo=>bulkSelected.has(photo.id));
  if(!photos.length||photos.length>12)return;
  bulkGroupSequence+=1;
  const category="Yatak Odaları";
  bulkGroups.push({id:bulkGroupSequence,photos,coverIndex:0,name:"",category,price:"Fiyat için bilgi alın",tag:"",description:bulkDefaultDescription(category)});
  bulkSelected=new Set();
  renderBulkPool();renderBulkGroups();updateBulkSummary();
  bulkGroupsBox.lastElementChild?.scrollIntoView({behavior:"smooth",block:"nearest"});
});

function resetBulkWorkspace({confirmFirst=true}={}){
  if(confirmFirst&&(bulkPhotos.length||bulkGroups.length)&&!confirm("Hazırlanan toplu ürünleri temizlemek istediğine emin misin?"))return;
  bulkPhotos.forEach(photo=>URL.revokeObjectURL(photo.url));
  bulkPhotos=[];bulkGroups=[];bulkSelected=new Set();bulkGroupSequence=0;
  bulkWorkspace.hidden=true;bulkPool.innerHTML="";bulkGroupsBox.innerHTML="";bulkMessage.textContent="";updateBulkSummary();
}
$("#bulkResetBtn")?.addEventListener("click",()=>resetBulkWorkspace());

bulkPublishButton?.addEventListener("click",async()=>{
  const missing=bulkGroups.findIndex(group=>!group.name.trim());
  if(missing>=0){bulkMessage.textContent=`${missing+1}. ürünün adını yazmalısın.`;bulkGroupsBox.children[missing]?.querySelector('[data-field="name"]')?.focus();return}
  bulkPublishButton.disabled=true;
  const originalText=bulkPublishButton.textContent;
  const published=[];
  try{
    for(let index=0;index<bulkGroups.length;index+=1){
      const group=bulkGroups[index];
      bulkPublishButton.textContent=`Yayınlanıyor: ${index+1} / ${bulkGroups.length}`;
      bulkMessage.innerHTML=`Fotoğraflar hazırlanıyor…<div class="bulk-progress"><i style="width:${Math.round(index/bulkGroups.length*100)}%"></i></div>`;
      const fd=new FormData();
      fd.append("name",group.name.trim());fd.append("category",group.category);fd.append("type",bulkTypeForCategory(group.category));
      fd.append("price",group.price||"Fiyat için bilgi alın");fd.append("tag",group.tag||"");fd.append("description",group.description||bulkDefaultDescription(group.category));fd.append("coverIndex",String(group.coverIndex));
      for(const photo of group.photos){const optimized=await optimizeImage(photo.file);fd.append("images",optimized,optimized.name)}
      await api("/api/products",{method:"POST",body:fd});published.push(group.id);
    }
    bulkMessage.textContent=`${published.length} ürün başarıyla yayınlandı.`;
    await loadProducts();
    setTimeout(()=>resetBulkWorkspace({confirmFirst:false}),1400);
  }catch(error){
    const publishedPhotoIds=new Set(bulkGroups.filter(group=>published.includes(group.id)).flatMap(group=>group.photos.map(photo=>photo.id)));
    bulkPhotos.filter(photo=>publishedPhotoIds.has(photo.id)).forEach(photo=>URL.revokeObjectURL(photo.url));
    bulkPhotos=bulkPhotos.filter(photo=>!publishedPhotoIds.has(photo.id));
    bulkGroups=bulkGroups.filter(group=>!published.includes(group.id));
    renderBulkPool();renderBulkGroups();
    bulkMessage.textContent=`${published.length} ürün yayınlandı. Kalanlarda işlem durdu: ${error.message}`;
  }finally{bulkPublishButton.textContent=originalText;updateBulkSummary()}
});
check();
