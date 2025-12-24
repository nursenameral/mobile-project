import { useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false,
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({
      message,
      type,
      visible: true,
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false,
    }));
  };

  const showSuccess = (message: string) => showToast(message, 'success');
  const showError = (message: string) => showToast(message, 'error');
  const showInfo = (message: string) => showToast(message, 'info');

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
  };
};