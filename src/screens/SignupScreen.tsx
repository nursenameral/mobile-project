import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppContainer, AppText, AppButton, AppTextInput, Toast } from '../components';
import { registerUser } from '../services/api';
import { useToast } from '../hooks/useToast';
import { parseApiError, parseApiSuccess } from '../utils/errorHelper';

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;

interface SignupScreenProps {
  navigation: SignupScreenNavigationProp;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const handleSignup = async () => {
    // Validasyon kontrolleri
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showError('Tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      showError('Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 8) {
      showError('Şifre en az 8 karakter olmalıdır');
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
      });
      
      if (response.success && response.data) {
        showSuccess(parseApiSuccess('Kayıt başarılı! Giriş yapabilirsiniz.'));
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      }
    } catch (error) {
      showError(parseApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <View style={styles.container}>
        {/* Üst kısım - Vector görseli */}
        <Image 
          source={require('../pics/Vector2.png')} 
          style={styles.vectorImage}
          resizeMode="stretch"
        />

        {/* Alt kısım - Signup formu */}
        <View style={styles.formSection}>
          <View style={styles.formContainer}>
            <AppText variant="title" style={styles.title}>
              Sign up
            </AppText>
            <View style={styles.titleUnderline} />

            <AppTextInput
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="enter your name"
              autoCapitalize="words"
            />

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

            <AppTextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="confirm your password"
              isPassword={true}
            />

            {/* Sign Up Butonu */}
            <AppButton
              title={loading ? "Hesap oluşturuluyor..." : "Create Account"}
              onPress={handleSignup}
              disabled={loading}
              style={styles.signupButton}
            />

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <AppText variant="small" style={styles.loginText}>
                Already have an Account? 
              </AppText>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <AppText variant="small" style={styles.loginLink}>
                  Login
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
    height: '35%',
    width: '100%',
  },
  formSection: {
    position: 'absolute',
    top: '28%',
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
  signupButton: {
    marginTop: 60,
    marginBottom: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666666',
  },
  loginLink: {
    color: '#253237',
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default SignupScreen;
