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
Bu sürüm gerçek bir sunucu/backend ile çalışacak şekilde hazırlandı. Sadece `index.html` dosyasını Vercel'e yüklemek yeterli değildir; Node.js sunucusunun ve `data/` ile `uploads/` klasörlerinin kalıcı depolamada çalışması gerekir. Hosting'e geçerken `ADMIN_PASSWORD` ortam değişkenini sunucuda tanımla.

Mevcut tasarım ve ürünler korunmuştur.
