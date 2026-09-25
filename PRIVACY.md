# Gizlilik

Drive Groups, kullanıcının izniyle Google Drive dosya meta verilerini (ad, tür, tarih, ebeveyn klasör, bağlantı ve kimlik) okur. Dosya içeriğini indirmez. Elde edilen liste yalnızca açık yan panelin belleğinde tutulur; uzantı kapatılınca saklanmaz. Kullanıcının yazdığı gruplama kuralları ve elle düzelttiği koleksiyon atamaları (dosya kimliği ile grup adı) Chrome'un yerel depolamasında tutulur. Veri geliştirici sunucusuna gönderilmez; Google Drive API isteği doğrudan tarayıcıdan Google'a yapılır. Telemetri, reklam ve veri satışı yoktur.

Yetki kapsamı: `https://www.googleapis.com/auth/drive.metadata.readonly`. Bu kapsam tüm Drive meta verilerini okuyabildiği için Google tarafından **restricted** olarak sınıflandırılır. Kullanıcı erişimi Google hesabı izinleri sayfasından geri alabilir. Chrome'dan uzantıyı kaldırmak yerel kuralları siler.

Bu dosya bir prototip açıklamasıdır. Halka açık Chrome Web Store dağıtımından önce yayıncı kimliği ve nihai veri işleme akışıyla uyumlu bir herkese açık gizlilik politikası yayımlanmalıdır.
