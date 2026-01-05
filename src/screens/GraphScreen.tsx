import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/AppNavigator';
import { AppContainer, AppText } from '../components';
import { CATEGORY_COLORS } from '../utils/categoryColors';
import { getReceipts, Receipt, ReceiptSummaryItem } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Native picker replaced by themed modal
import DateRangePickerModal from '../components/DateRangePickerModal';
import { useFocusEffect } from '@react-navigation/native';

type GraphScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Graph'>;

interface GraphScreenProps {
  navigation: GraphScreenNavigationProp;
}

// Kategori renkleri merkezî dosyadan gelir

// Kategori isimleri büyük harfle
const CATEGORY_NAMES: Record<string, string> = {
  'gıda': 'GIDA',
  'eğlence': 'EĞLENCE',
  'sağlık': 'SAĞLIK',
  'giyim': 'GİYİM',
  'ulaşım': 'ULAŞIM',
  'diğer': 'DİĞER',
};

const GraphScreen: React.FC<GraphScreenProps> = () => {
  const [categories, setCategories] = useState<ReceiptSummaryItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [rangeVisible, setRangeVisible] = useState(false);

  const allCategories = ['gıda', 'eğlence', 'sağlık', 'giyim', 'ulaşım', 'diğer'];

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Odaklanınca tarih aralığını sıfırla ve verileri yeniden yükle
  useFocusEffect(
    useCallback(() => {
      setStartDate(null);
      setEndDate(null);
      loadSummary();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError('');

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setError('Oturum bulunamadı');
        return;
      }

      const params = {
        baslangic_tarih: startDate ? formatForApi(startDate) : undefined,
        bitis_tarih: endDate ? formatForApi(endDate) : undefined,
      };

      const response = await getReceipts(token, params);

      if (response.success && response.data) {
        const receipts = response.data.receipts || [];
        const sum = receipts.reduce((acc, r) => acc + (parseFloat(r.tutar) || 0), 0);
        setTotalAmount(sum);

        const summaryByCategory: Record<string, { toplam: number; adet: number }> = {};
        receipts.forEach((r) => {
          const key = r.tur;
          const amount = parseFloat(r.tutar) || 0;
          if (!summaryByCategory[key]) summaryByCategory[key] = { toplam: 0, adet: 0 };
          summaryByCategory[key].toplam += amount;
          summaryByCategory[key].adet += 1;
        });

        const fullCategories = allCategories.map((categoryName) => {
          const existing = summaryByCategory[categoryName];
          const toplam = existing?.toplam || 0;
          const adet = existing?.adet || 0;
          const yuzde = sum > 0 ? (toplam / sum) * 100 : 0;
          return { tur: categoryName, toplam, adet, yuzde } as ReceiptSummaryItem;
        });

        setCategories(fullCategories);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      console.error('Özet yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
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

  const DateChip: React.FC = () => (
    <TouchableOpacity style={styles.dateButton} onPress={openAndroidRangePicker}>
      <AppText variant="body" style={styles.dateText}>
        {startDate && endDate ? `${formatDisplay(startDate)} - ${formatDisplay(endDate)}` : 'Tarih ▾'}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <AppContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image source={require('../pics/Vector3.png')} style={styles.topVector} />

        {/* Toplam Harcama Kartı */}
        <View style={styles.totalCard}>
          <View style={styles.totalHeader}>
            <AppText variant="body" style={styles.totalLabel}>TOPLAM HARCAMA:</AppText>
            <DateChip />
          </View>
          <AppText variant="title" style={styles.totalAmount}>
            {totalAmount.toFixed(2)}TL
          </AppText>
        </View>

        {/* Grafik Alanı */}
        <View style={styles.graphArea}>
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#5A7C89" />
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <AppText variant="body" style={styles.errorText}>
                {error}
              </AppText>
            </View>
          ) : (
            <View style={styles.centerContent}>
              <PieChart data={categories} />
            </View>
          )}
        </View>

        {/* Kategori Kutuları (büyük bir kart içinde) */}
        <View style={styles.categoriesArea}>
          <View style={styles.categoriesContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#5A7C89" />
              </View>
            ) : (
              categories.map((category, index) => (
                <View
                  key={index}
                  style={[styles.categoryBox, { backgroundColor: CATEGORY_COLORS[category.tur] || CATEGORY_COLORS['diğer'] }]}
                >
                  <AppText variant="body" style={styles.categoryName} numberOfLines={1}>
                    {CATEGORY_NAMES[category.tur] || category.tur.toUpperCase()}
                  </AppText>
                  <AppText variant="body" style={styles.categoryAmount}>
                    {category.toplam.toFixed(2)}TL
                  </AppText>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Tarih aralığı seçimi modal yerine Android native date picker kullanıldı */}
      <DateRangePickerModal
        visible={rangeVisible}
        initialStartDate={startDate}
        initialEndDate={endDate}
        onClose={() => setRangeVisible(false)}
        onConfirm={(s, e) => {
          setRangeVisible(false);
          setStartDate(s || null);
          setEndDate(e || null);
        }}
      />
    </AppContainer>
  );
};

// Dolu (filled) pasta grafik: dilimleri path ile çizer
const PieChart: React.FC<{ data: ReceiptSummaryItem[] }> = ({ data }) => {
  const size = 180;
  const center = size / 2;
  const radius = 70;

  const raw = data
    .map((d) => ({ key: d.tur, amount: Math.max(0, d.toplam || 0), color: CATEGORY_COLORS[d.tur] || CATEGORY_COLORS['diğer'] }))
    .filter((d) => d.amount > 0);

  const sum = raw.reduce((acc, s) => acc + s.amount, 0);
  if (sum <= 0) {
    return (
      <View style={styles.centerContent}>
        <AppText variant="body" style={styles.graphPlaceholder}>Veri bulunamadı</AppText>
      </View>
    );
  }

  // Slices: startAngle -> endAngle (derece)
  let currentAngle = -90; // yukarıdan başlat
  const slices = raw
    .sort((a, b) => b.amount - a.amount)
    .map((s) => {
      const sweep = (s.amount / sum) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sweep;
      currentAngle = endAngle;
      return { ...s, startAngle, endAngle, percent: (s.amount / sum) * 100 };
    });

  // Tek bir dilim olduğunda SVG 'A' arc komutu tam daire çizemediği için
  // path görünmez. Bu durumda doğrudan dolu bir daire çiziyoruz.
  if (slices.length === 1) {
    const only = slices[0];
    return (
      <View style={{ alignItems: 'center', width: '100%' }}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={radius} fill={only.color} />
        </Svg>

        <View style={styles.legendContainer}>
          <View key={`legend-${only.key}`} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: only.color }]} />
            <AppText variant="small" style={styles.legendText}>
              {(CATEGORY_NAMES[only.key] || only.key.toUpperCase()) + ' • 100%'}
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  const pathForSlice = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const toRad = (deg: number) => (Math.PI / 180) * deg;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    // Merkezden başla, dilimin yayını çiz, merkeze dön
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <Svg width={size} height={size}>
        {slices.map((sl, idx) => (
          <Path key={`${sl.key}-${idx}`} d={pathForSlice(center, center, radius, sl.startAngle, sl.endAngle)} fill={sl.color} />
        ))}
      </Svg>

      <View style={styles.legendContainer}>
        {slices.map((s) => (
          <View key={`legend-${s.key}`} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: s.color }]} />
            <AppText variant="small" style={styles.legendText}>
              {`${CATEGORY_NAMES[s.key] || s.key.toUpperCase()} • ${Math.round(s.percent)}%`}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

// Toplam tutar grafikte gösterilmiyor; TL formatına ihtiyaç kalmadı.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topVector: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  totalCard: {
    backgroundColor: '#C5E3ED',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A7C89',
  },
  dateButton: {
    backgroundColor: '#A8C5D1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 11,
    color: '#5A7C89',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  graphArea: {
    backgroundColor: '#C5E3ED',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    minHeight: 230,
    padding: 14,
  },
  categoriesArea: {
    backgroundColor: '#C5E3ED',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 14,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphPlaceholder: {
    color: '#5A7C89',
    fontSize: 14,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryBox: {
    width: '48%',
    borderRadius: 10,
    padding: 12,
    minHeight: 72,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    flexShrink: 1,
    marginRight: 6,
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'right',
    alignSelf: 'flex-end',
    width: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 3,
  },
  legendSwatch: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    color: '#2C3E50',
    fontSize: 12,
  },
  // Periyot seçim modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  modalOptionSelected: {
    backgroundColor: '#C5E3ED',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalCancelButton: {
    marginTop: 8,
    paddingVertical: 12,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default GraphScreen;
