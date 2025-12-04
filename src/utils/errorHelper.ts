// Error message helper functions
export const parseApiError = (error: any): string => {
  if (error instanceof Error) {
    // API'den gelen hata mesajını Türkçeleştir
    const message = error.message;
    
    // Laravel validation hatalarını Türkçe'ye çevir
    const translations: { [key: string]: string } = {
      'The email field is required.': 'Email alanı zorunludur.',
      'The password field is required.': 'Şifre alanı zorunludur.',
      'The name field is required.': 'Ad alanı zorunludur.',
      'The email must be a valid email address.': 'Geçerli bir email adresi giriniz.',
      'The email has already been taken.': 'Bu email adresi zaten kullanılmaktadır.',
      'The password must be at least 8 characters.': 'Şifre en az 8 karakter olmalıdır.',
      'The password confirmation does not match.': 'Şifre onayı eşleşmiyor.',
      'Email veya şifre hatalı': 'Email veya şifre hatalı. Lütfen tekrar deneyin.',
      'Validasyon hatası': 'Form bilgileri eksik veya hatalı.',
    };

    // Tam eşleşme kontrolü
    if (translations[message]) {
      return translations[message];
    }

    // Kısmi eşleşme kontrolü
    for (const [english, turkish] of Object.entries(translations)) {
      if (message.includes(english)) {
        return turkish;
      }
    }

    // Yaygın İngilizce kelimeleri Türkçe'ye çevir
    let translatedMessage = message
      .replace(/required/gi, 'zorunlu')
      .replace(/invalid/gi, 'geçersiz')
      .replace(/email/gi, 'email')
      .replace(/password/gi, 'şifre')
      .replace(/name/gi, 'ad')
      .replace(/field/gi, 'alan')
      .replace(/characters/gi, 'karakter')
      .replace(/minimum/gi, 'en az')
      .replace(/maximum/gi, 'en fazla');

    return translatedMessage;
  }
  
  return 'Bilinmeyen bir hata oluştu.';
};

// Success message helper
export const parseApiSuccess = (message: string): string => {
  const translations: { [key: string]: string } = {
    'Kayıt başarılı': 'Hesabınız başarıyla oluşturuldu!',
    'Giriş başarılı': 'Hoş geldiniz!',
    'User created successfully': 'Hesabınız başarıyla oluşturuldu!',
    'Login successful': 'Hoş geldiniz!',
  };

  return translations[message] || message;
};