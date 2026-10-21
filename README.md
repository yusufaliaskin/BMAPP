# 🦸 Bilinçli Kahraman

**Bağımlılıkla Mücadele Farkındalık Projesi** için geliştirilmiş, ilkokul (1–4. sınıf) çocuklarına yönelik **tek kullanımlık test kiosku**.

Zonguldak Bülent Ecevit Üniversitesi (BEÜN) projesi kapsamında; stant/etkinlik alanında sırayla gelen çocukların
kısa bir farkındalık testi çözmesini, sonucun cihazda güvenle saklanmasını ve yönetici panelinden
sıralama, analiz ve sertifika üretimini sağlar.

> **Kiosk mantığı:** Öğrenci hesabı, şifre, tekrar deneme yoktur. Her çocuk: **ad → sınıf → şube → tek test → sonuç**.
> Sonuç veritabanına yazılır, ekran **YENİ KATILIMCI** ile sıfırlanır. Eski kayıtlar asla silinmez.

---

## İçindekiler

- [Özellikler](#özellikler)
- [Gereksinimler](#gereksinimler)
- [Kurulum](#kurulum)
- [Çalıştırma](#çalıştırma)
- [Kiosk kullanımı](#kiosk-kullanımı)
- [Yönetici paneli](#yönetici-paneli)
- [Sertifikalar](#sertifikalar)
- [Veri ve yedekleme](#veri-ve-yedekleme)
- [Derleme (APK / iOS)](#derleme-apk--ios)
- [Proje yapısı](#proje-yapısı)
- [Komutlar](#komutlar)
- [Sorun giderme](#sorun-giderme)
- [Teknolojiler](#teknolojiler)

---

## Özellikler

| Alan | Ayrıntı |
|---|---|
| **Kiosk akışı** | Karşılama → ad/lakap → sınıf (1–4) → şube (A–Z) → test → sonuç → yeni katılımcı |
| **Soru bankası** | 34 soru; 1. sınıf 5, 2. sınıf 7, 3. sınıf 10, 4. sınıf 12 soru. Her görsel **tek emoji**, cevabı ele vermez |
| **Kopya koruması** | Doğru şık soru bazında döndürülmüştür (hepsi ilk sırada değil); seçeneklerde yargı emojisi yok |
| **Puanlama** | Motor tek yetkili: puan, doğru/yanlış, süre, unvan (hayvan seti), sıralama hesapları `src/domain/engine` içinde |
| **Benzersiz katılımcı kodu** | Çocuk yazmaz, sistem üretir (ör. `9F3A-72K1`) |
| **Sıralamalar** | Sınıf seviyesine göre; ilk 3 altın/gümüş/bronz. Eşitlik bozma: puan ↓, yanlış ↑, önce bitiren |
| **Sertifika** | İlk 3 için klasik A4 yatay belge; benzersiz numara (ör. `BEUN-2026-3-001`); PDF üretimi ve paylaşım |
| **Yönetici paneli** | Katılımcılar, sınıflar, sıralamalar, analiz, sorular, sertifikalar, yöneticiler, ayarlar |
| **Yedekleme** | CSV (Excel uyumlu) ve JSON tam yedek; yedekte yönetici PIN karmaları **yok** |
| **Tasarım** | Işıltılı cam (glassmorphism) + aurora; mobil ve masaüstünde responsive; 44px dokunma hedefleri |
| **Çevrimdışı** | Barındırılan sunucu yok; tüm veri cihazda (local-first) |

---

## Gereksinimler

| Gereksinim | Sürüm / Not |
|---|---|
| **Node.js** | 20 veya üzeri (proje Node 24 ile geliştirildi) — [nodejs.org](https://nodejs.org) |
| **npm** | Node ile birlikte gelir |
| **Git** | Depoyu klonlamak için |
| **Telefon** | **Expo Go** uygulaması (Play Store / App Store) |
| **Ağ** | Telefon ve bilgisayar **aynı Wi-Fi**'de olmalı |
| **İsteğe bağlı** | Android Studio / Xcode yalnızca yerel native derleme (`expo run:*`) için gerekir — bu projede **gerekmez** |

> Bu proje **Expo Go** ile çalışacak şekilde hazırlanmıştır; Android SDK veya Xcode kurmadan telefonda açabilirsiniz.

---

## Kurulum

```bash
# 1) Depoyu klonla
git clone https://github.com/yusufaliaskin/BMAPP.git
cd BMAPP

# 2) Bağımlılıkları kur
npm install
```

> `npm install` yerine `bun install` da kullanılabilir (projede `bun.lock` yoksa npm önerilir).

---

## Çalıştırma

### Geliştirme sunucusu

```bash
npx expo start
```

Terminalde bir **QR kod** ve `Metro waiting on exp://<IP>:8081` satırı görünür.

| Nerede açmak istiyorsun? | Ne yapmalısın |
|---|---|
| **Telefon (asıl kullanım)** | Expo Go'yu aç → QR'ı okut. Okutmazsa: **Enter URL manually** → `exp://<IP>:8081` |
| **Bilgisayar (web)** | Terminalde `w` tuşu veya tarayıcıda `http://localhost:8081` |
| **Wi-Fi engelliyorsa** | `npx expo start --tunnel` (internet üzerinden bağlanır) |

### Kısayollar

| Tuş | İşlev |
|---|---|
| `r` | Uygulamayı yeniden yükle |
| `w` | Web'de aç |
| `j` | Hata ayıklayıcı |
| `Ctrl + C` | Sunucuyu durdur |

### Temiz başlatma (önerilir)

Bir rota dosyası silindiğinde veya tuhaflık olduğunda:

```bash
npx expo start --clear
```

---

## Kiosk kullanımı

1. **BAŞLA**
2. Çocuğun **adı/lakabı** (2–20 karakter). *(Buraya `admin` yazılırsa yönetici girişine geçer.)*
3. **Sınıf** (1–4) → ardından **Şube** (A–Z). Şube alanı sınıf seçilmeden açılmaz.
4. Test: her soruda tek emoji görsel + seçenekler; cevap verince sade geri bildirim gelir.
5. **Sonuç ekranı:** puan, doğru/yanlış/süre, sıralama, ilk 3 önizlemesi ve katılımcı numarası.
6. **YENİ KATILIMCI** → ekran sıfırlanır, kayıt veritabanında kalır.

> Sertifika çocuk ekranında verilmez; belgeleri yönetici üretir.

---

## Yönetici paneli

**Giriş:** Kiosk isim alanına `admin` yazın → PIN ekranı.

- **Masaüstünde (web):** PIN alanı + ekrandaki sayı tuşları; fiziksel klavyeyle de yazılabilir.
- **Telefonda:** yalnız PIN alanı ve cihaz klavyesi.

**Varsayılan yönetici:** `Yönetici` / PIN **`3579`**
> ⚠️ Etkinlikten önce **Yöneticiler → PIN değiştir** ile mutlaka değiştirin.

| Sayfa | Ne yapar |
|---|---|
| **Panel** | Toplam/bugünkü katılım, ortalama-yüksek puan, sınıf seviyesi katılımı (2×2 kart) |
| **Katılımcılar** | Arama (ad/kod), sınıf-şube filtresi, satıra dokun → **cevap dökümü**, sınıf düzeltme, kayıt silme |
| **Sınıflar** | A–Z şube ızgarası; kutudaki sayı o şubeden katılan çocuk sayısı; dokun → filtrelenmiş liste |
| **Sıralamalar** | Sınıf seviyesi sekmeleri; **SERTİFİKA OLUŞTUR** (ilk 3), belge numarasına dokun → önizleme, kayıt silme |
| **Test Analizi** | Genel özet, sınıf/konu bazlı başarı, en çok yanlış/doğru yapılan sorular |
| **Sorular** | Sınıf/konu filtresi, aktif-pasif anahtarı, düzenleme; **+** ile yeni soru |
| **Soru editörü** | Görsel (tek emoji zorunlu), metin, 2–4 seçenek, doğru cevap, puan, kısa açıklama |
| **Sertifikalar** | Üretilen belgeler, madalya dağılımı, satır içi **PDF**, satıra dokun → önizleme |
| **Yöneticiler** | Hesap ekleme, PIN değiştirme, silme (son yönetici silinemez) |
| **Ayarlar** | Kademe soru sayısı/zorluk, belge başlıkları, **yedekleme (CSV/JSON)**, veri sıfırlama |

---

## Sertifikalar

1. **Sıralamalar** → sınıf seviyesi sekmesi → **SERTİFİKA OLUŞTUR**
   - İlk 3 için altın/gümüş/bronz belge üretilir; numara benzersizdir (`PREFIX-YIL-SINIF-SIRA`).
   - Puan/sıra değişirse belge **güncellenir**, numara korunur.
2. Satırdaki **belge numarası çipine** dokunun → önizleme açılır.
3. **PAYLAŞ / KAYDET** (mobil): PDF üretilir ve paylaşım menüsü açılır → *Dosyalara kaydet*.
   **PDF OLARAK KAYDET** (web): yazdırma penceresi → *PDF olarak kaydet*.
4. Belgeler: fildişi zemin, çift altın çerçeve, lacivert serif başlık, el yazısı ad, iki imza ve mühür (A4 yatay).

---

## Veri ve yedekleme

- Tüm veri **cihazda** tutulur (`AsyncStorage`; web'de `localStorage`, anahtar: `bilincli-kahraman/store/v2`).
- **Veritabanı dosyası depoda yoktur** ve `.gitignore` ile dışa aktarımlar da hariç tutulur — GitHub'a veri gitmez.
- **Ayarlar → Yedekleme**:
  - **KATILIMCI LİSTESİ (CSV)** — Excel-TR uyumlu (`;` ayraç, UTF-8 BOM)
  - **TÜM VERİ YEDEĞİ (JSON)** — sorular, sınıflar, sonuçlar, belgeler, ayarlar
  - Güvenlik: yedekte yönetici **PIN karmaları bulunmaz**.
- Cihaz değişecekse veya uygulama silinecekse **önce yedek alın** (veri başka yerde tutulmaz).
- Şema taşımaları veri kaybı olmadan çalışır (ör. yeni sınıf harfleri, içerik düzeltmeleri).

---

## Derleme (APK / iOS)

`eas.json` hazır: `development`, `preview` (Android **APK**), `production`.

```bash
# EAS CLI (tek seferlik)
npm install -g eas-cli
eas login

# Android APK (test için)
npx eas-cli build --profile preview --platform android

# Mağaza sürümü
npx eas-cli build --profile production --platform android
npx eas-cli build --profile production --platform ios
```

- Paket kimlikleri `app.json` içinde: `com.bilinclikahraman.app` — **yayından sonra değiştirmeyin**.
- iOS derlemesi için Apple Developer hesabı gerekir.

---

## Proje yapısı

```
src/
  app/                 # Expo Router rotaları (her dosya bir ekran)
    onboarding/        # karşılama, isim, sınıf/şube
    test/              # start, question, result
    admin/             # giriş + panel sayfaları
  components/
    glass/             # GlassCard, AuroraBackground, blur hedefi
    ui/                # Button, TextField, SelectField, Screen, FeedbackSheet…
    certificate/       # CertificateView (A4 yatay belge)
  data/                # belge deposu (db), kalıcılık, actions, hooks
  domain/
    models.ts          # tipler + sabitler (sınıflar, madalyalar…)
    engine/            # puan, sıralama, sertifika, unvan (tek yetkili)
    content/seed.ts    # sorular, sınıflar, varsayılan ayarlar + migrasyonlar
  features/            # test oturumu (bellek içi)
  lib/                 # PIN, PDF, emoji, tarih, dışa aktarma
  theme/               # tasarım tokenları (palette, space, type, shadows)
assets/                # ikon, splash, görseller
```

**Mimari kural:** Puan, sıralama, unvan ve sertifika **yalnız** `src/domain/engine` içinde hesaplanır; ekranlar
veriyi doğrudan yazmaz, `src/data/actions` üzerinden yazar.

---

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm install` | Bağımlılıkları kur |
| `npx expo start` | Geliştirme sunucusu (QR + web) |
| `npx expo start --clear` | Önbelleği temizleyerek başlat |
| `npm run web` | Doğrudan web modu |
| `npm run lint` | ESLint denetimi |
| `npx tsc --noEmit` | TypeScript tip denetimi |
| `npx expo-doctor` | Bağımlılık/sağlık kontrolü |
| `npx expo export --platform ios --platform android` | Native bundle doğrulaması (derleme provası) |

---

## Sorun giderme

| Sorun | Çözüm |
|---|---|
| `Port 8081 is being used` | Eski sunucu açık: terminalde `Ctrl + C`, ya da soruya `Y` deyip 8082'yi kullan |
| `Unable to resolve module … src/app/...` (silinmiş dosya) | Metro önbelleği: `npx expo start --clear` |
| Telefonda eski/boş ekran | Terminalde `r` veya Expo Go'da shake → **Reload** |
| Telefon bağlanmıyor | Aynı Wi-Fi kontrolü → `npx expo start --tunnel` |
| `adb` / Android SDK hatası | Bu projede gerek yok: **Expo Go + QR** kullanın |
| Web'de `shadow*` uyarısı | Giderildi; güncel kodda konsol temizdir |
| Yönetici PIN'i unutuldu | Cihazda başka yönetici hesabı varsa onunla girin; yoksa uygulama verisi temizlenir (yedek alın) |

---

## Teknolojiler

Expo SDK 57 · React Native 0.86 · React 19 · TypeScript (strict) · Expo Router ·
React Native Reanimated 4 · expo-blur · expo-print & expo-sharing · expo-crypto ·
AsyncStorage · @expo-google-fonts (Baloo 2, Nunito, Playfair Display, Dancing Script) · Ionicons

---

## Notlar

- İçerik tonu: korkutucu/tıbbi dil yok; kısa, anlaşılır, çocuk dostu.
- Soru görselleri tek emojidir; seçeneklerde cevabı ele veren emoji kullanılmaz.
- Erişilebilirlik: 44px dokunma hedefleri, ekran okuyucu etiketleri, hareket azaltma desteği.

**Proje:** BEÜN — Bağımlılıkla Mücadele Farkındalık Projesi · **Uygulama:** Bilinçli Kahraman
