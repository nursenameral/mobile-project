// src/components/AppTextInput.tsx
import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  TouchableOpacity 
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AppText } from './AppText';

interface AppTextInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  error?: string;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({ 
  label,
  value,
  onChangeText,
  isPassword = false,
  error,
  ...props 
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <AppText variant="body" style={styles.label}>
        {label}
      </AppText>
      
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {label === 'Email' && (
          <MaterialIcons name="email" size={18} color="#999999" style={styles.inputIcon} />
        )}
        {label === 'Password' && (
          <MaterialIcons name="lock" size={18} color="#999999" style={styles.inputIcon} />
        )}
        {label === 'Confirm Password' && (
          <MaterialIcons name="lock" size={18} color="#999999" style={styles.inputIcon} />
        )}
        {label === 'Name' && (
          <MaterialIcons name="person" size={18} color="#999999" style={styles.inputIcon} />
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isPasswordVisible}
          placeholderTextColor="#999999"
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <MaterialIcons 
              name={isPasswordVisible ? 'visibility' : 'visibility-off'} 
              size={20} 
              color="#999999" 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <AppText variant="small" style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    color: '#616161',
    marginBottom: 8,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#5C6B73',
    backgroundColor: 'transparent',
    paddingBottom: 8,
  },
  inputError: {
    borderBottomColor: '#FF0000',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 0,
    fontSize: 16,
    color: '#333333',
  },
  eyeButton: {
    padding: 8,
  },
  errorText: {
    color: '#FF0000',
    marginTop: 4,
  },
});