# 📱 Fiş Yönetim Sistemi API Dokümantasyonu

Bu dokümantasyon Laravel backend ve React Native frontend arasındaki API iletişimini detaylı olarak açıklar.

**Base URL:** `http://10.0.2.2:8000/api`

---

## 🔐 Kimlik Doğrulama (Authentication)

### 1. Kayıt Ol (Register)

**Endpoint:** `POST /register`

**İstek Gövdesi:**
```json
{
  "name": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "password": "12345678",
  "password_confirmation": "12345678"
}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "message": "Kullanıcı başarıyla oluşturuldu",
  "data": {
    "user": {
      "id": 1,
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "created_at": "2025-11-30T10:15:30.000000Z",
      "updated_at": "2025-11-30T10:15:30.000000Z"
    },
    "token": "1|abcdefghijklmnopqrstuvwxyz123456789"
  }
}
```

---

### 2. Giriş Yap (Login)

**Endpoint:** `POST /login`

**İstek Gövdesi:**
```json
{
  "email": "ahmet@example.com",
  "password": "12345678"
}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "data": {
    "user": {
      "id": 1,
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "created_at": "2025-11-30T10:15:30.000000Z",
      "updated_at": "2025-11-30T10:15:30.000000Z"
    },
    "token": "2|zyxwvutsrqponmlkjihgfedcba987654321"
  }
}
```

**Hata Yanıtı (401):**
```json
{
  "success": false,
  "message": "Email veya şifre hatalı"
}
```

---

### 3. Kullanıcı Bilgisi (Get Current User)

**Endpoint:** `GET /me`

**Headers:**
```
Authorization: Bearer 2|zyxwvutsrqponmlkjihgfedcba987654321
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "created_at": "2025-11-30T10:15:30.000000Z",
      "updated_at": "2025-11-30T10:15:30.000000Z"
    }
  }
}
```

---

### 4. Çıkış Yap (Logout)

**Endpoint:** `POST /logout`

**Headers:**
```
Authorization: Bearer 2|zyxwvutsrqponmlkjihgfedcba987654321
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "message": "Çıkış yapıldı"
}
```

---

## 📝 Fiş İşlemleri (Receipt Operations)

**Not:** Tüm fiş işlemleri `auth:sanctum` middleware ile korunur. Her istekte `Authorization: Bearer {token}` header'ı gönderilmelidir.

---

### 5. Fiş Ekle (Create Receipt)

**Endpoint:** `POST /receipts`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**İstek Gövdesi:**
```json
{
  "baslik": "Migros Alışverişi",
  "tutar": 250.50,
  "tur": "gıda",
  "tarih": "2025-11-30",
  "saat": "14:30:00"
}
```

**Validasyon Kuralları:**
- `baslik`: Zorunlu, string, max 255 karakter
- `tutar`: Zorunlu, numeric, min 0
- `tur`: Zorunlu, enum (gıda, sağlık, ulaşım, fatura, eğlence, giyim, diğer)
- `tarih`: Zorunlu, date format (Y-m-d)
- `saat`: Zorunlu, time format (H:i:s)

**Başarılı Yanıt (201):**
```json
{
  "success": true,
  "message": "Fiş başarıyla oluşturuldu",
  "data": {
    "receipt": {
      "id": 1,
      "user_id": 1,
      "baslik": "Migros Alışverişi",
      "tutar": "250.50",
      "tur": "gıda",
      "tarih": "2025-11-30",
      "saat": "14:30:00",
      "created_at": "2025-11-30T14:35:22.000000Z",
      "updated_at": "2025-11-30T14:35:22.000000Z"
    }
  }
}
```

---

### 6. Fişleri Listele (Get All Receipts)

**Endpoint:** `GET /receipts`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parametreleri (Opsiyonel):**
- `tur`: Kategori filtresi (gıda, sağlık, ulaşım, fatura, eğlence, giyim, diğer)
- `baslangic_tarih`: Başlangıç tarihi (Y-m-d)
- `bitis_tarih`: Bitiş tarihi (Y-m-d)

