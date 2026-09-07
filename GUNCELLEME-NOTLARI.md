# Mobilyum Çorlu — 7 Eylül 2026 güncellemesi

Mevcut renkler, yazı tipleri, ana sayfa düzeni, kategori pencereleri, ürün galerileri, yönetim paneli ve mağaza bilgileri korundu. Yeni bağımlılık eklenmedi.

## Yapılanlar

- Her kayıtlı ürün için `/urun/URUN-KIMLIGI` adresinde sunucuda oluşturulan, JavaScript olmadan okunabilen ürün sayfası eklendi. Yönetim panelindeki kayıtlar tek veri kaynağıdır.
- Ürün sayfalarında özgün başlık, açıklama, canonical, sosyal paylaşım bilgileri, Product, WebPage ve BreadcrumbList şemaları oluşturulur. Mevcut FurnitureStore ve WebSite bilgileri kullanılır.
- Açık sayısal TL fiyatı varsa Offer eklenir. “Fiyat için bilgi alın” gibi metinlerden fiyat, stok veya müşteri puanı türetilmez. Fiyatsız ürünlerde Product bilgisi bulunması, Google ürün zengin sonucu uygunluğu anlamına gelmez.
- Kategori bağlantıları, kategori ItemList şemaları, ürün paylaşma düğmesi ve dinamik sitemap yeni ürün adreslerine bağlandı. Eski `/#urun/...` bağlantıları çalışmaya devam eder.
- İletişim ve hakkımızda sayfalarında ContactPage ve AboutPage türleri kullanıldı.
- `/index.html` ve bilinen sayfaların sonundaki fazladan eğik çizgi için 301 yönlendirmesi eklendi.
- Bulunmayan sayfalar gerçek 404 yanıtı verir; geri dönüş bağlantısı sağlanır.
- Kategori kapakları lazy loading kullanır. Kullanıcı kategori açmadan yapılan ek ürün kapağı ön yüklemesi kaldırıldı. Mevcut WebP, responsive ana görsel, gzip ve uzun süreli görsel önbelleği korundu.
- Ana görsel bölümü açılış animasyonunu beklemeden görünür. JavaScript kapalıyken ana sayfa metinleri gizlenmez.
- İçeriğe geç bağlantıları, klavye odak görünürlüğü ve ürün başlığından doğrudan sayfaya erişim eklendi. Fotoğraf düğmelerinin hatalı tablist rolü düzeltildi.
- CSS/JS sürüm etiketleri güncellendi.

## Kontroller

12 sayfa senaryosu (10 mevcut sayfa, gerçek ürün, özel karakterli deneme ürünü), 25 yerel dosya, 3 yönlendirme ve 4 bulunamayan/özel dosya yolu kontrolü geçti. JSON-LD ayrıştırma, tek H1, canonical, sitemap, gzip, yönetim sayfasının noindex başlığı ve HTML kaçışları kontrol edildi. Türkçe `12.345,50 TL` fiyatının şemada `12345.5 TRY` olarak üretilmesi doğrulandı.

Deneme ürünleri teslim verilerine eklenmedi. Tarayıcı etkileşim/görsel testi, Lighthouse, gerçek kullanıcı Core Web Vitals ölçümü veya Google Rich Results Test çalıştırılmadı. Dolayısıyla puan ya da ölçülmüş hız artışı iddiası yoktur. Ana sayfaya yeni çalıştırılabilir bağımlılık eklenmedi; optimize görsel dosyaları değiştirilmedi.

## Mevcut canlı siteyi güncelleme

Bu proje Node.js/Express ile çalışır. Yalnızca HTML dosyalarını statik hostinge yüklemek ürün ve kategori rotalarını çalıştırmaz.

1. Önce mevcut canlı dosyalarınızı, ortam değişkenlerinizi, kalıcı `STORAGE_DIR` klasörünüzü ve yüklenmiş fotoğraflarınızı yedekleyin.
2. Son sürüm için RAILWAY-YUKLEME.md dosyasındaki güncel dosya listesini izleyin. Bağımlılıklar ve kilit dosyası değişmedi.
3. Canlı `storage/`, `uploads/`, `data/products.json`, `.env` ve ortam değişkenlerinizi koruyun. Paketteki tek ürünlü örnek veriyle canlı verilerin üzerine yazmayın. Mevcut `STORAGE_DIR`, `ADMIN_PASSWORD`, `GA_MEASUREMENT_ID` ayarlarını aynen koruyun.
4. Node.js servisini mevcut yayın sisteminizden yeniden başlatın. Yeni bir kurulumda `npm ci` ve `npm start` kullanılır. `node_modules` pakete dahil değildir.
5. Ana sayfa, kategori, ürün detayları, WhatsApp ve yönetim panelinden bir ürün görüntülemeyi kontrol edin. `/sitemap.xml` sunucuda güncel ürünlerden otomatik oluşturulur.
6. Search Console'da sitemap'i gönderin ve bir ürün URL'sini URL Denetleme ile kontrol edin. Canlı Google araçlarındaki kontrol ancak bu sürüm yayınlandıktan sonra yapılabilir.

Google sıralaması veya zengin sonuç görünümü garanti değildir. Katalogda açıklama ve fotoğraf kalitesi ürün başına önemlidir; mevcut gerçek bilgilerin dışında içerik uydurulmadı.

Kaynaklar:
- https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- https://developers.google.com/search/docs/crawling-indexing/canonicalization
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

## Son cila — Railway sürümü

- Ürün sayfasında yerinde, tam ekran fotoğraf görüntüleyici; dokunmatik yatay kaydırma, klavye okları ve Escape ile kapatma. JavaScript yoksa fotoğraf bağlantısı çalışır.
- Fotoğraf alanlarına ölçülü yakınlaşma ve açılış geçişi; ürün kartlarına hafif yükselme efekti eklendi. Mevcut duman, kayan yazı, galeri ve diğer efektler korunur. Ekran dışındaki animasyonlar ve slayt zamanlayıcısı duraklar, tekrar görünürken devam eder. İşletim sisteminin hareket azaltma tercihi desteklenir.
- Slaytlara duraklat/oynat düğmesi, odaktayken durma ve geçerli fotoğraf bilgisi eklendi. Dikey telefon kaydırması fotoğraf geçişini tetiklemez.
- Mobil açıklamalar, koleksiyon menüsü ve dokunma alanları büyütüldü. Fotoğraf ekranı telefonun güvenli alanlarını ve dinamik ekran yüksekliğini kullanır.
- Pencereler ve çerez ayarlarında klavye odağı iyileştirildi; boş kategorinin mesajı müşteri diline çevrilip WhatsApp bağlantısı eklendi.
- WhatsApp ürün mesajı kalıcı ürün URL'sini içerir.
- Railway sağlık kontrolü ve yeniden başlatma yapılandırması eklendi. Açık STORAGE_DIR önceliği korunarak Railway Volume ortam değişkeni desteklendi.
- Son ek kontroller: birden fazla fotoğraf, geçersiz görsel URL'si, Railway Volume yolu, yetkisiz yönetim isteği, yetkili ürün oluşturma, fotoğraf optimizasyonu, dosyanın kalıcı yola yazılması, yeni ürünün sayfası/sitemap'i ve silme sonrası 404 doğrulandı.

Bu turda da tarayıcı etkileşim testi ve gerçek telefon/Lighthouse ölçümü yapılmadı. Mobil iyileştirmeler kaynak kodunda uygulandı; kontrol sonuçları HTTP, dosya ve sözdizimi kontrollerini kapsar.