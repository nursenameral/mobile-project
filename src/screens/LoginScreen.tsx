import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppContainer, AppText, AppButton, AppTextInput, Toast } from '../components';
import { loginUser } from '../services/api';
import { useToast } from '../hooks/useToast';
import { parseApiError, parseApiSuccess } from '../utils/errorHelper';
import { saveAuthData } from '../utils/authStorage';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showError('Email ve şifre alanlarını doldurun');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({ email: email.trim(), password });
      
      if (response.success && response.data) {
        // Token'ı ve kullanıcı bilgilerini kaydet (Remember Me durumuna göre)
        await saveAuthData(response.data.token, response.data.user, rememberMe);
        
        showSuccess(parseApiSuccess('Giriş başarılı!'));
        setTimeout(() => {
          navigation.navigate('MainTabs');
        }, 1500);
      }
    } catch (error) {
      showError(parseApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Forgot password sayfasına gidilecek
    console.log('Forgot password');
  };

  return (
    <AppContainer>
      <View style={styles.container}>
        {/* Üst kısım - Vector görseli */}
        <Image 
          source={require('../pics/Vector1.png')} 
          style={styles.vectorImage}
          resizeMode="stretch"
        />

        {/* Alt kısım - Login formu */}
        <View style={styles.formSection}>
          <View style={styles.formContainer}>
            <AppText variant="title" style={styles.title}>
              Sign in
            </AppText>
            <View style={styles.titleUnderline} />

            <AppTextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="demo@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AppTextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="enter your password"
              isPassword={true}
            />

            {/* Remember Me */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxSelected]}>
                  {rememberMe && <View style={styles.checkboxFill} />}
                </View>
                <AppText variant="small" style={styles.rememberText}>
                  Remember Me
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Login Butonu */}
            <AppButton
              title={loading ? "Giriş yapılıyor..." : "Login"}
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
            />

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <AppText variant="small" style={styles.signupText}>
                Don't have an Account? 
              </AppText>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <AppText variant="small" style={styles.signupLink}>
                  Sign up
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  vectorImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%', // Login sayfasında biraz daha kısa
    width: '100%',
  },
  formSection: {
    position: 'absolute',
    top: '39%',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    color: '#424242',
    marginBottom: 0,
    paddingBottom: 0,
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 46,
  },
  titleUnderline: {
    width: 80,
    height: 3,
    backgroundColor: '#5C6B73',
    marginTop: 2,
    paddingTop: 0,
    marginBottom: 28,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 120,
    marginTop: 12,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#C2DFE3',
    borderRadius: 2,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    borderColor: '#C2DFE3',
  },
  checkboxFill: {
    width: 10,
    height: 10,
    backgroundColor: '#C2DFE3',
    borderRadius: 1,
  },
  rememberText: {
    color: '#424242',
    fontWeight: '700',
  },
  loginButton: {
    marginBottom: 20,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#666666',
  },
  signupLink: {
    color: '#253237',
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default LoginScreen;