**Örnek İstekler:**
```
GET /receipts
GET /receipts?tur=gıda
GET /receipts?baslangic_tarih=2025-11-01&bitis_tarih=2025-11-30
GET /receipts?tur=ulaşım&baslangic_tarih=2025-11-15&bitis_tarih=2025-11-30
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "receipts": [
      {
        "id": 1,
        "user_id": 1,
        "baslik": "Migros Alışverişi",
        "tutar": "250.50",
        "tur": "gıda",
        "tarih": "2025-11-30",
        "saat": "14:30:00",
        "created_at": "2025-11-30T14:35:22.000000Z",
        "updated_at": "2025-11-30T14:35:22.000000Z"
      },
      {
        "id": 2,
        "user_id": 1,
        "baslik": "Eczane",
        "tutar": "180.00",
        "tur": "sağlık",
        "tarih": "2025-11-29",
        "saat": "10:15:00",
        "created_at": "2025-11-29T10:20:15.000000Z",
        "updated_at": "2025-11-29T10:20:15.000000Z"
      }
    ]
  }
}
```

---

### 7. Tek Fiş Getir (Get Single Receipt)

**Endpoint:** `GET /receipts/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "receipt": {
      "id": 1,
      "user_id": 1,
      "baslik": "Migros Alışverişi",
      "tutar": "250.50",
      "tur": "gıda",
      "tarih": "2025-11-30",
      "saat": "14:30:00",
      "created_at": "2025-11-30T14:35:22.000000Z",
      "updated_at": "2025-11-30T14:35:22.000000Z"
    }
  }
}
```

**Hata Yanıtı (404):**
```json
{
  "success": false,
  "message": "Fiş bulunamadı"
}
```

---

### 8. Fiş Güncelle (Update Receipt)

**Endpoint:** `PUT /receipts/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**İstek Gövdesi:**
```json
{
  "baslik": "Carrefour Alışverişi",
  "tutar": 320.75,
  "tur": "gıda",
  "tarih": "2025-11-30",
  "saat": "15:00:00"
}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "message": "Fiş başarıyla güncellendi",
  "data": {
    "receipt": {
      "id": 1,
      "user_id": 1,
      "baslik": "Carrefour Alışverişi",
      "tutar": "320.75",
      "tur": "gıda",
      "tarih": "2025-11-30",
      "saat": "15:00:00",
      "created_at": "2025-11-30T14:35:22.000000Z",
      "updated_at": "2025-11-30T15:05:10.000000Z"
    }
  }
}
```

---

### 9. Fiş Sil (Delete Receipt)

**Endpoint:** `DELETE /receipts/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "message": "Fiş başarıyla silindi"
}
```

**Hata Yanıtı (404):**
```json
{
  "success": false,
  "message": "Fiş bulunamadı"
}
```

---

### 10. Özet Rapor (Summary Report)

**Endpoint:** `GET /receipts/summary`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parametreleri:**
- `period`: Dönem seçimi (haftalık, aylık, yıllık) - **Zorunlu**

**Örnek İstekler:**
```
GET /receipts/summary?period=haftalık   (Son 7 gün)
GET /receipts/summary?period=aylık      (Son 30 gün)
GET /receipts/summary?period=yıllık     (Son 365 gün)
```

**Başarılı Yanıt (200) - Haftalık Örneği:**
```json
{
  "success": true,
  "data": {
    "period": "haftalık",
    "toplam_tutar": 1250.75,
    "toplam_fis": 8,
    "tur_ozeti": [
      {
        "tur": "gıda",
        "toplam_tutar": 580.50,
        "fis_sayisi": 3,
        "yuzde": 46.40
      },
      {
        "tur": "ulaşım",
        "toplam_tutar": 350.00,
        "fis_sayisi": 2,
        "yuzde": 27.99
      },
      {
        "tur": "sağlık",
        "toplam_tutar": 180.00,
        "fis_sayisi": 1,
        "yuzde": 14.39
      },
      {
        "tur": "eğlence",
        "toplam_tutar": 140.25,
        "fis_sayisi": 2,
        "yuzde": 11.22
      }
    ]
  }
}
```

**Açıklama:**
- `toplam_tutar`: Seçilen dönemdeki toplam harcama
- `toplam_fis`: Seçilen dönemdeki toplam fiş sayısı
- `tur_ozeti`: Her kategorinin detaylı özeti
  - `tur`: Kategori adı
  - `toplam_tutar`: Kategoriye ait toplam harcama
  - `fis_sayisi`: Kategoriye ait fiş sayısı
  - `yuzde`: Toplam harcamaya göre yüzdelik dilim

---

## 📋 Kategori Listesi

Sistemde kullanılabilecek fiş kategorileri:

| Kategori | Icon | Açıklama |
|----------|------|----------|
| `gıda` | 🍔 | Yiyecek ve içecek harcamaları |
| `sağlık` | 💊 | Sağlık, ilaç, hastane |
| `ulaşım` | 🚗 | Ulaşım, yakıt, otopark |
| `fatura` | 📄 | Elektrik, su, internet vb. |
| `eğlence` | 🎉 | Eğlence, hobi, sosyal |
| `giyim` | 👕 | Giyim, ayakkabı, aksesuar |
| `diğer` | 📦 | Diğer harcamalar |

---

## 🔒 Güvenlik ve Yetkilendirme

### Token Yönetimi
- Başarılı kayıt veya giriş sonrası `token` döner
- Token, `AsyncStorage` ile mobil uygulama tarafında saklanır
- Her korumalı endpoint isteğinde `Authorization: Bearer {token}` header'ı gönderilir

### Middleware Koruması
- `/register` ve `/login` hariç tüm endpoint'ler `auth:sanctum` middleware ile korunur
- Geçersiz veya eksik token durumunda `401 Unauthorized` hatası döner

### Kullanıcı İzolasyonu
- Her kullanıcı sadece kendi fişlerini görebilir ve yönetebilir
- Fiş listeleme ve özet raporlar otomatik olarak giriş yapan kullanıcıya göre filtrelenir

---

## ⚠️ Hata Kodları

| HTTP Kod | Açıklama |
|----------|----------|
| 200 | Başarılı işlem |
| 201 | Kaynak başarıyla oluşturuldu |
| 400 | Hatalı istek (Validation hatası) |
| 401 | Yetkisiz erişim (Token geçersiz/eksik) |
| 404 | Kaynak bulunamadı |
| 500 | Sunucu hatası |

---

## 🚀 Örnek Kullanım Senaryosu

### 1. Kullanıcı Kaydı ve Giriş
```
POST /api/register
→ Token al ve AsyncStorage'a kaydet

