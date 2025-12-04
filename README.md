# Fiş/Fatura Yönetim Sistemi

Bu proje, fiş ve fatura yönetimi için geliştirilmiş bir mobil uygulamadır. Laravel backend API'si ile React Native frontend uygulamasından oluşmaktadır.

## Proje Yapısı

### Backend (Laravel)
- **Framework**: Laravel 12.0
- **Veritabanı**: MySQL
- **Kimlik Doğrulama**: Laravel Sanctum
- **API Endpoint'leri**: RESTful API yapısı

### Frontend (React Native)
- **Framework**: React Native + TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: React Hooks
- **Local Storage**: AsyncStorage
- **UI Components**: Custom component library

## Tamamlanan Özellikler

### Kimlik Doğrulama Sistemi
- Kullanıcı kaydı (name, email, password validasyonu)
- Giriş yapma (email/password)
- "Beni Hatırla" özelliği
- Otomatik oturum kontrolü
- Güvenli çıkış yapma
- Token tabanlı kimlik doğrulama
- Toast bildirimleri (başarı/hata mesajları)

### Navigation Sistemi
- Welcome/Giriş/Kayıt ekranları arası geçiş
- Ana uygulama için bottom tab navigation
- 5 ana sayfa: Graph, Invoice, Camera, Receipts, Profile
- Custom tasarımlı bottom navigation bar
- Responsive ve modern UI

### UI/UX Tasarımı
- Tutarlı renk paleti (#EEF7FA, #9DB4C0, #253237, #5C6B73)
- Vector görselleri ile modern arka planlar
- Custom component library (AppText, AppButton, AppTextInput, AppContainer)
- Material Icons entegrasyonu
- Responsive tasarım

### API Entegrasyonu
- Laravel backend ile REST API iletişimi
- Hata yönetimi ve kullanıcı dostu mesajlar
- Network request handling
- Token yönetimi

### Sayfa Yapıları
- **GraphScreen**: Grafik analizi sayfası (Vector3 arka plan)
- **InvoiceScreen**: Fatura yönetimi sayfası (Vector3 arka plan)
- **CameraScreen**: Fiş/fatura fotoğraf çekme sayfası
- **ReceiptsScreen**: Fiş kayıtları sayfası (Vector3 arka plan)
- **ProfileScreen**: Kullanıcı profili ve ayarları (Vector2 + account icon)

## Backend API Endpoint'leri

### Kimlik Doğrulama
- `POST /api/register` - Kullanıcı kaydı
- `POST /api/login` - Giriş yapma
- `POST /api/logout` - Çıkış yapma (gelecek)

### Veritabanı Tabloları
- **users**: Kullanıcı bilgileri
- **receipts**: Fiş kayıtları
- **invoices**: Fatura kayıtları
- **personal_access_tokens**: API token'ları

## Eksik Özellikler ve Geliştirme Alanları

### Backend
- CRUD işlemleri için API endpoint'leri eksik:
  - Fiş ekleme/düzenleme/silme/listeleme
  - Fatura ekleme/düzenleme/silme/listeleme
  - Kullanıcı profil güncelleme
  - Dashboard istatistikleri
- Dosya yükleme sistemi (fiş/fatura fotoğrafları)
- Veri validasyonu ve güvenlik kontrolleri
- Rate limiting ve API koruması

### Frontend
- Ana sayfa içeriklerinin detaylandırılması:
  - Graph sayfasında gelir/gider grafikleri
  - Invoice sayfasında fatura listesi ve CRUD işlemleri
  - Camera sayfasında fotoğraf çekme ve OCR entegrasyonu
  - Receipts sayfasında fiş listesi ve kategorilendirme
  - Profile sayfasında kullanıcı bilgileri düzenleme
- Veri listeleme ve arama özellikleri
- Offline mod ve veri senkronizasyonu
- Push notification sistemi
- Veri export/import özellikleri

### Kamera ve OCR
- Fiş/fatura fotoğraf çekme sistemi
- OCR (Optical Character Recognition) entegrasyonu
- Metin tanıma ve veri çıkarma
- Otomatik kategori tanıma

### Grafik ve Analiz
- Chart.js veya benzeri grafik kütüphanesi entegrasyonu
- Aylık/yıllık gelir-gider analizleri
- Kategori bazlı harcama grafikleri
- Trend analizleri

### Veritabanı İlişkileri
- Kullanıcı-Fiş ilişkilendirmesi
- Kullanıcı-Fatura ilişkilendirmesi
- Kategori sistemi
- Tag ve filtreleme sistemi

## Kullanılan Teknolojiler

### Backend
- Laravel Framework 12.0
- Laravel Sanctum (API Authentication)
- MySQL Database
- Composer Package Manager

### Frontend
- React Native 0.72+
- TypeScript
- React Navigation 6
- AsyncStorage
- React Native Vector Icons
- React Native Gesture Handler

### Development Tools
- VS Code
- Android Studio / Xcode
- Metro Bundler
- Git Version Control

## Kurulum ve Çalıştırma

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Setup
```bash
cd frontend
npm install
npx react-native start
npx react-native run-android # veya run-ios
```

## Proje Durumu

Şu anda proje temel kimlik doğrulama sistemi ve navigation yapısı tamamlanmış durumda. Ana sayfa içerikleri ve core business logic geliştirme aşamasına hazır. Backend API'leri genişletilmeli ve frontend sayfaları detaylandırılmalı.

Öncelikli geliştirme alanları:
1. Backend CRUD API'lerinin tamamlanması
2. Camera sayfasında fotoğraf çekme özelliği
3. Graph sayfasında grafik gösteriminin implementasyonu
4. Invoice ve Receipts sayfalarında listeleme ve yönetim özellikleri
5. Profile sayfasında kullanıcı bilgilerinin düzenlenebilmesi