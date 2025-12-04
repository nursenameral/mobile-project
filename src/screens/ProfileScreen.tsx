import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppContainer, AppText, AppButton } from '../components';
import { clearAuthData } from '../utils/authStorage';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAuthData();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Welcome' }],
                })
              );
            } catch (error) {
              console.error('Logout hatası:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
            }
          },
        },
      ]
    );
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
        <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <AppText variant="title" style={styles.title}>
              Profil
            </AppText>
            <AppText variant="body" style={styles.subtitle}>
              Hesap ayarları ve bilgileri
            </AppText>
          </View>

          <View style={styles.content}>
            <AppText variant="body" style={styles.placeholder}>
              Profile içeriği burada olacak
            </AppText>

            <View style={styles.logoutContainer}>
              <AppButton
                title="Çıkış Yap"
                onPress={handleLogout}
                variant="secondary"
                style={styles.logoutButton}
              />
            </View>
          </View>
        </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  subtitle: {
    color: '#616161',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    color: '#616161',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  logoutContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  logoutButton: {
    marginTop: 16,
  },
});

export default ProfileScreen;