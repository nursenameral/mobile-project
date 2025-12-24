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
  ScrollView, 
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary, // YENİ: Galeri kütüphanesi eklendi
  CameraOptions,
  ImagePickerResponse,
  ImageLibraryOptions, // YENİ: Galeri ayarları için tip
} from 'react-native-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { AppContainer } from '../components';
import { analyzeInvoice } from '../services/azureService';

// Tip Tanımları
interface InvoiceResult {
  faturaNo: string;
  tarih: string;
  toplamTutar: string;
  satici: string;
  vergi: string;
}

const CameraScreen: React.FC = ({ navigation }: any) => {
  // State Yönetimi
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<InvoiceResult | null>(null);
  
  // YENİ: Kullanıcı kamerayı iptal ederse menüyü göstermek için state
  const [showMenu, setShowMenu] = useState(false);

  // Kamera guard (çift açılmayı önler)
  const hasOpenedCamera = useRef(false);

  /**
   * ORTAK YANIT İŞLEYİCİ (Hem Kamera Hem Galeri İçin)
   */
  const handleImageResponse = (response: ImagePickerResponse) => {
    // Kullanıcı iptal ettiyse
    if (response.didCancel) {
      console.log('Kullanıcı iptal etti');
      // YENİ MANTIK: İptal ederse sayfadan çıkma, menüyü göster
      setShowMenu(true); 
      return;
    }

    if (response.errorMessage) {
      Alert.alert('Hata', response.errorMessage);
      setShowMenu(true);
      return;
    }

    const asset = response.assets?.[0];
    const uri = asset?.uri;
    const base64 = asset?.base64;

    if (uri) {
      setCapturedPhoto(uri);
      setShowMenu(false); // Resim seçildiği için menüyü gizle

      // Fotoğraf varsa analizi başlat
      if (base64) {
          processInvoice(base64);
      } else {
          Alert.alert("Hata", "Görüntü verisi alınamadı (Base64 eksik).");
      }
    } else {
      setShowMenu(true);
    }
  };

  /**
   * AZURE ANALİZ SÜRECİ
   */
  const processInvoice = async (base64: string) => {
    setAnalyzing(true);
    try {
      console.log("Analiz başlatılıyor...");
      const data = await analyzeInvoice(base64);

      if (data && (data.faturaNo || data.success)) {
        setAnalysisResult(data as InvoiceResult);
      } else {
        Alert.alert("Bilgi", data.message || "Fatura verisi okunamadı.");
      }
    } catch (error: any) {
      console.error("Analiz Hatası:", error);
      Alert.alert("Hata", "Analiz sırasında sorun oluştu.");
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * KAMERA İZNİ (Android)
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const cameraPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (!cameraPermission) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
            title: 'Kamera İzni',
            message: 'Uygulama fatura taramak için kameraya erişmelidir.',
            buttonNeutral: 'Daha Sonra',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (error) { return false; }
  };

  /**
   * KAMERA AÇMA (Manuel veya Otomatik)
   */
  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('İzin Gerekli', 'Kamera izni vermelisiniz.');
      return;
    }

    const options: CameraOptions = {
      mediaType: 'photo',
      cameraType: 'back',
      saveToPhotos: false,
      includeBase64: true,
      quality: 0.8,
    };

    launchCamera(options, handleImageResponse);
  };

  /**
   * YENİ: GALERİ AÇMA FONKSİYONU
   */
  const openGallery = () => {
    const options: ImageLibraryOptions = {
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
        selectionLimit: 1,
    };
    
    launchImageLibrary(options, handleImageResponse);
  };

  /**
   * ODAKLANMA TETİKLEYİCİSİ (Otomatik Başlatma)
   */
  useFocusEffect(
    useCallback(() => {
      // Eğer zaten bir foto varsa veya menü açıksa tekrar kamerayı açma
      if (capturedPhoto || showMenu) return;

      hasOpenedCamera.current = false;
      const timeout = setTimeout(() => {
        if (!hasOpenedCamera.current) {
            hasOpenedCamera.current = true;
            openCamera();
        }
      }, 300);

      return () => clearTimeout(timeout);
    }, [capturedPhoto, showMenu]) // showMenu ve capturedPhoto değişince effect'i yönet
  );

  /**
   * YENİDEN ÇEK / SIFIRLA
   */
  const resetFlow = () => {
    setCapturedPhoto(null);
    setAnalysisResult(null);
    setAnalyzing(false);
    setShowMenu(true); // Direkt menüye dönelim ki kullanıcı seçebilsin
    hasOpenedCamera.current = false; 
  };

  /**
   * ARAYÜZ
   */
  
  // 1. Durum: Fotoğraf Çekildi -> Sonuç Ekranı
  if (capturedPhoto) {
    return (
      <AppContainer>
        <View style={styles.previewContainer}>
          {/* Resim Alanı */}
          <View style={styles.imageWrapper}>
             <Image source={{ uri: capturedPhoto }} style={styles.previewImage} resizeMode="contain" />
          </View>

          {/* Sonuç Alanı */}
          <ScrollView style={styles.resultScroll} contentContainerStyle={styles.resultContent}>
            {analyzing ? (
                <View style={styles.loadingCard}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.analyzingText}>Yapay zeka faturayı okuyor...</Text>
                </View>
            ) : analysisResult ? (
                <View style={styles.resultCard}>
                    <View style={styles.resultHeaderRow}>
                        <Text style={styles.resultTitle}>Analiz Sonucu</Text>
                        <Text style={styles.successBadge}>✓ Tamamlandı</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Satıcı:</Text>
                        <Text style={styles.value}>{analysisResult.satici}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tarih:</Text>
                        <Text style={styles.value}>{analysisResult.tarih}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Toplam:</Text>
                        <Text style={[styles.value, styles.totalValue]}>{analysisResult.toplamTutar}</Text>
                    </View>
                </View>
            ) : (
                <Text style={styles.errorText}>Sonuç görüntülenemedi.</Text>
            )}
          </ScrollView>

          {/* Butonlar */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.retakeButton} onPress={resetFlow} disabled={analyzing}>
              <Text style={styles.buttonText}>Yeni İşlem</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.saveButton, analyzing && styles.disabledButton]} 
                onPress={() => { Alert.alert("Başarılı", "Kaydedildi!"); navigation.goBack(); }}
                disabled={analyzing || !analysisResult}
            >
              <Text style={styles.buttonText}>{analyzing ? "..." : "Kaydet"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppContainer>
    );
  }

  // 2. Durum: Kullanıcı Otomatik Kamerayı İptal Etti -> Menü Ekranı (YENİ)
  if (showMenu) {
      return (
        <AppContainer>
            <View style={styles.menuContainer}>
                <Image source={require('../pics/Vector3.png')} style={styles.topVector} />
                
                <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>Fatura Yükle</Text>
                    <Text style={styles.menuSubtitle}>Devam etmek için bir yöntem seçin</Text>

                    <TouchableOpacity style={styles.menuButton} onPress={openCamera}>
                        <Text style={styles.menuButtonText}>📸  Kamerayı Aç</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuButton, styles.galleryButton]} onPress={openGallery}>
                        <Text style={[styles.menuButtonText, styles.galleryButtonText]}>🖼️  Galeriden Seç</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </AppContainer>
      );
  }

  // 3. Durum: İlk Yükleme (Otomatik Açılış Bekleniyor)
  return (
    <AppContainer>
      <View style={styles.emptyScreen}>
        <ActivityIndicator size="large" color="#5C6B73" />
        <Text style={styles.loadingText}>Kamera başlatılıyor...</Text>
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  // Genel
  emptyScreen: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#424242', fontSize: 16 },
  
  // Menü Ekranı Stilleri (YENİ)
  menuContainer: { flex: 1, backgroundColor: '#EEF7FA' },
  topVector: { width: '100%', height: 200, resizeMode: 'cover' },
  menuContent: { padding: 24, alignItems: 'center', marginTop: 20 },
  menuTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  menuSubtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  menuButton: {
      backgroundColor: '#007AFF',
      width: '100%',
      padding: 18,
      borderRadius: 16,
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: '#007AFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
  },
  galleryButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#007AFF', shadowColor: 'transparent' },
  menuButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  galleryButtonText: { color: '#007AFF' },

  // Sonuç Ekranı Stilleri
  previewContainer: { flex: 1, backgroundColor: '#F5F7FA' },
  imageWrapper: { height: 300, backgroundColor: '#E1E4E8', justifyContent: 'center' },
  previewImage: { width: '100%', height: '100%' },
  resultScroll: { flex: 1 },
  resultContent: { padding: 20 },
  loadingCard: { padding: 30, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16 },
  analyzingText: { marginTop: 16, color: '#333', fontWeight: 'bold' },
  resultCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, elevation: 3 },
  resultHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  successBadge: { color: '#2E7D32', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { color: '#757575', fontWeight: '500' },
  value: { color: '#212121', fontWeight: '600', flex: 1, textAlign: 'right' },
  totalValue: { color: '#007AFF', fontWeight: 'bold', fontSize: 20 },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 12 },
  errorText: { color: '#FF5252', textAlign: 'center', marginTop: 20 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#FFFFFF', padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' },
  retakeButton: { backgroundColor: '#FF6B6B', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 25, minWidth: 130, alignItems: 'center' },
  saveButton: { backgroundColor: '#4ECDC4', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 25, minWidth: 130, alignItems: 'center' },
  disabledButton: { backgroundColor: '#CFD8DC' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default CameraScreen;