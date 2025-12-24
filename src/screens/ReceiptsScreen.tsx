import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/AppNavigator';
import { AppContainer, AppText } from '../components';
import { getCategoryColor } from '../utils/categoryColors';
import { getReceipts, deleteReceipt, Receipt } from '../services/api';
// Native picker replaced by themed modal
import DateRangePickerModal from '../components/DateRangePickerModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

type ReceiptsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Receipts'>;

interface ReceiptsScreenProps {
  navigation: ReceiptsScreenNavigationProp;
}

const ReceiptsScreen: React.FC<ReceiptsScreenProps> = ({ navigation }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState<string>('0');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({ visible: false, message: '', type: 'success' });
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [rangeVisible, setRangeVisible] = useState(false);


  useEffect(() => {
    fetchReceipts();
  }, []);

  // Ekrana yeniden odaklanıldığında otomatik yenile ve filtreleri sıfırla
  useFocusEffect(
    useCallback(() => {
      setStartDate(null);
      setEndDate(null);
      setSelectedCategory(null);
      setLoading(true);
      fetchReceipts(null, null, null);
      return () => {};
    }, [])
  );

  const fetchReceipts = async (start?: Date | null, end?: Date | null, category?: string | null) => {
    try {
      console.log('Fetching receipts...');
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token:', token ? 'EXISTS' : 'NOT FOUND');
      
      if (!token) {
        Alert.alert('Hata', 'Oturum süreniz dolmuş, lütfen tekrar giriş yapın.');
        return;
      }

      const useStart = start !== undefined ? start : startDate;
      const useEnd = end !== undefined ? end : endDate;
      const useCategory = category !== undefined ? category : selectedCategory;

      console.log('Calling API with filters:', {
        start: useStart ? formatForApi(useStart) : 'none',
        end: useEnd ? formatForApi(useEnd) : 'none',
        category: useCategory || 'none'
      });
      const response = await getReceipts(token, {
        baslangic_tarih: useStart ? formatForApi(useStart) : undefined,
        bitis_tarih: useEnd ? formatForApi(useEnd) : undefined,
        tur: useCategory as 'gıda' | 'sağlık' | 'ulaşım' | 'eğlence' | 'giyim' | 'diğer' | undefined,
      });
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        console.log('Receipts data:', response.data.receipts);
        setReceipts(response.data.receipts);
        setTotalAmount(response.data.toplam_tutar);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      Alert.alert('Hata', error instanceof Error ? error.message : 'Fişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (tarih: string, saat: string) => {
    const date = new Date(tarih);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} ${saat}`;
  };

  const formatForApi = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDisplay = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const openAndroidRangePicker = () => setRangeVisible(true);

  const onPressDateChip = () => {
    openAndroidRangePicker();
  };

  // Kategori renkleri (merkezî tanım)
  const getTurColor = (tur: string) => getCategoryColor(tur);
  const getTurAccentColor = (tur: string) => getCategoryColor(tur);

  const formatCategoryLabel = (tur: string) => {
    if (!tur) return '';
    return tur.charAt(0).toUpperCase() + tur.slice(1);
  };

  const renderReceiptItem = ({ item }: { item: Receipt }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.receiptCard,
        { backgroundColor: getTurColor(item.tur.toLowerCase()) }
      ]}
      onLongPress={() => onLongPressReceipt(item)}
      delayLongPress={400}
    >
      {/* Sol dikey renk şeridi */}
      <View
        style={[
          styles.categoryStrip,
          { backgroundColor: getTurAccentColor(item.tur.toLowerCase()) }
        ]}
      />

      {/* Kart içeriği */}
      <View style={styles.receiptContent}>
        {/* Üst satır: Başlık + Kategori */}
        <View style={styles.receiptTopRow}>
          <AppText variant="body" style={styles.receiptTitle} numberOfLines={1}>
            {item.baslik}
          </AppText>
          <AppText variant="small" style={styles.receiptCategory}>
            {formatCategoryLabel(item.tur)}
          </AppText>
        </View>

        {/* Alt satır: Tarih solda, Tutar sağda */}
        <View style={styles.receiptBottomRow}>
          <AppText variant="small" style={styles.receiptDate}>
            {formatDate(item.tarih, item.saat)}
          </AppText>
          <AppText variant="body" style={styles.receiptAmount}>
            {parseFloat(item.tutar).toFixed(2)}TL
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const onLongPressReceipt = (item: Receipt) => {
    setReceiptToDelete(item);
    setDeleteModalVisible(true);
  };

  const handleDelete = async (item: Receipt) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Hata', 'Oturum süreniz dolmuş, lütfen tekrar giriş yapın.');
        return;
      }

      const res = await deleteReceipt(token, item.id);
      if (res.success) {
        setReceipts((prev) => prev.filter((r) => r.id !== item.id));
        const newTotal = (parseFloat(totalAmount) - parseFloat(item.tutar)).toFixed(2);
        setTotalAmount(newTotal);
        showToast('Fiş silindi', 'success');
      } else {
        Alert.alert('Hata', res.message || 'Fiş silinemedi');
      }
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Fiş silinirken bir hata oluştu');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // Clear any existing timer
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast({ visible: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
      toastTimerRef.current = null;
    }, 2000);
  };

  return (
    <AppContainer>
      <FlatList
        data={receipts}
        renderItem={renderReceiptItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.headerFullBleed}>
            <View style={styles.topSection}>
            {/* Üst dalgalı arka plan */}
            <Image
              source={require('../pics/Vector3.png')}
              style={styles.topVector}
            />

            {/* Üst başlık alanı */}
            <View style={styles.header}>
              {/* Tarih / Kategori filtre butonları (görsel) */}
              <View style={styles.filterRow}>
                <TouchableOpacity style={styles.filterChip} onPress={onPressDateChip}>
                  <AppText variant="body" style={styles.filterChipText}>
                    {startDate && endDate
                      ? `${formatDisplay(startDate)} - ${formatDisplay(endDate)}`
                      : 'Tarih ▼'}
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChip} onPress={() => setCategoryModalVisible(true)}>
                  <AppText variant="body" style={styles.filterChipText}>
                    {selectedCategory ? formatCategoryLabel(selectedCategory) : 'Kategori ▼'}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
          ) : (
            <AppText variant="body" style={styles.placeholder}>
              Henüz fiş bulunmamaktadır
            </AppText>
          )
        }
      />
      
      {/* Kategori seçim modal */}
      {categoryModalVisible && (
        <View style={styles.categoryModalBackdrop}>
          <TouchableOpacity 
            style={styles.categoryModalOverlay} 
            activeOpacity={1} 
            onPress={() => setCategoryModalVisible(false)}
          />
          <View style={styles.categoryModalContent}>
            <AppText variant="body" style={styles.categoryModalTitle}>Kategori Seçin</AppText>
            {['gıda', 'sağlık', 'ulaşım', 'eğlence', 'giyim', 'diğer'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  selectedCategory === cat && styles.categoryOptionSelected
                ]}
                onPress={() => {
                  setSelectedCategory(cat);
                  setCategoryModalVisible(false);
                  setLoading(true);
                  fetchReceipts(undefined, undefined, cat);
                }}
              >
                <View style={[
                  styles.categoryColorDot,
                  { backgroundColor: getTurAccentColor(cat) }
                ]} />
                <AppText variant="body" style={[
                  styles.categoryOptionText,
                  selectedCategory === cat && styles.categoryOptionTextSelected
                ]}>
                  {formatCategoryLabel(cat)}
                </AppText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.categoryOption, styles.categoryOptionClear]}
              onPress={() => {
                setSelectedCategory(null);
                setCategoryModalVisible(false);
                setLoading(true);
                fetchReceipts(undefined, undefined, null);
              }}
            >
              <AppText variant="body" style={styles.categoryOptionClearText}>Tümü</AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sil/İptal modal */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setReceiptToDelete(null);
        }}
        onDelete={() => {
          if (receiptToDelete) {
            handleDelete(receiptToDelete);
          }
          setDeleteModalVisible(false);
          setReceiptToDelete(null);
        }}
      />

      {/* Themed toast notification */}
      {toast.visible && (
        <View style={[
          styles.toastContainer,
          { backgroundColor: toast.type === 'success' ? '#2CB67D' : '#FF7D7D' }
        ]}>
          <AppText variant="body" style={styles.toastText}>{toast.message}</AppText>
        </View>
      )}

      {/* Themed Date Range Picker */}
      <DateRangePickerModal
        visible={rangeVisible}
        initialStartDate={startDate}
        initialEndDate={endDate}
        onClose={() => setRangeVisible(false)}
        onConfirm={(s, e) => {
          setRangeVisible(false);
          setStartDate(s || null);
          setEndDate(e || null);
          setLoading(true);
          fetchReceipts(s || null, e || null);
        }}
      />
    </AppContainer>
  );
};

// Sil/İptal temalı modal
const DeleteConfirmModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onDelete: () => void;
}> = ({ visible, onCancel, onDelete }) => {
  if (!visible) return null;
  return (
    <View style={styles.deleteModalBackdrop}>
      <TouchableOpacity style={styles.deleteModalOverlay} activeOpacity={1} onPress={onCancel} />
      <View style={styles.deleteModalContent}>
        <AppText variant="body" style={styles.deleteModalTitle}>Fişi silmek istediğinize emin misiniz?</AppText>
        <View style={styles.deleteButtonsRow}>
          <TouchableOpacity style={styles.deleteCancelButton} onPress={onCancel}>
            <AppText variant="body" style={styles.deleteCancelText}>İptal</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteConfirmButton} onPress={onDelete}>
            <AppText variant="body" style={styles.deleteConfirmText}>Sil</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    backgroundColor: '#FFFFFF',
  },
  topVector: {
    width: '100%',
    height: 210,
    resizeMode: 'cover',
  },
  header: {
    marginTop: -40, // vector ile hafif bindirme efekti
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pageLabel: {
    color: '#F1F5F9',
    fontSize: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  subtitle: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  refreshButton: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  refreshText: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
    paddingHorizontal: 4,
  },
  filterChip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  placeholder: {
    color: '#4B5563',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  loader: {
    marginTop: 50,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerFullBleed: {
    // Negate horizontal padding so header/vector is full-bleed
    marginHorizontal: -16,
  },
  categoryModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  categoryModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 320,
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  categoryOptionSelected: {
    backgroundColor: '#E0E7FF',
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  categoryOptionTextSelected: {
    color: '#111827',
    fontWeight: '700',
  },
  categoryOptionClear: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    marginTop: 4,
  },
  categoryOptionClearText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Delete modal styles (aligned with app theme)
  deleteModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  deleteModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '86%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  deleteCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  deleteCancelText: {
    color: '#374151',
    fontWeight: '700',
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#FF7D7D', // matches gıda accent
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  deleteConfirmText: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // Toast notification styles
  toastContainer: {
    position: 'absolute',
    left: '7%',
    right: '7%',
    bottom: 24,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // Kart tasarımı
  receiptCard: {
    flexDirection: 'row',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF00', // Arka plan strip değil, içerik tarafında olacak
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryStrip: {
    width: 14,
    backgroundColor: '#000', // gerçek renk zaten fonksiyondan geliyor
  },
  receiptContent: {
    flex: 1,
    backgroundColor: '#C2DFE3', // kart rengi
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  receiptTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flexShrink: 1,
    marginRight: 4,
  },
  receiptCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  receiptBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  receiptAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
});

export default ReceiptsScreen;
