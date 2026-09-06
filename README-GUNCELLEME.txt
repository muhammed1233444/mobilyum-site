MOBİLYUM ÜRÜN SİSTEMİ GÜNCELLEMESİ

- index.html içindeki elle kodlanmış ürünlerin tamamı kaldırıldı.
- Ürünler artık /api/products üzerinden yönetim panelinden gelir.
- Admin panelinde bir ürüne en fazla 12 fotoğraf yüklenebilir.
- Ürün kartlarında fotoğraflar oklarla ve telefonda kaydırarak değiştirilebilir.
- Favicon: assets/favicon.png
- Mevcut data/products.json içindeki yönetim ürünleri korunur.

GitHub'a bu ZIP'i güncelleme olarak yüklerken mevcut assets/, data/ ve uploads/ klasörlerini silme.
V10.5.2 ACİL GİRİŞ DÜZELTMESİ
-----------------------------
- Kapalı ürün düzenleme penceresinin şeffaf biçimde giriş ekranının üzerinde kalması düzeltildi.
- Düzenleme penceresi kapalıyken artık hiçbir alanı veya tıklamayı yakalamaz.
- Şifre alanına normal şekilde yazılabilir; görünmez kategori seçimi açılmaz.
- Ana site, SEO, performans ve ürün verileri değiştirilmedi.

V10.5.1 DÜZELTMESİ
------------------
- Yönetici girişi gerçek form yapısına alındı; buton ve Enter tuşu ile güvenilir giriş sağlandı.
- Şifre alanında tarayıcının eski ürün adlarını önermesini engelleyen otomatik doldurma ayarları eklendi.
- Bütün kategori klasörleri başlangıçta kapalıdır.
- Kategori kutusuna basınca yalnız o klasörün ürünleri açılır; tekrar basınca kapanır.
- Ana site, SEO, ürün optimizasyonu ve mobil performans dosyaları değiştirilmedi.

V10.5 YENİLİKLERİ
------------------
- Admin ürün listesi kategori klasörlerine ayrıldı; her klasör ürün sayısını gösterir.
- Önceden eklenen ürünlere Düzenle butonu eklendi.
- Ürün adı, kategori, tür, fiyat, eski fiyat, etiket ve açıklama sonradan değiştirilebilir.
- Düzenleme ekranından mevcut kapak seçilebilir veya ürün galerisi yeni fotoğraflarla değiştirilebilir.
- Her kategoride en az 20 farklı hazır açıklama bulunur.
- Hazır açıklama seçildiğinde %100 MDF bilgisi otomatik olarak metne eklenir.
- V10.4 akıllı toplu ekleme ve mobil kenardan geri kaydırma aynen korunmuştur.

V10.4 YENİLİKLERİ
------------------
- Admin paneline dosya adı düzenlemeden çalışan "Akıllı toplu ürün ekle" alanı eklendi.
- Bütün fotoğraflar tek seferde seçilir; aynı ürüne ait fotoğraflara dokunularak ürün grubu oluşturulur.
- Her grup için kapak fotoğrafı, ürün adı, kategori, fiyat ve etiket yayınlamadan önce düzenlenebilir.
- Fotoğraflar yine otomatik küçültülür ve sunucuda WebP olarak optimize edilir.
- Toplu yayınlama yarıda kesilirse tamamlanan ürünler korunur; kalan gruplardan devam edilir.
- Mobilde ürün detayından kategoriye ve kategoriden ana sayfaya sol kenardan sağa kaydırarak dönülebilir.
- Kenar hareketi yalnızca ekranın ilk 28 pikselinden başlar; ürün fotoğraf galerisinin kaydırmasıyla karışmaz.
