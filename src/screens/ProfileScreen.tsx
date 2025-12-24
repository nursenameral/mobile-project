import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppContainer, AppText, AppButton, AppTextInput } from '../components';
import { clearAuthData, getAuthToken, getUserData, saveAuthData } from '../utils/authStorage';
import { getCurrentUser, logoutUser, changePassword } from '../services/api';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [resetVisible, setResetVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = await getAuthToken();
        if (!storedToken) {
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] })
          );
          return;
        }
        setToken(storedToken);

        // Önce local user verisini göster, sonra API ile güncelle
        const localUser = await getUserData();
        if (localUser) {
          setEmail(localUser.email);
          setName(localUser.name);
        }

        // Backend'den güncel kullanıcıyı çek
        const me = await getCurrentUser(storedToken);
        if (me?.success && me.data?.user) {
          setEmail(me.data.user.email);
          setName(me.data.user.name);
          // Local'i senkron tut (rememberMe bayrağı korunur)
          await saveAuthData(storedToken, me.data.user, true);
        }
      } catch (e) {
        // Token hatalıysa logout akışına yönlendir
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] })
        );
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigation]);

  const handleLogout = () => setLogoutVisible(true);

  const confirmLogout = async () => {
    try {
      if (token) {
        try {
          await logoutUser(token);
        } catch (_) {
          // API hatası olsa bile local temizleyip çıkışa devam
        }
      }
      await clearAuthData();
      setLogoutVisible(false);
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] })
      );
    } catch (error) {
      console.error('Logout hatası:', error);
      setLogoutVisible(false);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
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
        <Image 
          source={require('../pics/account.png')} 
          style={styles.accountIcon}
        />

        {/* Alt kısım - Profile içeriği */}
        <ScrollView
          style={styles.contentSection}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formContainer}>
            <AppText variant="title" style={styles.pageTitle}> </AppText>

            {loading ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color="#5C6B73" />
              </View>
            ) : (
              <>
                <AppTextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  editable={false}
                  placeholder="demo@email.com"
                />

                <AppTextInput
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  editable={false}
                  placeholder="Adınız"
                />

                <AppTextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  isPassword
                  placeholder="Change the password"
                />

                <View style={styles.rowActions}>
                  <AppButton
                    title="Reset Pass"
                    onPress={() => setResetVisible(true)}
                    variant="secondary"
                    style={styles.resetBtn}
                  />
                </View>

                {/* Logout butonu artık sabit altta, içerikte gösterilmiyor */}
              </>
            )}
          </View>
        </ScrollView>

        {/* Sayfanın altında sabit Logout butonu */}
        {!loading && (
          <AppButton
            title="Log Out"
            onPress={handleLogout}
            variant="primary"
            style={[styles.logoutButton, styles.fixedLogoutButton]}
          />
        )}

        {/* Reset Password Modal */}
        <Modal visible={resetVisible} transparent animationType="slide" onRequestClose={() => setResetVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <AppText variant="title" style={styles.modalTitle}>Reset Password</AppText>
              <AppText variant="body" style={styles.modalSubtitle}>Lütfen mevcut şifrenizi ve yeni şifrenizi girin.</AppText>

              <AppTextInput
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                isPassword
                placeholder="Mevcut şifreniz"
              />
              <AppTextInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword
                placeholder="Yeni şifre (min 8)"
              />
              <AppTextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                placeholder="Yeni şifre (tekrar)"
              />

              <View style={styles.modalActions}>
                <AppButton
                  title={submitting ? 'Gönderiliyor…' : 'Onayla'}
                  onPress={async () => {
                    if (submitting) return;
                    try {
                      if (!token) {
                        Alert.alert('Hata', 'Oturum bulunamadı.');
                        return;
                      }
                      if (newPassword.length < 8) {
                        Alert.alert('Uyarı', 'Yeni şifre en az 8 karakter olmalı.');
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        Alert.alert('Uyarı', 'Yeni şifreler eşleşmiyor.');
                        return;
                      }
                      setSubmitting(true);
                      await changePassword(token, {
                        current_password: currentPassword,
                        password: newPassword,
                        password_confirmation: confirmPassword,
                      });
                      Alert.alert('Başarılı', 'Şifreniz güncellendi.');
                      setResetVisible(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPassword('');
                    } catch (err) {
                      Alert.alert('Hata', err instanceof Error ? err.message : 'İşlem başarısız');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  variant="primary"
                  style={styles.modalPrimary}
                />
                <AppButton
                  title="İptal"
                  onPress={() => setResetVisible(false)}
                  variant="secondary"
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Logout Confirm Modal - themed */}
        <Modal visible={logoutVisible} transparent animationType="fade" onRequestClose={() => setLogoutVisible(false)}>
          <View style={styles.logoutBackdrop}>
            <View style={styles.logoutCard}>
              <AppText variant="title" style={styles.logoutTitle}>Çıkış yapmak istiyor musunuz?</AppText>
              <AppText variant="body" style={styles.logoutSubtitle}>Hesabınızdan çıkış yapacak ve giriş ekranına döneceksiniz.</AppText>
              <View style={styles.logoutActions}>
                <AppButton title="İptal" onPress={() => setLogoutVisible(false)} variant="secondary" style={styles.logoutCancel} />
                <AppButton title="Çıkış Yap" onPress={confirmLogout} variant="primary" style={styles.logoutConfirm} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
  accountIcon: {
    position: 'absolute',
    width: 120,
    height: 120,
    top: '8%',
    left: '50%',
    marginLeft: -60,
    zIndex: 2,
  },
  contentSection: {
    position: 'absolute',
    top: '28%',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pageTitle: {
    color: '#8697A8',
    fontSize: 16,
    marginBottom: 12,
  },
  rowActions: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: '#D87070',
    borderRadius: 12,
  },
  fixedLogoutButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    zIndex: 5,
  },
  resetBtn: {
    backgroundColor: '#C2DEE6',
    borderColor: '#C2DEE6',
    width: 150,
  },
  loaderWrap: {
    marginTop: 40,
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#EEF7FA',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    marginBottom: 6,
    color: '#424242',
  },
  modalSubtitle: {
    color: '#616161',
    marginBottom: 12,
  },
  modalActions: {
    marginTop: 8,
  },
  modalPrimary: {
    backgroundColor: '#9DB4C0',
    marginBottom: 10,
  },
  // Logout themed modal
  logoutBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutCard: {
    width: '92%',
    backgroundColor: '#EEF7FA',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutTitle: {
    color: '#424242',
    marginBottom: 6,
    textAlign: 'center',
  },
  logoutSubtitle: {
    color: '#616161',
    marginBottom: 16,
    textAlign: 'center',
  },
  logoutActions: {
    flexDirection: 'row',
    gap: 12,
  },
  logoutCancel: {
    flex: 1,
    backgroundColor: '#C2DEE6',
    borderColor: '#C2DEE6',
  },
  logoutConfirm: {
    flex: 1,
    backgroundColor: '#D87070',
  },
},
);

export default ProfileScreen;