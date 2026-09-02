let adminPassword = sessionStorage.getItem("mobilyum_admin_password") || "";
const $=s=>document.querySelector(s);
const login=$('#login'), panel=$('#panel'), loginMsg=$('#loginMsg');

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
  try { await api("/api/admin/check"); login.hidden=true; panel.hidden=false; load(); }
  catch { sessionStorage.removeItem("mobilyum_admin_password"); adminPassword=""; }
}
$("#loginBtn").onclick=async()=>{
  adminPassword=$("#password").value;
  try { await api("/api/admin/check"); sessionStorage.setItem("mobilyum_admin_password",adminPassword); login.hidden=true; panel.hidden=false; load(); }
  catch(e){ loginMsg.textContent=e.message; adminPassword=""; }
};
$("#logoutBtn").onclick=()=>{sessionStorage.removeItem("mobilyum_admin_password");location.reload()};
$("#refreshBtn").onclick=load;

$("#imageInput").onchange=e=>{
  const box=$("#imagePreview");
  box.innerHTML="";
  const files=Array.from(e.target.files||[]).slice(0,12);
  files.forEach((file,i)=>{
    const wrap=document.createElement("div");
    wrap.className="preview-item";
    const img=document.createElement("img");
    img.src=URL.createObjectURL(file);
    img.alt=`Fotoğraf ${i+1}`;
    const label=document.createElement("span");
    label.textContent=i===0?"Kapak":String(i+1);
    wrap.append(img,label);
    box.append(wrap);
  });
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
    for (const file of files) {
      const optimized = await optimizeImage(file);
      fd.append("images", optimized, optimized.name);
    }
    const saved=await api("/api/products",{method:"POST",body:fd});
    e.target.reset();
    document.querySelector("#imagePreview").innerHTML="";
    msg.textContent=`Ürün başarıyla eklendi (${Array.isArray(saved.images)?saved.images.length:1} fotoğraf).`;
    await load();
  }catch(err){msg.textContent=err.message||"Ürün kaydedilemedi."}
};
async function load(){
  const items=await api("/api/products");
  const box=$("#products");
  if(!items.length){box.innerHTML="<p>Henüz yönetim panelinden ürün eklenmedi.</p>";return}
  box.innerHTML=items.map(p=>{
    const imgs=Array.isArray(p.images)&&p.images.length?p.images:[p.image];
    const thumbs=imgs.filter(Boolean).slice(0,12).map((src,i)=>`<img src="${escapeHtml(src)}" alt="Fotoğraf ${i+1}">`).join("");
    return `<article class="item">
      <div class="item-images">${thumbs}</div>
      <div class="item-body"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.category)} · ${escapeHtml(p.price)}</p><small>${imgs.length} fotoğraf</small>
      <button class="delete" data-id="${p.id}">Ürünü sil</button></div></article>`;
  }).join("");
  box.querySelectorAll(".delete").forEach(b=>b.onclick=async()=>{
    if(!confirm("Bu ürünü silmek istediğine emin misin?"))return;
    try{await api("/api/products/"+b.dataset.id,{method:"DELETE"});load()}catch(e){alert(e.message)}
  });
}
function escapeHtml(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
check();
