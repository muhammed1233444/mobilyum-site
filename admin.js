let adminPassword = sessionStorage.getItem("mobilyum_admin_password") || "";
const $=s=>document.querySelector(s);
const login=$('#login'), panel=$('#panel'), loginMsg=$('#loginMsg');

async function api(url, options={}) {
  options.headers = options.headers || {};
  if (adminPassword) options.headers["x-admin-password"]=adminPassword;
  const r=await fetch(url, options);
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error || "İşlem başarısız.");
  return data;
}
async function check(){
  if(!adminPassword) return;
  try { await api("/api/products"); login.hidden=true; panel.hidden=false; load(); }
  catch { sessionStorage.removeItem("mobilyum_admin_password"); adminPassword=""; }
}
$("#loginBtn").onclick=async()=>{
  adminPassword=$("#password").value;
  try { await api("/api/products"); sessionStorage.setItem("mobilyum_admin_password",adminPassword); login.hidden=true; panel.hidden=false; load(); }
  catch(e){ loginMsg.textContent=e.message; adminPassword=""; }
};
$("#logoutBtn").onclick=()=>{sessionStorage.removeItem("mobilyum_admin_password");location.reload()};
$("#refreshBtn").onclick=load;

$("#productForm").onsubmit=async e=>{
  e.preventDefault();
  const msg=$("#formMsg"); msg.textContent="Kaydediliyor...";
  try{
    const fd=new FormData(e.target);
    await api("/api/products",{method:"POST",body:fd});
    e.target.reset(); msg.textContent="Ürün başarıyla eklendi."; load();
  }catch(err){msg.textContent=err.message}
};
async function load(){
  const items=await api("/api/products");
  const box=$("#products");
  if(!items.length){box.innerHTML="<p>Henüz yönetim panelinden ürün eklenmedi.</p>";return}
  box.innerHTML=items.map(p=>`<article class="item">
    <img src="${p.image}" alt="">
    <div class="item-body"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.category)} · ${escapeHtml(p.price)}</p>
    <button class="delete" data-id="${p.id}">Ürünü sil</button></div></article>`).join("");
  box.querySelectorAll(".delete").forEach(b=>b.onclick=async()=>{
    if(!confirm("Bu ürünü silmek istediğine emin misin?"))return;
    try{await api("/api/products/"+b.dataset.id,{method:"DELETE"});load()}catch(e){alert(e.message)}
  });
}
function escapeHtml(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
check();
