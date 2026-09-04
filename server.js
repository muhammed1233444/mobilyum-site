require("dotenv").config();
const express = require("express");
const compression = require("compression");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const GA_MEASUREMENT_ID = /^G-[A-Z0-9]+$/i.test(process.env.GA_MEASUREMENT_ID || "")
  ? process.env.GA_MEASUREMENT_ID.trim().toUpperCase()
  : "";
const ROOT = __dirname;
const ASSET_DIR = path.join(ROOT, "assets");
const BUNDLED_UPLOAD_DIR = path.join(ROOT, "uploads");
const BUNDLED_DATA_FILE = path.join(ROOT, "data", "products.json");
const STORAGE_DIR = path.join(ROOT, "storage");
const DATA_DIR = path.join(STORAGE_DIR, "data");
const UPLOAD_DIR = path.join(STORAGE_DIR, "uploads");
const DATA_FILE = path.join(DATA_DIR, "products.json");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json");
const SEO_PAGE_TEMPLATE = fs.readFileSync(path.join(ROOT, "seo-page.html"), "utf8");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  if (fs.existsSync(BUNDLED_DATA_FILE)) fs.copyFileSync(BUNDLED_DATA_FILE, DATA_FILE);
  else fs.writeFileSync(DATA_FILE, "[]", "utf8");
}
if (!fs.existsSync(ANALYTICS_FILE)) {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify({
    version: 1,
    totals: { visits: 0, pageViews: 0, whatsappClicks: 0, phoneClicks: 0, directionsClicks: 0, categoryClicks: 0 },
    byDay: {}, devices: { mobile: 0, desktop: 0 }, pages: {}, referrers: {}, updatedAt: null
  }, null, 2), "utf8");
}

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(compression({ threshold: 1024 }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production" && req.secure) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static(ASSET_DIR, { etag: true, lastModified: true, maxAge: "1y", immutable: true }));
app.use("/uploads", express.static(UPLOAD_DIR, { etag: true, lastModified: true, maxAge: "30d" }));
app.use("/uploads", express.static(BUNDLED_UPLOAD_DIR, { etag: true, lastModified: true, maxAge: "30d" }));

const sendPublicFile = (fileName, cacheControl = "no-cache") => (_, res) => {
  res.setHeader("Cache-Control", cacheControl);
  res.sendFile(path.join(ROOT, fileName));
};
app.get(["/", "/index.html"], sendPublicFile("index.html"));
app.get("/style.css", sendPublicFile("style.css", "public, max-age=604800"));
app.get("/script.js", sendPublicFile("script.js", "public, max-age=604800"));
app.get("/consent.js", sendPublicFile("consent.js", "public, max-age=604800"));
app.get("/favicon.ico", sendPublicFile("favicon.ico", "public, max-age=604800"));
app.get("/favicon.png", (_, res) => {
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.sendFile(path.join(ASSET_DIR, "favicon.png"));
});
app.get("/site-config.js", (_, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.type("application/javascript").send(`window.MOBILYUM_CONFIG=${JSON.stringify({ gaMeasurementId: GA_MEASUREMENT_ID })};`);
});
app.get("/site.webmanifest", sendPublicFile("site.webmanifest", "public, max-age=86400"));
app.get("/robots.txt", sendPublicFile("robots.txt", "public, max-age=3600"));
app.get("/sitemap.xml", sendPublicFile("sitemap.xml", "public, max-age=3600"));

function readProducts() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return []; }
}
function writeProducts(products) {
  // JSON'u atomik şekilde değiştir; yarım yazılmış dosya yüzünden ürün listesi bozulmasın.
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(products, null, 2), "utf8");
  fs.renameSync(tmp, DATA_FILE);
}

