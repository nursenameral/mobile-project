import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppContainer, AppText } from '../components';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <AppContainer>
      <View style={styles.container}>
        {/* Üst kısım - Vector görseli */}
        <Image 
          source={require('../pics/Vector.png')} 
          style={styles.vectorImage}
          resizeMode="stretch"
        />

        {/* Alt kısım - İçerik */}
        <View style={styles.bottomSection}>
          <View style={styles.contentContainer}>
            <AppText variant="title" style={styles.title}>
              Welcome
            </AppText>
            
            <AppText variant="body" style={styles.subtitle}>
              SmartExpense uyglamasına hoşgeldiniz.{'\n'}
              Finans Uygulamanız...
            </AppText>

            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Image 
                source={require('../pics/continueButton.png')} 
                style={styles.continueButtonImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppContainer>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  vectorImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '65%',
    width: '100%',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: '#EEF7FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: '#253237',
    marginBottom: 16,
  },
  subtitle: {
    color: '#666666',
    marginBottom: 40,
    lineHeight: 24,
  },
  continueButton: {
    alignSelf: 'flex-end',
    marginTop: 'auto',
  },
  continueButtonImage: {
    width: 120,
    height: 50,
  },
});