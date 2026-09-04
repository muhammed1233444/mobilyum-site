# MOBİLYUM — Ürün Yönetim Panelli Site

## Yerelde çalıştırma
1. Bilgisayarında Node.js kurulu olsun.
2. Bu klasörde terminal aç.
3. `npm install`
4. `.env.example` dosyasını `.env` olarak kopyala.
5. `.env` içindeki `ADMIN_PASSWORD` değerini kendi gizli şifren yap.
6. `npm start`
7. Site: `http://localhost:3000`
8. Yönetim paneli: `http://localhost:3000/admin`

## Nasıl kullanılır?
Admin paneline şifrenle gir. Ürün adı, kategori, fiyat ve fotoğrafı doldurup kaydet. Ürün ana sitede otomatik görünür.

## Önemli
Bu sürüm gerçek bir sunucu/backend ile çalışacak şekilde hazırlandı. Sadece `index.html` dosyasını yüklemek yeterli değildir; Node.js sunucusunun ve `storage/` klasörünün kalıcı depolamada çalışması gerekir. Railway Volume bağlı kalmalıdır. Volume farklı bir konuma bağlandıysa Railway değişkenlerine `STORAGE_DIR` ekleyip o konumu yaz.

Railway üzerindeki `ADMIN_PASSWORD` ortam değişkenini güçlü ve yalnızca sana ait bir şifre olarak koru. Yönetici girişinde 10 dakika içinde 8 hatalı denemeden sonra geçici sınır devreye girer.

Mevcut tasarım ve ürünler korunmuştur.

## Ziyaretçi analizi

Yönetim panelinde, analiz izni veren ziyaretçilere ait toplu istatistikler bulunur. Yaklaşık ziyaret, sayfa görüntüleme, cihaz, ziyaret kaynağı, WhatsApp, telefon ve yol tarifi tıklamalarını buradan görebilirsin. İsim, telefon numarası veya mesaj içeriği kaydedilmez.

İstersen aynı verileri Google Analytics 4'te de görebilirsin. Railway değişkenlerine `GA_MEASUREMENT_ID` adıyla Google Analytics'teki `G-...` kodunu ekle. Kod eklenmemiş olsa bile yönetim panelindeki kendi analiz ekranı çalışır.

## Son kontroller ve yedek

- Railway sağlık kontrolü adresi: `/health`
- Yönetim panelinin en altındaki “Verileri indir” düğmesi ürün ve analiz bilgilerinin JSON yedeğini indirir.
- Ürün fotoğrafları Railway Volume üzerinde olduğu için Railway panelinden günlük ve haftalık Volume yedeğini etkin tut.
- Mağaza saatleri: Pazartesi–Cumartesi 09.00–20.00, Pazar 12.00–19.00.
