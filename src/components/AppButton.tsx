// src/components/AppButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: ViewStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary',
  disabled = false,
  style 
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    disabled && styles.disabled,
    style
  ];

  const textColor = variant === 'primary' ? '#F8F8FF' : '#333333';

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <AppText 
        variant="subtitle" 
        style={[styles.text, { color: disabled ? '#999999' : textColor }]}
      >
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primary: {
    backgroundColor: '#9DB4C0', // Görseldeki buton rengi
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8AA6B8',
  },
  disabled: {
    backgroundColor: '#CCCCCC',
  },
  text: {
    fontWeight: '700',
  },
});