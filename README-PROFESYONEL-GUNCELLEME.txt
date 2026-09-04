MOBİLYUM ÇORLU — PROFESYONEL SEO VE HIZ GÜNCELLEMESİ
Tarih: 4 Eylül 2026

YAPILANLAR
- Mobil LCP görseli 568 KB'dan 44 KB'a indirildi.
- 16 MB Genç Odası görselinin kullanılan WebP sürümü 24 KB'a indirildi.
- Hero slider fotoğrafları WebP'ye çevrildi ve sıradaki görseller önceden hazırlanıyor.
- Ürün fotoğrafları görünmeden yaklaşık iki ekran önce yüklenmeye başlıyor.
- Admin panelinden yüklenecek yeni JPG, PNG ve WebP fotoğraflar otomatik olarak
  en fazla 1600 px boyutunda, sıkıştırılmış WebP dosyasına dönüştürülüyor.
- Hafif duman/atmosfer efekti ve masaüstü fare takip efekti eklendi.
- Dokunmatik cihazlarda fare efekti çalıştırılmıyor.
- Mobil ilk ekran, butonlar ve sabit iletişim düğmeleri düzenlendi.
- SEO başlık/açıklama, canonical, Open Graph, Twitter Card, JSON-LD,
  sitemap.xml ve robots.txt geliştirildi.
- Google arama sonucu için favicon.ico, 48 px, 192 px ve Apple simgeleri eklendi.
- Sunucu sıkıştırması, uzun süreli görsel önbelleği ve güvenlik başlıkları eklendi.
- Sunucu kaynak dosyalarının dışarıdan doğrudan indirilmesi engellendi.

YÜKLEME
ZIP'in içindeki mobilyum-site-main klasörünün güncel içeriğini GitHub'daki
projenin ana dizinine yükleyin. node_modules klasörünü yüklemeyin. Railway yeni
package-lock.json dosyasına göre gerekli paketleri otomatik kuracaktır.

Railway üzerindeki ADMIN_PASSWORD değişkenini koruyun. .env dosyasını GitHub'a
yüklemeyin.

Google favicon değişikliği yayınlandıktan hemen sonra görünmeyebilir. Google
Search Console URL Denetimi bölümünden ana sayfa için yeniden dizine ekleme
isteği gönderilebilir.

V9 SEO VE ANALİZ GÜNCELLEMESİ
-----------------------------
- /yatak-odasi, /koltuk-takimlari, /yemek-odasi, /genc-odasi,
  /dugun-paketi, /hakkimizda ve /iletisim gerçek ve taranabilir sayfalardır.
- Bu sayfalar sitemap.xml dosyasına eklendi ve ana sayfadan doğrudan bağlandı.
- Çerez/analiz tercih ekranı eklendi. Analiz izni verilmeden takip yapılmaz.
- Yönetim paneline anonim ziyaret, sayfa, cihaz, kaynak ve iletişim tıklaması
  istatistikleri eklendi.
- Google Analytics 4 isteğe bağlıdır. Railway'e GA_MEASUREMENT_ID=G-XXXXXXXXXX
  eklendiğinde, yalnızca ziyaretçi analiz izni verdikten sonra yüklenir.
- Google favicon taramasını kolaylaştırmak için 512x512 logo /favicon.png
  adresinden de sunulmaktadır.
