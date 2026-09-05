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

V9.1 TASARIM KORUMA DÜZELTMESİ
------------------------------
- Ana sayfadaki kategori kartları eski davranışına döndürüldü. Normal tıklamada
  sayfa değişmez; eski premium kategori ekranı açılır.
- Admin ürünlerindeki çoklu fotoğraf okları, noktaları ve mobil kaydırma aynen
  korunmuştur.
- Yönetim paneli yeniden ürün ekleme alanıyla başlar; analiz kartı en alta
  taşınmıştır.
- Gerçek kategori adresleri yalnızca SEO ve yeni sekmede açma için korunmuştur.

FINAL V10 SON DOKUNUŞLAR
------------------------
- Tedarikçi ve toptancı bilgilerini korumak için katalog sistemi eklenmemiştir.
- İletişim alanına çalışma saatleri eklenmiştir: Pazartesi-Cumartesi
  09.00-20.00, Pazar 12.00-19.00.
- Ana sayfada Türkiye saatine göre hafif ve otomatik "Şu an açık / kapalı"
  bilgisi gösterilir.
- Çalışma saatleri Google yerel işletme yapılandırılmış verisine eklenmiştir.
- Yönetici şifresinde hatalı giriş deneme sınırı ve güvenli karşılaştırma vardır.
- /health adresi Railway sağlık kontrolü için hazırdır.
- Yönetim paneline ürün ve analiz verilerini indirme düğmesi eklenmiştir.
- Depolama konumu STORAGE_DIR değişkeniyle ayarlanabilir; bağlı Railway Volume
  kullanılmaya devam edilmelidir.
- Mevcut tasarım, duman, imleç, kategori pencereleri ve çoklu fotoğraf galerileri
  değiştirilmemiştir.

FINAL V10.1 PROFESYONEL GÖRSEL CİLA
-----------------------------------
- Mobilyum'un mevcut krem, kahve ve koyu premium renk kimliği korunmuştur.
- Üst menü kaydırıldığında daha kompakt ve okunaklı hale gelir; menü geçişleri
  ve WhatsApp düğmesi daha net bir görsel hiyerarşiye sahiptir.
- Kategori ve ürün kartlarının çerçeve, gölge, başlık ve eylem alanları yeniden
  dengelenmiştir. Mevcut kategori açılışı ve çoklu ürün fotoğrafları korunmuştur.
- Düğün paketi, müşteri yorumu, mağaza ve iletişim alanları daha güçlü bir
  derinlik ve kontrastla düzenlenmiştir.
- Footer; keşfet bağlantıları, mağaza iletişimi, çalışma saatleri ve yasal
  bağlantıları içeren profesyonel bir yapıya dönüştürülmüştür.
- Tüm yeni dokunuşlar CSS ve çok küçük bir kaydırma durumu ile yapılmıştır;
  yeni görsel, font veya ağır JavaScript kütüphanesi eklenmemiştir.
- Mobil yerleşimler ve hareket azaltma tercihi ayrıca korunmuştur.

FINAL V10.2 ÜRÜN VİTRİNİ VE KAPAK YÖNETİMİ
------------------------------------------
- Kategori içindeki ürün kartına tıklandığında premium ürün detay vitrini açılır.
- Ürün vitrininde büyük görsel, küçük fotoğraflar, ileri/geri okları, fotoğraf
  sayacı, mobil kaydırma ve klavye yön tuşları bulunur.
- Vitrindeki büyük görsele tıklandığında fotoğraf tam ekran büyütülebilir.
- Ürüne özel WhatsApp mesajı ve hafif “ürün bağlantısını paylaş” özelliği
  eklenmiştir. Paylaşılan bağlantı ürünü doğrudan açar.
- Admin panelinde yeni ürün fotoğrafları arasından kapak seçilebilir.
- Daha önce eklenmiş ürünlerin kapak fotoğrafı da küçük görsele tıklanarak
  değiştirilebilir; diğer fotoğraflar silinmez.
- Yatak Odaları, Oturma Grupları, Yemek Odaları ve Genç Odaları için kategoriye
  göre değişen hazır açıklama seçenekleri eklenmiştir.
- Yeni kütüphane veya ağır görsel eklenmemiş; mevcut duman, kategori açılışı,
  ürün galerileri, mobil görünüm, SEO ve yönetim verileri korunmuştur.
