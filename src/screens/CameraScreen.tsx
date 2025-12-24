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
    </AppContainer>
  );
};

const styles = StyleSheet.create({
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
});

export default CameraScreen;