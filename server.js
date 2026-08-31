require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const UPLOAD_DIR = path.join(ROOT, "uploads");
const DATA_FILE = path.join(DATA_DIR, "products.json");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(ROOT));
app.use("/uploads", express.static(UPLOAD_DIR));

function readProducts() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return []; }
}
function writeProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf8");
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
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(5).toString("hex")}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Sadece JPG, PNG, WEBP veya GIF yükleyebilirsin."));
  }
});

app.get("/api/products", (_, res) => res.json(readProducts()));

app.post("/api/products", auth, upload.array("images", 12), (req, res) => {
  const { name, category, type, price, oldPrice, tag, description } = req.body;
  if (!name || !category) return res.status(400).json({ error: "Ürün adı ve kategori zorunlu." });
  if (!req.files || !req.files.length) return res.status(400).json({ error: "En az bir ürün fotoğrafı seç." });

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
    image: `/uploads/${req.files[0].filename}`,
    images: req.files.map(file => `/uploads/${file.filename}`),
    createdAt: new Date().toISOString()
  };
  products.unshift(product);
  writeProducts(products);
  res.json(product);
});

app.delete("/api/products/:id", auth, (req, res) => {
  const products = readProducts();
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Ürün bulunamadı." });
  const imageList = Array.isArray(product.images) && product.images.length ? product.images : (product.image ? [product.image] : []);
  imageList.forEach(src => {
    if (src && src.startsWith("/uploads/")) {
      const file = path.join(UPLOAD_DIR, path.basename(src));
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  });
  writeProducts(products.filter(p => p.id !== req.params.id));
  res.json({ ok: true });
});

app.put("/api/products/:id", auth, upload.array("images", 12), (req, res) => {
  const products = readProducts();
  const i = products.findIndex(p => p.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: "Ürün bulunamadı." });

  const old = products[i];
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
  if (req.files && req.files.length) {
    const oldImages = Array.isArray(old.images) && old.images.length ? old.images : (old.image ? [old.image] : []);
    oldImages.forEach(src => {
      if (src && src.startsWith("/uploads/")) {
        const oldFile = path.join(UPLOAD_DIR, path.basename(src));
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }
    });
    updated.image = `/uploads/${req.files[0].filename}`;
    updated.images = req.files.map(file => `/uploads/${file.filename}`);
  }
  products[i] = updated;
  writeProducts(products);
  res.json(updated);
});

app.get("/admin", (_, res) => res.sendFile(path.join(ROOT, "admin.html")));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || "Bir hata oluştu." });
});

app.listen(PORT, () => console.log(`Mobilyum sitesi: http://localhost:${PORT}`));
