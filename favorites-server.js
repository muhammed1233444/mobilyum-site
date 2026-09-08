'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const COOKIE = 'mobilyum_favorites';
const YEAR = 365 * 24 * 60 * 60 * 1000;
const LIMIT = 200;

// Visitor lists use the existing volume and never write to the product database.
module.exports = function mountFavorites(app, { storageDir, readProducts, safeProductImage }) {
  const directory = path.join(storageDir, 'favorites');
  const attempts = new Map();
  const tokenFor = req => {
    const value = String(req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
    return /^[a-f0-9]{64}$/.test(value || '') ? value : '';
  };
  const fileFor = token => path.join(directory, crypto.createHash('sha256').update(token).digest('hex') + '.json');
  const load = token => {
    if (!token) return { version: 1, items: [] };
    try {
      const data = JSON.parse(fs.readFileSync(fileFor(token), 'utf8'));
      if (data.version !== 1 || !Array.isArray(data.items)) throw new Error('Invalid favorite record');
      return data.expiresAt < Date.now() ? { version: 1, items: [] } : data;
    } catch (error) {
      if (error.code === 'ENOENT') return { version: 1, items: [] };
      throw error;
    }
  };
  const snapshot = p => ({ id: String(p.id), name: String(p.name || 'Mobilyum modeli').slice(0, 180), category: String(p.category || 'Mobilya').slice(0, 80), image: safeProductImage(p) });
  const result = record => {
    const catalog = new Map(readProducts().map(p => [String(p.id), p]));
    return { items: record.items.map(saved => { const p = catalog.get(saved.id); return { ...(p ? snapshot(p) : saved), available: Boolean(p) }; }), limit: LIMIT };
  };
  const noCache = res => { res.set('Cache-Control', 'private, no-store'); res.set('X-Robots-Tag', 'noindex'); };
  app.get('/api/favorites', (req, res) => {
    noCache(res);
    try { res.json(result(load(tokenFor(req)))); }
    catch { res.status(503).json({ error: 'Beğendikleriniz şu anda okunamadı. Lütfen tekrar deneyin.' }); }
  });
  app.post('/api/favorites', (req, res) => {
    noCache(res);
    let sameOrigin = false;
    try { sameOrigin = new URL(req.get('origin')).origin === `${req.protocol}://${req.get('host')}`; } catch {}
    if (!sameOrigin || req.get('sec-fetch-site') === 'cross-site' || !req.is('application/json')) return res.status(403).json({ error: 'İsteği bu web sitesi üzerinden tekrar deneyin.' });
    const now = Date.now();
    if (attempts.size > 10000) attempts.clear();
    let attempt = attempts.get(req.ip);
    if (!attempt || now > attempt.until) attempt = { count: 0, until: now + 60000 };
    attempt.count++; attempts.set(req.ip, attempt);
    if (attempt.count > 120) return res.status(429).set('Retry-After', '60').json({ error: 'Çok hızlı işlem yapıldı. Bir dakika sonra tekrar deneyin.' });
    const { productId, saved } = req.body || {};
    if (typeof productId !== 'string' || !productId || productId.length > 180 || typeof saved !== 'boolean') return res.status(400).json({ error: 'Geçerli bir ürün seçin.' });
    try {
      const previousToken = tokenFor(req);
      const token = previousToken || crypto.randomBytes(32).toString('hex');
      const record = load(token);
      const p = saved ? readProducts().find(p => String(p.id) === productId) : null;
      if (saved && !p) return res.status(404).json({ error: 'Bu ürün artık katalogda bulunmuyor.' });
      const items = record.items.filter(item => item.id !== productId);
      if (saved && items.length >= LIMIT) return res.status(409).json({ error: 'En fazla 200 ürün beğenebilirsiniz. Önce listenizden bir ürün kaldırın.' });
      if (saved) items.push(snapshot(p));
      const next = { version: 1, items, updatedAt: now, expiresAt: now + YEAR };
      fs.mkdirSync(directory, { recursive: true });
      const file = fileFor(token), temporary = file + '.tmp';
      fs.writeFileSync(temporary, JSON.stringify(next), { mode: 0o600 });
      fs.renameSync(temporary, file);
      res.cookie(COOKIE, token, { httpOnly: true, secure: req.secure, sameSite: 'lax', path: '/', maxAge: YEAR });
      res.json({ ...result(next), newVisitor: !previousToken });
    } catch { res.status(503).json({ error: 'Beğendikleriniz kaydedilemedi. Mevcut listeniz korunuyor; lütfen tekrar deneyin.' }); }
  });
  // Retention cleanup runs outside page requests; recheck synchronously before deletion.
  const cleanup = setInterval(async () => {
    try {
      for (const name of await fs.promises.readdir(directory)) {
        if (!/^[a-f0-9]{64}\.json$/.test(name)) continue;
        const file = path.join(directory, name);
        if (fs.statSync(file).mtimeMs < Date.now() - YEAR) fs.unlinkSync(file);
      }
    } catch {}
  }, 24 * 60 * 60 * 1000);
  cleanup.unref();
};
