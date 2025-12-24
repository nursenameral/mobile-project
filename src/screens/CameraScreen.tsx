<<<<<<< Updated upstream
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/AppNavigator';
import { AppContainer, AppText } from '../components';

// Kütüphaneler
import { launchCamera, launchImageLibrary, MediaType } from 'react-native-image-picker';

// Servis (Yolunuza göre kontrol edin)
import { analyzeInvoice } from '../services/azureService';

type CameraScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Camera'>;

interface CameraScreenProps {
  navigation: CameraScreenNavigationProp;
}

// Sonuç verisi tipi
interface InvoiceResult {
  faturaNo: string;
  tarih: string;
  toplamTutar: string;
  satici: string;
  vergi: string;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvoiceResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Seçim Menüsü
  const handleImageSelection = () => {
    Alert.alert(
      "Fatura Tara",
      "Lütfen bir yöntem seçiniz:",
      [
        { text: "Kamera ile Çek", onPress: () => openPicker('camera') },
        { text: "Galeriden Seç", onPress: () => openPicker('gallery') },
        { text: "İptal", style: "cancel" },
      ]
    );
  };

  // Kamera/Galeri İşlevi
  const openPicker = async (type: 'camera' | 'gallery') => {
    setResult(null);
    setSelectedImage(null);

    const commonOptions = {
      mediaType: 'photo' as MediaType,
      includeBase64: true,
      quality: 0.8,
      selectionLimit: 1,
    };

    try {
      let response;
      if (type === 'camera') {
        response = await launchCamera({ ...commonOptions, cameraType: 'back', saveToPhotos: false });
      } else {
        response = await launchImageLibrary(commonOptions);
      }

      if (response.didCancel) return;
      
      if (response.errorCode) {
        Alert.alert('Hata', response.errorMessage || 'Bir hata oluştu');
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) setSelectedImage(asset.uri);
        if (asset.base64) processInvoice(asset.base64);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Hata", "Resim işlenirken sorun oluştu.");
    }
  };

  // Azure Analizi
  const processInvoice = async (base64: string) => {
    setLoading(true);
    try {
      const data = await analyzeInvoice(base64);
      if (data && data.faturaNo) {
        setResult(data as InvoiceResult); 
      } else if (data && !data.success && data.message) {
         Alert.alert("Bilgi", data.message);
      }
    } catch (error: any) {
      Alert.alert("Hata", error.message || "Analiz başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* --- TASARIM GÜNCELLEMESİ: Üst Vektör Resmi --- */}
        {/* Not: Vector3.png dosyasının ../pics/ klasöründe olduğundan emin olun */}
        <Image 
          source={require('../pics/Vector3.png')} 
          style={styles.topVector}
        />

        {/* --- TASARIM GÜNCELLEMESİ: Header --- */}
        <View style={styles.header}>
          
          <AppText variant="body" style={styles.subtitle}>
            
          </AppText>
          <AppText variant="title" style={styles.title}>
            Fiş ve fatura tarama
          </AppText>

        </View>

        {/* İçerik Alanı */}
        <View style={styles.content}>
          
          {/* 1. Resim Önizleme Alanı (Kart Tasarımı) */}
          <TouchableOpacity onPress={handleImageSelection} style={styles.previewCard}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="contain" />
            ) : (
              <View style={styles.placeholderContainer}>
                {/* Buraya bir ikon eklenebilir */}
                <AppText variant="body" style={styles.placeholderText}>
                  + Fotoğraf Yükle
                </AppText>
                <AppText variant="body" style={styles.placeholderSubText}>
                  Kamera veya Galeri
                </AppText>
              </View>
            )}
          </TouchableOpacity>

          {/* 2. Aksiyon Butonu */}
          <TouchableOpacity 
            style={[styles.actionButton, loading && styles.disabledButton]} 
            onPress={handleImageSelection}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <AppText variant="body" style={styles.buttonText}>
                {selectedImage ? "Yeniden Çek" : "Fatura Tara"}
              </AppText>
            )}
          </TouchableOpacity>

          {/* 3. Sonuç Kartı */}
          {result && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeaderRow}>
                 <AppText variant="title" style={styles.resultTitle}>Analiz Sonucu</AppText>
                 <AppText variant="body" style={styles.successBadge}>Tamamlandı</AppText>
              </View>
              
              <View style={styles.divider} />

              <View style={styles.row}>
                <AppText variant="body" style={styles.label}>Satıcı:</AppText>
                <AppText variant="body" style={styles.value}>{result.satici}</AppText>
              </View>
              
              <View style={styles.row}>
                <AppText variant="body" style={styles.label}>Tarih:</AppText>
                <AppText variant="body" style={styles.value}>{result.tarih}</AppText>
              </View>

              <View style={styles.row}>
                <AppText variant="body" style={styles.label}>Fatura No:</AppText>
                <AppText variant="body" style={styles.value}>{result.faturaNo}</AppText>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <AppText variant="body" style={styles.label}>Toplam:</AppText>
                <AppText variant="body" style={[styles.value, styles.totalValue]}>{result.toplamTutar}</AppText>
              </View>
            </View>
          )}

        </View>
      </ScrollView>
=======
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
>>>>>>> Stashed changes
    </AppContainer>
  );
};

const styles = StyleSheet.create({
<<<<<<< Updated upstream
  // --- TASARIM GÜNCELLEMESİ: InvoiceScreen Stilleri ---
  container: {
    flex: 1,
    backgroundColor: '#EEF7FA', // InvoiceScreen arka plan rengi
  },
  topVector: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10, // Resim olduğu için biraz kıstım
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // --- Fonksiyonel Stiller (Kart Görünümleri) ---
  previewCard: {
    width: '100%',
    height: 220,
    backgroundColor: '#FFFFFF', // Beyaz kart
    borderRadius: 20,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    // Hafif gölge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    color: '#424242',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeholderSubText: {
    color: '#9E9E9E',
    fontSize: 14,
  },
  
  // Buton
  actionButton: {
    backgroundColor: '#007AFF', // Ana tema rengi
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Sonuç Alanı
  resultCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  successBadge: {
    fontSize: 12,
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: '#757575',
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: '#212121',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    paddingLeft: 10,
  },
  totalValue: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
=======
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
>>>>>>> Stashed changes
});

export default CameraScreen;