const SEO_PAGES = {
  "/yatak-odasi": {
    title: "Çorlu Yatak Odası Takımları | Mobilyum Çorlu",
    description: "Çorlu yatak odası takımları, gardırop, şifonyer ve karyola modellerini Mobilyum Çorlu'da inceleyin. Ölçü, renk ve fiyat bilgisi alın.",
    breadcrumb: "Yatak Odası Takımları",
    h1: "Çorlu <em>Yatak Odası Takımları</em>",
    lead: "Zarif, kullanışlı ve uzun ömürlü yatak odası modellerini yaşam alanınıza uygun ölçü ve renk seçenekleriyle keşfedin.",
    heroImage: "/assets/optimized/hero-yatak-featured.webp",
    imageAlt: "Mobilyum Çorlu yatak odası takımı modelleri",
    category: "Yatak Odaları",
    contentTitle: "Çorlu'da yatak odanızı birlikte tamamlayalım",
    paragraphs: [
      "Karyola, gardırop, şifonyer ve komodin parçalarını birbiriyle uyumlu şekilde seçin. Mobilyum Çorlu ekibi, odanızın ölçüsüne ve kullanım alışkanlıklarınıza uygun modeli belirlemenize yardımcı olur.",
      "Modern, sade ve zamansız çizgilere sahip yatak odası takımlarını mağazamızda yakından inceleyebilir; renk, malzeme, teslimat ve ödeme seçenekleri hakkında bilgi alabilirsiniz."
    ],
    bullets: ["Yatak odası takımları", "Gardırop ve şifonyer seçenekleri", "Karyola, komodin ve tamamlayıcı parçalar"]
  },
  "/koltuk-takimlari": {
    title: "Çorlu Koltuk Takımları | Mobilyum Çorlu",
    description: "Çorlu koltuk takımları ve oturma grubu modellerini Mobilyum Çorlu'da keşfedin. Salonunuza uygun renk, kumaş ve ölçü seçeneklerini inceleyin.",
    breadcrumb: "Koltuk Takımları",
    h1: "Çorlu <em>Koltuk Takımları</em>",
    lead: "Konforu modern tasarımla buluşturan koltuk takımlarıyla salonunuzun karakterini birlikte oluşturalım.",
    heroImage: "/assets/optimized/category-oturma.webp",
    imageAlt: "Mobilyum Çorlu koltuk takımları ve oturma grupları",
    category: "Oturma Grupları",
    contentTitle: "Salonunuza uygun koltuk takımını seçin",
    paragraphs: [
      "Günlük kullanım konforunu, salonunuzun ölçüsünü ve dekorasyon tarzını birlikte değerlendirin. Mobilyum Çorlu'daki koltuk takımlarını kumaş, renk ve oturum özellikleriyle karşılaştırabilirsiniz.",
      "Klasik, modern veya sade bir görünüm arıyorsanız mağazamızdaki oturma gruplarını yakından deneyebilir; fiyat ve teslimat bilgilerini ekibimizden öğrenebilirsiniz."
    ],
    bullets: ["Koltuk takımları", "Oturma grupları", "Farklı kumaş ve renk seçenekleri"]
  },
  "/yemek-odasi": {
    title: "Çorlu Yemek Odası Takımları | Mobilyum Çorlu",
    description: "Çorlu yemek odası takımları, masa, sandalye ve konsol modellerini Mobilyum Çorlu'da inceleyin. Evinize uygun takımı birlikte seçelim.",
    breadcrumb: "Yemek Odası Takımları",
    h1: "Çorlu <em>Yemek Odası Takımları</em>",
    lead: "Sofranızı tamamlayan masa, sandalye ve konsol seçeneklerini uyumlu takımlar hâlinde inceleyin.",
    heroImage: "/assets/optimized/category-yemek.webp",
    imageAlt: "Mobilyum Çorlu yemek odası takımı modelleri",
    category: "Yemek Odaları",
    contentTitle: "Sofranız için şık ve kullanışlı çözümler",
    paragraphs: [
      "Yemek odası seçiminde masa ölçüsü, sandalye konforu ve depolama ihtiyacını birlikte düşünmek gerekir. Mobilyum Çorlu'da bu parçaları uyumlu bir bütün olarak inceleyebilirsiniz.",
      "Salonunuza veya ayrı yemek alanınıza uygun modeller için mağazamızı ziyaret edin; ölçü, renk, fiyat ve teslimat detaylarını ekibimizle değerlendirin."
    ],
    bullets: ["Yemek masası ve sandalye", "Konsol ve ayna seçenekleri", "Uyumlu yemek odası takımları"]
  },
  "/genc-odasi": {
    title: "Çorlu Genç Odası Takımları | Mobilyum Çorlu",
    description: "Çorlu genç odası takımları, çalışma masası, gardırop ve yatak modellerini Mobilyum Çorlu'da keşfedin. Kullanışlı ve modern seçenekleri görün.",
    breadcrumb: "Genç Odası Takımları",
    h1: "Çorlu <em>Genç Odası Takımları</em>",
    lead: "Uyku, çalışma ve depolama ihtiyaçlarını aynı odada düzenli biçimde karşılayan genç odası modellerini keşfedin.",
    heroImage: "/assets/optimized/category-genc.webp",
    imageAlt: "Mobilyum Çorlu genç odası takımı modelleri",
    category: "Genç Odaları",
    contentTitle: "Gençler için düzenli ve kişisel yaşam alanları",
    paragraphs: [
      "Genç odalarında doğru yerleşim, yeterli depolama ve rahat bir çalışma alanı önemlidir. Mobilyum Çorlu'daki takımları odanın ölçüsüne ve kullanıcının ihtiyaçlarına göre değerlendirebilirsiniz.",
      "Yatak, dolap, çalışma masası ve tamamlayıcı parçaları mağazamızda yakından inceleyerek uygun kombinasyonu birlikte oluşturabiliriz."
    ],
    bullets: ["Genç odası takımları", "Çalışma masası ve kitaplık", "Yatak ve gardırop seçenekleri"]
  },
  "/dugun-paketi": {
    title: "Çorlu Düğün Paketi Mobilya | Mobilyum Çorlu",
    description: "Çorlu düğün paketi seçenekleriyle yatak odası, koltuk takımı ve yemek odasını birlikte seçin. Mobilyum Çorlu'dan fiyat ve içerik bilgisi alın.",
    breadcrumb: "Düğün Paketi",
    h1: "Çorlu <em>Düğün Paketi</em>",
    lead: "Yeni eviniz için yatak odası, koltuk takımı ve yemek odası seçeneklerini tek pakette birlikte değerlendirin.",
    heroImage: "/assets/optimized/dugun-paketi.webp",
    imageAlt: "Mobilyum Çorlu düğün paketi mobilya seçenekleri",
    pageClass: "seo-page-wedding",
    contentTitle: "Yeni eviniz için uyumlu mobilya paketi",
    paragraphs: [
      "Düğün paketi seçiminde yalnızca fiyatı değil; parçaların evinizdeki ölçülere, kullanım ihtiyaçlarınıza ve tarzınıza uyumunu da birlikte değerlendiriyoruz.",
      "Paket içeriği, güncel modeller, ödeme ve teslimat seçenekleri için Mobilyum Çorlu mağazamızı ziyaret edebilir veya WhatsApp üzerinden ekibimize ulaşabilirsiniz."
    ],
    bullets: ["Yatak odası takımı", "Koltuk takımı", "Yemek odası takımı"]
  },
  "/hakkimizda": {
    title: "Hakkımızda | 36 Yıllık Deneyim | Mobilyum Çorlu",
    description: "Mobilyum Çorlu, 36 yıllık mobilya deneyimini modern tasarım ve özenli hizmet anlayışıyla Çorlu'daki müşterileriyle buluşturur.",
    breadcrumb: "Hakkımızda",
    h1: "Mobilya bizim <em>işimiz.</em>",
    lead: "36 yıllık sektör deneyimimizi, evinize uzun yıllar eşlik edecek doğru mobilyayı bulmanıza yardımcı olmak için kullanıyoruz.",
    heroImage: "/assets/optimized/about-mobilyum.webp",
    imageAlt: "Mobilyum Çorlu 36 yıllık mobilya deneyimi",
    pageClass: "seo-page-logo",
    contentTitle: "Çorlu'da güvene dayanan mobilya deneyimi",
    paragraphs: [
      "Mobilyum olarak amacımız yalnızca ürün sunmak değil; ölçünüze, zevkinize ve yaşam biçiminize uygun seçimi birlikte yapmaktır.",
      "Yatak odası, koltuk takımı, yemek odası, genç odası ve düğün paketi seçeneklerini Çorlu mağazamızda yakından inceleyebilir, deneyimli ekibimizden destek alabilirsiniz."
    ],
    bullets: ["36 yıllık sektör deneyimi", "Çorlu'da yerel mağaza", "Satış öncesi ve sonrası özenli destek"]
  },
  "/iletisim": {
    title: "Mobilyum Çorlu İletişim, Adres ve Yol Tarifi",
    description: "Mobilyum Çorlu adres, telefon, WhatsApp ve yol tarifi bilgileri. Reşadiye Mahallesi, Şht. Teğmen Yavuzer Caddesi No:53 Çorlu.",
    breadcrumb: "İletişim",
    h1: "Mobilyum Çorlu <em>İletişim</em>",
    lead: "Mağazamızı ziyaret edin, ürünleri yakından görün ve eviniz için doğru mobilyayı ekibimizle birlikte seçin.",
    heroImage: "/assets/optimized/store.webp",
    imageAlt: "Mobilyum Çorlu mobilya mağazası",
    contentTitle: "Mağaza bilgileri",
    paragraphs: ["Reşadiye Mah. Şht. Teğmen Yavuzer Cad. No:53, 59850 Çorlu / Tekirdağ", "Telefon ve WhatsApp: 0544 650 44 59"],
    bullets: ["WhatsApp üzerinden hızlı bilgi", "Telefonla doğrudan iletişim", "Google Haritalar ile yol tarifi"]
  },
  "/cerez-politikasi": {
    title: "Çerez Politikası | Mobilyum Çorlu",
    description: "Mobilyum Çorlu web sitesinde kullanılan gerekli ve isteğe bağlı analiz teknolojileri hakkında bilgi edinin ve tercihlerinizi yönetin.",
    breadcrumb: "Çerez Politikası",
    h1: "Çerez <em>Politikası</em>",
    lead: "Web sitemizde kullanılan gerekli kayıtlar ve isteğe bağlı analiz teknolojileri hakkında açık bilgiler.",
    heroImage: "/assets/optimized/about-mobilyum.webp",
    imageAlt: "Mobilyum Çorlu çerez politikası",
    pageClass: "seo-page-logo",
    robots: "noindex, follow",
    policy: "cookie"
  },
  "/gizlilik-politikasi": {
    title: "Gizlilik ve KVKK Aydınlatması | Mobilyum Çorlu",
    description: "Mobilyum Çorlu web sitesi gizlilik ve kişisel verilerin korunması bilgilendirmesi.",
    breadcrumb: "Gizlilik ve KVKK",
    h1: "Gizlilik ve <em>KVKK</em>",
    lead: "Web sitemizi ziyaret ederken gizliliğinizi nasıl koruduğumuzu ve hangi bilgilerin işlendiğini öğrenin.",
    heroImage: "/assets/optimized/about-mobilyum.webp",
    imageAlt: "Mobilyum Çorlu gizlilik ve KVKK bilgilendirmesi",
    pageClass: "seo-page-logo",
    robots: "noindex, follow",
    policy: "privacy"
  }
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function safeProductImage(product) {
  const image = (Array.isArray(product.images) && product.images[0]) || product.image || "";
  return /^\/(assets|uploads)\/[A-Za-z0-9._~!$&'()*+,;=:@%/-]+$/.test(image) ? image : "/assets/optimized/mobilyum-corlu-og.jpg";
}

function renderSeoProducts(category) {
  const products = readProducts().filter(product => product.category === category);
  const cards = products.map((product, index) => {
    const name = escapeHtml(product.name || "Mobilyum modeli");
    const description = escapeHtml(product.description || "Ölçü, renk ve teslimat bilgisi için ekibimize ulaşın.");
    const price = escapeHtml(product.price || "Fiyat için bilgi alın");
    const image = escapeHtml(safeProductImage(product));
    const message = encodeURIComponent(`Merhaba Mobilyum, ${product.name || "bu ürün"} hakkında bilgi almak istiyorum.`);
    return `<article class="product-card seo-product-card" id="model-${index + 1}"><div class="product-image"><img src="${image}" loading="lazy" decoding="async" width="900" height="700" alt="${name} - Mobilyum Çorlu"></div><div class="product-info"><p>${escapeHtml(product.type || category)}</p><h2>${name}</h2><span>${price}</span><small class="managed-desc">${description}</small><a class="product-btn" href="https://wa.me/905446504459?text=${message}" target="_blank" rel="noopener noreferrer">WhatsApp'tan bilgi al ↗</a></div></article>`;
  }).join("");
  return {
    products,
    html: `<section class="seo-product-section" aria-labelledby="models-title"><div class="seo-section-heading"><p class="eyebrow">GÜNCEL MODELLER</p><h2 id="models-title">Koleksiyondaki <em>ürünler.</em></h2></div><div class="seo-products-grid">${cards || '<div class="seo-empty"><strong>Yeni modeller hazırlanıyor.</strong><p>Güncel seçenekleri öğrenmek için WhatsApp üzerinden bize ulaşabilirsiniz.</p></div>'}</div></section>`
  };
}

function renderPolicyBody(type) {
  if (type === "cookie") return `<section class="policy-content"><h2>Kullandığımız teknolojiler</h2><p><strong>Gerekli kayıtlar:</strong> Güvenlik, yönetim paneli oturumu ve ziyaretçinin çerez tercihini hatırlamak için kullanılır. Bunlar sitenin temel çalışması için gereklidir.</p><p><strong>İsteğe bağlı analiz:</strong> Yalnızca ziyaretçi izin verdiğinde; sayfa görüntüleme, yaklaşık oturum sayısı, mobil veya masaüstü cihaz türü, yönlendiren site ve WhatsApp, telefon ya da yol tarifi tıklamaları toplu istatistik olarak kaydedilir.</p><p>Analiz kayıtlarında ziyaretçinin adı, telefon numarası, mesaj içeriği veya kalıcı cihaz kimliği tutulmaz. Google Analytics ölçüm kimliği etkinleştirilirse Google Analytics de yalnızca analiz izni sonrasında yüklenir.</p><h2>Tercihinizi değiştirme</h2><p>Sayfanın sol altındaki “Çerez ayarları” düğmesini kullanarak analiz izninizi dilediğiniz zaman geri çekebilir veya yeniden verebilirsiniz. Tercih kaydı tarayıcınızın yerel depolama alanında tutulur.</p><h2>İletişim</h2><p>Çerez kullanımıyla ilgili sorularınız için 0544 650 44 59 numarasından Mobilyum Çorlu'ya ulaşabilirsiniz.</p></section>`;
  return `<section class="policy-content"><h2>Veri sorumlusu ve iletişim</h2><p>Bu web sitesi bakımından veri sorumlusu Mobilyum Çorlu'dur. Adres: Reşadiye Mah. Şht. Teğmen Yavuzer Cad. No:53, 59850 Çorlu / Tekirdağ. Telefon: 0544 650 44 59.</p><h2>İşlenen bilgiler ve amaç</h2><p>Site performansını ve ilgi gören koleksiyonları anlamak amacıyla, yalnızca onay vermeniz hâlinde anonimleştirilmiş/toplu ziyaret istatistikleri işlenir. WhatsApp veya telefon bağlantısına tıkladığınızda görüşme ilgili uygulamada gerçekleşir; mesaj içeriğiniz bu web sitesindeki analiz sistemine kaydedilmez.</p><h2>Hukuki sebep ve tercihleriniz</h2><p>İsteğe bağlı analiz faaliyeti açık tercihinize dayanır. Onay vermemek sitenin ürünlerini incelemenizi veya iletişim bağlantılarını kullanmanızı engellemez. Tercihinizi çerez ayarlarından dilediğiniz zaman değiştirebilirsiniz.</p><h2>Haklarınız</h2><p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki talepleriniz için kimliğinizi doğrulayacak bilgilerle mağazamıza başvurabilir veya 0544 650 44 59 numarasından iletişime geçebilirsiniz.</p></section>`;
}

function renderSeoPageBody(page) {
  if (page.policy) return { html: renderPolicyBody(page.policy), products: [] };
  const productSection = page.category ? renderSeoProducts(page.category) : { html: "", products: [] };
  const list = page.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("");
  const paragraphs = page.paragraphs.map(item => `<p>${escapeHtml(item)}</p>`).join("");
  const directions = page.breadcrumb === "İletişim" ? '<a class="btn btn-dark seo-directions" href="https://www.google.com/maps/dir/?api=1&destination=41.1560299%2C27.7987692" target="_blank" rel="noopener noreferrer">Yol tarifi al ↗</a>' : "";
  const backgroundCopy = `<section class="seo-copy-grid"><div><p class="eyebrow">36 YILLIK DENEYİM</p><h2>${escapeHtml(page.contentTitle)}</h2>${directions}</div><div>${paragraphs}<ul>${list}</ul></div></section>`;

  if (page.category) {
    return {
      products: productSection.products,
      html: `${productSection.html}<details class="seo-background-copy"><summary>Koleksiyon hakkında bilgi</summary>${backgroundCopy}</details>`
    };
  }

  return {
    products: productSection.products,
    html: `${backgroundCopy}${productSection.html}`
  };
}

function renderSeoPage(req, res) {
  const page = SEO_PAGES[req.path];
  if (!page) return res.status(404).send("Sayfa bulunamadı.");
  const canonical = `https://mobilyumcorlu.com${req.path}`;
  const rendered = renderSeoPageBody(page);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "FurnitureStore", "@id": "https://mobilyumcorlu.com/#store", name: "Mobilyum Çorlu", url: "https://mobilyumcorlu.com/", telephone: "+90 544 650 44 59", logo: { "@type": "ImageObject", url: "https://mobilyumcorlu.com/favicon.png", width: 512, height: 512 }, address: { "@type": "PostalAddress", streetAddress: "Reşadiye Mah. Şht. Teğmen Yavuzer Cad. No:53", addressLocality: "Çorlu", addressRegion: "Tekirdağ", postalCode: "59850", addressCountry: "TR" } },
      { "@type": page.category ? "CollectionPage" : "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: page.title, description: page.description, inLanguage: "tr-TR", about: { "@id": "https://mobilyumcorlu.com/#store" }, primaryImageOfPage: { "@type": "ImageObject", url: `https://mobilyumcorlu.com${page.heroImage}` } },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://mobilyumcorlu.com/" }, { "@type": "ListItem", position: 2, name: page.breadcrumb, item: canonical }] }
    ]
  };
  if (rendered.products.length) {
    jsonLd["@graph"].push({ "@type": "ItemList", name: `${page.breadcrumb} modelleri`, itemListElement: rendered.products.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: String(product.name || "Mobilyum modeli"), url: `${canonical}#model-${index + 1}` })) });
  }
  const replacements = {
    TITLE: escapeHtml(page.title), DESCRIPTION: escapeHtml(page.description), ROBOTS: page.robots || "index, follow, max-image-preview:large",
    CANONICAL: canonical, OG_IMAGE: `https://mobilyumcorlu.com${page.heroImage}`, HERO_IMAGE: page.heroImage,
    BREADCRUMB: escapeHtml(page.breadcrumb), H1: page.h1, LEAD: escapeHtml(page.lead), IMAGE_ALT: escapeHtml(page.imageAlt), PAGE_CLASS: escapeHtml(page.pageClass || (page.category ? "seo-page-category" : "")),
    WHATSAPP_TEXT: encodeURIComponent(`Merhaba Mobilyum, ${page.breadcrumb} hakkında bilgi almak istiyorum.`), BODY: rendered.html, JSON_LD: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
  };
  const html = SEO_PAGE_TEMPLATE.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => replacements[key] ?? "");
  res.setHeader("Cache-Control", "no-cache");
  res.send(html);
}

