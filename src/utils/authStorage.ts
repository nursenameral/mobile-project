import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'userToken';
const USER_DATA_KEY = 'userData';
const REMEMBER_ME_KEY = 'rememberMe';

export interface StoredUserData {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Token kaydetme (Remember Me ile)
export const saveAuthData = async (token: string, userData: StoredUserData, rememberMe: boolean = false) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
  } catch (error) {
    console.error('Auth data kaydetme hatası:', error);
  }
};

// Token alma
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Token alma hatası:', error);
    return null;
  }
};

// Kullanıcı bilgileri alma
export const getUserData = async (): Promise<StoredUserData | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('User data alma hatası:', error);
    return null;
  }
};

// Remember Me durumu kontrol etme
export const getRememberMe = async (): Promise<boolean> => {
  try {
    const rememberMe = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    return rememberMe === 'true';
  } catch (error) {
    console.error('Remember me kontrolü hatası:', error);
    return false;
  }
};

// Login durumu kontrol etme (Remember Me ve token geçerliliği)
export const checkAuthStatus = async (): Promise<{
  isLoggedIn: boolean;
  token: string | null;
  userData: StoredUserData | null;
}> => {
  try {
    const rememberMe = await getRememberMe();
    
    if (!rememberMe) {
      return { isLoggedIn: false, token: null, userData: null };
    }

    const token = await getAuthToken();
    const userData = await getUserData();

    if (token && userData) {
      return { isLoggedIn: true, token, userData };
    }

    return { isLoggedIn: false, token: null, userData: null };
  } catch (error) {
    console.error('Auth status kontrolü hatası:', error);
    return { isLoggedIn: false, token: null, userData: null };
  }
};

// Çıkış yapma (tüm verileri silme)
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY, REMEMBER_ME_KEY]);
  } catch (error) {
    console.error('Auth data silme hatası:', error);
  }
};