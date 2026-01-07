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
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  CameraOptions,
  ImageLibraryOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContainer } from '../components';
import { analyzeInvoice } from '../services/azureService';
import { createReceipt, createInvoice, predictCategory } from '../services/api';
import { 
  RECEIPT_CATEGORIES, 
  INVOICE_CATEGORIES, 
  detectCategory, 
  detectInvoiceCategory 
} from '../utils/categories';

// Tüm kategorileri tek listede birleştiriyoruz (Görünüm için)
const ALL_CATEGORIES = [...RECEIPT_CATEGORIES, ...INVOICE_CATEGORIES];

// Yardımcı: Seçili kategori bir fatura türü mü?
const isInvoiceCategory = (catId: string) => {
  return INVOICE_CATEGORIES.some(c => c.id === catId);
};

interface AzureResult {
  tarih?: string;
  saat?: string;
  toplamTutar?: string;
  satici?: string;
  success: boolean;
  message?: string;
  fullText?: string;
}

const CameraScreen: React.FC = ({ navigation }: any) => {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState({ 
      baslik: '', 
      tutar: '', 
      tarih: '',      // Fiş: İşlem Tarihi
      saat: '',       // Fiş: İşlem Saati
      son_odeme: '',  // Fatura: Son Ödeme Tarihi
      tur: 'diğer'    // Varsayılan kategori
  }); 
  const [isSaving, setIsSaving] = useState(false);

  const hasOpenedCamera = useRef(false);
  const isUserCancelled = useRef(false);

  // --- FORMATLAYICILAR ---
  const parseAmount = (amountStr?: string): number => {
    if (!amountStr) return 0;
    const cleaned = amountStr.replace(/[^0-9.,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const formatDateForBackend = (dateStr?: string) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const match = dateStr.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      let year = match[3];
      if (year.length === 2) year = '20' + year;
      return `${year}-${month}-${day}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const formatTimeForBackend = (timeStr?: string) => {
    if (!timeStr || timeStr === "Belirlenemedi") {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      return `${match[1].padStart(2, '0')}:${match[2]}`;
    }
    return "00:00";
  };

  // --- KAMERA / GALERİ ---
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const cameraPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (!cameraPermission) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Kamera İzni', message: 'Kamera erişimi gerekiyor.', buttonNeutral: 'Daha Sonra', buttonNegative: 'İptal', buttonPositive: 'Tamam',
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (error) { return false; }
  };

  const openCameraAutomatically = async () => {
    if (hasOpenedCamera.current || isUserCancelled.current) return;
    hasOpenedCamera.current = true;
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) { hasOpenedCamera.current = false; return; }
    
    launchCamera({ mediaType: 'photo', cameraType: 'back', saveToPhotos: false, includeBase64: true, quality: 0.8 }, (response) => {
      if (response.didCancel) { isUserCancelled.current = true; return; }
      if (response.errorMessage) { Alert.alert('Hata', response.errorMessage); return; }
      const asset = response.assets?.[0];
      if (asset?.uri) {
        setCapturedPhoto(asset.uri);
        setCapturedBase64(asset.base64 || null);
      }
    });
  };

  const openGallery = () => {
    isUserCancelled.current = true;
    setIsLoading(true);
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.8, includeBase64: true }, (response) => {
      setIsLoading(false);
      if (response.didCancel) { isUserCancelled.current = true; return; }
      const asset = response.assets?.[0];
      if (asset?.uri) {
        setCapturedPhoto(asset.uri);
        setCapturedBase64(asset.base64 || null);
        hasOpenedCamera.current = true;
      }
    });
  };

  const openCameraManually = () => { hasOpenedCamera.current = false; isUserCancelled.current = false; openCameraAutomatically(); };
  const retakePhoto = () => { 
      isUserCancelled.current = false; 
      hasOpenedCamera.current = false; 
      setCapturedPhoto(null); 
      setCapturedBase64(null); 
      setModalVisible(false); 
      setTimeout(() => openCameraAutomatically(), 100); 
  };

  useFocusEffect(useCallback(() => {
    if (capturedPhoto) return;
    hasOpenedCamera.current = false;
    openCameraAutomatically();
    return () => { isUserCancelled.current = false; hasOpenedCamera.current = false; };
  }, [capturedPhoto]));

  // --- ANALİZ ---
const handleAnalyze = async () => {
    if (!capturedBase64) { Alert.alert("Hata", "Görüntü yok."); return; }
    try {
      setIsAnalyzing(true);
      const result: AzureResult = await analyzeInvoice(capturedBase64);

      if (result.success) {
        const satici = result.satici || "";
        const fullText = result.fullText || "";
        
        // 1. Önce Fatura Kontrolü
        let detectedCat = detectInvoiceCategory(satici, fullText);

        // 2. Fatura değilse Fiş Kontrolü
        if (!detectedCat) {
            detectedCat = detectCategory(satici);
        }
        // 3. AI Karar Mekanizması:
        // Eğer kategori hiç bulunamadıysa (null/undefined/boş) VEYA 'diğer' bulunduysa
        // VE (satıcı ismi var VEYA metin uzunluğu 10'dan büyükse) AI'ya sor.
        const shouldAskAI = (!detectedCat || detectedCat === 'diğer') && 
                            (satici.length > 1 || fullText.length > 10);

        if (shouldAskAI) {
             try {
                console.log("🤖 AI Devreye giriyor...");
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    // Backend -> Groq
                    const aiRes = await predictCategory(token, satici, fullText);
                    
                    // AI 'diğer' dışında anlamlı bir şey bulduysa onu kullan
                    if (aiRes?.category && aiRes.category !== 'diğer') {
                        detectedCat = aiRes.category;
                    }
                }
            } catch (e) { console.log("AI hatası", e); }
        }

        const finalCat = detectedCat || 'diğer';

        setEditData({
            baslik: satici || "Bilinmeyen",
            tutar: parseAmount(result.toplamTutar).toString(),
            tarih: result.tarih || "", 
            saat: result.saat || "",   
            son_odeme: result.tarih || "", 
            tur: finalCat
        });
        setModalVisible(true);

      } else {
        Alert.alert("Başarısız", "Belge okunamadı.");
      }
    } catch (error) {
      Alert.alert("Hata", "Analiz hatası.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- KAYDETME (DİNAMİK) ---
  const handleSave = async () => {
      if (!editData.baslik || !editData.tutar) {
          Alert.alert("Eksik", "Başlık ve tutar zorunludur.");
          return;
      }
      setIsSaving(true);
      try {
          const token = await AsyncStorage.getItem('userToken');
          if (!token) { Alert.alert("Hata", "Oturum süreniz dolmuş."); return; }

          // Hangi türde kaydedeceğimize karar veriyoruz
          if (isInvoiceCategory(editData.tur)) {
              // --- FATURA OLARAK KAYDET ---
              const finalDueDate = formatDateForBackend(editData.son_odeme);

              await createInvoice(token, {
                  baslik: editData.baslik,
                  tutar: parseFloat(editData.tutar),
                  son_odeme_tarihi: finalDueDate,
                  tur: editData.tur as any
              });
              Alert.alert("Başarılı", "Fatura kaydedildi!");
              navigation.navigate('Invoice'); 

          } else {
              // --- FİŞ OLARAK KAYDET ---
              const finalDate = formatDateForBackend(editData.tarih);
              const finalTime = formatTimeForBackend(editData.saat);

              await createReceipt(token, {
                  baslik: editData.baslik,
                  tutar: parseFloat(editData.tutar),
                  tarih: finalDate,
                  saat: finalTime,
                  tur: editData.tur as any
              });
              Alert.alert("Başarılı", "Fiş kaydedildi!");
              navigation.navigate('Receipts');
          }

          setModalVisible(false);
          setCapturedPhoto(null); 
          setCapturedBase64(null);

      } catch (error) {
          Alert.alert("Hata", error instanceof Error ? error.message : "Kaydetme başarısız.");
      } finally {
          setIsSaving(false);
      }
  };

  // --- RENDER ---
  const isCurrentInvoice = isInvoiceCategory(editData.tur);

  if (capturedPhoto) {
    return (
      <AppContainer>
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
          
          {isAnalyzing && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Yapay Zeka Analiz Ediyor...</Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto} disabled={isAnalyzing}>
              <Text style={styles.buttonText}>Yeniden Çek</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleAnalyze} disabled={isAnalyzing}>
              <Text style={styles.buttonText}>Analiz Et</Text>
            </TouchableOpacity>
          </View>

          {/* --- BİRLEŞTİRİLMİŞ MODAL --- */}
          <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        {isCurrentInvoice ? 'Fatura Detayları' : 'Fiş Detayları'}
                    </Text>
                    
                    <ScrollView>
                        <Text style={styles.label}>
                            {isCurrentInvoice ? 'Kurum Adı' : 'Satıcı / Mağaza'}
                        </Text>
                        <TextInput style={styles.input} value={editData.baslik} onChangeText={(t) => setEditData({...editData, baslik: t})} />
                        
                        <Text style={styles.label}>Tutar (TL)</Text>
                        <TextInput style={styles.input} value={editData.tutar} keyboardType="numeric" onChangeText={(t) => setEditData({...editData, tutar: t})} />
                        
                        {/* KATEGORİYE GÖRE DEĞİŞEN ALANLAR */}
                        {isCurrentInvoice ? (
                            // FATURA İSE:
                            <View>
                                <Text style={styles.label}>Son Ödeme Tarihi</Text>
                                <TextInput 
                                    style={styles.input} 
                                    value={editData.son_odeme} 
                                    placeholder="GG/AA/YYYY"
                                    onChangeText={(t) => setEditData({...editData, son_odeme: t})} 
                                />
                            </View>
                        ) : (
                            // FİŞ İSE:
                            <View style={styles.row}>
                                <View style={{flex: 1, marginRight: 8}}>
                                    <Text style={styles.label}>Tarih</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        value={editData.tarih} 
                                        placeholder="GG/AA/YYYY"
                                        onChangeText={(t) => setEditData({...editData, tarih: t})} 
                                    />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={styles.label}>Saat</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        value={editData.saat} 
                                        placeholder="14:30"
                                        onChangeText={(t) => setEditData({...editData, saat: t})} 
                                    />
                                </View>
                            </View>
                        )}

                        <Text style={styles.label}>Kategori (Seçim Yapınız)</Text>
                        <View style={styles.catGrid}>
                            {ALL_CATEGORIES.map(cat => (
                                <TouchableOpacity 
                                    key={cat.id} 
                                    style={[
                                        styles.catChip, 
                                        editData.tur === cat.id && styles.catChipSelected,
                                        // Fatura kategorilerini ayırt etmek için ekstra stil (opsiyonel)
                                        isInvoiceCategory(cat.id) && { borderColor: '#FFD700' } 
                                    ]} 
                                    onPress={() => setEditData({...editData, tur: cat.id})}
                                >
                                    <Text>{cat.icon}</Text>
                                    <Text style={[styles.catText, editData.tur === cat.id && styles.catTextSelected]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelText}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} disabled={isSaving}>
                            {isSaving ? <ActivityIndicator color="#fff"/> : <Text style={styles.confirmText}>Kaydet</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      </AppContainer>
    );
  }

  // --- BOŞ EKRAN ---
  return (
    <AppContainer>
      <View style={styles.emptyScreen}>
        {isLoading && <ActivityIndicator size="large" color="#5C6B73" style={{marginBottom: 20}} />}
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cameraButton} onPress={openCameraManually} disabled={isLoading}>
                <Text style={styles.cameraButtonText}>Kamerayı Aç</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryButton} onPress={openGallery} disabled={isLoading}>
                {isLoading ? <ActivityIndicator size="small" color="#007AFF" /> : <Text style={styles.galleryButtonText}>Veya Galeriden Seç</Text>}
            </TouchableOpacity>
        </View>
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  emptyScreen: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  buttonContainer: { width: '100%', alignItems: 'center', gap: 16 },
  cameraButton: { backgroundColor: '#007AFF', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 25, width: '70%', alignItems: 'center', marginBottom: 10, elevation: 3 },
  cameraButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  galleryButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, borderWidth: 1.5, borderColor: '#007AFF', width: '70%', alignItems: 'center' },
  galleryButtonText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  previewContainer: { flex: 1, backgroundColor: '#000' },
  previewImage: { flex: 1, width: '100%', resizeMode: 'contain' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', paddingVertical: 20 },
  retakeButton: { backgroundColor: '#FF6B6B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, minWidth: 120, alignItems: 'center' },
  saveButton: { backgroundColor: '#4ECDC4', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, minWidth: 120, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
  
  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  label: { fontSize: 12, color: '#666', marginBottom: 4, fontWeight: '600' },
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16, color: '#333' },
  row: { flexDirection: 'row' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginBottom: 6, borderWidth: 1, borderColor: '#eee' },
  catChipSelected: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#2196F3' },
  catText: { fontSize: 12, color: '#333', marginLeft: 4 },
  catTextSelected: { color: '#2196F3', fontWeight: 'bold' },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: '#FFEBEE', alignItems: 'center' },
  cancelText: { color: '#D32F2F', fontWeight: 'bold' },
  confirmBtn: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: '#4ECDC4', alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: 'bold' },
});

export default CameraScreen;