function auth(req, res, next) {
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: "ADMIN_PASSWORD ayarlanmamış." });
  const supplied = req.headers["x-admin-password"] || "";
  if (supplied !== ADMIN_PASSWORD) return res.status(401).json({ error: "Şifre yanlış." });
  next();
}

function readAnalytics() {
  try { return JSON.parse(fs.readFileSync(ANALYTICS_FILE, "utf8")); }
  catch {
    return { version: 1, totals: { visits: 0, pageViews: 0, whatsappClicks: 0, phoneClicks: 0, directionsClicks: 0, categoryClicks: 0 }, byDay: {}, devices: { mobile: 0, desktop: 0 }, pages: {}, referrers: {}, updatedAt: null };
  }
}

function writeAnalytics(analytics) {
  const tmp = ANALYTICS_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(analytics, null, 2), "utf8");
  fs.renameSync(tmp, ANALYTICS_FILE);
}

function istanbulDay() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function keepTopCounts(record, limit = 60) {
  return Object.fromEntries(Object.entries(record || {}).sort((a, b) => b[1] - a[1]).slice(0, limit));
}

const analyticsRateLimits = new Map();
function analyticsRateAllowed(req) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const current = analyticsRateLimits.get(key);
  if (!current || now - current.startedAt > 60000) {
    analyticsRateLimits.set(key, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= 120;
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const ext = ({ "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" })[file.mimetype] || ".img";
    cb(null, `${Date.now()}-${crypto.randomBytes(5).toString("hex")}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 12, parts: 24 },
  fileFilter: (_, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Sadece JPG, PNG, WEBP veya GIF yükleyebilirsin."));
  }
});

function safeUnlink(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return;
  try { fs.unlinkSync(filePath); } catch {}
}

async function optimizeUploadedFiles(files) {
  const optimized = [];
  try {
    for (const file of files) {
      if (file.mimetype === "image/gif") {
        optimized.push(file);
        continue;
      }
      const filename = `${path.parse(file.filename).name}-optimized.webp`;
      const outputPath = path.join(UPLOAD_DIR, filename);
      const info = await sharp(file.path)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(outputPath);
      optimized.push({ ...file, filename, path: outputPath, mimetype: "image/webp", size: info.size });
    }
    files.forEach(file => {
      if (!optimized.some(item => item.path === file.path)) safeUnlink(file.path);
    });
    return optimized;
  } catch (error) {
    optimized.forEach(file => {
      if (!files.some(original => original.path === file.path)) safeUnlink(file.path);
    });
    files.forEach(file => safeUnlink(file.path));
    throw error;
  }
}

app.get(Object.keys(SEO_PAGES), renderSeoPage);

app.post("/api/analytics/event", (req, res) => {
  if (!analyticsRateAllowed(req)) return res.status(429).end();
  const allowedEvents = new Set(["session_start", "page_view", "whatsapp_click", "phone_click", "directions_click", "category_click"]);
  const event = String(req.body?.event || "");
  if (!allowedEvents.has(event)) return res.status(400).json({ error: "Geçersiz analiz olayı." });
  const page = String(req.body?.page || "/").slice(0, 100).replace(/[^a-zA-Z0-9/_-]/g, "") || "/";
  const device = req.body?.device === "mobile" ? "mobile" : "desktop";
  const referrer = String(req.body?.referrer || "Doğrudan").slice(0, 80).replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ._ -]/g, "") || "Diğer";
  const analytics = readAnalytics();
  const totalKey = ({ session_start: "visits", page_view: "pageViews", whatsapp_click: "whatsappClicks", phone_click: "phoneClicks", directions_click: "directionsClicks", category_click: "categoryClicks" })[event];
  analytics.totals[totalKey] = Number(analytics.totals[totalKey] || 0) + 1;
  const day = istanbulDay();
  analytics.byDay[day] = analytics.byDay[day] || { visits: 0, pageViews: 0, whatsappClicks: 0, phoneClicks: 0, directionsClicks: 0, categoryClicks: 0 };
  analytics.byDay[day][totalKey] = Number(analytics.byDay[day][totalKey] || 0) + 1;
  if (event === "page_view") {
    analytics.devices[device] = Number(analytics.devices[device] || 0) + 1;
    analytics.pages[page] = Number(analytics.pages[page] || 0) + 1;
    analytics.referrers[referrer] = Number(analytics.referrers[referrer] || 0) + 1;
  }
  analytics.pages = keepTopCounts(analytics.pages);
  analytics.referrers = keepTopCounts(analytics.referrers);
  analytics.byDay = Object.fromEntries(Object.entries(analytics.byDay).sort(([a], [b]) => a.localeCompare(b)).slice(-120));
  analytics.updatedAt = new Date().toISOString();
  writeAnalytics(analytics);
  res.status(204).end();
});

app.get("/api/products", (_, res) => { res.setHeader("Cache-Control", "no-store"); res.json(readProducts()); });
app.get("/api/admin/check", auth, (_, res) => res.json({ ok: true }));
app.get("/api/admin/analytics", auth, (_, res) => { res.setHeader("Cache-Control", "no-store"); res.json(readAnalytics()); });

app.post("/api/products", auth, upload.array("images", 12), async (req, res) => {
  let files = req.files || [];
  const cleanup = () => files.forEach(file => safeUnlink(file?.path));
  try {
    const { name, category, type, price, oldPrice, tag, description } = req.body;
    if (!name || !category) { cleanup(); return res.status(400).json({ error: "Ürün adı ve kategori zorunlu." }); }
    if (!files.length) return res.status(400).json({ error: "En az bir ürün fotoğrafı seç." });
    if (files.some(file => !file.filename)) { cleanup(); return res.status(400).json({ error: "Fotoğraf yükleme başarısız." }); }
    files = await optimizeUploadedFiles(files);

    const products = readProducts();
    const product = {
    id: crypto.randomUUID(),
    name: name.trim(),
    category: category.trim(),
    type: (type || "Mobilya").trim(),
    price: (price || "Fiyat için bilgi alın").trim(),
    oldPrice: (oldPrice || "").trim(),
    tag: (tag || "").trim(),
    description: (description || "").trim(),
    image: `/uploads/${files[0].filename}`,
    images: files.map(file => `/uploads/${file.filename}`),
    createdAt: new Date().toISOString()
  };
    products.unshift(product);
    writeProducts(products);
    res.json(product);
  } catch (err) {
    cleanup();
    console.error("Ürün kaydetme hatası:", err);
    res.status(500).json({ error: "Ürün kaydedilemedi. Sunucu depolama alanını kontrol et." });
  }
});

app.delete("/api/products/:id", auth, (req, res) => {
  const products = readProducts();
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Ürün bulunamadı." });
  const productImages = Array.isArray(product.images) && product.images.length
    ? product.images
    : (product.image ? [product.image] : []);
  productImages.forEach(image => {
    if (image && image.startsWith("/uploads/")) {
      const file = path.join(UPLOAD_DIR, path.basename(image));
      safeUnlink(file);
    }
  });
  writeProducts(products.filter(p => p.id !== req.params.id));
  res.json({ ok: true });
});

app.put("/api/products/:id", auth, upload.array("images", 12), async (req, res) => {
  let newFiles = req.files || [];
  const cleanupNew = () => newFiles.forEach(file => safeUnlink(file?.path));
  try {
    const products = readProducts();
    const i = products.findIndex(p => p.id === req.params.id);
    if (i < 0) { cleanupNew(); return res.status(404).json({ error: "Ürün bulunamadı." }); }

    const old = products[i];
    const oldImages = Array.isArray(old.images) && old.images.length ? old.images : (old.image ? [old.image] : []);
    const updated = {
      ...old,
      name: (req.body.name || old.name).trim(),
      category: (req.body.category || old.category).trim(),
      type: (req.body.type || old.type).trim(),
      price: (req.body.price || old.price).trim(),
      oldPrice: (req.body.oldPrice || "").trim(),
      tag: (req.body.tag || "").trim(),
      description: (req.body.description || "").trim()
    };
    if (newFiles.length) {
      newFiles = await optimizeUploadedFiles(newFiles);
      updated.image = `/uploads/${newFiles[0].filename}`;
      updated.images = newFiles.map(file => `/uploads/${file.filename}`);
    }
    products[i] = updated;
    writeProducts(products);
    if (newFiles.length) oldImages.forEach(image => {
      if (image?.startsWith("/uploads/")) safeUnlink(path.join(UPLOAD_DIR, path.basename(image)));
    });
    res.json(updated);
  } catch (err) {
    cleanupNew();
    console.error("Ürün güncelleme hatası:", err);
    res.status(500).json({ error: "Ürün güncellenemedi. Fotoğrafları kontrol edip tekrar dene." });
  }
});

app.get(["/admin", "/admin.html"], sendPublicFile("admin.html", "no-store"));
app.get("/admin.css", sendPublicFile("admin.css", "no-store"));
app.get("/admin.js", sendPublicFile("admin.js", "no-store"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || "Bir hata oluştu." });
});

app.listen(PORT, () => console.log(`Mobilyum sitesi: http://localhost:${PORT}`));
