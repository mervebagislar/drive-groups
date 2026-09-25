# Araştırma ve mimari kararı

25 Eylül 2026 itibarıyla resmî dokümantasyona ve Chrome Web Store'daki örneklere göre değerlendirme.

## Mevcut çözümler

1. **Drive'ın kendi Gemini “Suggest file moves” özelliği:** Dosya içeriği, mevcut düzen ve genel örüntülerden klasör taşıma önerir. Kullanıcı öneriyi değiştirebilir ve taşıma için onay verir. Şu an web Drive'ın İngilizce arayüzü ve uygun Gemini planı ile sınırlıdır. Bu, fiziksel düzenleme isteyenler için ilk denenmesi gereken araçtır. [Google Yardım](https://support.google.com/drive/answer/16671865?hl=en)
2. **Drive Organizer · Gemini AI:** Chrome Web Store açıklamasına göre Gemini'nin “Suggest file moves” akışını tekrarlayan, durdurma düğmesi ve CSV hareket günlüğü sunan bir uzantı. Mimarisi açıklamadaki arayüz otomasyonu yaklaşımıdır; kodunu incelemedik. Drive arayüzüne bağlı olduğu için değişikliklere hassas olabilir. [Mağaza sayfası](https://chromewebstore.google.com/detail/drive-organizer-%C2%B7-gemini/aohdkfggchlllolmooeodeoehjdknoig)
3. **Drive'ın yerleşik klasör, renk ve kısayolları:** Çoklu bağlam için kısayol, kalıcı düzen için klasör öneriliyor. [Google Yardım](https://support.google.com/drive/answer/2375091?hl=en)

## Ürün kararı

İlk sürümde güvenli, geri alınabilir **sanal görünüm** kuruldu. Chrome'un yan paneli Drive ile eşzamanlı görülebilir ve Drive'ın değişebilen iç HTML yapısını manipüle etmeyi gerektirmez. [Chrome Side Panel API](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)

Akış: Chrome action → yan panel → kullanıcı OAuth onayı → Drive API `files.list` sayfalama → bellek içi gruplama → bağlantılı liste. Dosya verisi uzak bir sunucuya aktarılmaz. [Identity API](https://developer.chrome.com/docs/extensions/reference/api/identity), [files.list](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/list)

**Proje koleksiyonları önce**, sonra tür ve yıl alternatif görünüm olarak sunulur. Çünkü yalnızca tür ve tarih, bir projenin PDF, tablo ve sunumlarını ayrı yerlere dağıtır. İsimden çıkarım düşük güvenli olduğundan her önerinin gerekçesi görünür, kullanıcı her dosyayı elle düzeltebilir ve bilinmeyenler “Diğer dosyalar”da kalır. Kaynak klasör yolu gösterilir; dosyanın yeri değişmez. Gerçek Drive verisinde proje adları, mevcut klasörler ve kullanıcı düzeltmeleri incelenmeden daha iddialı otomasyon yapılmamalıdır.

## Yetki ve yayınlama engeli

Tüm Drive dosyalarını listelemek için `drive.metadata.readonly` kapsamı gerekiyor. Google bunu **restricted** olarak tanımlar; herkese açık OAuth uygulamasında doğrulama gerekir. `drive.file` daha kolay doğrulanır, fakat yalnızca kullanıcının uygulamayla tek tek açtığı/seçtiği dosyaları kapsar; “tüm Drive'ımı grupla” hedefini karşılamaz. Verinin sunucuda tutulması veya iletilmesi ayrıca güvenlik değerlendirmesi doğurabilir; bu uygulama sunucusuz kalacak şekilde tasarlandı. [Google kapsam rehberi](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)

Web Store yayını için geliştirici hesabı, paket, mağaza açıklaması ve görselleri, gizlilik beyanı, izin gerekçesi ve inceleme gerekir. OAuth doğrulaması Chrome Web Store incelemesinden ayrıdır. Yerel “Paketlenmemiş öğe yükle” ile test etmek mağaza yayınını gerektirmez. [Web Store yayınlama](https://developer.chrome.com/docs/webstore/publish/), [inceleme](https://developer.chrome.com/docs/webstore/review-process/)

## Sonraki sürüm için fiziksel düzenleme taslağı

1. Kullanıcının mevcut klasörlerini ve dosya adlarını örnekle; proje, müşteri, konu, yıl ve tür sinyallerini ölç.
2. Mevcut klasörleri tercih eden öneriler üret; emin olunmayan dosyayı taşıma.
3. Her öneride kaynak, hedef, gerekçe ve güven düzeyini göster; toplu seçimden önce farkları göster.
4. Tek tek onaylanan taşımalarda Drive API `files.update` + `addParents`/`removeParents` kullan; bir dosyanın tek ebeveyni olabileceğini dikkate al. [Google taşıma rehberi](https://developers.google.com/workspace/drive/api/guides/folder)
5. İşlem günlüğü ve geri alma oluştur; paylaşılan dosyalar, düzenleme izni olmayanlar ve kısayollar için ayrı kurallar tanımla.

Bu ikinci aşama `drive` veya uygun yazma kapsamı, Google doğrulaması ve gerçek kullanıcı verisiyle dikkatli test gerektirir. Mevcut prototip hiçbir dosyayı taşımaz.
