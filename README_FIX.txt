MOBİLYUM - OTURMA GRUBU EKLEME / ÇOKLU FOTOĞRAF DÜZELTMESİ

Sorun: admin.html çoklu fotoğraf (images) gönderiyordu ancak server.js hâlâ tek dosya (image) bekliyordu. Bu yüzden ürün kaydı başarısız oluyordu.

Bu paket:
- /api/products POST endpointini 1-12 fotoğraf kabul edecek şekilde düzeltir.
- Eski tek fotoğraflı ürünleri desteklemeye devam eder.
- Ürün silerken tüm fotoğrafları siler.
- Admin panelindeki çoklu fotoğraf formuyla uyumludur.
- Ana sitede çok fotoğraflı ürünlerde oklar, noktalar ve telefonda kaydırma ekler.
- Kategori açıkken API ürünleri sonradan geldiyse kategori görünümünü yeniler.

GitHub'da mevcut dosyaların üzerine şu dosyaları yükleyin:
server.js
admin.js
script.js
admin.html

admin.css mevcutsa değiştirmeye gerek yok.
