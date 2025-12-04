import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/AppNavigator';
import { AppContainer, AppText } from '../components';

type CameraScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Camera'>;

interface CameraScreenProps {
  navigation: CameraScreenNavigationProp;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
  return (
    <AppContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="title" style={styles.title}>
            Kamera
          </AppText>
          <AppText variant="body" style={styles.subtitle}>
            Fiş ve fatura tarama
          </AppText>
        </View>

        <View style={styles.content}>
          <AppText variant="body" style={styles.placeholder}>
            Camera içeriği burada olacak
          </AppText>
        </View>
      </ScrollView>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF7FA',
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
  },
});

export default CameraScreen;