POST /api/login
→ Token al ve AsyncStorage'a kaydet
```

### 2. Yeni Fiş Ekleme
```
POST /api/receipts
Authorization: Bearer {token}
{
  "baslik": "Market",
  "tutar": 150.00,
  "tur": "gıda",
  "tarih": "2025-11-30",
  "saat": "18:30:00"
}
```

### 3. Fişleri Görüntüleme
```
GET /api/receipts
Authorization: Bearer {token}
→ Tüm fişleri listele

GET /api/receipts?tur=gıda
Authorization: Bearer {token}
→ Sadece gıda kategorisindeki fişleri listele
```

### 4. Haftalık Özet Görüntüleme
```
GET /api/receipts/summary?period=haftalık
Authorization: Bearer {token}
→ Son 7 günün harcama özetini al
```

### 5. Çıkış
```
POST /api/logout
Authorization: Bearer {token}
→ Token'ı geçersiz kıl ve AsyncStorage'dan temizle
```

---

## 📱 Frontend Entegrasyonu

**API Service Dosyası:** `frontend/src/services/api.ts`

Tüm API çağrıları bu serviste merkezi olarak yönetilir:
- `register()` - Kayıt
- `login()` - Giriş
- `logout()` - Çıkış
- `getMe()` - Kullanıcı bilgisi
- `createReceipt()` - Fiş ekle
- `getReceipts()` - Fişleri listele
- `getReceipt()` - Tek fiş getir
- `updateReceipt()` - Fiş güncelle
- `deleteReceipt()` - Fiş sil
- `getSummary()` - Özet rapor

---

## 🛠️ Backend Yapısı

**Laravel Version:** 11.x  
**Authentication:** Laravel Sanctum  
**Database:** MySQL

**Ana Dosyalar:**
- `routes/api.php` - API route tanımları
- `app/Http/Controllers/AuthController.php` - Kimlik doğrulama
- `app/Http/Controllers/ReceiptController.php` - Fiş işlemleri
- `app/Models/Receipt.php` - Receipt modeli
- `database/migrations/2025_11_29_170310_create_receipts_table.php` - Veritabanı şeması

---

