(() => {
  "use strict";

  const CONSENT_KEY = "mobilyum_analytics_consent_v1";
  const SESSION_KEY = "mobilyum_analytics_session_v1";
  const config = window.MOBILYUM_CONFIG || {};
  const gaId = /^G-[A-Z0-9]+$/i.test(config.gaMeasurementId || "") ? config.gaMeasurementId : "";
  let analyticsActive = false;
  let googleTagLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500
  });

  const readChoice = () => {
    try {
      const value = localStorage.getItem(CONSENT_KEY);
      return value === "granted" || value === "denied" ? value : "";
    } catch { return ""; }
  };

  const saveChoice = value => {
    try { localStorage.setItem(CONSENT_KEY, value); } catch {}
  };

  const safeText = value => String(value || "").slice(0, 100);
  const referrerHost = () => {
    if (!document.referrer) return "Doğrudan";
    try {
      const hostname = new URL(document.referrer).hostname.replace(/^www\./, "");
      return hostname === location.hostname.replace(/^www\./, "") ? "Site içi" : hostname;
    } catch { return "Diğer"; }
  };

  const sendFirstPartyEvent = (eventName, details = {}) => {
    if (!analyticsActive) return;
    const payload = JSON.stringify({
      event: eventName,
      page: location.pathname,
      title: document.title,
      device: matchMedia("(max-width: 800px)").matches ? "mobile" : "desktop",
      referrer: referrerHost(),
      label: safeText(details.label)
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/event", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/analytics/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
    }
  };

  const track = (eventName, details = {}) => {
    if (!analyticsActive) return;
    sendFirstPartyEvent(eventName, details);
    if (googleTagLoaded) {
      window.gtag("event", eventName, {
        page_path: location.pathname,
        link_text: safeText(details.label)
      });
    }
  };

  const loadGoogleAnalytics = () => {
    if (!gaId || googleTagLoaded) return;
    googleTagLoaded = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);
    window.gtag("js", new Date());
    window.gtag("config", gaId, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  };

  const startAnalytics = () => {
    if (analyticsActive) return;
    analyticsActive = true;
    window.gtag("consent", "update", { analytics_storage: "granted" });
    loadGoogleAnalytics();
    sendFirstPartyEvent("page_view");
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        sessionStorage.setItem(SESSION_KEY, "1");
        sendFirstPartyEvent("session_start");
      }
    } catch { sendFirstPartyEvent("session_start"); }
  };

  const stopAnalytics = () => {
    analyticsActive = false;
    window.gtag("consent", "update", { analytics_storage: "denied" });
  };

  const markup = `
    <section class="cookie-banner" aria-label="Çerez tercihi" hidden>
      <div class="cookie-banner-copy">
        <strong>Gizliliğiniz bizim için önemli</strong>
        <p>Siteyi geliştirmek ve hangi koleksiyonların ilgi gördüğünü anlamak için isteğe bağlı analiz teknolojileri kullanıyoruz. <a href="/cerez-politikasi">Detayları incele</a>.</p>
      </div>
      <div class="cookie-actions">
        <button type="button" class="cookie-secondary" data-consent="settings">Tercihler</button>
        <button type="button" class="cookie-secondary" data-consent="deny">Yalnızca gerekli</button>
        <button type="button" class="cookie-primary" data-consent="accept">Tümünü kabul et</button>
      </div>
    </section>
    <button type="button" class="cookie-settings-button" data-consent="settings" aria-label="Çerez tercihlerini aç" hidden>Çerez ayarları</button>
    <div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-title" hidden>
      <div class="cookie-modal-backdrop" data-consent="close"></div>
      <div class="cookie-modal-card">
        <button class="cookie-modal-close" type="button" data-consent="close" aria-label="Pencereyi kapat">×</button>
        <p class="eyebrow">MOBİLYUM · GİZLİLİK</p>
        <h2 id="cookie-title">Çerez tercihleri</h2>
        <p>Sitenin çalışması için gereken kayıtlar her zaman aktiftir. Analiz iznini dilediğiniz zaman değiştirebilirsiniz.</p>
        <div class="cookie-choice"><span><strong>Gerekli</strong><small>Güvenlik ve tercihlerin hatırlanması</small></span><b>Her zaman açık</b></div>
        <label class="cookie-choice"><span><strong>Analiz</strong><small>Anonim ziyaret, cihaz ve tıklama istatistikleri</small></span><input type="checkbox" id="analytics-consent-toggle"></label>
        <div class="cookie-modal-actions"><button type="button" class="cookie-secondary" data-consent="deny">Tümünü reddet</button><button type="button" class="cookie-primary" data-consent="save">Tercihi kaydet</button></div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", markup);
  const banner = document.querySelector(".cookie-banner");
  const modal = document.querySelector(".cookie-modal");
  const settingsButton = document.querySelector(".cookie-settings-button");
  const toggle = document.getElementById("analytics-consent-toggle");

  const openSettings = () => {
    toggle.checked = readChoice() === "granted";
    modal.hidden = false;
    document.body.classList.add("cookie-modal-open");
    modal.querySelector(".cookie-modal-close")?.focus();
  };
  const closeSettings = () => {
    modal.hidden = true;
    document.body.classList.remove("cookie-modal-open");
  };
  const applyChoice = value => {
    saveChoice(value);
    if (value === "granted") startAnalytics(); else stopAnalytics();
    banner.hidden = true;
    settingsButton.hidden = false;
    closeSettings();
  };

  document.addEventListener("click", event => {
    const control = event.target.closest("[data-consent]");
    if (control) {
      const action = control.dataset.consent;
      if (action === "accept") applyChoice("granted");
      if (action === "deny") applyChoice("denied");
      if (action === "settings") openSettings();
      if (action === "close") closeSettings();
      if (action === "save") applyChoice(toggle.checked ? "granted" : "denied");
      return;
    }
    const link = event.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    const label = link.textContent.trim();
    if (href.includes("wa.me")) track("whatsapp_click", { label });
    else if (href.startsWith("tel:")) track("phone_click", { label });
    else if (href.includes("google.com/maps")) track("directions_click", { label });
    else if (/^\/(yatak-odasi|koltuk-takimlari|yemek-odasi|genc-odasi|dugun-paketi)/.test(href)) track("category_click", { label });
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) closeSettings(); });

  const storedChoice = readChoice();
  if (storedChoice === "granted") {
    settingsButton.hidden = false;
    startAnalytics();
  } else if (storedChoice === "denied") {
    settingsButton.hidden = false;
    stopAnalytics();
  } else {
    banner.hidden = false;
  }

  window.mobilyumAnalytics = { track, openSettings };
})();
