# [DEVELOPMENT] İşlemleri için

## 1. `react-context-api-helper`

paketi versiyonlamak için `package.json` içerisinden versiyon numarası arttırılır ve `yarn build` komutu uygulanır. Çıktı olarak .tgz uzantılı bir zip oluşturulur.

## 2. `react-context-api-flipper-plugin`

paketi versiyonlamak için `package.json` içerisinden versiyon numarası arttırılır ve `yarn build` komutu uygulanır. Çıktı olarak .tgz uzantılı bir zip oluşturulur.

## 3. `react-context-example`

Örnek react uygulamasını çalıştırmadan önce build alınan yeni versiyonların güncellenmesi için `yarn pack1` ve `yarn pack2` komutları ayrı ayrı çalıştırılır. Bu komutlar yukarıda oluşturulan zipleri otomatik olarak kurup örnek projede günceller. Bu işlemden sonra `yarn start` komutu ile web uygulamasını kullanabilirsiniz.

## 4. `flipper-plugin-context-api-watcher`

Klasörü flipper ui uygulamasına yüklediğimiz pakettir. Bunu paketlemek için `package.json` içerisinden versiyon numarası arttırılır ve `yarn pack` komutu çalıştırılır ve `.tgz` uzantılı bir zip dosyası oluşturulur. Bu zip dosyası flipper üzerine plugin olarak yüklenir.
