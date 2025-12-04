import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/AppNavigator';
import { AppContainer, AppText } from '../components';

type InvoiceScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Invoice'>;

interface InvoiceScreenProps {
  navigation: InvoiceScreenNavigationProp;
}

const InvoiceScreen: React.FC<InvoiceScreenProps> = ({ navigation }) => {
  return (
    <AppContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image 
          source={require('../pics/Vector3.png')} 
          style={styles.topVector}
        />
        
        <View style={styles.header}>
          <AppText variant="title" style={styles.title}>
            Faturalar
          </AppText>
          <AppText variant="body" style={styles.subtitle}>
            Fatura yönetimi ve takibi
          </AppText>
        </View>

        <View style={styles.content}>
          <AppText variant="body" style={styles.placeholder}>
            Invoice içeriği burada olacak
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
  topVector: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
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

export default InvoiceScreen;