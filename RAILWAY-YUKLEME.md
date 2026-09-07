# Son sürümü GitHub → Railway ile yayınlama

Bu paketi önce bilgisayarında aç. ZIP dosyasının kendisini GitHub'a yüklemek yerine içindeki dosyaları mevcut sitenin deposuna yükle. `package.json` ve `server.js`, Railway'in kullandığı proje kökünde kalmalı; fazladan klasörün içine taşınmamalı.

## Mevcut sitede değiştirilecek dosyalar

- `server.js`, `index.html`, `seo-page.html`, `script.js`, `style.css`, `consent.js`, `sitemap.xml`
- Yeni dosyalar: `catalog.js`, `railway.json`, `.gitignore`

Paketin içindeki fotoğraflar ve `data/products.json` orijinal gönderdiğin kopyadan korunmuştur. Canlıda daha fazla ürün varsa canlı verileri bu tek ürünlü kopyayla değiştirme. `storage/` ve `node_modules/` son pakete dahil edilmedi. Mevcut `uploads/`, kalıcı depolama alanı ve ortam değişkenleri korunmalı.

## Railway ayarları

Başlatma komutu `npm start`, sağlık kontrolü `/health`. Bunlar `railway.json` içinde hazır. Bağımlılıklar ve kilit dosyası değişmedi.

`ADMIN_PASSWORD`: Mevcut yönetim şifreni Railway Variables içinde koru; GitHub'a yazma.

`STORAGE_DIR`: Mevcut canlı ürünlerin bulunduğu yolu aynen koru. Tanımlıysa her zaman bu değer kullanılır. Tanımlı değilse uygulama Railway'in verdiği `RAILWAY_VOLUME_MOUNT_PATH` yolunu, o da yoksa proje içindeki `storage` klasörünü kullanır.

**Ürünlerin ve yüklenen fotoğrafların sonraki yayınlamalarda korunması için kullanılan depolama yolu Railway Volume üzerinde olmalı.** Volume olmadan yerel dosya yazabilmek kalıcı depolama anlamına gelmez. Bu paket Railway hesabında Volume oluşturmaz veya mevcut verileri yeni bir yola taşımaz. İlk defa Volume bağlayacaksan önce mevcut ürün verisi ve fotoğraflarını yedekle; boş bir yolu kullanmaya başlamak canlı kataloğu boş gösterebilir.

`GA_MEASUREMENT_ID`: Kullanıyorsan mevcut değerini koru. `PORT` değerini Railway sağlar.

Railway belgeleri: [Volume kullanımı](https://docs.railway.com/volumes), [sağlık kontrolleri](https://docs.railway.com/deployments/healthchecks), [dosyadan yapılandırma](https://docs.railway.com/config-as-code/reference).

## Yayından sonra kısa kontrol

1. Ana sayfayı, bir kategoriyi ve bir ürün bağlantısını aç.
2. Ürün fotoğrafına dokun; büyütme ve kapatmayı dene.
3. WhatsApp bağlantısında doğru ürün adını gör.
4. Yönetim panelinde mevcut ürünlerin yerinde olduğunu kontrol et.
5. `/sitemap.xml` adresini Search Console'a gönder.

Canlı Railway hesabına bağlanılmadı ve site yayınlanmadı. Paket yerelde kontrol edildi; yayın sonrası gerçek cihaz ve Google kontrolleri ayrıca yapılmalıdır.
