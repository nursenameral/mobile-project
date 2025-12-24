import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from '../navigation/AppNavigator';
import { checkAuthStatus } from '../utils/authStorage';
import { AppText } from '../components';

interface AuthState {
  isLoading: boolean;
  isLoggedIn: boolean;
}

const AuthWrapper: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isLoggedIn: false,
  });

  useEffect(() => {
    checkInitialAuthState();
  }, []);

  const checkInitialAuthState = async () => {
    try {
      const authStatus = await checkAuthStatus();
      
      setAuthState({
        isLoading: false,
        isLoggedIn: authStatus.isLoggedIn,
      });
    } catch (error) {
      console.error('Auth kontrol hatası:', error);
      setAuthState({
        isLoading: false,
        isLoggedIn: false,
      });
    }
  };

  // Loading screen
  if (authState.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <AppText variant="title" style={styles.loadingText}>
          Yükleniyor...
        </AppText>
      </View>
    );
  }

  // Ana navigasyon ile birlikte initial route'u belirle
  return (
    <AppNavigator initialRoute={authState.isLoggedIn ? 'MainTabs' : 'Welcome'} />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF7FA',
  },
  loadingText: {
    color: '#424242',
    fontSize: 18,
  },
});

export default AuthWrapper;