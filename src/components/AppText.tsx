// src/components/AppText.tsx
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  variant?: 'title' | 'subtitle' | 'body' | 'small';
}

export const AppText: React.FC<AppTextProps> = ({ 
  children, 
  variant = 'body', 
  style, 
  ...props 
}) => {
  const textStyle = [
    styles.base,
    styles[variant],
    style
  ];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System', // Bu daha sonra custom font ile değiştirilebilir
    color: '#333333',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  small: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
});