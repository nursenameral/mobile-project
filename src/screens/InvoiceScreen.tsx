import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/AppNavigator';
import { AppContainer, AppText, AppButton, Toast } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInvoicesLastTwoByType, getUnpaidInvoices, Invoice, InvoiceType, payInvoice, deleteInvoice } from '../services/api';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';

type InvoiceScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Invoice'>;

interface InvoiceScreenProps {
  navigation: InvoiceScreenNavigationProp;
}

const InvoiceScreen: React.FC<InvoiceScreenProps> = () => {
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [unpaid, setUnpaid] = useState<Invoice[]>([]);
  const [actionFor, setActionFor] = useState<Invoice | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({ visible: false, message: '', type: 'info' });
  const [lastTwoByType, setLastTwoByType] = useState<Record<InvoiceType, Invoice[]>>({
    elektrik: [],
    su: [],
    dogalgaz: [],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setChartLoading(true);
      setError('');

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setError('Oturum bulunamadı');
        setUnpaid([]);
        setLastTwoByType({ elektrik: [], su: [], dogalgaz: [] });
        return;
      }

      const [unpaidRes, chartRes] = await Promise.all([
        getUnpaidInvoices(token),
        getInvoicesLastTwoByType(token),
      ]);

      if (unpaidRes.success && unpaidRes.data) {
        setUnpaid(unpaidRes.data.invoices || []);
      }
      if (chartRes.success && chartRes.data) {
        setLastTwoByType(chartRes.data.last_two_by_type || { elektrik: [], su: [], dogalgaz: [] });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // sayfaya dönünce tazele
      loadData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const { items: chartData, months } = useMemo(() => buildMonthlyCompareData(lastTwoByType), [lastTwoByType]);

  return (
    <AppContainer>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Image source={require('../pics/Vector3.png')} style={styles.topVector} />

        {/* Üst kutu: Aylık karşılaştırma sütun grafiği */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            {/* Başlık ve ay adları kaldırıldı; sadece renk noktaları kalsın */}
            <View style={styles.legendRow}> 
              <View style={[styles.legendDot, { backgroundColor: COLORS.current }]} />
              <AppText variant="small" style={styles.legendLabel}>Bu Ay</AppText>
              <View style={{ width: 8 }} />
              <View style={[styles.legendDot, { backgroundColor: COLORS.prev }]} />
              <AppText variant="small" style={styles.legendLabel}>Geçen Ay</AppText>
            </View>
          </View>
          {chartLoading ? (
            <View style={styles.centerBox}><ActivityIndicator /></View>
          ) : error ? (
            <View style={styles.centerBox}><AppText variant="body" style={styles.errorText}>{error}</AppText></View>
          ) : (
            <MonthlyCompareChart data={chartData} />
          )}
        </View>

        {/* Alt kutu: Ödenmemiş faturalar listesi */}
        <View style={styles.card}>
          <AppText variant="body" style={styles.cardTitle}>Ödenmemiş Faturalar</AppText>
          {loading ? (
            <View style={styles.centerBox}><ActivityIndicator /></View>
          ) : unpaid.length === 0 ? (
            <View style={styles.centerBox}><AppText variant="body" style={styles.muted}>Gösterilecek fatura yok</AppText></View>
          ) : (
            <View style={styles.listContainer}>
              {unpaid.map((inv) => (
                <InvoiceRow key={inv.id} invoice={inv} onLongPress={() => setActionFor(inv)} />
              ))}
            </View>
          )}
        </View>
        <ActionModal
          visible={!!actionFor}
          onClose={() => setActionFor(null)}
          onPay={async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              if (!token || !actionFor) return;
              await payInvoice(token, actionFor.id);
              setActionFor(null);
              setToast({ visible: true, message: 'Fatura ödendi', type: 'success' });
              await loadData();
            } catch (e) {
              setToast({ visible: true, message: 'Ödeme başarısız', type: 'error' });
            }
          }}
          onDelete={async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              if (!token || !actionFor) return;
              await deleteInvoice(token, actionFor.id);
              setActionFor(null);
              setToast({ visible: true, message: 'Fatura silindi', type: 'success' });
              await loadData();
            } catch (e) {
              setToast({ visible: true, message: 'Silme başarısız', type: 'error' });
            }
          }}
        />
      </ScrollView>
      {/* Themed toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </AppContainer>
  );
};

// ===== Helpers & Components =====

const TYPE_LABEL: Record<InvoiceType, string> = {
  su: 'Su',
  dogalgaz: 'Doğalgaz',
  elektrik: 'Elektrik',
};

const TYPE_COLOR: Record<InvoiceType, string> = {
  elektrik: '#A8D5BA', // Elektrik
  su: '#A7C7E7',       // Su
  dogalgaz: '#F4A6A6', // Doğalgaz
};

const COLORS = {
  current: '#2B6CB0',
  prev: '#A0AEC0',
};

type ChartItem = {
  type: InvoiceType;
  current: number; // bu ay
  previous: number; // geçen ay
};

function ymKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }
function parseDate(s?: string) { return s ? new Date(s) : undefined; }
function toAmount(s?: string) { const n = parseFloat(String(s ?? '0').replace(',', '.')); return isNaN(n) ? 0 : n; }

function monthAdd(key: string, delta: number): string {
  const [y, m] = key.split('-').map((v) => parseInt(v, 10));
  const d = new Date(y, m - 1 + delta, 1);
  return ymKey(d);
}

function formatMonthLabel(key: string) {
  const [y, m] = key.split('-').map((v) => parseInt(v, 10));
  const d = new Date(y, m - 1, 1);
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function buildMonthlyCompareData(map: Record<InvoiceType, Invoice[]>) {
  const monthKeyOf = (i: Invoice): string | undefined => {
    const due = i.son_odeme_tarihi ? ymKey(new Date(i.son_odeme_tarihi)) : undefined;
    if (due) return due;
    return i.created_at ? ymKey(new Date(i.created_at)) : undefined;
  };

  const keys: string[] = [];
  (['su', 'dogalgaz', 'elektrik'] as InvoiceType[]).forEach((t) => {
    (map[t] || []).forEach((inv) => {
      const k = monthKeyOf(inv);
      if (k && !keys.includes(k)) keys.push(k);
    });
  });
  // En yeni ayı bul
  const latest = keys.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))[0] || ymKey(new Date());
  const previous = monthAdd(latest, -1);

  const sumForKey = (arr: Invoice[], key: string): number =>
    (arr || []).reduce((acc, i) => (monthKeyOf(i) === key ? acc + toAmount(i.tutar) : acc), 0);

  const types: InvoiceType[] = ['su', 'dogalgaz', 'elektrik'];
  const items: ChartItem[] = types.map((t) => ({
    type: t,
    current: sumForKey(map[t] || [], latest),
    previous: sumForKey(map[t] || [], previous),
  }));

  return {
    items,
    months: {
      currentKey: latest,
      previousKey: previous,
      currentLabel: formatMonthLabel(latest),
      previousLabel: formatMonthLabel(previous),
    },
  };
}

const MonthlyCompareChart: React.FC<{ data: ChartItem[] }> = ({ data }) => {
  const width = Math.min(360, Dimensions.get('window').width - 60);
  const height = 200;
  const padding = { top: 16, right: 20, bottom: 30, left: 28 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const groupCount = data.length;
  const groupWidth = innerW / Math.max(1, groupCount);
  const gap = 0; // İki çubuk arası boşluk (0: yapışık)
  // Biraz daha daralt: önceki hesaba göre %65 ve min 6px
  const barWidth = Math.max(6, ((groupWidth - gap - 8) / 2) * 0.65);

  const maxVal = Math.max(1, ...data.flatMap((d) => [d.current, d.previous]));
  const scaleY = (v: number) => (v / maxVal) * innerH;
  const baseY = height - padding.bottom;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxVal);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={width} height={height}>
        {/* Gridlines */}
        {ticks.map((t, i) => {
          const y = baseY - scaleY(t);
          return (
            <React.Fragment key={`g-${i}`}>
              <Line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#E2E8F0" strokeWidth={1} />
              <SvgText x={padding.left - 6} y={y + 4} fontSize={9} fill="#475569" textAnchor="end">
                {Math.round(t).toString()}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Bars */}
        {data.map((d, idx) => {
          const gx = padding.left + idx * groupWidth + 4;
          const curH = scaleY(d.current);
          const prevH = scaleY(d.previous);
          const prevX = gx;
          const curX = gx + barWidth + gap; // gap=0 => çubuklar yapışık
          return (
            <React.Fragment key={`bar-${d.type}`}>
              <Rect x={prevX} y={baseY - prevH} width={barWidth} height={prevH} rx={4} fill={COLORS.prev} />
              {prevH > 0 && (
                <SvgText x={prevX + barWidth / 2} y={baseY - prevH - 4} fontSize={10} fill="#2C3E50" textAnchor="middle">
                  {Math.round(d.previous).toString()}
                </SvgText>
              )}
              <Rect x={curX} y={baseY - curH} width={barWidth} height={curH} rx={4} fill={COLORS.current} />
              {curH > 0 && (
                <SvgText x={curX + barWidth / 2} y={baseY - curH - 4} fontSize={10} fill="#2C3E50" textAnchor="middle">
                  {Math.round(d.current).toString()}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>

      {/* X labels */}
      <View style={[styles.xLabelsRow, { width }] }>
        {data.map((d, idx) => (
          <View key={`lbl-${d.type}`} style={[styles.xLabelBox, { width: innerW / groupCount }]}>
            <AppText variant="small" style={styles.xLabelText}>{TYPE_LABEL[d.type]}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

const InvoiceRow: React.FC<{ invoice: Invoice; onLongPress: () => void }> = ({ invoice, onLongPress }) => {
  const color = TYPE_COLOR[invoice.tur];
  const label = TYPE_LABEL[invoice.tur];

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      activeOpacity={0.9}
      style={[styles.invoiceItem, { backgroundColor: color }]}
    >
      <View style={styles.invoiceLeft}>
        <AppText variant="body" style={styles.invoiceTitle}>{label}</AppText>
        <AppText variant="small" style={styles.invoiceDue}>SÖ:{formatDate(invoice.son_odeme_tarihi)}</AppText>
      </View>
      <View style={styles.invoiceRight}>
        <AppText variant="body" style={styles.invoiceAmount}>{toAmount(invoice.tutar).toFixed(2)}TL</AppText>
      </View>
    </TouchableOpacity>
  );
};

function formatDate(s: string) {
  const d = new Date(s);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

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
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
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
  card: {
    backgroundColor: '#C5E3ED',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendLabel: {
    color: '#2C3E50',
  },
  centerBox: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xLabelsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -6,
  },
  xLabelBox: {
    alignItems: 'center',
  },
  xLabelText: {
    color: '#2C3E50',
  },
  listContainer: {
    marginTop: 8,
  },
  invoiceItem: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceLeft: {
    flexShrink: 1,
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  invoiceDue: {
    color: '#1F2937',
    opacity: 0.8,
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  payButton: {
    backgroundColor: '#2B6CB0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  payText: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FF6B6B',
  },
  muted: {
    color: '#5A7C89',
  },
});

export default InvoiceScreen;

// Themed action modal (Öde / Sil)
const ActionModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onPay: () => void;
  onDelete: () => void;
}> = ({ visible, onClose, onPay, onDelete }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.backdrop}>
        <View style={modalStyles.card}>
          <AppText variant="title" style={modalStyles.title}>İşlem Seçin</AppText>
          <View style={modalStyles.actionsRow}>
            <AppButton title="Öde" variant="primary" onPress={onPay} style={modalStyles.btnPrimary} />
            <AppButton title="Sil" variant="secondary" onPress={onDelete} style={modalStyles.btnDangerOutline} />
          </View>
          <View style={{ height: 8 }} />
          <AppButton title="İptal" variant="secondary" onPress={onClose} style={modalStyles.btnSecondary} />
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '90%',
    backgroundColor: '#EEF7FA',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    textAlign: 'center',
    color: '#424242',
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#9DB4C0',
  },
  btnDangerOutline: {
    flex: 1,
    borderColor: '#D87070',
  },
  btnSecondary: {
    backgroundColor: '#C2DEE6',
    borderColor: '#C2DEE6',
  },
});