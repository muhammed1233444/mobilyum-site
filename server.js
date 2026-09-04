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
const ROOT = __dirname;
const ASSET_DIR = path.join(ROOT, "assets");
const BUNDLED_UPLOAD_DIR = path.join(ROOT, "uploads");
const BUNDLED_DATA_FILE = path.join(ROOT, "data", "products.json");
const STORAGE_DIR = path.join(ROOT, "storage");
const DATA_DIR = path.join(STORAGE_DIR, "data");
const UPLOAD_DIR = path.join(STORAGE_DIR, "uploads");
const DATA_FILE = path.join(DATA_DIR, "products.json");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  if (fs.existsSync(BUNDLED_DATA_FILE)) fs.copyFileSync(BUNDLED_DATA_FILE, DATA_FILE);
  else fs.writeFileSync(DATA_FILE, "[]", "utf8");
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
app.get("/favicon.ico", sendPublicFile("favicon.ico", "public, max-age=604800"));
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
function auth(req, res, next) {
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: "ADMIN_PASSWORD ayarlanmamış." });
  const supplied = req.headers["x-admin-password"] || "";
  if (supplied !== ADMIN_PASSWORD) return res.status(401).json({ error: "Şifre yanlış." });
  next();
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

app.get("/api/products", (_, res) => { res.setHeader("Cache-Control", "no-store"); res.json(readProducts()); });
app.get("/api/admin/check", auth, (_, res) => res.json({ ok: true }));

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
