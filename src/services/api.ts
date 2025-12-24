// API Service
const BASE_URL = 'http://10.0.2.2:8000/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Receipt {
  id: number;
  user_id: number;
  tutar: string;
  baslik: string;
  tur: 'gıda' | 'sağlık' | 'ulaşım' | 'eğlence' | 'giyim' | 'diğer';
  tarih: string;
  saat: string;
  created_at: string;
  updated_at: string;
}

export interface ReceiptsResponse {
  receipts: Receipt[];
  toplam_tutar: string;
  adet: number;
}

export interface ReceiptFilterParams {
  tur?: 'gıda' | 'sağlık' | 'ulaşım' | 'eğlence' | 'giyim' | 'diğer';
  baslangic_tarih?: string; // YYYY-MM-DD
  bitis_tarih?: string;     // YYYY-MM-DD
}

export interface ReceiptSummaryItem {
  tur: string;
  toplam: number;
  adet: number;
  yuzde: number;
}

export interface ReceiptSummaryResponse {
  periyot: 'haftalık' | 'aylık' | 'yıllık';
  tarih_araligi: {
    baslangic: string;
    bitis: string;
  };
  tur_ozeti: ReceiptSummaryItem[];
  genel_toplam: number;
  genel_adet: number;
}

// ===== Invoices =====
export type InvoiceType = 'elektrik' | 'su' | 'dogalgaz';

export interface Invoice {
  id: number;
  user_id: number;
  tutar: string; // decimal string
  baslik: string;
  tur: InvoiceType;
  son_odeme_tarihi: string; // YYYY-MM-DD
  durum: 'odenmedi' | 'odendi';
  created_at?: string;
  updated_at?: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
}

export type LastTwoByTypeMap = Record<InvoiceType, Invoice[]>;

export interface LastTwoByTypeResponse {
  last_two_by_type: LastTwoByTypeMap;
}

// Change password request body
export interface ChangePasswordRequest {
  current_password?: string;
  password: string;
  password_confirmation: string;
}

// Change password API (expects backend endpoint `/change-password`)
export const changePassword = async (
  token: string,
  body: ChangePasswordRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${BASE_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({ success: false, message: 'Beklenmeyen yanıt' }));

    if (!response.ok) {
      if (data?.errors) {
        const errorMessages = Object.values(data.errors).flat();
        throw new Error(errorMessages.join(', '));
      }
      // 404 için özel mesaj ver, backend ucu henüz yoksa anlaşılır olsun
      if (response.status === 404) {
        throw new Error('Şifre değiştirme uç noktası backend’de tanımlı değil. Lütfen API eklenince tekrar deneyin.');
      }
      throw new Error(data?.message || 'Şifre değiştirilemedi');
    }

    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Ağ hatası oluştu');
  }
};

// Login API fonksiyonu
export const loginUser = async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      // Backend'den gelen hataları işle
      if (data.errors) {
        const errorMessages = Object.values(data.errors).flat();
        throw new Error(errorMessages.join(', '));
      }
      throw new Error(data.message || 'Giriş başarısız');
    }
    
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Ağ hatası oluştu');
  }
};

// Register API fonksiyonu  
export const registerUser = async (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      // Backend'den gelen hataları işle
      if (data.errors) {
        const errorMessages = Object.values(data.errors).flat();
        throw new Error(errorMessages.join(', '));
      }
      throw new Error(data.message || 'Kayıt başarısız');
    }
    
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Ağ hatası oluştu');
  }
};

// Get current user API fonksiyonu
export const getCurrentUser = async (token: string): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Kullanıcı bilgisi alınamadı');
    }
    
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Ağ hatası oluştu');
  }
};

// Logout API fonksiyonu
export const logoutUser = async (token: string): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Çıkış başarısız');
    }
    
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Ağ hatası oluştu');
  }
};

// Get receipts API fonksiyonu
export const getReceipts = async (token: string, params?: ReceiptFilterParams): Promise<ApiResponse<ReceiptsResponse>> => {
  try {
    const query = params
      ? `?${new URLSearchParams(
          Object.entries(params).reduce((acc: Record<string, string>, [k, v]) => {
            if (v !== undefined && v !== null && `${v}`.length > 0) acc[k] = `${v}`;
            return acc;
          }, {})
        ).toString()}`
      : '';

    const response = await fetch(`${BASE_URL}/receipts${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Fişler alınamadı');
    }
    
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Ağ hatası oluştu');
  }
};

// Delete receipt API
export const deleteReceipt = async (token: string, id: number): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${BASE_URL}/receipts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => ({ success: false, message: 'Beklenmeyen yanıt' }));

    if (!response.ok) {
      if (data?.errors) {
        const errorMessages = Object.values(data.errors).flat();
        throw new Error(errorMessages.join(', '));
      }
      throw new Error(data?.message || 'Fiş silinemedi');
    }

    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Ağ hatası oluştu');
  }
};

// Get receipts summary API fonksiyonu
export const getReceiptsSummary = async (
  token: string, 
  periyot: 'haftalık' | 'aylık' | 'yıllık'
): Promise<ApiResponse<ReceiptSummaryResponse>> => {
  try {
    const response = await fetch(`${BASE_URL}/receipts/summary/all?periyot=${periyot}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Özet bilgisi alınamadı');
    }
    
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Ağ hatası oluştu');
  }
};

// Get unpaid invoices
export const getUnpaidInvoices = async (token: string): Promise<ApiResponse<InvoicesResponse>> => {
  try {
    const response = await fetch(`${BASE_URL}/invoices/unpaid`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Faturalar alınamadı');
    }
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Ağ hatası oluştu');
  }
};

// Get last two invoices by type
export const getInvoicesLastTwoByType = async (token: string): Promise<ApiResponse<LastTwoByTypeResponse>> => {
  try {
    const response = await fetch(`${BASE_URL}/invoices/last-two-by-type`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Fatura özeti alınamadı');
    }
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Ağ hatası oluştu');
  }
};

// Pay invoice
export const payInvoice = async (token: string, id: number): Promise<ApiResponse<{ invoice: Invoice }>> => {
  try {
    const response = await fetch(`${BASE_URL}/invoices/${id}/pay`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Fatura ödenemedi');
    }
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Ağ hatası oluştu');
  }
};

// Delete invoice
export const deleteInvoice = async (token: string, id: number): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${BASE_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => ({ success: false, message: 'Beklenmeyen yanıt' }));
    if (!response.ok) {
      if ((data as any)?.errors) {
        const errorMessages = Object.values((data as any).errors).flat();
        throw new Error((errorMessages as string[]).join(', '));
      }
      throw new Error((data as any)?.message || 'Fatura silinemedi');
    }
    return data as ApiResponse<null>;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Ağ hatası oluştu');
  }
};