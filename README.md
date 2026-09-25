# Drive Groups

Google Drive açıkken Chrome yan panelinde dosyaları **taşımadan** proje koleksiyonları, tür veya yıla göre gruplayan açık kaynaklı Manifest V3 uzantısı. Farklı klasörlerdeki aynı projeye ait dosyalar birlikte görünür. İlk sürüm dosya içeriğini indirmez; dosya adı, türü, klasör yolu ve tarih gibi meta verilerle çalışır. Sunucu, reklam ve telemetri yoktur.

## Durum

Bu bir çalışan prototiptir. Google OAuth yapılandırması yapılmadan Drive hesabına bağlanamaz. Gerçek bir Drive hesabıyla uçtan uca test ve Chrome Web Store incelemesi henüz yapılmadı. Google Drive'ın kendi dosya listesinin sıralamasını değiştirmez; uzantının yan panelinde ayrı, kalıcı bir görünüm sunar.

## Yerel kurulum

1. Chrome'da `chrome://extensions` açın, **Geliştirici modu**nu açın, **Paketlenmemiş öğe yükle** ile `extension/` klasörünü seçin. Uzantı kimliğini kopyalayın.
2. Google Cloud Console'da proje açın, **Google Drive API**'yi etkinleştirin. OAuth onay ekranında uygulamayı yapılandırın ve kendi Google adresinizi test kullanıcısı yapın.
3. **OAuth istemci kimliği** oluştururken uygulama türü **Chrome Extension** seçin ve 1. adımdaki uzantı kimliğini girin. `drive.metadata.readonly` kapsamını onay ekranına ekleyin.
4. Oluşan istemci kimliğini `extension/manifest.json` içindeki `REPLACE_WITH_CHROME_EXTENSION_CLIENT_ID.apps.googleusercontent.com` değeriyle değiştirin. Kimliği gerçek değeriyle tüm kullanıcılara açık depoya commit etmeyin; bu dosyayı yerel kopyada düzenleyin.
5. `chrome://extensions` ekranından uzantıyı yeniden yükleyin. Drive'ı açıp araç çubuğundaki Drive Groups düğmesine tıklayın, ardından **Drive'a bağlan ve tara** seçin.

OAuth istemci kimliği tek başına gizli anahtar sayılmaz, ancak bu depodaki örnek yapılandırma hiçbir Google Cloud projesine bağlı değildir. Yayınlanmış sürüm için yayıncıya ait doğrulanmış OAuth istemcisi gerekir.

## Gruplama kararı

- **Proje koleksiyonları:** Kullanıcı her proje için dosya adında aranacak kelimeleri yazar. İlk eşleşme kullanılır. Varsayılan örnekler finans, sözleşme, toplantı ve sunumdur. Eşleşmeyenler “Diğer dosyalar”a gider.
- **Açıklama ve düzeltme:** Her dosyada kaynak klasör ve eşleşme gerekçesi görünür. Açılır menüden doğru koleksiyon seçilebilir; elle seçim otomatik kuralı geçersiz kılar. Kurallar ve düzeltmeler yalnızca `chrome.storage.local` içinde saklanır.
- **Tür:** Google Doküman/Tablo/Sunum, PDF, görsel, video ve diğer türler.
- **Yıl:** Önce dosya adındaki 20xx yılı, yoksa oluşturulma tarihi. Bu bir keşif görünümüdür; otomatik fiziksel klasör kararı değildir.
- **Arama:** Panel içindeki ada göre daraltma.

Bir dosya koleksiyon görünümünde tek bir gruba atanır. Klasör yapısı, paylaşım izinleri ve dosyalar değişmez. Kurallar yalnızca dosya adına bakar; içerik veya anlamsal AI sınıflandırması yapıldığı iddia edilmez. Gerçek taşıma ve otomatik yeni klasör oluşturma ileride ayrı bir “öneri → önizleme → açık onay → işlem günlüğü/geri alma” akışı olarak tasarlanmalıdır.

## Geliştirme

`npm test` saf gruplama motorunu doğrular. Paketleme gerektirmeyen statik HTML/CSS/JS kullanılır. Mimari, alternatifler ve yayınlama engelleri için [araştırma notu](docs/RESEARCH.md) ve [gizlilik notu](PRIVACY.md) bulunur.
