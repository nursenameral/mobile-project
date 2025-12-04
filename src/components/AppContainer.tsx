// src/components/AppContainer.tsx
import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AppContainerProps {
  children: React.ReactNode;
  statusBarStyle?: 'dark-content' | 'light-content';
}

export const AppContainer: React.FC<AppContainerProps> = ({ 
  children, 
  statusBarStyle = 'dark-content' 
}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor="#EEF7FA" />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF7FA',
  },
});