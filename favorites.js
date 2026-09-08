(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root?.document) api.mount(root);
})(typeof window === 'undefined' ? null : window, function () {
  'use strict';
  const heart = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const productUrl = item => '/urun/' + encodeURIComponent(item.id);
  function buttonHtml(product, compact = false, saved = false) {
    return `<button type="button" class="favorite-toggle${compact ? ' favorite-toggle-compact' : ''}" data-favorite-id="${escape(product.id)}" data-favorite-name="${escape(product.name || 'Bu ürün')}" aria-pressed="${saved}" aria-label="${escape(product.name || 'Bu ürün')}: beğenilenlere ${saved ? 'eklendi, kaldır' : 'ekle'}">${heart}<span data-favorite-label>${saved ? 'Beğenildi' : 'Beğen'}</span></button>`;
  }
  function quoteMessage(items) {
    return 'Merhaba Mobilyum Çorlu, beğendiğim şu ürünler için toplu fiyat almak istiyorum:\n\n' + items.map((p, i) => `${i + 1}. ${p.name}\nhttps://mobilyumcorlu.com${productUrl(p)}`).join('\n\n') + '\n\nToplam fiyat, elden taksit imkânı ve teslimat koşulları hakkında bilgi verebilir misiniz?';
  }
  function quoteGroups(items, maxEncodedLength = 6500) {
    const groups = []; let current = [];
    for (const item of items) {
      const candidate = [...current, item];
      if (current.length && encodeURIComponent(quoteMessage(candidate)).length > maxEncodedLength) { groups.push(current); current = [item]; } else current = candidate;
    }
    if (current.length) groups.push(current);
    return groups;
  }
  function mount(win) {
    const doc = win.document;
    let items = [], loaded = false, pending = Promise.resolve(), noticeTimer;
    const excluded = new Set();
    const root = doc.querySelector('[data-favorites-page]');
    const list = root?.querySelector('[data-favorites-list]');
    const summary = root?.querySelector('[data-favorites-summary]');
    const notice = doc.createElement('p');
    notice.className = 'favorites-notice'; notice.setAttribute('role', 'status'); notice.hidden = true; doc.body.append(notice);
    const announce = (message, error = false) => {
      win.clearTimeout(noticeTimer); notice.textContent = message; notice.hidden = false; notice.classList.toggle('is-error', error);
      noticeTimer = win.setTimeout(() => { notice.hidden = true; }, error ? 10000 : 4000);
    };
    function sync(scope = doc) {
      const ids = new Set(items.map(p => p.id));
      scope.querySelectorAll('[data-favorite-id]').forEach(button => {
        const active = ids.has(button.dataset.favoriteId); button.hidden = false;
        button.setAttribute('aria-pressed', String(active));
        button.setAttribute('aria-label', `${button.dataset.favoriteName || 'Bu ürün'}: beğenilenlere ${active ? 'eklendi, kaldır' : 'ekle'}`);
        const label = button.querySelector('[data-favorite-label]'); if (label) label.textContent = active ? 'Beğenildi' : 'Beğen';
      });
      doc.querySelectorAll('[data-favorites-count]').forEach(node => { node.textContent = items.length; });
      doc.querySelectorAll('[data-favorites-link]').forEach(node => node.setAttribute('aria-label', `Beğendiklerim, ${items.length} ürün`));
    }
    const selectedItems = () => items.filter(p => p.available !== false && !excluded.has(p.id));
    function renderSummary() {
      if (!summary) return;
      const selected = selectedItems(), groups = quoteGroups(selected);
      summary.innerHTML = `<p class="eyebrow">SİZE ÖZEL TEKLİF</p><h2>Birlikte seçin,<br><em>toplu fiyat alın.</em></h2><p>${selected.length} ürün seçili</p><div class="favorites-quote-actions">${groups.length ? groups.map((group, i) => `<a class="favorites-quote" href="https://wa.me/905446504459?text=${encodeURIComponent(quoteMessage(group))}" target="_blank" rel="noopener noreferrer">${groups.length > 1 ? `${i + 1}. grubu WhatsApp'tan sor (${group.length} ürün)` : "WhatsApp'tan toplu fiyat al"} ↗</a>`).join('') : '<button class="favorites-quote" type="button" disabled>Fiyat için ürün seçin</button>'}</div>${groups.length > 1 ? '<p class="favorites-help">Uzun listeniz mesaj sınırına takılmaması için gruplara ayrıldı. Tüm ürünleri iletmek için her grubu ayrı gönderin.</p>' : ''}<p class="installment-note"><strong>Elden taksit imkânı</strong><span>Vade ve ödeme koşullarını mağazamızdan öğrenebilirsiniz.</span></p><p class="favorites-help">Mesajınız ürün adları ve bağlantılarıyla hazırlanır. Göndermeden önce WhatsApp'ta kontrol edebilirsiniz. Bu işlem sipariş oluşturmaz.</p>`;
      const all = root.querySelector('[data-favorites-all]');
      if (all) { const available = items.filter(p => p.available !== false).length; all.checked = available > 0 && selected.length === available; all.indeterminate = selected.length > 0 && selected.length < available; all.disabled = !available; }
    }
    function renderList() {
      if (!list) return;
      root.querySelector('[data-favorites-total]').textContent = `${items.length} beğenilen ürün`;
      root.querySelector('[data-favorites-toolbar]').hidden = !items.length;
      list.innerHTML = items.length ? items.map(p => {
        const available = p.available !== false;
        const image = /^\/(assets|uploads)\/[A-Za-z0-9._~!$&'()*+,;=:@%/-]+$/.test(p.image || '') ? p.image : '/assets/optimized/mobilyum-corlu-og.jpg';
        return `<article class="favorite-item"><label class="favorite-select"><input type="checkbox" data-favorite-select="${escape(p.id)}" aria-label="${escape(p.name)} ürününü fiyat isteğine dahil et" ${available && !excluded.has(p.id) ? 'checked' : ''} ${available ? '' : 'disabled'}></label>${available ? `<a class="favorite-item-image" href="${productUrl(p)}" aria-label="${escape(p.name)} ürününü incele">` : '<div class="favorite-item-image">'}<img src="${escape(image)}" width="104" height="104" loading="lazy" decoding="async" alt="${escape(p.name)}">${available ? '</a>' : '</div>'}<div class="favorite-item-copy"><p>${escape(p.category)}</p><h2>${available ? `<a href="${productUrl(p)}">${escape(p.name)}</a>` : escape(p.name)}</h2>${available ? '' : '<p class="favorite-unavailable">Bu ürün artık katalogda görünmüyor; fiyat isteğine eklenmez.</p>'}<button type="button" class="favorite-remove" data-favorite-remove="${escape(p.id)}" aria-label="${escape(p.name)} ürününü beğendiklerimden kaldır">Kaldır</button></div></article>`;
      }).join('') : '<div class="favorites-empty"><span aria-hidden="true">' + heart + '</span><h2>İçinize sinenleri biriktirin.</h2><p>Ürünlerdeki kalbe dokunun; beğendikleriniz burada bir araya gelsin.</p><a class="favorites-quote" href="/#koleksiyonlar">Koleksiyonları keşfet</a></div>';
      renderSummary();
    }
    async function request(options) {
      const controller = new AbortController(), timer = win.setTimeout(() => controller.abort(), 12000);
      try {
        const res = await win.fetch('/api/favorites', { credentials: 'same-origin', cache: 'no-store', ...options, signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Listeye ulaşılamadı. Lütfen tekrar deneyin.');
        if (!Array.isArray(data.items)) throw new Error('Liste okunamadı. Lütfen tekrar deneyin.');
        return data;
      } finally { win.clearTimeout(timer); }
    }
    function accept(data) {
      items = data.items; loaded = true; sync(); renderList();
      const status = root?.querySelector('[data-favorites-status]'); if (status) { status.hidden = true; status.textContent = ''; }
    }
    function queue(work) { pending = pending.then(work).catch(error => announce(error.name === 'AbortError' ? 'Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.' : error.message, true)); return pending; }
    function refresh() {
      return queue(async () => {
        try { accept(await request()); } catch (error) {
          const status = root?.querySelector('[data-favorites-status]');
          if (status) { status.hidden = false; status.innerHTML = '<p>Beğendikleriniz yüklenemedi. Kayıtlarınız silinmedi.</p><button class="favorite-retry" type="button" data-favorites-retry>Tekrar dene</button>'; }
          if (!loaded && root) { list.innerHTML = ''; summary.innerHTML = ''; }
          throw error;
        }
      });
    }
    let channel;
    try { channel = new win.BroadcastChannel('mobilyum-favorites'); channel.onmessage = () => refresh(); } catch {}
    function change(id, saved, trigger) {
      const restore = trigger.hasAttribute('data-favorite-remove') && doc.activeElement === trigger;
      const index = list ? [...list.querySelectorAll('[data-favorite-remove]')].indexOf(trigger) : -1;
      trigger.disabled = true;
      return queue(async () => {
        try {
          const data = await request({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id, saved }) });
          if (data.newVisitor) { const verified = await request(); if (saved && !verified.items.some(p => p.id === id)) throw new Error('Tarayıcınız gerekli çerezi engelliyor. Kalıcı beğeniler için site çerezlerine izin verin.'); }
          accept(data); channel?.postMessage('changed');
          if (restore) { const buttons = [...list.querySelectorAll('[data-favorite-remove]')]; (buttons[Math.min(index, buttons.length - 1)] || list.querySelector('a'))?.focus({preventScroll:true}); }
          announce(saved ? 'Beğendiklerinize eklendi.' : 'Beğendiklerinizden kaldırıldı.');
        } finally { trigger.disabled = false; }
      });
    }
    doc.addEventListener('click', event => {
      const button = event.target.closest('[data-favorite-id]');
      if (button) { event.preventDefault(); event.stopPropagation(); change(button.dataset.favoriteId, !items.some(p => p.id === button.dataset.favoriteId), button); return; }
      const remove = event.target.closest('[data-favorite-remove]'); if (remove) { event.preventDefault(); change(remove.dataset.favoriteRemove, false, remove); }
      if (event.target.closest('[data-favorites-retry]')) refresh();
    });
    root?.addEventListener('change', event => {
      const checkbox = event.target;
      if (checkbox.matches('[data-favorite-select]')) { if (checkbox.checked) excluded.delete(checkbox.dataset.favoriteSelect); else excluded.add(checkbox.dataset.favoriteSelect); renderSummary(); }
      else if (checkbox.matches('[data-favorites-all]')) { items.forEach(p => checkbox.checked ? excluded.delete(p.id) : excluded.add(p.id)); renderList(); }
    });
    win.addEventListener('pageshow', event => { if (event.persisted) refresh(); });
    doc.addEventListener('visibilitychange', () => { if (doc.visibilityState === 'visible' && loaded) refresh(); });
    win.MobilyumFavorites = { buttonHtml: (p, compact) => buttonHtml(p, compact, items.some(item => item.id === String(p.id))), sync };
    sync(); refresh();
  }
  return { buttonHtml, quoteMessage, quoteGroups, mount };
});
