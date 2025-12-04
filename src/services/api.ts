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