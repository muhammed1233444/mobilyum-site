# Mobilyum — Beğendiklerim ve toplu fiyat

8 Eylül 2026. Gönderdiğiniz son `mobilyum-site-main (3).zip` sürümü üzerine hazırlandı.

## Yükleme

Bu ZIP **yalnızca değişen dosyaları** içerir; tek başına yeni site kurulumu değildir.

1. ZIP'i açın. İçindeki 7 uygulama dosyasını mevcut projenizin `server.js` dosyasının bulunduğu ana klasöre yükleyin. Aynı isimli dosyaları değiştirin; diğer dosyaları silmeyin.
2. GitHub üzerinden yayınlıyorsanız bu dosyaları mevcut depoya yükleyip kaydedin. Railway otomatik yayını tamamlasın; otomatik yayın kapalıysa mevcut servisi yeniden yayınlayın.
3. Railway'deki mevcut Volume, STORAGE_DIR, ADMIN_PASSWORD ve diğer ortam değişkenleri aynı kalmalı. Yeni değişken, üyelik, paket kurulumu veya veritabanı servisi gerekmez.
4. Sitede bir ürünü beğenin. Üst menüden Beğendiklerim'e girin; sayfayı kapatıp aynı tarayıcıda yeniden açın. Birkaç ürün seçip WhatsApp düğmesinin hazırladığı mesajı kontrol edin.

`data/`, `storage/`, `uploads/`, fotoğraflar ve yönetim paneli dosyaları bu güncelleme ZIP'inde yoktur. Böylece paket canlı ürün verilerinizin üzerine yazmaz. Mevcut proje klasörünü veya kalıcı diski silmeyin.

### Güncellenen dosyalar

- `server.js`: yeni sayfa ve beğeni servisini mevcut uygulamaya bağlar.
- `index.html`: menü, ürün penceresi ve ana sayfada elden taksit bilgisi.
- `seo-page.html`: kategori/ürün sayfalarında ortak beğeni desteği.
- `script.js`: mevcut kategori ve ürün penceresine kalp düğmesi.
- `favorites.js`: beğeniler, seçimler ve toplu WhatsApp mesajları.
- `favorites.css`: bu özelliklere ait masaüstü ve mobil stiller.
- `favorites-server.js`: ziyaretçiye özel, kalıcı beğeni kayıtları.

## Kullanım

- Ürün kartındaki veya detayındaki kalbe dokunun. Beğendiklerim sayfasından ürünleri tekrar açabilir ve listeden kaldırabilirsiniz.
- Fiyat isteğine dahil edilecek ürünleri işaretleyin. Varsayılan olarak mevcut ürünlerin tamamı seçilir. Mesaj isimleri ve gerçek ürün bağlantılarını içerir; gönderme işlemi ziyaretçinin WhatsApp'taki onayıyla yapılır.
- Çok uzun listeler ürün atlamadan ayrı mesaj gruplarına bölünür. Bir ziyaretçinin listesinde en fazla 200 ürün tutulur.
- Mağaza sahibinin yaptığı isim ve kapak değişiklikleri listeye yansır. Katalogdan kaldırılmış ürünler bilgi etiketiyle görünür ve fiyat isteğine eklenmez.
- Elden taksit bilgisi ana sayfada, ürün detayında ve toplu fiyat alanında bulunur. Vade, faiz veya peşinat gibi belirtilmemiş koşullar uydurulmadı.

## Kayıtların korunması

Beğeniler mevcut kalıcı diskin `favorites/` alt klasöründe tutulur. Ziyaretçiyi kendi listesine bağlayan rastgele çerez HttpOnly ve SameSite=Lax kullanır; HTTPS'te Secure işaretlidir. Ziyaretçi ilk kez ürün kaydedene kadar bu çerez oluşturulmaz. Analiz izni verilmesi gerekmez; beğeniler analiz sistemine gönderilmez.

Liste aynı site, cihaz ve tarayıcıda hatırlanır; üyelik veya cihazlar arası eşitleme yoktur. Site çerezlerini silmek veya gizli pencereyi kapatmak listeye erişimi kaldırabilir. Son değişiklikten itibaren liste ve çerez en fazla 1 yıl saklanır. Kayıt hatasında başarı mesajı gösterilmez. Sunucudaki okunamayan bir liste boş listeyle değiştirilmez.

Mevcut Railway Volume bağlı kaldığı sürece normal yeniden yayınlamada ürünler ve beğeniler korunur. Geri alma gerekirse önceki sürümden sadece güncellediğiniz uygulama dosyalarını geri yükleyin; volume içeriğini koruyun.

## Doğrulama

49 otomatik işlev/HTTP kontrolü geçti: 50 ürünlü liste, eşzamanlı ekleme, tekrar eklemede çoğaltmama, kaldırma, sunucu yeniden başlatılınca geri okuma, ziyaretçilerin birbirinin listesini görememesi, ürün verisinin değişmemesi, güncel isim/kapaklar, silinen ürünler, kayıt hataları, istek güvenliği, 200 ürün sınırı, WhatsApp metin uzunluğu ve özel karakterler, sayfalar ve korunan SEO rotaları.

Kontroller, projedeki kilit dosyasıyla aynı sürümlerde mevcut paketler kullanılarak geçici test verileri üzerinde yapıldı. Yeni bağımlılık eklenmedi; fotoğraflar, duman, imleç, galeriler ve yönetim paneli yeniden yazılmadı. Beğendiklerim kişisel bir sayfa olduğu için noindex'tir ve sitemap'e eklenmez; mevcut kategori/ürün adresleri korunur.

Bu sürüm canlı siteye yüklenmedi. Gerçek telefon/tarayıcı etkileşim testi ve yeni PageSpeed ölçümü yapılmadı; ölçülmüş hız puanı iddiası yoktur.
