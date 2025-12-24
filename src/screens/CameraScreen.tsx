import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Image,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import {
  launchCamera,
  CameraOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { AppContainer } from '../components';

const CameraScreen: React.FC = ({ navigation }: any) => {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Kamera iki kez açılmasın diye guard
  const hasOpenedCamera = useRef(false);

  /**
   * ANDROID CAMERA PERMISSION
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      // Check if camera permission is already granted
      const cameraPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );

      if (!cameraPermission) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Camera permission denied');
          return false;
        }
      }

      console.log('Camera permission granted');
      return true;
    } catch (error) {
      console.log('Permission error:', error);
      return false;
    }
  };

  /**
   * CAMERA AUTO OPEN
   */
  const openCameraAutomatically = async () => {
    if (hasOpenedCamera.current) return;
    hasOpenedCamera.current = true;

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to continue.',
      );
      navigation.goBack();
      return;
    }

    const options: CameraOptions = {
      mediaType: 'photo',
      cameraType: 'back',
      saveToPhotos: false,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
        navigation.goBack();
        return;
      }

      if (response.errorMessage) {
        console.log('Camera Error:', response.errorMessage);
        Alert.alert('Camera Error', response.errorMessage);
        navigation.goBack();
        return;
      }

      if (response.errorCode) {
        console.log('Camera Error Code:', response.errorCode);
        Alert.alert('Camera Error', `Error code: ${response.errorCode}`);
        navigation.goBack();
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        console.log('Photo captured successfully:', uri);
        setCapturedPhoto(uri);
      } else {
        console.log('No photo URI received');
        Alert.alert('Error', 'No photo was captured');
        navigation.goBack();
      }
    });
  };

  /**
   * SCREEN FOCUS → OPEN CAMERA
   * Trigger camera immediately when tab/screen gains focus
   */
  useFocusEffect(
    useCallback(() => {
      hasOpenedCamera.current = false;
      const timeout = setTimeout(() => {
        console.log('Starting camera initialization on focus...');
        openCameraAutomatically();
      }, 300);

      return () => clearTimeout(timeout);
    }, [])
  );

  /**
   * RETAKE PHOTO
   */
  const retakePhoto = () => {
    setCapturedPhoto(null);
    hasOpenedCamera.current = false;
    setTimeout(() => {
      openCameraAutomatically();
    }, 100);
  };

  /**
   * PHOTO PREVIEW
   */
  if (capturedPhoto) {
    return (
      <AppContainer>
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
              <Text style={styles.buttonText}>Yeniden Çek</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppContainer>
    );
  }

  /**
   * LOADING SCREEN (no manual trigger)
   */
  return (
    <AppContainer>
      <View style={styles.emptyScreen}>
        <ActivityIndicator size="large" color="#5C6B73" />
        <Text style={styles.loadingText}>Kamera açılıyor...</Text>
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  emptyScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#424242',
    fontSize: 16,
    fontWeight: '500',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  retakeButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraScreen;
